# Blueprint нового проекта под правила Гвозди

> Переносимый стартовый blueprint для любого нового проекта, если нужно с первого дня работать в привычной операционной модели: Codex/worktree conveyor, детерминированный QA, TRIZ-эскалация, memory-bank и разговорный branch-chat.
>
> В текущем starter-репозитории этот blueprint уже подкреплён исполняемым Node/npm baseline. Для проектов на другом стеке сохраняются инварианты и контракты, а меняется только техническая реализация entrypoint'ов.

## 1. Назначение

Этот blueprint нужен не для описания конкретного продукта, а для задания **операционной конституции проекта** и обязательного product charter, который downstream-проект адаптирует под свою миссию:

JTBD: когда начинается новый проект, дать команде готовую операционную основу с первого дня, чтобы не собирать заново правила работы, QA, task flow и agent governance в каждом репозитории.

- как хранить канонические правила;
- где хранить миссию, видение, цель и `JTBD`;
- как заводить и завершать задачи;
- как проводить QA;
- когда обязателен TRIZ;
- как агент должен понимать разговорные запросы в branch-chat;
- какие артефакты должны жить в репозитории с первого дня.

Если стек не на Node.js, blueprint всё равно применим. В этом случае сохраняются:

- инварианты процесса;
- названия стадий и артефактов;
- семантика команд и checkpoint'ов.

Меняться может только техническая реализация entrypoint'ов.

Этот документ остаётся reference-слоем. Фактическое поведение текущего starter baseline зафиксировано в `README.md`, `scripts/README.md`, `AGENTS.md` и npm scripts.

## 2. Неподвижные инварианты

Эти правила считаются обязательными для любого нового проекта:

1. Сначала simplest viable implementation, потом усложнение.
2. Product charter является первичным gate для продуктовых решений и feature/behavior/process/governance изменений.
3. Перед изменением файлов агент кратко объясняет, что меняется и почему.
4. Placeholder-реализации нельзя выдавать как finished work.
5. Секреты, токены, ключи, персональные профили и runtime-данные не коммитятся и не выводятся в логах.
6. Нельзя удалять пользовательские данные или ломать существующее поведение без явного запроса и заметки про rollback.
7. Доказательством корректности считаются только детерминированные проверки.
8. После каждого логического батча изменений надо прогонять хотя бы одну целевую детерминированную проверку.
9. Для системных багов перед окончательным fix path обязателен `STAR + profile data + repo-RAG`.
10. Для регрессий исправляется shared seam, а не только симптом; по возможности добавляется reusable guard.
11. Операционные документы должны быть single-writer артефактами и синхронизироваться только на publish/release-стадии.

## 3. Обязательный каркас репозитория

Минимальная структура нового проекта:

```text
AGENTS.md
CODEX_MEMORY.md
.memory-bank/
  index.md
  product-charter.md
  project-context.md
  architecture-map.md
  code-rules.md
  qa-playbook.md
Docs/
  change-ledger.md
  task-history.md
  qa-baseline.md
  qa-implementation-log.md
  triz-usage-log.md
plans/
  _template.md
  _bugfix_template.md
  reference/
templates/
  agent-workspace/
scripts/
src/                # или app/services/packages — зависит от проекта
tests/
```

### Обязательные роли файлов

`AGENTS.md`

- главный репозиторный договор;
- scope, language rules, standing orders, conveyor, QA, TRIZ, branch-chat behavior;
- именно здесь лежат обязательные правила для любой агентной сессии.

`CODEX_MEMORY.md`

- короткая живая оперативная память;
- сюда попадают устойчивые lessons learned, которые не должны разрастаться в полноценные policy docs;
- canonical long-lived rules не дублируют `.memory-bank/*`, а только дополняют их.

`.memory-bank/index.md`

- точка входа;
- маршрутизирует, какие memory-файлы читать для feature/bugfix/conveyor/governance work.
- для любых продуктовых решений и feature/behavior/process/governance изменений направляет сначала в `product-charter.md`.

`.memory-bank/product-charter.md`

- канонический product source of truth;
- содержит миссию, видение, цель и `JTBD`;
- задаёт product charter gate: изменение должно поддерживать charter или явно сохранять совместимость с ним;
- downstream-проект обязан заменить starter charter своим product-specific charter, сохранив baseline-инварианты.

`.memory-bank/project-context.md`

- краткая product-charter выжимка, layout проекта, стек, source of truth, core commands, operational constraints.

`.memory-bank/architecture-map.md`

- high-level modules, data flow, risk hotspots, impact checklist.

`.memory-bank/code-rules.md`

- coding constraints, contract rules, conveyor invariants, QA invariants.

`.memory-bank/qa-playbook.md`

- fixed QA order;
- supplementary gates;
- evidence capture;
- finish-flow checkpoints;
- TRIZ triggers.

`Docs/*`

- human-readable operational snapshots;
- ledger, task history, baseline debt, implementation log, TRIZ journal;
- это не место для произвольных заметок, а для воспроизводимого process evidence.

`plans/_template.md`

- стандартная карточка задачи;
- верх плана должен идти как `Миссия -> Видение -> Цель -> JTBD / проблема -> Job Story -> User Stories -> Критерии приемки -> Метрика успеха`;
- техническая часть начинается ниже верхнего продуктового блока и содержит scope, out-of-scope, invariant, shared seam, QA plan, risks/rollback, evidence.

`templates/agent-workspace/*`

- безопасные шаблоны локального пространства агента;
- реальные `SOUL`, `USER`, `MEMORY`, персональные notes и идентификаторы не должны попадать в git.

`skills/starter-rule-sync`

- reusable workflow для регулярного возврата удачных правил из downstream проектов обратно в starter;
- работает через `rule-sync:*` scripts и manual approval, а не через auto-apply.

## 4. Каноническая модель conveyor

Новый проект должен сразу работать через task conveyor, а не через ad-hoc git flow.

### Базовые правила

- task branches имеют префикс `codex/`;
- канонический поток: `task:start -> task:qa:agent -> task:finish:core -> task:merge:main|release:local`;
- task state хранится в `.git/codex-task-pipeline/tasks/*.json`;
- runtime history хранится в `.git/codex-task-pipeline/history/events.ndjson`;
- `qaLastPassSha` и `previewPreparedSha` обязательны как reuse-checkpoints;
- `task:finish:core` не имеет права коммитить, публиковать или релизить, если task QA не прошел;
- cleanup worktree/branch нельзя делать молча: это всегда явное решение.

### Что должны делать entrypoint'ы

`task:start`

- создаёт `codex/*` branch и отдельный worktree;
- проверяет состояние репозитория;
- если дерево грязное, обязан остановиться до создания ветки/worktree; bypass через `--allow-dirty` не допускается, вместо этого нужно предложить `git diff`, commit текущей работы или `git stash -u`;
- бутстрапит зависимости в новом worktree;
- по возможности открывает новый worktree и новый branch-chat автоматически;
- пишет task state/history в `.git/codex-task-pipeline/*`.

`task:qa:agent`

- запускает детерминированный QA gate проекта;
- сохраняет результат в task state;
- обновляет `qaLastPassSha`;
- всегда пишет `previewPreparedSha`; для core baseline preview status по умолчанию `not_supported`, пока проект явно не добавит свой preview adapter;
- при TRIZ-trigger пишет событие и в runtime history, и в `Docs/triz-usage-log.md`.

`task:finish:core`

- работает только внутри `codex/*` branch;
- использует только script-driven finish flow, без free-form "ну вроде готово";
- умеет останавливаться на gated decisions и продолжаться точными resume-командами;
- не завершает задачу, пока не пройдены QA, publish/merge и operational-doc sync;
- до cleanup обязан спросить фиксированным numbered choice: `1. Удалить`, `2. Оставить`; ответы `1`/`2` маппятся на delete/keep.

`task:merge:main`

- выполняет publish/merge только после task QA;
- перед merge делает безопасный preflight;
- после merge гоняет `qa:agent` на `main`;
- фиксирует failure context и resume path, если publish не удался.

`release:local`

- локально-ориентированная замена server deploy;
- не мутирует `main`, если он dirty или unsynced;
- должна иметь resume/failure story и health verification.

## 5. Разговорный branch-chat contract

В новом проекте branch-chat не должен требовать от оператора помнить внутренние команды.

### Правила

- по умолчанию branch-chat относится к текущему worktree и текущей ветке;
- агент отвечает человеческим русским текстом;
- внутренние команды скрываются, пока не нужен следующий технический шаг на gated stage;
- разговорные фразы мапятся на канонические entrypoint'ы, а не на ad-hoc обходные действия;
- если запрос двусмысленный, агент задаёт один короткий уточняющий вопрос.

### Обязательные интенты

`create task/worktree`

- примеры: `сделай новую ветку под календарь`, `нужен новый worktree для почты`;
- маппинг: `task:start`;
- полный пользовательский запрос идёт в seed message.

`finish task`

- примеры: `давай закончим`, `закрой текущую ветку`, `выпусти и заверши`;
- маппинг: `task:finish:core`;
- при gated stop агент сначала объясняет состояние по-человечески, потом даёт ровно следующую resume-команду;
- cleanup спрашивается явно и в фиксированном формате `1. Удалить` / `2. Оставить`.

`qa/status`

- примеры: `прогони qa`, `проверь ветку`, `что осталось`;
- маппинг: `task:qa:agent` или task inspection;
- сперва короткое разговорное резюме, команды только если они реально нужны для следующего шага.

`cleanup choice`

- примеры: `1`, `2`, `ветку оставь`, `worktree можно удалить`;
- обрабатывается только когда finish-flow дошёл до cleanup gate.
- canonical mapping: `1` => удалить локальный worktree/branch, `2` => оставить.

## 6. Детерминированный QA contract

QA в новом проекте должен быть одинаково читаем и человеком, и conveyor-скриптами.

### Основной gate

Фиксированный порядок:

```text
lint -> lint:fix:changed -> lint -> typecheck -> test -> build
```

`qa:agent` обязателен перед завершением любой code-changing задачи.

### Дополнительные gates

Минимально стоит предусмотреть:

- `qa:smoke:pr`
- `qa:e2e:nightly`
- `qa:security`
- `qa:coverage:critical`

Если проект не поддерживает все стадии на старте, названия можно зарезервировать как roadmap entrypoints, но основной `qa:agent` должен работать реально, а не быть заглушкой.

### Обязательные QA-правила

- manual preview не заменяет `qa:agent`;
- smoke/nightly используют изолированные фикстуры и изолированные runtime ports;
- если тест создал временные сущности, cleanup обязателен;
- cleanup failure является blocking failure;
- каждый QA run обязан сохранять exact commands, pass/fail и краткий evidence summary;
- failure classes нужно различать минимум на:
  - `retryable_flake`
  - `baseline_debt`
  - `infra_blocker`
  - `task_regression`

`retryable_flake` может расходовать ограниченный retry chunk. Всё остальное должно стопорить finish flow сразу.

## 7. TRIZ contract

TRIZ не должен быть факультативной идеей "если захотим подумать глубже". Это обязательная эскалация по триггерам.

### Триггеры

TRIZ обязателен, если сработал хотя бы один из сигналов:

- repeated failing QA stage;
- exhausted retry chunk;
- cross-module conflict across `ui/api/core` или аналогичных ключевых зон проекта;
- historical recurrence из plans/logs/ledger/memory.

### Что делать при TRIZ-trigger

1. Остановиться и зафиксировать, почему обычный локальный fix path уже недостаточен.
2. Описать противоречие, а не только симптом.
3. Сформулировать ideal final result и ограничение.
4. Найти shared seam, на котором можно снять класс проблем, а не единичный кейс.
5. Добавить reusable guard или structural rule, если это practically possible.
6. Записать `TRIZ_TRIGGER` и `TRIZ_APPLIED`:
   - в runtime history;
   - в `Docs/triz-usage-log.md`.

### Минимальный формат записи

- дата/время;
- trigger reason;
- affected zones;
- symptom pattern / recurrence evidence;
- выбранный принцип или structural move;
- applied change summary;
- какой guard добавлен.

## 8. Правила для системных багов и регрессий

Для любого нового проекта зафиксируй это явно:

- системный баг лечится через `STAR + profile data + repo-RAG` до выбора final fix path;
- регрессия закрыта только если устранён shared seam;
- если shared seam не закрыт, задача должна честно маркироваться как exception/debt;
- exception обязан содержать:
  - причину;
  - риск;
  - план снятия долга.

## 9. Минимальный стартовый набор команд

Если проект на Node.js, рекомендуется сразу зафиксировать такие entrypoint'ы:

```json
{
  "scripts": {
    "build": "...",
    "typecheck": "...",
    "test": "...",
    "lint": "...",
    "lint:fix:changed": "...",
    "qa:agent": "...",
    "qa:smoke:pr": "...",
    "qa:e2e:nightly": "...",
    "qa:security": "...",
    "qa:coverage:critical": "...",
    "rule-sync:scan": "...",
    "rule-sync:report": "...",
    "rule-sync:apply-plan": "...",
    "task:start": "...",
    "task:qa:agent": "...",
    "task:finish:core": "...",
    "task:merge:main": "...",
    "task:ledger": "...",
    "task:operational-docs:capture": "...",
    "task:operational-docs:sync": "...",
    "release:local": "..."
  }
}
```

Если проект не на Node.js, смысл остаётся тем же: названия можно маппить на `make`, `just`, `task`, `uv run`, `poetry run`, shell wrappers и т.д.

Главное: у conveyor должны быть стабильные канонические entrypoint'ы.

## 10. Что должно быть в task template

Любой новый проект должен иметь задачу-шаблон примерно с такими блоками:

- название;
- тип задачи: `feature | refactor | behavior-change | bugfix`;
- mission/vision/goal/JTBD charter mapping;
- цель;
- scope / out-of-scope;
- класс дефекта или системный риск;
- invariant;
- общий seam / точка системного исправления;
- формат исправления: `systemic fix | exception`;
- implementation steps;
- QA plan;
- expected results;
- risks / rollback;
- confirmation status;
- execution log;
- QA results;
- changed files.

Это важно, потому что без invariant/seam/rollback проект быстро скатывается в локальные исправления без накопления процессной памяти.

## 11. Bootstrap-чеклист для нового проекта

Используй этот порядок при старте нового репозитория:

1. Создать `AGENTS.md` как главный policy-файл.
2. Создать `.memory-bank/product-charter.md` и адаптировать миссию, видение, цель и `JTBD` под продукт.
3. Создать `.memory-bank/` с минимумом из `index`, `project-context`, `architecture-map`, `code-rules`, `qa-playbook`.
4. Создать `CODEX_MEMORY.md` для short-lived learned rules.
5. Создать `Docs/` артефакты: ledger, task history, QA baseline, implementation log, TRIZ log.
6. Создать `plans/_template.md` и `_bugfix_template.md`.
7. Создать `templates/agent-workspace/` для локальных профилей и памяти.
8. Добавить канонические QA и conveyor entrypoint'ы.
9. Зафиксировать branch prefix `codex/`.
10. Встроить `.git/codex-task-pipeline/` state/history contract.
11. Настроить `task:start` и `task:finish:core` как единственный допустимый путь для lifecycle задачи.
12. Проверить, что branch-chat принимает разговорные русские запросы и корректно маппит их на conveyor.
13. Проверить, что `qa:agent` действительно запускает реальный детерминированный gate.
14. Проверить, что TRIZ-trigger записывается в историю и журнал.

## 12. Definition of Ready для нового проекта

Blueprint считается внедрённым, если:

- репозиторий содержит все канонические governance-файлы;
- conveyor создаёт `codex/*` worktree-задачи и пишет состояние в `.git/codex-task-pipeline/*`;
- finish flow останавливается на QA failure и gated decisions корректно;
- `qa:agent` работает детерминированно;
- branch-chat понимает разговорные интенты без требования точной команды;
- секреты и личные memory-файлы остаются только в локальных шаблонах;
- TRIZ-trigger фиксируется не только в коде, но и в process evidence;
- есть хотя бы один task template, через который можно вести работу без ad-hoc описаний.

## 13. Практическое правило переноса в новый репозиторий

Если хочется начать новый проект быстро, не нужно сразу переносить весь текущий кодовый слой. Достаточно первым коммитом перенести:

- `AGENTS.md`;
- `CODEX_MEMORY.md`;
- `.memory-bank/*`;
- `Docs/*` каркас;
- `plans/*` шаблоны;
- `templates/agent-workspace/*`;
- минимальные conveyor/QA entrypoint'ы;
- `.gitignore` и `.env.example` под локальную модель.

После этого уже можно наращивать продуктовый код, не теряя привычный operating model.
