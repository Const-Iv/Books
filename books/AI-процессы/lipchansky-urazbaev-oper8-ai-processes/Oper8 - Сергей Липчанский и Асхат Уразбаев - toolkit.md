# Oper8 - Сергей Липчанский и Асхат Уразбаев - practical toolkit

Статус: single-book Books toolkit по локально предоставленному PDF `Oper8 v0.8`. Это не пересказ и не замена документа. Это рабочий toolkit для руководителя, операционного директора, product/process owner или AI transformation lead, который хочет перестроить один процесс так, чтобы он становился умнее с каждым клиентом, решением и прогоном.

Source alias:

- `SRC` = `runtime/books/AI-процессы/lipchansky-urazbaev-oper8-ai-processes/Сергей Липчанский и Асхат Уразбаев - Oper8. AI-процессы, которые учатся с каждым клиентом.md`

## Связь с charter проекта

Books должен превращать книгу или фрагмент книги в применимый toolkit на русском: модели, принципы, техники, anti-patterns, сценарии применения, шпаргалки, glossary и topic index. Поэтому этот файл устроен как practical operating guide по Oper8, а не как краткое содержание.

Ценность для пользователя: можно быстро выбрать AI-процесс-кандидат, спроектировать маховик данных, задать границы автономии, вести память решений, проверять качество, выбрать метрики, подготовить людей и запустить первые шаги в течение недели.

## Отчет извлечения

| Поле | Значение |
|---|---|
| Источник | `Oper8_v0_8_AI_процессы_которые_учатся_с_каждым_клиентом.pdf` |
| Нормализованный original | `Сергей Липчанский и Асхат Уразбаев - Oper8. AI-процессы, которые учатся с каждым клиентом.pdf` |
| Structured Markdown copy | `SRC` |
| Метод | `pdftotext` default extraction plus page markers; `pdftotext -layout` был отклонен из-за timeout |
| Страницы | 56 |
| Объем | примерно 12 862 слова |
| Визуальная проверка | Обложка, оглавление, Page 25 figure и Page 41 loop проверены через PNG render |
| Тип источника | practical nonfiction / AI process transformation guide |
| Output | русский toolkit |

Extraction quality: достаточное для toolkit. Ограничение: схемы на Page 25 и Page 41 добавлены как visual notes в локальную structured copy, потому что текстовый extraction не передал все элементы диаграмм.

## Staged assembly / source layers

| Layer | Что извлечено | Source |
|---|---|---|
| Identity layer | Название, авторы, v0.8, общий intent | `SRC#page-1`, `SRC#page-5` |
| Problem navigator | Типовые проблемы пользователя и куда смотреть | `SRC#page-6` |
| Core thesis | AI value появляется не от Deploy, а от Reshape процесса | `SRC#page-11` to `SRC#page-14` |
| Process model | Процесс должен учиться с каждым прогоном; быстрый и медленный циклы образуют маховик | `SRC#page-15` to `SRC#page-16` |
| Candidate selection | Три барьера и выбор глубины изменения | `SRC#page-19` to `SRC#page-22` |
| Flywheel components | База знаний, автономия, память, QA, метрики | `SRC#page-24` to `SRC#page-41` |
| Organization layer | Frozen middle, ИИ-грамотность, роли, карта перехода | `SRC#page-43` to `SRC#page-51` |
| Monday start | 4 стартовых шага, failure handling, next skills | `SRC#page-53` to `SRC#page-56` |

## Как пользоваться toolkit

Если нужно быстро запустить первый процесс, идите через `Battle route`, затем откройте `Tool selector` и action cards 1-8. Если нужно выстроить устойчивую систему, идите через `Training route`, затем используйте `Deep reference body`, `Cheatsheet` и `Topic index`.

Не начинайте с выбора AI-инструмента. В логике Oper8 первый вопрос: какой процесс должен научиться, за счет каких сигналов и кто будет владельцем этого learning loop.

### Battle route

1. Выберите 3-5 процессов-кандидатов.
2. Прогоните каждый через три барьера: измеримый результат, стартовые данные, способность организации действовать по новому процессу.
3. Для лучшего кандидата сделайте Deploy vs Reshape diagnosis: изменятся ли роли, появятся ли новые данные, сможет ли AI вести маршрут без человека-посредника на каждом шаге.
4. Запишите 20 текущих решений в процессе: вход, варианты, решение, почему, уверенность, результат через N дней.
5. Соберите минимальную базу знаний: факты, правила, примеры.
6. Запустите AI в Shadow или A1/A2 режиме, без немедленной автономии.
7. Напишите 20 тест-кейсов: 10 типовых, 10 сложных или безопасностных.
8. Заведите 3 метрики и для каждой countermetric.
9. Повышайте автономию только через Shadow -> Canary -> Gradual -> Full.
10. Если качество падает, откатывайте сегмент, фиксируйте причину и назначайте дату повторной попытки.

### Training route

1. Core thesis: четыре сдвига и почему Deploy дает потолок.
2. Flywheel model: быстрый клиентский цикл и медленный process-learning cycle.
3. Knowledge layer: факты, правила, примеры, maintenance cadence.
4. Autonomy layer: A1-A5, красные линии, ограничители, рекомендации.
5. Memory layer: decision log and feedback loop.
6. Quality layer: tests, versioning, rollback.
7. Metrics layer: metric + countermetric pair.
8. Scale layer: frozen middle, AI literacy, roles, transition maps.
9. Start layer: one-week launch checklist and three-month review.

## Glossary

| Термин | Рабочее значение в Oper8 | Source |
|---|---|---|
| Deploy | Добавить AI к старому процессу: те же роли, те же данные, тот же маршрут, только быстрее | `SRC#page-11` to `SRC#page-14` |
| Reshape | Перестроить процесс вокруг возможностей AI: новые роли, новые данные, агент ведет часть маршрута | `SRC#page-13` to `SRC#page-14` |
| Процесс, который учится | Процесс, где каждый прогон создает сигнал, а сигнал делает следующий прогон точнее | `SRC#page-14` to `SRC#page-16` |
| Маховик данных | Сцепка быстрого и медленного циклов: сигналы -> правила -> следующий контакт точнее | `SRC#page-16`, `SRC#page-25` |
| Быстрый цикл | Контакт с конкретным клиентом меняет следующий контакт с ним | `SRC#page-15` |
| Медленный цикл | Набор клиентских сигналов превращается владельцем процесса в правила для всех | `SRC#page-15` to `SRC#page-16` |
| База знаний | Контекст для агента: факты, правила и примеры | `SRC#page-24` to `SRC#page-28` |
| Живые регламенты | Правила, которые обновляются и применяются на основе реальных сигналов, а не лежат архивом | `SRC#page-18` |
| Лестница автономии | Уровни A1-A5: от ассистента до полной автономии | `SRC#page-28` to `SRC#page-29` |
| Красные линии | Действия, которые агент не делает никогда | `SRC#page-29` |
| Ограничители | Условные границы автономии: бюджет, скидка, тип клиента, уведомление владельца | `SRC#page-30` |
| Рекомендации | Необязательные, но обычно лучшие правила поведения агента | `SRC#page-30` |
| Shadow | Агент работает параллельно, но результат не виден пользователю и не применяется | `SRC#page-30` to `SRC#page-31` |
| Canary | 5-10% потока на новом уровне автономии для ранней проверки риска | `SRC#page-30` to `SRC#page-31` |
| Decision log | Память решений: вход, варианты, решение, обоснование, уверенность, результат | `SRC#page-33` to `SRC#page-35` |
| Countermetric | Противовес метрике, который защищает от самообмана оптимизации | `SRC#page-39` to `SRC#page-40` |
| Frozen middle | Средний менеджмент, который рационально тормозит изменения из-за угрозы контролю и роли | `SRC#page-43` to `SRC#page-45` |
| Владелец процесса | Человек, который управляет маховиком: метрики, база знаний, правила, тесты, автономия | `SRC#page-17`, `SRC#page-49` |
| Карта перехода | Одностраничный ответ сотруднику: что заберет агент, что останется, чему учиться и сколько займет переход | `SRC#page-50` to `SRC#page-51` |

## Быстрая карта

| Ситуация | Route | Что делать | Инструменты |
|---|---|---|---|
| AI-пилоты есть, окупаемости нет | Diagnose Deploy trap | Проверить роли, данные, маршрут | Deploy vs Reshape test |
| Непонятно, какой процесс менять первым | Candidate filter | Оценить 3-5 процессов через три барьера | Process candidate scorecard |
| Есть процесс, но AI не знает внутренние правила | Build knowledge base | Собрать факты, правила, примеры | Three-layer knowledge base |
| Боитесь дать AI свободу | Stage autonomy | Разделить типы решений и назначить A1-A5 | Autonomy ladder, rule layers |
| AI принимает решения, но непонятно почему | Add memory | Писать decision log with outcome | Six-field decision log |
| Качество упало после обновления | Add QA gate | Сделать тесты и версионирование правил | Test cards, version table, rollback |
| Метрики зеленые, бизнес не верит | Pair metrics | Связать AI quality with business result and countermetric | Metric/countermetric board |
| Средний менеджмент тормозит | Unfreeze owner | Снять риск, дать кнопку stop и новую роль | Five frozen-middle levers |
| Люди прошли вебинар и вернулись к старому | Build literacy levels | Учить на реальном процессе с выделенным временем | Four AI literacy levels |
| Все держится на одном человеке | Define roles | Разделить владельца процесса, эксперта и разработчика | Role map |
| Нужно начать на этой неделе | Monday start | Один процесс, 20 решений, 20 тестов, 3 метрики | One-week start checklist |

## Tool selector

| Tool | Best for | Do not use when | Primary source layers |
|---|---|---|---|
| Four shifts map | Объяснить, зачем вообще менять процесс, а не просто купить AI | Команда уже согласовала Reshape and needs rollout details | `SRC#page-8` to `SRC#page-11` |
| Deploy vs Reshape test | Проверить, не является ли AI-проект ускорением старого процесса | Процесс нечастый, low-value, and Deploy is enough | `SRC#page-11` to `SRC#page-14` |
| Three-barrier candidate filter | Выбрать первый процесс | Уже есть owner-approved process with metrics and data | `SRC#page-19` to `SRC#page-22` |
| Fast/slow cycle model | Спроектировать learning loop | Нужна только разовая автоматизация без накопления знания | `SRC#page-15` to `SRC#page-16` |
| Five-gear flywheel | Проверить комплектность AI-процесса | Процесс еще не прошел candidate filter | `SRC#page-24` to `SRC#page-41` |
| Three-layer knowledge base | Собрать минимальный контекст для агента | Нет владельца, который будет обслуживать знания | `SRC#page-26` to `SRC#page-28` |
| Autonomy ladder A1-A5 | Решить, что AI делает сам, а что только предлагает | Красные линии and metrics еще не определены | `SRC#page-28` to `SRC#page-31` |
| Rule layers | Сделать границы AI конкретными | Команда формулирует generic "не навреди" без кейсов | `SRC#page-29` to `SRC#page-32` |
| Shadow/Canary/Gradual/Full | Повышать автономию безопасно | Нет тестов, метрик или rollback path | `SRC#page-30` to `SRC#page-31` |
| Six-field decision log | Создать память процесса | Результат решения невозможно наблюдать даже вручную | `SRC#page-33` to `SRC#page-35` |
| Test cards and versioning | Не ломать качество при изменениях базы/правил | Команда не готова останавливать rollout при failed tests | `SRC#page-36` to `SRC#page-38` |
| Metric/countermetric board | Доказать business effect and avoid metric theater | Метрика не связана с управленческим решением | `SRC#page-38` to `SRC#page-41` |
| Five levers for frozen middle | Перевести сопротивление менеджера в ownership | Руководство хочет давить угрозами вместо снятия риска | `SRC#page-43` to `SRC#page-45` |
| Four AI literacy levels | Обучать разные роли по-разному | Нужен только вводный awareness workshop | `SRC#page-46` to `SRC#page-48` |
| Transition map | Снять тревогу сотрудников о роли | Компания не готова говорить честно, что изменится | `SRC#page-50` to `SRC#page-51` |
| Monday start checklist | Запустить первую неделю без большой программы | Процесс high-risk and mistakes are catastrophic | `SRC#page-53` to `SRC#page-55` |

## Лайфхаки, приемы и инструменты к внедрению

### 1. Диагностируйте Deploy trap до покупки инструмента

- Что внедрить: трехвопросную проверку: изменилась ли роль человека, появились ли новые данные, может ли AI вести маршрут без человека-посредника.
- Пример из документа: в варианте "умной CRM" Лена получает подсказки, но все равно пишет клиенту по старой логике; процесс ускорен, но отношения и знания не перестроены.
- Когда применять: перед масштабированием пилота, который показывает efficiency, но не показывает new value.
- Первый шаг: откройте описание роли через 6 месяцев после внедрения. Если оно не изменилось, скорее всего это Deploy.
- Источник / где искать в книге: `SRC#page-11` to `SRC#page-14`.

### 2. Выбирайте процесс через три барьера

- Что внедрить: scorecard для 3-5 процессов: измеримый результат, стартовые данные, способность организации действовать.
- Пример из документа: "ФудПро" отвергает складскую логистику как low-impact Deploy, отвергает маршруты доставки из-за слабой actionability, выбирает клиентскую работу из-за выручки, данных и готового операционного действия.
- Когда применять: когда есть список "куда бы прикрутить AI".
- Первый шаг: для каждого кандидата напишите одну measurable business metric and one possible action.
- Источник / где искать в книге: `SRC#page-19` to `SRC#page-21`.

### 3. Запускайте не "AI", а процесс, который учится

- Что внедрить: формулу процесса: контакт -> сигнал -> правило -> следующий контакт точнее.
- Пример из документа: агент понимает, что шефу "Тополя" лучше предложить образцы перед сменой меню, потому что текстовое предложение новинки ранее не сработало.
- Когда применять: когда команда говорит "автоматизируем процесс", но не видит, где процесс станет умнее.
- Первый шаг: назовите один сигнал, который после каждого решения будет менять следующее решение.
- Источник / где искать в книге: `SRC#page-14` to `SRC#page-16`.

### 4. Собирайте базу знаний в три слоя, а не одним регламентом

- Что внедрить: разделить знания на facts, rules, examples.
- Пример из документа: "ФудПро" быстро выгружает факты из CRM, записывает 15 ключевых правил с лучшими менеджерами и собирает 30 примеров, а затем дополняет базу сигналами из мягкого запуска.
- Когда применять: когда команда хочет "сначала описать все правила" и откладывает запуск на месяцы.
- Первый шаг: за неделю соберите минимальный набор: 20 facts, 15 rules, 30 examples.
- Источник / где искать в книге: `SRC#page-26` to `SRC#page-28`.

### 5. Начинайте автономию с типа решения, а не со всего процесса

- Что внедрить: назначать уровень A1-A5 отдельно для разных decision types.
- Пример из документа: в одном процессе "ФудПро" напоминания о заказе работают на A4, скидки остаются на A2, жалобы на качество остаются на A1.
- Когда применять: когда спор идет между "AI ничего не делает сам" и "пусть полностью автономен".
- Первый шаг: выпишите 5 типовых решений процесса и напротив каждого поставьте текущий target level.
- Источник / где искать в книге: `SRC#page-28` to `SRC#page-29`.

### 6. Замените "не навреди" на три слоя правил

- Что внедрить: красные линии, ограничители и рекомендации.
- Пример из документа: жалоба на качество сразу идет человеку; скидка выше порога требует согласования; перед сезонным меню клиенту лучше писать заранее.
- Когда применять: когда границы агента сформулированы абстрактно.
- Первый шаг: напишите 5-7 красных линий и 5 ограничителей для первого потока.
- Источник / где искать в книге: `SRC#page-29` to `SRC#page-32`.

### 7. Повышайте автономию через Shadow, Canary, Gradual, Full

- Что внедрить: rollout protocol с stop signals.
- Пример из документа: "ФудПро" сначала сравнивает параллельные решения агента с человеком, затем переводит 30 клиентов, затем расширяет до 100, 200 и 400.
- Когда применять: перед переходом A2 -> A3, A3 -> A4 или при запуске нового сегмента.
- Первый шаг: запустите Shadow на 2 недели и посчитайте совпадения, улучшения и ошибки.
- Источник / где искать в книге: `SRC#page-30` to `SRC#page-31`.

### 8. Сделайте откат штатной операцией

- Что внедрить: rollback rule: откатывать сегмент, фиксировать причину, назначать дату повторной попытки.
- Пример из документа: крупные клиенты после повышения автономии получают слишком стандартные предложения; "ФудПро" откатывает именно этот сегмент, дополняет базу и пробует снова.
- Когда применять: когда метрики просели после повышения автономии или обновления правил.
- Первый шаг: в каждом rollout plan заранее напишите rollback segment, rollback trigger and retest date.
- Источник / где искать в книге: `SRC#page-31` to `SRC#page-32`.

### 9. Ведите decision log из шести полей

- Что внедрить: запись каждого решения: вход, альтернативы, решение, обоснование, уверенность, результат.
- Пример из документа: агент предлагает новинки шефу, потому что клиент не заказывал 14 дней и лучше реагирует на продукт, чем на цену; через 3 дня результат связывается с заказом.
- Когда применять: с первого дня пилота, даже до полноценного агента.
- Первый шаг: заведите таблицу и заполните 20 решений вручную.
- Источник / где искать в книге: `SRC#page-33` to `SRC#page-35`.

### 10. Превращайте лучшие и худшие решения в examples

- Что внедрить: maturity level "log + examples": отбирать удачные решения, правильные non-actions and ошибки с разбором.
- Пример из документа: "ФудПро" через 3 месяца отбирает 120 examples из лога, и качество растет без изменения правил.
- Когда применять: когда лога уже достаточно, но правила слишком общие.
- Первый шаг: каждую неделю выбирайте 10 записей: 3 удачных, 3 ошибок, 3 спорных, 1 non-action.
- Источник / где искать в книге: `SRC#page-34` to `SRC#page-35`.

### 11. Пишите тесты до обновления базы знаний

- Что внедрить: набор test cards для типовых, сложных и safety cases.
- Пример из документа: новое правило про сезонные позиции ломает клиентов-консерваторов; тест "Березка" должен был поймать регрессию до rollout.
- Когда применять: перед каждым изменением базы знаний, правил или tone policy.
- Первый шаг: за день напишите 20 карточек: 10 typical, 5 difficult, 5 red-line tests.
- Источник / где искать в книге: `SRC#page-36` to `SRC#page-38`.

### 12. Версионируйте базу знаний и правила

- Что внедрить: version table: что изменилось, точность, безопасность, регрессия, решение.
- Пример из документа: версия с новым tone улучшает часть коммуникаций, но ломает старые кейсы; ее можно откатить только если есть версия.
- Когда применять: когда агент работает на реальном потоке, а правила меняются чаще раза в месяц.
- Первый шаг: каждому изменению присвойте версию и прогоните полный тестовый набор.
- Источник / где искать в книге: `SRC#page-37`.

### 13. Для каждой метрики ставьте countermetric

- Что внедрить: paired metrics board: metric, what it optimizes, countermetric, stop signal.
- Пример из документа: средний чек может расти за счет выжимания клиентов, а доля вмешательств может падать из-за недоэскалации сложных случаев.
- Когда применять: когда dashboard выглядит зеленым, но нет уверенности, что процесс стал лучше.
- Первый шаг: выберите 3 базовых метрики и для каждой напишите "чем она может навредить".
- Источник / где искать в книге: `SRC#page-38` to `SRC#page-40`.

### 14. Размораживайте middle management через снятие риска

- Что внедрить: пакет гарантий: не засчитывать падение в эксперименте, человек принимает финальное решение, кнопка stop у владельца, ошибка агента разбирается как проблема системы.
- Пример из документа: Игорь тормозит складской AI-процесс, пока не получает защищенный эксперимент и роль автора изменений.
- Когда применять: когда менеджер формально поддерживает AI, но бесконечно откладывает запуск.
- Первый шаг: спросите не "почему сопротивляешься", а "какой риск ты несешь, если агент ошибется".
- Источник / где искать в книге: `SRC#page-43` to `SRC#page-45`.

### 15. Учите людей на четырех уровнях грамотности

- Что внедрить: program by level: understand, use, design, see system.
- Пример из документа: общий вебинар дает 5% устойчивого применения, а обучение на реальных кейсах с выделенными 4 часами в неделю создает практику.
- Когда применять: перед rollout в отделе или при появлении новых ролей.
- Первый шаг: распределите людей по уровням и выделите protected learning time.
- Источник / где искать в книге: `SRC#page-46` to `SRC#page-48`.

### 16. Делайте карту перехода для каждой меняющейся роли

- Что внедрить: one-page transition map: что делаю сейчас, что заберет агент, что останется за мной, чему учиться, сколько времени на переход.
- Пример из документа: менеджер по продажам перестает вести рутину вручную и переходит к сложным случаям, обратной связи агенту и новым клиентам.
- Когда применять: когда сотрудники спрашивают "что будет со мной".
- Первый шаг: напишите карту для одной роли до объявления rollout.
- Источник / где искать в книге: `SRC#page-50` to `SRC#page-51`.

### 17. Начните с понедельничной недели

- Что внедрить: one-week starter package: один процесс, 20 решений, 20 тестов, 3 метрики.
- Пример из документа: "ФудПро" сначала фиксирует решения и базовые метрики, а не ждет идеальной системы.
- Когда применять: когда есть согласие на старт, но команда откладывает до "нормальных данных".
- Первый шаг: к пятнице получите process choice, decision table, test cards and metric page.
- Источник / где искать в книге: `SRC#page-53` to `SRC#page-55`.

## Deep reference body

### 1. Главная модель: не AI-пилот, а learning process

Oper8 строится вокруг различия между ускорением старого процесса и перестройкой процесса так, чтобы он учился. AI сам по себе не является защитой, преимуществом или окупаемостью. Преимущество появляется, когда каждый контакт и каждое решение становятся обучающим сигналом, а процесс меняет следующее действие.

Практическая формула:

1. Decision happens.
2. System records context, alternatives, decision and reason.
3. Outcome appears after time delay.
4. Owner converts patterns into rule/example/metric changes.
5. Agent acts better in the next round.

Не считать процесс learning process, если:

- записи копятся, но результат не связывается с решением;
- AI дает подсказки, но роли, данные и маршрут не меняются;
- база знаний не обновляется из реальных ошибок;
- метрики показывают activity, not business effect;
- никто не владеет rules, tests and autonomy.

Source: `SRC#page-14` to `SRC#page-16`.

### 2. Четыре сдвига, которые делает возможным AI

| Shift | Практический смысл | Что проверить |
|---|---|---|
| Один клиент | Компания перестает работать только сегментами и может вести контекст конкретного клиента | Есть ли customer-level memory and rules |
| Каждый контакт учит | Удачные и неудачные ходы становятся сигналами для следующих решений | Есть ли outcome feedback after contact |
| Сервис как защита | Защита создается не платформой, а накопленными мелкими решениями | Есть ли knowledge compounding over months |
| Мгновенность | Ответ за секунды создает новые точки контакта | Может ли агент отвечать без линейного роста нагрузки людей |

Source: `SRC#page-8` to `SRC#page-11`.

### 3. Deploy vs Reshape

| Dimension | Deploy | Reshape |
|---|---|---|
| Роли | Человек делает то же самое быстрее | Человек проектирует правила, исключения, метрики and boundaries |
| Данные | Старые записи используются эффективнее | Появляется лог решений, причины, outcomes, examples |
| Маршрут | Человек остается обязательным посредником | Агент ведет рутину, человек подключается в сложных случаях |
| Value ceiling | +10-20% efficiency | Новый operating model and compounding knowledge |
| Risk | Metric theater and pilots without ROI | Organizational change, role redesign, governance load |

Decision rule: если 2 из 3 tests positive - роли меняются, данные появляются, маршрут ведет AI - это Reshape candidate. Если 0-1 positive, Deploy может быть честным и достаточным вариантом.

Source: `SRC#page-11` to `SRC#page-14`, `SRC#page-21`.

### 4. Процесс-кандидат: три барьера

Перед пилотом процесс должен пройти три вопроса:

| Barrier | Passing sign | Failing sign |
|---|---|---|
| Measurable result | Есть конкретная метрика: retention, average check, cost per operation, response time with quality | "Станет эффективнее" без числа |
| Starting data | Есть CRM, history, logs, decisions, cases, even if imperfect | Данных нет and no realistic source |
| Actionability | Есть человек/агент/операционный путь, который может действовать по рекомендации | Рекомендация остается на слайде или игнорируется исполнителем |

Выбирайте процесс средней сложности с заметным результатом: не самый простой low-impact процесс и не десять процессов одновременно.

Source: `SRC#page-19` to `SRC#page-22`.

### 5. Маховик данных: два цикла, пять шестеренок

Visual model from source:

- Fast cycle: клиент -> память -> решение в рамках правил -> клиент; time scale: seconds.
- Slow cycle: решение -> проверка качества -> метрики -> база знаний -> решение; time scale: days.
- Autonomy layer A1-A5 controls whether human or agent decides.
- Rule layer constrains decisions: red lines, limiters, recommendations.

Five gears:

| Gear | Если убрать | Что должно существовать |
|---|---|---|
| База знаний | Агент уверенно ошибается без контекста | Facts, rules, examples |
| Автономия | Агент либо опасен, либо бесполезен | A-levels by decision type, red lines, limiters |
| Память | Контакты не учат следующий контакт | Decision log and outcome matching |
| Проверка качества | Регрессия видна только через жалобы | Test suite, versioning, rollback |
| Метрики | Непонятно, стал ли процесс полезен бизнесу | Metrics with countermetrics |

Source: `SRC#page-24` to `SRC#page-25`, `SRC#page-41`.

### 6. База знаний: facts, rules, examples

| Layer | Что хранит | Cadence | Failure mode |
|---|---|---|---|
| Facts | Каталог, условия доставки, типы клиентов, поставщики | Quarterly or on source change | Агент предлагает несуществующее или устаревшее |
| Rules | Как действовать в типовых ситуациях | Monthly or after pattern | Правила не отражают реальную практику |
| Examples | Реальные случаи with why and outcome | Continuous from decisions | Агент не видит нюансы and edge cases |

Minimum viable build:

1. Extract facts from existing systems in 1-2 days.
2. Interview best experts for first rules in 1 week.
3. Start soft mode where every correction becomes signal.
4. Convert repeated corrections into rules/examples.
5. Review facts quarterly, rules monthly, examples continuously with dates.

Anti-pattern: "опишем все до запуска". Большая инструкция устаревает до того, как начинает работать.

Source: `SRC#page-26` to `SRC#page-28`.

### 7. Автономия: A1-A5

| Level | AI делает | Человек делает | Use when |
|---|---|---|---|
| A1 - Ассистент | Предлагает варианты | Решает сам | Новый поток, мало данных, high-risk cases |
| A2 - Советник | Готовит решение with reason | Утверждает каждое | Есть база знаний, но нужна ручная проверка |
| A3 - Ко-пилот | Выполняет стандартные задачи | Проверяет пакетно, разбирает исключения | Standard tasks pass tests |
| A4 - Автопилот с надзором | Действует сам в штатных ситуациях | Мониторит metrics and anomalies | Stable flow, good tests, clear stop signals |
| A5 - Полная автономия | Действует сам, включая нестандартные | Проектирует rules and boundaries | Horizon, not first-year default |

Autonomy is scoped. Не назначайте A4 всему процессу. Назначайте A4 на "standard reminder", A2 на "discount offer", A1 на "quality complaint".

Source: `SRC#page-28` to `SRC#page-29`.

### 8. Rule layers for autonomy

| Layer | Definition | Example type | Governance |
|---|---|---|---|
| Красные линии | Никогда не делает агент | Quality complaint, contract terms, unavailable stock | Incident if crossed |
| Ограничители | Условные границы by level/segment/budget | Discount threshold, sample budget, anomaly notification | Reviewed before autonomy change |
| Рекомендации | Usually better behavior | Contact timing, tone, offer type | Updated monthly from examples |

Rule doc should be compact and versioned. If it does not change for 3 months while the agent works daily, assume drift risk.

Source: `SRC#page-29` to `SRC#page-32`.

### 9. Safe autonomy rollout

| Stage | Что происходит | Typical duration | Stop signal |
|---|---|---|---|
| Shadow | Агент решает параллельно, результат не применяется | 2 weeks | Match with human below threshold |
| Canary | 5-10% flow on new level | 2 weeks | Canary metrics worse than control |
| Gradual | 10% -> 25% -> 50% -> 100% | 4-8 weeks | Any metric out of normal range |
| Full | 100% flow with reinforced monitoring | 2 weeks | Daily summary anomaly |

Rollback rules:

1. Roll back segment, not whole process.
2. Write exact reason.
3. Set review date.

Source: `SRC#page-30` to `SRC#page-32`.

### 10. Memory: six-field decision log

| Field | Что фиксировать | Почему важно |
|---|---|---|
| Вход | Data available at decision time | Reproduce context |
| Альтернативы | Options considered | Understand if decision was obvious |
| Решение | What AI chose | Establish fact |
| Обоснование | Why this option | Diagnose errors |
| Уверенность | High/low and why | Route low-confidence to human review |
| Результат | What happened after N days | Close feedback loop |

Maturity levels:

| Level | Data volume | Gives | When |
|---|---|---|---|
| Log | 0-1 000 decisions | Audit and "why" answers | Day 1 |
| Log + examples | 1 000-10 000 decisions | Quality growth through examples | Month 2-3 |
| Log + examples + model fine-tuning | 10 000+ decisions | Maximum precision | Horizon, not first-year default |

Key warning: log without result field is archive, not learning.

Source: `SRC#page-33` to `SRC#page-35`.

### 11. Quality: tests and versioning

Test suite types:

| Type | Checks | Example |
|---|---|---|
| Accuracy | Agent chooses right action | For client type X, offer product sample instead of discount |
| Safety | Agent respects red lines | Quality complaint must go to human |
| Regression | Old good behavior still works | Conservative customer does not get aggressive novelty offer |

Versioning table:

| Version | Changed | Accuracy | Safety | Regression | Decision |
|---|---|---|---|---|---|
| vNext | Rule/database/tone change | % | % | % | ship, ship with monitoring, block, rollback |

Two common failures:

- "Launch first, check later": first signal becomes client complaint.
- Metric theater: reports exist but no automatic alert below threshold.

Source: `SRC#page-36` to `SRC#page-38`.

### 12. Metrics and countermetrics

| Metric | Measures | Countermetric | Management question |
|---|---|---|---|
| Доля вмешательств | Process maturity | Quality without human involvement | Can autonomy increase safely? |
| Частота повторных заказов | Retention | Average check without discount abuse | Are customers staying for value? |
| Средний чек | Revenue per customer | Order frequency and churn | Are we growing or squeezing? |
| Ширина корзины | Adoption of new offers | Returns/refusals | Are recommendations useful? |

Rule: metric without countermetric lies. Every optimization needs a paired guard.

Source: `SRC#page-38` to `SRC#page-41`.

### 13. Scaling: frozen middle

Middle managers may block AI rationally because AI threatens:

- their information monopoly;
- their control over work distribution;
- their quality control through personal presence;
- their role identity.

Five levers:

1. New role: from people manager to process owner with budget and metrics.
2. Incentives: evaluate automated decisions, error reduction and metric dynamics, not headcount.
3. Responsibility for change: "you automate your process".
4. Quick win in manager's zone.
5. Training with protected time.

Avoid aggressive pressure. The knowledge of resisting managers is often exactly the knowledge needed for the base and rules.

Source: `SRC#page-43` to `SRC#page-45`.

### 14. AI literacy levels

| Level | Who | Output | Format |
|---|---|---|---|
| Понимаю | Everyone | Sees possibilities and limits, not afraid | Workshop 4+ hours with real tasks |
| Работаю | Agent users | Works with agent and gives concrete feedback | 4 h/week for 4 weeks |
| Проектирую | Process owners | Writes rules, tests, reads metrics | Real process project, 2-3 months |
| Вижу систему | Those grown by practice | Selects processes and designs flywheels | Real projects, 6-12 months |

Training rule: 20% theory, 80% practice on real work. "Learn in your free time" is functionally a no-op for operations employees.

Source: `SRC#page-46` to `SRC#page-48`.

### 15. Roles

| Role | Owns | Does not own |
|---|---|---|
| Владелец процесса | Metrics, autonomy decisions, knowledge base quality, rules, tests | Model engineering itself |
| Эксперт | Domain examples, discrepancy review, rule corrections | Whole flywheel strategy |
| Разработчик | Data access, agent architecture, integration, rollback mechanics | Business decision about process behavior |

Transition map questions:

1. What do I do today?
2. What will the agent take?
3. What remains mine?
4. What must I learn?
5. How long does transition take?

Source: `SRC#page-49` to `SRC#page-51`.

## Coverage map

| Source pages | Covered toolkit sections | Notes |
|---|---|---|
| `SRC#page-5` to `SRC#page-6` | Extraction report, source identity, navigator-derived quick map | Author/title taken from cover and author page |
| `SRC#page-8` to `SRC#page-11` | Four shifts, one-client logic, service as defense | FoodPro example paraphrased, not quoted |
| `SRC#page-11` to `SRC#page-14` | Deploy vs Reshape, 80/80 paradox, three tests | External stats treated as source claims |
| `SRC#page-15` to `SRC#page-16` | Fast/slow cycles, flywheel model | Core model |
| `SRC#page-17` to `SRC#page-19` | Process owner, living regulations, people transition | Used in roles and knowledge sections |
| `SRC#page-19` to `SRC#page-22` | Candidate choice, three barriers, depth choice, two traps | Used in Battle route and process filter |
| `SRC#page-24` to `SRC#page-28` | Five gears, knowledge base layers, dead KB | Used in deep reference and action cards |
| `SRC#page-28` to `SRC#page-32` | Autonomy ladder, rules, safe rollout, rollback | Used in tool selector and cheatsheet |
| `SRC#page-33` to `SRC#page-35` | Memory, six-field log, maturity levels | Used in memory and Monday start |
| `SRC#page-36` to `SRC#page-38` | Tests, versioning, QA errors | Used in QA section |
| `SRC#page-38` to `SRC#page-41` | Metrics, countermetrics, loop closure | Page 41 figure added as visual note |
| `SRC#page-43` to `SRC#page-45` | Frozen middle and five levers | Used in scale scenarios |
| `SRC#page-46` to `SRC#page-48` | AI literacy | Used in training route and roles |
| `SRC#page-49` to `SRC#page-51` | Roles and transition map | Used in organization layer |
| `SRC#page-53` to `SRC#page-56` | Monday steps and next skills | Used in startup checklist |

## Excluded / limited source notes

- Не включены длинные фрагменты FoodPro narrative. Toolkit использует этот кейс как source-specific mini-scene, но не пересказывает полностью.
- Внешние claims про BCG, McKinsey, Klarna не проверялись веб-поиском; они оставлены как claims внутри PDF.
- Технические детали реализации RAG, embeddings, MCP, orchestration and agent architecture в документе перечислены как future skills, но не раскрыты достаточно для implementation guide. Toolkit не дополняет их внешней архитектурой.
- `A5 - полная автономия` отмечена как horizon, а не default recommendation; в источнике она также не является стартовым уровнем.
- Это v0.8 compact guide. Для production rollout нужны security, legal, privacy, data quality, procurement and incident response decisions вне рамки книги.

## Anti-patterns

| Anti-pattern | Как выглядит | Почему опасно | Что делать вместо |
|---|---|---|---|
| Deploy theater | AI-подсказки поверх старого процесса | ROI ceiling and no compounding knowledge | Reshape test |
| Process chosen for demo | Берут самый простой или модный процесс | Малый business effect | Three-barrier filter |
| Describe everything before launch | 3 месяца пишут регламент | Knowledge stale before use | Minimal base + soft mode |
| Dead knowledge base | Facts/rules не обновляются месяцами | Agent confidently wrong | Maintenance cadence |
| Whole-process autonomy | Один A-level на все решения | Either risky or useless | A-level by decision type |
| Generic boundaries | "Не навреди" вместо red lines | No enforceable governance | Red lines, limiters, recommendations |
| Big-bang rollout | 400 клиентов сразу | No isolation of failure | Shadow/Canary/Gradual |
| Rollback shame | Откат считают провалом | Teams avoid experiments | Segment rollback with retest date |
| Log without outcome | Записи есть, результата нет | No learning loop | Outcome matching |
| QA after launch | Тесты появляются после жалоб | Regressions hit clients | Test cards before changes |
| Metric without countermetric | Dashboard green, customer value down | Optimization self-deception | Metric/countermetric pairs |
| Frozen middle pressure | "Меняйся или уходи" | Lose tacit knowledge and trust | Remove risk, create owner role |
| One-time AI training | Вебинар, курс в свободное время | Skill decays or never forms | Protected practice on real work |
| Role blur | Все держится на Лене | Vacation or burnout stops flywheel | Process owner, expert, developer |

## Практические сценарии

### Сценарий 1. Вы уже купили AI-платформу, но эффекта нет

1. Run Deploy vs Reshape test.
2. Check whether current AI creates new data.
3. Pick one process where route can change.
4. Start decision log before changing tooling.
5. Reframe platform as component, not transformation.

### Сценарий 2. Нужно выбрать первый AI-process

1. List 3-5 candidates.
2. Score each by result, data, actionability.
3. Reject catastrophic-error process for first run.
4. Choose medium-complexity high-value process.
5. Write three-month target metric and countermetric.

### Сценарий 3. Agent hallucinates or ignores company rules

1. Do not raise model complexity first.
2. Inspect knowledge base layers.
3. Add missing facts/rules/examples.
4. Add test cards for the failure.
5. Re-run in A1/A2 before autonomy.

### Сценарий 4. Stakeholders fear autonomy

1. Split decisions by type.
2. Put risky types at A1/A2.
3. Put low-risk standard types into Shadow.
4. Define red lines and limiters.
5. Move only after metrics and tests pass.

### Сценарий 5. Quality dropped after a rule update

1. Stop rollout.
2. Compare version test results.
3. Identify broken segment and failure class.
4. Roll back segment or version.
5. Add regression tests from failure.

### Сценарий 6. Business asks for ROI

1. Separate agent quality metrics from business metrics.
2. Pick retention/revenue/cost metric tied to process.
3. Add countermetric.
4. Establish baseline.
5. Review after 3 months, not after a single demo.

### Сценарий 7. Middle manager blocks change

1. Identify what control/role/metric is threatened.
2. Protect existing performance score during experiment.
3. Give stop button to manager.
4. Start with small win in manager's own area.
5. Recast manager as process owner.

### Сценарий 8. Employees ask "what happens to me"

1. Do not answer with generic reassurance.
2. Write transition map for each affected role.
3. Name what agent takes and what stays human.
4. Fund training time and mentoring.
5. Evaluate transition through real work.

## Cheatsheet

### One-page readiness checklist

| Check | Pass condition |
|---|---|
| Process selected | One process, not portfolio |
| Measurable result | Baseline and 3-month target |
| Starting data | Existing records, logs, decisions or expert cases |
| Action path | Someone/something can act on recommendation |
| Owner | Named process owner |
| Knowledge base | Facts, rules, examples |
| Autonomy | A-levels by decision type |
| Rules | Red lines, limiters, recommendations |
| Memory | Six-field log with outcome |
| QA | Minimum 20 tests |
| Metrics | 3 metrics with countermetrics |
| Rollout | Shadow/Canary/Gradual/Full |
| Rollback | Segment rollback and retest date |

### Monday plan

| Day | Output |
|---|---|
| Monday | 3-5 process candidates |
| Tuesday | Candidate scorecard and first process |
| Wednesday | 20 decision records started |
| Thursday | 20 test cards drafted |
| Friday | 3 metrics with baseline, target and countermetric |

### Decision log template

| Field | Prompt |
|---|---|
| Input | What did AI/person know at decision time? |
| Alternatives | What options existed? |
| Decision | What was chosen? |
| Reason | Why this option? |
| Confidence | High/medium/low and why? |
| Outcome | What happened after N days? |

### Metric pair template

| Metric | Target | Countermetric | Stop signal |
|---|---|---|---|
| Intervention share | Down safely | Quality without human | Quality drops |
| Repeat order frequency | Up | Average check without discount abuse | Retention bought by discounts |
| Average check | Up | Order frequency/churn | Customers leave |
| Basket width | Up | Returns/refusals | Agent pushes irrelevant items |

### Rollout stop rules

- Shadow match below threshold: do not start Canary.
- Canary worse than control: pause, inspect segment.
- Any red-line breach: incident, rollback affected decision type.
- Quality regression: block version.
- Business metric improves but countermetric worsens: stop optimization.

## Topic index

| Topic | Where in toolkit | Source |
|---|---|---|
| A1-A5 autonomy | Deep reference 7, Tool selector, Action cards 5-8 | `SRC#page-28` to `SRC#page-29` |
| Base knowledge | Deep reference 6, Action card 4 | `SRC#page-26` to `SRC#page-28` |
| Canary rollout | Deep reference 9 | `SRC#page-30` to `SRC#page-31` |
| Countermetrics | Deep reference 12, Action card 13 | `SRC#page-39` to `SRC#page-40` |
| Decision log | Deep reference 10, Cheatsheet | `SRC#page-33` to `SRC#page-35` |
| Deploy trap | Deep reference 3, Action card 1 | `SRC#page-11` to `SRC#page-14` |
| Examples layer | Deep reference 6, Action card 10 | `SRC#page-26` to `SRC#page-28`, `SRC#page-34` |
| Five gears | Deep reference 5 | `SRC#page-24` to `SRC#page-41` |
| Four AI literacy levels | Deep reference 14 | `SRC#page-46` to `SRC#page-48` |
| Four shifts | Deep reference 2 | `SRC#page-8` to `SRC#page-11` |
| Frozen middle | Deep reference 13, Scenario 7 | `SRC#page-43` to `SRC#page-45` |
| Living regulations | Glossary, Deep reference 6 | `SRC#page-18` |
| Metrics | Deep reference 12, Cheatsheet | `SRC#page-38` to `SRC#page-41` |
| Monday start | Action card 17, Cheatsheet | `SRC#page-53` to `SRC#page-55` |
| Process candidate | Deep reference 4, Scenario 2 | `SRC#page-19` to `SRC#page-22` |
| Process owner | Deep reference 15 | `SRC#page-17`, `SRC#page-49` |
| Quality tests | Deep reference 11, Action card 11 | `SRC#page-36` to `SRC#page-38` |
| Reshape | Deep reference 3 | `SRC#page-13` to `SRC#page-14` |
| Rollback | Deep reference 9, Action card 8 | `SRC#page-31` to `SRC#page-32` |
| Rule layers | Deep reference 8 | `SRC#page-29` to `SRC#page-32` |
| Shadow | Deep reference 9 | `SRC#page-30` |
| Transition map | Deep reference 15, Action card 16 | `SRC#page-50` to `SRC#page-51` |
| Versioning | Deep reference 11, Action card 12 | `SRC#page-37` |

## Scope and limits

- Toolkit covers process design and operating governance for AI-processes that learn from repeated work. It is not an engineering implementation manual for RAG, embeddings, MCP, agent orchestration or production infrastructure.
- The FoodPro story is the document's primary running example. Transfer to other domains requires changing process metrics, red lines and examples.
- First process should avoid catastrophic-error domains. If errors are not reversible, run a separate risk, legal, security and operational review before autonomy.
- All external market/statistics claims are source claims from the PDF, not independently verified in this task.
- Use this toolkit to design a pilot and owner workflow, not to bypass privacy, security, legal, data quality or customer consent decisions.
