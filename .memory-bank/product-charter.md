# Product Charter — Books

**Статус:** approved by owner.
**Версия:** 2026-05-07.
**Смысл обновления:** предыдущая версия charter слишком широко называла результат “практической выжимкой”. После разбора `book-to-skill` стало понятнее: Books должен превращать книгу не в пересказ и не в краткое summary, а в **применимый рабочий toolkit**.

Owner approval получен 2026-05-07. Этот документ является canonical product source of truth для Books. Логика toolkit, minimum eval set, product runtime для локального прототипа и service layout утверждены 2026-05-07. Product feature work всё ещё требует feature-level plan, применимого echo-test перед неизвестной корневой связкой и отдельного approval для AI/model provider, если задача до него дойдёт.

## 1. На основании чего переписан charter

**1. Owner-approved Project Intake**

Из текущего Project Intake сохранены уже согласованные части:
- проект помогает пользователю получать суперпрактическую пользу из книги;
- результат должен быть применим сразу;
- output первой версии всегда на русском;
- первый пользовательский контур — локальный прототип;
- входные книги предоставляет пользователь из официально скачанных экземпляров;
- нельзя превращать продукт в полный пересказ, дословное воспроизведение книги или профессиональную консультацию без ограничений.

**2. Разбор репозитория `book-to-skill`**

Источник: https://github.com/virgiliojr94/book-to-skill

Из репозитория взята ключевая идея:
- **extract structure, not summaries** — извлекать структуру применения, а не пересказ;
- книга становится не “текстом о книге”, а набором framework'ов, mental models, principles, techniques, anti-patterns, glossary, patterns, cheatsheet and topic index;
- результат должен быть reusable: к нему можно возвращаться и использовать в работе, обучении и принятии решений.

Использованные файлы источника:
- `README.md` — объясняет, почему skill лучше обычного summary/RAG для глубокого применения одной книги;
- `SKILL.md` — описывает pipeline и quality rules;
- `scripts/extract.py` — показывает практический входной pipeline: PDF/EPUB extraction, metadata, structure detection.

**3. Вывод по сравнению с прошлым charter**

Прошлая формулировка “суперпрактическая выжимка” была верной по направлению, но недостаточно точной. Она могла звучать как “краткое содержание”. Новый charter уточняет: Books делает **структурное превращение книги в toolkit**, где пользователь получает модели, принципы, техники, anti-patterns, сценарии применения и шпаргалки.

## 2. Продуктовое определение

**Books** — local-first продукт для превращения официально предоставленной пользователем книги в русскоязычный практический toolkit.

Toolkit означает:
- **модели** — как автор предлагает думать;
- **принципы** — какими правилами пользоваться;
- **техники** — что делать пошагово;
- **лайфхаки, приемы и инструменты к внедрению** — что пользователь может перенести в жизнь, работу или обучение первым действием;
- **anti-patterns** — чего избегать и почему;
- **сценарии применения** — когда использовать идеи книги;
- **шпаргалки** — что можно открыть и сразу применить;
- **topic index** — где быстро найти нужную идею, главу, модель или технику.

Books не должен быть “сервисом кратких пересказов”. Books должен быть способом **компилировать книгу в рабочий набор решений и действий**.

## 3. Миссия

**Мы помогаем любому пользователю превращать книгу в применимый рабочий toolkit на русском языке через структурное извлечение моделей, принципов, техник, anti-patterns, сценариев применения и быстрых шпаргалок вместо обычного пересказа.**

**Статус:** согласовано owner'ом 2026-05-07.
**Почему изменено:** новая миссия точнее отражает `book-to-skill` и вашу формулировку “мне именно это и надо”.

## 4. Видение

**Мы видим будущее, в котором книга после чтения или загрузки не остаётся разовым текстом, а становится рабочим инструментом для решений, действий и обучения; Books — продукт, который превращает содержание книги в навигационный практический toolkit, готовый к повторному применению.**

**Статус:** согласовано owner'ом 2026-05-07.
**Почему изменено:** прежнее видение говорило про “готовую к применению выжимку”, но не фиксировало reusable/toolkit смысл.

## 5. Цель проекта

Создать local-first прототип, который берёт официально предоставленную пользователем книгу или фрагмент книги и создаёт русскоязычный практический toolkit:
- карта книги;
- ключевые модели и framework'и автора;
- принципы и правила применения;
- техники и пошаговые методы;
- лайфхаки, приемы и инструменты к внедрению;
- anti-patterns;
- практические выводы по главам;
- glossary;
- patterns / techniques;
- cheatsheet;
- topic index.

**Статус:** согласовано owner'ом 2026-05-07.

## 6. Целевая аудитория

Books нужен людям, которые читают книги ради применения, а не ради пересказа:
- занятым специалистам;
- предпринимателям;
- студентам;
- самообучающимся читателям;
- людям, которые используют книги как источник решений, идей, действий и рабочих моделей.

**Не основная аудитория текущего этапа:**
- пользователи, которым нужен простой краткий пересказ;
- пользователи, которым нужен полный заменитель книги;
- пользователи, которым нужен публичный библиотечный сервис, аккаунты, оплата или социальные функции.

## 7. JTBD

**Когда у меня есть книга и я хочу применить её идеи в жизни, работе или обучении, я хочу превратить её в понятный toolkit с моделями, принципами, техниками, anti-patterns, сценариями применения и шпаргалками, чтобы быстро находить нужное и сразу действовать.**

**Статус:** согласовано owner'ом 2026-05-07.

## 8. Главный продуктовый принцип

**Извлекать структуру применения, а не summary.**

Это значит:
- не пересказывать “о чём книга”;
- не копировать большие фрагменты текста;
- не подменять автора generic advice;
- сохранять точные названия авторских framework'ов и важных понятий;
- превращать идеи книги в reusable элементы;
- писать в practitioner voice: “используй X, когда Y”, а не “книга рассказывает про X”.

## 9. Логика продукта

**Статус:** approved by owner 2026-05-07.

### 9.1 Режимы работы

**Полная генерация toolkit**
- Книга проходит весь путь от входного файла до готового набора применимых материалов.

**Анализ перед генерацией**
- Сначала показать найденные framework'и, принципы, техники, anti-patterns и структуру глав.
- Owner может проверить направление до полной генерации.

**Генерация из ранее сделанного анализа**
- Если уже есть заметки или анализ книги, использовать их как input и не извлекать всё заново.

**Синтез по нескольким книгам**
- Если toolkit делается по нескольким книгам, сначала по каждой книге отдельно создаётся подробный standalone toolkit и сохраняется по обычным правилам Books: tracked `books/<topic>/<book-slug>/`, ignored `runtime/books/<topic>/<book-slug>/`, structured Markdown source copy and source manifest.
- Только после готовности отдельных toolkit'ов создаётся общий combined toolkit под общей идеей, практической темой или рамкой, которую выбирает owner. Если общая идея или тема не указана, нужно остановиться и попросить owner выбрать её до синтеза.
- Combined toolkit не заменяет standalone toolkit'ы и не становится пересказом нескольких книг. Глубина combined берётся напрямую из локальных structured Markdown source copies и разрешённых originals; standalone toolkit'ы используются как coverage-control artifacts, а не как потолок глубины. Итоговый combined должен сохранять справочную полноту direct-book synthesis и одновременно иметь правильную staged-последовательность: route selection -> применение -> проверка -> deep reference -> anti-patterns -> cheatsheet -> topic index.

### 9.2 Вход и извлечение текста

Вход:
- PDF;
- EPUB;
- позже возможны другие форматы только после отдельного approval.

Перед генерацией нужно:
- проверить, что файл поддерживается;
- определить тип книги: technical / text-heavy / not sure;
- извлечь текст подходящим способом;
- сохранить полный текст только как рабочий input, а не как публичный output;
- рядом с локальным исходником сохранять structured Markdown copy полного извлечённого текста под тем же basename, что и исходник: `<Автор> - <Название>.<ext>` и `<Автор> - <Название>.md`, где автор и название берутся как в оригинале или на английском;
- считать structured Markdown copy локальным source artifact: она живёт только в ignored `runtime/books/<topic>/<book-slug>/`, не коммитится в tracked `books/` и используется для поиска и точных ссылок будущими агентами;
- сохранять рядом с `.md` исходный файл, если оригинал имеет формат `pdf`, `epub`, `fb2` или аудио; для TXT, DOCX, HTML and other extraction/source formats после создания и проверки structured `.md` достаточно оставить `.md` как Books runtime source artifact, если owner отдельно не попросил сохранить такой оригинал;
- старые `.txt` extraction/debug artifacts удалять после проверки `.md`, кроме случая, когда `.txt` сам является user-provided original и для задачи явно нужно сохранить именно его как оригинал;
- сохранять shareable toolkit в tracked `books/<topic>/<book-slug>/`, чтобы им можно было делиться через Git без полного оригинала и группировать toolkit'ы по практической области;
- сохранять локальный комплект со structured `.md`, разрешённым оригиналом (`pdf` / `epub` / `fb2` / audio), metadata and working toolkit copy в ignored `runtime/books/<topic>/<book-slug>/`, чтобы локальные source artifacts повторяли тематическую иерархию shareable toolkit'ов и по исходному тексту можно было быстро уточнять концепты;
- остановиться с понятным blocker, если извлечение плохое.

Особое правило Books:
- входные книги могут быть на разных языках;
- output первой версии всегда русский.

### 9.3 Metadata и pre-flight

Перед генерацией фиксировать:
- исходный файл и формат;
- structured Markdown source copy path;
- способ извлечения;
- размер файла;
- количество страниц или EPUB spine items;
- количество слов и примерный объём токенов;
- найденные главы;
- наличие оглавления;
- путь к рабочему извлечённому тексту.

Зачем это нужно:
- понять, что книга реально прочиталась;
- оценить объём;
- понять, есть ли структура глав;
- решить, можно ли делать toolkit по главам;
- увидеть, нужен ли manual review перед полной генерацией.

### 9.4 Анализ структуры книги

До генерации toolkit нужно определить:
- название и автора;
- главы, части и оглавление;
- основные темы;
- subject domain;
- примерное количество глав;
- ключевые framework'и автора;
- принципы, техники, лайфхаки / приемы / инструменты к внедрению и anti-patterns;
- где в книге появляются основные идеи.

Правило:
**сначала строится карта книги, затем создаётся toolkit.**

### 9.5 Разбор по главам или разделам

Для каждой главы или крупного раздела извлекать:
- **Core Idea** — главная мысль в 1-2 предложениях;
- **Frameworks Introduced** — новые framework'и и когда их применять;
- **Key Concepts** — важные термины с короткими определениями;
- **Mental Models** — как думать через идеи автора;
- **Anti-patterns** — чего избегать и почему;
- **Key Takeaways** — 3-7 прикладных выводов;
- **Connects To** — связи с другими главами и внешними идеями.

Для technical books дополнительно:
- code examples;
- reference tables;
- commands / APIs, если они являются частью смысла книги.

### 9.6 Итоговые материалы

Первый полный toolkit должен уметь производить:
- **главный файл** — самые важные framework'и, принципы и карта книги;
- **master usage layer** — `Как пользоваться toolkit`, `Battle route`, `Training route`, `Быстрая карта` и `Tool selector`, чтобы пользователь мог выбрать маршрут до погружения в deep reference;
- **лайфхаки, приемы и инструменты к внедрению** — отдельный раздел в главном файле сразу после быстрой карты; пункты извлекаются из всей книги и оформляются как прикладные карточки `Что внедрить`, `Когда применять`, `Первый шаг`, `Источник / где искать в книге`;
- **deep reference body** — полные достойные внимания framework'и, таблицы, модели, приемы, алгоритмы, chapter/section takeaways and source-specific nuances; навигационный слой не имеет права урезать глубину;
- **tool selector** — таблица `Tool`, `Best for`, `Do not use when`, `Primary source layers`, чтобы toolkit не просто перечислял инструменты, а помогал не применить неправильный инструмент;
- **coverage / limitation layer** — `Coverage map`, dedupe notes, `Excluded / limited source notes` and source traceability;
- **разбор по главам** — короткие chapter sections/files;
- **glossary** — важные термины с привязкой к главам;
- **patterns / techniques** — методы и способы действия;
- **cheatsheet** — короткие правила, таблицы решений и быстрые действия;
- **topic index** — навигация по идеям, моделям, техникам и главам.
- **usage layer** — как пользоваться toolkit;
- **scope & limits** — что покрывает только эта книга и где нужны внешние источники или специалист;
- **extraction report** — metadata, extraction method, pages/spine items, words/tokens, detected chapters and ToC status.

Ссылки на источники:
- `source-manifest.md` и поля `Источник / где искать в книге` в toolkit'ах должны указывать на локальную structured Markdown copy в `runtime/books/<topic>/<book-slug>/<Автор> - <Название>.md` плюс heading/page/spine marker, если он известен;
- не ссылаться в tracked toolkit на полный оригинал как на публикуемый artifact и не вставлять большие дословные фрагменты вместо навигационной ссылки.
- `source-manifest.md` должен явно показывать, сохранён ли оригинал рядом с `.md`: `сохранён`, если это `pdf` / `epub` / `fb2` / audio; `не хранится в Books runtime, достаточно structured .md`, если формат другой и owner не просил сохранить оригинал отдельно.

Multi-book toolkit:
- общий toolkit строится только после отдельных detailed toolkit'ов по каждой книге, но не ограничивается их содержанием;
- combined synthesis обязан идти напрямую из локальных structured Markdown source copies и разрешённых originals, а standalone toolkit'ы используются для coverage check, gap detection and source-layer navigation;
- общий toolkit должен включать все идеи из всех книг, которые проходят ranking как достойные внимания: применимость, авторская важность, повторяемость, конкретность и отличимость от generic advice;
- повторяющиеся идеи объединяются без дублей: сохраняется лучший practical formulation и source traceability ко всем книгам, где идея встречается;
- материал выстраивается в master-последовательности: charter/source status -> usage layer -> Battle route / Training route -> quick map -> tool selector -> action cards -> working process -> deep reference body -> coverage/dedupe -> limited-source notes -> anti-patterns -> scenarios -> cheatsheet -> glossary -> topic index;
- combined toolkit должен иметь coverage map: какие книги и какие standalone toolkit sections легли в каждый общий блок, что было объединено как дубль и что сознательно не включено с причиной.
- запрещено делать combined только как synthesis нескольких standalone summaries, если из-за этого теряются таблицы, авторские модели, примеры, алгоритмы, source nuance или справочная глубина direct-book pass.

Quality-first rule:
- для Books качество разбора и подготовки toolkit важнее скорости, экономии времени или токенов;
- нельзя сокращать разбор, пропускать достойные внимания идеи или делать поверхностный combined toolkit только ради быстрого ответа;
- нельзя выбирать между “быстро, но поверхностно” и “глубоко, но тяжело”: эталонный toolkit должен совмещать быстрый route selector и глубокий справочник;
- если объём большой, работу нужно дробить на понятные этапы, сохранять промежуточные artifacts and coverage notes, продолжать до качественного результата или фиксировать явный blocker.

### 9.7 Дополнительные approved правила toolkit

Режимы:
- full generation;
- analyze only;
- generate from prior analysis.

Pre-flight:
- проверить путь к файлу, существование файла, формат по extension и magic bytes;
- поддерживать PDF / EPUB в первой версии;
- спросить тип книги: technical / text-heavy / not sure;
- показать provider-agnostic estimate: pages/spine items, words/tokens, expected artifacts, time/quality risk;
- получить explicit proceed перед full generation.

Purpose weighting:
- применять framework'и автора в работе;
- думать через mental models автора;
- ссылаться на главы и понятия;
- всё вместе.

Ranking:
- применимость;
- авторская важность;
- повторяемость;
- конкретность;
- отличимость от generic advice.

Раздел внедрения:
- каждый новый Books toolkit должен содержать в главном файле после `Быстрая карта` раздел `Лайфхаки, приемы и инструменты к внедрению`;
- раздел извлекается из всей книги, а не только из одного вводного фрагмента;
- каждый пункт пишется не цитатой, а прикладной карточкой: `Что внедрить`, `Когда применять`, `Первый шаг`, `Источник / где искать в книге`;
- в раздел попадают только конкретные, сразу применимые элементы, связанные с авторской идеей и отличимые от generic advice;
- этот раздел не заменяет `patterns / techniques` и `cheatsheet`: `patterns / techniques` описывает методы, а раздел внедрения превращает лучшие методы в список действий;
- user-facing раздел не называется `Белки`; это только исходная метафора из методики Маргулана.

Book types v1:
- technical;
- practical nonfiction;
- theory / academic;
- narrative nonfiction;
- fiction только как special/manual mode.

Extraction implementation contract:
- extracted full text + metadata;
- PDF text chain: `pdftotext -layout` -> `PyPDF2` -> `pdfminer.six`;
- technical PDF path: Docling-style structure-aware extraction;
- EPUB chain: `ebooklib` + BeautifulSoup -> stdlib `zipfile` + HTML parser fallback;
- OPF spine order first, sorted HTML fallback;
- pages/spine count, chapter heading sample, ToC flag and extraction evidence.

Safety adaptation:
- no large raw excerpts;
- no silent overwrite of existing output;
- no full book originals in tracked `books/` artifacts;
- no duplicate source text artifacts after structured `.md` is verified; keep original beside `.md` for `pdf`, `epub`, `fb2` and audio;
- no hardcoded Claude-specific skill folder, provider prices, model names or fixed global temp path;
- use per-run workdir under ignored runtime area for local artifacts.

## 10. Первый пользовательский контур

Owner выбрал: **локальный прототип**.

Это значит:
- owner передаёт книгу или фрагмент локально;
- продукт создаёт русскоязычный toolkit;
- нет публичного UI;
- нет аккаунтов;
- нет оплаты;
- нет deploy/publish.

Технология локального прототипа утверждена 2026-05-07:
- Node/npm остаётся orchestration and QA baseline;
- Books v1 реализуется как local CLI contour;
- extraction допускает Python adapter, потому что `book-to-skill` уже доказал практичность Python-based PDF/EPUB extraction;
- AI/model provider не зашит в charter и выбирается отдельным adapter-level owner approval.

## 11. Ограничения

**Нельзя сломать:**
- практическую применимость;
- понятность для обычного пользователя;
- доверие к содержанию;
- разделение идей книги и рекомендаций продукта;
- прозрачность источника.

**Вне scope текущего этапа:**
- полный заменитель чтения книги;
- дословное воспроизведение больших фрагментов;
- академический литературный анализ;
- универсальная экспертная консультация;
- публичный веб-продукт;
- аккаунты;
- оплата;
- аналитика;
- deploy.

**Рамки входных книг:**
- книги предоставляет пользователь из официально скачанных экземпляров;
- toolkit нельзя выдавать за официальный текст автора или издателя;
- полный текст книги нельзя публиковать или хранить как продуктовый output без отдельного решения.

## 12. Метрики успеха

**Пользовательская метрика**
- Пользователь может назвать минимум одно конкретное действие, которое готов применить после работы с toolkit.

**Операционная метрика**
- Продукт стабильно создаёт один toolkit по официально переданной книге с понятной структурой и traceable input source.

**QA / reliability метрика**
- Toolkit заполнен по обязательным секциям.
- Toolkit содержит раздел `Лайфхаки, приемы и инструменты к внедрению` с конкретными действиями и источниками внутри книги.
- Toolkit содержит master usage layer: `Battle route`, `Training route`, `Быстрая карта`, `Tool selector`, action cards, deep reference body, coverage/limited-source notes, anti-patterns, scenarios, cheatsheet, glossary and topic index.
- Multi-book toolkit создаётся только после standalone toolkit'ов по каждой книге, но combined depth берётся напрямую из structured source copies/originals; standalone toolkit'ы используются как coverage control. Combined содержит coverage map, не дублирует идеи, не теряет справочную глубину и выстроен в master-практической последовательности.
- Нет больших дословных фрагментов.
- Действия отделены от идей книги.
- Ограничения и предупреждения применены там, где нужны.
- Output первой версии на русском.

## 13. Capability Decisions

**Auth / user identity:** сейчас не применимо. Первый scope single-owner/local.
**Payments / billing:** сейчас не применимо. Коммерческая модель не выбрана.
**Credits / limits:** сейчас не применимо. Нет paid quotas или user balance.
**Analytics / consent:** сейчас не применимо. Не собирать telemetry до отдельного решения.
**i18n / localization:** применимо. Входные книги могут быть на разных языках, output всегда русский.
**Async jobs / workers:** применимо. Извлечение текста, языковая обработка и генерация могут быть долгими.
**API documentation:** сейчас не применимо. API не выбран.
**Service layout:** применимо и утверждено для локального прототипа. Future product source: `src/books/`; shareable toolkit artifacts: tracked `books/<topic>/<book-slug>/`; локальные originals / generated artifacts: ignored `runtime/books/<topic>/<book-slug>/`; tests: `tests/unit` / `tests/integration`; process scripts stay in `scripts/`.
**Runtime-specific rules:** локальный CLI contour on Node/npm orchestration with optional Python extraction adapter; no public UI, auth, payments, analytics or deploy in v1.

## 14. Blockers до feature work

Нельзя начинать product feature/refactor/behavior-change work без feature-level plan and QA evidence. Для неизвестной корневой связки до реализации нужен isolated echo-test. Для AI/model provider нужен отдельный owner-approved adapter decision.

Bootstrap blockers, которые закрыты 2026-05-07:
- owner подтвердил, что логика toolkit завершена;
- minimum eval set для toolkit утверждён;
- выбран product stack/runtime для локального прототипа;
- утверждён service layout;
- выполнен canonical transfer в `.memory-bank/*`, `AGENTS.md`, `CODEX_MEMORY.md`, `README.md`;
- baseline QA пройден.

## 15. Product Charter Gate

Перед любым продуктовым решением нужно проверить:
- усиливает ли изменение идею “книга как применимый toolkit”;
- не превращает ли продукт в обычный summary generator;
- не создаёт ли дословное воспроизведение книги как product output;
- не добавляет ли публичный UI, аккаунты, оплату, аналитику, provider или deploy без отдельного approval;
- сохраняет ли deterministic QA и source-of-truth governance.

Если запрос конфликтует с этим charter, Codex обязан остановиться, объяснить конфликт и предложить ближайший безопасный вариант.

## 16. Что утверждено

Owner approval получен 2026-05-07 по трём пунктам:

1. **Новая миссия**: Books превращает книгу в применимый русскоязычный toolkit, а не просто в практическую выжимку.
2. **Новый центр продукта**: главный результат — модели, принципы, техники, anti-patterns, сценарии применения, шпаргалки и topic index.
3. **Статус документа**: после approval этот charter становится canonical product source of truth для Books. Логика toolkit, minimum eval set, local CLI runtime and service layout approved 2026-05-07; feature work дальше идёт через feature-level plan, applicable echo-test and deterministic QA.

## Shared Starter Baseline Rules

- `starter.project-intake.integration-review-path`: Integration / review path в Project Intake фиксирует, как изменения попадают в основной проект: managed task conveyor, Pull Request review или hybrid. Pull Request review является явным owner/team choice для risky, broad, external-review или team-review работы и не должен обходить deterministic QA, source-of-truth governance, task finish и merge gates.

## Shared Starter Baseline Rules — synced 2026-05-18

- `starter.product-charter.project-identity-unique`: Product charter каждого проекта уникален: mission, vision, goal, target audience, `JTBD`, product constraints and success criteria нельзя импортировать, шарить или подменять из другого проекта. `starter-rule-import` и `starter-rule-share` могут переносить только отдельные approved reusable governance blocks; если такой блок должен жить в product charter, он добавляется как отдельный project-local block/guard и формулируется для конкретного проекта без замены charter identity.
