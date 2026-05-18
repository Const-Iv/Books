# Сравнение: старый unified toolkit vs новый quality staged combined toolkit

Статус после объединения: старый `triz-unified-practical-toolkit` больше не является только "старой методикой". Он стал master toolkit: сохранил свою справочную глубину и получил навигационный слой нового staged toolkit - `Battle route`, `Training route`, `Tool selector`, `Coverage map`, `Excluded / limited source notes`, усиленные anti-patterns and verification checklist.

## Что сравнивается

Старая методика:
- `../triz-unified-practical-toolkit/Единый практический toolkit TRIZ - по нескольким книгам.md`
- Исторически собран как единый toolkit по raw multi-book source bundle, позже получил staged/source map metadata.

Новая методика:
- `TRIZ - quality staged combined toolkit.md`
- Собран после quality-first standalone pass по каждому source layer.

## Короткий вывод

До объединения новый quality staged combined toolkit был лучше как Books artifact: он сильнее по traceability, route selection, source coverage, дедупликации и практическому применению. Старый unified toolkit был сильнее как справочник: в нем больше готового материала по 40 приемам, 39 параметрам, 76 стандартам, ARIZ and Meta-ARIZ.

После объединения лучшая версия для практической работы - обновленный старый unified master: он сохраняет справочную полноту старого и добавляет управляющую механику нового. Отдельный новый staged toolkit остается полезным как контрольный reference того, какие слои были добавлены.

## Сравнение по критериям Books

| Критерий | Старый unified | Новый quality staged | Лучше |
|---|---|---|---|
| Standalone-first методика | Добавлена постфактум | Использована как основа сборки | Новый |
| Source traceability | Source codes есть, но общий слой был собран напрямую | Каждый блок идет через standalone source layers | Новый |
| Coverage map | Есть `Карта источников и дедупликация` | Есть coverage map plus limited-source notes | Новый |
| Дедупликация | Идеи объединены, но меньше объяснений по повторяющимся слоям | Есть dedupe notes по ключевым идеям | Новый |
| Практический route selector | Есть единый workflow | Есть quick map + tool selector + route table | Новый |
| Справочная полнота | Больше справочных списков в одном файле | Меньше таблиц, больше decision logic | Старый для справочника |
| Anti-patterns | Есть | Есть, но tied to method selection and source errors | Новый |
| `ALT-FRAG` handling | Отмечен как неполный | Fragment-only role встроена в quality gate | Новый |
| Training layer | Есть частично | Task cards/reinvention separated from battle route | Новый |
| Readability for action | Хорошая, но dense | Более decision-oriented | Новый |

## Что стало лучше в новом

1. Убрана методическая слабость: combined больше не выглядит как прямой synthesis из raw books.
2. Появился явный selector: когда использовать matrix, CICO, S-field, standards, effects, Meta-ARIZ, ARIZ-85В, STC, little-men.
3. Идеи разных источников перестали конкурировать: `GADD` отвечает за engineering workflow, `ORLOV` за Meta-ARIZ/CICO/verification, `HLYN` за compact ARIZ/matrix/standards structure, `ALT-EXACT` за S-field/standards/effects, `ALT-INVENTOR` за training/STC/little-men.
4. `ALT-FRAG` больше не рискует стать false evidence: он только supporting framing.
5. Verification стала частью процесса, а не финальной рекомендацией.

## Где старый пока сильнее

1. В старом unified больше справочного материала по 40 приемам, 39 параметрам, 76 стандартам and ARIZ blocks.
2. Старый полезен как dense reference sheet.
3. Новый лучше как operating toolkit, но если нужна большая справочная таблица внутри одного файла, старый может быть удобнее.

## Итоговая оценка

До объединения для цели Books charter - применимый reusable toolkit с source traceability - **новая методика была лучше**.

После объединения **обновленный старый unified master лучше обоих исходных вариантов**, потому что:
- старый не урезан и сохраняет глубокие справочные разделы;
- новый добавлен как навигационный и quality слой, а не как замена;
- быстрый пользователь идет через route selector and checklist;
- глубокий пользователь остается внутри полных старых разделов.

Практическое решение:
- Использовать обновленный `../triz-unified-practical-toolkit/Единый практический toolkit TRIZ - по нескольким книгам.md` как основной master toolkit.
- Оставить `TRIZ - quality staged combined toolkit.md` как отдельный контрольный staged reference.
- При будущих изменениях сначала проверять standalone source layers, затем обновлять master coverage/source notes.
