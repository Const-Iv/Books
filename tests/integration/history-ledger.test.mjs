// @ts-check

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  appendHistoryEvent,
  formatIso,
  saveTaskState
} from "../../scripts/lib/runtime.mjs";
import { createTempStarterRepo, runStarterScript } from "../helpers/temp-repo.mjs";

test("history and ledger commands rebuild Docs snapshots from runtime state", async () => {
  const fixture = await createTempStarterRepo({ installDependencies: true });
  try {
    /** @type {import("../../scripts/lib/runtime.mjs").TaskState} */
    const state = {
      taskId: "task-docs",
      title: "Docs rebuild",
      slug: "docs-rebuild",
      branch: "codex/task-docs",
      sourceBranch: "main",
      repoRoot: fixture.repoRoot,
      worktreePath: path.join(fixture.repoRoot, "tmp-worktree"),
      createdAt: formatIso(),
      seedMessage: "docs",
      status: "started",
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
      type: "START",
      taskId: state.taskId,
      branch: state.branch,
      payload: { title: state.title }
    });

    runStarterScript(fixture.repoRoot, ["scripts/worktree-history.mjs", "sync"]);
    runStarterScript(fixture.repoRoot, ["scripts/worktree-ledger.mjs", "rebuild", "--write-docs"]);

    const taskHistory = await readFile(path.join(fixture.repoRoot, "Docs/task-history.md"), "utf8");
    const ledger = await readFile(path.join(fixture.repoRoot, "Docs/change-ledger.md"), "utf8");
    assert.match(taskHistory, /task-docs/);
    assert.match(ledger, /codex\/task-docs/);
  } finally {
    await fixture.cleanup();
  }
});
