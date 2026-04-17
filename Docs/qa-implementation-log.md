# QA implementation log

## 2026-04-16 — Runnable Node/npm baseline

### Scope

- Перевод starter-репозитория из blueprint-only scaffolding в исполнимый process baseline.
- Добавлены реальные conveyor scripts, deterministic QA, temp-repo smoke/nightly scenarios, security/coverage/perf gates.
- Синхронизированы governance и reference docs под реальное поведение baseline.

### Deterministic checks

- `npm run typecheck` — PASS
- `npm test` — PASS
- `npm run qa:smoke:pr` — PASS
- `npm run qa:e2e:nightly` — PASS
- `npm run qa:security` — PASS
- `npm run qa:coverage:critical` — PASS
- `npm run qa:perf:critical` — PASS
- `npm run build` — PASS
- `npm run qa:agent` — PASS

### Failures and fixes

- Первый smoke run упал на lint, потому что placeholder-snippet guard проверял governance docs и собственный source файл `repo-lint`.
- Fix: placeholder-snippet rule сужен до исполнимых файлов; self-documenting тексты и policy docs больше не создают ложные QA-fail.

### Rollback notes

- Если downstream project требует настоящий browser/UI smoke, можно заменить только реализацию `qa:smoke:pr` / `qa:e2e:nightly`, сохранив те же command contracts.

### Status

- PASS

## `<YYYY-MM-DD>` — Bootstrap

### Scope

- Initialized governance, memory bank, QA baseline scaffolding, and workflow skeleton.

### Status

- In progress.
