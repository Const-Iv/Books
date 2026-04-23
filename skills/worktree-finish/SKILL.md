---
name: worktree-finish
description: Finish, merge, publish, and clean up task worktrees by discovering and following the current repository's canonical finish contract. Use when a user asks to finish a task, merge to main, close or remove a worktree, publish a task branch, run the repository finish conveyor, or answer a cleanup choice. Prefer this skill when the repository documents finish flows in AGENTS.md, CODEX_MEMORY.md, .memory-bank/*, package.json scripts, or scripts/README.md.
---

# Worktree Finish

Use this skill to close a task worktree consistently across projects while still obeying repo-local conveyor rules. The skill standardizes discovery, QA discipline, merge behavior, and cleanup handling; the repository still defines the exact commands.

## Discovery Order

1. Read `AGENTS.md`.
2. Read `CODEX_MEMORY.md` if it exists.
3. Read `.memory-bank/index.md` if it exists, then only the relevant linked memory files.
4. Inspect `package.json`, `scripts/README.md`, and relevant scripts for canonical finish, merge, and release commands.
5. Prefer explicit repo entrypoints such as `task:finish:core`, `task:merge:main`, or `release:local` over manual git flows.

## Finish Workflow

1. Resolve whether the user wants full finish, merge only, cleanup only, or release.
2. Inspect current branch, task state artifacts, and `git status --short` before any mutation.
3. Execute the canonical repo finish flow.
4. Run the repo's required deterministic QA gates before merge or push when the contract requires them.
5. Ask for cleanup explicitly before deleting any local branch or worktree.
6. Verify the final state from task state/history, not just from exit code: merged or not, pushed or not, and `cleanupStatus` passed, kept, or failed.

## Cleanup Choice

Present cleanup as a fixed user-facing choice unless the repo explicitly requires something else:

1. `Удалить`
2. `Оставить`

Map that choice onto the repo's actual flags or commands. In starter-derived repos the canonical CLI path is `--cleanup 1|2`, with legacy `yes|no` kept only for compatibility.

If cleanup fails or remains incomplete, prefer canonical resume through `task:finish:core -- --task-id <id> --cleanup 1` when the repo supports `--task-id`.

## Guardrails

- Do not delete a local worktree or branch without an explicit user choice.
- Do not skip repo QA gates when the finish contract requires them.
- Do not bypass script-driven finish flows with ad-hoc merge commands if the repo already defines a canonical conveyor.
- Do not treat a zero exit code as sufficient when the repo writes explicit cleanup markers such as `cleanupStatus`, `CLEANUP`, or `FINISH`.
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

- `cleanupStatus = "passed"` means the worktree, branch, and task-scoped leftovers were removed.
- `cleanupStatus = "kept"` means the user intentionally kept the local worktree/branch.
- `cleanupStatus = "failed"` means finish is not complete yet; resume from `main` with `--task-id` when available.

If the repo exposes separate publish or merge stages, continue with the documented commands rather than inventing a new flow. If the repo defines `task:finish:cleanup`, let that hook handle repo-specific leftovers instead of hand-written shell cleanup.
