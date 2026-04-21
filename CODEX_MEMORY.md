# CODEX Project Memory

Оперативная память для Codex-сессий в этом репозитории.

## Knowledge Layers

- `.memory-bank/*` — канонические и долгоживущие правила/знания проекта.
- `CODEX_MEMORY.md` — короткие operational notes, learned rules и project notes.

## How To Use

1. Сначала читать `.memory-bank/index.md`, потом этот файл.
2. `Hard Rules` считать non-negotiable.
3. После каждого повторяющегося бага, failed QA или conveyor lesson добавлять `Learned Rule`.
4. После завершённой существенной задачи добавлять короткий `Project Note`.
5. Стабильные правила поднимать из этого файла в `.memory-bank/*`.

## Hard Rules

- Canonical governance хранится в `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`; `.cursorrules` — только mirror.
- Для non-trivial work явно фиксировать assumptions, показывать plausible variants и делать surgical diffs.
- Перед mutating action нужно кратко объяснить change intent.
- Deterministic checks — единственное доказательство корректности.
- В `main` нельзя вносить изменения без явного разрешения пользователя на direct-main правку в текущей задаче.
- По умолчанию implementation work выполняется в отдельном managed worktree и ветке `codex/*`.
- `qa:agent` обязателен перед finish / merge / release для code-changing work.
- `task:start` / `task:qa:agent` / `task:finish:core` / `task:merge:main` / `release:local` — canonical process entrypoints.
- `task:start` запускается только из clean tree; `--allow-dirty` не считается допустимым bypass.
- Task state и runtime history должны жить только в `.git/codex-task-pipeline/*`.
- `previewPreparedSha` обязателен как checkpoint even when preview status = `not_supported`.
- Shared operational docs — single-writer; task branches работают через capture/sync.
- TRIZ triggers фиксируются в runtime history и `Docs/triz-usage-log.md`.
- Если используется BMAD, `_bmad/` — canonical install, `_bmad-output/` — uncommitted scratch, а сам BMAD не отменяет conveyor gates.
- При process/git/QA rule change обновлять canonical sources в той же задаче и не оставлять правило только в `.cursorrules`.
- Commit format: `Ver. <version> <type> <description> | <qa-result>`.

## Learned Rules

- Для starter baseline smoke/nightly контуров допустимы не browser-tests, а process-level temp-repo scenarios, если это прямо отражено в `qa-playbook.md` и реально исполняется командами.
- `typecheck` в JS-first starter можно строить на `tsc --checkJs`, если scripts/tests покрыты JSDoc types и это проверяется deterministic gate.
- `qa:coverage:critical` не обязан быть line-coverage percentage, если проект честно использует manifest-driven critical regression coverage и документирует это как source of truth.
- Governance-правило считается реально внедрённым только после синхронизации хотя бы в `AGENTS.md` и `.memory-bank/*`; mirror-файлы сами по себе недостаточны.
- `_bmad-output/` и похожие workflow scratch-артефакты нельзя смешивать с single-writer operational docs или task state.
- `task:finish:core` должен писать task state и runtime history через стабильный repo root из task state, а cleanup managed worktree под `$CODEX_HOME/worktrees/<taskId>/` должен дополнительно подчищать пустой task-root после удаления самого worktree.
- Cleanup-choice в finish-flow должен задаваться фиксированно как `1. Удалить` / `2. Оставить`; ответ цифрой считается canonical и не требует текстовой расшифровки.

## Project Notes

- Этот starter репозиторий сам по себе является runnable process baseline: здесь проверяется не продуктовая логика, а conveyor/governance/runtime contracts.
- Preview в core starter помечается `not_supported`; продуктовые проекты поверх starter могут добавить свой preview adapter без изменения базового task state contract.
- Governance baseline стартера синхронизирован с более свежими правилами Карпаты, BMAD и clean-tree worktree flow, чтобы новый проект стартовал уже с актуальным process-contract.
