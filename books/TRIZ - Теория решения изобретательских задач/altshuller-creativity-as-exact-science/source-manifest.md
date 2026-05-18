# Creativity as an Exact Science - source manifest

## Что хранится в Git

- `Creativity as an Exact Science - G. S. Altshuller - toolkit.md` - shareable standalone toolkit на русском языке.
- Этот manifest - навигация по локальному source bundle и staged multi-book роли источника.

## Что не хранится в Git

- Полный оригинал книги не коммитится.
- Локальный исходник PDF: `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-creativity-as-exact-science/G. S. Altshuller - Creativity as an Exact Science.pdf`.
- Structured Markdown source copy: `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-creativity-as-exact-science/G. S. Altshuller - Creativity as an Exact Science.md`.
- Исторические OCR artifacts остаются в shared bundle: `runtime/books/TRIZ - Теория решения изобретательских задач/triz-unified-practical-toolkit/ocr/creativity-*`.

## Проверка source bundle

| Поле | Значение |
|---|---|
| Source code | `ALT-EXACT` |
| Автор | `G. S. Altshuller` |
| Название | `Creativity as an Exact Science` |
| Формат | `PDF` |
| Метод | OCR через `pdftoppm` + `tesseract` |
| Объем | 379 страниц, примерно 80 847 слов |
| Оглавление | найдено, OCR pages 004-007 |
| Статус оригинала | сохранен локально рядом со structured `.md` |
| Статус standalone | готов как staged input для combined TRIZ toolkit |

## Роль в combined toolkit

- S-field analysis.
- ASIP/ARIZ-77.
- Standards for inventive problems.
- Laws of technical system development.
- Physical effects.
- Tactics of invention and little-men modeling.

## Ограничения

- OCR-source: точные формулировки нужно сверять с локальным PDF.
- В tracked artifact не включены большие фрагменты исходного текста.

