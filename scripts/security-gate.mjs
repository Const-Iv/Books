// @ts-check

import { readFile } from "node:fs/promises";
import path from "node:path";

import { listRepoFiles, runCommand } from "./lib/runtime.mjs";

const SUSPICIOUS_PATTERNS = [
  /BEGIN [A-Z ]*PRIVATE KEY/,
  /ghp_[A-Za-z0-9]{20,}/,
  /sk-[A-Za-z0-9]{16,}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/
];

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = process.cwd();
  const files = await listRepoFiles(repoRoot);
  /** @type {string[]} */
  const findings = [];

  for (const relativePath of files) {
    if (relativePath.startsWith("node_modules/") || relativePath.startsWith("runtime/")) {
      continue;
    }
    const absolutePath = path.join(repoRoot, relativePath);
    const content = await readFile(absolutePath, "utf8");
    if (relativePath === ".env.example" || relativePath.endsWith(".template.md")) {
      continue;
    }
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(content)) {
        findings.push(`${relativePath}: matched ${pattern}`);
      }
    }
  }

  if (findings.length > 0) {
    throw new Error(`Secret scan failed:\n${findings.join("\n")}`);
  }

  const audit = runCommand(repoRoot, "npm", ["audit", "--omit=dev", "--audit-level=high"], { allowFailure: true });
  if (audit.status !== 0) {
    throw new Error(audit.stderr || audit.stdout);
  }

  console.log("security-gate: ok");
}

await main();
