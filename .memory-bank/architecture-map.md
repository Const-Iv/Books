# Architecture Map

## Product Architecture Status

- Product charter approved 2026-05-07: Books превращает книгу в применимый русскоязычный toolkit, а не в обычное summary.
- Product runtime and service layout for v1 were approved 2026-05-07: local CLI contour on Node/npm orchestration with optional Python extraction adapter.
- AI/model provider, public UI/API, multi-user storage and deploy are not approved yet.
- Первый approved contour: local-first prototype. Owner передаёт книгу или фрагмент локально, output первой версии всегда русский.
- Будущий product pipeline должен сохранять последовательность: supported input -> text extraction -> metadata / pre-flight -> book structure map -> chapter / section extraction -> toolkit artifacts.
- Toolkit artifacts follow the ideal master-format: главный файл with usage layer, `Battle route`, `Training route`, `Быстрая карта`, `Tool selector`, `Лайфхаки, приемы и инструменты к внедрению`, micro-practice coverage, deep reference body, coverage/source notes, `Excluded / limited source notes`, anti-patterns, scenarios, cheatsheet, glossary, topic index, scope & limits and extraction report.
- Multi-book pipeline всегда staged and depth-preserving: per-book standalone toolkit'ы сначала как source-specific artifacts, затем combined toolkit под owner-selected theme; combined synthesis reads direct structured Markdown source copies/originals for depth and uses standalone toolkit'ы as coverage control, not as depth ceiling.
- Starter governance modules below remain process baseline for safe task flow and QA; they are not the Books product runtime.

## High-Level Modules

- `src/books/cli/`: future local CLI orchestration for Books v1; no public UI/API in the first contour.
- `src/books/extraction/`: future PDF/EPUB extraction boundary; Python helpers are allowed here only after echo-test / feature plan.
- `src/books/toolkit/`: future toolkit schema, ranking rules, artifact generation contracts, quality checks and eval fixtures.
- `src/books/toolkit/toolkit-contract.mjs`: canonical deterministic contract for the ideal Books toolkit master-format and prompt rules.
- `books/<topic>/<book-slug>/`: tracked shareable toolkit artifacts and source manifests grouped by practical domain; full book originals do not live here.
- `runtime/books/<topic>/<book-slug>/`: ignored per-run workspace for same-basename structured Markdown source copies, metadata and generated local toolkit artifacts; same-basename originals are kept there for `pdf`, `epub`, `fb2` and audio.
- `scripts/dependency-preflight.mjs`: dependency recovery seam.
- `scripts/deterministic-feedback-loop.mjs`: deterministic QA orchestrator.
- `scripts/worktree-start.mjs`: task bootstrap, branch/worktree creation, state/history START.
- `scripts/worktree-qa-agent.mjs`: task QA checkpoint, failure classification, TRIZ trigger evaluation.
- `scripts/worktree-finish-core.mjs`: finish orchestration, capture, commit, merge handoff, Books runtime preservation and cleanup decision.
- `scripts/worktree-merge-main.mjs`: safe merge/publish on local `main`.
- `scripts/worktree-history.mjs` + `scripts/worktree-ledger.mjs`: docs snapshots from runtime history/state.
- `scripts/worktree-operational-docs.mjs`: single-writer capture/sync of operational docs.
- `scripts/release-local.mjs`: local-first release gate.
- `skills/starter-project-bootstrap/SKILL.md`: primary Codex workflow for guided downstream Project Intake, canonical transfer, dependency/shared-skills setup, and baseline QA.
- `skills/starter-rule-report/SKILL.md`: primary Codex workflow for read-only reusable rule discovery and owner reports.
- `skills/starter-rule-import/SKILL.md`: primary Codex workflow for owner-approved reusable rule import.
- `skills/starter-rule-sync/SKILL.md`: compatibility router for legacy combined rule-sync prompts.
- `scripts/rule-sync.mjs`: deterministic cross-project governance scan/report/apply-plan execution seam for reusable starter rules.
- `skills/starter-rule-share/SKILL.md`: primary Codex workflow for approval-safe outbound sharing of the current starter baseline.
- `scripts/rule-share.mjs`: deterministic target-project scan/report/apply-plan execution seam for outbound starter rule sharing.
- `.memory-bank/starter-rule-registry.json`: machine-readable reusable rule registry for outbound sharing; each entry carries stable id, exact text, target files, required fragments, source traceability and share policy.
- `rule-share:scan` produces rule-level project state: `presentRules`, `missingRules`, `presentUnregisteredRules`, and `blockedRules`.
- `rule-share:apply-plan` task seeds are the copied-baseline import contract: import only `missingRules`, preserve downstream product boundaries, avoid duplicate present text, sync canonical/mirror rule surfaces, require QA/TRIZ evidence and stop before finish/merge/publish unless explicitly approved.

## Runtime Data Flow

1. User intent входит через branch-chat или прямой npm entrypoint.
2. Conveyor script normalizes input into task state + runtime history events.
3. Shared helpers in `scripts/lib/*` управляют git/worktree operations, state I/O и docs sync.
4. Deterministic QA and release gates работают только через canonical scripts.
5. Human-readable docs snapshots (`Docs/*`) строятся из machine-readable runtime artifacts.

## Books V1 Product Flow

1. Validate local input path and supported format: PDF / EPUB by extension and magic bytes.
2. Ask book type: technical / text-heavy / not sure.
3. Extract text through the approved extraction adapter boundary.
4. Write same-basename structured Markdown source copy and metadata under ignored `runtime/books/<topic>/<book-slug>/`; file basenames follow `<Автор> - <Название>`.
5. Show pre-flight estimate and ask explicit proceed or analyze-only choice.
6. Build structure map: title, author, chapters/parts/ToC, core themes, subject domain, frameworks, principles, techniques, micro-practice inventory, кандидаты для раздела внедрения, anti-patterns.
7. Generate master-format toolkit artifacts: usage layer, `Battle route`, `Training route`, `Быстрая карта`, `Tool selector`, `Лайфхаки, приемы и инструменты к внедрению` сразу после `Быстрая карта`, micro-practice coverage statuses, deep reference body, chapter files/sections, coverage/source notes, `Excluded / limited source notes`, anti-patterns, scenarios, cheatsheet, glossary, topic index, scope & limits, extraction report.
8. Собрать раздел внедрения из всей книги как карточки: `Что внедрить`, `Контекст`, `Когда применять`, `Первый шаг`, `Источник / где искать в книге`; `Контекст` должен кратко передавать concrete source-backed ситуацию, действие/решение и эффект, не повторять идею и не выдумывать детали; не называть пользовательский раздел `Белки`.
9. Save the shareable toolkit copy under tracked `books/<topic>/<book-slug>/`; keep the structured Markdown source copy under ignored `runtime/books/<topic>/<book-slug>/`, and keep the original beside it when the original format is `pdf`, `epub`, `fb2` or audio.
10. Point `source-manifest.md` and toolkit source references to `runtime/books/<topic>/<book-slug>/<Автор> - <Название>.md` plus heading/page/spine marker when available.
11. Run quality checks against Books Product QA before treating output as usable.

## Multi-Book Product Flow

1. Validate the owner-selected common idea/theme for the combined toolkit; if absent, stop and ask for it.
2. Generate and save a detailed standalone toolkit for each book using the normal Books V1 Product Flow.
3. Read direct structured Markdown source copies/originals for depth; standalone toolkit'ы are mandatory coverage-control inputs, not the only synthesis input.
4. Build a coverage map of all worthy ideas across direct sources and standalone toolkit'ы using the Books ranking criteria: applicability, author importance, repeatability, specificity and distinctiveness.
5. Merge duplicates into one practical formulation while preserving source traceability to every contributing book/toolkit/source Markdown location.
6. Sequence the combined toolkit by master use: charter/source status -> usage layer -> Battle route / Training route -> quick map -> tool selector -> action cards -> working process -> deep reference body -> coverage/dedupe -> limited-source notes -> anti-patterns -> scenarios -> cheatsheet -> glossary -> topic index.
7. Save the combined toolkit under tracked `books/<topic>/<combined-slug>/`; keep combined working notes under ignored `runtime/books/<topic>/<combined-slug>/`.
8. Verify that the combined toolkit has no avoidable duplicates, no missed worthy ideas from standalone toolkit'ы, and a readable coverage/dedupe map.

## Risk Hotspots

- drift между `AGENTS.md`, `.memory-bank/*`, `README.md` и реально исполняемыми npm scripts;
- drift между `.memory-bank/product-charter.md` и правилами в `AGENTS.md`, `.memory-bank/code-rules.md`, `CODEX_MEMORY.md`;
- drift от approved Books charter к обычному summary generator вместо reusable toolkit;
- преждевременный выбор AI/model provider, public storage, UI/API или deploy без owner-approved adapter decision and echo-test;
- плохое извлечение текста, которое приводит к уверенному, но неверному русскоязычному toolkit вместо понятного blocker;
- потеря границы между идеями книги, продуктовой интерпретацией и профессиональной консультацией;
- публикация или хранение полного текста книги как product output без отдельного owner-approved решения;
- drift source references, когда toolkit указывает на исходный binary/PDF/EPUB или tracked artifact вместо локальной structured Markdown copy, из-за чего будущему агенту сложнее искать по книге;
- duplicate runtime source drift, когда после verified structured `.md` рядом остаются лишние TXT/DOCX/HTML extraction/source files instead of retaining originals only for `pdf`, `epub`, `fb2` and audio;
- multi-book shortcut drift, когда общий toolkit создаётся без detailed standalone toolkit'ов, только из standalone summaries без direct source depth pass, теряет достойные внимания идеи, повторяется или выстроен как список summary вместо master-последовательности;
- quality shortcut drift, когда агент экономит время или токены ценой глубины разбора Books toolkit;
- micro-practice loss drift, когда named concept, авторская метафора, чек-лист, ритуал, инструмент или practical imperative есть в source, но не получает статус `card | folded_into | excluded_with_reason`;
- task state schema drift (`qaLastPassSha`, `previewPreparedSha`, publish markers, operational artifacts);
- неправильная работа с git worktree lifecycle и cleanup;
- silent overwrite shared docs вместо single-writer capture/sync;
- разрастание active operational logs без archive snapshot, из-за чего evidence становится трудно читать или переносить;
- flaky perf/security/coverage gates, которые выглядят “включёнными”, но не дают надёжного evidence.
- rule-sync classifier drift, из-за которого product-specific правила могут попасть в starter core.
- rule-sync window drift, из-за которого scheduled automation пропускает правила после missed run вместо catch-up от последнего saved scan snapshot.
- rule-share allowlist drift, из-за которого устаревший или paused проект может быть ошибочно предложен к обновлению.
- rule-share registry drift, из-за которого starter не понимает, какое конкретное правило уже есть в downstream проекте, а какое действительно missing.
- rule-share delivery drift, из-за которого downstream product-specific charter может быть перезаписан или present rule duplicated вместо точечного reusable baseline import.
- capability profile drift, из-за которого product-specific provider, locale, stack, auth, billing, analytics, jobs или API-docs decisions могут ошибочно попасть в starter core вместо downstream adapters/profiles.
- bootstrap flow drift, из-за которого фраза `стартуем новый проект` превращается в общий checklist, пропускает Project Intake approval или начинает feature work до canonical transfer.
- echo-testing drift, из-за которого unknown root technology получает продуктовую реализацию без isolated minimal proof или blocker.
- owner-report source drift, из-за которого отчёт или дайджест смешивает данные из нескольких источников без явного источника каждой записи.

## Change Impact Checklist

Когда меняется conveyor/runtime:

- проверить `scripts/lib/runtime.mjs`;
- проверить task state/history schema;
- проверить finish no-op path для already-in-main task branch, если меняется publish/cleanup logic;
- проверить smoke/nightly integration tests.

Когда меняется governance:

- синхронизировать `AGENTS.md`, `.memory-bank/*`, `.memory-bank/product-charter.md`, `CODEX_MEMORY.md`, `.cursorrules`, `CLAUDE.md`;
- проверить README и scripts/README на parity с реальными командами.

Когда меняется starter project bootstrap:

- проверить `skills/starter-project-bootstrap/SKILL.md`;
- проверить `plans/_project_intake_template.md`;
- проверить echo-testing gate для unknown root technology и manual eval по golden prompts;
- проверить, что trigger rules есть в `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md` и mirrors;
- проверить manual eval по golden prompts `стартуем новый проект` и `стартуем новый проект на <stack/provider>`.

Когда меняется rule-sync:

- проверить `skills/starter-rule-report/SKILL.md`;
- проверить `skills/starter-rule-import/SKILL.md`;
- проверить `skills/starter-rule-sync/SKILL.md`;
- проверить `scripts/rule-sync.mjs`;
- проверить `tests/unit/rule-sync.test.mjs`;
- проверить, что scan/report read-only, а apply-plan не меняет starter source без managed worktree.
- проверить, что default scan window идёт от последнего saved scan snapshot, а previous-local-day остаётся только fallback.

Когда меняется rule-share:

- проверить `skills/starter-rule-share/SKILL.md`;
- проверить `.memory-bank/starter-rule-registry.json`;
- проверить `scripts/rule-share.mjs`;
- проверить `tests/unit/rule-share.test.mjs`;
- проверить, что scan/report read-only, apply-plan остаётся dry-run, проекты берутся только из локального allowlist, а copied-baseline task seed содержит только missing rules.

Когда меняются operational docs helpers:

- проверить capture/sync;
- проверить active log compaction и archive snapshot в `Docs/archive/*.md.gz`;
- проверить `Docs/task-history.md` и `Docs/change-ledger.md` rebuild path;
- проверить append-only sections `CODEX_MEMORY.md`.
