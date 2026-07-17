---
name: worktree-finish
description: Finish, merge, publish, and clean up one exact task worktree by discovering and following its repository's canonical finish contract. Scope each invocation to the repository and managed task containing the invocation cwd; never inspect or finish another repository or worktree unless the user explicitly names it as an additional finish target. Use when a user asks to finish a task, merge to main, close or remove a worktree, publish a task branch, run the repository finish conveyor, or answer a cleanup choice. Prefer this skill when the repository documents finish flows in AGENTS.md, CODEX_MEMORY.md, .memory-bank/*, package.json scripts, or scripts/README.md.
---

# Worktree Finish

Use this skill to close a task worktree consistently across projects while still obeying repo-local conveyor rules. The skill standardizes discovery, QA discipline, merge behavior, and cleanup handling; the repository still defines the exact commands.

## Invocation Scope Lock

Lock the target before reading repository state or running discovery commands:

1. Record `invocationCwd = realpath(cwd)` and resolve `targetWorktree = realpath(git -C "$invocationCwd" rev-parse --show-toplevel)`. Treat its Git repository as the only target repository for this invocation.
2. If `targetWorktree` is a managed task worktree, select only the task state whose recorded `worktreePath`, after `realpath`, exactly equals `targetWorktree`. Record the exact task id, branch, and canonical main path from that repository's contract.
3. If invoked from canonical `main`, or if no exact task state matches, require an explicit task id or branch before choosing among multiple candidates. Do not select a task by similar names, recent activity, prior conversation, or a related project.
4. Keep the invocation single-target by default. Cross-repository dependencies, related implementation work, validation performed elsewhere, source paths, discovered worktrees, and prior context do not expand the finish scope.
5. Limit discovery, status checks, artifact inventory, QA, finish, merge, and cleanup to the target worktree, its canonical main, and task-state paths owned by the same repository contract. Do not run repository or task inspection in another project merely to prepare a status report.
6. Treat all other worktrees, including worktrees from the same project, as out of scope. A repository command may list them while verifying the exact target, but do not inspect or mutate them individually.
7. Before the first mutation, report the locked `repository`, `targetWorktree`, `taskId`, and `branch`. Stop if a planned command resolves outside that lock.

An additional repository or worktree requires a separate explicit user request. Treat it as a separate finish invocation with its own preflight and cleanup choice; do not silently bundle it into the current invocation.

Example: when invoked from a Books task worktree, finish only that exact Books task. A related Agent_Const worktree remains out of scope even if it contains downstream runtime changes for the same feature.

## Discovery Order

Run this discovery only inside the locked target repository.

1. Read `AGENTS.md`.
2. Read `CODEX_MEMORY.md` if it exists.
3. Read `.memory-bank/index.md` if it exists, then only the relevant linked memory files.
4. Inspect `package.json`, `scripts/README.md`, and relevant scripts for canonical finish, merge, and release commands.
5. Prefer explicit repo entrypoints such as `task:finish:core`, `task:merge:main`, or `release:local` over manual git flows.

## Finish Workflow

1. Resolve whether the user wants full finish, merge only, cleanup only, or release.
2. Inspect the locked worktree's current branch, exact task state artifact, canonical main state, and `git status --short` before any mutation.
3. If the canonical flow is blocked by a dirty `main` or source tree, do read-only blocker triage before asking the user to choose: list exact paths, change types, tracked/untracked state, likely source from history/diff/name-status, relationship to the current task branch, risk, and the recommended next action.
4. Execute the canonical repo finish flow.
5. Run the repo's required deterministic QA gates before merge or push when the contract requires them.
6. Ask for cleanup explicitly before deleting any local branch or worktree.
7. Verify the final state from task state/history and filesystem, not just from exit code: merged or not, pushed or not, and `cleanupStatus` passed, kept, or failed.

## Cleanup Choice

Present cleanup as a fixed user-facing choice unless the repo explicitly requires something else:

1. `Удалить`
2. `Оставить`

Map that choice onto the repo's actual flags or commands. In starter-derived repos the canonical CLI path is `--cleanup 1|2`, with legacy `yes|no` kept only for compatibility.

If cleanup fails or remains incomplete, prefer canonical resume through `task:finish:core -- --task-id <id> --cleanup 1` when the repo supports `--task-id`.

## Cleanup Verification

Before telling the user a worktree was removed, verify the exact task from its recorded state:

1. The exact `state.worktreePath` for the finished task no longer exists and is no longer registered in `git worktree list`.
2. The managed task root `$CODEX_HOME/worktrees/<taskId>/` no longer exists after delete cleanup.
3. Task-scoped leftovers reported by `cleanupTargets`, cleanup hooks, or the managed task root check are gone.
4. The task state/history records `cleanupStatus = "passed"` for deletion or `cleanupStatus = "kept"` for an intentional keep.

Do not infer cleanup from a similar project name, branch name, or another worktree under `$CODEX_HOME/worktrees`. Do not proactively inspect or add a different stale worktree to the current report. If the locked task's canonical cleanup output happens to mention an unrelated worktree, mark it `out of scope` without inspecting or touching it; handle it only after a separate explicit user request.

## Guardrails

- Do not delete a local worktree or branch without an explicit user choice.
- Do not inspect, finish, merge, publish, or clean another repository or task outside the Invocation Scope Lock.
- Do not turn one finish invocation into a cross-project audit, even when the completed feature spans multiple repositories.
- Do not skip repo QA gates when the finish contract requires them.
- Do not bypass script-driven finish flows with ad-hoc merge commands if the repo already defines a canonical conveyor.
- Do not hand dirty `main` / dirty source blockers back to the user without first summarizing what changed, where it appears to come from, whether it is related to the task, and what safe action you recommend.
- Do not treat a zero exit code as sufficient when the repo writes explicit cleanup markers such as `cleanupStatus`, `CLEANUP`, or `FINISH`.
- Do not say cleanup passed until the exact recorded worktree path, git worktree registration, managed task root, and task-scoped leftovers were checked.
- Do not replace repo cleanup scripts with manual `git worktree remove` / `git branch -D` when the repo defines `task:finish:core` and optional cleanup hooks.
- If the branch was not created through the repo's documented flow and no task state exists, say that the canonical finish path is unavailable before doing a careful manual merge.

## Common Triggers

- `заверши задачу`
- `мердж`
- `слей в main`
- `закрой ворктри`
- `удали worktree`
- `finish task worktree`

## Starter Repo Pattern

In repositories derived from the current starter, the common resolution is:

```bash
npm run task:finish:core
```

Then confirm the recorded cleanup result:

- `cleanupStatus = "passed"` means the exact worktree path, git worktree registration, branch, managed task root, and task-scoped leftovers were removed.
- `cleanupStatus = "kept"` means the user intentionally kept the local worktree/branch.
- `cleanupStatus = "failed"` means finish is not complete yet; resume from `main` with `--task-id` when available.

If the repo exposes separate publish or merge stages, continue with the documented commands rather than inventing a new flow. If the repo defines `task:finish:cleanup`, let that hook handle repo-specific leftovers instead of hand-written shell cleanup.

## Shared Starter Baseline Rules — synced 2026-07-17

- `starter.conveyor.local-cleanup-no-remote-branch-deletion`: Cleanup в starter является local-only: можно удалять только локальные worktrees, локальные branches, локальные stashes и task-state после явного owner choice; remote branches и remote refs (`origin/*`, GitHub branches) cleanup никогда не удаляет и не чистит.
