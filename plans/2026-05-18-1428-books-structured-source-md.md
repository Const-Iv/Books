# Structured Markdown Source Copy For Books

## Связь с charter проекта

Изменение усиливает approved Books contour: книга превращается в применимый toolkit, а не в пересказ, при этом полный источник остаётся локальным рабочим материалом в ignored `runtime/books/`. Structured Markdown copy делает источник удобнее для будущего поиска агентом и сохраняет traceability без публикации полного текста в tracked `books/`.

## Цель изменения

Зафиксировать правило хранения: рядом с локальным исходником каждой книги должна лежать structured Markdown copy полного извлечённого текста, а тулкиты должны ссылаться на неё как на навигационный источник.

## Целевая аудитория проекта

Владелец Books и будущий агент, который возвращается к готовому toolkit и должен быстро найти место в книге, не открывая PDF/EPUB вручную.

## Продуктовая спека

- Локальный source bundle живёт в `runtime/books/<topic>/<book-slug>/`.
- Исходник и structured Markdown copy имеют одинаковый basename по правилу `<Автор> - <Название>`.
- Примеры: `<Автор> - <Название>.epub`, `<Автор> - <Название>.pdf`, `<Автор> - <Название>.md`.
- Автор и название берутся как в оригинале или на английском.
- Structured Markdown copy не является shareable product output и не коммитится в tracked `books/`.
- Оригинал рядом со structured `.md` сохраняется для `pdf`, `epub`, `fb2` и audio.
- Для TXT, DOCX, HTML and other formats после verified `.md` достаточно оставить `.md`, если owner отдельно не попросил сохранить такой оригинал; old extracted/debug `.txt` artifacts удаляются, кроме user-provided `.txt` original с явной причиной сохранить.
- `source-manifest.md` и ссылки в toolkit'ах указывают на local `.md` path plus heading/page/spine marker, если он известен.
- Большие дословные фрагменты книги не заменяются ссылками и не попадают в tracked toolkit.

## JTBD

Когда я или будущий агент возвращаюсь к toolkit, я хочу быстро найти исходное место в книге через structured Markdown copy, чтобы уточнить контекст и не превращать toolkit в полный пересказ.

## Job Stories

- Когда создаётся новый toolkit, я хочу видеть source-ссылки на локальный structured MD, чтобы быстро открыть нужную главу или место в книге.
- Когда исходная книга была PDF/EPUB, я хочу иметь рядом Markdown-копию с тем же именем, чтобы агент мог искать по тексту без ручного разбора бинарного файла.
- Когда toolkit попадает в Git, я хочу сохранить полный источник только локально, чтобы не публиковать полную книгу.

## User Stories

- Как пользователь Books, я получаю toolkit с понятными ссылками на локальный structured MD.
- Как будущий агент, я могу искать по `runtime/books/<topic>/<book-slug>/<Автор> - <Название>.md`.
- Как владелец проекта, я сохраняю границу: tracked `books/` содержит toolkit, ignored `runtime/books/` содержит оригинал и source copy.

## Критерии приемки

- Canonical sources фиксируют same-basename rule `<Автор> - <Название>` для исходника и structured Markdown copy.
- Canonical sources фиксируют original retention rule: keep originals for `pdf`, `epub`, `fb2` and audio; otherwise keep verified `.md`, unless owner explicitly asks to retain another original format.
- Canonical sources фиксируют, что toolkit source links должны вести на локальный `.md` path plus heading/page/spine marker.
- Mirror-документы синхронизированы с canonical rules.
- Правило не разрешает коммитить полный оригинал или structured full-text copy в tracked `books/`.

## План для агента

1. Обновить `.memory-bank/product-charter.md`, `.memory-bank/project-context.md`, `.memory-bank/architecture-map.md`, `.memory-bank/code-rules.md` и `.memory-bank/qa-playbook.md`.
2. Обновить `AGENTS.md`, `CODEX_MEMORY.md`, `README.md`, `CLAUDE.md` и `.cursorrules`.
3. Проверить `rg` по новому правилу и запустить ближайшие deterministic checks для docs/governance правки.

## Eval spec

- Agent surface: ответы и future workflow, где Codex сохраняет или объясняет Books source artifacts.
- Хороший ответ: говорит, что в `runtime/books/<topic>/<book-slug>/` лежит same-basename structured MD `<Автор> - <Название>.md`, originals рядом сохраняются для `pdf`, `epub`, `fb2` and audio, а toolkit links указывают на MD plus heading/page/spine marker.
- Провал: предлагает ссылаться только на PDF/EPUB, хранить PDF/TXT/DOCX originals после verified `.md`, коммитить full-text MD в `books/`, использовать произвольные имена вроде `original.md`, или превращать source copy в публичный toolkit output.
- Edge cases: автор или название на языке оригинала, английское название как fallback, PDF/EPUB с плохим metadata, неизвестный page marker.
- Сравнение old vs new: старый контракт требовал локальный оригинал и extracted text; новый recommended path добавляет named structured Markdown copy как навигационный source artifact.
- Minimum pass threshold: новое правило найдено в canonical sources и mirrors; QA evidence подтверждает, что docs синхронизированы.

## QA

- `rg -n "structured Markdown copy|<Автор> - <Название>|source-manifest.md.*\\.md|heading/page/spine" AGENTS.md CODEX_MEMORY.md README.md CLAUDE.md .cursorrules .memory-bank plans/2026-05-18-1428-books-structured-source-md.md`
- `rg -n "original retention|epub.*fb2.*audio|verified .*\\.md|extracted/debug" AGENTS.md CODEX_MEMORY.md README.md CLAUDE.md .cursorrules .memory-bank plans/2026-05-18-1428-books-structured-source-md.md`
- `npm run lint`
- `git diff --check`

## QA evidence

- PASS: `rg -n "structured Markdown copy|<Автор> - <Название>|source-manifest.md.*\\.md|heading/page/spine" AGENTS.md CODEX_MEMORY.md README.md CLAUDE.md .cursorrules .memory-bank plans/2026-05-18-1428-books-structured-source-md.md` — правило найдено в canonical sources, mirrors и plan file.
- PASS: `rg -n "original retention|epub.*fb2.*audio|verified .*\\.md|extracted/debug" AGENTS.md CODEX_MEMORY.md README.md CLAUDE.md .cursorrules .memory-bank plans/2026-05-18-1428-books-structured-source-md.md` — original retention rule найден в canonical sources, mirrors и plan file.
- PASS: `npm run lint` — `repo-lint: ok (135 files checked)`.
- PASS: `git diff --check`.
