import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/** @param {string} path */
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("Books adopts the complete portable adaptive subagent workflow", () => {
  const workflow = read(".memory-bank/subagent-workflow.md");
  assert.match(workflow, /^# Adaptive Subagent Workflow$/m);
  assert.match(workflow, /^## Triviality Gate$/m);
  for (let condition = 1; condition <= 7; condition += 1) {
    assert.match(workflow, new RegExp(`^${condition}\\. `, "m"));
  }
  for (const fragment of [
    "single", "sequential", "parallel/hybrid", "findings", "evidence",
    "risks", "unresolved", "recommended next step", "Ultra", "overlapping writers"
  ]) assert.match(workflow, new RegExp(fragment.replace("/", "\\/")));

  for (const template of ["plans/_template.md", "plans/_bugfix_template.md"]) {
    const text = read(template);
    assert.ok(text.indexOf("## Карта выполнения") < text.indexOf("## План для агента"));
    assert.match(text, /Triviality Gate/);
    assert.match(text, /File\/module ownership/);
  }

  const registry = JSON.parse(read(".memory-bank/starter-rule-registry.json"));
  assert.equal(registry.rules.filter(/** @param {{id: string}} rule */ ({ id }) => id === "starter.agent.adaptive-subagent-workflow").length, 1);
  const adoptions = JSON.parse(read(".memory-bank/starter-rule-adoptions.json"));
  const adoption = adoptions.rules.filter(/** @param {{id: string}} rule */ ({ id }) => id === "starter.agent.adaptive-subagent-workflow");
  assert.equal(adoption.length, 1);
  assert.equal(adoption[0].status, "applied_exact");
  for (const evidence of adoption[0].evidence) {
    const [path, fragment] = evidence.split("#");
    assert.match(read(path), new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
