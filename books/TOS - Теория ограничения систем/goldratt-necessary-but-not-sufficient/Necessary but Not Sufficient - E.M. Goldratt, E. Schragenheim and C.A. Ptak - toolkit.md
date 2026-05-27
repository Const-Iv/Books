# Necessary but Not Sufficient - E.M. Goldratt, E. Schragenheim and C.A. Ptak - практический toolkit

Статус: standalone toolkit по локально предоставленному PDF-источнику `Цель-3. Необходимо, но не достаточно`. Это не пересказ бизнес-романа: документ извлекает практический контур внедрения технологий, смены правил и метрик на базе TOC.

## Связь с charter проекта

Books должен превращать книгу в применимый toolkit. Для `Necessary but Not Sufficient` практический смысл в том, чтобы не внедрять ERP/IT как набор функций, а извлекать выгоду из технологии через снятие ограничения, изменение правил, изменение метрик и управляемое внедрение.

## Отчет извлечения

Источник:
- Structured Markdown source copy: [runtime/books/TOS - Теория ограничения систем/goldratt-necessary-but-not-sufficient/E.M. Goldratt, E. Schragenheim and C.A. Ptak - Necessary but Not Sufficient.md](<../../../runtime/books/TOS - Теория ограничения систем/goldratt-necessary-but-not-sufficient/E.M. Goldratt, E. Schragenheim and C.A. Ptak - Necessary but Not Sufficient.md>)
- Локальный PDF: `runtime/books/TOS - Теория ограничения систем/goldratt-necessary-but-not-sufficient/E.M. Goldratt, E. Schragenheim and C.A. Ptak - Necessary but Not Sufficient.pdf`
- Локальный extraction report: `runtime/books/TOS - Теория ограничения систем/goldratt-necessary-but-not-sufficient/extraction-report.json`
- Формат входа: `PDF`
- Извлечение: `pdftotext -layout`
- Язык источника: русский
- Язык результата: русский
- Объем: 245 страниц, примерно 62 935 слов
- Оглавление: явное TOC не найдено, но главы распознаются в тексте

Ограничение:
- PDF text layer читается нормально; OCR не потребовался.
- Line/page markers используются как navigation.

## Staged assembly / source layers

| Слой | Что извлечено | Где проверять |
|---|---|---|
| Core thesis | Технология необходима, но не достаточна; нужны новые правила | source copy, строки 5011-5038 |
| MRP/ERP lesson | Технология сняла старое ограничение, но старые правила сохранились | source copy, строки 5051-5129 |
| Local metrics problem | Локальная эффективность и старые показатели оживляют старое ограничение | source copy, строки 5148-5171, 8437-8488 |
| Implementation focus | Данные и внедрение должны служить constraint logic, а не completeness fetish | source copy, строки 5975-6039 |
| Distribution/replenishment | Pull replenishment, заводской буфер, снижение запасов и дефицита | source copy, строки 7120-7800 |
| Measurements | Throughput dollar-days / inventory dollar-days | source copy, строки 7890-7945, 9025-9044 |
| Sales/market shift | Продавать не функции ERP, а бизнес-результат и новые правила | source copy, строки 8406-8627 |

## Как пользоваться toolkit

Открой этот файл, когда:
- компания внедрила IT/ERP/automation, но бизнес-эффект слабее обещанного;
- команда спорит о features, а не о том, какое ограничение снимает технология;
- старые KPI заставляют людей использовать новую систему по-старому;
- supply chain имеет одновременно лишние запасы и дефицит;
- нужно упаковать технологический продукт как business-result offer.

Порядок:
1. Начни с `Battle route`.
2. Выбери инструмент в `Tool selector`.
3. Возьми action card, который соответствует твоей ситуации.
4. Проверь метрики по `Deep reference body`.
5. Не запускай rollout, пока не проверены old rules and measurements.

## Battle route

1. Назови технологию и ограничение, которое она должна ослабить.
2. Выпиши старые правила, которые появились из-за прежнего ограничения.
3. Проверь, остались ли эти правила после внедрения технологии.
4. Найди метрики, которые делают старое поведение рациональным.
5. Сформулируй новые правила работы.
6. Встрой в технологию только те функции, которые поддерживают новые правила.
7. Запусти минимальный модуль, который дает бизнес-эффект.
8. Измеряй результат через throughput, inventory, operating expense, dollar-days and service, а не через completion of installation.

## Training route

1. Разобрать тезис "necessary but not sufficient".
2. На примере MRP показать, почему быстрый расчет не дает эффекта без смены batch/release rules.
3. Разобрать old-rule audit.
4. Показать difference между data accuracy и decision usefulness.
5. Разобрать pull replenishment вместо push.
6. Ввести throughput dollar-days and inventory dollar-days.
7. Переписать sales pitch из feature pitch в result pitch.

## Быстрая карта

| Ситуация | Route | Инструменты |
|---|---|---|
| IT внедрено, эффекта мало | Technology -> old rules audit | Constraint-relief map |
| ERP используется как старый MRP | Old constraints remain in rules | Rule replacement table |
| Запасы растут и дефицит не исчезает | Push forecast -> pull replenishment | Plant buffer, daily replenishment |
| KPI стимулируют локальный оптимум | Local metrics -> global flow metrics | TDD/IDD |
| Клиент не покупает модуль | Feature value unclear | Business-result offer |
| Внедрение застряло на data cleanup | Perfect data fetish | Good-enough data for constraint |

## Tool selector

| Tool | Best for | Do not use when | Primary source layers |
|---|---|---|---|
| Constraint-relief map | Понять, зачем нужна технология | Технология уже не связана с бизнес-ограничением | `NBS` строки 5011-5038, 8406-8427 |
| Old-rule audit | Найти правила, пережившие старое ограничение | Нет owner'а процесса для проверки правил | `NBS` строки 5120-5171 |
| Measurement rewrite | Сменить KPI локального оптимума | Новые правила еще не сформулированы | `NBS` строки 7890-7945 |
| Pull replenishment design | Снизить запасы и дефицит | Demand truly one-off and not replenishable | `NBS` строки 7120-7800 |
| Good-enough data launch | Быстро запустить value module | Ошибка данных создает safety/legal risk | `NBS` строки 5975-6039 |
| Business-result offer | Продать ERP/IT через outcome | У продукта нет доказуемого impact path | `NBS` строки 8406-8627 |
| Rule-change training | Обучить клиента новым правилам | Клиент не согласовал business objective | `NBS` строки 8171-8173 |

## Лайфхаки, приемы и инструменты к внедрению

### 1. Делайте technology constraint statement

Что внедрить:
- Для любой технологии писать: "Эта технология ослабляет ограничение X, поэтому мы должны изменить правила Y".

Пример из книги:
- В книге ERP/technology сначала выглядит как главный ответ, но результат не появляется автоматически. Герои вынуждены сформулировать, какое бизнес-ограничение технология должна снять: запас, дефицит, скорость реакции, правила пополнения или поведение продаж. Technology constraint statement нужен, чтобы внедрение не стало самоцелью.

Когда применять:
- Перед покупкой, внедрением или продажей IT-системы.

Первый шаг:
- Заполнить три строки: old constraint, technology capability, obsolete rule.

Источник / где искать в книге:
- `runtime/books/TOS - Теория ограничения систем/goldratt-necessary-but-not-sufficient/E.M. Goldratt, E. Schragenheim and C.A. Ptak - Necessary but Not Sufficient.md`, строки 5011-5038.

### 2. Ищите старые правила, которые продолжают управлять новой системой

Что внедрить:
- Old-rule audit после каждого технологического изменения.

Пример из книги:
- Книга показывает, что новая система может работать внутри старых правил и поэтому не менять результат. Если люди продолжают планировать, закупать и оценивать себя по прежним KPI, technology только ускоряет старую ошибку. Rule audit ищет эти старые правила после внедрения.

Когда применять:
- Когда новая система есть, но люди продолжают вести себя как раньше.

Первый шаг:
- Выписать KPI, approvals, batch rules, release rules and local efficiency targets.

Источник / где искать в книге:
- Source copy, строки 5120-5171 и 8437-8488.

### 3. Не превращайте data cleanup в цель

Что внедрить:
- Правило: данные доводятся до уровня, достаточного для снятия ограничения, а не до абстрактного perfection.

Пример из книги:
- Data cleanup в книге легко превращается в бесконечный проект, который откладывает business effect. Проблема не в том, что данные не важны, а в том, что их чистота должна обслуживать новый flow и новые решения. Поэтому cleanup нельзя ставить выше value path.

Когда применять:
- Когда внедрение застряло на "надо сначала привести все данные в идеальный порядок".

Первый шаг:
- Отделить critical data для constraint module от non-critical data.

Источник / где искать в книге:
- Source copy, строки 5975-6039.

### 4. Переводите supply chain из push в pull

Что внедрить:
- Центральный/заводской буфер и ежедневное пополнение проданного, вместо проталкивания по прогнозу.

Пример из книги:
- Supply chain examples в книге показывают типичную ловушку push: одновременно возникают excess inventory и shortages. Pull replenishment меняет вопрос с 'сколько спрогнозировать' на 'что реально потреблено и что нужно пополнить'. Это связывает технологию с flow, а не с отчетностью.

Когда применять:
- Когда одновременно есть излишки по одним SKU и дефицит по другим.

Первый шаг:
- Для одного семейства товаров сравнить replenishment lead time и текущий target stock.

Источник / где искать в книге:
- Source copy, строки 7120-7800.

### 5. Меняйте метрики вместе с правилами

Что внедрить:
- Throughput dollar-days and inventory dollar-days вместо локальной эффективности и денежной стоимости запасов как единственной метрики.

Пример из книги:
- Если метрики остаются прежними, люди рационально защищают локальные цели. В книге технология начинает приносить результат только тогда, когда меняются правила оценки: что считать ущербом, что считать flow, где surplus и shortage создают dollar-days. Поэтому metrics change идет вместе с rule change.

Когда применять:
- Когда люди рационально делают вредные для flow действия из-за KPI.

Первый шаг:
- Посчитать dollar-days по одному просроченному заказу и одному избыточному запасу.

Источник / где искать в книге:
- Source copy, строки 7890-7945 и 9025-9044.

### 6. Продавайте технологию через бизнес-результат, а не features

Что внедрить:
- Sales pitch: "какое ограничение снимаем, какие правила меняем, какой измеримый эффект получаем".

Пример из книги:
- Продажа технологического продукта в книге выигрывает не от списка features. Клиенту важно, какой бизнес-результат станет возможным: меньше дефицита, меньше лишних запасов, быстрее replenishment, выше надежность. Поэтому product story строится вокруг результата, а не вокруг функциональности системы.

Когда применять:
- Когда клиент сравнивает ERP/IT как список функций и цену лицензии.

Первый шаг:
- Переписать one-pager продукта: убрать половину feature list и добавить flow impact path.

Источник / где искать в книге:
- Source copy, строки 8406-8627.

## Deep reference body

### Модель 1. Necessary but not sufficient

Технология может снять старое ограничение, но старые правила остаются рациональными для людей, если метрики, approvals and operating policies не изменены. Поэтому внедрение состоит из двух обязательных слоев:
- technical capability;
- rule and measurement replacement.

Пример из книги:
- Главный пример книги: технология необходима, потому что без нее новый способ управления supply chain невозможен в масштабе, но ее одной недостаточно. Бизнес-эффект появляется только когда меняются правила, метрики и предложения рынку.

Если есть только первый слой, организация использует новую технологию для ускорения старого поведения.

### Модель 2. Rule audit

Проверяй правила в пяти местах:
- release rules: что запускается в работу;
- batch rules: какими партиями движется поток;
- priority rules: что получает внимание;
- measurement rules: за что поощряют/наказывают;
- responsibility rules: кто имеет право менять уровень буфера, запасов, сроков.

Пример из книги:
- Rule audit виден там, где старая логика продолжает управлять новой ERP. Люди используют свежие данные, но принимают решения по старым push assumptions, local KPI and batching habits. Поэтому audit ищет не дефект системы, а правило вокруг нее.

### Модель 3. Pull replenishment

Push logic:
- прогнозируем спрос;
- проталкиваем товар;
- держим target stock по предположениям;
- получаем излишки и дефицит одновременно.

Пример из книги:
- Pull replenishment раскрывается на конфликте surplus и shortage. Книга показывает, что точнее прогнозировать недостаточно; нужно пополнять по consumption signals and buffers, чтобы flow отвечал реальному спросу.

Pull logic:
- держим запас ближе к source;
- пополняем то, что реально продано;
- сокращаем replenishment time;
- уменьшаем региональные запасы без падения service.

### Модель 4. Dollar-days

Throughput dollar-days:
- размер задержанного throughput умножается на дни просрочки.
- цель: стремиться к нулю.

Пример из книги:
- Dollar-days делает старый inventory conversation денежным и временным. Shortage-dollar-days показывает потерянный throughput, surplus-dollar-days показывает деньги, застрявшие в лишних запасах. Так технология получает бизнес-метрику, а не только IT-метрику.

Inventory dollar-days:
- стоимость запасов умножается на дни удержания.
- цель: минимизировать без ухудшения service.

Смысл:
- метрика должна видеть и величину, и время, а не только факт наличия/отгрузки.

### Модель 5. Technology product strategy

Поставщик ERP/IT выигрывает, когда продает не модуль, а новый способ работы:
- technology enables new rule;
- new rule changes flow;
- flow changes business result;
- business result creates differentiated offer.

Пример из книги:
- Technology product strategy в книге строится вокруг результата клиента. Сильная продажа объясняет, какие old rules клиент сможет изменить и какой business effect получит, а не только какие modules/features установит.

## Coverage map

| Раздел toolkit | Source coverage |
|---|---|
| Necessary but not sufficient | строки 5011-5038 |
| Old MRP/ERP rule failure | строки 5051-5129 |
| Local efficiency rules | строки 5148-5171, 8437-8488 |
| Good-enough data | строки 5975-6039 |
| Pull replenishment | строки 7120-7800 |
| Dollar-days metrics | строки 7890-7945, 9025-9044 |
| Business-result ERP offer | строки 8406-8627 |

## Excluded / limited source notes

- Сюжет компании-разработчика ERP не пересказывается целиком.
- Конкретные числа и отраслевые детали не превращаются в универсальные benchmark'и.
- Toolkit не утверждает, что ERP всегда нужна; он показывает, как извлекать value, если технология действительно снимает ограничение.

## Anti-patterns

### 1. "Внедрим систему, и правила сами изменятся"

Риск:
- Старые KPI и approvals заставят людей использовать новую систему по-старому.

Замена:
- Old-rule audit before rollout.

### 2. "Data accuracy first, value later"

Риск:
- Внедрение тонет в бесконечной чистке данных.

Замена:
- Good-enough data for constraint relief.

### 3. "Feature list доказывает ценность"

Риск:
- Клиент покупает функциональность, но не получает business result.

Замена:
- Constraint-relief business case.

### 4. "Локальная эффективность завода = хороший поток"

Риск:
- Завод производит то, что не нужно системе сейчас.

Замена:
- Throughput dollar-days and inventory dollar-days.

### 5. "Forecast точнее решит supply chain"

Риск:
- Организация продолжает push logic и усиливает запасы.

Замена:
- Pull replenishment with central/source buffer.

## Практические сценарии

### Сценарий A. ERP уже внедрена, эффекта мало

1. Назвать promised business result.
2. Найти constraint, который ERP должна была ослабить.
3. Выписать старые правила, которые остались.
4. Найти KPI, которые поддерживают старое поведение.
5. Сформулировать новые правила и метрики.
6. Запустить пилот на одном module/process pair.

### Сценарий B. Supply chain с излишками и дефицитом

1. Измерить stockouts и excess inventory по SKU/location.
2. Проверить target stock levels against replenishment time.
3. Переместить буфер ближе к source.
4. Перейти к daily/short-cycle replenishment based on consumption.
5. Управлять dollar-days.

### Сценарий C. Продажа технологического продукта

1. Найти старое ограничение клиента.
2. Показать, какое старое правило больше не нужно.
3. Сформулировать новую практику.
4. Показать метрику результата.
5. Включить обучение и rule-change в предложение.

## Cheatsheet

Перед внедрением технологии:
- Какое ограничение снимает технология?
- Какие старые правила появились из-за этого ограничения?
- Какие правила станут вредными после внедрения?
- Какие метрики нужно заменить?
- Какой минимальный модуль даст business result?
- Что должно измениться в daily work?
- Как проверить эффект через throughput, inventory, operating expense, dollar-days?

## Glossary

- `Necessary but not sufficient` - технология нужна, но без смены правил не дает полной выгоды.
- `Old-rule audit` - проверка правил, созданных под старые ограничения.
- `Local optimum` - улучшение части, ухудшающее flow целого.
- `Pull replenishment` - пополнение по фактическому потреблению.
- `Push` - проталкивание по прогнозу.
- `Throughput dollar-days` - стоимость задержанного прохода, умноженная на дни задержки.
- `Inventory dollar-days` - стоимость запасов, умноженная на дни удержания.
- `Good-enough data` - достаточное качество данных для снятия ограничения.

## Topic index

| Тема | Где в toolkit | Где в source |
|---|---|---|
| Necessary but not sufficient | Deep reference model 1 | строки 5011-5038 |
| Old rules | Action card 2; Deep reference model 2 | строки 5120-5171 |
| ERP/MRP | Быстрая карта; Scenario A | строки 5051-5129 |
| Data cleanup | Action card 3 | строки 5975-6039 |
| Pull replenishment | Action card 4; Scenario B | строки 7120-7800 |
| Dollar-days | Action card 5; Deep reference model 4 | строки 7890-7945 |
| Business-result offer | Action card 6; Scenario C | строки 8406-8627 |

## Scope and limits

Этот toolkit покрывает TOC-логику извлечения пользы из ERP/IT и supply-chain технологий. Он не является инструкцией по выбору конкретного ERP-вендора, архитектуре данных, информационной безопасности или юридическим условиям внедрения. Его рабочая роль - не дать технологии остаться "необходимой, но недостаточной".
