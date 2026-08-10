// @ts-check

import { createHash } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { ensureDependencies } from "../dependency-preflight.mjs";
import { preserveBooksRuntimeArtifacts } from "./books-artifacts.mjs";
import {
  getGitTreeEntry,
  getNameStatusDiff,
  gitTreeEntriesEqual,
  proveParallelDuplicateCommit
} from "./duplicate-equivalence.mjs";
import { loadSuccessorLineageManifest, proveSuccessorLineage } from "./successor-lineage.mjs";
import {
  getCodexHome,
  getCurrentBranch,
  getHeadSha,
  getHistoryPath,
  getTaskArtifactsDir,
  getTrackedChangedFiles,
  getWorktreeList,
  isGitDirty,
  loadAllTaskStates,
  readJson,
  readNdjson,
  runCommand,
  writeJson
} from "./runtime.mjs";

const PROFILE_PATH = ".memory-bank/finish-profile.json";
const BOOKS_RUNTIME_PATH = "runtime/books";
const PROTECTED_BOOKS_DIRECTORIES = [".knowledge", ".response-manifests"];

/**
 * @typedef {Object} LocalOnlyPath
 * @property {string} path
 * @property {boolean} [required]
 * @property {boolean} [exact]
 */

/**
 * @typedef {Object} FinishProfile
 * @property {number} version
 * @property {"runtime"} mode
 * @property {"local"|"test"} environment
 * @property {string} preCleanupScript
 * @property {string} postCleanupScript
 * @property {LocalOnlyPath[]} localOnlyPaths
 */

/**
 * @typedef {Object} PreservedArtifact
 * @property {string} source
 * @property {string} target
 * @property {string} sha256
 * @property {number} mode
 */

/**
 * @typedef {Object} PreservedDirectory
 * @property {string} source
 * @property {string} target
 * @property {number} mode
 */

/**
 * @typedef {Object} VerificationCheck
 * @property {string} id
 * @property {"passed"|"failed"|"not_applicable"} status
 * @property {string} details
 */

/**
 * @typedef {Object} VerificationResult
 * @property {"pre_cleanup"|"post_cleanup"} phase
 * @property {"passed"|"failed"} status
 * @property {string} mainSha
 * @property {string[]} changedFiles
 * @property {VerificationCheck[]} checks
 * @property {string[]} blocked
 * @property {string[]} notes
 * @property {string[]} runtimeSourcePaths
 * @property {Array<{path: string, files: number}>} preservedPaths
 * @property {PreservedArtifact[]} preservedArtifacts
 * @property {PreservedDirectory[]} preservedDirectories
 * @property {Awaited<ReturnType<typeof preserveBooksRuntimeArtifacts>> | null} artifactPreservation
 */

/**
 * @param {string} root
 * @param {string} relativePath
 * @returns {string}
 */
function resolveInside(root, relativePath) {
  if (!relativePath || path.isAbsolute(relativePath)) {
    throw new Error(`Finish verification path must be relative: ${relativePath || "(empty)"}`);
  }
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relativePath);
  const relation = path.relative(resolvedRoot, resolved);
  if (relation.startsWith("..") || path.isAbsolute(relation)) {
    throw new Error(`Finish verification path escapes its root: ${relativePath}`);
  }
  return resolved;
}

/**
 * Validate every existing component before reading an ignored artifact. This
 * prevents verification itself from following a symlink outside runtime/books.
 *
 * @param {string} root
 * @param {string} relativePath
 * @param {"file"|"directory"} expectedType
 * @returns {Promise<import("node:fs").Stats>}
 */
async function inspectPathInside(root, relativePath, expectedType) {
  const resolvedRoot = path.resolve(root);
  const rootStats = await lstat(resolvedRoot);
  if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
    throw new Error(`Books runtime root is not a regular directory: ${resolvedRoot}`);
  }
  const resolved = resolveInside(resolvedRoot, relativePath);
  const relation = path.relative(resolvedRoot, resolved);
  const segments = relation.split(path.sep).filter(Boolean);
  let current = resolvedRoot;
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    const metadata = await lstat(current);
    const isLast = index === segments.length - 1;
    if (metadata.isSymbolicLink()) {
      throw new Error(`Books runtime path contains a symlink: ${current}`);
    }
    if (!isLast && !metadata.isDirectory()) {
      throw new Error(`Books runtime path contains a non-directory component: ${current}`);
    }
    if (isLast && expectedType === "file" && !metadata.isFile()) {
      throw new Error(`Books runtime artifact is not a regular file: ${current}`);
    }
    if (isLast && expectedType === "directory" && !metadata.isDirectory()) {
      throw new Error(`Books runtime artifact directory is invalid: ${current}`);
    }
  }
  return lstat(resolved);
}

/**
 * @param {string} candidate
 * @returns {Promise<import("node:fs").Stats | null>}
 */
async function lstatOrNull(candidate) {
  try {
    return await lstat(candidate);
  } catch (error) {
    if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * Inventory every canonical-main protected artifact, including files that do
 * not exist in the task worktree. Symlinks are never followed and every
 * protected directory/file must retain 0700/0600 respectively.
 *
 * @param {string} mainWorktreePath
 * @returns {Promise<{artifacts: PreservedArtifact[], directories: PreservedDirectory[], failures: string[]}>}
 */
async function inventoryProtectedRuntime(mainWorktreePath) {
  const runtimeRoot = path.join(mainWorktreePath, BOOKS_RUNTIME_PATH);
  /** @type {PreservedArtifact[]} */
  const artifacts = [];
  /** @type {PreservedDirectory[]} */
  const directories = [];
  /** @type {string[]} */
  const failures = [];
  if (!(await lstatOrNull(runtimeRoot))) {
    return { artifacts, directories, failures };
  }
  try {
    await inspectPathInside(mainWorktreePath, BOOKS_RUNTIME_PATH, "directory");
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
    return { artifacts, directories, failures };
  }

  /**
   * @param {string} relativePath
   * @returns {Promise<void>}
   */
  async function visit(relativePath) {
    const absolutePath = resolveInside(runtimeRoot, relativePath);
    const metadata = await lstat(absolutePath);
    if (metadata.isSymbolicLink()) {
      failures.push(`Protected Books target contains a symlink: ${relativePath}`);
      return;
    }
    if (metadata.isDirectory()) {
      const mode = metadata.mode & 0o777;
      if (mode !== 0o700) {
        failures.push(`Protected Books directory permissions are unsafe: ${relativePath}`);
      }
      directories.push({ source: relativePath, target: relativePath, mode });
      const entries = await readdir(absolutePath, { withFileTypes: true });
      for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
        await visit(path.join(relativePath, entry.name));
      }
      return;
    }
    if (metadata.isFile()) {
      const mode = metadata.mode & 0o777;
      if (mode !== 0o600) {
        failures.push(`Protected Books artifact permissions are unsafe: ${relativePath}`);
      }
      artifacts.push({
        source: relativePath,
        target: relativePath,
        sha256: await sha256(absolutePath),
        mode
      });
      return;
    }
    failures.push(`Protected Books target contains an unsupported entry: ${relativePath}`);
  }

  for (const relativeDirectory of PROTECTED_BOOKS_DIRECTORIES) {
    const metadata = await lstatOrNull(path.join(runtimeRoot, relativeDirectory));
    if (metadata) {
      await visit(relativeDirectory);
    }
  }
  artifacts.sort((left, right) => left.target.localeCompare(right.target));
  directories.sort((left, right) => left.target.localeCompare(right.target));
  return { artifacts, directories, failures };
}

/**
 * @param {string} mainWorktreePath
 * @param {PreservedArtifact[]} expectedArtifacts
 * @param {PreservedDirectory[]} expectedDirectories
 * @returns {Promise<string[]>}
 */
async function verifyProtectedTargetSnapshot(
  mainWorktreePath,
  expectedArtifacts,
  expectedDirectories
) {
  const actual = await inventoryProtectedRuntime(mainWorktreePath);
  const failures = [...actual.failures];
  const expectedFiles = new Map(
    expectedArtifacts
      .filter((entry) => isProtectedKnowledgeArtifact(entry.target))
      .map((entry) => [entry.target, entry])
  );
  const actualFiles = new Map(actual.artifacts.map((entry) => [entry.target, entry]));
  const expectedDirs = new Map(expectedDirectories.map((entry) => [entry.target, entry]));
  const actualDirs = new Map(actual.directories.map((entry) => [entry.target, entry]));

  for (const [target, expected] of expectedFiles) {
    const current = actualFiles.get(target);
    if (!current) {
      failures.push(`Protected Books artifact disappeared: ${target}`);
    } else if (current.sha256 !== expected.sha256 || current.mode !== expected.mode) {
      failures.push(`Protected Books artifact changed: ${target}`);
    }
  }
  for (const target of actualFiles.keys()) {
    if (!expectedFiles.has(target)) {
      failures.push(`Unexpected protected Books artifact appeared: ${target}`);
    }
  }
  for (const [target, expected] of expectedDirs) {
    const current = actualDirs.get(target);
    if (!current) {
      failures.push(`Protected Books directory disappeared: ${target}`);
    } else if (current.mode !== expected.mode) {
      failures.push(`Protected Books directory changed: ${target}`);
    }
  }
  for (const target of actualDirs.keys()) {
    if (!expectedDirs.has(target)) {
      failures.push(`Unexpected protected Books directory appeared: ${target}`);
    }
  }
  return failures;
}

/**
 * @param {string} candidate
 * @returns {string}
 */
function canonicalPath(candidate) {
  return existsSync(candidate) ? realpathSync(candidate) : path.resolve(candidate);
}

/**
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function sha256(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

/**
 * @param {string} root
 * @param {string} [prefix]
 * @returns {Promise<Map<string, string>>}
 */
async function inventoryRegularFiles(root, prefix = "") {
  const inventory = new Map();
  if (!existsSync(root)) {
    return inventory;
  }
  const metadata = await lstat(root);
  if (metadata.isSymbolicLink()) {
    throw new Error(`Books runtime contains an unsupported symlink: ${root}`);
  }
  if (metadata.isFile()) {
    inventory.set(prefix || path.basename(root), await sha256(root));
    return inventory;
  }
  if (!metadata.isDirectory()) {
    throw new Error(`Books runtime contains an unsupported filesystem entry: ${root}`);
  }

  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = prefix ? path.join(prefix, entry.name) : entry.name;
    const fullPath = path.join(root, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Books runtime contains an unsupported symlink: ${fullPath}`);
    }
    if (entry.isDirectory()) {
      const nested = await inventoryRegularFiles(fullPath, relativePath);
      for (const [nestedPath, hash] of nested) {
        inventory.set(nestedPath, hash);
      }
      continue;
    }
    if (!entry.isFile()) {
      throw new Error(`Books runtime contains an unsupported filesystem entry: ${fullPath}`);
    }
    inventory.set(relativePath, await sha256(fullPath));
  }
  return inventory;
}

/**
 * @param {string} mainWorktreePath
 * @returns {Promise<FinishProfile>}
 */
async function loadFinishProfile(mainWorktreePath) {
  const payload = await readJson(path.join(mainWorktreePath, PROFILE_PATH));
  if (!payload || typeof payload !== "object") {
    throw new Error(`Missing required finish profile: ${PROFILE_PATH}`);
  }
  const profile = /** @type {Partial<FinishProfile>} */ (payload);
  if (profile.version !== 1 || profile.mode !== "runtime") {
    throw new Error(`Books finish profile must declare version=1 and mode=runtime: ${PROFILE_PATH}`);
  }
  if (!profile.environment || !["local", "test"].includes(profile.environment)) {
    throw new Error("Books finish profile must declare environment=local|test; production is never automatic.");
  }
  if (!profile.preCleanupScript || !profile.postCleanupScript) {
    throw new Error("Books finish profile requires preCleanupScript and postCleanupScript.");
  }
  if (!Array.isArray(profile.localOnlyPaths)) {
    throw new Error("Books finish profile must declare localOnlyPaths.");
  }
  const unsupported = profile.localOnlyPaths.filter((entry) => entry?.path !== BOOKS_RUNTIME_PATH);
  if (unsupported.length > 0 || !profile.localOnlyPaths.some((entry) => entry?.path === BOOKS_RUNTIME_PATH)) {
    throw new Error(`Books finish profile can verify only the native ${BOOKS_RUNTIME_PATH} preservation seam.`);
  }
  return /** @type {FinishProfile} */ (profile);
}

/**
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} state
 * @returns {string[]}
 */
function getTaskChangedFiles(repoRoot, state) {
  if (!state.baseSha || !state.commitSha) {
    throw new Error("Exact main equivalence requires task state baseSha and commitSha.");
  }
  for (const [label, sha] of [["baseSha", state.baseSha], ["commitSha", state.commitSha]]) {
    const readable = runCommand(repoRoot, "git", ["rev-parse", "--verify", `${sha}^{commit}`], { allowFailure: true });
    if (readable.status !== 0) {
      throw new Error(`Exact main equivalence requires a readable ${label}: ${sha}`);
    }
  }
  const basedOnRecordedStart = runCommand(repoRoot, "git", ["merge-base", "--is-ancestor", state.baseSha, state.commitSha], {
    allowFailure: true
  });
  if (basedOnRecordedStart.status !== 0) {
    throw new Error("Task commit is not descended from the recorded baseSha.");
  }

  return getNameStatusDiff(repoRoot, state.baseSha, state.commitSha).files;
}

/**
 * @param {string[]} left
 * @param {string[]} right
 * @returns {boolean}
 */
function sameStringSet(left, right) {
  return [...new Set(left)].sort().join("\n") === [...new Set(right)].sort().join("\n");
}

/**
 * @param {string} mainWorktreePath
 * @param {import("./runtime.mjs").TaskState} state
 * @param {string[]} changedFiles
 * @returns {string[]}
 */
export function verifyTrackedEquivalence(mainWorktreePath, state, changedFiles) {
  if (!state.commitSha || !state.baseSha) {
    return ["Tracked equivalence requires baseSha and commitSha."];
  }

  if (state.equivalenceMode === "parallel_duplicate_commit") {
    if (!state.replacementCommitSha) {
      return ["Duplicate equivalence state requires replacementCommitSha."];
    }
    try {
      const proof = proveParallelDuplicateCommit(mainWorktreePath, state.commitSha, state.replacementCommitSha, "HEAD");
      const failures = [];
      if (proof.baseSha !== state.baseSha) {
        failures.push("Duplicate equivalence baseSha does not match task state.");
      }
      if (!sameStringSet(proof.changedFiles, changedFiles)) {
        failures.push("Duplicate equivalence changed-file set does not match task state.");
      }
      return failures;
    } catch (error) {
      return [error instanceof Error ? error.message : String(error)];
    }
  }

  if (state.equivalenceMode) {
    return [`Unsupported equivalence mode: ${state.equivalenceMode}`];
  }

  const contained = runCommand(mainWorktreePath, "git", ["merge-base", "--is-ancestor", state.commitSha, "HEAD"], {
    allowFailure: true
  });
  if (contained.status !== 0) {
    return ["Task commit is not contained in canonical main; use explicit --duplicate-of only for a proven parallel duplicate."];
  }

  const failures = [];
  for (const filePath of changedFiles) {
    const taskEntry = getGitTreeEntry(mainWorktreePath, state.commitSha, filePath);
    const mainEntry = getGitTreeEntry(mainWorktreePath, "HEAD", filePath);
    if (!gitTreeEntriesEqual(taskEntry, mainEntry)) {
      failures.push(`Tracked main mismatch: ${filePath}`);
    }
  }
  return failures;
}

/**
 * @param {string} repoRoot
 * @param {string} mainWorktreePath
 * @param {import("./runtime.mjs").TaskState} state
 * @param {string[]} changedFiles
 * @returns {Promise<string[]>}
 */
async function verifyTrackedSuccessorLineage(repoRoot, mainWorktreePath, state, changedFiles) {
  const failures = [];
  if (
    state.supersessionMode !== "declared_successor_lineage" ||
    state.supersessionStatus !== "superseded_verified" ||
    !state.commitSha ||
    !state.supersessionMainSha ||
    !state.supersessionManifestSha256 ||
    !state.supersessionManifestRelativePath ||
    !state.supersessionProofArtifactRelativePath ||
    !new Set([1, 2]).has(state.supersessionManifestVersion ?? 1) ||
    !Array.isArray(state.successorLineage) ||
    state.successorLineage.length === 0
  ) {
    return ["Successor-lineage state is incomplete."];
  }

  try {
    const manifestPath = path.resolve(mainWorktreePath, state.supersessionManifestRelativePath);
    const manifestRelativePath = path.relative(mainWorktreePath, manifestPath);
    if (!manifestRelativePath || manifestRelativePath.startsWith("..") || path.isAbsolute(manifestRelativePath)) {
      throw new Error("Successor-lineage sealed manifest path is outside canonical main.");
    }
    const ignored = runCommand(
      mainWorktreePath,
      "git",
      ["check-ignore", "-q", "--no-index", "--", manifestRelativePath],
      { allowFailure: true }
    );
    if (ignored.status !== 0) {
      throw new Error("Successor-lineage sealed manifest is no longer an ignored local file.");
    }
    const loaded = loadSuccessorLineageManifest(manifestPath);
    if (loaded.sha256 !== state.supersessionManifestSha256) {
      throw new Error("Successor-lineage sealed manifest SHA-256 changed before cleanup.");
    }
    if (loaded.manifest.version !== (state.supersessionManifestVersion ?? 1)) {
      throw new Error("Successor-lineage sealed manifest version does not match task state.");
    }
    const proof = proveSuccessorLineage(
      mainWorktreePath,
      state,
      loaded.manifest,
      await loadAllTaskStates(repoRoot),
      "HEAD",
      { allowedDirectPaths: [] }
    );
    if (!sameStringSet(proof.changedPaths, changedFiles)) {
      failures.push("Successor-lineage changed-file set does not match task state.");
    }
    if (JSON.stringify(proof.successors) !== JSON.stringify(state.successorLineage)) {
      failures.push("Successor-lineage sealed manifest entries do not match task state.");
    }

    const artifactDir = getTaskArtifactsDir(repoRoot, state.taskId);
    const proofPath = path.resolve(artifactDir, state.supersessionProofArtifactRelativePath);
    const proofRelativePath = path.relative(artifactDir, proofPath);
    if (!proofRelativePath || proofRelativePath.startsWith("..") || path.isAbsolute(proofRelativePath)) {
      throw new Error("Successor-lineage proof artifact path is outside the task artifact directory.");
    }
    const artifact = await readJson(proofPath);
    const expectedArtifact = {
      version: 2,
      status: proof.status,
      manifestVersion: proof.manifestVersion,
      taskId: state.taskId,
      taskCommitSha: proof.taskCommitSha,
      mainSha: proof.mainSha,
      manifestSha256: state.supersessionManifestSha256,
      manifestRelativePath: state.supersessionManifestRelativePath,
      changedPaths: proof.changedPaths,
      rewrittenPaths: proof.rewrittenPaths,
      successors: proof.successors,
      approvedDirectMainCommitShas: proof.approvedDirectMainCommitShas,
      originalAcceptance: {
        command: "npm run qa:agent",
        sha: proof.taskCommitSha,
        status: "passed"
      },
      currentMainAcceptance: {
        command: "npm run qa:agent",
        sha: proof.mainSha,
        status: "passed"
      }
    };
    const unexpectedArtifactKeys =
      artifact && typeof artifact === "object" && !Array.isArray(artifact)
        ? Object.keys(artifact).filter((key) => !Object.hasOwn(expectedArtifact, key))
        : [];
    const normalizedArtifact =
      artifact && typeof artifact === "object" && !Array.isArray(artifact)
        ? {
            version: artifact.version,
            status: artifact.status,
            manifestVersion: artifact.manifestVersion ?? 1,
            taskId: artifact.taskId,
            taskCommitSha: artifact.taskCommitSha,
            mainSha: artifact.mainSha,
            manifestSha256: artifact.manifestSha256,
            manifestRelativePath: artifact.manifestRelativePath,
            changedPaths: artifact.changedPaths,
            rewrittenPaths: artifact.rewrittenPaths,
            successors: artifact.successors,
            approvedDirectMainCommitShas: artifact.approvedDirectMainCommitShas ?? [],
            originalAcceptance: artifact.originalAcceptance,
            currentMainAcceptance: artifact.currentMainAcceptance
          }
        : artifact;
    if (unexpectedArtifactKeys.length > 0 || JSON.stringify(normalizedArtifact) !== JSON.stringify(expectedArtifact)) {
      throw new Error("Successor-lineage immutable proof artifact does not match task state.");
    }
    const history = await readNdjson(getHistoryPath(repoRoot));
    const publishSkip = [...history].reverse().find(
      (event) =>
        event.taskId === state.taskId &&
        event.branch === state.branch &&
        event.type === "PUBLISH_SKIP" &&
        event.payload.supersessionStatus === "superseded_verified" &&
        event.payload.commitSha === state.commitSha &&
        event.payload.mainSha === state.supersessionMainSha &&
        event.payload.manifestSha256 === state.supersessionManifestSha256
    );
    if (!publishSkip) {
      throw new Error("Successor-lineage cleanup requires matching append-only PUBLISH_SKIP evidence.");
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  const mainSha = getHeadSha(mainWorktreePath);
  if (
    state.originalAcceptanceStatus !== "passed" ||
    state.originalAcceptanceCommand !== "npm run qa:agent" ||
    state.originalAcceptanceTaskSha !== state.commitSha
  ) {
    failures.push("Successor-lineage cleanup requires exact original-task acceptance evidence.");
  }
  if (
    state.successorAcceptanceStatus !== "passed" ||
    state.successorAcceptanceCommand !== "npm run qa:agent" ||
    state.successorAcceptanceMainSha !== mainSha ||
    state.supersessionMainSha !== mainSha
  ) {
    failures.push("Successor-lineage cleanup requires exact current-main acceptance evidence.");
  }
  return failures;
}

/**
 * @param {import("./runtime.mjs").TaskState} state
 * @param {string} mainWorktreePath
 * @param {Awaited<ReturnType<typeof preserveBooksRuntimeArtifacts>>} preservation
 * @returns {Promise<{artifacts: PreservedArtifact[], directories: PreservedDirectory[], failures: string[]}>}
 */
async function verifyBooksPreservation(state, mainWorktreePath, preservation) {
  const expectedSource = path.resolve(state.worktreePath, BOOKS_RUNTIME_PATH);
  const expectedTarget = path.resolve(mainWorktreePath, BOOKS_RUNTIME_PATH);
  const failures = [];
  if (path.resolve(preservation.sourceRoot) !== expectedSource || path.resolve(preservation.targetRoot) !== expectedTarget) {
    failures.push("Books preservation roots do not match the exact task and canonical main worktrees.");
  }
  if (preservation.skipped.length > 0) {
    failures.push(`Books preservation skipped unsupported entries: ${preservation.skipped.join(", ")}`);
  }
  if (preservation.skippedReason === "same_worktree") {
    failures.push("Task and canonical main resolve to the same worktree; cleanup is unsafe.");
  }
  const protectedTarget = await inventoryProtectedRuntime(mainWorktreePath);
  failures.push(...protectedTarget.failures);
  if (preservation.skippedReason === "missing_source") {
    if (existsSync(expectedSource)) {
      failures.push("Books preservation reported missing_source but the source exists.");
    }
    return {
      artifacts: protectedTarget.artifacts,
      directories: protectedTarget.directories,
      failures
    };
  }

  try {
    await Promise.all([
      inspectPathInside(state.worktreePath, BOOKS_RUNTIME_PATH, "directory"),
      inspectPathInside(mainWorktreePath, BOOKS_RUNTIME_PATH, "directory")
    ]);
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
    return {
      artifacts: protectedTarget.artifacts,
      directories: protectedTarget.directories,
      failures
    };
  }
  const sourceInventory = await inventoryRegularFiles(expectedSource);
  const targetBySource = new Map();
  for (const relativePath of [...preservation.copied, ...preservation.identical]) {
    targetBySource.set(relativePath, relativePath);
  }
  for (const conflict of preservation.conflictCopies) {
    if (targetBySource.has(conflict.source)) {
      failures.push(`Books preservation reported duplicate mappings for ${conflict.source}`);
    }
    targetBySource.set(conflict.source, conflict.target);
  }

  /** @type {PreservedArtifact[]} */
  const artifacts = [];
  for (const [sourceRelativePath, sourceHash] of sourceInventory) {
    const targetRelativePath = targetBySource.get(sourceRelativePath);
    if (!targetRelativePath) {
      failures.push(`Books source artifact has no preservation mapping: ${sourceRelativePath}`);
      continue;
    }
    const targetPath = resolveInside(expectedTarget, targetRelativePath);
    const sourcePath = resolveInside(expectedSource, sourceRelativePath);
    let sourceStats;
    let targetStats;
    try {
      [sourceStats, targetStats] = await Promise.all([
        inspectPathInside(expectedSource, sourceRelativePath, "file"),
        inspectPathInside(expectedTarget, targetRelativePath, "file")
      ]);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    const targetHash = await sha256(targetPath);
    if (targetHash !== sourceHash) {
      failures.push(`Preserved Books artifact checksum mismatch: ${targetRelativePath}`);
      continue;
    }
    const sourceMode = sourceStats.mode & 0o777;
    const targetMode = targetStats.mode & 0o777;
    if (sourceMode !== targetMode) {
      failures.push(`Preserved Books artifact mode mismatch: ${targetRelativePath}`);
      continue;
    }
    if (isProtectedKnowledgeArtifact(sourceRelativePath)) {
      const protectedDirectory = sourceRelativePath.split(path.sep)[0];
      const protectedDirectoryRecord = protectedTarget.directories.find(
        (entry) => entry.target === protectedDirectory
      );
      if (sourceMode !== 0o600 || !protectedDirectoryRecord) {
        failures.push(`Protected Books artifact permissions are unsafe: ${targetRelativePath}`);
        continue;
      }
    }
    artifacts.push({
      source: sourceRelativePath,
      target: targetRelativePath,
      sha256: sourceHash,
      mode: sourceMode
    });
  }
  for (const sourceRelativePath of targetBySource.keys()) {
    if (!sourceInventory.has(sourceRelativePath)) {
      failures.push(`Books preservation returned an unknown source mapping: ${sourceRelativePath}`);
    }
  }
  for (const protectedArtifact of protectedTarget.artifacts) {
    const existing = artifacts.find((entry) => entry.target === protectedArtifact.target);
    if (!existing) {
      artifacts.push(protectedArtifact);
      continue;
    }
    if (
      existing.sha256 !== protectedArtifact.sha256 ||
      existing.mode !== protectedArtifact.mode
    ) {
      failures.push(`Protected Books target evidence disagrees: ${protectedArtifact.target}`);
    }
  }
  artifacts.sort((left, right) => left.target.localeCompare(right.target));
  return {
    artifacts,
    directories: protectedTarget.directories,
    failures
  };
}

/**
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} state
 * @returns {Promise<{artifacts: PreservedArtifact[], directories: PreservedDirectory[], failures: string[]}>}
 */
async function verifyPreservedArtifactsAfterCleanup(repoRoot, state) {
  const preResult = await readJson(path.join(getTaskArtifactsDir(repoRoot, state.taskId), "finish-verification-pre_cleanup-result.json"));
  if (!preResult || typeof preResult !== "object" || preResult.status !== "passed") {
    return { artifacts: [], directories: [], failures: ["Post-cleanup verification requires passed pre-cleanup preservation evidence."] };
  }
  const rawArtifacts = Array.isArray(preResult.preservedArtifacts) ? preResult.preservedArtifacts : null;
  if (!rawArtifacts) {
    return { artifacts: [], directories: [], failures: ["Pre-cleanup preservation evidence is missing preservedArtifacts."] };
  }
  const rawDirectories = Array.isArray(preResult.preservedDirectories)
    ? preResult.preservedDirectories
    : null;
  /** @type {PreservedArtifact[]} */
  const artifacts = [];
  /** @type {PreservedDirectory[]} */
  const directories = [];
  /** @type {PreservedArtifact[]} */
  const expectedProtectedArtifacts = [];
  /** @type {PreservedDirectory[]} */
  const expectedProtectedDirectories = [];
  const failures = [];
  const mainWorktreePath = state.mainWorktreePath ?? repoRoot;
  const runtimeRoot = path.join(mainWorktreePath, BOOKS_RUNTIME_PATH);
  const runtimeMetadata = await lstatOrNull(runtimeRoot);
  if (runtimeMetadata) {
    try {
      await inspectPathInside(mainWorktreePath, BOOKS_RUNTIME_PATH, "directory");
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      return { artifacts, directories, failures };
    }
  }
  if (!rawDirectories) {
    failures.push("Pre-cleanup preservation evidence is missing preservedDirectories.");
  } else {
    const seenDirectories = new Set();
    for (const raw of rawDirectories) {
      if (
        !raw ||
        typeof raw !== "object" ||
        typeof raw.target !== "string" ||
        typeof raw.source !== "string" ||
        typeof raw.mode !== "number" ||
        !isProtectedKnowledgeArtifact(raw.target) ||
        raw.source !== raw.target ||
        seenDirectories.has(raw.target)
      ) {
        failures.push("Pre-cleanup preservation evidence contains a malformed directory record.");
        continue;
      }
      seenDirectories.add(raw.target);
      expectedProtectedDirectories.push(/** @type {PreservedDirectory} */ (raw));
      try {
        const targetStats = await inspectPathInside(runtimeRoot, raw.target, "directory");
        if ((targetStats.mode & 0o777) !== raw.mode || raw.mode !== 0o700) {
          failures.push(`Protected Books directory permissions changed after cleanup: ${raw.target}`);
          continue;
        }
        directories.push(/** @type {PreservedDirectory} */ (raw));
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
      }
    }
  }
  const seenArtifacts = new Set();
  for (const raw of rawArtifacts) {
    if (
      !raw ||
      typeof raw !== "object" ||
      typeof raw.source !== "string" ||
      typeof raw.target !== "string" ||
      typeof raw.sha256 !== "string" ||
      typeof raw.mode !== "number" ||
      seenArtifacts.has(raw.target)
    ) {
      failures.push("Pre-cleanup preservation evidence contains a malformed artifact record.");
      continue;
    }
    seenArtifacts.add(raw.target);
    if (isProtectedKnowledgeArtifact(raw.target)) {
      expectedProtectedArtifacts.push(/** @type {PreservedArtifact} */ (raw));
    }
    const targetPath = resolveInside(runtimeRoot, raw.target);
    let targetStats;
    try {
      targetStats = await inspectPathInside(runtimeRoot, raw.target, "file");
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    if ((await sha256(targetPath)) !== raw.sha256) {
      failures.push(`Preserved Books artifact changed after cleanup: ${raw.target}`);
      continue;
    }
    if ((targetStats.mode & 0o777) !== raw.mode) {
      failures.push(`Preserved Books artifact mode changed after cleanup: ${raw.target}`);
      continue;
    }
    if (isProtectedKnowledgeArtifact(raw.target)) {
      const protectedDirectory = raw.target.split(path.sep)[0];
      const protectedDirectoryRecord = directories.find(
        (entry) => entry.target === protectedDirectory
      );
      if ((targetStats.mode & 0o777) !== 0o600 || !protectedDirectoryRecord) {
        failures.push(`Protected Books artifact permissions changed after cleanup: ${raw.target}`);
        continue;
      }
    }
    artifacts.push(/** @type {PreservedArtifact} */ (raw));
  }
  failures.push(
    ...(await verifyProtectedTargetSnapshot(
      mainWorktreePath,
      expectedProtectedArtifacts,
      expectedProtectedDirectories
    ))
  );
  return { artifacts, directories, failures };
}

/**
 * @param {string} relativePath
 * @returns {boolean}
 */
function isProtectedKnowledgeArtifact(relativePath) {
  if (!relativePath || path.isAbsolute(relativePath) || path.normalize(relativePath) !== relativePath) {
    return false;
  }
  const segments = relativePath.split(path.sep);
  if (segments.some((segment) => segment === "." || segment === "..")) {
    return false;
  }
  const firstSegment = segments[0];
  return PROTECTED_BOOKS_DIRECTORIES.includes(firstSegment);
}

/**
 * @param {string} output
 * @returns {string}
 */
function compactOutput(output) {
  const trimmed = output.trim();
  return trimmed.length <= 4000 ? trimmed : trimmed.slice(-4000);
}

/**
 * @param {string} mainWorktreePath
 * @param {string} expectedSha
 * @returns {string | null}
 */
function runFullMainQa(mainWorktreePath, expectedSha) {
  const result = runCommand(mainWorktreePath, "npm", ["run", "--silent", "qa:agent"], { allowFailure: true });
  if (result.status !== 0) {
    return `Full current-main QA failed: ${compactOutput(result.stderr || result.stdout) || "no output"}`;
  }
  if (getHeadSha(mainWorktreePath) !== expectedSha) {
    return "Full current-main QA changed canonical main HEAD.";
  }
  if (isGitDirty(mainWorktreePath)) {
    return "Full current-main QA left canonical main dirty.";
  }
  return null;
}

/**
 * @param {string} mainWorktreePath
 * @param {string} scriptName
 * @param {string} contextPath
 * @param {"pre_cleanup"|"post_cleanup"} phase
 * @param {import("./runtime.mjs").TaskState} state
 * @returns {{checks: VerificationCheck[], blocked: string[], notes: string[], runtimeSourcePaths: string[]}}
 */
function runRuntimeHook(mainWorktreePath, scriptName, contextPath, phase, state) {
  const packageJson = runCommand(mainWorktreePath, "node", ["-e", `const p=require('./package.json');process.exit(typeof p.scripts?.[${JSON.stringify(scriptName)}]==='string'?0:1)`], {
    allowFailure: true
  });
  if (packageJson.status !== 0) {
    throw new Error(`Missing required runtime verification script: ${scriptName}`);
  }
  const hook = runCommand(
    mainWorktreePath,
    "npm",
    ["run", "--silent", scriptName, "--", "--context", contextPath, "--phase", phase],
    { allowFailure: true }
  );
  if (hook.status !== 0) {
    throw new Error(`${scriptName} failed: ${compactOutput(hook.stderr || hook.stdout) || "no output"}`);
  }

  let payload;
  try {
    payload = JSON.parse(hook.stdout.trim());
  } catch (error) {
    throw new Error(`${scriptName} returned unreadable JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (payload.version !== 1 || payload.status !== "passed" || !Array.isArray(payload.checks) || payload.checks.length === 0) {
    throw new Error(`${scriptName} must return version=1, status=passed, and non-empty checks.`);
  }
  const checks = /** @type {Array<{id?: unknown, status?: unknown, details?: unknown}>} */ (payload.checks);
  if (checks.some((check) => !["passed", "not_applicable"].includes(String(check.status)))) {
    throw new Error(`${scriptName} returned a failed verification check.`);
  }
  const runtimeSourcePaths = Array.isArray(payload.runtimeSourcePaths) ? payload.runtimeSourcePaths.map(String) : [];
  if (runtimeSourcePaths.length === 0) {
    throw new Error(`${scriptName} must report runtimeSourcePaths.`);
  }
  const resolvedMain = canonicalPath(mainWorktreePath);
  const resolvedTask = canonicalPath(state.worktreePath);
  for (const sourcePath of runtimeSourcePaths) {
    const resolvedSource = canonicalPath(sourcePath);
    const mainRelation = path.relative(resolvedMain, resolvedSource);
    const taskRelation = path.relative(resolvedTask, resolvedSource);
    const insideMain = mainRelation === "" || (!mainRelation.startsWith("..") && !path.isAbsolute(mainRelation));
    const insideTask = taskRelation === "" || (!taskRelation.startsWith("..") && !path.isAbsolute(taskRelation));
    if (!insideMain || insideTask) {
      throw new Error(`Runtime source is not isolated to canonical main: ${sourcePath}`);
    }
  }
  return {
    checks: checks.map((check) => ({
      id: String(check.id ?? "unknown"),
      status: /** @type {VerificationCheck["status"]} */ (String(check.status)),
      details: String(check.details ?? "")
    })),
    blocked: Array.isArray(payload.blocked) ? payload.blocked.map(String) : [],
    notes: Array.isArray(payload.notes) ? payload.notes.map(String) : [],
    runtimeSourcePaths
  };
}

/**
 * @param {VerificationResult} result
 * @param {string} id
 * @param {string[]} failures
 * @param {string} passedDetails
 * @returns {void}
 */
function recordFailures(result, id, failures, passedDetails) {
  result.checks.push({
    id,
    status: failures.length === 0 ? "passed" : "failed",
    details: failures.length === 0 ? passedDetails : failures.join("; ")
  });
  result.blocked.push(...failures);
}

/**
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} state
 * @param {"pre_cleanup"|"post_cleanup"} phase
 * @returns {Promise<VerificationResult>}
 */
export async function runFinishVerification(repoRoot, state, phase) {
  const mainWorktreePath = state.mainWorktreePath ?? repoRoot;
  /** @type {VerificationResult} */
  const result = {
    phase,
    status: "failed",
    mainSha: existsSync(mainWorktreePath) ? getHeadSha(mainWorktreePath) : "",
    changedFiles: [],
    checks: [],
    blocked: [],
    notes: [],
    runtimeSourcePaths: [],
    preservedPaths: [],
    preservedArtifacts: [],
    preservedDirectories: [],
    artifactPreservation: null
  };

  try {
    const profile = await loadFinishProfile(mainWorktreePath);
    if (getCurrentBranch(mainWorktreePath) !== "main") {
      throw new Error(`Finish verification must run from canonical main: ${mainWorktreePath}`);
    }
    if (path.resolve(mainWorktreePath) === path.resolve(state.worktreePath)) {
      throw new Error("Task worktree must be distinct from canonical main.");
    }
    if (isGitDirty(mainWorktreePath)) {
      throw new Error("Finish verification requires a clean canonical main worktree.");
    }

    result.mainSha = getHeadSha(mainWorktreePath);
    result.changedFiles = getTaskChangedFiles(mainWorktreePath, state);

    if (phase === "pre_cleanup") {
      const taskFailures = [];
      if (!existsSync(state.worktreePath)) {
        taskFailures.push(`Exact task worktree is missing before cleanup: ${state.worktreePath}`);
      } else {
        if (getCurrentBranch(state.worktreePath) !== state.branch) {
          taskFailures.push(`Task worktree branch does not match state: ${state.branch}`);
        }
        if (getHeadSha(state.worktreePath) !== state.commitSha) {
          taskFailures.push(`Task worktree is not at recorded commitSha: ${state.commitSha}`);
        }
        if (isGitDirty(state.worktreePath)) {
          taskFailures.push("Task worktree is dirty before cleanup verification.");
        }
      }
      recordFailures(result, "exact_task_state", taskFailures, "Task worktree matches branch and commit state");

      const preservation = await preserveBooksRuntimeArtifacts(state.worktreePath, mainWorktreePath, state.taskId);
      result.artifactPreservation = preservation;
      const preservationVerification = await verifyBooksPreservation(state, mainWorktreePath, preservation);
      result.preservedArtifacts = preservationVerification.artifacts;
      result.preservedDirectories = preservationVerification.directories;
      result.preservedPaths = preservation.skippedReason === "missing_source"
        ? []
        : [{ path: BOOKS_RUNTIME_PATH, files: preservationVerification.artifacts.length }];
      recordFailures(
        result,
        "books_local_only_preservation",
        preservationVerification.failures,
        `${preservationVerification.artifacts.length} Books runtime artifacts verified by checksum`
      );

      const dependencies = await ensureDependencies(mainWorktreePath);
      result.checks.push({
        id: "main_dependency_fingerprint",
        status: "passed",
        details: `${dependencies.fingerprint}${dependencies.installed ? ` (${dependencies.reason})` : " (current)"}`
      });

      const successorMode = state.supersessionStatus === "superseded_verified";
      const trackedFailures = successorMode
        ? await verifyTrackedSuccessorLineage(repoRoot, mainWorktreePath, state, result.changedFiles)
        : verifyTrackedEquivalence(mainWorktreePath, state, result.changedFiles);
      recordFailures(
        result,
        successorMode ? "tracked_successor_lineage" : "tracked_main_equivalence",
        trackedFailures,
        successorMode
          ? `${result.changedFiles.length} task paths have a verified successor lineage`
          : state.equivalenceMode === "parallel_duplicate_commit"
          ? `${result.changedFiles.length} task paths match the explicit replacement commit in main`
          : `${result.changedFiles.length} task paths match canonical main Git objects`
      );

      if (result.blocked.length === 0 && state.equivalenceMode === "parallel_duplicate_commit") {
        const qaFailure = runFullMainQa(mainWorktreePath, result.mainSha);
        recordFailures(result, "full_current_main_qa", qaFailure ? [qaFailure] : [], `npm run qa:agent passed at ${result.mainSha}`);
      }
    } else {
      const cleanupFailures = [];
      if (state.mainVerificationStatus !== "passed" || state.mainVerificationSha !== result.mainSha) {
        cleanupFailures.push("Post-cleanup verification requires passed MAIN_VERIFY evidence at the current main SHA.");
      }
      if (existsSync(state.worktreePath)) {
        cleanupFailures.push(`Exact task worktree still exists: ${state.worktreePath}`);
      }
      const registered = (await getWorktreeList(mainWorktreePath)).some(
        (entry) => path.resolve(entry.path) === path.resolve(state.worktreePath)
      );
      if (registered) {
        cleanupFailures.push(`Exact task worktree is still registered: ${state.worktreePath}`);
      }
      const managedTaskRoot = path.resolve(getCodexHome(), "worktrees", state.taskId);
      if (existsSync(managedTaskRoot)) {
        cleanupFailures.push(`Managed task root still exists: ${managedTaskRoot}`);
      }
      const localBranch = runCommand(mainWorktreePath, "git", ["show-ref", "--verify", `refs/heads/${state.branch}`], {
        allowFailure: true
      });
      if (localBranch.status === 0) {
        cleanupFailures.push(`Local task branch still exists: ${state.branch}`);
      }
      recordFailures(result, "exact_cleanup_readback", cleanupFailures, "Worktree, registration, managed root, and local branch are absent");

      const dependencies = await ensureDependencies(mainWorktreePath);
      result.checks.push({
        id: "post_cleanup_dependency_fingerprint",
        status: "passed",
        details: `${dependencies.fingerprint}${dependencies.installed ? ` (${dependencies.reason})` : " (current)"}`
      });

      const preservationVerification = await verifyPreservedArtifactsAfterCleanup(repoRoot, state);
      result.preservedArtifacts = preservationVerification.artifacts;
      result.preservedDirectories = preservationVerification.directories;
      result.preservedPaths =
        preservationVerification.artifacts.length > 0 ||
        preservationVerification.directories.length > 0
        ? [{ path: BOOKS_RUNTIME_PATH, files: preservationVerification.artifacts.length }]
        : [];
      recordFailures(
        result,
        "post_cleanup_books_readback",
        preservationVerification.failures,
        `${preservationVerification.artifacts.length} preserved Books runtime artifacts remain readable`
      );
    }

    if (result.blocked.length === 0) {
      const artifactDir = getTaskArtifactsDir(repoRoot, state.taskId);
      await mkdir(artifactDir, { recursive: true });
      const contextPath = path.join(artifactDir, `finish-verification-${phase}.json`);
      await writeJson(contextPath, {
        version: 1,
        phase,
        taskId: state.taskId,
        branch: state.branch,
        baseSha: state.baseSha,
        commitSha: state.commitSha,
        equivalenceMode: state.equivalenceMode ?? null,
        replacementCommitSha: state.replacementCommitSha ?? null,
        supersessionMode: state.supersessionMode ?? null,
        supersessionStatus: state.supersessionStatus ?? null,
        supersessionManifestVersion: state.supersessionManifestVersion ?? null,
        supersessionManifestSha256: state.supersessionManifestSha256 ?? null,
        supersessionManifestRelativePath: state.supersessionManifestRelativePath ?? null,
        supersessionProofArtifactRelativePath: state.supersessionProofArtifactRelativePath ?? null,
        supersessionMainSha: state.supersessionMainSha ?? null,
        successorLineage: state.successorLineage ?? [],
        mainSha: result.mainSha,
        worktreePath: state.worktreePath,
        mainWorktreePath: canonicalPath(mainWorktreePath),
        changedFiles: result.changedFiles,
        preservedPaths: result.preservedPaths,
        preservedArtifacts: result.preservedArtifacts,
        preservedDirectories: result.preservedDirectories
      });
      const scriptName = phase === "pre_cleanup" ? profile.preCleanupScript : profile.postCleanupScript;
      const hook = runRuntimeHook(mainWorktreePath, scriptName, contextPath, phase, state);
      result.checks.push(...hook.checks);
      result.blocked.push(...hook.blocked);
      result.notes.push(...hook.notes);
      result.runtimeSourcePaths.push(...hook.runtimeSourcePaths);

      if (phase === "pre_cleanup" && result.artifactPreservation) {
        const postHookVerification = await verifyBooksPreservation(
          state,
          mainWorktreePath,
          result.artifactPreservation
        );
        const protectedSnapshotFailures = await verifyProtectedTargetSnapshot(
          mainWorktreePath,
          result.preservedArtifacts,
          result.preservedDirectories
        );
        recordFailures(
          result,
          "post_hook_books_preservation_readback",
          [...postHookVerification.failures, ...protectedSnapshotFailures],
          "Books runtime preservation remains exact after the pre-cleanup runtime hook"
        );
      }
      if (phase === "post_cleanup") {
        const postHookVerification = await verifyPreservedArtifactsAfterCleanup(repoRoot, state);
        recordFailures(
          result,
          "post_hook_books_cleanup_readback",
          postHookVerification.failures,
          "Books runtime preservation remains exact after the post-cleanup runtime hook"
        );
      }
    }

    if (isGitDirty(mainWorktreePath)) {
      result.blocked.push("Finish verification left canonical main dirty.");
    }
    if (getHeadSha(mainWorktreePath) !== result.mainSha) {
      result.blocked.push("Finish verification changed canonical main HEAD.");
    }
    result.status = result.blocked.length === 0 && result.checks.every((check) => check.status !== "failed")
      ? "passed"
      : "failed";
  } catch (error) {
    result.blocked.push(error instanceof Error ? error.message : String(error));
    result.status = "failed";
  }

  const artifactDir = getTaskArtifactsDir(repoRoot, state.taskId);
  await mkdir(artifactDir, { recursive: true });
  await writeFile(
    path.join(artifactDir, `finish-verification-${phase}-result.json`),
    `${JSON.stringify(result, null, 2)}\n`,
    "utf8"
  );
  return result;
}
