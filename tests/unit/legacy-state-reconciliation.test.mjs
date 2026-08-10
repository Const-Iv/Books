// @ts-check

import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  proveLegacyStateReconciliation,
  revalidateLegacyStateReconciliation
} from "../../scripts/lib/legacy-state-reconciliation.mjs";
import { runCommand } from "../../scripts/lib/runtime.mjs";

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "starter-legacy-reconcile-"));
  runCommand(root, "git", ["init", "-b", "main"]);
  runCommand(root, "git", ["config", "user.email", "test@example.com"]);
  runCommand(root, "git", ["config", "user.name", "Test User"]);
  await writeFile(path.join(root, "result.txt"), "base\n", "utf8");
  runCommand(root, "git", ["add", "."]);
  runCommand(root, "git", ["commit", "-m", "base"]);
  const baseSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();
  await writeFile(path.join(root, "result.txt"), "task\n", "utf8");
  runCommand(root, "git", ["commit", "-am", "task"]);
  const taskCommitSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();
  const taskId = "legacy-task";
  const branch = "codex/legacy-task";
  const state = /** @type {import("../../scripts/lib/runtime.mjs").TaskState} */ ({
    taskId,
    title: taskId,
    slug: taskId,
    branch,
    sourceBranch: "main",
    repoRoot: root,
    worktreePath: root,
    createdAt: "2026-07-24T00:00:00.000Z",
    seedMessage: taskId,
    status: "finished",
    qaLastPassSha: taskCommitSha,
    previewPreparedSha: taskCommitSha,
    commitSha: taskCommitSha,
    publishStatus: "pushed",
    cleanupStatus: "kept"
  });
  const mainSha = taskCommitSha;
  const events = /** @type {import("../../scripts/lib/runtime.mjs").HistoryEvent[]} */ ([
    { at: "2026-07-24T00:01:00.000Z", type: "MERGE_MAIN", taskId, branch, payload: { mergedCommitSha: taskCommitSha } },
    { at: "2026-07-24T00:02:00.000Z", type: "PUSH_MAIN", taskId, branch, payload: { publishStatus: "pushed" } },
    {
      at: "2026-07-24T00:03:00.000Z",
      type: "MAIN_VERIFY",
      taskId,
      branch,
      payload: { phase: "pre_cleanup", status: "passed", mainSha }
    }
  ]);
  const manifest = {
    version: /** @type {1} */ (1),
    taskId,
    taskCommitSha,
    mainSha,
    recoveredBaseSha: baseSha,
    targetStatus: /** @type {"finished"} */ ("finished"),
    targetCleanupStatus: /** @type {"kept"|"failed"} */ ("kept")
  };
  return { root, baseSha, taskCommitSha, state, events, manifest };
}

/**
 * @param {Awaited<ReturnType<typeof createFixture>>} fixture
 * @param {string} taskCommitSha
 */
function setTaskTip(fixture, taskCommitSha) {
  fixture.taskCommitSha = taskCommitSha;
  fixture.state.commitSha = taskCommitSha;
  fixture.state.qaLastPassSha = taskCommitSha;
  fixture.state.previewPreparedSha = taskCommitSha;
  fixture.manifest.taskCommitSha = taskCommitSha;
  fixture.manifest.mainSha = taskCommitSha;
  fixture.events[0].payload.mergedCommitSha = taskCommitSha;
  fixture.events[2].payload.mainSha = taskCommitSha;
}

/** @param {Awaited<ReturnType<typeof createFixture>>} fixture */
function markMergedForStatusRepair(fixture) {
  fixture.state.baseSha = fixture.baseSha;
  fixture.state.status = "merged";
  fixture.state.cleanupStatus = null;
  fixture.manifest.recoveredBaseSha = fixture.baseSha;
  fixture.manifest.targetCleanupStatus = "failed";
}

/** @param {Awaited<ReturnType<typeof createFixture>>} fixture */
function sealReconciliation(fixture) {
  const proof = proveLegacyStateReconciliation(
    fixture.root,
    fixture.state,
    fixture.manifest,
    fixture.events,
    "main"
  );
  const verifiedAt = "2026-07-24T00:04:00.000Z";
  const manifestSeal = { sha256: "a".repeat(64), relativePath: "runtime/legacy.json" };
  const artifact = {
    version: /** @type {2} */ (2),
    status: proof.status,
    taskId: fixture.state.taskId,
    branch: fixture.state.branch,
    taskCommitSha: proof.taskCommitSha,
    mainSha: proof.mainSha,
    manifestSha256: manifestSeal.sha256,
    manifestRelativePath: manifestSeal.relativePath,
    recoveredBaseSha: proof.recoveredBaseSha,
    recoveredStatus: proof.recoveredStatus,
    recoveredCleanupStatus: proof.recoveredCleanupStatus,
    originalPublishStatus: /** @type {string} */ (fixture.state.publishStatus),
    publishVerifiedMainSha: proof.publishVerifiedMainSha,
    recoveredFields: proof.recoveredFields,
    verifiedAt
  };
  fixture.state.baseSha = proof.recoveredBaseSha;
  fixture.state.status = proof.recoveredStatus;
  fixture.state.cleanupStatus = proof.recoveredCleanupStatus;
  fixture.state.legacyReconciliationStatus = proof.status;
  fixture.state.legacyReconciliationManifestSha256 = manifestSeal.sha256;
  fixture.state.legacyReconciliationManifestRelativePath = manifestSeal.relativePath;
  fixture.state.legacyReconciliationAt = verifiedAt;
  fixture.state.legacyReconciliationMainSha = proof.mainSha;
  fixture.state.legacyReconciliationPublishVerifiedMainSha = proof.publishVerifiedMainSha;
  fixture.state.legacyReconciliationOriginalPublishStatus = artifact.originalPublishStatus;
  fixture.state.legacyReconciliationFields = proof.recoveredFields;
  const reconciliationEvent = {
    at: verifiedAt,
    type: "LEGACY_STATE_RECONCILE",
    taskId: fixture.state.taskId,
    branch: fixture.state.branch,
    payload: {
      status: proof.status,
      taskCommitSha: proof.taskCommitSha,
      mainSha: proof.mainSha,
      manifestSha256: manifestSeal.sha256,
      manifestRelativePath: manifestSeal.relativePath,
      recoveredBaseSha: proof.recoveredBaseSha,
      recoveredStatus: proof.recoveredStatus,
      recoveredCleanupStatus: proof.recoveredCleanupStatus,
      originalPublishStatus: artifact.originalPublishStatus,
      publishVerifiedMainSha: proof.publishVerifiedMainSha,
      recoveredFields: proof.recoveredFields
    }
  };
  fixture.events.push(reconciliationEvent);
  return { artifact, manifestSeal };
}

test("legacy reconciliation recovers a missing baseSha only from the sole task parent", async () => {
  const fixture = await createFixture();
  try {
    const proof = proveLegacyStateReconciliation(
      fixture.root,
      fixture.state,
      fixture.manifest,
      fixture.events,
      "main"
    );
    assert.equal(proof.status, "legacy_state_reconciled");
    assert.equal(proof.recoveredBaseSha, fixture.baseSha);
    assert.deepEqual(proof.recoveredFields, ["baseSha"]);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation rejects a baseSha that is not the sole task parent", async () => {
  const fixture = await createFixture();
  try {
    fixture.manifest.recoveredBaseSha = fixture.taskCommitSha;
    assert.throws(
      () => proveLegacyStateReconciliation(fixture.root, fixture.state, fixture.manifest, fixture.events, "main"),
      /must equal the sole parent/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation does not infer an original base for a missing-base multi-commit task", async () => {
  const fixture = await createFixture();
  try {
    await writeFile(path.join(fixture.root, "result.txt"), "task step two\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "task step two"]);
    const taskTipSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    setTaskTip(fixture, taskTipSha);
    fixture.manifest.recoveredBaseSha = fixture.baseSha;

    assert.throws(
      () => proveLegacyStateReconciliation(fixture.root, fixture.state, fixture.manifest, fixture.events, "main"),
      /must equal the sole parent/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation repairs merged state only with successful publish and main verification evidence", async () => {
  const fixture = await createFixture();
  try {
    fixture.state.baseSha = fixture.baseSha;
    fixture.state.status = "merged";
    fixture.state.cleanupStatus = null;
    fixture.state.mainVerificationStatus = "passed";
    fixture.state.mainVerificationSha = fixture.taskCommitSha;
    fixture.manifest.targetCleanupStatus = "failed";
    const proof = proveLegacyStateReconciliation(
      fixture.root,
      fixture.state,
      fixture.manifest,
      fixture.events,
      "main"
    );
    assert.equal(proof.recoveredStatus, "finished");
    assert.equal(proof.recoveredCleanupStatus, "failed");
    assert.deepEqual(proof.recoveredFields, ["status", "cleanupStatus"]);

    const missingVerification = fixture.events.filter((event) => event.type !== "MAIN_VERIFY");
    assert.throws(
      () => proveLegacyStateReconciliation(fixture.root, fixture.state, fixture.manifest, missingVerification, "main"),
      /requires one ordered MERGE_MAIN -> PUSH_MAIN -> passed MAIN_VERIFY tuple/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation rejects publish evidence assembled across attempts or out of order", async () => {
  const fixture = await createFixture();
  try {
    markMergedForStatusRepair(fixture);
    const [merge, push, verify] = fixture.events;
    assert.throws(
      () => proveLegacyStateReconciliation(fixture.root, fixture.state, fixture.manifest, [push, merge, verify], "main"),
      /ordered MERGE_MAIN -> PUSH_MAIN -> passed MAIN_VERIFY/
    );
    assert.throws(
      () =>
        proveLegacyStateReconciliation(
          fixture.root,
          fixture.state,
          fixture.manifest,
          [merge, push, { ...merge, at: "2026-07-24T00:02:30.000Z" }, verify],
          "main"
        ),
      /ordered MERGE_MAIN -> PUSH_MAIN -> passed MAIN_VERIFY/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation retry reproduces the immutable seal and rejects state, artifact, path, and history tampering", async () => {
  const fixture = await createFixture();
  try {
    markMergedForStatusRepair(fixture);
    const { artifact, manifestSeal } = sealReconciliation(fixture);
    assert.doesNotThrow(() =>
      revalidateLegacyStateReconciliation(
        fixture.root,
        fixture.state,
        fixture.manifest,
        fixture.events,
        artifact,
        manifestSeal,
        "main"
      )
    );

    assert.throws(
      () =>
        revalidateLegacyStateReconciliation(
          fixture.root,
          { ...fixture.state, baseSha: fixture.taskCommitSha },
          fixture.manifest,
          fixture.events,
          artifact,
          manifestSeal,
          "main"
        ),
      /state no longer matches/
    );
    assert.throws(
      () =>
        revalidateLegacyStateReconciliation(
          fixture.root,
          fixture.state,
          fixture.manifest,
          fixture.events,
          { ...artifact, recoveredBaseSha: fixture.taskCommitSha },
          manifestSeal,
          "main"
        ),
      /immutable proof/
    );
    assert.throws(
      () =>
        revalidateLegacyStateReconciliation(
          fixture.root,
          fixture.state,
          fixture.manifest,
          fixture.events,
          artifact,
          { ...manifestSeal, relativePath: "runtime/copied-legacy.json" },
          "main"
        ),
      /immutable proof/
    );
    assert.throws(
      () =>
        revalidateLegacyStateReconciliation(
          fixture.root,
          fixture.state,
          fixture.manifest,
          fixture.events.filter((event) => event.type !== "LEGACY_STATE_RECONCILE"),
          artifact,
          manifestSeal,
          "main"
        ),
      /one exact append-only reconciliation event/
    );

    await writeFile(path.join(fixture.root, "later.txt"), "later\n", "utf8");
    runCommand(fixture.root, "git", ["add", "later.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "later main"]);
    assert.doesNotThrow(() =>
      revalidateLegacyStateReconciliation(
        fixture.root,
        fixture.state,
        fixture.manifest,
        fixture.events,
        artifact,
        manifestSeal,
        "main"
      )
    );

    runCommand(fixture.root, "git", ["switch", "--orphan", "unrelated-main"]);
    await writeFile(path.join(fixture.root, "unrelated.txt"), "unrelated\n", "utf8");
    runCommand(fixture.root, "git", ["add", "unrelated.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "unrelated main"]);
    assert.throws(
      () =>
        revalidateLegacyStateReconciliation(
          fixture.root,
          fixture.state,
          fixture.manifest,
          fixture.events,
          artifact,
          manifestSeal,
          "unrelated-main"
        ),
      /sealed mainSha must remain an ancestor/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation repairs a merged multi-commit task from its recorded linear base", async () => {
  const fixture = await createFixture();
  try {
    await writeFile(path.join(fixture.root, "result.txt"), "task step two\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "task step two"]);
    const taskTipSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    setTaskTip(fixture, taskTipSha);
    markMergedForStatusRepair(fixture);

    const proof = proveLegacyStateReconciliation(
      fixture.root,
      fixture.state,
      fixture.manifest,
      fixture.events,
      "main"
    );

    assert.equal(proof.recoveredBaseSha, fixture.baseSha);
    assert.equal(fixture.state.baseSha, fixture.baseSha);
    assert.deepEqual(proof.recoveredFields, ["status", "cleanupStatus"]);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation rejects a manifest base that differs from recorded task base", async () => {
  const fixture = await createFixture();
  try {
    await writeFile(path.join(fixture.root, "result.txt"), "task step two\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "task step two"]);
    const taskTipSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    const immediateParentSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD^"]).stdout.trim();
    setTaskTip(fixture, taskTipSha);
    markMergedForStatusRepair(fixture);
    fixture.manifest.recoveredBaseSha = immediateParentSha;

    assert.throws(
      () => proveLegacyStateReconciliation(fixture.root, fixture.state, fixture.manifest, fixture.events, "main"),
      /must match the existing recorded baseSha/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation rejects a recorded base outside the task tip ancestry", async () => {
  const fixture = await createFixture();
  try {
    runCommand(fixture.root, "git", ["branch", "unrelated-base", fixture.baseSha]);
    runCommand(fixture.root, "git", ["switch", "unrelated-base"]);
    await writeFile(path.join(fixture.root, "unrelated.txt"), "unrelated\n", "utf8");
    runCommand(fixture.root, "git", ["add", "unrelated.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "unrelated base"]);
    const unrelatedBaseSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    runCommand(fixture.root, "git", ["switch", "main"]);
    fixture.state.baseSha = unrelatedBaseSha;
    fixture.manifest.recoveredBaseSha = unrelatedBaseSha;
    fixture.state.status = "merged";
    fixture.state.cleanupStatus = null;
    fixture.manifest.targetCleanupStatus = "failed";

    assert.throws(
      () => proveLegacyStateReconciliation(fixture.root, fixture.state, fixture.manifest, fixture.events, "main"),
      /must be a strict ancestor of taskCommitSha/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation rejects an empty recorded base-to-tip chain", async () => {
  const fixture = await createFixture();
  try {
    fixture.state.baseSha = fixture.taskCommitSha;
    fixture.manifest.recoveredBaseSha = fixture.taskCommitSha;
    fixture.state.status = "merged";
    fixture.state.cleanupStatus = null;
    fixture.manifest.targetCleanupStatus = "failed";

    assert.throws(
      () => proveLegacyStateReconciliation(fixture.root, fixture.state, fixture.manifest, fixture.events, "main"),
      /must be a strict ancestor of taskCommitSha/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation rejects a merge anywhere in the recorded base-to-tip chain", async () => {
  const fixture = await createFixture();
  try {
    runCommand(fixture.root, "git", ["switch", "-c", "task-side"]);
    await writeFile(path.join(fixture.root, "side.txt"), "side\n", "utf8");
    runCommand(fixture.root, "git", ["add", "side.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "task side"]);
    runCommand(fixture.root, "git", ["switch", "main"]);
    await writeFile(path.join(fixture.root, "main.txt"), "main\n", "utf8");
    runCommand(fixture.root, "git", ["add", "main.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "task main"]);
    runCommand(fixture.root, "git", ["merge", "--no-ff", "task-side", "-m", "task merge"]);
    await writeFile(path.join(fixture.root, "result.txt"), "task after merge\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "task after merge"]);
    const taskTipSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    setTaskTip(fixture, taskTipSha);
    markMergedForStatusRepair(fixture);

    assert.throws(
      () => proveLegacyStateReconciliation(fixture.root, fixture.state, fixture.manifest, fixture.events, "main"),
      /linear single-parent chain/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation preserves an earlier passed publish read-back after a later supersession mismatch", async () => {
  const fixture = await createFixture();
  try {
    fixture.state.baseSha = fixture.baseSha;
    fixture.state.status = "merged";
    fixture.state.cleanupStatus = null;
    fixture.state.mainVerificationStatus = "failed";
    await writeFile(path.join(fixture.root, "result.txt"), "later approved correction\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "later approved correction"]);
    const currentMainSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    fixture.state.mainVerificationSha = currentMainSha;
    fixture.manifest.mainSha = currentMainSha;
    fixture.manifest.targetCleanupStatus = "failed";
    fixture.events.push({
      at: "2026-07-24T00:04:00.000Z",
      type: "MAIN_VERIFY",
      taskId: fixture.state.taskId,
      branch: fixture.state.branch,
      payload: { phase: "pre_cleanup", status: "failed", mainSha: currentMainSha }
    });

    const proof = proveLegacyStateReconciliation(
      fixture.root,
      fixture.state,
      fixture.manifest,
      fixture.events,
      "main"
    );
    assert.equal(proof.recoveredStatus, "finished");
    assert.equal(proof.recoveredCleanupStatus, "failed");
    assert.deepEqual(proof.recoveredFields, ["status", "cleanupStatus"]);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("legacy reconciliation rejects stale main and unsupported state rewrites", async () => {
  const fixture = await createFixture();
  try {
    await writeFile(path.join(fixture.root, "later.txt"), "later\n", "utf8");
    runCommand(fixture.root, "git", ["add", "later.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "later"]);
    assert.throws(
      () => proveLegacyStateReconciliation(fixture.root, fixture.state, fixture.manifest, fixture.events, "main"),
      /must bind the exact main SHA/
    );

    fixture.manifest.mainSha = runCommand(fixture.root, "git", ["rev-parse", "main"]).stdout.trim();
    fixture.manifest.targetCleanupStatus = "failed";
    assert.throws(
      () => proveLegacyStateReconciliation(fixture.root, fixture.state, fixture.manifest, fixture.events, "main"),
      /cannot rewrite a terminal cleanup status/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});
