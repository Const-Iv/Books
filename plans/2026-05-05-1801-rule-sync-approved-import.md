Название задачи: Rule-sync approved import
Тип задачи: behavior-change
Дата создания: 2026-05-05 18:01

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Поддерживает цель starter: переносить reusable operational lessons из downstream-проектов в общую baseline-основу без product-specific деталей.
- Усиливает JTBD: новый проект получает готовые правила Project Intake, bootstrap и безопасной настройки проектных особенностей.

Цель изменения:
- Импортировать только согласованные владельцем rule-sync правила в starter canonical sources.
- Не переносить пропущенные QA/TRIZ evidence candidates как готовые правила.

Целевая аудитория проекта:
- Команды и downstream maintainers, которые стартуют новый проект от starter и хотят понятный безопасный baseline.
- Agent-operators, которые ведут bootstrap и rule-sync через Codex.

Продуктовая спека:

Проблема / JTBD:
- Пользователь согласовал конкретные правила для starter, но они должны попасть в canonical sources без дублей, product-specific деталей и сырого evidence.
- Он использует starter, чтобы новые downstream-проекты начинались с понятных Project Intake и bootstrap guardrails.

Целевая аудитория изменения:
- Владелец starter и будущие downstream maintainers.

Сценарии использования:
- Когда новый проект проходит Project Intake, owner видит, что миссия и видение формулируются только на уровне проекта.
- Когда проект ещё проверяет гипотезу, агент не считает архитектуру, стек, запуск, модель, зоны ответственности и возможности утверждёнными без явного согласования.
- Когда owner пишет `стартуем новый проект`, агент запускает bootstrap flow, а не выдаёт общий checklist.
- Когда отчёт смешивает источники, каждая запись показывает источник.
- Когда проекту нужны действия после публикации, способ выполнения согласуется в Project Intake конкретного проекта, а не зашивается в starter core.

Требования:
- Добавить/синхронизировать 5 согласованных правил в canonical sources и mirrors.
- Пропущенные candidates не импортировать.
- Не переносить Telegram/Gmail/macOS/Agent_Const details как mandatory starter behavior.
- Сохранить source traceability в плане и итоговом ответе.

Job Stories:
- Когда я переношу опыт downstream-проектов в starter, я хочу видеть только portable rule text, чтобы baseline не засорялся частными деталями.
- Когда новый проект стартует от starter, я хочу пройти Project Intake до feature work, чтобы важные решения были явно согласованы.

User Stories:
- Как владелец starter, я хочу импортировать только подтверждённые правила, чтобы starter развивался управляемо.
- Как downstream maintainer, я хочу, чтобы проектные настройки оставались моим выбором, а не обязательным core behavior starter.

Критерии приемки:
- В canonical sources есть правила про mission/vision, hypothesis-stage decisions, conversational bootstrap, source labels in multi-source reports и Project Intake для post-publish actions.
- Пропущенные candidate ids не добавлены как правила.
- Обязательные правила не остались только в `.cursorrules` или `CLAUDE.md`.

Метрика успеха:
- 10 approved candidate ids отражены в import evidence.
- 7 skipped candidate ids не импортированы как starter rules.
- `npm run qa:agent` проходит.

Ограничения / что нельзя сломать:
- Не менять `main` напрямую.
- Не переносить source-project symptoms, branch names, task ids or domain details into rule text.
- Не импортировать generated skill trees.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: Project Intake, rule-sync, conversational bootstrap
- Хороший ответ: агент запускает bootstrap skill на разговорный intent, не начинает feature work до approved intake, задаёт отдельное согласие на `skills:link -- --adopt`, объясняет rule-sync decisions human-first.
- Провал: агент выдаёт общий checklist, считает гипотезу утверждённой без Project Intake, переносит product-specific runtime commands в starter core или импортирует QA/TRIZ log как готовое правило.
- Критичные edge cases: `стартуем новый проект`; отчёт с несколькими источниками; downstream проект просит post-publish локальные действия; project still at hypothesis stage.
- Regression examples / golden prompts: `стартуем новый проект`; `проведи согласование rule-sync по последнему отчёту`; `после publish перезапускай локального агента`.
- Сравнение old vs new behavior: targeted text inspection plus existing deterministic QA.
- Minimum pass threshold: canonical sources contain approved portable invariants and no skipped evidence ids appear as new rules.
- Eval owner: Codex task implementer.

Техническая часть:

Область:
- Governance docs, memory-bank, mirrors and starter skills/docs as needed for parity.

Вне scope:
- Не запускать actual downstream import.
- Не менять rule-sync scanner/report logic.
- Не finish/merge/publish без QA.

Инвариант:
- Starter core содержит только portable baseline rules; product-specific behavior остаётся downstream adapter/profile or Project Intake choice.

Общий seam / точка системного изменения:
- Canonical governance sources: `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`; mirrors: `.cursorrules`, `CLAUDE.md`, `README.md`.

Публичные интерфейсы / контракты:
- Conversational bootstrap trigger.
- Project Intake gate wording.
- Rule-sync owner report expectations.

Допущения и выбранные по умолчанию решения:
- Пользователь уже подтвердил план и approved ids в чате.
- Близкие уже существующие правила не дублируются дословно; они уточняются до согласованного смысла.

План для агента:
- Синхронизировать точные правила в canonical sources.
- Проверить mirrors на parity.
- Запустить targeted checks и final `npm run qa:agent`.
- Записать QA results и changed files в этот план.

STAR:
- Situation: rule-sync report нашёл reusable rules в Assist и Agent_Const.
- Task: импортировать только owner-approved rules.
- Action: managed worktree, plan file, surgical governance edits, deterministic QA.
- Result: starter contains approved portable invariants without skipped evidence imports.

Profile data:
- Размер затронутой зоны: docs/governance only.
- Hook / script density: high around task conveyor and QA.
- Lint / typecheck risk: low; Markdown/text edits plus full QA.
- Perf / coverage / contracts / security сигналы: no runtime code change expected.
- Dirty-tree / environment leak сигналы: main clean; task worktree isolated.

Repo-RAG:
- [x] Проверить `plans/*`
- [x] Проверить `Docs/qa-implementation-log.md`
- [x] Проверить `Docs/change-ledger.md`
- [x] Проверить `.memory-bank/*`
- [x] Проверить `CODEX_MEMORY.md`

Формат исправления:
- [x] Systemic fix
- [ ] Exception

Шаги реализации (чекбоксы выполнения):
- [x] Создать managed task worktree.
- [x] Создать plan file.
- [x] Внести согласованные portable rules.
- [x] Проверить отсутствие skipped evidence imports и product-specific leakage.
- [x] Запустить QA и обновить план.

План QA:
Автоматические проверки:
- [x] `git diff --check`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run qa:agent`

Eval checks:
- [x] Text inspection: bootstrap trigger still uses `starter-project-bootstrap` and separate `--adopt` approval.
- [x] Text inspection: post-publish local actions are Project Intake choice, not starter core command.
- [x] Text inspection: skipped QA/TRIZ evidence ids are not imported as rules.

Ожидаемые результаты:
- [x] Все approved rules present in canonical sources.
- [x] Mirrors align with canonical sources where applicable.
- [x] QA PASS.

Риски / Откат:
- Риски: duplication across governance files; accidental product-specific wording.
- Шаги отката: revert this task branch before finish; no main source changes until publish gate.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: пользователь в чате после approval dry-run
Подтверждено в: 2026-05-05

Лог выполнения:
- [x] Начато: 2026-05-05 18:01
- [x] Завершено: 2026-05-05 18:09

Результаты QA:
Автоматические проверки:
- Команда: `git diff --check`
  - Ожидалось: нет whitespace/diff formatting ошибок.
  - Факт: PASS.
- Команда: `npm run typecheck`
  - Ожидалось: TypeScript checkJs проходит.
  - Факт: PASS.
- Команда: `npm test`
  - Ожидалось: unit/integration tests проходят.
  - Факт: PASS, 33 tests.
- Команда: `npm run qa:agent`
  - Ожидалось: lint, lint:fix:changed, lint recheck, typecheck, test, build проходят.
  - Факт: PASS; `lint:fix:changed` normalized 14 lintable files, затем recheck/typecheck/test/build PASS.

Eval results:
- Case: `стартуем новый проект`
  - Ожидалось: правило запускает `starter-project-bootstrap`, создаёт отдельную рабочую папку из чистого `main`, подключает skills и не начинает feature work до согласования intake.
  - Факт: правило есть в `AGENTS.md`, `.memory-bank/code-rules.md`, `.memory-bank/project-context.md`, `CODEX_MEMORY.md`, README and mirrors.
  - PASS/FAIL: PASS.
- Case: `после publish перезапускай локального агента`
  - Ожидалось: starter не зашивает локальную команду, а отправляет решение в Project Intake конкретного проекта.
  - Факт: правило добавлено в canonical docs and Project Intake template.
  - PASS/FAIL: PASS.
- Case: skipped QA/TRIZ evidence ids
  - Ожидалось: skipped ids не импортированы как starter rules.
  - Факт: targeted search не нашёл skipped ids / skipped problem titles в changed rule surfaces.
  - PASS/FAIL: PASS.

Изменённые файлы:
- `.cursorrules`
- `.memory-bank/architecture-map.md`
- `.memory-bank/code-rules.md`
- `.memory-bank/index.md`
- `.memory-bank/product-charter.md`
- `.memory-bank/project-context.md`
- `AGENTS.md`
- `CLAUDE.md`
- `CODEX_MEMORY.md`
- `README.md`
- `plans/2026-05-05-1801-rule-sync-approved-import.md`
- `plans/_project_intake_template.md`
- `skills/starter-project-bootstrap/SKILL.md`
- `skills/starter-rule-sync/SKILL.md`
