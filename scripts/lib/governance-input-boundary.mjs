// @ts-check

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { OPERATIONAL_DOCS, runCommand } from "./runtime.mjs";

export const VERSIONED_GOVERNANCE_INPUTS = Object.freeze([
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

export const SINGLE_WRITER_OPERATIONAL_DOCS = Object.freeze([...OPERATIONAL_DOCS]);

/**
 * @typedef {Object} CommittedGovernanceFile
 * @property {string} path
 * @property {number} size
 * @property {string} sha256
 */

/**
 * @typedef {Object} GovernanceSnapshot
 * @property {"committed"|"working_tree"} source
 * @property {string} headSha
 * @property {string | null} commitSha
 * @property {string} governanceDigest
 * @property {CommittedGovernanceFile[]} files
 */

/**
 * @param {readonly string[]} relativePaths
 * @param {string} label
 * @returns {void}
 */
function assertExplicitRelativePaths(relativePaths, label) {
  if (relativePaths.length === 0) {
    throw new Error(`${label} must not be empty.`);
  }

  const duplicates = relativePaths.filter((relativePath, index) => relativePaths.indexOf(relativePath) !== index);
  if (duplicates.length > 0) {
    throw new Error(`${label} must not contain duplicates: ${[...new Set(duplicates)].sort().join(", ")}`);
  }

  for (const relativePath of relativePaths) {
    if (
      !relativePath ||
      path.posix.isAbsolute(relativePath) ||
      relativePath.includes("\\") ||
      path.posix.normalize(relativePath) !== relativePath ||
      relativePath.startsWith("../")
    ) {
      throw new Error(`${label} must contain normalized repository-relative paths: ${relativePath}`);
    }
  }
}

/**
 * @param {readonly string[]} [versionedInputs]
 * @param {readonly string[]} [operationalDocs]
 * @returns {void}
 */
export function assertGovernanceInputBoundary(
  versionedInputs = VERSIONED_GOVERNANCE_INPUTS,
  operationalDocs = SINGLE_WRITER_OPERATIONAL_DOCS
) {
  assertExplicitRelativePaths(versionedInputs, "Versioned governance inputs");
  assertExplicitRelativePaths(operationalDocs, "Single-writer operational documents");

  const operationalSet = new Set(operationalDocs);
  const overlap = versionedInputs.filter((relativePath) => operationalSet.has(relativePath)).sort();
  if (overlap.length > 0) {
    throw new Error(`Versioned governance inputs and operational documents must not overlap: ${overlap.join(", ")}`);
  }
}

/**
 * @param {string} repoRoot
 * @returns {string}
 */
function resolveHeadSha(repoRoot) {
  const resolvedHead = runCommand(repoRoot, "git", ["rev-parse", "--verify", "HEAD^{commit}"], {
    allowFailure: true
  });
  const commitSha = resolvedHead.stdout.trim();
  if (resolvedHead.status !== 0 || !/^[0-9a-f]{40,64}$/.test(commitSha)) {
    throw new Error("Cannot resolve the current commit for governance verification.");
  }
  return commitSha;
}

/**
 * @param {Array<{path: string, content: Buffer|string}>} inputs
 * @returns {{governanceDigest: string, files: CommittedGovernanceFile[]}}
 */
function buildGovernanceDigest(inputs) {
  /** @type {CommittedGovernanceFile[]} */
  const files = [];
  for (const input of inputs) {
    const content = input.content;
    files.push({
      path: input.path,
      size: Buffer.byteLength(content),
      sha256: createHash("sha256").update(content).digest("hex")
    });
  }

  const governanceDigest = createHash("sha256");
  for (const file of files) {
    governanceDigest.update(`${file.path}\0${file.size}\0${file.sha256}\n`);
  }

  return {
    governanceDigest: governanceDigest.digest("hex"),
    files
  };
}

/**
 * @param {string} repoRoot
 * @param {string} commitSha
 * @param {boolean} failOnMissing
 * @returns {{governanceDigest: string, files: CommittedGovernanceFile[]} | null}
 */
function readGovernanceInputsFromCommit(repoRoot, commitSha, failOnMissing) {
  /** @type {Array<{path: string, content: string}>} */
  const inputs = [];
  for (const relativePath of VERSIONED_GOVERNANCE_INPUTS) {
    const committedFile = runCommand(repoRoot, "git", ["show", `${commitSha}:${relativePath}`], {
      allowFailure: true
    });
    if (committedFile.status !== 0) {
      if (failOnMissing) {
        throw new Error(`Committed governance input is missing: ${relativePath}`);
      }
      return null;
    }
    inputs.push({ path: relativePath, content: committedFile.stdout });
  }
  return buildGovernanceDigest(inputs);
}

/**
 * Read rule truth from the current task worktree. If its canonical files match
 * HEAD exactly, the snapshot is bound to that commit; otherwise it is an
 * explicit pre-commit working-tree snapshot.
 *
 * @param {string} repoRoot
 * @returns {GovernanceSnapshot}
 */
export function readCurrentGovernanceSnapshot(repoRoot) {
  assertGovernanceInputBoundary();
  const headSha = resolveHeadSha(repoRoot);

  /** @type {Array<{path: string, content: Buffer}>} */
  const inputs = [];
  for (const relativePath of VERSIONED_GOVERNANCE_INPUTS) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (!existsSync(absolutePath)) {
      throw new Error(`Current governance input is missing: ${relativePath}`);
    }
    inputs.push({ path: relativePath, content: readFileSync(absolutePath) });
  }

  const current = buildGovernanceDigest(inputs);
  const committed = readGovernanceInputsFromCommit(repoRoot, headSha, false);
  const matchesHead = committed?.governanceDigest === current.governanceDigest;
  return {
    source: matchesHead ? "committed" : "working_tree",
    headSha,
    commitSha: matchesHead ? headSha : null,
    governanceDigest: current.governanceDigest,
    files: current.files
  };
}

/**
 * Read rule truth only from the repository's current committed snapshot.
 *
 * @param {string} repoRoot
 * @returns {GovernanceSnapshot}
 */
export function readCommittedGovernanceSnapshot(repoRoot) {
  assertGovernanceInputBoundary();
  const commitSha = resolveHeadSha(repoRoot);
  const committed = readGovernanceInputsFromCommit(repoRoot, commitSha, true);
  if (!committed) {
    throw new Error("Committed governance snapshot is unavailable.");
  }
  return {
    source: "committed",
    headSha: commitSha,
    commitSha,
    governanceDigest: committed.governanceDigest,
    files: committed.files
  };
}

assertGovernanceInputBoundary();
