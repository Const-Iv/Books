// @ts-check

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const THIS_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = path.dirname(path.dirname(path.dirname(THIS_FILE)));
const AUDIT_SCRIPT = path.join(REPO_ROOT, "skills/gh-fix-ci/scripts/inspect_actions_failures.py");

test("gh actions failure audit groups deterministic regressions and billing blockers", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "gh-actions-audit-"));
  try {
    const binDir = path.join(tempDir, "bin");
    const ghPath = path.join(binDir, "gh");
    await mkdir(binDir, { recursive: true });
    await writeFile(
      ghPath,
      [
        "#!/usr/bin/env node",
        "const args = process.argv.slice(2);",
        "const write = (value) => process.stdout.write(typeof value === 'string' ? value : JSON.stringify(value));",
        "if (args[0] === 'auth' && args[1] === 'status') process.exit(0);",
        "if (args[0] === 'api') {",
        "  const endpoint = args[1];",
        "  if (endpoint.startsWith('repos/owner/app/actions/runs?')) {",
        "    write({ workflow_runs: [",
        "      { id: 101, run_number: 7, name: 'QA Nightly', event: 'schedule', head_branch: 'main', head_sha: 'aaa', conclusion: 'failure', status: 'completed', created_at: '2026-04-30T06:00:00Z', updated_at: '2026-04-30T06:01:00Z', html_url: 'https://github.test/owner/app/actions/runs/101' },",
        "      { id: 100, run_number: 6, name: 'QA Nightly', event: 'schedule', head_branch: 'main', head_sha: 'bbb', conclusion: 'failure', status: 'completed', created_at: '2026-04-29T06:00:00Z', updated_at: '2026-04-29T06:01:00Z', html_url: 'https://github.test/owner/app/actions/runs/100' }",
        "    ] });",
        "    process.exit(0);",
        "  }",
        "  if (endpoint.startsWith('repos/owner/deploy/actions/runs?')) {",
        "    write({ workflow_runs: [",
        "      { id: 201, run_number: 3, name: 'Deploy', event: 'push', head_branch: 'main', head_sha: 'ccc', conclusion: 'failure', status: 'completed', created_at: '2026-04-30T07:00:00Z', updated_at: '2026-04-30T07:01:00Z', html_url: 'https://github.test/owner/deploy/actions/runs/201' }",
        "    ] });",
        "    process.exit(0);",
        "  }",
        "}",
        "if (args[0] === 'run' && args[1] === 'view') {",
        "  const repo = args[args.indexOf('-R') + 1];",
        "  const runId = args[args.indexOf('-R') + 2];",
        "  const wantsLog = args.includes('--log-failed');",
        "  if (repo === 'owner/app' && wantsLog) {",
        "    write('qa-nightly\\tUNKNOWN STEP\\t# Subtest: PR smoke\\nqa-nightly\\tUNKNOWN STEP\\tnot ok 1 - PR smoke: task:start creates worktree\\nqa-nightly\\tUNKNOWN STEP\\tAssertionError: expected checkpoint\\n');",
        "    process.exit(0);",
        "  }",
        "  if (repo === 'owner/deploy' && wantsLog) {",
        "    process.stderr.write('log not found: 12345\\n');",
        "    process.exit(1);",
        "  }",
        "  if (repo === 'owner/deploy' && runId === '201') {",
        "    write('X main Deploy owner/deploy · 201\\n\\nANNOTATIONS\\nX The job was not started because recent account payments have failed or your spending limit needs to be increased. Please check the Billing & plans section.\\n\\nTo see what failed, try: gh run view 201 --log-failed\\n');",
        "    process.exit(0);",
        "  }",
        "}",
        "process.stderr.write(`unexpected gh args: ${args.join(' ')}\\n`);",
        "process.exit(2);",
        ""
      ].join("\n"),
      "utf8"
    );
    await chmod(ghPath, 0o755);

    const result = spawnSync(
      "python3",
      [
        AUDIT_SCRIPT,
        "--repo",
        tempDir,
        "--repo-slug",
        "owner/app,owner/deploy",
        "--since",
        "2026-04-16T00:00:00Z",
        "--max-lines",
        "2",
        "--json"
      ],
      {
        encoding: "utf8",
        env: { ...process.env, PATH: `${binDir}${path.delimiter}${process.env.PATH ?? ""}` }
      }
    );

    assert.equal(result.status, 1, result.stderr);
    /** @type {{runCount: number, classCounts: Record<string, number>, groups: Array<{repo: string, count: number, failureClass: string, failureKey?: string, sampleSnippet?: string}>}} */
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.runCount, 3);
    assert.equal(payload.classCounts.deterministic_regression, 2);
    assert.equal(payload.classCounts.account_billing_blocker, 1);
    const appGroup = payload.groups.find((group) => group.repo === "owner/app");
    const deployGroup = payload.groups.find((group) => group.repo === "owner/deploy");
    assert.equal(appGroup?.count, 2);
    assert.equal(deployGroup?.failureClass, "account_billing_blocker");
    assert.match(deployGroup?.sampleSnippet ?? "", /payments have failed/);
    assert.doesNotMatch(deployGroup?.failureKey ?? "", /to see what failed/i);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
