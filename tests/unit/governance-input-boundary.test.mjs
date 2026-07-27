// @ts-check

import assert from "node:assert/strict";
import { appendFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  SINGLE_WRITER_OPERATIONAL_DOCS,
  VERSIONED_GOVERNANCE_INPUTS,
  assertGovernanceInputBoundary,
  readCommittedGovernanceSnapshot,
  readCurrentGovernanceSnapshot
} from "../../scripts/lib/governance-input-boundary.mjs";
import { OPERATIONAL_DOCS, runCommand } from "../../scripts/lib/runtime.mjs";

const THIS_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = path.dirname(path.dirname(path.dirname(THIS_FILE)));

/**
 * @param {string} repoRoot
 * @returns {Promise<void>}
 */
async function createGovernanceFixture(repoRoot) {
  for (const relativePath of [...VERSIONED_GOVERNANCE_INPUTS, ...SINGLE_WRITER_OPERATIONAL_DOCS]) {
    const absolutePath = path.join(repoRoot, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, `fixture:${relativePath}\n`, "utf8");
  }

  runCommand(repoRoot, "git", ["init", "-b", "main"]);
  runCommand(repoRoot, "git", ["config", "user.email", "tester@example.com"]);
  runCommand(repoRoot, "git", ["config", "user.name", "Governance Boundary Tester"]);
  runCommand(repoRoot, "git", ["add", "."]);
  runCommand(repoRoot, "git", ["commit", "-m", "Initial governance snapshot"]);
}

test("governance inputs and operational documents are explicit and disjoint", () => {
  assert.deepEqual(SINGLE_WRITER_OPERATIONAL_DOCS, OPERATIONAL_DOCS);
  assert.deepEqual(SINGLE_WRITER_OPERATIONAL_DOCS, [
    "Docs/qa-implementation-log.md",
    "Docs/triz-usage-log.md",
    "CODEX_MEMORY.md"
  ]);
  assert.deepEqual(VERSIONED_GOVERNANCE_INPUTS, [
    "AGENTS.md",
    ".memory-bank/index.md",
    ".memory-bank/product-charter.md",
    ".memory-bank/project-context.md",
    ".memory-bank/architecture-map.md",
    ".memory-bank/code-rules.md",
    ".memory-bank/connection-access-policy.md",
    ".memory-bank/context-hygiene.md",
    ".memory-bank/qa-playbook.md",
    ".memory-bank/eval-specs/goal-seed-staged-handoff.md",
    ".memory-bank/finish-profile.json",
    ".memory-bank/starter-rule-adoptions.json",
    ".memory-bank/starter-rule-registry.json"
  ]);
  assert.ok(!VERSIONED_GOVERNANCE_INPUTS.includes("CODEX_MEMORY.md"));
  assert.deepEqual(
    VERSIONED_GOVERNANCE_INPUTS.filter((relativePath) => SINGLE_WRITER_OPERATIONAL_DOCS.includes(relativePath)),
    []
  );
  assert.throws(
    () => assertGovernanceInputBoundary(["AGENTS.md"], ["AGENTS.md"]),
    /must not overlap: AGENTS\.md/
  );
});

test("canonical-main operational read-back cannot change committed governance truth", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "governance-boundary-"));
  try {
    await createGovernanceFixture(repoRoot);
    const initial = readCommittedGovernanceSnapshot(repoRoot);
    assert.deepEqual(readCurrentGovernanceSnapshot(repoRoot), initial);

    for (const relativePath of SINGLE_WRITER_OPERATIONAL_DOCS) {
      await appendFile(path.join(repoRoot, relativePath), "operational read-back\n", "utf8");
    }
    const operationalWorkingTree = readCurrentGovernanceSnapshot(repoRoot);
    assert.equal(operationalWorkingTree.source, "committed");
    assert.equal(operationalWorkingTree.governanceDigest, initial.governanceDigest);
    assert.deepEqual(operationalWorkingTree.files, initial.files);

    runCommand(repoRoot, "git", ["add", ...SINGLE_WRITER_OPERATIONAL_DOCS]);
    runCommand(repoRoot, "git", ["commit", "-m", "Operational read-back"]);

    const afterOperationalReadBack = readCommittedGovernanceSnapshot(repoRoot);
    assert.notEqual(afterOperationalReadBack.commitSha, initial.commitSha);
    assert.equal(afterOperationalReadBack.governanceDigest, initial.governanceDigest);
    assert.deepEqual(afterOperationalReadBack.files, initial.files);

    await appendFile(path.join(repoRoot, "AGENTS.md"), "versioned rule change\n", "utf8");
    const preCommit = readCurrentGovernanceSnapshot(repoRoot);
    assert.equal(preCommit.source, "working_tree");
    assert.equal(preCommit.commitSha, null);
    assert.notEqual(preCommit.governanceDigest, initial.governanceDigest);

    runCommand(repoRoot, "git", ["add", "AGENTS.md"]);
    runCommand(repoRoot, "git", ["commit", "-m", "Versioned governance change"]);

    const afterGovernanceChange = readCurrentGovernanceSnapshot(repoRoot);
    assert.equal(afterGovernanceChange.source, "committed");
    assert.equal(afterGovernanceChange.commitSha, afterGovernanceChange.headSha);
    assert.equal(afterGovernanceChange.governanceDigest, preCommit.governanceDigest);
    assert.notEqual(afterGovernanceChange.governanceDigest, initial.governanceDigest);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("pre-commit QA accepts a new canonical file from the current task worktree", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "governance-boundary-new-input-"));
  try {
    await createGovernanceFixture(repoRoot);
    runCommand(repoRoot, "git", ["rm", "--cached", ".memory-bank/starter-rule-adoptions.json"]);
    runCommand(repoRoot, "git", ["commit", "-m", "Defer adoption map to task worktree"]);

    const current = readCurrentGovernanceSnapshot(repoRoot);
    assert.equal(current.source, "working_tree");
    assert.equal(current.commitSha, null);
    assert.ok(current.files.some((entry) => entry.path === ".memory-bank/starter-rule-adoptions.json"));
    assert.throws(
      () => readCommittedGovernanceSnapshot(repoRoot),
      /Committed governance input is missing: \.memory-bank\/starter-rule-adoptions\.json/
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("committed governance snapshot fails closed when a canonical input is missing", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "governance-boundary-missing-"));
  try {
    await createGovernanceFixture(repoRoot);
    runCommand(repoRoot, "git", ["rm", ".memory-bank/product-charter.md"]);
    runCommand(repoRoot, "git", ["commit", "-m", "Remove canonical input"]);

    assert.throws(
      () => readCurrentGovernanceSnapshot(repoRoot),
      /Current governance input is missing: \.memory-bank\/product-charter\.md/
    );
    assert.throws(
      () => readCommittedGovernanceSnapshot(repoRoot),
      /Committed governance input is missing: \.memory-bank\/product-charter\.md/
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("build manifest records only the current canonical governance snapshot", async () => {
  const build = runCommand(REPO_ROOT, "node", ["scripts/build-starter.mjs"]);
  assert.match(build.stdout, /build-starter: wrote runtime\/starter-manifest\.json/);

  const manifest = /** @type {{
   * governanceBoundary: {versionedInputs: string[], operationalDocuments: string[]},
   * governanceSnapshot: ReturnType<typeof readCurrentGovernanceSnapshot>
   * }} */ (
    JSON.parse(await readFile(path.join(REPO_ROOT, "runtime/starter-manifest.json"), "utf8"))
  );
  const expectedSnapshot = readCurrentGovernanceSnapshot(REPO_ROOT);
  assert.deepEqual(manifest.governanceBoundary, {
    versionedInputs: VERSIONED_GOVERNANCE_INPUTS,
    operationalDocuments: SINGLE_WRITER_OPERATIONAL_DOCS
  });
  assert.deepEqual(manifest.governanceSnapshot, expectedSnapshot);
  assert.equal(manifest.governanceSnapshot.headSha, runCommand(REPO_ROOT, "git", ["rev-parse", "HEAD"]).stdout.trim());
  assert.deepEqual(
    manifest.governanceSnapshot.files.map((entry) => entry.path),
    VERSIONED_GOVERNANCE_INPUTS
  );
  assert.deepEqual(
    manifest.governanceSnapshot.files.filter((entry) => SINGLE_WRITER_OPERATIONAL_DOCS.includes(entry.path)),
    []
  );
});
