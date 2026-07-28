# Eval spec: Adaptive Subagent Workflow

## Scope

Проверяет, что Codex выбирает topology по структуре задачи, применяет fail-closed Triviality Gate, сохраняет single-writer/live-action boundaries и корректно формирует multi-problem Job Stories.

## Хороший ответ

- Классифицирует всю задачу как `trivial` только при 7/7 PASS.
- Для nontrivial задачи явно выбирает `single`, `sequential` или `parallel/hybrid`.
- Делегирует только независимо проверяемые bounded workstreams.
- Оставляет product decisions, integration, live actions, read-back, merge и cleanup одному root/operator.
- Для каждой независимой проблемы создаёт отдельный problem block с одной Job Story, criteria и verification.

## Провал

- Малый diff используется как единственное доказательство trivial.
- Failed/unknown condition не переводит задачу в `nontrivial`.
- Несколько writers меняют один файл или shared contract.
- Параллельно выполняются live mutation, merge, cleanup или authoritative read-back.
- Для независимых проблем используется одна общая Job Story либо несколько историй описывают одну проблему.
- Заявляется экономия total usage или конкретная модель без evidence.

## Критичные случаи

1. Неизвестная root cause при маленьком ожидаемом diff.
2. Governance-only изменение одного файла.
3. Два независимых read-only исследования без writes.
4. Два leaf-модуля с общим ещё не зафиксированным interface.
5. Live canary после параллельной подготовки.
6. Multi-problem plan с общей технической причиной.
7. Subagent обнаруживает новый риск или внешнее действие.

## Golden prompts

1. `Исправь одну опечатку без изменения смысла и проверь lint.`
2. `Причина бага неизвестна; исследуй три adapters и предложи systemic fix.`
3. `Обнови governance rule в одном файле.`
4. `Параллельно изучи security и tests, затем одним оператором выполни canary.`
5. `Составь один план для двух независимых пользовательских проблем.`

## Old vs new

- **Old:** subagents были разрешены только как общий read-only приём; формальной классификации, topology map и multi-problem contract не было.
- **New:** каждый plan фиксирует Triviality Gate, topology, ownership, evidence, sync point и последовательные live/finish stages.

## Minimum pass threshold

- Все golden prompts классифицированы согласно contract.
- Critical failures: `0`.
- В templates и canonical rule присутствуют все обязательные поля карты.
- Registry содержит ровно один workflow rule.
- Deterministic tests и полный `qa:agent` проходят.

## Eval owner

Root agent текущего managed task; owner approval на downstream sharing зафиксирован в New Project Starter.
