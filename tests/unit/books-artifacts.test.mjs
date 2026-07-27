// @ts-check

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chmod, mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { preserveBooksRuntimeArtifacts } from "../../scripts/lib/books-artifacts.mjs";

test("Books artifacts preserve copies missing files and keeps conflicting main files", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    const sourceBookDir = path.join(sourceWorktree, "runtime", "books", "sample-topic", "sample-book");
    const mainBookDir = path.join(mainWorktree, "runtime", "books", "sample-topic", "sample-book");
    await mkdir(sourceBookDir, { recursive: true });
    await mkdir(mainBookDir, { recursive: true });

    await writeFile(path.join(sourceBookDir, "Sample - Author - original.txt"), "task original\n", "utf8");
    await writeFile(path.join(sourceBookDir, "Sample - Author - toolkit.md"), "task toolkit\n", "utf8");
    await writeFile(path.join(sourceBookDir, "Same - Author - toolkit.md"), "same content\n", "utf8");
    await writeFile(path.join(mainBookDir, "Sample - Author - toolkit.md"), "main toolkit\n", "utf8");
    await writeFile(path.join(mainBookDir, "Same - Author - toolkit.md"), "same content\n", "utf8");

    const result = await preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-123");

    assert.deepEqual(result.copied, ["sample-topic/sample-book/Sample - Author - original.txt"]);
    assert.deepEqual(result.identical, ["sample-topic/sample-book/Same - Author - toolkit.md"]);
    assert.deepEqual(result.conflictCopies, [
      {
        source: "sample-topic/sample-book/Sample - Author - toolkit.md",
        target: "sample-topic/sample-book/Sample - Author - toolkit - from task-123.md"
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

test("Books artifacts preserve reuses an identical task-scoped conflict copy on retry", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-retry-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    const sourceBookDir = path.join(sourceWorktree, "runtime", "books", "sample-topic", "sample-book");
    const mainBookDir = path.join(mainWorktree, "runtime", "books", "sample-topic", "sample-book");
    await mkdir(sourceBookDir, { recursive: true });
    await mkdir(mainBookDir, { recursive: true });
    await writeFile(path.join(sourceBookDir, "Toolkit.md"), "task version\n", "utf8");
    await writeFile(path.join(mainBookDir, "Toolkit.md"), "main version\n", "utf8");

    const first = await preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-789");
    await writeFile(path.join(sourceBookDir, "New source.md"), "new on retry\n", "utf8");
    const second = await preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-789");

    assert.deepEqual(first.conflictCopies, [
      {
        source: "sample-topic/sample-book/Toolkit.md",
        target: "sample-topic/sample-book/Toolkit - from task-789.md"
      }
    ]);
    assert.deepEqual(second.conflictCopies, first.conflictCopies);
    assert.deepEqual(second.copied, ["sample-topic/sample-book/New source.md"]);
    assert.equal(existsSync(path.join(mainBookDir, "Toolkit - from task-789-2.md")), false);
    assert.equal(await readFile(path.join(mainBookDir, "Toolkit.md"), "utf8"), "main version\n");
    assert.equal(await readFile(path.join(mainBookDir, "Toolkit - from task-789.md"), "utf8"), "task version\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Books artifacts preserve keeps protected knowledge directory and file modes", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-protected-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    const sourceKnowledge = path.join(sourceWorktree, "runtime", "books", ".knowledge");
    const sourceResponses = path.join(sourceWorktree, "runtime", "books", ".response-manifests");
    const mainKnowledge = path.join(mainWorktree, "runtime", "books", ".knowledge");
    await mkdir(sourceKnowledge, { recursive: true, mode: 0o700 });
    await mkdir(sourceResponses, { recursive: true, mode: 0o700 });
    await mkdir(mainKnowledge, { recursive: true, mode: 0o755 });
    await chmod(sourceKnowledge, 0o700);
    await chmod(sourceResponses, 0o700);
    await chmod(mainKnowledge, 0o755);
    const sourceScope = path.join(sourceKnowledge, "trusted-scope.json");
    const mainScope = path.join(mainKnowledge, "trusted-scope.json");
    const sourceManifest = path.join(sourceResponses, "response.json");
    await writeFile(sourceScope, "same scope\n", { encoding: "utf8", mode: 0o600 });
    await writeFile(mainScope, "same scope\n", { encoding: "utf8", mode: 0o644 });
    await writeFile(sourceManifest, "hash-only\n", { encoding: "utf8", mode: 0o600 });
    await chmod(sourceScope, 0o600);
    await chmod(mainScope, 0o644);
    await chmod(sourceManifest, 0o600);

    const result = await preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-protected");

    assert.deepEqual(result.identical, [".knowledge/trusted-scope.json"]);
    assert.deepEqual(result.copied, [".response-manifests/response.json"]);
    assert.equal((await stat(mainKnowledge)).mode & 0o777, 0o700);
    assert.equal((await stat(mainScope)).mode & 0o777, 0o600);
    assert.equal(
      (await stat(path.join(mainWorktree, "runtime", "books", ".response-manifests"))).mode & 0o777,
      0o700
    );
    assert.equal(
      (await stat(path.join(mainWorktree, "runtime", "books", ".response-manifests", "response.json"))).mode & 0o777,
      0o600
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Books artifacts preserve rejects weak protected source permissions", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-protected-weak-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    const sourceKnowledge = path.join(sourceWorktree, "runtime", "books", ".knowledge");
    await mkdir(sourceKnowledge, { recursive: true, mode: 0o700 });
    await chmod(sourceKnowledge, 0o755);
    await mkdir(mainWorktree, { recursive: true });

    await assert.rejects(
      preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-weak"),
      /0700/
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Books artifacts preserve rejects a weak protected source file before creating target residue", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-protected-file-weak-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    const sourceKnowledge = path.join(sourceWorktree, "runtime", "books", ".knowledge");
    const sourceScope = path.join(sourceKnowledge, "trusted-scope.json");
    await mkdir(sourceKnowledge, { recursive: true, mode: 0o700 });
    await chmod(sourceKnowledge, 0o700);
    await writeFile(sourceScope, "weak source scope\n", { encoding: "utf8", mode: 0o644 });
    await chmod(sourceScope, 0o644);
    await mkdir(mainWorktree, { recursive: true });

    await assert.rejects(
      preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-weak-file"),
      /must use mode 0600/
    );
    assert.equal(existsSync(path.join(mainWorktree, "runtime", "books")), false);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Books artifacts preserve blocks conflicts at protected canonical authority paths", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-protected-conflict-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    const sourceKnowledge = path.join(sourceWorktree, "runtime", "books", ".knowledge");
    const mainKnowledge = path.join(mainWorktree, "runtime", "books", ".knowledge");
    await mkdir(sourceKnowledge, { recursive: true, mode: 0o700 });
    await mkdir(mainKnowledge, { recursive: true, mode: 0o700 });
    await chmod(sourceKnowledge, 0o700);
    await chmod(mainKnowledge, 0o700);
    await writeFile(path.join(sourceKnowledge, "trusted-scope.json"), "task scope\n", {
      encoding: "utf8",
      mode: 0o600
    });
    await writeFile(path.join(mainKnowledge, "trusted-scope.json"), "main scope\n", {
      encoding: "utf8",
      mode: 0o600
    });
    await chmod(path.join(sourceKnowledge, "trusted-scope.json"), 0o600);
    await chmod(path.join(mainKnowledge, "trusted-scope.json"), 0o600);

    await assert.rejects(
      preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-protected-conflict"),
      /conflicts with canonical main/
    );
    assert.equal(
      existsSync(path.join(mainKnowledge, "trusted-scope - from task-protected-conflict.json")),
      false
    );
    assert.equal(await readFile(path.join(mainKnowledge, "trusted-scope.json"), "utf8"), "main scope\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Books artifacts preserve rejects a protected target directory symlink before writing outside main", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-target-dir-link-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    const sourceResponses = path.join(sourceWorktree, "runtime", "books", ".response-manifests");
    const mainBooks = path.join(mainWorktree, "runtime", "books");
    const outsideDirectory = path.join(tempRoot, "outside");
    await mkdir(sourceResponses, { recursive: true, mode: 0o700 });
    await chmod(sourceResponses, 0o700);
    await writeFile(path.join(sourceResponses, "response.json"), "hash-only\n", {
      encoding: "utf8",
      mode: 0o600
    });
    await chmod(path.join(sourceResponses, "response.json"), 0o600);
    await mkdir(mainBooks, { recursive: true });
    await mkdir(outsideDirectory, { recursive: true });
    await symlink(outsideDirectory, path.join(mainBooks, ".response-manifests"));

    await assert.rejects(
      preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-target-dir-link"),
      /target contains a symlink or non-directory/
    );
    assert.equal(existsSync(path.join(outsideDirectory, "response.json")), false);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Books artifacts preserve rejects a protected target file symlink without chmod outside main", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-target-file-link-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    const sourceKnowledge = path.join(sourceWorktree, "runtime", "books", ".knowledge");
    const mainKnowledge = path.join(mainWorktree, "runtime", "books", ".knowledge");
    const outsideFile = path.join(tempRoot, "outside.json");
    await mkdir(sourceKnowledge, { recursive: true, mode: 0o700 });
    await chmod(sourceKnowledge, 0o700);
    await writeFile(path.join(sourceKnowledge, "trusted-scope.json"), "source scope\n", {
      encoding: "utf8",
      mode: 0o600
    });
    await chmod(path.join(sourceKnowledge, "trusted-scope.json"), 0o600);
    await mkdir(mainKnowledge, { recursive: true, mode: 0o700 });
    await chmod(mainKnowledge, 0o700);
    await writeFile(outsideFile, "outside sentinel\n", { encoding: "utf8", mode: 0o644 });
    await chmod(outsideFile, 0o644);
    await symlink(outsideFile, path.join(mainKnowledge, "trusted-scope.json"));

    await assert.rejects(
      preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-target-file-link"),
      /target must be a regular file/
    );
    assert.equal(await readFile(outsideFile, "utf8"), "outside sentinel\n");
    assert.equal((await stat(outsideFile)).mode & 0o777, 0o644);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Books artifacts preserve rejects a source runtime component symlink without reading outside the task", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "books-artifacts-source-root-link-"));
  try {
    const sourceWorktree = path.join(tempRoot, "task");
    const mainWorktree = path.join(tempRoot, "main");
    const outsideRuntime = path.join(tempRoot, "outside-runtime");
    const outsideKnowledge = path.join(outsideRuntime, "books", ".knowledge");
    await mkdir(sourceWorktree, { recursive: true });
    await mkdir(mainWorktree, { recursive: true });
    await mkdir(outsideKnowledge, { recursive: true, mode: 0o700 });
    await chmod(outsideKnowledge, 0o700);
    await writeFile(path.join(outsideKnowledge, "trusted-scope.json"), "outside scope\n", {
      encoding: "utf8",
      mode: 0o600
    });
    await chmod(path.join(outsideKnowledge, "trusted-scope.json"), 0o600);
    await symlink(outsideRuntime, path.join(sourceWorktree, "runtime"));

    await assert.rejects(
      preserveBooksRuntimeArtifacts(sourceWorktree, mainWorktree, "task-source-root-link"),
      /source contains a symlink or non-directory/
    );
    assert.equal(existsSync(path.join(mainWorktree, "runtime", "books")), false);
    assert.equal(
      await readFile(path.join(outsideKnowledge, "trusted-scope.json"), "utf8"),
      "outside scope\n"
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
