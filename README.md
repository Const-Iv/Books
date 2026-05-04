# Школа ассистентов

Проект подбора и обучения проверенных ассистентов для владельцев бизнеса, CEO и клиентов Business Booster.

## Что Зафиксировано

- Product Charter утверждён owner'ом 2026-05-04.
- Project Intake утверждён owner'ом 2026-05-04.
- Roadmap запуска утверждён owner'ом 2026-05-04.
- Raw transcript сохранён без изменений.

## Канонические Источники

- `.memory-bank/product-charter.md` — миссия, видение, цель, целевая аудитория, `JTBD`, ограничения, сценарии и критерии успеха.
- `.memory-bank/project-context.md` — текущее состояние проекта, утверждённые и отложенные решения.
- `.memory-bank/architecture-map.md` — статус архитектуры и границы решений до подтверждения гипотезы.
- `.memory-bank/code-rules.md` — правила работы ассистента и процесса.
- `.memory-bank/qa-playbook.md` — правила проверок.
- `plans/2026-05-04-1147-project-intake.md` — approved intake.
- `Docs/product-discovery/2026-04-03-assistant-selection-transcript.raw` — verbatim source.
- `Docs/product-discovery/2026-04-03-assistant-selection-product-charter-draft.md` — discovery draft.
- `Docs/product-discovery/2026-04-03-assistant-selection-roadmap.md` — approved roadmap.

## Продуктовая Суть

Миссия: помогать владельцам бизнеса и CEO освобождать время для развития компании через подбор и обучение проверенных ассистентов.

Цель: создать направление, которое даёт владельцам подготовленных помощников для разгрузки времени и внедрения изменений, а кандидатам — путь от обучения и проверки к стажировке и работе с предпринимателями.

Граница продукта: Школа ассистентов — отдельное направление. При этом оно может быть встроено как в трек основной программы Business Booster, так и в отдельные составляющие платформы Business Booster.

## Текущий Этап

Проект находится на этапе проверки гипотезы.

Первый шаг roadmap: быстро проверить спрос через две очереди — владельцев / CEO и будущих ассистентов, отдельно посмотреть действующих клиентов Business Booster, провести кастдевы на тарифах с сопровождением и десятках, а затем принять решение о выделении product manager и коммерческого лидера.

## Что Пока Не Утверждено

- Runtime / stack.
- Product implementation architecture.
- QA / release path для будущей реализации.
- Коммерческая модель.
- Agent / eval ownership.
- Memory / rules ownership после подтверждения гипотезы.

Capability decisions на этапе проверки гипотезы помечены как неприменимые.

## Операционный Baseline

Репозиторий стартует от `new-project-starter`, поэтому сохраняет managed worktrees, deterministic QA и memory-bank governance.

Обязательные команды baseline:

```bash
npm run lint
npm run lint:fix:changed
npm run skills:link
npm run skills:status
npm run skills:unlink
npm run rule-sync:scan
npm run rule-sync:report
npm run rule-sync:apply-plan
npm run rule-share:scan
npm run rule-share:report
npm run rule-share:apply-plan
npm run typecheck
npm test
npm run build
npm run qa:agent
npm run qa:smoke:pr
npm run qa:e2e:nightly
npm run qa:security
npm run qa:coverage:critical
npm run qa:perf:critical
npm run task:start -- --title "<title>" --seed-message "<request>"
npm run task:test
npm run task:qa:agent
npm run task:finish:core
npm run task:merge:main
npm run task:history
npm run task:ledger
npm run task:operational-docs:capture
npm run task:operational-docs:sync
npm run release:local
```

Для документальных правок минимум проверки: `npm run lint`.

Перед завершением bootstrap: `npm run qa:agent`.
