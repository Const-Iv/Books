import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  BOOKS_IDEAL_TOOLKIT_CONTRACT,
  buildBooksToolkitPromptRules,
  validateBooksToolkitContract
} from "../../src/books/toolkit/toolkit-contract.mjs";

test("Books ideal toolkit contract preserves master format for every toolkit", () => {
  const contract = BOOKS_IDEAL_TOOLKIT_CONTRACT;

  assert.equal(contract.name, "ideal-books-toolkit-master");
  assert.equal(contract.language, "ru");
  assert.ok(contract.modelArtifactPath.endsWith("triz-unified-practical-toolkit/Единый практический toolkit TRIZ - по нескольким книгам.md"));

  for (const section of [
    "Связь с charter проекта",
    "Отчет извлечения",
    "Как пользоваться toolkit",
    "Battle route",
    "Training route",
    "Быстрая карта",
    "Tool selector",
    "Лайфхаки, приемы и инструменты к внедрению",
    "Deep reference body",
    "Coverage map",
    "Excluded / limited source notes",
    "Anti-patterns",
    "Практические сценарии",
    "Cheatsheet",
    "Glossary",
    "Topic index",
    "Scope and limits"
  ]) {
    assert.ok(contract.requiredSections.includes(section), `missing required section ${section}`);
  }

  assert.deepEqual(contract.actionCardFields, [
    "Что внедрить",
    "Когда применять",
    "Первый шаг",
    "Источник / где искать в книге"
  ]);
});

test("Books multi-book contract keeps direct-book depth and staged sequence", () => {
  const contract = BOOKS_IDEAL_TOOLKIT_CONTRACT;

  assert.equal(contract.multiBook.depthSource, "direct-structured-book-sources");
  assert.equal(contract.multiBook.standaloneRole, "coverage-control-not-depth-ceiling");
  assert.ok(contract.multiBook.forbidden.includes("synthesize combined only from standalone toolkit summaries"));
  assert.ok(contract.multiBook.requiredStages.includes("direct source extraction and deep evidence pass"));
  assert.ok(contract.multiBook.requiredStages.includes("standalone toolkit generation for every book"));
  assert.ok(contract.multiBook.requiredStages.includes("combined master synthesis directly from books with standalone coverage check"));
  assert.ok(contract.multiBook.requiredStages.includes("coverage map and dedupe notes"));
});

test("Books prompt rules describe depth, routes, selector and anti-regression gates", () => {
  const promptRules = buildBooksToolkitPromptRules({ mode: "multi-book" });

  assert.match(promptRules, /не краткий пересказ/);
  assert.match(promptRules, /не ограничивайся standalone toolkit/);
  assert.match(promptRules, /direct structured Markdown source copies/);
  assert.match(promptRules, /Battle route/);
  assert.match(promptRules, /Training route/);
  assert.match(promptRules, /Tool selector/);
  assert.match(promptRules, /Coverage map/);
  assert.match(promptRules, /Excluded \/ limited source notes/);
  assert.match(promptRules, /verification before celebrating/);
});

test("Books contract validation reports missing mandatory layers", () => {
  const result = validateBooksToolkitContract({
    sections: ["Быстрая карта", "Лайфхаки, приемы и инструменты к внедрению"],
    actionCardFields: ["Что внедрить"],
    hasDirectSourceCoverage: false,
    hasStandaloneCoverageControl: false,
    mode: "multi-book"
  });

  assert.equal(result.ok, false);
  assert.ok(result.failures.includes("missing section: Tool selector"));
  assert.ok(result.failures.includes("missing action card field: Когда применять"));
  assert.ok(result.failures.includes("multi-book missing direct source depth pass"));
  assert.ok(result.failures.includes("multi-book missing standalone coverage control"));
});

test("Books governance and TRIZ prompt reference the ideal master toolkit contract", async () => {
  const files = [
    "AGENTS.md",
    "CODEX_MEMORY.md",
    "README.md",
    ".memory-bank/product-charter.md",
    ".memory-bank/project-context.md",
    ".memory-bank/architecture-map.md",
    ".memory-bank/code-rules.md",
    "research/triz/agent-prompt-v2.md"
  ];

  const joined = (
    await Promise.all(files.map((file) => readFile(file, "utf8")))
  ).join("\n");

  for (const required of [
    "src/books/toolkit/toolkit-contract.mjs",
    "triz-unified-practical-toolkit/Единый практический toolkit TRIZ - по нескольким книгам.md",
    "Battle route",
    "Training route",
    "Tool selector",
    "deep reference",
    "coverage-control",
    "not depth ceiling",
    "structured Markdown source copies/originals"
  ]) {
    assert.match(joined, new RegExp(escapeRegExp(required)), `missing governance reference ${required}`);
  }
});

/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
