# TRIZ for Engineers - Karen Gadd - source manifest

## Что хранится в Git

- `TRIZ for Engineers - Karen Gadd - toolkit.md` - shareable toolkit на русском языке.
- Этот manifest - навигация по локальному source bundle и правилам хранения.

## Что не хранится в Git

- Полный оригинал книги не коммитится.
- Локальный исходник PDF: `runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers/Karen Gadd - TRIZ for Engineers.pdf`.
- Structured Markdown source copy для поиска и ссылок: `runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers/Karen Gadd - TRIZ for Engineers.md`.
- Локальный extraction report: `runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers/extraction-report.json`.
- Локальная рабочая копия toolkit: `runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers/TRIZ for Engineers - Karen Gadd - toolkit.md`.

## Почему так

Books должен помогать делиться toolkit'ами, но не превращать репозиторий в хранилище полных книг. Если нужно уточнить спорный концепт, используйте structured Markdown source copy из `runtime/books`; если нужно поделиться результатом, используйте tracked toolkit из этой папки.

## Проверка текущего source bundle

- Формат входа: `PDF`.
- Название: `TRIZ for Engineers: Enabling Inventive Problem Solving`.
- Автор: `Karen Gadd`.
- Издатель: `John Wiley & Sons, Ltd.`.
- Год: `2011`.
- Нормализованное имя source bundle: `Karen Gadd - TRIZ for Engineers`.
- Язык исходника: английский.
- Язык toolkit: русский.
- Structured Markdown source copy создана рядом с исходником и имеет тот же basename.
- Страниц PDF: 496.
- Извлечено: 19 898 строк, примерно 161 357 слов.
- Оглавление: найдено.
- Метод извлечения: `pdftotext -layout`.
- Визуальная проверка: первые 8 страниц отрендерены через `pdftoppm`; страница оглавления проверена вручную.
