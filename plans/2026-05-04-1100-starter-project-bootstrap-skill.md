Название задачи: Добавить skill старта нового проекта
Тип задачи: behavior-change
Дата создания: 2026-05-04 11:00

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Задача поддерживает миссию и JTBD starter: команда после копирования baseline получает разговорный вход в безопасный старт нового проекта и не собирает governance, task flow и QA вручную.
- Задача сохраняет видение: продуктовая специфика нового проекта добавляется поверх baseline через Project Intake и adapters/profiles, а core governance не превращается в product-specific рецепт.

Цель изменения:
- Сделать фразу `стартуем новый проект` каноническим conversational trigger, который включает reusable skill и ведёт owner'а по правильной bootstrap-последовательности.

Целевая аудитория проекта:
- Команды, которые начинают новый проект или репозиторий.
- Технические и продуктовые лиды, отвечающие за переносимую операционную основу.
- Инженеры и agent-operators, ведущие задачи через Codex/worktree conveyor.
- Downstream maintainers, подключающие starter как baseline.

Продуктовая спека:

Проблема / JTBD:
- Пользователь пытается стартовать новый проект от starter baseline, но сейчас должен помнить порядок Project Intake, canonical docs, dependencies, skills и QA самостоятельно.
- Он использует starter, чтобы новый проект с первого дня имел ясные правила, проверяемый процесс и не пропускал обязательные решения.

Целевая аудитория изменения:
- Owner или maintainer нового downstream-проекта, который уже скопировал starter в корень репозитория или подключил его как baseline.

Сценарии использования:
- Когда пользователь пишет `стартуем новый проект`, ассистент распознаёт bootstrap intent, читает project charter и Project Intake template, объясняет ближайший безопасный шаг и ведёт owner'а по обязательным решениям.
- Когда Project Intake ещё не заполнен, ассистент не начинает feature work и не предлагает stack/provider defaults как core baseline.
- Когда intake согласован, ассистент переносит ответы в canonical sources и предлагает baseline QA.

Требования:
- Добавить repo-managed skill `starter-project-bootstrap`.
- Зафиксировать conversational trigger `стартуем новый проект` и близкие формулировки в canonical governance.
- Skill должен вести по Project Intake Gate, canonical docs transfer, dependency setup, optional shared skills и baseline QA.
- По trigger `стартуем новый проект` ассистент должен автоматически выполнить safe skill availability setup: `npm ci` при необходимости и `npm run skills:link`; `npm run skills:link -- --adopt` допустим только после explicit owner approval.
- Skill должен останавливать feature/refactor/behavior-change работу, если обязательные intake-пункты не согласованы.
- Skill не должен hardcode'ить frontend stack, identity provider, payments, locales, database queue или другой product-specific выбор в starter core.

Job Stories:
- Когда я скопировал starter в новый репозиторий, я хочу написать `стартуем новый проект`, чтобы ассистент провёл меня по обязательным решениям и проверкам без ручного вспоминания процесса.
- Когда я ещё не согласовал продуктовые сведения, я хочу получить короткий следующий шаг, чтобы не начать feature work поверх пустого governance.
- Когда intake согласован, я хочу перенести ответы в источники истины и запустить проверки, чтобы baseline был готов к работе команды.

User Stories:
- Как owner нового проекта, я хочу разговорный запуск bootstrap, чтобы не пропустить обязательные решения.
- Как downstream maintainer, я хочу сохранить продуктовую специфику вне starter core, чтобы baseline оставался переносимым.
- Как agent-operator, я хочу проверяемую последовательность действий, чтобы завершить старт проекта с deterministic QA evidence.

Критерии приемки:
- В `skills/starter-project-bootstrap/SKILL.md` есть workflow для фразы `стартуем новый проект`.
- В `AGENTS.md`, `.memory-bank/code-rules.md`, `.memory-bank/project-context.md` и `CODEX_MEMORY.md` зафиксирован trigger и обязательный bootstrap path.
- README перечисляет новый skill среди reusable skills и объясняет conversational bootstrap.
- QA включает deterministic checks и manual eval cases для нового agent behavior.

Метрика успеха:
- По golden prompt `стартуем новый проект` ассистент начинает с Project Intake Gate и не переходит к feature work до owner approval.
- По golden prompt про конкретный стек ассистент фиксирует stack как downstream decision, а не как starter core default.

Ограничения / что нельзя сломать:
- Нельзя ослабить Project Intake Gate.
- Нельзя добавлять product-specific defaults в starter core.
- Нельзя оставлять обязательное правило только в mirror-файлах.
- Нельзя менять conveyor entrypoints.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: conversational commands, Project Intake Gate, Product Charter gate
- Хороший ответ: на `стартуем новый проект` ассистент читает charter/intake context, объясняет связь с charter, ведёт owner'а по Project Intake, останавливает feature work до approval, затем переносит согласованные ответы в canonical sources и предлагает deterministic QA.
- Провал: ассистент сразу создаёт app scaffold, выбирает стек/provider по умолчанию, пропускает intake approval или оставляет owner'а с raw checklist без следующего шага.
- Критичные edge cases: starter скопирован в новый repo без заполненного charter; пользователь просит начать feature до intake; пользователь хочет конкретный stack; пользователь использует submodule-based shared skills; capability decision неприменим.
- Regression examples / golden prompts:
  - `стартуем новый проект`
  - `я скопировал starter в новый репозиторий, проведи bootstrap`
  - `стартуем новый проект на Next.js и Supabase`
- `Project Intake уже согласован, перенеси ответы в canonical docs`
- `стартуем новый проект`, когда repo skills ещё не linked или есть unmanaged skill conflict
- Сравнение old vs new behavior: раньше ассистент мог дать общий список шагов; новое поведение должно включать skill, Project Intake stop gate, canonical transfer и QA path.
- Minimum pass threshold: 4/4 golden prompts дают charter-safe next step; 0 случаев product-specific default в starter core; 0 случаев feature work до intake approval.
- Scope update 2026-05-04 11:13: bootstrap also must automatically run safe `skills:link`; unmanaged local conflicts require owner approval before `--adopt`.
- Eval owner: downstream owner или maintainer, запускающий bootstrap.
- Если eval не применим, причина: -

Техническая часть:

Область:
- `skills/starter-project-bootstrap/`
- `AGENTS.md`
- `.memory-bank/code-rules.md`
- `.memory-bank/project-context.md`
- `CODEX_MEMORY.md`
- `README.md`

Вне scope:
- Автоматическое заполнение Project Intake без owner input.
- Изменение `task:start`, `task:finish`, `release:local` и QA scripts.
- Добавление product runtime scaffold.

Инвариант:
- Новый downstream-проект сначала получает согласованный Project Intake, затем canonical docs, затем зависимости/skills/QA, и только потом feature/refactor/behavior-change работу.

Общий seam / точка системного изменения:
- Repo-managed skill как reusable conversational bootstrap contract плюс canonical trigger rule.

Публичные интерфейсы / контракты:
- Skill invocation: `$starter-project-bootstrap`
- Conversational triggers: `стартуем новый проект`, `запусти новый проект`, `проведи bootstrap нового проекта`, `я скопировал starter в новый репозиторий`

Допущения и выбранные по умолчанию решения:
- Skill будет процедурным, без отдельного script, потому что основная работа требует owner answers и judgment.
- Existing `skills:link` автоматически подхватит новый skill, так как он живёт в repo `skills/`.
- На bootstrap trigger агент сам запускает `skills:link`; если локальный conflict требует `--adopt`, агент останавливается и просит подтверждение.

План для агента:
- Создать skill folder с `SKILL.md` и `agents/openai.yaml`.
- Синхронизировать trigger rule в canonical docs.
- Обновить README.
- Прогнать lint/typecheck/test или ближайший deterministic subset.
- Провести manual eval по golden prompts.

STAR:
- Situation: starter уже имеет Project Intake Gate, но нет отдельного skill-триггера для conversational bootstrap нового проекта.
- Task: сделать запуск фразой `стартуем новый проект` надёжным и воспроизводимым.
- Action: добавить skill и canonical trigger rule.
- Result: owner получает guided bootstrap path без пропуска обязательных решений.

Profile data:
- Размер затронутой зоны: docs/skill/governance, без runtime code.
- Hook / script density: низкая; existing `skills:link` подхватывает repo skills.
- Lint / typecheck risk: низкий, Markdown/YAML only.
- Perf / coverage / contracts / security сигналы: нет runtime perf/security изменений.
- Dirty-tree / environment leak сигналы: работа идёт в managed `codex/*` worktree.

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
- Rollback path: удалить новый skill и связанные trigger rules.
- План снятия долга: -

Шаги реализации (чекбоксы выполнения):
- [x] Шаг 1: Создать managed worktree и plan file.
- [x] Шаг 2: Добавить `starter-project-bootstrap` skill и metadata.
- [x] Шаг 3: Синхронизировать canonical trigger rules и README.
- [x] Шаг 4: Выполнить deterministic QA и manual eval.
- [x] Шаг 5: Добавить automatic safe `skills:link` step в bootstrap contract.

План QA:
Автоматические проверки:
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run qa:agent`

Eval checks (если применимо):
- [x] Golden prompt: `стартуем новый проект`
- [x] Golden prompt: `стартуем новый проект на Next.js и Supabase`
- [x] Golden prompt: `Project Intake уже согласован, перенеси ответы в canonical docs`
- [x] Golden prompt: `стартуем новый проект`, repo-managed skills ещё не linked
- [x] Golden prompt: `стартуем новый проект`, `skills:link` требует `--adopt`

Ручные / сценарные проверки:
- [x] Проверить, что skill не предлагает product-specific defaults как starter core.
- [x] Проверить, что trigger rule есть в canonical sources, а не только в README.
- [x] Проверить, что `skills:link -- --adopt` не выполняется без owner approval.

Ожидаемые результаты:
- [x] Автоматические проверки проходят.
- [x] Eval cases дают charter-safe next step и stop gate до feature work.

Риски / Откат:
- Риски: слишком жёсткий skill может мешать downstream проектам с уже согласованным intake; mitigated отдельной веткой `если intake уже согласован`.
- Шаги отката: удалить `skills/starter-project-bootstrap/` и revert связанных doc rules.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: Constantine Ivshin
Подтверждено в: чат, 2026-05-04

Лог выполнения:
- [x] Начато: 2026-05-04 11:00
- [x] Завершено: 2026-05-04 11:13

Результаты QA:
Автоматические проверки:
- Команда: `npm run lint`
  - Ожидалось: repo-lint проходит.
  - Факт: PASS, `repo-lint: ok (101 files checked)`.
- Команда: `npm run typecheck`
  - Ожидалось: TypeScript `checkJs` проходит.
  - Факт: PASS.
- Команда: `npm test`
  - Ожидалось: unit/integration tests проходят.
  - Факт: первый запуск показал ожидаемый guard failure в `tests/unit/skills-manager.test.mjs`, потому что managed skill allowlist не включал `starter-project-bootstrap`; после обновления теста PASS, 32/32.
- Команда: `npm run qa:agent`
  - Ожидалось: full deterministic gate проходит.
  - Факт: PASS; stages `lint`, `lint:fix:changed`, `lint-recheck`, `typecheck`, `test`, `build` прошли.
- Команда: `node --input-type=module -e 'import { discoverRepoSkills } from "./scripts/lib/skills-manager.mjs"; ...'`
  - Ожидалось: repo skill discovery включает `starter-project-bootstrap`.
  - Факт: PASS; discovery returned `starter-project-bootstrap` среди 8 managed skills.
- Команда: `npm run skills:status`
  - Ожидалось: diagnostic status показывает новый skill.
  - Факт: command returned nonzero because local `$CODEX_HOME/skills` has missing/conflicting unmanaged links, but output includes `starter-project-bootstrap` with status `missing`; это local setup state, не source regression.
- Команда: `git diff --check`
  - Ожидалось: no whitespace errors.
  - Факт: PASS.
- Команда: `npm run lint` after safe `skills:link` scope update
  - Ожидалось: repo-lint проходит.
  - Факт: PASS, `repo-lint: ok (101 files checked)`.
- Команда: `npm run qa:agent` after safe `skills:link` scope update
  - Ожидалось: full deterministic gate проходит после обновления bootstrap contract.
  - Факт: PASS; stages `lint`, `lint:fix:changed`, `lint-recheck`, `typecheck`, `test`, `build` прошли.

Ручные / сценарные проверки:
- Проверка: canonical applicability check.
  - Ожидалось: trigger rule есть в `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`, README and mirrors; обязательное правило не живёт только в `.cursorrules`.
  - Факт: PASS; `rg` подтвердил trigger в primary sources and mirrors.
- Проверка: product-specific defaults guard.
  - Ожидалось: skill не предлагает Next.js, Supabase, auth/payment provider или другой stack/provider как starter core default.
  - Факт: PASS; skill запрещает hardcode stack/provider defaults and routes such choices to downstream adapters/profiles.
- Проверка: safe skill linking guard.
  - Ожидалось: bootstrap trigger автоматически запускает `npm run skills:link`, но не запускает `--adopt` без owner approval.
  - Факт: PASS; rule зафиксирован в `skills/starter-project-bootstrap/SKILL.md`, `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`, README and mirrors.

Eval results:
- Case: `стартуем новый проект`
  - Ожидалось: ассистент использует `$starter-project-bootstrap`, читает charter/intake context, определяет bootstrap state, начинает с Project Intake Gate и не начинает feature work.
  - Факт: PASS by manual rubric; trigger, required reads, state detection, stop gates and response shape are present in skill and canonical rules.
  - PASS/FAIL: PASS
- Case: `стартуем новый проект на Next.js и Supabase`
  - Ожидалось: ассистент не превращает Next.js/Supabase в starter core defaults; фиксирует их как downstream choices requiring owner approval.
  - Факт: PASS by manual rubric; prohibited behavior and code-rules forbid provider/stack hardcoding in starter core.
  - PASS/FAIL: PASS
- Case: `Project Intake уже согласован, перенеси ответы в canonical docs`
  - Ожидалось: ассистент переходит к canonical transfer list and QA path, not back to generic checklist.
  - Факт: PASS by manual rubric; skill has `intake-approved` state, canonical transfer file list, and dependency/QA path.
  - PASS/FAIL: PASS
- Case: `стартуем новый проект`, repo-managed skills ещё не linked
  - Ожидалось: ассистент выполняет `npm ci` при необходимости и `npm run skills:link`, затем продолжает Project Intake workflow.
  - Факт: PASS by manual rubric; skill availability bootstrap is now an early workflow step and is mirrored in canonical rules.
  - PASS/FAIL: PASS
- Case: `стартуем новый проект`, `skills:link` требует `--adopt`
  - Ожидалось: ассистент останавливается, объясняет conflict and asks owner approval before `npm run skills:link -- --adopt`.
  - Факт: PASS by manual rubric; stop gate and README/AGENTS rules require explicit owner approval.
  - PASS/FAIL: PASS

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
- `plans/2026-05-04-1100-starter-project-bootstrap-skill.md`
- `skills/starter-project-bootstrap/SKILL.md`
- `skills/starter-project-bootstrap/agents/openai.yaml`
- `tests/unit/skills-manager.test.mjs`
