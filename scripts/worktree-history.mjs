// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildTaskHistoryMarkdown } from "./lib/doc-utils.mjs";
import {
  findGitRoot,
  getPipelinePaths,
  parseArgs,
  readNdjson
} from "./lib/runtime.mjs";

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = findGitRoot(process.cwd());
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const command = positionals[0] ?? "tail";
  const historyPath = path.join(getPipelinePaths(repoRoot).historyDir, "events.ndjson");
  const events = await readNdjson(historyPath);

  if (command === "tail") {
    const lines = typeof flags.lines === "string" ? Number.parseInt(flags.lines, 10) : 20;
    const source = typeof flags.source === "string" ? flags.source : "runtime";
    if (source === "docs") {
      const docs = await readFile(path.join(repoRoot, "Docs/task-history.md"), "utf8");
      console.log(docs.split("\n").slice(-lines).join("\n"));
      return;
    }
    console.log(JSON.stringify(events.slice(-lines), null, 2));
    return;
  }

  if (command === "sync") {
    const markdown = buildTaskHistoryMarkdown(events);
    const outputPath = path.join(repoRoot, "Docs/task-history.md");
    await writeFile(outputPath, markdown, "utf8");
    console.log(JSON.stringify({ outputPath, events: events.length }, null, 2));
    return;
  }

  throw new Error(`Unknown task:history command: ${command}`);
}

await main();
