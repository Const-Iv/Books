# Script Contracts

В этом starter репозитории скрипты уже реализованы и являются source of truth для process-layer.

## Канонические entrypoint'ы

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
- умеет resume из `main` через `--branch codex/<task-branch>` для cleanup/publish retry;
- не коммитит и не публикует при failed task QA;
- переиспользует `qaLastPassSha`, если `HEAD` не менялся после последнего PASS;
- вызывает `task:operational-docs:capture` перед commit;
- после capture нормализует shared operational snapshots, чтобы они не попадали в task commit;
- пушит task branch при наличии `origin`;
- запускает merge/publish handoff через `task:merge:main`;
- пишет `QA_REUSE`, `COMMIT_PUSH`, `CLEANUP`, `FINISH`;
- требует явное решение `--cleanup yes|no`.
- branch-chat cleanup gate задаётся фиксированно как `1. Удалить` / `2. Оставить`; ответ `1` маппится на `--cleanup yes`, ответ `2` — на `--cleanup no`.

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
