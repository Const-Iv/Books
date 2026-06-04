# Oper8 - source manifest

## Что хранится в Git

- `Oper8 - Сергей Липчанский и Асхат Уразбаев - toolkit.md` - shareable practical toolkit на русском языке по книге `Oper8. AI-процессы, которые учатся с каждым клиентом`.
- Этот manifest - навигация по локальному источнику, structured Markdown copy, extraction metadata и ограничениям.

## Что не хранится в Git

- Полный PDF-оригинал не коммитится.
- Локальный original и same-basename structured Markdown source copy хранятся в ignored runtime:
  - `runtime/books/AI-процессы/lipchansky-urazbaev-oper8-ai-processes/Сергей Липчанский и Асхат Уразбаев - Oper8. AI-процессы, которые учатся с каждым клиентом.pdf`
  - `runtime/books/AI-процессы/lipchansky-urazbaev-oper8-ai-processes/Сергей Липчанский и Асхат Уразбаев - Oper8. AI-процессы, которые учатся с каждым клиентом.md`
- Extraction metadata:
  - `runtime/books/AI-процессы/lipchansky-urazbaev-oper8-ai-processes/extraction-metadata.json`

## Почему так

Books должен помогать делиться применимым toolkit'ом, но не превращать репозиторий в хранилище полного текста книги. Tracked artifact содержит маршруты применения, модели, decision tools, action cards, anti-patterns, сценарии, cheatsheet, glossary и topic index. Полный источник нужен локально для проверки спорных мест и future agent search.

## Проверка source bundle

| Поле | Значение |
|---|---|
| Нормализованный источник | `Сергей Липчанский и Асхат Уразбаев - Oper8. AI-процессы, которые учатся с каждым клиентом.pdf` |
| Structured Markdown source copy | `Сергей Липчанский и Асхат Уразбаев - Oper8. AI-процессы, которые учатся с каждым клиентом.md` |
| Метод извлечения | `pdftotext` default extraction plus page-marker conversion |
| Альтернативный extraction path | `pdftotext -layout` был проверен, но остановлен из-за timeout; default extraction прошёл корректно |
| Объём | 56 страниц, примерно 12 862 слова, примерно 18 650 токенов |
| Original retention | `сохранён`, потому что исходник PDF |
| Visual notes | Добавлены локально для Page 25 и Page 41, где схемы не извлеклись полностью как текст |
| Статус | source normalized |

## Использование источника

- `Page 5-6` - авторы, навигатор проблем и intended use.
- `Page 8-14` - четыре сдвига, Deploy trap, Reshape, идея процесса, который учится.
- `Page 15-22` - быстрый/медленный циклы, владелец процесса, живые регламенты, выбор процесса.
- `Page 24-41` - пять шестеренок маховика: база знаний, автономия, память, проверка качества, метрики.
- `Page 43-51` - масштабирование: frozen middle, ИИ-грамотность, роли, карта перехода.
- `Page 53-56` - стартовый понедельничный план и практические навыки.

## Ограничения

- Это compact v0.8 guide, а не техническая архитектурная спецификация агента.
- Все внешние статистические утверждения из PDF (`BCG`, `McKinsey`, `Klarna`) использованы как source claims и не проверялись внешним ресерчем в этом прогоне.
- Таблицы PDF были извлечены текстом с частичной потерей визуального форматирования; смысловые блоки сверены по page markers и двум визуальным PNG-проверкам.
- Toolkit намеренно не содержит длинных цитат и не заменяет оригинал.
