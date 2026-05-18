# Quality regeneration TRIZ toolkit plan

## Связь с charter проекта

Books должен превращать книгу или набор книг в применимый toolkit, а не summary. Для multi-book toolkit charter требует сначала подробные standalone toolkit'ы по каждой книге, затем отдельный combined toolkit с coverage map, дедупликацией и source traceability.

## Цель изменения

Исправить поверхностный staged слой TRIZ: пройти каждый источник отдельно, сделать standalone toolkit'ы достаточной глубины, затем собрать новый отдельный combined toolkit для сравнения со старым unified toolkit.

## JTBD

Когда у владельца есть несколько книг по TRIZ, он хочет получить не общий пересказ корпуса, а проверяемый рабочий набор инструментов: что применять, когда применять, как выбирать метод, где искать источник и какие идеи из каких книг действительно вошли в общий toolkit.

## Acceptance criteria

- Для каждого полного source создается или обновляется standalone toolkit с разделами: extraction report, usage layer, quick map, action cards after quick map, source/chapter map, frameworks, principles, patterns/techniques, anti-patterns, chapter/section takeaways, scenarios, cheatsheet, glossary, topic index, scope/limits.
- `ALT-FRAG` остается отдельным fragment-only supporting toolkit и не используется как единственный источник ключевой идеи.
- Новый combined toolkit создается отдельным artifact рядом со старым, чтобы можно было сравнить методики.
- Новый combined toolkit строится из standalone toolkit'ов, содержит coverage map, dedupe notes, excluded/limited source notes and practical sequence.
- Финальный отчет сравнивает старый и новый combined toolkit: coverage, depth, usability, source traceability, duplicates, actionability.
- Проверки подтверждают обязательные секции, source paths, отсутствие stale поверхностного blocker text and no large raw quote dump.

## Work order

1. Собрать source evidence: TOC, structure landmarks, key concepts and repeated framework markers по каждому source.
2. Переписать non-GADD standalone toolkit'ы quality-first, не ограничиваясь прежними короткими skeleton files.
3. Проверить существующий GADD toolkit на соответствие общей структуре и использовать его как high-quality source layer, не переписывая без необходимости.
4. Собрать новый separate combined toolkit: `triz-quality-combined-toolkit/`.
5. Сравнить `triz-unified-practical-toolkit` vs `triz-quality-combined-toolkit`.
6. Прогнать structural validation, `npm run lint`, `npm test`.

## Stop conditions

- Если source extraction не позволяет надежно разобрать книгу, зафиксировать blocker в соответствующем toolkit и не выдавать догадку за факт.
- Если объем одного источника требует дополнительного прохода, сохранить intermediate notes and continue; не заменять качественный разбор кратким summary.

