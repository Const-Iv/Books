// @ts-check

import assert from "node:assert/strict";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { loadAllTaskStates, loadTaskStateByBranch } from "../../scripts/lib/runtime.mjs";
import { createTempStarterRepo, runStarterScript } from "../helpers/temp-repo.mjs";

test("task:start rejects dirty tree and does not allow --allow-dirty bypass", async () => {
  const fixture = await createTempStarterRepo();
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };
    await appendFile(path.join(fixture.repoRoot, "README.md"), "\nDirty tree guard.\n", "utf8");

    const start = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-start.mjs", "--title", "Dirty start guard", "--allow-dirty"],
      { env, allowFailure: true }
    );

    assert.notEqual(start.status, 0);
    assert.match(start.stderr, /--allow-dirty/);
    assert.match(start.stderr, /не создан|должно быть чистым/i);

    const states = await loadAllTaskStates(fixture.repoRoot);
    assert.equal(states.length, 0);
  } finally {
    await fixture.cleanup();
  }
});

test("task:start uses a readable slug from Cyrillic task title", async () => {
  const fixture = await createTempStarterRepo();
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };

    const start = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-start.mjs", "--title", "ЭХО", "--seed-message", "Worktree Create ЭХО"],
      { env }
    );
    const payload = JSON.parse(start.stdout);

    assert.match(payload.branch, /^codex\/\d{8}-\d{6}-[a-f0-9]+-echo$/);
    assert.equal(path.basename(payload.worktreePath), "repo-echo");

    const state = await loadTaskStateByBranch(fixture.repoRoot, payload.branch);
    assert.equal(state?.title, "ЭХО");
    assert.equal(state?.slug, "echo");
    assert.match(state?.seedMessage ?? "", /^\/goal\n\nGoal Seed/);
    assert.match(state?.seedMessage ?? "", /Исходный запрос владельца:\nWorktree Create ЭХО/);
  } finally {
    await fixture.cleanup();
  }
});

test("task:start can keep raw seed with explicit opt-out", async () => {
  const fixture = await createTempStarterRepo();
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };

    const start = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-start.mjs", "--title", "Raw seed", "--seed-message", "Raw message", "--no-goal-seed"],
      { env }
    );
    const payload = JSON.parse(start.stdout);

    const state = await loadTaskStateByBranch(fixture.repoRoot, payload.branch);
    assert.equal(state?.seedMessage, "Raw message");
  } finally {
    await fixture.cleanup();
  }
});
