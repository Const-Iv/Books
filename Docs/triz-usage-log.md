# TRIZ Usage Log

Журнал срабатываний TRIZ-триггеров и применённых решений.

## `<YYYY-MM-DD HH:MM:SS>` — TRIZ_TRIGGER

- Reason: `<qa_repeat_stage|qa_chunk_exhausted|cross_module_conflict|historical_recurrence>`
- Details: `<json or concise structured summary>`

## `<YYYY-MM-DD HH:MM:SS>` — TRIZ_APPLIED

- Principle: `<chosen principle or structural move>`
- Changes: `<what changed>`
- Guard: `<what reusable guard was added>`

## 2026-04-22T12:52:38.438Z 20260422-123751-07b0

- Branch: `codex/20260422-123751-07b0-agent-const-plan-template-sync`
- Reasons: historical_recurrence
- Status: trigger recorded

## 2026-04-23T12:19:01.968Z 20260423-105805-90fc

- Branch: `codex/20260423-105805-90fc-finish-cleanup-contract`
- Reasons: cross_module_conflict, historical_recurrence
- Status: trigger recorded

## 2026-04-23T12:28:18.299Z 20260423-105805-90fc

- Branch: `codex/20260423-105805-90fc-finish-cleanup-contract`
- Reasons: cross_module_conflict, historical_recurrence
- Status: trigger recorded

## 2026-04-24T09:22:26.456Z 20260424-091736-6c73

- Branch: `codex/20260424-091736-6c73-submodule-shared-skills`
- Reasons: cross_module_conflict
- Status: trigger recorded

## 2026-04-24T09:22:54.300Z 20260424-091736-6c73 — TRIZ_APPLIED

- Principle: separation in space / mediator
- Changes: skills source ownership is separated from local Codex activation through `--source <skills-root>`, so downstream repos can pin starter as `vendor/new-project-starter` while `$CODEX_HOME/skills` keeps symlink activation.
- Guard: `tests/unit/skills-manager.test.mjs` covers linking from a submodule source path.

