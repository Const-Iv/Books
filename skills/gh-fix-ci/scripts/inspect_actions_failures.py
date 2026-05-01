#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable, Sequence
from urllib.parse import urlencode


FAILURE_MARKERS = (
    "##[error]",
    "error:",
    "error",
    "failed",
    "failure",
    "not ok",
    "assertionerror",
    "traceback",
    "exception",
    "timeout",
    "spending limit",
    "payments have failed",
)

STRONG_FAILURE_MARKERS = (
    "recent account payments have failed",
    "spending limit needs to be increased",
    "failedstage",
    "not ok",
    "assertionerror",
    "visual snapshot height mismatch",
    "expected two order options",
    "error: src refspec",
)

IGNORED_FAILURE_HINTS = (
    "to see what failed",
    "actions are deprecated",
    "may not work as expected",
)

BILLING_MARKERS = (
    "recent account payments have failed",
    "spending limit needs to be increased",
    "billing & plans",
)

QA_MARKERS = (
    "qa_agent_machine_summary",
    "not ok",
    "assertionerror",
    "tests ",
)

DEFAULT_MAX_LINES = 120
DEFAULT_CONTEXT_LINES = 24


@dataclass
class GhResult:
    returncode: int
    stdout: str
    stderr: str


def run_gh_command(args: Sequence[str], cwd: Path) -> GhResult:
    process = subprocess.run(
        ["gh", *args],
        cwd=cwd,
        text=True,
        capture_output=True,
    )
    return GhResult(process.returncode, process.stdout, process.stderr)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Inspect recent failed GitHub Actions runs across explicit repositories, "
            "notification repositories, or accessible repositories."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--repo", default=".", help="Local directory used as gh working directory.")
    parser.add_argument(
        "--repo-slug",
        action="append",
        default=[],
        help="GitHub repository slug owner/name. Can be repeated or comma-separated.",
    )
    parser.add_argument(
        "--repos-file",
        default=None,
        help="Optional newline or JSON file with repository slugs.",
    )
    parser.add_argument(
        "--from-notifications",
        action="store_true",
        help="Add repositories from CI-related GitHub notifications since the start date.",
    )
    parser.add_argument(
        "--all-accessible-repos",
        action="store_true",
        help="Audit all accessible repos updated within the period.",
    )
    parser.add_argument("--since", default=None, help="ISO timestamp/date. Defaults to 14 days ago UTC.")
    parser.add_argument("--until", default=None, help="Optional ISO timestamp/date upper bound.")
    parser.add_argument("--max-lines", type=int, default=DEFAULT_MAX_LINES)
    parser.add_argument("--context", type=int, default=DEFAULT_CONTEXT_LINES)
    parser.add_argument(
        "--fetch-all-logs",
        action="store_true",
        help="Fetch logs for every failed run instead of one latest sample per broad group.",
    )
    parser.add_argument(
        "--group-by-branch",
        action="store_true",
        help="Keep separate log samples per branch. By default broad audit groups by repo/workflow for speed.",
    )
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text output.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = Path(args.repo).resolve()
    if not repo_root.exists():
        print(f"Error: repo path does not exist: {repo_root}", file=sys.stderr)
        return 1

    if not ensure_gh_available(repo_root):
        return 1

    since = normalize_since(args.since)
    until = normalize_until(args.until)
    repo_slugs = collect_repo_slugs(args, repo_root=repo_root, since=since)
    if not repo_slugs:
        print("Error: no repositories selected.", file=sys.stderr)
        return 1

    raw_runs: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    for slug in repo_slugs:
        repo_runs, repo_error = fetch_failed_runs(slug, repo_root=repo_root, since=since, until=until)
        if repo_error:
            errors.append({"repo": slug, "error": repo_error})
            continue
        for run in repo_runs:
            raw_runs.append({"repo": slug, "run": run})

    runs: list[dict[str, Any]] = []
    raw_groups = group_raw_runs(raw_runs, group_by_branch=args.group_by_branch)
    selected_groups = (
        [[entry] for entry in raw_runs]
        if args.fetch_all_logs
        else list(raw_groups.values())
    )
    for entries in selected_groups:
        sample = latest_raw_run(entries)
        if not sample:
            continue
        slug = str(sample["repo"])
        run = sample["run"] if isinstance(sample["run"], dict) else {}
        analyzed = analyze_run(
            slug,
            run,
            repo_root=repo_root,
            max_lines=max(1, args.max_lines),
            context=max(1, args.context),
        )
        analyzed["groupRunCount"] = len(entries)
        branches = sorted(
            {
                str(entry["run"].get("head_branch"))
                for entry in entries
                if isinstance(entry.get("run"), dict) and entry["run"].get("head_branch")
            }
        )
        analyzed["groupBranches"] = branches
        if len(branches) > 1:
            analyzed["head_branch"] = "multiple"
            analyzed["failureKey"] = build_failure_key({**run, "head_branch": "multiple"}, str(analyzed["failureClass"]), str(analyzed["snippet"]))
        analyzed["sampledRunIds"] = [
            str(entry["run"].get("id"))
            for entry in entries
            if isinstance(entry.get("run"), dict) and entry["run"].get("id")
        ]
        runs.append(analyzed)

    runs.sort(key=lambda item: str(item.get("created_at", "")), reverse=True)
    summary = build_summary(runs, errors=errors, since=since, until=until, repo_slugs=repo_slugs, raw_run_count=len(raw_runs))
    if args.json:
        print(json.dumps(summary, indent=2, ensure_ascii=False))
    else:
        render_summary(summary)

    return 1 if runs or errors else 0


def ensure_gh_available(repo_root: Path) -> bool:
    result = run_gh_command(["auth", "status"], cwd=repo_root)
    if result.returncode == 0:
        return True
    message = (result.stderr or result.stdout or "").strip()
    print(message or "Error: gh not authenticated.", file=sys.stderr)
    return False


def normalize_since(value: str | None) -> str:
    if value:
        return normalize_date_like(value)
    return (datetime.now(timezone.utc) - timedelta(days=14)).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def normalize_until(value: str | None) -> str | None:
    if not value:
        return None
    return normalize_date_like(value)


def normalize_date_like(value: str) -> str:
    trimmed = value.strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", trimmed):
        return f"{trimmed}T00:00:00Z"
    return trimmed


def collect_repo_slugs(args: argparse.Namespace, repo_root: Path, since: str) -> list[str]:
    selected: list[str] = []
    selected.extend(split_repo_values(args.repo_slug))
    if args.repos_file:
        selected.extend(read_repos_file(Path(args.repos_file)))
    if args.from_notifications:
        selected.extend(fetch_notification_repos(repo_root=repo_root, since=since))
    if args.all_accessible_repos:
        selected.extend(fetch_recent_accessible_repos(repo_root=repo_root, since=since))
    return unique_slugs(selected)


def split_repo_values(values: Iterable[str]) -> list[str]:
    slugs: list[str] = []
    for value in values:
        for part in value.split(","):
            slug = part.strip()
            if slug:
                slugs.append(slug)
    return slugs


def read_repos_file(path: Path) -> list[str]:
    content = path.read_text(encoding="utf8")
    if path.suffix == ".json":
        data = json.loads(content)
        if isinstance(data, list):
            return [str(item) for item in data]
        if isinstance(data, dict) and isinstance(data.get("repos"), list):
            return [str(item) for item in data["repos"]]
        raise ValueError("repos JSON must be a list or an object with a repos list.")
    return [
        line.strip()
        for line in content.splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]


def fetch_notification_repos(repo_root: Path, since: str) -> list[str]:
    endpoint = f"notifications?{urlencode({'all': 'true', 'since': since, 'per_page': '100'})}"
    result = run_gh_command(["api", endpoint, "--paginate"], cwd=repo_root)
    if result.returncode != 0:
        return []
    try:
        notifications = json.loads(result.stdout or "[]")
    except json.JSONDecodeError:
        return []
    slugs: list[str] = []
    for item in ensure_list(notifications):
        if not isinstance(item, dict):
            continue
        reason = str(item.get("reason") or "")
        subject = item.get("subject") if isinstance(item.get("subject"), dict) else {}
        title = str(subject.get("title") or "")
        subject_type = str(subject.get("type") or "")
        if reason != "ci_activity" and subject_type != "CheckSuite" and "workflow run failed" not in title.lower():
            continue
        repo = item.get("repository") if isinstance(item.get("repository"), dict) else {}
        full_name = repo.get("full_name")
        if full_name:
            slugs.append(str(full_name))
    return slugs


def fetch_recent_accessible_repos(repo_root: Path, since: str) -> list[str]:
    endpoint = "user/repos?affiliation=owner,collaborator,organization_member&sort=updated&per_page=100"
    result = run_gh_command(["api", endpoint, "--paginate"], cwd=repo_root)
    if result.returncode != 0:
        return []
    try:
        repos = json.loads(result.stdout or "[]")
    except json.JSONDecodeError:
        return []
    since_dt = parse_datetime(since)
    slugs: list[str] = []
    for repo in ensure_list(repos):
        if not isinstance(repo, dict):
            continue
        updated_at = parse_datetime(str(repo.get("updated_at") or ""))
        if since_dt and updated_at and updated_at < since_dt:
            continue
        full_name = repo.get("full_name")
        if full_name:
            slugs.append(str(full_name))
    return slugs


def parse_datetime(value: str) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def unique_slugs(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    slugs: list[str] = []
    for value in values:
        slug = value.strip()
        if not re.fullmatch(r"[^/\s]+/[^/\s]+", slug):
            continue
        if slug in seen:
            continue
        seen.add(slug)
        slugs.append(slug)
    return slugs


def fetch_failed_runs(slug: str, repo_root: Path, since: str, until: str | None) -> tuple[list[dict[str, Any]], str]:
    created = f">={since}" if until is None else f"{since}..{until}"
    endpoint = f"repos/{slug}/actions/runs?{urlencode({'status': 'failure', 'created': created, 'per_page': '100'})}"
    result = run_gh_command(["api", endpoint, "--paginate"], cwd=repo_root)
    if result.returncode != 0:
        message = (result.stderr or result.stdout or "").strip()
        return [], message or "gh api workflow runs failed"
    try:
        payload = json.loads(result.stdout or "[]")
    except json.JSONDecodeError as exc:
        return [], f"unable to parse workflow runs JSON: {exc}"
    runs: list[dict[str, Any]] = []
    pages = payload if isinstance(payload, list) else [payload]
    for page in pages:
        if isinstance(page, dict) and isinstance(page.get("workflow_runs"), list):
            runs.extend(page["workflow_runs"])
    return runs, ""


def group_raw_runs(raw_runs: list[dict[str, Any]], group_by_branch: bool) -> dict[str, list[dict[str, Any]]]:
    groups: dict[str, list[dict[str, Any]]] = {}
    for entry in raw_runs:
        run = entry.get("run")
        if not isinstance(run, dict):
            continue
        key_parts = [
            str(entry.get("repo") or ""),
            normalize_signal(str(run.get("name") or "unknown")),
        ]
        if group_by_branch:
            key_parts.append(normalize_signal(str(run.get("head_branch") or "unknown")))
        key = "|".join(key_parts)
        groups.setdefault(key, []).append(entry)
    return groups


def latest_raw_run(entries: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not entries:
        return None
    return max(
        entries,
        key=lambda entry: str(entry["run"].get("created_at") if isinstance(entry.get("run"), dict) else ""),
    )


def analyze_run(
    slug: str,
    run: dict[str, Any],
    repo_root: Path,
    max_lines: int,
    context: int,
) -> dict[str, Any]:
    run_id = str(run.get("id") or "")
    log_text, log_error = fetch_failed_log(slug, run_id, repo_root=repo_root)
    view_text = ""
    if log_error:
        view_text = fetch_run_view(slug, run_id, repo_root=repo_root)

    source_text = log_text or view_text or log_error
    snippet = extract_failure_snippet(source_text, max_lines=max_lines, context=context)
    failure_class = classify_failure(source_text, log_error=log_error)
    return {
        "repo": slug,
        "id": run_id,
        "run_number": run.get("run_number"),
        "name": run.get("name"),
        "event": run.get("event"),
        "head_branch": run.get("head_branch"),
        "head_sha": run.get("head_sha"),
        "conclusion": run.get("conclusion"),
        "status": run.get("status"),
        "created_at": run.get("created_at"),
        "updated_at": run.get("updated_at"),
        "url": run.get("html_url"),
        "failureClass": failure_class,
        "failureKey": build_failure_key(run, failure_class, snippet),
        "logStatus": "ok" if log_text else "unavailable",
        "logError": log_error,
        "snippet": snippet,
    }


def fetch_failed_log(slug: str, run_id: str, repo_root: Path) -> tuple[str, str]:
    if not run_id:
        return "", "missing run id"
    result = run_gh_command(["run", "view", "-R", slug, run_id, "--log-failed"], cwd=repo_root)
    if result.returncode != 0:
        message = (result.stderr or result.stdout or "").strip()
        return "", message or "gh run view --log-failed failed"
    return result.stdout, ""


def fetch_run_view(slug: str, run_id: str, repo_root: Path) -> str:
    if not run_id:
        return ""
    result = run_gh_command(["run", "view", "-R", slug, run_id], cwd=repo_root)
    if result.returncode != 0:
        return ""
    return result.stdout


def classify_failure(text: str, log_error: str) -> str:
    lowered = f"{text}\n{log_error}".lower()
    if any(marker in lowered for marker in BILLING_MARKERS):
        return "account_billing_blocker"
    if any(marker in lowered for marker in QA_MARKERS):
        return "deterministic_regression"
    if log_error:
        return "log_unavailable"
    return "ci_failure"


def build_failure_key(run: dict[str, Any], failure_class: str, snippet: str) -> str:
    marker = first_signal_line(snippet)
    normalized_marker = normalize_signal(marker)
    workflow = normalize_signal(str(run.get("name") or "unknown"))
    branch = normalize_signal(str(run.get("head_branch") or "unknown"))
    return "|".join([failure_class, workflow, branch, normalized_marker])


def first_signal_line(snippet: str) -> str:
    for line in snippet.splitlines():
        lowered = line.lower()
        if is_ignored_failure_hint(lowered):
            continue
        if any(marker in lowered for marker in STRONG_FAILURE_MARKERS):
            return line
    for line in snippet.splitlines():
        lowered = line.lower()
        if is_ignored_failure_hint(lowered):
            continue
        if any(marker in lowered for marker in FAILURE_MARKERS):
            return line
    lines = [line for line in snippet.splitlines() if line.strip()]
    return lines[0] if lines else ""


def normalize_signal(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())[:180]


def extract_failure_snippet(log_text: str, max_lines: int, context: int) -> str:
    lines = log_text.splitlines()
    if not lines:
        return ""
    marker_index = find_failure_index(lines)
    if marker_index is None:
        return "\n".join(lines[-max_lines:])
    start = max(0, marker_index - context)
    end = min(len(lines), marker_index + context + 1)
    window = lines[start:end]
    if len(window) > max_lines:
        before = min(context, max(0, max_lines // 2))
        start = max(0, marker_index - before)
        end = min(len(lines), start + max_lines)
        if marker_index >= end:
            end = marker_index + 1
            start = max(0, end - max_lines)
        window = lines[start:end]
    return "\n".join(window)


def find_failure_index(lines: Sequence[str]) -> int | None:
    for idx in range(len(lines) - 1, -1, -1):
        lowered = lines[idx].lower()
        if is_ignored_failure_hint(lowered):
            continue
        if any(marker in lowered for marker in STRONG_FAILURE_MARKERS):
            return idx
    for idx in range(len(lines) - 1, -1, -1):
        lowered = lines[idx].lower()
        if is_ignored_failure_hint(lowered):
            continue
        if any(marker in lowered for marker in FAILURE_MARKERS):
            return idx
    return None


def is_ignored_failure_hint(lowered_line: str) -> bool:
    return any(marker in lowered_line for marker in IGNORED_FAILURE_HINTS)


def build_summary(
    runs: list[dict[str, Any]],
    errors: list[dict[str, str]],
    since: str,
    until: str | None,
    repo_slugs: list[str],
    raw_run_count: int,
) -> dict[str, Any]:
    groups: dict[str, dict[str, Any]] = {}
    for run in runs:
        key = str(run["failureKey"])
        group_run_count = int(run.get("groupRunCount") or 1)
        group = groups.setdefault(
            key,
            {
                "failureKey": key,
                "failureClass": run["failureClass"],
                "repo": run["repo"],
                "workflow": run["name"],
                "head_branch": run["head_branch"],
                "count": 0,
                "latest_created_at": run["created_at"],
                "latest_url": run["url"],
                "sampleSnippet": run["snippet"],
            },
        )
        group["count"] += group_run_count
        if str(run.get("created_at") or "") > str(group.get("latest_created_at") or ""):
            group["latest_created_at"] = run["created_at"]
            group["latest_url"] = run["url"]
            group["sampleSnippet"] = run["snippet"]

    grouped = sorted(groups.values(), key=lambda item: (-int(item["count"]), str(item["repo"]), str(item["workflow"])))
    class_counts: Counter[str] = Counter()
    for run in runs:
        class_counts[str(run["failureClass"])] += int(run.get("groupRunCount") or 1)
    return {
        "since": since,
        "until": until,
        "repositoryCount": len(repo_slugs),
        "runCount": raw_run_count,
        "sampledRunCount": len(runs),
        "errorCount": len(errors),
        "classCounts": dict(sorted(class_counts.items())),
        "groups": grouped,
        "runs": runs,
        "errors": errors,
    }


def render_summary(summary: dict[str, Any]) -> None:
    since = summary["since"]
    until = summary.get("until") or "now"
    print(f"GitHub Actions failures from {since} to {until}")
    print(f"Repositories checked: {summary['repositoryCount']}")
    print(f"Failed runs: {summary['runCount']}")
    if summary["classCounts"]:
        classes = ", ".join(f"{name}={count}" for name, count in summary["classCounts"].items())
        print(f"Failure classes: {classes}")
    if summary["errorCount"]:
        print(f"Repository errors: {summary['errorCount']}")

    print("")
    print("Grouped failures:")
    for group in summary["groups"]:
        print("-" * 72)
        print(
            f"{group['repo']} | {group['workflow']} | {group['head_branch']} | "
            f"{group['failureClass']} | count={group['count']}"
        )
        print(f"Latest: {group['latest_created_at']} {group['latest_url']}")
        snippet = str(group.get("sampleSnippet") or "").strip()
        if snippet:
            print("Sample:")
            print(indent_block(snippet, prefix="  "))

    if summary["errors"]:
        print("")
        print("Repository errors:")
        for error in summary["errors"]:
            print(f"- {error['repo']}: {error['error']}")


def indent_block(text: str, prefix: str) -> str:
    return "\n".join(f"{prefix}{line}" for line in text.splitlines())


def ensure_list(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    return []


if __name__ == "__main__":
    raise SystemExit(main())
