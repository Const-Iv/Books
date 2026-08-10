// @ts-check

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { runCommand } from "./runtime.mjs";

const FINAL_PUBLISH_STATUSES = new Set([
  "pushed",
  "local-only",
  "skipped_already_merged",
  "skipped_duplicate_cleanup_only",
  "skipped_successor_cleanup_only"
]);

/**
 * @typedef {{taskId: string, commitSha: string, paths: string[]}} LegacyManagedSuccessorEntry
 * @typedef {{kind: "managed_task", taskId: string, commitSha: string, paths: string[]}} ManagedSuccessorEntry
 * @typedef {{kind: "approved_direct_main", commitSha: string, paths: string[], changedPaths: string[]}} ApprovedDirectMainEntry
 * @typedef {LegacyManagedSuccessorEntry | ManagedSuccessorEntry | ApprovedDirectMainEntry} SuccessorEntry
 * @typedef {{version: 1|2, taskId: string, taskCommitSha: string, mainSha: string, successors: SuccessorEntry[]}} SuccessorLineageManifest
 * @typedef {{
 *   status: "superseded_verified",
 *   manifestVersion: 1|2,
 *   taskCommitSha: string,
 *   mainSha: string,
 *   changedPaths: string[],
 *   rewrittenPaths: string[],
 *   successors: SuccessorEntry[],
 *   successorTaskIds: string[],
 *   successorCommitShas: string[],
 *   approvedDirectMainCommitShas: string[]
 * }} SuccessorLineageProof
 * @typedef {{manifest: SuccessorLineageManifest, sha256: string, relativePath: string}} SuccessorLineageSeal
 * @typedef {{previousProof: SuccessorLineageProof, nextProof: SuccessorLineageProof}} SuccessorLineageRefreshProof
 */

/**
 * @param {string} filePath
 * @returns {{manifest: SuccessorLineageManifest, sha256: string}}
 */
export function loadSuccessorLineageManifest(filePath) {
  const raw = readFileSync(filePath);
  let payload;
  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch (error) {
    throw new Error(`Successor-lineage manifest is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  return {
    manifest: /** @type {SuccessorLineageManifest} */ (payload),
    sha256: createHash("sha256").update(raw).digest("hex")
  };
}

/**
 * @param {string} value
 * @param {string} label
 */
function assertExactSha(value, label) {
  if (!/^[0-9a-f]{40}$/.test(value)) {
    throw new Error(`${label} must be an exact lowercase 40-character commit SHA.`);
  }
}

/**
 * @param {string} value
 * @param {string} label
 */
function assertExactSha256(value, label) {
  if (!/^[0-9a-f]{64}$/.test(value)) {
    throw new Error(`${label} must be an exact lowercase SHA-256.`);
  }
}

/**
 * @param {string} repoRoot
 * @param {string} commitish
 * @param {string} label
 * @returns {string}
 */
function resolveCommit(repoRoot, commitish, label) {
  assertExactSha(commitish, label);
  const result = runCommand(repoRoot, "git", ["rev-parse", "--verify", `${commitish}^{commit}`], {
    allowFailure: true
  });
  if (result.status !== 0 || result.stdout.trim() !== commitish) {
    throw new Error(`${label} is not a readable exact commit: ${commitish}`);
  }
  return commitish;
}

/**
 * @param {string} repoRoot
 * @param {string} ancestor
 * @param {string} descendant
 * @returns {boolean}
 */
function isAncestor(repoRoot, ancestor, descendant) {
  return runCommand(repoRoot, "git", ["merge-base", "--is-ancestor", ancestor, descendant], {
    allowFailure: true
  }).status === 0;
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeManifestPath(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\0") ||
    value.includes("\\") ||
    path.posix.isAbsolute(value) ||
    path.posix.normalize(value) !== value ||
    value === "." ||
    value === ".." ||
    value.startsWith("../")
  ) {
    throw new Error(`Successor-lineage manifest contains an unsafe path: ${String(value)}`);
  }
  return value;
}

/**
 * @param {string} repoRoot
 * @param {string} fromSha
 * @param {string} toSha
 * @returns {string[]}
 */
function getChangedPaths(repoRoot, fromSha, toSha) {
  const raw = runCommand(repoRoot, "git", ["diff", "--name-status", `${fromSha}..${toSha}`]).stdout;
  const files = raw
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => line.split("\t").slice(1).filter(Boolean));
  return [...new Set(files)].sort();
}

/**
 * @param {string} repoRoot
 * @param {string} commitSha
 * @param {string} filePath
 * @returns {string | null}
 */
function getBlob(repoRoot, commitSha, filePath) {
  const result = runCommand(repoRoot, "git", ["rev-parse", `${commitSha}:${filePath}`], { allowFailure: true });
  return result.status === 0 ? result.stdout.trim() : null;
}

/**
 * @param {string} repoRoot
 * @param {string} commitSha
 * @returns {string[]}
 */
function getParents(repoRoot, commitSha) {
  return runCommand(repoRoot, "git", ["rev-list", "--parents", "-n", "1", commitSha])
    .stdout.trim()
    .split(/\s+/)
    .slice(1);
}

/**
 * @param {string[]} left
 * @param {string[]} right
 * @returns {boolean}
 */
function sameSet(left, right) {
  return [...new Set(left)].sort().join("\n") === [...new Set(right)].sort().join("\n");
}

/**
 * @param {string} filePath
 * @param {string} pattern
 * @returns {boolean}
 */
function matchesPathPattern(filePath, pattern) {
  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -3);
    return filePath === prefix || filePath.startsWith(`${prefix}/`);
  }
  return filePath === pattern;
}

/**
 * @param {import("./runtime.mjs").TaskState} state
 * @param {string} commitSha
 * @param {string} label
 * @param {boolean} [allowFailedCleanup]
 */
function assertFinishedPublishedState(state, commitSha, label, allowFailedCleanup = false) {
  if (state.commitSha !== commitSha) {
    throw new Error(`${label} task state does not match manifest commitSha: ${state.taskId}`);
  }
  if (state.status !== "finished") {
    throw new Error(`${label} task state must be finished: ${state.taskId}`);
  }
  if (!FINAL_PUBLISH_STATUSES.has(state.publishStatus ?? "")) {
    throw new Error(`${label} task state must be published: ${state.taskId}`);
  }
  const allowedCleanup = allowFailedCleanup ? ["kept", "passed", "failed"] : ["kept", "passed"];
  if (!allowedCleanup.includes(state.cleanupStatus ?? "")) {
    throw new Error(`${label} task state must have a terminal cleanup status: ${state.taskId}`);
  }
  if (state.qaLastPassSha !== commitSha || state.previewPreparedSha !== commitSha) {
    throw new Error(`${label} task state requires exact QA and preview checkpoints: ${state.taskId}`);
  }
}

/**
 * Prove that every task path whose final blob differs from the accepted task
 * commit is fully accounted for by an ordered set of finished/published
 * successor tasks. This is a supersession proof, not equivalence.
 *
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} taskState
 * @param {SuccessorLineageManifest} manifest
 * @param {import("./runtime.mjs").TaskState[]} taskStates
 * @param {string} [mainRef]
 * @param {{allowedDirectPaths?: string[]}} [options]
 * @returns {SuccessorLineageProof}
 */
export function proveSuccessorLineage(repoRoot, taskState, manifest, taskStates, mainRef = "HEAD", options = {}) {
  if (!manifest || typeof manifest !== "object" || !new Set([1, 2]).has(manifest.version)) {
    throw new Error("Successor-lineage manifest must use version=1 or version=2.");
  }
  if (!Array.isArray(manifest.successors) || manifest.successors.length === 0) {
    throw new Error("Successor-lineage manifest requires a non-empty successors list.");
  }
  if (manifest.taskId !== taskState.taskId) {
    throw new Error(`Successor-lineage manifest taskId does not match task state: ${manifest.taskId}`);
  }
  if (!taskState.baseSha || !taskState.commitSha) {
    throw new Error("Successor-lineage requires task state baseSha and commitSha.");
  }

  const taskCommitSha = resolveCommit(repoRoot, manifest.taskCommitSha, "Successor-lineage taskCommitSha");
  const mainSha = resolveCommit(repoRoot, manifest.mainSha, "Successor-lineage mainSha");
  const currentMainSha = runCommand(repoRoot, "git", ["rev-parse", `${mainRef}^{commit}`]).stdout.trim();
  if (mainSha !== currentMainSha) {
    throw new Error(`Successor-lineage manifest must bind the exact main SHA: expected ${currentMainSha}, got ${mainSha}`);
  }
  if (taskState.commitSha !== taskCommitSha) {
    throw new Error("Successor-lineage manifest taskCommitSha does not match recorded task state.");
  }
  resolveCommit(repoRoot, taskState.baseSha, "Successor-lineage baseSha");
  assertFinishedPublishedState(taskState, taskCommitSha, "Original", true);
  if (!isAncestor(repoRoot, taskCommitSha, mainSha)) {
    throw new Error("Successor-lineage task commit is not contained in exact main.");
  }

  const changedPaths = getChangedPaths(repoRoot, taskState.baseSha, taskCommitSha);
  if (changedPaths.length === 0) {
    throw new Error("Successor-lineage requires a non-empty original task change set.");
  }
  const rewrittenPaths = changedPaths.filter(
    (filePath) => getBlob(repoRoot, taskCommitSha, filePath) !== getBlob(repoRoot, mainSha, filePath)
  );
  if (rewrittenPaths.length === 0) {
    throw new Error("Successor-lineage is unnecessary because all original task paths still match exact main.");
  }

  const history = runCommand(repoRoot, "git", [
    "rev-list",
    "--ancestry-path",
    "--reverse",
    `${taskCommitSha}..${mainSha}`
  ]).stdout
    .split("\n")
    .filter(Boolean);
  for (const commitSha of history) {
    const parents = getParents(repoRoot, commitSha);
    if (parents.length < 2) {
      continue;
    }
    const touchedFromFirstParent = getChangedPaths(repoRoot, parents[0], commitSha).filter((filePath) =>
      rewrittenPaths.includes(filePath)
    );
    for (const filePath of touchedFromFirstParent) {
      const finalBlob = getBlob(repoRoot, commitSha, filePath);
      if (!parents.some((parentSha) => getBlob(repoRoot, parentSha, filePath) === finalBlob)) {
        throw new Error(`Successor-lineage rejects custom merge resolution for rewritten path: ${filePath} (${commitSha})`);
      }
    }
  }

  const stateByTaskId = new Map(taskStates.map((state) => [state.taskId, state]));
  const stateByCommitSha = new Map(taskStates.flatMap((state) => (state.commitSha ? [[state.commitSha, state]] : [])));
  const firstParentHistory = new Set(
    runCommand(repoRoot, "git", ["rev-list", "--first-parent", `${taskCommitSha}..${mainSha}`]).stdout
      .split("\n")
      .filter(Boolean)
  );
  const declaredByCommit = new Map();
  const successorTaskIds = new Set();
  const successorCommitShas = new Set();
  /** @type {SuccessorEntry[]} */
  const normalizedSuccessors = [];
  let previousCommit = taskCommitSha;

  for (const rawEntry of manifest.successors) {
    if (!rawEntry || typeof rawEntry !== "object") {
      throw new Error("Successor-lineage manifest contains an invalid successor entry.");
    }
    const entryKind = "kind" in rawEntry ? rawEntry.kind : "legacy_managed_task";
    if (manifest.version === 1 && entryKind !== "legacy_managed_task") {
      throw new Error("Successor-lineage version=1 accepts only legacy managed task entries.");
    }
    if (manifest.version === 2 && !new Set(["managed_task", "approved_direct_main"]).has(entryKind)) {
      throw new Error("Successor-lineage version=2 requires typed managed_task or approved_direct_main entries.");
    }
    const entryLabel =
      entryKind === "approved_direct_main"
        ? "Approved direct-main successor"
        : `Successor ${"taskId" in rawEntry ? rawEntry.taskId : "<missing-task-id>"}`;
    const commitSha = resolveCommit(repoRoot, rawEntry.commitSha, `${entryLabel} commitSha`);
    if (successorCommitShas.has(commitSha)) {
      throw new Error(`Successor-lineage manifest repeats commitSha: ${commitSha}`);
    }
    const paths = Array.isArray(rawEntry.paths) ? rawEntry.paths.map(normalizeManifestPath) : [];
    if (paths.length === 0 || new Set(paths).size !== paths.length) {
      throw new Error(`${entryLabel} requires unique non-empty paths.`);
    }
    const parents = getParents(repoRoot, commitSha);
    if (parents.length !== 1) {
      throw new Error(`${entryLabel} commit must be single-parent: ${commitSha}`);
    }
    if (!isAncestor(repoRoot, taskCommitSha, commitSha) || !isAncestor(repoRoot, commitSha, mainSha)) {
      throw new Error(`Successor commit must be after the task and contained in exact main: ${commitSha}`);
    }
    if (previousCommit !== taskCommitSha && !isAncestor(repoRoot, previousCommit, commitSha)) {
      throw new Error(`Successor commits must form an ordered ancestry chain: ${previousCommit} -> ${commitSha}`);
    }
    const changedRewrittenPaths = getChangedPaths(repoRoot, parents[0], commitSha).filter((filePath) =>
      rewrittenPaths.includes(filePath)
    );
    if (!sameSet(paths, changedRewrittenPaths)) {
      throw new Error(
        `${entryLabel} paths must exactly match its rewritten task paths: ${changedRewrittenPaths.join(", ")}`
      );
    }

    /** @type {SuccessorEntry} */
    let entry;
    if (entryKind === "approved_direct_main") {
      const directEntry = /** @type {ApprovedDirectMainEntry} */ (rawEntry);
      if (!firstParentHistory.has(commitSha)) {
        throw new Error(`Approved direct-main successor must be on exact main first-parent history: ${commitSha}`);
      }
      const managedState = stateByCommitSha.get(commitSha);
      if (managedState) {
        throw new Error(
          `Approved direct-main successor has managed task state and must use managed_task provenance: ${managedState.taskId}`
        );
      }
      const changedPaths = Array.isArray(directEntry.changedPaths)
        ? directEntry.changedPaths.map(normalizeManifestPath)
        : [];
      if (changedPaths.length === 0 || new Set(changedPaths).size !== changedPaths.length) {
        throw new Error("Approved direct-main successor requires unique non-empty changedPaths.");
      }
      const actualChangedPaths = getChangedPaths(repoRoot, parents[0], commitSha);
      if (!sameSet(changedPaths, actualChangedPaths)) {
        throw new Error(
          `Approved direct-main successor changedPaths must exactly match the full commit change set: ${actualChangedPaths.join(", ")}`
        );
      }
      const allowedDirectPaths = options.allowedDirectPaths ?? [];
      const disallowedPaths = changedPaths.filter(
        (filePath) => !allowedDirectPaths.some((pattern) => matchesPathPattern(filePath, pattern))
      );
      if (disallowedPaths.length > 0) {
        throw new Error(
          `Approved direct-main successor is outside the process-only finish profile: ${disallowedPaths.join(", ")}`
        );
      }
      entry = {
        kind: "approved_direct_main",
        commitSha,
        paths: [...paths].sort(),
        changedPaths: [...changedPaths].sort()
      };
    } else {
      if (!("taskId" in rawEntry) || typeof rawEntry.taskId !== "string" || rawEntry.taskId.length === 0) {
        throw new Error("Managed successor entry requires taskId.");
      }
      if (successorTaskIds.has(rawEntry.taskId)) {
        throw new Error(`Successor-lineage manifest repeats taskId: ${rawEntry.taskId}`);
      }
      const state = stateByTaskId.get(rawEntry.taskId);
      if (!state) {
        throw new Error(`Successor task state is missing: ${rawEntry.taskId}`);
      }
      assertFinishedPublishedState(state, commitSha, "Successor");
      entry =
        manifest.version === 1
          ? { taskId: rawEntry.taskId, commitSha, paths: [...paths].sort() }
          : { kind: "managed_task", taskId: rawEntry.taskId, commitSha, paths: [...paths].sort() };
      successorTaskIds.add(rawEntry.taskId);
    }
    normalizedSuccessors.push(entry);
    declaredByCommit.set(commitSha, entry);
    successorCommitShas.add(commitSha);
    previousCommit = commitSha;
  }

  const declaredPaths = normalizedSuccessors.flatMap((entry) => entry.paths);
  if (!sameSet(declaredPaths, rewrittenPaths)) {
    throw new Error(
      `Successor-lineage manifest must cover exactly the rewritten task paths: ${rewrittenPaths.join(", ")}`
    );
  }

  for (const commitSha of history) {
    const parents = getParents(repoRoot, commitSha);
    if (parents.length === 1) {
      const touched = getChangedPaths(repoRoot, parents[0], commitSha).filter((filePath) => rewrittenPaths.includes(filePath));
      if (touched.length > 0 && !declaredByCommit.has(commitSha)) {
        throw new Error(`Content-changing commit is not declared in the successor manifest: ${commitSha} (${touched.join(", ")})`);
      }
      continue;
    }
    if (parents.length < 2) {
      continue;
    }
    const touchedFromFirstParent = getChangedPaths(repoRoot, parents[0], commitSha).filter((filePath) =>
      rewrittenPaths.includes(filePath)
    );
    for (const filePath of touchedFromFirstParent) {
      const finalBlob = getBlob(repoRoot, commitSha, filePath);
      const matchingParentIndexes = parents
        .map((parentSha, index) => (getBlob(repoRoot, parentSha, filePath) === finalBlob ? index : -1))
        .filter((index) => index >= 0);
      if (matchingParentIndexes.length === 0) {
        throw new Error(`Successor-lineage rejects custom merge resolution for rewritten path: ${filePath} (${commitSha})`);
      }
      const transported = matchingParentIndexes.some((index) => {
        if (index === 0) {
          return false;
        }
        const parentSha = parents[index];
        if (isAncestor(repoRoot, taskCommitSha, parentSha) && getBlob(repoRoot, taskCommitSha, filePath) === finalBlob) {
          return true;
        }
        return normalizedSuccessors.some(
          (entry) => entry.paths.includes(filePath) && isAncestor(repoRoot, entry.commitSha, parentSha)
        );
      });
      if (!transported) {
        throw new Error(`Merge commit does not transport an accounted task/successor blob: ${filePath} (${commitSha})`);
      }
    }
  }

  return {
    status: "superseded_verified",
    manifestVersion: manifest.version,
    taskCommitSha,
    mainSha,
    changedPaths,
    rewrittenPaths,
    successors: normalizedSuccessors,
    successorTaskIds: normalizedSuccessors.flatMap((entry) => ("taskId" in entry ? [entry.taskId] : [])),
    successorCommitShas: normalizedSuccessors.map((entry) => entry.commitSha),
    approvedDirectMainCommitShas: normalizedSuccessors.flatMap((entry) =>
      "kind" in entry && entry.kind === "approved_direct_main" ? [entry.commitSha] : []
    )
  };
}

/**
 * Prove an append-only transition from one accepted successor-lineage seal to
 * a new exact-main seal. The old proof remains authoritative for its bound
 * main; the new proof may only advance along descendant history.
 *
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} taskState
 * @param {SuccessorLineageSeal} previousSeal
 * @param {SuccessorLineageSeal} nextSeal
 * @param {import("./runtime.mjs").TaskState[]} taskStates
 * @param {string} [mainRef]
 * @param {{allowedDirectPaths?: string[]}} [options]
 * @returns {SuccessorLineageRefreshProof}
 */
export function proveSuccessorLineageRefresh(
  repoRoot,
  taskState,
  previousSeal,
  nextSeal,
  taskStates,
  mainRef = "HEAD",
  options = {}
) {
  if (
    taskState.supersessionMode !== "declared_successor_lineage" ||
    taskState.supersessionStatus !== "superseded_verified"
  ) {
    throw new Error("Successor-lineage refresh requires an existing superseded_verified seal.");
  }
  if (!taskState.supersessionMainSha) {
    throw new Error("Successor-lineage refresh requires the previous exact main SHA.");
  }
  assertExactSha256(previousSeal.sha256, "Successor-lineage previous manifest SHA-256");
  assertExactSha256(nextSeal.sha256, "Successor-lineage next manifest SHA-256");
  if (taskState.supersessionManifestSha256 !== previousSeal.sha256) {
    throw new Error("Successor-lineage previous manifest SHA-256 does not match the sealed task state.");
  }
  if (taskState.supersessionManifestRelativePath !== previousSeal.relativePath) {
    throw new Error("Successor-lineage previous manifest path does not match the sealed task state.");
  }
  if (previousSeal.relativePath === nextSeal.relativePath) {
    throw new Error("Successor-lineage refresh must use a new immutable manifest path.");
  }
  if (previousSeal.sha256 === nextSeal.sha256) {
    throw new Error("Successor-lineage refresh requires a new manifest SHA-256.");
  }
  if (previousSeal.manifest.version !== nextSeal.manifest.version) {
    throw new Error("Successor-lineage refresh cannot change the sealed manifest version.");
  }
  if (
    taskState.originalAcceptanceStatus !== "passed" ||
    taskState.originalAcceptanceTaskSha !== taskState.commitSha ||
    taskState.successorAcceptanceStatus !== "passed" ||
    taskState.successorAcceptanceMainSha !== taskState.supersessionMainSha
  ) {
    throw new Error("Successor-lineage previous acceptance state is incomplete or inconsistent.");
  }

  const previousMainSha = resolveCommit(
    repoRoot,
    taskState.supersessionMainSha,
    "Successor-lineage previous main SHA"
  );
  const currentMainSha = runCommand(repoRoot, "git", ["rev-parse", `${mainRef}^{commit}`]).stdout.trim();
  if (previousMainSha === currentMainSha) {
    throw new Error("Successor-lineage refresh requires canonical main to advance.");
  }
  if (!isAncestor(repoRoot, previousMainSha, currentMainSha)) {
    throw new Error("Successor-lineage refresh rejects a main downgrade or non-descendant history.");
  }

  const previousProof = proveSuccessorLineage(
    repoRoot,
    taskState,
    previousSeal.manifest,
    taskStates,
    previousMainSha,
    options
  );
  if (JSON.stringify(previousProof.successors) !== JSON.stringify(taskState.successorLineage ?? [])) {
    throw new Error("Successor-lineage previous proof no longer matches the sealed task state.");
  }

  const nextProof = proveSuccessorLineage(repoRoot, taskState, nextSeal.manifest, taskStates, mainRef, options);
  let nextIndex = 0;
  for (const previousEntry of previousProof.successors) {
    let preserved = false;
    while (nextIndex < nextProof.successors.length) {
      const nextEntry = nextProof.successors[nextIndex];
      nextIndex += 1;
      if (JSON.stringify(previousEntry) === JSON.stringify(nextEntry)) {
        preserved = true;
        break;
      }
    }
    if (!preserved) {
      const entryId = "taskId" in previousEntry ? previousEntry.taskId : previousEntry.commitSha;
      throw new Error(`Successor-lineage refresh must preserve prior successor evidence in order: ${entryId}`);
    }
  }

  return { previousProof, nextProof };
}
