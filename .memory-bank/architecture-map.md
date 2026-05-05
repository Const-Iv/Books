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
- `skills/starter-project-bootstrap/SKILL.md`: primary Codex workflow for guided downstream Project Intake, canonical transfer, dependency/shared-skills setup, and baseline QA.
- `skills/starter-rule-report/SKILL.md`: primary Codex workflow for read-only reusable rule discovery and owner reports.
- `skills/starter-rule-import/SKILL.md`: primary Codex workflow for owner-approved reusable rule import.
- `skills/starter-rule-sync/SKILL.md`: compatibility router for legacy combined rule-sync prompts.
- `scripts/rule-sync.mjs`: deterministic cross-project governance scan/report/apply-plan execution seam for reusable starter rules.
- `skills/starter-rule-share/SKILL.md`: primary Codex workflow for approval-safe outbound sharing of the current starter baseline.
- `scripts/rule-share.mjs`: deterministic target-project scan/report/apply-plan execution seam for outbound starter rule sharing.
- `rule-share:apply-plan` task seeds are the copied-baseline import contract: preserve downstream product boundaries, sync canonical/mirror rule surfaces, require QA/TRIZ evidence and stop before finish/merge/publish unless explicitly approved.

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
- разрастание active operational logs без archive snapshot, из-за чего evidence становится трудно читать или переносить;
- flaky perf/security/coverage gates, которые выглядят “включёнными”, но не дают надёжного evidence.
- rule-sync classifier drift, из-за которого product-specific правила могут попасть в starter core.
- rule-sync window drift, из-за которого scheduled automation пропускает правила после missed run вместо catch-up от последнего saved scan snapshot.
- rule-share allowlist drift, из-за которого устаревший или paused проект может быть ошибочно предложен к обновлению.
- rule-share delivery drift, из-за которого downstream product-specific charter может быть перезаписан вместо reusable baseline import.
- capability profile drift, из-за которого product-specific provider, locale, stack, auth, billing, analytics, jobs или API-docs decisions могут ошибочно попасть в starter core вместо downstream adapters/profiles.
- bootstrap flow drift, из-за которого фраза `стартуем новый проект` превращается в общий checklist, пропускает Project Intake approval или начинает feature work до canonical transfer.
- echo-testing drift, из-за которого unknown root technology получает продуктовую реализацию без isolated minimal proof или blocker.
- owner-report source drift, из-за которого отчёт или дайджест смешивает данные из нескольких источников без явного источника каждой записи.

## Change Impact Checklist

Когда меняется conveyor/runtime:

- проверить `scripts/lib/runtime.mjs`;
- проверить task state/history schema;
- проверить finish no-op path для already-in-main task branch, если меняется publish/cleanup logic;
- проверить smoke/nightly integration tests.

Когда меняется governance:

- синхронизировать `AGENTS.md`, `.memory-bank/*`, `.memory-bank/product-charter.md`, `CODEX_MEMORY.md`, `.cursorrules`, `CLAUDE.md`;
- проверить README и scripts/README на parity с реальными командами.

Когда меняется starter project bootstrap:

- проверить `skills/starter-project-bootstrap/SKILL.md`;
- проверить `plans/_project_intake_template.md`;
- проверить echo-testing gate для unknown root technology и manual eval по golden prompts;
- проверить, что trigger rules есть в `AGENTS.md`, `.memory-bank/*`, `CODEX_MEMORY.md` и mirrors;
- проверить manual eval по golden prompts `стартуем новый проект` и `стартуем новый проект на <stack/provider>`.

Когда меняется rule-sync:

- проверить `skills/starter-rule-report/SKILL.md`;
- проверить `skills/starter-rule-import/SKILL.md`;
- проверить `skills/starter-rule-sync/SKILL.md`;
- проверить `scripts/rule-sync.mjs`;
- проверить `tests/unit/rule-sync.test.mjs`;
- проверить, что scan/report read-only, а apply-plan не меняет starter source без managed worktree.
- проверить, что default scan window идёт от последнего saved scan snapshot, а previous-local-day остаётся только fallback.

Когда меняется rule-share:

- проверить `skills/starter-rule-share/SKILL.md`;
- проверить `scripts/rule-share.mjs`;
- проверить `tests/unit/rule-share.test.mjs`;
- проверить, что scan/report read-only, apply-plan остаётся dry-run, а проекты берутся только из локального allowlist.

Когда меняются operational docs helpers:

- проверить capture/sync;
- проверить active log compaction и archive snapshot в `Docs/archive/*.md.gz`;
- проверить `Docs/task-history.md` и `Docs/change-ledger.md` rebuild path;
- проверить append-only sections `CODEX_MEMORY.md`.
