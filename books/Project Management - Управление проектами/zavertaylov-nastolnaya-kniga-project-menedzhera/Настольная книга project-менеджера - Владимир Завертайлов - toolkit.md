# Настольная книга project-менеджера - Владимир Завертайлов - practical toolkit v2

## Связь с charter проекта

Этот toolkit превращает книгу в рабочий набор действий для PM и наставника junior PM. Это не пересказ и не замена книги: все формулировки сжаты в применимые модели, приемы, чек-листы, anti-patterns, сценарии и source traceability.

## Отчет извлечения

| Поле | Значение |
|---|---|
| Источник | `runtime/books/Project Management - Управление проектами/zavertaylov-nastolnaya-kniga-project-menedzhera/Владимир Завертайлов - Настольная книга project-менеджера.epub` |
| Structured Markdown copy | `runtime/books/Project Management - Управление проектами/zavertaylov-nastolnaya-kniga-project-menedzhera/Владимир Завертайлов - Настольная книга project-менеджера.md` |
| Extraction | EPUB spine 001-156, примерно 149k words |
| Output | Русский practical toolkit v2 |
| V2 assembly | Полная новая сборка из structured source с отдельным micro-practice coverage gate |

## Staged assembly / source layers

1. Source map: spine 003-020 management basics; 021-026 Scrum; 027-050 discovery/product; 051-065 estimation; 066-093 design; 094-115 team; 116-120 etudes; 121-129 clients/support; 130-134 integrations; 135-140 muda/risk; 141-154 tech literacy.
2. Direct source pass: headings, imperative fragments, named concepts and small practices scanned from the structured Markdown source.
3. Micro-practice pass: each worthy small practice is marked `card`, `folded_into`, or `excluded_with_reason`.
4. Synthesis: toolkit routes first, then action cards, then deep reference, scenarios, cheatsheet, glossary and topic index.

## Как пользоваться toolkit

### Battle route

1. Определи текущий тип боли: задача, власть, Scrum, требования, оценка, дизайн, команда, поддержка, интеграция, риск или production.
2. Открой `Быстрая карта`, выбери область.
3. В `Tool selector` выбери инструмент и проверь `Do not use when`.
4. Возьми одну action card и сделай первый шаг в течение дня.
5. Если практика мелкая и странно звучит, проверь `Micro-practice coverage`: там видно, стала ли она карточкой или folded item.

### Training route

| Неделя | Фокус | Практика ученика | Проверка наставника |
|---|---|---|---|
| 1 | Картина проекта и делегирование | карта stakeholders, task brief, список `поручил-контролирую` | задачи ищутся, сроки и owner ясны |
| 2 | Контроль и власть | контрольные точки, field of power, gemba check | PM видит реальную работу, а не только отчеты |
| 3 | Scrum без культа | zero retro, sprint goal, planning poker, demo | каждый ритуал имеет вход, выход и решение |
| 4 | Требования и продукт | Lean Canvas, persona, JTBD, MVP/RAT | гипотезы проверяемы, не превращены в длинный бриф |
| 5 | Оценка и декомпозиция | fork estimate, 3-level decomposition, PERT/Gantt | оценка объяснима и не обещана из воздуха |
| 6 | Дизайн | moodboard, creative slider, UI-kit checklist | дизайн оценивается по цели, а не вкусовщине |
| 7 | Команда | 1:1, feedback diary, Niko-Niko, digest | видно настроение, вклад и проблемы команды |
| 8 | Support/integration/production | support intake, integration protocol, SSL/access/monitoring | PM понимает технический контур без притворства |
| 9 | Muda/risk | muda map, fact map, tail risk review | PM находит системные причины, а не виноватых |

## Быстрая карта

| Область | Что дает | Базовые инструменты |
|---|---|---|
| Делегирование | задачи становятся принятыми, понятными и контролируемыми | task brief, SMART, список контроля, контрольные точки |
| Власть и требовательность | PM перестает прятаться за тикеты и начинает управлять | field of power, PDCA власти, gemba, ступеньки требовательности |
| Scrum/delivery | итерации дают контроль реальности, а не ритуальный театр | zero retro, sprint goal, planning poker, demo, retro, red frame |
| Discovery/product | требования становятся гипотезами, сегментами и решениями | Lean Canvas, personas, ABCDX, CJM, MVP/MLP, JTBD, RAT |
| Оценка | обещания опираются на неопределенность, прошлое и структуру | fork estimate, buffers, 3-level decomposition, PERT, Gantt |
| Design management | дизайн управляется через процесс, артефакты и проверки | creative slider, moodboard, presentation checklist, UI-kit |
| Team health | команда получает обратную связь, ритуалы и профилактику выгорания | 1:1, feedback diary, Niko-Niko, digests, review |
| Client/support/integration | хаос переводится в процесс, протоколы и повторяемость | handover checklist, support RCA, integration brief/protocol |
| Muda/risk | проблемы разбираются как система, а не как поиск виноватого | muda scan, fact maps, TOC diagrams, risk matrix |
| Technical literacy | PM понимает production-контур достаточно, чтобы задавать правильные вопросы | domain, cookies, hosting, monitoring, SSL, access, VCS |

## Tool selector

| Tool | Best for | Do not use when | Primary source layers |
|---|---|---|---|
| Список `поручил-контролирую` | много поручений и слабая память | задача не принята человеком | spine 005 |
| Контрольные точки методом поводка | длинная задача с неопределенностью | работа идет час или меньше | spine 008 |
| Glvrd / ясный стиль | письменные постановки задач | задача требует живого обсуждения | spine 009, 011 |
| PDCA власти | построить управленческий цикл | нет права требовать результат | spine 016 |
| Gemba / иди и смотри | проверить реальную работу | удаленно можно проверить лучше и быстрее | spine 016 |
| Zero retro | внедрить Scrum без сопротивления | команда уже понимает зачем ей Scrum | spine 022, 024 |
| Planning Poker | вскрыть разное понимание задачи | задача еще не описана | spine 023, 053 |
| Red frame | показать частично готовый интерфейс | stakeholders примут рамку за финальный дизайн | spine 026 |
| Lean Canvas | быстро собрать логику продукта | нужна юридически точная спецификация | spine 030 |
| ABCDX | понять клиентские сегменты по выручке и затратам | нет хотя бы грубой экономической картины | spine 031 |
| RAT / MVP / MLP | проверять гипотезы до большой разработки | уже есть проверенный спрос и модель | spine 038-039 |
| RICE / ICE | сравнить backlog candidates | оценки полностью выдуманы | spine 046-047 |
| Fork estimate | обещать срок при неопределенности | scope стабилен и повторяем | spine 058 |
| PERT | увидеть критические зависимости | проект слишком мал для графа | spine 062 |
| Creative slider | договориться о степени креатива | задача чисто техническая | spine 068 |
| Moodboard | синхронизировать вкус до макета | заказчик не готов обсуждать направление | spine 070 |
| UI-kit checklist | перейти от экранов к системе | дизайн еще меняется каждую итерацию | spine 078 |
| Niko-Niko | видеть настроение команды | нужно оценить performance человека | spine 113 |
| Dyatel-board | сформировать привычку через ежедневное напоминание | команда воспринимает это как публичное унижение | spine 112 |
| Friday digest | мягкая видимость проектов | культура публичных апдейтов токсична | spine 114 |
| Integration protocol | договориться о данных между системами | еще не понятны стороны обмена | spine 133 |
| Muda scan | найти потери в процессе | команда ищет виноватого, а не систему | spine 135 |
| Fact map / TOC | разобрать сложную проблему | проблема простая и решается чек-листом | spine 136 |
| Risk matrix | выбрать первые риски для снижения | риски без owner и ранних индикаторов | spine 139 |
| SSL/access/monitoring checklist | production readiness | это не web/digital контур | spine 145-148 |

## Лайфхаки, приемы и инструменты к внедрению

| # | Что внедрить | Когда применять | Первый шаг | Источник / где искать в книге |
|---:|---|---|---|---|
| 1 | Карту мира digital-проекта | PM не понимает, кто за что отвечает | Нарисовать заказчика, пользователей, подрядчиков, команду, деньги, сроки и ограничения | source md; spine 003-004 |
| 2 | Кривую роста мастерства | Джун пугается ямы обучения | Показать стадии роста и нормализовать период непонимания | source md; spine 004 |
| 3 | Делегирующую силу | Руководитель держит задачи у себя | Выписать, что можно отдать, кому и какой контроль нужен | source md; spine 005 |
| 4 | Устное обсуждение плюс письменную фиксацию | Задача сложная и люди понимают ее по-разному | Обсудить голосом, затем зафиксировать owner, срок, результат и контроль | source md; spine 005 |
| 5 | Список `поручил-контролирую` | Много мелких поручений | Завести список: кому, что, когда, следующий контроль | source md; spine 005 |
| 6 | Запрет туалетного делегирования | Задачи ставятся на бегу | Перенести постановку в рабочий канал или встречу, где человек может принять задачу | source md; spine 006 |
| 7 | Фильтр вопросов ради вопросов | Исполнитель саботирует принятие задачи уточнениями | Отделить реальные blockers от защиты от ответственности | source md; spine 006 |
| 8 | Уровни делегирования | Непонятно, сколько свободы дать человеку | Выбрать уровень: идея, тезисы, задача или инструкция | source md; spine 007 |
| 9 | SMART плюс контроль | Задача расплывчатая | Сформулировать результат, критерий, срок и точку контроля | source md; spine 007 |
| 10 | Research-task funnel | Задача новая и непонятная | Разделить постановку, research, уточненную оценку и выполнение | source md; spine 008 |
| 11 | Контрольные точки методом поводка | Есть риск исчезновения исполнителя в задаче | Поставить короткие checkpoints до финального срока | source md; spine 008 |
| 12 | Мониторинг квалификации | Руководитель боится делегировать | Проверять квалификацию и растить ее до нужного уровня | source md; spine 009 |
| 13 | Glvrd-style check | Письменная задача мутная | Укоротить постановку, убрать воду, прогнать первые тексты через glvrd | source md; spine 009, 011 |
| 14 | Принцип пирамиды | Длинные постановки не читают | Вынести главное в начало, детали ниже | source md; spine 011 |
| 15 | Поископригодность задачи | Потом никто не может найти баг/решение | Добавить ключевые слова, скриншоты и понятное название | source md; spine 011 |
| 16 | Приоритеты багов | Команда спорит, что чинить первым | Ввести уровни критичности и критерий запуска | source md; spine 011 |
| 17 | Авиационный self-check | PM верит отчетам и пропускает дефекты | Все, что можно проверить самому, проверить самому | source md; spine 012 |
| 18 | Наставники и следы | Джун учится хаотично | Оставлять артефакты решений и находить старших для проверки | source md; spine 012 |
| 19 | Field of power | Команда не понимает полномочия PM | Явно обозначить зоны ответственности, прав и санкций | source md; spine 014 |
| 20 | Антисамозахват | Кто-то берет чужую власть без ответственности | Зафиксировать границы полномочий и escalation path | source md; spine 015 |
| 21 | PDCA власти | Правила есть, но не работают | Планировать правила, доводить, проверять, воздействовать | source md; spine 016 |
| 22 | Gemba / иди и смотри | PM получает отчеты, но не видит реальность | Открыть продукт, проверить с телефона, посмотреть рабочий процесс человека | source md; spine 016 |
| 23 | Доведение правил как продажу | Команда сопротивляется регламентам | Начать с проблемы, причины и примеров, затем отвечать на возражения | source md; spine 016 |
| 24 | Центрирующие парадигмы | Команда играет по разным правилам | Сформулировать общие принципы работы и разбирать через них спорные ситуации | source md; spine 017 |
| 25 | Заимствованную власть | Новый PM еще не имеет авторитета | Временно опираться на авторитет руководителя и постепенно брать роль | source md; spine 017 |
| 26 | Ступеньки требовательности | PM избегает конфликта | Тренировать требовательность от простых распоряжений к сложным разговорам | source md; spine 017 |
| 27 | Нормальную эксплуатацию | Требовательность путают с мозгоклюйством | Требовать результат, но не ломать поток и уважение | source md; spine 018 |
| 28 | Форсаж с компенсацией | Нужен временный рывок | Назвать срок форсажа и дать компенсацию после | source md; spine 019 |
| 29 | Критику без оскорбления | Обратная связь воспринимается лично | Критиковать работу, факт и критерий, а не личность | source md; spine 020 |
| 30 | Zero retro перед Scrum | Scrum внедряется сверху | Сначала обсудить проблемы команды и зачем нужен процесс | source md; spine 022 |
| 31 | Sprint goal на стендапе | Команда говорит тикетами | Повесить цель спринта перед глазами и связывать ответы с целью | source md; spine 023 |
| 32 | Planning Poker | Оценки расходятся | Дать независимые оценки, обсудить разброс, уточнить задачу | source md; spine 023, 053 |
| 33 | Demo как контроль реальности | Все считают, что задача готова | Показывать рабочий прирост продукта stakeholders | source md; spine 024 |
| 34 | Ретроформат из 7 шагов | Ретро превращается в жалобы | Подготовка, настройка, факты, идеи, план, закрытие | source md; spine 024 |
| 35 | Фиксацию решений ретро | Улучшения не доходят до дела | Каждое решение ретро превратить в тикет с owner | source md; spine 025 |
| 36 | Kanban switch | Scrum мешает потоку поддержки | Перевести потоковые задачи в Kanban, если итерации мешают | source md; spine 025 |
| 37 | Метод красной рамки | Показывается частично готовый интерфейс | Маркировать незавершенные зоны и заранее объяснить, что оценивать нельзя | source md; spine 026 |
| 38 | Cargo-cult audit | Процесс есть, смысла нет | Для каждого ритуала назвать вход, выход и решение | source md; spine 026 |
| 39 | Stakeholder map | Требования приходят от всех подряд | Выявить всех влияющих людей и их интересы | source md; spine 028 |
| 40 | Anti-founder hallucination check | Основатель уверен, что всем нужен продукт | Проверить гипотезу на клиентах и поведении | source md; spine 029 |
| 41 | Lean Canvas | Нужно быстро согласовать бизнес-логику | Заполнить problem, segment, value, channels, money, metrics, advantage | source md; spine 030 |
| 42 | ABCDX segmentation | Не ясно, какие клиенты выгодны | Сегментировать по выручке и затратам, отсеять токсичные сегменты | source md; spine 031, 128 |
| 43 | Persona/avatar | Команда проектирует для абстрактного пользователя | Описать сегмент через поведение, цели, боли и ограничения | source md; spine 031-032 |
| 44 | Верхнеуровневые мотивы | Фичи не связаны с реальной мотивацией | Выписать pain, gain, страхи, выгоды, силу боли | source md; spine 033 |
| 45 | CJM | Непонятно, где пользователь теряется | Разложить путь пользователя, боли и точки решения | source md; spine 033 |
| 46 | Solution map | Требования похожи на список хотелок | Связать проблемы, решения, value and constraints | source md; spine 034 |
| 47 | Semantic core | Нужно понять спрос | Собрать поисковые запросы и структуру спроса | source md; spine 035 |
| 48 | Progressive JPEG prototype | ТЗ слишком тяжелое | Делать прототип от грубого к детальному, проверяя смысл раньше красоты | source md; spine 037 |
| 49 | Real-content prototype | Макет красивый, но пустой | Подставить реальные тексты, фото, ограничения и комментарии | source md; spine 037 |
| 50 | RAT | Гипотеза рискованная | Найти самое рискованное предположение и проверить его первым | source md; spine 038 |
| 51 | MVP / MLP choice | Нужно проверить продукт без лишнего | Решить: минимальная проверка жизнеспособности или любви пользователя | source md; spine 039 |
| 52 | JTBD interviews | Нужно понять, почему люди меняют поведение | Спросить о ситуации, триггере, альтернативе и результате | source md; spine 039-040 |
| 53 | HADI cycles | Нужно учиться на маленьких экспериментах | Hypothesis, Action, Data, Insight на одну итерацию | source md; spine 040 |
| 54 | Unit economics sanity | Фича выглядит классно, но экономика туманна | Посчитать на простом примере выручку, стоимость и маржу | source md; spine 041-042 |
| 55 | Story Mapping | Backlog не показывает путь пользователя | Разложить пользовательскую активность и release slices | source md; spine 043 |
| 56 | Value/Effort | Нужно быстро отсечь идеи | Разложить по ценности и усилию | source md; spine 043 |
| 57 | MoSCoW | Слишком много must-have | Разделить must, should, could, will not | source md; spine 044 |
| 58 | Kano | Нужно понять delight vs базу | Разделить базовые, performance and delight features | source md; spine 044 |
| 59 | ICE/RICE | Нужно сравнить кандидаты backlog | Оценить impact, confidence, effort, reach | source md; spine 046-047 |
| 60 | Roadmap + backlog grooming | Backlog живет отдельно от стратегии | Синхронизировать релизы, приоритеты и регулярную чистку backlog | source md; spine 048 |
| 61 | Практика как мерило истины | Диаграмма кажется правильной | Проверить процесс на реальном пользователе или операции | source md; spine 049 |
| 62 | Fork estimate | Нужно обещать при неопределенности | Дать диапазон, риски и условия уточнения | source md; spine 058 |
| 63 | Buffers and Murphy | Оценка слишком оптимистична | Добавить буфер и назвать риск, который он покрывает | source md; spine 052 |
| 64 | Past-reference estimate | Команда оценивает из головы | Найти похожие прошлые задачи и отличия | source md; spine 052-053 |
| 65 | Three-level decomposition | Большая задача не оценивается | Разложить на блоки, страницы/экраны, содержание экранов | source md; spine 055 |
| 66 | `Откуда это на странице?` | На странице непонятные данные | Для каждого элемента отметить источник данных | source md; spine 055-057 |
| 67 | Express Gantt | Нужно показать параллельные этапы | Нарисовать этапы, зависимости и контрольные точки | source md; spine 061 |
| 68 | PERT | Нужно увидеть критический путь | Построить network diagram и найти зависимые узлы | source md; spine 062 |
| 69 | Thick spec in iterations | Заказчик хочет полный фиксированный ТЗ | Делить толстый документ на проверяемые итерации | source md; spine 065 |
| 70 | Design artifact dictionary | PM не понимает дизайн-выходы | Завести словарь артефактов: moodboard, concept, UI-kit, prototype | source md; spine 066-067 |
| 71 | Creative slider | Конфликт о степени креатива | Согласовать уровень от шаблонного до экспериментального | source md; spine 068 |
| 72 | Moodboard | Вкус не синхронизирован | Собрать референсы и пояснить, что берем и не берем | source md; spine 070 |
| 73 | Brainwriting / fact maps | Нужны идеи без давления авторитета | Выписать идеи письменно, построить связи, затем обсуждать | source md; spine 073 |
| 74 | Ship council | Старшие давят идеями | Собирать идеи от младших к старшим | source md; spine 073 |
| 75 | Design presentation checklist | Клиент впервые видит макет | Подготовить контекст, ограничения, что смотреть и что не смотреть | source md; spine 074 |
| 76 | Internal design acceptance | Дизайн несут клиенту сырым | Внутри проверить соответствие задаче, состояниям, контенту, ограничениям | source md; spine 075 |
| 77 | Design sprint | Нужно быстро проверить направление | Собрать кросс-функциональный короткий цикл проверки решения | source md; spine 077 |
| 78 | UI-kit readiness | Экраны множатся без системы | После 2-3 экранов собрать компоненты, состояния, отступы and rules | source md; spine 078 |
| 79 | Objection log | Клиент спорит о дизайне | Записывать возражения, причину и ответ на будущее | source md; spine 079 |
| 80 | UX backlog | UX проблемы всплывают хаотично | Складывать UX findings в отдельный backlog с приоритетом | source md; spine 084 |
| 81 | Design junior show-work | Дизайн-джун учится невидимо | Устраивать регулярный смотр работ и разбор решений | source md; spine 088 |
| 82 | Design lifehacks Q&A | Мелкие правила дизайна теряются | Сделать справочник ссылок, стоков, контента, правок и hand-leading | source md; spine 090-092 |
| 83 | PM onboarding | Новый PM входит в хаос | Дать карту проекта, людей, договоренности, риски, ближайшие решения | source md; spine 095 |
| 84 | Hiring test | Собеседование не показывает работу | Дать практический тест с критериями и ограничением времени | source md; spine 096-097 |
| 85 | Touch hands, not flame wars | Команда спорит в интернете | Открыть продукт, попробовать руками, проверить факты | source md; spine 099 |
| 86 | Team ritual pack | У команды нет общей ткани | Ввести ритуалы, предметы, правила remote and shared memory | source md; spine 100 |
| 87 | 1:1 | Проблемы всплывают поздно | Регулярно говорить один на один и фиксировать follow-up | source md; spine 104 |
| 88 | Feedback receipt | Люди не понимают, что делают хорошо | Давать нейтральную, позитивную and negative feedback раздельно | source md; spine 104-107 |
| 89 | Punishment safety checklist | Нужно наказание, но есть риск сломать доверие | Проверить факт, правило, пропорцию, публичность, право на объяснение | source md; spine 107 |
| 90 | Feedback diary | Обратная связь забывается | Две недели вести дневник обратной связи | source md; spine 107 |
| 91 | Jobs alignment method | Команда тянет цели в разные стороны | Синхронизировать цели через метод Джобса and shared narrative | source md; spine 107 |
| 92 | Burnout prevention | Команда выгорает постепенно | Проверять сон, нагрузку, энергию, поддержку and recovery | source md; spine 108-112 |
| 93 | Niko-Niko | Нужно видеть настроение | Добровольные ежедневные отметки, смотреть тренд, не допрашивать | source md; spine 113 |
| 94 | Dyatel-board | Нужна привычка качества | Повесить стикер-напоминание на срок привычки and read daily | source md; spine 112 |
| 95 | Love-is stickers | Нужны мягкие правила культуры | Оформлять бытовые правила как короткие дружелюбные напоминания | source md; spine 113 |
| 96 | Advice of day / trendwatching | Команда не обновляет кругозор | Завести короткие daily prompts and sites of the day | source md; spine 113 |
| 97 | Yellow letters | Важные письма теряются | Делать выделенные письма для важных культурных/рабочих сигналов | source md; spine 113 |
| 98 | Beer fund | Опоздания мешают, но карать тяжело | Использовать добровольную игровую механику avoid punishment | source md; spine 113 |
| 99 | Subbotnik / library / leaderboards | Офисная среда и знания расползаются | Раз в год чистить пространство, назначить owner библиотеки, аккуратно использовать рейтинги | source md; spine 113 |
| 100 | Friday digest | Команды не знают, что у других | Пятничный короткий апдейт по проектам в общий канал | source md; spine 114 |
| 101 | Monthly thanks | Хорошая помощь остается невидимой | Раз в месяц собрать кого хотят отметить и почему | source md; spine 114 |
| 102 | Daily plan printout / Pomodoro | Личная работа расползается | Распечатать план дня, работать короткими отрезками или песочными часами | source md; spine 114 |
| 103 | Project review | Проекты не дают организационного обучения | Регулярно проводить review: что сработало, что сломалось, что меняем | source md; spine 115 |
| 104 | Handover checklist | Проект передается от продаж или в отпуск | Зафиксировать контекст, договоренности, риски, доступы, долги, next actions | source md; spine 124-125 |
| 105 | Support intake system | Поддержка разрывает PM | Разделить виды поддержки, входящие каналы, SLA, owner and triage | source md; spine 126 |
| 106 | Support RCA | Доработка создала новые проблемы | Разобрать причину, компенсировать клиенту, поправить процесс | source md; spine 127 |
| 107 | Support knowledge base | Одни вопросы повторяются | Фиксировать решения, инструкции и типовые ответы | source md; spine 128 |
| 108 | Integration working group | Интеграция буксует между сторонами | Собрать всех владельцев систем в рабочую группу | source md; spine 131 |
| 109 | Integration standups | Проблемы идут потоком | Регулярно отвечать: сделано, план, blocker | source md; spine 131 |
| 110 | Integration brief | Стороны не понимают объем интеграции | Заполнить сущности, поля, направление, ограничения, владельцев | source md; spine 133 |
| 111 | Integration protocol | Нужен общий контракт обмена | Зафиксировать форматы, частоты, ошибки, повторы, primary system | source md; spine 133 |
| 112 | Go-live exchange tests | Интеграция написана, но не доказана | Гонять обмены туда-сюда на тестовых данных and mark checks | source md; spine 134 |
| 113 | Muda scan | Процесс тратит силы впустую | Искать 8 потерь digital-команды | source md; spine 135 |
| 114 | Muda tools | Нужно найти системную потерю | Нарисовать поток, очереди, возвраты, ручные операции and re-entry | source md; spine 136 |
| 115 | Tail risk prevention | Могильник проекта растет скрыто | Повышать квалификацию, легализовать долги, сложное делать раньше | source md; spine 137 |
| 116 | Emergency tomb plan | Скрытые проблемы вскрылись | Инвентаризация фактов, owners, stop rules, risks, client communication | source md; spine 138 |
| 117 | Fact map / TOC / root cause | Проблема сложная и эмоциональная | Выписать факты, связи, why-chain, не уходить в ветки про виноватых | source md; spine 136, 138 |
| 118 | Risk matrix | Список рисков не помогает | Оценить вероятность, влияние, важность, owner, mitigation and contingency | source md; spine 139 |
| 119 | Domain/cookie/framework literacy | PM кивает на технических словах | Разобраться до объяснения простыми словами | source md; spine 141-143 |
| 120 | Hosting/server checklist | Проект выходит в production | Проверить тип хостинга, ресурсы, backup, окружения, доступы | source md; spine 144-145 |
| 121 | Monitoring | PM узнает о падении от клиента | Настроить события, уведомления, ответственного, dashboard and incident log | source md; spine 146 |
| 122 | SSL/DNS/mail records | Запускается сайт или форма | Проверить HTTPS, сроки, SPF/DKIM, DNS access and renewal owner | source md; spine 147 |
| 123 | Password/access hygiene | Доступы живут в чатах | Corporate password manager, minimum rights, rotation and revoke | source md; spine 148 |
| 124 | VCS daily push | Разработка живет локально | Договориться о push before standup and testable branch state | source md; spine 150 |
| 125 | Adaptive/mobile decision | Все спорят mobile first | Проверить аудиторию, сценарии, сетку, responsive/adaptive/mobile split | source md; spine 151-152 |
| 126 | Integration with everything risk brief | Клиент просит `просто подключить` | Проверить API, owner, test data, limits, errors, fallback support | source md; spine 153 |
| 127 | Official docs habit | Появляется новый framework/integration | Самому прочитать официальную документацию and keep tech digest habit | source md; spine 152-154 |

## Micro-practice coverage

| Candidate | Status | Где покрыт |
|---|---|---|
| `гемба / иди и смотри` | `card` | card 22 |
| `покликайте проект сами` | `folded_into` | cards 17, 22, 85 |
| `glvrd.ru` | `card` | card 13 |
| `принцип пирамиды` | `card` | card 14 |
| `поископригодность записи` | `card` | card 15 |
| `красная/желтая/зеленая зона власти` | `folded_into` | cards 19, 26 |
| `цель спринта перед глазами` | `card` | card 31 |
| `нулевая ретроспектива` | `card` | card 30 |
| `метод красной рамки` | `card` | card 37 |
| `ABCDX` | `card` | card 42 |
| `прогрессивный JPEG` | `card` | card 48 |
| `метод светофора для документов` | `folded_into` | cards 69, 75, deep reference |
| `трендвотчинг` | `card` | card 96 |
| `Дятел-board` | `card` | card 94 |
| `Love is stickers` | `card` | card 95 |
| `совет дня` | `card` | card 96 |
| `желтые письма` | `card` | card 97 |
| `пивной фонд` | `card` | card 98 |
| `субботники` | `card` | card 99 |
| `корпоративная библиотека` | `card` | card 99 |
| `лидерборды и карма` | `folded_into` | card 99, anti-patterns |
| `пятничные дайджесты` | `card` | card 100 |
| `спасибы в конце месяца` | `card` | card 101 |
| `песочные часы / Pomodoro` | `card` | card 102 |
| `факт-карты` | `card` | card 117 |
| `TOC diagrams` | `card` | card 117 |
| `Zabbix / monitoring` | `card` | card 121 |
| `SPF / DKIM` | `card` | card 122 |
| `daily push before standup` | `card` | card 124 |
| `читать официальную документацию` | `card` | card 127 |
| `длинные source fragments` | `excluded_with_reason` | не включены, чтобы toolkit не стал заменой книги |

## Deep reference body

### 1. Management core

Завертайловская PM-модель жесткая: PM нужен не для красивых статусов, а для превращения неопределенности в принятые задачи, контролируемые сроки и управляемое поле ответственности. Главный рабочий цикл: поставить задачу так, чтобы ее приняли; проверить реальность руками; довести правила; воздействовать, если правила не работают. В этой группе держатся `делегирование`, `контрольные точки`, `field of power`, `PDCA власти`, `gemba`, `ступеньки требовательности`, `нормальная эксплуатация`.

### 2. Delivery and Scrum

Scrum в книге не культ, а способ создать повторяемый цикл: backlog, planning, sprint goal, daily check, demo, retro. Важная поправка автора: начинать с проблемы команды, а не с копирования ceremonies. Если поток задач сервисный или поддержка ломает итерации, Kanban может быть честнее. Красная рамка и demo нужны, чтобы stakeholders видели реальность, а не фантазию готовности.

### 3. Discovery and product thinking

Требования не собираются как список желаний. Их нужно переводить в сегменты, боли, решения, CJM, Lean Canvas, risky assumptions and experiments. Сильная линия книги: заказная разработка тоже должна думать продуктово, иначе команда строит не то, что приносит ценность.

### 4. Estimation and planning

Оценка строится вокруг неопределенности. Нельзя обещать точность там, где нет структуры. Рабочий путь: past reference, fork estimate, decomposition, PERT/Gantt for dependencies, buffers, visible assumptions. Важный micro-tool: для каждого элемента страницы спросить, откуда он берется.

### 5. Design management

PM не должен быть дизайнером, но должен управлять процессом: определить артефакт, уровень креатива, moodboard, presentation frame, internal acceptance, UI-kit readiness. Дизайн conflict решается через критерии, ограничения and source of value, not через вкус.

### 6. Team and culture

Команда держится на ясности, обратной связи, ритуалах и энергии. В книге много маленьких практик: Niko-Niko, Dyatel-board, Friday digests, Love-is stickers, beer fund, monthly thanks. Они не равны по важности и не везде применимы, но v2 сохраняет их как coverage items, чтобы PM мог выбрать, что подходит культуре.

### 7. Client, support and integrations

Поддержка и интеграции разваливаются, когда нет входного фильтра, владельцев, протокола и проверки реального обмена. Базовый контур: brief, protocol, working group, standups, test exchanges, RCA after support incidents, knowledge base for repeated support.

### 8. Muda, risk and problem analysis

Книга предлагает смотреть на потери как на систему. Не `Вася виноват`, а `какие ограничения и процессы привели к дефекту`. Для сложных проблем используются fact maps, TOC trees, root-cause, risk matrix and tail-risk prevention. Чем больнее проблема, тем важнее не глушить ее быстрым blame.

### 9. Technical literacy

PM не обязан быть разработчиком, но обязан понимать domain, cookies, hosting, SSL, access, monitoring, VCS, adaptive, integrations enough to ask sane questions. Практика автора: услышал непонятный термин - спрашивай и рисуй схемы, пока можешь объяснить простыми словами.

## Junior PM teaching kit

| Проверка | Что должен показать джун |
|---|---|
| Task brief | результат, owner, срок, критерии, контрольная точка |
| Gemba check | не только статус, но видимый факт реальной работы |
| Scrum ritual explanation | вход, выход, решение по каждому ритуалу |
| Discovery artifact | canvas/persona/JTBD linked to a real decision |
| Estimate explanation | decomposition, assumptions, range and risks |
| Design demo preparation | что показываем, что не финально, какие вопросы задаем |
| Team health signal | 1:1 notes, mood trend or feedback diary without surveillance |
| Integration readiness | brief/protocol/test exchange/owner list |
| Production readiness | domain, SSL, access, monitoring, VCS checklist |

## Coverage map

| Source layer | Covered in toolkit |
|---|---|
| spine 003-013 | delegation, task writing, control, aviation self-check |
| spine 014-020 | authority, PDCA, gemba, demanding, criticism |
| spine 021-026 | Scrum, zero retro, planning poker, demo, retro, red frame |
| spine 027-050 | discovery, Lean Canvas, personas, ABCDX, JTBD, MVP, scoring |
| spine 051-065 | uncertainty, estimates, decomposition, PERT/Gantt, specs |
| spine 066-093 | design process, presentation, UI-kit, UX, design Q&A |
| spine 094-115 | hiring, onboarding, rituals, feedback, burnout, gamification |
| spine 116-120 | etudes folded into training and scenarios |
| spine 121-129 | client model, openness, handover, support |
| spine 130-134 | integration working group, brief, protocol, go-live |
| spine 135-140 | muda, tail risks, problem analysis, risk matrix |
| spine 141-154 | tech literacy, hosting, monitoring, SSL, access, VCS, adaptive |

## Excluded / limited source notes

- Long examples, anecdotes and colorful source language are paraphrased or omitted to avoid making the toolkit a replacement for the book.
- Culture hacks with high risk of misuse, like leaderboards, punishment mechanics and public boards, are included with caution, not as universal recommendations.
- Etudes are used as training/scenario material, not copied as separate full cases.
- External links and named software are kept only where they are operationally useful.

## Anti-patterns

| Anti-pattern | Risk | Safer replacement |
|---|---|---|
| Summary вместо toolkit | читатель знает о книге, но не действует | action cards and routes |
| Статусы вместо gemba | PM верит отчетам и пропускает реальность | go-see, click product, observe work |
| Scrum cargo cult | ceremonies drain team | zero retro and ritual input/output |
| Делегирование на бегу | задача не принята | planned task setting |
| Большое ТЗ как обещание истины | команда поздно узнает, что ошиблась | iterative prototype and red frame |
| Метрики вместо слушания команды | люди скрывают проблемы | retro, 1:1, qualitative signals |
| Public shame mechanics | ритуалы ломают доверие | voluntary, reversible, culture-safe practices |
| Blame-based RCA | проблема повторяется | fact map / TOC / system causes |
| Production без owner доступа | запуск зависит от случайных людей | access, SSL, monitoring and revoke checklist |

## Практические сценарии

### Сценарий 1. Джун получил мутную задачу

Использовать cards 4, 9, 10, 11, 13, 14. Результат: короткий task brief, accepted owner, clear next checkpoint.

### Сценарий 2. PM не доверяет отчетам

Использовать cards 17, 22, 31, 33, 61, 85. Результат: реальный проверенный факт, а не пересказ.

### Сценарий 3. Scrum вызывает сопротивление

Использовать cards 30, 31, 32, 33, 34, 38. Результат: команда понимает, какой ритуал зачем нужен.

### Сценарий 4. Клиент приносит хаотичные требования

Использовать cards 39-55. Результат: карта stakeholders, canvas, segments, hypotheses, validation plan.

### Сценарий 5. Дизайн почти готов, но клиент увидит впервые

Использовать cards 71-80. Результат: framing, reference context, red lines, objections log.

### Сценарий 6. Команда устала и начала ошибаться

Использовать cards 87-103. Результат: private signal, trend, feedback and recovery actions.

### Сценарий 7. Интеграция буксует

Использовать cards 108-112, 126. Результат: working group, protocol, exchange tests, blockers surfaced.

### Сценарий 8. Production риск перед запуском

Использовать cards 119-124. Результат: domain, hosting, monitoring, SSL, access and VCS checklist.

## Cheatsheet

### 15 вопросов PM перед обещанием срока

1. Кто owner результата?
2. Что будет считаться готовым?
3. Где source of truth?
4. Кто принимает работу?
5. Какие assumptions?
6. Какие unknowns?
7. Что можно проверить за день?
8. Где контрольная точка?
9. Какие зависимости?
10. Что уже делали похожее?
11. Какой диапазон оценки?
12. Где буфер?
13. Какой риск самый ранний?
14. Что покажем на demo?
15. Как поймем, что обещание стало неверным?

### One-page launch checklist

- Domain and DNS owner known.
- SSL active, renewal owner known.
- SPF/DKIM checked if mail exists.
- Hosting/resources/backup checked.
- Monitoring and alerts configured.
- Access stored in corporate password manager.
- VCS branch/push/deploy path known.
- Integration protocol tested on real-like data.
- Support owner and incident channel known.

### One-page team health check

- 1:1 happened.
- Feedback diary updated.
- Mood trend watched, not used as punishment.
- Retro decisions turned into tasks.
- Workload and sleep risk checked.
- Public ritual is voluntary and reversible.
- Thanks and recognition are visible.

## Glossary

| Term | Meaning |
|---|---|
| Gemba | место создания ценности; идти смотреть реальную работу |
| PDCA власти | планируй, делай, проверяй, воздействуй как management cycle |
| Field of power | явное распределение прав, обязанностей and responsibility |
| Toilet delegation | постановка задачи в нерабочем месте, где ее нельзя принять |
| Red frame | маркировка незавершенного фрагмента интерфейса |
| RAT | проверка самого рискованного предположения |
| MVP | минимальный продукт для проверки жизнеспособности |
| MLP | минимальный продукт, который вызывает любовь/тягу |
| ABCDX | сегментация клиентов по выручке and затратам |
| Niko-Niko | календарь настроения команды |
| Muda | потери в процессе |
| Fact map | карта фактов and связей для анализа проблемы |
| Integration protocol | контракт обмена данными между системами |

## Topic index

| Topic | Cards |
|---|---|
| Delegation | 3-12 |
| Writing tasks | 13-16 |
| Control | 17-23, 61 |
| Authority | 19-29 |
| Scrum | 30-38 |
| Product discovery | 39-60 |
| Estimation | 62-69 |
| Design | 70-82 |
| Team | 83-103 |
| Support | 104-107 |
| Integration | 108-112, 126 |
| Muda/Risk | 113-118 |
| Tech literacy | 119-127 |

## Scope and limits

- Toolkit v2 selected by owner as the single kept toolkit for this book.
- It was generated from the structured Markdown source copy, not by editing v1.
- The former v1 content remains available through Git history/diff, not as a separate toolkit artifact.
