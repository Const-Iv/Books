# Code Rules

## Core Rules

- Product charter в `.memory-bank/product-charter.md` — первичный gate для любых продуктовых решений и feature/behavior/process/governance изменений: сначала прочитать документ целиком, проверить миссию, видение, цель и `JTBD`, затем выбирать implementation path.
- Feature, behavior, process и governance изменения должны явно поддерживать хотя бы одну часть миссии, видения, цели или `JTBD`; maintenance-изменения должны явно сохранять charter.
- Нельзя принимать изменение, которое ослабляет переносимость baseline, deterministic QA, safe task flow, source-of-truth governance или hardcode'ит product-specific поведение в starter core.
- Rule-sync scan/report должны быть read-only относительно starter source, а apply-plan обязан оставаться approval-safe: только dry-run seed для managed `task:start`, без direct-main edits и без автоприменения правил.
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
- Для user-facing продуктовых решений использовать простой продуктовый язык и порядок `Миссия -> Видение -> Цель -> JTBD`: сначала зачем существует продукт, затем желаемая картина будущего, практическая цель и пользовательская потребность. `Job Story`, `User Story` и критерии приемки использовать только для конкретных feature/spec задач, когда это помогает команде реализовать и проверить изменение.
- Любое предложение продуктового решения, включая короткий ответ в чате, нельзя оформлять только как `Summary`, `Key Changes`, список implementation steps или технический sketch. Если нужен полный разбор, использовать `Миссия -> Видение -> Цель -> JTBD`; если пользователь задал короткий вопрос или нужен lightweight-вариант, дать хотя бы один продуктовый якорь из charter до implementation details.
- В будущих plan files техническая часть начинается ниже верхнего продуктового блока `Миссия -> Видение -> Цель -> JTBD / проблема -> Job Story -> User Stories -> Критерии приемки -> Метрика успеха`.
- В `Summary`, `TL;DR`, `Миссия`, `Видение`, `Цель`, `JTBD`, `Job Story` и `User Stories` не использовать технические термины без твердой необходимости; писать про ситуацию, ценность и ожидаемый результат.
- Технические детали добавлять только там, где они помогают понять или реализовать решение. Их можно встроить в текст; если агенту нужен точный implementation context, добавлять отдельный блок `План для агента`.
- Если high-impact ambiguity нельзя снять из репо, задавать один короткий choice question.
- Диалог с пользователем держать на русском, а code/comments/identifiers — на английском.

## Governance / Methods

- Для non-trivial задач явно фиксировать assumptions и коротко показывать plausible variants вместо silent choice.
- Делать surgical diffs и избегать speculative abstractions.
- Для bugfix/regression использовать `reproduce -> fix -> verify`, если это practically possible.
- Если process/git/QA rule меняется, обновлять `AGENTS.md` и/или `.memory-bank/*` в той же задаче и не оставлять обязательные правила только в `.cursorrules`.
- Для изменений `scripts/rule-sync.mjs` обновлять `tests/unit/rule-sync.test.mjs`, `tests/coverage-critical.manifest.json` и docs/scripts reference в той же задаче.
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
- Cleanup gate должен задаваться в виде фиксированного numbered choice: `1. Удалить`, `2. Оставить`; пользовательские ответы `1`/`2` маппятся на delete/keep без необходимости писать слова.
- Shared operational docs и generated `Docs/task-history.md` — single-writer; task branch обновления проходят только через capture, а sync/rebuild происходят на publish/release stage.

## QA Rules

- Deterministic QA order фиксирован и не должен меняться локально “под задачу”.
- `qa:agent` — обязательный closing gate для code-changing work.
- Для задач с plan file фиксировать checks/manual verification/expected/actual results прямо в плане.
- `qa:smoke:pr` и `qa:e2e:nightly` должны прогонять реальные process scenarios на temp repos, а не быть no-op wrappers.
- `qa:coverage:critical` должен ссылаться на явный manifest критичных модулей.
- `qa:perf:critical` обязан использовать baseline-файл из `Docs/qa-perf-baseline.json`.
- `qa:security` должен содержать минимум secret scan + dependency audit.
- Dependency preflight — общий seam для `task:start`, `task:test` и `qa:agent`.
- Для bugfix без formal plan QA evidence всё равно фиксируется в ответе по задаче и в `Docs/qa-implementation-log.md`.

## Contracts and Boundaries

- Source-specific или product-specific интеграции должны добавляться поверх starter через shared adapter contracts, а не hardcode в core scripts.
- Reusable shared Codex skills можно хранить в repo `skills/` и публиковать в `$CODEX_HOME/skills` только через безопасный symlink flow; downstream проекты могут использовать git submodule source через `skills-manage.mjs --source <skills-root>`; `.system`, plugin-managed и product-specific skills не должны попадать в starter core.
- Build/test/release scripts не должны зависеть от наличия продуктового UI/backend кода.
- Любой optional deploy profile обязан дополнять core baseline, а не ломать `release:local`.
