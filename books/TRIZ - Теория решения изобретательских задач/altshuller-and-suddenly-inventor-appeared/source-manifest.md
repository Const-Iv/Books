# And Suddenly the Inventor Appeared - source manifest

## Что хранится в Git

- `And Suddenly the Inventor Appeared - G. Altshuller - toolkit.md` - shareable standalone toolkit на русском языке.
- Этот manifest - навигация по локальному source bundle и staged multi-book роли источника.

## Что не хранится в Git

- Полный оригинал книги не коммитится.
- Локальный исходник PDF: `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-and-suddenly-inventor-appeared/G. Altshuller - And Suddenly the Inventor Appeared.pdf`.
- Structured Markdown source copy: `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-and-suddenly-inventor-appeared/G. Altshuller - And Suddenly the Inventor Appeared.md`.
- Исторические OCR artifacts остаются в shared bundle: `runtime/books/TRIZ - Теория решения изобретательских задач/triz-unified-practical-toolkit/ocr/inventor-*`.

## Проверка source bundle

| Поле | Значение |
|---|---|
| Source code | `ALT-INVENTOR` |
| Автор | `G. Altshuller` |
| Название | `And Suddenly the Inventor Appeared` |
| Формат | `PDF` |
| Метод | OCR через `pdftoppm` + `tesseract` |
| Объем | 172 страницы, примерно 59 345 слов |
| Оглавление | найдено, OCR pages 006-007 |
| Статус оригинала | сохранен локально рядом со structured `.md` |
| Статус standalone | готов как staged input для combined TRIZ toolkit |

## Роль в combined toolkit

- Practical introduction to TRIZ.
- Technical contradictions.
- M-field / S-field alphabet.
- Ideal final result.
- STC operator.
- Little-men modeling and training tasks.

## Ограничения

- OCR-source: точные формулировки нужно сверять с локальным PDF.
- В tracked artifact не включены большие фрагменты исходного текста.

