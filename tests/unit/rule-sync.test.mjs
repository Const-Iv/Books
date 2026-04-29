// @ts-check

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildApplyPlan,
  classifyRuleCandidate,
  renderRuleSyncReport,
  scanRuleSync
} from "../../scripts/rule-sync.mjs";
import { runCommand } from "../../scripts/lib/runtime.mjs";

/**
 * @param {string} repoRoot
 * @returns {void}
 */
function initRepo(repoRoot) {
  runCommand(repoRoot, "git", ["init", "-b", "main"]);
  runCommand(repoRoot, "git", ["config", "user.email", "tester@example.com"]);
  runCommand(repoRoot, "git", ["config", "user.name", "Rule Sync Tester"]);
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 * @param {string} content
 * @param {string} message
 * @returns {Promise<string>}
 */
async function commitFile(repoRoot, relativePath, content, message) {
  const filePath = path.join(repoRoot, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
  runCommand(repoRoot, "git", ["add", relativePath]);
  runCommand(repoRoot, "git", ["commit", "-m", message]);
  return runCommand(repoRoot, "git", ["rev-parse", "HEAD"]).stdout.trim();
}

test("rule-sync scan discovers reusable governance commits", async () => {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "rule-sync-"));
  try {
    const starterRoot = path.join(baseDir, "new-project-starter");
    const sourceRoot = path.join(baseDir, "Agent_Const");
    await mkdir(starterRoot, { recursive: true });
    await mkdir(sourceRoot, { recursive: true });
    initRepo(starterRoot);
    initRepo(sourceRoot);
    await commitFile(starterRoot, "README.md", "# Starter\n", "initial starter");
    await commitFile(
      sourceRoot,
      "AGENTS.md",
      "- QA gate must preserve deterministic task:start worktree governance.\n",
      "Governance QA baseline"
    );

    const snapshot = await scanRuleSync({
      repoRoot: starterRoot,
      roots: [sourceRoot],
      since: new Date(Date.now() - 60 * 60 * 1000),
      until: new Date(Date.now() + 60 * 60 * 1000)
    });

    assert.equal(snapshot.projects.length, 1);
    assert.equal(snapshot.candidates.length, 1);
    assert.equal(snapshot.candidates[0].category, "import_candidate");
    assert.equal(snapshot.candidates[0].sourceProject, "Agent_Const");
    assert.equal(snapshot.candidates[0].sourceType, "commit");
    assert.ok(snapshot.candidates[0].snippets.some((snippet) => snippet.includes("deterministic")));
  } finally {
    await rm(baseDir, { recursive: true, force: true });
  }
});

test("rule-sync classifier separates product-specific rules", () => {
  const reusable = classifyRuleCandidate({
    title: "Product charter QA governance",
    paths: [".memory-bank/code-rules.md"],
    snippets: ["Product charter is required before QA and worktree governance changes."]
  });
  assert.equal(reusable.category, "import_candidate");

  const productSpecific = classifyRuleCandidate({
    title: "Telegram calendar delivery",
    paths: ["AGENTS.md"],
    snippets: ["Telegram calendar CRM delivery topic must stay configured for Agent_Const."]
  });
  assert.equal(productSpecific.category, "product_specific");
});

test("rule-sync report renders required sections", () => {
  const text = renderRuleSyncReport({
    schemaVersion: 1,
    generatedAt: "2026-04-29T08:00:00.000Z",
    since: "2026-04-28T00:00:00.000Z",
    until: "2026-04-29T00:00:00.000Z",
    repoRoot: "/tmp/starter",
    projects: [],
    diagnostics: ["Agent_Const: ok"],
    candidates: [
      {
        id: "rs-test",
        category: "needs_review",
        sourceProject: "Agent_Const",
        sourceRepo: "/tmp/agent",
        sourceType: "task",
        taskId: "task-1",
        branch: "codex/task-1",
        commitSha: "abcdef",
        title: "Mixed governance rule",
        paths: ["AGENTS.md"],
        snippets: ["Rule text"],
        suggestedTargetFiles: ["AGENTS.md"],
        summary: "Изменены governance paths: AGENTS.md.",
        evidence: "task task-1; commit abcdef",
        confidence: "high",
        classifierReasons: ["reusable:governance"]
      }
    ]
  });

  assert.match(text, /Кандидаты на импорт/);
  assert.match(text, /Требует ручной проверки/);
  assert.match(text, /Пропущено как product-specific/);
  assert.match(text, /Диагностика/);
  assert.match(text, /rs-test/);
});

test("rule-sync apply-plan builds safe task-start seed", () => {
  const snapshot = /** @type {Parameters<typeof buildApplyPlan>[0]} */ ({
    schemaVersion: 1,
    generatedAt: "2026-04-29T08:00:00.000Z",
    since: "2026-04-28T00:00:00.000Z",
    until: "2026-04-29T00:00:00.000Z",
    repoRoot: "/tmp/starter",
    projects: [],
    diagnostics: [],
    candidates: [
      {
        id: "rs-approved",
        category: "import_candidate",
        sourceProject: "Agent_Const",
        sourceRepo: "/tmp/agent",
        sourceType: "commit",
        taskId: null,
        branch: null,
        commitSha: "abcdef",
        title: "Starter governance",
        paths: ["AGENTS.md"],
        snippets: ["Rule text"],
        suggestedTargetFiles: ["AGENTS.md"],
        summary: "Изменены governance paths: AGENTS.md.",
        evidence: "commit abcdef",
        confidence: "low",
        classifierReasons: ["reusable:starter"]
      }
    ]
  });
  const plan = buildApplyPlan(snapshot, {
    approved: ["rs-approved"],
    corrections: { "rs-approved": "Use starter wording." }
  });

  assert.equal(plan.status, "ready");
  assert.equal(plan.selectedCandidates.length, 1);
  assert.equal(plan.command[0], "npm");
  assert.match(plan.seedMessage, /rs-approved/);
  assert.match(plan.seedMessage, /Use starter wording/);
  assert.match(plan.seedMessage, /deterministic QA/);
});
