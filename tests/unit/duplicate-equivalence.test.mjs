// @ts-check

import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  classifyParallelCommitResult,
  getNameStatusDiff,
  proveParallelDuplicateCommit
} from "../../scripts/lib/duplicate-equivalence.mjs";
import { verifyTrackedEquivalence } from "../../scripts/lib/finish-verification.mjs";
import { runCommand } from "../../scripts/lib/runtime.mjs";

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "books-duplicate-equivalence-"));
  runCommand(root, "git", ["init", "-b", "main"]);
  runCommand(root, "git", ["config", "user.email", "test@example.com"]);
  runCommand(root, "git", ["config", "user.name", "Test User"]);
  await writeFile(path.join(root, "result.txt"), "base\n", "utf8");
  runCommand(root, "git", ["add", "result.txt"]);
  runCommand(root, "git", ["commit", "-m", "base"]);
  const baseSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

  runCommand(root, "git", ["switch", "-c", "task"]);
  await writeFile(path.join(root, "result.txt"), "accepted\n", "utf8");
  runCommand(root, "git", ["commit", "-am", "task result"]);
  const taskSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

  runCommand(root, "git", ["switch", "main"]);
  await writeFile(path.join(root, "result.txt"), "accepted\n", "utf8");
  runCommand(root, "git", ["commit", "-am", "parallel result"]);
  const replacementSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

  return { root, baseSha, taskSha, replacementSha };
}

test("parallel duplicate proof returns exact_duplicate for distinct same-parent commits with identical blobs", async () => {
  const fixture = await createFixture();
  try {
    const assessment = classifyParallelCommitResult(fixture.root, fixture.taskSha, fixture.replacementSha, "main");
    assert.equal(assessment.status, "exact_duplicate");
    assert.deepEqual(assessment.proof, {
      taskCommitSha: fixture.taskSha,
      replacementCommitSha: fixture.replacementSha,
      baseSha: fixture.baseSha,
      changedFiles: ["result.txt"]
    });
    assert.deepEqual(
      proveParallelDuplicateCommit(fixture.root, fixture.taskSha, fixture.replacementSha, "main"),
      assessment.proof
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("parallel duplicate proof returns different_results for blob or name-status differences", async () => {
  const fixture = await createFixture();
  try {
    runCommand(fixture.root, "git", ["switch", "-c", "different-blob", fixture.baseSha]);
    await writeFile(path.join(fixture.root, "result.txt"), "different\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "different blob"]);
    const differentBlobSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    const blobAssessment = classifyParallelCommitResult(
      fixture.root,
      differentBlobSha,
      fixture.replacementSha,
      "main"
    );
    assert.equal(blobAssessment.status, "different_results");
    assert.match(blobAssessment.reason, /tree-entry mismatch/);

    runCommand(fixture.root, "git", ["switch", "-c", "different-path", fixture.baseSha]);
    await writeFile(path.join(fixture.root, "other.txt"), "accepted\n", "utf8");
    runCommand(fixture.root, "git", ["add", "other.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "different path"]);
    const differentPathSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    const pathAssessment = classifyParallelCommitResult(
      fixture.root,
      differentPathSha,
      fixture.replacementSha,
      "main"
    );
    assert.equal(pathAssessment.status, "different_results");
    assert.match(pathAssessment.reason, /name-status/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("parallel duplicate proof rejects mode-only tree-entry differences with identical blobs", async () => {
  const fixture = await createFixture();
  try {
    runCommand(fixture.root, "git", ["switch", "-c", "different-mode", fixture.baseSha]);
    await writeFile(path.join(fixture.root, "result.txt"), "accepted\n", "utf8");
    runCommand(fixture.root, "git", ["add", "result.txt"]);
    runCommand(fixture.root, "git", ["update-index", "--chmod=+x", "result.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "different mode"]);
    const differentModeSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();

    assert.equal(
      runCommand(fixture.root, "git", ["rev-parse", `${differentModeSha}:result.txt`]).stdout.trim(),
      runCommand(fixture.root, "git", ["rev-parse", `${fixture.replacementSha}:result.txt`]).stdout.trim()
    );
    const assessment = classifyParallelCommitResult(
      fixture.root,
      differentModeSha,
      fixture.replacementSha,
      "main"
    );
    assert.equal(assessment.status, "different_results");
    assert.match(assessment.reason, /tree-entry mismatch/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("normal tracked-main equivalence rejects a mode-only successor change with the same blob", async () => {
  const fixture = await createFixture();
  try {
    runCommand(fixture.root, "git", ["switch", "-C", "normal-main", fixture.taskSha]);
    runCommand(fixture.root, "git", ["update-index", "--chmod=+x", "result.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "mode-only successor"]);

    assert.equal(
      runCommand(fixture.root, "git", ["rev-parse", `${fixture.taskSha}:result.txt`]).stdout.trim(),
      runCommand(fixture.root, "git", ["rev-parse", "HEAD:result.txt"]).stdout.trim()
    );
    const failures = verifyTrackedEquivalence(
      fixture.root,
      /** @type {import("../../scripts/lib/runtime.mjs").TaskState} */ ({
        baseSha: fixture.baseSha,
        commitSha: fixture.taskSha
      }),
      ["result.txt"]
    );
    assert.deepEqual(failures, ["Tracked main mismatch: result.txt"]);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("tree-entry proof handles tab and newline filenames without skipping the real path", async () => {
  const fixture = await createFixture();
  const weirdPath = "tab\tand-newline\nresult.txt";
  try {
    runCommand(fixture.root, "git", ["switch", "-c", "weird-task", fixture.baseSha]);
    await writeFile(path.join(fixture.root, weirdPath), "task bytes\n", "utf8");
    runCommand(fixture.root, "git", ["add", "--", weirdPath]);
    runCommand(fixture.root, "git", ["commit", "-m", "weird task path"]);
    const weirdTaskSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();

    runCommand(fixture.root, "git", ["switch", "-c", "weird-replacement", fixture.baseSha]);
    await writeFile(path.join(fixture.root, weirdPath), "replacement bytes\n", "utf8");
    runCommand(fixture.root, "git", ["add", "--", weirdPath]);
    runCommand(fixture.root, "git", ["commit", "-m", "weird replacement path"]);
    const weirdReplacementSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();

    const duplicateAssessment = classifyParallelCommitResult(
      fixture.root,
      weirdTaskSha,
      weirdReplacementSha,
      "weird-replacement"
    );
    assert.equal(duplicateAssessment.status, "different_results");
    assert.match(duplicateAssessment.reason, /tree-entry mismatch/);

    runCommand(fixture.root, "git", ["switch", "-C", "weird-normal-main", weirdTaskSha]);
    await writeFile(path.join(fixture.root, weirdPath), "normal successor bytes\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "weird normal successor"]);
    const normalFailures = verifyTrackedEquivalence(
      fixture.root,
      /** @type {import("../../scripts/lib/runtime.mjs").TaskState} */ ({
        baseSha: fixture.baseSha,
        commitSha: weirdTaskSha
      }),
      [weirdPath]
    );
    assert.deepEqual(normalFailures, [`Tracked main mismatch: ${weirdPath}`]);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("NUL name-status parsing keeps both paths for a rename with a weird filename", async () => {
  const fixture = await createFixture();
  const weirdPath = "renamed\twith-newline\nresult.txt";
  try {
    runCommand(fixture.root, "git", ["switch", "-c", "weird-rename", fixture.baseSha]);
    runCommand(fixture.root, "git", ["mv", "--", "result.txt", weirdPath]);
    runCommand(fixture.root, "git", ["commit", "-m", "rename to weird path"]);
    const renamedSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();

    const diff = getNameStatusDiff(fixture.root, fixture.baseSha, renamedSha);
    assert.match(diff.raw, /^R100\0/);
    assert.deepEqual(diff.files, ["result.txt", weirdPath]);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("parallel duplicate proof treats the same tracked deletion as an exact result", async () => {
  const fixture = await createFixture();
  try {
    runCommand(fixture.root, "git", ["switch", "-c", "delete-task", fixture.baseSha]);
    runCommand(fixture.root, "git", ["rm", "--", "result.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "delete task result"]);
    const deleteTaskSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();

    runCommand(fixture.root, "git", ["switch", "-c", "delete-replacement", fixture.baseSha]);
    runCommand(fixture.root, "git", ["rm", "--", "result.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "delete replacement result"]);
    const deleteReplacementSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();

    const assessment = classifyParallelCommitResult(
      fixture.root,
      deleteTaskSha,
      deleteReplacementSha,
      "delete-replacement"
    );
    assert.equal(assessment.status, "exact_duplicate");
    assert.deepEqual(assessment.proof?.changedFiles, ["result.txt"]);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("parallel duplicate proof stays not_proven when ancestry or commit evidence is insufficient", async () => {
  const fixture = await createFixture();
  try {
    const unreadable = classifyParallelCommitResult(fixture.root, fixture.taskSha, "missing-commit", "main");
    assert.equal(unreadable.status, "not_proven");
    assert.match(unreadable.reason, /not readable/);

    runCommand(fixture.root, "git", ["switch", "-c", "later-parent", fixture.replacementSha]);
    await writeFile(path.join(fixture.root, "result.txt"), "accepted later\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "later parent"]);
    const laterSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    const parentMismatch = classifyParallelCommitResult(fixture.root, fixture.taskSha, laterSha, "later-parent");
    assert.equal(parentMismatch.status, "not_proven");
    assert.match(parentMismatch.reason, /same parent/);

    runCommand(fixture.root, "git", ["switch", "-c", "unpublished", fixture.baseSha]);
    await writeFile(path.join(fixture.root, "result.txt"), "accepted\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "unpublished replacement"]);
    const unpublishedSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    const notContained = classifyParallelCommitResult(fixture.root, fixture.taskSha, unpublishedSha, "main");
    assert.equal(notContained.status, "not_proven");
    assert.match(notContained.reason, /not contained/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});
