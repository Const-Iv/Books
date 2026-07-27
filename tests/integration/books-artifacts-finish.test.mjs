// @ts-check

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  getHistoryPath,
  loadTaskStateByBranch,
  readNdjson,
  runCommand,
  saveTaskState
} from "../../scripts/lib/runtime.mjs";
import { createTempStarterRepo, runStarterScript } from "../helpers/temp-repo.mjs";

test("finish delete cleanup preserves ignored runtime books in main before removing task worktree", async () => {
  const fixture = await createTempStarterRepo();
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };
    const taskId = "20260508-084800-books";
    const branch = `codex/${taskId}-artifacts`;
    const worktreePath = path.join(fixture.codexHome, "worktrees", taskId, "repo-books-artifacts");
    const baseSha = runCommand(fixture.repoRoot, "git", ["rev-parse", "HEAD"]).stdout.trim();
    await mkdir(path.dirname(worktreePath), { recursive: true });
    runCommand(fixture.repoRoot, "git", ["worktree", "add", "-b", branch, worktreePath, "main"]);

    await saveTaskState(fixture.repoRoot, {
      taskId,
      title: "Books artifacts finish preserve",
      slug: "books-artifacts-finish-preserve",
      branch,
      sourceBranch: "main",
      baseSha,
      repoRoot: fixture.repoRoot,
      mainWorktreePath: fixture.repoRoot,
      worktreePath,
      createdAt: "2026-05-08T08:48:00.000Z",
      seedMessage: "Preserve Books runtime artifacts",
      status: "started",
      cleanupDecision: null,
      cleanupStatus: null,
      cleanupTargets: []
    });

    const taskBookDir = path.join(worktreePath, "runtime", "books", "sample-topic", "sample-book");
    const mainBookDir = path.join(fixture.repoRoot, "runtime", "books", "sample-topic", "sample-book");
    await mkdir(taskBookDir, { recursive: true });
    await mkdir(mainBookDir, { recursive: true });
    await writeFile(path.join(taskBookDir, "Sample - Author - original.txt"), "full local original\n", "utf8");
    await writeFile(path.join(taskBookDir, "Sample - Author - toolkit.md"), "# Shareable toolkit\n", "utf8");
    await writeFile(path.join(mainBookDir, "Sample - Author - toolkit.md"), "# Existing main toolkit\n", "utf8");

    const finished = runStarterScript(worktreePath, ["scripts/worktree-finish-core.mjs", "--cleanup", "1"], {
      env
    });
    assert.equal(finished.status, 0);

    assert.equal(existsSync(worktreePath), false);
    assert.equal(existsSync(path.dirname(worktreePath)), false);
    assert.equal(
      await readFile(
        path.join(fixture.repoRoot, "runtime", "books", "sample-topic", "sample-book", "Sample - Author - original.txt"),
        "utf8"
      ),
      "full local original\n"
    );
    assert.equal(
      await readFile(
        path.join(fixture.repoRoot, "runtime", "books", "sample-topic", "sample-book", "Sample - Author - toolkit.md"),
        "utf8"
      ),
      "# Existing main toolkit\n"
    );
    assert.equal(
      await readFile(
        path.join(
          fixture.repoRoot,
          "runtime",
          "books",
          "sample-topic",
          "sample-book",
          `Sample - Author - toolkit - from ${taskId}.md`
        ),
        "utf8"
      ),
      "# Shareable toolkit\n"
    );

    const state = await loadTaskStateByBranch(fixture.repoRoot, branch);
    assert.equal(state?.publishStatus, "skipped_already_merged");
    assert.equal(state?.cleanupDecision, "yes");
    assert.equal(state?.cleanupStatus, "passed");
    assert.equal(state?.mainVerificationStatus, "passed");
    assert.equal(state?.mainVerificationSha, runCommand(fixture.repoRoot, "git", ["rev-parse", "HEAD"]).stdout.trim());
    assert.equal(state?.postCleanupVerificationStatus, "passed");
    assert.notEqual(
      runCommand(fixture.repoRoot, "git", ["rev-parse", "--verify", `refs/heads/${branch}`], { allowFailure: true }).status,
      0
    );

    const events = await readNdjson(getHistoryPath(fixture.repoRoot));
    const preserveEvent = [...events].reverse().find((event) => event.type === "BOOKS_ARTIFACTS_PRESERVE");
    assert.ok(preserveEvent);
    assert.deepEqual(preserveEvent.payload.copied, ["sample-topic/sample-book/Sample - Author - original.txt"]);
    assert.deepEqual(preserveEvent.payload.conflictCopies, [
      {
        source: "sample-topic/sample-book/Sample - Author - toolkit.md",
        target: `sample-topic/sample-book/Sample - Author - toolkit - from ${taskId}.md`
      }
    ]);
    const mainVerify = [...events].reverse().find((event) => event.type === "MAIN_VERIFY" && event.branch === branch);
    assert.equal(mainVerify?.payload.status, "passed");
    const mainChecks = Array.isArray(mainVerify?.payload.checks)
      ? /** @type {Array<{id?: string}>} */ (mainVerify.payload.checks)
      : [];
    assert.equal(mainChecks.some((check) => check.id === "books_local_only_preservation"), true);
    const postCleanupVerify = [...events].reverse().find(
      (event) => event.type === "POST_CLEANUP_VERIFY" && event.branch === branch
    );
    assert.equal(postCleanupVerify?.payload.status, "passed");
    const postChecks = Array.isArray(postCleanupVerify?.payload.checks)
      ? /** @type {Array<{id?: string}>} */ (postCleanupVerify.payload.checks)
      : [];
    assert.equal(postChecks.some((check) => check.id === "post_cleanup_books_readback"), true);
    assert.equal(events.some((event) => event.type === "CLEANUP" && event.branch === branch), true);
  } finally {
    await fixture.cleanup();
  }
});
