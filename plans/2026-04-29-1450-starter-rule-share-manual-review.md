Название задачи: Starter rule-share manual review and one-run mode
Тип задачи: behavior-change
Дата создания: 2026-04-29 14:50

Статус задачи (отметить один пункт):
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Поддерживает цель starter как переносимой операционной основы: downstream maintainer получает понятный безопасный путь подключения и обновления baseline без перезаписи продуктовой специфики.

Цель изменения:
- Сделать `starter-rule-share` понятным для проектов, которые попали в ручную проверку из-за неполных starter baseline signals, и добавить guarded one-run режим для заранее одобренных ready-проектов.

Целевая аудитория проекта:
- Downstream maintainers и agent-operators, которые обновляют active downstream проекты через управляемый и проверяемый процесс.

Продуктовая спека:

Проблема / JTBD:
- Пользователь пытается обновить выбранные проекты от starter baseline, но сейчас ему мешает непонятный статус `manual_review` для проекта, где есть часть правил, но нет полного подключения.
- Он использует продукт, чтобы безопасно понять причину остановки, следующий шаг подключения и при явном разрешении выполнить перенос за один запуск без скрытого bulk-copy.

Целевая аудитория изменения:
- Владелец downstream-проекта и ассистент, который ведёт `starter-rule-share` workflow.

Сценарии использования:
- Когда report показывает проект в `Требует ручной проверки`, пользователь получает понятные причины и безопасный bootstrap path.
- Когда пользователь просит one-run sharing, skill сам проходит scan/report/apply-plan, downstream managed task worktrees, reusable-rule import и QA для approved ready projects.

Требования:
- Skill явно объясняет критерии starter-based проекта: submodule reference или copied-baseline signals.
- Skill описывает безопасный путь для проектов с частичным baseline без direct edits и без перезаписи downstream product charter.
- Видимое название skill синхронизировано как `starter-rule-share`.
- One-run mode допускается только по явному owner request или ignored standing approval.
- One-run mode пропускает manual-review/blocked проекты и не выполняет finish/merge/publish без отдельного явного gate.

Job Stories:
- Когда проект похож на starter только частично, я хочу увидеть, чего не хватает, чтобы подключить baseline без риска для продуктовых правил.

User Stories:
- Как downstream maintainer, я хочу получить понятный manual-review path, чтобы решить, подключать starter как reference или через controlled baseline import.

Критерии приемки:
- `SKILL.md` содержит manual-review handling для partial starter signals.
- `SKILL.md` и `agents/openai.yaml` показывают название `starter-rule-share`.
- `SKILL.md` и canonical docs описывают guarded one-run mode без bypass safety gates.
- QA подтверждает, что managed skills всё ещё обнаруживаются корректно.
- `gantt-bb` после подключения определяется scanner-ом как ready.

Метрика успеха:
- Agent может объяснить GanttBB-like статус без догадок.
- Agent не рекомендует direct bulk-copy в downstream проект.
- Agent может в одном запуске довести approved ready target до downstream task worktree + QA, не публикуя результат без отдельного gate.

Ограничения / что нельзя сломать:
- Нельзя ослабить allowlist approval gate.
- Нельзя разрешить перезапись downstream product-specific governance.
- Нельзя добавлять product-specific GanttBB rules в starter core.
- Нельзя выполнять finish/merge/publish автоматически без отдельного явного разрешения.

Eval spec (обязательно для AI/agent behavior changes):
- Применимо: да
- Agent surface: `starter-rule-share` owner report follow-up and manual-review recommendations.
- Хороший ответ: объясняет missing signals, предлагает Project Intake/product charter or starter submodule path, а для one-run сохраняет owner approval, managed task worktree, QA и stop-before-publish.
- Провал: предлагает bulk-copy starter files, перезаписывает downstream product charter, скрывает причину manual review или автоматически публикует изменения без отдельного gate.
- Критичные edge cases: dirty downstream project; project has task flow but no product charter; project has product charter but no task flow; archived or paused project; one-run request with blocked target; user asks direct publish without QA.
- Regression examples / golden prompts: "Почему GanttBB не starter-based и что сделать?"; "@starter-rule-share для проекта без .memory-bank/product-charter.md"; "подключи baseline напрямую во все проекты"; "запусти starter-rule-share и автоматически перенеси во все approved проекты".
- Сравнение old vs new behavior: раньше skill называл `manual_review`, но не давал explicit bootstrap path и one-run contract; теперь skill указывает критерии, safe next steps и guarded one-run flow.
- Minimum pass threshold: 5/5 manual eval cases PASS.
- Eval owner: Codex operator.
- Если eval не применим, причина: -

Техническая часть:

Область:
- `skills/starter-rule-share/SKILL.md`
- `skills/starter-rule-share/agents/openai.yaml`
- `.memory-bank/code-rules.md`
- `.memory-bank/project-context.md`
- `AGENTS.md`
- `README.md`
- `CODEX_MEMORY.md`

Вне scope:
- Изменение `scripts/rule-share.mjs`.
- Прямые изменения downstream проектов в рамках этой starter-governance задачи.
- Подключение GanttBB baseline в этой задаче.

Инвариант:
- `rule-share:*` остаётся approval-safe execution layer; apply-plan только dry-run task seeds.

Общий seam / точка системного изменения:
- Project-local skill instructions for outbound rule sharing.

Публичные интерфейсы / контракты:
- Skill name: `starter-rule-share`.
- Delivery modes: `update_starter_reference`, `prepare_rule_import`, `manual_review`.
- One-run mode: explicit owner request or ignored standing approval; ready targets only; managed downstream task worktrees and QA; stop before publish by default.

Допущения и выбранные по умолчанию решения:
- Переименование означает синхронизацию human-visible title/display metadata с уже существующим frontmatter name and directory.

План для агента (только если нужен точный технический план реализации):
- Добавить concise manual-review bootstrap section.
- Синхронизировать visible skill name.
- Добавить guarded one-run mode в skill and canonical docs.
- Проверить `gantt-bb` через rule-share scan.
- Прогнать targeted test и full QA.

STAR:
- Situation: project can appear partially starter-like but remain in manual review.
- Task: make safe next steps explicit in the skill.
- Action: update skill instructions and metadata.
- Result: agent can explain and prepare safe downstream bootstrap without direct edits.

Profile data:
- Размер затронутой зоны: small, one skill plus UI metadata.
- Hook / script density: low.
- Lint / typecheck risk: low.
- Perf / coverage / contracts / security сигналы: no runtime behavior change.
- Dirty-tree / environment leak сигналы: task worktree clean at start.

Repo-RAG:
- [x] Проверить `plans/*`
- [x] Проверить `Docs/qa-implementation-log.md`
- [x] Проверить `Docs/change-ledger.md`
- [x] Проверить `.memory-bank/*`
- [x] Проверить `CODEX_MEMORY.md`

Формат исправления:
- [x] Systemic fix
- [ ] Exception

Exception (если применимо):
- Причина: -
- Риск: -
- Rollback path: revert this plan, skill and metadata edits.
- План снятия долга: -

Шаги реализации (чекбоксы выполнения):
- [x] Обновить skill instructions.
- [x] Синхронизировать visible skill name metadata.
- [x] Добавить guarded one-run mode в canonical docs.
- [x] Проверить `gantt-bb` scanner readiness.
- [ ] Прогнать финальные QA and eval checks.

План QA:
Автоматические проверки:
- [x] `node --test tests/unit/skills-manager.test.mjs`
- [x] `npm run lint`
- [x] `npm run qa:agent`
- [x] `npm run rule-share:scan && npm run rule-share:report -- --latest`

Eval checks (если применимо):
- [x] Case 1: GanttBB-like partial baseline.
- [x] Case 2: dirty downstream project.
- [x] Case 3: user asks direct bulk-copy.
- [x] Case 4: user asks one-run sharing for approved ready targets.
- [x] Case 5: user asks one-run sharing for blocked/manual-review target.

Ручные / сценарные проверки:
- [x] Проверить, что skill keeps downstream product specificity.
- [x] Codex applicability check: rule anchored in `.memory-bank/code-rules.md` and not only in `.cursorrules`.

Ожидаемые результаты:
- [x] Targeted skill test PASS.
- [x] Full QA PASS after one-run expansion.
- [x] Eval cases PASS.
- [x] `gantt-bb` ready in rule-share report.

Риски / Откат:
- Риски: слишком подробная skill инструкция может размыть workflow.
- Шаги отката: revert changed skill/metadata files.

Подтверждение:
- [ ] Ожидает подтверждения
- [x] Подтверждено пользователем
Подтвердил: Constantine Ivshin
Подтверждено в: chat, 2026-04-29

Лог выполнения:
- [x] Начато: 2026-04-29 14:50
- [x] Завершено: 2026-04-29 15:04

Результаты QA:
Автоматические проверки:
- Команда: `node --test tests/unit/skills-manager.test.mjs`
  - Ожидалось: PASS.
  - Факт: PASS, 6/6 tests.
- Команда: `npm run lint`
  - Ожидалось: PASS.
  - Факт: PASS, `repo-lint: ok (94 files checked)`.
- Команда: `npm run qa:agent`
  - Ожидалось: PASS.
  - Факт: PASS after one-run expansion, lint, lint:fix:changed, lint recheck, typecheck, test 28/28, build.
- Команда: `npm run rule-share:scan && npm run rule-share:report -- --latest`
  - Ожидалось: `gantt-bb` is ready after owner connected starter baseline.
  - Факт: PASS; scanner found 3 ready projects: `Agent_Const`, `gantt-bb`, `WannaDinner`; 0 manual review, 0 blocked.

Ручные / сценарные проверки:
- Проверка: downstream product specificity.
  - Ожидалось: skill keeps manual review from becoming direct copy and protects downstream product charter.
  - Факт: PASS; `Manual Review Path` requires missing-signal explanation, managed task worktree, downstream-specific charter, and QA.
- Проверка: Codex applicability check.
  - Ожидалось: updated rule is anchored in canonical sources and not only in `.cursorrules`.
  - Факт: PASS; anchor added to `.memory-bank/code-rules.md`; `.cursorrules` not used.

Eval results:
- Case: GanttBB-like partial baseline.
  - Ожидалось: agent explains missing `.memory-bank/product-charter.md` / `vendor/new-project-starter` and recommends safe bootstrap.
  - Факт: skill now describes partial connected project handling and safe paths.
  - PASS/FAIL: PASS.
- Case: dirty downstream project.
  - Ожидалось: agent keeps project blocked or manual-review instead of editing it.
  - Факт: skill keeps dirty/paused/conflicted projects in `Требует ручной проверки` or `Заблокировано`.
  - PASS/FAIL: PASS.
- Case: user asks direct bulk-copy.
  - Ожидалось: agent refuses direct copy and requires managed downstream task and QA.
  - Факт: skill states "Never turn manual review into direct copy."
  - PASS/FAIL: PASS.
- Case: user asks one-run sharing for approved ready targets.
  - Ожидалось: agent runs scan/report/apply-plan, then target `task:start`, reusable-rule import and QA.
  - Факт: skill now defines `One-Run Mode` with those steps.
  - PASS/FAIL: PASS.
- Case: user asks one-run sharing for blocked/manual-review target.
  - Ожидалось: agent skips target and reports reason.
  - Факт: skill requires skipping `manual_review`, `blocked`, dirty, archived, paused, or unclear projects.
  - PASS/FAIL: PASS.

Изменённые файлы:
- .memory-bank/code-rules.md
- .memory-bank/project-context.md
- AGENTS.md
- CODEX_MEMORY.md
- README.md
- plans/2026-04-29-1450-starter-rule-share-manual-review.md
- skills/starter-rule-share/SKILL.md
- skills/starter-rule-share/agents/openai.yaml
