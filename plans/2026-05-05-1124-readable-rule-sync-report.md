Название задачи: Человекочитаемый rule-sync report
Тип задачи: behavior-change
Дата создания: 2026-05-05 11:24

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Задача поддерживает переносимую starter-основу и JTBD: владелец starter должен быстро понимать, какие downstream правила стоит вернуть в baseline, без ручной расшифровки raw ids.

Цель изменения:
- Сохранять результаты `rule-sync:report` в Markdown и показывать по каждому проекту конкретное предлагаемое правило, решение `вчистую / с адаптацией / отклонить`, текст адаптации и traceability.

Целевая аудитория проекта:
- Технические и продуктовые лиды, downstream maintainers и agent-operators, которые принимают решения о переносе reusable правил в starter.

Продуктовая спека:

Проблема / JTBD:
- Пользователь пытается принять решение по rule-sync находкам, но сейчас результат живёт в stdout и требует собирать смысл из candidate ids, файлов и snippets.
- Он использует продукт, чтобы переносить в starter только reusable правила, сохраняя product-specific детали в исходных проектах.

Целевая аудитория изменения:
- Owner/maintainer starter, который читает nightly rule-sync результаты.

Сценарии использования:
- Когда automation завершает rule-sync scan, пользователь открывает Markdown report, чтобы увидеть по проектам, что именно предлагается перенести.
- Когда candidate требует адаптации, пользователь видит, какую адаптацию выполнить до import approval.

Требования:
- `rule-sync:report` сохраняет Markdown artifact в `runtime/rule-sync/reports/`.
- Report группирует находки по проектам.
- Похожие находки внутри проекта объединяются в одно предложение с точным текстом правила для starter и списком ids для проверки.
- Блоки `Кандидаты на импорт` и `Требует ручной проверки` можно читать отдельно: они тоже группируют похожие пункты по проекту и теме, показывают точный текст для starter, а ручная проверка объясняет, что проверить, моё предложение и какой ответ нужен от владельца.
- Эталонный формат этой задачи: владелец читает последние блоки `Кандидаты на импорт` и `Требует ручной проверки` первыми; все labels в группах выделены жирным (`**Точный текст для starter:**`, `**Что проверить вручную:**`, `**Моё предложение:**`, `**Что ожидается от владельца:**`); generic wording без конкретной проблемы и ожидаемого решения считается регрессом.
- Зафиксированные ошибки из чата, которые нельзя повторять: слишком технический язык без смысла для владельца; общие слова без конкретного текста правила; дубли как отдельные пункты; QA/TRIZ журналы как готовые правила; нижние блоки, которые требуют читать верхний разбор; labels без bold-выделения.
- QA/TRIZ журналы не попадают в `Кандидаты на импорт` как готовое правило; они показываются как ручная проверка/подтверждение, пока из них не сформулирован отдельный reusable урок.
- Existing JSON snapshot остаётся canonical machine-readable artifact.

Job Stories:
- Когда я смотрю nightly scan, я хочу видеть найденные правила по проектам, чтобы быстро понять источник каждого предложения.
- Когда правило нельзя переносить вчистую, я хочу видеть нужную адаптацию, чтобы не занести product-specific поведение в starter core.

User Stories:
- Как maintainer starter, я хочу открыть Markdown report и принять approve/rewrite/reject решение без чтения JSON.
- Как agent-operator, я хочу иметь traceability до source commit/task, чтобы проверить evidence перед import approval.

Критерии приемки:
- Report file создаётся в ignored runtime path.
- В report есть секция `Разбор по проектам`.
- У каждой группы есть `Что делать`, `Дубли или похожие записи`, `Почему это полезно starter`, `Точный текст для starter`, `Как переписать без лишнего`, `Источники для проверки`.
- Нижние блоки `Кандидаты на импорт` и `Требует ручной проверки` содержат такие же decision-группы, а не список raw candidate ids.
- В `Требует ручной проверки` каждая группа содержит `Что проверить вручную`, `Моё предложение` и `Что ожидается от владельца`.
- Product-specific candidates не помечаются как direct import.
- Эталонный формат сохранён в `AGENTS.md`, `.memory-bank/code-rules.md`, `CODEX_MEMORY.md`, `skills/starter-rule-sync/SKILL.md` и `scripts/README.md`.

Метрика успеха:
- Один Markdown report содержит все owner-facing решения без обращения к raw JSON.
- Unit test фиксирует проектную группировку и сохранение report file.

Ограничения / что нельзя сломать:
- Scan/report остаются read-only относительно tracked starter source.
- `apply-plan` остаётся approval-safe dry-run.
- Candidate ids остаются traceability, но не заменяют human-readable summary.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: rule-sync owner reports
- Хороший ответ: report начинается с charter anchor и decision proposals, затем по проектам показывает сгруппированные предложения с точным текстом правила для starter, решением и ids для проверки; нижние blocks можно читать самостоятельно.
- Провал: report сохраняет только raw ids, не группирует по проектам, повторяет дубли отдельными пунктами, не показывает точный текст для starter в нижних blocks, использует generic evidence wording без конкретной проблемы, не использует bold labels для decision fields или предлагает product-specific / QA/TRIZ log как direct import.
- Критичные edge cases: empty candidates, product-specific candidate, mixed reusable/product-specific candidate, QA/TRIZ evidence candidate, latest zero-probe fallback.
- Regression examples / golden prompts: `npm run rule-sync:report -- --scan <snapshot>` должен создать Markdown; latest scan от 2026-05-04 должен показать проекты Agent_Const/Assist/etc. отдельными группами.
- Сравнение old vs new behavior: old stdout-only category list vs new saved Markdown with project groups and candidate transfer decisions.
- Minimum pass threshold: unit tests pass; generated report includes required project grouping fields and self-contained lower decision blocks; no source edits from report command.
- Eval owner: Codex
- Если eval не применим, причина: -

Техническая часть:

Область:
- `scripts/rule-sync.mjs`
- `tests/unit/rule-sync.test.mjs`
- `scripts/README.md`
- `.memory-bank/code-rules.md`

Вне scope:
- Auto-applying rules.
- Changing classifier discovery logic.
- Importing current candidates into starter source.

Инвариант:
- Runtime artifacts may be written under ignored `runtime/`; tracked starter source is unchanged by scan/report.

Общий seam / точка системного изменения:
- `renderRuleSyncReport` and report command artifact writing.

Публичные интерфейсы / контракты:
- `npm run rule-sync:report -- --latest|--scan <path> [--json]`.

Допущения и выбранные по умолчанию решения:
- Markdown report path is derived from selected snapshot `generatedAt`.
- `вчистую` means import-ready subject to owner approval and normal parity check; actual source edits still require apply-plan and managed worktree.

План для агента (только если нужен точный технический план реализации):
- Add project grouping renderer and candidate decision heuristics.
- Save report markdown from report command.
- Extend tests and docs.

STAR:
- Situation: nightly rule-sync results are technically correct but not easy to approve.
- Task: make report artifact human-readable and project-grouped.
- Action: update renderer, artifact writer, tests and docs.
- Result: pending.

Profile data:
- Размер затронутой зоны: one script, one unit test file, docs.
- Hook / script density: rule-sync is critical script with unit coverage.
- Lint / typecheck risk: JSDoc type checks and node test risk.
- Perf / coverage / contracts / security сигналы: no security-sensitive data should be imported; runtime output ignored.
- Dirty-tree / environment leak сигналы: worktree is task-specific.

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
- Rollback path: revert task branch changes.
- План снятия долга: -

Шаги реализации (чекбоксы выполнения):
- [x] Обновить report renderer and artifact writing.
- [x] Обновить tests.
- [x] Обновить docs and QA evidence.

План QA:
Автоматические проверки:
- [x] `node --test tests/unit/rule-sync.test.mjs`
- [x] `npm run rule-sync:report -- --scan /Users/constantine.ivshin/!AI/new-project-starter/runtime/rule-sync/scans/rule-sync-2026-05-04-233227430Z.json`
- [x] `npm run typecheck`
- [x] `npm test`

Eval checks (если применимо):
- [x] Generated report contains project grouping, duplicate grouping, exact starter rule text and self-contained lower decision blocks.
- [x] Product-specific or mixed candidates are not marked as direct import.

Ручные / сценарные проверки:
- [x] Inspect generated Markdown report.

Ожидаемые результаты:
- [x] Report path is written under `runtime/rule-sync/reports/`.
- [x] Markdown has `Разбор по проектам` and grouped proposal fields: `Дубли или похожие записи`, `Почему это полезно starter`, `Точный текст для starter`, `Источники для проверки`.
- [x] Markdown lower blocks have `Пункты в группе`, `Точный текст для starter`, `Что проверить вручную`, `Моё предложение`, and `Что ожидается от владельца` where applicable.
- [x] Markdown field labels in report groups are bold, for example `**Точный текст для starter:**`.

Риски / Откат:
- Риски: noisy report output; incomplete heuristics for candidate-specific wording.
- Шаги отката: revert task branch.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: пользователь запросил изменение в Default mode
Подтверждено в: 2026-05-05 11:24

Лог выполнения:
- [x] Начато: 2026-05-05 11:24
- [x] Завершено: 2026-05-05 12:34

Результаты QA:
Автоматические проверки:
- Команда: `node --test tests/unit/rule-sync.test.mjs`
  - Ожидалось: rule-sync unit tests pass.
  - Факт: PASS, 9 tests. Повторно прогнано после фиксации эталонного формата и anti-regressions из чата.
- Команда: `npm run typecheck`
  - Ожидалось: TypeScript check pass.
  - Факт: PASS.
- Команда: `npm test`
  - Ожидалось: full unit/integration suite pass.
  - Факт: PASS, 33 tests. Повторно прогнано после добавления bold labels в report groups.
- Команда: `npm run rule-sync:report -- --scan /Users/constantine.ivshin/!AI/new-project-starter/runtime/rule-sync/scans/rule-sync-2026-05-04-233227430Z.json`
  - Ожидалось: Markdown report saved with project grouping.
  - Факт: PASS, generated `runtime/rule-sync/reports/rule-sync-2026-05-04-233227430Z.md`.

Ручные / сценарные проверки:
- Проверка: inspect generated Markdown.
  - Ожидалось: report includes `Разбор по проектам`, candidate decisions and adaptation text.
  - Факт: PASS. Основной разбор и нижние decision-блоки группируют похожие записи и используют bold-поля `**Что делать:**`, `**Дубли или похожие записи:**`, `**Что нашли:**`, `**Почему это полезно starter:**`, `**Точный текст для starter:**`, `**Как переписать без лишнего:**`, `**Куда может лечь в starter:**`, `**Источники для проверки:**`; в ручной проверке добавлены `**Что проверить вручную:**`, `**Моё предложение:**`, `**Что ожидается от владельца:**`; сырые technical reasons убраны из Markdown в JSON snapshot.
- Проверка: canonical memory / skill anti-regression capture.
  - Ожидалось: идеальный формат и ошибки из чата сохранены в rules/memory/skill/docs.
  - Факт: PASS. Зафиксировано в `AGENTS.md`, `.memory-bank/code-rules.md`, `.memory-bank/project-context.md`, `CODEX_MEMORY.md`, `skills/starter-rule-sync/SKILL.md`, `scripts/README.md` и этом plan file.

Eval results:
- Case: latest 2026-05-04 scan report.
  - Ожидалось: project-grouped owner report with direct/adapt/reject fields.
  - Факт: `Agent_Const` and `Assist` grouped; duplicate/similar candidates are collapsed into one proposal with exact starter wording and source ids. `rs-192616fb8a`, `rs-4ca0b4c0ba`, `rs-77b6309f35`, `rs-f87c8b814a` are one bootstrap-command group. QA/TRIZ logs moved to manual-review/evidence-only groups with concrete owner action.
  - PASS/FAIL: PASS.
- Case: mixed/product-specific candidate.
  - Ожидалось: not marked as direct import.
  - Факт: candidates with product tokens are `с адаптацией` or `отклонить`.
  - PASS/FAIL: PASS.

Изменённые файлы:
- .memory-bank/code-rules.md
- .memory-bank/project-context.md
- AGENTS.md
- CODEX_MEMORY.md
- scripts/README.md
- scripts/rule-sync.mjs
- skills/starter-rule-sync/SKILL.md
- tests/unit/rule-sync.test.mjs
- plans/2026-05-05-1124-readable-rule-sync-report.md
