// @ts-check

import { readFile } from "node:fs/promises";
import path from "node:path";

import { getChangedFiles, getCurrentBranch, getHeadSha, runCommand } from "./runtime.mjs";

/**
 * @param {string[]} files
 * @returns {Set<string>}
 */
export function detectChangedZones(files) {
  const zones = new Set();
  for (const file of files) {
    if (file.startsWith(".github/")) {
      zones.add("ci");
      continue;
    }
    if (
      file.startsWith(".memory-bank/") ||
      file === "AGENTS.md" ||
      file === "CODEX_MEMORY.md" ||
      file === "CLAUDE.md" ||
      file === ".cursorrules" ||
      file === "README.md"
    ) {
      zones.add("governance");
      continue;
    }
    if (file.startsWith("scripts/")) {
      zones.add("runtime");
      continue;
    }
    if (file.startsWith("tests/") || file.startsWith("Docs/qa")) {
      zones.add("qa");
      continue;
    }
    zones.add("product");
  }
  return zones;
}

/**
 * @param {string} repoRoot
 * @returns {Promise<number>}
 */
export async function getNextVersion(repoRoot) {
  const latest = runCommand(repoRoot, "git", ["log", "--format=%s", "-n", "50"], { allowFailure: true }).stdout
    .split("\n")
    .find((line) => line.startsWith("Ver. "));
  if (!latest) {
    return 4;
  }
  const match = latest.match(/^Ver\. ([0-9]+\.[0-9]{2}) /);
  if (!match) {
    return 4;
  }
  return Number.parseFloat((Number.parseFloat(match[1]) + 0.01).toFixed(2));
}

/**
 * @param {string[]} files
 * @param {string} title
 * @returns {"feat:"|"fix:"|"docs:"|"refactor:"}
 */
export function inferCommitType(files, title) {
  const lowercaseTitle = title.toLowerCase();
  if (/\bfix\b|\bbug\b|регресс|ошибк/.test(lowercaseTitle)) {
    return "fix:";
  }
  if (files.every((file) => file.endsWith(".md") || file.startsWith("Docs/") || file.startsWith(".memory-bank/"))) {
    return "docs:";
  }
  if (
    files.some((file) =>
      ["scripts/", "tests/", "package.json", "package-lock.json", "tsconfig.json", ".github/"].some((prefix) =>
        file.startsWith(prefix)
      )
    )
  ) {
    return "refactor:";
  }
  return "feat:";
}

/**
 * @param {string} repoRoot
 * @param {string} title
 * @returns {Promise<string>}
 */
export async function buildCommitMessage(repoRoot, title) {
  const files = await getChangedFiles(repoRoot);
  const version = (await getNextVersion(repoRoot)).toFixed(2);
  const type = inferCommitType(files, title);
  const description = slugFromTitle(title);
  return `Ver. ${version} ${type} ${description} | билд прошел`;
}

/**
 * @param {string} title
 * @returns {string}
 */
export function slugFromTitle(title) {
  const ascii = title
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 40);
  return ascii || "task change";
}

/**
 * @param {string} repoRoot
 * @param {string} taskId
 * @returns {Promise<import("./runtime.mjs").HistoryEvent[]>}
 */
export async function readTaskEvents(repoRoot, taskId) {
  const { readNdjson, getPipelinePaths } = await import("./runtime.mjs");
  const historyPath = path.join(getPipelinePaths(repoRoot).historyDir, "events.ndjson");
  const allEvents = await readNdjson(historyPath);
  return allEvents.filter((event) => event.taskId === taskId);
}

/**
 * @param {string} repoRoot
 * @returns {Promise<string[]>}
 */
export async function readCurrentChangedFiles(repoRoot) {
  const files = await getChangedFiles(repoRoot);
  return files;
}

/**
 * @param {string} repoRoot
 * @returns {Promise<boolean>}
 */
export async function ensureCommittedHead(repoRoot) {
  const branch = getCurrentBranch(repoRoot);
  const head = getHeadSha(repoRoot);
  return Boolean(branch && head);
}

/**
 * @param {string} repoRoot
 * @returns {Promise<string>}
 */
export async function readReadme(repoRoot) {
  return readFile(path.join(repoRoot, "README.md"), "utf8");
}
