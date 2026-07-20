// @ts-check

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * @param {string} flag
 * @returns {string}
 */
function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] ?? "" : "";
}

const phase = valueAfter("--phase");
const contextPath = valueAfter("--context");
const mainRoot = path.resolve(process.cwd());
const checks = [];
const blocked = [];

try {
  const context = JSON.parse(readFileSync(contextPath, "utf8"));
  const exactMain = path.resolve(String(context.mainWorktreePath ?? "")) === mainRoot;
  checks.push({ id: "canonical_main_source", status: exactMain ? "passed" : "failed", details: exactMain ? "Verification runs from canonical main" : "Verification source mismatch" });
  if (!exactMain) blocked.push("Runtime verification must run from canonical main.");
} catch (error) {
  checks.push({ id: "verification_context", status: "failed", details: String(error) });
  blocked.push("Finish verification context is unreadable.");
}

const contracts = spawnSync(
  "node",
  ["--test", "tests/unit/books-toolkit-contract.test.mjs", "tests/unit/books-artifacts.test.mjs"],
  { cwd: mainRoot, encoding: "utf8" }
);
const contractsPassed = contracts.status === 0;
checks.push({
  id: "books_functional_contracts",
  status: contractsPassed ? "passed" : "failed",
  details: contractsPassed ? "Toolkit and local artifact preservation contracts passed" : "Books contract tests failed"
});
if (!contractsPassed) blocked.push("Books functional contract verification failed.");

console.log(JSON.stringify({
  version: 1,
  phase,
  status: blocked.length === 0 ? "passed" : "failed",
  checks,
  runtimeSourcePaths: [mainRoot],
  blocked,
  notes: ["runtime/books is preserved declaratively; no production deploy/restart is part of cleanup."]
}));
