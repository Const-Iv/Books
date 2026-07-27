// @ts-check

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  SINGLE_WRITER_OPERATIONAL_DOCS,
  VERSIONED_GOVERNANCE_INPUTS,
  readCurrentGovernanceSnapshot
} from "./lib/governance-input-boundary.mjs";
import { REQUIRED_COMMANDS, REQUIRED_FILES, fileExists, listRepoFilesWithSize, readJson } from "./lib/runtime.mjs";

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = process.cwd();
  const packageJson = await readJson(path.join(repoRoot, "package.json"));
  if (!packageJson) {
    throw new Error("package.json is required for build.");
  }

  const scripts = /** @type {Record<string, string>} */ (packageJson.scripts ?? {});
  const missingCommands = REQUIRED_COMMANDS.filter((name) => !scripts[name]);
  if (missingCommands.length > 0) {
    throw new Error(`Missing required npm scripts: ${missingCommands.join(", ")}`);
  }

  const missingFiles = [];
  for (const relativePath of REQUIRED_FILES) {
    if (!(await fileExists(path.join(repoRoot, relativePath)))) {
      missingFiles.push(relativePath);
    }
  }
  if (missingFiles.length > 0) {
    throw new Error(`Missing required starter files: ${missingFiles.join(", ")}`);
  }

  const governanceSnapshot = readCurrentGovernanceSnapshot(repoRoot);
  const fileInventory = await listRepoFilesWithSize(repoRoot);
  const outputDir = path.join(repoRoot, "runtime");
  await mkdir(outputDir, { recursive: true });
  const manifestPath = path.join(outputDir, "starter-manifest.json");
  const manifest = {
    generatedAt: new Date().toISOString(),
    governanceBoundary: {
      versionedInputs: VERSIONED_GOVERNANCE_INPUTS,
      operationalDocuments: SINGLE_WRITER_OPERATIONAL_DOCS
    },
    governanceSnapshot,
    requiredCommands: REQUIRED_COMMANDS,
    requiredFiles: REQUIRED_FILES,
    totalFiles: fileInventory.length,
    files: fileInventory
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const readme = await readFile(path.join(repoRoot, "README.md"), "utf8");
  const scriptsReadme = await readFile(path.join(repoRoot, "scripts/README.md"), "utf8");
  for (const command of REQUIRED_COMMANDS) {
    if (!readme.includes(command) && !scriptsReadme.includes(command)) {
      throw new Error(`Command ${command} must be documented in README.md or scripts/README.md`);
    }
  }

  console.log(`build-starter: wrote ${path.relative(repoRoot, manifestPath)}`);
}

await main();
