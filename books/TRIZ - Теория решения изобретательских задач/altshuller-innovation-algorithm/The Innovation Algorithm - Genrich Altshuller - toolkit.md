# The Innovation Algorithm - Genrich Altshuller - практический toolkit

Статус: quality-first standalone toolkit для staged multi-book TRIZ workflow. Используется как source layer `ALT-EN-ALG` для нового сборного toolkit.

Важно: это не summary английского издания. Toolkit извлекает применимую структуру книги: technology of creativity, levels of creativity, ideal machine, technical contradictions, algorithm route, contradiction matrix, 40 principles and tendencies of technical system evolution.

## 1. Отчет извлечения

Источник:
- Structured Markdown source copy: [runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-innovation-algorithm/Genrich Altshuller - The Innovation Algorithm.md](<../../../runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-innovation-algorithm/Genrich Altshuller - The Innovation Algorithm.md>)
- Локальный исходник PDF: `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-innovation-algorithm/Genrich Altshuller - The Innovation Algorithm.pdf`
- Исторический extraction source: `runtime/books/TRIZ - Теория решения изобретательских задач/triz-unified-practical-toolkit/extracted/altshuller_genrich_the_innovation_algorithm_triz_systematic.txt`
- Формат: `PDF`
- Автор: `Genrich Altshuller`
- Название: `The Innovation Algorithm`
- Язык исходника: английский
- Язык результата: русский
- Объем извлечения: 12 719 строк, примерно 103 014 слов
- Оглавление: найдено, `Table of Contents` near source copy lines 106-142
- Структура: 3 sections, 14 parts, appendices with contradiction matrix, 40 principles and evolution tendencies
- Тип книги: foundational TRIZ / translated systematic method

Source landmarks:
- `Section 1: Technology of Creativity`, lines near 112-118
- `Section 2: The Dialectic of Invention`, lines near 120-127
- `Section 3: Man and Algorithm`, lines near 129-133
- `Appendix 1: Contradiction Matrix with the 40 Principles`, lines near 135-139
- `Appendix 2: General Tendencies of Technical System Evolution`, line near 140

## 2. Как пользоваться toolkit

Открывай этот toolkit, когда нужно:
- выбрать глубину метода по level of creativity;
- показать, что creativity can have technology;
- применить contradiction matrix с дисциплиной mapping;
- использовать 40 principles как questions, not answers;
- связать human barriers with algorithmic route;
- добавить evolution tendencies к решению, чтобы оно не осталось локальным fix.

Практический маршрут:
1. Быстро определи level задачи.
2. Сформулируй technical contradiction.
3. Сделай 2-3 parameter mappings.
4. Используй matrix and 40 principles как вопросник.
5. Проверь ideal machine.
6. Добавь evolution tendency для next step.
7. Проверь psychological barrier and algorithm route.

## 3. Быстрая карта

| Ситуация | Что делать | Инструмент источника | Выход |
|---|---|---|---|
| Задача непонятной сложности | Определить level of creativity | Part 1-2 | глубина метода |
| Команда считает творчество случайным | Показать technology of creativity | Section 1 | disciplined process |
| Решение добавляет механизм | Проверить ideal machine | Part 1-5 | функция без лишнего элемента |
| Есть improving/worsening pair | Сформулировать technical contradiction | Part 1-6 | matrix input |
| Matrix дает много приемов | Использовать repeated principles and questions | Appendix 1 | shortlist questions |
| Нужна стратегия развития | Проверить general tendencies | Appendix 2 | next-generation directions |
| Люди застряли в привычной форме | Учесть psychological barriers | Section 3 | reframed task |

## 4. Лайфхаки, приемы и инструменты к внедрению

### 4.1 Делать level check до методики

Что внедрить:
- Короткий classifier: known solution, specialized engineering solution, inventive contradiction, new principle, new field/system.

Пример из книги:
- В The Innovation Algorithm уровни творчества показывают, насколько далеко задача выходит за рамки обычной инженерной замены. Если задача первого уровня, достаточно known means; если выше, нужен переход к contradiction and principles. Level check экономит методическое усилие.

Когда применять:
- Перед решением, чтобы не применять matrix к простой задаче и не вести сложную задачу как обычную оптимизацию.

Первый шаг:
- Спросить: "на каком уровне должно появиться новое - параметр, структура, principle, system?"

Источник / где искать в книге:
- Source copy: `Part 1-2: Levels of Creativity`, lines near 114.

### 4.2 Записывать technical contradiction как matrix contract

Что внедрить:
- Contract перед matrix: `improving parameter`, `worsening parameter`, `why these parameters`, `alternative mappings`.

Пример из книги:
- Matrix contract начинается с честной пары: какой parameter улучшается и какой ухудшается. В книге matrix работает только после такой формулировки technical contradiction. Иначе выбранные principles не связаны с задачей.

Когда применять:
- Перед любым использованием contradiction matrix.

Первый шаг:
- Сформулировать три возможных пары параметров и отметить, где они совпадают по recommended principles.

Источник / где искать в книге:
- Source copy: `Part 1-6: Technical Contradictions`, `Appendix 1`.

### 4.3 Делать "principle to question" translation

Что внедрить:
- Таблицу: `principle -> question -> concept variants -> resources needed`.

Пример из книги:
- 40 principles в книге являются directions for transformation. Например principle не говорит готовый answer, а заставляет спросить: можно ли разделить, сделать предварительно, заменить механическое действие, изменить динамику. Так principle становится вопросом.

Когда применять:
- Когда matrix выдала principles, но команда не знает, как их применить.

Первый шаг:
- Для каждого principle написать не решение, а вопрос к operational zone.

Источник / где искать в книге:
- Source copy: `40 Principles`, Appendix 1.

### 4.4 Проверять ideal machine перед concept selection

Что внедрить:
- Gate: "может ли нужная function выполняться без нового machine/object?"

Пример из книги:
- Ideal machine в книге проверяет concept before selection: может ли функция выполняться без отдельного носителя или с меньшим вредом. Если идея добавляет сложность, она должна оправдать это ростом ideality. Поэтому ideal machine идет до выбора final concept.

Когда применять:
- Когда выбираются concepts после matrix.

Первый шаг:
- Для каждого concept отметить, добавляет ли он элемент или передает функцию existing resource.

Источник / где искать в книге:
- Source copy: `Part 1-5: The Ideal Machine`.

### 4.5 Использовать algorithm as memory of reasoning

Что внедрить:
- Decision log: `problem framing -> contradiction -> principle -> concept -> verification`.

Пример из книги:
- Algorithm route фиксирует память рассуждения: задача, уровень, contradiction, matrix, principles, barriers, resources and concept. Это важно, потому что сильное решение после нахождения выглядит очевидным. Записанный путь помогает повторить метод.

Когда применять:
- Для командных задач, где важно объяснить, почему выбран concept.

Первый шаг:
- После каждого перехода записать, что изменилось в problem model.

Источник / где искать в книге:
- Source copy: `Part 2-4: How the Algorithm Works`.

### 4.6 Добавлять evolution tendencies к текущему решению

Что внедрить:
- После concept selection прогонять check: ideality, dynamization, segmentation, transition to micro-level, system/supersystem shift.

Пример из книги:
- Evolution tendencies в книге добавляют strategic layer к текущему решению. После устранения дефекта стоит спросить, куда развивается technical system: к большей ideality, dynamism, segmentation or field use. Это превращает fix в next-generation direction.

Когда применять:
- Roadmap, product generation, patent bypass, design platform decisions.

Первый шаг:
- Спросить: "если это решение будет развиваться дальше, какой следующий contradiction оно породит?"

Источник / где искать в книге:
- Source copy: `Appendix 2: General Tendencies of Technical System Evolution`.

### 4.7 Разбирать psychological barrier как часть задачи

Что внедрить:
- Перед matrix писать "human constraints": привычная форма, термин, authority, old design, fear of loss.

Пример из книги:
- Psychological barrier в книге разбирается как часть задачи, а не человеческая слабость. Эксперты могут не видеть решения из-за терминов, привычной конструкции или отраслевой нормы. Barrier map помогает переформулировать задачу.

Когда применять:
- Когда technically possible options не рассматриваются из-за инерции.

Первый шаг:
- Переформулировать задачу с нейтральными functional nouns instead of current product nouns.

Источник / где искать в книге:
- Source copy: `Part 3-1: Psychological Barriers`, `Part 3-3: Over Barriers`.

### 4.8 Использовать exercise problems как проверку навыка

Что внедрить:
- Малый drill: condition -> contradiction -> matrix/principle -> concept -> compare with answer.

Пример из книги:
- Exercise problems в книге нужны как проверка навыка: читатель должен пройти путь, а не узнать ответ. Если решение найдено случайно, упражнение не засчитывает method mastery. Поэтому такие задачи полезны для командного обучения.

Когда применять:
- При обучении команды и перед применением TRIZ на боевой задаче.

Первый шаг:
- Взять one exercise problem, скрыть answer, пройти route, затем сравнить не только ответ, но и путь.

Источник / где искать в книге:
- Source copy: `Part 2-5: Several Exercise Problems`.

## 5. Карта книги по смысловым блокам

### Section 1. Technology of Creativity

Core idea:
- Creativity becomes manageable when inventor uses laws, levels, contradictions and ideality instead of pure search.

Key concepts:
- levels of creativity;
- inventing methods of inventing;
- ideal machine;
- technical contradictions.

Practitioner use:
- Use this section to prepare a problem-solving session: classify difficulty, avoid random search, define contradiction.

### Section 2. Dialectic of Invention

Core idea:
- Invention is not just idea generation; it is a step-by-step dialectic between problem, contradiction, instruments and algorithm.

Key concepts:
- step-by-step route;
- logic + intuition + skills;
- inventor's instruments;
- how algorithm works;
- exercise problems.

Practitioner use:
- Use this section to structure a workshop and document reasoning.

### Section 3. Man and Algorithm

Core idea:
- Human thinking has barriers; algorithm does not replace people, but disciplines and expands their search.

Key concepts:
- psychological barriers;
- fantasy and over-barrier thinking;
- scientific structure of creative work.

Practitioner use:
- Use this section when experts are trapped by old forms, terms and professional defaults.

### Appendix 1. Matrix and 40 Principles

Core idea:
- Matrix is a lookup tool for technical contradictions, but it requires disciplined parameter mapping.

Key concepts:
- improving/worsening parameters;
- 40 principles;
- repeated principle ranking.

Practitioner use:
- Use matrix after contradiction, not before.

### Appendix 2. Tendencies of Evolution

Core idea:
- A concept should not only fix the present problem; it should point in the direction of system evolution.

Key concepts:
- ideality;
- system development direction;
- next-generation design.

Practitioner use:
- Use this section after first concept to create roadmap options.

## 6. Frameworks и mental models автора

| Framework | Смысл | Когда применять | Output |
|---|---|---|---|
| Levels of creativity | Классифицирует глубину задачи | before method choice | method depth |
| Ideal machine | Функция без носителя | before adding parts | higher-ideality concept |
| Technical contradiction | Trade-off as solvable object | before matrix | parameter pair |
| Contradiction matrix | Principle suggestions by parameter pair | after mapping | principle shortlist |
| 40 principles | Directional transformations | concept generation | design questions |
| Algorithm route | Memory of reasoning | team problem solving | traceable decisions |
| Psychological barrier map | Human obstacles | expert-heavy teams | reframed problem |
| Evolution tendencies | Future direction | roadmap / patent / next version | strategic concept options |

Примеры из книги:
- `Levels of creativity`: Levels of creativity классифицируют задачу перед методом. Это показывает, когда достаточно known solution, а когда нужен алгоритмический поиск.
- `Ideal machine`: Ideal machine заставляет искать функцию без лишнего носителя. В книге это основной способ двигаться к higher ideality.
- `Technical contradiction`: Technical contradiction превращает trade-off в solvable object. Пока пара параметров не названа, matrix and principles использовать рано.
- `Contradiction matrix`: Contradiction matrix дает principle suggestions by parameter pair. Ее сила зависит от качества mapping, а не от механического чтения таблицы.
- `40 principles`: 40 principles задают направления преобразования. Они становятся рабочими, когда превращены в вопросы к конкретному conflict zone.
- `Algorithm route`: Algorithm route сохраняет ход мышления. Команда видит, как от уровня задачи и contradiction пришла к concept.
- `Psychological barrier map`: Psychological barrier map показывает, где опыт и терминология сузили поиск. Это помогает изменить формулировку, а не только искать новый принцип.
- `Evolution tendencies`: Evolution tendencies добавляют forecast: сильное решение должно учитывать развитие technical system, а не только текущую поломку.

## 7. Принципы применения

1. Matrix без level check часто дает wrong effort.
2. Matrix без contradiction дает random creativity.
3. Principle без question дает generic advice.
4. Ideal machine must challenge every added component.
5. Algorithm is valuable only if each step changes the problem representation.
6. Psychological barrier is part of the system, not an afterthought.
7. Evolution tendencies are used after current concept, not instead of solving current contradiction.

## 8. Patterns / techniques

### 8.1 Level-to-method selector

| Level signal | First method |
|---|---|
| Known solution exists | engineering search / benchmark |
| Known principle exists in adjacent field | analogy with function mapping |
| Improving one parameter harms another | technical contradiction + matrix |
| One element needs opposite properties | physical contradiction / separation |
| Current system is exhausted | evolution tendencies + new principle |

### 8.2 Matrix discipline

1. Write contradiction in natural language.
2. Map improving parameter.
3. Map worsening parameter.
4. Try alternative mappings.
5. Collect principles.
6. Rank repeated principles.
7. Convert each principle into a system question.
8. Create concepts.

### 8.3 Principle-question examples

| Principle type | Question |
|---|---|
| Segmentation | What can be split by function, time, space or user state? |
| Taking out | What harmful or expensive part can be removed from the system? |
| Local quality | Where does the system need non-uniform properties? |
| Prior action | What can be done before conflict time? |
| Dynamization | What should become adjustable instead of fixed? |
| Inversion | What if we reverse action, object, order or responsibility? |

### 8.4 Evolution pass

1. Identify current concept.
2. Ask how it increases ideality.
3. Check if it makes the system more dynamic.
4. Check if it moves function to micro-level or field.
5. Check if subsystem merges into supersystem.
6. Write next-generation hypothesis.

## 9. Anti-patterns

| Anti-pattern | Симптом | Почему плохо | Коррекция |
|---|---|---|---|
| Matrix as oracle | команда берет first principle | no problem understanding | mapping discipline |
| Level blindness | все задачи решаются одинаково | method mismatch | level-to-method selector |
| Ideal machine skipped | concepts add mechanisms | low ideality | ideality gate |
| Principle literalism | copied analogies | weak transfer | principle as question |
| Barrier denial | experts say "impossible" | hidden assumption remains | psychological barrier map |
| No evolution pass | current fix creates next bottleneck | short-term design | tendencies checklist |

## 10. Практические выводы по разделам

| Раздел | Core idea | Key takeaways | Connects to |
|---|---|---|---|
| Technology of Creativity | creative work has technology | use levels, ideality and contradiction | `ALT-RU-ALG`, `GADD` |
| Levels of Creativity | method must fit novelty depth | classify before solving | `ALT-INVENTOR` teaching |
| Ideal Machine | function without machine | remove or transfer function | `GADD` trimming |
| Technical Contradictions | trade-off is the work object | map parameters before principles | `HLYN` matrix rules |
| Algorithm Works | route matters | document transitions | `ORLOV` Meta-ARIZ |
| Psychological Barriers | human terms shape solution space | reframe language | `ALT-INVENTOR` STC |
| 40 Principles | transformations after contradiction | principles become questions | unified principle deck |
| Tendencies | solution should evolve | add roadmap hypothesis | `GADD` trends |

## 11. Glossary

| Термин | Определение для применения |
|---|---|
| Level of creativity | depth of novelty required from solution |
| Ideal machine | system state where function exists and machine disappears |
| Technical contradiction | improving one parameter worsens another |
| Contradiction matrix | lookup table connecting parameter pairs to inventive principles |
| 40 principles | recurring transformations used to generate concept directions |
| Algorithm | structured route from problem to invention |
| Psychological barrier | mental/professional constraint that narrows search |
| Evolution tendency | recurring direction of technical system development |

## 12. Сценарии применения

### 12.1 Выбор метода для сложной задачи

Use:
- level check;
- contradiction classification;
- matrix only if technical contradiction exists;
- evolution pass after concept.

Output:
- team knows whether to use engineering search, matrix, separation, ARIZ or evolution thinking.

### 12.2 Matrix session without shallow brainstorming

Use:
- matrix contract;
- alternative mappings;
- repeated principle ranking;
- principle-question table.

Output:
- concepts are tied to contradiction, not random inspiration.

### 12.3 Next-generation product route

Use:
- ideal machine;
- evolution tendencies;
- psychological barrier map.

Output:
- roadmap hypotheses with source traceability.

## 13. Cheatsheet

1. What level of creativity is required?
2. Is this technical or physical contradiction?
3. What improves?
4. What worsens?
5. Which alternative parameter mappings are plausible?
6. Which principles repeat?
7. What question does each principle ask?
8. Does concept approach ideal machine?
9. Which evolution tendency suggests next step?
10. What psychological barrier remains?

## 14. Topic index

| Тема | Где искать |
|---|---|
| Levels of Creativity | source copy `Table of Contents`, Part 1-2 |
| Ideal Machine | source copy Part 1-5 |
| Technical Contradictions | source copy Part 1-6 |
| Algorithm Works | source copy Part 2-4 |
| Exercise Problems | source copy Part 2-5 |
| Psychological Barriers | source copy Part 3-1 |
| 40 Principles | source copy Appendix 1 |
| Evolution Tendencies | source copy Appendix 2 |

## 15. Scope and limits

Что этот source хорошо дает:
- англоязычную структуру core Altshuller method;
- strong matrix/principles/evolution bridge;
- уровни творчества and psychological barrier layer;
- clear role for algorithmic discipline.

Что нужно брать из других sources:
- более подробные S-field standards: `ALT-EXACT`, `GADD`, `HLYN`;
- Meta-ARIZ and CICO: `ORLOV`;
- training/story route: `ALT-INVENTOR`;
- engineering facilitation details: `GADD`.
