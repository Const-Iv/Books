# The Goal - E.M. Goldratt - source manifest

## Что хранится в Git

- `The Goal - E.M. Goldratt - toolkit.md` - shareable toolkit на русском языке.
- Этот manifest - навигация по локальному source bundle и правилам хранения.

## Что не хранится в Git

- Полный оригинал книги не коммитится.
- Structured Markdown source copy для поиска и ссылок: `runtime/books/TOS - Теория ограничения систем/goldratt-the-goal/E.M. Goldratt - The Goal.md`.
- Локальная рабочая копия toolkit после finish-flow: `runtime/books/TOS - Теория ограничения систем/goldratt-the-goal/The Goal - E.M. Goldratt - toolkit.md`.

## Почему так

Books должен помогать делиться toolkit'ами, но не превращать репозиторий в хранилище полных книг. Если нужно уточнить спорный концепт, используйте structured Markdown source copy из `runtime/books`; если нужно поделиться результатом, используйте tracked toolkit из этой папки.

## Проверка текущего source bundle

- Исходный формат: `TXT`.
- Нормализованное имя source bundle: `E.M. Goldratt - The Goal`.
- Язык toolkit: русский.
- Structured Markdown source copy создана и проверена.
- TXT-исходник удален из runtime по Books retention rule: для TXT после verified `.md` отдельный original/extracted `.txt` не хранится без явной owner-причины.
