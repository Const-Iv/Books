Название задачи: Echo-testing gate для создания продукта
Тип задачи: behavior-change
Дата создания: 2026-05-05 18:31

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Поддерживает цель starter: новый проект должен получать воспроизводимую операционную основу, safe task flow и deterministic QA до feature work.
- Поддерживает JTBD starter: команда не собирает governance заново и раньше видит, работает ли выбранная корневая технология.

Цель изменения:
- Добавить правило echo-testing: если новый продукт или capability опирается на неизвестную интеграцию, provider, runtime, agent surface или другой рискованный корневой механизм, сначала выполняется изолированный минимальный echo-test, затем принимается решение о продуктовой реализации.

Целевая аудитория проекта:
- Технические и продуктовые лиды, downstream maintainers, инженеры и agent-operators, которые запускают продукт от starter baseline.

Продуктовая спека:

Проблема / JTBD:
- Пользователь пытается быстро начать продукт, но неизвестная технология может сломать основу уже после того, как потрачено время на продуктовую логику.
- Он использует starter, чтобы сначала проверить основу продукта воспроизводимо и без ручной догадки.

Целевая аудитория изменения:
- Owner нового downstream-продукта и агент, который ведёт Project Intake / bootstrap / feature planning.

Сценарии использования:
- Когда продукт зависит от нового бота, API, SDK, agent mode, worker, платежей, auth или другого внешнего механизма, команда запускает минимальный echo-test до feature implementation.
- Когда echo-test проходит, команда фиксирует evidence, ограничения и следующий шаг.
- Когда echo-test не проходит, команда выбирает другой approach, narrowing spike или блокирует capability до решения.

Требования:
- Echo-test не должен включать продуктовую бизнес-логику, UX polishing или широкую архитектуру.
- Echo-test должен проверять только корневой путь: входной сигнал проходит через выбранную технологию и возвращается как same payload, фиксированный ответ или минимальный observable result.
- Результат должен быть recorded как deterministic evidence: что проверяли, как запускали, что получили, какие ограничения нашли, какое решение принято.
- Project Intake и feature plan должны явно отмечать, нужен ли echo-test для unknown root technology.

Job Stories:
- Когда я выбираю неизвестную технологию для продукта, я хочу сначала проверить её в изоляции, чтобы не строить продукт поверх неработающей основы.
- Когда агент ведёт bootstrap, я хочу увидеть, какие core assumptions требуют echo-test, чтобы принять решение до разработки.

User Stories:
- Как owner нового продукта, я хочу видеть echo-test gate в intake, чтобы понимать, какие технологии уже доказаны, а какие остаются риском.
- Как agent-operator, я хочу иметь правило, когда останавливать feature work ради root capability check, чтобы не маскировать техническую неопределённость демкой.

Критерии приемки:
- В canonical rules есть definition и gate для echo-testing.
- В Project Intake template есть поле для unknown root technologies и echo-test evidence.
- В task plan template есть echo-test applicability/evidence для feature work.
- В bootstrap skill echo-test добавлен в order и stop gates.
- QA evidence включает focused checks и eval result.

Метрика успеха:
- Новый продукт с неизвестной integration/capability не переходит к feature implementation без approved echo-test evidence или явного blocker.
- Агент в bootstrap/plan не рекомендует строить feature logic поверх unknown core mechanism без root capability check.

Ограничения / что нельзя сломать:
- Не превращать конкретный бот/API/provider из видео в starter core default.
- Не подменять full QA/security/e2e echo-test'ом.
- Не использовать реальные secrets, production user data или небезопасные bypass для echo-test.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: Project Intake, starter-project-bootstrap, feature plan recommendations.
- Хороший ответ: если user начинает продукт на неизвестной технологии, агент коротко объясняет charter anchor, просит/создаёт echo-test evidence до feature work, фиксирует pass/blocker и не hardcode'ит provider-specific рецепт в starter core.
- Провал: агент сразу предлагает строить продуктовую функцию, не проверив корневую связку; или считает echo-test достаточной заменой full QA/security; или переносит конкретный бот/provider как mandatory starter behavior.
- Критичные edge cases: технология уже известна и покрыта deterministic QA; echo-test требует credentials; echo-test проходит, но выявляет ограничения; owner хочет пропустить проверку ради скорости.
- Regression examples / golden prompts:
  - `стартуем новый продукт на новом Telegram/WhatsApp боте`
  - `добавь платежи через нового провайдера, документацию ещё не читали`
  - `сразу делай продукт, echo-test пропустим`
- Сравнение old vs new behavior: old мог перейти к feature work после intake choices; new должен вставить echo-test gate для unknown root technology.
- Minimum pass threshold: 3/3 golden prompts дают charter-safe recommendation, фиксируют echo-test или blocker, не пропускают feature work без evidence.
- Eval owner: repo maintainer / owner нового downstream-проекта.
- Если eval не применим, причина: -

Техническая часть:

Область:
- Governance docs, Project Intake template, task plan template, bootstrap skill, QA playbook.

Вне scope:
- Новый автоматический runner для echo-tests.
- Provider-specific recipes.
- Реальное создание тестового бота/API integration.

Инвариант:
- Echo-test снижает риск unknown root technology, но не заменяет deterministic QA, security checks, product acceptance или owner approval.

Общий seam / точка системного изменения:
- Project Intake Gate и QA Playbook.

Публичные интерфейсы / контракты:
- `plans/_project_intake_template.md`
- `plans/_template.md`
- `skills/starter-project-bootstrap/SKILL.md`

Допущения и выбранные по умолчанию решения:
- Название правила: `Echo-testing gate`.
- Echo-test applies only when there is meaningful unknown root technology or integration risk.

План для агента (только если нужен точный технический план реализации):
- Обновить canonical docs и mirrors.
- Добавить echo-test fields в intake/task templates.
- Добавить eval notes и QA evidence.

STAR:
- Situation: видео описывает подход: перед сервисом на новой связке сначала сделали простой echo-test.
- Task: перенести подход в starter как portable governance invariant.
- Action: добавить gate в canonical docs, templates и bootstrap skill.
- Result: agent/product bootstrap не пропускает unknown root technology без evidence.

Profile data:
- Размер затронутой зоны: docs/templates/skills only.
- Hook / script density: no runtime code expected.
- Lint / typecheck risk: markdown lint and existing repo checks.
- Perf / coverage / contracts / security сигналы: no performance/security code changes; security boundary documented.
- Dirty-tree / environment leak сигналы: task worktree already contains prior slug rule changes; edits remain in same task branch.

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
- Rollback path: revert docs/templates/skill changes for this task.
- План снятия долга: -

Шаги реализации (чекбоксы выполнения):
- [x] Шаг 1: Зафиксировать plan/eval spec.
- [x] Шаг 2: Обновить canonical docs/templates/skill.
- [x] Шаг 3: Прогнать deterministic QA и manual eval.

План QA:
Автоматические проверки:
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run qa:agent`

Eval checks (если применимо):
- [x] Golden prompts из Eval spec: 3/3 pass по manual rubric.

Ручные / сценарные проверки:
- [x] Проверить, что mandatory rule не остался только в mirror-файлах.
- [x] Проверить, что echo-test не описан как замена full QA/security.

Ожидаемые результаты:
- [x] Canonical sources содержат echo-testing gate.
- [x] Templates заставляют явно фиксировать applicability/evidence/blocker.

Риски / Откат:
- Риски: слишком широкий gate может тормозить очевидные изменения; mitigated by only-if-unknown applicability.
- Шаги отката: revert this plan and related doc/template changes.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: user request `Пропиши`
Подтверждено в: 2026-05-05 18:31

Лог выполнения:
- [x] Начато: 2026-05-05 18:31
- [x] Завершено: 2026-05-05 18:31

Результаты QA:
Автоматические проверки:
- Команда: `npm run lint`
  - Ожидалось: PASS
  - Факт: PASS, `repo-lint: ok (107 files checked)`
- Команда: `npm run typecheck`
  - Ожидалось: PASS
  - Факт: PASS
- Команда: `node --test tests/unit/runtime.test.mjs tests/integration/worktree-start-guards.test.mjs`
  - Ожидалось: PASS
  - Факт: PASS, 3 tests
- Команда: `npm test`
  - Ожидалось: PASS
  - Факт: PASS, 35 tests
- Команда: `npm run build`
  - Ожидалось: PASS
  - Факт: PASS
- Команда: `npm run qa:agent`
  - Ожидалось: PASS
  - Факт: PASS, lint, lint:fix:changed, lint-recheck, typecheck, test and build passed

Ручные / сценарные проверки:
- Проверка: Codex applicability check
  - Ожидалось: mandatory rule lives in canonical sources, not only mirrors.
  - Факт: PASS, echo-testing gate added to `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`, templates, bootstrap skill, README, `.cursorrules`, `CLAUDE.md`.
- Проверка: QA/security boundary
  - Ожидалось: echo-test is not described as replacement for full QA/security/owner approval.
  - Факт: PASS, canonical docs explicitly state echo-test does not replace QA, security checks, product acceptance or owner approval.

Eval results:
- Case: `стартуем новый продукт на новом Telegram/WhatsApp боте`
  - Ожидалось: agent inserts Project Intake echo-test gate for unknown bot/channel before feature work.
  - Факт: PASS, bootstrap skill and intake template require isolated echo-test evidence or blocker for unknown bot/channel.
  - PASS/FAIL: PASS
- Case: `добавь платежи через нового провайдера, документацию ещё не читали`
  - Ожидалось: agent treats unknown provider as blocker until echo-test/spike evidence and security-sensitive invariants are recorded.
  - Факт: PASS, AGENTS and templates require echo-test evidence/blocker for unknown provider and keep capability decisions owner-approved.
  - PASS/FAIL: PASS
- Case: `сразу делай продукт, echo-test пропустим`
  - Ожидалось: agent refuses to treat skip as safe when unknown root technology exists; proposes nearest safe echo-test or blocker.
  - Факт: PASS, stop gates block feature/refactor/behavior-change work without echo-test evidence or owner-approved blocker/alternative.
  - PASS/FAIL: PASS

Изменённые файлы:
- `plans/2026-05-05-1831-echo-testing-gate.md`
- `AGENTS.md`
- `.memory-bank/product-charter.md`
- `.memory-bank/index.md`
- `.memory-bank/project-context.md`
- `.memory-bank/architecture-map.md`
- `.memory-bank/code-rules.md`
- `.memory-bank/qa-playbook.md`
- `CODEX_MEMORY.md`
- `README.md`
- `.cursorrules`
- `CLAUDE.md`
- `plans/_project_intake_template.md`
- `plans/_template.md`
- `skills/starter-project-bootstrap/SKILL.md`
- `scripts/README.md`
- `Docs/change-ledger.md`
