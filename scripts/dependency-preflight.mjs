// @ts-check

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { fileExists, runCommand } from "./lib/runtime.mjs";

const DEPENDENCY_INPUTS = ["package.json", "package-lock.json"];
const FINGERPRINT_FILE = ".books-dependency-fingerprint.json";

/**
 * @param {string} repoRoot
 * @returns {Promise<string>}
 */
export async function getDependencyFingerprint(repoRoot) {
  const hash = createHash("sha256");
  hash.update(`node=${process.versions.node}\n`);
  for (const relativePath of DEPENDENCY_INPUTS) {
    hash.update(`${relativePath}\0`);
    hash.update(await readFile(path.join(repoRoot, relativePath)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

/**
 * @param {string} repoRoot
 * @returns {string}
 */
function getFingerprintPath(repoRoot) {
  return path.join(repoRoot, "node_modules", FINGERPRINT_FILE);
}

/**
 * @param {string} repoRoot
 * @returns {Promise<string | null>}
 */
async function readInstalledFingerprint(repoRoot) {
  try {
    const payload = JSON.parse(await readFile(getFingerprintPath(repoRoot), "utf8"));
    return typeof payload.fingerprint === "string" ? payload.fingerprint : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} repoRoot
 * @param {string} fingerprint
 * @returns {Promise<void>}
 */
async function writeInstalledFingerprint(repoRoot, fingerprint) {
  const markerPath = getFingerprintPath(repoRoot);
  await mkdir(path.dirname(markerPath), { recursive: true });
  await writeFile(
    markerPath,
    `${JSON.stringify({ version: 1, fingerprint, node: process.versions.node }, null, 2)}\n`,
    "utf8"
  );
}

/**
 * @param {string} repoRoot
 * @returns {string[]}
 */
export function getRequiredRuntimeFiles(repoRoot) {
  return [
    path.join(repoRoot, "node_modules", "typescript", "bin", "tsc")
  ];
}

/**
 * @param {string} repoRoot
 * @returns {Promise<{installed: boolean, missing: string[], fingerprint: string, reason?: string}>}
 */
export async function ensureDependencies(repoRoot) {
  const fingerprint = await getDependencyFingerprint(repoRoot);
  const installedFingerprint = await readInstalledFingerprint(repoRoot);
  const requiredFiles = getRequiredRuntimeFiles(repoRoot);
  const missing = [];
  for (const filePath of requiredFiles) {
    if (!(await fileExists(filePath))) {
      missing.push(filePath);
    }
  }

  if (missing.length === 0 && installedFingerprint === fingerprint) {
    return { installed: false, missing: [], fingerprint };
  }

  runCommand(repoRoot, "npm", ["ci"]);

  const unresolved = [];
  for (const filePath of requiredFiles) {
    if (!(await fileExists(filePath))) {
      unresolved.push(filePath);
    }
  }

  if (unresolved.length > 0) {
    throw new Error(`Dependency recovery failed. Missing runtime files: ${unresolved.join(", ")}`);
  }

  await writeInstalledFingerprint(repoRoot, fingerprint);
  return {
    installed: true,
    missing,
    fingerprint,
    reason: missing.length > 0 ? "missing_runtime_files" : "dependency_inputs_changed"
  };
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const result = await ensureDependencies(process.cwd());
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
