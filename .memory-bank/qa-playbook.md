# QA Playbook

## Agent QA Gate (Mandatory)

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

## Evidence Capture

- Записывать точные команды и PASS/FAIL.
- Для bugfixes фиксировать defect class, invariant и shared seam.
- Для temporary fixtures/worktrees cleanup result тоже является QA evidence.
- Для process/conveyor задач фиксировать task state/history changes как часть acceptance evidence.

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
