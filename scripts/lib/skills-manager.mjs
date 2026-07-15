// @ts-check

import { lstat, mkdir, readdir, readlink, realpath, rename, rm, symlink, unlink } from "node:fs/promises";
import path from "node:path";

import { getCodexHome } from "./runtime.mjs";

/**
 * @typedef {Object} RepoSkill
 * @property {string} skillId
 * @property {string} relativeDir
 * @property {string} sourceDir
 * @property {string} targetDir
 */

/**
 * @typedef {"missing"|"linked"|"conflict"} SkillStatus
 */

/**
 * @typedef {"linked"|"already_linked"|"adopted"|"missing"|"unlinked"|"conflict"} SkillActionStatus
 */

/**
 * @typedef {Object} SkillResult
 * @property {string} skillId
 * @property {string} relativeDir
 * @property {string} sourceDir
 * @property {string} targetDir
 * @property {SkillStatus | SkillActionStatus} status
 * @property {string} details
 * @property {string | null} [backupPath]
 */

/**
 * @typedef {Object} SkillsSummary
 * @property {"status"|"link"|"unlink"} action
 * @property {boolean} ok
 * @property {string} repoRoot
 * @property {string} skillsRoot
 * @property {string} codexHome
 * @property {number} managedCount
 * @property {string | null} backupDir
 * @property {SkillResult[]} results
 */

/**
 * @typedef {Object} SkillsOptions
 * @property {string} [codexHome]
 * @property {string} [source]
 * @property {boolean} [adopt]
 */

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
 * @param {string} repoRoot
 * @returns {string}
 */
export function getRepoSkillsRoot(repoRoot) {
  return path.join(repoRoot, "skills");
}

/**
 * @param {string} repoRoot
 * @param {SkillsOptions} [options]
 * @returns {string}
 */
function getResolvedSkillsRoot(repoRoot, options = {}) {
  return options.source ? path.resolve(repoRoot, options.source) : getRepoSkillsRoot(repoRoot);
}

/**
 * @param {string} codexHome
 * @returns {string}
 */
export function getCodexSkillsRoot(codexHome) {
  return path.join(codexHome, "skills");
}

/**
 * @param {string} codexHome
 * @param {string} relativeDir
 * @returns {string}
 */
function getSkillTargetDir(codexHome, relativeDir) {
  return path.join(getCodexSkillsRoot(codexHome), ...relativeDir.split("/"));
}

/**
 * @param {string} skillsRoot
 * @param {string} sourceDir
 * @returns {string}
 */
function toRelativeSkillDir(skillsRoot, sourceDir) {
  return path.relative(skillsRoot, sourceDir).split(path.sep).join("/");
}

/**
 * @param {string} parentDir
 * @param {string} candidatePath
 * @returns {boolean}
 */
function isInsidePath(parentDir, candidatePath) {
  const relativePath = path.relative(path.resolve(parentDir), path.resolve(candidatePath));
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

/**
 * @param {string} skillsRoot
 * @returns {Promise<RepoSkill[]>}
 */
export async function discoverSkills(skillsRoot) {
  if (!(await pathExists(skillsRoot))) {
    return [];
  }

  /** @type {RepoSkill[]} */
  const skills = [];

  /**
   * @param {string} currentDir
   * @returns {Promise<void>}
   */
  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && entry.name === "SKILL.md")) {
      const discoveredRelativeDir = toRelativeSkillDir(skillsRoot, currentDir);
      const relativeDir = discoveredRelativeDir || path.basename(path.resolve(skillsRoot));
      skills.push({
        skillId: relativeDir,
        relativeDir,
        sourceDir: currentDir,
        targetDir: ""
      });
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      await walk(path.join(currentDir, entry.name));
    }
  }

  await walk(skillsRoot);
  return skills
    .map((skill) => ({
      ...skill,
      targetDir: getSkillTargetDir(getCodexHome(), skill.relativeDir)
    }))
    .sort((left, right) => left.relativeDir.localeCompare(right.relativeDir));
}

/**
 * @param {string} repoRoot
 * @returns {Promise<RepoSkill[]>}
 */
export async function discoverRepoSkills(repoRoot) {
  return discoverSkills(getRepoSkillsRoot(repoRoot));
}

/**
 * @param {RepoSkill} skill
 * @returns {Promise<SkillResult>}
 */
async function inspectSkillTarget(skill) {
  if (!(await pathExists(skill.targetDir))) {
    return {
      ...skill,
      status: "missing",
      details: "Target skill path does not exist."
    };
  }

  const targetStat = await lstat(skill.targetDir);
  if (!targetStat.isSymbolicLink()) {
    return {
      ...skill,
      status: "conflict",
      details: "Target path exists and is not a managed symlink."
    };
  }

  const sourceRealPath = await realpath(skill.sourceDir);
  const targetRealPath = await realpath(skill.targetDir).catch(() => null);
  if (targetRealPath === sourceRealPath) {
    return {
      ...skill,
      status: "linked",
      details: "Target symlink already points to this repo skill."
    };
  }

  const linkValue = await readlink(skill.targetDir).catch(() => null);
  return {
    ...skill,
    status: "conflict",
    details: linkValue
      ? `Target symlink points elsewhere: ${linkValue}`
      : "Target symlink does not resolve to this repo skill."
  };
}

/**
 * @param {string} startDir
 * @param {string} stopDir
 * @returns {Promise<void>}
 */
async function pruneEmptyParents(startDir, stopDir) {
  let currentDir = path.resolve(startDir);
  const rootDir = path.resolve(stopDir);
  while (isInsidePath(rootDir, currentDir) && currentDir !== rootDir) {
    const entries = await readdir(currentDir).catch((error) => {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        return null;
      }
      throw error;
    });
    if (!entries || entries.length > 0) {
      return;
    }
    await rm(currentDir, { recursive: true, force: true });
    currentDir = path.dirname(currentDir);
  }
}

/**
 * @param {string} repoRoot
 * @param {SkillsOptions} [options]
 * @returns {Promise<RepoSkill[]>}
 */
async function loadRepoSkills(repoRoot, options = {}) {
  const codexHome = options.codexHome ? path.resolve(options.codexHome) : getCodexHome();
  const skills = await discoverSkills(getResolvedSkillsRoot(repoRoot, options));
  return skills.map((skill) => ({
    ...skill,
    targetDir: getSkillTargetDir(codexHome, skill.relativeDir)
  }));
}

/**
 * @param {string} repoRoot
 * @param {SkillsOptions} [options]
 * @returns {Promise<SkillsSummary>}
 */
export async function getRepoSkillsStatus(repoRoot, options = {}) {
  const codexHome = options.codexHome ? path.resolve(options.codexHome) : getCodexHome();
  const skillsRoot = getResolvedSkillsRoot(repoRoot, options);
  const skills = await loadRepoSkills(repoRoot, { codexHome, source: options.source });
  const results = [];
  for (const skill of skills) {
    results.push(await inspectSkillTarget(skill));
  }
  return {
    action: "status",
    ok: results.every((result) => result.status !== "conflict"),
    repoRoot,
    skillsRoot,
    codexHome,
    managedCount: skills.length,
    backupDir: null,
    results
  };
}

/**
 * @returns {string}
 */
function createBackupLabel() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

/**
 * @param {string} repoRoot
 * @param {SkillsOptions} [options]
 * @returns {Promise<SkillsSummary>}
 */
export async function linkRepoSkills(repoRoot, options = {}) {
  const codexHome = options.codexHome ? path.resolve(options.codexHome) : getCodexHome();
  const skillsRoot = getResolvedSkillsRoot(repoRoot, options);
  const codexSkillsRoot = getCodexSkillsRoot(codexHome);
  const skills = await loadRepoSkills(repoRoot, { codexHome, source: options.source });
  /** @type {SkillResult[]} */
  const results = [];
  let ok = true;
  let backupDir = null;

  for (const skill of skills) {
    const status = await inspectSkillTarget(skill);
    if (status.status === "linked") {
      results.push({ ...status, status: "already_linked" });
      continue;
    }

    if (status.status === "missing") {
      await mkdir(path.dirname(skill.targetDir), { recursive: true });
      await symlink(skill.sourceDir, skill.targetDir, "dir");
      results.push({
        ...skill,
        status: "linked",
        details: "Created managed symlink in CODEX_HOME."
      });
      continue;
    }

    if (!options.adopt) {
      ok = false;
      results.push(status);
      continue;
    }

    backupDir ??= path.join(codexHome, "skills-backups", createBackupLabel());
    const backupPath = path.join(backupDir, ...skill.relativeDir.split("/"));
    await mkdir(path.dirname(backupPath), { recursive: true });
    await rename(skill.targetDir, backupPath);
    await mkdir(path.dirname(skill.targetDir), { recursive: true });
    await symlink(skill.sourceDir, skill.targetDir, "dir");
    results.push({
      ...skill,
      status: "adopted",
      details: "Conflicting target moved to backup and replaced with a managed symlink.",
      backupPath
    });
  }

  await mkdir(codexSkillsRoot, { recursive: true });
  return {
    action: "link",
    ok,
    repoRoot,
    skillsRoot,
    codexHome,
    managedCount: skills.length,
    backupDir,
    results
  };
}

/**
 * @param {string} repoRoot
 * @param {SkillsOptions} [options]
 * @returns {Promise<SkillsSummary>}
 */
export async function unlinkRepoSkills(repoRoot, options = {}) {
  const codexHome = options.codexHome ? path.resolve(options.codexHome) : getCodexHome();
  const skillsRoot = getResolvedSkillsRoot(repoRoot, options);
  const codexSkillsRoot = getCodexSkillsRoot(codexHome);
  const skills = await loadRepoSkills(repoRoot, { codexHome, source: options.source });
  /** @type {SkillResult[]} */
  const results = [];
  let ok = true;

  for (const skill of skills) {
    const status = await inspectSkillTarget(skill);
    if (status.status === "missing") {
      results.push(status);
      continue;
    }
    if (status.status === "conflict") {
      ok = false;
      results.push(status);
      continue;
    }

    await unlink(skill.targetDir);
    await pruneEmptyParents(path.dirname(skill.targetDir), codexSkillsRoot);
    results.push({
      ...skill,
      status: "unlinked",
      details: "Removed managed symlink from CODEX_HOME."
    });
  }

  return {
    action: "unlink",
    ok,
    repoRoot,
    skillsRoot,
    codexHome,
    managedCount: skills.length,
    backupDir: null,
    results
  };
}
