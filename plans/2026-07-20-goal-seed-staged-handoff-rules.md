# Goal Seed staged handoff rules

## Связь с charter проекта

Изменение поддерживает безопасный managed task conveyor проекта Books и не меняет его mission, audience, JTBD, product scope, adapters или runtime. Source of truth: `.memory-bank/product-charter.md`.

## Цель

Перенести из new-project-starter ровно три owner-approved reusable правила Goal Seed handoff на starter commit `7e2ce50367694cec3f29fdc2fb247fea1eb95fce`.

## Контекст

Deep-link мог открыть workspace и заполнить composer, но это ошибочно интерпретировалось как отправленный turn. Нужна staged-модель с точным persisted read-back.

## Job Story

Когда я создаю managed worktree и передаю Goal Seed, я хочу видеть точное состояние handoff, чтобы draft не считался отправленной задачей и автоматизация не создавала второй worktree.

## Входные данные

- Подтверждённый scope: Agent_Const, Books, gantt-bb, project-manager-buddy.
- Правила: `starter.conveyor.goal-seed-handoff`, `starter.conveyor.worktree-create-open-only`, `starter.conveyor.codex-open-readback`.
- Exact starter head: `7e2ce50367694cec3f29fdc2fb247fea1eb95fce`.

## Ожидаемый результат

- `--open-only` открывает exact workspace без prompt/thread.
- `--native-handoff` не передаёт prompt и возвращает явную потребность в app-native handoff.
- `openedChat=true` и `turnStarted=true` возможны только после exact `cwd + first_user_message` read-back.
- GUI automation, transient app-server acknowledgement и второй worktree не используются как fallback.

## Критерии приемки

- [ ] Три правила отражены в canonical governance и registry.
- [ ] Реализация хранит staged fields отдельно.
- [ ] Regression tests покрывают draft, open-only, native handoff и exact read-back.
- [ ] Полный `npm run qa:agent` проходит.
- [ ] Product/runtime/UI/credentials не меняются.

## Проверка

Focused tests для `task:start`, затем полный `npm run qa:agent`; UI browser oracle не применим, потому что меняется локальный conveyor protocol, а не продуктовый UI.

## Eval spec

Good answer: draft остаётся draft, open-only не создаёт thread, sent turn подтверждается exact persisted read-back. Failure: любой acknowledgement повышает состояние до sent. Critical edges: чужой fresh thread, другой first message, native handoff, отсутствие state DB. Golden prompts: обычный task:start, `--open-only`, `--native-handoff`, конфликт двух флагов. Minimum pass threshold: 100% mandatory protocol tests, 0 GUI/app-server/second-worktree fallback.
