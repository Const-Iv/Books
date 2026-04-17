// @ts-check

import { writeFile } from "node:fs/promises";
import path from "node:path";

import { buildChangeLedgerMarkdown } from "./lib/doc-utils.mjs";
import {
  findGitRoot,
  getPipelinePaths,
  loadAllTaskStates,
  parseArgs,
  readNdjson
} from "./lib/runtime.mjs";

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = findGitRoot(process.cwd());
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const command = positionals[0] ?? "rebuild";

  if (command !== "rebuild") {
    throw new Error(`Unsupported task:ledger command: ${command}`);
  }

  const states = await loadAllTaskStates(repoRoot);
  const events = await readNdjson(path.join(getPipelinePaths(repoRoot).historyDir, "events.ndjson"));
  const markdown = buildChangeLedgerMarkdown(states, events);

  if (flags["write-docs"] === true) {
    const outputPath = path.join(repoRoot, "Docs/change-ledger.md");
    await writeFile(outputPath, markdown, "utf8");
    console.log(JSON.stringify({ outputPath, tasks: states.length }, null, 2));
    return;
  }

  console.log(markdown);
}

await main();
