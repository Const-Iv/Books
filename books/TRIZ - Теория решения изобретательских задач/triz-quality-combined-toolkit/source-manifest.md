# TRIZ quality staged combined toolkit - source manifest

## Что хранится в Git

- `TRIZ - quality staged combined toolkit.md` - новый отдельный сборный toolkit после quality-first standalone pass.
- `source-manifest.md` - эта навигация по source layers.
- `comparison-old-vs-new.md` - сравнение старой и новой методики сборки.

## Что не хранится в Git

- Полные originals and structured Markdown source copies лежат в ignored `runtime/books/TRIZ - Теория решения изобретательских задач/<book-slug>/`.
- Legacy shared extracted/OCR artifacts могут оставаться в ignored runtime как проверочный след, но canonical source для новых правок - same-basename `.md` рядом с original.

## Standalone source layers

| Код | Standalone toolkit | Runtime source copy | Статус |
|---|---|---|---|
| `ALT-RU-ALG` | `../altshuller-algoritm-izobreteniya/Алгоритм изобретения - Г. С. Альтшуллер - toolkit.md` | `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-algoritm-izobreteniya/G. S. Altshuller - Алгоритм изобретения.md` | full quality pass |
| `ALT-EN-ALG` | `../altshuller-innovation-algorithm/The Innovation Algorithm - Genrich Altshuller - toolkit.md` | `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-innovation-algorithm/Genrich Altshuller - The Innovation Algorithm.md` | full quality pass |
| `ALT-EXACT` | `../altshuller-creativity-as-exact-science/Creativity as an Exact Science - G. S. Altshuller - toolkit.md` | `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-creativity-as-exact-science/G. S. Altshuller - Creativity as an Exact Science.md` | full quality pass, OCR caveat |
| `ALT-INVENTOR` | `../altshuller-and-suddenly-inventor-appeared/And Suddenly the Inventor Appeared - G. Altshuller - toolkit.md` | `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-and-suddenly-inventor-appeared/G. Altshuller - And Suddenly the Inventor Appeared.md` | full quality pass, OCR caveat |
| `GADD` | `../gadd-karen-triz-for-engineers/TRIZ for Engineers - Karen Gadd - toolkit.md` | `runtime/books/TRIZ - Теория решения изобретательских задач/gadd-karen-triz-for-engineers/Karen Gadd - TRIZ for Engineers.md` | existing detailed standalone, reused |
| `ORLOV` | `../orlov-osnovy-klassicheskoy-triz/Основы классической ТРИЗ - М. А. Орлов - toolkit.md` | `runtime/books/TRIZ - Теория решения изобретательских задач/orlov-osnovy-klassicheskoy-triz/M. A. Orlov - Основы классической ТРИЗ.md` | full quality pass |
| `HLYN` | `../hlynovsky-osnovy-triz/Основы ТРИЗ - А. М. Хлыновский - toolkit.md` | `runtime/books/TRIZ - Теория решения изобретательских задач/hlynovsky-osnovy-triz/А. М. Хлыновский - Основы ТРИЗ.md` | full quality pass |
| `ALT-FRAG` | `../altshuller-nayti-ideyu-fragment/Найти идею. Введение в ТРИЗ - Г. Альтшуллер - fragment toolkit.md` | `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-nayti-ideyu-fragment/G. Altshuller - Найти идею. Введение в ТРИЗ.md` | fragment-only supporting source |

## Quality gate

- Combined toolkit built after standalone source layers.
- `ALT-FRAG` is supporting-only.
- Combined file includes coverage map, dedupe notes, limited-source notes, action cards, anti-patterns, scenarios, cheatsheet, glossary and topic index.
- No full source text or long quotes are included.
