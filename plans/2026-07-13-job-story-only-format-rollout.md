# Формат task-планов с одной Job Story — Books

**Тип задачи:** governance / agent behavior
**Дата:** 2026-07-13
**Статус:** готово к публикации
**Подтверждение владельца:** получено в текущей беседе

## Коротко

Новые task-планы проекта используют одну понятную Job Story вместо повторяющихся JTBD, Job Story и User Story. Критерии приёмки, проверка и Eval spec остаются отдельными разделами.

## Связь с charter проекта

- Сохраняется уникальная миссия, цель, аудитория и project-level JTBD проекта Books.
- Меняется только reusable формат task-планов и task-level governance.
- Product Charter, Project Intake, продуктовые сценарии и исторические завершённые планы не переписываются.

## Цель

Сделать будущие планы короче и понятнее владельцу, не ослабив полноту результата, QA, safety и evidence.

## Контекст

Старый шаблон отдельно требовал JTBD, Job Story и User Story, хотя эти блоки часто описывали одну потребность. Технические детали могли попадать в пользовательскую формулировку и усложнять согласование.

## Job Story

Когда владелец читает или согласует task-план, он хочет сразу увидеть одну понятную Job Story, ожидаемый результат и способ проверки без повторяющихся формулировок и технического шума.

## Входные данные

| Источник | Что используем | Статус |
| --- | --- | --- |
| Решение владельца от 2026-07-13 | Только одна task-level Job Story | подтверждено |
| new-project-starter | Rule starter.plans.job-story-only-format | HEAD 9ca3c376 |
| Текущий проект | Product Charter, templates и QA contract | подтверждено |

## Ожидаемый результат

1. Общий и bugfix templates используют одну Job Story.
2. В Job Story нет implementation mechanics.
3. Контекст, входные данные, ожидаемый результат, критерии приёмки и проверка разделены.
4. Eval spec сохраняется для AI/agent behavior changes.
5. Project-level JTBD/User Stories остаются в Product Charter или Project Intake.
6. Изменение проходит deterministic QA, commit, merge и push.

## Критерии приёмки

- **AC-1.** В обоих templates нет отдельных task-level headings JTBD/User Story.
- **AC-2.** В обоих templates присутствуют обязательные owner-facing sections в правильном порядке.
- **AC-3.** Точная owner-approved формулировка про worktree и подключённый сервис сохранена как пример.
- **AC-4.** Product Charter проекта не меняет mission, vision, goal, audience или project-level JTBD.
- **AC-5.** Новый deterministic guard проходит вместе с project QA.
- **AC-6.** main и origin/main совпадают после публикации.

## План проверки

| Критерий | Проверка | Ожидаемый результат |
| --- | --- | --- |
| AC-1–AC-3 | tests/unit/plan-template.test.mjs | PASS |
| AC-4 | diff и hash/read-back Product Charter | identity не изменена |
| AC-5 | npm run qa:agent | PASS |
| AC-6 | git fetch + HEAD...origin/main | 0 0 |

## Eval spec

**Применимо:** да.

- **Хороший ответ:** одна Job Story языком владельца; критерии, verification и Eval разделены.
- **Провал:** повторяются JTBD/Job Story/User Story либо Job Story описывает API и внутренние функции.
- **Критичные случаи:** bugfix, AI behavior plan, Project Intake, техническая maintenance-задача.
- **Golden prompts:** подключённый сервис в worktree; потеря данных; изменение поведения AI; Project Intake.
- **Minimum pass threshold:** 4/4 сценария, 0 critical failures, deterministic guard PASS.

## Echo-test

**Применимо:** нет — новая технология или интеграция не добавляется.

## Техническая часть

- Обновить templates и project-local planning guidance.
- Добавить deterministic template guard.
- Зарегистрировать reusable rule, если проект поддерживает registry.
- Не переносить starter product identity и несвязанные missing rules.

## Ограничения

- Не менять downstream product identity.
- Не переписывать исторические завершённые планы.
- Не импортировать другие правила из rule-share report.
- Не менять conveyor, release или runtime behavior.

## План для агента

- [x] Создать managed task worktree.
- [x] Обновить templates и governance.
- [x] Добавить deterministic guard.
- [x] Пройти targeted checks и полный QA.
- [ ] Commit, merge и push.
- [ ] Проверить clean state и remote parity.

## План QA

- [x] node --test tests/unit/plan-template.test.mjs
- [x] npm run lint
- [x] npm run qa:agent
- [ ] npm run task:qa:agent
- [x] git diff --check
- [x] Product Charter identity read-back

## Риски и откат

- **Риск:** потерять project-specific planning checks.
- **Снижение:** сохранить project-local QA/UI/bugfix sections ниже общего owner-facing core.
- **Откат:** revert только task commit и повторить project QA.

## Stop conditions

- Product Charter identity меняется.
- QA показывает product/runtime regression.
- Finish сталкивается с внешними изменениями или конфликтом main.

## Фактические результаты

- Targeted checks: `node --test tests/unit/plan-template.test.mjs`: PASS, 3/3.
- Full QA: `npm run qa:agent`: PASS — lint, lint-fix, lint-recheck, typecheck, 56/56 tests и build.
- Charter boundary: Product Charter не изменён; нумерованный project-level JTBD сохранён.
- Commit / push / parity: ожидает выполнения.
