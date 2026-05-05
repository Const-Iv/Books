Название задачи: Rule share registry and missing-rule sync
Тип задачи: behavior-change
Дата создания: 2026-05-05 18:50

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Поддерживает цель starter как переносимой операционной основы: выбранные downstream проекты получают недостающие reusable правила без ручной сверки.
- Усиливает JTBD: команда не собирает governance заново и не держит проекты в рассинхроне.
- Сохраняет downstream product specificity: продуктовые charter/adapters/profiles не копируются из starter.

Цель изменения:
- Усилить `$starter-rule-share`, чтобы он сравнивал конкретные starter rules с allowlist-проектами и готовил перенос только недостающих правил.

Целевая аудитория проекта:
- Технические и продуктовые лиды, отвечающие за переносимую операционную основу.
- Downstream maintainers, которые подключают starter как baseline.
- Agent-operators, которые ведут перенос через managed task worktrees and QA.

Продуктовая спека:

Проблема / JTBD:
- Пользователь пытается держать выбранные проекты на единых reusable правилах, но сейчас sharing видит только статус проекта, а не конкретные отсутствующие правила.
- Он использует starter, чтобы правило, найденное в одном проекте и подтверждённое в starter, затем безопасно попало в остальные выбранные проекты.

Целевая аудитория изменения:
- Владелец starter и downstream maintainers выбранных active projects.

Сценарии использования:
- Когда starter получил правило A из проекта 1 и правило B из проекта 2, `$starter-rule-share` видит, что проект 1 уже имеет A, но не имеет B, и готовит перенос B.
- Когда проект 2 уже имеет B, но не имеет A, `$starter-rule-share` готовит перенос A.
- Когда правило похоже на существующее, но совпадение не надёжное, проект получает ручную проверку вместо автодобавления.
- Когда проект dirty или не starter-based, он не меняется.

Требования:
- Добавить machine-readable registry reusable starter rules.
- Rule-share scan должен вычислять present/missing/manual/blocked rules per project.
- Rule-share report должен показывать конкретные отсутствующие правила по проектам.
- Rule-share apply-plan должен включать в task seed только missing rules.
- One-run skill workflow должен автоматически работать только по allowlist/approved ready projects и останавливаться перед finish/merge/publish.

Job Stories:
- Когда starter получил новое reusable правило, я хочу видеть, в каких выбранных проектах его нет, чтобы раздать его без дублей.
- Когда правило уже есть в проекте, я хочу, чтобы share не добавлял его повторно.
- Когда совпадение неочевидно, я хочу остановку на ручную проверку, чтобы не засорить downstream проект.

User Stories:
- Как владелец starter, я хочу registry правил, чтобы sharing сравнивал смысловые правила, а не только файлы целиком.
- Как downstream maintainer, я хочу получить только недостающие reusable правила, чтобы мои продуктовые правила не перетирались.
- Как agent-operator, я хочу task seed с точными missing rules, чтобы downstream import был проверяемым.

Критерии приемки:
- `.memory-bank/starter-rule-registry.json` существует и содержит approved reusable rules.
- `rule-share:scan` добавляет `presentRules`, `missingRules`, `presentUnregisteredRules`, `blockedRules`.
- `rule-share:report` группирует вывод по проектам и показывает rule title/text.
- `rule-share:apply-plan` создаёт task seed только с missing rules.
- `$starter-rule-share` описывает registry-based sharing.
- `$starter-rule-import` требует обновлять registry после новых imports.
- QA проходит.

Метрика успеха:
- Unit tests покрывают A/B present/missing сценарий.
- Rule-share report можно использовать как owner-facing список: что есть, чего нет, что добавить.

Ограничения / что нельзя сломать:
- Не менять names `rule-share:*`.
- Не делать direct edits в downstream main worktree.
- Не publish/merge downstream changes автоматически.
- Не копировать starter mission/vision/product charter в downstream.
- Не импортировать generated skill trees, secrets, private notes, runtime state.

Echo-testing applicability:
- Применимо: нет
- Unknown root technology / integration / provider / runtime / agent surface: -
- Minimal echo-test scenario: -
- Expected minimal observable result: -
- Evidence path / actual result: -
- Decision: proceed
- Если echo-test не применим, причина: изменение касается существующего Node CLI/governance workflow, новая внешняя технология не добавляется.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: `$starter-rule-share`, rule-share owner report, one-run sharing workflow.
- Хороший ответ: агент использует `$starter-rule-share`, читает registry, показывает per-project present/missing/manual rules, автоматически работает только по allowlist ready projects, создаёт downstream task worktrees, запускает QA и останавливается перед publish/merge.
- Провал: агент копирует файлы целиком, дублирует уже существующее правило, переносит product-specific charter, редактирует dirty/downstream main или публикует без отдельного gate.
- Критичные edge cases: project has rule text but no registry; project has similar but not exact text; dirty project; no allowlist; submodule-based project; missing managed task flow.
- Regression examples / golden prompts: `поделись новыми правилами starter с выбранными проектами`; `раздай правило A/B по проектам`; `обнови все проекты автоматически`; `почему проект manual-review`.
- Сравнение old vs new behavior: old behavior reasoned at project level; new behavior reasons at rule level.
- Minimum pass threshold: 5/5 manual eval cases PASS.
- Eval owner: Codex operator.
- Если eval не применим, причина: -

Техническая часть:

Область:
- `.memory-bank/starter-rule-registry.json`
- `scripts/rule-share.mjs`
- `tests/unit/rule-share.test.mjs`
- `skills/starter-rule-share/SKILL.md`
- `skills/starter-rule-import/SKILL.md`
- governance/docs mirrors

Вне scope:
- Публикация downstream изменений.
- Direct edits в allowlist проектах в рамках этой starter implementation task.
- Переименование `rule-share:*`.

Инвариант:
- Starter shares only reusable baseline rules; downstream product-specific wording is preserved.

Общий seam / точка системного изменения:
- `scripts/rule-share.mjs` becomes the deterministic registry-aware comparison and task-seed layer.

Публичные интерфейсы / контракты:
- Registry schema: `schemaVersion`, `updatedAt`, `rules[]`.
- Rule entry: `id`, `title`, `text`, `targetFiles`, `requiredFragments`, `source`, `sharePolicy`.
- Snapshot project fields: `presentRules`, `missingRules`, `presentUnregisteredRules`, `blockedRules`.

Допущения и выбранные по умолчанию решения:
- `$starter-rule-share` is the third skill; no new skill name.
- Default auto behavior applies only to allowlist ready projects and still stops before publish/merge.
- Exact text or all required fragments count as present; partial fragment match becomes manual review.

План для агента (только если нужен точный технический план реализации):
- Add starter rule registry.
- Extend rule-share scanner/report/apply-plan.
- Update skill and governance docs.
- Add focused unit tests.
- Run targeted and full QA.

STAR:
- Situation: starter has reusable rules, but share sees projects, not individual missing rules.
- Task: make sharing rule-aware and safe.
- Action: registry + scanner/report/apply-plan updates.
- Result: selected projects receive only missing reusable rules.

Profile data:
- Размер затронутой зоны: medium, one script seam + skill/docs/tests.
- Hook / script density: high around `rule-share:*` and `qa:agent`.
- Lint / typecheck risk: medium due JSDoc schema changes.
- Perf / coverage / contracts / security сигналы: no secrets; contract change covered by unit tests.
- Dirty-tree / environment leak сигналы: source main clean; implementation in managed worktree.

Repo-RAG:
- [x] Проверить `plans/*`
- [x] Проверить `Docs/qa-implementation-log.md`
- [x] Проверить `Docs/change-ledger.md`
- [x] Проверить `.memory-bank/*`
- [x] Проверить `CODEX_MEMORY.md`

Формат исправления:
- [x] Systemic fix
- [ ] Exception

Exception (если применимо):
- Причина: -
- Риск: -
- Rollback path: revert task branch before publish or revert commit.
- План снятия долга: -

Шаги реализации (чекбоксы выполнения):
- [x] Добавить registry file.
- [x] Обновить `scripts/rule-share.mjs`.
- [x] Обновить tests.
- [x] Обновить skills/governance docs.
- [x] Запустить QA and eval.

План QA:
Автоматические проверки:
- [x] `node --test tests/unit/rule-share.test.mjs`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run qa:agent`
- [x] `npm run qa:coverage:critical`

Eval checks (если применимо):
- [x] Prompt: `поделись новыми правилами starter с выбранными проектами`.
- [x] Scenario: project has A but misses B.
- [x] Scenario: dirty project.
- [x] Scenario: similar rule manual-review.
- [x] Scenario: apply-plan missing-only task seed.

Ручные / сценарные проверки:
- [x] Проверить report wording.
- [x] Codex applicability check.

Ожидаемые результаты:
- [x] Registry-aware scan works.
- [x] Report is owner-readable.
- [x] Apply-plan includes missing rules only.
- [x] QA PASS.

Риски / Откат:
- Риски: false negative/positive rule matching; registry drift if future imports forget to update registry.
- Шаги отката: revert registry/script/tests/docs changes.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: owner in chat, "PLEASE IMPLEMENT THIS PLAN"
Подтверждено в: 2026-05-05

Лог выполнения:
- [x] Начато: 2026-05-05 18:50
- [x] Завершено: 2026-05-05 19:09

Результаты QA:
Автоматические проверки:
- Команда: `node --test tests/unit/rule-share.test.mjs`
  - Ожидалось: PASS
  - Факт: PASS, 13 tests
- Команда: `npm run typecheck`
  - Ожидалось: PASS
  - Факт: PASS
- Команда: `npm test`
  - Ожидалось: PASS
  - Факт: PASS, 41 tests
- Команда: `npm run qa:agent`
  - Ожидалось: PASS
  - Факт: PASS, stages `lint`, `lint:fix:changed`, `lint-recheck`, `typecheck`, `test`, `build`
- Команда: `npm run qa:coverage:critical`
  - Ожидалось: PASS
  - Факт: PASS, 8 critical modules validated
- Команда: `git diff --check`
  - Ожидалось: PASS
  - Факт: PASS

Eval results:
- Prompt `поделись новыми правилами starter с выбранными проектами`: PASS. `$starter-rule-share` now describes registry-based rule sharing, allowlist-only targets, managed downstream worktrees, QA, and stop-before-publish.
- Project has A but misses B: PASS. Unit test `rule-share scanner marks project 1 rule A present and rule B missing`.
- Project has B but misses A: PASS. Unit test `rule-share scanner marks project 2 rule B present and rule A missing`.
- Rule text present but no downstream registry: PASS. Unit test classifies as `presentUnregistered`, not `missing`.
- Dirty project: PASS. Unit test blocks dirty project and apply-plan rejects it.
- Manual-review rule: PASS. Unit test keeps `sharePolicy = manual_review` out of automatic imports.
- Apply-plan missing-only task seed: PASS. Unit test verifies seed imports only missing rule text.

Changed files:
- `.memory-bank/starter-rule-registry.json`
- `scripts/rule-share.mjs`
- `tests/unit/rule-share.test.mjs`
- `scripts/lib/runtime.mjs`
- `skills/starter-rule-share/SKILL.md`
- `skills/starter-rule-import/SKILL.md`
- `AGENTS.md`
- `.memory-bank/index.md`
- `.memory-bank/project-context.md`
- `.memory-bank/architecture-map.md`
- `.memory-bank/code-rules.md`
- `CODEX_MEMORY.md`
- `README.md`
- `scripts/README.md`
- `.cursorrules`
- `CLAUDE.md`
