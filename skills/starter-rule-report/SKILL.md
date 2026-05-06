---
name: starter-rule-report
description: Primary project-local skill for scheduled or manual read-only discovery of reusable governance, rule, charter, QA, TRIZ, memory-bank, shared-skill, and workflow updates from local projects, then saving a human-readable New Project Starter owner report. Use for nightly rule-sync automation, catch-up scans, latest report generation, and readable summaries before any owner approval or import work.
---

# Starter Rule Report

Use this skill for the discovery/report phase only. It finds reusable operational lessons from local projects and saves a human-readable owner report for `new-project-starter`. It must not approve, apply, or import rules.

Charter fit: reporting supports the starter mission by helping useful downstream lessons return to the reusable baseline without manual discovery. Keep this phase read-only so the owner can decide what belongs in starter.

## Workflow

1. Read `.memory-bank/product-charter.md`, `AGENTS.md`, `.memory-bank/index.md`, and `.memory-bank/code-rules.md`.
2. Use the default catch-up scan window unless the user gave an explicit range:
   - start at `until` from the latest valid `runtime/rule-sync/scans/*.json` snapshot;
   - end at the current run time;
   - fall back to the previous local day only when no valid snapshot exists.
3. Run scan/report through the deterministic layer:
   - `npm run rule-sync:scan`
   - `npm run rule-sync:report -- --latest`
4. Before presenting the saved owner report, self-check every `Требует ручной проверки` group that can be verified read-only:
   - Codex reads the source project files/snippets itself and decides whether the item is already covered, should be imported as written, should be imported with adaptation, or should be skipped.
   - Do not ask the owner to search project files or decode technical fragments when Codex can check them safely.
   - Leave an item for owner decision only when it needs product judgment, source access is blocked, the source project is dirty, or the reusable rule cannot be determined safely.
   - In the owner-facing report, write the concrete self-check outcome and the exact owner decision expected.
5. Keep the run read-only relative to starter source:
   - do not write approval JSON;
   - do not run `rule-sync:apply-plan`;
   - do not edit starter governance files;
   - do not create an import worktree.
6. Report the result to the owner with:
   - scan snapshot path;
   - report path;
   - checked project count;
   - candidate counts by category;
   - a short explanation of whether there is anything to decide next.

## Owner Report Format

The saved report is the decision artifact for the next phase. It must remain readable without raw technical decoding.

Required sections:

- `Предложения к решению`
- `Разбор по проектам`
- `Кандидаты на импорт`
- `Требует ручной проверки`
- `Пропущено как product-specific`
- `Диагностика`

The owner should be able to read only `Кандидаты на импорт` and `Требует ручной проверки` first. These lower blocks must be self-contained, grouped by source project and rule topic, and use bold labels:

- `**Точный текст для starter:**`
- `**Что Codex проверяет сам:**`
- `**Моё предложение:**`
- `**Что ожидается от владельца:**`

Do not make candidate ids, commits, snippets, classifier names, or QA/TRIZ log details the primary decision interface. They are traceability only.

## Anti-Regression Rules

- Do not list duplicate candidates as separate owner decisions when they represent one starter rule.
- Do not use vague phrases like "use as evidence" unless the report names the concrete problem, why it matters, and what decision is expected.
- Do not hand off read-only source inspection to the owner. If Codex can verify the issue by reading files, Codex must do that first and report the result.
- Do not present QA/TRIZ logs as ready-to-import starter rules; they are evidence until a portable starter invariant is written.
- Do not put product-specific source details into proposed starter text.
- Do not replace plain-language explanations with technical labels.

## Next Phase

When the owner is ready to approve or reject report items, use `$starter-rule-import`. This skill stops after report generation.
