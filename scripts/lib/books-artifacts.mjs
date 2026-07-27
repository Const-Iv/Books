// @ts-check

import { constants, existsSync } from "node:fs";
import { chmod, copyFile, lstat, mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";

export const BOOKS_RUNTIME_RELATIVE_PATH = path.join("runtime", "books");
const PROTECTED_BOOKS_DIRECTORIES = [".knowledge", ".response-manifests"];

/**
 * @param {string} candidate
 * @returns {Promise<import("node:fs").Stats | null>}
 */
async function lstatOrNull(candidate) {
  try {
    return await lstat(candidate);
  } catch (error) {
    if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * Create a directory chain one component at a time and reject every existing
 * symlink or non-directory before a preservation write can reach it.
 *
 * @param {string} root
 * @param {string} relativeDirectory
 * @param {number} [createdMode]
 * @returns {Promise<string>}
 */
async function ensureSafeDirectory(root, relativeDirectory, createdMode = 0o777) {
  const resolvedRoot = path.resolve(root);
  const rootStats = await lstatOrNull(resolvedRoot);
  if (!rootStats?.isDirectory() || rootStats.isSymbolicLink()) {
    throw new Error(`Books preservation root must be a regular directory: ${resolvedRoot}`);
  }
  const resolvedDirectory = path.resolve(resolvedRoot, relativeDirectory);
  const relation = path.relative(resolvedRoot, resolvedDirectory);
  if (relation === ".." || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) {
    throw new Error(`Books preservation directory escapes its root: ${relativeDirectory}`);
  }

  let current = resolvedRoot;
  for (const segment of relation.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    let stats = await lstatOrNull(current);
    if (!stats) {
      await mkdir(current, { mode: createdMode });
      stats = await lstat(current);
    }
    if (!stats.isDirectory() || stats.isSymbolicLink()) {
      throw new Error(`Books preservation target contains a symlink or non-directory: ${current}`);
    }
  }
  return resolvedDirectory;
}

/**
 * @param {string} root
 * @param {string} relativeDirectory
 * @returns {Promise<string>}
 */
async function requireSafeDirectory(root, relativeDirectory) {
  const resolvedRoot = path.resolve(root);
  const rootStats = await lstatOrNull(resolvedRoot);
  if (!rootStats?.isDirectory() || rootStats.isSymbolicLink()) {
    throw new Error(`Books preservation source root must be a regular directory: ${resolvedRoot}`);
  }
  const resolvedDirectory = path.resolve(resolvedRoot, relativeDirectory);
  const relation = path.relative(resolvedRoot, resolvedDirectory);
  if (relation === ".." || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) {
    throw new Error(`Books preservation source directory escapes its root: ${relativeDirectory}`);
  }

  let current = resolvedRoot;
  for (const segment of relation.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    const stats = await lstatOrNull(current);
    if (!stats?.isDirectory() || stats.isSymbolicLink()) {
      throw new Error(`Books preservation source contains a symlink or non-directory: ${current}`);
    }
  }
  return resolvedDirectory;
}

/**
 * @param {string} candidate
 * @param {string} label
 * @returns {Promise<import("node:fs").Stats>}
 */
async function requireRegularFile(candidate, label) {
  const metadata = await lstatOrNull(candidate);
  if (!metadata?.isFile() || metadata.isSymbolicLink()) {
    throw new Error(`${label} must be a regular non-symlink file: ${candidate}`);
  }
  return metadata;
}

/**
 * @typedef {Object} BooksArtifactsConflictCopy
 * @property {string} source
 * @property {string} target
 */

/**
 * @typedef {Object} BooksArtifactsPreserveResult
 * @property {string} sourceRoot
 * @property {string} targetRoot
 * @property {string[]} copied
 * @property {string[]} identical
 * @property {BooksArtifactsConflictCopy[]} conflictCopies
 * @property {string[]} skipped
 * @property {"missing_source"|"same_worktree"|null} skippedReason
 */

/**
 * @param {string} root
 * @param {string} [relativePrefix]
 * @returns {Promise<{files: string[], skipped: string[]}>}
 */
async function listRegularFiles(root, relativePrefix = "") {
  const currentDirectory = path.join(root, relativePrefix);
  if (relativePrefix && isProtectedKnowledgePath(relativePrefix)) {
    const metadata = await lstat(currentDirectory);
    if (
      !metadata.isDirectory() ||
      metadata.isSymbolicLink() ||
      (metadata.mode & 0o777) !== 0o700
    ) {
      throw new Error("Protected Books knowledge directories must use regular 0700 paths.");
    }
  }
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];
  /** @type {string[]} */
  const skipped = [];

  for (const entry of entries) {
    const relativePath = path.join(relativePrefix, entry.name);
    if (entry.isDirectory()) {
      const child = await listRegularFiles(root, relativePath);
      files.push(...child.files);
      skipped.push(...child.skipped);
      continue;
    }
    if (entry.isFile()) {
      files.push(relativePath);
      continue;
    }
    skipped.push(relativePath);
  }

  return { files, skipped };
}

/**
 * @param {string} leftPath
 * @param {string} rightPath
 * @returns {Promise<boolean>}
 */
async function filesHaveSameContent(leftPath, rightPath) {
  const [leftStat, rightStat] = await Promise.all([
    requireRegularFile(leftPath, "Books preservation source"),
    requireRegularFile(rightPath, "Books preservation target")
  ]);
  if (leftStat.size !== rightStat.size) {
    return false;
  }
  const [leftContent, rightContent] = await Promise.all([readFile(leftPath), readFile(rightPath)]);
  return leftContent.equals(rightContent);
}

/**
 * @param {string} sourcePath
 * @param {string} targetPath
 * @param {boolean} protectedFile
 * @returns {Promise<void>}
 */
async function preserveFileMode(sourcePath, targetPath, protectedFile) {
  const [sourceStats] = await Promise.all([
    requireRegularFile(sourcePath, "Books preservation source"),
    requireRegularFile(targetPath, "Books preservation target")
  ]);
  const mode = sourceStats.mode & 0o777;
  if (protectedFile && mode !== 0o600) {
    throw new Error("Protected Books knowledge files must use mode 0600.");
  }
  await chmod(targetPath, mode);
}

/**
 * @param {string} relativePath
 * @returns {boolean}
 */
function isProtectedKnowledgePath(relativePath) {
  const firstSegment = relativePath.split(path.sep)[0];
  return PROTECTED_BOOKS_DIRECTORIES.includes(firstSegment);
}

/**
 * @param {string} sourceRoot
 * @param {string} targetRoot
 * @returns {Promise<void>}
 */
async function preserveProtectedDirectoryModes(sourceRoot, targetRoot) {
  /** @type {Array<{relativeDirectory: string, mode: number}>} */
  const protectedDirectories = [];
  for (const relativeDirectory of PROTECTED_BOOKS_DIRECTORIES) {
    const sourceDirectory = path.join(sourceRoot, relativeDirectory);
    const sourceStats = await lstatOrNull(sourceDirectory);
    if (!sourceStats) {
      continue;
    }
    if (!sourceStats.isDirectory() || sourceStats.isSymbolicLink()) {
      throw new Error("Protected Books knowledge paths must be regular directories.");
    }
    const mode = sourceStats.mode & 0o777;
    if (mode !== 0o700) {
      throw new Error("Protected Books knowledge directories must use mode 0700.");
    }
    protectedDirectories.push({ relativeDirectory, mode });
  }

  for (const { relativeDirectory, mode } of protectedDirectories) {
    const targetDirectory = await ensureSafeDirectory(targetRoot, relativeDirectory, mode);
    await chmod(targetDirectory, mode);
    const targetStats = await lstat(targetDirectory);
    if (!targetStats.isDirectory() || targetStats.isSymbolicLink()) {
      throw new Error("Protected Books knowledge targets must be regular directories.");
    }
  }
}

/**
 * @param {string} targetPath
 * @param {string} taskId
 * @param {number} index
 * @returns {string}
 */
function buildConflictPath(targetPath, taskId, index) {
  const parsed = path.parse(targetPath);
  const suffix = index === 1 ? ` - from ${taskId}` : ` - from ${taskId}-${index}`;
  return path.join(parsed.dir, `${parsed.name}${suffix}${parsed.ext}`);
}

/**
 * @param {string} targetPath
 * @param {string} taskId
 * @returns {Promise<string>}
 */
async function allocateConflictPath(targetPath, taskId) {
  let index = 1;
  while (true) {
    const candidate = buildConflictPath(targetPath, taskId, index);
    const metadata = await lstatOrNull(candidate);
    if (!metadata) {
      return candidate;
    }
    if (!metadata.isFile() || metadata.isSymbolicLink()) {
      throw new Error(`Books preservation conflict target must be a regular file: ${candidate}`);
    }
    index += 1;
  }
}

/**
 * Reuse a task-scoped conflict copy when a previous finish attempt already
 * preserved the exact same bytes. This keeps retries idempotent without ever
 * replacing the canonical main artifact.
 *
 * @param {string} sourcePath
 * @param {string} targetPath
 * @param {string} taskId
 * @returns {Promise<string | null>}
 */
async function findIdenticalConflictPath(sourcePath, targetPath, taskId) {
  let index = 1;
  while (true) {
    const candidate = buildConflictPath(targetPath, taskId, index);
    const metadata = await lstatOrNull(candidate);
    if (!metadata) {
      return null;
    }
    if (!metadata.isFile() || metadata.isSymbolicLink()) {
      throw new Error(`Books preservation conflict target must be a regular file: ${candidate}`);
    }
    if (await filesHaveSameContent(sourcePath, candidate)) {
      return candidate;
    }
    index += 1;
  }
}

/**
 * Preserve local Books working artifacts before deleting a task worktree.
 *
 * Full book originals remain ignored under runtime/books/<topic>/<book-slug>/.
 * Shareable artifacts should also have tracked copies under
 * books/<topic>/<book-slug>/ when appropriate.
 *
 * @param {string} sourceWorktreePath
 * @param {string} mainWorktreePath
 * @param {string} taskId
 * @returns {Promise<BooksArtifactsPreserveResult>}
 */
export async function preserveBooksRuntimeArtifacts(sourceWorktreePath, mainWorktreePath, taskId) {
  const sourceRoot = path.resolve(sourceWorktreePath, BOOKS_RUNTIME_RELATIVE_PATH);
  const targetRoot = path.resolve(mainWorktreePath, BOOKS_RUNTIME_RELATIVE_PATH);

  /** @type {BooksArtifactsPreserveResult} */
  const result = {
    sourceRoot,
    targetRoot,
    copied: [],
    identical: [],
    conflictCopies: [],
    skipped: [],
    skippedReason: null
  };

  if (path.resolve(sourceWorktreePath) === path.resolve(mainWorktreePath)) {
    result.skippedReason = "same_worktree";
    return result;
  }
  const sourceRuntimePath = path.resolve(sourceWorktreePath, "runtime");
  const sourceRuntimeStats = await lstatOrNull(sourceRuntimePath);
  if (
    sourceRuntimeStats &&
    (!sourceRuntimeStats.isDirectory() || sourceRuntimeStats.isSymbolicLink())
  ) {
    throw new Error(`Books preservation source contains a symlink or non-directory: ${sourceRuntimePath}`);
  }
  if (!existsSync(sourceRoot)) {
    result.skippedReason = "missing_source";
    return result;
  }

  await requireSafeDirectory(sourceWorktreePath, BOOKS_RUNTIME_RELATIVE_PATH);

  const listed = await listRegularFiles(sourceRoot);
  result.skipped.push(...listed.skipped);
  if (listed.skipped.length > 0) {
    throw new Error(`Books runtime contains unsupported entries: ${listed.skipped.join(", ")}`);
  }
  const sortedFiles = listed.files.sort();
  for (const relativePath of sortedFiles) {
    const sourcePath = path.join(sourceRoot, relativePath);
    const sourceStats = await requireRegularFile(sourcePath, "Books preservation source");
    if (isProtectedKnowledgePath(relativePath) && (sourceStats.mode & 0o777) !== 0o600) {
      throw new Error("Protected Books knowledge files must use mode 0600.");
    }
  }

  await ensureSafeDirectory(mainWorktreePath, BOOKS_RUNTIME_RELATIVE_PATH);
  await preserveProtectedDirectoryModes(sourceRoot, targetRoot);

  for (const relativePath of sortedFiles) {
    const sourcePath = path.join(sourceRoot, relativePath);
    const targetPath = path.join(targetRoot, relativePath);
    const protectedFile = isProtectedKnowledgePath(relativePath);
    await requireRegularFile(sourcePath, "Books preservation source");
    await ensureSafeDirectory(
      targetRoot,
      path.relative(targetRoot, path.dirname(targetPath)),
      protectedFile ? 0o700 : 0o777
    );
    const targetStats = await lstatOrNull(targetPath);

    if (!targetStats) {
      await copyFile(sourcePath, targetPath, constants.COPYFILE_EXCL);
      await preserveFileMode(sourcePath, targetPath, protectedFile);
      result.copied.push(relativePath);
      continue;
    }
    if (!targetStats.isFile() || targetStats.isSymbolicLink()) {
      throw new Error(`Books preservation target must be a regular file: ${targetPath}`);
    }

    if (await filesHaveSameContent(sourcePath, targetPath)) {
      await preserveFileMode(sourcePath, targetPath, protectedFile);
      result.identical.push(relativePath);
      continue;
    }
    if (protectedFile) {
      throw new Error(`Protected Books knowledge artifact conflicts with canonical main: ${relativePath}`);
    }

    const existingConflictPath = await findIdenticalConflictPath(sourcePath, targetPath, taskId);
    const conflictPath = existingConflictPath ?? await allocateConflictPath(targetPath, taskId);
    if (!existingConflictPath) {
      await copyFile(sourcePath, conflictPath, constants.COPYFILE_EXCL);
    }
    await preserveFileMode(sourcePath, conflictPath, protectedFile);
    result.conflictCopies.push({
      source: relativePath,
      target: path.relative(targetRoot, conflictPath)
    });
  }

  return result;
}
