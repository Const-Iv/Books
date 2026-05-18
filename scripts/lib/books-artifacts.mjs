// @ts-check

import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

export const BOOKS_RUNTIME_RELATIVE_PATH = path.join("runtime", "books");

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
  const entries = await readdir(path.join(root, relativePrefix), { withFileTypes: true });
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
  const [leftStat, rightStat] = await Promise.all([stat(leftPath), stat(rightPath)]);
  if (!leftStat.isFile() || !rightStat.isFile()) {
    return false;
  }
  if (leftStat.size !== rightStat.size) {
    return false;
  }
  const [leftContent, rightContent] = await Promise.all([readFile(leftPath), readFile(rightPath)]);
  return leftContent.equals(rightContent);
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
 * @returns {string}
 */
function allocateConflictPath(targetPath, taskId) {
  let index = 1;
  while (true) {
    const candidate = buildConflictPath(targetPath, taskId, index);
    if (!existsSync(candidate)) {
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
  if (!existsSync(sourceRoot)) {
    result.skippedReason = "missing_source";
    return result;
  }

  const listed = await listRegularFiles(sourceRoot);
  result.skipped.push(...listed.skipped);

  for (const relativePath of listed.files.sort()) {
    const sourcePath = path.join(sourceRoot, relativePath);
    const targetPath = path.join(targetRoot, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });

    if (!existsSync(targetPath)) {
      await copyFile(sourcePath, targetPath);
      result.copied.push(relativePath);
      continue;
    }

    if (await filesHaveSameContent(sourcePath, targetPath)) {
      result.identical.push(relativePath);
      continue;
    }

    const conflictPath = allocateConflictPath(targetPath, taskId);
    await copyFile(sourcePath, conflictPath);
    result.conflictCopies.push({
      source: relativePath,
      target: path.relative(targetRoot, conflictPath)
    });
  }

  return result;
}
