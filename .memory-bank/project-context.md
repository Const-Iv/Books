# Project Context

## Repository Layout

- `scripts/`: канонические conveyor, QA, release и operational-doc entrypoints.
- `scripts/lib/`: shared runtime helpers для task state, history, docs sync и git-safe operations.
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
- Task state: `.git/codex-task-pipeline/tasks/*.json`.
- Runtime history: `.git/codex-task-pipeline/history/events.ndjson`.
- Operational docs: `Docs/qa-implementation-log.md`, `Docs/triz-usage-log.md`, append-only sections of `CODEX_MEMORY.md`.
- TRIZ canon: `research/triz/*`.

## Common Commands

- `npm ci`
- `npm run lint`
- `npm run lint:fix`
- `npm run lint:fix:changed`
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
- `task:start` по умолчанию работает с managed worktrees under `$CODEX_HOME/worktrees/<taskId>/`.
- `task:qa:agent` всегда пишет `qaLastPassSha` и `previewPreparedSha`; preview status по умолчанию `not_supported`, пока проект не добавит preview adapter.
- `release:local` — core publish path. Deploy-to-server и `db:prod:*` контуры должны добавляться как optional profile поверх starter baseline.
