// @ts-check

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { getHistoryPath, loadTaskStateByBranch, readNdjson } from "../../scripts/lib/runtime.mjs";
import { createTempStarterRepo, runStarterScript } from "../helpers/temp-repo.mjs";

test("Nightly: finish blocks on failed QA and then merges cleanly into main", async () => {
  const fixture = await createTempStarterRepo({ installDependencies: true });
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };
    const started = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-start.mjs", "--title", "Finish merge flow", "--seed-message", "Finish merge flow"],
      { env }
    );
    const startPayload = JSON.parse(started.stdout);
    const worktreeReadme = path.join(startPayload.worktreePath, "README.md");
    const originalReadme = await readFile(worktreeReadme, "utf8");
    await writeFile(worktreeReadme, `${originalReadme.trimEnd()}   \n`, "utf8");

    const failedFinish = runStarterScript(startPayload.worktreePath, ["scripts/worktree-finish-core.mjs"], {
      env,
      allowFailure: true
    });
    assert.notEqual(failedFinish.status, 0);

    await appendFile(worktreeReadme, "\nValidated finish flow.\n", "utf8");
    await writeFile(worktreeReadme, `${(await readFile(worktreeReadme, "utf8")).replace(/[ \t]+$/gm, "").trimEnd()}\n`, "utf8");
    const qaCheckpoint = runStarterScript(startPayload.worktreePath, ["scripts/worktree-qa-agent.mjs"], { env });
    assert.equal(qaCheckpoint.status, 0);

    const resumed = runStarterScript(
      startPayload.worktreePath,
      ["scripts/worktree-finish-core.mjs", "--cleanup", "no"],
      { env }
    );
    assert.equal(resumed.status, 0);

    const state = await loadTaskStateByBranch(fixture.repoRoot, startPayload.branch);
    assert.ok(state?.commitSha);
    assert.equal(state?.publishStatus, "local-only");

    const mainReadme = await readFile(path.join(fixture.repoRoot, "README.md"), "utf8");
    assert.match(mainReadme, /Validated finish flow\./);

    const events = await readNdjson(getHistoryPath(fixture.repoRoot));
    assert.ok(events.some((event) => event.type === "QA_REUSE" && event.branch === startPayload.branch));
    assert.ok(events.some((event) => event.type === "MERGE_MAIN" && event.branch === startPayload.branch));
    assert.ok(events.some((event) => event.type === "PUSH_MAIN" && event.branch === startPayload.branch));
    assert.ok(events.some((event) => event.type === "FINISH" && event.branch === startPayload.branch));
  } finally {
    await fixture.cleanup();
  }
});

test("Nightly: finish cleanup prunes the empty managed task root", async () => {
  const fixture = await createTempStarterRepo({ installDependencies: true });
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };
    const started = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-start.mjs", "--title", "Finish cleanup prune", "--seed-message", "Finish cleanup prune"],
      { env }
    );
    const startPayload = JSON.parse(started.stdout);
    const worktreeReadme = path.join(startPayload.worktreePath, "README.md");
    const taskRoot = path.dirname(startPayload.worktreePath);

    await appendFile(worktreeReadme, "\nValidated cleanup prune.\n", "utf8");
    const qaCheckpoint = runStarterScript(startPayload.worktreePath, ["scripts/worktree-qa-agent.mjs"], { env });
    assert.equal(qaCheckpoint.status, 0);

    const finished = runStarterScript(
      startPayload.worktreePath,
      ["scripts/worktree-finish-core.mjs", "--cleanup", "yes"],
      { env }
    );
    assert.equal(finished.status, 0);
    assert.equal(existsSync(startPayload.worktreePath), false);
    assert.equal(existsSync(taskRoot), false);
  } finally {
    await fixture.cleanup();
  }
});

test("Nightly: finish accepts numeric cleanup choices", async () => {
  const fixture = await createTempStarterRepo({ installDependencies: true });
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };
    const startedKeep = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-start.mjs", "--title", "Finish cleanup keep numeric", "--seed-message", "Finish cleanup keep numeric"],
      { env }
    );
    const keepPayload = JSON.parse(startedKeep.stdout);
    const keepReadme = path.join(keepPayload.worktreePath, "README.md");
    await appendFile(keepReadme, "\nValidated numeric keep cleanup.\n", "utf8");
    assert.equal(runStarterScript(keepPayload.worktreePath, ["scripts/worktree-qa-agent.mjs"], { env }).status, 0);

    const kept = runStarterScript(
      keepPayload.worktreePath,
      ["scripts/worktree-finish-core.mjs", "--cleanup", "2"],
      { env }
    );
    assert.equal(kept.status, 0);
    assert.equal(existsSync(keepPayload.worktreePath), true);

    const keepState = await loadTaskStateByBranch(fixture.repoRoot, keepPayload.branch);
    assert.equal(keepState?.cleanupDecision, "no");

    const startedDelete = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-start.mjs", "--title", "Finish cleanup delete numeric", "--seed-message", "Finish cleanup delete numeric"],
      { env }
    );
    const deletePayload = JSON.parse(startedDelete.stdout);
    const deleteReadme = path.join(deletePayload.worktreePath, "README.md");
    const deleteTaskRoot = path.dirname(deletePayload.worktreePath);
    await appendFile(deleteReadme, "\nValidated numeric delete cleanup.\n", "utf8");
    assert.equal(runStarterScript(deletePayload.worktreePath, ["scripts/worktree-qa-agent.mjs"], { env }).status, 0);

    const deleted = runStarterScript(
      deletePayload.worktreePath,
      ["scripts/worktree-finish-core.mjs", "--cleanup", "1"],
      { env }
    );
    assert.equal(deleted.status, 0);
    assert.equal(existsSync(deletePayload.worktreePath), false);
    assert.equal(existsSync(deleteTaskRoot), false);

    const deleteState = await loadTaskStateByBranch(fixture.repoRoot, deletePayload.branch);
    assert.equal(deleteState?.cleanupDecision, "yes");
  } finally {
    await fixture.cleanup();
  }
});
