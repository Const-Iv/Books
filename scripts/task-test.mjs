// @ts-check

import { ensureDependencies } from "./dependency-preflight.mjs";
import { runCommand } from "./lib/runtime.mjs";

/**
 * @returns {Promise<void>}
 */
async function main() {
  await ensureDependencies(process.cwd());
  const extraArgs = process.argv.slice(2);
  const args = ["test", ...extraArgs];
  const result = runCommand(process.cwd(), "npm", args, { allowFailure: true });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exit(result.status);
}

await main();
