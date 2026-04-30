Название задачи: Starter rule sync import
Тип задачи: behavior-change
Дата создания: 2026-04-30 11:03

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Поддерживает переносимую операционную основу для новых проектов: правила из downstream опыта возвращаются в starter только как общие governance-инварианты, без продуктовой специфики.

Цель изменения:
- Внести подтвержденные reusable правила из rule-sync отчета в canonical sources starter так, чтобы будущие команды получали понятные правила QA, отчетов, charter-anchored ответов и safe task flow.

Целевая аудитория проекта:
- Технические и продуктовые лиды, инженеры и agent-operators, которые используют starter как базовую основу для нового репозитория.

Продуктовая спека:

Проблема / JTBD:
- Пользователь пытается переносить полезные lessons из downstream проектов в starter, но сейчас часть правил живет только как scan evidence и требует ручной переписки.
- Он использует продукт, чтобы новые проекты сразу получали понятные правила работы и воспроизводимые проверки.

Целевая аудитория изменения:
- Maintainer starter и downstream maintainers, которые принимают rule-sync решения.

Сценарии использования:
- Когда rule-sync находит reusable lesson, maintainer видит portable правило и может импортировать его без продуктовых деталей.
- Когда агент готовит отчет или product proposal, он начинает с charter anchor и пишет понятный вывод, а не только технический summary.

Требования:
- Импортировать только approved ids: `rs-078a07b2bb`, `rs-1b30b914c2`, `rs-5057973b7c`, `rs-63886dee70`, `rs-8196685fbe`, `rs-a6c6bc3a11`, `rs-4d517eb61f`, `rs-ea2b08be89`.
- Не переносить GanttBB, Agent_Const, Telegram или другие product-specific детали.
- Синхронизировать правила в `AGENTS.md`, `.memory-bank/code-rules.md`, `.memory-bank/qa-playbook.md` и `CODEX_MEMORY.md` по необходимости.

Job Stories:
- Когда downstream опыт указывает на повторяемое правило, я хочу видеть его как baseline-инвариант, чтобы starter улучшался без hardcode конкретного продукта.
- Когда я читаю owner-facing отчет, я хочу сначала понять смысл и решение, чтобы быстро одобрить или отклонить импорт.

User Stories:
- Как maintainer starter, я хочу импортировать только переносимые правила, чтобы core baseline оставался reusable.
- Как agent-operator, я хочу иметь правила для понятных отчетов и QA evidence, чтобы не разбирать сырой technical output.

Критерии приемки:
- Approved правила добавлены как portable governance rules.
- Product-specific детали не попали в starter core.
- Owner-facing report rule требует краткий смысл, решение и traceability без placeholders.
- QA/TRIZ evidence rule объясняет, что logs являются evidence для переписывания invariant, а не прямым импортом.

Метрика успеха:
- Все approved ids отражены в измененных rules или явно покрыты существующим правилом.
- `npm run qa:agent` проходит успешно.

Ограничения / что нельзя сломать:
- Нельзя менять product charter starter без отдельного charter change.
- Нельзя менять scripts behavior или task conveyor contracts вне scope.
- Нельзя оставлять обязательное правило только в `CODEX_MEMORY.md`.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: rule-sync owner reports, user-facing product proposals, AI/agent response quality.
- Хороший ответ: начинается с charter-связи, кратко объясняет человеческий смысл, отделяет решение от traceability ids, не импортирует product-specific детали.
- Провал: отчет состоит из raw candidate ids, technical snippets или `Summary` без понятного решения; Telegram/Gantt/Agent_Const детали попадают в starter core.
- Критичные edge cases: mixed reusable/product-specific candidate; low-confidence QA/TRIZ log; user asks "берем все"; private/source-specific links in owner report.
- Regression examples / golden prompts: "ничего непонятно из этого отчета"; "Что можно взять - берем все"; "подготовь rule-sync owner report".
- Сравнение old vs new behavior: manual rubric по измененным правилам и финальному ответу задачи.
- Minimum pass threshold: все golden prompts должны требовать charter anchor, human-readable decision и traceability без product-specific import.
- Eval owner: maintainer starter.
- Если eval не применим, причина: -

Техническая часть:

Область:
- `AGENTS.md`
- `.memory-bank/code-rules.md`
- `.memory-bank/qa-playbook.md`
- `CODEX_MEMORY.md`
- текущий plan file

Вне scope:
- Изменения `scripts/rule-sync.mjs`
- Импорт product-specific Telegram/Gantt/Agent_Const логики
- Finish/merge/publish

Инвариант:
- Starter core остается переносимым baseline; downstream details идут только через adapters/profiles или остаются в source projects.

Общий seam / точка системного изменения:
- Canonical governance docs and QA/eval rules.

Публичные интерфейсы / контракты:
- Документированные assistant/rule-sync/QA expectations.

Допущения и выбранные по умолчанию решения:
- Пользовательское "берем все" относится ко всем кандидатам из блока "Что можно взять".
- Из ручной переписки approved только `rs-4d517eb61f` и `rs-ea2b08be89`.

План для агента (только если нужен точный технический план реализации):
- Добавить компактные правила в canonical docs.
- Проверить отсутствие product-specific imports.
- Обновить QA/eval evidence в плане.

STAR:
- Situation: rule-sync нашел reusable lessons, но raw report был непонятен владельцу.
- Task: импортировать approved lessons в starter governance.
- Action: переписать lessons как portable rules and eval expectations.
- Result: starter получает более понятный rule-sync/report/QA baseline.

Profile data:
- Размер затронутой зоны: docs/governance only.
- Hook / script density: низкий, scripts не меняются.
- Lint / typecheck risk: низкий.
- Perf / coverage / contracts / security сигналы: только governance documentation.
- Dirty-tree / environment leak сигналы: main был очищен перед `task:start`; работа идет в managed worktree.

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
- Rollback path: revert task commit before merge.
- План снятия долга: -

Шаги реализации (чекбоксы выполнения):
- [x] Шаг 1: создать managed worktree и plan file.
- [x] Шаг 2: внести approved reusable rules в canonical docs.
- [x] Шаг 3: выполнить QA и записать evidence.

План QA:
Автоматические проверки:
- [x] `npm run lint`
- [x] `npm run qa:agent`

Eval checks (если применимо):
- [x] Golden prompt: "ничего непонятно из этого отчета" должен вести к charter-first human-readable summary.
- [x] Golden prompt: "берем все" должен сохранять product-specific filter.

Ручные / сценарные проверки:
- [x] Проверить diff на отсутствие Telegram/Gantt/Agent_Const product-specific imports.
- [x] Codex applicability check: обязательные правила есть в `AGENTS.md` и `.memory-bank/*`, не только в mirror/runtime файлах.

Ожидаемые результаты:
- [x] Approved ids покрыты portable rules.
- [x] QA проходит.

Риски / Откат:
- Риски: избыточное дублирование правил или слишком жесткая формулировка.
- Шаги отката: revert task commit or remove individual rule lines before finish.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: пользователь написал "сделай"
Подтверждено в: 2026-04-30 11:03

Лог выполнения:
- [x] Начато: 2026-04-30 11:03
- [x] Завершено: 2026-04-30 11:05

Результаты QA:
Автоматические проверки:
- Команда: `npm run lint`
  - Ожидалось: repo-lint PASS для затронутых docs.
  - Факт: PASS, `repo-lint: ok (95 files checked)`.
- Команда: `npm run qa:agent`
  - Ожидалось: fixed gate order PASS.
  - Факт: PASS; stages `lint`, `lint:fix:changed`, `lint-recheck`, `typecheck`, `test`, `build` прошли.

Ручные / сценарные проверки:
- Проверка: product-specific import scan
  - Ожидалось: canonical docs do not import Telegram/Gantt/Agent_Const product details.
  - Факт: PASS; mentions exist only in this plan as negative scope/eval examples, not in canonical rule text.
- Проверка: Codex applicability check
  - Ожидалось: обязательные правила синхронизированы в `AGENTS.md` и `.memory-bank/*`, не только в `CODEX_MEMORY.md`.
  - Факт: PASS; правила добавлены в `AGENTS.md`, `.memory-bank/code-rules.md`, `.memory-bank/qa-playbook.md`, краткие operational notes — в `CODEX_MEMORY.md`.

Eval results:
- Case: "ничего непонятно из этого отчета"
  - Ожидалось: ответ начинается с charter-связи, объясняет человеческий смысл и решение до ids/snippets.
  - Факт: новые правила требуют charter-anchored governance/rule-sync ответы, human-readable meaning, decision и next step до traceability.
  - PASS/FAIL: PASS
- Case: "берем все"
  - Ожидалось: агент берет все approved reusable candidates, но сохраняет product-specific filter для mixed/manual items.
  - Факт: новые правила требуют переписывать QA/TRIZ evidence в portable invariant и убирать source-project/domain details из rule text.
  - PASS/FAIL: PASS

Изменённые файлы:
- `plans/2026-04-30-1103-starter-rule-sync-import.md`
- `AGENTS.md`
- `.memory-bank/code-rules.md`
- `.memory-bank/qa-playbook.md`
- `CODEX_MEMORY.md`
