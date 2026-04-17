# TRIZ Case Library

## Speed vs Reliability

- Противоречие: ускорить conveyor flow, не снижая надёжность release path.
- Подход: предварительное действие + посредник.
- Вывод для ИТ: переносить дорогие проверки в preflight/checkpoint seams, а не убирать их из pipeline.

## Flexibility vs Determinism

- Противоречие: branch-chat должен быть разговорным, но process flow — строгим и воспроизводимым.
- Подход: преобразование параметров + стандартный интерфейс.
- Вывод для ИТ: natural-language layer должен маппиться на фиксированные scripts/contracts, а не на ad-hoc shell actions.

## Local Speed vs Shared Consistency

- Противоречие: task branch хочет быстро писать process notes, но shared docs нельзя перетирать конкурентно.
- Подход: предварительное действие + сегментация.
- Вывод для ИТ: capture artifacts локально, sync только в single-writer publish stage.
