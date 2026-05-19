# Единый практический toolkit Голдратта - Theory of Constraints

Статус: staged combined toolkit по локально предоставленным и уже нормализованным источникам. Это не пересказ книг и не замена оригиналов: здесь собрана единая практическая система Голдратта для применения TOC в операциях, стратегии, проектах, технологиях, изменениях и ясном мышлении.

## Связь с charter проекта

Books должен превращать книгу или набор книг в применимый toolkit на русском языке: модели, принципы, техники, anti-patterns, сценарии применения, шпаргалки, glossary и topic index. Поэтому этот файл устроен как рабочая система, а не как литературный обзор Голдратта.

Ценность для пользователя: можно не читать пять книг подряд, а быстро выбрать маршрут, понять какой инструмент нужен в ситуации, применить его и проверить source traceability по локальным structured Markdown copies.

## Отчет извлечения

В unified toolkit вошли 5 локальных источников:

| Код | Источник | Роль в toolkit | Runtime source |
|---|---|---|---|
| `GOAL` | E.M. Goldratt, `The Goal` | базовая TOC: цель, throughput / inventory / operating expense, bottleneck, DBR, five focusing steps | `runtime/books/TOS - Теория ограничения систем/goldratt-the-goal/E.M. Goldratt - The Goal.md` |
| `LUCK` | E.M. Goldratt, `It's Not Luck / Цель-2` | Thinking Processes: CRT, Cloud, FRT, PRT, Transition Tree, mafia offer | `runtime/books/TOS - Теория ограничения систем/goldratt-its-not-luck/E.M. Goldratt - It's Not Luck.md` |
| `CHAIN` | E.M. Goldratt, `Critical Chain` | CCPM: project buffer, feeding buffer, resource buffer, critical chain, multi-project drum | `runtime/books/TOS - Теория ограничения систем/goldratt-critical-chain/E.M. Goldratt - Critical Chain.md` |
| `NBS` | E.M. Goldratt, E. Schragenheim, C.A. Ptak, `Necessary but Not Sufficient / Цель-3` | технология + изменение правил: ERP, old-rule audit, pull replenishment, dollar-days | `runtime/books/TOS - Теория ограничения систем/goldratt-necessary-but-not-sufficient/E.M. Goldratt, E. Schragenheim and C.A. Ptak - Necessary but Not Sufficient.md` |
| `CHOICE` | E.M. Goldratt and E. Goldratt-Ashlag, `The Choice` | ясное мышление: inner simplicity, people are good, never say "I know", expected effect | `runtime/books/TOS - Теория ограничения систем/goldratt-the-choice/E.M. Goldratt and E. Goldratt-Ashlag - The Choice.md` |

Объем source layer:
- `GOAL`: примерно 137k слов, structured `.md` уже существовал.
- `LUCK`: PDF, 232 страницы, примерно 75k слов.
- `CHAIN`: DOC, 139 страниц, примерно 63k слов.
- `NBS`: PDF, 245 страниц, примерно 63k слов.
- `CHOICE`: EPUB, примерно 44k слов по extraction report.

Ограничения:
- Все исходники локальные; web search не использовался.
- PDF-оригиналы для `LUCK` и `NBS` сохранены в ignored runtime рядом со structured `.md`.
- DOC-оригинал `CHAIN` не хранится в runtime после verified `.md`, по Books retention rule.
- Этот combined toolkit строится напрямую из source copies и сверяется со standalone toolkit'ами как coverage-control artifacts.

## Staged assembly / source layers

| Stage | Что делалось | Контроль покрытия |
|---|---|---|
| 1. Source normalization | Приведены `LUCK`, `CHAIN`, `NBS` к structured Markdown; подтянуты `GOAL`, `CHOICE` runtime copies | extraction reports and manifests |
| 2. Standalone layer | Созданы или усилены standalone toolkit'ы по каждой книге | папки `goldratt-*` under `books/TOS - Теория ограничения систем/` |
| 3. Direct synthesis | Общая система собрана из direct source landmarks, не из summaries | source code references in action cards and coverage map |
| 4. Dedupe | Повторяющиеся идеи объединены один раз с cross-source references | section `Coverage map` and `Dedupe notes` |
| 5. Practical sequence | Сначала route/selector/action, затем deep reference | master-format sections below |

Standalone coverage-control artifacts:
- `../goldratt-the-goal/The Goal - E.M. Goldratt - toolkit.md`
- `../goldratt-its-not-luck/It's Not Luck - E.M. Goldratt - toolkit.md`
- `../goldratt-critical-chain/Critical Chain - E.M. Goldratt - toolkit.md`
- `../goldratt-necessary-but-not-sufficient/Necessary but Not Sufficient - E.M. Goldratt, E. Schragenheim and C.A. Ptak - toolkit.md`
- `../goldratt-the-choice/The Choice - E.M. Goldratt and E. Goldratt-Ashlag - toolkit.md`

## Как пользоваться toolkit

Если ситуация срочная, не читайте deep reference подряд. Начните с `Battle route`, затем выберите инструмент в `Tool selector` и примените одну action card.

Если нужно построить системную практику для команды, идите через `Training route`: сначала базовая TOC, затем Thinking Processes, затем CCPM, затем technology/rule-change layer, затем clarity layer from `The Choice`.

Если вы уже знаете проблему, используйте `Быстрая карта`:
- flow/операции -> `GOAL`;
- стратегия/конфликт/изменение -> `LUCK`;
- проекты -> `CHAIN`;
- IT/ERP/технологии -> `NBS`;
- ясное мышление/гипотезы/люди -> `CHOICE`.

## Battle route

1. **Назови цель системы.** Не улучшай процесс, пока не ясно, что является throughput для целого.
2. **Найди constraint.** Ищи устойчивую очередь, scarce resource, market limit, policy conflict or knowledge gap.
3. **Определи тип constraint.** Physical, market, policy, project-resource, technology-rule, thinking/assumption.
4. **Выбери маршрут.**
   - Physical/flow -> Five Focusing Steps + DBR.
   - Conflict/policy -> Cloud + Thinking Processes.
   - Project delay -> Critical Chain + buffers.
   - Technology underperformance -> old-rule audit + measurement rewrite.
   - Confusion/people resistance -> inner simplicity + people-are-good analysis.
5. **Сделай exploit before elevate.** Убери потери constraint до покупки мощности, найма или большого проекта.
6. **Subordinate.** Подчини release, priorities, batch size, KPI and behavior решению по constraint.
7. **Проверь будущее.** Для сильного решения сделай FRT/negative branches or explicit expected-effect test.
8. **Запусти первый safe experiment.** Минимальный observable result, который подтверждает cause-effect logic.
9. **Когда constraint сместился, начни заново.** Не защищай старый bottleneck, старую метрику или старое правило.

## Training route

1. `GOAL`: цель, T/I/OE, dependent events, bottleneck, five focusing steps.
2. `GOAL`: Drum-Buffer-Rope, batch sizes, market constraint, cost world vs throughput world.
3. `LUCK`: UDE, CRT, Evaporating Cloud, assumptions, injection.
4. `LUCK`: FRT, PRT, Transition Tree, mafia offer.
5. `CHAIN`: uncertainty, safety, student syndrome, critical chain, buffer management.
6. `CHAIN`: multi-project drum resource and portfolio release.
7. `NBS`: technology as necessary but not sufficient, old-rule audit, measurement rewrite.
8. `NBS`: pull replenishment, dollar-days, technology product strategy.
9. `CHOICE`: inner simplicity, people are good, never say "I know", expected effect.
10. Практика: взять один реальный кейс и пройти route selection -> action -> verification -> next constraint.

## Быстрая карта

| Симптом | Скорее всего constraint | Что делать первым | Primary source |
|---|---|---|---|
| Все заняты, throughput не растет | Bottleneck or policy constraint | Queue-based constraint search | `GOAL` |
| Запасы и WIP растут | Release не подчинен constraint | DBR / rope / batch review | `GOAL`, `NBS` |
| Улучшения не дают скачка | Нет фокуса на constraint | Five Focusing Steps | `GOAL` |
| Спор "или A, или B" | False assumption conflict | Evaporating Cloud | `LUCK`, `CHOICE` |
| Много UDE без главной причины | Core problem hidden | Current Reality Tree | `LUCK` |
| Решение сильное, но рискованное | Unchecked future logic | Future Reality Tree | `LUCK` |
| Проекты опаздывают при "реалистичных" оценках | Safety dispersed in tasks | Critical Chain + project buffer | `CHAIN` |
| Один ресурс ломает несколько проектов | Portfolio drum resource | Stagger release by drum | `CHAIN` |
| ERP/IT внедрена, эффекта мало | Old rules and local metrics | Old-rule audit | `NBS` |
| Технология используется по-старому | Rule/measurement mismatch | Measurement rewrite | `NBS` |
| Команда "сопротивляется" | Their logic not understood | People-are-good rewrite | `CHOICE` |
| Объяснение звучит красиво, но ничего не предсказывает | Tautology | Expected effect test | `CHOICE` |

## Tool selector

| Tool | Best for | Do not use when | Primary source layers |
|---|---|---|---|
| Goal filter | Любое улучшение, где неясна связь с целью | Цель системы неизвестна | `GOAL` |
| Throughput / Inventory / Operating Expense | Проверка business effect | Нужна бухгалтерская отчетность, а не управленческое решение | `GOAL` |
| Five Focusing Steps | Physical, market or policy constraint | Constraint еще не найден | `GOAL`, `NBS` |
| Drum-Buffer-Rope | Повторяемый flow, production, delivery, queueing | Поток нерегулярный и project-based | `GOAL`, `NBS` |
| Current Reality Tree | Много повторяющихся UDE | Нет observable UDE | `LUCK` |
| Evaporating Cloud | Конфликт без хорошего компромисса | Нет двух реальных needs/actions | `LUCK`, `CHOICE` |
| Future Reality Tree | Проверить injection before rollout | Injection еще не сформулирован | `LUCK` |
| Prerequisite Tree | Решение понятно, но много obstacles | Obstacles не собраны | `LUCK` |
| Transition Tree | Нужен buy-in and stepwise implementation | Нужно только диагностировать | `LUCK` |
| Critical Chain | Project with uncertainty and resource dependencies | Повторяемый операционный поток лучше решать DBR | `CHAIN` |
| Buffer fever chart | Управлять проектными рисками | Нет remaining-duration reports | `CHAIN` |
| Old-rule audit | Технология внедрена, правила старые | Технология не снимает никакое constraint | `NBS` |
| Dollar-days metrics | Измерять flow, stockouts and excess inventory | Нет денежного веса задержки/запаса | `NBS` |
| Inner simplicity scan | Ситуация кажется чрезмерно сложной | Нужно немедленное safety/legal действие | `CHOICE` |
| Expected effect test | Проверить причинное объяснение | Причина не должна иметь наблюдаемых следствий | `CHOICE` |
| People-are-good rewrite | Поведение людей кажется иррациональным | Есть доказанный злонамеренный/опасный поступок | `CHOICE` |

## Лайфхаки, приемы и инструменты к внедрению

### 1. Constraint one-pager

Что внедрить:
- Одностраничную карточку: цель системы, current throughput, suspected constraint, evidence, exploit actions, subordination rules, expected shift.

Когда применять:
- Перед любой крупной инициативой, операционным улучшением или изменением правил.

Первый шаг:
- Заполнить карточку для самой болезненной очереди или конфликта.

Источник / где искать в книге:
- `GOAL`: bottleneck, five focusing steps, строки 2321-2685 и 4920-4935.

### 2. Stop-starting rule

Что внедрить:
- Не запускать работу в систему быстрее, чем constraint способен ее пропустить.

Когда применять:
- WIP растет, люди заняты, delivery не ускоряется.

Первый шаг:
- Остановить запуск новых задач/заказов, которые не нужны ближайшему flow through constraint.

Источник / где искать в книге:
- `GOAL`: DBR, строки 3520-3605; `CHAIN`: portfolio overload, строки 2977-3060.

### 3. UDE cluster before solution

Что внедрить:
- Перед strategy session собирать 5-10 observable UDE и строить причинную логику.

Когда применять:
- Когда команда спорит о решениях, но не согласовала проблему.

Первый шаг:
- Запретить решения на первом раунде; собирать только нежелательные явления.

Источник / где искать в книге:
- `LUCK`: UDE and CRT, строки 3829-4950.

### 4. Cloud assumption breaker

Что внедрить:
- Каждый конфликт переводить в cloud и искать false assumption.

Когда применять:
- Когда выбор выглядит как trade-off: speed vs quality, stockout vs excess, control vs autonomy, price vs margin.

Первый шаг:
- Выписать goal, two needs, two actions and assumptions за стрелками.

Источник / где искать в книге:
- `LUCK`: Cloud, строки 457-680 and 2621-2953; `CHOICE`: conflict/assumption chapters 5-6.

### 5. Future Reality check

Что внедрить:
- Перед внедрением сильной injection строить short FRT с desirable and negative effects.

Когда применять:
- Изменяются KPI, supply chain rules, commercial offer, project governance or technology process.

Первый шаг:
- Записать 6 expected effects и 3 possible negative branches.

Источник / где искать в книге:
- `LUCK`: FRT, строки 6620-7188; `CHOICE`: expected effect, глава 14.

### 6. Project buffer instead of task padding

Что внедрить:
- Убирать индивидуальную safety из задач и переносить защиту в project buffer.

Когда применять:
- Проекты хронически опаздывают, несмотря на "реалистичные" оценки.

Первый шаг:
- На одном проекте пересчитать critical chain and buffers.

Источник / где искать в книге:
- `CHAIN`: estimates and project buffer, строки 591-647 and 1904-1922.

### 7. Buffer-based priority board

Что внедрить:
- Приоритеты задач строить по buffer penetration, а не по громкости заказчика.

Когда применять:
- Всё отмечено красным и PM теряет фокус.

Первый шаг:
- Разделить задачи на green/yellow/red by buffer impact.

Источник / где искать в книге:
- `CHAIN`: buffer priority, строки 2041-2046.

### 8. Old-rule audit after technology

Что внедрить:
- После внедрения технологии проверять rules, KPI, approvals and batch/release practices.

Когда применять:
- Новая система есть, а результат не меняется.

Первый шаг:
- Спросить: какое старое ограничение сняла технология и какие правила из-за него больше не нужны?

Источник / где искать в книге:
- `NBS`: necessary but not sufficient, строки 5011-5038 and 8437-8488.

### 9. Pull replenishment pilot

Что внедрить:
- Пилот: хранить буфер ближе к source и пополнять проданное коротким циклом.

Когда применять:
- Supply chain имеет и дефицит, и излишки.

Первый шаг:
- Выбрать SKU family, снизить regional target stock и запустить ежедневное replenishment from source buffer.

Источник / где искать в книге:
- `NBS`: pull replenishment, строки 7120-7800.

### 10. Dollar-days measurement

Что внедрить:
- Измерять просроченный throughput and excess inventory через dollar-days.

Когда применять:
- Локальные KPI делают перепроизводство и задержки рациональными.

Первый шаг:
- Посчитать throughput dollar-days для одного late order и inventory dollar-days для одного excess stock.

Источник / где искать в книге:
- `NBS`: dollar-days, строки 7890-7945 and 9025-9044.

### 11. Expected-effect test for every "because"

Что внедрить:
- Любое объяснение причины должно предсказывать еще один наблюдаемый эффект.

Когда применять:
- Встречаются ярлыки: "люди сопротивляются", "рынок плохой", "культура не готова".

Первый шаг:
- Спросить: если причина верна, какой второй эффект мы должны увидеть?

Источник / где искать в книге:
- `CHOICE`: expected effect and anti-tautology, глава 14.

### 12. Never-say-I-know review

Что внедрить:
- После успешного решения проводить review новой реальности: какие новые возможности и constraints появились?

Когда применять:
- Решение сработало и команда хочет остановиться.

Первый шаг:
- На retro спросить: "Что стало возможно теперь, чего раньше не существовало?"

Источник / где искать в книге:
- `CHOICE`: never say "I know", главы 8, 10-13.

## Deep reference body

### 1. Unified TOC operating model

TOC у Голдратта повторяется в разных доменах:

| Домен | Constraint | Protection | Wrong local behavior | Correct system behavior |
|---|---|---|---|---|
| Production | Bottleneck machine/process | Buffer before bottleneck, DBR | Keep everyone busy | Protect bottleneck throughput |
| Market | Demand / offer | Reliable delivery promise | Sell generic price/feature | Offer based on system capability |
| Strategy/change | Core conflict / false assumption | FRT and Transition Tree | Compromise or local fixes | Break assumption and sequence buy-in |
| Projects | Critical chain / scarce resource | Project, feeding, resource buffers | Pad every task, multitask | Aggregate protection and manage buffer |
| Technology | Old rules after new capability | Rule and metric replacement | Feature rollout | Business-result rule change |
| Thinking | Tautology / complexity belief | Expected effects | Labels and blame | Cause-effect clarity |

### 2. Five focusing steps as master loop

The Goal gives the operating skeleton:
1. Identify the constraint.
2. Exploit the constraint.
3. Subordinate everything else.
4. Elevate the constraint.
5. If the constraint moves, go back to step 1.

How other books extend it:
- `LUCK`: if constraint is policy/conflict, use Thinking Processes.
- `CHAIN`: if constraint is project/resource/time uncertainty, use critical chain and buffers.
- `NBS`: if constraint was removed by technology, remove the old rules and measurements.
- `CHOICE`: if constraint is thinking clarity, test assumptions and expected effects.

### 3. Throughput world vs cost world

Cost world:
- every local unit should be efficient;
- idle time looks bad;
- inventory can look like asset;
- feature completion looks like progress;
- project task completion looks like progress.

Throughput world:
- only the system constraint determines flow;
- non-constraint overproduction creates inventory/WIP;
- throughput is realized at the end/customer;
- progress is measured by protected flow, not local activity.

### 4. Thinking Processes stack

| Question | Tool | Practical output |
|---|---|---|
| What to change? | CRT | Core problem behind UDE |
| What to change to? | Cloud + injection + FRT | Conflict-breaking solution checked for effects |
| How to cause the change? | PRT + Transition Tree | Obstacles, intermediate objectives, action sequence |

Practical rule:
- Не строить FRT без injection.
- Не строить Transition Tree без понимания логики другой стороны.
- Не продавать solution, пока клиент/команда не видит own UDE and conflict.

### 5. CCPM stack

CCPM переносит TOC из production flow в project flow:
- вместо bottleneck machine - critical chain;
- вместо material buffer - project/feeding/resource buffers;
- вместо local efficiency - remaining duration and buffer penetration;
- вместо запускать всё - release by constraint.

Ключевая мысль:
- неопределенность не убирается; она агрегируется и управляется.

### 6. Technology change stack

Технология дает value только когда:
1. снимает или ослабляет ограничение;
2. старые правила, возникшие из-за этого ограничения, удалены;
3. метрики не поощряют старое поведение;
4. daily work действительно меняется;
5. эффект измеряется как business result.

Если шаги 2-4 пропущены, технология ускоряет старую систему.

### 7. Clear thinking stack

`The Choice` дает guardrail для всех остальных инструментов:
- не путать сложность деталей с сложностью причины;
- не принимать конфликт как данность;
- не объяснять людей унижающими ярлыками;
- не говорить "мы знаем" после первого успеха;
- проверять каждую причину вторым expected effect.

## Coverage map

### Source to toolkit coverage

| Source | Covered concepts |
|---|---|
| `GOAL` | goal, throughput/inventory/operating expense, bottlenecks, DBR, batch sizes, cost world vs throughput world, five focusing steps |
| `LUCK` | UDE, CRT, Evaporating Cloud, FRT, PRT, Transition Tree, mafia offer, buy-in logic |
| `CHAIN` | safety, student syndrome, critical chain, project/feeding/resource buffers, buffer management, multi-project drum |
| `NBS` | technology necessary-not-sufficient, old-rule audit, ERP/MRP, pull replenishment, dollar-days, business-result offer |
| `CHOICE` | inner simplicity, conflict assumptions, harmony, people are good, expected effect, never say "I know" |

### Dedupe notes

| Repeated idea | Unified treatment | Sources |
|---|---|---|
| Constraint governs system result | One master loop: identify/exploit/subordinate/elevate/restart | `GOAL`, `CHAIN`, `NBS` |
| Local optimum harms system | Treated once under throughput world and measurement rewrite | `GOAL`, `NBS`, `CHOICE` |
| Conflict is not solved by compromise | Cloud/assumption breaker is the unified mechanism | `LUCK`, `CHOICE` |
| Protection must be aggregated | Buffers appear once as protection logic across production/project/supply | `GOAL`, `CHAIN`, `NBS` |
| Technology alone is not enough | Rule/measurement change is the unified adoption principle | `NBS`, supported by `GOAL` policy constraints |
| Do not stop at first success | Restart constraint loop + never-say-I-know review | `GOAL`, `CHOICE` |

### Source landmarks

| Concept | Source landmarks |
|---|---|
| Goal and T/I/OE | `GOAL` строки 450-970 |
| Bottleneck and exploit | `GOAL` строки 2321-2685 |
| DBR and batch size | `GOAL` строки 3520-3909 |
| CRT/Cloud/FRT/PRT/Transition Tree | `LUCK` строки 1634-1643, 3829-4950, 6620-8226, 9261-9538 |
| Critical chain and buffers | `CHAIN` строки 1904-2046, 2682-2850 |
| Multi-project drum | `CHAIN` строки 2977-3060 |
| Technology + old rules | `NBS` строки 5011-5171, 8437-8488 |
| Pull replenishment and dollar-days | `NBS` строки 7120-7945 |
| Inner simplicity and expected effects | `CHOICE` главы 2-4, 14 |

## Excluded / limited source notes

- Романные сюжеты не пересказываются полностью.
- Большие фрагменты исходного текста не воспроизводятся.
- Этот toolkit не включает все биографические, семейные и корпоративно-сюжетные детали, если они не вводят рабочий инструмент.
- `The Goal` source copy на английском, остальные источники на русском; итоговый unified layer на русском.
- Конкретные отраслевые числа из кейсов не используются как универсальные benchmark'и.
- Любое применение к safety-critical, legal, medical, financial reporting or employment decisions требует отдельной профильной проверки.

## Anti-patterns

### 1. Улучшать всё сразу

Симптом:
- Десятки инициатив, много занятости, throughput почти не меняется.

Почему плохо:
- Большинство улучшений не затрагивают constraint.

Что делать:
- Constraint one-pager + five focusing steps.

### 2. Держать всех занятыми

Симптом:
- Non-constraint производит WIP, чтобы не простаивать.

Почему плохо:
- Inventory/WIP растет, throughput не растет.

Что делать:
- Subordination, rope, WIP release by constraint.

### 3. Компромисс вместо снятия конфликта

Симптом:
- Обе стороны теряют часть needs, а проблема возвращается.

Почему плохо:
- False assumption остается.

Что делать:
- Cloud assumption breaker.

### 4. Диаграммы как украшение решения

Симптом:
- CRT/FRT рисуют после того, как решение уже политически принято.

Почему плохо:
- Логика не проверяет решение, а оправдывает его.

Что делать:
- UDE first, injection after assumptions.

### 5. Project plan with padded tasks

Симптом:
- Каждая задача имеет запас, но проект опаздывает.

Почему плохо:
- Safety съедается поведением и переключениями.

Что делать:
- Critical chain + project buffer.

### 6. Technology feature rollout

Симптом:
- Система внедрена, пользователи обучены, бизнес-эффекта мало.

Почему плохо:
- Старые правила и KPI продолжают управлять поведением.

Что делать:
- Old-rule audit + measurement rewrite.

### 7. Объяснять людей ярлыками

Симптом:
- "Они сопротивляются", "они ленивые", "им все равно".

Почему плохо:
- Вы перестаете искать причинно-следственную картину другой стороны.

Что делать:
- People-are-good rewrite + expected effect test.

### 8. Остановиться после первого успеха

Симптом:
- Решение сработало, команда закрепляет его как догму.

Почему плохо:
- Constraint уже мог сместиться.

Что делать:
- Restart focusing steps + never-say-I-know review.

## Практические сценарии

### Сценарий A. Операционный поток плохо поставляет результат

1. Сформулировать system goal and throughput.
2. Найти queue-based constraint.
3. Exploit: убрать простои, плохой input, ненужную работу.
4. Subordinate release and priorities.
5. Ввести buffer/rope.
6. Проверить, не сместился ли constraint в market или policy.

### Сценарий B. Стратегический конфликт

1. Собрать UDE.
2. Построить CRT до core conflict.
3. Построить cloud.
4. Выписать assumptions.
5. Найти injection.
6. Проверить FRT.
7. Разложить PRT and Transition Tree.

### Сценарий C. Проекты хронически опаздывают

1. Проверить safety in task estimates.
2. Убрать individual padding.
3. Построить critical chain with resource dependencies.
4. Добавить project, feeding and resource buffers.
5. Управлять по buffer penetration.
6. В портфеле найти drum resource and stagger release.

### Сценарий D. ERP/IT не дала ожидаемого эффекта

1. Назвать constraint, которое технология должна была снять.
2. Выписать old rules and old metrics.
3. Убрать локальные KPI, которые оживляют старое ограничение.
4. Запустить минимальный value module.
5. Измерять business result.
6. Обучить людей новым правилам daily work.

### Сценарий E. Команда сопротивляется изменению

1. Перестать объяснять поведение ярлыком.
2. Сформулировать логику другой стороны.
3. Найти ее constraint, risk, metric and knowledge zone.
4. Построить offer/change as win-win.
5. Проверить expected effects.
6. Дать безопасный эксперимент, который меняет experience, not only opinion.

## Cheatsheet

### 12 вопросов перед изменением

1. Какая цель системы?
2. Что является throughput?
3. Где constraint?
4. Это physical, market, policy, project, technology or thinking constraint?
5. Что мы можем exploit без инвестиций?
6. Что нужно subordinate?
7. Какая старая метрика поддерживает вредное поведение?
8. Есть ли conflict cloud?
9. Какая assumption делает конфликт неизбежным?
10. Как мы проверим injection до масштабирования?
11. Какой первый observable result?
12. Что будем делать, если constraint сместится?

### Быстрый выбор инструмента

- Неясно, что улучшать -> Goal filter and constraint search.
- Много симптомов -> UDE + CRT.
- Есть дилемма -> Cloud.
- Есть решение -> FRT.
- Есть obstacles -> PRT.
- Надо внедрить -> Transition Tree.
- Проект опаздывает -> Critical Chain.
- IT не окупается -> Old-rule audit.
- Люди сопротивляются -> People-are-good rewrite.
- Объяснение круговое -> Expected effect test.

## Glossary

- `TOC` - Theory of Constraints, управление системой через ограничение.
- `Throughput` - деньги/ценность, которые система генерирует через завершенный внешний результат.
- `Inventory` - деньги/работа, застрявшие внутри системы до throughput.
- `Operating expense` - затраты на превращение inventory в throughput.
- `Constraint` - элемент, правило, рынок, ресурс или assumption, ограничивающие результат системы.
- `Five Focusing Steps` - identify, exploit, subordinate, elevate, repeat.
- `Drum-Buffer-Rope` - синхронизация потока вокруг constraint.
- `UDE` - undesirable effect, наблюдаемое нежелательное явление.
- `CRT` - Current Reality Tree.
- `Cloud` - Evaporating Cloud, диаграмма конфликта.
- `Injection` - изменение, снимающее conflict assumption.
- `FRT` - Future Reality Tree.
- `PRT` - Prerequisite Tree.
- `Transition Tree` - логика действий для внедрения.
- `Critical chain` - longest dependent chain in project including resource dependencies.
- `Project buffer` - агрегированная защита срока проекта.
- `Feeding buffer` - защита critical chain от боковых путей.
- `Resource buffer` - предупреждение/подготовка ключевого ресурса.
- `Old-rule audit` - поиск правил, оставшихся после снятия старого ограничения.
- `Throughput dollar-days` - денежный вес просроченного throughput, умноженный на дни.
- `Inventory dollar-days` - денежный вес запасов, умноженный на дни удержания.
- `Inner simplicity` - убеждение, что за множеством симптомов обычно стоит малая связка причин.
- `Expected effect` - дополнительный наблюдаемый эффект, который должна предсказать настоящая причина.

## Topic index

| Тема | Primary sections | Source |
|---|---|---|
| Цель системы | Battle route, Cheatsheet | `GOAL` |
| Throughput / inventory / OE | Deep reference 3, Glossary | `GOAL` |
| Bottleneck | Быстрая карта, Tool selector | `GOAL` |
| DBR | Action cards 2, Deep reference 1 | `GOAL` |
| Five focusing steps | Deep reference 2 | `GOAL`, `NBS` |
| UDE | Action card 3, Scenario B | `LUCK` |
| CRT | Tool selector, Scenario B | `LUCK` |
| Cloud | Action card 4, Scenario B | `LUCK`, `CHOICE` |
| FRT | Action card 5 | `LUCK` |
| Transition Tree | Training route, Scenario B | `LUCK` |
| Critical Chain | Action card 6, Scenario C | `CHAIN` |
| Project buffer | Action card 6, Scenario C | `CHAIN` |
| Buffer priority | Action card 7 | `CHAIN` |
| Technology not sufficient | Action card 8, Scenario D | `NBS` |
| Old rules | Deep reference 6 | `NBS` |
| Pull replenishment | Action card 9 | `NBS` |
| Dollar-days | Action card 10 | `NBS` |
| Inner simplicity | Deep reference 7 | `CHOICE` |
| People are good | Action card 11, Scenario E | `CHOICE` |
| Never say "I know" | Action card 12 | `CHOICE` |

## Scope and limits

Этот unified toolkit покрывает практическое применение корпуса Голдратта по пяти источникам: операционный TOC, Thinking Processes, CCPM, technology/rule-change и ясное мышление. Он не является полным текстом книг, сертификационным курсом TOC, юридической/финансовой/психологической консультацией или заменой domain-specific engineering. Для реальных изменений с деньгами, людьми, безопасностью, контрактами и публичными обещаниями нужен отдельный risk review и проверка фактических данных.
