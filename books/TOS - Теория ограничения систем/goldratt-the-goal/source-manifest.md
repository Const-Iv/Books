# The Goal - E.M. Goldratt - source manifest

## Что хранится в Git

- `The Goal - E.M. Goldratt - toolkit.md` — shareable toolkit на русском языке.
- Этот manifest — навигация по локальному оригиналу и правилам хранения.

## Что не хранится в Git

- Полный оригинал книги не коммитится.
- Локальный путь к оригиналу после finish-flow: `runtime/books/goldratt-the-goal/The Goal - E.M. Goldratt - original.txt`.
- Локальная рабочая копия toolkit после finish-flow: `runtime/books/goldratt-the-goal/The Goal - E.M. Goldratt - toolkit.md`.

## Почему так

Books должен помогать делиться toolkit'ами, но не превращать репозиторий в хранилище полных книг. Если нужно уточнить спорный концепт, используйте локальный оригинал из `runtime/books`; если нужно поделиться результатом, используйте tracked toolkit из этой папки.
