// @ts-check

import { existsSync, lstatSync } from "node:fs";
import path from "node:path";

import { buildCommitMessage } from "./lib/conveyor-utils.mjs";
import { proveParallelDuplicateCommit } from "./lib/duplicate-equivalence.mjs";
import { runFinishVerification } from "./lib/finish-verification.mjs";
import { executeTaskCleanup, normalizeCleanupChoice } from "./lib/worktree-cleanup.mjs";
import {
  OPERATIONAL_DOCS,
  appendHistoryEvent,
  findMainWorktree,
  findGitRoot,
  formatIso,
  getCurrentBranch,
  getHeadSha,
  getTaskArtifactsDir,
  getWorktreeList,
  hasRemote,
  getTrackedChangedFiles,
  isGitDirty,
  loadAllTaskStates,
  loadTaskStateByBranch,
  loadTaskStateByTaskId,
  parseArgs,
  runCommand,
  saveTaskState
} from "./lib/runtime.mjs";

/**
 * @param {string} repoRoot
 * @param {string} currentBranch
 * @param {{branch: string | null, cleanup: string | null, publishMain: string | null, taskId: string | null}} options
 * @returns {Promise<import("./lib/runtime.mjs").TaskState>}
 */
async function resolveTaskState(repoRoot, currentBranch, options) {
  if (currentBranch.startsWith("codex/")) {
    const state = await loadTaskStateByBranch(repoRoot, currentBranch);
    if (!state) {
      throw new Error(`Task state not found for branch ${currentBranch}`);
    }
    if (options.branch && options.branch !== currentBranch) {
      throw new Error(`Current branch is ${currentBranch}; --branch must match the active task branch.`);
    }
    if (options.taskId && options.taskId !== state.taskId) {
      throw new Error(`Current task is ${state.taskId}; --task-id must match the active task.`);
    }
    return state;
  }

  if (currentBranch !== "main") {
    throw new Error(`task:finish:core works only on codex/* branches or on main for resume. Current branch: ${currentBranch}`);
  }

  const states = await loadAllTaskStates(repoRoot);
  if (options.taskId) {
    const explicit = await loadTaskStateByTaskId(repoRoot, options.taskId);
    if (!explicit) {
      throw new Error(`Task state not found for --task-id ${options.taskId}`);
    }
    if (options.branch && options.branch !== explicit.branch) {
      throw new Error(`Task ${options.taskId} belongs to branch ${explicit.branch}; --branch must match.`);
    }
    return explicit;
  }

  if (options.branch) {
    const explicit = states.find((state) => state.branch === options.branch);
    if (!explicit) {
      throw new Error(`Task state not found for --branch ${options.branch}`);
    }
    return explicit;
  }

  const candidates = states.filter((state) => {
    if (!state.branch.startsWith("codex/")) {
      return false;
    }
    if (options.publishMain === "retry") {
      return Boolean(state.commitSha) && state.publishStatus === "failed";
    }
    if (options.cleanup) {
      return Boolean(state.commitSha) && !["passed", "kept"].includes(state.cleanupStatus ?? "");
    }
    return false;
  });

  if (candidates.length === 1) {
    return candidates[0];
  }

  if (candidates.length === 0) {
    throw new Error("No resumable task state found on main. Provide --task-id <id> or --branch codex/<task-branch>.");
  }

  throw new Error(
    `Multiple resumable task states found: ${candidates.map((state) => state.branch).join(", ")}. ` +
    "Provide --task-id <id> or --branch codex/<task-branch>."
  );
}

/**
 * @param {string} repoRoot
 * @returns {Promise<void>}
 */
async function normalizeOperationalSnapshots(repoRoot) {
  const dirtySnapshots = (await getTrackedChangedFiles(repoRoot)).filter((filePath) => OPERATIONAL_DOCS.includes(filePath));
  if (dirtySnapshots.length === 0) {
    return;
  }
  runCommand(repoRoot, "git", ["restore", "--staged", "--worktree", "--", ...dirtySnapshots], { allowFailure: true });
}

/**
 * `runtime/` is an ignored local-artifact boundary. A root symlink would be
 * staged as a tracked Git entry before QA and could redirect canonical-main
 * reads/writes outside the repository, so reject it before any task commit.
 *
 * @param {string} repoRoot
 * @returns {void}
 */
function assertRuntimeArtifactBoundary(repoRoot) {
  const runtimePath = path.join(repoRoot, "runtime");
  try {
    const metadata = lstatSync(runtimePath);
    if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
      throw new Error("Task runtime must be a regular ignored directory, never a symlink or file.");
    }
  } catch (error) {
    if (!(error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT")) {
      throw error;
    }
  }
  const trackedRuntime = runCommand(
    repoRoot,
    "git",
    ["ls-files", "--stage", "--", "runtime"],
    { allowFailure: true }
  );
  if (trackedRuntime.status !== 0) {
    throw new Error("Unable to verify the ignored runtime boundary before task commit.");
  }
  if (trackedRuntime.stdout.trim()) {
    throw new Error("Task runtime contains tracked Git entries; publication is blocked.");
  }
}

/**
 * @param {string} repoRoot
 * @param {import("./lib/runtime.mjs").TaskState} state
 * @returns {Promise<boolean>}
 */
async function maybeReuseQa(repoRoot, state) {
  if (state.qaLastPassSha && state.qaLastPassSha === getHeadSha(repoRoot) && !isGitDirty(repoRoot)) {
    await appendHistoryEvent(repoRoot, {
      at: formatIso(),
      type: "QA_REUSE",
      taskId: state.taskId,
      branch: state.branch,
      payload: {
        qaLastPassSha: state.qaLastPassSha,
        qaLastPassAt: state.qaLastPassAt ?? null
      }
    });
    return true;
  }
  return false;
}

/**
 * @param {string} repoRoot
 * @param {import("./lib/runtime.mjs").TaskState} state
 * @returns {Promise<void>}
 */
async function ensureTaskQa(repoRoot, state) {
  const reused = await maybeReuseQa(repoRoot, state);
  if (reused) {
    return;
  }

  const qa = runCommand(repoRoot, "node", ["scripts/worktree-qa-agent.mjs"], { allowFailure: true });
  if (qa.status !== 0) {
    const refreshed = await loadTaskStateByBranch(repoRoot, state.branch);
    const failureClass = refreshed?.lastQaResult?.failureClass ?? "unknown";
    const failedStage = refreshed?.lastQaResult?.failedStage ?? "unknown";
    throw new Error(
      "task:finish:core stopped because task QA failed.\n" +
      `class: ${failureClass}\n` +
      `firstFailedStage: ${failedStage}\n` +
      "resume command: npm run task:finish:core -- --decision retry"
    );
  }

  // task:qa:agent records its TRIZ/QA evidence in tracked operational logs.
  // Those snapshots are deliberately excluded from the task commit above, so
  // restore only the same allowlisted paths after QA before fail-closed
  // equivalence verification inspects the worktree.
  await normalizeOperationalSnapshots(repoRoot);
}

/**
 * @param {string} repoRoot
 * @param {import("./lib/runtime.mjs").TaskState} state
 * @param {{repaired?: boolean, reason?: string | null}} [options]
 * @returns {Promise<void>}
 */
async function recordCommitAndPush(repoRoot, state, options = {}) {
  state.commitSha = getHeadSha(repoRoot);
  await saveTaskState(repoRoot, state);

  let pushed = false;
  if (hasRemote(repoRoot)) {
    runCommand(repoRoot, "git", ["push", "-u", "origin", state.branch]);
    pushed = true;
  }

  await appendHistoryEvent(repoRoot, {
    at: formatIso(),
    type: "COMMIT_PUSH",
    taskId: state.taskId,
    branch: state.branch,
    payload: {
      commitSha: state.commitSha,
      pushed,
      repaired: options.repaired === true,
      reason: options.reason ?? null
    }
  });
}

/**
 * @param {string} repoRoot
 * @param {import("./lib/runtime.mjs").TaskState} state
 * @returns {Promise<void>}
 */
async function ensureTaskCommit(repoRoot, state) {
  assertRuntimeArtifactBoundary(repoRoot);
  if (!isGitDirty(repoRoot) && state.commitSha === getHeadSha(repoRoot)) {
    return;
  }

  runCommand(repoRoot, "node", ["scripts/worktree-operational-docs.mjs", "capture"]);
  await normalizeOperationalSnapshots(repoRoot);

  const changed = runCommand(repoRoot, "git", ["status", "--porcelain"], { allowFailure: true }).stdout.trim();
  if (!changed) {
    await recordCommitAndPush(repoRoot, state, {
      repaired: true,
      reason: state.commitSha
        ? "updated commitSha to the existing task branch HEAD before publish"
        : "recorded existing task branch HEAD as commitSha before publish"
    });
    return;
  }

  runCommand(repoRoot, "git", ["add", "-A"]);
  const message = await buildCommitMessage(repoRoot, state.title);
  runCommand(repoRoot, "git", ["commit", "-m", message]);
  await recordCommitAndPush(repoRoot, state);
}

/**
 * @param {string} repoRoot
 * @param {import("./lib/runtime.mjs").TaskState} state
 * @returns {Promise<boolean>}
 */
async function maybeSkipAlreadyMergedPublish(repoRoot, state) {
  if (state.commitSha || isGitDirty(state.worktreePath)) {
    return false;
  }

  const stateRepoRoot = state.repoRoot || state.mainWorktreePath || repoRoot;
  const mainWorktreePath = state.mainWorktreePath ?? (await findMainWorktree(stateRepoRoot)) ?? stateRepoRoot;
  if (getCurrentBranch(mainWorktreePath) !== "main") {
    return false;
  }

  const taskHeadSha = getHeadSha(state.worktreePath);
  const alreadyMerged = runCommand(mainWorktreePath, "git", ["merge-base", "--is-ancestor", taskHeadSha, "main"], {
    allowFailure: true
  });
  if (alreadyMerged.status !== 0) {
    return false;
  }

  state.commitSha = taskHeadSha;
  state.publishStatus = "skipped_already_merged";
  state.status = "merged";
  await saveTaskState(stateRepoRoot, state);
  await appendHistoryEvent(stateRepoRoot, {
    at: formatIso(),
    type: "PUBLISH_SKIP",
    taskId: state.taskId,
    branch: state.branch,
    payload: {
      reason: "task branch HEAD is already contained in main",
      commitSha: taskHeadSha,
      mainWorktreePath,
      publishStatus: state.publishStatus
    }
  });
  return true;
}

/**
 * @param {string} repoRoot
 * @param {import("./lib/runtime.mjs").TaskState} state
 * @param {string | null} replacementCommitish
 * @returns {Promise<boolean>}
 */
async function maybeSkipDuplicatePublish(repoRoot, state, replacementCommitish) {
  if (!replacementCommitish) {
    return false;
  }
  if (!state.baseSha || !state.commitSha) {
    throw new Error("Duplicate cleanup requires recorded baseSha and commitSha evidence.");
  }

  const stateRepoRoot = state.repoRoot || state.mainWorktreePath || repoRoot;
  const mainWorktreePath = state.mainWorktreePath ?? (await findMainWorktree(stateRepoRoot)) ?? stateRepoRoot;
  if (getCurrentBranch(mainWorktreePath) !== "main") {
    throw new Error(`Duplicate cleanup requires canonical main: ${mainWorktreePath}`);
  }
  if (isGitDirty(mainWorktreePath)) {
    throw new Error("Duplicate cleanup requires a clean canonical main worktree.");
  }
  if (!existsSync(state.worktreePath)) {
    throw new Error(`Duplicate cleanup requires the exact task worktree: ${state.worktreePath}`);
  }
  if (isGitDirty(state.worktreePath) || getHeadSha(state.worktreePath) !== state.commitSha) {
    throw new Error("Duplicate cleanup requires a clean task worktree at the recorded commitSha.");
  }

  const proof = proveParallelDuplicateCommit(mainWorktreePath, state.commitSha, replacementCommitish, "HEAD");
  if (proof.baseSha !== state.baseSha) {
    throw new Error(`Recorded baseSha does not match duplicate proof: ${state.baseSha}`);
  }

  const verifiedAt = formatIso();
  state.equivalenceMode = "parallel_duplicate_commit";
  state.replacementCommitSha = proof.replacementCommitSha;
  state.equivalenceVerifiedAt = verifiedAt;
  state.equivalenceMainSha = getHeadSha(mainWorktreePath);
  state.duplicateAcceptanceStatus = null;
  state.duplicateAcceptanceMainSha = null;
  state.duplicateAcceptanceAt = null;
  state.duplicateAcceptanceCommand = null;
  state.publishStatus = "skipped_duplicate_cleanup_only";
  state.status = "merged";
  await saveTaskState(stateRepoRoot, state);
  await appendHistoryEvent(stateRepoRoot, {
    at: verifiedAt,
    type: "PUBLISH_SKIP",
    taskId: state.taskId,
    branch: state.branch,
    payload: {
      reason: "parallel task commit exactly matches an explicit replacement commit already contained in main",
      resultStatus: "exact_duplicate",
      commitSha: proof.taskCommitSha,
      replacementCommitSha: proof.replacementCommitSha,
      baseSha: proof.baseSha,
      changedFiles: proof.changedFiles,
      fullCurrentMainQaRequired: true,
      publishStatus: state.publishStatus
    }
  });
  return true;
}

/**
 * @param {string} repoRoot
 * @param {import("./lib/runtime.mjs").TaskState} state
 * @returns {Promise<void>}
 */
async function runPublishStage(repoRoot, state) {
  runCommand(repoRoot, "node", ["scripts/worktree-merge-main.mjs", "--branch", state.branch], { allowFailure: false });
}

/**
 * @param {string} repoRoot
 * @param {import("./lib/runtime.mjs").TaskState} state
 * @param {string | null} cleanup
 * @returns {Promise<void>}
 */
async function finalizeTask(repoRoot, state, cleanup) {
  const stateRepoRoot = state.repoRoot || state.mainWorktreePath || repoRoot;
  const mainWorktreePath = state.mainWorktreePath ?? (await findMainWorktree(stateRepoRoot)) ?? stateRepoRoot;
  const taskStillRegistered = (await getWorktreeList(mainWorktreePath)).some(
    (entry) => path.resolve(entry.path) === path.resolve(state.worktreePath)
  );
  const resumePostCleanup =
    cleanup === "yes" &&
    !taskStillRegistered &&
    state.mainVerificationStatus === "passed" &&
    state.mainVerificationSha === getHeadSha(mainWorktreePath);
  if (!resumePostCleanup) {
    const preVerification = await runFinishVerification(stateRepoRoot, state, "pre_cleanup");
    if (preVerification.artifactPreservation) {
      await appendHistoryEvent(stateRepoRoot, {
        at: formatIso(),
        type: "BOOKS_ARTIFACTS_PRESERVE",
        taskId: state.taskId,
        branch: state.branch,
        payload: preVerification.artifactPreservation
      });
    }
    state.mainVerificationStatus = preVerification.status;
    state.mainVerificationSha = preVerification.mainSha;
    state.mainVerificationAt = formatIso();
    if (state.equivalenceMode === "parallel_duplicate_commit") {
      state.duplicateAcceptanceStatus = preVerification.status;
      state.duplicateAcceptanceMainSha = preVerification.mainSha;
      state.duplicateAcceptanceAt = state.mainVerificationAt;
      state.duplicateAcceptanceCommand = preVerification.checks.some((check) => check.id === "full_current_main_qa")
        ? "npm run qa:agent"
        : null;
      state.equivalenceMainSha = preVerification.mainSha;
      state.equivalenceVerifiedAt = state.mainVerificationAt;
    }
    await saveTaskState(stateRepoRoot, state);
    await appendHistoryEvent(stateRepoRoot, {
      at: state.mainVerificationAt,
      type: "MAIN_VERIFY",
      taskId: state.taskId,
      branch: state.branch,
      payload: preVerification
    });
    if (preVerification.status !== "passed") {
      throw new Error(
        [
          "task:finish:core main equivalence verification failed; cleanup is blocked.",
          ...preVerification.blocked,
          `evidence: ${getTaskArtifactsDir(stateRepoRoot, state.taskId)}`
        ].join("\n")
      );
    }
  }

  if (!cleanup) {
    console.log(
      ["Finish complete. Choose cleanup:", "1. Удалить", "2. Оставить", "CLI aliases: --cleanup 1|2 (legacy: yes|no)."].join(
        "\n"
      )
    );
    return;
  }

  state.cleanupDecision = cleanup;
  state.finishedAt = formatIso();
  state.status = "finished";

  const cleanupResult = await executeTaskCleanup(repoRoot, state, mainWorktreePath);
  if (cleanupResult.status === "passed" && cleanupResult.decision === "yes") {
    const postVerification = await runFinishVerification(stateRepoRoot, state, "post_cleanup");
    state.postCleanupVerificationStatus = postVerification.status;
    state.postCleanupVerificationAt = formatIso();
    await appendHistoryEvent(stateRepoRoot, {
      at: state.postCleanupVerificationAt,
      type: "POST_CLEANUP_VERIFY",
      taskId: state.taskId,
      branch: state.branch,
      payload: postVerification
    });
    if (postVerification.status !== "passed") {
      cleanupResult.status = "failed";
      cleanupResult.errors.push(...postVerification.blocked);
    }
  }
  state.cleanupDecision = cleanupResult.decision;
  state.cleanupStatus = cleanupResult.status;
  state.cleanupTargets = cleanupResult.cleanupTargets;
  await saveTaskState(stateRepoRoot, state);

  await appendHistoryEvent(stateRepoRoot, {
    at: formatIso(),
    type: "CLEANUP",
    taskId: state.taskId,
    branch: state.branch,
    payload: {
      decision: cleanupResult.decision,
      status: cleanupResult.status,
      removedPaths: cleanupResult.removedPaths,
      remainingPaths: cleanupResult.remainingPaths,
      cleanupTargets: cleanupResult.cleanupTargets,
      hookInvoked: cleanupResult.hookInvoked,
      blocked: cleanupResult.blocked,
      errors: cleanupResult.errors,
      notes: cleanupResult.notes,
      branchRemoved: cleanupResult.branchRemoved
    }
  });
  await appendHistoryEvent(stateRepoRoot, {
    at: state.finishedAt,
    type: "FINISH",
    taskId: state.taskId,
    branch: state.branch,
    payload: {
      publishStatus: state.publishStatus ?? null,
      mainVerificationStatus: state.mainVerificationStatus ?? null,
      cleanupDecision: state.cleanupDecision,
      cleanupStatus: state.cleanupStatus ?? null,
      postCleanupVerificationStatus: state.postCleanupVerificationStatus ?? null
    }
  });

  if (cleanupResult.status === "failed") {
    const details = [
      "task:finish:core completed publish but cleanup did not finish.",
      cleanupResult.blocked.length > 0 ? `blocked: ${cleanupResult.blocked.join("; ")}` : null,
      cleanupResult.errors.length > 0 ? `errors: ${cleanupResult.errors.join("; ")}` : null,
      cleanupResult.remainingPaths.length > 0 ? `remaining: ${cleanupResult.remainingPaths.join(", ")}` : null,
      `resume command: npm run task:finish:core -- --task-id ${state.taskId} --cleanup 1`
    ].filter(Boolean);
    throw new Error(details.join("\n"));
  }
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = findGitRoot(process.cwd());
  const currentBranch = getCurrentBranch(repoRoot);
  const { flags } = parseArgs(process.argv.slice(2));
  const rawCleanup = typeof flags.cleanup === "string" ? flags.cleanup : null;
  const cleanup = normalizeCleanupChoice(rawCleanup);
  const publishMain = typeof flags["publish-main"] === "string" ? flags["publish-main"] : null;
  const requestedBranch = typeof flags.branch === "string" ? flags.branch : null;
  const requestedTaskId = typeof flags["task-id"] === "string" ? flags["task-id"] : null;
  const duplicateOf = typeof flags["duplicate-of"] === "string" ? flags["duplicate-of"] : null;
  const decision = typeof flags.decision === "string" ? flags.decision : null;

  if (decision && decision !== "retry") {
    throw new Error(`Unsupported --decision value: ${decision}. Expected retry.`);
  }
  if (publishMain && publishMain !== "retry") {
    throw new Error(`Unsupported --publish-main value: ${publishMain}. Expected retry.`);
  }
  if (cleanup && cleanup !== "yes" && cleanup !== "no") {
    throw new Error(`Unsupported --cleanup value: ${rawCleanup}. Expected 1, 2, yes, or no.`);
  }
  if (flags["duplicate-of"] !== undefined && !duplicateOf) {
    throw new Error("--duplicate-of requires one replacement commit SHA.");
  }
  if (duplicateOf && cleanup !== "yes") {
    throw new Error("--duplicate-of is cleanup-only and requires --cleanup 1 (or yes).");
  }
  if (duplicateOf && publishMain) {
    throw new Error("--duplicate-of cannot be combined with --publish-main; duplicate cleanup never performs a second merge.");
  }

  const state = await resolveTaskState(repoRoot, currentBranch, {
    branch: requestedBranch,
    cleanup,
    publishMain,
    taskId: requestedTaskId
  });
  if (duplicateOf) {
    await ensureTaskCommit(state.worktreePath, state);
    await ensureTaskQa(state.worktreePath, state);
    const qaRefreshed = await loadTaskStateByBranch(repoRoot, state.branch);
    if (!qaRefreshed || qaRefreshed.qaLastPassSha !== state.commitSha) {
      throw new Error("Duplicate cleanup requires persisted task QA evidence at the recorded commitSha.");
    }
    Object.assign(state, qaRefreshed);
  }
  const skippedDuplicate = await maybeSkipDuplicatePublish(repoRoot, state, duplicateOf);
  const skippedAlreadyMerged = skippedDuplicate ? false : await maybeSkipAlreadyMergedPublish(repoRoot, state);

  const publishAlreadyCompleted =
    skippedDuplicate ||
    skippedAlreadyMerged ||
    (["pushed", "local-only", "skipped_already_merged", "skipped_duplicate_cleanup_only"].includes(state.publishStatus ?? "") &&
      ["merged", "finished"].includes(state.status ?? ""));

  if (!publishAlreadyCompleted) {
    await ensureTaskCommit(state.worktreePath, state);
    await ensureTaskQa(state.worktreePath, state);
  }

  const shouldPublish = publishMain === "retry" || !publishAlreadyCompleted;
  if (shouldPublish) {
    await runPublishStage(state.mainWorktreePath ?? repoRoot, state);
  }

  const refreshed = await loadTaskStateByBranch(repoRoot, state.branch);
  if (!refreshed) {
    throw new Error(`Task state disappeared for branch ${state.branch}`);
  }
  await finalizeTask(repoRoot, refreshed, cleanup);
}

await main();
