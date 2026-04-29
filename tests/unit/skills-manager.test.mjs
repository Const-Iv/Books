// @ts-check

import assert from "node:assert/strict";
import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  discoverRepoSkills,
  discoverSkills,
  getRepoSkillsStatus,
  linkRepoSkills,
  unlinkRepoSkills
} from "../../scripts/lib/skills-manager.mjs";

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function pathExists(filePath) {
  try {
    await lstat(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/**
 * @returns {Promise<{baseDir: string, repoRoot: string, codexHome: string, cleanup: () => Promise<void>}>}
 */
async function createSkillFixture() {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "starter-skills-"));
  const repoRoot = path.join(baseDir, "repo");
  const codexHome = path.join(baseDir, "codex-home");

  await mkdir(path.join(repoRoot, "skills", "worktree-create"), { recursive: true });
  await writeFile(path.join(repoRoot, "skills", "worktree-create", "SKILL.md"), "# Worktree Create\n", "utf8");
  await mkdir(path.join(repoRoot, "skills", "shared", "worktree-finish"), { recursive: true });
  await writeFile(path.join(repoRoot, "skills", "shared", "worktree-finish", "SKILL.md"), "# Worktree Finish\n", "utf8");

  return {
    baseDir,
    repoRoot,
    codexHome,
    cleanup: async () => {
      await rm(baseDir, { recursive: true, force: true });
    }
  };
}

test("repo exposes starter-rule-sync as a managed project skill", async () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const discovered = await discoverRepoSkills(repoRoot);
  assert.deepEqual(
    discovered.map((skill) => skill.relativeDir),
    ["codebase-recon", "gh-address-comments", "gh-fix-ci", "starter-rule-sync", "worktree-create", "worktree-finish"]
  );
});

test("skills manager discovers repo skills and links them into CODEX_HOME", async () => {
  const fixture = await createSkillFixture();
  try {
    const discovered = await discoverRepoSkills(fixture.repoRoot);
    assert.deepEqual(
      discovered.map((skill) => skill.relativeDir),
      ["shared/worktree-finish", "worktree-create"]
    );

    const linked = await linkRepoSkills(fixture.repoRoot, { codexHome: fixture.codexHome });
    assert.equal(linked.ok, true);
    assert.deepEqual(
      linked.results.map((result) => result.status),
      ["linked", "linked"]
    );

    const targetDir = path.join(fixture.codexHome, "skills", "worktree-create");
    assert.equal(await realpath(targetDir), await realpath(path.join(fixture.repoRoot, "skills", "worktree-create")));

    const status = await getRepoSkillsStatus(fixture.repoRoot, { codexHome: fixture.codexHome });
    assert.equal(status.ok, true);
    assert.deepEqual(
      status.results.map((result) => [result.relativeDir, result.status]),
      [
        ["shared/worktree-finish", "linked"],
        ["worktree-create", "linked"]
      ]
    );
  } finally {
    await fixture.cleanup();
  }
});

test("skills manager can link skills from a submodule source path", async () => {
  const fixture = await createSkillFixture();
  try {
    const consumerRoot = path.join(fixture.baseDir, "consumer");
    const sourceRoot = path.join(consumerRoot, "vendor", "new-project-starter", "skills");
    await mkdir(path.join(sourceRoot, "worktree-create"), { recursive: true });
    await writeFile(path.join(sourceRoot, "worktree-create", "SKILL.md"), "# Worktree Create\n", "utf8");
    await mkdir(path.join(sourceRoot, "worktree-finish"), { recursive: true });
    await writeFile(path.join(sourceRoot, "worktree-finish", "SKILL.md"), "# Worktree Finish\n", "utf8");

    const discovered = await discoverSkills(sourceRoot);
    assert.deepEqual(
      discovered.map((skill) => skill.relativeDir),
      ["worktree-create", "worktree-finish"]
    );

    const linked = await linkRepoSkills(consumerRoot, {
      codexHome: fixture.codexHome,
      source: "vendor/new-project-starter/skills"
    });
    assert.equal(linked.ok, true);
    assert.equal(linked.skillsRoot, sourceRoot);
    assert.deepEqual(
      linked.results.map((result) => [result.relativeDir, result.status]),
      [
        ["worktree-create", "linked"],
        ["worktree-finish", "linked"]
      ]
    );
    assert.equal(
      await realpath(path.join(fixture.codexHome, "skills", "worktree-finish")),
      await realpath(path.join(sourceRoot, "worktree-finish"))
    );

    const status = await getRepoSkillsStatus(consumerRoot, {
      codexHome: fixture.codexHome,
      source: sourceRoot
    });
    assert.equal(status.ok, true);
    assert.deepEqual(
      status.results.map((result) => result.status),
      ["linked", "linked"]
    );
  } finally {
    await fixture.cleanup();
  }
});

test("skills manager refuses to overwrite conflicting targets without adopt", async () => {
  const fixture = await createSkillFixture();
  try {
    const conflictDir = path.join(fixture.codexHome, "skills", "worktree-create");
    await mkdir(conflictDir, { recursive: true });
    await writeFile(path.join(conflictDir, "local-note.txt"), "keep me", "utf8");

    const linked = await linkRepoSkills(fixture.repoRoot, { codexHome: fixture.codexHome });
    assert.equal(linked.ok, false);
    assert.equal(linked.results.find((result) => result.relativeDir === "worktree-create")?.status, "conflict");
    assert.equal(await pathExists(path.join(conflictDir, "local-note.txt")), true);
  } finally {
    await fixture.cleanup();
  }
});

test("skills manager can adopt conflicting targets into backup before linking", async () => {
  const fixture = await createSkillFixture();
  try {
    const conflictDir = path.join(fixture.codexHome, "skills", "worktree-create");
    await mkdir(conflictDir, { recursive: true });
    await writeFile(path.join(conflictDir, "local-note.txt"), "keep me", "utf8");

    const linked = await linkRepoSkills(fixture.repoRoot, { codexHome: fixture.codexHome, adopt: true });
    assert.equal(linked.ok, true);
    const adopted = linked.results.find((result) => result.relativeDir === "worktree-create");
    assert.ok(adopted);
    assert.equal(adopted.status, "adopted");
    assert.ok(adopted.backupPath);
    assert.equal(await readFile(path.join(adopted.backupPath, "local-note.txt"), "utf8"), "keep me");
    assert.equal(await realpath(conflictDir), await realpath(path.join(fixture.repoRoot, "skills", "worktree-create")));
  } finally {
    await fixture.cleanup();
  }
});

test("skills manager unlink removes only managed symlinks and prunes empty parents", async () => {
  const fixture = await createSkillFixture();
  try {
    await linkRepoSkills(fixture.repoRoot, { codexHome: fixture.codexHome });
    const unmanagedDir = path.join(fixture.codexHome, "skills", "unmanaged");
    await mkdir(unmanagedDir, { recursive: true });
    await writeFile(path.join(unmanagedDir, "note.txt"), "still here", "utf8");

    const unlinked = await unlinkRepoSkills(fixture.repoRoot, { codexHome: fixture.codexHome });
    assert.equal(unlinked.ok, true);
    assert.deepEqual(
      unlinked.results.map((result) => result.status),
      ["unlinked", "unlinked"]
    );

    assert.equal(await pathExists(path.join(fixture.codexHome, "skills", "worktree-create")), false);
    assert.equal(await pathExists(path.join(fixture.codexHome, "skills", "shared")), false);
    assert.equal(await pathExists(path.join(unmanagedDir, "note.txt")), true);
  } finally {
    await fixture.cleanup();
  }
});
