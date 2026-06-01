# Claude Code — Project Instructions

## Scope

These rules apply to the whole repository.

## Language

- Ответы пользователю — на русском по умолчанию.
- Plan files и operator-facing docs — на русском.
- Код, identifiers и inline comments — на английском.

## Shared Knowledge Base

Перед planning или coding читать `.memory-bank/index.md` и только релевантные files из routing matrix.

## Mandatory Sources Of Truth

- `AGENTS.md`
- `.memory-bank/*`
- `CODEX_MEMORY.md`
- `.memory-bank/product-charter.md`

`.cursorrules` — compatibility mirror, но не обязательный source.

## Working Rules

- Перед mutating action кратко объяснять, что меняется и почему.
- Для non-trivial work явно фиксировать assumptions, делать surgical diffs и предпочитать `reproduce -> fix -> verify`.
- Перед product/feature/behavior/process/governance изменением читать `.memory-bank/product-charter.md` и сверять решение с миссией, видением, целью, целевой аудиторией и `JTBD`.
- Approved Books charter center: превращать книгу в применимый русскоязычный toolkit, а не в обычное summary; output первой версии всегда русский; v1 runtime — local CLI on Node/npm orchestration with optional Python extraction adapter; product source lives under `src/books/`, generated artifacts under ignored `runtime/books/<topic>/<book-slug>/`; AI/model provider, public UI/API, multi-user storage and deploy require separate owner-approved adapter decision.
- Каждый новый Books toolkit должен содержать в главном файле после `Быстрая карта` раздел `Лайфхаки, приемы и инструменты к внедрению`, извлечённый из всей книги. Пункты оформляются как карточки `Что внедрить`, `Когда применять`, `Первый шаг`, `Источник / где искать в книге`; пользовательский раздел не называется `Белки`.
- Эталонный Books toolkit format закреплён в `src/books/toolkit/toolkit-contract.mjs` и образце `books/TRIZ - Теория решения изобретательских задач/triz-unified-practical-toolkit/Единый практический toolkit TRIZ - по нескольким книгам.md`: usage layer, `Battle route`, `Training route`, `Быстрая карта`, `Tool selector`, action cards, deep reference body, coverage/source notes, limitations, anti-patterns, scenarios, cheatsheet, glossary and topic index.
- Рядом с локальным исходником книги сохранять structured Markdown copy полного извлечённого текста. Исходник и `.md` copy должны иметь одинаковый basename `<Автор> - <Название>`: `<Автор> - <Название>.<ext>` и `<Автор> - <Название>.md`; автор и название берутся как в оригинале или на английском. `source-manifest.md` и source-ссылки в toolkit'ах должны указывать на этот локальный `.md` path plus heading/page/spine marker.
- Original retention rule: сохранять original рядом со structured `.md` для `pdf`, `epub`, `fb2` и audio. Для TXT, DOCX, HTML and other formats после verified `.md` достаточно оставить `.md`, если owner отдельно не попросил сохранить такой оригинал; old extracted/debug `.txt` artifacts удалять, кроме user-provided `.txt` original с явной причиной сохранить.
- Если toolkit делается из нескольких книг, сначала подробно создать и сохранить standalone toolkit по каждой книге по Books rules, затем собрать combined toolkit под owner-selected идеей или темой. Combined depth берётся напрямую из structured Markdown source copies/originals, а standalone toolkit'ы используются как coverage-control artifacts, not depth ceiling. Combined toolkit должен покрывать все достойные внимания идеи, не урезать справочную глубину, убирать повторы, сохранять coverage/source traceability и идти в master-последовательности.
- Для Books toolkit качество разбора важнее скорости, времени ответа и экономии токенов; не делать shortcut, который теряет worthy ideas, source coverage или practical structure.
- User-facing продуктовые решения формулировать простым языком через `Связь с charter проекта -> Цель изменения/решения -> JTBD -> Job Stories -> User Stories -> Критерии приемки`; миссия и видение создаются только на уровне project charter или Project Intake, не на уровне отдельных задач.
- Новый downstream-проект сначала проходит Project Intake по `plans/_project_intake_template.md`; миссия должна отвечать, кому проект помогает, какой результат даёт и через что, а видение должно описывать желаемое будущее и роль проекта в нём; все обязательные пункты и applicable capability decisions должны быть заполнены, согласованы owner'ом и перенесены в canonical sources до feature/refactor/behavior-change work в соответствующей зоне.
- В conversational Project Intake миссию сначала формулирует owner; после её согласования ассистент предлагает формулировки следующих пунктов на основе уже согласованных ответов, а owner подтверждает или корректирует их.
- Пока проект находится на этапе проверки гипотезы, нельзя считать утверждёнными архитектуру, технологии, способ запуска, коммерческую модель, зоны ответственности и важные продуктовые возможности. Эти решения становятся правилами проекта только после явного согласования в Project Intake, product charter или roadmap.
- Если пользователь пишет `стартуем новый проект`, `запусти новый проект`, `проведи bootstrap нового проекта` или сообщает, что скопировал starter в новый репозиторий, ассистент запускает project-local skill `starter-project-bootstrap`: создаёт отдельную рабочую папку из чистого `main`, подключает skills из starter, проводит Project Intake и не начинает разработку функций до согласования intake. Если для `skills:link` нужно заменить конфликтующие локальные skills, ассистент отдельно запрашивает явное согласие владельца.
- Capability decisions заполняются only-if-applicable: auth, payments, credits, analytics/consent, i18n, async jobs, API docs, service layout и runtime-specific rules. Provider/stack-specific решения не становятся starter core defaults и должны жить в downstream adapters/profiles.
- Для external libraries, integrations and provider setup проверять актуальную official documentation или доступный docs connector; конкретный docs tool не является обязательной зависимостью starter.
- Для AI/agent behavior changes обязателен `Eval spec`: хороший ответ, провал, edge cases, golden prompts, comparison method и pass threshold; QA evidence должно включать eval result или явный gap.
- В `Summary`, `TL;DR`, `Связь с charter проекта`, `Цель`, `Целевая аудитория`, `JTBD`, `Job Story` и `User Stories` не использовать технические термины без твердой необходимости.
- В Plan mode уточняющие вопросы и recommended option должны проходить через Product Charter; charter-конфликтный вариант нельзя подавать как равнозначно рекомендуемый.
- В user-facing ответах не использовать необъяснённый Git/process-жаргон; если термин нужен, сразу объяснять его простыми словами рядом.
- Для code-changing work использовать deterministic checks как evidence.
- Test quality evidence должно быть behavior-focused; skipped/focused tests, arbitrary sleeps и tests that pass regardless of implementation не считаются trustworthy QA.
- `npm run qa:agent` обязателен перед finish / merge / release.
- Использовать канонические scripts: `task:start`, `task:qa:agent`, `task:finish:core`, `task:merge:main`, `release:local`.
- Для cross-project rule sync использовать `starter-rule-report` для read-only scan/report и `starter-rule-import` для owner approval/import; автоматизации должны вызывать `starter-rule-report`. `starter-rule-sync` остаётся только compatibility router. `rule-sync:scan`, `rule-sync:report`, `rule-sync:apply-plan --dry-run` остаются execution layer. Default scan window идёт от последнего saved scan snapshot до текущего запуска. Owner report начинается с decision proposals, candidate ids — только traceability. Не применять правила без managed worktree и plan approval.
- Если отчёт или дайджест собирает данные из разных источников, каждая запись должна явно показывать свой источник. Конкретные каналы проекта, например Telegram или Gmail, остаются в проекте-источнике.
- Если конкретному проекту нужны действия после публикации, например перезапуск локальных агентов или сервисов, способ выполнения нужно согласовать в Project Intake этого проекта. Starter не зашивает продуктовые агенты, локальные команды и настройки конкретной среды в общую основу.
- Для outbound sharing обновлённого starter baseline использовать project-local skill `starter-rule-share`. Rule-level source of truth — `.memory-bank/starter-rule-registry.json`; `rule-share:scan`, `rule-share:report`, `rule-share:apply-plan --dry-run` остаются execution layer; список проектов берётся из ignored `runtime/rule-share/config.json`; report показывает `presentRules`, `missingRules`, `presentUnregisteredRules`, `blockedRules`; partial/blocked rules в ready-проектах сначала проходят Codex read-only self-check с готовой рекомендацией владельцу; copied-baseline apply-plan переносит только missing rules; bulk-copy во все локальные проекты и direct edits запрещены.
- `task:start` разрешён только из clean tree; `--allow-dirty` не считается допустимым bypass.
- `task:start` branch/worktree slug должен строиться из фактического title; non-ASCII title получает readable ASCII slug (`ЭХО` -> `echo`), а fallback `task` допустим только для title без осмысленных букв/цифр.
- Unknown root technology для нового продукта или capability требует isolated echo-test evidence до feature/refactor/behavior-change work; echo-test не заменяет QA/security/owner approval.
- `task:finish:core` пропускает publish для clean task branch, чей `HEAD` уже есть в `main` и где task commit ещё не записан; записывает `publishStatus=skipped_already_merged`, `PUBLISH_SKIP` и доводит cleanup до `passed|kept`.
- `cleanupStatus=passed` после удаления допустим только после проверки exact `state.worktreePath`, отсутствия этого пути в `git worktree list`, удаления `$CODEX_HOME/worktrees/<taskId>/` и отсутствия task-scoped leftovers; похожие worktrees других задач требуют отдельного выбора `1. Удалить` / `2. Оставить`.
- `Docs/qa-implementation-log.md` и `Docs/triz-usage-log.md` остаются активными читаемыми логами; большие pre-compaction snapshots сохраняются в `Docs/archive/*.md.gz`.
- Generated skill trees (`.agents/skills`, `.claude/skills`, `.cursor/skills`) не bulk-import'ятся в starter core; reusable source lives in `skills/`.
- Если используется BMAD: `_bmad/` — canonical install, `_bmad-output/` — uncommitted scratch, BMAD не отменяет conveyor gates.
- Для bugfixes: reproduction -> root cause -> class-level analysis -> test-first -> systemic fix -> QA matrix.
- Для TRIZ triggers использовать `research/triz/*` и давать один финальный блок `TRIZ-вклад`.
- При process/git/QA rule change обновлять canonical sources (`AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`) в той же задаче.

## Agent Coexistence

- `AGENTS.md` и `CODEX_MEMORY.md` остаются Codex-primary files, но читать их обязательно.
- `.memory-bank/*` — shared layer; изменения должны быть совместимы для всех агентов.
- Не переносить обязательные правила только в `CLAUDE.md`.

## Shared Starter Baseline Rules

- `starter.agent.contract-challenge`: Если буквальная инструкция пользователя ослабляет product charter, safety, privacy, governance, QA или уже принятый рабочий контракт проекта, согласие пользователя не является достаточным основанием для выполнения. Ассистент должен назвать конкретный конфликт, предложить ближайший вариант, который сохраняет цель пользователя и контракт проекта, и продолжать только по согласованному безопасному варианту.
- `starter.conveyor.dirty-source-blocker-report`: Если `task:start`, `task:finish:core`, `task:merge:main` или `release:local` блокируются dirty `main`/source tree, ассистент сначала сам собирает read-only blocker report: конкретные файлы, тип изменения, tracked/untracked статус, вероятное происхождение по history/diff/name-status, связь с текущей task branch, риск для текущей работы и recommended safe path. Нельзя перекладывать первичный разбор dirty tree на владельца.
- `starter.agent.default-goal-loop`: Для executable tasks ассистент должен вывести ожидаемый результат из запроса пользователя и вести цикл `goal -> change -> check -> fix -> re-check`, пока результат не проверен или не достигнут явный stop condition. Stop conditions: существенная продуктовая неоднозначность, риск destructive/data/prod/secret/main-worktree action, отсутствие permission/credential, конфликт, требующий выбора владельца, исчерпанный retryable QA chunk, baseline/infra blocker вне scope задачи или настоящий продуктовый tradeoff с несколькими валидными вариантами.
- `starter.qa.ui-browser-oracle`: Для user-visible UI behavior change или UI bugfix ассистент должен до реализации определить browser oracle: точный пользовательский сценарий, ожидаемый видимый результат, релевантные данные/состояния, признаки сбоя и console/runtime status. Перед завершением нужно проверить реальный интерфейс доступным browser-инструментом. Если browser verification падает и агент может это воспроизвести, он диагностирует, исправляет, повторяет deterministic checks и снова прогоняет browser oracle, а не просит владельца искать UI-ошибки вручную.
- `starter.project-intake.integration-review-path`: Integration / review path в Project Intake фиксирует, как изменения попадают в основной проект: managed task conveyor, Pull Request review или hybrid. Pull Request review является явным owner/team choice для risky, broad, external-review или team-review работы и не должен обходить deterministic QA, source-of-truth governance, task finish и merge gates.

## Shared Starter Baseline Rules — synced 2026-05-18

- `starter.publish-profile.result-evidence`: Если downstream-проект добавляет свой профиль публикации, завершение задачи, которое затрагивает этот профиль, должно явно сообщать владельцу: что пытались опубликовать, куда это должно попасть, было ли действие выполнено или пропущено, какой результат вернула площадка публикации, и прошла ли короткая проверка доступности или видимого результата, если её можно выполнить. Сам факт отправки изменений в основной проект не считается доказательством, что публикация уже завершилась. Названия площадок, команды и ссылки конкретного проекта остаются в его профиле, а не в starter core.
- `starter.data.external-generated-verification`: Если downstream-проект использует внешний, исследовательский или сгенерированный набор данных в пользовательском результате, перед использованием нужно зафиксировать источник, степень проверки, известные ограничения и воспроизводимую проверку, которая подтверждает пригодность данных для выбранного сценария. Если данные проверены частично или с ограничениями, это должно быть видно в продукте или отчёте там, где пользователь может принять решение на основе этих данных. Неполностью проверенные данные нельзя показывать как точный факт, единственно верный ответ или лучшую рекомендацию. Конкретные источники, форматы данных и способы проверки остаются в downstream-проекте.
- `starter.skills.source-link-flow`: Reusable shared skills хранятся в repo `skills/` и подключаются в `$CODEX_HOME/skills` только через безопасный link flow. Downstream-проекты могут подключать starter как versioned source и линковать skills через `skills-manage.mjs --source <skills-root>`. `.system`, plugin-managed, product-specific skills и generated skill trees (`.agents/skills`, `.claude/skills`, `.cursor/skills`) не импортируются в starter core через bulk-copy.
- `starter.rule-import.full-question-before-choice`: `starter-rule-import` должен перед каждым owner choice сначала показать полный owner-facing блок: `Статус сейчас`, `Проект-источник`, `Суть`, `Job Story`, `Что меняется в starter`, `**Точный текст для starter:**`, `**Моё предложение:**` и `Traceability`; только после этого можно показывать варианты решения. Если владелец пишет, что вопрос непонятен, агент останавливает последовательность, заново раскрывает пункт в этом полном формате и продолжает только после понятного решения.
- `starter.product-charter.project-identity-unique`: Product charter каждого проекта уникален: mission, vision, goal, target audience, `JTBD`, product constraints and success criteria нельзя импортировать, шарить или подменять из другого проекта. `starter-rule-import` и `starter-rule-share` могут переносить только отдельные approved reusable governance blocks; если такой блок должен жить в product charter, он добавляется как отдельный project-local block/guard и формулируется для конкретного проекта без замены charter identity.
- `starter.context.concise-responses`: Ответы агента должны быть короткими и по делу; подробности добавляются только когда они нужны для решения, проверки, owner decision или safety.
- `starter.agent.read-only-subagent-summary`: Для больших read-only анализов, ревью и независимых проверок можно использовать субагентов, когда текущая платформа и рабочий контракт это разрешают. Главный чат получает structured summary: findings, risks, checked files/sources, recommended next step. Субагенты не принимают product decisions за owner'а и не мутируют shared files без отдельного write scope.
- `starter.conveyor.goal-seed-handoff`: Goal Seed является стандартным форматом handoff для новых Codex-чатов, созданных task conveyor. Он выводится из исходного запроса владельца и должен быть самодостаточным plain-text prompt: цель задачи, исходные project source files, `Definition of Done`, зона влияния, safety boundaries, команды проверки, UI browser oracle rules когда релевантно, governance/eval requirements когда релевантно и stop conditions. Goal Seed может начинаться с `/goal`, но не должен зависеть от доступности slash command. `task:start` по умолчанию отправляет в новый чат effective Goal Seed; raw seed допустим только как явный opt-out владельца через `--no-goal-seed`.

## Shared Starter Baseline Rules — synced 2026-06-01

- `starter.conveyor.codex-open-readback`: `task:start` и shared `$worktree-create` не должны считать запуск `codex app <worktreePath>` доказательством открытого Codex-чата. `openedChat=true` допустим только после read-back локального Codex thread state с exact `cwd` нового worktree; при отсутствии matching thread нужно сохранять и показывать `openAttempted`, `openStatus=unverified|failed|skipped`, `openDiagnostics`, `openCommand` и не выдавать успешный статус открытия.
