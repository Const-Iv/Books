// @ts-check

import assert from "node:assert/strict";
import { appendFile, chmod, mkdir, readFile, writeFile } from "node:fs/promises";
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

test("task:start reports Codex open attempt separately from verified chat creation", async () => {
  const fixture = await createTempStarterRepo();
  try {
    const fakeBin = path.join(fixture.codexHome, "bin");
    await mkdir(fakeBin, { recursive: true });
    const fakeCodex = path.join(fakeBin, "codex");
    await writeFile(fakeCodex, "#!/bin/sh\nexit 0\n", "utf8");
    await chmod(fakeCodex, 0o755);
    const openLog = path.join(fixture.codexHome, "open.log");
    const fakeOpen = path.join(fakeBin, "open");
    await writeFile(fakeOpen, "#!/bin/sh\nprintf '%s\\n' \"$1\" > \"$OPEN_LOG\"\nexit 0\n", "utf8");
    await chmod(fakeOpen, 0o755);

    const env = {
      CODEX_HOME: fixture.codexHome,
      PATH: `${fakeBin}:${process.env.PATH ?? ""}`,
      OPEN_LOG: openLog
    };

    const start = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-start.mjs", "--title", "Open verification", "--seed-message", "Open verification"],
      { env }
    );
    const payload = JSON.parse(start.stdout);

    assert.equal(payload.openAttempted, true);
    assert.equal(payload.openStatus, "unverified");
    assert.equal(payload.openedChat, false);
    assert.match(payload.openDiagnostics, /No Codex thread was observed/);
    if (process.platform === "darwin") {
      const deepLinkUrl = await readFile(openLog, "utf8");
      assert.match(deepLinkUrl, /^codex:\/\/new\?path=/);
      assert.match(deepLinkUrl, /prompt=/);
      assert.match(deepLinkUrl, /Open\+verification/);
      assert.match(payload.openCommand, /codex:\/\/new/);
      assert.match(payload.openDiagnostics, /deep link opened the target worktree composer/);
    }

    const state = await loadTaskStateByBranch(fixture.repoRoot, payload.branch);
    assert.equal(state?.openAttempted, true);
    assert.equal(state?.openStatus, "unverified");
    assert.equal(state?.openedChat, false);
    assert.match(state?.openDiagnostics ?? "", /No Codex thread was observed/);
  } finally {
    await fixture.cleanup();
  }
});
