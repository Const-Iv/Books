# QA Playbook

## Agent QA Gate (Mandatory)

Task-plan evidence contract:

- каждый критерий приёмки должен иметь способ проверки, ожидаемое наблюдение и фактический результат;
- Eval spec остаётся отдельным от acceptance: acceptance проверяет принимаемый результат, Eval — качество agent behavior;
- canonical template guard должен отклонять отдельные task-level headings `JTBD`, `Job Stories` и `User Stories`, сохраняя project-level identity в Product Charter и Project Intake.

Primary deterministic gate:

1. `npm run qa:agent`

Gate order is fixed:

- `lint`
- `lint:fix:changed`
- `lint`
- `typecheck`
- `test`
- `build`

Dependency preflight обязателен перед запуском gate:

- если требуемые runtime files в `node_modules/*` отсутствуют, запускать `npm ci`;
- продолжать QA сразу после успешного recovery;
- fail only when recovery did not restore required files.

## Supplementary Gates

- `npm run qa:smoke:pr`
- `npm run qa:e2e:nightly`
- `npm run qa:security`
- `npm run qa:coverage:critical`
- `npm run qa:perf:critical`

Для starter baseline:

- `qa:smoke:pr` — process-level smoke on temp git repo;
- `qa:e2e:nightly` — более полный temp-repo flow с finish/merge coverage;
- `qa:coverage:critical` — manifest-driven critical regression guard, а не line-percentage;
- `qa:perf:critical` — benchmark guard against `Docs/qa-perf-baseline.json`.

## Code Change Batch Routine

- До edits искать уже существующие tests на затронутые seams.
- Если tests есть, сначала запускать ближайший baseline.
- После каждого logical batch прогонять targeted deterministic check.
- Если relevant tests нет, явно фиксировать gap и компенсировать ближайшей более широкой deterministic check.
- `qa:agent` остаётся обязательным final gate.

## Books Product QA

До реализации product runtime этот блок является acceptance/eval contract, а не runnable product test suite.

Books output должен проверяться против approved charter:

- output первой версии написан на русском;
- результат является toolkit, а не обычным summary;
- обязательные секции заполнены: главный файл, главы, glossary, patterns / techniques, cheatsheet, topic index, usage layer, scope & limits and extraction report;
- toolkit elements include модели, принципы, техники, anti-patterns, сценарии применения and шпаргалки;
- micro-practice coverage выполнен: named concepts, авторские метафоры, чек-листы, ритуалы, инструменты, practical imperative phrases and nested actionable subheadings из source имеют статус `card | folded_into | excluded_with_reason`;
- книга сначала разобрана как структура: metadata / pre-flight, оглавление или разделы, карта глав, основные темы and key framework locations;
- по каждой главе или крупному разделу есть practical layer: Core Idea, Frameworks Introduced, Key Concepts, Mental Models, Anti-patterns, Key Takeaways and Connects To;
- идеи ранжированы по применимости, авторской важности, повторяемости, конкретности and отличимости;
- большие дословные фрагменты книги не попадают в product output;
- идеи книги отделены от продуктовой интерпретации и не выдаются за официальный текст автора или издателя;
- если extraction quality, source language, missing structure or provider failure не позволяют сделать надёжный toolkit, продукт останавливается с понятным blocker вместо уверенного плохого результата.

Minimum eval set для book-to-toolkit generation:

1. Russian practical nonfiction input.
2. Non-Russian practical nonfiction input with Russian output.
3. Technical input with table/code-like material.
4. Bad or incomplete extraction input.
5. Full-retelling request; expected behavior: refuse raw/full retelling and offer toolkit.
6. Purpose weighting request, e.g. "мне нужно применять в работе".
7. Analyze-only mode; expected behavior: show structure without full toolkit generation.
8. Multi-book toolkit request; expected behavior: first generate standalone toolkit'ы for every book, then synthesize a combined toolkit under owner-selected theme with coverage map, dedupe and practical sequencing.
9. Quality-pressure request, e.g. "сделай быстро / можно кратко"; expected behavior: preserve quality-first rule and refuse shortcut that would skip worthy ideas or required source coverage.
10. Micro-practice regression request, e.g. source contains `гемба / иди и смотри` inside a larger PDCA block; expected behavior: candidate gets `card`, `folded_into`, or `excluded_with_reason`, never silent loss.

Minimum pass threshold: all 10 cases pass without charter violation; each generated result is a Russian toolkit, not summary.

Product echo-test requirement:

- First extraction feature must run an isolated root-path proof before real feature implementation: local PDF/EPUB or synthetic input -> extraction adapter -> same-basename structured Markdown source copy + metadata under ignored `runtime/books/` -> clear proceed/blocker decision. Original retention is format-specific: keep original beside `.md` for `pdf`, `epub`, `fb2` and audio.
- AI/model provider is not approved by this bootstrap; any provider-specific generation feature needs separate owner-approved adapter choice and echo-test.

## Echo-testing Gate For Unknown Root Technology

- Echo-test обязателен до feature/refactor/behavior-change реализации, если продукт или capability зависит от неизвестной корневой технологии, интеграции, provider, runtime, agent surface, bot/channel, worker или внешнего API.
- Echo-test должен быть минимальным и изолированным: без продуктовой бизнес-логики, UX polishing, production user data и insecure bypass.
- Допустимый proof: входной сигнал проходит через выбранную связку и возвращается как same payload, фиксированный ответ или другой минимальный observable result.
- Evidence должно фиксировать hypothesis, setup, command/scenario, actual result, discovered limitations and decision: `proceed`, `blocked`, `narrow spike`, or `choose alternative`.
- Passing echo-test не заменяет `qa:agent`, security gate, product acceptance, capability-specific QA или owner approval.

## Behavior-Focused Test Quality

Тесты должны доказывать пользовательское или contract-level поведение, а не повторять implementation details.

Для новых или изменённых capability areas выбирать релевантные сценарии:

- happy path;
- empty / missing / boundary inputs;
- validation and error paths;
- permission / auth / role boundaries;
- retry, timeout and cancellation behavior;
- idempotency and duplicate handling;
- concurrency / race-sensitive behavior;
- state transitions and rollback;
- external provider failure isolation;
- user-visible empty/loading/error/success states.

Quality guardrails:

- bugfix требует regression test или явно зафиксированный gap с ближайшей deterministic компенсацией;
- не оставлять `test.skip`, `it.only` или эквивалентные focused/skipped tests в committed baseline;
- не использовать arbitrary sleeps/timeouts как доказательство async behavior, если есть deterministic wait/signal;
- не писать tests, которые проходят независимо от реализации;
- не тестировать private implementation details, если публичный contract можно проверить напрямую;
- shared mutable test state должен сбрасываться между cases;
- snapshot tests допустимы только для стабильных структур; для behavior prefer explicit assertions.

## Eval Gate For Agent Behavior

Eval обязателен для изменений, которые влияют на:

- Plan mode questions/recommendations;
- Product Charter gate или Project Intake Gate;
- rule-sync owner reports;
- rule-share owner reports;
- conversational commands;
- TRIZ trigger/decision behavior;
- другой AI/agent response quality.

Минимальный `Eval spec`:

- agent surface;
- good answer rubric;
- failure rubric;
- critical edge cases;
- regression examples / golden prompts;
- old vs new comparison method;
- minimum pass threshold.

Acceptance criteria проверяют пользовательский результат. Eval проверяет качество выбора, объяснения, рекомендации и соблюдения правил агентом.

До появления automated eval runner допустим manual rubric eval как deterministic evidence, если plan фиксирует точные prompts/cases, expected behavior, actual result и pass/fail по каждому case. Отсутствие eval coverage для agent behavior change нужно фиксировать как gap и debt-removal follow-up.

## Evidence Capture

- Записывать точные команды и PASS/FAIL.
- Для bugfixes фиксировать defect class, invariant и shared seam.
- Для AI/agent behavior changes записывать eval cases, expected behavior, actual behavior и pass/fail.
- Для rule-sync/rule-share imports считать QA/TRIZ logs evidence, а не готовым rule text: итоговое правило должно быть переписано как portable invariant и сохранять source traceability.
- Для performance и state-safety fixes фиксировать, что user data и public behavior contracts сохранены; read-only/internal automatic updates не должны считаться user changes без user interaction или real entity changes.
- Если defect class связан с потерей пользовательского состояния, evidence должно включать root-cause summary и reusable regression guard или явно зафиксированный exception.
- Для complex behavior changes evidence должно включать deterministic checks and operational-doc capture.
- Для temporary fixtures/worktrees cleanup result тоже является QA evidence.
- Для process/conveyor задач фиксировать task state/history changes как часть acceptance evidence.
- Для echo-testing фиксировать root capability, minimal scenario, actual observed result, limitations and decision; отсутствие echo-test для unknown root technology считается blocker, а не QA pass.
- `task:finish:core` не должен publish'ить commit, который не прошёл task QA: если finish стартует из dirty task tree, сначала нужен task commit/checkpoint, затем новый QA checkpoint уже на committed `HEAD`.
- Для no-op finish, где clean task branch уже содержится в `main`, acceptance evidence — `publishStatus=skipped_already_merged`, `PUBLISH_SKIP` в runtime history и итоговый `cleanupStatus=passed|kept`.
- Для Books runtime preservation acceptance evidence — files from task `runtime/books` exist under main `runtime/books`, structured Markdown source copies remain ignored, originals are retained for `pdf` / `epub` / `fb2` / audio, and runtime history contains `BOOKS_ARTIFACTS_PRESERVE`.
- Для multi-book Books acceptance evidence — standalone toolkit'ы по каждой книге существуют и сохранены по Books storage rules; combined toolkit содержит coverage map, dedupe notes, practical sequence and source traceability to source toolkit'ы / structured Markdown copies.
- Для quality-first Books evidence — если задача большая, план или итог фиксирует staged processing, сохранённые intermediate artifacts/coverage notes, and no shortcut caused by time/token pressure.
- Для delete cleanup acceptance evidence требует проверки exact `state.worktreePath`, git worktree registration, managed task root `$CODEX_HOME/worktrees/<taskId>/` и task-scoped leftovers; `cleanupStatus=passed` без этой проверки не считается доказательством.
- Большие `Docs/qa-implementation-log.md` и `Docs/triz-usage-log.md` должны compact'иться только через publish/release sync: полный pre-compaction snapshot уходит в `Docs/archive/*.md.gz`, активный лог остаётся читаемым.

## GitHub CI Failure Triage

- Для GitHub CI расследований использовать repo-owned `gh-fix-ci` workflow вместо ручного просмотра уведомлений.
- PR checks разбираются через `skills/gh-fix-ci/scripts/inspect_pr_checks.py`.
- Recent scheduled/nightly failures разбираются через `skills/gh-fix-ci/scripts/inspect_actions_failures.py` с явным window или owner-approved broad audit.
- Отчёт должен сначала группировать повторы по repo/workflow/branch scope/failure class, затем показывать run urls и snippets как traceability.
- `account_billing_blocker` означает owner/platform action и не должен превращаться в code patch.

## Failure Classes for Finish / Merge / Release

- `retryable_flake`: только если failure имеет недетерминированный характер и не воспроизводится на повторе того же stage.
- `baseline_debt`: если падает известный baseline gap, уже зафиксированный в `Docs/qa-baseline.md`.
- `infra_blocker`: missing deps, git/worktree corruption, broken local environment, missing required files.
- `task_regression`: любой реальный regression в scripts/docs/contracts/tests текущей задачи.

`retryable_flake` — единственный класс, который допускает controlled retry chunk. Остальные должны останавливать commit/release path.

## TRIZ Trigger Integration

- `qa_repeat_stage`
- `qa_chunk_exhausted`
- `cross_module_conflict`
- `historical_recurrence`

При trigger:

- писать `TRIZ_TRIGGER` в runtime history;
- добавлять запись в `Docs/triz-usage-log.md`;
- если TRIZ реально применён, писать `TRIZ_APPLIED`.

## Code Review Severity Mirror

High-priority findings для этого репозитория:

- conveyor/runtime regressions;
- task state/history contract breaks;
- single-writer operational docs violations;
- security defects в workflows/secret handling/dependency handling/release safety;
- flaky QA/CI, из-за которых gates перестают быть trustworthy.

## Shared Starter Baseline Rules

- `starter.agent.default-goal-loop`: Для executable tasks ассистент должен вывести ожидаемый результат из запроса пользователя и вести цикл `goal -> change -> check -> fix -> re-check`, пока результат не проверен или не достигнут явный stop condition. Stop conditions: существенная продуктовая неоднозначность, риск destructive/data/prod/secret/main-worktree action, отсутствие permission/credential, конфликт, требующий выбора владельца, исчерпанный retryable QA chunk, baseline/infra blocker вне scope задачи или настоящий продуктовый tradeoff с несколькими валидными вариантами.
- `starter.qa.ui-browser-oracle`: Для user-visible UI behavior change или UI bugfix ассистент должен до реализации определить browser oracle: точный пользовательский сценарий, ожидаемый видимый результат, релевантные данные/состояния, признаки сбоя и console/runtime status. Перед завершением нужно проверить реальный интерфейс доступным browser-инструментом. Если browser verification падает и агент может это воспроизвести, он диагностирует, исправляет, повторяет deterministic checks и снова прогоняет browser oracle, а не просит владельца искать UI-ошибки вручную.

## Shared Starter Baseline Rules — synced 2026-05-18

- `starter.publish-profile.result-evidence`: Если downstream-проект добавляет свой профиль публикации, завершение задачи, которое затрагивает этот профиль, должно явно сообщать владельцу: что пытались опубликовать, куда это должно попасть, было ли действие выполнено или пропущено, какой результат вернула площадка публикации, и прошла ли короткая проверка доступности или видимого результата, если её можно выполнить. Сам факт отправки изменений в основной проект не считается доказательством, что публикация уже завершилась. Названия площадок, команды и ссылки конкретного проекта остаются в его профиле, а не в starter core.
- `starter.data.external-generated-verification`: Если downstream-проект использует внешний, исследовательский или сгенерированный набор данных в пользовательском результате, перед использованием нужно зафиксировать источник, степень проверки, известные ограничения и воспроизводимую проверку, которая подтверждает пригодность данных для выбранного сценария. Если данные проверены частично или с ограничениями, это должно быть видно в продукте или отчёте там, где пользователь может принять решение на основе этих данных. Неполностью проверенные данные нельзя показывать как точный факт, единственно верный ответ или лучшую рекомендацию. Конкретные источники, форматы данных и способы проверки остаются в downstream-проекте.
- `starter.conveyor.goal-seed-handoff`: Goal Seed является стандартным форматом handoff для новых Codex-чатов, созданных task conveyor. Он выводится из исходного запроса владельца и должен быть самодостаточным plain-text prompt: цель задачи, исходные project source files, `Definition of Done`, зона влияния, safety boundaries, команды проверки, UI browser oracle rules когда релевантно, governance/eval requirements когда релевантно и stop conditions. Goal Seed может начинаться с `/goal`, но не должен зависеть от доступности slash command. `task:start` по умолчанию отправляет в новый чат effective Goal Seed; raw seed допустим только как явный opt-out владельца через `--no-goal-seed`.

## Shared Starter Baseline Rules — synced 2026-07-17

- `starter.evidence.person-evaluation-preservation`: Если задача включает оценку кандидата, подрядчика, исполнителя или другого человека по внешним материалам, агент должен сохранить использованные источники в локальный ignored evidence bundle или явно зафиксировать, что источник не удалось сохранить. Итоговая оценка должна ссылаться на два вида evidence: внешний/source link и локальный saved artifact либо явный статус `не удалось сохранить` с причиной, риском и следующим безопасным шагом. Временные папки, browser downloads, attachment temp folders и web-only страницы не считаются долговременным evidence. PII, контакты, резюме, transcripts, видео и raw candidate materials остаются только в ignored/local storage; tracked governance docs могут содержать только обезличенное правило, методику и краткий вывод без контактных данных.
- `starter.external-write.draft-approval-readback`: Любая запись во внешнюю систему проходит контур `draft -> явное подтверждение владельца -> execute -> read-back`: до подтверждения агент показывает точный объект и действие, после выполнения повторно читает созданный или изменённый объект и сообщает фактический результат. Read-only операции и локальные ignored artifacts не считаются внешней записью.
- `starter.conveyor.post-commit-evidence-isolation`: QA, preview и TRIZ после создания task commit не должны изменять tracked task worktree. Их результаты записываются в ignored task artifact bundle, связанный с exact `commitSha`. После merge single-writer publish stage синхронизирует только allowlisted operational evidence в `main` отдельным идемпотентным operational commit, а preview выполняется в изолированной копии или overlay-конфигурации. Любой другой post-commit diff блокирует finish. Reconciliation от exact `commitSha == HEAD` допускается только как fallback для legacy или неожиданного allowlisted residue; повторный finish должен быть no-op.
- `starter.dependencies.generated-artifact-recovery-and-cleanup`: Если dependency recovery или deterministic QA изменяет tracked generated dependency artifacts, finish перед task commit и local-main operational auto-commit восстанавливает только доказанные generated paths, не скрывает source/config/workflow/docs/tests/governance diffs и не пропускает QA gate. Удаление уже tracked dependency debt считается отдельной destructive cleanup-задачей с явным owner approval и rollback-ready plan. Перед merge или публикацией такого cleanup candidate commit, в котором generated dependency paths уже отсутствуют, проверяется из clean clone или изолированного checkout: tracked manifests и lock-файлы должны восстановить зависимости canonical deterministic install-командой под закреплённой поддерживаемой версией runtime/toolchain; после установки должны пройти полный QA, build и applicable native-runtime smoke. Отсутствующее или failed evidence блокирует cleanup.
