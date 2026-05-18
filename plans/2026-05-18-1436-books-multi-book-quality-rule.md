# Multi-Book Toolkit And Quality-First Rule

## Связь с charter проекта

Изменение усиливает главный принцип Books: извлекать структуру применения, а не summary. Multi-book toolkit не должен быть быстрой склейкой нескольких пересказов; он должен сначала сохранить полноценный toolkit по каждой книге, а потом собрать общий практический набор под выбранной владельцем темой.

## Цель изменения

Зафиксировать правило для toolkit'ов из нескольких книг и общее правило качества: Books выбирает глубину разбора, coverage и практическую применимость выше скорости, времени ответа и экономии токенов.

## Целевая аудитория проекта

Занятый специалист, предприниматель, студент или самообучающийся читатель, который использует несколько книг как источник решений и хочет получить единый рабочий набор без потери ценных идей и без повторов.

## Продуктовая спека

- Для каждой книги сначала создаётся detailed standalone toolkit.
- Каждый standalone toolkit сохраняется по Books rules: tracked `books/<topic>/<book-slug>/`, ignored `runtime/books/<topic>/<book-slug>/`, structured Markdown source copy and source manifest.
- Combined toolkit создаётся только после standalone toolkit'ов.
- Общая идея или тема combined toolkit выбирается owner'ом; если её нет, агент останавливается и просит выбрать тему.
- Combined toolkit включает все идеи, которые проходят Books ranking как достойные внимания.
- Повторы объединяются без дублей, но source traceability сохраняется ко всем книгам, где идея встречается.
- Материал выстраивается практической последовательностью.
- Combined toolkit содержит coverage map and dedupe notes.
- Качество разбора важнее скорости, времени и экономии токенов; большой объём дробится на этапы с сохранением intermediate artifacts and coverage notes.

## JTBD

Когда у меня есть несколько книг по одной идее или теме, я хочу сначала получить полноценный toolkit по каждой книге, а затем общий практический набор без пропусков и повторов, чтобы использовать их как цельную систему действий.

## Job Stories

- Когда я даю несколько книг, я хочу сохранить отдельный toolkit по каждой, чтобы ни одна книга не растворилась в общей компиляции.
- Когда я выбираю общую тему, я хочу получить единый toolkit, где идеи не повторяются и идут в удобном порядке применения.
- Когда разбор большой, я хочу, чтобы агент не экономил время и токены ценой качества, чтобы итог был пригоден для работы.

## User Stories

- Как пользователь Books, я вижу отдельные toolkit'ы по каждой книге и общий combined toolkit.
- Как пользователь Books, я вижу coverage map: какие идеи из каких книг вошли в общий набор.
- Как пользователь Books, я получаю практическую последовательность, а не список разрозненных заметок.

## Критерии приемки

- Canonical sources фиксируют staged multi-book workflow.
- Canonical sources фиксируют quality-first rule.
- Combined toolkit contract требует coverage map, dedupe notes, source traceability and practical sequence.
- Mirror-документы синхронизированы.
- Rule не разрешает делать быстрый summary или пропускать standalone toolkit'ы.

## План для агента

1. Обновить `.memory-bank/product-charter.md`, `.memory-bank/project-context.md`, `.memory-bank/architecture-map.md`, `.memory-bank/code-rules.md` и `.memory-bank/qa-playbook.md`.
2. Обновить `AGENTS.md`, `CODEX_MEMORY.md`, `README.md`, `CLAUDE.md` и `.cursorrules`.
3. Проверить `rg` по new multi-book / quality-first rules.
4. Запустить `npm run lint` and `git diff --check`.

## Eval spec

- Agent surface: ответы и future workflow, где Codex создаёт или объясняет toolkit из нескольких книг.
- Хороший ответ: сначала предлагает или выполняет standalone toolkit по каждой книге, сохраняет их по Books rules, затем просит/использует owner-selected theme and creates combined toolkit with coverage map, dedupe notes, source traceability and practical sequence.
- Провал: сразу объединяет raw books в один summary, пропускает standalone toolkit'ы, теряет source traceability, оставляет повторы, экономит время/токены ценой качества or proceeds without selected theme.
- Edge cases: owner не указал общую тему; две книги повторяют одну модель разными словами; одна книга слабее извлечена; контекст слишком большой для одного прохода.
- Regression examples / golden prompts: `Сделай toolkit по этим трём книгам`; `Быстро объедини эти книги в один краткий summary`; `Сделай общий toolkit по теме decision making из этих книг`; `Не трать много токенов, просто собери главное`.
- Comparison method: compare old behavior that could synthesize directly from several books vs new staged workflow with per-book toolkit first and coverage-controlled synthesis.
- Minimum pass threshold: все canonical/mirror docs contain the staged multi-book rule and quality-first rule; checks pass.

## QA

- `rg -n "Multi-book|multi-book|нескольких книг|standalone toolkit|combined toolkit|quality-first|качество разбора|экономии токенов|coverage map|dedupe" AGENTS.md CODEX_MEMORY.md README.md CLAUDE.md .cursorrules .memory-bank plans/2026-05-18-1436-books-multi-book-quality-rule.md`
- `npm run lint`
- `git diff --check`

## QA evidence

- PASS: `rg -n "Multi-book|multi-book|нескольких книг|standalone toolkit|combined toolkit|quality-first|качество разбора|экономии токенов|coverage map|dedupe" AGENTS.md CODEX_MEMORY.md README.md CLAUDE.md .cursorrules .memory-bank plans/2026-05-18-1436-books-multi-book-quality-rule.md` — правило найдено в canonical sources, mirrors and plan file.
- PASS: `npm run lint` — `repo-lint: ok (135 files checked)`.
- PASS: `git diff --check`.
