# Алгоритм изобретения - source manifest

## Что хранится в Git

- `Алгоритм изобретения - Г. С. Альтшуллер - toolkit.md` - shareable standalone toolkit на русском языке.
- Этот manifest - навигация по локальному source bundle и staged multi-book роли источника.

## Что не хранится в Git

- Полный оригинал книги не коммитится.
- Локальный исходник PDF: `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-algoritm-izobreteniya/G. S. Altshuller - Алгоритм изобретения.pdf`.
- Structured Markdown source copy: `runtime/books/TRIZ - Теория решения изобретательских задач/altshuller-algoritm-izobreteniya/G. S. Altshuller - Алгоритм изобретения.md`.
- Исторический extraction artifact остается в shared bundle: `runtime/books/TRIZ - Теория решения изобретательских задач/triz-unified-practical-toolkit/extracted/Algoritm_izobretenia.txt`.

## Проверка source bundle

| Поле | Значение |
|---|---|
| Source code | `ALT-RU-ALG` |
| Автор | `G. S. Altshuller` |
| Название | `Алгоритм изобретения` |
| Формат | `PDF` |
| Метод | `pdftotext` |
| Объем | 11 125 строк, примерно 66 705 слов |
| Статус оригинала | сохранен локально рядом со structured `.md` |
| Статус standalone | готов как staged input для combined TRIZ toolkit |

## Роль в combined toolkit

- Ранняя логика алгоритмического решения изобретательских задач.
- Переход от административной жалобы к мини-задаче.
- Технические и физические противоречия.
- Идеальность и идеальная машина.
- Психологическая инерция как управляемый риск.

## Ограничения

- Это source-specific toolkit, а не полный unified TRIZ corpus.
- Для точной цитаты или исторической формулировки проверять локальную source copy и PDF.
- В tracked artifact не включены большие фрагменты исходного текста.
