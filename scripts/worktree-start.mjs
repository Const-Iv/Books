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
 * @param {string} title
 * @param {string} rawSeedMessage
 * @returns {string}
 */
export function buildGoalSeed(title, rawSeedMessage) {
  const normalizedSeed = rawSeedMessage.trim() || title;
  return [
    "/goal",
    "",
    "Goal Seed",
    "",
    `Цель задачи: ${title}`,
    "",
    "Исходный запрос владельца:",
    normalizedSeed,
    "",
    "Project source files:",
    "- `.memory-bank/product-charter.md`",
    "- `.memory-bank/index.md`",
    "- `.memory-bank/code-rules.md`",
    "- `.memory-bank/qa-playbook.md`",
    "- `AGENTS.md`",
    "- `CODEX_MEMORY.md`",
    "",
    "Definition of Done:",
    "- Реализован только подтверждённый scope задачи.",
    "- Product-specific детали не попали в reusable baseline rules.",
    "- Canonical governance surfaces обновлены, если меняется reusable rule.",
    "- Deterministic QA пройдена и evidence записано в task/plan/final answer.",
    "",
    "Зона влияния:",
    "- Работать только в созданном `codex/*` task worktree.",
    "- Не редактировать `main` напрямую без отдельного owner approval.",
    "- Сохранять downstream product charter identity и local state.",
    "",
    "Safety boundaries:",
    "- Не трогать secrets, credentials, private notes, prod data или user data без явного разрешения.",
    "- Если workflow блокируется, сначала сделать blocker analysis и recommended safe path; вопрос владельцу задавать только для реального выбора или permission.",
    "- Не обходить clean-tree, QA, task finish, merge, rule-sync/import/share или Product Charter gates.",
    "",
    "Verification commands:",
    "- `npm run lint`",
    "- `npm run typecheck`",
    "- `npm test`",
    "- `npm run build`",
    "- `npm run qa:agent`",
    "- `npm run task:qa:agent` перед finish/merge, если task state должен получить checkpoint.",
    "",
    "UI browser oracle:",
    "- Если задача меняет user-visible UI behavior, определить scenario, expected visible result, actual result и console/runtime status; проверить реальный интерфейс browser tool.",
    "- Если UI не применим, зафиксировать причину.",
    "",
    "Governance/eval requirements:",
    "- Для process/governance/rule changes создать plan file по template, если проектный контракт этого требует.",
    "- Для AI/agent behavior changes добавить Eval spec: хороший ответ, провал, edge cases, golden prompts, old-vs-new comparison и minimum pass threshold.",
    "- Для repeated/cross-module issues выполнить TRIZ-pass, если сработал trigger.",
    "",
    "Stop conditions:",
    "- Существенная продуктовая неоднозначность или несколько валидных product tradeoffs.",
    "- Риск destructive/data/prod/secret/main-worktree action.",
    "- Missing permission, credentials, environment, dependency или platform/account blocker.",
    "- QA chunk exhausted или конфликт, который нельзя безопасно решить без owner decision."
  ].join("\n");
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const repoRoot = findGitRoot(process.cwd());
  const { flags } = parseArgs(process.argv.slice(2));
  const title = typeof flags.title === "string" ? flags.title : "";
  const rawSeedMessage = typeof flags["seed-message"] === "string" ? flags["seed-message"] : title;
  const seedMessage = flags["no-goal-seed"] === true ? rawSeedMessage : buildGoalSeed(title, rawSeedMessage);
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
    cleanupStatus: null,
    cleanupTargets: [],
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
