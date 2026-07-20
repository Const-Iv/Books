# Eval spec: Goal Seed staged handoff

## Good answer

Composer draft остаётся draft; `--open-only` не создаёт thread; sent turn подтверждается только exact persisted `cwd + first_user_message` read-back.

## Failure

Workspace/deep-link/app-server acknowledgement ошибочно повышает состояние до sent или создаётся второй worktree.

## Critical edge cases

Чужой fresh thread, другой first message, native handoff, отсутствие Codex state DB и конфликт `--open-only + --native-handoff`.

## Golden prompts

1. Обычный `task:start` с Goal Seed.
2. `task:start --open-only`.
3. `task:start --native-handoff`.
4. Одновременные `--open-only --native-handoff`.

## Old vs new

Old: best-effort open/prompt мог называться отправленным сообщением. New: staged fields независимы, а sent state требует exact persisted read-back.

## Minimum pass threshold

100% mandatory protocol tests; 0 GUI automation, transient app-server acknowledgement или second-worktree fallback.
