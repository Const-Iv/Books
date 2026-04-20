// @ts-check

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { OPERATIONAL_DOCS, fileExists, formatIso, readJson, writeJson } from "./runtime.mjs";

/**
 * @typedef {Object} OperationalDocsArtifact
 * @property {string} taskId
 * @property {string} branch
 * @property {string} capturedAt
 * @property {Record<string, string>} docs
 * @property {{ learnedRules: string[], projectNotes: string[] }} codexMemory
 */

/**
 * @param {string} content
 * @param {string} heading
 * @returns {string[]}
 */
export function extractBulletSection(content, heading) {
  const pattern = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?:\\n## |$)`);
  const match = content.match(pattern);
  if (!match) {
    return [];
  }
  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

/**
 * @param {string[]} current
 * @param {string[]} incoming
 * @returns {string[]}
 */
export function mergeBullets(current, incoming) {
  const merged = [...current];
  for (const line of incoming) {
    if (!merged.includes(line)) {
      merged.push(line);
    }
  }
  return merged;
}

/**
 * @param {string} content
 * @returns {{ preamble: string, sections: Array<{heading: string, content: string}> }}
 */
export function splitMarkdownSections(content) {
  const normalized = content.trim();
  if (!normalized) {
    return {
      preamble: "",
      sections: []
    };
  }

  const lines = normalized.split("\n");
  /** @type {string[]} */
  const preambleLines = [];
  /** @type {Array<{heading: string, lines: string[]}>} */
  const sections = [];
  /** @type {{heading: string, lines: string[]} | null} */
  let currentSection = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        heading: line.trim(),
        lines: [line]
      };
      continue;
    }

    if (currentSection) {
      currentSection.lines.push(line);
      continue;
    }

    preambleLines.push(line);
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    preamble: preambleLines.join("\n").trim(),
    sections: sections.map((section) => ({
      heading: section.heading,
      content: section.lines.join("\n").trim()
    }))
  };
}

/**
 * Merge append-only markdown logs by `##` section headings instead of appending whole files.
 * This keeps existing main-worktree content stable and only appends truly missing entries.
 *
 * @param {string} current
 * @param {string} incoming
 * @returns {string}
 */
export function mergeAppendOnlyMarkdown(current, incoming) {
  const currentTrimmed = current.trim();
  const incomingTrimmed = incoming.trim();

  if (!incomingTrimmed) {
    return current;
  }
  if (!currentTrimmed) {
    return `${incomingTrimmed}\n`;
  }

  const currentSplit = splitMarkdownSections(currentTrimmed);
  const incomingSplit = splitMarkdownSections(incomingTrimmed);
  if (!currentSplit.sections.length || !incomingSplit.sections.length) {
    if (currentTrimmed.includes(incomingTrimmed)) {
      return `${currentTrimmed}\n`;
    }
    return `${currentTrimmed}\n\n${incomingTrimmed}\n`;
  }

  const orderedSections = currentSplit.sections.map((section) => section.content);
  const knownHeadings = new Set(currentSplit.sections.map((section) => section.heading));
  for (const section of incomingSplit.sections) {
    if (knownHeadings.has(section.heading)) {
      continue;
    }
    orderedSections.push(section.content);
    knownHeadings.add(section.heading);
  }

  const preamble = currentSplit.preamble || incomingSplit.preamble;
  const next = [preamble, ...orderedSections].filter(Boolean).join("\n\n").trim();
  return `${next}\n`;
}

/**
 * @param {string} content
 * @param {string} heading
 * @param {string[]} bullets
 * @returns {string}
 */
export function replaceBulletSection(content, heading, bullets) {
  const replacement = `## ${heading}\n\n${bullets.map((line) => `- ${line}`).join("\n")}\n`;
  const pattern = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?:\\n## |$)`);
  if (!pattern.test(content)) {
    return `${content.trim()}\n\n${replacement}`;
  }
  return content.replace(pattern, `${replacement}\n## `).replace(/\n## $/, "\n");
}

/**
 * @param {string} repoRoot
 * @param {string} taskId
 * @param {string} branch
 * @param {string} artifactDir
 * @returns {Promise<string>}
 */
export async function captureOperationalDocs(repoRoot, taskId, branch, artifactDir) {
  /** @type {Record<string, string>} */
  const docs = {};
  for (const relativePath of OPERATIONAL_DOCS) {
    const absolutePath = path.join(repoRoot, relativePath);
    docs[relativePath] = (await fileExists(absolutePath)) ? await readFile(absolutePath, "utf8") : "";
  }

  const codexMemory = docs["CODEX_MEMORY.md"] || "";
  /** @type {OperationalDocsArtifact} */
  const artifact = {
    taskId,
    branch,
    capturedAt: formatIso(),
    docs,
    codexMemory: {
      learnedRules: extractBulletSection(codexMemory, "Learned Rules"),
      projectNotes: extractBulletSection(codexMemory, "Project Notes")
    }
  };

  await mkdir(artifactDir, { recursive: true });
  const artifactPath = path.join(artifactDir, "operational-docs.json");
  await writeJson(artifactPath, artifact);
  return artifactPath;
}

/**
 * @param {string} repoRoot
 * @param {string} artifactDir
 * @returns {Promise<string[]>}
 */
export async function syncOperationalDocs(repoRoot, artifactDir) {
  const artifactPath = path.join(artifactDir, "operational-docs.json");
  const artifact = await readJson(artifactPath);
  if (!artifact) {
    throw new Error(`Operational docs artifact not found at ${artifactPath}`);
  }

  /** @type {string[]} */
  const changed = [];
  const parsedArtifact = /** @type {OperationalDocsArtifact} */ (artifact);

  for (const relativePath of ["Docs/qa-implementation-log.md", "Docs/triz-usage-log.md"]) {
    const absolutePath = path.join(repoRoot, relativePath);
    const current = (await fileExists(absolutePath)) ? await readFile(absolutePath, "utf8") : "";
    const incoming = parsedArtifact.docs[relativePath] || "";
    if (incoming) {
      const next = mergeAppendOnlyMarkdown(current, incoming);
      if (next === current) {
        continue;
      }
      await writeFile(absolutePath, `${next}\n`, "utf8");
      changed.push(relativePath);
    }
  }

  const codexMemoryPath = path.join(repoRoot, "CODEX_MEMORY.md");
  const codexCurrent = (await fileExists(codexMemoryPath)) ? await readFile(codexMemoryPath, "utf8") : "";
  const learnedRules = mergeBullets(
    extractBulletSection(codexCurrent, "Learned Rules"),
    parsedArtifact.codexMemory.learnedRules
  );
  const projectNotes = mergeBullets(
    extractBulletSection(codexCurrent, "Project Notes"),
    parsedArtifact.codexMemory.projectNotes
  );
  let codexNext = codexCurrent;
  codexNext = replaceBulletSection(codexNext, "Learned Rules", learnedRules);
  codexNext = replaceBulletSection(codexNext, "Project Notes", projectNotes);
  if (codexNext !== codexCurrent) {
    await writeFile(codexMemoryPath, `${codexNext.trim()}\n`, "utf8");
    changed.push("CODEX_MEMORY.md");
  }

  return changed;
}

/**
 * @param {import("./runtime.mjs").HistoryEvent[]} events
 * @returns {string}
 */
export function buildTaskHistoryMarkdown(events) {
  const lines = [
    "# Task History",
    "",
    "| Timestamp | Task | Branch | Event | Payload |",
    "| --- | --- | --- | --- | --- |"
  ];

  for (const event of events) {
    const payload = Object.keys(event.payload).length > 0 ? JSON.stringify(event.payload) : "{}";
    lines.push(`| ${event.at} | ${event.taskId} | ${event.branch} | ${event.type} | \`${payload}\` |`);
  }

  return `${lines.join("\n")}\n`;
}

/**
 * @param {import("./runtime.mjs").TaskState[]} states
 * @param {import("./runtime.mjs").HistoryEvent[]} events
 * @returns {string}
 */
export function buildChangeLedgerMarkdown(states, events) {
  const lines = [
    "# Change Ledger",
    "",
    "| Task | Branch | Status | Last event |",
    "| --- | --- | --- | --- |"
  ];

  for (const state of states.sort((left, right) => left.createdAt.localeCompare(right.createdAt))) {
    const lastEvent = [...events].reverse().find((event) => event.taskId === state.taskId);
    lines.push(`| ${state.taskId} | ${state.branch} | ${state.status} | ${lastEvent?.type ?? "-"} |`);
  }

  return `${lines.join("\n")}\n`;
}
