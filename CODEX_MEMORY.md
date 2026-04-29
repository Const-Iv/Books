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
- Будущие plan files начинаются с продуктового блока `Миссия -> Видение -> Цель -> Целевая аудитория проекта -> Продуктовая спека`; product spec включает проблему / `JTBD`, целевую аудиторию изменения, сценарии использования, требования, критерии приемки, метрику успеха и ограничения / что нельзя сломать.
- Новый downstream-проект стартует с Project Intake Gate по `plans/_project_intake_template.md`; все обязательные сведения должны быть заполнены и явно согласованы owner'ом до первой feature/refactor/behavior-change реализации.
- Для AI/agent behavior changes обязателен `Eval spec`; QA evidence должно фиксировать eval cases, expected behavior, actual behavior и pass/fail.
- В Plan mode уточняющие вопросы, варианты выбора и рекомендации должны проходить через Product Charter; recommended option должен быть charter-safe, а конфликтный с charter вариант нельзя подавать как равнозначно рекомендуемый.
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
- После sync/import baseline reference docs и mirrors тоже нужно проверять на parity: нельзя оставлять старый порядок plan template, допустимый `--allow-dirty` или условный `previewPreparedSha`, даже если canonical files уже обновлены.
- `_bmad-output/` и похожие workflow scratch-артефакты нельзя смешивать с single-writer operational docs или task state.
- `task:finish:core` должен писать task state и runtime history через стабильный repo root из task state, а cleanup managed worktree под `$CODEX_HOME/worktrees/<taskId>/` должен дополнительно подчищать пустой task-root после удаления самого worktree.
- Cleanup-choice в finish-flow должен задаваться фиксированно как `1. Удалить` / `2. Оставить`; ответ цифрой считается canonical и не требует текстовой расшифровки.
- Resume cleanup из `main` должен использовать `--task-id <id>` как canonical selector; `--branch` допустим только как compatibility fallback.
- `cleanupStatus` и `cleanupTargets` — часть канонического task state/history contract; отсутствие `cleanupStatus` означает, что cleanup может требовать resume even if `cleanupDecision` уже записан.
- Optional `task:finish:cleanup` repo hook может возвращать только task-scoped `extraPaths` и/или `blocked`; starter core не делает sweep вне текущего task scope.
- Reusable starter skills должны жить в repo `skills/` и подключаться в `$CODEX_HOME/skills` через symlink-based `skills:link`; после `git pull` existing links обновляются сами, а для новых/renamed skills нужно повторно запустить link.
- Finish-flow не должен reuse task QA для dirty worktree перед commit: если есть незакоммиченные task changes, сначала фиксируется task commit/checkpoint, затем прогоняется QA уже на этом committed `HEAD`.
- Для командного multi-project reuse shared skills downstream repo может держать starter как git submodule и линковать skills через `skills-manage.mjs --source vendor/new-project-starter/skills`, чтобы новые участники получали зафиксированную версию baseline.
- Product proposal нельзя подменять `Summary` / `Key Changes` / technical sketch без product-charter якоря; полный вариант идёт через `Миссия -> Видение -> Цель -> Целевая аудитория -> JTBD`, короткий вариант обязан явно опереться хотя бы на один charter anchor.
- Generated skill trees (`.agents/skills`, `.claude/skills`, `.cursor/skills`) считаются profile/tool output; в starter core нельзя bulk-import'ить их содержимое вместо repo-owned source в `skills/` или переносимой policy.
- Активные `Docs/qa-implementation-log.md` и `Docs/triz-usage-log.md` должны оставаться читаемыми; при compaction полный pre-compaction snapshot сохраняется в `Docs/archive/*.md.gz`.
- Если clean task branch уже содержится в `main` и task commit ещё не записан, finish-flow должен ставить `publishStatus=skipped_already_merged`, писать `PUBLISH_SKIP` и всё равно завершать cleanup через `passed|kept`.
- Product proposal нельзя подменять `Summary` / `Key Changes` / technical sketch без product-charter якоря; полный вариант идёт через `Связь с charter проекта -> Цель изменения/решения -> JTBD -> Job Stories -> User Stories -> Критерии приемки`, короткий вариант обязан явно опереться хотя бы на один charter anchor.

## Project Notes

- Этот starter репозиторий сам по себе является runnable process baseline: здесь проверяется не продуктовая логика, а conveyor/governance/runtime contracts.
- Starter является канонической reusable базой для новых проектов; любые новые правила нужно проверять на переносимость в baseline, а продуктовую специфику добавлять поверх него через adapters/profiles.
- Preview в core starter помечается `not_supported`; продуктовые проекты поверх starter могут добавить свой preview adapter без изменения базового task state contract.
- Governance baseline стартера синхронизирован с более свежими правилами Карпаты, BMAD и clean-tree worktree flow, чтобы новый проект стартовал уже с актуальным process-contract.
- Starter теперь может versioned хранить reusable shared skills вроде `worktree-create` и `worktree-finish`, чтобы их можно было коммитить в git и использовать на нескольких устройствах через один bootstrap link.
- Starter теперь содержит собственный `.memory-bank/product-charter.md` как переносимый baseline-паттерн; downstream проекты должны заменить или расширить charter под свою миссию, не ослабляя core governance.
- Starter содержит `starter-rule-sync` skill и `rule-sync:*` commands как approval-safe контур регулярного переноса reusable правил из downstream проектов обратно в baseline.
- Starter содержит `starter-rule-sync` как основной project-local skill для ручного и автоматического rule sync workflow; scheduled automations должны вызывать этот skill, а не дублировать его scan/report логику. `rule-sync:*` commands остаются approval-safe execution layer, default scan window идёт от последнего saved scan snapshot до текущего запуска, а owner report начинается с decision proposals вместо raw candidate ids.
- Starter содержит `starter-rule-share` skill и `rule-share:*` commands как approval-safe outbound контур: после подтверждённого starter import владелец выбирает active downstream проекты из ignored local allowlist, а apply-plan готовит только dry-run task seeds без direct edits и bulk-copy.
