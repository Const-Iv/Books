---
name: gh-fix-ci
description: Inspect failing GitHub PR checks or recent GitHub Actions failures with the GitHub CLI, fetch logs, summarize actionable failure context, and prepare a local fix plan before code changes. Use when a user asks Codex to debug or fix failing GitHub CI checks for the current branch, a specific pull request, or a recent time window across repositories.
metadata:
  short-description: Diagnose failing GitHub CI checks
---

# GitHub CI Diagnostics

Use this skill to diagnose failing GitHub Actions checks from the terminal without adding Composio or any other external workflow service. This is a read-first skill: collect facts, summarize the failure, then make code changes only after the user has approved the fix direction or has already given an explicit fix request.

## Preconditions

- Follow the current repository's `AGENTS.md`, memory-bank rules, and QA contract before edits.
- `gh` must be installed and authenticated for the target repository.
- If `gh auth status` fails, stop and ask the user to authenticate with `gh auth login`.
- Do not request sandbox escalation or special permissions from this skill.

## Inputs

- Repository path, default current repo.
- PR number or URL, optional. If omitted in PR mode, resolve the PR for the current branch.
- Recent failure window, optional. Default recent audit window is 14 days.
- Repository slugs, notification repositories, or all accessible repositories for recent audit mode.
- User intent: diagnose only, or diagnose and fix.

## Workflow

1. Verify local context:
   - Check current branch and repo status.
   - Confirm `gh auth status`.
   - If the repository has a required task/plan/QA workflow, follow it before edits.
2. Inspect failing PR checks:
   - Run `python "<skill-dir>/scripts/inspect_pr_checks.py" --repo "." --pr "<number-or-url>"`.
   - Add `--json` when machine-readable output helps summarization.
   - If no PR is provided, omit `--pr` and let the script resolve the current branch PR.
3. For recent scheduled/nightly or cross-repository failures, inspect recent workflow runs:
   - Run `python "<skill-dir>/scripts/inspect_actions_failures.py" --repo "." --from-notifications --since "<iso-date>"`.
   - Use explicit repositories when the owner named them: `--repo-slug "owner/repo"`.
   - Use `--all-accessible-repos` only when the owner asks for a broad account audit.
   - Broad audit samples one latest run per repo/workflow by default; add `--group-by-branch` only when branch-level separation is needed.
   - Treat `account_billing_blocker` as owner/platform action, not a code regression.
4. Summarize only actionable facts:
   - Failing check name.
   - GitHub Actions run URL when available.
   - Relevant failure snippet.
   - Whether the check is external and out of scope for log fetching.
   - For recent audit mode, group repeated runs by repo, workflow, branch scope, and failure class before recommending fixes.
5. Propose the smallest fix path:
   - State likely cause only when the logs support it.
   - Name the local files/tests likely involved.
   - Ask for approval before edits unless the user explicitly asked to fix.
6. Implement and verify:
   - Make focused changes.
   - Run the closest deterministic local check first.
   - Run the repository-required QA gate before claiming the CI issue is fixed.
7. Recheck when useful:
   - Use `gh pr checks <pr>` or rerun the bundled script after pushing or after the user says CI has rerun.

## Bundled Script

`scripts/inspect_pr_checks.py` fetches failing PR checks, retrieves GitHub Actions logs where possible, and extracts a concise failure snippet.

`scripts/inspect_actions_failures.py` audits recent failed workflow runs across explicit repositories, CI notifications, or accessible repositories. It groups repeated failures and classifies obvious owner/platform blockers separately from code regressions.

Examples:

```bash
python "<skill-dir>/scripts/inspect_pr_checks.py" --repo "." --pr "123"
python "<skill-dir>/scripts/inspect_pr_checks.py" --repo "." --pr "https://github.com/org/repo/pull/123" --json
python "<skill-dir>/scripts/inspect_pr_checks.py" --repo "." --max-lines 200 --context 40
python "<skill-dir>/scripts/inspect_actions_failures.py" --repo "." --from-notifications --since "2026-04-16T00:00:00Z"
python "<skill-dir>/scripts/inspect_actions_failures.py" --repo "." --repo-slug "owner/repo" --since "2026-04-16" --json
python "<skill-dir>/scripts/inspect_actions_failures.py" --repo "." --all-accessible-repos --since "2026-04-16T00:00:00Z"
```

## Safety Rules

- Do not post GitHub comments, rerun workflows, merge, push, or mark checks resolved unless the user explicitly asked for that action and repository rules allow it.
- Do not treat external check URLs as GitHub Actions logs; report the URL and say the logs are out of scope for this skill.
- Do not hide missing logs. Say when logs are unavailable or still pending.
- Do not print secrets from logs. If a log appears to contain a token or credential, redact it in the user-facing summary and flag `WARNING:`.
