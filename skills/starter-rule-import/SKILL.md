---
name: starter-rule-import
description: Primary project-local skill for owner-approved import of reusable rules from the latest New Project Starter rule report into starter governance. Use when the owner wants morning rule-sync approval, sequential Plan-mode questions, approval JSON preparation, preliminary checks without changes, managed import worktree creation, or implementation of approved reusable starter rules.
---

# Starter Rule Import

Use this skill after `$starter-rule-report` has produced a readable report. It guides the owner through decisions and imports only approved reusable rules into `new-project-starter`.

Charter fit: import supports the starter mission by turning confirmed downstream lessons into portable baseline rules. Protect starter from clutter: import only concrete reusable rules, never product-specific details or raw logs.

## Input

Use the latest saved report unless the owner gives a path:

- reports: `runtime/rule-sync/reports/*.md`
- scans: `runtime/rule-sync/scans/*.json`
- approvals: `runtime/rule-sync/approvals/*.json`

If no report exists, stop and run `$starter-rule-report` first.

## Approval Workflow

1. Read `.memory-bank/product-charter.md`, `AGENTS.md`, `.memory-bank/index.md`, and `.memory-bank/code-rules.md`.
2. Read the latest report and focus on:
   - `Кандидаты на импорт`
   - `Требует ручной проверки`
3. Collapse duplicates by source project and rule topic. One reusable starter rule should produce one owner question, even if several candidate ids support it.
4. Ask owner decisions sequentially. Each question must show:
   - `Проект: <source project>`
   - `Суть: <plain-language rule topic>`
   - `**Точный текст для starter:** <proposed exact text>`
   - source ids only as traceability below the decision content
5. Use exactly these decision meanings:
   - `Согласовать в starter как написано`: import the exact starter text.
   - `Согласовать с правкой`: ask for or propose the exact replacement text before approval.
   - `Не согласовываю / нужен ответ`: do not import yet; capture the question or blocker.
6. For every `Требует ручной проверки` group, include:
   - `**Что Codex проверяет сам:**`
   - `**Моё предложение:**`
   - `**Что ожидается от владельца:**`
   If the report still uses older wording `**Что проверить вручную:**`, treat it as a regression unless the item is a true owner-only product decision or blocked source.
7. After all decisions, produce a plain-language approval summary grouped by:
   - `Что переносим в starter`
   - `Что переносим с правкой`
   - `Что не переносим`
   - `Что осталось заблокировано`

## Import Preparation

After explicit owner confirmation of the summary:

1. Write ignored approval JSON in `runtime/rule-sync/approvals/`.
2. Run the preliminary check without changes:
   - `npm run rule-sync:apply-plan -- --approval <path> --dry-run`
3. Explain `--dry-run` to the owner as `предварительная проверка без изменений`.
4. Use the returned task seed to create a managed `codex/*` worktree.
5. Create or update a task plan with product spec, Eval spec, implementation steps, and QA evidence.

## Implementation Rules

- Never import directly into `main`.
- Never import without owner approval.
- Never import QA/TRIZ logs as rule text.
- Rewrite evidence into portable starter invariants before changing governance docs.
- Preserve source traceability in plan/evidence, not in the starter rule text unless needed.
- Keep product-specific behavior in the source project or adapters/profiles.
- Update canonical governance surfaces when a reusable rule becomes mandatory: `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`, and relevant mirrors.
- Add or update the same reusable rule in `.memory-bank/starter-rule-registry.json` with a stable `id`, `title`, exact `text`, `targetFiles`, `requiredFragments`, `source`, and `sharePolicy`. This registry is what `$starter-rule-share` uses to avoid duplicate downstream imports.
- Run deterministic QA and record results before finish/publish.

## Safety Stops

Stop and ask the owner instead of importing when:

- the report item lacks a concrete `**Точный текст для starter:**`;
- the proposed text contains source-project names, local commands, product channels, secrets, private notes, or task-specific symptoms;
- the owner chose `Не согласовываю / нужен ответ`;
- the working tree is dirty and no managed task worktree exists;
- the item would make starter core provider-specific, stack-specific, or product-specific.

## Shared Starter Baseline Rules — synced 2026-05-18

- `starter.rule-sync.processed-report-ledger`: В конце работы `starter-rule-import` обработанный report отмечается в ignored `runtime/rule-sync/processed-reports.md` одной короткой append-only строкой: `YYYY-MM-DD | runtime/rule-sync/reports/<file>.md | status=<processed|partial|blocked> | next=<none|short next step>`. Последующие import runs пропускают processed reports по умолчанию, если owner явно не просит открыть конкретный отчёт; ledger не должен дублировать candidate ids, source snippets, approval JSON или QA evidence.
- `starter.rule-import.full-question-before-choice`: `starter-rule-import` должен перед каждым owner choice сначала показать полный owner-facing блок: `Статус сейчас`, `Проект-источник`, `Суть`, `Job Story`, `Что меняется в starter`, `**Точный текст для starter:**`, `**Моё предложение:**` и `Traceability`; только после этого можно показывать варианты решения. Если владелец пишет, что вопрос непонятен, агент останавливает последовательность, заново раскрывает пункт в этом полном формате и продолжает только после понятного решения.
- `starter.product-charter.project-identity-unique`: Product charter каждого проекта уникален: mission, vision, goal, target audience, `JTBD`, product constraints and success criteria нельзя импортировать, шарить или подменять из другого проекта. `starter-rule-import` и `starter-rule-share` могут переносить только отдельные approved reusable governance blocks; если такой блок должен жить в product charter, он добавляется как отдельный project-local block/guard и формулируется для конкретного проекта без замены charter identity.
