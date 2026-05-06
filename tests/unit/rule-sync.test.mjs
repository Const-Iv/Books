// @ts-check

import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildApplyPlan,
  buildDecisionProposals,
  classifyRuleCandidate,
  defaultScanWindow,
  latestReportScanSelection,
  renderRuleSyncReport,
  scanRuleSync
} from "../../scripts/rule-sync.mjs";
import { runCommand } from "../../scripts/lib/runtime.mjs";

const TEST_REPO_ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));

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

test("rule-sync report latest falls back from short zero probe to meaningful scan", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "rule-sync-report-latest-"));
  try {
    const scansRoot = path.join(repoRoot, "runtime", "rule-sync", "scans");
    await mkdir(scansRoot, { recursive: true });
    const meaningfulPath = path.join(scansRoot, "rule-sync-2026-04-30-233208826Z.json");
    const zeroProbePath = path.join(scansRoot, "rule-sync-2026-04-30-233225164Z.json");
    await writeFile(
      meaningfulPath,
      `${JSON.stringify({
        schemaVersion: 1,
        generatedAt: "2026-04-30T23:32:08.826Z",
        since: "2026-04-29T21:00:00.000Z",
        until: "2026-04-30T23:32:07.686Z",
        repoRoot,
        projects: [],
        candidates: [
          {
            id: "rs-meaningful",
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
        ],
        diagnostics: []
      })}\n`,
      "utf8"
    );
    await writeFile(
      zeroProbePath,
      `${JSON.stringify({
        schemaVersion: 1,
        generatedAt: "2026-04-30T23:32:25.164Z",
        since: "2026-04-30T23:32:07.686Z",
        until: "2026-04-30T23:32:24.755Z",
        repoRoot,
        projects: [],
        candidates: [],
        diagnostics: []
      })}\n`,
      "utf8"
    );

    const selection = await latestReportScanSelection(repoRoot);
    assert.equal(selection?.source, "fallback_meaningful_probe");
    assert.equal(selection?.scanPath, meaningfulPath);
    assert.equal(selection?.latestPath, zeroProbePath);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("rule-sync report latest keeps real zero-result scan", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "rule-sync-report-zero-"));
  try {
    const scansRoot = path.join(repoRoot, "runtime", "rule-sync", "scans");
    await mkdir(scansRoot, { recursive: true });
    const oldPath = path.join(scansRoot, "rule-sync-2026-04-30-023000000Z.json");
    const latestPath = path.join(scansRoot, "rule-sync-2026-05-01-023000000Z.json");
    await writeFile(
      oldPath,
      `${JSON.stringify({
        schemaVersion: 1,
        generatedAt: "2026-04-30T02:30:00.000Z",
        since: "2026-04-29T02:30:00.000Z",
        until: "2026-04-30T02:30:00.000Z",
        repoRoot,
        projects: [],
        candidates: [
          {
            id: "rs-old",
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
        ],
        diagnostics: []
      })}\n`,
      "utf8"
    );
    await writeFile(
      latestPath,
      `${JSON.stringify({
        schemaVersion: 1,
        generatedAt: "2026-05-01T02:30:00.000Z",
        since: "2026-04-30T02:30:00.000Z",
        until: "2026-05-01T02:30:00.000Z",
        repoRoot,
        projects: [],
        candidates: [],
        diagnostics: []
      })}\n`,
      "utf8"
    );

    const selection = await latestReportScanSelection(repoRoot);
    assert.equal(selection?.source, "latest");
    assert.equal(selection?.scanPath, latestPath);
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
      },
      {
        id: "rs-test-2",
        category: "import_candidate",
        sourceProject: "Agent_Const",
        sourceRepo: "/tmp/agent",
        sourceType: "commit",
        taskId: null,
        branch: null,
        commitSha: "123456",
        title: "Product charter report wording",
        paths: ["AGENTS.md"],
        snippets: ["Every owner-facing decision starts with project charter, JTBD, Job Stories, User Stories and acceptance criteria."],
        suggestedTargetFiles: ["AGENTS.md"],
        summary: "Изменены governance paths: AGENTS.md.",
        evidence: "commit 123456",
        confidence: "medium",
        classifierReasons: ["reusable:governance", "reusable:product-charter"]
      }
    ]
  });

  assert.match(text, /Кандидаты на импорт/);
  assert.match(text, /Требует ручной проверки/);
  assert.match(text, /Пропущено как product-specific/);
  assert.match(text, /Предложения к решению/);
  assert.match(text, /Разбор по проектам/);
  assert.match(text, /### Agent_Const/);
  assert.match(text, /\*\*Что делать:\*\* Перенести как правило для отчётов владельцу/);
  assert.match(text, /\*\*Что нашли:\*\* Найдено 2 похожих записей/);
  assert.match(text, /\*\*Точный текст для starter:\*\* Любое продуктовое или рабочее решение должно начинаться со связи с project charter/);
  assert.match(text, /\*\*Дубли или похожие записи:\*\* Да, это одна тема из нескольких источников: rs-test, rs-test-2/);
  assert.match(text, /\*\*Источники для проверки:\*\*/);
  assert.match(text, /## Кандидаты на импорт[\s\S]*\*\*Точный текст для starter:\*\* Любое продуктовое или рабочее решение/);
  assert.match(text, /\*\*Пункты в группе:\*\* rs-test, rs-test-2/);
  assert.match(text, /\*\*Что ожидается от владельца:\*\* Ответить: перенести, пропустить или переписать/);
  assert.doesNotMatch(text, /Миссия:/);
  assert.doesNotMatch(text, /Видение:/);
  assert.match(text, /Связь с charter проекта:/);
  assert.match(text, /Job Stories:/);
  assert.match(text, /User Stories:/);
  assert.match(text, /Критерии приемки:/);
  assert.match(text, /Диагностика/);
  assert.match(text, /rs-test/);
});

test("rule-sync report saves readable markdown artifact", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "rule-sync-readable-report-"));
  try {
    initRepo(repoRoot);
    await commitFile(repoRoot, "README.md", "# Starter\n", "initial starter");
    const scansRoot = path.join(repoRoot, "runtime", "rule-sync", "scans");
    await mkdir(scansRoot, { recursive: true });
    const scanPath = path.join(scansRoot, "rule-sync-2026-05-04-233227430Z.json");
    await writeFile(
      scanPath,
      `${JSON.stringify({
        schemaVersion: 1,
        generatedAt: "2026-05-04T23:32:27.430Z",
        since: "2026-05-03T23:32:39.741Z",
        until: "2026-05-04T23:32:26.000Z",
        repoRoot,
        projects: [],
        diagnostics: [],
        candidates: [
          {
            id: "rs-review",
            category: "needs_review",
            sourceProject: "Agent_Const",
            sourceRepo: "/tmp/agent",
            sourceType: "commit",
            taskId: null,
            branch: null,
            commitSha: "abcdef",
            title: "Telegram governance mixed with reusable report rule",
            paths: ["AGENTS.md"],
            snippets: ["Owner-facing reports must show source traceability while Telegram details stay local."],
            suggestedTargetFiles: ["AGENTS.md / .memory-bank/*"],
            summary: "Изменены governance paths: AGENTS.md.",
            evidence: "commit abcdef",
            confidence: "low",
            classifierReasons: ["reusable:governance", "product:telegram"]
          }
        ]
      })}\n`,
      "utf8"
    );

    const output = runCommand(repoRoot, "node", [path.join(TEST_REPO_ROOT, "scripts/rule-sync.mjs"), "report", "--scan", scanPath]).stdout;
    const reportPath = output.match(/Report saved: (.+)$/m)?.[1] ?? "";
    const report = await readFile(reportPath, "utf8");
    assert.ok(reportPath.includes(path.join("runtime", "rule-sync", "reports")));
    assert.match(report, /## Разбор по проектам/);
    assert.match(report, /### Agent_Const/);
    assert.match(report, /\*\*Что делать:\*\* Переписать без названий конкретных каналов/);
    assert.match(report, /\*\*Точный текст для starter:\*\* Если отчёт или дайджест собирает данные из разных источников/);
    assert.match(report, /\*\*Как переписать без лишнего:\*\* Не переносить `Telegram`, `Gmail`, `inbox_agent`/);
    assert.match(report, /\*\*Что нашли:\*\* В проекте изменили рабочие правила/);
    assert.match(report, /\*\*Источники для проверки:\*\*/);
    assert.match(report, /## Требует ручной проверки[\s\S]*\*\*Точный текст для starter:\*\* Если отчёт или дайджест собирает данные из разных источников/);
    assert.match(report, /\*\*Что Codex проверяет сам:\*\* Codex должен read-only проверить источник/);
    assert.match(report, /\*\*Моё предложение:\*\* принять предложенный общий текст/);
    assert.match(report, /\*\*Что ожидается от владельца:\*\* После Codex self-check выбрать одно: принять предложенный текст/);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
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
  assert.match(proposals[0].jobStories.join("\n"), /служебные id/);
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
