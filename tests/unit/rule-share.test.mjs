// @ts-check

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildShareApplyPlan, renderRuleShareReport, scanRuleShare } from "../../scripts/rule-share.mjs";
import { runCommand } from "../../scripts/lib/runtime.mjs";

/** @type {{id: string, title: string, text: string, targetFiles: string[], requiredFragments: string[], source: {type: string}, sharePolicy: "required"}} */
const RULE_A = {
  id: "starter.test.rule-a",
  title: "Rule A",
  text: "Rule A text: keep mission at project level.",
  targetFiles: ["AGENTS.md"],
  requiredFragments: ["Rule A text: keep mission at project level."],
  source: { type: "test" },
  sharePolicy: "required"
};

/** @type {{id: string, title: string, text: string, targetFiles: string[], requiredFragments: string[], source: {type: string}, sharePolicy: "required"}} */
const RULE_B = {
  id: "starter.test.rule-b",
  title: "Rule B",
  text: "Rule B text: keep decisions unapproved during hypothesis validation.",
  targetFiles: ["AGENTS.md"],
  requiredFragments: ["Rule B text: keep decisions unapproved during hypothesis validation."],
  source: { type: "test" },
  sharePolicy: "required"
};

/** @type {{id: string, title: string, text: string, targetFiles: string[], requiredFragments: string[], source: {type: string}, sharePolicy: "manual_review"}} */
const MANUAL_RULE = {
  id: "starter.test.manual-rule",
  title: "Manual Rule",
  text: "Manual rule text: only import after owner review.",
  targetFiles: ["AGENTS.md"],
  requiredFragments: ["Manual rule text: only import after owner review."],
  source: { type: "test" },
  sharePolicy: "manual_review"
};

/**
 * @param {object[]} [rules]
 * @returns {string}
 */
function registryJson(rules = [RULE_A, RULE_B]) {
  return `${JSON.stringify({ schemaVersion: 1, updatedAt: "2026-05-05T00:00:00.000Z", rules }, null, 2)}\n`;
}

/**
 * @param {string} repoRoot
 * @param {object[]} [rules]
 * @returns {Promise<void>}
 */
async function writeStarterRegistry(repoRoot, rules = [RULE_A, RULE_B]) {
  await writeRepoFile(repoRoot, ".memory-bank/starter-rule-registry.json", registryJson(rules));
}

/**
 * @returns {{presentRules: never[], missingRules: never[], presentUnregisteredRules: never[], blockedRules: never[]}}
 */
function emptyRuleStates() {
  return { presentRules: [], missingRules: [], presentUnregisteredRules: [], blockedRules: [] };
}

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
    await writeStarterRegistry(starterRoot);
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
    assert.equal(snapshot.projects[0].blockedRules.length, 2);
    assert.throws(
      () => buildShareApplyPlan(snapshot, { approvedProjects: [snapshot.projects[0].id] }),
      /not ready/
    );
  } finally {
    await rm(baseDir, { recursive: true, force: true });
  }
});

test("rule-share scanner marks project 1 rule A present and rule B missing", async () => {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "rule-share-rule-a-"));
  try {
    const starterRoot = path.join(baseDir, "new-project-starter");
    const projectRoot = path.join(baseDir, "ProjectOne");
    for (const repo of [starterRoot, projectRoot]) {
      await mkdir(repo, { recursive: true });
      initRepo(repo);
    }
    await writeRepoFile(starterRoot, "README.md", "# Starter\n");
    await writeStarterRegistry(starterRoot);
    await commitAll(starterRoot);

    await addStarterLikeFiles(projectRoot);
    await writeRepoFile(projectRoot, "AGENTS.md", `# Rules\n\n${RULE_A.text}\n`);
    await commitAll(projectRoot);

    const snapshot = await scanRuleShare({
      repoRoot: starterRoot,
      roots: [baseDir],
      config: { allowlist: [projectRoot] }
    });

    const project = snapshot.projects[0];
    assert.equal(project.status, "ready");
    assert.deepEqual(project.presentUnregisteredRules.map((rule) => rule.id), [RULE_A.id]);
    assert.deepEqual(project.missingRules.map((rule) => rule.id), [RULE_B.id]);
  } finally {
    await rm(baseDir, { recursive: true, force: true });
  }
});

test("rule-share scanner marks project 2 rule B present and rule A missing", async () => {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "rule-share-rule-b-"));
  try {
    const starterRoot = path.join(baseDir, "new-project-starter");
    const projectRoot = path.join(baseDir, "ProjectTwo");
    for (const repo of [starterRoot, projectRoot]) {
      await mkdir(repo, { recursive: true });
      initRepo(repo);
    }
    await writeRepoFile(starterRoot, "README.md", "# Starter\n");
    await writeStarterRegistry(starterRoot);
    await commitAll(starterRoot);

    await addStarterLikeFiles(projectRoot);
    await writeRepoFile(projectRoot, "AGENTS.md", `# Rules\n\n${RULE_B.text}\n`);
    await commitAll(projectRoot);

    const snapshot = await scanRuleShare({
      repoRoot: starterRoot,
      roots: [baseDir],
      config: { allowlist: [projectRoot] }
    });

    const project = snapshot.projects[0];
    assert.equal(project.status, "ready");
    assert.deepEqual(project.presentUnregisteredRules.map((rule) => rule.id), [RULE_B.id]);
    assert.deepEqual(project.missingRules.map((rule) => rule.id), [RULE_A.id]);
  } finally {
    await rm(baseDir, { recursive: true, force: true });
  }
});

test("rule-share scanner treats exact text without downstream registry as presentUnregistered", async () => {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "rule-share-present-unregistered-"));
  try {
    const starterRoot = path.join(baseDir, "new-project-starter");
    const projectRoot = path.join(baseDir, "CopiedProject");
    for (const repo of [starterRoot, projectRoot]) {
      await mkdir(repo, { recursive: true });
      initRepo(repo);
    }
    await writeRepoFile(starterRoot, "README.md", "# Starter\n");
    await writeStarterRegistry(starterRoot, [RULE_A]);
    await commitAll(starterRoot);

    await addStarterLikeFiles(projectRoot);
    await writeRepoFile(projectRoot, "AGENTS.md", `# Rules\n\n${RULE_A.text}\n`);
    await commitAll(projectRoot);

    const snapshot = await scanRuleShare({
      repoRoot: starterRoot,
      roots: [baseDir],
      config: { allowlist: [projectRoot] }
    });

    const project = snapshot.projects[0];
    assert.equal(project.status, "up_to_date");
    assert.deepEqual(project.presentUnregisteredRules.map((rule) => rule.id), [RULE_A.id]);
    assert.deepEqual(project.missingRules, []);
  } finally {
    await rm(baseDir, { recursive: true, force: true });
  }
});

test("rule-share scanner keeps manual-review registry rules out of automatic imports", async () => {
  const baseDir = await mkdtemp(path.join(os.tmpdir(), "rule-share-manual-policy-"));
  try {
    const starterRoot = path.join(baseDir, "new-project-starter");
    const projectRoot = path.join(baseDir, "ManualProject");
    for (const repo of [starterRoot, projectRoot]) {
      await mkdir(repo, { recursive: true });
      initRepo(repo);
    }
    await writeRepoFile(starterRoot, "README.md", "# Starter\n");
    await writeStarterRegistry(starterRoot, [MANUAL_RULE]);
    await commitAll(starterRoot);

    await addStarterLikeFiles(projectRoot);
    await commitAll(projectRoot);

    const snapshot = await scanRuleShare({
      repoRoot: starterRoot,
      roots: [baseDir],
      config: { allowlist: [projectRoot] }
    });

    const project = snapshot.projects[0];
    assert.equal(project.status, "needs_review");
    assert.deepEqual(project.missingRules, []);
    assert.deepEqual(project.blockedRules.map((rule) => rule.id), [MANUAL_RULE.id]);
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
    registryPath: "/tmp/starter/.memory-bank/starter-rule-registry.json",
    registryRules: [],
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
        targetFiles: ["vendor/new-project-starter"],
        ...emptyRuleStates()
      }
    ]
  });

  assert.match(text, /Предложения к проектам/);
  assert.match(text, /Готово к обновлению/);
  assert.match(text, /Актуально/);
  assert.match(text, /Требует ручной проверки/);
  assert.match(text, /Заблокировано/);
  assert.match(text, /JTBD/);
  assert.match(text, /rsh-agent-const/);
});

test("rule-share report shows concrete missing rule text grouped by project", () => {
  const text = renderRuleShareReport({
    schemaVersion: 1,
    generatedAt: "2026-05-05T10:00:00.000Z",
    repoRoot: "/tmp/starter",
    starterHead: "abcdef",
    starterDirty: false,
    allowlistConfigured: true,
    registryPath: "/tmp/starter/.memory-bank/starter-rule-registry.json",
    registryRules: [RULE_A, RULE_B],
    diagnostics: [],
    projects: [
      {
        id: "rsh-project-one",
        label: "ProjectOne",
        repoRoot: "/tmp/project-one",
        status: "ready",
        recommendedAction: "prepare_rule_import",
        reasons: ["missing B"],
        dirty: false,
        hasTaskFlow: true,
        hasStarterSubmodule: false,
        starterPath: "vendor/new-project-starter",
        currentStarterHead: null,
        targetFiles: ["AGENTS.md"],
        presentRules: [],
        presentUnregisteredRules: [
          {
            ...RULE_A,
            match: "text",
            matchedFragments: RULE_A.requiredFragments,
            missingFragments: [],
            reason: "Already present."
          }
        ],
        missingRules: [
          {
            ...RULE_B,
            match: "missing",
            matchedFragments: [],
            missingFragments: RULE_B.requiredFragments,
            reason: "Missing."
          }
        ],
        blockedRules: [
          {
            ...MANUAL_RULE,
            match: "partial",
            matchedFragments: ["Manual"],
            missingFragments: ["rule"],
            reason: "Partial match."
          }
        ]
      }
    ]
  });

  assert.match(text, /ProjectOne/);
  assert.match(text, /Будет добавлено/);
  assert.match(text, new RegExp(RULE_B.text));
  assert.match(text, /Есть текстом, но не зарегистрировано/);
  assert.match(text, new RegExp(RULE_A.text));
  assert.match(text, /Codex сначала делает read-only self-check/);
  assert.match(text, /Что Codex проверяет сам: read-only сверяет target files/);
  assert.match(text, /Что ожидается от владельца: согласовать готовую рекомендацию Codex/);
});

test("rule-share apply-plan builds safe per-project task seeds", () => {
  const snapshot = /** @type {Parameters<typeof buildShareApplyPlan>[0]} */ ({
    schemaVersion: 1,
    generatedAt: "2026-04-29T10:00:00.000Z",
    repoRoot: "/tmp/starter",
    starterHead: "abcdef",
    starterDirty: false,
    allowlistConfigured: true,
    registryPath: "/tmp/starter/.memory-bank/starter-rule-registry.json",
    registryRules: [],
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
        targetFiles: ["vendor/new-project-starter"],
        ...emptyRuleStates()
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

test("rule-share copied-baseline task seed includes evidence and stop-before-publish checklist", () => {
  const snapshot = /** @type {Parameters<typeof buildShareApplyPlan>[0]} */ ({
    schemaVersion: 1,
    generatedAt: "2026-04-29T10:00:00.000Z",
    repoRoot: "/tmp/starter",
    starterHead: "abcdef",
    starterDirty: false,
    allowlistConfigured: true,
    registryPath: "/tmp/starter/.memory-bank/starter-rule-registry.json",
    registryRules: [],
    diagnostics: [],
    projects: [
      {
        id: "rsh-agent-const",
        label: "Agent_Const",
        repoRoot: "/tmp/agent",
        status: "ready",
        recommendedAction: "prepare_rule_import",
        reasons: ["copied baseline"],
        dirty: false,
        hasTaskFlow: true,
        hasStarterSubmodule: false,
        starterPath: "vendor/new-project-starter",
        currentStarterHead: null,
        targetFiles: [
          "AGENTS.md",
          ".memory-bank/index.md",
          "CODEX_MEMORY.md",
          ".cursorrules",
          "CLAUDE.md",
          "README.md"
        ],
        ...emptyRuleStates()
      }
    ]
  });

  const plan = buildShareApplyPlan(snapshot, {
    approvedProjects: ["rsh-agent-const"]
  });

  assert.equal(plan.status, "ready");
  assert.equal(plan.tasks.length, 1);
  assert.match(plan.tasks[0].seedMessage, /остан[оа]виться перед finish\/merge\/publish/);
  assert.match(plan.tasks[0].seedMessage, /AGENTS\.md, \.memory-bank\/\*, CODEX_MEMORY\.md, README\.md, \.cursorrules и CLAUDE\.md/);
  assert.match(plan.tasks[0].seedMessage, /Docs\/qa-implementation-log\.md, Docs\/triz-usage-log\.md/);
  assert.match(plan.tasks[0].seedMessage, /starter source, starter HEAD, approved project/);
  assert.match(plan.tasks[0].seedMessage, /TRIZ_APPLIED/);
});

test("rule-share apply-plan copied-baseline task seed imports only missing rules", () => {
  const missingRule = {
    ...RULE_B,
    match: "missing",
    matchedFragments: [],
    missingFragments: RULE_B.requiredFragments,
    reason: "Missing."
  };
  const presentUnregisteredRule = {
    ...RULE_A,
    match: "text",
    matchedFragments: RULE_A.requiredFragments,
    missingFragments: [],
    reason: "Already present."
  };
  const snapshot = /** @type {Parameters<typeof buildShareApplyPlan>[0]} */ ({
    schemaVersion: 1,
    generatedAt: "2026-05-05T10:00:00.000Z",
    repoRoot: "/tmp/starter",
    starterHead: "abcdef",
    starterDirty: false,
    allowlistConfigured: true,
    registryPath: "/tmp/starter/.memory-bank/starter-rule-registry.json",
    registryRules: [RULE_A, RULE_B],
    diagnostics: [],
    projects: [
      {
        id: "rsh-project-one",
        label: "ProjectOne",
        repoRoot: "/tmp/project-one",
        status: "ready",
        recommendedAction: "prepare_rule_import",
        reasons: ["missing B"],
        dirty: false,
        hasTaskFlow: true,
        hasStarterSubmodule: false,
        starterPath: "vendor/new-project-starter",
        currentStarterHead: null,
        targetFiles: ["AGENTS.md"],
        presentRules: [],
        missingRules: [missingRule],
        presentUnregisteredRules: [presentUnregisteredRule],
        blockedRules: []
      }
    ]
  });

  const plan = buildShareApplyPlan(snapshot, {
    approvedProjects: ["rsh-project-one"]
  });

  assert.equal(plan.status, "ready");
  assert.match(plan.tasks[0].seedMessage, /добавить только missing rules: starter\.test\.rule-b/);
  assert.match(plan.tasks[0].seedMessage, new RegExp(`Text: ${RULE_B.text}`));
  assert.doesNotMatch(plan.tasks[0].seedMessage, new RegExp(`Text: ${RULE_A.text}`));
});

test("rule-share apply-plan rejects non-ready approvals", () => {
  const snapshot = /** @type {Parameters<typeof buildShareApplyPlan>[0]} */ ({
    schemaVersion: 1,
    generatedAt: "2026-04-29T10:00:00.000Z",
    repoRoot: "/tmp/starter",
    starterHead: "abcdef",
    starterDirty: false,
    allowlistConfigured: true,
    registryPath: "/tmp/starter/.memory-bank/starter-rule-registry.json",
    registryRules: [],
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
        targetFiles: [],
        ...emptyRuleStates()
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
    registryPath: "/tmp/starter/.memory-bank/starter-rule-registry.json",
    registryRules: [],
    diagnostics: [],
    projects: []
  });

  assert.throws(() => buildShareApplyPlan(snapshot, { approvedProjects: ["rsh-missing"] }), /unknown projects/);
});
