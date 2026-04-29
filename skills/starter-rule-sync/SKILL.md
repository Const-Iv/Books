---
name: starter-rule-sync
description: Primary project-local skill for manually or automatically reviewing governance, rule, charter, QA, TRIZ, memory-bank, shared-skill, and workflow updates from local projects, then preparing approval-safe imports into new-project-starter. Use when Codex needs to run starter rule sync outside the scheduled automation, connect reusable rules faster, interpret daily scans, produce owner summaries, classify reusable vs product-specific rules, or prepare a confirmed rule-import worktree/plan for New Project Starter.
---

# Starter Rule Sync

Use this skill as the primary Codex workflow for keeping `new-project-starter` current as the reusable baseline for new projects. Automations should invoke `$starter-rule-sync` directly instead of reimplementing scan/report logic in their prompts. The `rule-sync:*` scripts are the deterministic execution layer; this skill decides when and how to run them, how to classify findings, and how to hand approved imports into the managed task conveyor.

Charter fit: reusable rule sync supports the mission and JTBD by letting downstream operational lessons return to the starter baseline without rebuilding governance by hand. Keep starter core portable; source-specific behavior belongs in adapters/profiles or the source project.

## Workflow

1. Read `.memory-bank/product-charter.md`, `AGENTS.md`, `.memory-bank/index.md`, and `.memory-bank/code-rules.md`.
2. Decide the scan mode:
   - For scheduled automation, run this skill and use the default scan window.
   - The default scan window starts at `until` from the latest saved `runtime/rule-sync/scans/*.json` snapshot and ends at the current run time.
   - If no valid previous scan exists, fall back to the previous local day.
   - For a quick manual pull from specific work, use the user-provided date range or the smallest range that contains the relevant task/commit.
   - For a specific local project, use ignored local config in `runtime/rule-sync/config.json` with `roots`, `allowlist`, or `ignorelist`; do not commit that file.
3. Confirm repo state before any source edits. Scan/report may run from `main`; imports must use a managed `codex/*` worktree.
4. Run or inspect the latest rule-sync scan:
   - `npm run rule-sync:scan -- --since <YYYY-MM-DD> --until <YYYY-MM-DD>`
   - `npm run rule-sync:report -- --latest`
5. Start the owner-facing response from decision proposals, not candidate ids:
   - `Миссия`
   - `Видение`
   - `Цель`
   - `JTBD`
   - `Job Story`
   - `User Stories`
   - `Критерии приемки`
   - `Рекомендация`
   - `Traceability`
6. Classify each item:
   - `Кандидаты на импорт`: reusable baseline rules for starter.
   - `Требует ручной проверки`: mixed reusable and product-specific signals.
   - `Пропущено как product-specific`: belongs in the source project or an adapter/profile.
7. Ask the owner to approve, skip, or rewrite decision proposals. Candidate ids are traceability, not the decision interface.
8. After explicit approval, write an ignored approval JSON such as `runtime/rule-sync/approvals/<date>-approval.json`:
   ```json
   {
     "approved": ["rs-candidate-id"],
     "corrections": {
       "rs-candidate-id": "Use starter wording and keep product-specific examples out."
     }
   }
   ```
9. Prepare import with:
   - `npm run rule-sync:apply-plan -- --approval <path> --dry-run`
10. Use the returned `task:start` seed to create a managed worktree and plan file before changing starter source files.
11. After implementation, run deterministic QA and record evidence in the task response or plan file.

## Manual Fast Path

When the user asks to run rule sync without waiting for automation:

1. Run `npm run skills:status` if the request is about making this skill available on the current machine.
2. Run `npm run skills:link` only when the user wants repo-managed skills connected into `$CODEX_HOME/skills`; use `--adopt` only after confirming backup-safe adoption.
3. For rule import discovery, run a narrow `rule-sync:scan` and `rule-sync:report`.
4. Summarize candidates in the owner format below and stop for approval before `apply-plan`.

## Automation Contract

Scheduled jobs should keep their prompt minimal:

1. Use `$starter-rule-sync`.
2. Run the scan/report path requested by the schedule.
3. Do not hardcode "previous day" windows in automation prompts.
4. Do not duplicate classification rules in automation prompts; this skill is the source of workflow behavior.
5. Do not apply rules or edit source files unless the owner explicitly approved candidates and a managed task worktree exists.

## Owner Summary Format

Use these sections:

- `Предложения к решению`
- `Кандидаты на импорт`
- `Требует ручной проверки`
- `Пропущено как product-specific`
- `Диагностика`

Each proposal must include `Job Story`, `User Stories`, `Критерии приемки`, recommendation, and traceability. For every approved candidate, preserve source project, task/commit evidence, changed files, proposed starter target, and QA result after implementation.

## Safety Rules

- Never apply rules directly to `main`.
- Never import secrets, credentials, private notes, runtime state, or source-specific behavior into starter core.
- Never bulk-import generated skill trees such as `.agents/skills`, `.claude/skills`, or `.cursor/skills`; import only reusable source policy or repo-owned skills under `skills/`.
- Preserve the starter charter: reusable baseline first, product-specific behavior only through adapters/profiles.
- Treat `apply-plan` output as preparation, not implementation. Real edits still require a managed worktree, plan approval, and deterministic QA.
- Keep `rule-sync:scan` and `rule-sync:report` read-only relative to starter source.
- Keep `rule-sync:apply-plan` approval-safe: dry-run seed only, no direct source edits.
- If a candidate mixes reusable and product-specific content, rewrite it to the baseline invariant before import or leave it in `Требует ручной проверки`.
