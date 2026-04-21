# Code Rules

## Core Rules

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
- Для user-facing планов, вопросов про изменения и предложений продуктовых решений использовать простой продуктовый язык: сначала `User Story`, `Job Story`, `JTBD`, пользовательская ценность, ситуация и ожидаемый результат; меньше технических терминов без необходимости.
- Технические детали добавлять только там, где они помогают понять или реализовать решение. Их можно встроить в текст; если агенту нужен точный implementation context, добавлять отдельный блок `План для агента`.
- Если high-impact ambiguity нельзя снять из репо, задавать один короткий choice question.
- Диалог с пользователем держать на русском, а code/comments/identifiers — на английском.

## Governance / Methods

- Для non-trivial задач явно фиксировать assumptions и коротко показывать plausible variants вместо silent choice.
- Делать surgical diffs и избегать speculative abstractions.
- Для bugfix/regression использовать `reproduce -> fix -> verify`, если это practically possible.
- Если process/git/QA rule меняется, обновлять `AGENTS.md` и/или `.memory-bank/*` в той же задаче и не оставлять обязательные правила только в `.cursorrules`.
- Если срабатывает `historical_recurrence` или `cross_module_conflict`, перед финальным fix-path нужен TRIZ-pass.
- Перед завершением governance-задачи делать Codex applicability check: правило есть в canonical sources и не живёт только в mirror-файлах.
- Если используется BMAD, каноническая установка живёт в `_bmad/`, а `_bmad-output/` остаётся uncommitted scratch.
- BMAD не заменяет conveyor gates; для small isolated work подходит quick flow, для cross-module/contract changes нужен более тяжёлый BMAD workflow.

## Conveyor Rules

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
- Build/test/release scripts не должны зависеть от наличия продуктового UI/backend кода.
- Любой optional deploy profile обязан дополнять core baseline, а не ломать `release:local`.
