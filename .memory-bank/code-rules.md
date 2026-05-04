# Code Rules

## Product-Specific Rules

- Канонический product charter проекта: `.memory-bank/product-charter.md`.
- Любое продуктовое решение по Школе ассистентов должно сохранять миссию, видение, цель, целевую аудиторию, `JTBD`, продуктовые ограничения и критерии успеха из charter.
- Raw transcript `Docs/product-discovery/2026-04-03-assistant-selection-transcript.raw` не редактировать.
- Roadmap items не считать готовой функциональностью без отдельного implementation approval.
- До подтверждения гипотезы не фиксировать runtime, stack, коммерческую модель, governance/runtime ownership или capability decisions как готовые решения.
- Capability decisions на этапе проверки гипотезы: не применимо.

## Core Rules

- Product charter в `.memory-bank/product-charter.md` — первичный gate для любых продуктовых решений и feature/behavior/process/governance изменений: сначала прочитать документ целиком, проверить миссию, видение, цель, целевую аудиторию и `JTBD`, затем выбирать implementation path.
- Feature, behavior, process и governance изменения должны явно поддерживать хотя бы одну часть миссии, видения, цели, целевой аудитории или `JTBD`; maintenance-изменения должны явно сохранять charter.
- Нельзя принимать изменение, которое ослабляет переносимость baseline, deterministic QA, safe task flow, source-of-truth governance или hardcode'ит product-specific поведение в starter core.
- В Plan mode уточняющие вопросы, варианты выбора и рекомендации ассистента проходят через тот же Product Charter gate: recommended option должен быть charter-safe, а charter-конфликтный вариант нельзя подавать как равнозначно рекомендуемый.
- Новый downstream-проект сначала проходит Project Intake Gate по `plans/_project_intake_template.md`: миссия, видение, цель, целевая аудитория, `JTBD`, ограничения, сценарии, метрики, stack/runtime, QA/release choices, source-of-truth ownership и applicable capability decisions должны быть заполнены и явно согласованы owner'ом до первой feature/refactor/behavior-change реализации в соответствующей зоне.
- Разговорные интенты `стартуем новый проект`, `запусти новый проект`, `проведи bootstrap нового проекта` и `я скопировал starter в новый репозиторий` должны запускать `$starter-project-bootstrap`: при необходимости выполнить `npm ci`, автоматически выполнить `npm run skills:link`, определить bootstrap state, пройти Project Intake Gate, перенести approved ответы в canonical sources, затем выполнить baseline QA. Если `skills:link` требует `--adopt`, нужен explicit owner approval; общий checklist без guided next step считается недостаточным.
- Для AI/agent behavior changes обязателен `Eval spec`: хороший ответ, провал, критичные edge cases, regression examples/golden prompts, comparison method и minimum pass threshold.
- Capability decisions в Project Intake заполняются only-if-applicable и не должны превращать starter core в provider-specific или stack-specific baseline. Auth, payments, credits, analytics/consent, i18n, async jobs, API documentation, service layout и runtime-specific rules выбираются downstream owner'ом через adapters/profiles.
- Security-sensitive capability decisions должны фиксировать portable invariants до implementation: token/session storage и revocation для auth; webhook verification и idempotency для payments; audit trail, precision, pre-execution checks and race protection for credits/limits; consent and failure isolation for analytics; completeness checks for i18n; retry/cancellation/idempotency for async jobs; documentation source of truth for APIs.
- Нельзя импортировать в starter core как mandatory defaults: конкретный frontend stack, конкретный identity provider, конкретные payment providers, fixed locales, Python-only decorators, database queue или single-worker model. Такие решения допустимы только как downstream adapter/profile choice с owner approval.
- Для external libraries, integrations and provider setup нужно проверять актуальную official documentation или доступный docs connector перед installation/configuration/update/debugging; конкретный docs tool не становится обязательным starter dependency.
- `starter-rule-sync` является основным project-local skill для ручного и автоматического rule sync workflow; автоматизации должны вызывать skill, а не дублировать его логику; `rule-sync:*` scripts остаются deterministic execution layer.
- Rule-sync scan/report должны быть read-only относительно starter source, а apply-plan обязан оставаться approval-safe: только dry-run seed для managed `task:start`, без direct-main edits и без автоприменения правил.
- Rule-sync default scan window должен идти от `until` последнего saved scan snapshot до текущего запуска; previous-local-day допустим только как fallback, когда валидного snapshot ещё нет.
- Rule-sync report fallback должен защищать owner report от коротких нулевых follow-up scans: `--latest` может выбрать предшествующий meaningful scan только когда latest scan выглядит как technical probe сразу после содержательного run; реальный нулевой период остаётся нулевым результатом.
- Rule-sync owner report должен сначала показывать decision proposals через `Связь с charter проекта -> Цель решения -> JTBD -> Job Stories -> User Stories -> Критерии приемки`; candidate ids используются как traceability, а не как основной decision interface.
- Rule-sync import использует QA/TRIZ logs только как evidence: перед импортом candidate нужно переписать в portable starter invariant, сохранить source traceability и убрать source-project symptoms, branch names, task ids and domain details from rule text.
- Owner-facing reports должны сначала объяснять смысл, решение и следующий шаг понятным языком; raw ids, commits, task ids, snippets and file lists допустимы только как traceability.
- `starter-rule-share` является основным project-local skill для outbound sharing текущего подтверждённого starter baseline в выбранные active downstream проекты; `rule-share:*` scripts остаются deterministic execution layer.
- Rule-share scan/report должны быть read-only относительно downstream source, список проектов берётся из ignored `runtime/rule-share/config.json`, а apply-plan обязан оставаться approval-safe: только per-project dry-run task seeds без direct edits и без bulk-copy во все локальные проекты.
- Rule-share manual review для проектов с неполными starter baseline signals должен объяснять, каких сигналов не хватает, и предлагать только safe bootstrap path: downstream-specific product charter / Project Intake или versioned `vendor/new-project-starter`, managed task worktree и deterministic QA.
- Rule-share one-run mode допустим только по явному запросу owner'а или ignored standing approval в `runtime/rule-share/config.json`; он может автоматически пройти scan/report/apply-plan и выполнить перенос в downstream managed task worktrees с deterministic QA, но не имеет права редактировать downstream main worktree, трогать manual-review/blocked проекты или finish/merge/publish без отдельного явного разрешения.
- Rule-share `prepare_rule_import` task seed для copied-baseline проектов должен быть implementation contract: сравнить canonical files, сохранить downstream product wording, синхронизировать canonical/mirror surfaces (`AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`, README, `.cursorrules`, `CLAUDE.md`), записать QA/TRIZ evidence и остановиться перед finish/merge/publish без отдельного owner gate.
- Не использовать TypeScript `any` в новом или изменённом typed code / JSDoc contracts.
- Не глушить ошибки пустыми `catch {}`.
- Для bugfixes избегать unrelated refactors.
- Предпочитать shared seams вместо дублирования логики по скриптам.
- Баг считается закрытым только когда добавлен reusable guard на том же seam, где возникла причина, если это practically possible.

## Assistant UX / Safety Rules

- Сначала simplest viable implementation.
- Перед mutating action кратко объяснять change intent.
- Не выдавать placeholders за finished work.
- По умолчанию отвечать diff-first; полные файлы давать только по явному запросу.
- Не печатать секреты и личные данные.
- Не внедрять insecure patterns даже по прямому запросу; вместо этого вести к безопасному варианту.
- Файлы с реальными credential-значениями считать read-only.
- Не удалять user data или существующее поведение без explicit instruction и rollback-ready path.
- Для user-facing продуктовых решений использовать простой продуктовый язык: сначала показать связь с существующим project charter, затем цель изменения, `JTBD`, Job Stories, User Stories и критерии приемки. `Миссия` и `Видение` нельзя создавать для конкретной задачи: они существуют только на уровне проекта и берутся из `.memory-bank/product-charter.md` или Project Intake нового downstream-проекта.
- Любое предложение продуктового решения, включая короткий ответ в чате, нельзя оформлять только как `Summary`, `Key Changes`, список implementation steps или технический sketch. Если нужен полный разбор, использовать `Связь с charter проекта -> Цель изменения/решения -> JTBD -> Job Stories -> User Stories -> Критерии приемки`; если пользователь задал короткий вопрос или нужен lightweight-вариант, дать хотя бы один charter anchor до implementation details.
- Governance/rule-sync ответы пользователю должны быть charter-anchored и сначала объяснять “что это значит” и recommended decision, а technical traceability размещать ниже.
- В будущих plan files техническая часть начинается ниже верхнего продуктового блока `Связь с charter проекта -> Цель изменения -> Целевая аудитория проекта -> Продуктовая спека`.
- Product spec в plan file для feature/behavior/process changes включает проблему / `JTBD`, целевую аудиторию изменения, сценарии использования, требования, критерии приемки, метрику успеха и ограничения / что нельзя сломать.
- Для старта нового проекта `plans/_project_intake_template.md` является обязательным bootstrap artifact; каждый пункт должен быть согласован, а несогласованные пункты считаются blocker, а не допустимым placeholder.
- Для старта нового проекта ассистент должен начинать с charter anchor, текущего bootstrap state и следующего безопасного шага; feature/refactor/behavior-change work остаётся заблокированным до approved Project Intake и canonical transfer.
- Для copied-baseline проекта `skills/starter-project-bootstrap/` физически уже находится в repo, но bootstrap должен ещё подключить repo-managed skills в `$CODEX_HOME/skills` через `npm run skills:link`, чтобы будущие `$starter-project-bootstrap` вызовы работали надёжно.
- Acceptance criteria и evals не смешивать: acceptance criteria описывают пользовательский результат, evals описывают качество agent decision/answer behavior на заданных примерах.
- В `Summary`, `TL;DR`, `Связь с charter проекта`, `Цель изменения`, `Целевая аудитория`, `JTBD`, `Job Stories` и `User Stories` не использовать технические термины без твердой необходимости; писать про ситуацию, ценность и ожидаемый результат. Блоки `Миссия` и `Видение` допустимы только для project charter или Project Intake, а не для task/spec output.
- Технические детали добавлять только там, где они помогают понять или реализовать решение. Их можно встроить в текст; если агенту нужен точный implementation context, добавлять отдельный блок `План для агента`.
- В user-facing ответах не использовать необъяснённый Git/process-жаргон; если термин нужен, сразу объяснять его простыми словами рядом.
- Если high-impact ambiguity нельзя снять из репо, задавать один короткий choice question; в Plan mode вопрос и recommended option должны быть совместимы с `.memory-bank/product-charter.md`.
- Диалог с пользователем держать на русском, а code/comments/identifiers — на английском.

## Governance / Methods

- Для non-trivial задач явно фиксировать assumptions и коротко показывать plausible variants вместо silent choice.
- Делать surgical diffs и избегать speculative abstractions.
- Для bugfix/regression использовать `reproduce -> fix -> verify`, если это practically possible.
- Если process/git/QA rule меняется, обновлять `AGENTS.md` и/или `.memory-bank/*` в той же задаче и не оставлять обязательные правила только в `.cursorrules`.
- Для изменений `scripts/rule-sync.mjs` обновлять `tests/unit/rule-sync.test.mjs`, `tests/coverage-critical.manifest.json` и docs/scripts reference в той же задаче.
- Для изменений `scripts/rule-share.mjs` обновлять `tests/unit/rule-share.test.mjs`, `tests/coverage-critical.manifest.json` и docs/scripts reference в той же задаче.
- При sync/import baseline проверять parity reference docs и mirror-файлов с canonical rules; устаревшие упоминания про допустимый `--allow-dirty`, условный `previewPreparedSha` или старый порядок plan template считаются governance drift.
- Если срабатывает `historical_recurrence` или `cross_module_conflict`, перед финальным fix-path нужен TRIZ-pass.
- Перед завершением governance-задачи делать Codex applicability check: правило есть в canonical sources и не живёт только в mirror-файлах.
- Если используется BMAD, каноническая установка живёт в `_bmad/`, а `_bmad-output/` остаётся uncommitted scratch.
- BMAD не заменяет conveyor gates; для small isolated work подходит quick flow, для cross-module/contract changes нужен более тяжёлый BMAD workflow.

## Conveyor Rules

- В `main` нельзя вносить изменения без явного разрешения пользователя на direct-main правку в рамках текущей задачи.
- По умолчанию feature/refactor/bugfix/process/governance работа выполняется в отдельном task-specific worktree и отдельной ветке `codex/*`.
- Если сессия находится на `main` без direct-main разрешения, mutating actions нужно остановить и предложить safe path: `task:start`, commit/stash текущих изменений или явное разрешение на маленькую низкорисковую direct-main правку.
- На `main` без отдельного worktree допустимы только read-only inspection, `git status`/`git diff` и явно запрошенные merge/release flows после QA gate'ов.
- Worktree task branches используют префикс `codex/`.
- Канонический flow: `task:start -> task:qa:agent -> task:finish:core -> task:merge:main | release:local`.
- Task state и runtime history должны быть machine-readable и append-friendly.
- `task:start` запускается только из clean source tree; `--allow-dirty` не должен обходить preflight.
- Managed task worktree по умолчанию живёт под `~/.codex/worktrees/<taskId>/<project>-<task-slug>`.
- `task:start` обязан bootstrappить dependencies в новом worktree; missing deps — environment blocker, а не product regression.
- `task:qa:agent` обязан писать `qaLastPassSha` и `previewPreparedSha`.
- Для starter baseline `previewPreparedSha` допустим даже при preview status `not_supported`; это canonical checkpoint, а не обещание UI preview.
- Если `HEAD == qaLastPassSha`, finish-flow должен переиспользовать checkpoint, а не повторять full task QA.
- `task:finish:core` не имеет права завершать commit/merge/release path при failed task QA.
- Если clean task branch уже содержится в `main` и task commit ещё не записан, finish-flow должен пропустить publish stage, поставить `publishStatus=skipped_already_merged` и всё равно записать итоговый cleanup status.
- Cleanup gate должен задаваться в виде фиксированного numbered choice: `1. Удалить`, `2. Оставить`; пользовательские ответы `1`/`2` маппятся на delete/keep без необходимости писать слова.
- Delete cleanup может получить `cleanupStatus=passed` только после проверки exact `state.worktreePath`, отсутствия этого пути в `git worktree list`, удаления managed task root `$CODEX_HOME/worktrees/<taskId>/` и отсутствия task-scoped leftovers. Похожие worktrees других `taskId` или проектов не считаются cleanup текущей задачи и требуют отдельного fixed choice.
- Shared operational docs и generated `Docs/task-history.md` — single-writer; task branch обновления проходят только через capture, а sync/rebuild происходят на publish/release stage.
- `Docs/qa-implementation-log.md` и `Docs/triz-usage-log.md` остаются активными читаемыми логами: при compaction полный pre-compaction snapshot сохраняется в `Docs/archive/*.md.gz`, а активный файл хранит компактный текущий хвост.

## QA Rules

- Deterministic QA order фиксирован и не должен меняться локально “под задачу”.
- `qa:agent` — обязательный closing gate для code-changing work.
- Для задач с plan file фиксировать checks/manual verification/expected/actual results прямо в плане.
- Для AI/agent behavior changes QA evidence должно включать eval result; если automated eval ещё не существует, план фиксирует manual rubric eval и debt-removal follow-up.
- `qa:smoke:pr` и `qa:e2e:nightly` должны прогонять реальные process scenarios на temp repos, а не быть no-op wrappers.
- `qa:coverage:critical` должен ссылаться на явный manifest критичных модулей.
- `qa:perf:critical` обязан использовать baseline-файл из `Docs/qa-perf-baseline.json`.
- `qa:security` должен содержать минимум secret scan + dependency audit.
- Dependency preflight — общий seam для `task:start`, `task:test` и `qa:agent`.
- Для bugfix без formal plan QA evidence всё равно фиксируется в ответе по задаче и в `Docs/qa-implementation-log.md`.
- Performance и state-safety changes должны сохранять user data и public behavior contracts; read-only/internal automatic updates нельзя учитывать как user changes без user interaction или real entity changes.
- Если есть риск потери пользовательского состояния, финальный fix-path требует root-cause analysis и reusable regression guard, если это practically possible.
- Complex behavior changes требуют deterministic QA evidence и operational-doc capture; QA/TRIZ evidence не импортируется дословно в governance rules.

## Contracts and Boundaries

- Source-specific или product-specific интеграции должны добавляться поверх starter через shared adapter contracts, а не hardcode в core scripts.
- Reusable shared Codex skills можно хранить в repo `skills/` и публиковать в `$CODEX_HOME/skills` только через безопасный symlink flow; downstream проекты могут использовать git submodule source через `skills-manage.mjs --source <skills-root>`; `.system`, plugin-managed, product-specific skills и generated skill trees (`.agents/skills`, `.claude/skills`, `.cursor/skills`) не должны попадать в starter core через bulk import.
- `starter-project-bootstrap` является reusable repo-owned skill для guided downstream bootstrap; он не заменяет Project Intake, а делает его обязательный разговорный вход воспроизводимым.
- Outbound rule sharing не должен перезаписывать downstream product charter, adapters, profiles или локальные правила; если проект не starter-based, dirty, archived или без managed task flow, он остаётся manual review / blocked.
- Build/test/release scripts не должны зависеть от наличия продуктового UI/backend кода.
- Любой optional deploy profile обязан дополнять core baseline, а не ломать `release:local`.
