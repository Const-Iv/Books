# Books

Books — local-first проект для превращения официально предоставленной пользователем книги в русскоязычный применимый toolkit.

**Миссия:** помогать любому пользователю превращать книгу в применимый рабочий toolkit на русском языке через структурное извлечение моделей, принципов, техник, anti-patterns, сценариев применения и быстрых шпаргалок вместо обычного пересказа.

**Видение:** книга после чтения или загрузки не остаётся разовым текстом, а становится рабочим инструментом для решений, действий и обучения; Books превращает содержание книги в навигационный практический toolkit, готовый к повторному применению.

**Главный принцип:** извлекать структуру применения, а не summary.

Каждый новый Books toolkit должен содержать в главном файле после `Быстрая карта` раздел `Лайфхаки, приемы и инструменты к внедрению`, извлечённый из всей книги. Пункты раздела оформляются как карточки `Что внедрить`, `Когда применять`, `Первый шаг`, `Источник / где искать в книге`; раздел не называется `Белки`, потому что это только исходная метафора из методики Маргулана.

Эталонный формат любого toolkit — master-format по образцу `books/TRIZ - Теория решения изобретательских задач/triz-unified-practical-toolkit/Единый практический toolkit TRIZ - по нескольким книгам.md` и contract module `src/books/toolkit/toolkit-contract.mjs`: быстрый usage layer (`Battle route`, `Training route`, `Быстрая карта`, `Tool selector`) плюс глубокое тело справочника, coverage/source notes, limitations, anti-patterns, scenarios, cheatsheet, glossary и topic index.

Рядом с локальным исходником книги сохраняется structured Markdown copy полного извлечённого текста. Исходник и `.md` copy имеют одинаковый basename по правилу `<Автор> - <Название>`: например, `<Автор> - <Название>.epub` и `<Автор> - <Название>.md`; автор и название берутся как в оригинале или на английском. `source-manifest.md` и ссылки внутри toolkit'ов указывают на этот локальный `.md` path plus heading/page/spine marker, чтобы будущему агенту было проще искать по источнику.

Оригинал рядом с `.md` сохраняется для `pdf`, `epub`, `fb2` и аудио. Для TXT, DOCX, HTML и других форматов после проверенного structured `.md` достаточно оставить `.md`, если owner отдельно не попросил сохранить такой оригинал; старые extracted/debug `.txt` рядом не держатся.

Если toolkit делается из нескольких книг, Books сначала создаёт подробный standalone toolkit по каждой книге и сохраняет его по тем же правилам. Combined toolkit затем собирается под выбранной владельцем идеей или темой, но глубина берётся напрямую из локальных structured Markdown source copies/originals; standalone toolkit'ы служат coverage-control слоем, а не потолком глубины. Combined toolkit должен покрывать все достойные внимания идеи, не урезать справочные таблицы/модели/алгоритмы, убрать повторы, сохранить source traceability и идти в master-практической последовательности. Для Books качество разбора важнее скорости, времени ответа и экономии токенов.

Первый контур — локальный CLI-прототип. Runtime утверждён: Node/npm orchestration with optional Python extraction adapter. Product source должен жить под `src/books/`, shareable toolkit artifacts — под tracked `books/<topic>/<book-slug>/`, а originals / generated local artifacts — под ignored `runtime/books/<topic>/<book-slug>/`. AI/model provider, public UI/API, multi-user storage and deploy пока не утверждены и требуют отдельного adapter decision.

## Процессная основа

Этот репозиторий стартовал от **канонического исполняемого Node/npm baseline** для привычного Codex/worktree conveyor:

- `codex/*` managed worktrees;
- conversational branch-chat;
- deterministic QA;
- eval gate for AI/agent behavior changes;
- Karpathy-style execution discipline;
- BMAD-ready governance;
- TRIZ escalation by trigger;
- single-writer operational docs;
- shared memory-bank governance;
- product charter for mission/vision/goal/target-audience/JTBD;
- local-first `release:local`.

Процессная основа нужна только для безопасной разработки Books. Она не является product runtime и не должна подменять product charter Books.

## Что внутри

- `AGENTS.md` — канонический договор для Codex.
- `CLAUDE.md` и `.cursorrules` — cross-agent mirrors.
- `.memory-bank/` — shared long-lived knowledge.
- `.memory-bank/product-charter.md` — миссия, видение, цель, целевая аудитория и JTBD проекта.
- `.memory-bank/starter-rule-registry.json` — machine-readable реестр reusable правил для раздачи starter baseline в выбранные downstream проекты.
- `CODEX_MEMORY.md` — оперативная память Codex.
- `scripts/` — реальные process entrypoints, а не только README-контракты.
- `skills/` — versioned reusable Codex skills, которые можно подключить глобально через symlink.
- `skills/starter-project-bootstrap/` — основной conversational skill для фразы `стартуем новый проект`: ведёт owner'а по Project Intake, canonical docs, dependencies, shared skills и baseline QA.
- `skills/starter-rule-report/` — основной project-local skill для ночного и ручного read-only поиска reusable правил в downstream проектах и сохранения readable owner report.
- `skills/starter-rule-import/` — основной project-local skill для утреннего согласования и переноса approved reusable правил в starter.
- `skills/starter-rule-sync/` — временная совместимость для старых prompt'ов; `scripts/rule-sync.mjs` остаётся детерминированным execution layer для scan/report/apply-plan.
- `skills/starter-rule-share/` — основной project-local skill для передачи текущего starter baseline в выбранные active downstream проекты; `scripts/rule-share.mjs` читает rule registry, показывает по проектам, какие правила уже есть и каких не хватает, а guarded one-run mode выполняет перенос только через downstream managed task worktrees и QA. Для partial/blocked rules в ready-проектах Codex сначала делает read-only self-check и даёт конкретную рекомендацию владельцу. Для copied-baseline проектов task seed включает только missing rules, canonical/mirror sync, QA/TRIZ evidence и stop-before-publish gate.
- `tests/` — unit/integration/e2e проверки самого starter baseline.
- `Docs/` — process evidence, baselines, eval evidence и review guidance.
- `research/triz/` — канонический TRIZ pack.
- `templates/agent-workspace/` — безопасные локальные шаблоны без коммита личных данных.
- `templates/shared-skills-submodule/` — готовый downstream contract для подключения starter skills через git submodule.

## Быстрый старт

1. Скопируйте этот репозиторий или его содержимое в корень нового проекта.
2. В чате напишите `стартуем новый проект`. Codex должен использовать `$starter-project-bootstrap`: создать отдельную рабочую папку из чистого `main`, подключить skills из starter, провести Project Intake и не начинать разработку функций до согласования intake. Если для `skills:link` нужно заменить конфликтующие локальные skills, Codex отдельно запрашивает явное согласие владельца.
3. Создайте Project Intake по `plans/_project_intake_template.md`: заполните миссию, видение, цель, целевую аудиторию, `JTBD`, ограничения, сценарии, метрики, stack/runtime, echo-testing для неизвестной корневой технологии, QA/release choices, agent/eval choices, ownership правил и applicable capability decisions. Миссия должна отвечать, кому проект помогает, какой результат даёт и через что; видение должно описывать желаемое будущее и роль проекта в нём. В conversational intake миссию сначала формулирует owner; после её согласования Codex предлагает формулировки следующих пунктов на основе уже согласованных ответов, а owner подтверждает или корректирует их. Пока проект находится на этапе проверки гипотезы, нельзя считать утверждёнными архитектуру, технологии, способ запуска, коммерческую модель, зоны ответственности и важные продуктовые возможности. Эти решения становятся правилами проекта только после явного согласования в Project Intake, product charter или roadmap. Capability-блоки вроде auth, payments, credits, analytics/consent, i18n, async jobs, API documentation, service layout и runtime-specific rules заполняются только если применимы к продукту. Каждый применимый пункт должен быть явно согласован owner'ом; `TBD` и “заполним потом” считаются blocker.
4. После approval перенесите согласованные ответы в:
   - `AGENTS.md`
   - `.memory-bank/product-charter.md`
   - `.memory-bank/project-context.md`
   - `.memory-bank/architecture-map.md`
   - `.memory-bank/code-rules.md`
   - `CODEX_MEMORY.md`
   - `README.md`
5. Установите зависимости:

```bash
npm ci
```

6. Если хотите использовать общие repo-managed skills на этом устройстве, один раз подключите их в глобальный Codex home. При conversational bootstrap это делает агент после команды `стартуем новый проект`:

```bash
npm run skills:link
```

Если в `~/.codex/skills` уже есть локальная конфликтующая копия того же skill, используйте безопасную миграцию с backup:

```bash
npm run skills:link -- --adopt
```

7. Если проект подключает shared skills через git submodule, добавьте starter как versioned dependency и линкуйте skills из него:

```bash
git submodule add <starter-repo-url> vendor/new-project-starter
git submodule update --init --recursive
node vendor/new-project-starter/scripts/skills-manage.mjs link --source vendor/new-project-starter/skills
```

В таком режиме проект фиксирует конкретный commit starter baseline, а новые люди получают тот же набор skills после `git clone --recurse-submodules` или `git submodule update --init --recursive`.

8. Прогоните baseline QA:

```bash
npm run qa:agent
npm run qa:smoke:pr
npm run qa:e2e:nightly
npm run qa:security
npm run qa:coverage:critical
npm run qa:perf:critical
```

## Что перенесено из актуальной логики работы

- Karpathy overlay: явные assumptions для non-trivial задач, surgical diffs и `reproduce -> fix -> verify` для bugfix/regression.
- BMAD integration: если проект включает BMAD, каноника живёт в `_bmad/`, а `_bmad-output/` остаётся локальным scratch без коммита.
- `task:start` теперь считается валидным только из clean source tree; bypass через `--allow-dirty` не допускается.
- Dependency preflight — общий seam для `task:start`, `task:test` и `task:qa:agent`.
- `previewPreparedSha` остаётся обязательным checkpoint even when preview status = `not_supported`.
- `qaLastPassSha` должен позволять reuse task-QA на неизменившемся `HEAD`.
- Shared operational docs и generated history snapshots должны оставаться single-writer и синхронизироваться только на publish/release stage.
- Активные QA/TRIZ логи должны оставаться читаемыми: большие pre-compaction snapshots уходят в `Docs/archive/*.md.gz`, а текущие `Docs/qa-implementation-log.md` и `Docs/triz-usage-log.md` держат компактный хвост.
- Finish-flow должен уметь no-op завершение: если clean task branch уже содержится в `main`, publish пропускается с `publishStatus=skipped_already_merged`, но cleanup всё равно фиксируется.
- `task:start` выводит branch/worktree slug из фактического title; non-ASCII title получает readable ASCII slug (`ЭХО` -> `echo`), а generic `task` используется только если title не содержит осмысленного текста.
- Для нового продукта или capability на неизвестной корневой технологии нужен isolated echo-test до feature work: минимальный signal loop/result, зафиксированные ограничения и решение `proceed | blocked | narrow spike | choose alternative`.

## Канонические команды

- `npm run lint`
- `npm run lint:fix`
- `npm run lint:fix:changed`
- `npm run skills:link`
- `npm run skills:status`
- `npm run skills:unlink`
- `npm run rule-sync:scan -- --since <date> --until <date>`
- `npm run rule-sync:report -- --latest`
- `npm run rule-sync:apply-plan -- --approval <path> --dry-run`
- `npm run rule-share:scan`
- `npm run rule-share:report -- --latest`
- `npm run rule-share:apply-plan -- --approval <path> --dry-run`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run qa:agent`
- `npm run qa:smoke:pr`
- `npm run qa:e2e:nightly`
- `npm run qa:security`
- `npm run qa:coverage:critical`
- `npm run qa:perf:critical`
- `npm run task:start -- --title "<title>" --seed-message "<request>"`
- `npm run task:test -- [args]`
- `npm run task:qa:agent`
- `npm run task:finish:core`
- `npm run task:merge:main`
- `npm run task:history -- sync`
- `npm run task:ledger -- rebuild --write-docs`
- `npm run task:operational-docs:capture`
- `npm run task:operational-docs:sync`
- `npm run release:local`

## Что важно понимать

- Core starter не содержит продуктовый UI/API runtime. Smoke/nightly здесь проверяют process-level сценарии на временных git repos.
- Capability decisions в Project Intake не являются core defaults: starter не мандатит конкретный frontend stack, identity provider, payment provider, fixed locales, Python-only decorators, database queue или worker model. Такие решения downstream выбирает через adapters/profiles и owner approval.
- Repo-managed shared skills обновляются на устройстве обычным `git pull`, если symlink уже был создан. Для новых или переименованных skills повторно запускайте `npm run skills:link`.
- `starter-project-bootstrap` — основной вход для conversational bootstrap: если пользователь пишет `стартуем новый проект`, `запусти новый проект`, `проведи bootstrap нового проекта` или сообщает, что скопировал starter в новый репозиторий, агент создаёт отдельную рабочую папку из чистого `main`, подключает skills из starter, получает owner-authored миссию, затем предлагает следующие intake-формулировки на подтверждение owner'у и не начинает разработку функций до согласования intake.
- `starter-rule-report` — основной вход для ночной автоматизации и ручного read-only отчёта по reusable rule updates. Автоматизации должны вызывать этот skill, а не дублировать scan/report логику. Report начинается с decision proposals, candidate ids остаются traceability, default scan window идёт от последнего сохранённого scan snapshot до текущего запуска.
- `starter-rule-import` — основной вход для утреннего согласования: он ведёт owner'а по последнему report, задаёт вопросы по проекту, сути и `**Точный текст для starter:**`, готовит preliminary check без изменений и переносит только явно согласованные reusable правила через managed worktree и QA. Каждый новый approved reusable rule добавляется или обновляется в `.memory-bank/starter-rule-registry.json`.
- `starter-rule-sync` — временный compatibility router для старых prompt'ов; новые сценарии должны использовать `starter-rule-report` или `starter-rule-import`.
- Если отчёт или дайджест собирает данные из разных источников, каждая запись должна явно показывать свой источник. Конкретные каналы проекта, например Telegram или Gmail, остаются в проекте-источнике.
- Если конкретному проекту нужны действия после публикации, например перезапуск локальных агентов или сервисов, способ выполнения нужно согласовать в Project Intake этого проекта. Starter не зашивает продуктовые агенты, локальные команды и настройки конкретной среды в общую основу.
- `starter-rule-share` — основной вход для outbound sharing после того, как starter уже обновлён и проверен. Список проектов берётся из ignored `runtime/rule-share/config.json`; report требует owner approval по проектам и показывает конкретные `presentRules`, `missingRules`, `presentUnregisteredRules`, `blockedRules` из `.memory-bank/starter-rule-registry.json`; partial/blocked rules в ready-проектах сначала проходят Codex read-only self-check, чтобы владелец видел готовую рекомендацию, а не просьбу искать фрагменты вручную. Apply-plan готовит только per-project task seeds и не делает direct edits. Для copied-baseline проектов seed содержит полный import contract: перенести только missing rules, сохранить downstream charter, синхронизировать canonical/mirror surfaces, записать QA/TRIZ evidence и остановиться перед publish. По явному запросу или standing approval skill может пройти весь guarded one-run flow: scan/report, approval JSON, apply-plan, downstream `task:start`, reusable-rule import и QA; finish/merge/publish остаются отдельным явным gate.
- Для multi-project командного использования предпочтителен git submodule: downstream repo хранит starter под `vendor/new-project-starter`, а `skills-manage.mjs --source vendor/new-project-starter/skills` создаёт symlink'и в локальный `$CODEX_HOME/skills`.
- В starter core стоит хранить только reusable shared skills. `.system`, plugin-managed, product-specific skills и generated skill trees (`.agents/skills`, `.claude/skills`, `.cursor/skills`) должны жить вне этой baseline-папки и не переноситься bulk-copy.
- `task:qa:agent` всё равно создаёт `previewPreparedSha`, но по умолчанию preview status = `not_supported`. Когда реальный проект добавит preview adapter, contract уже будет готов.
- `release:local` — обязательный core publish path. Deploy-to-server и `db:prod:*` контуры должны добавляться как optional profile поверх этой базы.
- Если вы подключаете BMAD поверх starter, не делайте `_bmad-output/` источником истины для conveyor state, shared docs или committed plans.

## Shared Starter Baseline Rules

- `starter.agent.contract-challenge`: Если буквальная инструкция пользователя ослабляет product charter, safety, privacy, governance, QA или уже принятый рабочий контракт проекта, согласие пользователя не является достаточным основанием для выполнения. Ассистент должен назвать конкретный конфликт, предложить ближайший вариант, который сохраняет цель пользователя и контракт проекта, и продолжать только по согласованному безопасному варианту.
- `starter.conveyor.dirty-source-blocker-report`: Если `task:start`, `task:finish:core`, `task:merge:main` или `release:local` блокируются dirty `main`/source tree, ассистент сначала сам собирает read-only blocker report: конкретные файлы, тип изменения, tracked/untracked статус, вероятное происхождение по history/diff/name-status, связь с текущей task branch, риск для текущей работы и recommended safe path. Нельзя перекладывать первичный разбор dirty tree на владельца.
- `starter.agent.default-goal-loop`: Для executable tasks ассистент должен вывести ожидаемый результат из запроса пользователя и вести цикл `goal -> change -> check -> fix -> re-check`, пока результат не проверен или не достигнут явный stop condition. Stop conditions: существенная продуктовая неоднозначность, риск destructive/data/prod/secret/main-worktree action, отсутствие permission/credential, конфликт, требующий выбора владельца, исчерпанный retryable QA chunk, baseline/infra blocker вне scope задачи или настоящий продуктовый tradeoff с несколькими валидными вариантами.
- `starter.qa.ui-browser-oracle`: Для user-visible UI behavior change или UI bugfix ассистент должен до реализации определить browser oracle: точный пользовательский сценарий, ожидаемый видимый результат, релевантные данные/состояния, признаки сбоя и console/runtime status. Перед завершением нужно проверить реальный интерфейс доступным browser-инструментом. Если browser verification падает и агент может это воспроизвести, он диагностирует, исправляет, повторяет deterministic checks и снова прогоняет browser oracle, а не просит владельца искать UI-ошибки вручную.
- `starter.project-intake.integration-review-path`: Integration / review path в Project Intake фиксирует, как изменения попадают в основной проект: managed task conveyor, Pull Request review или hybrid. Pull Request review является явным owner/team choice для risky, broad, external-review или team-review работы и не должен обходить deterministic QA, source-of-truth governance, task finish и merge gates.

## Shared Starter Baseline Rules — synced 2026-05-18

- `starter.rule-share.project-selection-first`: При запуске `starter-rule-share` первым owner-facing шагом должен быть выбор проектов для текущего переноса: Codex показывает полный обнаруженный список кандидатов, явно отмечает include/exclude/blocked/source-only рекомендации, получает подтверждение владельца по exact project set и только после этого запускает `rule-share:scan`, `rule-share:apply-plan`, downstream `task:start` или guarded one-run. Если окно выбора недоступно, Codex задаёт вопрос в чате и останавливается; нельзя молча трактовать “all ready projects”, прошлый approval JSON или standing approval как подтверждение текущего интерактивного запуска.
- `starter.publish-profile.result-evidence`: Если downstream-проект добавляет свой профиль публикации, завершение задачи, которое затрагивает этот профиль, должно явно сообщать владельцу: что пытались опубликовать, куда это должно попасть, было ли действие выполнено или пропущено, какой результат вернула площадка публикации, и прошла ли короткая проверка доступности или видимого результата, если её можно выполнить. Сам факт отправки изменений в основной проект не считается доказательством, что публикация уже завершилась. Названия площадок, команды и ссылки конкретного проекта остаются в его профиле, а не в starter core.
- `starter.data.external-generated-verification`: Если downstream-проект использует внешний, исследовательский или сгенерированный набор данных в пользовательском результате, перед использованием нужно зафиксировать источник, степень проверки, известные ограничения и воспроизводимую проверку, которая подтверждает пригодность данных для выбранного сценария. Если данные проверены частично или с ограничениями, это должно быть видно в продукте или отчёте там, где пользователь может принять решение на основе этих данных. Неполностью проверенные данные нельзя показывать как точный факт, единственно верный ответ или лучшую рекомендацию. Конкретные источники, форматы данных и способы проверки остаются в downstream-проекте.
- `starter.skills.source-link-flow`: Reusable shared skills хранятся в repo `skills/` и подключаются в `$CODEX_HOME/skills` только через безопасный link flow. Downstream-проекты могут подключать starter как versioned source и линковать skills через `skills-manage.mjs --source <skills-root>`. `.system`, plugin-managed, product-specific skills и generated skill trees (`.agents/skills`, `.claude/skills`, `.cursor/skills`) не импортируются в starter core через bulk-copy.
- `starter.product-charter.project-identity-unique`: Product charter каждого проекта уникален: mission, vision, goal, target audience, `JTBD`, product constraints and success criteria нельзя импортировать, шарить или подменять из другого проекта. `starter-rule-import` и `starter-rule-share` могут переносить только отдельные approved reusable governance blocks; если такой блок должен жить в product charter, он добавляется как отдельный project-local block/guard и формулируется для конкретного проекта без замены charter identity.
- `starter.context.concise-responses`: Ответы агента должны быть короткими и по делу; подробности добавляются только когда они нужны для решения, проверки, owner decision или safety.
- `starter.context.markdown-first-inputs`: Входные текстовые материалы по умолчанию переводятся или сохраняются как Markdown/plain text, если задача не про layout fidelity. PDF, DOCX, HTML и другие шумные форматы используются напрямую только когда формат, layout или визуальная fidelity являются частью результата.
- `starter.conveyor.goal-seed-handoff`: Goal Seed является стандартным форматом handoff для новых Codex-чатов, созданных task conveyor. Он выводится из исходного запроса владельца и должен быть самодостаточным plain-text prompt: цель задачи, исходные project source files, `Definition of Done`, зона влияния, safety boundaries, команды проверки, UI browser oracle rules когда релевантно, governance/eval requirements когда релевантно и stop conditions. Goal Seed может начинаться с `/goal`, но не должен зависеть от доступности slash command. `task:start` по умолчанию отправляет в новый чат effective Goal Seed; raw seed допустим только как явный opt-out владельца через `--no-goal-seed`.
