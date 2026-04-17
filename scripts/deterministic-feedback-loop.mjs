// @ts-check

import { writeFile } from "node:fs/promises";

import { ensureDependencies } from "./dependency-preflight.mjs";
import { runCommand } from "./lib/runtime.mjs";

/** @type {Array<{name: string, command: string, args: string[]}>} */
const STAGES = [
  { name: "lint", command: "npm", args: ["run", "lint"] },
  { name: "lint:fix:changed", command: "npm", args: ["run", "lint:fix:changed"] },
  { name: "lint-recheck", command: "npm", args: ["run", "lint"] },
  { name: "typecheck", command: "npm", args: ["run", "typecheck"] },
  { name: "test", command: "npm", args: ["test"] },
  { name: "build", command: "npm", args: ["run", "build"] }
];

/**
 * @returns {Promise<void>}
 */
async function main() {
  await ensureDependencies(process.cwd());

  /** @type {import("./lib/runtime.mjs").QaStageSummary[]} */
  const stages = [];
  let failedStage = null;

  for (const stage of STAGES) {
    const result = runCommand(process.cwd(), stage.command, stage.args, { allowFailure: true });
    const status = result.status === 0 ? "PASS" : "FAIL";
    stages.push({
      name: stage.name,
      status,
      details: (result.stdout || result.stderr).trim() || `${stage.name} ${status}`
    });
    if (result.status !== 0) {
      failedStage = stage.name;
      break;
    }
  }

  if (!failedStage) {
    for (const stage of STAGES.slice(stages.length)) {
      stages.push({
        name: stage.name,
        status: "SKIP",
        details: "Skipped after prior failure."
      });
    }
  } else {
    const alreadyAdded = new Set(stages.map((stage) => stage.name));
    for (const stage of STAGES) {
      if (!alreadyAdded.has(stage.name)) {
        stages.push({
          name: stage.name,
          status: "SKIP",
          details: "Skipped after prior failure."
        });
      }
    }
  }

  const summary = {
    status: failedStage ? "FAIL" : "PASS",
    failedStage,
    stages
  };

  console.log("QA_AGENT_MACHINE_SUMMARY");
  console.log(JSON.stringify(summary, null, 2));

  const summaryPath = process.env.QA_AGENT_SUMMARY_PATH;
  if (summaryPath) {
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  if (failedStage) {
    process.exit(1);
  }
}

await main();
