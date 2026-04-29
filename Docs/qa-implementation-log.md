# QA implementation log

## 2026-04-29 — Product spec and target audience gate

### Scope

- В `.memory-bank/product-charter.md` добавлена целевая аудитория `new-project-starter` и явное правило, что downstream-проекты описывают свою аудиторию отдельно.
- `plans/_template.md` усилен блоком `Продуктовая спека`: проблема / `JTBD`, целевая аудитория изменения, сценарии использования, требования, критерии приемки, метрика успеха и ограничения / что нельзя сломать.
- Product Charter gate синхронизирован в `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`, mirrors и reference blueprint.
- Добавлен Project Intake Gate: новый downstream-проект обязан заполнить и согласовать недостающую product/governance информацию до первой feature/refactor/behavior-change реализации.
- Добавлен `plans/_project_intake_template.md` с owner approval по каждому обязательному пункту.
- Добавлен Eval Gate для AI/agent behavior changes: `Eval spec` в plan template, agent/eval choices в Project Intake, eval evidence в QA playbook и mirrors.

### Eval evidence

- Case: Plan mode task changes assistant recommendation behavior.
  - Expected: plan requires `Eval spec` and QA requires eval evidence.
  - Actual: `AGENTS.md`, `.memory-bank/code-rules.md`, `.memory-bank/qa-playbook.md` and `plans/_template.md` require Eval spec/evidence for AI/agent behavior changes.
  - Result: PASS
- Case: New downstream project uses agents.
  - Expected: Project Intake captures agent surfaces, good/failure rubrics, edge cases, golden prompts, pass threshold and eval owner.
  - Actual: `plans/_project_intake_template.md` includes `Agent / eval choices` with those fields.
  - Result: PASS
- Case: Non-agent task does not need eval.
  - Expected: template allows explicit non-applicability with reason.
  - Actual: `plans/_template.md` includes `Применимо: да | нет` and `Если eval не применим, причина`.
  - Result: PASS

### Deterministic checks

- `npm run lint` — PASS
- `npm run qa:agent` — PASS

### Rollback notes

- Если downstream-проекту нужен другой формат спеки, можно адаптировать `plans/_template.md` и `.memory-bank/product-charter.md` в downstream repo, сохранив обязательные charter anchors и baseline-инварианты starter core.

### Status

- PASS

## 2026-04-20 — Numbered cleanup choice

### Scope

- Cleanup gate в conveyor governance переведён на фиксированный формат `1. Удалить` / `2. Оставить`.
- В canonical sources и reference-docs зафиксирован mapping: `1` => delete / `--cleanup yes`, `2` => keep / `--cleanup no`.
- Тот же contract синхронизирован с `Agent_Const`.

### Deterministic checks

- `npm run lint` — PASS

### Status

- PASS

## 2026-04-20 — Worktree cleanup managed-root prune

### Scope

- Исправлен cleanup в `scripts/worktree-finish-core.mjs`: после `git worktree remove` теперь безопасно удаляется пустой managed task-root `~/.codex/worktrees/<taskId>`.
- Post-cleanup state/history запись переведена на стабильный repo root из task state, чтобы `--cleanup yes` не падал при запуске из самого task-worktree.
- В `tests/e2e/nightly-finish.test.mjs` добавлен reported-case guard на `--cleanup yes`.

### Deterministic checks

- `node --test tests/e2e/nightly-finish.test.mjs` — PASS

### Failures and fixes

- Reproduction: `git worktree remove` удалял сам worktree-path, но пустой каталог `~/.codex/worktrees/<taskId>` оставался на диске.
- Первый новый e2e-тест вскрыл связанный дефект: cleanup из task-worktree удалял active repo path до записи history, поэтому `appendHistoryEvent` падал на `git rev-parse --git-common-dir`.
- Fix: cleanup теперь делает empty-dir prune только внутри `$CODEX_HOME/worktrees`, а state/history после cleanup пишутся через стабильный `state.repoRoot` / `state.mainWorktreePath`.

### Rollback notes

- Если downstream-проекту нужно сохранять task-root для внешнего аудита, достаточно убрать вызов prune helper; history/state fix при этом лучше оставить, потому что он устраняет failure-path независимо от удаления каталога.

### Status

- PASS

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
