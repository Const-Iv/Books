# Starter Kit нового проекта

Этот репозиторий — не просто blueprint-папка, а **исполняемый Node/npm baseline** для нового проекта под правила Codex/worktree conveyor:

- `codex/*` managed worktrees;
- conversational branch-chat;
- deterministic QA;
- Karpathy-style execution discipline;
- BMAD-ready governance;
- TRIZ escalation by trigger;
- single-writer operational docs;
- shared memory-bank governance;
- local-first `release:local`.

## Что внутри

- `AGENTS.md` — канонический договор для Codex.
- `CLAUDE.md` и `.cursorrules` — cross-agent mirrors.
- `.memory-bank/` — shared long-lived knowledge.
- `CODEX_MEMORY.md` — оперативная память Codex.
- `scripts/` — реальные process entrypoints, а не только README-контракты.
- `tests/` — unit/integration/e2e проверки самого starter baseline.
- `Docs/` — process evidence, baselines и review guidance.
- `research/triz/` — канонический TRIZ pack.
- `templates/agent-workspace/` — безопасные локальные шаблоны без коммита личных данных.

## Быстрый старт

1. Скопируйте этот репозиторий или его содержимое в корень нового проекта.
2. Адаптируйте доменно-специфичные описания в:
   - `AGENTS.md`
   - `.memory-bank/project-context.md`
   - `.memory-bank/architecture-map.md`
   - `README.md`
3. Установите зависимости:

```bash
npm ci
```

4. Прогоните baseline QA:

```bash
npm run qa:agent
npm run qa:smoke:pr
npm run qa:e2e:nightly
npm run qa:security
npm run qa:coverage:critical
npm run qa:perf:critical
```

## Что перенесено из актуальной логики работы

- Karpathy overlay: явные assumptions для non-trivial задач, surgical diffs и `reproduce -> fix -> verify` для bugfix/regression.
- BMAD integration: если проект включает BMAD, каноника живёт в `_bmad/`, а `_bmad-output/` остаётся локальным scratch без коммита.
- `task:start` теперь считается валидным только из clean source tree; bypass через `--allow-dirty` не допускается.
- Dependency preflight — общий seam для `task:start`, `task:test` и `task:qa:agent`.
- `previewPreparedSha` остаётся обязательным checkpoint even when preview status = `not_supported`.
- `qaLastPassSha` должен позволять reuse task-QA на неизменившемся `HEAD`.
- Shared operational docs и generated history snapshots должны оставаться single-writer и синхронизироваться только на publish/release stage.

## Канонические команды

- `npm run lint`
- `npm run lint:fix`
- `npm run lint:fix:changed`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run qa:agent`
- `npm run qa:smoke:pr`
- `npm run qa:e2e:nightly`
- `npm run qa:security`
- `npm run qa:coverage:critical`
- `npm run qa:perf:critical`
- `npm run task:start -- --title "<title>" --seed-message "<request>"`
- `npm run task:test -- [args]`
- `npm run task:qa:agent`
- `npm run task:finish:core`
- `npm run task:merge:main`
- `npm run task:history -- sync`
- `npm run task:ledger -- rebuild --write-docs`
- `npm run task:operational-docs:capture`
- `npm run task:operational-docs:sync`
- `npm run release:local`

## Что важно понимать

- Core starter не содержит продуктовый UI/API runtime. Smoke/nightly здесь проверяют process-level сценарии на временных git repos.
- `task:qa:agent` всё равно создаёт `previewPreparedSha`, но по умолчанию preview status = `not_supported`. Когда реальный проект добавит preview adapter, contract уже будет готов.
- `release:local` — обязательный core publish path. Deploy-to-server и `db:prod:*` контуры должны добавляться как optional profile поверх этой базы.
- Если вы подключаете BMAD поверх starter, не делайте `_bmad-output/` источником истины для conveyor state, shared docs или committed plans.
