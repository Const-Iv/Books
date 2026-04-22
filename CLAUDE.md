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

`.cursorrules` — compatibility mirror, но не обязательный source.

## Working Rules

- Перед mutating action кратко объяснять, что меняется и почему.
- Для non-trivial work явно фиксировать assumptions, делать surgical diffs и предпочитать `reproduce -> fix -> verify`.
- User-facing планы, вопросы про изменения и продуктовые предложения формулировать простым языком в порядке `Summary -> JTBD / проблема -> Job Story -> User Stories -> Критерии приемки -> Метрика успеха`; техническую часть планов начинать ниже этого блока.
- В `Summary`, `TL;DR`, `JTBD / проблема`, `Job Story` и `User Stories` не использовать технические термины без твердой необходимости.
- Для code-changing work использовать deterministic checks как evidence.
- `npm run qa:agent` обязателен перед finish / merge / release.
- Использовать канонические scripts: `task:start`, `task:qa:agent`, `task:finish:core`, `task:merge:main`, `release:local`.
- `task:start` разрешён только из clean tree; `--allow-dirty` не считается допустимым bypass.
- Если используется BMAD: `_bmad/` — canonical install, `_bmad-output/` — uncommitted scratch, BMAD не отменяет conveyor gates.
- Для bugfixes: reproduction -> root cause -> class-level analysis -> test-first -> systemic fix -> QA matrix.
- Для TRIZ triggers использовать `research/triz/*` и давать один финальный блок `TRIZ-вклад`.
- При process/git/QA rule change обновлять canonical sources (`AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`) в той же задаче.

## Agent Coexistence

- `AGENTS.md` и `CODEX_MEMORY.md` остаются Codex-primary files, но читать их обязательно.
- `.memory-bank/*` — shared layer; изменения должны быть совместимы для всех агентов.
- Не переносить обязательные правила только в `CLAUDE.md`.
