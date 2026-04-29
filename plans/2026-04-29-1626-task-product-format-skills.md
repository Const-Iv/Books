Название задачи: Исправить task-level product format и добавить выбранные skills
Тип задачи: behavior-change
Дата создания: 2026-04-29 16:26

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Задача сохраняет миссию starter: команды получают переносимую операционную основу без ручной сборки governance заново.
- Задача сохраняет видение starter: reusable skills добавляются как baseline, а product-specific поведение остается поверх core через adapters/profiles.
- Задача поддерживает цель проекта: starter остается runnable local-first baseline с reusable shared skills и source-of-truth governance.

Цель изменения:
- Закрепить правило, что миссия и видение существуют только на уровне проекта, а task/spec output описывает цель изменения, JTBD, Job Stories и User Stories.
- Добавить только выбранные repo-managed skills: `codebase-recon`, `gh-fix-ci`, `gh-address-comments`.

Целевая аудитория проекта:
- Инженеры и agent-operators, которые ведут задачи через Codex/worktree conveyor.
- Downstream maintainers, которые подключают starter как baseline.

Продуктовая спека:

Проблема / JTBD:
- Пользователь просит Codex предложить продуктовое решение или внедрить skill, но сейчас формат может создавать ложные `Миссия` и `Видение` на уровне задачи.
- Пользователь использует starter, чтобы держать правила и skills переносимыми, проверяемыми и не шумящими.

Целевая аудитория изменения:
- Владелец starter baseline.
- Пользователи Codex, которые читают product recommendations, rule-sync reports и используют repo-managed skills.

Сценарии использования:
- Когда пользователь просит оценить или внедрить skills, Codex показывает связь с charter, цель изменения, JTBD, Job Stories и User Stories без новой миссии задачи.
- Когда rule-sync report предлагает решение, owner видит задачу через цель и пользовательскую потребность, а не через сгенерированную миссию.
- Когда оператор разбирает незнакомый проект, упавшие GitHub-проверки или PR-комментарии, Codex использует узкий skill без Composio и без лишних внешних зависимостей.

Требования:
- Task/spec output не должен иметь собственные блоки `Миссия` и `Видение`.
- Project Intake для нового downstream-проекта сохраняет блоки `Миссия` и `Видение`, потому что он описывает целый проект.
- Rule-sync owner report начинается с `Связь с charter проекта -> Цель решения -> JTBD -> Job Stories -> User Stories -> Критерии приемки`.
- В `skills/` добавлены только `codebase-recon`, `gh-fix-ci`, `gh-address-comments`.

Job Stories:
- Когда я читаю рекомендацию Codex, я хочу видеть связь с charter проекта без подмены миссии и видения, чтобы понимать ценность задачи.
- Когда я подключаю skills, я хочу брать только те, что экономят внимание в частых рабочих ситуациях, чтобы Codex не тратил контекст на шум.
- Когда CI или PR-комментарии требуют реакции, я хочу быстро собрать факты и варианты действий, чтобы чинить по проверяемому плану.

User Stories:
- Как владелец starter baseline, я хочу хранить правило о миссии/видении в канонических правилах, чтобы ошибка не повторялась.
- Как пользователь Codex, я хочу иметь локальный skill для первичного разбора незнакомого проекта.
- Как оператор задач, я хочу получать короткий отчет по GitHub-проверкам и PR-комментариям без Composio и без конфликтующих инструкций.

Критерии приемки:
- Канонические правила запрещают создавать task-level `Миссия` и `Видение`.
- `plans/_template.md` использует `Связь с charter проекта` вместо отдельных task-level блоков `Миссия` и `Видение`.
- `rule-sync:report` не выводит сгенерированные `Миссия:` и `Видение:` для конкретного решения.
- `plans/_project_intake_template.md` продолжает содержать `Миссия` и `Видение`.
- `npm run skills:status` видит новые repo-managed skills.

Метрика успеха:
- 4/4 eval cases проходят.
- `npm run qa:agent` проходит.

Ограничения / что нельзя сломать:
- Не менять смысл `.memory-bank/product-charter.md`; допустимо только устранить противоречивую формулировку gate.
- Не добавлять невыбранные skills.
- Не импортировать generated skill trees.
- Не перезаписывать локальные `$CODEX_HOME/skills` без owner approval.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: Product Charter gate, rule-sync owner reports, task/spec planning recommendations, skill selection recommendations.
- Хороший ответ: использует связь с project charter, затем цель изменения, JTBD, Job Stories, User Stories и критерии; не создает отдельные `Миссия` и `Видение` для задачи.
- Провал: ответ выдумывает task-level миссию/видение или оформляет рекомендацию только как технический список без product anchor.
- Критичные edge cases: Project Intake для нового downstream-проекта сохраняет миссию/видение; короткий чат-ответ может дать один charter anchor, но не подменяет charter.
- Regression examples / golden prompts:
  - "Оцени skills для моей работы"
  - "Создай plan для feature"
  - `rule-sync:report` с product-planning candidate
  - Проверка `plans/_project_intake_template.md`
- Сравнение old vs new behavior: old output мог генерировать `Миссия:` и `Видение:` для конкретной задачи; new output не генерирует их и ссылается на project charter.
- Minimum pass threshold: 4/4 eval cases PASS.
- Eval owner: task implementer.
- Если eval не применим, причина: -

Техническая часть:

Область:
- Governance docs, plan template, rule-sync report renderer/tests, repo-managed skills.

Вне scope:
- Установка невыбранных skills.
- Подключение Composio, Notion, Linear, Sentry или Datadog.
- Автоматическое overwrite локальных skills.

Инвариант:
- Project charter остается единственным источником миссии и видения проекта.

Общий seam / точка системного изменения:
- Product output wording в canonical rules/templates и `renderDecisionProposals`.

Публичные интерфейсы / контракты:
- `plans/_template.md`
- `npm run rule-sync:report`
- `npm run skills:status`

Допущения и выбранные по умолчанию решения:
- "Делаем 1, 3" означает добавить `codebase-recon`, `gh-fix-ci`, `gh-address-comments`.
- GitHub skills остаются read-first: диагностика и план до правок.

План для агента (только если нужен точный технический план реализации):
- Обновить wording в canonical governance files и reference docs.
- Добавить три skills в `skills/`.
- Обновить unit tests для rule-sync report.
- Прогнать targeted checks и полный `qa:agent`.

STAR:
- Situation: task-level product output ошибочно получил собственные миссию и видение.
- Task: закрепить project-only mission/vision и добавить выбранные skills.
- Action: обновить правила, шаблоны, rule-sync report и repo-managed skills.
- Result: Codex использует правильный product format и узкий полезный skill set.

Profile data:
- Размер затронутой зоны: governance docs + один script seam + skills.
- Hook / script density: medium, затронут `rule-sync`.
- Lint / typecheck risk: medium из-за tests и JS report renderer.
- Perf / coverage / contracts / security сигналы: skills не должны вводить внешние unsafe flows.
- Dirty-tree / environment leak сигналы: initial tree clean.

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
- Rollback path: revert task commit.
- План снятия долга: -

Шаги реализации (чекбоксы выполнения):
- [x] Обновить canonical wording и plan template.
- [x] Обновить rule-sync renderer и tests.
- [x] Добавить выбранные skills.
- [x] Прогнать QA и записать results.

План QA:
Автоматические проверки:
- [x] `node --test tests/unit/rule-sync.test.mjs`
- [x] `python3 -m py_compile skills/gh-fix-ci/scripts/inspect_pr_checks.py skills/gh-address-comments/scripts/fetch_comments.py`
- [x] `npm run skills:status`
- [x] `npm run qa:agent`

Eval checks (если применимо):
- [x] Eval case 1: запрос "оцени skills для моей работы" не создает task-level mission/vision.
- [x] Eval case 2: запрос "создай plan для feature" использует связь с project charter.
- [x] Eval case 3: `rule-sync:report` не выводит generated `Миссия:` / `Видение:`.
- [x] Eval case 4: `plans/_project_intake_template.md` сохраняет mission/vision.

Ручные / сценарные проверки:
- [x] Проверить, что новые skills не содержат Composio requirement.
- [x] Проверить, что `skills:link` не запускался при conflict.

Ожидаемые результаты:
- [x] Все targeted checks PASS.
- [x] `qa:agent` PASS.

Риски / Откат:
- Риски: неполная синхронизация wording между governance docs и report tests.
- Шаги отката: revert changed files and remove added skills.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: user message "PLEASE IMPLEMENT THIS PLAN"
Подтверждено в: 2026-04-29 16:26

Лог выполнения:
- [x] Начато: 2026-04-29 16:26
- [x] Завершено: 2026-04-29 16:37

Результаты QA:
Автоматические проверки:
- Команда: `node --test tests/unit/rule-sync.test.mjs`
  - Ожидалось: PASS.
  - Факт: PASS, 6/6 tests.
- Команда: `node --test tests/unit/rule-sync.test.mjs tests/unit/skills-manager.test.mjs`
  - Ожидалось: PASS after updating managed skill expectations.
  - Факт: PASS, 12/12 tests.
- Команда: `python3 -m py_compile skills/gh-fix-ci/scripts/inspect_pr_checks.py skills/gh-address-comments/scripts/fetch_comments.py`
  - Ожидалось: Python scripts compile.
  - Факт: PASS.
- Команда: `npm run skills:status`
  - Ожидалось: New repo-managed skills are discovered; do not run `skills:link` if conflicts exist.
  - Факт: managedCount=6; new skills `codebase-recon`, `gh-address-comments`, `gh-fix-ci` are `missing`; pre-existing local conflicts remain for `worktree-create` and `worktree-finish`; `skills:link` was not run.
- Команда: `npm run qa:agent`
  - Ожидалось: PASS.
  - Факт: first run failed on missing trailing newlines in copied LICENSE files; second run failed because `skills-manager` expected the old skill list; both were fixed. Final run PASS: lint, lint:fix:changed, lint recheck, typecheck, test 22/22, build.

Ручные / сценарные проверки:
- Проверка: `rg` over `plans/_template.md`, `scripts/rule-sync.mjs`, `skills/starter-rule-sync/SKILL.md`, canonical rules.
  - Ожидалось: no task-level generated `Миссия:` / `Видение:` in task/spec/report surfaces.
  - Факт: PASS; matches remain only in project-level charter/intake/context files and this task plan's regression notes.
- Проверка: `rg` over `plans/_project_intake_template.md`.
  - Ожидалось: Project Intake still contains `Миссия:` and `Видение:`.
  - Факт: PASS.
- Проверка: `rg` over new skills for `Composio`, `sandbox_permissions`, `require_escalated`, external unselected services.
  - Ожидалось: no dependency on Composio or conflicting sandbox instructions.
  - Факт: PASS; GitHub skills mention Composio only to say it is not required.
- Проверка: Codex applicability check.
  - Ожидалось: обязательное правило закреплено в `AGENTS.md` и `.memory-bank/*`, не только в mirror-файлах.
  - Факт: PASS; правило закреплено в `AGENTS.md`, `.memory-bank/code-rules.md`, `.memory-bank/product-charter.md`, `CODEX_MEMORY.md`, `plans/_template.md`, `scripts/rule-sync.mjs` и `skills/starter-rule-sync/SKILL.md`; `.cursorrules` не использовался как единственный source.

Eval results:
- Case: запрос "оцени skills для моей работы".
  - Ожидалось: output uses charter anchor, goal, JTBD, Job Stories, User Stories; no task-level mission/vision.
  - Факт: rules now require this format.
  - PASS/FAIL: PASS.
- Case: запрос "создай plan для feature".
  - Ожидалось: plan template starts from `Связь с charter проекта`, not `Миссия` / `Видение`.
  - Факт: `plans/_template.md` updated.
  - PASS/FAIL: PASS.
- Case: `rule-sync:report` with product-planning candidate.
  - Ожидалось: report starts from `Связь с charter проекта`, `Цель решения`, `JTBD`, `Job Stories`.
  - Факт: unit test asserts absence of `Миссия:` / `Видение:` and presence of new sections.
  - PASS/FAIL: PASS.
- Case: `plans/_project_intake_template.md`.
  - Ожидалось: Project Intake keeps project-level `Миссия` and `Видение`.
  - Факт: file unchanged for these sections.
  - PASS/FAIL: PASS.

Изменённые файлы:
- AGENTS.md
- .memory-bank/code-rules.md
- .memory-bank/product-charter.md
- CODEX_MEMORY.md
- plans/_template.md
- plans/reference/new-project-blueprint.md
- scripts/README.md
- scripts/rule-sync.mjs
- skills/starter-rule-sync/SKILL.md
- tests/unit/rule-sync.test.mjs
- tests/unit/skills-manager.test.mjs
- skills/codebase-recon/SKILL.md
- skills/codebase-recon/LICENSE
- skills/codebase-recon/agents/openai.yaml
- skills/gh-fix-ci/SKILL.md
- skills/gh-fix-ci/LICENSE.txt
- skills/gh-fix-ci/agents/openai.yaml
- skills/gh-fix-ci/scripts/inspect_pr_checks.py
- skills/gh-address-comments/SKILL.md
- skills/gh-address-comments/LICENSE.txt
- skills/gh-address-comments/agents/openai.yaml
- skills/gh-address-comments/scripts/fetch_comments.py
