// @ts-check

import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { runCommand } from "../../scripts/lib/runtime.mjs";
import { createTempStarterRepo, runStarterScript } from "../helpers/temp-repo.mjs";

test("lint:fix:changed skips deleted files and normalizes untracked moved files", async () => {
  const fixture = await createTempStarterRepo();
  try {
    const oldDir = path.join(fixture.repoRoot, "books", "old-topic", "sample-book");
    await mkdir(oldDir, { recursive: true });
    await writeFile(path.join(oldDir, "source-manifest.md"), "# Old manifest\n", "utf8");
    runCommand(fixture.repoRoot, "git", ["add", "books/old-topic/sample-book/source-manifest.md"]);
    runCommand(fixture.repoRoot, "git", ["commit", "-m", "Add old manifest"]);

    await rm(path.join(oldDir, "source-manifest.md"));
    const newDir = path.join(fixture.repoRoot, "books", "TOS - Теория ограничения систем", "sample-book");
    const newManifest = path.join(newDir, "source-manifest.md");
    await mkdir(newDir, { recursive: true });
    await writeFile(newManifest, "# New manifest  \n", "utf8");

    const result = runStarterScript(fixture.repoRoot, ["scripts/lint-fix-changed.mjs"]);

    assert.equal(result.status, 0);
    assert.equal(await readFile(newManifest, "utf8"), "# New manifest\n");
  } finally {
    await fixture.cleanup();
  }
});
