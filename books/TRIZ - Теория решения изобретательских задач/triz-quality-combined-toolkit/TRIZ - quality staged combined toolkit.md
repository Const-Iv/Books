# TRIZ - quality staged combined toolkit

Статус: отдельный сборный toolkit, созданный после quality-first standalone разборов. Он не заменяет старый `triz-unified-practical-toolkit`; он нужен для сравнения старой прямой multi-book сборки и новой staged методики.

Важно: это не пересказ корпуса TRIZ. Это рабочая система применения TRIZ: как выбрать маршрут, сформулировать задачу, найти противоречие, выбрать инструмент, получить концепты, проверить решение и развивать практику.

## 1. Связь с charter проекта

Books должен превращать книги в применимый toolkit: модели, принципы, техники, anti-patterns, сценарии применения, cheatsheet, glossary and topic index. Поэтому этот combined файл устроен не как "что говорят книги о TRIZ", а как practical operating system: что делать, когда делать, каким источником проверять, и как не потерять coverage.

## 2. Как пользоваться toolkit

Если задача срочная:
1. Открой `Быстрая карта`.
2. Выбери ближайший route.
3. Возьми action card из `Лайфхаки, приемы и инструменты к внедрению`.
4. Проверь anti-patterns.
5. Зафиксируй solution log.

Если задача сложная:
1. Сделай function card.
2. Найди operational zone.
3. Сформулируй contradiction.
4. Выбери route: matrix, separation, S-field/standards, Meta-ARIZ, ARIZ-85В, trends.
5. Проведи verification and secondary problem pass.

Если нужно обучение:
1. Начни с task card from `ALT-INVENTOR`.
2. Не показывай answer до route.
3. Извлеки transferable principle.
4. Сохрани case library.

## 3. Быстрая карта

| Ситуация | Первый route | Главные sources | Выход |
|---|---|---|---|
| Есть жалоба, но нет задачи | Mini-problem + function card | `ALT-RU-ALG`, `HLYN`, `GADD` | clean problem statement |
| Решения идут перебором | Stop trial-and-error, build model | `ALT-RU-ALG`, `ALT-EN-ALG`, `ALT-FRAG` supporting | disciplined route |
| Не названа функция | Function card / function analysis | `HLYN`, `GADD`, `ALT-EXACT` | main function and action model |
| Улучшение портит другой параметр | Technical contradiction + matrix/CICO | `ALT-EN-ALG`, `HLYN`, `ORLOV`, `GADD` | ranked principles |
| Один элемент должен иметь два свойства | Physical contradiction + separation | `ALT-INVENTOR`, `HLYN`, `GADD` | separation concept |
| Функция слабая/вредная/отсутствует | S-field + standards | `ALT-EXACT`, `GADD`, `HLYN` | transformation route |
| Mapping спорный | CICO | `ORLOV`, `ALT-EN-ALG` | repeated navigator/principle cluster |
| Нужен полный алгоритм | Meta-ARIZ or ARIZ-85В | `ORLOV`, `HLYN`, `ALT-EXACT` | full route |
| Инерция мышления | STC, little-men, anti-inertia inventory | `ALT-INVENTOR`, `ORLOV`, `ALT-RU-ALG` | reframed problem |
| Нужен roadmap | Evolution trends and laws | `ALT-EN-ALG`, `ALT-EXACT`, `HLYN`, `GADD` | next-generation hypotheses |
| Идея найдена | Verification + secondary problems | `ORLOV`, `GADD`, `HLYN` | tested concept |

## 4. Лайфхаки, приемы и инструменты к внедрению

### 4.1 Делай passport of problem до идеи

Что внедрить:
- Карточку `цель`, `главная функция`, `нежелательный эффект`, `что нельзя ухудшить`, `operational zone`, `ограничения`.

Когда применять:
- Всегда, если задача звучит как жалоба или готовое решение.

Первый шаг:
- Убрать из формулировки название предлагаемого устройства/feature and write useful result.

Источник / где искать:
- `ALT-RU-ALG` mini-problem; `HLYN` function card; `GADD` problem understanding.

### 4.2 Останавливай brainstorming до problem model

Что внедрить:
- Parking lot для идей, но обсуждение идей разрешено только после contradiction or S-field model.

Когда применять:
- Когда команда генерирует много вариантов but cannot choose.

Первый шаг:
- Для каждой идеи спросить: "какое противоречие она снимает?"

Источник / где искать:
- `ALT-RU-ALG` critique of trial-and-error; `GADD` Bad Solution Park.

### 4.3 Делай function-first route

Что внедрить:
- `system -> main function -> object -> tool -> field/resource -> harm/insufficiency`.

Когда применять:
- Когда спор идет о компоненте.

Первый шаг:
- Записать главную функцию в глагольной форме.

Источник / где искать:
- `HLYN` technical system functions; `GADD` Function Analysis; `ALT-EXACT` S-field.

### 4.4 Локализуй operational zone

Что внедрить:
- Поле `OZ/OT`: где and when conflict happens.

Когда применять:
- Перед resources, standards, separation or physical effects.

Первый шаг:
- Сузить конфликт до минимального контакта/поля/интерфейса/момента.

Источник / где искать:
- `ORLOV` operational zone; `GADD` problem-solving maps; `HLYN` ARIZ-85В.

### 4.5 Если matrix спорная, используй CICO

Что внедрить:
- 3-5 alternative parameter pairs and repeated principles ranking.

Когда применять:
- Когда разные эксперты честно выбирают разные parameters.

Первый шаг:
- Не спорить о единственном mapping; собрать cluster.

Источник / где искать:
- `ORLOV` CICO; `ALT-EN-ALG` contradiction matrix; `GADD` parameter mapping.

### 4.6 Превращай principles в questions

Что внедрить:
- Таблицу `principle -> question to OZ -> concept -> resource -> contradiction solved`.

Когда применять:
- После matrix/CICO.

Первый шаг:
- Например, `dynamization` -> "что должно стать adjustable именно в OZ?"

Источник / где искать:
- `ALT-EN-ALG`, `ALT-RU-ALG`, `HLYN`, `GADD`.

### 4.7 Для physical contradiction сначала разделяй требования

Что внедрить:
- Проверку: time, space, condition, structure, system/supersystem.

Когда применять:
- Когда matrix gives compromises.

Первый шаг:
- Записать one element and opposite requirements.

Источник / где искать:
- `ALT-INVENTOR`, `HLYN`, `GADD`.

### 4.8 Для weak/harmful action переходи к S-field

Что внедрить:
- `S1-S2-F` model with problem type.

Когда применять:
- Если function weak, missing, harmful or measurement-related.

Первый шаг:
- Назвать object, tool and field; if one is missing, mark it.

Источник / где искать:
- `ALT-EXACT`, `GADD`, `HLYN`.

### 4.9 Ищи physical effect только после required action

Что внедрить:
- Formula: `нужно физически [действие] над [объектом] в [условиях]`.

Когда применять:
- Когда нужен новый principle of action.

Первый шаг:
- Сначала write action, then search effect.

Источник / где искать:
- `ALT-EXACT` physical effects; `GADD` effects/knowledge tools.

### 4.10 Используй ideality как filter, not slogan

Что внедрить:
- Gate: "может ли функция выполняться существующим resource без нового элемента?"

Когда применять:
- При выборе concepts.

Первый шаг:
- Для каждого concept указать, что добавляется and what can be removed.

Источник / где искать:
- `ALT-RU-ALG`, `ALT-EN-ALG`, `GADD`, `HLYN`, `ALT-FRAG` supporting.

### 4.11 Делай STC when stuck

Что внедрить:
- Size, Time, Cost extremes.

Когда применять:
- Когда concepts repeat current design.

Первый шаг:
- Довести one dimension to absurd extreme, then recover usable principle.

Источник / где искать:
- `ALT-INVENTOR`; `ORLOV` fantasy and non-algorithmic methods.

### 4.12 Делай little-men model для микроуровня

Что внедрить:
- Crowd of agents performing local behavior that creates macro function.

Когда применять:
- Materials, fields, flows, contact, surface, microstructure.

Первый шаг:
- Записать what each small agent must do.

Источник / где искать:
- `ALT-INVENTOR`, `ALT-EXACT`, `ORLOV`.

### 4.13 Эскалируй в Meta-ARIZ before full ARIZ-85В

Что внедрить:
- First use compact route: diagnosis -> OZ/resources -> contradiction -> FIM -> navigator -> verification.

Когда применять:
- For complex tasks where matrix/standards are not enough.

Первый шаг:
- Записать why simpler route failed.

Источник / где искать:
- `ORLOV`; full ARIZ details from `HLYN`, `ALT-EXACT`.

### 4.14 Проверяй solution before celebrating

Что внедрить:
- Verification table: contradiction solved, resource used, new harm, secondary problem, test.

Когда применять:
- После каждого strong concept.

Первый шаг:
- Вернуться к original contradiction and mark what changed.

Источник / где искать:
- `ORLOV`, `GADD`, `HLYN`.

### 4.15 Делай evolution pass после решения

Что внедрить:
- Check trends/laws: ideality, dynamization, transition to micro-level, controllability, supersystem shift.

Когда применять:
- Roadmap, patent, next-generation product.

Первый шаг:
- Ask what next contradiction appears if concept succeeds.

Источник / где искать:
- `ALT-EN-ALG`, `ALT-EXACT`, `HLYN`, `GADD`.

### 4.16 Веди case library through reinvention

Что внедрить:
- Store condition, contradiction, tool, concept, answer comparison, lesson.

Когда применять:
- Training, retrospectives, internal TRIZ adoption.

Первый шаг:
- Hide known answer and reconstruct route.

Источник / где искать:
- `ORLOV` reinvention; `ALT-INVENTOR` task library.

## 5. Единый рабочий процесс TRIZ

### Шаг 0. Intake and safety

1. What result is needed?
2. What cannot get worse?
3. What is factual vs assumed?
4. What domain expert or experiment is needed?

Output:
- problem is safe to analyze and does not embed one favorite solution.

### Шаг 1. Function and system frame

1. Name main function.
2. Name object of function.
3. Name tool and field.
4. Fill subsystem/system/supersystem.
5. Fill past/present/future if context matters.

Sources:
- `HLYN`, `GADD`, `ALT-EXACT`.

### Шаг 2. Operational zone and resources

1. Locate operational zone.
2. Locate operational time.
3. List resources in OZ.
4. Include harmful factors as candidate resources.

Sources:
- `ORLOV`, `GADD`, `ALT-EXACT`.

### Шаг 3. Choose contradiction route

| Problem model | Route |
|---|---|
| Improving A worsens B | technical contradiction -> matrix/CICO -> principles |
| One element requires P and not-P | physical contradiction -> separation |
| Function weak/missing/harmful | S-field -> standards |
| Need unknown physical action | required action -> physical effect |
| Multiple unresolved conflicts | Meta-ARIZ -> ARIZ-85В |

### Шаг 4. Generate concepts

For each concept capture:
- source route;
- principle/navigator/standard;
- resource;
- contradiction solved;
- expected benefit;
- possible new harm.

### Шаг 5. Verification

1. Did concept remove contradiction or only soften it?
2. Did it add complexity?
3. Which resource performs work?
4. What new harm appears?
5. What test proves feasibility?

Sources:
- `ORLOV`, `GADD`, `HLYN`.

### Шаг 6. Evolution and learning

1. Apply trends/laws.
2. Identify next-generation direction.
3. Save task card.
4. Add reinvention case if useful.

Sources:
- `ALT-EN-ALG`, `ALT-EXACT`, `GADD`, `ORLOV`.

## 6. Tool selector

| Tool | Best for | Do not use when | Primary source layers |
|---|---|---|---|
| Mini-problem | unclear complaint | task already has clean model | `ALT-RU-ALG` |
| Function card | component debate | function already modeled | `HLYN`, `GADD` |
| 9-screen | context/roadmap | isolated mechanical issue only | `HLYN`, `GADD` |
| Matrix | technical contradiction | physical contradiction | `ALT-EN-ALG`, `HLYN`, `GADD` |
| CICO | ambiguous mapping | one obvious parameter pair | `ORLOV` |
| Separation | physical contradiction | parameter trade-off only | `HLYN`, `GADD`, `ALT-INVENTOR` |
| S-field | weak/harmful function | problem is pure policy/market | `ALT-EXACT`, `GADD` |
| Standards | recurring function model | no S-field classification | `ALT-EXACT`, `GADD`, `HLYN` |
| Physical effects | required action known | action is not defined | `ALT-EXACT`, `GADD` |
| STC | mental inertia | concept already varied enough | `ALT-INVENTOR` |
| Little-men | micro/distributed interaction | macro model sufficient | `ALT-INVENTOR`, `ALT-EXACT` |
| Meta-ARIZ | complex practical task | quick route works | `ORLOV` |
| ARIZ-85В | hard nonstandard problem | team cannot sustain full route | `HLYN`, `ALT-EXACT` |
| Verification | after any concept | never skip | `ORLOV`, `GADD` |

## 7. Coverage map

| Combined block | Standalone sources used | What was merged | What changed from raw synthesis |
|---|---|---|---|
| Problem framing | `ALT-RU-ALG`, `HLYN`, `GADD`, `ALT-FRAG` supporting | mini-problem, function card, ideal mindset | framing is now action-sequenced |
| Contradictions | `ALT-RU-ALG`, `ALT-EN-ALG`, `ALT-INVENTOR`, `HLYN`, `GADD`, `ORLOV` | technical/physical contradiction, matrix, CICO | CICO added as explicit ambiguity route |
| Ideality/resources | `ALT-RU-ALG`, `ALT-EN-ALG`, `GADD`, `ORLOV`, `ALT-FRAG` supporting | ideal machine, ideal outcome, resource scan, FIM | ideality no longer only philosophical |
| S-field/standards | `ALT-EXACT`, `GADD`, `HLYN` | S-field, standards, Oxford/practical application | standards are selected by problem type |
| Algorithmic routes | `ORLOV`, `HLYN`, `ALT-EXACT`, `GADD` | Meta-ARIZ, ARIZ-85В, problem-solving maps | Meta-ARIZ is now pre-full-ARIZ escalation |
| Anti-inertia | `ALT-RU-ALG`, `ALT-INVENTOR`, `ORLOV`, `GADD` | psychological inertia, STC, little-men, fantasy | anti-inertia is linked to exact use cases |
| Evolution | `ALT-EN-ALG`, `ALT-EXACT`, `HLYN`, `GADD` | laws/trends/roadmap | evolution pass added after verification |
| Learning system | `ALT-INVENTOR`, `ORLOV`, `GADD` | task cards, reinvention, audit trail | training layer separated from battle route |
| Fragment handling | `ALT-FRAG` | ideal/trial-error framing only | fragment cannot be sole evidence |

## 8. Dedupe notes

| Повторяющаяся идея | Объединенная формулировка | Sources |
|---|---|---|
| Идеальность / идеальная машина / ideal outcome | Нужная функция выполняется с меньшими затратами, вредом и системой; сначала ищи resource/function transfer | `ALT-RU-ALG`, `ALT-EN-ALG`, `GADD`, `HLYN`, `ALT-FRAG` supporting |
| Technical contradiction | Улучшение одного параметра ухудшает другой; matrix applies only after mapping | `ALT-RU-ALG`, `ALT-EN-ALG`, `HLYN`, `GADD`, `ALT-INVENTOR` |
| Physical contradiction | Один элемент должен иметь противоположные свойства; use separation | `ALT-INVENTOR`, `HLYN`, `GADD` |
| S-field | Function model via object/tool/field; classify before standards | `ALT-EXACT`, `GADD`, `HLYN` |
| Standards | Reusable transformations selected by problem type | `ALT-EXACT`, `GADD`, `HLYN` |
| Psychological inertia | Old terms and system forms restrict search; use reframing/STC/little-men | `ALT-RU-ALG`, `ALT-INVENTOR`, `ORLOV` |
| Algorithm | Use route only when it changes model and decisions | `ALT-RU-ALG`, `ALT-EN-ALG`, `ALT-EXACT`, `ORLOV`, `HLYN` |
| Verification | A concept is not strong until contradiction/new harms are checked | `ORLOV`, `GADD`, `HLYN` |

## 9. Excluded / limited source notes

| Source | Limitation | How handled |
|---|---|---|
| `ALT-FRAG` | ознакомительный фрагмент, not full book | supporting framing only |
| `ALT-EXACT` | OCR source may distort terms | use for model coverage; verify exact terms in PDF |
| `ALT-INVENTOR` | OCR source and introductory style | use for training/STC/little-men, not standards authority |
| `ALT-RU-ALG` | historical terminology and extraction structure | combine with modern layers |
| `GADD` | engineering-oriented modernization | keep as practical route, not sole classical source |
| `ORLOV` | advanced navigation terminology | use for Meta-ARIZ/CICO/verification, explain simply |
| `HLYN` | compact учебное пособие | use for structure/checklists/glossary, not full depth alone |

## 10. Anti-patterns

| Anti-pattern | Как проявляется | Чем опасен | Correction |
|---|---|---|---|
| Summary instead of toolkit | "книги говорят, что..." | no action | use action cards and routes |
| Raw multi-book merge | concepts listed without source layer | weak traceability | standalone-first coverage |
| Matrix first | principles chosen before contradiction | random advice | contradiction + mapping |
| Standards shopping | browsing standards without S-field | wrong route | classify function problem |
| ARIZ overload | full algorithm for simple issue | team drops method | selector / Meta-ARIZ |
| Fragment overclaim | `ALT-FRAG` treated as full source | false evidence | supporting-only |
| No verification | concept sounds strong but untested | hidden new harms | verification table |
| Training mixed with battle work | workshop too slow for real task | low adoption | separate modes |

## 11. Сценарии применения

### 11.1 Engineering defect with trade-off

Use:
- function card;
- technical contradiction;
- matrix/CICO;
- principles as questions;
- verification.

Expected output:
- 3-5 concepts, each with contradiction solved and resource used.

### 11.2 Harmful side effect

Use:
- S-field;
- harmful action standards;
- harm-as-resource;
- physical effect if needed.

Expected output:
- routes to isolate, neutralize, transform or use harm.

### 11.3 Roadmap / next generation

Use:
- 9-screen;
- ideality;
- evolution trends;
- verification of next contradiction.

Expected output:
- roadmap hypotheses and likely future bottlenecks.

### 11.4 Team training

Use:
- impossible opener;
- task card;
- contradiction;
- STC/little-men;
- reinvention.

Expected output:
- reusable case library and shared vocabulary.

### 11.5 Complex strategic problem

Use:
- diagnosis;
- operational zone/resources;
- Meta-ARIZ;
- ARIZ-85В if needed;
- verification and secondary problems.

Expected output:
- traceable route, not one-off brainstorm.

## 12. Cheatsheet

1. What is the useful result?
2. What is the main function?
3. What is the operational zone/time?
4. What gets better and worse?
5. Is contradiction technical or physical?
6. Is action weak, missing or harmful?
7. Which route fits: matrix, separation, standards, effects, Meta-ARIZ, ARIZ?
8. Which resource can do the work?
9. Which concept improves ideality?
10. What new harm or secondary problem appears?
11. Which source layer supports the method?
12. Should this become a training case?

## 13. Glossary

| Термин | Working definition |
|---|---|
| Mini-problem | clean formulation without embedded solution |
| Function card | system/function/object/tool/resource description |
| Operational zone | exact place/conditions of conflict |
| Technical contradiction | improving A worsens B |
| Physical contradiction | one element must have opposite properties |
| CICO | multi-mapping method for ambiguous matrix entry |
| S-field | substance-field action model |
| Standard | reusable transformation of a typical problem model |
| Physical effect | phenomenon that performs required physical action |
| Meta-ARIZ | compact navigation route for complex tasks |
| ARIZ-85В | full algorithmic route for difficult inventive tasks |
| STC | size/time/cost operator against inertia |
| Little-men model | micro-agent model for distributed behavior |
| Reinvention | reconstructing route to known strong solution |

## 14. Topic index

| Topic | Go to |
|---|---|
| Problem framing | `Лайфхаки 4.1-4.4`, `Единый рабочий процесс` |
| Matrix | `Tool selector`, `Лайфхаки 4.5-4.6` |
| Physical contradiction | `Лайфхаки 4.7` |
| S-field | `Лайфхаки 4.8`, `Tool selector` |
| Standards | `Tool selector`, `Coverage map` |
| Physical effects | `Лайфхаки 4.9` |
| Ideality | `Лайфхаки 4.10`, `Dedupe notes` |
| STC / little men | `Лайфхаки 4.11-4.12` |
| Meta-ARIZ / ARIZ | `Лайфхаки 4.13`, `Единый рабочий процесс` |
| Verification | `Лайфхаки 4.14`, `Anti-patterns` |
| Evolution | `Лайфхаки 4.15` |
| Training | `Лайфхаки 4.16`, `Сценарии применения` |

## 15. Scope and limits

Этот combined toolkit покрывает:
- practical TRIZ workflow for problem solving;
- source-layer traceability;
- route selection;
- dedupe and coverage across 8 sources;
- training and battle modes.

Он не покрывает:
- полный учебник TRIZ;
- полные таблицы matrix/standards/effects;
- юридическую, патентную или инженерную экспертизу;
- дословные source excerpts.
