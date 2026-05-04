Название задачи: Уточнить миссию и видение в product charter
Тип задачи: behavior-change
Дата создания: 2026-05-04 12:19

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Задача усиливает Project Intake Gate и переносимость starter baseline: новые проекты получают более точные правила для формулировки миссии и видения без добавления product-specific поведения в starter core.

Цель изменения:
- Добавить в charter понятные определения и формулы миссии/видения, переписать миссию и видение текущего starter по этим правилам и синхронизировать обязательные canonical/mirror sources.

Целевая аудитория проекта:
- Команды, которые начинают новый проект или репозиторий; технические и продуктовые лиды; инженеры и agent-operators; downstream maintainers.

Продуктовая спека:

Проблема / JTBD:
- Пользователь начинает новый проект и должен сформулировать mission/vision, но без явных вопросов и формул легко получить слишком общий или технический текст.
- Он использует starter, чтобы быстрее получить ясную операционную основу и не собирать governance заново.

Целевая аудитория изменения:
- Owner нового downstream-проекта и агент, который ведёт Project Intake.

Сценарии использования:
- Когда owner запускает Project Intake, он видит, на какие вопросы отвечают миссия и видение, и может согласовать более точные формулировки.

Требования:
- В `.memory-bank/product-charter.md` должны появиться определения и формулы для миссии и видения.
- Текущие миссия и видение starter должны быть переписаны по этим формулам.
- Charter должен показывать “было / стало / почему”.
- Project Intake template должен помогать новым проектам применять эти формулы.
- Обязательные canonical/mirror sources должны быть синхронизированы.

Job Stories:
- Когда я стартую новый проект, я хочу понять разницу между миссией и видением, чтобы согласовать не общий лозунг, а рабочий product charter.

User Stories:
- Как owner нового проекта, я хочу видеть вопросы и формулы для миссии и видения, чтобы быстрее согласовать точный charter.

Критерии приемки:
- В charter есть определения, вопросы и формулы для миссии и видения.
- Активные mission/vision starter соответствуют этим формулам.
- В charter указано, как было, как стало и почему формулировки уточнены.
- Project Intake template направляет owner'а по новым формулам.
- Новое правило не осталось только в mirror-файлах.

Метрика успеха:
- Owner может сформулировать mission/vision без дополнительного внешнего checklist.
- Агент может проверить mission/vision через вопросы и формулы из canonical sources.

Ограничения / что нельзя сломать:
- Нельзя ослабить переносимость starter baseline.
- Нельзя hardcode'ить product-specific миссию, рынок или provider choice для downstream-проектов.
- Нельзя переносить миссию/видение на уровень отдельных задач.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: Project Intake Gate / Product Charter gate / conversational bootstrap
- Хороший ответ: агент объясняет mission/vision простым языком, использует формулы, не предлагает mission/vision для отдельной задачи и ведёт owner'а к approved Project Intake.
- Провал: агент выдаёт общий checklist, смешивает миссию с видением, предлагает product-specific defaults в starter core или начинает feature work до approved intake.
- Критичные edge cases: owner даёт лозунг без аудитории; owner описывает только технический стек; owner просит “заполним потом”; owner хочет сделать mission/vision на уровне task spec.
- Regression examples / golden prompts: `стартуем новый проект`; `помоги сформулировать миссию`; `а видение можно потом?`; `сделай миссию для этой задачи`.
- Сравнение old vs new behavior: old behavior мог принять общую формулировку без явной проверки вопросов; new behavior проверяет mission/vision по формулам и требует owner approval.
- Minimum pass threshold: 4 из 4 golden prompts сохраняют Project Intake Gate и корректно различают mission vs vision.
- Eval owner: downstream owner / agent-operator проекта.
- Если eval не применим, причина: -

Техническая часть:

Область:
- Product charter, memory-bank context, Project Intake template, root governance mirror.

Вне scope:
- Изменение скриптов, task conveyor, QA runtime, downstream-specific charter content.

Инвариант:
- Starter остаётся переносимым baseline; product-specific решения добавляются только поверх через downstream adapters/profiles.

Общий seam / точка системного изменения:
- `.memory-bank/product-charter.md` и `plans/_project_intake_template.md`.

Публичные интерфейсы / контракты:
- Project Intake Gate для новых downstream-проектов.

Допущения и выбранные по умолчанию решения:
- Пользовательское “отлично” подтверждает создание managed worktree и выполнение правки в отдельной ветке, но не является direct-main разрешением.

План для агента (только если нужен точный технический план реализации):
- Обновить charter, Project Intake template, `AGENTS.md`, `.memory-bank/project-context.md`, `.memory-bank/code-rules.md`, `.memory-bank/index.md`, `CODEX_MEMORY.md`, `README.md`; затем проверить drift поиском и deterministic QA.

STAR:
- Situation: charter содержит mission/vision, но не содержит явных формул для их подбора.
- Task: добавить формулы и переписать текущие формулировки starter.
- Action: внести хирургическую governance-правку и синхронизировать canonical sources.
- Result: owner нового проекта получает понятный intake contract для mission/vision.

Profile data:
- Размер затронутой зоны: docs/governance only.
- Hook / script density: низкий риск runtime, высокий риск governance drift.
- Lint / typecheck risk: низкий.
- Perf / coverage / contracts / security сигналы: не применимо к runtime.
- Dirty-tree / environment leak сигналы: source repo clean; task worktree создан через `task:start`.

Repo-RAG:
- [x] Проверить `plans/*`
- [ ] Проверить `Docs/qa-implementation-log.md`
- [ ] Проверить `Docs/change-ledger.md`
- [x] Проверить `.memory-bank/*`
- [x] Проверить `CODEX_MEMORY.md`

Формат исправления:
- [x] Systemic fix
- [ ] Exception

Exception (если применимо):
- Причина: -
- Риск: -
- Rollback path: откатить task branch до исходного состояния или revert commit.
- План снятия долга: -

Шаги реализации (чекбоксы выполнения):
- [x] Обновить product charter и Project Intake template.
- [x] Синхронизировать canonical/mirror sources.
- [x] Прогнать deterministic checks и зафиксировать результаты.

План QA:
Автоматические проверки:
- [x] `npm run lint`:
- [x] `npm run typecheck`:
- [x] `npm test`:

Eval checks (если применимо):
- [x] Проверить, что golden prompts в Eval spec имеют ожидаемое поведение в тексте правил.

Ручные / сценарные проверки:
- [x] Поиск старых mission/vision формулировок и обязательного правила только в mirrors.

Ожидаемые результаты:
- [x] Governance docs синхронизированы.
- [x] Автоматические проверки проходят.

Риски / Откат:
- Риски: governance drift между canonical files и mirrors.
- Шаги отката: revert task branch или вернуть предыдущие формулировки в изменённых docs.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: пользователь
Подтверждено в: 2026-05-04 12:18

Лог выполнения:
- [x] Начато: 2026-05-04 12:19
- [x] Завершено: 2026-05-04 12:23

Результаты QA:
Автоматические проверки:
- Команда: `npm run lint`
  - Ожидалось: repo lint проходит.
  - Факт: PASS, `repo-lint: ok (103 files checked)`.
- Команда: `npm run typecheck`
  - Ожидалось: TypeScript checkJs проходит без ошибок.
  - Факт: PASS.
- Команда: `npm test`
  - Ожидалось: unit/integration tests проходят.
  - Факт: PASS, 32 tests passed.

Ручные / сценарные проверки:
- Проверка: поиск старых активных mission/vision формулировок.
  - Ожидалось: старые формулировки встречаются только в блоке “Было” внутри charter.
  - Факт: PASS, активные canonical/mirror формулировки обновлены; старый текст найден только как traceability в `.memory-bank/product-charter.md`.
- Проверка: Codex applicability check.
  - Ожидалось: новое правило есть в `AGENTS.md` и `.memory-bank/*`, не только в `.cursorrules`.
  - Факт: PASS, правило синхронизировано в `.memory-bank/product-charter.md`, `.memory-bank/code-rules.md`, `.memory-bank/project-context.md`, `.memory-bank/index.md`, `AGENTS.md`, `CODEX_MEMORY.md`, `README.md`, `CLAUDE.md`, `.cursorrules` и `plans/_project_intake_template.md`.

Eval results:
- Case: `стартуем новый проект`.
  - Ожидалось: правила ведут через Project Intake, где mission/vision проверяются по формулам.
  - Факт: PASS, Project Intake Gate и bootstrap docs ссылаются на formulas из charter.
- Case: `помоги сформулировать миссию`.
  - Ожидалось: агент объясняет “кому помогаем, какой результат даём, через что”.
  - Факт: PASS, это закреплено в charter, template и mirrors.
- Case: `а видение можно потом?`.
  - Ожидалось: placeholder/“потом” остаётся blocker до owner approval.
  - Факт: PASS, Project Intake blocker rule сохранён.
- Case: `сделай миссию для этой задачи`.
  - Ожидалось: агент не создаёт mission/vision на task level.
  - Факт: PASS, charter и mirrors фиксируют, что mission/vision принадлежат project charter или Project Intake.

Изменённые файлы:
- `.memory-bank/product-charter.md`
- `plans/_project_intake_template.md`
- `AGENTS.md`
- `.memory-bank/project-context.md`
- `.memory-bank/code-rules.md`
- `.memory-bank/index.md`
- `CODEX_MEMORY.md`
- `README.md`
- `CLAUDE.md`
- `.cursorrules`
- `plans/2026-05-04-1219-charter-mission-vision.md`
