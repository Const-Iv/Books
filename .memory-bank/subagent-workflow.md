# Adaptive Subagent Workflow

## Назначение

Правило задаёт переносимый способ планировать и выполнять задачи Codex. Оно не создаёт production multi-agent runtime и не заменяет product-specific adapters, registries, schedulers или delivery contracts downstream-проекта.

## Главный принцип

Каждый нетривиальный план обязан быть **subagent-aware**, но не обязан быть **multi-agent**. До реализации root agent выбирает одну топологию:

- `single` — один агент выполняет небольшую или тесно связанную задачу;
- `sequential` — один владелец последовательно проходит зависимые этапы;
- `parallel/hybrid` — независимые workstreams выполняются параллельно, а общий контракт, интеграция и финальная проверка остаются последовательными.

Subagents используются только при ожидаемом выигрыше в качестве, скорости или изоляции контекста. Экономия total usage не считается ожидаемым эффектом без измерения: каждый subagent имеет собственный контекст и обычно увеличивает суммарный расход.

## Triviality Gate

До выбора глубины плана и использования subagents root agent классифицирует всю пользовательскую задачу. Задача считается `trivial`, только если **одновременно выполнены все условия**:

1. Требуется один ясный результат без нерешённого product, architecture или implementation choice.
2. Затронута заранее известная узкая область, а работа укладывается в один логический change batch.
3. Не меняются owner-facing или AI behavior, governance, shared contract, public interface, privacy либо approval boundary.
4. Не требуется discovery по нескольким модулям или источникам, поиск неизвестной root cause либо сравнение альтернатив.
5. Нет независимых workstreams, которым отдельный контекст или независимая проверка дали бы существенный выигрыш.
6. Нет live/runtime/external mutation, canary, migration или отдельного authoritative read-back сверх стандартного последовательного Git task finish.
7. Риск низкий, rollback очевиден, а корректность доказывается одной ближайшей deterministic check.

Failed или unknown condition и любое обоснованное сомнение означают `nontrivial`. Размер diff, число файлов и формулировка «быстро поправить» сами по себе не делают задачу тривиальной.

| Пример | Классификация | Причина |
| --- | --- | --- |
| Исправить одну опечатку без изменения смысла | `trivial` | Один ясный локальный результат и одна проверка. |
| Переименовать локальную переменную без изменения interface или behavior | `trivial` | Узкий безопасный batch с очевидным rollback. |
| Изменить shared formatter или resolver | `nontrivial` | Меняется shared contract и несколько downstream paths. |
| Исследовать privacy, tests и architecture трёх adapters | `nontrivial` | Есть независимые read-only workstreams. |
| Добавить или изменить правило проекта | `nontrivial` | Меняется governance или agent behavior. |
| Выполнить live canary с approval и read-back | `nontrivial` | Есть live mutation и последовательный verification contour. |
| Причина дефекта неизвестна | `nontrivial` | Нужны discovery и root-cause analysis. |

Root agent классифицирует общую задачу, выбирает топологию и фиксирует решение в `Карте выполнения`. Subagent не пересматривает общую классификацию и не расширяет scope самостоятельно. Если bounded workstream обнаружил неизвестную зависимость, пересечение ownership, новый риск или необходимость внешнего действия, subagent останавливается и возвращает root agent `findings`, `evidence`, `risks`, `unresolved` и `recommended next step`.

## Когда использовать subagents

Использовать обычно 2–3 bounded workstreams, когда выполняются все условия:

1. Есть минимум две независимо проверяемые части с понятными входами и результатами.
2. Между ними нет общей записи в одни файлы, shared state или live runtime.
3. Root agent заранее фиксирует контракт, ownership и sync point.
4. Результат каждого workstream можно проверить отдельно.
5. Ожидаемый выигрыш важнее coordination overhead и дополнительного usage.

Подходящие задачи:

- read-only исследование разных модулей или источников;
- независимый поиск рисков, тестов, regressions и security/privacy gaps;
- leaf-модули после фиксации общего интерфейса и с непересекающимся ownership;
- fixtures, golden prompts и negative cases;
- независимый read-only review интегрированного изменения.

## Когда не использовать subagents

Выбирать `single` или `sequential`, если присутствует хотя бы одно условие:

- задача мала и coordination дороже самой работы;
- решение требует одной непрерывной цепочки рассуждений;
- общий контракт ещё не определён или меняется в процессе;
- несколько исполнителей должны менять один файл, общий seam, registry, resolver, approval state или scheduler;
- работа зависит от одного live runtime, внешней очереди, ограниченного hardware или долгой неделимой операции;
- требуется внешняя запись, restart, canary, rollback, merge, публикация, cleanup или authoritative read-back;
- нельзя передать минимальный безопасный контекст без секретов или лишних персональных данных.

## Обязательная карта выполнения

Перед `Планом для агента` каждый plan/spec фиксирует:

- классификацию `trivial | nontrivial` и результат Triviality Gate;
- выбранную топологию и короткое обоснование;
- root owner, максимум одновременно активных subagents и максимальную глубину;
- ожидаемый эффект и ожидаемое влияние на total usage;
- workstreams: цель, зависимости, role, file/module ownership, read/write scope, result/evidence и sync point;
- этапы одного владельца, порядок интеграции и fallback к `single/sequential`.

Для задачи, прошедшей все условия Triviality Gate, допустима сокращённая карта: `Классификация: trivial`, `Режим: single`, подтверждение gate и ближайшая deterministic check.

## Канонический порядок выполнения

1. Root читает обязательные sources, фиксирует charter, acceptance, Eval и baseline.
2. Независимые read-only или leaf-workstreams запускаются только после фиксации границ.
3. Root проверяет evidence и разрешает противоречия; summary subagent не является доказательством без доступной проверки.
4. Один integrator владеет shared seams и собирает изменение логическими batches.
5. После каждого meaningful batch выполняется ближайшая deterministic check.
6. Независимый reviewer read-only ищет regressions, safety gaps и пропущенные проверки.
7. Root выполняет финальную интеграцию и общий QA.
8. Один runtime operator последовательно выполняет approved live actions и authoritative read-back.
9. Один finish operator отвечает за commit, publication proof и cleanup.

## Ownership и синхронизация

- У каждого файла и shared contract одновременно только один writer.
- Параллельные writers допустимы только для заранее названных непересекающихся файлов или модулей после фиксации интерфейса.
- Root agent не делегирует product decisions, charter interpretation, approval boundaries, финальную интеграцию и итоговые claims.
- Reviewer возвращает findings и не становится параллельным writer.
- Стандартная глубина делегирования — `1`; вложенная делегация требует отдельного обоснования и Eval.
- Стандартный максимум — 2–3 одновременно активных subagents; большее число требует доказанной независимости и измерения coordination cost.
- Ожидание должно быть event-driven или bounded; частый polling без нового сигнала запрещён.

## Контракт результата subagent

Каждый результат содержит:

- `findings` — что установлено;
- `evidence` — проверенные файлы, источники, команды или тесты;
- `risks` — что может сломаться;
- `unresolved` — что не доказано;
- `recommended next step` — следующий ограниченный шаг.

Raw dumps не передаются root agent, если достаточно ссылок, точных мест и краткого проверяемого вывода.

## Reasoning mode и модель

Выбирать минимальный уровень рассуждения, который стабильно проходит acceptance и Eval:

| Режим | Предпочтительное применение |
| --- | --- |
| `Low` | Только малая deterministic `single`-задача или простой bounded read-only сбор. |
| `Medium` | Ясные задачи; явные subagents для независимого исследования, тестов или review. |
| `High / Extra High` | Сложная декомпозиция, несколько модулей или источников, существенные риски и интеграция. |
| `Max` | Сложная последовательная задача, где важнее глубина одного контекста. |
| `Ultra` | Широкая действительно декомпозируемая задача с принятым повышенным usage; не project default. |

Высокий reasoning mode не обязывает делегировать, а низкий не запрещает bounded workflow. Выбор модели и effort считается запросом до runtime read-back. Нельзя заявлять экономию токенов, ускорение или фактическую модель без evidence.

## Safety, privacy и внешние действия

- Subagent получает только минимально необходимый контекст.
- Делегирование не расширяет scope, permissions или approval.
- Секреты, credentials и лишние персональные данные не копируются.
- External write сохраняет `draft -> owner confirmation -> execute -> authoritative read-back` и выполняется одним оператором.
- Параллельные send, restart, canary, rollback, merge и cleanup запрещены.
- При конфликте evidence, пересечении ownership, росте usage без результата или изменении contract root останавливает делегацию и продолжает `single/sequential`.

## Eval и minimum pass threshold

Workflow проверяется на frozen task set минимум по пяти сигналам:

1. качество и полнота результата;
2. critical safety/privacy/approval failures;
3. wall-clock time;
4. total usage всех агентов;
5. rework, merge conflicts и coordination failures.

Minimum pass threshold: карта выполнения заполнена; топология соответствует зависимостям; overlapping writers и параллельные live actions отсутствуют; deterministic checks проходят; critical failures равны нулю. Рост total usage допустим только при измеримом выигрыше в качестве или времени.
