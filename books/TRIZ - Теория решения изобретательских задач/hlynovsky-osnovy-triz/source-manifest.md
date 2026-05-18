# Основы ТРИЗ - source manifest

## Что хранится в Git

- `Основы ТРИЗ - А. М. Хлыновский - toolkit.md` - shareable standalone toolkit на русском языке.
- Этот manifest - навигация по локальному source bundle и staged multi-book роли источника.

## Что не хранится в Git

- Полный оригинал книги не коммитится.
- Локальный исходник PDF: `runtime/books/TRIZ - Теория решения изобретательских задач/hlynovsky-osnovy-triz/А. М. Хлыновский - Основы ТРИЗ.pdf`.
- Structured Markdown source copy: `runtime/books/TRIZ - Теория решения изобретательских задач/hlynovsky-osnovy-triz/А. М. Хлыновский - Основы ТРИЗ.md`.
- Исторический extraction artifact остается в shared bundle: `runtime/books/TRIZ - Теория решения изобретательских задач/triz-unified-practical-toolkit/extracted/А. М. Хлыновский Основы ТРИЗ.txt`.

## Проверка source bundle

| Поле | Значение |
|---|---|
| Source code | `HLYN` |
| Автор | `А. М. Хлыновский` |
| Название | `Основы ТРИЗ` |
| Формат | `PDF` |
| Метод | `pdftotext` |
| Объем | 4 368 строк, примерно 27 663 слова |
| Оглавление | найдено, `ОГЛАВЛЕНИЕ` |
| Статус оригинала | сохранен локально рядом со structured `.md` |
| Статус standalone | готов как staged input для combined TRIZ toolkit |

## Роль в combined toolkit

- Compact TRIZ learning map.
- Technical system functions.
- ARIZ-85В structure.
- Matrix and contradiction tools.
- Standards application algorithm.
- Glossary checkpoint.

## Ограничения

- Это учебный compact-source, а не полный corpus TRIZ.
- Для точной цитаты проверять локальную source copy и PDF.
- В tracked artifact не включены большие фрагменты исходного текста.
