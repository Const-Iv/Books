// @ts-check

import assert from "node:assert/strict";
import test from "node:test";

import { ensureDependencies, getRequiredRuntimeFiles } from "../../scripts/dependency-preflight.mjs";
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

    for (const filePath of requiredFiles) {
      assert.equal(await fileExists(filePath), true);
    }
  } finally {
    await fixture.cleanup();
  }
});
