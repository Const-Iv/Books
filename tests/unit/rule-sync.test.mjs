// @ts-check

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildApplyPlan,
  buildDecisionProposals,
  classifyRuleCandidate,
  defaultScanWindow,
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

test("rule-sync default window resumes from latest scan until", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "rule-sync-window-"));
  try {
    const scansRoot = path.join(repoRoot, "runtime", "rule-sync", "scans");
    await mkdir(scansRoot, { recursive: true });
    await writeFile(
      path.join(scansRoot, "rule-sync-2026-04-27-020000000Z.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        generatedAt: "2026-04-27T02:00:00.000Z",
        since: "2026-04-26T00:00:00.000Z",
        until: "2026-04-27T02:00:00.000Z",
        repoRoot,
        projects: [],
        candidates: [],
        diagnostics: []
      })}\n`,
      "utf8"
    );

    const window = await defaultScanWindow(repoRoot, new Date("2026-04-29T02:30:00.000Z"));
    assert.equal(window.source, "latest_scan");
    assert.equal(window.since.toISOString(), "2026-04-27T02:00:00.000Z");
    assert.equal(window.until.toISOString(), "2026-04-29T02:30:00.000Z");
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
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
        category: "import_candidate",
        sourceProject: "Agent_Const",
        sourceRepo: "/tmp/agent",
        sourceType: "task",
        taskId: "task-1",
        branch: "codex/task-1",
        commitSha: "abcdef",
        title: "JTBD planning rule",
        paths: ["AGENTS.md", "plans/_template.md"],
        snippets: ["Plans must include Job Story and User Stories before technical decomposition."],
        suggestedTargetFiles: ["AGENTS.md", "plans/_template.md"],
        summary: "Изменены governance paths: AGENTS.md, plans/_template.md.",
        evidence: "task task-1; commit abcdef",
        confidence: "high",
        classifierReasons: ["reusable:governance", "reusable:jtbd", "reusable:plan template"]
      }
    ]
  });

  assert.match(text, /Кандидаты на импорт/);
  assert.match(text, /Требует ручной проверки/);
  assert.match(text, /Пропущено как product-specific/);
  assert.match(text, /Предложения к решению/);
  assert.match(text, /Миссия:/);
  assert.match(text, /Job Story:/);
  assert.match(text, /User Stories:/);
  assert.match(text, /Критерии приемки:/);
  assert.match(text, /Диагностика/);
  assert.match(text, /rs-test/);
});

test("rule-sync decision proposals group product planning candidates", () => {
  const proposals = buildDecisionProposals({
    schemaVersion: 1,
    generatedAt: "2026-04-29T08:00:00.000Z",
    since: "2026-04-28T00:00:00.000Z",
    until: "2026-04-29T00:00:00.000Z",
    repoRoot: "/tmp/starter",
    projects: [],
    diagnostics: [],
    candidates: [
      {
        id: "rs-plan",
        category: "import_candidate",
        sourceProject: "Agent_Const",
        sourceRepo: "/tmp/agent",
        sourceType: "task",
        taskId: "task-1",
        branch: "codex/task-1",
        commitSha: "abcdef",
        title: "JTBD planning",
        paths: ["plans/_template.md"],
        snippets: ["Plans must include Job Story and User Stories before technical decomposition."],
        suggestedTargetFiles: ["plans/_template.md"],
        summary: "Изменены governance paths: plans/_template.md.",
        evidence: "task task-1; commit abcdef",
        confidence: "high",
        classifierReasons: ["reusable:jtbd", "reusable:plan template"]
      }
    ]
  });

  assert.equal(proposals.length, 1);
  assert.equal(proposals[0].recommendation, "import");
  assert.equal(proposals[0].candidates[0].id, "rs-plan");
  assert.match(proposals[0].jobStory, /candidate ids/);
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
