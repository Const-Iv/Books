# TRIZ for Engineers - Karen Gadd - source manifest

## Что хранится в Git

- `TRIZ for Engineers - Karen Gadd - toolkit.md` - shareable toolkit на русском языке.
- Этот manifest - навигация по локальному оригиналу и правилам хранения.

## Что не хранится в Git

- Полный оригинал книги не коммитится.
- Локальная копия PDF после текущего прогона: `runtime/books/gadd-karen-triz-for-engineers/Gadd_Karen_TRIZ_for_Engineers_original.pdf`.
- Локальный извлеченный текст после текущего прогона: `runtime/books/gadd-karen-triz-for-engineers/Gadd_Karen_TRIZ_for_Engineers_original.txt`.
- Локальный extraction report после текущего прогона: `runtime/books/gadd-karen-triz-for-engineers/extraction-report.json`.
- Локальная рабочая копия toolkit после текущего прогона: `runtime/books/gadd-karen-triz-for-engineers/TRIZ for Engineers - Karen Gadd - toolkit.md`.

## Почему так

Books должен помогать делиться toolkit'ами, но не превращать репозиторий в хранилище полных книг. Если нужно уточнить спорный концепт, используйте локальный оригинал из `runtime/books`; если нужно поделиться результатом, используйте tracked toolkit из этой папки.

## Проверка текущего прогона

- Формат входа: `PDF`.
- Название: `TRIZ for Engineers: Enabling Inventive Problem Solving`.
- Автор: `Karen Gadd`.
- Издатель: `John Wiley & Sons, Ltd.`
- Год: `2011`.
- Язык исходника: английский.
- Язык toolkit: русский.
- Страниц PDF: 496.
- Извлечено: 19 898 строк, примерно 161 357 слов.
- Оглавление: найдено.
- Метод извлечения: `pdftotext -layout`.
- Визуальная проверка: первые 8 страниц отрендерены через `pdftoppm`; страница оглавления проверена вручную.
