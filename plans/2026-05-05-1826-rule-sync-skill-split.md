Название задачи: Split starter rule sync skills
Тип задачи: behavior-change
Дата создания: 2026-05-05 18:26

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Поддерживает цель starter: давать переносимую операционную основу без ручной сборки governance заново.
- Усиливает JTBD: владелец получает понятный ночной отчет и отдельный безопасный утренний перенос только согласованных правил.
- Сохраняет переносимость starter core: product-specific сигналы остаются в источниках или ручной проверке.

Цель изменения:
- Разделить текущий смешанный rule-sync skill на отчетный вход и вход переноса, чтобы автоматизация только собирала отчет, а ручной сценарий вел владельца по согласованию и импорту.

Целевая аудитория проекта:
- Технические и продуктовые лиды, которые отвечают за переносимую операционную основу.
- Инженеры и agent-operators, которые ведут задачи через Codex/worktree conveyor.
- Downstream maintainers, которые подключают starter как baseline.

Продуктовая спека:

Проблема / JTBD:
- Пользователь пытается регулярно переносить полезные правила из рабочих проектов в starter, но один skill сейчас смешивает сбор, отчет, согласование и импорт.
- Он использует starter, чтобы утром видеть понятный отчет и безопасно согласовать только конкретные правила без риска засорить starter лишним.

Целевая аудитория изменения:
- Владелец starter, который читает ночной rule-sync report и утром принимает решения.
- Агент, который должен не угадывать workflow, а использовать правильный skill для конкретного этапа.

Сценарии использования:
- Когда ночью запускается автоматизация, она вызывает отчетный skill, сохраняет scan/report и не меняет starter.
- Когда утром владелец просит согласовать последний rule-sync отчет, агент вызывает import skill и задает вопросы по одному сгруппированному пункту.
- Когда старый prompt вызывает `starter-rule-sync`, агент не ломается, а направляет пользователя к `starter-rule-report` или `starter-rule-import`.

Требования:
- Есть отдельный `$starter-rule-report` для scan/report.
- Есть отдельный `$starter-rule-import` для согласования и переноса.
- `$starter-rule-sync` остается только как переходная подсказка.
- Ночная автоматизация вызывает `$starter-rule-report`.
- Нижние блоки отчета остаются главным интерфейсом решения.
- Импорт не начинается без owner approval, managed worktree и QA.

Job Stories:
- Когда у меня есть свежий rule-sync отчет, я хочу пройти вопросы по каждому конкретному пункту, чтобы согласовать только нужные правила.
- Когда пункт требует ручной проверки, я хочу видеть конкретное предложение и ожидаемый ответ, чтобы не расшифровывать технический шум.
- Когда старая команда все еще вызывает `$starter-rule-sync`, я хочу получить понятную подсказку, какой новый skill использовать.

User Stories:
- Как владелец starter, я хочу читать только `Кандидаты на импорт` и `Требует ручной проверки`, чтобы быстро принять решения.
- Как agent-operator, я хочу отдельный skill для ночного отчета и отдельный skill для импорта, чтобы не смешивать read-only scan и source edits.
- Как downstream maintainer, я хочу, чтобы starter импортировал только portable rules, чтобы product-specific детали не попадали в baseline.

Критерии приемки:
- `$starter-rule-report` описывает только read-only scan/report путь и сохраняет отчет в человекочитаемом формате.
- `$starter-rule-import` описывает утренний approval workflow с вопросами по проекту, сути и `**Точный текст для starter:**`.
- `$starter-rule-import` явно запрещает импорт без отдельного подтверждения и managed worktree.
- Старый `$starter-rule-sync` больше не содержит смешанный workflow и направляет к двум новым skill.
- Документация и обязательные skill lists знают про новые skills.
- Проверки проекта проходят.

Метрика успеха:
- В repo-managed skills появляются `starter-rule-report` и `starter-rule-import`.
- Golden prompts для отчета, импорта и legacy sync дают ожидаемый route.

Ограничения / что нельзя сломать:
- Нельзя менять `rule-sync:*` command names.
- Нельзя делать ночную автоматизацию mutating.
- Нельзя переносить QA/TRIZ logs как готовые правила.
- Нельзя оставлять обязательное правило только в mirror-файлах.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: rule-sync report/import skills, scheduled automation prompt, legacy skill routing.
- Хороший ответ: агент выбирает `$starter-rule-report` для ночного отчета, `$starter-rule-import` для утреннего согласования, группирует дубли, показывает проект/суть/точный текст, а manual-review пункты формулирует как конкретное решение.
- Провал: агент снова использует один смешанный `$starter-rule-sync`, предлагает импорт без owner approval, задает вопросы по raw ids, не показывает точный текст или переносит product-specific детали.
- Критичные edge cases: последний отчет отсутствует; latest report имеет только skipped/product-specific пункты; manual-review пункт не имеет готового starter text; старый prompt вызывает `$starter-rule-sync`; automation prompt просит read-only run.
- Regression examples / golden prompts: `Use $starter-rule-report to run the nightly scan and report`; `проведи согласование rule-sync по последнему отчету`; `Use $starter-rule-sync`; `я согласовал с правкой`.
- Сравнение old vs new behavior: old skill смешивал scan/report/import; new behavior routes to one phase and stops at approval gates.
- Minimum pass threshold: 4/4 golden prompts match expected routing and safety constraints by manual rubric.
- Eval owner: Codex task owner.
- Если eval не применим, причина: -

Техническая часть:

Область:
- Repo-owned skills, governance docs, automation prompt, runtime required files, skill manager tests.

Вне scope:
- Переименование `rule-sync:*` scripts.
- Автоматическое применение правил без владельца.
- Удаление legacy `$starter-rule-sync` в этом же цикле.

Инвариант:
- Scan/report read-only; import только после owner approval, managed worktree and deterministic QA.

Общий seam / точка системного изменения:
- `skills/` как agent-facing workflow layer; `scripts/rule-sync.mjs` остается execution layer.

Публичные интерфейсы / контракты:
- Новый skill `$starter-rule-report`.
- Новый skill `$starter-rule-import`.
- Legacy `$starter-rule-sync` как compatibility router.

Допущения и выбранные по умолчанию решения:
- Оставить legacy skill на переходный период, чтобы старые ссылки не ломались.
- В user-facing тексте писать `предварительная проверка без изменений`, а technical command оставлять `--dry-run`.

План для агента (только если нужен точный технический план реализации):
- Создать два новых skill folder с `SKILL.md` и `agents/openai.yaml`.
- Переписать `starter-rule-sync` в router.
- Обновить docs/governance references.
- Обновить required file list и tests.
- Обновить night automation prompt.
- Запустить targeted и full QA.

STAR:
- Situation: текущий rule-sync skill совмещает ночной отчет и утренний импорт.
- Task: разделить workflow без потери безопасности и совместимости.
- Action: добавить report/import skills, оставить legacy router, обновить governance and QA evidence.
- Result: владелец получает понятный двухэтапный процесс.

Profile data:
- Размер затронутой зоны: средний, docs + skills + один test/manifest seam.
- Hook / script density: высокая вокруг `skills:status`, `qa:agent`, `task:finish`.
- Lint / typecheck risk: низкий, code edits ограничены списками и тестом.
- Perf / coverage / contracts / security сигналы: security-sensitive область отсутствует; contract risk в skill discovery list.
- Dirty-tree / environment leak сигналы: работа идет в managed worktree, source main clean.

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
- Rollback path: revert task branch before publish, or restore old `skills/starter-rule-sync/SKILL.md` and automation prompt.
- План снятия долга: удалить legacy `$starter-rule-sync` after one successful report/import cycle if owner approves.

Шаги реализации (чекбоксы выполнения):
- [x] Создать `starter-rule-report`, `starter-rule-import`, обновить `starter-rule-sync`.
- [x] Обновить governance/docs/automation references.
- [x] Обновить manifest/tests.
- [x] Запустить QA and manual eval.

План QA:
Автоматические проверки:
- [x] `npm run skills:status`
- [x] `node --test tests/unit/skills-manager.test.mjs`
- [x] `git diff --check`
- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run qa:agent`

Eval checks (если применимо):
- [x] `$starter-rule-report` routes to read-only scan/report.
- [x] `проведи согласование rule-sync по последнему отчету` routes to import approval workflow.
- [x] `$starter-rule-sync` routes to compatibility choice, not mixed workflow.
- [x] Manual-review case demands concrete owner decision before import.

Ручные / сценарные проверки:
- [x] Проверить, что night automation prompt вызывает `$starter-rule-report`.
- [x] Проверить, что docs do not present `$starter-rule-sync` as primary mixed workflow.

Ожидаемые результаты:
- [x] Все новые skills обнаруживаются.
- [x] Старый skill не ломает старые вызовы, но не запускает импорт сам.
- [x] QA проходит.

Риски / Откат:
- Риски: stale `$CODEX_HOME/skills` symlinks until `skills:link`; old automation prompt outside repo could still use legacy skill.
- Шаги отката: revert task commit; leave scripts unchanged.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: owner in chat, "хорошо, реализуй план"
Подтверждено в: 2026-05-05

Лог выполнения:
- [x] Начато: 2026-05-05 18:26
- [x] Завершено: 2026-05-05 18:33

Результаты QA:
Автоматические проверки:
- Команда: `npm run skills:status`
  - Ожидалось: новые skills обнаруживаются.
  - Факт: обнаружено 10 repo-managed skills, включая `starter-rule-import` и `starter-rule-report`; команда вернула conflict/missing, потому что глобальные `$CODEX_HOME/skills` сейчас указывают на другую рабочую копию и новые links ещё не опубликованы из `main`.
- Команда: `node --test tests/unit/skills-manager.test.mjs`
  - Ожидалось: PASS.
  - Факт: PASS, 6 tests.
- Команда: `git diff --check`
  - Ожидалось: PASS.
  - Факт: PASS.
- Команда: `npm run typecheck`
  - Ожидалось: PASS.
  - Факт: PASS.
- Команда: `npm test`
  - Ожидалось: PASS.
  - Факт: PASS, 33 tests.
- Команда: `npm run qa:agent`
  - Ожидалось: PASS.
  - Факт: PASS, lint/typecheck/test/build passed.

Eval results:
- `$starter-rule-report`: PASS, skill stops at read-only scan/report and points next phase to `$starter-rule-import`.
- `$starter-rule-import`: PASS, skill asks by project, essence, exact starter text, and manual-review expectations before approval.
- `$starter-rule-sync`: PASS, skill is now a compatibility router and no longer contains mixed report/import workflow.
- Manual-review case: PASS, import stops if concrete starter text or owner approval is missing.

Codex applicability check:
- Mandatory rule is present in `AGENTS.md`, `.memory-bank/code-rules.md`, `.memory-bank/project-context.md`, `CODEX_MEMORY.md`, README, `.cursorrules`, and `CLAUDE.md`.
- Mandatory rule is not left only in mirror files.
