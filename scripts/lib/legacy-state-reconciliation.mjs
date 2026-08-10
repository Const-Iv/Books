// @ts-check

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { runCommand } from "./runtime.mjs";

const FINAL_PUBLISH_STATUSES = new Set(["pushed", "local-only"]);
const RECOVERABLE_FIELD_SETS = new Set([
  JSON.stringify(["baseSha"]),
  JSON.stringify(["status", "cleanupStatus"]),
  JSON.stringify(["baseSha", "status", "cleanupStatus"])
]);

/**
 * @typedef {{
 *   version: 1,
 *   taskId: string,
 *   taskCommitSha: string,
 *   mainSha: string,
 *   recoveredBaseSha: string,
 *   targetStatus: "finished",
 *   targetCleanupStatus: "kept"|"failed"
 * }} LegacyStateReconciliationManifest
 */

/**
 * @typedef {{
 *   version: 2,
 *   status: "legacy_state_reconciled",
 *   taskId: string,
 *   branch: string,
 *   taskCommitSha: string,
 *   mainSha: string,
 *   manifestSha256: string,
 *   manifestRelativePath: string,
 *   recoveredBaseSha: string,
 *   recoveredStatus: "finished",
 *   recoveredCleanupStatus: "kept"|"failed",
 *   originalPublishStatus: string,
 *   publishVerifiedMainSha: string|null,
 *   recoveredFields: string[],
 *   verifiedAt: string
 * }} LegacyStateReconciliationProofArtifact
 */

/**
 * @param {string} filePath
 * @returns {{manifest: LegacyStateReconciliationManifest, sha256: string}}
 */
export function loadLegacyStateReconciliationManifest(filePath) {
  const raw = readFileSync(filePath);
  let payload;
  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch (error) {
    throw new Error(
      `Legacy reconciliation manifest is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  return {
    manifest: /** @type {LegacyStateReconciliationManifest} */ (payload),
    sha256: createHash("sha256").update(raw).digest("hex")
  };
}

/** @param {string} value @param {string} label */
function assertExactSha(value, label) {
  if (!/^[0-9a-f]{40}$/.test(value)) {
    throw new Error(`${label} must be an exact lowercase 40-character commit SHA.`);
  }
}

/** @param {string} repoRoot @param {string} sha @param {string} label */
function assertReadableCommit(repoRoot, sha, label) {
  assertExactSha(sha, label);
  const result = runCommand(repoRoot, "git", ["rev-parse", "--verify", `${sha}^{commit}`], { allowFailure: true });
  if (result.status !== 0 || result.stdout.trim() !== sha) {
    throw new Error(`${label} is not a readable exact commit: ${sha}`);
  }
}

/** @param {string} repoRoot @param {string} ancestor @param {string} descendant */
function isAncestor(repoRoot, ancestor, descendant) {
  return runCommand(repoRoot, "git", ["merge-base", "--is-ancestor", ancestor, descendant], {
    allowFailure: true
  }).status === 0;
}

/** @param {string} repoRoot @param {string} commitSha */
function getParents(repoRoot, commitSha) {
  return runCommand(repoRoot, "git", ["rev-list", "--parents", "-n", "1", commitSha])
    .stdout.trim()
    .split(/\s+/)
    .slice(1);
}

/**
 * Prove that an already-recorded task base reaches the exact task tip through
 * one non-empty chain whose every commit has exactly one parent. This rejects
 * merge ancestry instead of treating a broad ancestor relationship as enough.
 *
 * @param {string} repoRoot
 * @param {string} baseSha
 * @param {string} taskCommitSha
 */
function assertLinearRecordedTaskChain(repoRoot, baseSha, taskCommitSha) {
  if (baseSha === taskCommitSha || !isAncestor(repoRoot, baseSha, taskCommitSha)) {
    throw new Error("Legacy reconciliation existing baseSha must be a strict ancestor of taskCommitSha.");
  }

  let currentSha = taskCommitSha;
  while (currentSha !== baseSha) {
    const parents = getParents(repoRoot, currentSha);
    if (parents.length !== 1) {
      throw new Error(
        "Legacy reconciliation existing baseSha must reach taskCommitSha through a linear single-parent chain."
      );
    }
    currentSha = parents[0];
  }
}

/**
 * Find one ordered publish tuple for the same task attempt. A later merge event
 * starts a new attempt, so an older push cannot be paired with it.
 *
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").HistoryEvent[]} events
 * @param {import("./runtime.mjs").TaskState} state
 * @param {string} currentMainSha
 * @returns {string|null}
 */
function findOrderedPublishVerification(repoRoot, events, state, currentMainSha) {
  const scoped = events
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => event.taskId === state.taskId && event.branch === state.branch);
  const mergePositions = scoped.filter(
    ({ event }) => event.type === "MERGE_MAIN" && event.payload.mergedCommitSha === state.commitSha
  );

  for (let mergeOffset = mergePositions.length - 1; mergeOffset >= 0; mergeOffset -= 1) {
    const merge = mergePositions[mergeOffset];
    const nextMerge = scoped.find(({ event, index }) => event.type === "MERGE_MAIN" && index > merge.index);
    const attemptEnd = nextMerge?.index ?? Number.POSITIVE_INFINITY;
    const push = scoped.find(
      ({ event, index }) =>
        event.type === "PUSH_MAIN" &&
        index > merge.index &&
        index < attemptEnd &&
        event.payload.publishStatus === state.publishStatus
    );
    if (!push) {
      continue;
    }
    const verify = scoped.find(({ event, index }) => {
      const eventMainSha = typeof event.payload.mainSha === "string" ? event.payload.mainSha : "";
      return (
        event.type === "MAIN_VERIFY" &&
        index > push.index &&
        index < attemptEnd &&
        event.payload.status === "passed" &&
        /^[0-9a-f]{40}$/.test(eventMainSha) &&
        isAncestor(repoRoot, state.commitSha ?? "", eventMainSha) &&
        isAncestor(repoRoot, eventMainSha, currentMainSha)
      );
    });
    if (verify) {
      return /** @type {string} */ (verify.event.payload.mainSha);
    }
  }
  return null;
}

/**
 * Prove a narrow legacy task-state repair. This function never mutates state.
 *
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} state
 * @param {LegacyStateReconciliationManifest} manifest
 * @param {import("./runtime.mjs").HistoryEvent[]} events
 * @param {string} [mainRef]
 */
export function proveLegacyStateReconciliation(repoRoot, state, manifest, events, mainRef = "HEAD") {
  if (!manifest || typeof manifest !== "object" || manifest.version !== 1) {
    throw new Error("Legacy reconciliation manifest must use version=1.");
  }
  if (manifest.taskId !== state.taskId) {
    throw new Error(`Legacy reconciliation manifest taskId does not match task state: ${manifest.taskId}`);
  }
  if (!state.commitSha || manifest.taskCommitSha !== state.commitSha) {
    throw new Error("Legacy reconciliation manifest taskCommitSha does not match recorded task state.");
  }
  assertReadableCommit(repoRoot, manifest.taskCommitSha, "Legacy reconciliation taskCommitSha");
  assertReadableCommit(repoRoot, manifest.mainSha, "Legacy reconciliation mainSha");
  assertReadableCommit(repoRoot, manifest.recoveredBaseSha, "Legacy reconciliation recoveredBaseSha");

  const currentMainSha = runCommand(repoRoot, "git", ["rev-parse", `${mainRef}^{commit}`]).stdout.trim();
  if (manifest.mainSha !== currentMainSha) {
    throw new Error(`Legacy reconciliation manifest must bind the exact main SHA: expected ${currentMainSha}`);
  }
  if (!isAncestor(repoRoot, state.commitSha, currentMainSha)) {
    throw new Error("Legacy reconciliation task commit is not contained in exact main.");
  }
  if (state.qaLastPassSha !== state.commitSha || state.previewPreparedSha !== state.commitSha) {
    throw new Error("Legacy reconciliation requires exact task QA and preview checkpoints.");
  }
  if (!FINAL_PUBLISH_STATUSES.has(state.publishStatus ?? "")) {
    throw new Error("Legacy reconciliation requires a successful terminal publishStatus.");
  }

  if (!state.baseSha) {
    const parents = getParents(repoRoot, state.commitSha);
    if (parents.length !== 1 || manifest.recoveredBaseSha !== parents[0]) {
      throw new Error("Legacy reconciliation recoveredBaseSha must equal the sole parent of taskCommitSha.");
    }
  } else {
    assertReadableCommit(repoRoot, state.baseSha, "Legacy reconciliation existing baseSha");
    if (manifest.recoveredBaseSha !== state.baseSha) {
      throw new Error("Legacy reconciliation recoveredBaseSha must match the existing recorded baseSha.");
    }
    assertLinearRecordedTaskChain(repoRoot, state.baseSha, state.commitSha);
  }

  /** @type {string[]} */
  const recoveredFields = [];
  /** @type {string | null} */
  let publishVerifiedMainSha = null;
  if (!state.baseSha) {
    recoveredFields.push("baseSha");
  }

  if (manifest.targetStatus !== "finished") {
    throw new Error("Legacy reconciliation targetStatus must be finished.");
  }
  if (!new Set(["kept", "failed"]).has(manifest.targetCleanupStatus)) {
    throw new Error("Legacy reconciliation targetCleanupStatus must be kept or failed.");
  }

  if (state.status === "finished") {
    if (!state.cleanupStatus || !new Set(["kept", "failed"]).has(state.cleanupStatus)) {
      throw new Error("Finished legacy state requires an existing terminal cleanup status.");
    }
    if (manifest.targetCleanupStatus !== state.cleanupStatus) {
      throw new Error("Legacy reconciliation cannot rewrite a terminal cleanup status.");
    }
  } else if (state.status === "merged") {
    if (state.cleanupStatus) {
      throw new Error("Merged legacy state with an existing cleanup status is ambiguous.");
    }
    if (manifest.targetCleanupStatus !== "failed") {
      throw new Error("Merged legacy state must recover cleanupStatus as failed.");
    }
    publishVerifiedMainSha = findOrderedPublishVerification(repoRoot, events, state, currentMainSha);
    if (!publishVerifiedMainSha) {
      throw new Error(
        "Merged legacy reconciliation requires one ordered MERGE_MAIN -> PUSH_MAIN -> passed MAIN_VERIFY tuple."
      );
    }
    recoveredFields.push("status", "cleanupStatus");
  } else {
    throw new Error(`Legacy reconciliation does not support task status: ${state.status}`);
  }

  if (recoveredFields.length === 0) {
    throw new Error("Legacy reconciliation is unnecessary because no supported field is missing.");
  }

  return {
    status: /** @type {const} */ ("legacy_state_reconciled"),
    taskCommitSha: state.commitSha,
    mainSha: currentMainSha,
    recoveredBaseSha: manifest.recoveredBaseSha,
    recoveredStatus: manifest.targetStatus,
    recoveredCleanupStatus: manifest.targetCleanupStatus,
    publishVerifiedMainSha,
    recoveredFields
  };
}

/**
 * Revalidate an already-applied reconciliation seal before a retry continues.
 * The synthetic state recreates only the fields that the original proof was
 * allowed to repair, then reruns that proof against the sealed main commit.
 *
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} state
 * @param {LegacyStateReconciliationManifest} manifest
 * @param {import("./runtime.mjs").HistoryEvent[]} events
 * @param {LegacyStateReconciliationProofArtifact} artifact
 * @param {{sha256: string, relativePath: string}} manifestSeal
 * @param {string} [currentMainRef]
 */
export function revalidateLegacyStateReconciliation(
  repoRoot,
  state,
  manifest,
  events,
  artifact,
  manifestSeal,
  currentMainRef = "HEAD"
) {
  if (!artifact || typeof artifact !== "object" || artifact.version !== 2) {
    throw new Error("Legacy reconciliation retry requires a version=2 immutable proof artifact.");
  }
  if (!RECOVERABLE_FIELD_SETS.has(JSON.stringify(artifact.recoveredFields))) {
    throw new Error("Legacy reconciliation proof contains an unsupported recoveredFields set.");
  }
  const expectedArtifactFields = {
    status: "legacy_state_reconciled",
    taskId: state.taskId,
    branch: state.branch,
    taskCommitSha: state.commitSha,
    mainSha: manifest.mainSha,
    manifestSha256: manifestSeal.sha256,
    manifestRelativePath: manifestSeal.relativePath,
    recoveredBaseSha: manifest.recoveredBaseSha,
    recoveredStatus: manifest.targetStatus,
    recoveredCleanupStatus: manifest.targetCleanupStatus
  };
  const actualArtifactFields = {
    status: artifact.status,
    taskId: artifact.taskId,
    branch: artifact.branch,
    taskCommitSha: artifact.taskCommitSha,
    mainSha: artifact.mainSha,
    manifestSha256: artifact.manifestSha256,
    manifestRelativePath: artifact.manifestRelativePath,
    recoveredBaseSha: artifact.recoveredBaseSha,
    recoveredStatus: artifact.recoveredStatus,
    recoveredCleanupStatus: artifact.recoveredCleanupStatus
  };
  if (JSON.stringify(actualArtifactFields) !== JSON.stringify(expectedArtifactFields)) {
    throw new Error("Legacy reconciliation immutable proof does not match task or manifest identity.");
  }
  if (!FINAL_PUBLISH_STATUSES.has(artifact.originalPublishStatus)) {
    throw new Error("Legacy reconciliation proof has an invalid originalPublishStatus.");
  }
  if (
    state.baseSha !== artifact.recoveredBaseSha ||
    state.status !== artifact.recoveredStatus ||
    state.cleanupStatus !== artifact.recoveredCleanupStatus ||
    state.qaLastPassSha !== artifact.taskCommitSha ||
    state.previewPreparedSha !== artifact.taskCommitSha
  ) {
    throw new Error("Legacy reconciliation retry state no longer matches the sealed recovered values.");
  }
  const successorPublish =
    state.publishStatus === "skipped_successor_cleanup_only" &&
    state.supersessionStatus === "superseded_verified" &&
    state.originalAcceptanceTaskSha === state.commitSha;
  if (state.publishStatus !== artifact.originalPublishStatus && !successorPublish) {
    throw new Error("Legacy reconciliation retry publishStatus is not an allowed sealed transition.");
  }
  if (
    state.legacyReconciliationStatus !== artifact.status ||
    state.legacyReconciliationManifestSha256 !== artifact.manifestSha256 ||
    state.legacyReconciliationManifestRelativePath !== artifact.manifestRelativePath ||
    state.legacyReconciliationAt !== artifact.verifiedAt ||
    state.legacyReconciliationMainSha !== artifact.mainSha ||
    state.legacyReconciliationPublishVerifiedMainSha !== artifact.publishVerifiedMainSha ||
    state.legacyReconciliationOriginalPublishStatus !== artifact.originalPublishStatus ||
    JSON.stringify(state.legacyReconciliationFields) !== JSON.stringify(artifact.recoveredFields)
  ) {
    throw new Error("Legacy reconciliation retry state seal does not match the immutable proof.");
  }

  const expectedHistoryPayload = {
    status: artifact.status,
    taskCommitSha: artifact.taskCommitSha,
    mainSha: artifact.mainSha,
    manifestSha256: artifact.manifestSha256,
    manifestRelativePath: artifact.manifestRelativePath,
    recoveredBaseSha: artifact.recoveredBaseSha,
    recoveredStatus: artifact.recoveredStatus,
    recoveredCleanupStatus: artifact.recoveredCleanupStatus,
    originalPublishStatus: artifact.originalPublishStatus,
    publishVerifiedMainSha: artifact.publishVerifiedMainSha,
    recoveredFields: artifact.recoveredFields
  };
  const matchingHistory = events.filter(
    (event) =>
      event.at === artifact.verifiedAt &&
      event.type === "LEGACY_STATE_RECONCILE" &&
      event.taskId === artifact.taskId &&
      event.branch === artifact.branch &&
      JSON.stringify(event.payload) === JSON.stringify(expectedHistoryPayload)
  );
  if (matchingHistory.length !== 1) {
    throw new Error("Legacy reconciliation retry requires one exact append-only reconciliation event.");
  }

  assertReadableCommit(repoRoot, artifact.mainSha, "Legacy reconciliation sealed mainSha");
  const currentMainSha = runCommand(repoRoot, "git", ["rev-parse", `${currentMainRef}^{commit}`]).stdout.trim();
  if (!isAncestor(repoRoot, artifact.mainSha, currentMainSha)) {
    throw new Error("Legacy reconciliation sealed mainSha must remain an ancestor of current main.");
  }
  if (!isAncestor(repoRoot, artifact.taskCommitSha, artifact.mainSha)) {
    throw new Error("Legacy reconciliation task commit is not contained in sealed main.");
  }

  const syntheticState = { ...state, publishStatus: artifact.originalPublishStatus };
  if (artifact.recoveredFields.includes("baseSha")) {
    syntheticState.baseSha = null;
  }
  if (artifact.recoveredFields.includes("status")) {
    syntheticState.status = "merged";
    syntheticState.cleanupStatus = null;
  }
  const reproof = proveLegacyStateReconciliation(repoRoot, syntheticState, manifest, events, artifact.mainSha);
  const expectedReproof = {
    status: artifact.status,
    taskCommitSha: artifact.taskCommitSha,
    mainSha: artifact.mainSha,
    recoveredBaseSha: artifact.recoveredBaseSha,
    recoveredStatus: artifact.recoveredStatus,
    recoveredCleanupStatus: artifact.recoveredCleanupStatus,
    publishVerifiedMainSha: artifact.publishVerifiedMainSha,
    recoveredFields: artifact.recoveredFields
  };
  if (JSON.stringify(reproof) !== JSON.stringify(expectedReproof)) {
    throw new Error("Legacy reconciliation retry proof no longer reproduces the immutable result.");
  }
}
