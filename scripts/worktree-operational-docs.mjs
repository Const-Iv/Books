// @ts-check

import {
  appendHistoryEvent,
  findGitRoot,
  formatIso,
  getCurrentBranch,
  getTaskArtifactsDir,
  loadTaskStateByBranch,
  parseArgs,
  saveTaskState
} from "./lib/runtime.mjs";
import { captureOperationalDocs, syncOperationalDocs } from "./lib/doc-utils.mjs";

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = findGitRoot(process.cwd());
  const command = process.argv[2];
  const branch = getCurrentBranch(repoRoot);
  const state = await loadTaskStateByBranch(repoRoot, branch);
  if (!state) {
    throw new Error(`Task state not found for branch ${branch}`);
  }
  const artifactDir = getTaskArtifactsDir(repoRoot, state.taskId);

  if (command === "capture") {
    const artifactPath = await captureOperationalDocs(repoRoot, state.taskId, state.branch, artifactDir);
    state.operationalArtifacts = [...new Set([...(state.operationalArtifacts ?? []), artifactPath])];
    await saveTaskState(repoRoot, state);
    await appendHistoryEvent(repoRoot, {
      at: formatIso(),
      type: "OP_DOC_CAPTURE",
      taskId: state.taskId,
      branch: state.branch,
      payload: { artifactPath }
    });
    console.log(JSON.stringify({ artifactPath }, null, 2));
    return;
  }

  if (command === "sync") {
    const changed = await syncOperationalDocs(repoRoot, artifactDir);
    await appendHistoryEvent(repoRoot, {
      at: formatIso(),
      type: "OP_DOC_SYNC",
      taskId: state.taskId,
      branch: state.branch,
      payload: { changed }
    });
    console.log(JSON.stringify({ changed }, null, 2));
    return;
  }

  const args = parseArgs(process.argv.slice(2));
  throw new Error(`Unknown operational docs command: ${args.positionals.join(" ")}`);
}

await main();
