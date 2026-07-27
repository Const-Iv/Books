// @ts-check

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { listRepoFiles, runCommand } from "./lib/runtime.mjs";

/**
 * @typedef {(repoRoot: string) => Promise<string[]>} SecurityGateListRepoFilesFn
 */

/**
 * @typedef {(absolutePath: string, encoding: "utf8") => Promise<string>} SecurityGateReadFileFn
 */

/**
 * @typedef {(repoRoot: string, command: string, args: string[], options?: { allowFailure?: boolean }) => { status: number, stdout: string, stderr: string }} SecurityGateRunCommandFn
 */

/**
 * @typedef {Object} SecurityGateDeps
 * @property {string} [repoRoot]
 * @property {SecurityGateListRepoFilesFn} [listRepoFilesFn]
 * @property {SecurityGateReadFileFn} [readFileFn]
 * @property {SecurityGateRunCommandFn} [runCommandFn]
 */

const SUSPICIOUS_PATTERNS = [
  /BEGIN [A-Z ]*PRIVATE KEY/,
  /ghp_[A-Za-z0-9]{20,}/,
  /sk-[A-Za-z0-9]{16,}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/
];

/**
 * @returns {Promise<void>}
 */
export async function runSecurityGate({
  repoRoot = process.cwd(),
  listRepoFilesFn = listRepoFiles,
  readFileFn = readFile,
  runCommandFn = runCommand
} = /** @type {SecurityGateDeps} */ ({})) {
  const files = await listRepoFilesFn(repoRoot);
  /** @type {string[]} */
  const findings = [];

  for (const relativePath of files) {
    if (relativePath.startsWith("node_modules/") || relativePath.startsWith("runtime/")) {
      continue;
    }
    const absolutePath = path.join(repoRoot, relativePath);
    const content = await readFileFn(absolutePath, "utf8");
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

  const audit = runCommandFn(repoRoot, "npm", ["audit", "--audit-level=high"], { allowFailure: true });
  if (audit.status !== 0) {
    throw new Error(audit.stderr || audit.stdout);
  }

  console.log("security-gate: ok");
}

async function main() {
  await runSecurityGate();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
