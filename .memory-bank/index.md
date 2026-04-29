# Memory Bank Index

Purpose: хранить долгоживущие, reusable знания проекта вне agent-local prompt context.

## Retrieval Rules

1. Сначала читать этот файл.
2. Для любых продуктовых решений и feature/behavior/process/governance изменений читать `product-charter.md` целиком как первичный product gate.
3. Загружать только остальные memory-файлы, релевантные текущему типу задачи.
4. Предпочитать targeted reads вместо массовой загрузки всего банка.
5. `CODEX_MEMORY.md` держать для коротких operational notes; stable knowledge хранить здесь.

## Routing Matrix

| Task Type | Required Reads | Optional Reads | Output Expectation |
| --- | --- | --- | --- |
| New feature / process addition | `product-charter.md`, `project-context.md`, `architecture-map.md`, `code-rules.md` | `qa-playbook.md` | Implementation with deterministic QA evidence and charter mapping |
| Bugfix / regression | `product-charter.md`, `architecture-map.md`, `code-rules.md`, `qa-playbook.md` | `project-context.md` | Root-cause fix with reusable guard and no charter regression |
| Conveyor / release work | `product-charter.md`, `project-context.md`, `qa-playbook.md`, `code-rules.md` | `architecture-map.md` | Process-safe implementation with state/history validation and no charter bypass |
| Governance update | `product-charter.md`, `code-rules.md`, `qa-playbook.md`, `project-context.md` | `architecture-map.md` | Synced rules in canonical sources |
| New downstream project bootstrap | `product-charter.md`, `project-context.md`, `architecture-map.md`, `code-rules.md`, `qa-playbook.md` | `plans/_project_intake_template.md`, `README.md` | Approved project intake with all missing product/governance info filled before feature work |
| CI / flaky QA | `product-charter.md`, `qa-playbook.md`, `code-rules.md` | `project-context.md`, `architecture-map.md` | Minimal deterministic fix plus failure classification |

## Update Policy

- Coding constraints и assistant standing orders — в `code-rules.md`.
- Mission, vision, goal, целевая аудитория проекта и `JTBD` — в `product-charter.md`; проблема, целевая аудитория изменения, сценарии, требования, `Job Story`, `User Story`, критерии приемки, метрика успеха, ограничения и `Eval spec` оформляются на уровне конкретных feature/spec задач, а не общего charter.
- Project Intake для нового downstream-проекта — в `plans/_project_intake_template.md`; после owner approval согласованные ответы переносятся в canonical sources, а несогласованные пункты считаются blocker.
- Stable architecture/process boundaries — в `architecture-map.md`.
- Repeatable QA rules, failure classes, evidence capture — в `qa-playbook.md`.
- Stack/runtime/command context — в `project-context.md`.
- Не дублировать одно и то же правило в нескольких memory-файлах без необходимости.
