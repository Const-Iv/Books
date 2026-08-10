// @ts-check

import { createHash } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";

import {
  loadLegacyStateReconciliationManifest,
  proveLegacyStateReconciliation,
  revalidateLegacyStateReconciliation
} from "./legacy-state-reconciliation.mjs";
import {
  loadSuccessorLineageManifest,
  proveSuccessorLineage,
  proveSuccessorLineageRefresh
} from "./successor-lineage.mjs";
import {
  appendHistoryEvent,
  findMainWorktree,
  formatIso,
  getCurrentBranch,
  getHeadSha,
  getHistoryPath,
  getTaskArtifactsDir,
  isGitDirty,
  loadAllTaskStates,
  readJson,
  readNdjson,
  runCommand,
  saveTaskState,
  writeJson
} from "./runtime.mjs";

/**
 * @param {string} worktreePath
 * @param {string} expectedSha
 * @param {string} label
 * @returns {string}
 */
function runExactAcceptance(worktreePath, expectedSha, label) {
  if (!existsSync(worktreePath)) {
    throw new Error(`${label} acceptance requires an existing worktree: ${worktreePath}`);
  }
  if (getHeadSha(worktreePath) !== expectedSha || isGitDirty(worktreePath)) {
    throw new Error(`${label} acceptance requires a clean worktree at exact SHA ${expectedSha}.`);
  }
  const acceptance = runCommand(worktreePath, "npm", ["run", "--silent", "qa:agent"], { allowFailure: true });
  if (acceptance.status !== 0) {
    throw new Error(
      `${label} acceptance failed: ${(acceptance.stderr || acceptance.stdout).trim() || "no output"}`
    );
  }
  if (getHeadSha(worktreePath) !== expectedSha || isGitDirty(worktreePath)) {
    throw new Error(`${label} acceptance changed the exact worktree state.`);
  }
  return formatIso();
}

/**
 * @param {string} mainWorktreePath
 * @param {string} manifestPath
 * @returns {{absolutePath: string, relativePath: string}}
 */
function resolveIgnoredSuccessorManifest(mainWorktreePath, manifestPath) {
  const candidate = path.isAbsolute(manifestPath) ? manifestPath : path.resolve(process.cwd(), manifestPath);
  if (!existsSync(candidate)) {
    throw new Error(`Successor-lineage manifest does not exist: ${candidate}`);
  }
  const resolvedMain = realpathSync(mainWorktreePath);
  const resolvedManifest = realpathSync(candidate);
  const relativePath = path.relative(resolvedMain, resolvedManifest);
  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Successor-lineage manifest must be an ignored local file inside canonical main.");
  }
  const ignored = runCommand(mainWorktreePath, "git", ["check-ignore", "-q", "--no-index", "--", relativePath], {
    allowFailure: true
  });
  if (ignored.status !== 0) {
    throw new Error(`Successor-lineage manifest must be ignored by Git: ${relativePath}`);
  }
  return { absolutePath: resolvedManifest, relativePath };
}

/**
 * @param {string} mainWorktreePath
 * @param {string} manifestPath
 * @returns {{absolutePath: string, relativePath: string}}
 */
function resolveIgnoredLegacyReconciliationManifest(mainWorktreePath, manifestPath) {
  const candidate = path.isAbsolute(manifestPath) ? manifestPath : path.resolve(process.cwd(), manifestPath);
  if (!existsSync(candidate)) {
    throw new Error(`Legacy reconciliation manifest does not exist: ${candidate}`);
  }
  const resolvedMain = realpathSync(mainWorktreePath);
  const resolvedManifest = realpathSync(candidate);
  const relativePath = path.relative(resolvedMain, resolvedManifest);
  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Legacy reconciliation manifest must be an ignored local file inside canonical main.");
  }
  const ignored = runCommand(mainWorktreePath, "git", ["check-ignore", "-q", "--no-index", "--", relativePath], {
    allowFailure: true
  });
  if (ignored.status !== 0) {
    throw new Error(`Legacy reconciliation manifest must be ignored by Git: ${relativePath}`);
  }
  return { absolutePath: resolvedManifest, relativePath: relativePath.split(path.sep).join(path.posix.sep) };
}

/** @param {Record<string, unknown>} artifact */
function getLegacyProofDigest(artifact) {
  return createHash("sha256").update(JSON.stringify(artifact)).digest("hex");
}

/**
 * @param {string} artifactDir
 * @param {string} relativePath
 */
function resolveLegacyProofArtifactPath(artifactDir, relativePath) {
  const normalized = typeof relativePath === "string" ? path.posix.normalize(relativePath) : "";
  if (
    typeof relativePath !== "string" ||
    !relativePath ||
    path.posix.isAbsolute(relativePath) ||
    normalized !== relativePath ||
    relativePath === "." ||
    relativePath === ".." ||
    relativePath.startsWith("../") ||
    relativePath.split("/").includes("..") ||
    relativePath.includes("\\") ||
    relativePath.includes("\0")
  ) {
    throw new Error("Legacy reconciliation proof artifact path is unsafe.");
  }
  return path.join(artifactDir, relativePath);
}

/**
 * @param {string} filePath
 * @param {Record<string, unknown>} artifact
 */
async function writeImmutableLegacyProof(filePath, artifact) {
  if (existsSync(filePath)) {
    const existing = await readJson(filePath);
    if (JSON.stringify(existing) !== JSON.stringify(artifact)) {
      throw new Error(`Immutable legacy reconciliation proof already exists with different content: ${filePath}`);
    }
    return;
  }
  await writeJson(filePath, artifact);
}

/**
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} state
 * @param {string | null} manifestPath
 * @returns {Promise<boolean>}
 */
export async function maybeReconcileLegacyState(repoRoot, state, manifestPath) {
  if (!manifestPath) {
    return false;
  }
  if (!state.commitSha) {
    throw new Error("Legacy state reconciliation requires a recorded task commitSha.");
  }
  const stateRepoRoot = state.repoRoot || state.mainWorktreePath || repoRoot;
  const mainWorktreePath = state.mainWorktreePath ?? (await findMainWorktree(stateRepoRoot)) ?? stateRepoRoot;
  if (getCurrentBranch(mainWorktreePath) !== "main" || isGitDirty(mainWorktreePath)) {
    throw new Error("Legacy state reconciliation requires a clean canonical main worktree.");
  }
  if (!existsSync(state.worktreePath) || isGitDirty(state.worktreePath) || getHeadSha(state.worktreePath) !== state.commitSha) {
    throw new Error("Legacy state reconciliation requires a clean original task worktree at recorded commitSha.");
  }

  const resolvedManifest = resolveIgnoredLegacyReconciliationManifest(mainWorktreePath, manifestPath);
  const loaded = loadLegacyStateReconciliationManifest(resolvedManifest.absolutePath);
  if (
    state.legacyReconciliationManifestSha256 &&
    state.legacyReconciliationManifestSha256 !== loaded.sha256
  ) {
    throw new Error("Legacy reconciliation manifest changed after the first verified proof.");
  }
  const events = await readNdjson(getHistoryPath(stateRepoRoot));
  const artifactDir = getTaskArtifactsDir(stateRepoRoot, state.taskId);
  if (state.legacyReconciliationStatus === "legacy_state_reconciled") {
    const artifactRelativePath = state.legacyReconciliationProofArtifactRelativePath;
    if (!artifactRelativePath) {
      throw new Error("Legacy reconciliation retry requires a sealed proof artifact path in task state.");
    }
    const artifact = /** @type {import("./legacy-state-reconciliation.mjs").LegacyStateReconciliationProofArtifact | null} */ (
      await readJson(resolveLegacyProofArtifactPath(artifactDir, artifactRelativePath))
    );
    if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) {
      throw new Error("Legacy reconciliation retry requires the sealed proof artifact.");
    }
    const artifactDigest = getLegacyProofDigest(/** @type {Record<string, unknown>} */ (artifact));
    const expectedArtifactRelativePath = path.posix.join(
      "legacy-state-reconciliation-proofs",
      `${artifact.mainSha}-${loaded.sha256}-${artifactDigest}.json`
    );
    if (artifactRelativePath !== expectedArtifactRelativePath) {
      throw new Error("Legacy reconciliation proof artifact path does not match its sealed content.");
    }
    revalidateLegacyStateReconciliation(
      mainWorktreePath,
      state,
      loaded.manifest,
      events,
      artifact,
      { sha256: loaded.sha256, relativePath: resolvedManifest.relativePath },
      "HEAD"
    );
    return true;
  }

  const proof = proveLegacyStateReconciliation(mainWorktreePath, state, loaded.manifest, events, "HEAD");
  const verifiedAt = formatIso();
  const originalPublishStatus = /** @type {string} */ (state.publishStatus);
  const artifact = {
    version: 2,
    status: proof.status,
    taskId: state.taskId,
    branch: state.branch,
    taskCommitSha: proof.taskCommitSha,
    mainSha: proof.mainSha,
    manifestSha256: loaded.sha256,
    manifestRelativePath: resolvedManifest.relativePath,
    recoveredBaseSha: proof.recoveredBaseSha,
    recoveredStatus: proof.recoveredStatus,
    recoveredCleanupStatus: proof.recoveredCleanupStatus,
    originalPublishStatus,
    publishVerifiedMainSha: proof.publishVerifiedMainSha,
    recoveredFields: proof.recoveredFields,
    verifiedAt
  };
  const artifactDigest = getLegacyProofDigest(artifact);
  const artifactRelativePath = path.posix.join(
    "legacy-state-reconciliation-proofs",
    `${proof.mainSha}-${loaded.sha256}-${artifactDigest}.json`
  );
  await writeImmutableLegacyProof(resolveLegacyProofArtifactPath(artifactDir, artifactRelativePath), artifact);
  state.baseSha = proof.recoveredBaseSha;
  state.status = proof.recoveredStatus;
  state.cleanupStatus = proof.recoveredCleanupStatus;
  state.legacyReconciliationStatus = proof.status;
  state.legacyReconciliationManifestSha256 = loaded.sha256;
  state.legacyReconciliationManifestRelativePath = resolvedManifest.relativePath;
  state.legacyReconciliationProofArtifactRelativePath = artifactRelativePath;
  state.legacyReconciliationAt = verifiedAt;
  state.legacyReconciliationMainSha = proof.mainSha;
  state.legacyReconciliationPublishVerifiedMainSha = proof.publishVerifiedMainSha;
  state.legacyReconciliationOriginalPublishStatus = originalPublishStatus;
  state.legacyReconciliationFields = proof.recoveredFields;
  await saveTaskState(stateRepoRoot, state);

  await appendHistoryEvent(stateRepoRoot, {
    at: verifiedAt,
    type: "LEGACY_STATE_RECONCILE",
    taskId: state.taskId,
    branch: state.branch,
    payload: {
      status: proof.status,
      taskCommitSha: proof.taskCommitSha,
      mainSha: proof.mainSha,
      manifestSha256: loaded.sha256,
      manifestRelativePath: resolvedManifest.relativePath,
      recoveredBaseSha: proof.recoveredBaseSha,
      recoveredStatus: proof.recoveredStatus,
      recoveredCleanupStatus: proof.recoveredCleanupStatus,
      originalPublishStatus,
      publishVerifiedMainSha: proof.publishVerifiedMainSha,
      recoveredFields: proof.recoveredFields
    }
  });
  return true;
}

/**
 * @param {string} artifactDir
 * @param {string} relativePath
 * @returns {string}
 */
function resolveSuccessorProofArtifactPath(artifactDir, relativePath) {
  if (
    typeof relativePath !== "string" ||
    !relativePath ||
    path.posix.isAbsolute(relativePath) ||
    relativePath === "." ||
    relativePath === ".." ||
    relativePath.startsWith("../") ||
    relativePath.includes("\\") ||
    relativePath.includes("\0")
  ) {
    throw new Error("Successor-lineage proof artifact path is unsafe.");
  }
  return path.join(artifactDir, relativePath);
}

/**
 * @param {Record<string, unknown>} artifact
 * @param {import("./runtime.mjs").TaskState} state
 * @param {{sha256: string, relativePath: string}} seal
 */
function assertSuccessorProofArtifactMatchesState(artifact, state, seal) {
  const originalAcceptance =
    artifact.originalAcceptance && typeof artifact.originalAcceptance === "object"
      ? /** @type {Record<string, unknown>} */ (artifact.originalAcceptance)
      : null;
  const currentMainAcceptance =
    artifact.currentMainAcceptance && typeof artifact.currentMainAcceptance === "object"
      ? /** @type {Record<string, unknown>} */ (artifact.currentMainAcceptance)
      : null;
  if (
    artifact.status !== "superseded_verified" ||
    artifact.taskId !== state.taskId ||
    artifact.taskCommitSha !== state.commitSha ||
    (artifact.manifestVersion ?? 1) !== (state.supersessionManifestVersion ?? 1) ||
    artifact.mainSha !== state.supersessionMainSha ||
    artifact.manifestSha256 !== seal.sha256 ||
    artifact.manifestRelativePath !== seal.relativePath ||
    JSON.stringify(artifact.successors ?? []) !== JSON.stringify(state.successorLineage ?? []) ||
    originalAcceptance?.status !== state.originalAcceptanceStatus ||
    originalAcceptance?.sha !== state.originalAcceptanceTaskSha ||
    currentMainAcceptance?.status !== state.successorAcceptanceStatus ||
    currentMainAcceptance?.sha !== state.successorAcceptanceMainSha
  ) {
    throw new Error("Successor-lineage proof artifact does not match the sealed task state.");
  }
}

/**
 * @param {string} artifactDir
 * @param {import("./runtime.mjs").TaskState} state
 * @param {import("./runtime.mjs").HistoryEvent[]} events
 * @returns {Promise<void>}
 */
async function assertArchivedSuccessorProofHistory(artifactDir, state, events) {
  const records = state.supersessionProofHistory ?? [];
  const refreshEvents = events.filter(
    (event) =>
      event.taskId === state.taskId &&
      event.type === "SUCCESSOR_LINEAGE_REFRESH" &&
      event.payload.status === "passed"
  );
  if (records.length !== refreshEvents.length) {
    throw new Error("Successor-lineage archived proof history does not match append-only refresh events.");
  }
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const event = refreshEvents[index];
    const nextRecord = records[index + 1];
    if (
      event.payload.fromMainSha !== record.mainSha ||
      event.payload.fromManifestSha256 !== record.manifestSha256 ||
      event.payload.fromManifestRelativePath !== record.manifestRelativePath ||
      event.payload.fromArtifactRelativePath !== record.artifactRelativePath ||
      event.payload.toMainSha !== (nextRecord?.mainSha ?? state.supersessionMainSha) ||
      event.payload.toManifestSha256 !== (nextRecord?.manifestSha256 ?? state.supersessionManifestSha256)
    ) {
      throw new Error("Successor-lineage archived proof history contains a broken transition.");
    }
    const artifact = await readJson(
      resolveSuccessorProofArtifactPath(artifactDir, record.artifactRelativePath)
    );
    if (
      !artifact ||
      typeof artifact !== "object" ||
      Array.isArray(artifact) ||
      artifact.status !== "superseded_verified" ||
      artifact.taskId !== state.taskId ||
      artifact.taskCommitSha !== state.commitSha ||
      (artifact.manifestVersion ?? 1) !== (state.supersessionManifestVersion ?? 1) ||
      artifact.mainSha !== record.mainSha ||
      artifact.manifestSha256 !== record.manifestSha256 ||
      artifact.manifestRelativePath !== record.manifestRelativePath
    ) {
      throw new Error("Successor-lineage archived proof artifact does not match its history record.");
    }
  }
}

/**
 * @param {string} filePath
 * @param {Record<string, unknown>} payload
 * @returns {Promise<void>}
 */
async function writeImmutableSuccessorProof(filePath, payload) {
  if (existsSync(filePath)) {
    const existing = await readJson(filePath);
    if (JSON.stringify(existing) !== JSON.stringify(payload)) {
      throw new Error(`Immutable successor-lineage proof artifact already exists with different content: ${filePath}`);
    }
    return;
  }
  await writeJson(filePath, payload);
}

/**
 * @param {ReturnType<typeof proveSuccessorLineage>} proof
 * @param {import("./runtime.mjs").TaskState} state
 * @param {{sha256: string, relativePath: string}} seal
 * @returns {Record<string, unknown>}
 */
function buildSuccessorProofArtifact(proof, state, seal) {
  return {
    version: 2,
    status: proof.status,
    manifestVersion: proof.manifestVersion,
    taskId: state.taskId,
    taskCommitSha: proof.taskCommitSha,
    mainSha: proof.mainSha,
    manifestSha256: seal.sha256,
    manifestRelativePath: seal.relativePath,
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
}

/**
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} state
 * @param {string | null} manifestPath
 * @param {boolean} refresh
 * @returns {Promise<boolean>}
 */
export async function maybeSkipSuccessorPublish(repoRoot, state, manifestPath, refresh) {
  if (!manifestPath) {
    return false;
  }
  if (!state.commitSha) {
    throw new Error("Successor-lineage cleanup requires a recorded task commitSha.");
  }

  const stateRepoRoot = state.repoRoot || state.mainWorktreePath || repoRoot;
  const mainWorktreePath = state.mainWorktreePath ?? (await findMainWorktree(stateRepoRoot)) ?? stateRepoRoot;
  if (getCurrentBranch(mainWorktreePath) !== "main") {
    throw new Error(`Successor-lineage cleanup requires canonical main: ${mainWorktreePath}`);
  }
  if (isGitDirty(mainWorktreePath)) {
    throw new Error("Successor-lineage cleanup requires a clean canonical main worktree.");
  }
  if (!existsSync(state.worktreePath) || isGitDirty(state.worktreePath) || getHeadSha(state.worktreePath) !== state.commitSha) {
    throw new Error("Successor-lineage cleanup requires a clean original task worktree at recorded commitSha.");
  }

  const resolvedManifest = resolveIgnoredSuccessorManifest(mainWorktreePath, manifestPath);
  const loaded = loadSuccessorLineageManifest(resolvedManifest.absolutePath);
  if (!refresh && state.supersessionManifestSha256 && state.supersessionManifestSha256 !== loaded.sha256) {
    throw new Error("Successor-lineage manifest changed after the first verified proof.");
  }
  const taskStates = await loadAllTaskStates(stateRepoRoot);
  const finishProfile = await readJson(path.join(mainWorktreePath, ".memory-bank/finish-profile.json"));
  const allowedDirectPaths =
    finishProfile &&
    typeof finishProfile === "object" &&
    !Array.isArray(finishProfile) &&
    finishProfile.version === 1 &&
    finishProfile.mode === "process-only" &&
    Array.isArray(finishProfile.allowedChangedPaths)
      ? finishProfile.allowedChangedPaths.filter((/** @type {unknown} */ value) => typeof value === "string")
      : [];
  const artifactDir = getTaskArtifactsDir(stateRepoRoot, state.taskId);
  /** @type {ReturnType<typeof proveSuccessorLineage>} */
  let proof;
  /** @type {null | {mainSha: string, manifestSha256: string, manifestRelativePath: string, verifiedAt: string | null, artifactRelativePath: string}} */
  let archivedPreviousProof = null;
  if (refresh) {
    if (
      !state.supersessionManifestSha256 ||
      !state.supersessionManifestRelativePath ||
      !state.supersessionMainSha ||
      !state.supersessionProofArtifactRelativePath
    ) {
      throw new Error("Successor-lineage refresh requires a complete previous sealed proof.");
    }
    const previousResolved = resolveIgnoredSuccessorManifest(
      mainWorktreePath,
      path.join(mainWorktreePath, state.supersessionManifestRelativePath)
    );
    const previousLoaded = loadSuccessorLineageManifest(previousResolved.absolutePath);
    if (previousLoaded.sha256 !== state.supersessionManifestSha256) {
      throw new Error("Successor-lineage previous manifest changed after acceptance.");
    }
    const previousArtifact = await readJson(
      resolveSuccessorProofArtifactPath(artifactDir, state.supersessionProofArtifactRelativePath)
    );
    if (!previousArtifact || typeof previousArtifact !== "object" || Array.isArray(previousArtifact)) {
      throw new Error("Successor-lineage refresh requires the previous sealed proof artifact.");
    }
    assertSuccessorProofArtifactMatchesState(previousArtifact, state, {
      sha256: previousLoaded.sha256,
      relativePath: previousResolved.relativePath
    });
    const history = await readNdjson(getHistoryPath(stateRepoRoot));
    await assertArchivedSuccessorProofHistory(artifactDir, state, history);
    const previousHistoryEvent = [...history].reverse().find(
      (event) =>
        event.taskId === state.taskId &&
        event.type === "PUBLISH_SKIP" &&
        event.payload.mainSha === state.supersessionMainSha &&
        event.payload.manifestSha256 === state.supersessionManifestSha256 &&
        event.payload.supersessionStatus === "superseded_verified"
    );
    if (!previousHistoryEvent) {
      throw new Error("Successor-lineage refresh requires matching append-only acceptance history.");
    }
    const refreshedProof = proveSuccessorLineageRefresh(
      mainWorktreePath,
      state,
      {
        manifest: previousLoaded.manifest,
        sha256: previousLoaded.sha256,
        relativePath: previousResolved.relativePath
      },
      {
        manifest: loaded.manifest,
        sha256: loaded.sha256,
        relativePath: resolvedManifest.relativePath
      },
      taskStates,
      "HEAD",
      { allowedDirectPaths }
    );
    proof = refreshedProof.nextProof;
    const previousArchiveRelativePath = path.posix.join(
      "successor-lineage-proofs",
      `${refreshedProof.previousProof.mainSha}-${previousLoaded.sha256}.json`
    );
    await writeImmutableSuccessorProof(
      resolveSuccessorProofArtifactPath(artifactDir, previousArchiveRelativePath),
      previousArtifact
    );
    archivedPreviousProof = {
      mainSha: refreshedProof.previousProof.mainSha,
      manifestSha256: previousLoaded.sha256,
      manifestRelativePath: previousResolved.relativePath,
      verifiedAt: state.supersessionVerifiedAt ?? null,
      artifactRelativePath: previousArchiveRelativePath
    };
    if (
      (state.supersessionProofHistory ?? []).some(
        (entry) =>
          entry.mainSha === archivedPreviousProof?.mainSha ||
          entry.manifestSha256 === archivedPreviousProof?.manifestSha256 ||
          entry.manifestRelativePath === archivedPreviousProof?.manifestRelativePath
      )
    ) {
      throw new Error("Successor-lineage refresh history already contains the active previous seal.");
    }
  } else {
    proof = proveSuccessorLineage(mainWorktreePath, state, loaded.manifest, taskStates, "HEAD", {
      allowedDirectPaths
    });
  }
  const originalAcceptanceAt = runExactAcceptance(state.worktreePath, proof.taskCommitSha, "Original task");
  const successorAcceptanceAt = runExactAcceptance(mainWorktreePath, proof.mainSha, "Successor current-main");
  if (getHeadSha(mainWorktreePath) !== proof.mainSha) {
    throw new Error("Canonical main changed during successor-lineage acceptance.");
  }

  const verifiedAt = formatIso();
  const proofArtifact = buildSuccessorProofArtifact(proof, state, {
    sha256: loaded.sha256,
    relativePath: resolvedManifest.relativePath
  });
  const immutableProofRelativePath = path.posix.join(
    "successor-lineage-proofs",
    `${proof.mainSha}-${loaded.sha256}.json`
  );
  await writeImmutableSuccessorProof(
    resolveSuccessorProofArtifactPath(artifactDir, immutableProofRelativePath),
    proofArtifact
  );
  state.supersessionMode = "declared_successor_lineage";
  state.supersessionStatus = "superseded_verified";
  state.supersessionManifestVersion = proof.manifestVersion;
  state.supersessionManifestSha256 = loaded.sha256;
  state.supersessionManifestRelativePath = resolvedManifest.relativePath;
  state.supersessionProofArtifactRelativePath = immutableProofRelativePath;
  if (archivedPreviousProof) {
    state.supersessionProofHistory = [...(state.supersessionProofHistory ?? []), archivedPreviousProof];
  }
  state.supersessionVerifiedAt = verifiedAt;
  state.supersessionMainSha = proof.mainSha;
  state.successorLineage = proof.successors;
  state.originalAcceptanceStatus = "passed";
  state.originalAcceptanceTaskSha = proof.taskCommitSha;
  state.originalAcceptanceAt = originalAcceptanceAt;
  state.originalAcceptanceCommand = "npm run qa:agent";
  state.successorAcceptanceStatus = "passed";
  state.successorAcceptanceMainSha = proof.mainSha;
  state.successorAcceptanceAt = successorAcceptanceAt;
  state.successorAcceptanceCommand = "npm run qa:agent";
  state.publishStatus = "skipped_successor_cleanup_only";
  await saveTaskState(stateRepoRoot, state);

  await writeJson(path.join(artifactDir, "successor-lineage-proof.json"), proofArtifact);
  if (archivedPreviousProof) {
    await appendHistoryEvent(stateRepoRoot, {
      at: verifiedAt,
      type: "SUCCESSOR_LINEAGE_REFRESH",
      taskId: state.taskId,
      branch: state.branch,
      payload: {
        fromMainSha: archivedPreviousProof.mainSha,
        fromManifestSha256: archivedPreviousProof.manifestSha256,
        fromManifestRelativePath: archivedPreviousProof.manifestRelativePath,
        fromArtifactRelativePath: archivedPreviousProof.artifactRelativePath,
        toMainSha: proof.mainSha,
        toManifestSha256: loaded.sha256,
        toManifestRelativePath: resolvedManifest.relativePath,
        toArtifactRelativePath: immutableProofRelativePath,
        status: "passed"
      }
    });
  }
  await appendHistoryEvent(stateRepoRoot, {
    at: verifiedAt,
    type: "PUBLISH_SKIP",
    taskId: state.taskId,
    branch: state.branch,
    payload: {
      reason: "declared successor records fully account for rewritten original task paths",
      supersessionStatus: state.supersessionStatus,
      manifestVersion: proof.manifestVersion,
      commitSha: proof.taskCommitSha,
      mainSha: proof.mainSha,
      manifestSha256: loaded.sha256,
      rewrittenPaths: proof.rewrittenPaths,
      successorTaskIds: proof.successorTaskIds,
      successorCommitShas: proof.successorCommitShas,
      approvedDirectMainCommitShas: proof.approvedDirectMainCommitShas,
      originalAcceptanceCommand: state.originalAcceptanceCommand,
      currentMainAcceptanceCommand: state.successorAcceptanceCommand,
      publishStatus: state.publishStatus
    }
  });
  return true;
}
