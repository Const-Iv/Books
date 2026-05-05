---
name: starter-rule-sync
description: Compatibility router for the old combined New Project Starter rule-sync workflow. Use only when a prompt still invokes starter-rule-sync directly; route read-only scan/report work to starter-rule-report and owner-approved import work to starter-rule-import.
---

# Starter Rule Sync

This is a temporary compatibility router. The old combined workflow was split into two explicit skills:

- `$starter-rule-report`: read-only discovery, scan, and owner report generation.
- `$starter-rule-import`: owner approval, preliminary check without changes, managed import worktree, implementation, and QA.

Charter fit: the split protects starter from accidental clutter by separating "find useful lessons" from "import only owner-approved reusable rules".

## Routing

1. If the request is scheduled automation, night scan, catch-up scan, report generation, latest report, readable summary, or counts, use `$starter-rule-report`.
2. If the request is morning approval, sequential questions, owner decisions, approval JSON, preliminary check without changes, managed import, or applying approved rules, use `$starter-rule-import`.
3. If the user only says "rule sync" and intent is ambiguous, explain the split in plain language and ask which phase they want.

## Plain-Language Explanation

Use this wording when old prompts hit this skill:

`Rule-sync теперь разделен на два шага: $starter-rule-report собирает ночной отчет без изменений, а $starter-rule-import утром ведет согласование и переносит только подтвержденные правила.`

## Safety Rules

- Do not run scan/report/import directly from this router when intent is clear; delegate to the specific skill.
- Scheduled automation should use `$starter-rule-report`, not this compatibility skill.
- Imports still require owner approval, managed worktree, and deterministic QA through `$starter-rule-import`.
