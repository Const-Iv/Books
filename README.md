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

## Что важно понимать

- Karpathy overlay: явные assumptions для non-trivial задач, surgical diffs и `reproduce -> fix -> verify` для bugfix/regression.
- BMAD integration: если проект включает BMAD, каноника живёт в `_bmad/`, а `_bmad-output/` остаётся локальным scratch без коммита.
- `task:start` теперь считается валидным только из clean source tree; bypass через `--allow-dirty` не допускается.
- Dependency preflight — общий seam для `task:start`, `task:test` и `task:qa:agent`.
- `previewPreparedSha` остаётся обязательным checkpoint even when preview status = `not_supported`.
- `qaLastPassSha` должен позволять reuse task-QA на неизменившемся `HEAD`.
- Shared operational docs и generated history snapshots должны оставаться single-writer и синхронизироваться только на publish/release stage.
- Активные QA/TRIZ логи должны оставаться читаемыми: большие pre-compaction snapshots уходят в `Docs/archive/*.md.gz`, а текущие `Docs/qa-implementation-log.md` и `Docs/triz-usage-log.md` держат компактный хвост.
- Finish-flow должен уметь no-op завершение: если clean task branch уже содержится в `main`, publish пропускается с `publishStatus=skipped_already_merged`, но cleanup всё равно фиксируется.
- Core starter не содержит продуктовый UI/API runtime. Smoke/nightly здесь проверяют process-level сценарии на временных git repos.
- Capability decisions в Project Intake не являются core defaults: starter не мандатит конкретный frontend stack, identity provider, payment provider, fixed locales, Python-only decorators, database queue или worker model. Такие решения downstream выбирает через adapters/profiles и owner approval.
- Repo-managed shared skills обновляются на устройстве обычным `git pull`, если symlink уже был создан. Для новых или переименованных skills повторно запускайте `npm run skills:link`.
- `starter-project-bootstrap` — основной вход для conversational bootstrap: после фразы `стартуем новый проект` агент должен автоматически создать managed bootstrap worktree, подключить repo-managed skills через `npm run skills:link`, показать связь с charter, определить bootstrap state, провести Project Intake Gate, перенести approved ответы в canonical sources и предложить baseline QA.
- `starter-rule-sync` — основной ручной и автоматический вход для быстрого подключения reusable rule updates; автоматизации должны вызывать этот skill, а не дублировать его логику. Report начинается с decision proposals, candidate ids остаются traceability. Default scan window идёт от последнего сохранённого scan snapshot до текущего запуска и всё равно требует owner approval перед импортом.
- `starter-rule-share` — основной вход для outbound sharing после того, как starter уже обновлён и проверен. Список проектов берётся из ignored `runtime/rule-share/config.json`; report требует owner approval по проектам; apply-plan готовит только per-project task seeds и не делает direct edits. Для copied-baseline проектов seed содержит полный import contract: сохранить downstream charter, синхронизировать canonical/mirror surfaces, записать QA/TRIZ evidence и остановиться перед publish. По явному запросу или standing approval skill может пройти весь guarded one-run flow: scan/report, approval JSON, apply-plan, downstream `task:start`, reusable-rule import и QA; finish/merge/publish остаются отдельным явным gate.
- Для multi-project командного использования предпочтителен git submodule: downstream repo хранит starter под `vendor/new-project-starter`, а `skills-manage.mjs --source vendor/new-project-starter/skills` создаёт symlink'и в локальный `$CODEX_HOME/skills`.
- В starter core стоит хранить только reusable shared skills. `.system`, plugin-managed, product-specific skills и generated skill trees (`.agents/skills`, `.claude/skills`, `.cursor/skills`) должны жить вне этой baseline-папки и не переноситься bulk-copy.
- `task:qa:agent` всё равно создаёт `previewPreparedSha`, но по умолчанию preview status = `not_supported`. Когда реальный проект добавит preview adapter, contract уже будет готов.
- `release:local` — обязательный core publish path. Deploy-to-server и `db:prod:*` контуры должны добавляться как optional profile поверх этой базы.
- Если вы подключаете BMAD поверх starter, не делайте `_bmad-output/` источником истины для conveyor state, shared docs или committed plans.

Перед завершением bootstrap: `npm run qa:agent`.
