# Source-backed контекст для карточек Books

**Статус:** подтверждено владельцем запросом от 2026-07-15.

## Связь с charter проекта

Контекст усиливает миссию Books: лаконичная идея остается навигационным тезисом, а конкретный пример из книги сохраняет причинную связь, применимость и доверие к источнику. Это не обычный summary и не дословное воспроизведение.

## Цель

Сделать `Контекст / пример из книги` обязательным полем action card во всех новых toolkit, чтобы downstream-выдача идей могла объяснять конкретную книжную сцену без догадок.

## Контекст

Текущий contract требует `Что внедрить`, `Когда применять`, `Первый шаг`, `Источник`, но не требует книжного примера. Поэтому contextless technical sections могут попадать в ежедневную выдачу и становиться непонятными вне toolkit.

## Job Story

Когда владелец видит отдельную идею из Books вне полного toolkit, он хочет рядом получить сжатый конкретный контекст из книги, чтобы понять, кто что сделал, почему и к какому эффекту это привело.

## Входные данные

| Источник | Что используем | Статус |
| --- | --- | --- |
| Запрос владельца | Обязательный раздел `Контекст` | подтверждено |
| `.memory-bank/product-charter.md` | Практичность, source traceability, не summary | подтверждено |
| `src/books/toolkit/toolkit-contract.mjs` | Канонический action-card contract | подтверждено |

## Ожидаемый результат

1. Contract требует `Контекст / пример из книги` для action cards.
2. Prompt rule определяет контекст как сжатую source-backed сцену: участники/ситуация, действие/решение, эффект/результат.
3. Контекст не может быть generic advice, повтором идеи или выдуманным кейсом.
4. `Первый шаг` сохраняется внутри полного toolkit; его удаление относится только к downstream Telegram-карточке.

## Критерии приёмки

- **AC-1.** Validator отклоняет action card без `Контекст / пример из книги`.
- **AC-2.** Prompt rules требуют конкретный source-backed summary и запрещают повтор идеи.
- **AC-3.** Product Charter и canonical mirrors синхронно отражают новый field contract.
- **AC-4.** Existing master-format, micro-practice coverage и source traceability не ослаблены.

## План проверки

| Критерий | Способ проверки | Ожидаемое наблюдение |
| --- | --- | --- |
| AC-1/2 | `tests/unit/books-toolkit-contract.test.mjs` | Missing context failure + prompt assertions PASS |
| AC-3 | Governance mirror test | Все canonical sources содержат новый invariant |
| AC-4 | `npm run qa:agent` | Полный gate PASS |

## Eval spec

**Применимо:** да — меняется prompt/agent behavior при создании toolkit.

### Хороший ответ

- После лаконичного `Что внедрить` идет 2-5 предложений с конкретной сценой/кейсом из книги, действиями участников и наблюдаемым эффектом; есть traceable source.

### Провал

- Контекст отсутствует, повторяет идею, содержит generic advice, выдумывает кейс или копирует большой фрагмент книги.

### Критичные случаи

- В книге нет narrative case: контекст должен кратко описать авторский мысленный эксперимент, наблюдение или причинную демонстрацию, не выдумывая компанию/персонажа.
- Несколько кейсов: выбрать наиболее показательный и сохранить source path/marker.
- Практика встречается только в nested section: coverage status сохраняется.

### Golden prompts

1. Создать карточку `No-blame rewrite` из `The Choice`.
2. Создать карточку из technical nonfiction без персонажей.

### Сравнение old vs new

- **Old:** контекст optional, downstream может показать голый тезис.
- **New:** action card без source-backed context не проходит contract.

### Minimum pass threshold

- 100% contract tests PASS; ни одна accepted card не пропускает context field; ноль invented/duplicated context в golden review.

### Eval owner

- Codex deterministic contract tests; semantic acceptance — владелец на готовом toolkit.

## Echo-test

**Применимо:** нет. Меняется существующий contract/prompt без новой технологии или provider.

## Техническая часть

### Область изменений

- Toolkit contract и tests.
- Product Charter и mirrors, перечисляющие поля action card.

### Вне scope

- Массовая перегенерация исторических toolkit.
- Удаление `Первый шаг` из полного toolkit.
- Изменение extraction provider/runtime.

### Инварианты

- Reusable toolkit, а не summary.
- Русский output.
- Нет больших цитат.
- Source traceability обязательна.

### Общий seam

`src/books/toolkit/toolkit-contract.mjs` и его canonical mirrors.

## План для агента

- [x] Добавить failing contract/eval assertions.
- [x] Обновить contract и prompt rules.
- [x] Синхронизировать mirrors и пройти QA.

## План QA

- [x] `node --test tests/unit/books-toolkit-contract.test.mjs`
- [x] `npm run qa:agent`

## UI browser oracle

Не применимо: локальный Markdown/CLI contract, публичного UI нет.

## Риски и откат

- Риск: старые toolkits не соответствуют новому полю. Изменение применяется к новым/перегенерируемым toolkit; historical migration вне scope.
- Откат: удалить новое поле из contract/mirrors и повторить deterministic QA.

## Лог выполнения

- [x] Начато: 2026-07-15 12:00 Europe/Kirov
- [x] Завершено: 2026-07-15 12:12 Europe/Kirov

## Фактические результаты

- `node --test tests/unit/books-toolkit-contract.test.mjs` — PASS, 6 tests.
- `The Choice`, карточка `4.8` обновлена по structured source главы 16: BigBrand, 30% роста доходов, остановка перед 2,5 млн магазинов, проверка обвиняющих гипотез и аналитический результат.
- Cross-repo oracle через Agent_Const parser/render — PASS.
- `npm run qa:agent` — PASS: lint, typecheck, 56 tests, build.

## Дополнение: scope lock для `worktree-finish`

**Статус:** добавлено по замечанию владельца 2026-07-15.

### Связь с charter проекта

Изменение сохраняет safe task flow и source-of-truth governance: завершение Books-задачи не должно превращаться в аудит или finish связанных проектов.

### Цель

Закрепить правило `один вызов -> один exact worktree/task`, выбранный по `realpath(cwd)` и точному совпадению с `state.worktreePath`.

### Job Story

Когда владелец запускает `worktree-finish` из конкретного Books-worktree, он хочет завершить только эту задачу, чтобы никакие связанные проекты или worktree не проверялись и не изменялись без отдельного явного запроса.

### Критерии приёмки

- **AC-S1.** Skill фиксирует target до repository discovery через `realpath(cwd)` и exact `state.worktreePath`.
- **AC-S2.** Cross-repo dependency или связанный runtime worktree не расширяют scope.
- **AC-S3.** Другой target требует отдельного явного запроса, preflight и cleanup choice.
- **AC-S4.** Regression test запрещает прежнюю инструкцию добавлять найденный stale worktree в текущий cleanup dialogue.
- **AC-S5.** Safe link flow умеет подключить только исправленный `worktree-finish`, не переподключая остальные глобальные skills.

### Eval spec

- **Agent surface:** `$worktree-finish` из managed task worktree.
- **Хороший ответ:** называет один locked repository/worktree/task/branch, проверяет только их и задаёт cleanup choice только для этого target.
- **Провал:** читает status/task-state другого проекта, предлагает завершить второй worktree или объединяет два cleanup choice.
- **Golden prompt:** вызвать `$worktree-finish` из Books-worktree при наличии связанного Agent_Const-worktree; Agent_Const должен остаться полностью вне inspection и mutation scope.
- **Сравнение old vs new:** old допускал отдельный pending cleanup для найденного worktree; new помечает случайно упомянутый внешний target как `out of scope` и требует отдельного запроса.
- **Minimum pass threshold:** 100% scope-lock unit assertions PASS; в golden-сценарии ровно один finish target.
- **Активация:** после merge запустить single-skill source link из стабильного Books `main`; source из другого проекта не изменять.

### QA evidence

- [x] `quick_validate.py skills/worktree-finish` — PASS (`Skill is valid!`).
- [x] `node --test tests/unit/worktree-finish-scope-lock.test.mjs` — PASS, 2 tests.
- [x] `node --test tests/unit/skills-manager.test.mjs` — PASS, 7 tests; single-skill source link управляет ровно одним target.
- [x] `npm run qa:agent` — PASS: lint, typecheck, 59 tests, build.
