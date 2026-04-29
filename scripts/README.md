# Script Contracts

В этом starter репозитории скрипты уже реализованы и являются source of truth для process-layer.

## Канонические entrypoint'ы

### `skills:status`

- показывает состояние repo-managed skills относительно `$CODEX_HOME/skills`;
- с `--source <skills-root>` проверяет внешний skills root, например `vendor/new-project-starter/skills` из git submodule;
- различает `linked`, `missing` и `conflict`;
- не меняет файловую систему и печатает machine-readable JSON.

### `skills:link`

- находит все repo-owned skills из `skills/**/SKILL.md`;
- с `--source <skills-root>` находит shared skills во внешнем source tree, например в starter submodule downstream проекта;
- создаёт symlink в `$CODEX_HOME/skills/<relative-path>`;
- не перезаписывает конфликтующие локальные директории или symlink'и по умолчанию;
- с `--adopt` переносит конфликтующий target в `$CODEX_HOME/skills-backups/<timestamp>/...`, затем ставит managed symlink;
- после обычного `git pull` уже существующие symlink'и сразу видят обновления repo skill.

### `skills:unlink`

- удаляет только symlink'и, которые указывают на текущий repo-owned skill source;
- с `--source <skills-root>` удаляет только symlink'и, которые указывают на этот внешний skills source;
- не трогает конфликтующие или чужие директории;
- подчищает пустые parent-директории внутри `$CODEX_HOME/skills`, если после unlink они опустели.

### `rule-sync:scan`

- ищет локальные git-проекты под рабочим корнем starter и `$CODEX_HOME/worktrees`;
- учитывает ignored local config `runtime/rule-sync/config.json` с `roots`, `allowlist`, `ignorelist`;
- читает task pipeline events/states и governance commits за заданный период;
- пишет snapshot в `runtime/rule-sync/scans/*.json`;
- остаётся read-only относительно tracked starter source.

### `rule-sync:report`

- читает последний или явно выбранный scan snapshot;
- строит русскую owner-facing сводку по секциям `Кандидаты на импорт`, `Требует ручной проверки`, `Пропущено как product-specific`, `Диагностика`;
- сохраняет traceability: source project, task/commit evidence, changed files, suggested starter target.

### `rule-sync:apply-plan`

- принимает approval JSON с ids подтверждённых candidates;
- в v1 требует `--dry-run`;
- возвращает seed и команду для managed `task:start`;
- не применяет правила, не меняет `main` и не создаёт source edits без отдельного task worktree/plan/QA.

### Git submodule для shared skills

Downstream проект может держать starter как versioned submodule и не копировать reusable skills вручную:

```bash
git submodule add <starter-repo-url> vendor/new-project-starter
git submodule update --init --recursive
node vendor/new-project-starter/scripts/skills-manage.mjs link --source vendor/new-project-starter/skills
```

В `package.json` downstream проекта можно добавить wrapper:

```json
{
  "scripts": {
    "skills:link": "node vendor/new-project-starter/scripts/skills-manage.mjs link --source vendor/new-project-starter/skills",
    "skills:status": "node vendor/new-project-starter/scripts/skills-manage.mjs status --source vendor/new-project-starter/skills",
    "skills:unlink": "node vendor/new-project-starter/scripts/skills-manage.mjs unlink --source vendor/new-project-starter/skills",
    "rule-sync:scan": "node vendor/new-project-starter/scripts/rule-sync.mjs scan",
    "rule-sync:report": "node vendor/new-project-starter/scripts/rule-sync.mjs report",
    "rule-sync:apply-plan": "node vendor/new-project-starter/scripts/rule-sync.mjs apply-plan"
  }
}
```

### `task:start`

- создаёт `codex/*` branch и отдельный managed worktree;
- принимает `--title`, `--seed-message`, но не позволяет обходить preflight через `--allow-dirty`;
- если source tree dirty, останавливается до создания ветки/worktree и подсказывает безопасные next steps;
- пишет task state в `.git/codex-task-pipeline/tasks/*.json`;
- пишет runtime history в `.git/codex-task-pipeline/history/events.ndjson`;
- bootstrappит зависимости в новом worktree;
- best-effort открывает новый worktree/chat, но auto-open failure не должен ломать START.

### `task:qa:agent`

- запускает dependency preflight;
- запускает fixed deterministic QA gate;
- пишет `qaLastPassSha`, `previewPreparedSha`, `lastQaResult`;
- при PASS дополнительно пишет history events `QA_CHECKPOINT` и `PREVIEW_READY`;
- классифицирует failure class;
- при trigger фиксирует `TRIZ_TRIGGER`.

### `task:finish:core`

- работает только на `codex/*` branch;
- умеет resume из `main` через `--task-id <id>` для cleanup/publish retry; `--branch codex/<task-branch>` остаётся совместимым fallback;
- не коммитит и не публикует при failed task QA;
- переиспользует `qaLastPassSha`, если `HEAD` не менялся после последнего PASS;
- если finish стартует из dirty task tree, сначала фиксирует task commit/checkpoint, потом прогоняет task QA на committed `HEAD`, и только затем идёт в publish stage;
- вызывает `task:operational-docs:capture` перед commit;
- после capture нормализует shared operational snapshots, чтобы они не попадали в task commit;
- пушит task branch при наличии `origin`;
- запускает merge/publish handoff через `task:merge:main`;
- пишет `QA_REUSE`, `COMMIT_PUSH`, `CLEANUP`, `FINISH`;
- требует явное решение `--cleanup 1|2` как canonical path; legacy `yes|no` остаётся совместимым.
- branch-chat cleanup gate задаётся фиксированно как `1. Удалить` / `2. Оставить`; ответ `1` маппится на `--cleanup yes`, ответ `2` — на `--cleanup no`.
- успешный finish требует итоговый `cleanupStatus = passed|kept`; один `cleanupDecision` не считается доказательством фактической уборки.
- optional repo hook `task:finish:cleanup` может вернуть task-scoped `extraPaths`, `blocked` и `notes`; starter core удаляет только пути внутри текущего task scope.

### `task:merge:main`

- может запускаться из task worktree или из `main` с `--branch` / `--task-id`;
- использует local `main` worktree и `main-publish.lock`;
- подтягивает `origin/main`, если remote существует;
- нормализует legacy dirty `Docs/task-history.md` перед publish stage;
- merge'ит task branch в `main`;
- прогоняет `qa:agent` на `main`;
- синхронизирует operational docs;
- пересобирает `Docs/task-history.md` только на publish stage;
- auto-commit'ит tracked sync/history changes перед push, если они появились;
- пушит `main`, если remote существует.

### `task:history`

- `tail`: выводит runtime events;
- `sync`: перестраивает `Docs/task-history.md`.

### `task:ledger`

- `rebuild --write-docs`: перестраивает `Docs/change-ledger.md`.

### `task:operational-docs:capture`

- сохраняет append-only snapshots `Docs/qa-implementation-log.md`, `Docs/triz-usage-log.md` и sections `Learned Rules` / `Project Notes` из `CODEX_MEMORY.md` в runtime artifacts.

### `task:operational-docs:sync`

- синхронизирует captured operational docs обратно в single-writer snapshots на publish/release stage.

### `release:local`

- работает только на clean `main`;
- делает sync с `origin/main`, если remote есть;
- прогоняет deterministic QA;
- пишет local release artifact в `runtime/release/`.

## Deterministic QA Order

```text
lint -> lint:fix:changed -> lint -> typecheck -> test -> build
```

## Дополнительные QA entrypoint'ы

- `qa:smoke:pr` — process smoke на temp repo;
- `qa:e2e:nightly` — расширенный nightly process flow;
- `qa:security` — secret scan + dependency audit;
- `qa:coverage:critical` — manifest-driven critical regression guard;
- `qa:perf:critical` — benchmark guard against `Docs/qa-perf-baseline.json`.

## Preview Contract

- Core starter не поднимает продуктовый preview.
- `task:qa:agent` всё равно пишет `previewPreparedSha`; это checkpoint contract, а не обещание live preview.
- Default preview payload: `status = not_supported`.
- `task:finish:core` не использует legacy `--preview ok|skip`.
