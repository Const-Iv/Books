# Подключение Adaptive Subagent Workflow

Название задачи: Импортировать portable workflow планирования из New Project Starter

Тип задачи: governance / agent behavior

## Связь с charter проекта

Изменение сохраняет цель Books — превращать переданные книги в проверяемые русскоязычные toolkit — и усиливает deterministic execution для сложных extraction, synthesis и QA-задач. Product identity, local CLI contour, source traceability и copyright boundaries не меняются.

## Цель

Добавить полный Adaptive Subagent Workflow, Triviality Gate, execution map и Eval в canonical governance Books без публикации текущей task branch.

## Контекст

В Books уже разрешён bounded read-only subagent summary, но нет полного topology/ownership contract. New Project Starter содержит owner-approved portable правило.

## Job Story

Когда Codex планирует нетривиальную работу над Books, владелец хочет видеть обоснованную topology, ownership и последовательные safety gates, чтобы параллельность повышала качество без конфликтов, потери source evidence или обхода approval.

## Входные данные

- Current Books charter и governance.
- Rule `starter.agent.adaptive-subagent-workflow` из New Project Starter.
- Подтверждённый owner scope: подготовить worktree и QA, остановиться до finish/merge/publish.

## Ожидаемый результат

- Canonical workflow и Eval доступны внутри Books.
- Plan templates требуют карту выполнения.
- Registry/adoption содержат ровно одну подтверждённую запись.
- Mirrors маршрутизируют к canonical source без подмены Books charter.

## Критерии приёмки

- Присутствуют семь условий Triviality Gate и три topology.
- Запрещены overlapping writers и параллельные live/finish actions.
- Result contract включает `findings`, `evidence`, `risks`, `unresolved`, `recommended next step`.
- Registry/adoption JSON валиден и evidence существует.
- Полный `task:qa:agent` проходит.
- Finish, merge и publish не выполняются.

## Проверка

- `node --test tests/unit/adaptive-subagent-workflow.test.mjs`
- `npm run task:qa:agent`

## Eval spec

Применим: `.memory-bank/eval-specs/adaptive-subagent-workflow.md`.

## Карта выполнения

- **Классификация:** `nontrivial`; governance и AI behavior меняются.
- **Triviality Gate:** FAIL по условиям 3 и 7.
- **Режим:** `sequential`.
- **Обоснование:** все canonical/mirror/registry surfaces образуют один shared contract и требуют одного writer.
- **Root owner:** текущий Codex task.
- **Максимум одновременно активных subagents:** `0`.
- **Максимальная глубина:** `0`.
- **Ожидаемый эффект:** полнота и проверяемость governance.
- **Ожидаемое влияние на total usage:** дополнительный локальный QA; экономия не заявляется.
- **Fallback:** остановка при charter conflict, invalid registry или QA blocker.

### Workstreams

| ID | Цель | Role | Depends on | File/module ownership | Read/write scope | Result/evidence | Sync point |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W1 | Импортировать и проверить workflow | root | charter read | exact governance files текущего task worktree | tracked write | tests + task QA | до owner finish decision |

### Последовательные этапы одного владельца

- Прочитать Books sources и адаптировать portable contract.
- Проверить registry/adoption и deterministic tests.
- Остановиться до commit/publication/cleanup.

## План для агента

- [x] Прочитать обязательные sources и зафиксировать identity boundary.
- [x] Добавить workflow, Eval, templates, routers и adoption.
- [x] Запустить targeted test и полный task QA.

## Риски и откат

- Риск: случайно перенести starter product identity. Guard: product charter не изменяется.
- Риск: объявить применение без полного evidence. Guard: deterministic test читает все обязательные fragments.
- Откат: task worktree остаётся неопубликованным до отдельного owner approval.
