# Starter Kit нового проекта

Этот репозиторий — не просто blueprint-папка, а **канонический исполняемый Node/npm baseline** для старта любого нового проекта под привычный Codex/worktree conveyor:

- `codex/*` managed worktrees;
- conversational branch-chat;
- deterministic QA;
- Karpathy-style execution discipline;
- BMAD-ready governance;
- TRIZ escalation by trigger;
- single-writer operational docs;
- shared memory-bank governance;
- product charter for mission/vision/goal/JTBD;
- local-first `release:local`.

Миссия starter: дать команде переносимую операционную основу для старта нового проекта с первого дня.

JTBD: когда начинается новый проект, получить готовую и переносимую основу, чтобы команда сразу работала по ясным правилам, проверяла изменения воспроизводимо и не собирала governance, task flow и QA заново.

Любое изменение starter нужно сверять с этой ролью: оно должно быть полезно как переносимый baseline для новых проектов. Продуктовую специфику добавляйте поверх starter через adapters/profiles, а не в core governance.

## Что внутри

- `AGENTS.md` — канонический договор для Codex.
- `CLAUDE.md` и `.cursorrules` — cross-agent mirrors.
- `.memory-bank/` — shared long-lived knowledge.
- `.memory-bank/product-charter.md` — миссия, видение, цель и JTBD проекта.
- `CODEX_MEMORY.md` — оперативная память Codex.
- `scripts/` — реальные process entrypoints, а не только README-контракты.
- `skills/` — versioned reusable Codex skills, которые можно подключить глобально через symlink.
- `scripts/rule-sync.mjs` и `skills/starter-rule-sync/` — регулярный контур поиска reusable правил в downstream проектах и подготовки approved импорта в starter.
- `tests/` — unit/integration/e2e проверки самого starter baseline.
- `Docs/` — process evidence, baselines и review guidance.
- `research/triz/` — канонический TRIZ pack.
- `templates/agent-workspace/` — безопасные локальные шаблоны без коммита личных данных.
- `templates/shared-skills-submodule/` — готовый downstream contract для подключения starter skills через git submodule.

## Быстрый старт

1. Скопируйте этот репозиторий или его содержимое в корень нового проекта.
2. Адаптируйте доменно-специфичные описания в:
   - `AGENTS.md`
   - `.memory-bank/product-charter.md`
   - `.memory-bank/project-context.md`
   - `.memory-bank/architecture-map.md`
   - `README.md`
3. Установите зависимости:

```bash
npm ci
```

4. Если хотите использовать общие repo-managed skills на этом устройстве, один раз подключите их в глобальный Codex home:

```bash
npm run skills:link
```

Если в `~/.codex/skills` уже есть локальная конфликтующая копия того же skill, используйте безопасную миграцию с backup:

```bash
npm run skills:link -- --adopt
```

5. Если проект подключает shared skills через git submodule, добавьте starter как versioned dependency и линкуйте skills из него:

```bash
git submodule add <starter-repo-url> vendor/new-project-starter
git submodule update --init --recursive
node vendor/new-project-starter/scripts/skills-manage.mjs link --source vendor/new-project-starter/skills
```

В таком режиме проект фиксирует конкретный commit starter baseline, а новые люди получают тот же набор skills после `git clone --recurse-submodules` или `git submodule update --init --recursive`.

6. Прогоните baseline QA:

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
- `npm run skills:link`
- `npm run skills:status`
- `npm run skills:unlink`
- `npm run rule-sync:scan -- --since <date> --until <date>`
- `npm run rule-sync:report -- --latest`
- `npm run rule-sync:apply-plan -- --approval <path> --dry-run`
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
- Repo-managed shared skills обновляются на устройстве обычным `git pull`, если symlink уже был создан. Для новых или переименованных skills повторно запускайте `npm run skills:link`.
- Для multi-project командного использования предпочтителен git submodule: downstream repo хранит starter под `vendor/new-project-starter`, а `skills-manage.mjs --source vendor/new-project-starter/skills` создаёт symlink'и в локальный `$CODEX_HOME/skills`.
- В starter core стоит хранить только reusable shared skills. `.system`, plugin-managed и product-specific skills должны жить вне этой baseline-папки.
- `task:qa:agent` всё равно создаёт `previewPreparedSha`, но по умолчанию preview status = `not_supported`. Когда реальный проект добавит preview adapter, contract уже будет готов.
- `release:local` — обязательный core publish path. Deploy-to-server и `db:prod:*` контуры должны добавляться как optional profile поверх этой базы.
- Если вы подключаете BMAD поверх starter, не делайте `_bmad-output/` источником истины для conveyor state, shared docs или committed plans.
