# Project Context

## Product Charter

- Миссия: дать команде переносимую операционную основу для старта нового проекта с первого дня: понятные правила работы, безопасный task flow, воспроизводимые проверки, memory-bank governance, TRIZ-эскалацию и разговорное управление задачами без ручной сборки заново.
- Видение: `new-project-starter` становится базовым слоем для новых репозиториев: команда подключает его как baseline, сразу получает понятный способ заводить, проверять, завершать и публиковать задачи, а продуктовую специфику добавляет поверх через adapters/profiles без изменения core governance.
- Цель: поддерживать runnable local-first starter baseline, который можно подключать или копировать в downstream проекты, чтобы они сразу имели canonical sources of truth, managed worktrees, deterministic QA, task state/history, operational docs и reusable shared skills.
- Целевая аудитория: команды, которые начинают новый проект или репозиторий; технические и продуктовые лиды, отвечающие за переносимую операционную основу; инженеры и agent-operators, ведущие задачи через Codex/worktree conveyor; downstream maintainers, подключающие starter как baseline.
- Не ЦА starter core: конечные пользователи downstream-продуктов; их аудитория описывается в charter и product specs конкретного downstream-проекта.
- JTBD: когда начинается новый проект, я хочу получить готовую и переносимую операционную основу, чтобы команда сразу работала по ясным правилам, проверяла изменения воспроизводимо и не собирала governance, task flow и QA заново.
- Core starter не является продуктовым runtime. Новые правила и скрипты должны быть переносимыми baseline-контрактами; product-specific capabilities добавляются поверх starter через adapters/profiles.
- Перед любым продуктовым решением, feature, behavior, process или governance изменением нужно прочитать `.memory-bank/product-charter.md` целиком и сверить решение с миссией, видением, целью, целевой аудиторией и `JTBD`.
- Новый downstream-проект сначала проходит Project Intake Gate по `plans/_project_intake_template.md`: недостающие product/governance сведения заполняются, согласуются owner'ом и только затем переносятся в canonical sources и используются для feature work.
- Project Intake включает applicable capability decisions для auth, payments, credits, analytics/consent, i18n, async jobs, API documentation, service layout и runtime-specific rules. Эти блоки заполняются только если применимы к downstream-продукту; provider/stack-specific решения остаются adapters/profiles, а не starter core.
- Conversational bootstrap для нового downstream-проекта идёт через `starter-project-bootstrap`: фразы `стартуем новый проект`, `запусти новый проект`, `проведи bootstrap нового проекта` и `я скопировал starter в новый репозиторий` должны автоматически создать managed bootstrap worktree on clean `main`, затем подключить repo-managed skills через `npm run skills:link` и вести owner'а по Project Intake, canonical transfer и baseline QA.
- Agent/eval surfaces starter core: Plan mode questions/recommendations, Product Charter gate, Project Intake Gate, rule-sync owner reports, conversational task commands и TRIZ trigger/decision behavior.

## Repository Layout

- `scripts/`: канонические conveyor, QA, release и operational-doc entrypoints.
- `scripts/rule-sync.mjs`: deterministic scanner, report renderer и approval-safe apply-plan seam для starter rule sync.
- `scripts/rule-share.mjs`: deterministic scanner, report renderer и approval-safe apply-plan seam для outbound sharing текущего starter baseline в выбранные active downstream проекты.
- `scripts/lib/`: shared runtime helpers для task state, history, docs sync и git-safe operations.
- `skills/`: reusable repo-owned Codex skills, которые можно линковать в `$CODEX_HOME/skills`.
- `skills/starter-rule-sync/`: primary project-local skill для ручного и автоматического rule sync workflow; `rule-sync:*` scripts остаются execution layer.
- `skills/starter-rule-share/`: primary project-local skill для approval-safe outbound rule sharing после успешного starter import.
- `skills/starter-project-bootstrap/`: primary project-local skill для guided bootstrap нового downstream-проекта после копирования или подключения starter baseline.
- `.memory-bank/`: shared knowledge layer для всех агентов.
- `Docs/`: human-readable process evidence и baselines.
- `plans/`: plan и bugfix templates плюс reference blueprint.
- `research/triz/`: canonical TRIZ pack.
- `templates/agent-workspace/`: локальные безопасные шаблоны для agent profiles и memory.
- `tests/unit`, `tests/integration`, `tests/e2e`: deterministic coverage самого process-layer.

## Tech Stack

- Runtime: Node.js CLI baseline.
- Main language: JavaScript (`.mjs`) + JSDoc typing.
- Typecheck: TypeScript `checkJs`.
- Tests: built-in Node test runner.
- Persistence: git worktrees + JSON/NDJSON state in `.git/codex-task-pipeline/*`.
- Release target: local-first `release:local`.

## Source of Truth

- Governance: `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`.
- Product charter: `.memory-bank/product-charter.md`.
- Task state: `.git/codex-task-pipeline/tasks/*.json`.
- Runtime history: `.git/codex-task-pipeline/history/events.ndjson`.
- Operational docs: активные читаемые логи `Docs/qa-implementation-log.md`, `Docs/triz-usage-log.md`, архивные pre-compaction snapshots в `Docs/archive/*.md.gz` и append-only sections of `CODEX_MEMORY.md`.
- TRIZ canon: `research/triz/*`.

## Common Commands

- `npm ci`
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
- `npm run task:history -- tail --lines 20`
- `npm run task:history -- sync`
- `npm run task:ledger -- rebuild --write-docs`
- `npm run task:operational-docs:capture`
- `npm run task:operational-docs:sync`
- `npm run release:local`

## Operational Constraints

- Core starter не содержит продуктовый UI/API runtime; smoke/nightly здесь проверяют process contracts через temp repos.
- `main` защищён от прямых изменений: direct-main правка допустима только по явному разрешению пользователя в текущей задаче.
- Дефолтный implementation path для feature/refactor/bugfix/process/governance задач — отдельный managed worktree и ветка `codex/*`.
- `task:start` по умолчанию работает с managed worktrees under `$CODEX_HOME/worktrees/<taskId>/`.
- Reusable starter skills публикуются в `$CODEX_HOME/skills` через symlink-based `skills:link`; после `git pull` существующие ссылки подхватывают обновления сразу, а для новых или переименованных skills нужно повторно запустить `skills:link`.
- `starter-project-bootstrap` — основной Codex entrypoint для `стартуем новый проект`: сначала автоматически создать managed bootstrap worktree on clean `main`, обеспечить skill availability через `npm ci` при необходимости и `npm run skills:link`, затем определить bootstrap state, провести Project Intake Gate, canonical docs transfer и baseline QA; product-specific choices остаются downstream adapters/profiles.
- `starter-rule-sync` — основной Codex entrypoint для быстрого ручного запуска rule sync вне расписания и для scheduled automation; он показывает decision proposals до raw ids и сохраняет owner approval, managed worktree и deterministic QA gates.
- `rule-sync:scan` и `rule-sync:report` остаются read-only относительно starter source; `rule-sync:apply-plan` в v1 только готовит dry-run seed для managed `task:start` и не применяет изменения автоматически.
- Default `rule-sync:scan` window идёт от `until` последнего saved scan snapshot до текущего запуска; fallback на previous local day используется только при отсутствии валидного snapshot.
- `starter-rule-share` — основной Codex entrypoint для outbound sharing уже обновлённого starter baseline в выбранные active downstream проекты; `runtime/rule-share/config.json` хранит локальный allowlist/ignorelist и optional standing approval для guarded one-run mode, не коммитится.
- `rule-share:scan` и `rule-share:report` read-only относительно downstream source; `rule-share:apply-plan` в v1 только готовит per-project dry-run task seeds и не делает direct edits. For copied-baseline `prepare_rule_import`, the seed includes canonical/mirror parity, QA/TRIZ evidence and stop-before-publish instructions. One-run mode выполняется самим skill поверх этих commands: только ready approved targets, managed downstream worktrees, deterministic QA, без finish/merge/publish по умолчанию.
- Downstream проекты могут подключать starter как git submodule под `vendor/new-project-starter` и линковать shared skills через `skills-manage.mjs --source vendor/new-project-starter/skills`, чтобы repo фиксировал версию baseline для новых участников.
- `.system`, plugin-cache и product-specific skills не должны вендориться в starter core.
- Generated skill trees вроде `.agents/skills`, `.claude/skills` и `.cursor/skills` считаются output'ом профиля или инструмента; starter импортирует только reusable source policy или repo-owned skills under `skills/`, а не bulk generated trees.
- `task:qa:agent` всегда пишет `qaLastPassSha` и `previewPreparedSha`; preview status по умолчанию `not_supported`, пока проект не добавит preview adapter.
- `task:finish:core` пропускает publish stage для clean task branch, чей `HEAD` уже содержится в `main` и у которой ещё нет записанного task commit; это фиксируется как `publishStatus=skipped_already_merged`, после чего cleanup всё равно должен завершиться `passed|kept`.
- `release:local` — core publish path. Deploy-to-server и `db:prod:*` контуры должны добавляться как optional profile поверх starter baseline.
