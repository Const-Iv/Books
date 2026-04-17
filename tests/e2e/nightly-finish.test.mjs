// @ts-check

import assert from "node:assert/strict";
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
