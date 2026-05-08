# Сохранение Books artifacts при завершении задачи

## Связь с charter проекта

Books должен превращать книгу в применимый рабочий toolkit, к которому можно возвращаться и который можно использовать вместе с коллегами. Charter также фиксирует, что полный текст книги сохраняется только как рабочий input, а не как публичный output.

Это изменение сохраняет оба требования:
- toolkit становится shareable artifact в Git;
- полный оригинал книги остаётся локальным рабочим файлом в ignored `runtime/books`;
- при завершении task-worktree локальные материалы книги переносятся в `main`, чтобы cleanup не удалял результат работы.

## Цель изменения

Сделать хранение результатов Books предсказуемым:
- `books/<book-slug>/` — версия toolkit для совместного использования и Git;
- `runtime/books/<book-slug>/` — локальный рабочий комплект с оригиналом и копией toolkit;
- `task:finish:core` перед delete-cleanup переносит `runtime/books` из task-worktree в main-worktree.

## Целевая аудитория проекта

Владелец проекта и коллеги, которым нужно открыть готовый toolkit без доступа к полному оригиналу книги.

## JTBD

Когда я завершил разбор книги, я хочу, чтобы toolkit был доступен в Git для шаринга, а полный оригинал сохранился локально в main, чтобы можно было и поделиться результатом, и позже уточнить спорный концепт по исходному тексту.

## Job Stories

- Когда я делюсь результатами с коллегами, я хочу отправить tracked toolkit из Git, чтобы не публиковать полный текст книги.
- Когда я закрываю task-worktree, я хочу, чтобы `runtime/books` сохранился в main, чтобы cleanup не удалял оригинал и локальные рабочие материалы.
- Когда в main уже есть файл с таким именем, я хочу не потерять существующий файл, чтобы новый finish-процесс не перезаписал прошлую работу молча.

## User Stories

- Как пользователь Books, я вижу toolkit в `books/<book-slug>/` и могу делиться им через Git.
- Как пользователь Books, я вижу оригинал в `runtime/books/<book-slug>/` в main-worktree и могу использовать его для уточнения концептов.
- Как пользователь Books, я получаю deterministic finish-flow: task cleanup не удаляет единственную копию результатов.

## Критерии приемки

- Полный оригинал книги не попадает в Git.
- Готовый toolkit по `The Goal` лежит в tracked `books/goldratt-the-goal/`.
- `task:finish:core --cleanup 1` до удаления task-worktree копирует файлы из `runtime/books` task-worktree в `runtime/books` main-worktree.
- Если destination-файл уже существует и отличается, новый файл сохраняется рядом с суффиксом task id, без silent overwrite.
- Finish history фиксирует событие переноса Books artifacts.
- Есть deterministic regression test на перенос `runtime/books` при delete cleanup.

## План для агента

1. Добавить helper для копирования `runtime/books` из task-worktree в main-worktree.
2. Подключить helper в `task:finish:core` перед `executeTaskCleanup`.
3. Обновить docs/memory по storage policy: tracked toolkit, ignored original.
4. Добавить tracked Goldratt toolkit и manifest без полного оригинала.
5. Добавить regression test и прогнать релевантные QA checks.

## QA план

- `node --test tests/unit/books-artifacts.test.mjs`
- `node --test tests/integration/books-artifacts-finish.test.mjs`
- `npm run test`
- `npm run lint`
- `npm run typecheck`

## QA evidence

- `node --test tests/unit/books-artifacts.test.mjs` — PASS, 2 tests.
- `node --test tests/integration/books-artifacts-finish.test.mjs` — PASS, 1 test.
- `npm run test` — PASS, 44 tests.
- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
