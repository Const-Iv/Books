// @ts-check

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, realpath, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { findGitRoot, formatIso, getCodexHome, parseArgs, runCommand } from "./lib/runtime.mjs";

const THIS_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = path.dirname(path.dirname(THIS_FILE));
const RULE_SYNC_DIR = "runtime/rule-sync";
const SCANS_DIR = "scans";
const DEFAULT_MAX_DEPTH = 5;
const GOVERNANCE_FILES = new Set(["AGENTS.md", "CODEX_MEMORY.md", "CLAUDE.md", ".cursorrules", "README.md"]);
const GOVERNANCE_PREFIXES = [
  ".memory-bank/",
  "plans/_template.md",
  "plans/reference/",
  "Docs/qa-implementation-log.md",
  "Docs/triz-usage-log.md",
  "research/triz/",
  "_bmad/",
  ".agents/",
  ".claude/",
  ".cursor/"
];
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "runtime",
  "tmp",
  "coverage",
  "playwright-report",
  ".next",
  "dist",
  "build"
]);
const PRODUCT_SPECIFIC_TOKENS = [
  "agent_const",
  "agent const",
  "telegram",
  "calendar",
  "gmail",
  "crm",
  "wannadinner",
  "restaurant",
  "delivery",
  "fireflies",
  "fathom",
  "avatar",
  "ollama",
  "gemma",
  "gantt-bb",
  "business booster",
  "industry-watch",
  "relationship",
  "inbox"
];
const REUSABLE_TOKENS = [
  "starter",
  "baseline",
  "governance",
  "source of truth",
  "qa",
  "deterministic",
  "worktree",
  "task:start",
  "task:finish",
  "task:merge",
  "release:local",
  "memory-bank",
  "product charter",
  "mission",
  "vision",
  "миссия",
  "видение",
  "цель",
  "jtbd",
  "triz",
  "skill",
  "skills",
  "cleanup",
  "previewpreparedsha",
  "plan template"
];
const SECRET_PATTERN = /(token|secret|password|credential|api[_-]?key|private key|session|phone|auth)/i;

/**
 * @typedef {"import_candidate"|"needs_review"|"product_specific"} RuleCategory
 */

/**
 * @typedef {Object} RuleSyncConfig
 * @property {string[]} [roots]
 * @property {string[]} [allowlist]
 * @property {string[]} [ignorelist]
 */

/**
 * @typedef {Object} DiscoveredProject
 * @property {string} label
 * @property {string} repoRoot
 * @property {string} gitCommonDir
 * @property {boolean} hasTaskPipeline
 */

/**
 * @typedef {Object} RuleCandidate
 * @property {string} id
 * @property {RuleCategory} category
 * @property {string} sourceProject
 * @property {string} sourceRepo
 * @property {"task"|"commit"|"worktree_diff"} sourceType
 * @property {string | null} taskId
 * @property {string | null} branch
 * @property {string | null} commitSha
 * @property {string} title
 * @property {string[]} paths
 * @property {string[]} snippets
 * @property {string[]} suggestedTargetFiles
 * @property {string} summary
 * @property {string} evidence
 * @property {"high"|"medium"|"low"} confidence
 * @property {string[]} classifierReasons
 */

/**
 * @typedef {Object} RuleSyncSnapshot
 * @property {1} schemaVersion
 * @property {string} generatedAt
 * @property {string} since
 * @property {string} until
 * @property {string} repoRoot
 * @property {DiscoveredProject[]} projects
 * @property {RuleCandidate[]} candidates
 * @property {string[]} diagnostics
 */

/**
 * @typedef {Object} ScanOptions
 * @property {string} repoRoot
 * @property {Date} since
 * @property {Date} until
 * @property {string[]} [roots]
 * @property {RuleSyncConfig} [config]
 * @property {number} [maxDepth]
 */

/**
 * @typedef {Object} ApplyApproval
 * @property {string[]} [approved]
 * @property {Record<string, string>} [corrections]
 */

/**
 * @param {string} input
 * @returns {string}
 */
function normalizePath(input) {
  return input.split(path.sep).join("/");
}

/**
 * @param {string} input
 * @returns {string}
 */
function shortHash(input) {
  return createHash("sha256").update(input).digest("hex").slice(0, 10);
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isGovernancePath(value) {
  const normalized = normalizePath(value).replace(/^\.\//, "");
  if (GOVERNANCE_FILES.has(normalized)) {
    return true;
  }
  return GOVERNANCE_PREFIXES.some((prefix) => normalized === prefix.replace(/\/$/, "") || normalized.startsWith(prefix));
}

/**
 * @param {string[]} values
 * @returns {string[]}
 */
function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

/**
 * @param {string} input
 * @returns {string}
 */
function sanitizeSnippet(input) {
  const cleaned = input.replace(/\s+/g, " ").trim();
  if (!cleaned || SECRET_PATTERN.test(cleaned)) {
    return "";
  }
  return cleaned.length > 180 ? `${cleaned.slice(0, 177)}...` : cleaned;
}

/**
 * @param {Date} date
 * @returns {string}
 */
function formatDateStamp(date) {
  return date.toISOString().replaceAll(":", "").replaceAll(".", "").replace("T", "-").replace("Z", "Z");
}

/**
 * @param {string} value
 * @param {"start"|"end"} boundary
 * @returns {Date}
 */
export function parseBoundaryDate(value, boundary) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    if (boundary === "end") {
      return new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return parsed;
}

/**
 * @param {Date} [now]
 * @returns {{since: Date, until: Date}}
 */
export function previousLocalDayWindow(now = new Date()) {
  const since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
  const until = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return { since, until };
}

/**
 * @param {string} repoRoot
 * @returns {Promise<RuleSyncConfig>}
 */
async function loadLocalConfig(repoRoot) {
  const configPath = path.join(repoRoot, RULE_SYNC_DIR, "config.json");
  if (!existsSync(configPath)) {
    return {};
  }
  const raw = JSON.parse(await readFile(configPath, "utf8"));
  return {
    roots: Array.isArray(raw.roots) ? raw.roots.map(String) : [],
    allowlist: Array.isArray(raw.allowlist) ? raw.allowlist.map(String) : [],
    ignorelist: Array.isArray(raw.ignorelist) ? raw.ignorelist.map(String) : []
  };
}

/**
 * @param {string} repoRoot
 * @returns {string[]}
 */
function defaultDiscoveryRoots(repoRoot) {
  return uniqueSorted([path.dirname(repoRoot), path.join(getCodexHome(), "worktrees")]);
}

/**
 * @param {string} root
 * @param {number} maxDepth
 * @returns {Promise<string[]>}
 */
async function findGitRepositories(root, maxDepth) {
  if (!existsSync(root)) {
    return [];
  }
  /** @type {string[]} */
  const repos = [];

  /**
   * @param {string} current
   * @param {number} depth
   * @returns {Promise<void>}
   */
  async function walk(current, depth) {
    const gitPath = path.join(current, ".git");
    if (existsSync(gitPath)) {
      repos.push(current);
      return;
    }
    if (depth >= maxDepth) {
      return;
    }
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) {
        continue;
      }
      await walk(path.join(current, entry.name), depth + 1);
    }
  }

  await walk(root, 0);
  return repos;
}

/**
 * @param {string} repoRoot
 * @returns {string | null}
 */
function gitCommonDir(repoRoot) {
  const result = runCommand(repoRoot, "git", ["rev-parse", "--git-common-dir"], { allowFailure: true });
  if (result.status !== 0) {
    return null;
  }
  const raw = result.stdout.trim();
  return path.resolve(repoRoot, raw);
}

/**
 * @param {string} repoRoot
 * @returns {string | null}
 */
function gitRoot(repoRoot) {
  const result = runCommand(repoRoot, "git", ["rev-parse", "--show-toplevel"], { allowFailure: true });
  return result.status === 0 ? result.stdout.trim() : null;
}

/**
 * @param {string} candidate
 * @returns {Promise<string>}
 */
async function canonicalPath(candidate) {
  return realpath(candidate).catch(() => path.resolve(candidate));
}

/**
 * @param {string[]} ignorelist
 * @param {string} repoRoot
 * @returns {Promise<boolean>}
 */
async function isIgnored(ignorelist, repoRoot) {
  const resolved = await canonicalPath(repoRoot);
  for (const item of ignorelist) {
    const ignored = await canonicalPath(item);
    if (resolved === ignored || resolved.startsWith(`${ignored}${path.sep}`)) {
      return true;
    }
  }
  return false;
}

/**
 * @param {string} repoRoot
 * @returns {string}
 */
function projectLabel(repoRoot) {
  return path.basename(repoRoot).trim() || repoRoot;
}

/**
 * @param {string} repoRoot
 * @returns {Promise<DiscoveredProject[]>}
 */
export async function discoverProjects(repoRoot) {
  const localConfig = await loadLocalConfig(repoRoot);
  const config = localConfig;
  const roots = uniqueSorted([
    ...defaultDiscoveryRoots(repoRoot),
    ...(config.roots ?? []).map((item) => path.resolve(repoRoot, item))
  ]);
  const explicitRepos = (config.allowlist ?? []).map((item) => path.resolve(repoRoot, item));
  const discovered = [];
  for (const root of roots) {
    discovered.push(...(await findGitRepositories(root, DEFAULT_MAX_DEPTH)));
  }
  discovered.push(...explicitRepos);

  const targetCommonDir = gitCommonDir(repoRoot);
  /** @type {Map<string, DiscoveredProject>} */
  const byCommonDir = new Map();
  for (const candidate of uniqueSorted(discovered)) {
    const root = gitRoot(candidate);
    if (!root || (await isIgnored(config.ignorelist ?? [], root))) {
      continue;
    }
    const commonDir = gitCommonDir(root);
    if (!commonDir || commonDir === targetCommonDir) {
      continue;
    }
    const existing = byCommonDir.get(commonDir);
    const prefersCandidate = !existing || existing.repoRoot.includes(`${path.sep}.codex${path.sep}worktrees${path.sep}`);
    if (prefersCandidate) {
      byCommonDir.set(commonDir, {
        label: projectLabel(root),
        repoRoot: root,
        gitCommonDir: commonDir,
        hasTaskPipeline: existsSync(path.join(commonDir, "codex-task-pipeline", "tasks"))
      });
    }
  }
  return [...byCommonDir.values()].sort((left, right) => left.label.localeCompare(right.label));
}

/**
 * @param {string} repoRoot
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
async function readHistoryEvents(repoRoot) {
  const commonDir = gitCommonDir(repoRoot);
  if (!commonDir) {
    return [];
  }
  const historyPath = path.join(commonDir, "codex-task-pipeline", "history", "events.ndjson");
  if (!existsSync(historyPath)) {
    return [];
  }
  try {
    return (await readFile(historyPath, "utf8"))
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .filter((item) => item && typeof item === "object");
  } catch {
    return [];
  }
}

/**
 * @param {string} repoRoot
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
async function readTaskStates(repoRoot) {
  const commonDir = gitCommonDir(repoRoot);
  if (!commonDir) {
    return [];
  }
  const tasksDir = path.join(commonDir, "codex-task-pipeline", "tasks");
  if (!existsSync(tasksDir)) {
    return [];
  }
  const entries = await readdir(tasksDir, { withFileTypes: true }).catch(() => []);
  const states = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      continue;
    }
    try {
      const raw = JSON.parse(await readFile(path.join(tasksDir, entry.name), "utf8"));
      if (raw && typeof raw === "object") {
        states.push(raw);
      }
    } catch {
      // Ignore malformed task state files; diagnostics are emitted at project level.
    }
  }
  return states;
}

/**
 * @param {Record<string, unknown>} item
 * @param {string} key
 * @returns {string}
 */
function stringField(item, key) {
  return key in item && typeof item[key] === "string" ? String(item[key]) : "";
}

/**
 * @param {Record<string, unknown>} item
 * @returns {Date | null}
 */
function itemDate(item) {
  for (const key of ["at", "createdAt", "finishedAt", "qaLastPassAt"]) {
    const value = stringField(item, key);
    if (!value) {
      continue;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

/**
 * @param {Date | null} date
 * @param {Date} since
 * @param {Date} until
 * @returns {boolean}
 */
function inWindow(date, since, until) {
  return Boolean(date && date >= since && date < until);
}

/**
 * @param {string} repoRoot
 * @param {string} commitSha
 * @returns {string[]}
 */
function commitPaths(repoRoot, commitSha) {
  const result = runCommand(repoRoot, "git", ["show", "--pretty=format:", "--name-only", commitSha, "--"], {
    allowFailure: true
  });
  return result.status === 0 ? uniqueSorted(result.stdout.split("\n").map((line) => line.trim()).filter(isGovernancePath)) : [];
}

/**
 * @param {string} repoRoot
 * @param {string} commitSha
 * @returns {string}
 */
function commitSubject(repoRoot, commitSha) {
  const result = runCommand(repoRoot, "git", ["show", "-s", "--format=%s", commitSha], { allowFailure: true });
  return result.status === 0 ? result.stdout.trim() : "";
}

/**
 * @param {string} repoRoot
 * @param {string} commitSha
 * @param {string[]} paths
 * @returns {string[]}
 */
function commitSnippets(repoRoot, commitSha, paths) {
  const result = runCommand(repoRoot, "git", ["show", "--format=", "--unified=0", commitSha, "--", ...paths], {
    allowFailure: true
  });
  if (result.status !== 0) {
    return [];
  }
  return result.stdout
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => sanitizeSnippet(line.slice(1)))
    .filter(Boolean)
    .slice(0, 8);
}

/**
 * @param {string} repoRoot
 * @param {string[]} paths
 * @returns {string[]}
 */
function worktreeSnippets(repoRoot, paths) {
  const result = runCommand(repoRoot, "git", ["diff", "--unified=0", "--", ...paths], { allowFailure: true });
  if (result.status !== 0) {
    return [];
  }
  return result.stdout
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => sanitizeSnippet(line.slice(1)))
    .filter(Boolean)
    .slice(0, 8);
}

/**
 * @param {string} repoRoot
 * @param {Date} since
 * @param {Date} until
 * @returns {Array<{sha: string, subject: string}>}
 */
function governanceCommits(repoRoot, since, until) {
  const result = runCommand(
    repoRoot,
    "git",
    [
      "log",
      `--since=${since.toISOString()}`,
      `--until=${until.toISOString()}`,
      "--format=%H%x09%s",
      "--",
      ...[...GOVERNANCE_FILES],
      ...GOVERNANCE_PREFIXES
    ],
    { allowFailure: true }
  );
  if (result.status !== 0) {
    return [];
  }
  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sha = "", subject = ""] = line.split("\t");
      return { sha, subject };
    })
    .filter((item) => item.sha);
}

/**
 * @param {string[]} paths
 * @returns {string[]}
 */
function suggestedTargets(paths) {
  const targets = paths.map((item) => {
    if (item.startsWith("Docs/") || item.startsWith("plans/")) {
      return "AGENTS.md / .memory-bank/*";
    }
    return item;
  });
  return uniqueSorted(targets.length > 0 ? targets : ["AGENTS.md", ".memory-bank/code-rules.md"]);
}

/**
 * @param {{title: string, paths: string[], snippets: string[]}} input
 * @returns {{category: RuleCategory, reasons: string[]}}
 */
export function classifyRuleCandidate(input) {
  const haystack = [input.title, ...input.paths, ...input.snippets].join(" ").toLowerCase();
  const reusableHits = REUSABLE_TOKENS.filter((token) => haystack.includes(token));
  const productHits = PRODUCT_SPECIFIC_TOKENS.filter((token) => haystack.includes(token));
  if (productHits.length > 0 && reusableHits.length === 0) {
    return { category: "product_specific", reasons: productHits.map((token) => `product:${token}`) };
  }
  if (productHits.length > 0) {
    return {
      category: "needs_review",
      reasons: [...reusableHits.map((token) => `reusable:${token}`), ...productHits.map((token) => `product:${token}`)]
    };
  }
  if (reusableHits.length > 0) {
    return { category: "import_candidate", reasons: reusableHits.map((token) => `reusable:${token}`) };
  }
  return { category: "needs_review", reasons: ["no strong reusable/product-specific signal"] };
}

/**
 * @param {Omit<RuleCandidate, "id"|"category"|"classifierReasons"|"suggestedTargetFiles"|"summary"> & {summary?: string}} input
 * @returns {RuleCandidate}
 */
function buildCandidate(input) {
  const classifier = classifyRuleCandidate({ title: input.title, paths: input.paths, snippets: input.snippets });
  const summary = input.summary || `Изменены governance paths: ${input.paths.join(", ") || "не определены"}.`;
  const identity = [input.sourceProject, input.sourceType, input.taskId, input.commitSha, input.paths.join(","), input.title].join("|");
  return {
    ...input,
    id: `rs-${shortHash(identity)}`,
    category: classifier.category,
    classifierReasons: classifier.reasons,
    suggestedTargetFiles: suggestedTargets(input.paths),
    summary
  };
}

/**
 * @param {DiscoveredProject} project
 * @param {Date} since
 * @param {Date} until
 * @returns {Promise<{candidates: RuleCandidate[], diagnostics: string[]}>}
 */
async function collectProjectCandidates(project, since, until) {
  /** @type {RuleCandidate[]} */
  const candidates = [];
  /** @type {string[]} */
  const diagnostics = [];
  const states = await readTaskStates(project.repoRoot);
  const events = await readHistoryEvents(project.repoRoot);
  /** @type {Map<string, Array<Record<string, unknown>>>} */
  const eventsByTask = new Map();
  for (const event of events) {
    const taskId = typeof event.taskId === "string" ? event.taskId : "";
    if (!taskId) {
      continue;
    }
    const bucket = eventsByTask.get(taskId) ?? [];
    bucket.push(event);
    eventsByTask.set(taskId, bucket);
  }

  const seenCommits = new Set();
  for (const state of states) {
    const taskId = stringField(state, "taskId");
    const taskEvents = eventsByTask.get(taskId) ?? [];
    const active = inWindow(itemDate(state), since, until) || taskEvents.some((event) => inWindow(itemDate(event), since, until));
    if (!active) {
      continue;
    }

    const commitSha = stringField(state, "commitSha");
    if (commitSha) {
      const paths = commitPaths(project.repoRoot, commitSha);
      if (paths.length > 0) {
        seenCommits.add(commitSha);
        candidates.push(
          buildCandidate({
            sourceProject: project.label,
            sourceRepo: project.repoRoot,
            sourceType: "task",
            taskId,
            branch: stringField(state, "branch") || null,
            commitSha,
            title: stringField(state, "title") || commitSubject(project.repoRoot, commitSha) || taskId,
            paths,
            snippets: commitSnippets(project.repoRoot, commitSha, paths),
            evidence: `task ${taskId}; commit ${commitSha.slice(0, 8)}`,
            confidence: "high"
          })
        );
      }
    }

    const worktreePath = stringField(state, "worktreePath");
    if (worktreePath && existsSync(worktreePath)) {
      const result = runCommand(worktreePath, "git", ["diff", "--name-only"], { allowFailure: true });
      const paths = result.status === 0 ? uniqueSorted(result.stdout.split("\n").map((line) => line.trim()).filter(isGovernancePath)) : [];
      if (paths.length > 0) {
        candidates.push(
          buildCandidate({
            sourceProject: project.label,
            sourceRepo: project.repoRoot,
            sourceType: "worktree_diff",
            taskId,
            branch: stringField(state, "branch") || null,
            commitSha: null,
            title: stringField(state, "title") || taskId,
            paths,
            snippets: worktreeSnippets(worktreePath, paths),
            evidence: `task ${taskId}; uncommitted worktree diff`,
            confidence: "medium"
          })
        );
      }
    }
  }

  for (const commit of governanceCommits(project.repoRoot, since, until)) {
    if (seenCommits.has(commit.sha)) {
      continue;
    }
    const paths = commitPaths(project.repoRoot, commit.sha);
    if (paths.length === 0) {
      continue;
    }
    candidates.push(
      buildCandidate({
        sourceProject: project.label,
        sourceRepo: project.repoRoot,
        sourceType: "commit",
        taskId: null,
        branch: null,
        commitSha: commit.sha,
        title: commit.subject || commit.sha.slice(0, 8),
        paths,
        snippets: commitSnippets(project.repoRoot, commit.sha, paths),
        evidence: `commit ${commit.sha.slice(0, 8)}`,
        confidence: "low"
      })
    );
  }

  if (!project.hasTaskPipeline) {
    diagnostics.push(`${project.label}: task pipeline не найден; git commits учитываются с lower confidence.`);
  }
  return { candidates, diagnostics };
}

/**
 * @param {ScanOptions} options
 * @returns {Promise<RuleSyncSnapshot>}
 */
export async function scanRuleSync(options) {
  const projects = options.roots
    ? await discoverProjectsWithRoots(options.repoRoot, options.roots, options.config ?? {})
    : await discoverProjects(options.repoRoot);
  /** @type {RuleCandidate[]} */
  const candidates = [];
  /** @type {string[]} */
  const diagnostics = [];

  for (const project of projects) {
    const collected = await collectProjectCandidates(project, options.since, options.until);
    candidates.push(...collected.candidates);
    diagnostics.push(...collected.diagnostics);
  }

  const deduped = [...new Map(candidates.map((candidate) => [candidate.id, candidate])).values()].sort((left, right) =>
    left.id.localeCompare(right.id)
  );
  return {
    schemaVersion: 1,
    generatedAt: formatIso(),
    since: options.since.toISOString(),
    until: options.until.toISOString(),
    repoRoot: options.repoRoot,
    projects,
    candidates: deduped,
    diagnostics
  };
}

/**
 * Test seam for explicit roots.
 * @param {string} repoRoot
 * @param {string[]} roots
 * @param {RuleSyncConfig} config
 * @returns {Promise<DiscoveredProject[]>}
 */
export async function discoverProjectsWithRoots(repoRoot, roots, config = {}) {
  const discovered = [];
  for (const root of roots) {
    const stats = await stat(root).catch(() => null);
    if (!stats) {
      continue;
    }
    if (existsSync(path.join(root, ".git"))) {
      discovered.push(root);
    } else if (stats.isDirectory()) {
      discovered.push(...(await findGitRepositories(root, DEFAULT_MAX_DEPTH)));
    }
  }
  discovered.push(...(config.allowlist ?? []).map((item) => path.resolve(repoRoot, item)));

  const targetCommonDir = gitCommonDir(repoRoot);
  const projects = [];
  const seen = new Set();
  for (const candidate of uniqueSorted(discovered)) {
    const root = gitRoot(candidate);
    if (!root || (await isIgnored(config.ignorelist ?? [], root))) {
      continue;
    }
    const commonDir = gitCommonDir(root);
    if (!commonDir || commonDir === targetCommonDir || seen.has(commonDir)) {
      continue;
    }
    seen.add(commonDir);
    projects.push({
      label: projectLabel(root),
      repoRoot: root,
      gitCommonDir: commonDir,
      hasTaskPipeline: existsSync(path.join(commonDir, "codex-task-pipeline", "tasks"))
    });
  }
  return projects.sort((left, right) => left.label.localeCompare(right.label));
}

/**
 * @param {RuleCategory} category
 * @returns {string}
 */
function categoryTitle(category) {
  if (category === "import_candidate") {
    return "Кандидаты на импорт";
  }
  if (category === "needs_review") {
    return "Требует ручной проверки";
  }
  return "Пропущено как product-specific";
}

/**
 * @param {RuleSyncSnapshot} snapshot
 * @returns {string}
 */
export function renderRuleSyncReport(snapshot) {
  const lines = [
    "# Starter Rule Sync",
    "",
    `Период: ${snapshot.since} — ${snapshot.until}`,
    `Проектов проверено: ${snapshot.projects.length}`,
    `Кандидатов найдено: ${snapshot.candidates.length}`
  ];

  for (const category of /** @type {RuleCategory[]} */ (["import_candidate", "needs_review", "product_specific"])) {
    const items = snapshot.candidates.filter((candidate) => candidate.category === category);
    lines.push("", `## ${categoryTitle(category)}`);
    if (items.length === 0) {
      lines.push("- Нет.");
      continue;
    }
    for (const candidate of items) {
      lines.push(`- ${candidate.id}: [${candidate.sourceProject}] ${candidate.title}`);
      lines.push(`  Источник: ${candidate.evidence}; confidence=${candidate.confidence}`);
      lines.push(`  Файлы: ${candidate.paths.join(", ") || "не определены"}`);
      lines.push(`  Target: ${candidate.suggestedTargetFiles.join(", ")}`);
      lines.push(`  Смысл: ${candidate.summary}`);
      if (candidate.snippets.length > 0) {
        lines.push(`  Фрагменты: ${candidate.snippets.slice(0, 3).join(" / ")}`);
      }
      lines.push(`  Причины классификации: ${candidate.classifierReasons.join(", ")}`);
    }
  }

  lines.push("", "## Диагностика");
  if (snapshot.diagnostics.length === 0) {
    lines.push("- Нет.");
  } else {
    for (const diagnostic of snapshot.diagnostics) {
      lines.push(`- ${diagnostic}`);
    }
  }
  return lines.join("\n");
}

/**
 * @param {string} repoRoot
 * @returns {Promise<string | null>}
 */
async function latestScanPath(repoRoot) {
  const scansRoot = path.join(repoRoot, RULE_SYNC_DIR, SCANS_DIR);
  if (!existsSync(scansRoot)) {
    return null;
  }
  const entries = await readdir(scansRoot, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(scansRoot, entry.name))
    .sort();
  return files.at(-1) ?? null;
}

/**
 * @param {string} filePath
 * @returns {Promise<RuleSyncSnapshot>}
 */
async function readSnapshot(filePath) {
  return /** @type {RuleSyncSnapshot} */ (JSON.parse(await readFile(filePath, "utf8")));
}

/**
 * @param {string} repoRoot
 * @param {RuleSyncSnapshot} snapshot
 * @param {string | undefined} outputPath
 * @returns {Promise<string>}
 */
async function writeSnapshot(repoRoot, snapshot, outputPath) {
  const targetPath =
    outputPath ?? path.join(repoRoot, RULE_SYNC_DIR, SCANS_DIR, `rule-sync-${formatDateStamp(new Date(snapshot.generatedAt))}.json`);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return targetPath;
}

/**
 * @param {RuleSyncSnapshot} snapshot
 * @param {ApplyApproval} approval
 * @returns {{status: "ready", title: string, seedMessage: string, command: string[], selectedCandidates: RuleCandidate[]}}
 */
export function buildApplyPlan(snapshot, approval) {
  const approved = new Set(approval.approved ?? []);
  const selectedCandidates = snapshot.candidates.filter((candidate) => approved.has(candidate.id));
  const title = "Starter rule sync import";
  const lines = [
    "Импортировать подтверждённые reusable правила в new-project-starter.",
    "",
    "Approved candidates:"
  ];
  for (const candidate of selectedCandidates) {
    lines.push(
      `- ${candidate.id}: [${candidate.sourceProject}] ${candidate.title}; target=${candidate.suggestedTargetFiles.join(", ")}; evidence=${candidate.evidence}`
    );
    const correction = approval.corrections?.[candidate.id];
    if (correction) {
      lines.push(`  Correction: ${correction}`);
    }
  }
  lines.push("", "Требования: создать plan file по текущему template, не переносить product-specific детали, прогнать deterministic QA.");
  const seedMessage = lines.join("\n");
  return {
    status: "ready",
    title,
    seedMessage,
    command: ["npm", "run", "task:start", "--", "--title", title, "--seed-message", seedMessage],
    selectedCandidates
  };
}

/**
 * @returns {never}
 */
function usage() {
  throw new Error(
    [
      "Usage:",
      "  node scripts/rule-sync.mjs scan [--since <date>] [--until <date>] [--output <path>] [--json]",
      "  node scripts/rule-sync.mjs report --latest|--scan <path> [--json]",
      "  node scripts/rule-sync.mjs apply-plan --approval <path> --dry-run [--scan <path>] [--json]"
    ].join("\n")
  );
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = findGitRoot(process.cwd());
  const { flags, positionals } = parseArgs(process.argv.slice(2));
  const command = positionals[0];
  if (!command) {
    usage();
  }

  if (command === "scan") {
    const defaultWindow = previousLocalDayWindow();
    const since = typeof flags.since === "string" ? parseBoundaryDate(flags.since, "start") : defaultWindow.since;
    const until = typeof flags.until === "string" ? parseBoundaryDate(flags.until, "end") : defaultWindow.until;
    const snapshot = await scanRuleSync({ repoRoot, since, until });
    const outputPath = await writeSnapshot(repoRoot, snapshot, typeof flags.output === "string" ? flags.output : undefined);
    const payload = {
      status: "ok",
      outputPath,
      projects: snapshot.projects.length,
      candidates: snapshot.candidates.length,
      importCandidates: snapshot.candidates.filter((candidate) => candidate.category === "import_candidate").length,
      needsReview: snapshot.candidates.filter((candidate) => candidate.category === "needs_review").length,
      productSpecific: snapshot.candidates.filter((candidate) => candidate.category === "product_specific").length
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (command === "report") {
    const scanPath = typeof flags.scan === "string" ? flags.scan : flags.latest === true ? await latestScanPath(repoRoot) : null;
    if (!scanPath) {
      throw new Error("No scan selected. Use --latest or --scan <path>.");
    }
    const snapshot = await readSnapshot(scanPath);
    const text = renderRuleSyncReport(snapshot);
    if (flags.json === true) {
      console.log(JSON.stringify({ status: "ok", scanPath, text, snapshot }, null, 2));
    } else {
      console.log(text);
    }
    return;
  }

  if (command === "apply-plan") {
    if (flags["dry-run"] !== true) {
      throw new Error("v1 apply-plan is approval-safe and only supports --dry-run.");
    }
    if (typeof flags.approval !== "string") {
      throw new Error("--approval <path> is required.");
    }
    const scanPath = typeof flags.scan === "string" ? flags.scan : await latestScanPath(repoRoot);
    if (!scanPath) {
      throw new Error("No scan found. Use --scan <path> or run rule-sync:scan first.");
    }
    const snapshot = await readSnapshot(scanPath);
    const approval = /** @type {ApplyApproval} */ (JSON.parse(await readFile(flags.approval, "utf8")));
    const plan = buildApplyPlan(snapshot, approval);
    console.log(JSON.stringify({ ...plan, dryRun: true, scanPath }, null, 2));
    return;
  }

  usage();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
