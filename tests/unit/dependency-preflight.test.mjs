// @ts-check

import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  ensureDependencies,
  getDependencyFingerprint,
  getRequiredRuntimeFiles
} from "../../scripts/dependency-preflight.mjs";
import { fileExists } from "../../scripts/lib/runtime.mjs";
import { createTempStarterRepo } from "../helpers/temp-repo.mjs";

test("dependency preflight installs missing runtime files", async () => {
  const fixture = await createTempStarterRepo();
  try {
    const requiredFiles = getRequiredRuntimeFiles(fixture.repoRoot);
    for (const filePath of requiredFiles) {
      assert.equal(await fileExists(filePath), false);
    }

    const result = await ensureDependencies(fixture.repoRoot);
    assert.equal(result.installed, true);
    assert.equal(result.reason, "missing_runtime_files");
    assert.equal(result.fingerprint, await getDependencyFingerprint(fixture.repoRoot));

    for (const filePath of requiredFiles) {
      assert.equal(await fileExists(filePath), true);
    }

    const current = await ensureDependencies(fixture.repoRoot);
    assert.equal(current.installed, false);
    assert.equal(current.fingerprint, result.fingerprint);
  } finally {
    await fixture.cleanup();
  }
});

test("dependency preflight reinstalls when manifests drift even if runtime files still exist", async () => {
  const fixture = await createTempStarterRepo();
  try {
    const initial = await ensureDependencies(fixture.repoRoot);
    const packageJsonPath = path.join(fixture.repoRoot, "package.json");
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
    packageJson.description = `${packageJson.description} fingerprint drift`;
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");

    const refreshed = await ensureDependencies(fixture.repoRoot);
    assert.equal(refreshed.installed, true);
    assert.equal(refreshed.reason, "dependency_inputs_changed");
    assert.notEqual(refreshed.fingerprint, initial.fingerprint);

    const stable = await ensureDependencies(fixture.repoRoot);
    assert.equal(stable.installed, false);
    assert.equal(stable.fingerprint, refreshed.fingerprint);
  } finally {
    await fixture.cleanup();
  }
});
