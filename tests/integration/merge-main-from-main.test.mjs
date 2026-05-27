// @ts-check

import assert from "node:assert/strict";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { captureOperationalDocs } from "../../scripts/lib/doc-utils.mjs";
import {
  getPipelinePaths,
  getHistoryPath,
  getHeadSha,
  loadTaskStateByBranch,
  readNdjson,
  runCommand,
  saveTaskState
} from "../../scripts/lib/runtime.mjs";
import { createTempStarterRepo, runStarterScript } from "../helpers/temp-repo.mjs";

test("task:merge:main can merge a committed task branch when started from main", async () => {
  const fixture = await createTempStarterRepo({ installDependencies: true });
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };
    const started = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-start.mjs", "--title", "Merge from main", "--seed-message", "Merge from main"],
      { env }
    );
    const startPayload = JSON.parse(started.stdout);
    const worktreeReadme = path.join(startPayload.worktreePath, "README.md");
    await appendFile(worktreeReadme, "\nMerged from main test.\n", "utf8");
    runCommand(startPayload.worktreePath, "git", ["add", "README.md"]);
    runCommand(startPayload.worktreePath, "git", ["commit", "-m", "Ver. 4.00 docs: merge from main test | билд прошел"]);

    const state = await loadTaskStateByBranch(fixture.repoRoot, startPayload.branch);
    assert.ok(state);
    state.commitSha = getHeadSha(startPayload.worktreePath);
    await saveTaskState(fixture.repoRoot, state);

    const archiveBefore = new Set(
      runCommand(fixture.repoRoot, "git", ["ls-files", "Docs/archive"]).stdout.split("\n").filter(Boolean)
    );
    const sections = Array.from({ length: 35 }, (_, index) => {
      const entry = String(index + 1).padStart(2, "0");
      return [`## Merge Archive Entry ${entry}`, "", `- Evidence ${entry}`].join("\n");
    });
    await writeFile(
      path.join(startPayload.worktreePath, "Docs", "triz-usage-log.md"),
      ["# TRIZ Usage Log", "", ...sections].join("\n\n"),
      "utf8"
    );
    await captureOperationalDocs(
      startPayload.worktreePath,
      state.taskId,
      state.branch,
      path.join(getPipelinePaths(fixture.repoRoot).artifactsDir, state.taskId)
    );

    const merged = runStarterScript(
      fixture.repoRoot,
      ["scripts/worktree-merge-main.mjs", "--branch", startPayload.branch],
      { env }
    );
    assert.equal(merged.status, 0);

    const mainReadme = await readFile(path.join(fixture.repoRoot, "README.md"), "utf8");
    assert.match(mainReadme, /Merged from main test\./);
    assert.equal(runCommand(fixture.repoRoot, "git", ["status", "--porcelain"]).stdout, "");
    const archiveAfter = runCommand(fixture.repoRoot, "git", ["ls-files", "Docs/archive"]).stdout
      .split("\n")
      .filter(Boolean);
    const newArchives = archiveAfter.filter((filePath) => !archiveBefore.has(filePath));
    assert.ok(newArchives.some((filePath) => /^Docs\/archive\/triz-usage-log-.*\.md\.gz$/.test(filePath)));

    const refreshed = await loadTaskStateByBranch(fixture.repoRoot, startPayload.branch);
    assert.equal(refreshed?.publishStatus, "local-only");

    const events = await readNdjson(getHistoryPath(fixture.repoRoot));
    assert.ok(events.some((event) => event.type === "MERGE_MAIN" && event.branch === startPayload.branch));
    assert.ok(events.some((event) => event.type === "PUSH_MAIN" && event.branch === startPayload.branch));
  } finally {
    await fixture.cleanup();
  }
});
