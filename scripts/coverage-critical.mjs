// @ts-check

import { readFile } from "node:fs/promises";
import path from "node:path";

import { fileExists, runCommand } from "./lib/runtime.mjs";

/**
 * @typedef {{criticalModules: Array<{module: string, tests: string[]}>}} CoverageManifest
 */

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = process.cwd();
  const manifestPath = path.join(repoRoot, "tests/coverage-critical.manifest.json");
  const manifestRaw = await readFile(manifestPath, "utf8");
  const manifest = /** @type {CoverageManifest} */ (JSON.parse(manifestRaw));

  /** @type {string[]} */
  const tests = [];
  for (const entry of manifest.criticalModules) {
    if (!(await fileExists(path.join(repoRoot, entry.module)))) {
      throw new Error(`Critical module missing: ${entry.module}`);
    }
    for (const testFile of entry.tests) {
      if (!(await fileExists(path.join(repoRoot, testFile)))) {
        throw new Error(`Critical test missing for ${entry.module}: ${testFile}`);
      }
      const content = await readFile(path.join(repoRoot, testFile), "utf8");
      const moduleBaseName = path.basename(entry.module, path.extname(entry.module));
      if (!content.includes(moduleBaseName)) {
        throw new Error(`Critical test ${testFile} does not reference ${entry.module}`);
      }
      tests.push(testFile);
    }
  }

  const uniqueTests = [...new Set(tests)];
  runCommand(repoRoot, "node", ["--test", ...uniqueTests]);
  console.log(`coverage-critical: validated ${manifest.criticalModules.length} critical modules`);
}

await main();
