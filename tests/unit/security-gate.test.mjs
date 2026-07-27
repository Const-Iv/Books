// @ts-check

import assert from "node:assert/strict";
import test from "node:test";

import { runSecurityGate } from "../../scripts/security-gate.mjs";

/**
 * @typedef {{repoRoot: string, command: string, args: string[], options?: Record<string, unknown>}} RunCommandCall
 */

test("security gate audits the full root dependency graph without omitting dev", async () => {
  /** @type {RunCommandCall[]} */
  const commandCalls = [];

  /** @param {string} repoRoot */
  const listRepoFilesFn = async (repoRoot) => {
    assert.equal(repoRoot, "/tmp/books-security-gate");
    return [];
  };

  /** @returns {Promise<string>} */
  const readFileFn = async () => {
    throw new Error("readFileFn should not be called when no repo files are returned");
  };

  /** @param {string} repoRoot @param {string} command @param {string[]} args @param {Record<string, unknown> | undefined} options */
  const runCommandFn = (repoRoot, command, args, options) => {
    commandCalls.push({ repoRoot, command, args, options });
    return { status: 0, stdout: "", stderr: "" };
  };

  await runSecurityGate({
    repoRoot: "/tmp/books-security-gate",
    listRepoFilesFn,
    readFileFn,
    runCommandFn
  });

  assert.deepEqual(commandCalls, [
    {
      repoRoot: "/tmp/books-security-gate",
      command: "npm",
      args: ["audit", "--audit-level=high"],
      options: { allowFailure: true }
    }
  ]);
});
