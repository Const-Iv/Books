// @ts-check

import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  proveSuccessorLineage,
  proveSuccessorLineageRefresh
} from "../../scripts/lib/successor-lineage.mjs";
import { runCommand } from "../../scripts/lib/runtime.mjs";

/**
 * @param {string} root
 * @param {string} taskId
 * @param {string} commitSha
 * @returns {import("../../scripts/lib/runtime.mjs").TaskState}
 */
function completedState(root, taskId, commitSha) {
  return /** @type {import("../../scripts/lib/runtime.mjs").TaskState} */ ({
    taskId,
    title: taskId,
    slug: taskId,
    branch: `codex/${taskId}`,
    sourceBranch: "main",
    baseSha: null,
    repoRoot: root,
    worktreePath: root,
    createdAt: "2026-07-24T00:00:00.000Z",
    seedMessage: taskId,
    status: "finished",
    qaLastPassSha: commitSha,
    previewPreparedSha: commitSha,
    commitSha,
    publishStatus: "pushed",
    cleanupStatus: "kept"
  });
}

async function createLinearFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "starter-successor-lineage-"));
  runCommand(root, "git", ["init", "-b", "main"]);
  runCommand(root, "git", ["config", "user.email", "test@example.com"]);
  runCommand(root, "git", ["config", "user.name", "Test User"]);

  await writeFile(path.join(root, "result.txt"), "base\n", "utf8");
  await writeFile(path.join(root, "removed.txt"), "base\n", "utf8");
  runCommand(root, "git", ["add", "."]);
  runCommand(root, "git", ["commit", "-m", "base"]);
  const baseSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

  await writeFile(path.join(root, "result.txt"), "task\n", "utf8");
  await writeFile(path.join(root, "task-only.txt"), "task\n", "utf8");
  runCommand(root, "git", ["rm", "removed.txt"]);
  runCommand(root, "git", ["add", "."]);
  runCommand(root, "git", ["commit", "-m", "task"]);
  const taskSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

  await writeFile(path.join(root, "result.txt"), "successor one\n", "utf8");
  await writeFile(path.join(root, "removed.txt"), "restored\n", "utf8");
  runCommand(root, "git", ["rm", "task-only.txt"]);
  runCommand(root, "git", ["add", "."]);
  runCommand(root, "git", ["commit", "-m", "successor one"]);
  const successorOneSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

  await writeFile(path.join(root, "result.txt"), "successor two\n", "utf8");
  runCommand(root, "git", ["commit", "-am", "successor two"]);
  const successorTwoSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();
  const mainSha = successorTwoSha;

  const taskState = completedState(root, "task-original", taskSha);
  taskState.baseSha = baseSha;
  const successorOneState = completedState(root, "task-successor-one", successorOneSha);
  const successorTwoState = completedState(root, "task-successor-two", successorTwoSha);
  const manifest = {
    version: /** @type {1} */ (1),
    taskId: taskState.taskId,
    taskCommitSha: taskSha,
    mainSha,
    successors: [
      {
        taskId: successorOneState.taskId,
        commitSha: successorOneSha,
        paths: ["removed.txt", "result.txt", "task-only.txt"]
      },
      {
        taskId: successorTwoState.taskId,
        commitSha: successorTwoSha,
        paths: ["result.txt"]
      }
    ]
  };
  return {
    root,
    taskState,
    taskStates: [taskState, successorOneState, successorTwoState],
    manifest,
    successorOneState,
    successorTwoState
  };
}

async function createApprovedDirectMainFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "starter-direct-main-successor-"));
  runCommand(root, "git", ["init", "-b", "main"]);
  runCommand(root, "git", ["config", "user.email", "test@example.com"]);
  runCommand(root, "git", ["config", "user.name", "Test User"]);

  await writeFile(path.join(root, "result.txt"), "base\n", "utf8");
  runCommand(root, "git", ["add", "."]);
  runCommand(root, "git", ["commit", "-m", "base"]);
  const baseSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

  await writeFile(path.join(root, "result.txt"), "task\n", "utf8");
  runCommand(root, "git", ["commit", "-am", "task"]);
  const taskSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

  await writeFile(path.join(root, "result.txt"), "approved direct correction\n", "utf8");
  await writeFile(path.join(root, "approval-plan.md"), "approved scope\n", "utf8");
  runCommand(root, "git", ["add", "."]);
  runCommand(root, "git", ["commit", "-m", "approved operational correction"]);
  const directCommitSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

  const taskState = completedState(root, "task-original", taskSha);
  taskState.baseSha = baseSha;
  const manifest = {
    version: /** @type {2} */ (2),
    taskId: taskState.taskId,
    taskCommitSha: taskSha,
    mainSha: directCommitSha,
    successors: [
      {
        kind: /** @type {const} */ ("approved_direct_main"),
        commitSha: directCommitSha,
        paths: ["result.txt"],
        changedPaths: ["approval-plan.md", "result.txt"]
      }
    ]
  };
  return { root, taskState, manifest, directCommitSha };
}

test("successor-lineage accepts a complete ordered finished/published chain", async () => {
  const fixture = await createLinearFixture();
  try {
    const proof = proveSuccessorLineage(
      fixture.root,
      fixture.taskState,
      fixture.manifest,
      fixture.taskStates,
      "main"
    );
    assert.equal(proof.status, "superseded_verified");
    assert.deepEqual(proof.rewrittenPaths, ["removed.txt", "result.txt", "task-only.txt"]);
    assert.deepEqual(proof.successorTaskIds, ["task-successor-one", "task-successor-two"]);
    assert.equal(proof.mainSha, fixture.manifest.mainSha);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("successor-lineage v2 accepts an approved first-parent operational commit without task state", async () => {
  const fixture = await createApprovedDirectMainFixture();
  try {
    const proof = proveSuccessorLineage(
      fixture.root,
      fixture.taskState,
      fixture.manifest,
      [fixture.taskState],
      "main",
      { allowedDirectPaths: ["approval-plan.md", "result.txt"] }
    );
    assert.equal(proof.status, "superseded_verified");
    assert.equal(proof.manifestVersion, 2);
    assert.deepEqual(proof.successorTaskIds, []);
    assert.deepEqual(proof.approvedDirectMainCommitShas, [fixture.directCommitSha]);
    assert.deepEqual(proof.successors, fixture.manifest.successors);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("successor-lineage v2 rejects incomplete or unsafe direct-main evidence", async (t) => {
  /** @typedef {Awaited<ReturnType<typeof createApprovedDirectMainFixture>>} DirectFixture */
  /** @type {Array<{
   *   name: string,
   *   mutate: (fixture: DirectFixture) => void,
   *   taskStates: (fixture: DirectFixture) => import("../../scripts/lib/runtime.mjs").TaskState[],
   *   allowedDirectPaths: string[],
   *   expected: RegExp
   * }>} */
  const cases = [
    {
      name: "hidden changed path",
      mutate(fixture) {
        fixture.manifest.successors[0].changedPaths = ["result.txt"];
      },
      taskStates(fixture) {
        return [fixture.taskState];
      },
      allowedDirectPaths: ["approval-plan.md", "result.txt"],
      expected: /changedPaths must exactly match the full commit change set/
    },
    {
      name: "path outside process-only profile",
      mutate() {},
      taskStates(fixture) {
        return [fixture.taskState];
      },
      allowedDirectPaths: ["result.txt"],
      expected: /outside the process-only finish profile/
    },
    {
      name: "managed task commit disguised as direct main",
      mutate() {},
      taskStates(fixture) {
        return [fixture.taskState, completedState(fixture.root, "managed-correction", fixture.directCommitSha)];
      },
      allowedDirectPaths: ["approval-plan.md", "result.txt"],
      expected: /has managed task state/
    }
  ];

  for (const item of cases) {
    await t.test(item.name, async () => {
      const fixture = await createApprovedDirectMainFixture();
      try {
        item.mutate(fixture);
        assert.throws(
          () =>
            proveSuccessorLineage(
              fixture.root,
              fixture.taskState,
              fixture.manifest,
              item.taskStates(fixture),
              "main",
              { allowedDirectPaths: item.allowedDirectPaths }
            ),
          item.expected
        );
      } finally {
        await rm(fixture.root, { recursive: true, force: true });
      }
    });
  }
});

test("successor-lineage v2 rejects an approved commit outside main first-parent history", async () => {
  const fixture = await createApprovedDirectMainFixture();
  try {
    runCommand(fixture.root, "git", ["switch", "-c", "side"]);
    await writeFile(path.join(fixture.root, "result.txt"), "side correction\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "side correction"]);
    const sideSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    runCommand(fixture.root, "git", ["switch", "main"]);
    await writeFile(path.join(fixture.root, "main-note.txt"), "main advanced\n", "utf8");
    runCommand(fixture.root, "git", ["add", "main-note.txt"]);
    runCommand(fixture.root, "git", ["commit", "-m", "advance main"]);
    runCommand(fixture.root, "git", ["merge", "--no-ff", "side", "-m", "transport side correction"]);
    fixture.manifest.mainSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    fixture.manifest.successors = [
      {
        kind: "approved_direct_main",
        commitSha: sideSha,
        paths: ["result.txt"],
        changedPaths: ["result.txt"]
      }
    ];
    assert.throws(
      () =>
        proveSuccessorLineage(
          fixture.root,
          fixture.taskState,
          fixture.manifest,
          [fixture.taskState],
          "main",
          { allowedDirectPaths: ["result.txt"] }
        ),
      /first-parent history/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("successor-lineage refresh advances only with a new seal and preserved ordered evidence", async () => {
  const fixture = await createLinearFixture();
  try {
    const previousMainSha = fixture.manifest.mainSha;
    fixture.taskState.supersessionMode = "declared_successor_lineage";
    fixture.taskState.supersessionStatus = "superseded_verified";
    fixture.taskState.supersessionManifestSha256 = "a".repeat(64);
    fixture.taskState.supersessionManifestRelativePath = "runtime/old-manifest.json";
    fixture.taskState.supersessionMainSha = previousMainSha;
    fixture.taskState.successorLineage = fixture.manifest.successors;
    fixture.taskState.originalAcceptanceStatus = "passed";
    fixture.taskState.originalAcceptanceTaskSha = fixture.taskState.commitSha;
    fixture.taskState.successorAcceptanceStatus = "passed";
    fixture.taskState.successorAcceptanceMainSha = previousMainSha;

    await writeFile(path.join(fixture.root, "result.txt"), "successor three\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "successor three"]);
    const successorThreeSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    const successorThreeState = completedState(fixture.root, "task-successor-three", successorThreeSha);
    const nextManifest = {
      ...fixture.manifest,
      mainSha: successorThreeSha,
      successors: [
        ...fixture.manifest.successors,
        {
          taskId: successorThreeState.taskId,
          commitSha: successorThreeSha,
          paths: ["result.txt"]
        }
      ]
    };

    const proof = proveSuccessorLineageRefresh(
      fixture.root,
      fixture.taskState,
      {
        manifest: fixture.manifest,
        sha256: "a".repeat(64),
        relativePath: "runtime/old-manifest.json"
      },
      {
        manifest: nextManifest,
        sha256: "b".repeat(64),
        relativePath: "runtime/new-manifest.json"
      },
      [...fixture.taskStates, successorThreeState],
      "main"
    );
    assert.equal(proof.previousProof.mainSha, previousMainSha);
    assert.equal(proof.nextProof.mainSha, successorThreeSha);
    assert.deepEqual(
      proof.nextProof.successorTaskIds,
      ["task-successor-one", "task-successor-two", "task-successor-three"]
    );

    assert.throws(
      () =>
        proveSuccessorLineageRefresh(
          fixture.root,
          fixture.taskState,
          {
            manifest: fixture.manifest,
            sha256: "a".repeat(64),
            relativePath: "runtime/old-manifest.json"
          },
          {
            manifest: nextManifest,
            sha256: "b".repeat(64),
            relativePath: "runtime/old-manifest.json"
          },
          [...fixture.taskStates, successorThreeState],
          "main"
        ),
      /new immutable manifest path/
    );

    const reorderedManifest = {
      ...nextManifest,
      successors: [
        nextManifest.successors[1],
        nextManifest.successors[0],
        nextManifest.successors[2]
      ]
    };
    assert.throws(
      () =>
        proveSuccessorLineageRefresh(
          fixture.root,
          fixture.taskState,
          {
            manifest: fixture.manifest,
            sha256: "a".repeat(64),
            relativePath: "runtime/old-manifest.json"
          },
          {
            manifest: reorderedManifest,
            sha256: "c".repeat(64),
            relativePath: "runtime/reordered-manifest.json"
          },
          [...fixture.taskStates, successorThreeState],
          "main"
        ),
      /ordered ancestry chain|preserve prior successor evidence in order/
    );

    assert.throws(
      () =>
        proveSuccessorLineageRefresh(
          fixture.root,
          fixture.taskState,
          {
            manifest: fixture.manifest,
            sha256: "a".repeat(64),
            relativePath: "runtime/old-manifest.json"
          },
          {
            manifest: {
              ...nextManifest,
              version: 2,
              successors: nextManifest.successors.map((entry) => ({ kind: "managed_task", ...entry }))
            },
            sha256: "d".repeat(64),
            relativePath: "runtime/version-two-manifest.json"
          },
          [...fixture.taskStates, successorThreeState],
          "main"
        ),
      /cannot change the sealed manifest version/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("successor-lineage rejects incomplete, unsafe, unpublished, and stale manifests", async (t) => {
  /** @type {Array<{
   *   name: string,
   *   mutate: (fixture: Awaited<ReturnType<typeof createLinearFixture>>) => void | Promise<void>,
   *   expected: RegExp
   * }>} */
  const cases = [
    {
      name: "missing rewritten path",
      mutate(fixture) {
        fixture.manifest.successors[0].paths = ["result.txt", "task-only.txt"];
      },
      expected: /must exactly match its rewritten task paths/
    },
    {
      name: "unsafe path",
      mutate(fixture) {
        fixture.manifest.successors[0].paths.push("../outside");
      },
      expected: /unsafe path/
    },
    {
      name: "unfinished successor state",
      mutate(fixture) {
        fixture.successorOneState.status = "merged";
      },
      expected: /must be finished/
    },
    {
      name: "stale main sha",
      async mutate(fixture) {
        await writeFile(path.join(fixture.root, "unrelated.txt"), "later\n", "utf8");
        runCommand(fixture.root, "git", ["add", "unrelated.txt"]);
        runCommand(fixture.root, "git", ["commit", "-m", "later unrelated change"]);
      },
      expected: /exact main SHA/
    }
  ];

  for (const item of cases) {
    await t.test(item.name, async () => {
      const fixture = await createLinearFixture();
      try {
        await item.mutate(fixture);
        assert.throws(
          () => proveSuccessorLineage(fixture.root, fixture.taskState, fixture.manifest, fixture.taskStates, "main"),
          item.expected
        );
      } finally {
        await rm(fixture.root, { recursive: true, force: true });
      }
    });
  }
});

test("successor-lineage rejects a content-changing commit omitted from the manifest", async () => {
  const fixture = await createLinearFixture();
  try {
    await writeFile(path.join(fixture.root, "result.txt"), "unaccounted\n", "utf8");
    runCommand(fixture.root, "git", ["commit", "-am", "unaccounted rewrite"]);
    fixture.manifest.mainSha = runCommand(fixture.root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    assert.throws(
      () => proveSuccessorLineage(fixture.root, fixture.taskState, fixture.manifest, fixture.taskStates, "main"),
      /not declared in the successor manifest/
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("successor-lineage allows transport merges and rejects custom merge resolutions", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "starter-successor-merge-"));
  try {
    runCommand(root, "git", ["init", "-b", "main"]);
    runCommand(root, "git", ["config", "user.email", "test@example.com"]);
    runCommand(root, "git", ["config", "user.name", "Test User"]);
    await writeFile(path.join(root, "result.txt"), "base\n", "utf8");
    runCommand(root, "git", ["add", "."]);
    runCommand(root, "git", ["commit", "-m", "base"]);
    const baseSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    await writeFile(path.join(root, "result.txt"), "task\n", "utf8");
    runCommand(root, "git", ["commit", "-am", "task"]);
    const taskSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

    runCommand(root, "git", ["switch", "-c", "successor"]);
    await writeFile(path.join(root, "result.txt"), "successor\n", "utf8");
    runCommand(root, "git", ["commit", "-am", "successor"]);
    const successorSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

    runCommand(root, "git", ["switch", "main"]);
    await writeFile(path.join(root, "note.txt"), "transport\n", "utf8");
    runCommand(root, "git", ["add", "note.txt"]);
    runCommand(root, "git", ["commit", "-m", "main transport base"]);
    runCommand(root, "git", ["merge", "--no-ff", "successor", "-m", "transport successor"]);
    const transportMainSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();

    const taskState = completedState(root, "task-original", taskSha);
    taskState.baseSha = baseSha;
    const successorState = completedState(root, "task-successor", successorSha);
    const manifest = {
      version: /** @type {1} */ (1),
      taskId: taskState.taskId,
      taskCommitSha: taskSha,
      mainSha: transportMainSha,
      successors: [{ taskId: successorState.taskId, commitSha: successorSha, paths: ["result.txt"] }]
    };
    assert.equal(
      proveSuccessorLineage(root, taskState, manifest, [taskState, successorState], "main").status,
      "superseded_verified"
    );

    runCommand(root, "git", ["switch", "-c", "resolution-side", taskSha]);
    await writeFile(path.join(root, "result.txt"), "side\n", "utf8");
    runCommand(root, "git", ["commit", "-am", "side rewrite"]);
    const sideSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    runCommand(root, "git", ["switch", "main"]);
    await writeFile(path.join(root, "result.txt"), "main rewrite\n", "utf8");
    runCommand(root, "git", ["commit", "-am", "main rewrite"]);
    const merge = runCommand(root, "git", ["merge", "--no-ff", "resolution-side", "-m", "custom resolution"], {
      allowFailure: true
    });
    assert.notEqual(merge.status, 0);
    await writeFile(path.join(root, "result.txt"), "custom resolution\n", "utf8");
    runCommand(root, "git", ["add", "result.txt"]);
    runCommand(root, "git", ["commit", "--no-edit"]);
    manifest.mainSha = runCommand(root, "git", ["rev-parse", "HEAD"]).stdout.trim();
    manifest.successors.push({ taskId: "task-side", commitSha: sideSha, paths: ["result.txt"] });
    const sideState = completedState(root, "task-side", sideSha);
    assert.throws(
      () => proveSuccessorLineage(root, taskState, manifest, [taskState, successorState, sideState], "main"),
      /custom merge resolution/
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
