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
- `scripts/rule-sync.mjs`: cross-project governance scan/report/apply-plan seam for reusable starter rules.

## Runtime Data Flow

1. User intent входит через branch-chat или прямой npm entrypoint.
2. Conveyor script normalizes input into task state + runtime history events.
3. Shared helpers in `scripts/lib/*` управляют git/worktree operations, state I/O и docs sync.
4. Deterministic QA and release gates работают только через canonical scripts.
5. Human-readable docs snapshots (`Docs/*`) строятся из machine-readable runtime artifacts.

## Risk Hotspots

- drift между `AGENTS.md`, `.memory-bank/*`, `README.md` и реально исполняемыми npm scripts;
- drift между `.memory-bank/product-charter.md` и правилами в `AGENTS.md`, `.memory-bank/code-rules.md`, `CODEX_MEMORY.md`;
- task state schema drift (`qaLastPassSha`, `previewPreparedSha`, publish markers, operational artifacts);
- неправильная работа с git worktree lifecycle и cleanup;
- silent overwrite shared docs вместо single-writer capture/sync;
- flaky perf/security/coverage gates, которые выглядят “включёнными”, но не дают надёжного evidence.
- rule-sync classifier drift, из-за которого product-specific правила могут попасть в starter core.

## Change Impact Checklist

Когда меняется conveyor/runtime:

- проверить `scripts/lib/runtime.mjs`;
- проверить task state/history schema;
- проверить smoke/nightly integration tests.

Когда меняется governance:

- синхронизировать `AGENTS.md`, `.memory-bank/*`, `.memory-bank/product-charter.md`, `CODEX_MEMORY.md`, `.cursorrules`, `CLAUDE.md`;
- проверить README и scripts/README на parity с реальными командами.

Когда меняется rule-sync:

- проверить `scripts/rule-sync.mjs`;
- проверить `tests/unit/rule-sync.test.mjs`;
- проверить, что scan/report read-only, а apply-plan не меняет starter source без managed worktree.

Когда меняются operational docs helpers:

- проверить capture/sync;
- проверить `Docs/task-history.md` и `Docs/change-ledger.md` rebuild path;
- проверить append-only sections `CODEX_MEMORY.md`.
