// @ts-check

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildShareApplyPlan, renderRuleShareReport, scanRuleShare } from "../../scripts/rule-share.mjs";
import { runCommand } from "../../scripts/lib/runtime.mjs";

/**
 * @param {string} repoRoot
 * @returns {void}
 */
function initRepo(repoRoot) {
  runCommand(repoRoot, "git", ["init", "-b", "main"]);
  runCommand(repoRoot, "git", ["config", "user.email", "tester@example.com"]);
  runCommand(repoRoot, "git", ["config", "user.name", "Rule Share Tester"]);
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 * @param {string} content
 * @returns {Promise<void>}
 */
async function writeRepoFile(repoRoot, relativePath, content) {
  const filePath = path.join(repoRoot, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

/**
 * @param {string} repoRoot
 * @returns {Promise<void>}
 */
async function commitAll(repoRoot) {
  runCommand(repoRoot, "git", ["add", "."]);
  runCommand(repoRoot, "git", ["commit", "-m", "initial"]);
}

/**
 * @param {string} repoRoot
 * @param {string} [extraScripts]
 * @returns {Promise<void>}
 */
async function addStarterLikeFiles(repoRoot, extraScripts = "") {
  await writeRepoFile(repoRoot, "AGENTS.md", "# Rules\n");
  await writeRepoFile(repoRoot, ".memory-bank/product-charter.md", "# Product Charter\n");
  await writeRepoFile(repoRoot, "CODEX_MEMORY.md", "# Memory\n");
  await writeRepoFile(
    repoRoot,
    "package.json",
    `{"type":"module","scripts":{"task:start":"node scripts/worktree-start.mjs"${extraScripts}}}\n`
  );
}

test("rule-share scan respects allowlist and detects delivery modes", async () => {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "rule-share-"));
  try {
    const starterRoot = path.join(baseDir, "new-project-starter");
    const submoduleProject = path.join(baseDir, "Agent_Const");
    const copiedProject = path.join(baseDir, "WannaDinner");
    const ignoredProject = path.join(baseDir, "OldProject");
    for (const repo of [starterRoot, submoduleProject, copiedProject, ignoredProject]) {
      await mkdir(repo, { recursive: true });
      initRepo(repo);
    }
    await writeRepoFile(starterRoot, "README.md", "# Starter\n");
    await commitAll(starterRoot);

    await addStarterLikeFiles(submoduleProject);
    await writeRepoFile(submoduleProject, ".gitmodules", "[submodule \"vendor/new-project-starter\"]\n\tpath = vendor/new-project-starter\n");
    await mkdir(path.join(submoduleProject, "vendor", "new-project-starter", ".git"), { recursive: true });
    await writeRepoFile(submoduleProject, "vendor/new-project-starter/README.md", "# Vendored Starter\n");
    await commitAll(submoduleProject);

    await addStarterLikeFiles(copiedProject);
    await commitAll(copiedProject);

    await addStarterLikeFiles(ignoredProject);
    await commitAll(ignoredProject);

    const snapshot = await scanRuleShare({
      repoRoot: starterRoot,
      roots: [baseDir],
      config: {
        allowlist: [submoduleProject, copiedProject, ignoredProject],
        ignorelist: [ignoredProject]
      }
    });

    assert.equal(snapshot.projects.length, 2);
    const byLabel = new Map(snapshot.projects.map((project) => [project.label, project]));
    assert.equal(byLabel.get("Agent_Const")?.status, "ready");
    assert.equal(byLabel.get("Agent_Const")?.recommendedAction, "update_starter_reference");
    assert.equal(byLabel.get("WannaDinner")?.status, "ready");
    assert.equal(byLabel.get("WannaDinner")?.recommendedAction, "prepare_rule_import");
    assert.equal(byLabel.has("OldProject"), false);
  } finally {
    await rm(baseDir, { recursive: true, force: true });
  }
});

test("rule-share blocks dirty projects", async () => {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "rule-share-dirty-"));
  try {
    const starterRoot = path.join(baseDir, "new-project-starter");
    const projectRoot = path.join(baseDir, "Agent_Const");
    for (const repo of [starterRoot, projectRoot]) {
      await mkdir(repo, { recursive: true });
      initRepo(repo);
    }
    await writeRepoFile(starterRoot, "README.md", "# Starter\n");
    await commitAll(starterRoot);
    await addStarterLikeFiles(projectRoot);
    await commitAll(projectRoot);
    await writeRepoFile(projectRoot, "local-change.txt", "dirty\n");

    const snapshot = await scanRuleShare({
      repoRoot: starterRoot,
      roots: [baseDir],
      config: { allowlist: [projectRoot] }
    });

    assert.equal(snapshot.projects[0].status, "blocked");
    assert.match(snapshot.projects[0].reasons.join(" "), /незакоммиченные/);
  } finally {
    await rm(baseDir, { recursive: true, force: true });
  }
});

test("rule-share report renders owner decision sections", () => {
  const text = renderRuleShareReport({
    schemaVersion: 1,
    generatedAt: "2026-04-29T10:00:00.000Z",
    repoRoot: "/tmp/starter",
    starterHead: "abcdef",
    starterDirty: false,
    allowlistConfigured: true,
    diagnostics: [],
    projects: [
      {
        id: "rsh-agent-const",
        label: "Agent_Const",
        repoRoot: "/tmp/agent",
        status: "ready",
        recommendedAction: "update_starter_reference",
        reasons: ["ok"],
        dirty: false,
        hasTaskFlow: true,
        hasStarterSubmodule: true,
        starterPath: "vendor/new-project-starter",
        currentStarterHead: "123456",
        targetFiles: ["vendor/new-project-starter"]
      }
    ]
  });

  assert.match(text, /Предложения к проектам/);
  assert.match(text, /Готово к обновлению/);
  assert.match(text, /Требует ручной проверки/);
  assert.match(text, /Заблокировано/);
  assert.match(text, /JTBD/);
  assert.match(text, /rsh-agent-const/);
});

test("rule-share apply-plan builds safe per-project task seeds", () => {
  const snapshot = /** @type {Parameters<typeof buildShareApplyPlan>[0]} */ ({
    schemaVersion: 1,
    generatedAt: "2026-04-29T10:00:00.000Z",
    repoRoot: "/tmp/starter",
    starterHead: "abcdef",
    starterDirty: false,
    allowlistConfigured: true,
    diagnostics: [],
    projects: [
      {
        id: "rsh-agent-const",
        label: "Agent_Const",
        repoRoot: "/tmp/agent",
        status: "ready",
        recommendedAction: "update_starter_reference",
        reasons: ["ok"],
        dirty: false,
        hasTaskFlow: true,
        hasStarterSubmodule: true,
        starterPath: "vendor/new-project-starter",
        currentStarterHead: "123456",
        targetFiles: ["vendor/new-project-starter"]
      }
    ]
  });

  const plan = buildShareApplyPlan(snapshot, {
    approvedProjects: ["rsh-agent-const"],
    notes: { "rsh-agent-const": "Share after starter QA." }
  });

  assert.equal(plan.status, "ready");
  assert.equal(plan.tasks.length, 1);
  assert.equal(plan.tasks[0].cwd, "/tmp/agent");
  assert.equal(plan.tasks[0].command[0], "npm");
  assert.match(plan.tasks[0].seedMessage, /не затирать product-specific/);
  assert.match(plan.tasks[0].seedMessage, /Share after starter QA/);
});

test("rule-share apply-plan rejects non-ready approvals", () => {
  const snapshot = /** @type {Parameters<typeof buildShareApplyPlan>[0]} */ ({
    schemaVersion: 1,
    generatedAt: "2026-04-29T10:00:00.000Z",
    repoRoot: "/tmp/starter",
    starterHead: "abcdef",
    starterDirty: false,
    allowlistConfigured: true,
    diagnostics: [],
    projects: [
      {
        id: "rsh-blocked",
        label: "Blocked",
        repoRoot: "/tmp/blocked",
        status: "blocked",
        recommendedAction: "manual_review",
        reasons: ["dirty"],
        dirty: true,
        hasTaskFlow: true,
        hasStarterSubmodule: false,
        starterPath: "vendor/new-project-starter",
        currentStarterHead: null,
        targetFiles: []
      }
    ]
  });

  assert.throws(() => buildShareApplyPlan(snapshot, { approvedProjects: ["rsh-blocked"] }), /not ready/);
});

test("rule-share apply-plan rejects unknown project approvals", () => {
  const snapshot = /** @type {Parameters<typeof buildShareApplyPlan>[0]} */ ({
    schemaVersion: 1,
    generatedAt: "2026-04-29T10:00:00.000Z",
    repoRoot: "/tmp/starter",
    starterHead: "abcdef",
    starterDirty: false,
    allowlistConfigured: true,
    diagnostics: [],
    projects: []
  });

  assert.throws(() => buildShareApplyPlan(snapshot, { approvedProjects: ["rsh-missing"] }), /unknown projects/);
});
