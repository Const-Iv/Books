Название задачи: Capability profiles для Project Intake и QA правил
Тип задачи: behavior-change
Дата создания: 2026-05-01 11:24

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Задача усиливает миссию и `JTBD` starter: новый проект получает переносимую операционную основу с первого дня, а типовые продуктовые развилки фиксируются заранее без ручной сборки governance заново.
- Задача сохраняет видение starter как baseline: auth, платежи, кредиты, аналитика, i18n, jobs и API-документация добавляются как downstream capability decisions, а не как hardcoded core behavior.

Цель изменения:
- Добавить в starter правила, которые помогают downstream owner'у заранее выбрать важные продуктовые контуры и safety checks, не импортируя чужие stack/provider-specific рецепты как обязательные правила.

Целевая аудитория проекта:
- Технические и продуктовые лиды, которые отвечают за переносимую операционную основу.
- Инженеры и agent-operators, которые ведут downstream bootstrap через Codex/worktree conveyor.
- Downstream maintainers, которые подключают starter как baseline и добавляют продуктовую специфику поверх него.

Продуктовая спека:

Проблема / JTBD:
- Пользователь пытается стартовать новый проект с безопасной основой, но сейчас Project Intake хорошо покрывает governance и QA, а типовые capability decisions остаются неявными.
- Он использует starter, чтобы заранее не пропустить важные решения по входу пользователя, платежам, переводам, аналитике, долгим задачам и API-документации.

Целевая аудитория изменения:
- Owner нового downstream-проекта и агент, который помогает заполнить Project Intake.

Сценарии использования:
- Когда downstream-проекту нужен вход пользователя, owner выбирает auth policy и safety checks до feature work.
- Когда downstream-проекту нужны платежи или кредиты, owner фиксирует webhook verification, idempotency и audit trail до реализации.
- Когда downstream-проекту нужны переводы, аналитика, долгие операции или API, owner видит обязательные вопросы и QA expectations до выбора stack/provider.

Требования:
- Project Intake содержит optional capability decisions с owner approval.
- Canonical rules запрещают переносить product-specific providers, mandatory locales или конкретный stack в starter core.
- QA playbook усиливает test quality checklist без замены manifest-driven critical coverage на line-percentage rule.
- Mirrors не содержат уникальных обязательных правил.

Job Stories:
- Когда я запускаю новый downstream-проект, я хочу увидеть важные capability decisions заранее, чтобы не закладывать небезопасные или непереносимые решения в первый день.
- Когда я выбираю auth, платежи, аналитику или i18n, я хочу понять обязательные safety questions, чтобы реализация не зависела от случайного рецепта из внешнего репозитория.

User Stories:
- Как product/tech lead, я хочу Project Intake с optional capability profiles, чтобы быстро согласовать нужные продуктовые контуры без утяжеления starter core.
- Как downstream maintainer, я хочу видеть, какие внешние правила не импортируются как обязательные, чтобы baseline оставался переносимым.

Критерии приемки:
- В `plans/_project_intake_template.md` есть блок capability decisions с auth, payments, credits, analytics/consent, i18n, async jobs, API docs, service layout и runtime-specific choices.
- В `.memory-bank/code-rules.md` зафиксированы portable safety invariants и запрет hardcode provider/stack defaults в starter core.
- В `.memory-bank/qa-playbook.md` добавлен behavior-focused test quality checklist.
- `AGENTS.md`, `CODEX_MEMORY.md`, `README.md`, `CLAUDE.md`, `.cursorrules` и reference blueprint синхронизированы без уникальных mirror-only rules.

Метрика успеха:
- Новый downstream intake может пройти capability decisions без `TBD` и без выбора product-specific provider по умолчанию.
- Поиск по canonical/mirror файлам показывает, что capability rules не живут только в mirror.

Ограничения / что нельзя сломать:
- Не мандатить Next.js, React, Google OAuth, YooKassa, LemonSqueezy, `ru/en/es/pt`, Python `beartype` или database queue как universal core rules.
- Не ослаблять текущий conveyor, QA, rule-sync/rule-share и product charter gates.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: Project Intake Gate, Product Charter gate, downstream bootstrap recommendations
- Хороший ответ: агент предлагает owner'у заполнить capability decisions only-if-applicable, рекомендует charter-safe переносимые варианты и не выдаёт provider-specific рецепты как core defaults.
- Провал: агент молча выбирает Next.js, Google OAuth, YooKassa/LemonSqueezy, фиксированные locales или token storage в `localStorage` как mandatory baseline.
- Критичные edge cases: проект без UI; проект без платежей; проект с API без публичного runtime; Python-only проект; мультиязычность не требуется; платежи есть, но provider выбирается owner'ом.
- Regression examples / golden prompts:
  - "Стартуем новый проект с API, но без UI и платежей"
  - "Добавь Google OAuth по умолчанию во все новые проекты"
  - "Нужны платежи, какой provider ставим в core starter?"
  - "Проект только на русском, надо ли делать ru/en/es/pt?"
- Сравнение old vs new behavior: old behavior спрашивает общие stack/QA choices; new behavior дополнительно спрашивает applicable capability decisions и отфильтровывает product-specific defaults через charter.
- Minimum pass threshold: 4/4 golden prompts получают charter-safe recommendation без mandatory provider/stack hardcode.
- Eval owner: project owner / Codex operator
- Если eval не применим, причина: -

Техническая часть:

Область:
- Governance docs, Project Intake template, QA playbook, mirrors and reference docs.

Вне scope:
- Изменения scripts, package commands, runtime behavior, generated skill trees, provider-specific implementation templates.

Инвариант:
- Starter core хранит переносимые baseline decisions; product-specific capabilities выбираются и подтверждаются в downstream через adapters/profiles.

Общий seam / точка системного изменения:
- `plans/_project_intake_template.md` как входная точка downstream bootstrap; `.memory-bank/code-rules.md` и `.memory-bank/qa-playbook.md` как canonical rules.

Публичные интерфейсы / контракты:
- Project Intake sections and canonical governance docs.

Допущения и выбранные по умолчанию решения:
- Chat-план пользователя считается approval на внедрение scope v2.
- Capability decisions будут optional unless applicable, чтобы не блокировать проекты без соответствующего продукта.

План для агента:
- Обновить intake template.
- Обновить canonical rules and QA playbook.
- Синхронизировать AGENTS, README, CODEX_MEMORY, CLAUDE and `.cursorrules`.
- Обновить reference blueprint.
- Запустить deterministic checks и зафиксировать результаты.

STAR:
- Situation: внешний репозиторий содержит полезные, но product-specific правила.
- Task: усилить starter без дублей и без hardcode чужого stack/provider.
- Action: переписать идеи как portable capability profiles и QA guardrails.
- Result: downstream owner получает более полный intake, а starter core остаётся переносимым.

Profile data:
- Размер затронутой зоны: docs/governance templates only.
- Hook / script density: scripts не меняются.
- Lint / typecheck risk: низкий, но repo lint может проверять docs conventions.
- Perf / coverage / contracts / security сигналы: security-sensitive rules по auth/payments/credits усиливаются.
- Dirty-tree / environment leak сигналы: исходно task branch clean; изменения только tracked docs.

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
- Rollback path: revert governance docs diff.
- План снятия долга: -

Шаги реализации (чекбоксы выполнения):
- [x] Обновить Project Intake capability decisions.
- [x] Обновить canonical code/QA rules and reference docs.
- [x] Синхронизировать mirrors and operational memory.
- [x] Прогнать deterministic checks.

План QA:
Автоматические проверки:
- [x] `npm run lint`
- [x] `npm run qa:agent`

Eval checks (если применимо):
- [x] Golden prompts manual rubric against updated intake/rules.

Ручные / сценарные проверки:
- [x] Проверить, что product-specific providers не стали mandatory core defaults.
- [x] Проверить, что новые правила есть в canonical sources и не живут только в mirrors.

Ожидаемые результаты:
- [x] Docs lint/QA проходят.
- [x] Capability rules синхронизированы.

Риски / Откат:
- Риски: избыточный intake может перегрузить owner'а; mitigation — секция marked optional if applicable.
- Шаги отката: revert changed docs and rerun QA.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: пользователь в чате
Подтверждено в: 2026-05-01

Лог выполнения:
- [x] Начато: 2026-05-01 11:24
- [x] Завершено: 2026-05-01 11:29

Результаты QA:
Автоматические проверки:
- Команда: `npm run lint`
  - Ожидалось: repo-lint проходит на governance docs.
  - Факт: PASS; `repo-lint: ok (96 files checked)`.
- Команда: `npm run qa:agent`
  - Ожидалось: fixed gate проходит `lint -> lint:fix:changed -> lint -> typecheck -> test -> build`.
  - Факт: PASS; lint, lint:fix:changed, lint recheck, typecheck, 29 tests and build passed.

Ручные / сценарные проверки:
- Проверка: `rg` по canonical/mirror файлам на capability wording.
  - Ожидалось: правила есть в canonical sources и mirrors.
  - Факт: PASS; `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`, `README.md`, `CLAUDE.md`, `.cursorrules`, intake template and reference blueprint contain capability rules.
- Проверка: `rg` по изменённым rule surfaces на provider-specific external defaults.
  - Ожидалось: нет mandatory YooKassa/LemonSqueezy/Google OAuth/localStorage/ru-en-es-pt/Next.js/develop defaults.
  - Факт: PASS; совпадений нет.

Eval results:
- Case: "Стартуем новый проект с API, но без UI и платежей"
  - Ожидалось: agent asks API docs capability questions and marks UI/payments not applicable.
  - Факт: Project Intake has API documentation block and all capability blocks have explicit applicable/not applicable status.
  - PASS/FAIL: PASS
- Case: "Добавь Google OAuth по умолчанию во все новые проекты"
  - Ожидалось: agent rejects mandatory provider default and routes identity provider choice to downstream adapter/profile.
  - Факт: canonical rules forbid concrete identity provider as starter core default.
  - PASS/FAIL: PASS
- Case: "Нужны платежи, какой provider ставим в core starter?"
  - Ожидалось: agent asks owner to choose provider selection rule and keeps provider-specific logic out of core.
  - Факт: Project Intake has payments provider selection rule; canonical rules forbid concrete payment providers as mandatory defaults.
  - PASS/FAIL: PASS
- Case: "Проект только на русском, надо ли делать ru/en/es/pt?"
  - Ожидалось: agent does not mandate fixed locales and records locale policy only if i18n applies.
  - Факт: i18n block asks supported locales/fallback; canonical rules forbid fixed locales as starter core default.
  - PASS/FAIL: PASS

Изменённые файлы:
- AGENTS.md
- CLAUDE.md
- CODEX_MEMORY.md
- README.md
- .cursorrules
- .memory-bank/architecture-map.md
- .memory-bank/code-rules.md
- .memory-bank/index.md
- .memory-bank/product-charter.md
- .memory-bank/project-context.md
- .memory-bank/qa-playbook.md
- Docs/qa-implementation-log.md
- plans/2026-05-01-1124-capability-intake-rules.md
- plans/_project_intake_template.md
- plans/reference/new-project-blueprint.md
