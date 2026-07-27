// @ts-check

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, stat, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  getHistoryPath,
  getTaskArtifactsDir,
  loadTaskStateByBranch,
  readNdjson,
  runCommand,
  saveTaskState
} from "../../scripts/lib/runtime.mjs";
import { createTempStarterRepo, runStarterScript } from "../helpers/temp-repo.mjs";

// These managed-flow scenarios exercise scripts/lib/finish-verification.mjs
// through the real worktree-finish entrypoint, including its pre/post hooks.

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

test("finish detects protected empty-directory permission drift caused by the post-cleanup hook", async () => {
  const fixture = await createTempStarterRepo();
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };
    const packagePath = path.join(fixture.repoRoot, "package.json");
    const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
    packageJson.scripts["task:finish:verify:post"] =
      "node scripts/test-mutating-finish-hook.mjs";
    await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
    await writeFile(
      path.join(fixture.repoRoot, "scripts", "test-mutating-finish-hook.mjs"),
      [
        "// @ts-check",
        "",
        'import { chmodSync } from "node:fs";',
        'import path from "node:path";',
        "",
        'const runtimeRoot = path.join(process.cwd(), "runtime", "books");',
        'for (const directory of [".knowledge", ".response-manifests"]) {',
        "  chmodSync(path.join(runtimeRoot, directory), 0o755);",
        "}",
        'chmodSync(path.join(runtimeRoot, ".response-manifests", "old.json"), 0o644);',
        "console.log(JSON.stringify({",
        "  version: 1,",
        '  status: "passed",',
        '  checks: [{ id: "mutating_test_hook", status: "passed", details: "mutation attempted" }],',
        "  blocked: [],",
        "  notes: [],",
        "  runtimeSourcePaths: [runtimeRoot]",
        "}));",
        ""
      ].join("\n"),
      "utf8"
    );
    runCommand(fixture.repoRoot, "git", ["add", "package.json", "scripts/test-mutating-finish-hook.mjs"]);
    runCommand(fixture.repoRoot, "git", ["commit", "-m", "Test mutating post-cleanup hook"]);

    const taskId = "20260508-084801-books-modes";
    const branch = `codex/${taskId}-artifacts`;
    const worktreePath = path.join(fixture.codexHome, "worktrees", taskId, "repo-books-artifacts-modes");
    const baseSha = runCommand(fixture.repoRoot, "git", ["rev-parse", "HEAD"]).stdout.trim();
    await mkdir(path.dirname(worktreePath), { recursive: true });
    runCommand(fixture.repoRoot, "git", ["worktree", "add", "-b", branch, worktreePath, "main"]);
    await saveTaskState(fixture.repoRoot, {
      taskId,
      title: "Books empty protected directory verification",
      slug: "books-empty-protected-directory-verification",
      branch,
      sourceBranch: "main",
      baseSha,
      repoRoot: fixture.repoRoot,
      mainWorktreePath: fixture.repoRoot,
      worktreePath,
      createdAt: "2026-05-08T08:48:01.000Z",
      seedMessage: "Verify protected empty directories after runtime hook",
      status: "started",
      cleanupDecision: null,
      cleanupStatus: null,
      cleanupTargets: []
    });

    for (const directory of [".knowledge", ".response-manifests"]) {
      const taskDirectory = path.join(worktreePath, "runtime", "books", directory);
      await mkdir(taskDirectory, { recursive: true, mode: 0o700 });
      await chmod(taskDirectory, 0o700);
    }
    const mainResponses = path.join(
      fixture.repoRoot,
      "runtime",
      "books",
      ".response-manifests"
    );
    await mkdir(mainResponses, { recursive: true, mode: 0o700 });
    await chmod(mainResponses, 0o700);
    await writeFile(path.join(mainResponses, "old.json"), "historical hash-only manifest\n", {
      encoding: "utf8",
      mode: 0o600
    });
    await chmod(path.join(mainResponses, "old.json"), 0o600);

    const finished = runStarterScript(
      worktreePath,
      ["scripts/worktree-finish-core.mjs", "--cleanup", "1"],
      { env, allowFailure: true }
    );
    assert.notEqual(finished.status, 0);
    assert.match(
      `${finished.stdout}\n${finished.stderr}`,
      /Protected Books directory permissions changed after cleanup/
    );

    const state = await loadTaskStateByBranch(fixture.repoRoot, branch);
    assert.equal(state?.mainVerificationStatus, "passed");
    assert.equal(state?.postCleanupVerificationStatus, "failed");
    assert.equal(state?.cleanupStatus, "failed");
    assert.equal(existsSync(worktreePath), false);

    const preResult = JSON.parse(
      await readFile(
        path.join(
          getTaskArtifactsDir(fixture.repoRoot, taskId),
          "finish-verification-pre_cleanup-result.json"
        ),
        "utf8"
      )
    );
    const preDirectories = /** @type {Array<{target: string}>} */ (
      preResult.preservedDirectories
    );
    assert.deepEqual(
      preDirectories.map((entry) => entry.target).sort(),
      [".knowledge", ".response-manifests"]
    );
    const preArtifacts = /** @type {Array<{target: string}>} */ (
      preResult.preservedArtifacts
    );
    assert.deepEqual(
      preArtifacts.map((entry) => entry.target),
      [".response-manifests/old.json"]
    );
    for (const directory of [".knowledge", ".response-manifests"]) {
      assert.equal(
        (await stat(path.join(fixture.repoRoot, "runtime", "books", directory))).mode & 0o777,
        0o755
      );
    }
    assert.equal((await stat(path.join(mainResponses, "old.json"))).mode & 0o777, 0o644);
  } finally {
    await fixture.cleanup();
  }
});

test("finish blocks a source runtime component symlink before cleanup or external read", async () => {
  const fixture = await createTempStarterRepo();
  try {
    const env = {
      CODEX_HOME: fixture.codexHome,
      STARTER_NO_OPEN: "1"
    };
    const taskId = "20260508-084802-books-source-link";
    const branch = `codex/${taskId}-artifacts`;
    const worktreePath = path.join(fixture.codexHome, "worktrees", taskId, "repo-books-source-link");
    const baseSha = runCommand(fixture.repoRoot, "git", ["rev-parse", "HEAD"]).stdout.trim();
    await mkdir(path.dirname(worktreePath), { recursive: true });
    runCommand(fixture.repoRoot, "git", ["worktree", "add", "-b", branch, worktreePath, "main"]);
    await saveTaskState(fixture.repoRoot, {
      taskId,
      title: "Books source runtime symlink guard",
      slug: "books-source-runtime-symlink-guard",
      branch,
      sourceBranch: "main",
      baseSha,
      repoRoot: fixture.repoRoot,
      mainWorktreePath: fixture.repoRoot,
      worktreePath,
      createdAt: "2026-05-08T08:48:02.000Z",
      seedMessage: "Reject source runtime symlink before cleanup",
      status: "started",
      cleanupDecision: null,
      cleanupStatus: null,
      cleanupTargets: []
    });

    const outsideRuntime = path.join(path.dirname(fixture.repoRoot), "external-runtime");
    const outsideKnowledge = path.join(outsideRuntime, "books", ".knowledge");
    await mkdir(outsideKnowledge, { recursive: true, mode: 0o700 });
    await chmod(outsideKnowledge, 0o700);
    await writeFile(path.join(outsideKnowledge, "trusted-scope.json"), "external scope\n", {
      encoding: "utf8",
      mode: 0o600
    });
    await chmod(path.join(outsideKnowledge, "trusted-scope.json"), 0o600);
    await symlink(outsideRuntime, path.join(worktreePath, "runtime"));

    const finished = runStarterScript(
      worktreePath,
      ["scripts/worktree-finish-core.mjs", "--cleanup", "1"],
      { env, allowFailure: true }
    );
    assert.notEqual(finished.status, 0);
    assert.match(
      `${finished.stdout}\n${finished.stderr}`,
      /Task runtime must be a regular ignored directory/
    );
    assert.equal(existsSync(worktreePath), true);
    const mainScopePath = path.join(
      fixture.repoRoot,
      "runtime",
      "books",
      ".knowledge",
      "trusted-scope.json"
    );
    assert.equal(existsSync(mainScopePath), false);
    assert.equal(
      await readFile(path.join(outsideKnowledge, "trusted-scope.json"), "utf8"),
      "external scope\n"
    );

    const state = await loadTaskStateByBranch(fixture.repoRoot, branch);
    assert.equal(state?.commitSha, undefined);
    assert.equal(state?.publishStatus, undefined);
    assert.equal(state?.mainVerificationStatus, undefined);
    assert.equal(state?.cleanupStatus, null);
  } finally {
    await fixture.cleanup();
  }
});
