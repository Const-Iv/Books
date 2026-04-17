# Codex Code Review для starter baseline

## Recommended Setup

1. Подключите GitHub-репозиторий к Codex Code Review.
2. Рекомендуемый стартовый режим: `только ваши PR` или manual trigger.
3. Убедитесь, что branch protection опирается на те же обязательные checks, что и локальный baseline.

## High-Priority Findings

Для этого репозитория high-priority считаются только:

- поломки `task:start`, `task:qa:agent`, `task:finish:core`, `task:merge:main`, `release:local`;
- drift или corruption в `.git/codex-task-pipeline/tasks/*.json` и `.git/codex-task-pipeline/history/events.ndjson`;
- single-writer violations в operational docs;
- security defects в GitHub Actions, secret scan, dependency handling, local release safety;
- flaky QA/CI, из-за которых deterministic gates теряют доверие.

Не считать high-priority:

- stylistic/nit feedback;
- naming-only и comment-only замечания;
- необязательные refactor suggestions без прямого correctness/reliability/security impact.

## Required Checks

Минимальный рекомендуемый набор branch protection checks:

- `qa-pr`
- `workflow-lint`
- `actions-security`

Дополнительно полезно требовать:

- `qa-nightly` как отдельный scheduled signal;
- dependency review, если проект позже добавит production dependencies или GitHub-native dependency governance.
