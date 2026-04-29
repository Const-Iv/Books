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
- Для temporary fixtures/worktrees cleanup result тоже является QA evidence.
- Для process/conveyor задач фиксировать task state/history changes как часть acceptance evidence.
- `task:finish:core` не должен publish'ить commit, который не прошёл task QA: если finish стартует из dirty task tree, сначала нужен task commit/checkpoint, затем новый QA checkpoint уже на committed `HEAD`.
- Для no-op finish, где clean task branch уже содержится в `main`, acceptance evidence — `publishStatus=skipped_already_merged`, `PUBLISH_SKIP` в runtime history и итоговый `cleanupStatus=passed|kept`.
- Большие `Docs/qa-implementation-log.md` и `Docs/triz-usage-log.md` должны compact'иться только через publish/release sync: полный pre-compaction snapshot уходит в `Docs/archive/*.md.gz`, активный лог остаётся читаемым.

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
