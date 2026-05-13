# The Choice - E.M. Goldratt and E. Goldratt-Ashlag - source manifest

## Что хранится в Git

- `The Choice - E.M. Goldratt and E. Goldratt-Ashlag - toolkit.md` - shareable toolkit на русском языке.
- Этот manifest - навигация по локальному оригиналу и правилам хранения.

## Что не хранится в Git

- Полный оригинал книги не коммитится.
- Локальная копия EPUB после текущего прогона: `runtime/books/goldratt-the-choice/Goldratt_ashlag_Ye._Biznesroman._Vyibor_Pravila_Goldratta.epub`.
- Локальный извлеченный текст после текущего прогона: `runtime/books/goldratt-the-choice/The Choice - E.M. Goldratt - original.txt`.
- Локальный extraction report после текущего прогона: `runtime/books/goldratt-the-choice/extraction-report.json`.
- Локальная рабочая копия toolkit после текущего прогона: `runtime/books/goldratt-the-choice/The Choice - E.M. Goldratt and E. Goldratt-Ashlag - toolkit.md`.

## Почему так

Books должен помогать делиться toolkit'ами, но не превращать репозиторий в хранилище полных книг. Если нужно уточнить спорный концепт, используйте локальный оригинал из `runtime/books`; если нужно поделиться результатом, используйте tracked toolkit из этой папки.

## Проверка текущего прогона

- Формат входа: `EPUB`.
- Название в metadata: `Выбор. Правила Голдратта`.
- Авторы в metadata: `Элияху Голдратт, Эфрат Голдратт-Ашлаг`.
- Язык исходника: русский.
- Язык toolkit: русский.
- Извлечено: 38 текстовых spine items, примерно 44 247 слов.
- Оглавление: найдено.
