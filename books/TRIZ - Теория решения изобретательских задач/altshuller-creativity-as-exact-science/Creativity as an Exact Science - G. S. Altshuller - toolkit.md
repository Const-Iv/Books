# Creativity as an Exact Science - G. S. Altshuller - практический toolkit

Статус: quality-first standalone toolkit для staged multi-book TRIZ workflow. Используется как source layer `ALT-EXACT` для нового сборного toolkit.

Важно: это не пересказ книги. Toolkit извлекает рабочую систему: ASIP/ARIZ-77, S-field analysis, standards, laws of technical system development, physical effects, tactics of invention and little-men modeling.

## 1. Отчет извлечения

Источник:
- Structured Markdown source copy: [runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-creativity-as-exact-science/G. S. Altshuller - Creativity as an Exact Science.md](<../../../runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-creativity-as-exact-science/G. S. Altshuller - Creativity as an Exact Science.md>)
- Локальный исходник PDF: `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-creativity-as-exact-science/G. S. Altshuller - Creativity as an Exact Science.pdf`
- Исторический extraction source: `runtime/books/TRIZ - Теория решения изобретательских задач/triz-unified-practical-toolkit/extracted/altshuller_gs_creativity_as_an_exact_science_the_theory_of_t.ocr.txt`
- Формат: `PDF`
- Метод извлечения: OCR через `pdftoppm` + `tesseract`
- Автор: `G. S. Altshuller`
- Название: `Creativity as an Exact Science`
- Язык исходника: английский
- Язык результата: русский
- Объем извлечения: 379 страниц, примерно 80 847 слов
- Оглавление: найдено, OCR pages 004-007
- Тип книги: exact-method TRIZ / S-field and standards foundation

Source landmarks:
- `Contradictions, Administrative, Technical and Physical`
- `An Algorithm for the Solution of Inventive Problems (ASIP)`
- `Principles of S-Field Analysis`
- `Construction and Transformation of S-Fields`
- `Standards for the Solution of Inventive Problems`
- `Appendix 2 Typical Models of Inventive Problems and their S-Field Transformations`
- `Appendix 3 The Application of Certain Physical Effects`

Ограничение:
- Это OCR source. Для точной формулировки стандарта или названия физического эффекта сверять PDF/source copy вручную.

## 2. Как пользоваться toolkit

Открывай этот toolkit, когда нужно:
- заменить расплывчатое "решить проблему" на S-field model;
- понять, является ли проблема weak/insufficient function, harmful function, measurement/detection problem или evolution problem;
- выбрать standard solution route;
- искать physical effect после определения нужной функции;
- использовать ASIP/ARIZ-77 для нестандартной задачи;
- связать локальное решение с laws of technical system development.

Практический маршрут:
1. Назови situation and problem.
2. Построй S-field: `S1`, `S2`, `F`.
3. Классифицируй model: missing, insufficient, harmful, measurement, evolution.
4. Выбери standard transformation.
5. Если нужен новый principle of action, ищи physical effect.
6. Проверь law of development.
7. Для сложной задачи эскалируй в ASIP route.

## 3. Быстрая карта

| Ситуация | Что делать | Инструмент источника | Выход |
|---|---|---|---|
| Нет действия | Достроить S-field | construction of S-fields | missing `S2` or `F` |
| Действие слабое | Усилить или преобразовать field | S-field transformations | stronger useful interaction |
| Есть вредное действие | Разрушить, изолировать или перевести вред | standards for harmful functions | harmful link controlled |
| Нужно измерить/обнаружить | Сначала проверить, можно ли убрать measurement need | measurement standards / effects | indirect or self-detecting route |
| Не хватает principle of action | Подобрать physical effect | appendix on physical effects | effect candidate |
| Система исчерпала текущий design | Проверить laws of development | strategy of invention | next-generation route |
| Задача нестандартная | Использовать ASIP | ASIP-77 | full problem-solving path |

## 4. Лайфхаки, приемы и инструменты к внедрению

### 4.1 Рисовать S-field до выбора стандарта

Что внедрить:
- Мини-схему `S1 object`, `S2 tool`, `F field`, `result: useful/weak/harmful/missing`.

Пример из книги:
- В книге S-field появляется как алфавит изобретательской задачи: вместо общего желания улучшить устройство нужно показать два вещества и поле между ними. Так задача с конфликтным действием перестает быть набором идей и становится моделью, где видно, чего не хватает: инструмента, поля или связи. Поэтому карточку S-field стоит рисовать до выбора стандарта.

Когда применять:
- Когда задача звучит как "не работает", "работает плохо", "портит объект", "не можем обнаружить".

Первый шаг:
- Назвать объект действия и чем система пытается на него действовать.

Источник / где искать в книге:
- Source copy: OCR pages 004-005, `Principles of S-Field Analysis`, `Construction and Transformation of S-Fields`.

### 4.2 Сначала классифицировать функцию

Что внедрить:
- Тэг к каждой problem model: `missing action`, `insufficient action`, `harmful action`, `measurement/detection`, `evolution`.

Пример из книги:
- Альтшуллер постоянно отделяет слабую полезную функцию, вредную функцию и отсутствующее действие. Например, если действие вроде охлаждения, удержания или измерения не выполняется, это разные классы задач, а не один общий brainstorm. Классификация функции нужна, чтобы выбрать правильный стандарт, а не красивую аналогию.

Когда применять:
- Перед выбором standards.

Первый шаг:
- Записать не "какой стандарт нравится", а "какой тип функционального дефекта есть".

Источник / где искать в книге:
- Source copy: `Typical Models of Inventive Problems and their S-Field Transformations`.

### 4.3 Выбирать physical effect после формулы действия

Что внедрить:
- Шаблон `нужно [физическое действие] над [объектом] в [зоне] при [условиях]`.

Пример из книги:
- В примере с полировальным инструментом конфликт решается не очередной механической формой, а физическим эффектом: носитель абразива может быть твердым во время работы и исчезать через таяние. Смысл примера в том, что эффект подбирается после формулы требуемого действия, а не из любопытного каталога.

Когда применять:
- Когда команда ищет material/technology before knowing required action.

Первый шаг:
- Перевести желаемый результат в физический глагол: separate, attract, repel, detect, heat, cool, change phase, damp, resonate, amplify.

Источник / где искать в книге:
- Source copy: `Appendix 3 The Application of Certain Physical Effects`.

### 4.4 Использовать harmful function как ресурс

Что внедрить:
- Проверку: "может ли вредное поле стать полезным, компенсирующим, управляющим или диагностическим?"

Пример из книги:
- В стандартах harmful function не всегда просто подавляется. Книга показывает ход: вредное действие можно изолировать, преобразовать или заставить работать на полезную функцию через дополнительное вещество или поле. Поэтому вред сначала стоит назвать как ресурс-кандидат.

Когда применять:
- Шум, тепло, вибрация, давление, отходы, задержки, износ.

Первый шаг:
- Назвать вредное поле и спросить, какую полезную функцию оно уже выполняет или может выполнить при преобразовании.

Источник / где искать в книге:
- Source copy: `S-field transformations`, standards for harmful functions.

### 4.5 Проверять law of development после local fix

Что внедрить:
- После каждого concept отмечать, какую закономерность развития он поддерживает.

Пример из книги:
- Во вступительных главах Альтшуллер противопоставляет улучшение парусного судна переходу к паровому принципу. Если закон развития подсказывает смену принципа действия, локальная доработка старой схемы может быть тупиком. Поэтому после local fix нужно сверять направление развития системы.

Когда применять:
- Когда решение должно стать platform direction, patent strategy or roadmap.

Первый шаг:
- Проверить: ideality, transition to micro-level, dynamization, controllability, system/supersystem shift.

Источник / где искать в книге:
- Source copy: `The Key to the Problem: Laws of Development of Technical Systems`, `The Lifeline of Technological Systems`.

### 4.6 Моделировать little men для микро-взаимодействий

Что внедрить:
- Сцену: множество маленьких элементов выполняют требуемое действие в operational zone.

Пример из книги:
- Little-men modeling нужен там, где важное взаимодействие происходит на микроуровне и его трудно увидеть обычной схемой. В книге этот прием переводит поля, частицы и распределенные контакты в наглядное поведение множества маленьких исполнителей. Так команда понимает, что именно должно происходить в зоне взаимодействия.

Когда применять:
- Поля, жидкости, порошки, микроструктуры, адгезия, смешивание, поверхность, распределенный контакт.

Первый шаг:
- Спросить: "что должны делать маленькие элементы, чтобы S-field стал полезным?"

Источник / где искать в книге:
- Source copy: `Modelling with the Aid of "Little Men"`.

### 4.7 Вести ASIP как escalation, не как первый шаг

Что внедрить:
- Решение escalates to ASIP только если S-field/standards/matrix не дают concept.

Пример из книги:
- ASIP/ARIZ в книге работает как строгий маршрут для задач, где простой стандарт или физический эффект не найден сразу. Алгоритм заставляет удерживать противоречие, ресурсы и проверку ответа в одной цепочке. Поэтому его стоит включать как escalation, а не как первый шаг для каждой мелкой задачи.

Когда применять:
- Для нестандартных задач с несколькими конфликтами и неясной operational zone.

Первый шаг:
- Записать, какие simpler routes уже не сработали и почему.

Источник / где искать в книге:
- Source copy: `An Algorithm for the Solution of Inventive Problems (ASIP)`, `Appendix 1 ASIP-77`.

### 4.8 Разделять problem model и problem situation

Что внедрить:
- Две записи: `situation` как бизнес/техническая жалоба и `problem model` как S-field/contradiction.

Пример из книги:
- Книга различает problem situation и problem model: жалоба еще не показывает, какое действие конфликтует. Только после выделения объекта, инструмента, поля и противоречия появляется рабочая модель. Это защищает от ситуации, когда команда решает не ту задачу.

Когда применять:
- Когда команда обсуждает симптомы вместо механизма.

Первый шаг:
- Перевести одну жалобу в model: объект, инструмент, поле, вред/недостаточность.

Источник / где искать в книге:
- Source copy: `Situation - Problem - Problem Model`.

### 4.9 Использовать standards как transformations, не как список решений

Что внедрить:
- Для каждого standard писать: `какую модель он меняет`, `что добавляет/убирает`, `какой ресурс использует`.

Пример из книги:
- Стандарты у Альтшуллера работают как преобразования S-field модели: добавить поле, изменить вещество, разорвать вредную связь, перейти к другой структуре. Это не список готовых ответов, а язык трансформаций. Поэтому стандарт нужно читать через текущую модель задачи.

Когда применять:
- Когда есть соблазн скопировать пример стандарта.

Первый шаг:
- Переписать standard в neutral transformation без отраслевого примера.

Источник / где искать в книге:
- Source copy: `Standards for the Solution of Inventive Problems`.

### 4.10 Добавлять effects search только с verification

Что внедрить:
- Таблицу `effect -> required conditions -> side harms -> experiment`.

Пример из книги:
- Physical effects в книге подключаются как информационный фонд после анализа противоречия. Сначала нужно понять, какое действие требуется: разделить, обнаружить, удержать, нагреть, охладить или изменить состояние. Только после этого поиск эффекта становится проверяемым.

Когда применять:
- Когда physical effect выглядит красивым, но может быть неработоспособен в реальной среде.

Первый шаг:
- Проверить условия применимости: material, field strength, temperature, scale, safety, control.

Источник / где искать в книге:
- Source copy: physical effects appendix; cross-check with `GADD` effects/knowledge tools.

## 5. Карта книги по смысловым блокам

### Блок A. From creativity to exact method

Core idea:
- Invention can be handled through laws, models and algorithms, not only psychology and search activation.

Key concepts:
- administrative/technical/physical contradictions;
- laws of development;
- ASIP.

Практический вывод:
- Любой "creative" step должен менять model, contradiction or resource, иначе это просто brainstorming.

### Блок B. S-field as alphabet of inventive problems

Core idea:
- A technical problem can be modeled as interaction between substances through a field.

Key concepts:
- S1, S2, F;
- complete / incomplete S-field;
- harmful / insufficient interaction;
- transformation of fields and substances.

Практический вывод:
- S-field gives a more precise entry point than generic "improve design".

### Блок C. Standards as reusable transformations

Core idea:
- Many inventive problems repeat as model classes; standards encode transformations of these model classes.

Key concepts:
- typical models;
- standard transformations;
- harmful function control;
- measurement and detection routes.

Практический вывод:
- Standard should be selected by problem type, not by title.

### Блок D. Tactics of invention

Core idea:
- Problem solving is managed as movement from situation to problem model to contradiction elimination.

Key concepts:
- situation -> problem -> problem model;
- contradiction elimination mechanisms;
- information and psychological management.

Практический вывод:
- Good facilitation changes representation before generating concepts.

### Блок E. Micro-level and little-men modeling

Core idea:
- Strong solutions often appear when macro components are replaced by behavior at micro-level.

Key concepts:
- little men modeling;
- macro/micro level;
- physical effects.

Практический вывод:
- If macro mechanism is heavy, ask what particles, fields or phases should do.

### Блок F. Strategy of invention

Core idea:
- Solving one problem is not enough; systems develop along laws, and strong solutions align with development direction.

Key concepts:
- lifeline of technological systems;
- laws of development;
- standards and evolution.

Практический вывод:
- A local fix becomes strategy only after evolution check.

## 6. Frameworks и mental models автора

| Framework | Смысл | Когда применять | Output |
|---|---|---|---|
| ASIP / ARIZ-77 | Full algorithmic route | complex nonstandard tasks | structured solution path |
| S-field | Minimal action model | weak/harmful/missing function | `S1-S2-F` model |
| Typical problem model | Class of recurring inventive problem | before standards | problem type |
| Standards | Reusable transformations | after model classification | transformation route |
| Physical effects | Principle-of-action catalog | when function is known but means is missing | effect candidates |
| Little-men modeling | Micro-level behavior model | distributed interactions | micro concept |
| Laws of development | Strategy / forecast layer | after local concept | next-generation direction |

Примеры из книги:
- `ASIP / ARIZ-77`: В сложной задаче книга ведет читателя от общей ситуации к мини-задаче, противоречию, ресурсам и физическому эффекту. ASIP ценен именно как память рассуждения: он не дает перескочить от жалобы к случайной идее.
- `S-field`: S-field объясняется как минимальная модель действия: есть объект, инструмент и поле. Если действие слабое или вредное, задача становится видимой на уровне структуры, а не на уровне мнений о решении.
- `Typical problem model`: Типовая модель задачи нужна перед стандартами: слабое действие, вредное действие и измерение требуют разных преобразований. Один и тот же симптом может вести к разным классам стандартов, если модель построена по-разному.
- `Standards`: Стандарты показывают повторяемые маршруты решения: достроить неполный S-field, разрушить вредный, перейти к более управляемому полю или изменить структуру. Пример с преобразованием действия важнее, чем конкретная отрасль.
- `Physical effects`: Индекс физических эффектов помогает тогда, когда уже сформулирована нужная функция. В примере с тающим носителем абразива эффект выбран потому, что одновременно нужен твердый инструмент и исчезающий носитель.
- `Little-men modeling`: Little-men modeling делает микропроцесс наблюдаемым: вместо абстрактного поля команда представляет, как множество малых элементов должно действовать в зоне конфликта. Так легче увидеть недостающую функцию.
- `Laws of development`: Законы развития удерживают стратегический слой: книга показывает, что иногда сильное решение требует сменить принцип системы, а не совершенствовать текущий узел. Поэтому после локального ответа стоит проверить следующую линию развития.

## 7. Принципы применения

1. Do not use standards without model classification.
2. Do not search physical effects before naming required physical action.
3. Treat harmful function as possible resource.
4. Use little-men modeling when macro language hides micro behavior.
5. Escalate to ASIP only after simpler routes are insufficient.
6. Every standard must be translated into a system-specific transformation.
7. Every effect candidate needs feasibility verification.

## 8. Patterns / techniques

### 8.1 S-field triage

1. Define `S1`.
2. Define desired change in `S1`.
3. Define current or missing `S2`.
4. Define current or missing `F`.
5. Mark function type.
6. Select transformation route.

### 8.2 Standard selection route

| Problem type | First direction |
|---|---|
| Missing action | complete S-field |
| Insufficient action | strengthen field / introduce mediator |
| Harmful action | isolate, neutralize, use counter-field, make harm useful |
| Measurement problem | replace direct measurement with indirect/self-detection |
| Evolution problem | apply development laws |

### 8.3 Physical effect route

1. Write desired physical action.
2. Write constraints.
3. List possible effects.
4. Check required conditions.
5. Check new harms.
6. Run small experiment.

### 8.4 Little-men route

1. Represent object as many small agents.
2. Give each agent one simple behavior.
3. Make the group produce desired macro effect.
4. Translate behavior to material/field/structure.

## 9. Anti-patterns

| Anti-pattern | Симптом | Почему плохо | Коррекция |
|---|---|---|---|
| Standards shopping | chosen by familiar title | wrong model | S-field triage first |
| Effect-first thinking | cool physics before function | unbuildable idea | required action first |
| S-field theater | diagram without decision | no transformation | mark problem type |
| Harm only as enemy | remove useful energy | lose resource | harm-as-resource check |
| ASIP too early | algorithm overload | low adoption | use as escalation |
| Evolution slogans | vague future talk | no design direction | tie law to current system state |

## 10. Практические выводы по разделам

| Раздел | Core idea | Key takeaways | Connects to |
|---|---|---|---|
| Contradictions | Problem has conflict structure | classify administrative/technical/physical | `ALT-RU-ALG`, `HLYN` |
| ASIP | Nonstandard tasks need algorithm | escalate after simpler routes | `ORLOV` Meta-ARIZ |
| S-field analysis | Function needs action model | use `S1-S2-F` before standards | `GADD` function analysis |
| Standards | Model transformations repeat | classify problem type | `HLYN`, `GADD` standards |
| Physical effects | Effect answers "how physically" | search after action formula | `GADD` knowledge/effects |
| Little men | Micro behavior reveals concepts | model distributed actions | `ALT-INVENTOR` |
| Laws of development | Solutions should align with evolution | run strategic check | `ALT-EN-ALG`, `GADD` trends |

## 11. Glossary

| Термин | Определение для применения |
|---|---|
| S-field | substance-field model of useful or harmful action |
| S1 | object being changed or acted upon |
| S2 | tool / interacting substance |
| F | field or energy enabling action |
| Standard | reusable transformation of a typical inventive problem model |
| Physical effect | physical phenomenon used to perform a required action |
| ASIP | algorithm for solution of inventive problems |
| Little-men modeling | micro-agent model for complex interactions |

## 12. Сценарии применения

### 12.1 Weak function in product

Use:
- S-field triage;
- insufficient action route;
- standards;
- physical effect check.

Output:
- concepts that strengthen function without random feature additions.

### 12.2 Harmful side effect

Use:
- harmful S-field;
- harm-as-resource check;
- standards for harmful action;
- verification table.

Output:
- options: isolate harm, counteract it, convert it or use it.

### 12.3 Measurement problem

Use:
- measurement/detection classification;
- remove direct measurement need;
- indirect effect route.

Output:
- lower-cost sensing or self-signaling design.

## 13. Cheatsheet

1. What is `S1`?
2. What is `S2`?
3. What is `F`?
4. Is the action missing, weak, harmful or measurement-related?
5. Which standard class fits?
6. What physical action is required?
7. Which effect can provide it?
8. Which new harm appears?
9. Which law of development does the concept follow?

## 14. Topic index

| Тема | Где искать |
|---|---|
| Contradictions | source copy OCR page 004 |
| ASIP / ARIZ-77 | source copy OCR page 004 and Appendix 1 |
| S-field | source copy OCR pages 004-005 |
| Standards | source copy OCR page 007, Appendix 2 |
| Physical effects | source copy Appendix 3 |
| Little-men modeling | source copy OCR page 005 |
| Laws of development | source copy OCR pages 004 and 007 |

## 15. Scope and limits

Что этот source хорошо дает:
- rigorous model layer for S-field and standards;
- bridge from problem model to physical effects;
- strategic laws and ASIP foundation.

Что нужно брать из других sources:
- engineering facilitation and Oxford Standard Solutions: `GADD`;
- compact ARIZ-85В and standards algorithm: `HLYN`;
- Meta-ARIZ/CICO/verification: `ORLOV`;
- accessible teaching route and STC: `ALT-INVENTOR`.
