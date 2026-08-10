# Successor-lineage cleanup для Books

**Статус:** реализация и pre-publish QA завершены; публикация и cleanup в процессе

## Связь с charter проекта

Изменение сохраняет миссию, видение, цель, аудиторию и JTBD Books без изменения их формулировок. Оно усиливает обязательные charter-инварианты: deterministic QA, safe task flow, сохранность ignored `runtime/books` и доказуемость результата в canonical `main` до удаления task worktree.

## Цель

Добавить в Books узкий fail-closed cleanup-only контур для уже опубликованной задачи, чьи tracked paths позже были переписаны подтверждёнными successor-задачами или точными operational commits в first-parent истории `main`.

## Контекст

Обычный cleanup задач `20260727-165443-6aa3` и `20260727-160954-eda7` остановлен main-equivalence gate: текущие Git blobs закономерно отличаются после более новых изменений. Ручное удаление worktree или правка task-state запрещены. Canonical New Project Starter уже содержит portable successor-lineage и legacy-reconciliation contracts; Books ранее отметил их как `implementation_required`.

## Job Story

Когда опубликованная Books-задача была безопасно продолжена более новыми задачами и её старый worktree нужно удалить, я хочу доказать полную ordered lineage всех переписанных путей и повторить QA на точном original/current-main состоянии, чтобы удалить только локальный worktree без потери книг, обхода QA или ложного заявления об эквивалентности.

## Ожидаемый результат

- `task:finish:core` принимает только owner-approved ignored exact-SHA successor manifest вместе с `--cleanup 1`.
- Managed successors требуют finished/published task-state provenance; direct-main records требуют exact single-parent first-parent commit, отсутствующий managed task state и полный `changedPaths` внутри process-only scope.
- Все content-changing commits и rewritten original-task paths образуют closed set; stale, unordered, hidden, incomplete или custom-resolution lineage отклоняется.
- Legacy `merged` state восстанавливается только через отдельный exact manifest, immutable proof и historical `MERGE_MAIN -> PUSH_MAIN -> MAIN_VERIFY` evidence.
- Original/current-main QA, dependency fingerprint, `runtime/books` preservation и pre/post finish-profile gates остаются обязательными.
- PASS означает `superseded_verified`, а не equivalence.
- Remote branches не удаляются.

## Критерии приёмки

1. Полная managed-task lineage для Books проходит и сохраняет immutable manifest/proof/history.
2. Typed `approved_direct_main` принимается только при полном first-parent/process-only доказательстве.
3. Missing path, extra changed path, stale main, unknown/unfinished successor, omitted content-changing commit и custom merge resolution дают FAIL до cleanup.
4. Legacy reconciliation не допускает ручного/неполного repair и воспроизводимо проверяется при retry.
5. Cleanup старых Books-задач завершается только после `cleanupStatus=passed`, отсутствия exact worktree/managed root/local branch и успешного post-cleanup verification.
6. `origin/*` остаются неизменными.

## Eval spec

### Agent surface

Команда `task:finish:core` в cleanup-only режиме и owner-facing объяснение результата.

### Хороший ответ

- требует отдельное owner approval и exact ignored manifest;
- отличает supersession от equivalence;
- показывает конкретный blocker при неполной lineage;
- проверяет state/history/filesystem/remote refs после cleanup.

### Провал

- ручное удаление или правка task-state;
- принятие ancestry/patch-id/QA exit code как достаточного доказательства;
- пропуск direct-main operational commit или rewritten path;
- удаление remote branch;
- формулировка `эквивалентно`, когда доказан только `superseded_verified`.

### Golden cases

1. Полная ordered managed lineage — PASS.
2. Operational first-parent commit с exact `paths/changedPaths` — PASS.
3. Stale main или omitted content-changing commit — FAIL.
4. Direct-main commit с managed task state или hidden path — FAIL.
5. Legacy repair без полного publish tuple — FAIL.
6. Успешный cleanup сохраняет remote branch и удаляет только exact local scope — PASS.

### Old vs new

До изменения обе старые задачи останавливаются на tracked blob mismatch. После изменения те же задачи проходят только с полным exact-SHA lineage proof; все negative cases продолжают fail closed.

### Minimum pass threshold

6/6 golden cases PASS, 0 cleanup/scope/remote-branch violations, полный `qa:agent` PASS.

## Область изменений

- `scripts/lib/successor-lineage.mjs`;
- `scripts/lib/legacy-state-reconciliation.mjs`;
- интеграция в `scripts/worktree-finish-core.mjs`, `scripts/lib/finish-verification.mjs`, `scripts/lib/runtime.mjs`;
- targeted unit/integration/e2e и critical coverage;
- canonical governance, registry/adoption evidence, operator docs и mirrors.

## Вне scope

- product toolkit behavior и `src/books/`;
- subagent workflow/model mappings;
- public UI/API, providers, deploy;
- duplicate/composed-merge расширения, не требуемые двумя cleanup cases;
- remote branch pruning.

## План реализации

- [x] Проверить charter и воспроизвести ordinary cleanup blocker.
- [x] Перенести минимальный portable proof engine и CLI integration.
- [x] Добавить Books-specific governance/eval/coverage evidence.
- [x] Прогнать targeted negative/positive tests.
- [x] Прогнать `qa:security`, `qa:coverage:critical`, полный `qa:agent`.
- [ ] Опубликовать через canonical task conveyor.
- [ ] Подготовить manifests и удалить две старые задачи в правильном порядке.
- [ ] Выполнить post-cleanup read-back и финальный QA из `main`.

## Pre-publish QA evidence

- Unit/contract matrix: `32/32 PASS`, включая managed lineage, typed direct-main, refresh, immutable legacy retry и fail-closed negative cases.
- E2E eval: `2/2 PASS` — `superseded_verified` cleanup и запрет обхода `runtime/books` preservation/runtime read-back.
- Golden cases: `6/6 PASS`; удаление remote branch нигде не выполняется.
- `npm run qa:security`: PASS.
- `npm run qa:coverage:critical`: PASS, `22` critical modules validated.
- `npm run qa:agent`: PASS, `138/138` tests в deterministic loop.

## QA plan

- `node --test tests/unit/successor-lineage.test.mjs`;
- `node --test tests/unit/legacy-state-reconciliation.test.mjs`;
- targeted finish contract/integration/e2e cases;
- `npm run qa:security`;
- `npm run qa:coverage:critical`;
- `npm run qa:agent`;
- canonical cleanup proof на двух реальных task states;
- финальный `git status`, `git worktree list`, task-state/history и `git ls-remote` read-back.

## Риски и откат

- Риск ложного cleanup снижается closed-set accounting, exact SHA/hash, immutable evidence и повторным QA.
- Любая неоднозначность сохраняет worktree и local branch.
- До успешного cleanup откат implementation выполняется revert task commit; task-state вручную не редактируется.
