// @ts-check

import { existsSync } from "node:fs";
import { mkdir, readdir, rm, rmdir } from "node:fs/promises";
import path from "node:path";

import { getCodexHome, getTaskArtifactsDir, getWorktreeList, readJson, runCommand, writeJson } from "./runtime.mjs";

/**
 * @typedef {{
 *   version?: number,
 *   extraPaths?: string[],
 *   blocked?: string[],
 *   notes?: string[]
 * }} CleanupHookPayload
 */

/**
 * @typedef {{
 *   decision: string,
 *   status: "kept"|"passed"|"failed",
 *   cleanupTargets: string[],
 *   removedPaths: string[],
 *   remainingPaths: string[],
 *   blocked: string[],
 *   errors: string[],
 *   notes: string[],
 *   hookInvoked: boolean,
 *   branchRemoved: boolean
 * }} CleanupExecutionResult
 */

/**
 * @param {string | null} cleanup
 * @returns {string | null}
 */
export function normalizeCleanupChoice(cleanup) {
  if (cleanup === "1") {
    return "yes";
  }
  if (cleanup === "2") {
    return "no";
  }
  return cleanup;
}

/**
 * @param {string[]} values
 * @returns {string[]}
 */
function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

/**
 * @param {string | null} value
 * @returns {value is string}
 */
function isString(value) {
  return typeof value === "string" && value.length > 0;
}

/**
 * @param {string} candidate
 * @param {string} root
 * @returns {boolean}
 */
function isWithinRoot(candidate, root) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

/**
 * @param {import("./runtime.mjs").TaskState} state
 * @param {string} candidatePath
 * @returns {string | null}
 */
function normalizeAllowedCleanupPath(state, candidatePath) {
  const absolutePath = path.isAbsolute(candidatePath) ? path.resolve(candidatePath) : path.resolve(state.worktreePath, candidatePath);
  const taskPath = path.resolve(state.worktreePath);
  const taskRoot = path.resolve(getCodexHome(), "worktrees", state.taskId);
  if (isWithinRoot(absolutePath, taskPath) || isWithinRoot(absolutePath, taskRoot)) {
    return absolutePath;
  }
  return null;
}

/**
 * @param {string} worktreePath
 * @param {string} taskId
 * @returns {string | null}
 */
function getManagedTaskRoot(worktreePath, taskId) {
  const taskRoot = path.resolve(getCodexHome(), "worktrees", taskId);
  if (isWithinRoot(path.resolve(worktreePath), taskRoot)) {
    return taskRoot;
  }
  return null;
}

/**
 * @param {string} hookStdout
 * @returns {CleanupHookPayload}
 */
function parseCleanupHookOutput(hookStdout) {
  const trimmed = hookStdout.trim();
  if (!trimmed) {
    return { version: 1, extraPaths: [], blocked: [], notes: [] };
  }

  const lines = trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const candidates = [trimmed, ...lines.slice().reverse()];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") {
        return /** @type {CleanupHookPayload} */ (parsed);
      }
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error("task:finish:cleanup must print a JSON object to stdout.");
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((entry) => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * @param {string} repoRoot
 * @returns {Promise<boolean>}
 */
async function hasCleanupHook(repoRoot) {
  const packageJsonPath = path.join(repoRoot, "package.json");
  const packageJson = await readJson(packageJsonPath);
  if (!packageJson || typeof packageJson !== "object") {
    return false;
  }
  const scripts = "scripts" in packageJson ? packageJson.scripts : null;
  return Boolean(scripts && typeof scripts === "object" && typeof scripts["task:finish:cleanup"] === "string");
}

/**
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} state
 * @param {string} mainWorktreePath
 * @returns {Promise<{hookInvoked: boolean, extraPaths: string[], blocked: string[], notes: string[], errors: string[]}>}
 */
async function runCleanupHook(repoRoot, state, mainWorktreePath) {
  if (!(await hasCleanupHook(repoRoot))) {
    return {
      hookInvoked: false,
      extraPaths: [],
      blocked: [],
      notes: [],
      errors: []
    };
  }

  const artifactDir = getTaskArtifactsDir(repoRoot, state.taskId);
  await mkdir(artifactDir, { recursive: true });
  const contextPath = path.join(artifactDir, "finish-cleanup-context.json");
  await writeJson(contextPath, {
    taskId: state.taskId,
    branch: state.branch,
    repoRoot,
    mainWorktreePath,
    worktreePath: state.worktreePath,
    cleanupTargets: state.cleanupTargets ?? []
  });

  const result = runCommand(
    repoRoot,
    "npm",
    ["run", "--silent", "task:finish:cleanup", "--", "--context", contextPath],
    { allowFailure: true }
  );

  if (result.status !== 0) {
    const output = `${result.stderr || result.stdout || ""}`.trim();
    return {
      hookInvoked: true,
      extraPaths: [],
      blocked: [],
      notes: [],
      errors: [output || "task:finish:cleanup failed without output."]
    };
  }

  try {
    const payload = parseCleanupHookOutput(result.stdout);
    if (payload.version !== undefined && payload.version !== 1) {
      return {
        hookInvoked: true,
        extraPaths: [],
        blocked: [],
        notes: [],
        errors: [`Unsupported task:finish:cleanup payload version: ${String(payload.version)}`]
      };
    }

    return {
      hookInvoked: true,
      extraPaths: normalizeStringArray(payload.extraPaths).map((entry) => {
        if (path.isAbsolute(entry)) {
          return path.resolve(entry);
        }
        return path.resolve(state.worktreePath, entry);
      }),
      blocked: normalizeStringArray(payload.blocked),
      notes: normalizeStringArray(payload.notes),
      errors: []
    };
  } catch (error) {
    return {
      hookInvoked: true,
      extraPaths: [],
      blocked: [],
      notes: [],
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * @param {string} mainWorktreePath
 * @param {string} targetPath
 * @returns {Promise<boolean>}
 */
async function isRegisteredWorktree(mainWorktreePath, targetPath) {
  const worktrees = await getWorktreeList(mainWorktreePath);
  return worktrees.some((entry) => path.resolve(entry.path) === path.resolve(targetPath));
}

/**
 * @param {string} targetPath
 * @returns {Promise<void>}
 */
async function removeFilesystemTarget(targetPath) {
  await rm(targetPath, { recursive: true, force: true });
}

/**
 * @param {string} worktreePath
 * @param {string} taskId
 * @returns {Promise<string[]>}
 */
async function pruneEmptyManagedParents(worktreePath, taskId) {
  const managedRoot = path.resolve(getCodexHome(), "worktrees");
  const taskRoot = path.resolve(path.dirname(worktreePath));
  const expectedTaskRoot = path.join(managedRoot, taskId);
  if (!isWithinRoot(taskRoot, expectedTaskRoot)) {
    return [];
  }

  /** @type {string[]} */
  const removed = [];
  let current = taskRoot;
  while (isWithinRoot(current, managedRoot) && current !== managedRoot) {
    try {
      const entries = await readdir(current);
      if (entries.length > 0) {
        break;
      }
      await rmdir(current);
      removed.push(current);
      current = path.dirname(current);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        ["ENOENT", "ENOTEMPTY", "EEXIST"].includes(String(error.code))
      ) {
        break;
      }
      throw error;
    }
  }

  return removed;
}

/**
 * @param {string} mainWorktreePath
 * @param {string} branch
 * @returns {Promise<{removed: boolean, error: string | null}>}
 */
async function removeLocalBranch(mainWorktreePath, branch) {
  runCommand(mainWorktreePath, "git", ["worktree", "prune"], { allowFailure: true });
  const branchRef = `refs/heads/${branch}`;
  const existsBefore = runCommand(mainWorktreePath, "git", ["rev-parse", "--verify", branchRef], {
    allowFailure: true
  }).status === 0;
  if (!existsBefore) {
    return { removed: true, error: null };
  }

  const removal = runCommand(mainWorktreePath, "git", ["branch", "-D", branch], { allowFailure: true });
  const existsAfter = runCommand(mainWorktreePath, "git", ["rev-parse", "--verify", branchRef], {
    allowFailure: true
  }).status === 0;

  if (!existsAfter) {
    return { removed: true, error: null };
  }

  const output = `${removal.stderr || removal.stdout || ""}`.trim();
  return {
    removed: false,
    error: output || `Failed to remove local branch ${branch}.`
  };
}

/**
 * @param {string} repoRoot
 * @param {import("./runtime.mjs").TaskState} state
 * @param {string} mainWorktreePath
 * @returns {Promise<CleanupExecutionResult>}
 */
export async function executeTaskCleanup(repoRoot, state, mainWorktreePath) {
  if (state.cleanupDecision !== "yes") {
    return {
      decision: state.cleanupDecision ?? "no",
      status: "kept",
      cleanupTargets: uniqueStrings((state.cleanupTargets ?? []).map((entry) => path.resolve(entry))),
      removedPaths: [],
      remainingPaths: [],
      blocked: [],
      errors: [],
      notes: [],
      hookInvoked: false,
      branchRemoved: false
    };
  }

  const hook = await runCleanupHook(repoRoot, state, mainWorktreePath);
  const errors = [...hook.errors];
  const blocked = [...hook.blocked];
  const notes = [...hook.notes];

  const resolvedExistingTargets = (state.cleanupTargets ?? [])
    .map((entry) => normalizeAllowedCleanupPath(state, entry))
    .filter(isString);
  if ((state.cleanupTargets ?? []).length !== resolvedExistingTargets.length) {
    errors.push("Stored cleanupTargets contain paths outside the allowed task scope.");
  }

  const resolvedHookTargets = hook.extraPaths
    .map((entry) => normalizeAllowedCleanupPath(state, entry))
    .filter(isString);
  if (hook.extraPaths.length !== resolvedHookTargets.length) {
    errors.push("task:finish:cleanup returned paths outside the allowed task scope.");
  }

  const cleanupTargets = uniqueStrings([...resolvedExistingTargets, ...resolvedHookTargets]);
  const orderedTargets = uniqueStrings([state.worktreePath, ...cleanupTargets]);

  /** @type {string[]} */
  const removedPaths = [];
  /** @type {string[]} */
  const remainingPaths = [];

  if (blocked.length === 0 && errors.length === 0) {
    for (const targetPath of orderedTargets) {
      const wasRegistered = await isRegisteredWorktree(mainWorktreePath, targetPath);
      if (!existsSync(targetPath)) {
        if (wasRegistered) {
          runCommand(mainWorktreePath, "git", ["worktree", "prune"], { allowFailure: true });
          if (await isRegisteredWorktree(mainWorktreePath, targetPath)) {
            remainingPaths.push(targetPath);
            errors.push(`Git worktree remains registered after cleanup: ${targetPath}`);
          }
        }
        continue;
      }

      if (wasRegistered) {
        process.chdir(path.dirname(repoRoot));
        runCommand(mainWorktreePath, "git", ["worktree", "remove", targetPath, "--force"], { allowFailure: true });
      }

      if (await isRegisteredWorktree(mainWorktreePath, targetPath)) {
        remainingPaths.push(targetPath);
        errors.push(`Git worktree remains registered after cleanup: ${targetPath}`);
        continue;
      }

      if (existsSync(targetPath)) {
        try {
          await removeFilesystemTarget(targetPath);
        } catch (error) {
          errors.push(
            `Failed to remove task-scoped leftover ${targetPath}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      if (existsSync(targetPath)) {
        remainingPaths.push(targetPath);
      } else {
        removedPaths.push(targetPath);
      }
    }
  } else {
    for (const targetPath of orderedTargets) {
      if (existsSync(targetPath)) {
        remainingPaths.push(targetPath);
      }
    }
  }

  if (remainingPaths.length === 0 && blocked.length === 0 && errors.length === 0) {
    try {
      removedPaths.push(...(await pruneEmptyManagedParents(state.worktreePath, state.taskId)));
    } catch (error) {
      errors.push(`Failed to prune managed task root: ${error instanceof Error ? error.message : String(error)}`);
    }

    const managedTaskRoot = getManagedTaskRoot(state.worktreePath, state.taskId);
    if (managedTaskRoot && existsSync(managedTaskRoot)) {
      remainingPaths.push(managedTaskRoot);
      errors.push(`Managed task root remains after cleanup: ${managedTaskRoot}`);
    }
  }

  let branchRemoved = false;
  if (blocked.length === 0 && errors.length === 0 && remainingPaths.length === 0) {
    const branchRemoval = await removeLocalBranch(mainWorktreePath, state.branch);
    branchRemoved = branchRemoval.removed;
    if (!branchRemoval.removed && branchRemoval.error) {
      errors.push(branchRemoval.error);
    }
  }

  const status = blocked.length === 0 && errors.length === 0 && remainingPaths.length === 0 ? "passed" : "failed";

  return {
    decision: state.cleanupDecision ?? "no",
    status,
    cleanupTargets,
    removedPaths: uniqueStrings(removedPaths),
    remainingPaths: uniqueStrings(remainingPaths),
    blocked,
    errors,
    notes,
    hookInvoked: hook.hookInvoked,
    branchRemoved
  };
}
