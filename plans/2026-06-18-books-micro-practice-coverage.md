# Books micro-practice coverage

## Связь с charter проекта

Books должен превращать книгу в применимый рабочий toolkit, а не в summary. Запрос усиливает миссию и JTBD: пользователь хочет быстро находить конкретные практики и применять их, даже если заранее не знает, как они называются в книге.

## Цель изменения

Не терять микро-лайфхаки, named concepts и practical imperatives внутри крупных framework'ов. Пример дефекта: `гемба / иди и смотри` была в source внутри блока PDCA, но не получила отдельного статуса в toolkit.

## JTBD

Когда в книге есть маленькая, но применимая практика, я хочу, чтобы Books нашёл её и показал, куда она попала, чтобы не пропустить полезное действие из-за слишком крупной группировки.

## Job Stories

- Когда source содержит named concept или авторскую метафору, пользователь должен увидеть отдельную карточку, явное включение в более широкий инструмент или причину исключения.
- Когда практика вложена в подзаголовок большого framework, агент должен рассматривать подзаголовок как отдельный actionable block.
- Когда candidate не попал в toolkit, QA должен показать unresolved item, а не молча считать toolkit готовым.

## User Stories

- Как пользователь Books, я могу спросить про конкретную практику после генерации и увидеть, что она была покрыта.
- Как будущий агент, я могу открыть coverage notes и понять, почему practice стала карточкой, folded item или excluded item.

## Критерии приемки

- `src/books/toolkit/toolkit-contract.mjs` фиксирует micro-practice triggers and allowed statuses.
- Prompt rules требуют Micro-practice pass before synthesis.
- Contract validation fails when micro-practice coverage gate is missing or unresolved candidates remain.
- Canonical governance files mention `card | folded_into | excluded_with_reason`.

## Eval spec

- Agent surface: Books toolkit generation and review.
- Good answer: source-derived micro-practice receives `card`, `folded_into`, or `excluded_with_reason` with source traceability.
- Failure: named concept exists in structured Markdown source, but final toolkit and coverage notes do not mention it.
- Golden prompt: `есть что-то про гембу? почему это не попало в toolkit?`
- Edge case: source uses an imperative phrase without a named concept, for example `покликайте проект сами`.
- Comparison method: old behavior allowed one broad PDCA card; new behavior requires explicit candidate status.
- Minimum pass threshold: all micro-practice candidates in the checked sample have one allowed status.

## QA evidence

- `node --test tests/unit/books-toolkit-contract.test.mjs` — PASS. Проверяет prompt rules, allowed statuses, missing micro-practice gate and unresolved candidate failure.
- `npm run qa:agent` — PASS. Проверяет lint, changed-file normalization, typecheck, full unit/integration test suite and build.
- `git diff --check` — PASS. Проверяет отсутствие whitespace/conflict-marker проблем после финального plan update.
