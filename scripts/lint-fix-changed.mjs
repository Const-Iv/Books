// @ts-check

import { findGitRoot, getChangedFiles } from "./lib/runtime.mjs";
import { lintFiles } from "./repo-lint.mjs";

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

  const changedFiles = (await getChangedFiles(repoRoot)).filter(Boolean);
  const targetFiles = changedFiles.length > 0 ? changedFiles : [];
  const issues = await lintFiles(repoRoot, targetFiles.length > 0 ? targetFiles : await import("./lib/runtime.mjs").then((m) => m.listRepoFiles(repoRoot)), true);

  if (issues.length > 0) {
    console.error(issues.join("\n"));
    process.exit(1);
  }

  console.log(`lint-fix-changed: normalized ${targetFiles.length > 0 ? targetFiles.length : "all"} lintable files`);
}

await main();
