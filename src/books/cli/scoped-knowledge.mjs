// @ts-check

import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { once } from "node:events";
import { fileURLToPath, pathToFileURL } from "node:url";

import { findGitRoot, findMainWorktree } from "../../../scripts/lib/runtime.mjs";
import { createScopedKnowledgeResolver } from "../knowledge/scoped-knowledge-resolver.mjs";

const PROFILE_RELATIVE_PATH = "src/books/knowledge/scoped-knowledge-profile.json";
const FIXED_PROFILE = Object.freeze({
  schemaVersion: 1,
  projectId: "Books",
  sourceRoot: "runtime/books",
  scopeManifest: "runtime/books/.knowledge/trusted-scope.json",
  responseRoot: "runtime/books/.response-manifests"
});
const MAX_COMMAND_LENGTH = 1_000_000;

/**
 * @typedef {object} TrustedKnowledgeContext
 * @property {string} projectId
 * @property {string} scopeId
 * @property {"complete"|"partial"} coverageDeclaration
 * @property {string} sourceRoot
 * @property {Array<{id: string, relativePath: string}>} sources
 * @property {string} responseRoot
 */

/**
 * Load the one fixed Books profile and protected ignored scope declaration.
 * Neither path can be selected by a model-facing command.
 *
 * @param {{moduleRepoRoot: string, canonicalRepoRoot: string}} roots
 * @returns {Promise<TrustedKnowledgeContext>}
 */
export async function loadBooksKnowledgeContext({ moduleRepoRoot, canonicalRepoRoot }) {
  const profilePath = path.join(moduleRepoRoot, PROFILE_RELATIVE_PATH);
  const profile = await readProtectedJson(profilePath, "TRACKED_PROFILE_INVALID", false);
  assertExactObject(profile, FIXED_PROFILE, "TRACKED_PROFILE_INVALID");

  const sourceRoot = path.join(canonicalRepoRoot, FIXED_PROFILE.sourceRoot);
  const scopeManifestPath = path.join(canonicalRepoRoot, FIXED_PROFILE.scopeManifest);
  const responseRoot = path.join(canonicalRepoRoot, FIXED_PROFILE.responseRoot);
  await assertProtectedScopeManifest(sourceRoot, scopeManifestPath);
  const rawScope = await readProtectedJson(
    scopeManifestPath,
    "TRUSTED_SCOPE_NOT_CONFIGURED",
    true
  );
  assertAllowedFields(
    rawScope,
    ["schemaVersion", "scopeId", "coverageDeclaration", "sources"],
    "TRUSTED_SCOPE_INVALID"
  );
  if (rawScope.schemaVersion !== 1) {
    throw contractError("TRUSTED_SCOPE_INVALID");
  }
  if (rawScope.coverageDeclaration !== "complete" && rawScope.coverageDeclaration !== "partial") {
    throw contractError("TRUSTED_SCOPE_INVALID");
  }
  if (!Array.isArray(rawScope.sources) || rawScope.sources.length === 0) {
    throw contractError("TRUSTED_SCOPE_INVALID");
  }
  const sources = rawScope.sources.map((rawSource) => {
    assertAllowedFields(rawSource, ["id", "relativePath"], "TRUSTED_SCOPE_INVALID");
    if (typeof rawSource.id !== "string" || typeof rawSource.relativePath !== "string") {
      throw contractError("TRUSTED_SCOPE_INVALID");
    }
    return { id: rawSource.id, relativePath: rawSource.relativePath };
  });
  if (typeof rawScope.scopeId !== "string") {
    throw contractError("TRUSTED_SCOPE_INVALID");
  }

  return {
    projectId: FIXED_PROFILE.projectId,
    scopeId: rawScope.scopeId,
    coverageDeclaration: rawScope.coverageDeclaration,
    sourceRoot,
    sources,
    responseRoot
  };
}

/**
 * Run a long-lived JSONL session so issued and actually-read evidence refs stay
 * bound to one in-memory trusted scope.
 *
 * @param {{trustedContext: TrustedKnowledgeContext, input: import("node:stream").Readable, output: import("node:stream").Writable}} options
 * @returns {Promise<void>}
 */
export async function runBooksKnowledgeSession({ trustedContext, input, output }) {
  const resolver = await createScopedKnowledgeResolver(trustedContext);
  const lines = createInterface({ input, crlfDelay: Infinity });
  await writeJsonLine(output, {
    ok: true,
    operation: "ready",
    scope: resolver.scope
  });

  for await (const line of lines) {
    if (!line.trim()) {
      continue;
    }
    try {
      if (line.length > MAX_COMMAND_LENGTH) {
        throw contractError("COMMAND_TOO_LARGE");
      }
      const command = parseCommand(line);
      if (command.operation === "search") {
        assertAllowedFields(
          command,
          ["operation", "query", "freshness"],
          "COMMAND_AUTHORITY_FIELD_FORBIDDEN"
        );
        if (
          typeof command.query !== "string" ||
          (command.freshness !== "snapshot" && command.freshness !== "current")
        ) {
          throw contractError("SEARCH_COMMAND_INVALID");
        }
        const result = await resolver.search({
          query: command.query,
          mutableFact: command.freshness === "current"
        });
        await writeJsonLine(output, { ok: true, operation: "search", result });
        continue;
      }
      if (command.operation === "catalog") {
        assertAllowedFields(command, ["operation"], "COMMAND_AUTHORITY_FIELD_FORBIDDEN");
        const result = await resolver.catalog();
        await writeJsonLine(output, { ok: true, operation: "catalog", result });
        continue;
      }
      if (command.operation === "read") {
        assertAllowedFields(
          command,
          ["operation", "requestId", "reference"],
          "COMMAND_AUTHORITY_FIELD_FORBIDDEN"
        );
        if (typeof command.requestId !== "string" || typeof command.reference !== "string") {
          throw contractError("READ_COMMAND_INVALID");
        }
        const result = await resolver.readEvidence({
          requestId: command.requestId,
          reference: command.reference
        });
        await writeJsonLine(output, { ok: true, operation: "read", result });
        continue;
      }
      if (command.operation === "finalize") {
        assertAllowedFields(
          command,
          ["operation", "requestId", "answer"],
          "COMMAND_AUTHORITY_FIELD_FORBIDDEN"
        );
        if (typeof command.requestId !== "string" || typeof command.answer !== "string") {
          throw contractError("FINALIZE_COMMAND_INVALID");
        }
        const result = await resolver.finalizeResponse({
          requestId: command.requestId,
          answer: command.answer
        });
        await writeJsonLine(output, { ok: true, operation: "finalize", result });
        continue;
      }
      if (command.operation === "close") {
        assertAllowedFields(command, ["operation"], "COMMAND_AUTHORITY_FIELD_FORBIDDEN");
        await writeJsonLine(output, { ok: true, operation: "closed" });
        return;
      }
      throw contractError("COMMAND_OPERATION_INVALID");
    } catch (error) {
      await writeJsonLine(output, {
        ok: false,
        error: getPublicErrorCode(error)
      });
    }
  }
}

/**
 * @param {string} line
 * @returns {Record<string, unknown>}
 */
function parseCommand(line) {
  try {
    const value = /** @type {unknown} */ (JSON.parse(line));
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw contractError("COMMAND_INVALID");
    }
    return /** @type {Record<string, unknown>} */ (value);
  } catch (error) {
    if (getPublicErrorCode(error) === "COMMAND_INVALID") {
      throw error;
    }
    throw contractError("COMMAND_INVALID");
  }
}

/**
 * @param {string} sourceRoot
 * @param {string} scopeManifestPath
 * @returns {Promise<void>}
 */
async function assertProtectedScopeManifest(sourceRoot, scopeManifestPath) {
  const sourceStats = await lstat(sourceRoot).catch(() => null);
  const protectedDirectory = path.dirname(scopeManifestPath);
  const [directoryStats, manifestStats] = await Promise.all([
    lstat(protectedDirectory).catch(() => null),
    lstat(scopeManifestPath).catch(() => null)
  ]);
  if (
    !sourceStats?.isDirectory() ||
    sourceStats.isSymbolicLink() ||
    !directoryStats?.isDirectory() ||
    directoryStats.isSymbolicLink() ||
    (directoryStats.mode & 0o777) !== 0o700 ||
    !manifestStats?.isFile() ||
    manifestStats.isSymbolicLink() ||
    (manifestStats.mode & 0o777) !== 0o600
  ) {
    throw contractError("TRUSTED_SCOPE_NOT_CONFIGURED");
  }
  const [resolvedRoot, resolvedManifest] = await Promise.all([
    realpath(sourceRoot),
    realpath(scopeManifestPath)
  ]);
  const relativePath = path.relative(resolvedRoot, resolvedManifest);
  if (
    !relativePath ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw contractError("TRUSTED_SCOPE_NOT_CONFIGURED");
  }
}

/**
 * @param {string} filePath
 * @param {string} errorCode
 * @param {boolean} requireProtectedMode
 * @returns {Promise<Record<string, unknown>>}
 */
async function readProtectedJson(filePath, errorCode, requireProtectedMode) {
  const stats = await lstat(filePath).catch(() => null);
  if (
    !stats?.isFile() ||
    stats.isSymbolicLink() ||
    (requireProtectedMode && (stats.mode & 0o777) !== 0o600)
  ) {
    throw contractError(errorCode);
  }
  try {
    const parsed = /** @type {unknown} */ (JSON.parse(await readFile(filePath, "utf8")));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw contractError(errorCode);
    }
    return /** @type {Record<string, unknown>} */ (parsed);
  } catch {
    throw contractError(errorCode);
  }
}

/**
 * @param {unknown} value
 * @param {string[]} allowedFields
 * @param {string} errorCode
 * @returns {asserts value is Record<string, unknown>}
 */
function assertAllowedFields(value, allowedFields, errorCode) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw contractError(errorCode);
  }
  const allowed = new Set(allowedFields);
  if (Object.keys(value).some((field) => !allowed.has(field))) {
    throw contractError(errorCode);
  }
}

/**
 * @param {Record<string, unknown>} actual
 * @param {Readonly<Record<string, unknown>>} expected
 * @param {string} errorCode
 */
function assertExactObject(actual, expected, errorCode) {
  assertAllowedFields(actual, Object.keys(expected), errorCode);
  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] !== value) {
      throw contractError(errorCode);
    }
  }
  if (Object.keys(actual).length !== Object.keys(expected).length) {
    throw contractError(errorCode);
  }
}

/**
 * @param {import("node:stream").Writable} output
 * @param {Record<string, unknown>} value
 * @returns {Promise<void>}
 */
async function writeJsonLine(output, value) {
  if (!output.write(`${JSON.stringify(value)}\n`, "utf8")) {
    await once(output, "drain");
  }
}

/**
 * @param {unknown} error
 * @returns {string}
 */
function getPublicErrorCode(error) {
  if (error !== null && typeof error === "object" && "code" in error) {
    return String(error.code);
  }
  return "INTERNAL_ERROR";
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

async function main() {
  if (process.argv.length !== 2) {
    throw contractError("CLI_ARGUMENTS_FORBIDDEN");
  }
  const modulePath = fileURLToPath(import.meta.url);
  const moduleRepoRoot = findGitRoot(path.resolve(path.dirname(modulePath), "../../.."));
  const canonicalRepoRoot = (await findMainWorktree(moduleRepoRoot)) ?? moduleRepoRoot;
  const trustedContext = await loadBooksKnowledgeContext({
    moduleRepoRoot,
    canonicalRepoRoot
  });
  await runBooksKnowledgeSession({
    trustedContext,
    input: process.stdin,
    output: process.stdout
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(getPublicErrorCode(error));
    process.exitCode = 1;
  });
}
