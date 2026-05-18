# TRIZ for Engineers - Karen Gadd - практический toolkit

Статус: ручной Codex-прогон по официально предоставленному пользователем PDF.

Важно: это не пересказ и не заменитель книги. Документ извлекает применимые модели, принципы, техники, anti-patterns и навигацию по идеям. Большие фрагменты исходного текста намеренно не воспроизводятся.

## 1. Отчет извлечения

Источник:
- Локальный оригинал для уточнения концептов: [runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers/Gadd_Karen_TRIZ_for_Engineers_original.txt](<../../../runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers/Gadd_Karen_TRIZ_for_Engineers_original.txt>)
- Локальная копия PDF: `runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers/Gadd_Karen_TRIZ_for_Engineers_original.pdf`
- Локальный extraction report: `runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers/extraction-report.json`
- Формат: `PDF`
- Название: `TRIZ for Engineers: Enabling Inventive Problem Solving`
- Автор: `Karen Gadd`
- Язык исходника: английский
- Язык результата: русский
- Размер PDF: 27 847 908 байт
- Страниц PDF: 496
- Объем извлечения: 19 898 строк, примерно 161 357 слов
- Оглавление: найдено
- Структура: 6 частей, 13 глав, приложения, glossary, index
- Тип книги: technical / practical engineering nonfiction / problem-solving toolkit

Ограничения первого прогона:
- Это ручной Codex-прогон, а не готовый автоматический `src/books/` runtime.
- PDF хорошо извлекается текстом, но часть таблиц и схем сохранена как разреженный layout; toolkit поэтому фиксирует прикладную структуру и source landmarks, а не пытается воспроизвести схемы.
- Локальный оригинал хранится в ignored `runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers`, а shareable toolkit хранится в tracked `books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers`.
- В документе нет больших цитат; line landmarks используются только как навигация к локальному исходному тексту.

## 2. Как пользоваться toolkit

Открой этот документ, когда нужно:
- перевести сложную техническую проблему из хаотичного обсуждения в рабочую карту;
- понять, какой TRIZ-инструмент выбрать: 9-Boxes, Ideal, contradiction tools, resources, Function Analysis, Standard Solutions, Trends или ARIZ;
- разорвать компромисс и найти решение, которое сохраняет нужные выгоды без привычного trade-off;
- провести engineering problem-solving с командой так, чтобы идеи не терялись, а проблема сначала была понята;
- сделать next-generation product scan без случайного brainstorming;
- быстро подготовить workshop по TRIZ на практическую инженерную задачу.

Практический порядок:
1. Начни с `Быстрой карты`.
2. Выбери одну карточку из `Лайфхаки, приемы и инструменты к внедрению`.
3. Если нужен метод глубже, перейди в `Patterns / techniques`.
4. Перед решением проверь себя по `Anti-patterns`.
5. Для сессии с командой используй `Cheatsheet`.
6. Если нужно уточнить контекст по книге, открой [локальный оригинал](<../../../runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers/Gadd_Karen_TRIZ_for_Engineers_original.txt>); `Topic index` подскажет, где искать.

## 3. Быстрая карта

Главная рабочая идея:
- TRIZ у Gadd - это не "набор креативных приемов", а системный инженерный процесс: понять идеальный результат, увидеть систему во времени и масштабе, извлечь противоречия, функции, вреды, недостаточности и ресурсы, а затем использовать накопленные мировые conceptual solutions.

Главный сдвиг мышления:
- От: "давайте brainstorm, выберем компромисс и улучшим текущий дизайн".
- К: "сначала определим ideal outcome и problem gap, затем подберем правильный тип TRIZ-задачи и используем известные классы решений".

Системная формула TRIZ в этой книге:
1. Зафиксируй, что система должна дать как benefit, а не какую feature ты уже придумал.
2. Опиши текущую систему, ее costs, harms, missing/insufficient benefits.
3. Построй контекст в Time and Scale, чтобы не решать локальный симптом.
4. Собери все premature solution ideas в Bad Solution Park.
5. Преврати плохие решения и конфликтующие требования в contradictions.
6. Выбери инструмент: 40 Principles, Separation Principles, Resources, Trimming, Function Analysis, Standard Solutions, Trends, Substance-Field или ARIZ.
7. Верни solution concepts в реальные решения через доступные ресурсы и проверяемые функции.
8. Зафиксируй audit trail, чтобы команда видела, как решение получено.

Главный практический риск:
- Использовать TRIZ как список подсказок без предварительного понимания проблемы. У Gadd решение начинается не с "какой принцип применить", а с ясного problem model.

Мини-словарь всей книги:
- `Ideality`: больше нужных benefits при меньших costs и harms.
- `Ideal Outcome`: все, что нужно получить, без преждевременного описания решения.
- `Bad Solution Park`: безопасное место для всех ранних идей, чтобы не терять инсайты и не перескакивать к реализации.
- `9-Boxes / Time and Scale`: матрица past / present / future и subsystem / system / super-system.
- `Contradiction`: ситуация, где нужно получить несовместимые или конфликтующие требования без компромисса.
- `Resources`: все, что уже есть в системе, среде, вреде, времени, форме, свойствах, знаниях и людях.
- `Function Analysis`: карта `subject-action-object`, показывающая useful, insufficient, harmful и missing functions.
- `Standard Solutions`: conceptual routes для harms, insufficiencies и measurement/detection problems.
- `Trends`: направления развития систем к большей ideality.
- `ARIZ`: тяжелый алгоритм для сложных задач, где простых TRIZ-путей недостаточно.

## 4. Лайфхаки, приемы и инструменты к внедрению

Это раздел действий, а не пересказ. Он собирает самые применимые элементы книги в формат "что сделать первым", чтобы идеи TRIZ быстрее попадали в работу, инженерные сессии, обучение и личное problem-solving.

### 4.1 Начинать с Ideal Outcome, а не с решения

Что внедрить:
- Для каждой сложной задачи сначала записывать идеальный результат: какие benefits нужны, без описания текущего решения, технологии или ограничения.

Когда применять:
- Когда команда сразу спорит о дизайне, vendor'е, feature, material, process step или компромиссе.

Первый шаг:
- Спросить: "Если бы система сама решила проблему без затрат и вредов, что именно стало бы правдой для пользователя, системы и среды?"

Источник / где искать в книге:
- Chapter 6, pp. 177-183; local text lines 7318-7655. Ideality Audit - Chapter 8, pp. 221-226; lines 9220-9535.

### 4.2 Держать Bad Solution Park на каждой сессии

Что внедрить:
- Завести отдельную поверхность для всех ранних идей: хорошие, плохие, странные, уже пробованные, политически неудобные. Называть их "bad solutions", чтобы никто не защищал их слишком рано.

Когда применять:
- Когда участники хотят немедленно обсуждать любимое решение и сессия теряет problem understanding.

Первый шаг:
- В первые 10 минут попросить каждого записать все solution ideas на отдельные карточки и отложить их до анализа contradictions/functions.

Источник / где искать в книге:
- Chapter 3, pp. 52-58; local text lines 3094-3189 и 3362-3440. Chapter 13, pp. 430-431; lines 17429-17520.

### 4.3 Прогонять проблему через 9-Boxes

Что внедрить:
- Перед поиском решения делать Time and Scale map: past / present / future против subsystem / system / super-system.

Когда применять:
- Когда проблема выглядит локальной, но может быть вызвана историей, поставщиками, средой, upstream/downstream, требованиями или future risk.

Первый шаг:
- В центральную ячейку записать current system/problem, вправо - desired future, влево - relevant history; затем заполнить верхний и нижний уровни.

Источник / где искать в книге:
- Chapter 4, pp. 74-90; local text lines 3903-4395. Problem-solving map - Chapter 13, pp. 431-432; lines 17520-17590.

### 4.4 Переводить "плохое решение" в contradiction

Что внедрить:
- Любое предложенное решение разложить на две колонки: что становится лучше и что становится хуже. Это дает technical contradiction.

Когда применять:
- Когда решение "почти работает", но приносит вес, сложность, стоимость, риск, неудобство, задержку или новый harm.

Первый шаг:
- Записать: `Мы улучшаем X, но ухудшаем Y`; затем подобрать параметры или переформулировать как physical contradiction.

Источник / где искать в книге:
- Chapter 5, pp. 113-119; local text lines 5270-5455.

### 4.5 Сначала проверять physical contradiction

Что внедрить:
- Если системе нужны противоположные свойства, не выбирать компромисс; спросить, можно ли разделить требования по времени, пространству, условию или уровню системы.

Когда применять:
- Когда формула проблемы звучит как "должно быть большим и маленьким", "жестким и мягким", "видимым и невидимым", "включенным и выключенным".

Первый шаг:
- Заполнить четыре строки: `когда нужно A`, `когда нужно не-A`, `где нужно A`, `при каком условии нужно A`.

Источник / где искать в книге:
- Chapter 5, pp. 120-133; local text lines 5359-5842.

### 4.6 Использовать WHY для benefits, HOW для functions/resources

Что внедрить:
- Встроить в problem-solving две лестницы: `why?` поднимает от feature к benefit и ultimate goal; `how?` спускает от benefit к function и resource.

Когда применять:
- Когда проблема сформулирована через уже выбранную feature: "нужны новые drains", "нужен thicker wall", "нужно больше bolts".

Первый шаг:
- Пять раз спросить `why is this a problem?`, затем для найденного benefit спросить `what function would deliver it?`.

Источник / где искать в книге:
- Chapter 3, pp. 61-67; local text lines 3445-3659.

### 4.7 Искать X-Factor из доступных ресурсов

Что внедрить:
- После Ideal Outcome описывать неизвестный X-Factor: что он должен делать, а затем искать, какой existing resource может выполнить эту функцию.

Когда применять:
- Когда хочется купить новый компонент, добавить sensor, усложнить material stack или принести внешний сервис.

Первый шаг:
- Составить список ресурсов: system components, environment, existing inputs/outputs, harmful effects, geometry, time, temperature, pressure, color, smell, user behavior, adjacent tools.

Источник / где искать в книге:
- Chapter 6, pp. 181-183; local text lines 7515-7655. Chapter 7, pp. 210-214; lines 8798-8925.

### 4.8 Делать ruthless trimming pass

Что внедрить:
- После function map пройти по каждому компоненту и спросить: можно ли убрать его, передав полезное действие объекту, другому компоненту, ресурсу, среде или временной стадии?

Когда применять:
- Когда система стала слишком дорогой, сложной, тяжелой, ненадежной или перегруженной process steps.

Первый шаг:
- Выбрать самый дорогой или вредный компонент и ответить на вопрос: "какую useful action он дает и кто еще может ее дать?"

Источник / где искать в книге:
- Chapter 3, p. 67; local text lines 3652-3695. Oxford Standard Solutions / Trimming - Appendix 11.1, pp. 358-360; lines 14744-14895.

### 4.9 Рисовать Function Analysis как `subject-action-object`

Что внедрить:
- Для текущей системы описывать функции через простые тройки `Subject action Object`, отмечая useful, insufficient, excessive и harmful actions.

Когда применять:
- Когда проблема технически сложная, но команда спорит словами, а не видит взаимодействия компонентов.

Первый шаг:
- Написать 10-20 троек для ключевых компонентов, затем отметить, где функция missing, weak, uncontrolled, excessive или harmful.

Источник / где искать в книге:
- Chapter 11, pp. 315-326; local text lines 12720-13335.

### 4.10 Выбирать Standard Solutions по типу проблемы

Что внедрить:
- После function map не brainstorm'ить вслепую: классифицировать проблему как harm, insufficiency или measurement/detection и открыть соответствующий класс Standard Solutions.

Когда применять:
- Когда карта функций уже показывает, что именно плохо: вредное действие, слабое полезное действие или проблема обнаружения/измерения.

Первый шаг:
- Для harm выбрать одну из стратегий: eliminate/trim, stop/block, transform into good, correct afterwards.

Источник / где искать в книге:
- Chapter 11, pp. 326-329; local text lines 13269-13335. Appendix 11.1, pp. 358-360; lines 14744-14895.

### 4.11 Прогонять продукт через 8 Trends

Что внедрить:
- Для next-generation design делать trend scan: ideality, S-curve, less human involvement, non-uniform development, simplicity-complexity-simplicity, dynamism, segmentation/fields, matching/mismatching.

Когда применять:
- Когда нужно понять, каким может быть следующий продукт, где слабое звено зрелой системы, как усилить IP или куда движется рынок.

Первый шаг:
- Для каждого trend записать один возможный next move и один риск чрезмерного усложнения.

Источник / где искать в книге:
- Chapter 9, pp. 245-283; local text lines 10220-11485.

### 4.12 Использовать Smart Little People и Size-Time-Cost против инерции

Что внедрить:
- Для застрявшей задачи использовать два quick prompts: представить элементы проблемы как tiny agents; затем преувеличить size, time и cost в обе стороны.

Когда применять:
- Когда команда видит только привычный solution space и не может разорвать mental pattern.

Первый шаг:
- Нарисовать problem zone как набор interacting "маленьких участников", затем отдельно спросить: что если это бесконечно большое/маленькое, мгновенное/очень медленное, бесплатное/очень дорогое?

Источник / где искать в книге:
- Chapter 1, pp. 14-19; local text lines 1390-1615.

### 4.13 Вести innovation audit trail

Что внедрить:
- Сохранять не только итоговое решение, но и problem model, rejected ideas, contradiction framing, selected tools, resource choices и rationale.

Когда применять:
- Когда решение потом выглядит "очевидным" или нужно защитить инженерную работу перед decision makers.

Первый шаг:
- После каждой сессии записать: исходная проблема, выбранный ideal, карты, bad solutions, contradiction/function list, concepts, rejected options, выбранное решение.

Источник / где искать в книге:
- Chapter 3, pp. 54-55; local text lines 3189-3284.

### 4.14 Подбирать инструмент через problem-solving map

Что внедрить:
- Не пытаться применить весь TRIZ сразу; выбирать инструмент по типу задачи: invention, improvement, harm, insufficiency, contradiction, measurement, future system или complex ARIZ-grade problem.

Когда применять:
- Когда TRIZ выглядит слишком большим и команда не понимает, с чего начать.

Первый шаг:
- Сначала пройти общий маршрут: Bad Solution Park -> problem description -> primary output -> 9-Box Context -> Ideal Outcome -> Ideality Audit -> function map -> problem type -> tactic.

Источник / где искать в книге:
- Chapter 13, pp. 421-436; local text lines 17170-17744.

### 4.15 Держать ARIZ для самых трудных задач

Что внедрить:
- Использовать ARIZ как резервный строгий алгоритм, когда задача сложная, многослойная, а более быстрые tools не дали достаточно сильного решения.

Когда применять:
- Когда проблема упирается в несколько contradictions, скрытые resources, мини-проблему и требует дисциплинированной декомпозиции.

Первый шаг:
- Пройти 5 верхних шагов ARIZ: problem definition, system contradictions, mini-problem, resources, conceptual solutions.

Источник / где искать в книге:
- Chapter 12, pp. 384-403; local text lines 15581-16446.

## 5. Карта книги по смысловым блокам

### Блок A. TRIZ как системная логика, а не "креативность по вдохновению"

Примерные главы: Introduction, Chapters 1-2.

Что появляется:
- TRIZ позиционируется как toolkit для понимания и решения инженерных задач: contradiction tools, trends, effects, 9-Boxes, Ideal, resources, function/substance-field analysis, standard solutions и creativity triggers.
- Автор постоянно противопоставляет random brainstorming систематическому доступу к уже найденным мировым conceptual solutions.
- TRIZ нужен не только "очень креативным"; он особенно помогает тем, кто хочет получить повторяемый процесс.

Практический вывод:
- Если задача важная и сложная, не отдавай ее случайной идее. Сначала классифицируй problem type и включи соответствующий маршрут.

Источник:
- Introduction lines 628-797; Chapter 1 lines 799-1728; Chapter 2 lines 1736-2703.

### Блок B. Problem understanding до problem solving

Примерные главы: Chapters 3-4.

Что появляется:
- `Bad Solution Park` удерживает premature ideas, не убивая их.
- `WHY/HOW` связывает ultimate goal, benefits, functions, systems и resources.
- `Time and Scale / 9-Boxes` помогает увидеть историю, контекст, future consequences, hazards, causes и solution spaces.

Практический вывод:
- Хорошая TRIZ-сессия не запрещает идеи; она паркует их, чтобы они стали сырьем для contradictions и solution concepts.

Источник:
- Chapter 3 lines 2704-3709; Chapter 4 lines 3711-4563.

### Блок C. Contradiction Toolkit

Примерные главы: Chapter 5 + Appendix 5.1.

Что появляется:
- Technical contradiction: одно улучшается, другое ухудшается.
- Physical contradiction: система должна иметь противоположные свойства.
- 40 Inventive Principles, Contradiction Matrix, 39 Parameters и Separation Principles дают структурный способ уйти от компромисса.

Практический вывод:
- Не принимай trade-off как закон природы. Сначала проверь, нельзя ли разделить требования по времени, месту, условию или уровню системы.

Источник:
- Chapter 5 lines 4564-7317.

### Блок D. Ideal, Resources, Ideality Audit

Примерные главы: Chapters 6-8.

Что появляется:
- Ideal Outcome задает направление без преждевременной привязки к системе.
- Resources превращают "нет бюджета / нет компонента" в поиск того, что уже доступно.
- Ideality Audit сравнивает system we've got, system we want и Ideal, формируя problem gaps.

Практический вывод:
- Умная TRIZ-работа сначала выясняет, какие benefits нужны, затем ищет функции и ресурсы, а не наоборот.

Источник:
- Chapter 6 lines 7319-8204; Chapter 7 lines 8205-9197; Chapter 8 lines 9198-10219.

### Блок E. Next-generation systems and invention

Примерные главы: Chapters 9-10.

Что появляется:
- 8 Trends показывают вероятные направления развития успешных систем.
- S-curves помогают понять зрелость технологии и момент перехода на следующий system.
- Invention можно вести двумя путями: искать систему под needs или искать новые uses для existing systems/technologies/functions.

Практический вывод:
- Для будущего продукта смотри не только на customer voice, но и на "product DNA": какие needs система уже обещает закрыть и как trends подсказывают ее развитие.

Источник:
- Chapter 9 lines 10220-11485; Chapter 10 lines 11486-12626.

### Блок F. Function Analysis, Standard Solutions, Substance-Field, ARIZ

Примерные главы: Chapters 11-12.

Что появляется:
- Function Analysis переводит сложную систему в карту взаимодействий `Subject action Object`.
- Oxford Standard Solutions дают маршруты для harms, insufficiencies и measurement/detection.
- Substance-Field и ARIZ сохраняют classical TRIZ route для сложных задач.

Практический вывод:
- Если problem statement слишком широкий, нарежь систему на функции. Если функция weak/harmful/missing, подбери класс стандартных решений.

Источник:
- Chapter 11 lines 12627-15222; Chapter 12 lines 15223-17197.

### Блок G. How to problem solve with TRIZ

Примерные главы: Chapter 13, BAE Systems case study, appendices, glossary.

Что появляется:
- Автор собирает tools в problem-solving maps: general steps, problem understanding route, Ideality Tactics, function maps, solution maps.
- Для реальных задач нужны не все tools сразу, а правильная комбинация под problem type.

Практический вывод:
- TRIZ осваивается как язык и практика: начинай с любимых быстрых tools, но постепенно расширяй toolkit, иначе компания застрянет на неполном TRIZ.

Источник:
- Chapter 13 lines 17198-19189; Glossary lines 19190-19414.

## 6. Frameworks и mental models автора

### 6.1 Ideality Equation

Смысл:
- Любая система оценивается по соотношению нужных benefits к costs и harms. Важно не "добавить функций", а повысить ideality.

Когда применять:
- Для product improvement, process redesign, root cause work, trade-off debates, cost-reduction decisions.

Как использовать:
1. Выписать benefits, которые реально meet needs.
2. Выписать costs как все inputs, не только деньги.
3. Выписать harms как все unwanted outputs, включая complexity и unused features.
4. Проверить, повышает ли решение benefits без пропорционального роста costs/harms.

Source:
- Chapter 1 lines 1056-1118; Chapter 9 lines 10441-10580.

### 6.2 Ideal Outcome -> Functions -> Resources

Смысл:
- Ideal Outcome описывает все benefits. Functions объясняют, что должно происходить. Resources показывают, чем это можно сделать без лишних inputs.

Когда применять:
- Когда команда пытается купить решение до понимания функции.

Как использовать:
1. Сформулировать ideal без constraints.
2. Назвать essential functions.
3. Найти existing resources.
4. Снизить решение от ideal к practical implementation.

Source:
- Chapter 6 lines 7318-7655; Chapter 7 lines 8798-8925.

### 6.3 9-Boxes / Time and Scale

Смысл:
- Мышление в масштабе и времени защищает от локального symptom fixing. Одна и та же проблема может иметь cause в прошлом, harm в будущем, решение на subsystem level или constraint на super-system level.

Когда применять:
- Context mapping, hazard mapping, solution mapping, needs mapping, resource mapping.

Как использовать:
- По вертикали: subsystem / system / super-system.
- По горизонтали: past / present / future или before / during / after.
- Заполнять не ради полной энциклопедии, а ради decision-relevant context.

Source:
- Chapter 4 lines 3903-4395; Chapter 13 lines 17520-17590.

### 6.4 Bad Solution Park

Смысл:
- Ранние идеи являются не мусором, а сырьем: в них есть понимание needs, constraints и concepts. Их нужно сохранить, но не позволять им преждевременно рулить сессией.

Когда применять:
- Во всех командных problem-solving sessions.

Как использовать:
- Собрать ideas -> отметить good/bad aspects -> извлечь contradictions -> улучшить через TRIZ tools -> вернуть в solution map.

Source:
- Chapter 3 lines 3094-3189; Chapter 13 lines 17429-17520.

### 6.5 Contradiction model

Смысл:
- Inventive problem часто живет в конфликте требований. TRIZ работает не через компромисс, а через снятие противоречия.

Два типа:
- Technical: улучшаем один параметр, ухудшается другой.
- Physical: одному объекту нужны противоположные состояния.

Source:
- Chapter 5 lines 4564-5842.

### 6.6 Separation Principles

Смысл:
- Physical contradiction решается разделением противоположных требований.

Четыре вопроса:
- В какое время нужно свойство A, а когда not-A?
- В каком месте нужно A, а где not-A?
- При каком условии нужно A, а когда not-A?
- На каком уровне системы нужно A, а на каком not-A?

Source:
- Chapter 5 lines 5359-5842.

### 6.7 Function Analysis / S-a-O

Смысл:
- Система состоит не из "железа", а из functions, где subject действует на object через action/field. Именно функции дают benefits или harms.

Когда применять:
- Когда нужно понять system we have до выбора solution tools.

Source:
- Chapter 11 lines 12720-13335.

### 6.8 Oxford Standard Solutions

Смысл:
- После function map problem type приводит к соответствующему классу conceptual solutions.

Основные категории:
- Harm: eliminate/trim, stop/block, transform into good, correct afterwards.
- Insufficiency: improve components or field/action.
- Measurement/detection: remove need to measure, measure a copy, introduce a mark/field.

Source:
- Chapter 11 lines 13269-13335; Appendix 11.1 lines 14744-14895.

### 6.9 8 Trends of Evolution

Смысл:
- Успешные systems развиваются по повторяемым направлениям. Trends помогают предсказывать next-generation moves и находить недоразвитые части.

8 trends:
1. Increasing Ideality.
2. S-curves.
3. Less human involvement.
4. Non-uniform development of parts.
5. Simplicity -> complexity -> simplicity.
6. Increasing dynamism, flexibility and controllability.
7. Increasing segmentation and increased use of fields.
8. Matching and mismatching of parts.

Source:
- Chapter 9 lines 10220-11485.

### 6.10 ARIZ as heavy route

Смысл:
- ARIZ - строгий алгоритм для задач, где обычные быстрые tools не дают решения.

Пять верхних шагов:
1. Problem definition.
2. Uncovering system contradictions.
3. Analysis and mini-problem.
4. Resources.
5. Conceptual solutions.

Source:
- Chapter 12 lines 15581-16446.

## 7. Принципы применения

- Формулируй benefits без solution language. Feature может быть плохим proxy для real need.
- Не убивай ранние идеи; паркуй их.
- Не улучшай текущую систему, пока не понял, зачем она существует.
- Любой harm может быть resource, если его можно преобразовать в benefit.
- Любой useful function должен иметь provider; если provider дорогой/вредный, ищи transfer или trimming.
- Хорошее TRIZ-решение увеличивает ideality, а не просто добавляет sophistication.
- Если требования противоположны, ищи separation, а не средний компромисс.
- Если technical contradiction неясна, начни с bad solution: что стало лучше, что хуже?
- Если проблема сложная, mapping важнее быстрого ответа.
- Если инструмент кажется слишком тяжелым, выбери меньший tactic; ARIZ оставь для задач, которые действительно этого требуют.
- Если решение кажется очевидным после нахождения, сохрани audit trail, чтобы показать путь.
- Для next-generation work анализируй и customer needs, и product/system trajectory.

## 8. Patterns / techniques

### 8.1 Quick TRIZ Session Route

Используй когда:
- Нужно провести короткую командную сессию на реальную проблему.

Шаги:
1. Опиши problem situation простым языком.
2. Запусти Bad Solution Park.
3. Определи primary output и ultimate goal.
4. Нарисуй 9-Box Context Map.
5. Сформулируй Ideal Outcome.
6. Сделай Ideality Audit.
7. Нарисуй Function Map.
8. Выбери problem type.
9. Примени 1-2 Ideality Tactics.
10. Перенеси concepts в 9-Box Solution Map.

Source:
- Chapter 13 lines 17170-17744.

### 8.2 Bad Solution -> Technical Contradiction

Используй когда:
- Есть уже предложенное решение с побочным ущербом.

Шаги:
1. Назови solution.
2. Запиши benefit: что оно улучшает.
3. Запиши downside: что ухудшает.
4. Подбери 39 parameters или переформулируй через более общие свойства.
5. Используй Contradiction Matrix / 40 Principles как prompts.
6. Преврати principle в несколько real solution ideas через resources.

Source:
- Chapter 5 lines 5270-5455.

### 8.3 Physical Contradiction Separation

Используй когда:
- Нужны противоположные свойства.

Шаги:
1. Запиши `X must be A` и `X must be not-A`.
2. Спроси: когда A, где A, при каком условии A, на каком уровне A?
3. Выбери separation route.
4. Используй соответствующие 40 Principles как prompts.
5. Проверь, не исчез ли компромисс.

Source:
- Chapter 5 lines 5359-5842.

### 8.4 9-Box Hazard Map

Используй когда:
- Нужно понять, где предотвратить harm.

Шаги:
1. Поставь hazard в current/system cell.
2. Заполни before/during/after.
3. Заполни subsystem/system/super-system.
4. Ищи prevention, mitigation, correction на разных уровнях.
5. Отдельно отметь cheap before actions, которые предотвращают expensive after actions.

Source:
- Chapter 4 lines 3903-4395.

### 8.5 Benefit Capture Exercise

Используй когда:
- Stakeholders расходятся во взглядах на "что нужно".

Шаги:
1. Каждый индивидуально пишет benefits/functions/features по одному на карточку.
2. Команда группирует карточки.
3. Дает группам названия.
4. Убирает дубли, оставляет meaningful differences.
5. Приоритизирует principal benefits.
6. Фиксирует ultimate goal и primary benefit отдельно.

Source:
- Chapter 8 lines 9506-9535.

### 8.6 Function Analysis Problem List

Используй когда:
- Система имеет несколько interacting components.

Шаги:
1. Составь component list.
2. Опиши S-a-O triples.
3. Отметь useful, harmful, insufficient, excessive, missing.
4. Составь problem list.
5. Сначала попробуй trimming.
6. Затем применяй Standard Solutions к harms/insufficiencies/measurement.

Source:
- Chapter 11 lines 12720-13335.

### 8.7 Trimming Review

Используй когда:
- Нужно упростить систему без потери benefits.

Шаги:
1. Найди компонент с high cost/harm/complexity.
2. Назови его useful action.
3. Спроси, нужен ли этот action.
4. Спроси, может ли object, another component, environment или resource выполнить action.
5. Спроси, можно ли убрать компонент после action или убрать только harmful part.

Source:
- Chapter 3 lines 3652-3695; Appendix 11.1 lines 14744-14895.

### 8.8 Standard Solutions Triage

Используй когда:
- Function map уже показала problem type.

Шаги:
1. Harm -> eliminate, block, transform, correct.
2. Insufficiency -> improve component, improve object, improve field/action.
3. Measurement/detection -> eliminate need, measure copy, introduce mark/field.
4. Для каждого conceptual route найти resource.
5. Проверить solution на ideality.

Source:
- Chapter 11 lines 13269-13335; Appendix 11.1 lines 14744-14895.

### 8.9 Trends Scan

Используй когда:
- Нужен next-generation product или IP strategy.

Шаги:
1. Определи current system и primary benefit.
2. Оцени S-curve maturity.
3. Пройди 8 trends.
4. Для каждого trend запиши possible next system move.
5. Отметь non-uniform development: какая часть тормозит целое.
6. Выбери moves, которые повышают benefits и снижают costs/harms.

Source:
- Chapter 9 lines 10220-11485.

### 8.10 ARIZ Escalation

Используй когда:
- Простые routes не помогли, а problem stakes высокие.

Шаги:
1. Уточнить primary function/output.
2. Найти system contradictions.
3. Сформулировать mini-problem.
4. Провести resource analysis.
5. Разработать conceptual solutions.
6. Проверить against ideal outcome.

Source:
- Chapter 12 lines 15581-16446.

## 9. Anti-patterns

### 9.1 Brainstorming вместо problem model

Симптом:
- Команда много генерирует, но не меняет качество понимания проблемы.

Почему вредно:
- TRIZ ценен не количеством идей, а тем, что ведет к relevant conceptual solution areas.

Что делать:
- Начать с Ideal Outcome, 9-Boxes, Bad Solution Park и problem type.

### 9.2 Premature feature lock

Симптом:
- Задача формулируется как "улучшить выбранную feature", а не как benefit gap.

Почему вредно:
- Feature может быть плохим, дорогим или устаревшим способом получить benefit.

Что делать:
- Спросить `why?` до ultimate goal и primary benefit.

### 9.3 Компромисс как единственная стратегия

Симптом:
- Решение выбирается как "немного легче, но не слишком слабое" или "дешевле, но хуже".

Почему вредно:
- TRIZ ищет routes, где можно получить оба нужных свойства.

Что делать:
- Переформулировать как physical или technical contradiction.

### 9.4 Список ресурсов без функции

Симптом:
- Команда делает длинную resource inventory, но не знает, какую функцию надо закрыть.

Почему вредно:
- Resource полезен только относительно desired function.

Что делать:
- Сначала Ideal Outcome -> functions -> X-Factor -> resource search.

### 9.5 Function map без Ideality Audit

Симптом:
- Есть карта компонентов, но непонятно, какие gaps действительно важны.

Почему вредно:
- Можно оптимизировать низкоценную функцию и не закрыть primary benefit.

Что делать:
- Перед Function Analysis заполнить benefits/costs/harms для system we've got и system we want.

### 9.6 Trends как гадание о будущем

Симптом:
- Trends используются как фантазии о новых features.

Почему вредно:
- Trends должны повышать ideality и учитывать real system trajectory.

Что делать:
- Привязывать каждый trend move к benefit, cost, harm и market/user need.

### 9.7 ARIZ для любой мелочи

Симптом:
- Команда перегружает маленькую задачу сложным алгоритмом.

Почему вредно:
- ARIZ powerful, но может быть excessive для simple problem.

Что делать:
- Для routine tasks начинать с quick tools; ARIZ использовать как escalation.

### 9.8 Потеря audit trail

Симптом:
- Итоговое решение есть, но непонятно, почему оно лучше rejected options.

Почему вредно:
- После успеха решение кажется obvious, а инженерная работа обесценивается.

Что делать:
- Сохранять problem maps, bad solutions, contradiction framing, resources и selection rationale.

## 10. Практические выводы по главам

### Introduction

Core idea:
- Книга обещает сделать TRIZ доступным для инженеров как практический набор инструментов, а не как эзотерическую теорию.

Takeaways:
- TRIZ объединяет logical/systematic и creative sides.
- Инструменты нужно применять к реальным задачам, а не просто изучать.
- Output сессии должен быть traceable: какие tools использованы и почему.

Source:
- lines 628-797.

### Chapter 1. TRIZ Tools for Creativity and Clever Solutions

Core idea:
- TRIZ toolkit строится вокруг Ideality и включает solution tools, thinking tools, analysis tools and creativity triggers.

Takeaways:
- Ideality - центральный фильтр всех решений.
- Creativity triggers нужны для breaking psychological inertia.
- Smart Little People и Size-Time-Cost - быстрые инструменты визуализации problem/solution space.
- TRIZ toolkit не заменяет инженерное знание; он направляет его.

Source:
- lines 799-1728.

### Chapter 2. TRIZ Knowledge Revolution

Core idea:
- TRIZ дает systematic access к мировым conceptual solutions и различает уровни inventive difficulty.

Takeaways:
- Не все задачи требуют одинаковой глубины.
- Brainstorming годится для простых уровней, но не должен быть универсальным hammer.
- Hard problems требуют выхода за пределы local/company/industry knowledge.
- Process важен, потому что understanding/create stages часто недооцениваются.

Source:
- lines 1736-2703.

### Chapter 3. Fundamentals of TRIZ Problem Solving

Core idea:
- Хорошее решение начинается с понимания benefits, current system, resources, premature ideas и problem gaps.

Takeaways:
- Bad Solution Park сохраняет идеи без premature commitment.
- WHY/HOW помогает перейти от feature к benefit и от benefit к function/resource.
- Trimming и resources снижают costs/harms без потери function.
- Innovation audit trail защищает путь решения.

Source:
- lines 2704-3709.

### Chapter 4. Thinking in Time and Scale

Core idea:
- 9-Boxes дают системное видение во времени и масштабе.

Takeaways:
- Context Map показывает историю и окружение.
- Solution Map расширяет options до before/during/after и subsystem/system/super-system.
- Needs Map выявляет contradictions.
- Hazard Map помогает prevention/mitigation/correction.

Source:
- lines 3711-4563.

### Chapter 5. Uncovering and Solving Contradictions

Core idea:
- TRIZ contradiction tools позволяют выйти за компромисс.

Takeaways:
- Technical contradiction начинается с bad solution: что better, что worse.
- Physical contradiction требует opposite properties.
- Separation in time/space/condition/system часто быстрее matrix.
- 40 Principles - prompts, а не готовые решения.

Source:
- lines 4564-7317.

### Chapter 6. The Ideal Solves the Problem

Core idea:
- Ideal помогает понять, что реально нужно, и искать solution без self-imposed constraints.

Takeaways:
- Ideal Outcome фиксирует benefits без solution.
- Ideal Solution показывает desired change.
- Ideal X-Factor помогает описать неизвестный resource/function provider.
- Ideal breaks psychological inertia.

Source:
- lines 7319-8204.

### Chapter 7. Resources: The Fuel of Innovation

Core idea:
- Лучшие решения используют то, что уже есть.

Takeaways:
- Resources находятся в system, environment, harmful outputs, component features, users, adjacent processes.
- Harm может быть converted into benefit.
- Сначала ищи available/free resources, потом добавляй new resources.
- Resourceful solution должен still satisfy Ideal Outcome.

Source:
- lines 8205-9197.

### Chapter 8. Ideal and the Ideality Audit

Core idea:
- Ideality Audit фиксирует system we've got, system we want и Ideal, чтобы problem list не был случайным.

Takeaways:
- Benefits, costs и harms нужно записывать явно.
- Benefits are needs-met, not any output.
- Problem gap - разница между current и desired ideality.
- Stakeholder benefits могут конфликтовать; это input для contradiction solving.

Source:
- lines 9198-10219.

### Chapter 9. System Development and Trends of Evolution

Core idea:
- Успешные systems развиваются по recognizable trends toward higher ideality.

Takeaways:
- Trends полезны для product strategy, IP, patents, next-generation concepts.
- S-curve показывает момент, когда incremental improvement исчерпывается.
- Non-uniform development помогает найти component, который удерживает всю систему.
- Simplicity often comes after complexity: важно вовремя trim/combine.

Source:
- lines 10220-11485.

### Chapter 10. Inventing with TRIZ

Core idea:
- Invention можно сделать более systematic: needs -> systems или systems/functions -> new uses.

Takeaways:
- Хорошее изобретение часто recombines existing systems/resources.
- Product DNA и Trends помогают видеть future needs.
- TRIZ различает solution idea и solution concept.
- Team variation полезна: разные люди находят разные applications одного concept.

Source:
- lines 11486-12626.

### Chapter 11. Function Analysis for System Understanding

Core idea:
- Function Analysis показывает, что именно делает каждый component и где functions harmful/insufficient/missing.

Takeaways:
- Benefits не равны functions.
- Function = Subject action Object.
- Problem list строится из harmful, insufficient, excessive, missing functions.
- Oxford Standard Solutions связывают problem type с conceptual solution routes.

Source:
- lines 12627-15222.

### Chapter 12. Classical TRIZ: Substance-Field Analysis and ARIZ

Core idea:
- Classical TRIZ дает более строгие модели для difficult problems.

Takeaways:
- Substance-Field models полезны, когда нужно явно видеть substances/fields/problem type.
- ARIZ дисциплинирует complex problem solving.
- Большая часть ARIZ - problem understanding и resource analysis, а не immediate solution generation.
- Для простых задач ARIZ может быть excessive.

Source:
- lines 15223-17197.

### Chapter 13. TRIZ Problem-solving Maps and Algorithms

Core idea:
- Практическая TRIZ-работа требует выбора route по problem type and difficulty.

Takeaways:
- Не нужно применять весь toolkit сразу.
- General route начинается с Bad Solution Park, context, Ideal Outcome, Ideality Audit и Function Analysis.
- Ideality Tactics помогают выбрать solution path.
- Опыт важен: инструменты становятся сильнее через repeated application.

Source:
- lines 17198-19189.

## 11. Glossary

- `ARIZ` - algorithmic route for difficult inventive problems; heavy TRIZ escalation.
- `Bad Solution` - early solution idea with useful insight and unresolved downside.
- `Bad Solution Park` - visible collection of all premature/previous ideas used later for contradictions and concepts.
- `Benefit` - output that meets a real need; unused output is not a benefit.
- `Contradiction Matrix` - tool for technical contradictions using improving/worsening parameters.
- `Cost` - any input required by a system: money, materials, time, energy, skill, maintenance, complexity.
- `Function` - result delivered by a subject acting on an object.
- `Function Analysis` - TRIZ map of system interactions and problem functions.
- `Harm` - unwanted output or problem produced by a system.
- `Ideal Outcome` - full desired result with benefits and no costs/harms, stated without premature solution.
- `Ideal Resource / X-Factor` - unknown or existing resource that provides the needed function with minimal added input.
- `Ideality` - relation of benefits to costs and harms; central TRIZ improvement direction.
- `Ideality Audit` - comparison of current system, desired system and ideal to identify gaps.
- `Insufficiency` - useful function that exists but is too weak, slow, uncontrolled or incomplete.
- `Physical Contradiction` - one object/system needs opposite properties.
- `Resources` - anything available in or around the system, including harmful outputs, environment, component properties, time and people.
- `Separation Principles` - ways to solve physical contradictions by time, space, condition or system level.
- `Smart Little People` - creativity prompt that models elements of problem as tiny agents.
- `Standard Solutions` - TRIZ solution classes for harms, insufficiencies and measurement/detection problems.
- `Substance-Field Analysis` - classical TRIZ model of substances and fields for problem classification.
- `Technical Contradiction` - improving one parameter makes another worse.
- `Time and Scale / 9-Boxes` - map of system/subsystem/supersystem across past/present/future or before/during/after.
- `Trimming` - removing or transferring components while preserving useful functions.
- `TRIZ Trends` - patterns of system evolution toward higher ideality.

## 12. Сценарии применения

### 12.1 Инженерная проблема с несколькими симптомами

Используй:
- 9-Box Context Map.
- Bad Solution Park.
- Ideality Audit.
- Function Analysis.
- Standard Solutions.

Результат:
- Команда получает problem list и несколько conceptual solution routes вместо одного спорного fix.

### 12.2 Конфликт требований в продукте

Используй:
- Technical/Physical contradiction framing.
- Separation Principles.
- 40 Principles.
- Resources.

Результат:
- Команда ищет "both benefits" вместо среднего компромисса.

### 12.3 Cost reduction без разрушения value

Используй:
- Ideality Equation.
- Function Analysis.
- Trimming.
- Resource search.

Результат:
- Убираются components/process steps, которые не несут essential function или могут быть заменены existing resources.

### 12.4 Новый продукт или следующая версия

Используй:
- Ideal Outcome.
- Product DNA.
- 8 Trends.
- S-curve.
- Needs -> systems и systems -> new uses routes.

Результат:
- Команда видит направления развития, а не набор случайных features.

### 12.5 Сложная задача, где быстрые tools не помогли

Используй:
- ARIZ.
- Substance-Field.
- Resource analysis.
- Mini-problem formulation.

Результат:
- Задача получает disciplined route с глубоким understanding до генерации концептов.

## 13. Cheatsheet

### 13.1 Первый вопрос

Не спрашивай:
- Как улучшить текущую feature?

Спроси:
- Какой benefit должен быть получен и какой harm/cost должен исчезнуть?

### 13.2 Мини-маршрут problem-solving

1. Problem situation.
2. Bad Solution Park.
3. Primary output / ultimate goal.
4. 9-Box Context.
5. Ideal Outcome.
6. Ideality Audit.
7. Function map.
8. Problem type.
9. TRIZ tactic.
10. Resource-backed solution concepts.

### 13.3 Выбор инструмента

| Если видишь | Используй |
| --- | --- |
| Одно лучше, другое хуже | Technical contradiction + Matrix / 40 Principles |
| Нужно A и not-A | Physical contradiction + Separation |
| Неясный контекст | 9-Boxes |
| Ранние спорные идеи | Bad Solution Park |
| Слишком дорогая/сложная система | Trimming |
| Слабая полезная функция | Insufficiency Standard Solutions |
| Вредная функция | Harm Standard Solutions |
| Нужно измерить/обнаружить | Measurement Standard Solutions |
| Нужно будущее продукта | 8 Trends + S-curve |
| Очень сложная задача | ARIZ |

### 13.4 Быстрый шаблон Ideal Outcome

- Ultimate goal:
- Primary benefit:
- Other must-have benefits:
- Nice-to-have benefits:
- Current harms:
- Current costs:
- Missing / insufficient benefits:
- Constraints that may be real:
- Constraints that may be self-imposed:

### 13.5 Быстрый шаблон Function Analysis

- System:
- Components:
- Environment components:
- Primary benefit:
- Prime function:
- S-a-O triples:
- Useful functions:
- Insufficient functions:
- Harmful functions:
- Missing functions:
- Candidate trimming:
- Candidate Standard Solutions:

### 13.6 Быстрый шаблон contradiction

- Bad solution:
- What gets better:
- What gets worse:
- Technical contradiction phrasing:
- Physical contradiction phrasing:
- Separation by time:
- Separation by space:
- Separation by condition:
- Separation by system level:
- Resources to implement:

### 13.7 Быстрый шаблон Trends scan

- Current system:
- Current S-curve position:
- Ideality move:
- Less human involvement move:
- Non-uniform part:
- Simplify/complicate/simplify move:
- Dynamism/flexibility/control move:
- Segmentation/field move:
- Matching/mismatching move:
- Next experiment:

## 14. Topic index

- `40 Principles` - Chapter 5, Appendix 5.1; lines 4955-5842 and 6156-7317.
- `76 Standard Solutions` - Chapter 11/12 appendices; lines 14744-16480.
- `8 Trends` - Chapter 9; lines 10220-11485.
- `ARIZ` - Chapter 12; lines 15581-16446.
- `Bad Solution Park` - Chapter 3 and 13; lines 3094-3189, 17429-17520.
- `Benefit Capture Exercise` - Chapter 8; lines 9506-9535.
- `Contradiction Matrix` - Chapter 5; lines 5270-5455.
- `Function Analysis` - Chapter 11; lines 12720-13335.
- `Harm / Insufficiency / Measurement` - Chapter 11 and Appendix 11.1; lines 13269-13335, 14744-14895.
- `Ideal Outcome` - Chapter 6 and 8; lines 7318-7655, 9220-9535.
- `Ideality Equation` - Chapter 1 and 9; lines 1056-1118, 10441-10580.
- `Ideality Tactics` - Chapter 13; lines 17680-17744.
- `Innovation Audit Trail` - Chapter 3; lines 3189-3284.
- `Resources` - Chapter 7; lines 8205-9197.
- `Separation Principles` - Chapter 5; lines 5359-5842.
- `Size-Time-Cost` - Chapter 1; lines 1555-1605.
- `Smart Little People` - Chapter 1; lines 1445-1555.
- `Substance-Field Analysis` - Chapter 12; lines 15223-15581.
- `Time and Scale / 9-Boxes` - Chapter 4 and 13; lines 3903-4395, 17520-17590.
- `Trimming` - Chapter 3 and Appendix 11.1; lines 3652-3695, 14744-14895.
- `WHY/HOW` - Chapter 3; lines 3445-3659.

## 15. Scope and limits

Что покрывает toolkit:
- Практическое применение книги как инженерного TRIZ toolkit.
- Основные models, principles, techniques, anti-patterns, scenarios, cheatsheet and topic index.
- Навигацию к локальному извлеченному тексту без публикации полного исходника.

Что не покрывает:
- Полный пересказ всех examples, diagrams, cartoons, matrices and appendices.
- Полное воспроизведение 40 Principles, 39 Parameters, 76 Standard Solutions или Contradiction Matrix.
- Сертификационный курс TRIZ.
- Профессиональную инженерную экспертизу конкретной safety-critical задачи.

Как безопасно использовать:
- Для learning/workshop - применять templates и cards напрямую.
- Для реальной engineering task - использовать toolkit как problem-solving structure, но проверять решения через domain experts, calculations, experiments, safety review and applicable standards.
- Для спорных терминов - сверяться с локальным оригиналом в `runtime/books`.

## 16. Мини-резюме для владельца

Эта книга лучше всего превращается не в конспект, а в рабочий TRIZ playbook. Самая ценная практическая линия: `Ideal Outcome -> Ideality Audit -> 9-Boxes -> Bad Solution Park -> contradictions/function map -> resources/standard solutions/trends -> audit trail`.

Если выбрать только один внедряемый ритуал на завтра: начать каждую сложную инженерную сессию с Bad Solution Park, Ideal Outcome и 9-Box Context Map. Это быстро меняет разговор с "чье решение победит" на "какую проблему мы действительно решаем и каким классом TRIZ-инструментов".
