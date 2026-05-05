---
name: worktree-create
description: Create task-specific git worktrees and branches by discovering and following the current repository's canonical start contract. Use when a user asks to create a new worktree, start a task in an isolated branch, bootstrap a managed task branch, or open a repo-specific task workspace. Prefer this skill when the repository documents start flows in AGENTS.md, CODEX_MEMORY.md, .memory-bank/*, package.json scripts, or scripts/README.md.
---

# Worktree Create

Use this skill to start a task worktree in a way that is consistent across projects without hardcoding one repository's conveyor. The repository's own docs and scripts remain the source of truth; this skill standardizes how to discover and execute them.

## Discovery Order

1. Read `AGENTS.md`.
2. Read `CODEX_MEMORY.md` if it exists.
3. Read `.memory-bank/index.md` if it exists, then only the relevant linked memory files.
4. Inspect `package.json`, `scripts/README.md`, and relevant scripts for canonical start commands.
5. Prefer explicit repo entrypoints such as `task:start` over ad-hoc `git worktree add`.

## Start Workflow

1. Resolve the task title and the seed message from the user's request.
2. Check current branch and `git status --short` before any mutation.
3. If the repo blocks dirty-tree starts, stop and report the blocker instead of forcing a bypass.
4. Execute the canonical start entrypoint from the repo contract.
5. Verify the result by capturing the created branch, worktree path, and any task id or state artifact.
6. Confirm the branch/worktree slug reflects the resolved title; for non-ASCII title expect the repo's deterministic readable ASCII slug, such as `ЭХО` -> `echo`, and treat a generic `task` slug for meaningful text as a regression.
7. Report the result briefly with the exact branch and worktree path.

## Intent Resolution

- If the user explicitly invokes this skill and provides a short phrase next to the skill mention without another clear action verb, treat that phrase as the task title for a new worktree.
- Examples: `[$worktree-create] формат ответа`, `/worktree-create формат ответа`, or `worktree-create: формат ответа` mean create a worktree titled `формат ответа`.
- Do not reinterpret those terse skill-invocation forms as requests for output formatting, documentation, or usage help unless the user explicitly asks for usage instructions, an example response, or how the skill should answer.
- Use the full user message as the seed message, preserving the terse invocation as evidence of the original intent.

## Guardrails

- Do not invent branch naming if the repo already defines it.
- Do not replace a meaningful user title with a generic `task` slug when the repo supports deterministic title-derived slugs.
- Do not bypass dirty-tree guards such as removed `--allow-dirty` flags or similar repo protections.
- Do not replace a documented script-driven conveyor with free-form git commands.
- If no canonical start flow exists, say so explicitly before proposing a generic fallback.

## Common Triggers

- `создай новый worktree`
- `стартани задачу в отдельной ветке`
- `нужен отдельный ворктри`
- `open a task worktree`
- `[$worktree-create] <task title>`

## Starter Repo Pattern

In repositories derived from the current starter, the common resolution is:

```bash
npm run task:start -- --title "<title>" --seed-message "<full request>"
```

Use that only after confirming it matches the current repo contract.
