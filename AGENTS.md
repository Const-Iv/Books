## Scope

These rules apply to the whole repository.

## Project Purpose

- `new-project-starter` — каноническая reusable база для старта любых новых проектов в привычном фреймворке: Codex/worktree conveyor, deterministic QA, memory-bank governance, TRIZ escalation и branch-chat rules.
- JTBD: когда начинается новый проект, дать команде готовую операционную основу с первого дня, чтобы не собирать заново правила работы, QA, task flow и agent governance в каждом репозитории.
- При любых изменениях сверяться с этой ролью: правило или скрипт должны быть полезны как baseline для новых проектов, а product-specific поведение добавляется только поверх starter через adapters/profiles и не hardcode'ится в core governance.

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
- Для user-facing планов, вопросов про изменения и предложений продуктовых решений использовать простой продуктовый язык и порядок `Summary -> JTBD / проблема -> Job Story -> User Stories -> Критерии приемки -> Метрика успеха`; сначала короткий смысл, затем ситуация / желание / ожидаемый результат, затем проверяемый результат.
- В будущих plan files техническая часть начинается ниже верхнего продуктового блока `Summary -> JTBD / проблема -> Job Story -> User Stories -> Критерии приемки -> Метрика успеха`.
- В `Summary`, `TL;DR`, `JTBD / проблема`, `Job Story` и `User Stories` не использовать технические термины без твердой необходимости; писать про ситуацию, ценность и ожидаемый результат понятным пользовательским языком.
- Технические детали добавлять только там, где они помогают понять или реализовать решение. Их можно встроить в текст; если агенту нужен точный implementation context, добавлять отдельный блок `План для агента`.
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

- Обязательные source-of-truth файлы: `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`.
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
5. После создания плана остановиться и запросить явное подтверждение пользователя.
6. Не менять source files до подтверждения.
7. После подтверждения:
   - выполнять шаги по порядку;
   - отмечать завершённые чекбоксы `[x]`;
   - записывать QA execution и results в тот же план.
8. При material scope change обновлять план и снова просить re-approval.
9. Перед завершением убедиться, что план содержит финальный статус и список changed files.

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
- shared operational docs сначала capture'ить из task branch, а sync'ить обратно только на publish/release stage как single-writer artifacts;
- `task:finish:core` не должен спрашивать legacy `--preview ok|skip`;
- для starter baseline `task:qa:agent` всё равно пишет `previewPreparedSha`, но preview status по умолчанию `not_supported`, пока проект не добавит свой preview adapter;
- перед cleanup всегда спрашивать явно и в фиксированном формате:
  `1. Удалить`
  `2. Оставить`
  Ответ `1` маппится на удаление локального worktree/branch, ответ `2` — на сохранение.

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

## Operational Docs and Task State

- Task state canonical path: `.git/codex-task-pipeline/tasks/*.json`.
- Runtime history canonical path: `.git/codex-task-pipeline/history/events.ndjson`.
- `qaLastPassSha` и `previewPreparedSha` — обязательные reuse checkpoints.
- Shared operational snapshots (`Docs/qa-implementation-log.md`, `Docs/triz-usage-log.md`, append-only sections `CODEX_MEMORY.md`) — single-writer artifacts.
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
