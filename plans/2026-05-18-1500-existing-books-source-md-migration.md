# Миграция разобранных Books-источников под structured Markdown rule

## Связь с charter проекта

Books должен превращать книгу в применимый рабочий toolkit, а не в пересказ. Для этого будущему агенту нужно быстро находить проверяемый локальный источник: рядом с каждым локальным исходником должна лежать structured Markdown copy полного извлеченного текста с тем же basename.

## Цель изменения

Проверить уже разобранные книги и привести их source bundles к новому правилу хранения: `runtime/books/<topic>/<book-slug>/<Автор> - <Название>.<ext>` и same-basename `<Автор> - <Название>.md`.

## Целевая аудитория проекта

Занятый пользователь, который возвращается к toolkit'у позже и хочет быстро уточнить идею по локальному источнику, не превращая Git в хранилище полных книг.

## Продуктовая спека

- Standalone toolkit'ы должны ссылаться на локальную structured Markdown copy, а не на старые extracted text filenames.
- Source manifest каждого разобранного standalone toolkit'а должен показывать normalized source name, structured Markdown source copy и статус проверки.
- Runtime source files переименовываются на месте, без параллельных normalized copies со старыми source-файлами рядом.
- Multi-book artifact получает честный статус: source normalization сделан, но полное соответствие staged multi-book rule требует отдельного quality-first regeneration pass для standalone toolkit'ов по non-GADD TRIZ sources.

## Что проверено и обновлено

- `goldratt-the-choice`: EPUB переименован в `E.M. Goldratt and E. Goldratt-Ashlag - The Choice.epub`; рядом создан `E.M. Goldratt and E. Goldratt-Ashlag - The Choice.md`; tracked toolkit и `source-manifest.md` указывают на structured Markdown copy.
- `goldratt-the-goal`: TXT-исходник нормализован в `E.M. Goldratt - The Goal.md`; отдельный `.txt` удален из runtime по TXT retention rule; tracked toolkit и `source-manifest.md` указывают на structured Markdown copy.
- `gadd-karen-triz-for-engineers`: PDF переименован в `Karen Gadd - TRIZ for Engineers.pdf`; рядом создан `Karen Gadd - TRIZ for Engineers.md`; tracked toolkit и `source-manifest.md` указывают на structured Markdown copy.
- `triz-unified-practical-toolkit`: все локальные source files в `sources/` переименованы в normalized `<Author> - <Title>` names; для каждого создана same-basename `.md`; старые extracted/reports/OCR intermediate artifacts удалены; unified `source-manifest.md` фиксирует coverage, dedupe, sequencing и blocker по staged standalone regeneration.

## Acceptance Criteria

- В tracked `books/` нет ссылок на старые source filenames.
- В current worktree runtime и основном runtime нет старых source filenames, временных renamed extracted text files и старых extracted/reports/OCR intermediate artifacts.
- Для каждого локального source file из текущих разобранных bundles существует same-basename `.md`.
- `npm run lint` проходит.
- `git diff --check` проходит.

## QA Evidence

- Structured source pair check: `retained original + md pairs ok: 20; Goal TXT removed and md retained in both roots`.
- Old tracked source-name search: no old source filenames remain in current worktree `books/` or main checkout `books/`.
- Runtime old source-name search: no old source filenames remain in current worktree runtime or `/Users/constantine.ivshin/!AI/Books/runtime/books`.
- Intermediate artifact search: no old `extracted/`, `reports/` or `ocr/` TRIZ intermediate artifact trees remain in current worktree runtime or `/Users/constantine.ivshin/!AI/Books/runtime/books`.
- Lint current worktree: `npm run lint` -> `repo-lint: ok (136 files checked)`.
- Lint main checkout: `npm run lint` -> `repo-lint: ok (133 files checked)`.
- Diff whitespace check current worktree and main checkout: `git diff --check` -> no output, exit 0.
