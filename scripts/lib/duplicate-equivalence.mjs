// @ts-check

import { runCommand } from "./runtime.mjs";

/**
 * @typedef {Object} DuplicateEquivalenceProof
 * @property {string} taskCommitSha
 * @property {string} replacementCommitSha
 * @property {string} baseSha
 * @property {string[]} changedFiles
 */

/** @typedef {"exact_duplicate"|"different_results"|"not_proven"} ParallelResultStatus */

/**
 * @typedef {Object} ParallelResultAssessment
 * @property {ParallelResultStatus} status
 * @property {string} reason
 * @property {DuplicateEquivalenceProof | null} proof
 */

/**
 * @typedef {Object} GitTreeEntry
 * @property {string} mode
 * @property {string} type
 * @property {string} objectId
 */

/**
 * @param {string} repoRoot
 * @param {string} commitish
 * @returns {string}
 */
function resolveCommit(repoRoot, commitish) {
  const result = runCommand(repoRoot, "git", ["rev-parse", "--verify", `${commitish}^{commit}`], {
    allowFailure: true
  });
  if (result.status !== 0) {
    throw new Error(`Duplicate replacement commit is not readable: ${commitish}`);
  }
  return result.stdout.trim();
}

/**
 * @param {string} repoRoot
 * @param {string} commitSha
 * @returns {string}
 */
function getSingleParent(repoRoot, commitSha) {
  const parts = runCommand(repoRoot, "git", ["rev-list", "--parents", "-n", "1", commitSha])
    .stdout.trim()
    .split(/\s+/);
  if (parts.length !== 2) {
    throw new Error(`Duplicate equivalence requires a single-parent commit: ${commitSha}`);
  }
  return parts[1];
}

/**
 * @param {string} repoRoot
 * @param {string} baseSha
 * @param {string} commitSha
 * @returns {{raw: string, files: string[]}}
 */
export function getNameStatusDiff(repoRoot, baseSha, commitSha) {
  const raw = runCommand(repoRoot, "git", ["diff", "--name-status", "-z", `${baseSha}..${commitSha}`]).stdout;
  if (!raw) {
    return { raw, files: [] };
  }

  const fields = raw.split("\0");
  if (fields.at(-1) === "") {
    fields.pop();
  }
  const files = [];
  for (let index = 0; index < fields.length;) {
    const status = fields[index++];
    if (!status) {
      throw new Error("Git name-status diff contains an empty status record.");
    }
    const pathCount = /^[RC]/.test(status) ? 2 : 1;
    if (index + pathCount > fields.length) {
      throw new Error(`Git name-status diff is truncated after ${status}.`);
    }
    files.push(...fields.slice(index, index + pathCount));
    index += pathCount;
  }
  return { raw, files: [...new Set(files)] };
}

/**
 * @param {string} repoRoot
 * @param {string} commitSha
 * @param {string} filePath
 * @returns {GitTreeEntry | null}
 */
export function getGitTreeEntry(repoRoot, commitSha, filePath) {
  const result = runCommand(repoRoot, "git", ["ls-tree", "-z", commitSha, "--", `:(literal)${filePath}`], {
    allowFailure: true
  });
  if (result.status !== 0) {
    throw new Error(`Git tree entry is not readable at ${commitSha}:${filePath}`);
  }
  if (!result.stdout) {
    return null;
  }

  const record = result.stdout.split("\0").find(Boolean) ?? "";
  const separator = record.indexOf("\t");
  const metadata = (separator >= 0 ? record.slice(0, separator) : "").split(" ");
  if (metadata.length !== 3 || metadata.some((value) => !value)) {
    throw new Error(`Git tree entry is malformed at ${commitSha}:${filePath}`);
  }
  return { mode: metadata[0], type: metadata[1], objectId: metadata[2] };
}

/**
 * Compare the complete tracked identity. A blob object id alone does not
 * capture executable, symlink, or gitlink mode changes.
 *
 * @param {GitTreeEntry | null} left
 * @param {GitTreeEntry | null} right
 * @returns {boolean}
 */
export function gitTreeEntriesEqual(left, right) {
  if (left === null || right === null) {
    return left === right;
  }
  return left.mode === right.mode && left.type === right.type && left.objectId === right.objectId;
}

/**
 * Classify two parallel commits without mutating either branch. This is a
 * deliberately narrow Git-object proof, not patch-id or semantic equivalence.
 *
 * @param {string} repoRoot
 * @param {string} taskCommitish
 * @param {string} replacementCommitish
 * @param {string} [mainRef]
 * @returns {ParallelResultAssessment}
 */
export function classifyParallelCommitResult(repoRoot, taskCommitish, replacementCommitish, mainRef = "HEAD") {
  let taskCommitSha;
  let replacementCommitSha;
  try {
    taskCommitSha = resolveCommit(repoRoot, taskCommitish);
    replacementCommitSha = resolveCommit(repoRoot, replacementCommitish);
  } catch (error) {
    return { status: "not_proven", reason: error instanceof Error ? error.message : String(error), proof: null };
  }

  if (taskCommitSha === replacementCommitSha) {
    return { status: "not_proven", reason: "Duplicate equivalence requires two distinct commits.", proof: null };
  }

  let taskParent;
  let replacementParent;
  try {
    taskParent = getSingleParent(repoRoot, taskCommitSha);
    replacementParent = getSingleParent(repoRoot, replacementCommitSha);
  } catch (error) {
    return { status: "not_proven", reason: error instanceof Error ? error.message : String(error), proof: null };
  }

  if (taskParent !== replacementParent) {
    return { status: "not_proven", reason: "Duplicate commits do not share the same parent.", proof: null };
  }

  let taskChanges;
  let replacementChanges;
  try {
    taskChanges = getNameStatusDiff(repoRoot, taskParent, taskCommitSha);
    replacementChanges = getNameStatusDiff(repoRoot, replacementParent, replacementCommitSha);
  } catch (error) {
    return { status: "not_proven", reason: error instanceof Error ? error.message : String(error), proof: null };
  }
  if (!taskChanges.raw || !replacementChanges.raw) {
    return { status: "not_proven", reason: "Duplicate proof requires non-empty tracked changes.", proof: null };
  }
  if (taskChanges.raw !== replacementChanges.raw) {
    return {
      status: "different_results",
      reason: "Duplicate commits do not have the same tracked name-status change set.",
      proof: null
    };
  }

  for (const filePath of taskChanges.files) {
    let taskEntry;
    let replacementEntry;
    try {
      taskEntry = getGitTreeEntry(repoRoot, taskCommitSha, filePath);
      replacementEntry = getGitTreeEntry(repoRoot, replacementCommitSha, filePath);
    } catch (error) {
      return { status: "not_proven", reason: error instanceof Error ? error.message : String(error), proof: null };
    }
    if (!gitTreeEntriesEqual(taskEntry, replacementEntry)) {
      return { status: "different_results", reason: `Duplicate commit tree-entry mismatch: ${filePath}`, proof: null };
    }
  }

  const contained = runCommand(repoRoot, "git", ["merge-base", "--is-ancestor", replacementCommitSha, mainRef], {
    allowFailure: true
  });
  if (contained.status !== 0) {
    return {
      status: "not_proven",
      reason: `Duplicate replacement commit is not contained in ${mainRef}: ${replacementCommitSha}`,
      proof: null
    };
  }

  return {
    status: "exact_duplicate",
    reason: "Tracked results are exactly equal and the accepted replacement is in main.",
    proof: {
      taskCommitSha,
      replacementCommitSha,
      baseSha: taskParent,
      changedFiles: taskChanges.files
    }
  };
}

/**
 * @param {string} repoRoot
 * @param {string} taskCommitish
 * @param {string} replacementCommitish
 * @param {string} [mainRef]
 * @returns {DuplicateEquivalenceProof}
 */
export function proveParallelDuplicateCommit(repoRoot, taskCommitish, replacementCommitish, mainRef = "HEAD") {
  const assessment = classifyParallelCommitResult(repoRoot, taskCommitish, replacementCommitish, mainRef);
  if (assessment.status !== "exact_duplicate" || !assessment.proof) {
    throw new Error(`${assessment.status}: ${assessment.reason}`);
  }
  return assessment.proof;
}
