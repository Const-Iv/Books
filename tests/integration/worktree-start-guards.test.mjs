// @ts-check

import assert from "node:assert/strict";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { loadAllTaskStates } from "../../scripts/lib/runtime.mjs";
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
