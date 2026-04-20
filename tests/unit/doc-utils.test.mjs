// @ts-check

import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildChangeLedgerMarkdown,
  buildTaskHistoryMarkdown,
  captureOperationalDocs,
  extractBulletSection,
  mergeAppendOnlyMarkdown,
  mergeBullets,
  splitMarkdownSections,
  syncOperationalDocs
} from "../../scripts/lib/doc-utils.mjs";
import { readJson } from "../../scripts/lib/runtime.mjs";

test("doc utils capture and sync append-only operational docs", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "starter-docs-"));
  try {
    await writeFile(
      path.join(repoRoot, "CODEX_MEMORY.md"),
      [
        "# CODEX Project Memory",
        "",
        "## Learned Rules",
        "",
        "- Existing learned rule",
        "",
        "## Project Notes",
        "",
        "- Existing note",
        ""
      ].join("\n"),
      "utf8"
    );
    await mkdir(path.join(repoRoot, "Docs"), { recursive: true });
    await writeFile(path.join(repoRoot, "Docs/qa-implementation-log.md"), "# QA Log\n\n- Existing QA entry\n", "utf8");
    await writeFile(path.join(repoRoot, "Docs/triz-usage-log.md"), "# TRIZ Log\n\n- Existing TRIZ entry\n", "utf8");

    const artifactDir = path.join(repoRoot, "artifacts");
    const artifactPath = await captureOperationalDocs(repoRoot, "task-1", "codex/task-1", artifactDir);
    const artifact = await readJson(artifactPath);
    assert.ok(artifact);

    await writeFile(path.join(repoRoot, "Docs/qa-implementation-log.md"), "# QA Log\n\n- Main-only entry\n", "utf8");
    await writeFile(path.join(repoRoot, "Docs/triz-usage-log.md"), "# TRIZ Log\n\n- Main-only TRIZ entry\n", "utf8");
    await writeFile(
      path.join(repoRoot, "CODEX_MEMORY.md"),
      [
        "# CODEX Project Memory",
        "",
        "## Learned Rules",
        "",
        "- Existing learned rule",
        "",
        "## Project Notes",
        "",
        "- Existing note",
        ""
      ].join("\n"),
      "utf8"
    );

    const changed = await syncOperationalDocs(repoRoot, artifactDir);
    assert.deepEqual(changed.sort(), ["CODEX_MEMORY.md", "Docs/qa-implementation-log.md", "Docs/triz-usage-log.md"].sort());

    const qaLog = await readFile(path.join(repoRoot, "Docs/qa-implementation-log.md"), "utf8");
    assert.match(qaLog, /Existing QA entry/);

    const codexMemory = await readFile(path.join(repoRoot, "CODEX_MEMORY.md"), "utf8");
    assert.match(codexMemory, /Existing learned rule/);
    assert.deepEqual(extractBulletSection(codexMemory, "Learned Rules"), ["Existing learned rule"]);
    assert.deepEqual(mergeBullets(["A"], ["A", "B"]), ["A", "B"]);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("doc utils build markdown snapshots", () => {
  const history = buildTaskHistoryMarkdown([
    {
      at: "2026-01-01T00:00:00.000Z",
      type: "START",
      taskId: "task-1",
      branch: "codex/task-1",
      payload: { title: "Task 1" }
    }
  ]);
  assert.match(history, /Task History/);
  assert.match(history, /START/);

  const ledger = buildChangeLedgerMarkdown(
    [
      {
        taskId: "task-1",
        title: "Task 1",
        slug: "task-1",
        branch: "codex/task-1",
        sourceBranch: "main",
        repoRoot: "/tmp/repo",
        worktreePath: "/tmp/repo-worktree",
        createdAt: "2026-01-01T00:00:00.000Z",
        seedMessage: "Task",
        status: "started"
      }
    ],
    [
      {
        at: "2026-01-01T00:00:00.000Z",
        type: "START",
        taskId: "task-1",
        branch: "codex/task-1",
        payload: {}
      }
    ]
  );
  assert.match(ledger, /Change Ledger/);
  assert.match(ledger, /task-1/);
});

test("doc utils merge append-only markdown by section heading without duplicating full logs", () => {
  const current = [
    "# TRIZ Usage Log",
    "",
    "Журнал срабатываний.",
    "",
    "## 2026-04-18T10:00:00Z task-a",
    "",
    "- Branch: `codex/task-a`",
    "- Status: trigger recorded",
    "",
    "## 2026-04-18T11:00:00Z task-b",
    "",
    "- Branch: `codex/task-b`",
    "- Status: trigger recorded",
    ""
  ].join("\n");
  const incoming = [
    "# TRIZ Usage Log",
    "",
    "Журнал срабатываний.",
    "",
    "## 2026-04-18T10:00:00Z task-a",
    "",
    "- Branch: `codex/task-a`",
    "- Status: trigger recorded",
    "",
    "## 2026-04-18T12:00:00Z task-c",
    "",
    "- Branch: `codex/task-c`",
    "- Status: trigger recorded",
    ""
  ].join("\n");

  const merged = mergeAppendOnlyMarkdown(current, incoming);
  const split = splitMarkdownSections(merged);

  assert.equal(split.sections.length, 3);
  assert.equal(split.sections.filter((section) => section.heading === "## 2026-04-18T10:00:00Z task-a").length, 1);
  assert.match(merged, /task-c/);
  assert.equal(merged.match(/# TRIZ Usage Log/g)?.length, 1);
});
