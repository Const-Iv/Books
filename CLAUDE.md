# Claude Code — Project Instructions

## Scope

These rules apply to the whole repository.

## Language

- Ответы пользователю — на русском по умолчанию.
- Plan files и operator-facing docs — на русском.
- Код, identifiers и inline comments — на английском.

## Shared Knowledge Base

Перед planning или coding читать `.memory-bank/index.md` и только релевантные files из routing matrix.

## Mandatory Sources Of Truth

- `AGENTS.md`
- `.memory-bank/*`
- `CODEX_MEMORY.md`
- `.memory-bank/product-charter.md`

`.cursorrules` — compatibility mirror, но не обязательный source.

## Working Rules

- Перед mutating action кратко объяснять, что меняется и почему.
- Для non-trivial work явно фиксировать assumptions, делать surgical diffs и предпочитать `reproduce -> fix -> verify`.
- Перед product/feature/behavior/process/governance изменением читать `.memory-bank/product-charter.md` и сверять решение с миссией, видением, целью, целевой аудиторией и `JTBD`.
- User-facing продуктовые решения формулировать простым языком в порядке `Миссия -> Видение -> Цель -> Целевая аудитория -> JTBD`; product spec в планах включает проблему / `JTBD`, целевую аудиторию изменения, сценарии, требования, критерии приемки, метрику успеха и ограничения; техническую часть планов начинать ниже продуктового блока.
- Новый downstream-проект сначала проходит Project Intake по `plans/_project_intake_template.md`; все обязательные пункты должны быть заполнены, согласованы owner'ом и перенесены в canonical sources до feature/refactor/behavior-change work.
- Для AI/agent behavior changes обязателен `Eval spec`: хороший ответ, провал, edge cases, golden prompts, comparison method и pass threshold; QA evidence должно включать eval result или явный gap.
- В `Summary`, `TL;DR`, `Миссия`, `Видение`, `Цель`, `Целевая аудитория`, `JTBD`, `Job Story` и `User Stories` не использовать технические термины без твердой необходимости.
- В Plan mode уточняющие вопросы и recommended option должны проходить через Product Charter; charter-конфликтный вариант нельзя подавать как равнозначно рекомендуемый.
- В user-facing ответах не использовать необъяснённый Git/process-жаргон; если термин нужен, сразу объяснять его простыми словами рядом.
- Для code-changing work использовать deterministic checks как evidence.
- `npm run qa:agent` обязателен перед finish / merge / release.
- Использовать канонические scripts: `task:start`, `task:qa:agent`, `task:finish:core`, `task:merge:main`, `release:local`.
- Для cross-project rule sync использовать project-local skill `starter-rule-sync`; автоматизации тоже должны вызывать этот skill. `rule-sync:scan`, `rule-sync:report`, `rule-sync:apply-plan --dry-run` остаются execution layer. Default scan window идёт от последнего saved scan snapshot до текущего запуска. Owner report начинается с decision proposals, candidate ids — только traceability. Не применять правила без managed worktree и plan approval.
- Для outbound sharing обновлённого starter baseline использовать project-local skill `starter-rule-share`. `rule-share:scan`, `rule-share:report`, `rule-share:apply-plan --dry-run` остаются execution layer; список проектов берётся из ignored `runtime/rule-share/config.json`; bulk-copy во все локальные проекты и direct edits запрещены.
- `task:start` разрешён только из clean tree; `--allow-dirty` не считается допустимым bypass.
- `task:finish:core` пропускает publish для clean task branch, чей `HEAD` уже есть в `main` и где task commit ещё не записан; записывает `publishStatus=skipped_already_merged`, `PUBLISH_SKIP` и доводит cleanup до `passed|kept`.
- `Docs/qa-implementation-log.md` и `Docs/triz-usage-log.md` остаются активными читаемыми логами; большие pre-compaction snapshots сохраняются в `Docs/archive/*.md.gz`.
- Generated skill trees (`.agents/skills`, `.claude/skills`, `.cursor/skills`) не bulk-import'ятся в starter core; reusable source lives in `skills/`.
- Если используется BMAD: `_bmad/` — canonical install, `_bmad-output/` — uncommitted scratch, BMAD не отменяет conveyor gates.
- Для bugfixes: reproduction -> root cause -> class-level analysis -> test-first -> systemic fix -> QA matrix.
- Для TRIZ triggers использовать `research/triz/*` и давать один финальный блок `TRIZ-вклад`.
- При process/git/QA rule change обновлять canonical sources (`AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`) в той же задаче.

## Agent Coexistence

- `AGENTS.md` и `CODEX_MEMORY.md` остаются Codex-primary files, но читать их обязательно.
- `.memory-bank/*` — shared layer; изменения должны быть совместимы для всех агентов.
- Не переносить обязательные правила только в `CLAUDE.md`.
