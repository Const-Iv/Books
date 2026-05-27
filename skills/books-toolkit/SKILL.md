---
name: books-toolkit
description: Use when creating, updating, or reviewing Books practical toolkit artifacts, source manifests, extraction reports, examples from books, glossary placement, or automation checklists for single-book and multi-book toolkit generation.
---

# Books Toolkit

## Charter Fit

Books turns a user-provided book into a Russian practical toolkit, not a summary. Preserve source traceability, do not reproduce large raw excerpts, and optimize for application: models, principles, techniques, anti-patterns, scenarios, cheatsheets, glossary, and topic index.

## When To Use

Use this skill for:
- creating or retrofitting a single-book Books toolkit;
- creating a combined multi-book toolkit;
- adding book examples to action cards or frameworks;
- deciding where glossary, source notes, QA notes, and automation notes belong;
- reviewing whether a toolkit is reader-facing or polluted with internal process backlog.

## Required Reads

Before changing a Books toolkit, read:
1. `.memory-bank/product-charter.md`;
2. `AGENTS.md`;
3. `CODEX_MEMORY.md`;
4. the tracked toolkit under `books/<topic>/<book-slug>/`;
5. `source-manifest.md` and the structured Markdown source copy under `runtime/books/<topic>/<book-slug>/` when examples or source claims are being added.

## Reader-Facing Toolkit Order

For a single-book toolkit, keep the reader-facing order practical:
1. `Отчет извлечения`;
2. `Как пользоваться toolkit` with `Battle route` and `Training route`;
3. `Glossary` immediately after the usage block, so the reader learns terms before the toolkit body;
4. `Быстрая карта`;
5. `Tool selector`;
6. `Лайфхаки, приемы и инструменты к внедрению`;
7. deep reference body: frameworks, principles, techniques, anti-patterns, scenarios, cheatsheet, topic index, scope/limits.

Do not put internal automation backlog in the reader-facing toolkit. Move it to this skill, plans, or operator notes.

## Examples From The Book

For retrofit-only runs on already finished toolkits, limit edits to examples in exactly two reader-facing areas:
- action cards in `Лайфхаки, приемы и инструменты к внедрению`;
- entries in `Frameworks автора` / `Frameworks`, or the existing framework-equivalent section only when the toolkit already uses one (`Deep reference body`, `Единый рабочий процесс`, etc.).

Do not create a new framework section solely for a retrofit. If a toolkit has no explicit framework or framework-equivalent section, enrich only the action cards and record the gap in the operator-facing completion note. Do not correct, reorder, rename, rewrite, or polish existing toolkit content during that pass. If an existing point looks weak, leave it unchanged and add only the best source-faithful `Пример из книги` that explains the current point. If the current point cannot be supported by the source, add a short `Пример из книги` note that says the source support was not found instead of silently changing the point.

Action cards must include a source-specific mini-scene:
- `Что внедрить`;
- `Пример из книги`;
- `Когда применять`;
- `Первый шаг`;
- `Источник / где искать в книге`.

Framework sections must also include `Пример из книги` for each core essence block, even when the label is `Суть`, `Модель`, `Процесс`, `Cost world`, `Throughput world`, or `Вопросы`. The example should make the framework understandable without rereading the book.

Example quality bar:
- paraphrase the scene; do not copy long source text;
- name concrete book events, people, decisions, or conflicts;
- connect the scene to the toolkit concept explicitly;
- prefer 4-8 short sentences or enough detail to be self-contained;
- if the source does not support a concrete example, mark the gap instead of inventing one.

## Source And Storage Contract

- Tracked shareable artifacts live under `books/<topic>/<book-slug>/`.
- Local originals, structured source copies, and working artifacts live under ignored `runtime/books/<topic>/<book-slug>/`.
- The structured Markdown source copy should share basename with the original: `<Author> - <Title>.<ext>` and `<Author> - <Title>.md`.
- `source-manifest.md` and toolkit source fields should point to the local structured Markdown source copy plus heading/page/spine marker when available.
- Preserve existing reader-facing content during retrofits unless the user explicitly approves edits beyond the requested layer.

## Automation Checklist

For future automatic Books runs, keep this checklist in the skill/operator layer, not in the toolkit:
1. Deterministic source convention: retained originals use `runtime/books/<topic>/<book-slug>/<Author> - <Title>.<ext>` and same-basename `<Author> - <Title>.md`; verified TXT-like sources can use the structured `.md` as canonical local source.
2. Extraction report generator for TXT/PDF/EPUB and any approved future formats.
3. Chapter parser that distinguishes page numbers from chapter numbers.
4. No-overwrite naming policy for tracked and runtime artifacts.
5. Template for required toolkit sections and field order.
6. QA check: source copied, final toolkit exists, no large raw excerpts, action cards present, book examples present, glossary/patterns/cheatsheet/topic index present.
7. Optional later adapter decision for model/provider if generation becomes product runtime.

## Verification

For a content-only toolkit retrofit, run deterministic checks that prove:
- heading order is coherent and glossary appears once in the intended place;
- every action card has exactly one `Пример из книги`;
- every framework entry that has an essence/model/process block has a `Пример из книги`;
- `git diff --check` passes;
- if Agent_Const daily book ideas are affected, its parser still sees the intended action cards and examples.
