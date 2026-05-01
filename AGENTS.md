## Scope

These rules apply to the whole repository.

## Product Charter (Mandatory)

Канонический product source of truth: `.memory-bank/product-charter.md`.

Миссия:
- Мы даём команде переносимую операционную основу для старта нового проекта с первого дня: понятные правила работы, безопасный task flow, воспроизводимые проверки, memory-bank governance, TRIZ-эскалацию и разговорное управление задачами без ручной сборки заново.

Видение:
- `new-project-starter` становится базовым слоем для новых репозиториев: команда подключает его как baseline, сразу получает понятный способ заводить, проверять, завершать и публиковать задачи, а продуктовую специфику добавляет поверх через adapters/profiles без изменения core governance.

Цель проекта:
- Поддерживать runnable local-first starter baseline, который можно подключать или копировать в downstream проекты, чтобы они сразу имели canonical sources of truth, managed worktrees, deterministic QA, task state/history, operational docs и reusable shared skills.

Целевая аудитория:
- Команды, которые начинают новый проект или новый репозиторий и хотят с первого дня работать по понятным правилам без ручной сборки governance заново.
- Технические и продуктовые лиды, которые отвечают за переносимую операционную основу: task flow, проверки, правила, память проекта и безопасное завершение задач.
- Инженеры и agent-operators, которые ведут задачи через Codex/worktree conveyor и должны получать воспроизводимый, проверяемый процесс.
- Downstream maintainers, которые подключают starter как baseline и добавляют продуктовую специфику поверх него через adapters/profiles.
- Конечные пользователи downstream-продуктов не являются целевой аудиторией starter core; их аудитория должна быть отдельно описана в product charter и product specs downstream-проекта.

JTBD:
- Когда начинается новый проект, я хочу получить готовую и переносимую операционную основу, чтобы команда сразу работала по ясным правилам, проверяла изменения воспроизводимо и не собирала governance, task flow и QA заново.

Product Charter Gate:
- Перед любым продуктовым решением, feature, behavior, process или governance изменением нужно сначала прочитать `.memory-bank/product-charter.md` целиком и сверить решение с миссией, видением, целью, целевой аудиторией и `JTBD`.
- Feature, behavior, process и governance изменения должны явно показывать, какую часть миссии, видения, цели, целевой аудитории или `JTBD` они поддерживают. Maintenance-изменения должны явно сохранять charter.
- Нельзя реализовывать изменение, которое противоречит `.memory-bank/product-charter.md`, ослабляет переносимость baseline, deterministic QA, safe task flow, source-of-truth governance или hardcode'ит product-specific поведение в starter core.
- В Plan mode все уточняющие вопросы, варианты выбора и рекомендации ассистента должны быть отфильтрованы через Product Charter; recommended option обязан явно сохранять или усиливать миссию, видение, цель, целевую аудиторию и `JTBD`, а charter-конфликтный вариант нельзя подавать как равнозначно рекомендуемый.
- Если запрос конфликтует с charter, ассистент обязан остановиться, коротко объяснить конфликт и предложить ближайший безопасный вариант.
- Product charter нельзя обходить через локальный patch, mirror-файл, temporary exception или ad-hoc script; при изменении charter сначала обновить `.memory-bank/product-charter.md`, `AGENTS.md`, релевантные `.memory-bank/*` и `CODEX_MEMORY.md`.
- Reusable shared skills можно versioned хранить в `skills/` и публиковать в `$CODEX_HOME/skills` через repo scripts; downstream проекты могут подключать starter как git submodule и линковать skills через `skills-manage.mjs --source vendor/new-project-starter/skills`; `.system`, plugin-managed, product-specific skills и generated skill trees (`.agents/skills`, `.claude/skills`, `.cursor/skills`) не являются частью starter core и не импортируются bulk-copy.
- `skills/starter-rule-sync/` — основной project-local skill для ручного и автоматического rule sync workflow; автоматизации должны вызывать этот skill, а не дублировать scan/report логику. `rule-sync:*` commands остаются deterministic execution layer, default scan window идёт от последнего saved scan snapshot до текущего запуска, а импорт reusable правил требует owner approval, managed worktree и QA.
- `rule-sync:report --latest` должен иметь fallback от короткого нулевого follow-up scan к предшествующему meaningful scan, если latest scan выглядит как technical probe, созданный сразу после содержательного run; настоящий нулевой scan за полный период нельзя подменять старым отчётом.
- Rule-sync owner report должен начинаться с decision proposals через `Связь с charter проекта -> Цель решения -> JTBD -> Job Stories -> User Stories -> Критерии приемки`; candidate ids допустимы только как traceability для approval JSON.
- Rule-sync import не должен переносить сырой QA/TRIZ log как готовое правило: logs используются как evidence, а import text переписывается в portable starter invariant с source traceability.
- Owner-facing reports должны сначала давать человеческий смысл, решение и следующий шаг; candidate ids, commits, task ids и source snippets используются только как проверяемая traceability и не заменяют summary.
- `skills/starter-rule-share/` — основной project-local skill для outbound sharing текущего подтверждённого starter baseline в выбранные активные downstream проекты. `rule-share:*` commands остаются approval-safe execution layer: scan/report read-only, apply-plan только dry-run task seeds, список проектов берётся из ignored `runtime/rule-share/config.json`, а direct bulk-copy во все локальные проекты запрещён. Guarded one-run mode допустим только по явному owner request или ignored standing approval: перенос идёт через downstream managed task worktrees и deterministic QA, manual-review/blocked проекты пропускаются, finish/merge/publish не выполняются без отдельного явного разрешения. Для copied-baseline `prepare_rule_import` task seed должен включать canonical/mirror parity (`AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`, README, `.cursorrules`, `CLAUDE.md`), QA/TRIZ evidence и явную остановку перед publish gate.

Project Intake Gate для нового downstream-проекта:
- Новый проект, который стартует от starter baseline, сначала заполняет Project Intake по `plans/_project_intake_template.md`; feature/refactor/behavior-change реализация начинается только после owner approval по всем обязательным пунктам.
- Обязательные сведения: миссия, видение, цель, целевая аудитория, `JTBD`, продуктовые ограничения, сценарии использования, метрики успеха, границы core/adapters/profiles, stack/runtime choices, QA/release choices, agent/eval ownership, source-of-truth files, rules/memory ownership и applicable capability decisions.
- Capability decisions в Project Intake заполняются only-if-applicable: auth / user identity, payments / billing, credits / limits, analytics / consent, i18n / localization, async jobs / workers, API documentation, service layout и runtime-specific rules. Применимый блок требует owner approval до feature/refactor/behavior-change работы в этой зоне; неприменимый блок явно помечается как not applicable.
- Starter core не должен hardcode'ить provider-specific или stack-specific defaults: конкретный frontend stack, identity provider, payment providers, fixed locales, Python-only decorators, database queue или single-worker model допустимы только как downstream adapter/profile choice.
- Security-sensitive capability decisions должны фиксировать portable invariants до implementation: token/session storage и revocation для auth; webhook verification и idempotency для payments; audit trail, precision, pre-execution checks and race protection for credits/limits; consent and failure isolation for analytics; completeness checks for i18n; retry/cancellation/idempotency for async jobs; documentation source of truth for APIs.
- Каждый пункт intake должен иметь статус `согласовано` или зафиксированный blocker; placeholder, `TBD`, “заполним потом” и несогласованные допущения не считаются готовым bootstrap.
- После approval ответы из intake переносятся в `.memory-bank/product-charter.md`, `.memory-bank/project-context.md`, `.memory-bank/architecture-map.md`, `.memory-bank/code-rules.md`, `AGENTS.md`, `CODEX_MEMORY.md`, `README.md` и другие релевантные canonical sources.
- Если по пункту нельзя выбрать безопасный вариант без владельца продукта, ассистент задаёт короткий choice question и рекомендует только charter-safe option.

Eval Gate для AI/agent behavior:
- Для изменений, влияющих на Plan mode, вопросы/рекомендации ассистента, Product Charter gate, Project Intake Gate, rule-sync owner reports, rule-share owner reports, conversational commands, TRIZ decisions или другой AI/agent behavior, plan file обязан содержать `Eval spec`.
- `Eval spec` должен фиксировать: agent surface, хороший ответ, провал, критичные edge cases, regression examples/golden prompts, способ сравнения old vs new behavior и minimum pass threshold.
- Acceptance criteria отвечают “что должно быть возможно для пользователя”; evals отвечают “насколько качественно агент выбирает, объясняет, рекомендует и соблюдает правила”.
- QA evidence для такого изменения должно включать eval result или явно зафиксированный gap с ближайшей deterministic компенсацией.

## Language Requirements

- Все ответы ассистента пользователю по умолчанию на русском, если пользователь явно не попросил другой язык.
- Все файлы в `plans/` и operator-facing docs должны быть на русском.
- Код, идентификаторы, API fields и inline code comments должны быть на английском.

## Vibe UX & Safety Standing Orders (Mandatory)

- Предпочитать simplest viable implementation.
- Перед любым mutating action кратко объяснять, что меняется и почему.
- Не выдавать placeholder outputs (`// ... existing code`, `TODO later`, частичные заглушки) за готовую реализацию.
- По умолчанию использовать diff-first output; полные файлы давать только по явному запросу.
- Не выводить секреты, токены, ключи, credentials, private notes.
- Если найден security-риск, помечать его `WARNING:` и сразу предлагать безопасную альтернативу.
- Не внедрять insecure patterns даже по явному запросу; коротко объяснять риск и вести к безопасному варианту.
- Файлы с реальными ключами, токенами, паролями и приватными credential-значениями считать read-only.
- Не удалять, не truncate'ить, не full-overwrite'ить и не rename-replace'ить существующий файл без явного подтверждения и rollback-ready path.
- Не удалять user data или существующее поведение без явного запроса и rollback-ready notes.
- Для user-facing продуктовых решений использовать простой продуктовый язык: сначала показать связь с существующим project charter, затем цель изменения, `JTBD`, Job Stories, User Stories и критерии приемки. `Миссия` и `Видение` нельзя создавать для конкретной задачи: они существуют только на уровне проекта и берутся из `.memory-bank/product-charter.md` или Project Intake нового downstream-проекта.
- Любое предложение продуктового решения, включая короткий ответ в чате, нельзя оформлять только как `Summary`, `Key Changes`, список implementation steps или технический sketch. Если нужен полный разбор, использовать `Связь с charter проекта -> Цель изменения/решения -> JTBD -> Job Stories -> User Stories -> Критерии приемки`; если пользователь задал короткий вопрос или нужен lightweight-вариант, дать хотя бы один charter anchor до implementation details.
- User-facing ответы по governance/rule-sync решениям должны быть charter-anchored и коротко объяснять “что это значит” до технических деталей; нельзя оставлять владельцу только raw ids, snippets или список файлов.
- В будущих plan files техническая часть начинается ниже верхнего продуктового блока `Связь с charter проекта -> Цель изменения -> Целевая аудитория проекта -> Продуктовая спека`.
- Новый downstream-проект до feature work проходит Project Intake Gate: все обязательные сведения из `plans/_project_intake_template.md` заполнены, согласованы owner'ом и перенесены в canonical sources.
- Для AI/agent behavior changes product spec включает `Eval spec`; без него нельзя считать acceptance criteria достаточными.
- В `Summary`, `TL;DR`, `Связь с charter проекта`, `Цель изменения`, `Целевая аудитория`, `JTBD`, `Job Stories` и `User Stories` не использовать технические термины без твердой необходимости; писать про ситуацию, ценность и ожидаемый результат понятным пользовательским языком. Блоки `Миссия` и `Видение` допустимы только для project charter или Project Intake, а не для task/spec output.
- Технические детали добавлять только там, где они помогают понять или реализовать решение. Их можно встроить в текст; если агенту нужен точный implementation context, добавлять отдельный блок `План для агента`.
- В user-facing ответах не использовать необъяснённый Git/process-жаргон; если термин нужен, сразу давать простой смысл рядом, например `diverged` = “локальная папка и GitHub разошлись”.
- Перед refactor сначала искать существующие тесты на затронутый seam и гонять ближайший baseline до/после каждого логического change batch.
- Для любого code-changing task доказательством корректности считаются только детерминированные проверки.
- После каждого логического change batch нужно прогонять хотя бы одну релевантную deterministic check.
- Диалог с пользователем держать на русском, а code/comments/identifiers — на английском.
- Если high-impact ambiguity нельзя снять из репо, задавать один короткий choice question.

## Karpathy Behavioral Overlay (Mandatory)

- Для non-trivial задач явно фиксировать assumptions, если они влияют на поведение, scope, data safety или rollout risk.
- Если есть несколько правдоподобных трактовок, коротко показать варианты вместо silent choice.
- Предпочитать simplest implementation, которая полностью закрывает запрос; не добавлять speculative abstraction без явной нужды.
- Делать surgical diffs: каждая изменённая строка должна вести к requested outcome или к cleanup, вызванному самой правкой.
- Для bugfix/regression предпочитать `reproduce -> fix -> verify`, а не reasoning-only fixes.
- Для trivial low-risk edits не добавлять лишнюю церемонию.

## Codex-First Governance (Mandatory)

- Обязательные source-of-truth файлы: `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`; product charter: `.memory-bank/product-charter.md`.
- `.cursorrules` — compatibility mirror, но не единственный источник обязательных правил.
- Для любых process/git/QA изменений обновлять Codex-primary source в той же задаче.
- Для системных багов и high-impact regressions использовать `STAR + profile data + repo-RAG` до выбора финального fix-path:
  - `STAR`: Situation, Task, Action, Result.
  - `profile data`: file size / hook density / lint density, perf / coverage / contracts / security результаты, dirty-tree и environment-leak сигналы.
  - `repo-RAG`: смотреть `plans/*`, `Docs/qa-implementation-log.md`, `Docs/change-ledger.md`, `.memory-bank/*`, `CODEX_MEMORY.md`.
- Для регрессий по умолчанию исправлять shared seam и добавлять reusable guard. Локальный patch без guard — только как `Exception` с reason, risk, rollback и debt-removal follow-up.
- Если есть `historical_recurrence` или `cross_module_conflict`, не фиксировать финальный путь решения до TRIZ-pass.
- Перед завершением задачи делать Codex applicability check:
  - подтвердить, что новые/обновлённые правила есть в `AGENTS.md` и/или `.memory-bank/*`;
  - подтвердить, что обязательное правило не осталось только в `.cursorrules`;
  - зафиксировать этот check в plan QA results, если использовался plan file.

## BMAD Method Integration (Mandatory When BMAD Is Used)

- Если в проекте используется BMAD, каноническая установка должна жить в `_bmad/`; generated teammate entrypoints — в `.claude/skills/` и `.cursor/skills/`.
- BMAD project context должен опираться на `.memory-bank/project-context.md`; для governance и operational lessons BMAD-потоки также читают `AGENTS.md`, `.memory-bank/*` и `CODEX_MEMORY.md`.
- `_bmad-output/` — worktree-local scratch для BMAD artifacts и не должен коммититься или использоваться как source of truth.
- В parallel work BMAD запускать внутри task-specific worktree, созданного через `task:start`, и по возможности держать отдельный chat/context на workflow.
- BMAD дополняет conveyor, но не отменяет его обязательные gate'ы: plan approval, `task:qa:agent`, preview checkpoint contract, `task:finish:core`, merge/publish и operational-doc capture.
- Для small isolated bugfix/feature предпочитать BMAD Quick Flow; для cross-module, contract или architecture changes поднимать PRD/architecture/story workflow до implementation.

## Mandatory Workflow (Plan Mode Only): Plan -> Approval -> Implementation

Для feature/refactor/behavior-change задач в collaboration mode `Plan`:

1. Сначала прочитать `.memory-bank/index.md` и только релевантные memory-файлы.
2. До любых code edits создать план-файл в `plans/` по шаблону `plans/_template.md`.
3. Именование плана: `YYYY-MM-DD-HHMM-<short-slug>.md`.
4. Использовать checkboxes статуса (`[ ] Не начато`, `[ ] В процессе`, `[ ] Завершено`).
5. Plan file должен содержать продуктовую спеку: проблема / `JTBD`, целевая аудитория изменения, сценарии использования, требования, критерии приемки, метрика успеха и ограничения / что нельзя сломать.
6. Если задача меняет AI/agent behavior, plan file должен содержать `Eval spec` и QA plan должен включать eval evidence.
7. Если при подготовке или уточнении плана нужен choice question, сначала сверить варианты и рекомендацию с `.memory-bank/product-charter.md`; в вопросе кратко показать charter-safe recommendation или объяснить, почему безопасного recommended option нет.
8. После создания плана остановиться и запросить явное подтверждение пользователя.
9. Не менять source files до подтверждения.
10. После подтверждения:
   - выполнять шаги по порядку;
   - отмечать завершённые чекбоксы `[x]`;
   - записывать QA execution и results в тот же план.
11. При material scope change обновлять план и снова просить re-approval.
12. Перед завершением убедиться, что план содержит финальный статус и список changed files.

В collaboration mode `Default` этот workflow опционален и применяется только по явному запросу пользователя.

## Chat Conveyor Commands (Default Mode)

В `Default` режиме ассистент должен понимать разговорные формулировки и исполнять их через канонические скрипты репозитория.

### Main Branch Protection

- В `main` нельзя вносить изменения без явного разрешения пользователя на direct-main правку в рамках текущей задачи.
- По умолчанию любые feature/refactor/bugfix/process/governance изменения выполняются в отдельном task-specific worktree и отдельной ветке `codex/*`.
- Если ассистент находится на `main` и пользователь не дал явного разрешения менять `main`, нужно остановиться до mutating action и предложить безопасный путь: создать managed worktree через `task:start`, сначала закоммитить/stash'нуть текущие изменения, либо получить явное direct-main разрешение для маленькой низкорисковой правки.
- На `main` без отдельного worktree допустимы read-only inspection, `git status`/`git diff`, а также явно запрошенные merge/release flows после обязательных QA gate'ов.

### Start Task / Worktree

Канонический интент: `Создай новый worktree "<Тело задачи>"`.

- parse title и передавать полный user request как `--seed-message`;
- проверять repo state;
- если working tree dirty, останавливаться до `task:start`; `--allow-dirty` больше не использовать, явно сообщать, что новый worktree не создан, и предлагать безопасные next steps (`git diff`, commit текущей работы или `git stash -u`);
- запускать `npm run task:start -- --title "<Тело задачи>" --seed-message "<полный запрос>"`;
- создавать `codex/*` branch и отдельный managed worktree;
- managed local path должен жить под `~/.codex/worktrees/<taskId>/<source-project>-<task-slug>`;
- писать task state в `.git/codex-task-pipeline/tasks/*.json`;
- писать runtime history в `.git/codex-task-pipeline/history/events.ndjson`;
- bootstrap dependencies в новом worktree через shared dependency preflight;
- best-effort открывать новый worktree/chat; если локальная автоматизация умеет, можно auto-send seed message, но падение auto-open/auto-send не должно ломать START.

### Finish Task

Канонический интент: `Заверши задачу`.

- работать только на `codex/*` branch;
- использовать `npm run task:finish:core`, а не свободный ad-hoc flow;
- перед commit/merge/publish task QA должен быть PASS;
- если `HEAD == qaLastPassSha`, переиспользовать QA checkpoint вместо повторного full task QA;
- если finish стартует из dirty task tree, `task:finish:core` должен сначала зафиксировать task commit/checkpoint, затем прогнать task QA уже на committed `HEAD`, и только после этого переходить к publish stage;
- если task branch не получила собственного task commit, её `HEAD` уже содержится в `main`, а worktree clean, `task:finish:core` должен пропустить publish stage, записать `publishStatus=skipped_already_merged` и всё равно довести cleanup до `passed|kept`;
- shared operational docs сначала capture'ить из task branch, а sync'ить обратно только на publish/release stage как single-writer artifacts;
- `task:finish:core` не должен спрашивать legacy `--preview ok|skip`;
- для cleanup/publish resume из `main` использовать `--task-id <id>` как канонический селектор, `--branch codex/<task-branch>` оставить совместимым fallback;
- для starter baseline `task:qa:agent` всё равно пишет `previewPreparedSha`, но preview status по умолчанию `not_supported`, пока проект не добавит свой preview adapter;
- перед cleanup всегда спрашивать явно и в фиксированном формате:
  `1. Удалить`
  `2. Оставить`
  Ответ `1` маппится на удаление локального worktree/branch, ответ `2` — на сохранение.
- delete cleanup считается успешно завершённым только когда `cleanupStatus` в task state/history стал `passed` и проверено, что exact `state.worktreePath` исчез из filesystem и `git worktree list`, managed task root `$CODEX_HOME/worktrees/<taskId>/` удалён, а task-scoped leftovers отсутствуют; одного `cleanupDecision`, похожего имени папки или exit code недостаточно.
- keep cleanup считается завершённым только когда `cleanupStatus` стал `kept` после явного выбора `2. Оставить`.
- если после finish найден похожий worktree другого `taskId`, branch или проекта, сообщать его как отдельный pending cleanup и снова задавать фиксированный выбор `1. Удалить` / `2. Оставить`; нельзя засчитывать или удалять его как cleanup текущей задачи.
- optional repo script `task:finish:cleanup` может добавить только task-scoped `extraPaths` и/или вернуть `blocked`; starter core не делает глобальный sweep вне текущего task scope.

### Merge Semantic Command

Интенты типа `слей в main`, `влей в main`, `merge в main` мапятся на `npm run task:merge:main`.

- merge/publish разрешён только после task QA;
- local `main` должен быть clean;
- после merge на `main` обязательно прогнать `qa:agent`;
- single-writer operational docs синхронизируются только на publish/release stage.

### Release Semantic Command

Для starter core используется `release:local`, а не обязательный deploy-to-server pipeline.

- интенты типа `локально опубликуй`, `сделай local release`, `обнови локальный baseline` мапятся на `npm run release:local`;
- `release:local` требует clean и synced `main`;
- если в будущем проект добавит deploy profile, он должен жить поверх core baseline, а не заменять его.

## QA Requirements

- Для задач с plan file план должен содержать automated checks, manual verification steps, expected outcomes и actual results.
- Primary deterministic gate: `npm run qa:agent`.
- Fixed gate order: `lint -> lint:fix:changed -> lint -> typecheck -> test -> build`.
- `qa:smoke:pr` и `qa:e2e:nightly` в starter baseline должны оставаться реальными process scenarios, а не no-op wrappers.
- `qa:smoke:pr` и `qa:e2e:nightly` в starter baseline — это process-level temp-repo scenarios, а не browser smoke.
- `qa:coverage:critical` — manifest-driven critical regression guard: каждый critical module обязан иметь связанный test set.
- `qa:perf:critical` использует `Docs/qa-perf-baseline.json`; если baseline меняется, обновлять файл в той же задаче.
- `qa:security` обязательно включает secret scan и dependency audit.
- Перед/внутри `qa:agent` обязателен dependency preflight; в fresh task worktrees тот же seam должны использовать `task:start` и `task:test`.
- Если QA создаёт временные worktrees / task state / fixtures, cleanup обязателен, а failure cleanup считается QA fail.
- Перед finish / merge / release обязателен полный PASS `npm run qa:agent`.
- Для bugfix-задач без planning mode эквивалентное QA evidence нужно фиксировать в ответе по задаче и в `Docs/qa-implementation-log.md`.
- Для process/governance implementation полезно дописывать в `Docs/qa-implementation-log.md` stage history, failures, fixes и rollback notes.
- Test quality для capability changes должен быть behavior-focused: happy path, empty/boundary inputs, validation/error paths, permissions, retry/timeout/cancellation, idempotency, concurrency, state transitions, provider failure isolation и user-visible states выбираются по релевантности. Bugfix требует regression test или явно зафиксированный deterministic gap; skipped/focused tests, arbitrary sleeps и tests that pass regardless of implementation не считаются trustworthy evidence.
- Performance и state-safety fixes должны явно сохранять пользовательские данные и публичные behavior contracts; read-only/internal automatic updates не считаются user changes без пользовательского действия или реального entity change.
- Риск потери пользовательского состояния требует root-cause анализа и reusable regression guard; локальное reasoning-only исправление без guard допустимо только как зафиксированный exception.
- Для complex behavior changes QA evidence должно включать deterministic checks и operational-doc capture; QA/TRIZ logs являются evidence для формулировки правила, а не готовым source text для governance import.
- GitHub CI расследования должны идти через repo-owned `gh-fix-ci` workflow: recent Actions audit группирует повторы по repo/workflow/branch scope/failure class, отделяет `account_billing_blocker` от code regression и не превращает owner/platform blocker в code patch.

## Operational Docs and Task State

- Task state canonical path: `.git/codex-task-pipeline/tasks/*.json`.
- Runtime history canonical path: `.git/codex-task-pipeline/history/events.ndjson`.
- `qaLastPassSha` и `previewPreparedSha` — обязательные reuse checkpoints.
- `cleanupStatus` и `cleanupTargets` — обязательные finish-cleanup markers; отсутствие `cleanupStatus` означает, что cleanup ещё может требовать resume, а `cleanupStatus=passed` допустим только после exact worktree, git worktree registration, managed task root и task-scoped leftovers verification.
- Shared operational snapshots (`Docs/qa-implementation-log.md`, `Docs/triz-usage-log.md`, append-only sections `CODEX_MEMORY.md`) — single-writer artifacts.
- `Docs/qa-implementation-log.md` и `Docs/triz-usage-log.md` должны оставаться активными читаемыми логами; при разрастании sync сохраняет полный pre-compaction snapshot в `Docs/archive/*.md.gz`, а в активном файле оставляет компактный текущий хвост.
- Task branches должны использовать `task:operational-docs:capture`, а publish/release stage — `task:operational-docs:sync`.

## Codex Code Review Severity Policy (Mandatory)

High-priority findings для этого starter repo ограничены:

- regressions в conveyor/runtime flows (`task:start`, `task:qa:agent`, `task:finish:core`, `task:merge:main`, `release:local`);
- поломки task state / runtime history / operational artifact contracts;
- security defects в GitHub Actions, secret scanning, dependency handling и local release safety;
- flaky или environment-leaking QA/CI, из-за которых PR/nightly evidence становится недостоверным;
- ошибки single-writer operational docs, ведущие к silent overwrite / duplicate merge / data drift.

Не считать high-priority:

- style-only, naming-only, formatting-only, comment-only замечания;
- optional refactor ideas без прямого correctness/reliability/security impact;
- низкосигнальный noise вокруг docs phrasing, если он не ломает process contract.
- Если high-priority findings нет, лучше короткий no-findings verdict, чем шум из мелких замечаний.

## TRIZ Escalation Protocol (Mandatory)

- Канонические TRIZ sources:
  - `research/triz/knowledge-pack.md`
  - `research/triz/agent-prompt-v2.md`
  - `research/triz/case-library.md`
- До финализации complex fixes/refactors делать history scan по:
  - `plans/*`
  - `Docs/qa-implementation-log.md`
  - `Docs/change-ledger.md`
- TRIZ обязателен при любом trigger:
  - `qa_repeat_stage`
  - `qa_chunk_exhausted`
  - `cross_module_conflict`
  - `historical_recurrence`
- При trigger conveyor должен писать `TRIZ_TRIGGER` в runtime history и запись в `Docs/triz-usage-log.md`.
- Если применено явное TRIZ-решение, писать `TRIZ_APPLIED` и детальную запись в `Docs/triz-usage-log.md`.
- В финальном ответе по задаче TRIZ-блок даётся один раз:
  - `TRIZ-вклад: применено | не применялось`
  - `Противоречие`
  - `Какие принципы/подходы использованы`
  - `Что конкретно устранено`
  - `Fallback/долг`
- Если TRIZ не применялся, писать: `не применялось (триггер не сработал)`.

## Repository Commands (Reference)

- `npm run lint`
- `npm run lint:fix`
- `npm run lint:fix:changed`
- `npm run skills:link`
- `npm run skills:status`
- `npm run skills:unlink`
- `npm run rule-sync:scan -- --since <date> --until <date>`
- `npm run rule-sync:report -- --latest`
- `npm run rule-sync:apply-plan -- --approval <path> --dry-run`
- `npm run rule-share:scan`
- `npm run rule-share:report -- --latest`
- `npm run rule-share:apply-plan -- --approval <path> --dry-run`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run qa:agent`
- `npm run qa:smoke:pr`
- `npm run qa:e2e:nightly`
- `npm run qa:security`
- `npm run qa:coverage:critical`
- `npm run qa:perf:critical`
- `npm run task:start -- --title "<title>" --seed-message "<request>"`
- `npm run task:test -- [args]`
- `npm run task:qa:agent`
- `npm run task:finish:core`
- `npm run task:merge:main`
- `npm run task:history -- tail --lines 20`
- `npm run task:history -- sync`
- `npm run task:ledger -- rebuild --write-docs`
- `npm run task:operational-docs:capture`
- `npm run task:operational-docs:sync`
- `npm run release:local`

## Commit Message Rules (Mandatory)

- Формат commit message: `Ver. <version> <type> <description> | <qa-result>`.
- `<version>`: для post-MVP line стартовать с `4.00`, затем повышать на `0.01`.
- `<type>`: `feat:` | `fix:` | `docs:` | `refactor:`.
- `<qa-result>`: `билд прошел` | `билд не прошел`.
- TRIZ summary не дублируется в commit message.

## Bugfix Workflow (Mandatory, No Plan Gate)

Для bugfix-задач planning mode опционален, но сам workflow обязателен:

1. Intake:
   - источник бага;
   - окружение и version/commit;
   - severity `P0` / `P1` / `P2` / `P3`.
2. Reproduction:
   - воспроизводимые шаги;
   - expected vs actual behavior;
   - если не воспроизводится, остановиться и уточнить.
3. Root cause:
   - конкретная гипотеза;
   - подтверждение логами, трассировкой или code-path evidence.
4. Class-level analysis:
   - defect class;
   - broken invariant;
   - shared seam, где класс должен быть исправлен системно.
5. Test-first:
   - добавить падающий test, когда это practically possible;
   - если невозможно, явно зафиксировать ограничение.
6. Fix strategy:
   - выбирать минимально рискованный systemic fix;
   - локальный patch без shared guard оформлять как `Exception`.
7. QA matrix:
   - reported case;
   - happy path;
   - минимум 2 adjacent variants;
   - reusable guard на shared seam.
