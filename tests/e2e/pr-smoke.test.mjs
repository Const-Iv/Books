// @ts-check

import assert from "node:assert/strict";
import test from "node:test";

import { getHistoryPath, loadTaskStateByBranch, readNdjson } from "../../scripts/lib/runtime.mjs";
import { createTempStarterRepo, runStarterScript } from "../helpers/temp-repo.mjs";

test("PR smoke: task:start creates worktree and task:qa:agent records checkpoints", async () => {
  const fixture = await createTempStarterRepo({ installDependencies: true });
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };
    const started = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-start.mjs", "--title", "Starter smoke flow", "--seed-message", "Starter smoke flow"],
      { env }
    );
    const startPayload = JSON.parse(started.stdout);
    assert.match(startPayload.branch, /^codex\//);

    const qa = runStarterScript(startPayload.worktreePath, ["scripts/worktree-qa-agent.mjs"], { env });
    assert.equal(qa.status, 0);

    const state = await loadTaskStateByBranch(fixture.repoRoot, startPayload.branch);
    assert.ok(state);
    assert.ok(state?.qaLastPassSha);
    assert.ok(state?.previewPreparedSha);
    assert.equal(state?.preview?.status, "not_supported");

    const events = await readNdjson(getHistoryPath(fixture.repoRoot));
    assert.ok(events.some((event) => event.type === "QA_CHECKPOINT" && event.branch === startPayload.branch));
    assert.ok(events.some((event) => event.type === "PREVIEW_READY" && event.branch === startPayload.branch));
  } finally {
    await fixture.cleanup();
  }
});
