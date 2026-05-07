Статус:
- [ ] Не начато
- [ ] В процессе
- [x] Завершено

Связь с charter проекта:
- Изменение поддерживает переносимый starter baseline: новый проект получает не пустой список вопросов, а управляемый разговорный intake с подтверждением owner'а.
- Изменение сохраняет Project Intake Gate: feature/refactor/behavior-change work по-прежнему запрещён до согласования intake.

Цель изменения:
- Зафиксировать правило conversational bootstrap: миссию формулирует owner, а после её согласования Codex предлагает следующие формулировки на основе уже согласованного контекста.

Целевая аудитория проекта:
- Downstream maintainers и agent-operators, которые запускают новый проект через starter и должны быстро пройти intake без потери owner approval.

Продуктовая спека:
- Проблема / JTBD: когда owner стартует новый проект, он хочет не отвечать на каждый пункт с нуля, а подтверждать качественные предложения, построенные на уже согласованной миссии и последующих ответах.
- Сценарий использования: owner даёт миссию; Codex предлагает видение; owner подтверждает или корректирует; дальше Codex так же предлагает цель, аудиторию, JTBD и остальные пункты.
- Требования: правило должно быть записано в primary bootstrap skill, intake template, canonical governance sources и mirrors.
- Критерии приемки: будущий bootstrap после согласованной миссии предлагает следующий intake-пункт сам; owner сохраняет право подтвердить или исправить формулировку; пустые вопросы используются только когда безопасное предложение невозможно.
- Метрика успеха: меньше пустых owner-facing вопросов при сохранении явного согласования каждого обязательного пункта.
- Ограничения / что нельзя сломать: нельзя позволять Codex согласовывать пункты за owner'а; placeholders и несогласованные допущения остаются blockers.

Eval spec:
- Agent surface: `starter-project-bootstrap` conversational Project Intake.
- Хороший ответ: после owner-approved миссии Codex предлагает видение в корректной формуле, помечает его как ожидающее approval и просит подтвердить или поправить.
- Провал: Codex задаёт пустой вопрос по видению без предложения; Codex сам помечает предложенное видение как согласованное; Codex начинает feature work до approved intake.
- Критичные edge cases: миссия слишком общая; owner просит изменить правило во время intake; следующий пункт зависит от неизвестной корневой технологии; owner даёт правку вместо подтверждения.
- Regression examples / golden prompts:
  - `стартуем новый проект`
  - `Проект помогает любому пользователю получать суперпрактическую выжимку из книги для того, чтобы можно было ее прямо брать и применять`
  - `Все дальнейшие вопросы сначала предлагаю свою формулировку`
- Old vs new comparison method: вручную сравнить ожидаемое поведение с текущим ответом в этой bootstrap-сессии.
- Minimum pass threshold: все golden prompts должны приводить к owner-authored миссии, предложенному следующему пункту и явному owner approval gate.

Implementation:
- [x] Обновить `skills/starter-project-bootstrap/SKILL.md`.
- [x] Обновить `plans/_project_intake_template.md`.
- [x] Обновить canonical governance sources: `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md`.
- [x] Обновить mirrors: `.cursorrules`, `CLAUDE.md`, `README.md`.
- [x] Обновить текущий Project Intake и добавить предложенное видение как ожидающее approval.

QA:
- [x] `git diff --check` — PASS.
- [x] `rg` по новому правилу в canonical sources и mirrors — PASS.
- [x] Manual eval по текущей сессии — PASS: после согласованной миссии Codex предложил видение и оставил его на owner approval.

Changed files:
- `AGENTS.md`
- `.memory-bank/product-charter.md`
- `.memory-bank/project-context.md`
- `.memory-bank/code-rules.md`
- `CODEX_MEMORY.md`
- `.cursorrules`
- `CLAUDE.md`
- `README.md`
- `skills/starter-project-bootstrap/SKILL.md`
- `plans/_project_intake_template.md`
- `plans/2026-05-06-1727-project-intake.md`
- `plans/2026-05-06-1749-bootstrap-intake-suggestions.md`
