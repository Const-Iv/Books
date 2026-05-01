Название задачи: GitHub CI failure audit для системного разбора падений
Тип задачи: behavior-change
Дата создания: 2026-04-30 21:53

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Поддерживает цель starter baseline: команды получают переносимую операционную основу, где GitHub CI падения разбираются воспроизводимо, а не вручную по уведомлениям.
- Сохраняет deterministic QA и safe task flow: audit только читает GitHub, группирует причины и отделяет code regressions от owner/platform blockers.

Цель изменения:
- Сделать reusable `gh-fix-ci` workflow пригодным для проверки recent scheduled/nightly failures across repositories, чтобы повторяющиеся падения можно было устранять через общий seam, а не разовыми ручными кликами в GitHub UI.

Целевая аудитория проекта:
- Инженеры и agent-operators, которые ведут задачи через Codex/worktree conveyor.
- Технические лиды и downstream maintainers, которые отвечают за переносимую QA/governance основу.

Продуктовая спека:

Проблема / JTBD:
- Пользователь пытается понять, какие GitHub CI падения повторялись за последние две недели, но сейчас видит только список уведомлений без группировки причин.
- Он использует starter, чтобы быстро отличить кодовую регрессию от внешнего blocker и выбрать безопасный следующий шаг.

Целевая аудитория изменения:
- Operator, который расследует GitHub Actions failures в starter-based проектах.

Сценарии использования:
- Когда nightly падает несколько дней подряд, пользователь запускает audit и видит одну сгруппированную причину вместо десятков одинаковых уведомлений.
- Когда GitHub не запускает job из-за billing/spending limit, пользователь видит owner/platform blocker и не пытается исправлять это кодом.

Требования:
- Audit должен работать по явному списку repos, по CI notifications и по доступным repos при явном broad-audit запросе.
- Отчёт должен группировать повторы по repo, workflow, branch scope и failure class.
- Отчёт должен отделять `account_billing_blocker` от deterministic code regressions.
- PR-focused диагностика должна остаться совместимой.

Job Stories:
- Когда у меня накопились GitHub CI notifications, я хочу получить сгруппированный список причин, чтобы чинить общий класс проблемы один раз.
- Когда failure вызван настройками аккаунта или лимитом GitHub, я хочу увидеть это отдельно, чтобы не тратить время на ложный code fix.

User Stories:
- Как operator starter-based проекта, я хочу запускать recent CI audit из shared skill, чтобы воспроизводимо проверять падения за период.
- Как downstream maintainer, я хочу видеть repeated failure groups, чтобы безопасно выбрать update baseline, product fix или owner action.

Критерии приемки:
- Новый audit-скрипт возвращает JSON и human-readable report.
- Повторяющиеся QA failures группируются в один класс.
- Billing/spending limit failures классифицируются как owner/platform blocker.
- Skill docs объясняют, когда использовать recent audit и как не путать blocker с code regression.

Метрика успеха:
- Один audit run заменяет ручной просмотр GitHub notifications за период.
- Повторы одного failure class видны как grouped count.

Ограничения / что нельзя сломать:
- Нельзя hardcode'ить конкретные downstream repos.
- Нельзя редактировать downstream source напрямую из starter.
- Нельзя печатать secrets из logs.
- Нельзя считать billing blocker code regression.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: `gh-fix-ci` skill behavior for recent GitHub Actions failures.
- Хороший ответ: агент сначала собирает GitHub facts, группирует повторы, отделяет owner/platform blockers, затем предлагает самый узкий code fix только для подтверждённых code regressions.
- Провал: агент чинит unrelated code при billing blocker, игнорирует scheduled/nightly failures вне PR, или показывает raw run ids без human summary.
- Критичные edge cases: logs unavailable; failed job never started; many repeated runs of the same workflow; explicit broad account audit; notification-only repo list.
- Regression examples / golden prompts: "Проверь на GitHub все ошибки за последние две недели"; "Почему nightly снова падает?"; "Разбери CI по уведомлениям"; "Почини billing failure кодом".
- Сравнение old vs new behavior: old skill supports only current PR checks; new skill supports recent workflow audit and failure classification.
- Minimum pass threshold: deterministic test proves grouping and billing classification; live audit produces grouped real report without source edits.
- Eval owner: task operator.

Техническая часть:

Область:
- `skills/gh-fix-ci/`
- `tests/unit/`

Вне scope:
- Direct fixes inside `ConstantBB/Agent_Const`, `Const-Iv/WannaDinner`, `cerg13/SuperPos`.
- GitHub billing/account changes.
- Finish/merge/publish downstream tasks.

Инвариант:
- Recent CI audit is read-only and reusable; code changes happen only after failure class supports a local fix path.

Общий seam / точка системного изменения:
- Shared `gh-fix-ci` skill gets a reusable recent Actions audit script instead of relying on ad-hoc GitHub UI inspection.

Публичные интерфейсы / контракты:
- `python skills/gh-fix-ci/scripts/inspect_actions_failures.py --repo . --repo-slug owner/repo --since <date> [--json]`
- `python skills/gh-fix-ci/scripts/inspect_actions_failures.py --repo . --from-notifications --since <date>`
- Existing `inspect_pr_checks.py` remains unchanged.

Допущения и выбранные по умолчанию решения:
- По умолчанию не правим downstream repos из starter task.
- Broad audit допустим только при явном запросе пользователя; текущий запрос это разрешает для read-only GitHub inspection.
- SuperPos billing failures требуют owner action, не code patch.

План для агента:
- Добавить read-only recent Actions audit script.
- Обновить `gh-fix-ci` skill instructions.
- Добавить deterministic unit test with fake `gh`.
- Запустить targeted test, live audit и релевантный QA gate.

STAR:
- Situation: GitHub notifications show repeated CI failures across repos.
- Task: turn manual inspection into reusable starter skill support and classify real failures.
- Action: add recent Actions audit with grouping and owner blocker detection.
- Result: operator can separate baseline/product regressions from billing blockers reproducibly.

Profile data:
- Размер затронутой зоны: small shared skill + one unit test.
- Hook / script density: low; no workflow changes.
- Lint / typecheck risk: low for docs/test, medium for new Python script.
- Perf / coverage / contracts / security сигналы: script fetches logs read-only; no secrets intentionally printed beyond snippets, no token output.
- Dirty-tree / environment leak сигналы: worktree already task-specific; no downstream source edits.

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
- Rollback path: удалить новый audit script/test и откатить skill docs.
- План снятия долга: -

Шаги реализации (чекбоксы выполнения):
- [x] Снять GitHub Actions facts за 2026-04-16..2026-04-30.
- [x] Добавить recent Actions audit script.
- [x] Обновить `gh-fix-ci` instructions.
- [x] Запустить deterministic checks и live audit.
- [x] Зафиксировать результаты QA и changed files.

План QA:
Автоматические проверки:
- [x] `node --test tests/unit/gh-actions-failure-audit.test.mjs`
- [x] `python3 -m py_compile skills/gh-fix-ci/scripts/inspect_actions_failures.py`
- [x] `npm run qa:security`
- [x] `npm run qa:coverage:critical`
- [x] `npm run qa:agent`

Eval checks:
- [x] Golden prompt "Проверь на GitHub все ошибки за последние две недели": report groups repeated failures and separates billing blockers.
- [x] Golden prompt "Почини billing failure кодом": expected answer refuses code patch and routes to owner/platform action.

Ручные / сценарные проверки:
- [x] Live audit against GitHub failures since 2026-04-16.

Ожидаемые результаты:
- [x] Unit test PASS.
- [x] Live audit returns grouped failures matching GitHub investigation.
- [x] Final answer separates updated baseline capability from downstream/product/account blockers.

Риски / Откат:
- Риски: GitHub API/log availability can vary; script must report unavailable logs instead of hiding them. Broad audit samples one latest run per repo/workflow by default to avoid slow repeated log downloads; `--group-by-branch` keeps branch-level separation when needed.
- Шаги отката: revert the new script, test, and `gh-fix-ci` doc update.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: пользователь прямым запросом "Проверь ... и сделай так, чтобы устранить их системно."
Подтверждено в: 2026-04-30

Лог выполнения:
- [x] Начато: 2026-04-30 21:53
- [x] Завершено: 2026-04-30 22:20

Результаты QA:
Автоматические проверки:
- Команда: `node --test tests/unit/gh-actions-failure-audit.test.mjs`
  - Ожидалось: fake `gh` audit groups repeated deterministic regressions and billing blockers.
  - Факт: PASS.
- Команда: `python3 -m py_compile skills/gh-fix-ci/scripts/inspect_actions_failures.py`
  - Ожидалось: Python script syntax is valid.
  - Факт: PASS.
- Команда: `npm run qa:security`
  - Ожидалось: secret/dependency security gate passes.
  - Факт: PASS.
- Команда: `npm run qa:coverage:critical`
  - Ожидалось: critical manifest validates new GitHub audit guard.
  - Факт: PASS, 8 critical modules validated.
- Команда: `npm run qa:agent`
  - Ожидалось: fixed gate order passes.
  - Факт: PASS after fixing typecheck feedback in the new unit test.

Ручные / сценарные проверки:
- Проверка: live GitHub audit for `ConstantBB/Agent_Const`, `Const-Iv/WannaDinner`, `cerg13/SuperPos` since `2026-04-16T00:00:00Z`.
  - Ожидалось: grouped report with repeated failures and billing blockers separated.
  - Факт: PASS; 77 failed runs grouped into 5 reasons: 56 `account_billing_blocker` in `cerg13/SuperPos`, 21 `deterministic_regression` across `ConstantBB/Agent_Const` and `Const-Iv/WannaDinner`.
- Проверка: live notification-mode audit with `--from-notifications --max-lines 5`.
  - Ожидалось: repositories are discovered from CI notifications and short snippets still keep the actual failure signal.
  - Факт: PASS; same 77 failed runs / 5 grouped reasons, billing snippets keep the billing annotation instead of GitHub hint text.

Eval results:
- Case: "Проверь на GitHub все ошибки за последние две недели"
  - Ожидалось: gather GitHub facts, group repeats, separate code regressions from owner/platform blockers.
  - Факт: live audit did that; final response can summarize the 5 grouped reasons instead of raw run ids.
  - PASS/FAIL: PASS.
- Case: "Почини billing failure кодом"
  - Ожидалось: refuse code patch for billing/spending limit and route to owner/platform action.
  - Факт: `account_billing_blocker` classification and skill docs encode this behavior.
  - PASS/FAIL: PASS.

Изменённые файлы:
- `AGENTS.md`
- `.memory-bank/qa-playbook.md`
- `CODEX_MEMORY.md`
- `plans/2026-04-30-2153-github-ci-failure-audit.md`
- `skills/gh-fix-ci/SKILL.md`
- `skills/gh-fix-ci/scripts/inspect_actions_failures.py`
- `tests/coverage-critical.manifest.json`
- `tests/unit/gh-actions-failure-audit.test.mjs`
