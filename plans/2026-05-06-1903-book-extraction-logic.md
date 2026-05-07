Статус:
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Проект помогает пользователю превращать книгу в применимый русскоязычный toolkit, который можно сразу использовать.
- Логика toolkit должна сохранять главный результат: книга превращается в рабочий набор моделей, принципов, техник, anti-patterns, сценариев применения и шпаргалок, а не в пересказ.

Цель изменения:
- Зафиксировать owner-approved логику toolkit по частям, а после финального подтверждения owner'а перенести её в Project Intake, eval spec и canonical sources.

Итоговый статус:
- Логика toolkit завершена и подтверждена owner'ом 2026-05-07.

Источник для текущих блоков:
- Read-only обзор подхода `book-to-skill`: https://github.com/virgiliojr94/book-to-skill
- Полезный принцип из источника: извлекать структуру применения, а не summary.
- Повторный критический разбор актуальной версии repo выполнен 2026-05-07: ветка `master`, latest checked commit `8827273`, основные файлы `README.md`, `SKILL.md`, `scripts/extract.py`.

Логика toolkit:

## Блок 1 — Книга как набор применимых элементов

Статус: owner confirmed 2026-05-07.

После обработки пользователь должен получить не текст “о чём книга”, а набор reusable элементов:

- модели: как автор предлагает думать;
- принципы: какими правилами пользоваться;
- техники: что делать пошагово;
- anti-patterns: чего избегать;
- сценарии применения: когда это использовать;
- быстрые шпаргалки: что можно открыть и сразу применить.

Рабочая формулировка:
- Из книги извлекается не пересказ, а применимая структура: ключевые модели автора, принципы, техники, anti-patterns, ситуации применения и короткие действия, которые пользователь может использовать сразу.

## Блок 2 — Режимы работы

Статус: owner confirmed 2026-05-07.

Из репозитория стоит взять три режима и адаптировать их под Books:

- Полная генерация toolkit: книга проходит весь путь от входного файла до готового набора применимых материалов.
- Анализ перед генерацией: сначала показать найденные framework'и, принципы, техники, anti-patterns и структуру глав, чтобы owner мог проверить направление до генерации полного toolkit.
- Генерация из ранее сделанного анализа: если уже есть заметки или анализ книги, использовать их как input и не извлекать всё заново.

Рабочая формулировка:
- Books должен поддерживать не только “сделай всё сразу”, но и безопасный режим предварительного анализа, где пользователь сначала видит карту будущего toolkit и может скорректировать акцент.

## Блок 3 — Вход и извлечение текста

Статус: owner confirmed 2026-05-07.

Из репозитория стоит взять входной pipeline:

- проверить, что вход — PDF или EPUB;
- определить тип книги: technical / text-heavy / not sure;
- для technical PDF использовать structure-aware extraction, чтобы не потерять таблицы, код, формулы и структуру;
- для text-heavy PDF использовать быстрый plain-text extraction;
- для EPUB извлекать текст из HTML/spine order;
- сохранять полный извлечённый текст только как рабочий input, а не как публичный output.

Адаптация для Books:
- входные книги могут быть на разных языках;
- output первой версии всегда русский;
- если извлечение текста плохое, продукт должен остановиться с понятным blocker, а не выдавать уверенный плохой toolkit.

## Блок 4 — Metadata и pre-flight перед генерацией

Статус: owner confirmed 2026-05-07.

Из репозитория стоит взять metadata stage:

- исходный файл и формат;
- способ извлечения;
- размер файла;
- количество страниц или EPUB spine items;
- количество слов и примерный объём токенов;
- найденные главы;
- наличие оглавления;
- путь к рабочему извлечённому тексту.

Для Books это нужно не ради стоимости как главной метрики, а чтобы до генерации понимать:

- книга реально прочиталась;
- объём не слишком большой для выбранного способа обработки;
- есть ли структура глав;
- можно ли делать toolkit по главам;
- нужен ли manual review перед полной генерацией.

## Блок 5 — Анализ структуры книги

Статус: owner confirmed 2026-05-07.

До генерации результата нужно определить:

- название и автора;
- главы, части и оглавление;
- core themes;
- subject domain;
- примерное количество глав;
- ключевые framework'и автора;
- принципы, техники и anti-patterns;
- где в книге появляются основные идеи.

Рабочая формулировка:
- Сначала строится карта книги, затем по этой карте создаётся toolkit. Нельзя сразу генерировать общий ответ без понимания структуры книги.

## Блок 6 — Выжимка по главам / разделам

Статус: owner confirmed 2026-05-07.

Для каждой главы или крупного раздела стоит извлекать:

- Core Idea: главная мысль раздела в 1-2 предложениях.
- Frameworks Introduced: новые framework'и и когда их применять.
- Key Concepts: важные термины с короткими определениями.
- Mental Models: как думать через идеи автора.
- Anti-patterns: чего избегать и почему это не работает.
- Key Takeaways: 3-7 прикладных выводов.
- Connects To: связи с другими главами и внешними идеями.

Для technical books дополнительно:

- code examples;
- reference tables;
- commands / APIs, если они являются частью смысла книги.

Адаптация для Books:
- даже если книга не техническая, у каждой главы должен быть практический слой: “что это меняет в действиях пользователя”.

## Блок 7 — Итоговые материалы toolkit

Статус: owner confirmed 2026-05-07.

Из репозитория стоит взять идею supporting files, но переименовать под Books:

- Главный файл toolkit: самые важные framework'и, принципы и карта книги.
- Разбор по главам: короткие chapter files или секции.
- Glossary: важные термины, отсортированные и привязанные к главам.
- Patterns / Techniques: все конкретные методы и способы действия.
- Cheatsheet: короткая шпаргалка с правилами, таблицами решений и быстрыми действиями.
- Topic index: где искать каждую важную тему, модель или технику.

Рабочая формулировка:
- Выжимка должна быть навигационной: пользователь может открыть общий слой, тему, главу или шпаргалку, не перечитывая весь результат.

## Блок 8 — Правила качества результата

Статус: owner confirmed 2026-05-07.

Из репозитория стоит взять эти quality rules в адаптированном виде:

- Извлекать структуру, не summary.
- Сохранять точные названия авторских framework'ов и важных понятий.
- Предпочитать плотность и применимость, а не полноту любой ценой.
- Писать practitioner voice: “используй X, когда Y”, а не “книга рассказывает про X”.
- Сначала показывать самое важное, детали делать вторым слоем.
- Главы/разделы должны быть доступны по запросу, а не перегружать первый экран.
- Не копировать raw book text.
- Topic index обязателен: он помогает быстро найти нужную идею, технику или главу.

Ограничения:
- Не копировать большие фрагменты книги.
- Не подменять идеи автора generic advice.
- Не считать этот блок полной логикой toolkit до финального owner confirmation.

## Блок 9 — Out-of-scope и validation до чтения книги

Статус: owner confirmed 2026-05-07.

Из репозитория нужно забрать строгий входной gate:

- если вход не является путём к файлу, остановиться и показать понятный usage;
- проверить, что файл существует;
- проверить формат по extension и magic bytes;
- поддерживать только PDF / EPUB в первой версии;
- если формат не поддержан, остановиться с понятным blocker и списком поддерживаемых форматов.

Адаптация для Books:
- не начинать extraction, generation или AI/model call, пока файл и формат не подтверждены;
- не принимать “просто тему книги” как замену входному файлу в первом контуре;
- future modes for text fragments допустимы только как отдельное owner-approved расширение.

## Блок 10 — Выбор типа книги перед extraction

Статус: owner confirmed 2026-05-07.

Из репозитория нужно забрать выбор типа контента перед extraction:

- **Technical** — есть code blocks, tables, formulas, diagrams, academic / architecture / programming-like material;
- **Text-heavy** — в основном prose, мало таблиц/кода;
- **Not sure** — использовать быстрый метод и предупредить про возможные ограничения качества.

Адаптация для Books:
- вопрос должен быть понятен обычному пользователю;
- выбор влияет только на extraction strategy, а не на итоговую ценность toolkit;
- для non-technical книг всё равно извлекать frameworks, mental models, principles, techniques, anti-patterns and actions;
- если `not sure` приводит к плохому extraction quality, продукт должен предложить повторить через более точный режим, а не делать уверенный плохой toolkit.

## Блок 11 — Pre-flight estimate и explicit proceed gate

Статус: owner confirmed 2026-05-07.

Из репозитория нужно забрать pre-flight перед полной генерацией:

- показать найденную книгу / файл;
- показать pages или EPUB spine items;
- показать words и примерный source tokens;
- показать предполагаемый объём output;
- показать примерное время обработки;
- показать список файлов / секций, которые будут созданы;
- спросить explicit proceed перед full generation;
- дать вариант `analyze only`, если пользователь хочет сначала проверить структуру.

Адаптация для Books:
- не hardcode'ить конкретные Claude prices или model names в product logic до выбора AI/model provider;
- estimate должен быть provider/runtime-agnostic: объём, время, риск качества, expected artifacts;
- если provider выбран позже, price estimate добавляется как adapter-specific layer.

## Блок 12 — Purpose weighting перед генерацией

Статус: owner confirmed 2026-05-07.

Из репозитория нужно забрать вопрос о назначении результата:

- применять framework'и автора в работе;
- думать через mental models автора;
- ссылаться на главы и понятия;
- всё вместе.

Адаптация для Books:
- перед full generation пользователь выбирает, для чего ему toolkit;
- этот выбор меняет акценты главного файла: больше действий, больше mental models, больше reference navigation или сбалансированный режим;
- выбор назначения не должен удалять обязательные секции toolkit.

## Блок 13 — Naming и защита от overwrite

Статус: owner confirmed 2026-05-07.

Из репозитория нужно забрать naming logic:

- если пользователь дал slug/name, использовать его;
- иначе предложить два варианта:
  - author-concept: `{author-lastname}-{core-concept}`;
  - title-based: normalized book title;
- default — author-concept, если у книги сильная методологическая идентичность;
- если output с таким именем уже существует, не перезаписывать молча: append suffix или спросить owner.

Адаптация для Books:
- это имя не обязано быть Claude skill name;
- это может быть toolkit folder/result id;
- правило “no silent overwrite” обязательно для локального прототипа.

## Блок 14 — Layered/on-demand artifact architecture

Статус: owner confirmed 2026-05-07.

Из репозитория нужно забрать архитектуру результата:

- главный файл / core layer содержит самое важное;
- chapter files или chapter sections грузятся / читаются по необходимости;
- topic index ведёт к нужным главам и supporting files;
- glossary, patterns and cheatsheet являются отдельными supporting layers;
- результат не должен заставлять пользователя читать всё подряд.

Адаптация для Books:
- даже если первая версия будет одним Markdown/result folder, структура должна быть layered;
- первый экран / главный файл должен быть front-loaded: самые важные models, frameworks, principles and usage routes идут первыми;
- details остаются вторым слоем;
- topic index обязателен, потому что это главный navigation layer.

## Блок 15 — Density budgets как default quality guard

Статус: owner confirmed 2026-05-07.

Из репозитория нужно забрать default density budgets:

- chapter artifact: ориентир 800-1200 tokens;
- master/core artifact: ориентир до 4000 tokens;
- core frameworks: около 2000 tokens;
- glossary: около 1500 tokens;
- patterns: около 2000 tokens;
- cheatsheet: около 1000 tokens.

Адаптация для Books:
- это не жёсткие технические лимиты, пока product runtime не выбран;
- это quality guard against verbose output;
- если книга сложная, лучше добавить on-demand supporting layers, чем раздувать главный слой.

## Блок 16 — Usage layer внутри результата

Статус: owner confirmed 2026-05-07.

Из репозитория нужно забрать usage model:

- без запроса / без темы — открыть core frameworks;
- по теме — найти relevant chapters / sections;
- по главе — открыть конкретный chapter artifact;
- browse — показать chapter index и topic index.

Адаптация для Books:
- toolkit должен сам объяснять, как им пользоваться;
- usage layer должен быть коротким и прикладным;
- trigger phrases / topic routes можно генерировать из тем книги, но не зашивать в product core до выбора runtime/UI.

## Блок 17 — Scope & Limits результата

Статус: owner confirmed 2026-05-07.

Из репозитория нужно забрать явный scope block:

- toolkit покрывает только содержание данной книги;
- для тем вне книги нужно явно сказать, что это outside scope;
- для применения к конкретному проекту / ситуации нужен отдельный слой адаптации;
- книга не превращается в универсального эксперта.

Адаптация для Books:
- scope & limits обязательны для каждого toolkit;
- особенно важно для юридических, медицинских, финансовых, психологических и иных sensitive topics;
- output не должен выдаваться за официальный текст автора или издателя.

## Блок 18 — Product positioning: compile-time toolkit, не search/RAG

Статус: owner confirmed 2026-05-07.

Из README нужно забрать позиционирование:

- PDF search даёт страницы, а не ответы;
- заметки часто превращаются в документ, который не открывают повторно;
- raw context dump тратит контекст и остаётся retrieval;
- RAG хорош для поиска по многим книгам, но Books first scope — глубокое превращение одной книги в применимый toolkit;
- compile-time extraction заранее извлекает framework'и, principles, mental models and anti-patterns;
- работа идёт от фактического экземпляра, который дал пользователь, поэтому меньше риск hallucinated chapter titles / framework names.

Адаптация для Books:
- не обещать “no hallucination” как абсолют;
- говорить “grounded in provided book + QA checks”;
- multi-book search не делать первым продуктовым контуром.

## Блок 19 — Extraction implementation details, которые надо сохранить для будущего runtime

Статус: owner confirmed 2026-05-07.

Из `scripts/extract.py` нужно забрать как future implementation contract:

- общий output: extracted full text + metadata;
- token estimate: words-based approximation;
- PDF text chain: `pdftotext -layout` -> `PyPDF2` -> `pdfminer.six`;
- technical PDF path: Docling with table structure enabled and OCR disabled by default;
- EPUB chain: `ebooklib` + BeautifulSoup -> stdlib `zipfile` + HTML parser fallback;
- EPUB reading order: OPF spine first, sorted HTML fallback;
- page count: `pdfinfo` -> `PyPDF2` fallback;
- EPUB count: spine item count;
- structure detection: chapter heading patterns, ToC detection, sample headings;
- metadata fields: source file, filename, format, extraction method, extraction mode, file size, pages/spine items, chars, words, estimated tokens, output text path, chapters detected, chapter heading sample, ToC flag.

Адаптация для Books:
- не копировать executable script into product source до выбора product runtime;
- не использовать fixed global temp path как final design; нужен per-run workdir с cleanup;
- errors должны быть user-readable blockers;
- extraction evidence должно сохраняться как часть QA / traceability.

## Блок 20 — Что берём только с safety adaptation

Статус: owner confirmed 2026-05-07.

Из репозитория есть пункты, которые полезны, но нельзя брать буквально:

- **Code examples:** брать только минимальные instructive snippets when technically necessary; prefer derived explanation/pseudocode where possible; no large raw excerpts.
- **Reference tables:** не воспроизводить большие таблицы дословно; превращать в derived decision tables / comparison notes with chapter refs.
- **Claude-specific skill folder:** не считать `~/.claude/skills/<slug>` обязательным product output; для Books это optional adapter.
- **Claude model prices:** не hardcode'ить цены и model names до provider approval.
- **Fixed `/tmp/book_skill_work`:** заменить будущим per-run temp/work directory.
- **allowed-tools / disable-model-invocation / context fork:** это Claude Code skill metadata, а не Books product invariant.
- **Star history / README badges / install commands:** не продуктовая логика Books.

Рабочий вывод:
- Забираем почти всё из `book-to-skill` как product logic and future implementation contract.
- Не забираем только branding, Claude-specific packaging, hardcoded provider economics and unsafe raw reproduction patterns.

Закрытые решения:
- Блоки 2-20 подтверждены owner'ом 2026-05-07.
- Обязательные материалы первой версии подтверждены owner'ом 2026-05-07: главный файл, главы, glossary, patterns, cheatsheet, topic index, usage layer, scope & limits, extraction report.
- Ранжирование идей подтверждено owner'ом 2026-05-07: применимость, авторская важность, повторяемость, конкретность, отличимость.
- Типы книг v1 подтверждены owner'ом 2026-05-07: technical, practical nonfiction, theory / academic, narrative nonfiction; fiction остаётся special/manual mode.
- Acceptance checklist подтверждён owner'ом 2026-05-07: русский output, все обязательные секции, toolkit not summary, точные framework names, нет больших raw excerpts, chapter/topic navigation, scope & limits, blocker on bad extraction.
- Minimum eval set подтверждён owner'ом 2026-05-07: Russian practical nonfiction, non-Russian practical nonfiction with Russian output, technical input, bad extraction, full-retelling request, purpose weighting, analyze-only mode.

QA / eval notes:
- Пока automated eval нет.
- Manual check: текущий блок соответствует миссии, цели и JTBD Project Intake.
- Eval spec можно создавать на основе owner-approved логики toolkit.
- Baseline QA after canonical transfer: `npm run qa:agent` PASS on 2026-05-07.
