---
name: gh-address-comments
description: Fetch and organize GitHub PR conversation comments, reviews, and inline review threads with the GitHub CLI, then help plan and apply selected fixes. Use when a user asks Codex to address PR review comments or issue comments for the current branch or a specific GitHub pull request.
metadata:
  short-description: Address GitHub PR comments
---

# GitHub PR Comment Handler

Use this skill to gather GitHub PR comments and review threads, summarize what needs attention, and help apply selected fixes. This skill uses the GitHub CLI directly and does not require Composio.

## Preconditions

- Follow the current repository's `AGENTS.md`, memory-bank rules, and QA contract before edits.
- `gh` must be installed and authenticated for the target repository.
- If `gh auth status` fails, stop and ask the user to authenticate with `gh auth login`.
- Do not request sandbox escalation or special permissions from this skill.

## Workflow

1. Verify local context:
   - Check current branch and repo status.
   - Confirm `gh auth status`.
   - Resolve the current branch PR with `gh pr view --json number,url,title` unless the user provided a PR.
2. Fetch comments:
   - Run `python "<skill-dir>/scripts/fetch_comments.py"`.
   - The script prints JSON containing conversation comments, review submissions, and inline review threads.
3. Summarize attention items:
   - Group unresolved inline threads first.
   - Include file path and line when available.
   - Distinguish questions, requested changes, outdated threads, and already-resolved threads.
   - Keep comment IDs or thread IDs as traceability, not as the main user interface.
4. Confirm scope before edits:
   - If the user asked to address all comments, proceed with a short fix plan.
   - If the request is ambiguous, ask which summarized items to address.
5. Apply selected fixes:
   - Make focused changes for the approved items.
   - Preserve unrelated user changes.
   - Run targeted checks, then the repository-required QA gate when the repository contract requires it.
6. Report outcome:
   - List addressed items and remaining items.
   - Do not mark threads resolved or post replies unless the user explicitly asks.

## Bundled Script

`scripts/fetch_comments.py` fetches all PR conversation comments, reviews, and inline review threads for the PR associated with the current branch.

Example:

```bash
python "<skill-dir>/scripts/fetch_comments.py" > /tmp/pr-comments.json
```

## Safety Rules

- Do not delete, resolve, or reply to GitHub threads unless explicitly requested.
- Do not make broad refactors while addressing review comments.
- Do not print secrets or private notes found in comments. If a comment includes sensitive data, redact it in summaries and flag `WARNING:`.
- If comments conflict with repository governance or product charter, explain the conflict and propose the nearest safe alternative.
