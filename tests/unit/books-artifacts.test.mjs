// @ts-check

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { preserveBooksRuntimeArtifacts } from "../../scripts/lib/books-artifacts.mjs";

test("Books artifacts preserve copies missing files and keeps conflicting main files", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    const sourceBookDir = path.join(sourceWorktree, "runtime", "books", "sample-book");
    const mainBookDir = path.join(mainWorktree, "runtime", "books", "sample-book");
    await mkdir(sourceBookDir, { recursive: true });
    await mkdir(mainBookDir, { recursive: true });

    await writeFile(path.join(sourceBookDir, "Sample - Author - original.txt"), "task original\n", "utf8");
    await writeFile(path.join(sourceBookDir, "Sample - Author - toolkit.md"), "task toolkit\n", "utf8");
    await writeFile(path.join(sourceBookDir, "Same - Author - toolkit.md"), "same content\n", "utf8");
    await writeFile(path.join(mainBookDir, "Sample - Author - toolkit.md"), "main toolkit\n", "utf8");
    await writeFile(path.join(mainBookDir, "Same - Author - toolkit.md"), "same content\n", "utf8");

    const result = await preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-123");

    assert.deepEqual(result.copied, ["sample-book/Sample - Author - original.txt"]);
    assert.deepEqual(result.identical, ["sample-book/Same - Author - toolkit.md"]);
    assert.deepEqual(result.conflictCopies, [
      {
        source: "sample-book/Sample - Author - toolkit.md",
        target: "sample-book/Sample - Author - toolkit - from task-123.md"
      }
    ]);
    assert.equal(
      await readFile(path.join(mainBookDir, "Sample - Author - toolkit.md"), "utf8"),
      "main toolkit\n"
    );
    assert.equal(
      await readFile(path.join(mainBookDir, "Sample - Author - toolkit - from task-123.md"), "utf8"),
      "task toolkit\n"
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Books artifacts preserve is a no-op when task has no runtime books", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-empty-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    await mkdir(sourceWorktree, { recursive: true });
    await mkdir(mainWorktree, { recursive: true });

    const result = await preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-456");

    assert.equal(result.skippedReason, "missing_source");
    assert.equal(existsSync(path.join(mainWorktree, "runtime", "books")), false);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
