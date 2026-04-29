---
name: starter-rule-sync
description: Review governance, rule, charter, QA, TRIZ, memory-bank, and workflow updates from recently active local projects and prepare approved imports into new-project-starter. Use when Codex needs to run or interpret daily starter rule sync scans, produce morning summaries, classify reusable vs product-specific rules, or prepare a confirmed rule-import worktree/plan for New Project Starter.
---

# Starter Rule Sync

Use this skill to keep `new-project-starter` current as the reusable baseline for new projects.

## Workflow

1. Read `.memory-bank/product-charter.md`, `AGENTS.md`, `.memory-bank/index.md`, and `.memory-bank/code-rules.md`.
2. Run or inspect the latest rule-sync scan:
   - `npm run rule-sync:scan -- --since <YYYY-MM-DD> --until <YYYY-MM-DD>`
   - `npm run rule-sync:report -- --latest`
3. Classify each item:
   - `Кандидаты на импорт`: reusable baseline rules for starter.
   - `Требует ручной проверки`: mixed reusable and product-specific signals.
   - `Пропущено как product-specific`: belongs in the source project or an adapter/profile.
4. Ask the owner to approve, skip, or rewrite candidate ids.
5. After explicit approval, prepare import with:
   - `npm run rule-sync:apply-plan -- --approval <path> --dry-run`
6. Use the returned `task:start` seed to create a managed worktree and plan file before changing starter source files.

## Safety Rules

- Never apply rules directly to `main`.
- Never import secrets, credentials, private notes, runtime state, or source-specific behavior into starter core.
- Preserve the starter charter: reusable baseline first, product-specific behavior only through adapters/profiles.
- Treat `apply-plan` output as preparation, not implementation. Real edits still require a managed worktree, plan approval, and deterministic QA.

## Morning Summary Format

Use these sections:

- `Кандидаты на импорт`
- `Требует ручной проверки`
- `Пропущено как product-specific`
- `Диагностика`

For every approved candidate, preserve traceability: source project, task/commit evidence, changed files, proposed starter target, and QA result after implementation.
