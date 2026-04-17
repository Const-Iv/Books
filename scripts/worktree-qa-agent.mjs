// @ts-check

import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { ensureDependencies } from "./dependency-preflight.mjs";
import { evaluateTrizTriggers, recordTrizTrigger } from "./triz-trigger.mjs";
import {
  appendHistoryEvent,
  findGitRoot,
  formatIso,
  getCurrentBranch,
  getHeadSha,
  loadTaskStateByBranch,
  runCommand,
  saveTaskState
} from "./lib/runtime.mjs";

/**
 * @param {import("./lib/runtime.mjs").QaResult} result
 * @returns {string}
 */
function classifyFailure(result) {
  if (result.failedStage === "lint" || result.failedStage === "lint-recheck" || result.failedStage === "typecheck") {
    return "task_regression";
  }
  if (result.failedStage === "test" || result.failedStage === "build") {
    return "task_regression";
  }
  return "infra_blocker";
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = findGitRoot(process.cwd());
  const branch = getCurrentBranch(repoRoot);
  if (!branch.startsWith("codex/")) {
    throw new Error(`task:qa:agent works only on codex/* branches. Current branch: ${branch || "(empty)"}`);
  }
  const state = await loadTaskStateByBranch(repoRoot, branch);
  if (!state) {
    throw new Error(`Task state not found for branch ${branch}`);
  }

  await ensureDependencies(repoRoot);
  const summaryDir = await mkdtemp(path.join(os.tmpdir(), "starter-qa-"));
  const summaryPath = path.join(summaryDir, "summary.json");
  const result = runCommand(repoRoot, "node", ["scripts/deterministic-feedback-loop.mjs"], {
    allowFailure: true,
    env: { QA_AGENT_SUMMARY_PATH: summaryPath }
  });
  const summary = /** @type {import("./lib/runtime.mjs").QaResult} */ (JSON.parse(await readFile(summaryPath, "utf8")));
  const headSha = getHeadSha(repoRoot);
  const timestamp = formatIso();

  if (result.status === 0) {
    state.status = "qa_pass";
    state.qaLastPassSha = headSha;
    state.qaLastPassAt = timestamp;
    state.previewPreparedSha = headSha;
    state.preview = {
      status: "not_supported",
      frontendUrl: null,
      backendHealthUrl: null,
      reason: "Starter baseline does not ship an application preview."
    };
  } else {
    state.status = "qa_fail";
    state.lastQaResult = {
      ...summary,
      failureClass: classifyFailure(summary)
    };
  }
  state.lastQaResult = {
    ...summary,
    failureClass: result.status === 0 ? null : classifyFailure(summary)
  };
  await saveTaskState(repoRoot, state);

  await appendHistoryEvent(repoRoot, {
    at: timestamp,
    type: "QA_ATTEMPT",
    taskId: state.taskId,
    branch: state.branch,
    payload: {
      status: summary.status,
      failedStage: summary.failedStage,
      failureClass: state.lastQaResult.failureClass
    }
  });

  if (result.status === 0) {
    await appendHistoryEvent(repoRoot, {
      at: timestamp,
      type: "QA_CHECKPOINT",
      taskId: state.taskId,
      branch: state.branch,
      payload: {
        status: summary.status,
        qaLastPassSha: state.qaLastPassSha,
        qaLastPassAt: state.qaLastPassAt
      }
    });
    await appendHistoryEvent(repoRoot, {
      at: timestamp,
      type: "PREVIEW_READY",
      taskId: state.taskId,
      branch: state.branch,
      payload: {
        previewStatus: state.preview?.status ?? null,
        previewPreparedSha: state.previewPreparedSha,
        frontendUrl: state.preview?.frontendUrl ?? null,
        backendHealthUrl: state.preview?.backendHealthUrl ?? null,
        reason: state.preview?.reason ?? null
      }
    });
  }

  const reasons = await evaluateTrizTriggers(repoRoot, state);
  await recordTrizTrigger(repoRoot, state, reasons);

  console.log(JSON.stringify({ status: summary.status, failedStage: summary.failedStage, reasons }, null, 2));
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

await main();
