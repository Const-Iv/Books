// @ts-check

import { performance } from "node:perf_hooks";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildChangeLedgerMarkdown } from "./lib/doc-utils.mjs";

/**
 * @returns {Promise<void>}
 */
async function main() {
  const baselinePath = path.join(process.cwd(), "Docs/qa-perf-baseline.json");
  const baseline = /** @type {{sampleCount: number, tasks: number, maxMeanMs: number}} */ (
    JSON.parse(await readFile(baselinePath, "utf8"))
  );

  /** @type {import("./lib/runtime.mjs").TaskState[]} */
  const states = Array.from({ length: baseline.tasks }, (_, index) => ({
    taskId: `task-${index}`,
    title: `Task ${index}`,
    slug: `task-${index}`,
    branch: `codex/task-${index}`,
    sourceBranch: "main",
    repoRoot: "/tmp/repo",
    worktreePath: `/tmp/repo/task-${index}`,
    createdAt: new Date(1700000000000 + index * 1000).toISOString(),
    seedMessage: "Synthetic benchmark task",
    status: "started"
  }));
  /** @type {import("./lib/runtime.mjs").HistoryEvent[]} */
  const events = states.map((state) => ({
    at: state.createdAt,
    type: "START",
    taskId: state.taskId,
    branch: state.branch,
    payload: { benchmark: true }
  }));

  /** @type {number[]} */
  const samples = [];
  for (let iteration = 0; iteration < baseline.sampleCount; iteration += 1) {
    const startedAt = performance.now();
    buildChangeLedgerMarkdown(states, events);
    samples.push(performance.now() - startedAt);
  }

  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  if (mean > baseline.maxMeanMs) {
    throw new Error(`perf-critical: mean ${mean.toFixed(2)}ms exceeds ${baseline.maxMeanMs}ms`);
  }

  console.log(`perf-critical: mean ${mean.toFixed(2)}ms <= ${baseline.maxMeanMs}ms`);
}

await main();
