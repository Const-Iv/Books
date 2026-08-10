import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

/** @param {string} relativePath */
async function source(relativePath) {
  return readFile(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

test("finish CLI exposes only explicit cleanup-bound successor and legacy manifests", async () => {
  const finish = await source("scripts/worktree-finish-core.mjs");
  for (const fragment of [
    "--successor-lineage requires one JSON manifest path",
    "--successor-lineage is cleanup-only and requires --cleanup yes",
    "--legacy-state-reconciliation requires one JSON manifest path",
    "--legacy-state-reconciliation is cleanup-only and requires --cleanup yes",
    "--refresh-successor-lineage requires --successor-lineage"
  ]) {
    assert.match(finish, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(finish, /maybeReconcileLegacyState/);
  assert.match(finish, /maybeSkipSuccessorPublish/);
});

test("successor cleanup seals immutable manifests, proofs, history and exact QA", async () => {
  const flow = await source("scripts/lib/successor-cleanup-flow.mjs");
  for (const fragment of [
    "Immutable successor-lineage proof artifact",
    "Successor-lineage manifest changed after the first verified proof",
    "SUCCESSOR_LINEAGE_REFRESH",
    "Original task",
    "Successor current-main",
    "npm run qa:agent",
    "skipped_successor_cleanup_only"
  ]) {
    assert.ok(flow.includes(fragment), `missing successor cleanup contract: ${fragment}`);
  }
});

test("finish verification distinguishes supersession from ordinary equivalence", async () => {
  const verification = await source("scripts/lib/finish-verification.mjs");
  assert.match(verification, /tracked_successor_lineage/);
  assert.match(verification, /superseded_verified/);
  assert.match(verification, /Successor-lineage immutable proof artifact does not match task state/);
  assert.match(verification, /Successor-lineage cleanup requires exact current-main acceptance evidence/);
  assert.match(verification, /matching append-only PUBLISH_SKIP evidence/);
});

test("Books governance registers all executable successor cleanup rules once", async () => {
  const [registryRaw, adoptionsRaw] = await Promise.all([
    source(".memory-bank/starter-rule-registry.json"),
    source(".memory-bank/starter-rule-adoptions.json")
  ]);
  const registry = JSON.parse(registryRaw);
  const adoptions = JSON.parse(adoptionsRaw);
  for (const id of [
    "starter.conveyor.successor-lineage-cleanup",
    "starter.conveyor.legacy-state-reconciliation",
    "starter.conveyor.successor-lineage-refresh"
  ]) {
    assert.equal(registry.rules.filter((/** @type {{id: string}} */ rule) => rule.id === id).length, 1, `${id} registry count`);
    const adoption = adoptions.rules.find((/** @type {{id: string, status: string, evidence: string[]}} */ rule) => rule.id === id);
    assert.ok(adoption, `${id} adoption missing`);
    assert.equal(adoption.status, "applied_adapted");
    assert.ok(adoption.evidence.length >= 2);
  }
});
