// @ts-check

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { ensureDependencies } from "./dependency-preflight.mjs";
import { findGitRoot, formatIso, getCurrentBranch, hasRemote, isGitDirty, runCommand } from "./lib/runtime.mjs";

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = findGitRoot(process.cwd());
  if (getCurrentBranch(repoRoot) !== "main") {
    throw new Error("release:local must run on main.");
  }
  if (isGitDirty(repoRoot)) {
    throw new Error("release:local requires a clean working tree.");
  }

  if (hasRemote(repoRoot)) {
    runCommand(repoRoot, "git", ["fetch", "origin"]);
    runCommand(repoRoot, "git", ["pull", "--ff-only", "origin", "main"]);
  }

  await ensureDependencies(repoRoot);
  runCommand(repoRoot, "node", ["scripts/deterministic-feedback-loop.mjs"]);

  const outputDir = path.join(repoRoot, "runtime", "release");
  await mkdir(outputDir, { recursive: true });
  const artifactPath = path.join(outputDir, "local-release.json");
  await writeFile(
    artifactPath,
    `${JSON.stringify({ releasedAt: formatIso(), branch: "main", remote: hasRemote(repoRoot) ? "origin" : null }, null, 2)}\n`,
    "utf8"
  );
  console.log(JSON.stringify({ artifactPath }, null, 2));
}

await main();
