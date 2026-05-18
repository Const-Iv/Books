# Runtime Books Topic Hierarchy

## Связь с charter проекта

Изменение сохраняет approved Books contour: готовые shareable toolkit'и остаются в tracked `books/<topic>/<book-slug>/`, а полные оригиналы и рабочие материалы остаются только в ignored `runtime/books/`. Это поддерживает миссию Books: превращать книгу в применимый toolkit, не превращая репозиторий в хранилище полных книг.

## Цель изменения

Сделать локальные оригиналы и рабочие материалы проще для поиска: `runtime/books/` должен повторять тематическую иерархию `books/`.

## Целевая аудитория проекта

Занятый читатель или владелец локального прототипа, которому нужно быстро найти исходник книги рядом с готовым toolkit'ом по той же теме.

## Продуктовая спека

- Новый storage contract: `runtime/books/<topic>/<book-slug>/`.
- Tracked artifacts остаются в `books/<topic>/<book-slug>/`.
- Полные оригиналы не переносятся в tracked `books/`.
- `source-manifest.md` и ссылки внутри toolkit'ов должны указывать на новый локальный путь.
- Finish-flow должен продолжать переносить весь ignored `runtime/books/` без silent overwrite и без потери конфликтующих файлов.

## План для агента

1. Перенести текущие локальные папки из `runtime/books/<book-slug>/` в соответствующие `runtime/books/<topic>/<book-slug>/`.
2. Обновить манифесты и ссылки в текущих toolkit'ах.
3. Обновить canonical правила и mirror-документы, где storage contract явно описан как `runtime/books/<book-slug>/`.
4. Обновить тесты preservation-flow на новую вложенность.
5. Прогнать ближайшие deterministic проверки.

## Eval spec

- Agent surface: ответы и future workflow, где Codex объясняет или использует local Books storage.
- Хороший ответ: говорит, что shareable toolkit лежит в `books/<topic>/<book-slug>/`, а локальные оригиналы и рабочие материалы лежат в `runtime/books/<topic>/<book-slug>/`.
- Провал: предлагает искать полный оригинал в tracked `books/`, называет старый плоский путь `runtime/books/<book-slug>/` как новый стандарт или предлагает коммитить полные книги.
- Edge cases: уже существующий destination path, конфликтующие файлы при finish-flow, legacy runtime папка без темы.
- Сравнение old vs new: старый ответ допустимо упоминать только как legacy; новый recommended path должен быть тематическим.
- Minimum pass threshold: все явные storage references в canonical/mirror docs и current toolkit manifests используют новую тематическую структуру; tests подтверждают copy preservation для nested runtime path.

## QA

- `node --test tests/unit/books-artifacts.test.mjs`
- `node --test tests/integration/books-artifacts-finish.test.mjs`
- `npm run lint`
- `npm run typecheck`
- `npm test`

## QA evidence

- PASS: `node --test tests/unit/books-artifacts.test.mjs` — 2 tests passed.
- PASS: `node --test tests/integration/books-artifacts-finish.test.mjs` — 1 test passed.
- NOTE: `npm run lint:changed` is not defined in this repository; nearest available changed-file script is `npm run lint:fix:changed`, and final validation used full repo lint instead.
- PASS: `npm run lint` — `repo-lint: ok (130 files checked)`.
- PASS: `npm run typecheck`.
- PASS: `npm test` — 45 tests passed.
