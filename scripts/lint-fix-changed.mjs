// @ts-check

import { stat } from "node:fs/promises";
import path from "node:path";

import { findGitRoot, getChangedFiles } from "./lib/runtime.mjs";
import { lintFiles } from "./repo-lint.mjs";

/**
 * @param {string} repoRoot
 * @param {string[]} files
 * @returns {Promise<string[]>}
 */
async function existingRegularFiles(repoRoot, files) {
  /** @type {string[]} */
  const existing = [];

  for (const file of files) {
    try {
      const fileStat = await stat(path.join(repoRoot, file));
      if (fileStat.isFile()) {
        existing.push(file);
      }
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
        throw error;
      }
    }
  }

  return existing;
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = (() => {
    try {
      return findGitRoot(process.cwd());
    } catch {
      return process.cwd();
    }
  })();

  const changedFiles = await existingRegularFiles(repoRoot, (await getChangedFiles(repoRoot)).filter(Boolean));
  const targetFiles = changedFiles.length > 0 ? changedFiles : [];
  const issues = await lintFiles(repoRoot, targetFiles.length > 0 ? targetFiles : await import("./lib/runtime.mjs").then((m) => m.listRepoFiles(repoRoot)), true);

  if (issues.length > 0) {
    console.error(issues.join("\n"));
    process.exit(1);
  }

  console.log(`lint-fix-changed: normalized ${targetFiles.length > 0 ? targetFiles.length : "all"} lintable files`);
}

await main();
