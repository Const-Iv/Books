# Единый практический toolkit TRIZ - source manifest

## Что хранится в Git

- `Единый практический toolkit TRIZ - по нескольким книгам.md` - shareable unified master toolkit на русском языке: полная справочная глубина старого unified плюс навигационный staged layer из нового quality combined.
- Этот manifest - навигация по локальным источникам, structured Markdown copies, извлечению и ограничениям.
- Standalone source toolkit'ы, из которых теперь должен собираться и проверяться combined слой:
  - `../altshuller-algoritm-izobreteniya/`
  - `../altshuller-innovation-algorithm/`
  - `../altshuller-creativity-as-exact-science/`
  - `../altshuller-and-suddenly-inventor-appeared/`
  - `../gadd-karen-triz-for-engineers/`
  - `../orlov-osnovy-klassicheskoy-triz/`
  - `../hlynovsky-osnovy-triz/`
  - `../altshuller-nayti-ideyu-fragment/`

## Что не хранится в Git

- Полные оригиналы книг не коммитятся.
- Локальные исходники и same-basename structured Markdown source copies: `runtime/books/TRIZ - Теория решения изобретательских задач/triz-unified-practical-toolkit/sources/`.
- Legacy extracted/reports/OCR intermediate artifacts могут оставаться в ignored runtime как проверочный след старого прогона, но canonical local source теперь `sources/` и per-book runtime bundles со same-basename `.md` рядом с original; при новом прогоне intermediate artifacts можно сгенерировать заново из локальных originals.

## Почему так

Books должен помогать делиться практическими toolkit'ами, но не превращать репозиторий в хранилище полных книг. Текущий tracked artifact содержит структурированное прикладное руководство: маршруты применения, 40 приемов, 39 параметров, 76 стандартов, ARIZ-85В, Meta-ARIZ, S-field, CICO, anti-patterns, cheatsheet, glossary и topic index. Полные оригиналы нужны только для локальной проверки спорных мест, а structured Markdown copies нужны для будущего поиска агентом.

## Проверка текущего source bundle

| Код | Нормализованный источник | Structured Markdown source copy | Метод | Объем извлечения | Статус |
|---|---|---|---|---|---|
| `ALT-RU-ALG` | `G. S. Altshuller - Алгоритм изобретения.pdf` | `G. S. Altshuller - Алгоритм изобретения.md` | `pdftotext` | 11 125 строк, примерно 66 705 слов | source normalized |
| `ALT-EN-ALG` | `Genrich Altshuller - The Innovation Algorithm.pdf` | `Genrich Altshuller - The Innovation Algorithm.md` | `pdftotext` | 12 719 строк, примерно 103 014 слов | source normalized |
| `ALT-EXACT` | `G. S. Altshuller - Creativity as an Exact Science.pdf` | `G. S. Altshuller - Creativity as an Exact Science.md` | OCR через `pdftoppm` + `tesseract` | 379 страниц, примерно 80 847 слов | source normalized |
| `ALT-INVENTOR` | `G. Altshuller - And Suddenly the Inventor Appeared.pdf` | `G. Altshuller - And Suddenly the Inventor Appeared.md` | OCR через `pdftoppm` + `tesseract` | 172 страницы, примерно 59 345 слов | source normalized |
| `GADD` | `Karen Gadd - TRIZ for Engineers.pdf` | `Karen Gadd - TRIZ for Engineers.md` | `pdftotext -layout` | 19 898 строк, примерно 161 357 слов | source normalized; standalone toolkit exists |
| `ORLOV` | `M. A. Orlov - Основы классической ТРИЗ.pdf` | `M. A. Orlov - Основы классической ТРИЗ.md` | `pdftotext` | 12 400 строк, примерно 100 135 слов | source normalized |
| `HLYN` | `А. М. Хлыновский - Основы ТРИЗ.pdf` | `А. М. Хлыновский - Основы ТРИЗ.md` | `pdftotext` | 4 368 строк, примерно 27 663 слова | source normalized |
| `ALT-FRAG` | `G. Altshuller - Найти идею. Введение в ТРИЗ.fb2` | `G. Altshuller - Найти идею. Введение в ТРИЗ.md` | FB2 XML/text extraction | 389 строк, примерно 8 796 слов | source normalized; fragment only |

## Проверка по новому multi-book rule

- Source normalization: done; each local source has same-basename structured Markdown copy next to the original.
- Standalone detailed toolkit per source: done for all full TRIZ sources. `ALT-FRAG` is preserved as a separate `fragment-only` toolkit and cannot be the only source for a key combined conclusion.
- Coverage/dedupe layer: present in the unified toolkit under `Карта источников и дедупликация` and `Coverage map`; repeated ideas are described once with source codes.
- Navigation/quality layer: present through `Battle route`, `Training route`, `Tool selector`, `Excluded / limited source notes`, expanded anti-patterns and decision checklist.
- Practical sequencing: present; toolkit is organized from route selection and implementation cards into methods, reference sections, anti-patterns, cheatsheet and topic index.

## Standalone source toolkit map

| Код | Standalone toolkit | Статус |
|---|---|---|
| `ALT-RU-ALG` | `../altshuller-algoritm-izobreteniya/Алгоритм изобретения - Г. С. Альтшуллер - toolkit.md` | full standalone |
| `ALT-EN-ALG` | `../altshuller-innovation-algorithm/The Innovation Algorithm - Genrich Altshuller - toolkit.md` | full standalone |
| `ALT-EXACT` | `../altshuller-creativity-as-exact-science/Creativity as an Exact Science - G. S. Altshuller - toolkit.md` | full standalone, OCR caveat |
| `ALT-INVENTOR` | `../altshuller-and-suddenly-inventor-appeared/And Suddenly the Inventor Appeared - G. Altshuller - toolkit.md` | full standalone, OCR caveat |
| `GADD` | `../gadd-karen-triz-for-engineers/TRIZ for Engineers - Karen Gadd - toolkit.md` | full standalone |
| `ORLOV` | `../orlov-osnovy-klassicheskoy-triz/Основы классической ТРИЗ - М. А. Орлов - toolkit.md` | full standalone |
| `HLYN` | `../hlynovsky-osnovy-triz/Основы ТРИЗ - А. М. Хлыновский - toolkit.md` | full standalone |
| `ALT-FRAG` | `../altshuller-nayti-ideyu-fragment/Найти идею. Введение в ТРИЗ - Г. Альтшуллер - fragment toolkit.md` | fragment-only supporting source |

## Использование источников

- Классические источники Альтшуллера использованы как основа для противоречий, ИКР, ARIZ/ASIP, S-field, стандартов, законов развития и борьбы с психологической инерцией.
- Karen Gadd использована как основной инженерный слой применения: function analysis, Oxford Standard Solutions, 40 principles, 39 parameters, 76 standards, trimming, workflow.
- Орлов использован для Meta-ARIZ, CICO, реинвентинга, типовых ошибок и современной практической навигации.
- Хлыновский использован для компактной структуры ARIZ-85В, алгоритма применения 76 стандартов и терминологической сверки.
- `ALT-FRAG` использован только как дополнительная сверка базовых понятий, потому что файл содержит ознакомительный фрагмент, а не полную книгу.

## Ограничения

- Toolkit намеренно не содержит полных пересказов глав и длинных цитат.
- OCR-источники пригодны для концептуального извлечения, но при точной ссылке на формулировку нужно сверяться с локальным PDF или same-basename structured Markdown source copy.
- Нумерация и названия стандартов сведены в практическую форму; при патентной или учебной работе стоит сверять конкретный стандарт с оригинальным источником.
- Unified toolkit дедуплицирует повторяющиеся идеи. Если один метод встречается в нескольких книгах, он описан один раз, а источники указаны вместе.
- Future combined edits must start from the standalone toolkit map above, not from raw extracted texts directly. Если меняется общая тема, порядок применения или coverage, сначала обновить затронутые standalone toolkit'ы, затем пересобрать combined слой и coverage/dedupe notes.
