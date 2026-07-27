// @ts-check

import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { chmod, lstat, mkdir, open, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

const ALLOWED_MODEL_INPUT_FIELDS = new Set(["query", "mutableFact"]);
const EVIDENCE_PREFIX = "books-evidence-v1_";
const MANIFEST_SCHEMA_VERSION = 1;

/** @typedef {"found"|"not_found"|"partial"|"not_verified"} KnowledgeStatus */
/** @typedef {"complete"|"partial"|"none"} CoverageStatus */
/** @typedef {"read"|"missing"|"unreadable"|"invalid"|"not_checked"} SourceReadState */

/**
 * @typedef {object} ScopedSource
 * @property {string} id Stable project-local source identity.
 * @property {string} relativePath Logical path relative to `sourceRoot`.
 */

/**
 * @typedef {object} TrustedKnowledgeContext
 * @property {string} projectId Stable project identity supplied by trusted runtime code.
 * @property {string} scopeId Stable book/source scope supplied by trusted runtime code.
 * @property {string} sourceRoot Absolute physical root for allowed local sources.
 * @property {ScopedSource[]} sources Exact source allowlist.
 * @property {"complete"|"partial"} coverageDeclaration Trusted statement about allowlist completeness.
 * @property {string} responseRoot Protected manifest directory inside `sourceRoot`.
 */

/**
 * @typedef {object} KnowledgeSearchInput
 * @property {string} query Literal local search query.
 * @property {boolean} [mutableFact] True when the answer requires live-provider freshness.
 */

/**
 * @typedef {object} NormalizedSource
 * @property {string} id
 * @property {string} relativePath
 */

/**
 * @typedef {object} ReadSourceResult
 * @property {NormalizedSource} source
 * @property {SourceReadState} state
 * @property {string} [content]
 * @property {string} [contentHash]
 */

/**
 * @typedef {object} IssuedEvidence
 * @property {string} reference
 * @property {NormalizedSource} source
 * @property {string} contentHash
 * @property {number} matchOffset
 */

/**
 * @typedef {object} KnowledgeSearchResult
 * @property {1} schemaVersion
 * @property {string} projectId
 * @property {string} scopeId
 * @property {KnowledgeStatus} status
 * @property {CoverageStatus} coverage
 * @property {{total: number, readable: number, unavailable: number, notChecked: number}} sources
 * @property {string[]} evidenceReferences
 * @property {boolean} mutableFact
 * @property {"source_content_is_untrusted_data"} sourcePolicy
 * @property {string} requestId
 * @property {string} requestHash
 */

/**
 * @typedef {object} PendingRequest
 * @property {string} requestId
 * @property {string} requestHash
 * @property {Omit<KnowledgeSearchResult, "requestId"|"requestHash">} searchResult
 * @property {Set<string>} allowedReferences
 * @property {Set<string>} readReferences
 * @property {Array<{id: string, relativePath: string, state: SourceReadState, contentHash?: string}>} sourceInventory
 * @property {{manifestId: string, requestHash: string, responseHash: string, evidenceReferences: string[]}|undefined} finalized
 */

/**
 * Create a resolver whose authority is closed over trusted runtime context.
 * Model-controlled input is deliberately limited to a literal query and a
 * freshness signal; it cannot provide paths, project ids, allowlists or refs.
 *
 * @param {TrustedKnowledgeContext} trustedContext
 * @returns {Promise<Readonly<{
 *   scope: Readonly<{projectId: string, scopeId: string, scopeHash: string, coverageDeclaration: "complete"|"partial", totalSources: number}>,
 *   search: (modelInput: KnowledgeSearchInput) => Promise<KnowledgeSearchResult>,
 *   catalog: () => Promise<KnowledgeSearchResult>,
 *   readEvidence: (input: {requestId: string, reference: string}) => Promise<Readonly<{reference: string, sourceId: string, relativePath: string, contentHash: string, trust: "untrusted_data", content: string}>>,
 *   finalizeResponse: (input: {requestId: string, answer: string}) => Promise<Readonly<{manifestId: string, requestHash: string, responseHash: string, evidenceReferences: string[]}>>
 * }>>}
 */
export async function createScopedKnowledgeResolver(trustedContext) {
  assertPlainObject(trustedContext, "INVALID_TRUSTED_CONTEXT");

  const projectId = requireIdentity(trustedContext.projectId, "INVALID_PROJECT_ID");
  const scopeId = requireIdentity(trustedContext.scopeId, "INVALID_SCOPE_ID");
  const coverageDeclaration = requireCoverageDeclaration(
    trustedContext.coverageDeclaration
  );
  const sources = normalizeSources(trustedContext.sources);
  const requestedSourceRoot = path.resolve(trustedContext.sourceRoot);
  const sourceRoot = await validateSourceRoot(trustedContext.sourceRoot);
  const responseRoot = await prepareResponseRoot(
    sourceRoot,
    requestedSourceRoot,
    trustedContext.responseRoot
  );
  const scopeHash = hashCanonical({
    projectId,
    scopeId,
    coverageDeclaration,
    sources: sources.map(({ id, relativePath }) => ({ id, relativePath }))
  });
  /** @type {Map<string, IssuedEvidence>} */
  const issuedEvidence = new Map();
  /** @type {Map<string, PendingRequest>} */
  const pendingRequests = new Map();

  /**
   * @param {KnowledgeSearchInput} modelInput
   * @returns {Promise<KnowledgeSearchResult>}
   */
  async function search(modelInput) {
    const { query, mutableFact } = validateModelInput(modelInput);
    return executeRequest({ operation: "search", query, mutableFact });
  }

  /**
   * Issue one opaque ref for every readable source in the trusted allowlist.
   * This is the only full-source entrypoint used by toolkit generation.
   *
   * @returns {Promise<KnowledgeSearchResult>}
   */
  async function catalog() {
    return executeRequest({ operation: "catalog", query: "", mutableFact: false });
  }

  /**
   * @param {{operation: "search"|"catalog", query: string, mutableFact: boolean}} request
   * @returns {Promise<KnowledgeSearchResult>}
   */
  async function executeRequest({ operation, query, mutableFact }) {
    const requestHash = hashCanonical({ operation, query, mutableFact });
    /** @type {ReadSourceResult[]} */
    const inventory = [];

    for (const source of sources) {
      inventory.push(
        mutableFact
          ? { source, state: "not_checked" }
          : await readAllowedSource(sourceRoot, source)
      );
    }

    const readable = inventory.filter((item) => item.state === "read");
    const notChecked = inventory.filter((item) => item.state === "not_checked").length;
    const unavailable = inventory.length - readable.length - notChecked;
    /** @type {CoverageStatus} */
    const physicalCoverage =
      readable.length === inventory.length
        ? "complete"
        : readable.length === 0
          ? "none"
          : "partial";
    /** @type {CoverageStatus} */
    const coverage =
      physicalCoverage === "complete" && coverageDeclaration === "partial"
        ? "partial"
        : physicalCoverage;
    const normalizedQuery = operation === "search" ? normalizeSearchText(query) : "";
    /** @type {string[]} */
    const evidenceReferences = [];

    for (const item of readable) {
      const content = item.content ?? "";
      const contentHash = item.contentHash ?? "";
      const matchOffset =
        operation === "catalog"
          ? -1
          : normalizeSearchText(content).indexOf(normalizedQuery);
      if (operation === "search" && matchOffset === -1) {
        continue;
      }
      const reference = createEvidenceReference({
        scopeHash,
        source: item.source,
        contentHash,
        matchOffset
      });
      issuedEvidence.set(reference, {
        reference,
        source: item.source,
        contentHash,
        matchOffset
      });
      evidenceReferences.push(reference);
    }

    const status = classifyStatus({
      mutableFact,
      coverage,
      matchCount: evidenceReferences.length
    });
    const responseCore = {
      schemaVersion: /** @type {const} */ (1),
      projectId,
      scopeId,
      status,
      coverage,
      sources: {
        total: inventory.length,
        readable: readable.length,
        unavailable,
        notChecked
      },
      evidenceReferences: [...evidenceReferences],
      mutableFact,
      sourcePolicy: /** @type {const} */ ("source_content_is_untrusted_data")
    };
    const requestId = randomUUID();
    pendingRequests.set(requestId, {
      requestId,
      requestHash,
      searchResult: responseCore,
      allowedReferences: new Set(evidenceReferences),
      readReferences: new Set(),
      sourceInventory: inventory.map((item) => ({
        id: item.source.id,
        relativePath: item.source.relativePath,
        state: item.state,
        ...(item.contentHash ? { contentHash: item.contentHash } : {})
      })),
      finalized: undefined
    });

    return {
      ...responseCore,
      requestId,
      requestHash
    };
  }

  /**
   * @param {{requestId: string, reference: string}} input
   * @returns {Promise<Readonly<{reference: string, sourceId: string, relativePath: string, contentHash: string, trust: "untrusted_data", content: string}>>}
   */
  async function readEvidence(input) {
    assertPlainObject(input, "EVIDENCE_READ_INVALID");
    const { requestId, reference } = input;
    if (typeof requestId !== "string") {
      throw contractError("EVIDENCE_READ_INVALID");
    }
    if (typeof reference !== "string" || !reference.startsWith(EVIDENCE_PREFIX)) {
      throw contractError("EVIDENCE_REFERENCE_INVALID");
    }
    const pending = pendingRequests.get(requestId);
    if (!pending) {
      throw contractError("REQUEST_NOT_ISSUED_IN_SCOPE");
    }
    if (!pending.allowedReferences.has(reference)) {
      throw contractError("EVIDENCE_REFERENCE_NOT_ISSUED_FOR_REQUEST");
    }
    const issued = issuedEvidence.get(reference);
    if (!issued) {
      throw contractError("EVIDENCE_REFERENCE_NOT_ISSUED_IN_SCOPE");
    }
    const current = await readAllowedSource(sourceRoot, issued.source);
    if (
      current.state !== "read" ||
      typeof current.content !== "string" ||
      current.contentHash !== issued.contentHash
    ) {
      throw contractError("EVIDENCE_REFERENCE_STALE");
    }
    pending.readReferences.add(reference);
    return Object.freeze({
      reference,
      sourceId: issued.source.id,
      relativePath: issued.source.relativePath,
      contentHash: issued.contentHash,
      trust: /** @type {const} */ ("untrusted_data"),
      content: current.content
    });
  }

  /**
   * Seal an exact final answer without persisting its raw text. Evidence is
   * derived from opaque refs actually present in the answer and must belong to
   * this exact search request.
   *
   * @param {{requestId: string, answer: string}} input
   * @returns {Promise<Readonly<{manifestId: string, requestHash: string, responseHash: string, evidenceReferences: string[]}>>}
   */
  async function finalizeResponse(input) {
    assertPlainObject(input, "FINAL_RESPONSE_INVALID");
    if (typeof input.requestId !== "string" || typeof input.answer !== "string") {
      throw contractError("FINAL_RESPONSE_INVALID");
    }
    const pending = pendingRequests.get(input.requestId);
    if (!pending) {
      throw contractError("REQUEST_NOT_ISSUED_IN_SCOPE");
    }
    const responseHash = sha256(input.answer);
    if (pending.finalized) {
      if (pending.finalized.responseHash !== responseHash) {
        throw contractError("REQUEST_ALREADY_FINALIZED");
      }
      return Object.freeze({ ...pending.finalized });
    }

    const evidenceReferences = extractEvidenceReferences(input.answer);
    for (const reference of evidenceReferences) {
      if (!pending.readReferences.has(reference)) {
        throw contractError("FINAL_RESPONSE_FOREIGN_EVIDENCE");
      }
    }
    if (
      ["found", "partial"].includes(pending.searchResult.status) &&
      pending.allowedReferences.size > 0 &&
      evidenceReferences.length === 0
    ) {
      throw contractError("FINAL_RESPONSE_EVIDENCE_REQUIRED");
    }

    const manifestId = randomUUID();
    await writeProtectedManifest(responseRoot, manifestId, {
      schemaVersion: MANIFEST_SCHEMA_VERSION,
      manifestId,
      createdAt: new Date().toISOString(),
      projectId,
      scopeId,
      scopeHash,
      coverageDeclaration,
      requestId: pending.requestId,
      requestHash: pending.requestHash,
      responseHash,
      status: pending.searchResult.status,
      coverage: pending.searchResult.coverage,
      mutableFact: pending.searchResult.mutableFact,
      sourcePolicy: pending.searchResult.sourcePolicy,
      sourceCounts: pending.searchResult.sources,
      evidenceReferences,
      sourceInventory: pending.sourceInventory
    });
    const finalized = {
      manifestId,
      requestHash: pending.requestHash,
      responseHash,
      evidenceReferences
    };
    pending.finalized = finalized;
    return Object.freeze({ ...finalized });
  }

  return Object.freeze({
    scope: Object.freeze({
      projectId,
      scopeId,
      scopeHash,
      coverageDeclaration,
      totalSources: sources.length
    }),
    search,
    catalog,
    readEvidence,
    finalizeResponse
  });
}

/**
 * @param {{mutableFact: boolean, coverage: CoverageStatus, matchCount: number}} input
 * @returns {KnowledgeStatus}
 */
function classifyStatus({ mutableFact, coverage, matchCount }) {
  if (mutableFact) {
    return "not_verified";
  }
  if (coverage === "none") {
    return "not_verified";
  }
  if (coverage === "partial") {
    return "partial";
  }
  return matchCount > 0 ? "found" : "not_found";
}

/**
 * @param {unknown} modelInput
 * @returns {{query: string, mutableFact: boolean}}
 */
function validateModelInput(modelInput) {
  assertPlainObject(modelInput, "INVALID_MODEL_INPUT");
  for (const field of Object.keys(modelInput)) {
    if (!ALLOWED_MODEL_INPUT_FIELDS.has(field)) {
      throw contractError("MODEL_INPUT_AUTHORITY_FIELD_FORBIDDEN");
    }
  }
  if (typeof modelInput.query !== "string" || modelInput.query.trim().length === 0) {
    throw contractError("QUERY_REQUIRED");
  }
  if (modelInput.query.includes("\0")) {
    throw contractError("QUERY_INVALID");
  }
  if (modelInput.mutableFact !== undefined && typeof modelInput.mutableFact !== "boolean") {
    throw contractError("MUTABLE_FACT_FLAG_INVALID");
  }
  return {
    query: modelInput.query,
    mutableFact: modelInput.mutableFact === true
  };
}

/**
 * @param {unknown} rawSources
 * @returns {NormalizedSource[]}
 */
function normalizeSources(rawSources) {
  if (!Array.isArray(rawSources) || rawSources.length === 0) {
    throw contractError("SOURCE_ALLOWLIST_REQUIRED");
  }
  /** @type {Set<string>} */
  const ids = new Set();
  /** @type {Set<string>} */
  const paths = new Set();
  const normalizedSources = rawSources.map((rawSource) => {
    assertPlainObject(rawSource, "SOURCE_DESCRIPTOR_INVALID");
    const id = requireIdentity(rawSource.id, "SOURCE_ID_INVALID");
    const relativePath = normalizeRelativeSourcePath(rawSource.relativePath);
    if (path.posix.extname(relativePath).toLocaleLowerCase("en-US") !== ".md") {
      throw contractError("SOURCE_FORMAT_NOT_ALLOWED");
    }
    if (ids.has(id) || paths.has(relativePath)) {
      throw contractError("SOURCE_ALLOWLIST_DUPLICATE");
    }
    ids.add(id);
    paths.add(relativePath);
    return Object.freeze({ id, relativePath });
  });
  return normalizedSources.sort((left, right) =>
    `${left.id}\0${left.relativePath}`.localeCompare(
      `${right.id}\0${right.relativePath}`,
      "en"
    )
  );
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizeRelativeSourcePath(value) {
  if (typeof value !== "string" || value.length === 0 || value.includes("\0")) {
    throw contractError("SOURCE_PATH_INVALID");
  }
  const portablePath = value.replaceAll("\\", "/");
  if (path.posix.isAbsolute(portablePath) || path.win32.isAbsolute(value)) {
    throw contractError("SOURCE_PATH_OUTSIDE_SCOPE");
  }
  if (portablePath.split("/").includes("..")) {
    throw contractError("SOURCE_PATH_OUTSIDE_SCOPE");
  }
  const normalized = path.posix.normalize(portablePath);
  if (
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.split("/").includes("..")
  ) {
    throw contractError("SOURCE_PATH_OUTSIDE_SCOPE");
  }
  return normalized;
}

/**
 * @param {unknown} value
 * @param {string} code
 * @returns {string}
 */
function requireIdentity(value, code) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 200 ||
    !/^[\p{L}\p{N}._:-]+$/u.test(value)
  ) {
    throw contractError(code);
  }
  return value;
}

/**
 * @param {unknown} value
 * @returns {"complete"|"partial"}
 */
function requireCoverageDeclaration(value) {
  if (value !== "complete" && value !== "partial") {
    throw contractError("COVERAGE_DECLARATION_REQUIRED");
  }
  return value;
}

/**
 * @param {unknown} rawRoot
 * @returns {Promise<string>}
 */
async function validateSourceRoot(rawRoot) {
  if (typeof rawRoot !== "string" || !path.isAbsolute(rawRoot) || rawRoot.includes("\0")) {
    throw contractError("SOURCE_ROOT_INVALID");
  }
  const rootStats = await lstat(rawRoot).catch(() => null);
  if (!rootStats || !rootStats.isDirectory() || rootStats.isSymbolicLink()) {
    throw contractError("SOURCE_ROOT_INVALID");
  }
  return realpath(rawRoot);
}

/**
 * @param {string} sourceRoot
 * @param {string} requestedSourceRoot
 * @param {unknown} rawResponseRoot
 * @returns {Promise<string>}
 */
async function prepareResponseRoot(sourceRoot, requestedSourceRoot, rawResponseRoot) {
  if (
    typeof rawResponseRoot !== "string" ||
    !path.isAbsolute(rawResponseRoot) ||
    rawResponseRoot.includes("\0")
  ) {
    throw contractError("RESPONSE_ROOT_INVALID");
  }
  const requestedResponseRoot = path.resolve(rawResponseRoot);
  if (!isStrictDescendant(requestedSourceRoot, requestedResponseRoot)) {
    throw contractError("RESPONSE_ROOT_OUTSIDE_SCOPE");
  }
  const responseRoot = path.resolve(
    sourceRoot,
    path.relative(requestedSourceRoot, requestedResponseRoot)
  );
  const relativePath = path.relative(sourceRoot, responseRoot);
  await assertNoSymlinkComponents(sourceRoot, relativePath, true);
  await mkdir(responseRoot, { recursive: true, mode: 0o700 });
  await chmod(responseRoot, 0o700);
  const resolvedResponseRoot = await realpath(responseRoot);
  if (!isStrictDescendant(sourceRoot, resolvedResponseRoot)) {
    throw contractError("RESPONSE_ROOT_OUTSIDE_SCOPE");
  }
  return resolvedResponseRoot;
}

/**
 * @param {string} sourceRoot
 * @param {NormalizedSource} source
 * @returns {Promise<ReadSourceResult>}
 */
async function readAllowedSource(sourceRoot, source) {
  const absolutePath = path.resolve(sourceRoot, ...source.relativePath.split("/"));
  if (!isStrictDescendant(sourceRoot, absolutePath)) {
    return { source, state: "invalid" };
  }
  try {
    await assertNoSymlinkComponents(sourceRoot, source.relativePath, false);
    const resolvedPath = await realpath(absolutePath);
    if (!isStrictDescendant(sourceRoot, resolvedPath)) {
      return { source, state: "invalid" };
    }
    const noFollow = typeof constants.O_NOFOLLOW === "number" ? constants.O_NOFOLLOW : 0;
    const handle = await open(absolutePath, constants.O_RDONLY | noFollow);
    try {
      const stats = await handle.stat();
      if (!stats.isFile()) {
        return { source, state: "invalid" };
      }
      const content = await handle.readFile({ encoding: "utf8" });
      return {
        source,
        state: "read",
        content,
        contentHash: sha256(content)
      };
    } finally {
      await handle.close();
    }
  } catch (error) {
    const code = getErrorCode(error);
    if (code === "ENOENT") {
      return { source, state: "missing" };
    }
    if (["EACCES", "EPERM"].includes(code)) {
      return { source, state: "unreadable" };
    }
    return { source, state: "invalid" };
  }
}

/**
 * @param {string} sourceRoot
 * @param {string} relativePath
 * @param {boolean} allowMissingTail
 * @returns {Promise<void>}
 */
async function assertNoSymlinkComponents(sourceRoot, relativePath, allowMissingTail) {
  let currentPath = sourceRoot;
  for (const segment of relativePath.split(path.sep).filter(Boolean)) {
    currentPath = path.join(currentPath, segment);
    const stats = await lstat(currentPath).catch((error) => {
      if (allowMissingTail && getErrorCode(error) === "ENOENT") {
        return null;
      }
      throw error;
    });
    if (stats === null) {
      return;
    }
    if (stats.isSymbolicLink()) {
      throw contractError("SYMLINK_PATH_FORBIDDEN");
    }
  }
}

/**
 * @param {string} responseRoot
 * @param {string} manifestId
 * @param {Record<string, unknown>} manifest
 * @returns {Promise<void>}
 */
async function writeProtectedManifest(responseRoot, manifestId, manifest) {
  const manifestPath = path.join(responseRoot, `${manifestId}.json`);
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  const handle = await open(
    manifestPath,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL,
    0o600
  );
  try {
    await handle.writeFile(serialized, "utf8");
    await handle.chmod(0o600);
  } finally {
    await handle.close();
  }
  const [directoryStats, fileStats, readBack] = await Promise.all([
    stat(responseRoot),
    stat(manifestPath),
    readFile(manifestPath, "utf8")
  ]);
  if (
    (directoryStats.mode & 0o777) !== 0o700 ||
    (fileStats.mode & 0o777) !== 0o600 ||
    readBack !== serialized
  ) {
    throw contractError("MANIFEST_READBACK_FAILED");
  }
}

/**
 * @param {{scopeHash: string, source: NormalizedSource, contentHash: string, matchOffset: number}} input
 * @returns {string}
 */
function createEvidenceReference({ scopeHash, source, contentHash, matchOffset }) {
  return `${EVIDENCE_PREFIX}${hashCanonical({
    scopeHash,
    sourceId: source.id,
    relativePath: source.relativePath,
    contentHash,
    matchOffset
  })}`;
}

/**
 * @param {string} answer
 * @returns {string[]}
 */
function extractEvidenceReferences(answer) {
  const pattern = new RegExp(`${EVIDENCE_PREFIX}[a-f0-9]{64}`, "g");
  return [...new Set(answer.match(pattern) ?? [])].sort();
}

/**
 * @param {string} root
 * @param {string} candidate
 * @returns {boolean}
 */
function isStrictDescendant(root, candidate) {
  const relativePath = path.relative(root, candidate);
  return (
    relativePath.length > 0 &&
    relativePath !== ".." &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeSearchText(value) {
  return value.normalize("NFKC").toLocaleLowerCase("ru-RU");
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function hashCanonical(value) {
  return sha256(canonicalStringify(value));
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalStringify(item)).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const record = /** @type {Record<string, unknown>} */ (value);
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalStringify(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * @param {string} value
 * @returns {string}
 */
function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * @param {unknown} value
 * @param {string} code
 * @returns {asserts value is Record<string, unknown>}
 */
function assertPlainObject(value, code) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw contractError(code);
  }
}

/**
 * @param {unknown} error
 * @returns {string}
 */
function getErrorCode(error) {
  if (error !== null && typeof error === "object" && "code" in error) {
    return String(error.code);
  }
  return "UNKNOWN";
}

/**
 * @param {string} code
 * @returns {Error & {code: string}}
 */
function contractError(code) {
  const error = /** @type {Error & {code: string}} */ (new Error(code));
  error.code = code;
  return error;
}
