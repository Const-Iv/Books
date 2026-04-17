// @ts-check

import assert from "node:assert/strict";
import { appendFile } from "node:fs/promises";
import test from "node:test";

import { evaluateTrizTriggers } from "../../scripts/triz-trigger.mjs";
import { appendHistoryEvent, formatIso, saveTaskState } from "../../scripts/lib/runtime.mjs";
import { createTempStarterRepo } from "../helpers/temp-repo.mjs";

test("triz trigger detects repeated QA failures and cross-zone changes", async () => {
  const fixture = await createTempStarterRepo();
  try {
    /** @type {import("../../scripts/lib/runtime.mjs").TaskState} */
    const state = {
      taskId: "task-triz",
      title: "Runtime governance hardening",
      slug: "runtime-governance-hardening",
      branch: "main",
      sourceBranch: "main",
      repoRoot: fixture.repoRoot,
      worktreePath: fixture.repoRoot,
      createdAt: formatIso(),
      seedMessage: "trigger test",
      status: "qa_fail",
      qaLastPassSha: null,
      previewPreparedSha: null,
      preview: null,
      lastQaResult: null,
      commitSha: null,
      publishStatus: "pending",
      cleanupDecision: null,
      operationalArtifacts: [],
      mainWorktreePath: fixture.repoRoot
    };
    await saveTaskState(fixture.repoRoot, state);
    await appendHistoryEvent(fixture.repoRoot, {
      at: formatIso(),
      type: "QA_ATTEMPT",
      taskId: state.taskId,
      branch: state.branch,
      payload: { status: "FAIL", failedStage: "test" }
    });
    await appendHistoryEvent(fixture.repoRoot, {
      at: formatIso(),
      type: "QA_ATTEMPT",
      taskId: state.taskId,
      branch: state.branch,
      payload: { status: "FAIL", failedStage: "test" }
    });

    await appendFile(`${fixture.repoRoot}/scripts/README.md`, "\nHardening update\n", "utf8");
    await appendFile(`${fixture.repoRoot}/Docs/change-ledger.md`, "\nRuntime governance hardening\n", "utf8");

    const reasons = await evaluateTrizTriggers(fixture.repoRoot, state);
    assert.ok(reasons.includes("qa_repeat_stage"));
    assert.ok(reasons.includes("cross_module_conflict"));
    assert.ok(reasons.includes("historical_recurrence"));
  } finally {
    await fixture.cleanup();
  }
});
