# Единый практический toolkit Голдратта - source manifest

## Что хранится в Git

- `Единый практический toolkit Голдратта - Theory of Constraints.md` - shareable combined toolkit на русском языке.
- Этот manifest - навигация по source bundle и правилам хранения.

## Что не хранится в Git

- Полные оригиналы книг не коммитятся.
- Локальные structured Markdown source copies:
  - `runtime/books/TOS - Теория ограничения систем/goldratt-the-goal/E.M. Goldratt - The Goal.md`
  - `runtime/books/TOS - Теория ограничения систем/goldratt-its-not-luck/E.M. Goldratt - It's Not Luck.md`
  - `runtime/books/TOS - Теория ограничения систем/goldratt-critical-chain/E.M. Goldratt - Critical Chain.md`
  - `runtime/books/TOS - Теория ограничения систем/goldratt-necessary-but-not-sufficient/E.M. Goldratt, E. Schragenheim and C.A. Ptak - Necessary but Not Sufficient.md`
  - `runtime/books/TOS - Теория ограничения систем/goldratt-the-choice/E.M. Goldratt and E. Goldratt-Ashlag - The Choice.md`
- Локальные originals, где retention rule требует хранить оригинал:
  - `runtime/books/TOS - Теория ограничения систем/goldratt-its-not-luck/E.M. Goldratt - It's Not Luck.pdf`
  - `runtime/books/TOS - Теория ограничения систем/goldratt-necessary-but-not-sufficient/E.M. Goldratt, E. Schragenheim and C.A. Ptak - Necessary but Not Sufficient.pdf`
  - `runtime/books/TOS - Теория ограничения систем/goldratt-the-choice/E.M. Goldratt and E. Goldratt-Ashlag - The Choice.epub`

## Staged source policy

Combined toolkit построен после standalone coverage-control layer:
- `goldratt-the-goal`
- `goldratt-its-not-luck`
- `goldratt-critical-chain`
- `goldratt-necessary-but-not-sufficient`
- `goldratt-the-choice`

Standalone toolkit'ы не являются depth ceiling: unified synthesis использует direct structured source copies and local originals, затем сверяется со standalone coverage.

## Проверка текущего source bundle

- Источников в combined layer: 5.
- Общий объём structured source layer: примерно 380k+ слов.
- Output language: русский.
- Большие raw excerpts не включены.
- Coverage map and dedupe notes включены в главный файл.
- Source references ведут к ignored runtime artifacts, а не к публикуемым полным текстам.
