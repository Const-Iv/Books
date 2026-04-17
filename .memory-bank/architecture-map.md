# Architecture Map

## High-Level Modules

- `scripts/dependency-preflight.mjs`: dependency recovery seam.
- `scripts/deterministic-feedback-loop.mjs`: deterministic QA orchestrator.
- `scripts/worktree-start.mjs`: task bootstrap, branch/worktree creation, state/history START.
- `scripts/worktree-qa-agent.mjs`: task QA checkpoint, failure classification, TRIZ trigger evaluation.
- `scripts/worktree-finish-core.mjs`: finish orchestration, capture, commit, merge handoff, cleanup decision.
- `scripts/worktree-merge-main.mjs`: safe merge/publish on local `main`.
- `scripts/worktree-history.mjs` + `scripts/worktree-ledger.mjs`: docs snapshots from runtime history/state.
- `scripts/worktree-operational-docs.mjs`: single-writer capture/sync of operational docs.
- `scripts/release-local.mjs`: local-first release gate.

## Runtime Data Flow

1. User intent входит через branch-chat или прямой npm entrypoint.
2. Conveyor script normalizes input into task state + runtime history events.
3. Shared helpers in `scripts/lib/*` управляют git/worktree operations, state I/O и docs sync.
4. Deterministic QA and release gates работают только через canonical scripts.
5. Human-readable docs snapshots (`Docs/*`) строятся из machine-readable runtime artifacts.

## Risk Hotspots

- drift между `AGENTS.md`, `.memory-bank/*`, `README.md` и реально исполняемыми npm scripts;
- task state schema drift (`qaLastPassSha`, `previewPreparedSha`, publish markers, operational artifacts);
- неправильная работа с git worktree lifecycle и cleanup;
- silent overwrite shared docs вместо single-writer capture/sync;
- flaky perf/security/coverage gates, которые выглядят “включёнными”, но не дают надёжного evidence.

## Change Impact Checklist

Когда меняется conveyor/runtime:

- проверить `scripts/lib/runtime.mjs`;
- проверить task state/history schema;
- проверить smoke/nightly integration tests.

Когда меняется governance:

- синхронизировать `AGENTS.md`, `.memory-bank/*`, `.cursorrules`, `CLAUDE.md`;
- проверить README и scripts/README на parity с реальными командами.

Когда меняются operational docs helpers:

- проверить capture/sync;
- проверить `Docs/task-history.md` и `Docs/change-ledger.md` rebuild path;
- проверить append-only sections `CODEX_MEMORY.md`.
