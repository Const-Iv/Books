# Memory Bank Index

Purpose: хранить долгоживущие, reusable знания проекта вне agent-local prompt context.

## Retrieval Rules

1. Сначала читать этот файл.
2. Загружать только memory-файлы, релевантные текущему типу задачи.
3. Предпочитать targeted reads вместо массовой загрузки всего банка.
4. `CODEX_MEMORY.md` держать для коротких operational notes; stable knowledge хранить здесь.

## Routing Matrix

| Task Type | Required Reads | Optional Reads | Output Expectation |
| --- | --- | --- | --- |
| New feature / process addition | `project-context.md`, `architecture-map.md`, `code-rules.md` | `qa-playbook.md` | Implementation with deterministic QA evidence |
| Bugfix / regression | `architecture-map.md`, `code-rules.md`, `qa-playbook.md` | `project-context.md` | Root-cause fix with reusable guard |
| Conveyor / release work | `project-context.md`, `qa-playbook.md`, `code-rules.md` | `architecture-map.md` | Process-safe implementation with state/history validation |
| Governance update | `code-rules.md`, `qa-playbook.md`, `project-context.md` | `architecture-map.md` | Synced rules in canonical sources |
| CI / flaky QA | `qa-playbook.md`, `code-rules.md` | `project-context.md`, `architecture-map.md` | Minimal deterministic fix plus failure classification |

## Update Policy

- Coding constraints и assistant standing orders — в `code-rules.md`.
- Stable architecture/process boundaries — в `architecture-map.md`.
- Repeatable QA rules, failure classes, evidence capture — в `qa-playbook.md`.
- Stack/runtime/command context — в `project-context.md`.
- Не дублировать одно и то же правило в нескольких memory-файлах без необходимости.
