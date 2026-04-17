// @ts-check

import { existsSync } from "node:fs";
import path from "node:path";

import { buildCommitMessage } from "./lib/conveyor-utils.mjs";
import {
  OPERATIONAL_DOCS,
  appendHistoryEvent,
  findGitRoot,
  formatIso,
  getCurrentBranch,
  getHeadSha,
  getTrackedChangedFiles,
  loadAllTaskStates,
  loadTaskStateByBranch,
  parseArgs,
  runCommand,
  saveTaskState
} from "./lib/runtime.mjs";

/**
 * @param {string} repoRoot
 * @param {string} currentBranch
 * @param {{branch: string | null, cleanup: string | null, publishMain: string | null}} options
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
    return state;
  }

  if (currentBranch !== "main") {
    throw new Error(`task:finish:core works only on codex/* branches or on main for resume. Current branch: ${currentBranch}`);
  }

  const states = await loadAllTaskStates(repoRoot);
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
      return Boolean(state.commitSha) && state.cleanupDecision === null;
    }
    return false;
  });

  if (candidates.length === 1) {
    return candidates[0];
  }

  if (candidates.length === 0) {
    throw new Error("No resumable task state found on main. Provide --branch codex/<task-branch>.");
  }

  throw new Error(
    `Multiple resumable task states found: ${candidates.map((state) => state.branch).join(", ")}. ` +
    "Provide --branch codex/<task-branch>."
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
 * @param {string} repoRoot
 * @param {import("./lib/runtime.mjs").TaskState} state
 * @returns {Promise<boolean>}
 */
async function maybeReuseQa(repoRoot, state) {
  if (state.qaLastPassSha && state.qaLastPassSha === getHeadSha(repoRoot)) {
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
}

/**
 * @param {string} repoRoot
 * @param {import("./lib/runtime.mjs").TaskState} state
 * @returns {Promise<boolean>}
 */
async function maybeCommitAndPush(repoRoot, state) {
  if (state.commitSha) {
    return false;
  }

  runCommand(repoRoot, "node", ["scripts/worktree-operational-docs.mjs", "capture"]);
  await normalizeOperationalSnapshots(repoRoot);

  const changed = runCommand(repoRoot, "git", ["status", "--porcelain"], { allowFailure: true }).stdout.trim();
  if (!changed) {
    return false;
  }

  runCommand(repoRoot, "git", ["add", "-A"]);
  const message = await buildCommitMessage(repoRoot, state.title);
  runCommand(repoRoot, "git", ["commit", "-m", message]);
  state.commitSha = getHeadSha(repoRoot);
  await saveTaskState(repoRoot, state);

  let pushed = false;
  if (runCommand(repoRoot, "git", ["remote"], { allowFailure: true }).stdout.includes("origin")) {
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
      pushed
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
  if (!cleanup) {
    console.log("Finish complete. Re-run with --cleanup yes or --cleanup no.");
    return;
  }

  state.cleanupDecision = cleanup;
  state.finishedAt = formatIso();
  state.status = "finished";
  await saveTaskState(repoRoot, state);

  const cleanupPayload = {
    decision: cleanup,
    removed: false
  };

  if (cleanup === "yes") {
    const taskPath = state.worktreePath;
    const mainWorktreePath = state.mainWorktreePath ?? repoRoot;
    if (existsSync(taskPath)) {
      process.chdir(path.dirname(repoRoot));
      runCommand(mainWorktreePath, "git", ["worktree", "remove", taskPath, "--force"], { allowFailure: true });
    }
    runCommand(mainWorktreePath, "git", ["branch", "-D", state.branch], { allowFailure: true });
    cleanupPayload.removed = true;
  }

  await appendHistoryEvent(repoRoot, {
    at: formatIso(),
    type: "CLEANUP",
    taskId: state.taskId,
    branch: state.branch,
    payload: cleanupPayload
  });
  await appendHistoryEvent(repoRoot, {
    at: state.finishedAt,
    type: "FINISH",
    taskId: state.taskId,
    branch: state.branch,
    payload: {
      publishStatus: state.publishStatus ?? null,
      cleanupDecision: state.cleanupDecision
    }
  });
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = findGitRoot(process.cwd());
  const currentBranch = getCurrentBranch(repoRoot);
  const { flags } = parseArgs(process.argv.slice(2));
  const cleanup = typeof flags.cleanup === "string" ? flags.cleanup : null;
  const publishMain = typeof flags["publish-main"] === "string" ? flags["publish-main"] : null;
  const requestedBranch = typeof flags.branch === "string" ? flags.branch : null;
  const decision = typeof flags.decision === "string" ? flags.decision : null;

  if (decision && decision !== "retry") {
    throw new Error(`Unsupported --decision value: ${decision}. Expected retry.`);
  }
  if (publishMain && publishMain !== "retry") {
    throw new Error(`Unsupported --publish-main value: ${publishMain}. Expected retry.`);
  }
  if (cleanup && cleanup !== "yes" && cleanup !== "no") {
    throw new Error(`Unsupported --cleanup value: ${cleanup}. Expected yes or no.`);
  }

  const state = await resolveTaskState(repoRoot, currentBranch, {
    branch: requestedBranch,
    cleanup,
    publishMain
  });

  if (!state.commitSha) {
    await ensureTaskQa(repoRoot, state);
    await maybeCommitAndPush(state.worktreePath, state);
  }

  const publishAlreadyCompleted =
    ["pushed", "local-only"].includes(state.publishStatus ?? "") &&
    ["merged", "finished"].includes(state.status ?? "");
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
