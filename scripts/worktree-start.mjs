// @ts-check

import path from "node:path";

import { ensureDependencies } from "./dependency-preflight.mjs";
import {
  appendHistoryEvent,
  createTaskId,
  ensurePipelineDirs,
  fileExists,
  findGitRoot,
  formatIso,
  getCodexHome,
  getCurrentBranch,
  getRepoName,
  getTaskArtifactsDir,
  hasRemote,
  isGitDirty,
  parseArgs,
  resolveBaseRef,
  runCommand,
  saveTaskState,
  slugify
} from "./lib/runtime.mjs";

/**
 * @param {string} repoRoot
 * @param {boolean} allowDirtyRequested
 * @returns {string}
 */
function buildDirtyTreeGuardMessage(repoRoot, allowDirtyRequested) {
  const status = runCommand(repoRoot, "git", ["status", "--short"], { allowFailure: true }).stdout
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const lines = [];
  if (allowDirtyRequested) {
    lines.push("task:start больше не поддерживает --allow-dirty.");
  }
  lines.push("Новый task worktree не создан: исходное рабочее дерево должно быть чистым.");
  if (status.length > 0) {
    lines.push("Оставшиеся изменения:");
    for (const line of status) {
      lines.push(`- ${line}`);
    }
  }
  lines.push("Безопасные следующие шаги: `git diff`, затем commit текущей работы или `git stash -u`.");
  return lines.join("\n");
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = findGitRoot(process.cwd());
  const { flags } = parseArgs(process.argv.slice(2));
  const title = typeof flags.title === "string" ? flags.title : "";
  const seedMessage = typeof flags["seed-message"] === "string" ? flags["seed-message"] : title;
  const allowDirtyRequested = flags["allow-dirty"] === true;
  const noOpen = flags["no-open"] === true || process.env.STARTER_NO_OPEN === "1";

  if (!title) {
    throw new Error("task:start requires --title.");
  }

  if (allowDirtyRequested || isGitDirty(repoRoot)) {
    throw new Error(buildDirtyTreeGuardMessage(repoRoot, allowDirtyRequested));
  }

  await ensurePipelineDirs(repoRoot);

  const taskId = createTaskId();
  const slug = slugify(title);
  const repoName = getRepoName(repoRoot);
  const branch = `codex/${taskId}-${slug}`;
  const managedRoot = path.join(getCodexHome(), "worktrees", taskId);
  const worktreePath = path.join(managedRoot, `${repoName}-${slug}`);
  const sourceBranch = getCurrentBranch(repoRoot) || "main";
  const baseRef = resolveBaseRef(repoRoot);

  runCommand(repoRoot, "git", ["worktree", "add", "-b", branch, worktreePath, baseRef]);
  await ensureDependencies(worktreePath);

  const mainWorktreePath = sourceBranch === "main" ? repoRoot : null;
  /** @type {import("./lib/runtime.mjs").TaskState} */
  const taskState = {
    taskId,
    title,
    slug,
    branch,
    sourceBranch,
    repoRoot,
    worktreePath,
    createdAt: formatIso(),
    seedMessage,
    status: "started",
    qaLastPassSha: null,
    previewPreparedSha: null,
    preview: null,
    lastQaResult: null,
    commitSha: null,
    publishStatus: "pending",
    cleanupDecision: null,
    operationalArtifacts: [],
    mainWorktreePath
  };

  await saveTaskState(repoRoot, taskState);
  await appendHistoryEvent(repoRoot, {
    at: formatIso(),
    type: "START",
    taskId,
    branch,
    payload: {
      title,
      seedMessage,
      worktreePath,
      allowDirtyRequested
    }
  });

  if (!noOpen && (await fileExists(worktreePath))) {
    runCommand(repoRoot, "sh", ["-lc", `command -v codex >/dev/null 2>&1 && codex app "${worktreePath}" >/dev/null 2>&1 &`], {
      allowFailure: true
    });
  }

  const artifactsDir = getTaskArtifactsDir(repoRoot, taskId);
  await ensurePipelineDirs(repoRoot);
  runCommand(repoRoot, "mkdir", ["-p", artifactsDir], { allowFailure: true });

  console.log(
    JSON.stringify(
      {
        taskId,
        branch,
        worktreePath,
        openedChat: !noOpen
      },
      null,
      2
    )
  );
}

await main();
