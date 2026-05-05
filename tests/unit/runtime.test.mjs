// @ts-check

import assert from "node:assert/strict";
import test from "node:test";

import { slugify } from "../../scripts/lib/runtime.mjs";

test("slugify keeps readable task text for ASCII and Cyrillic titles", () => {
  assert.equal(slugify("Starter smoke flow"), "starter-smoke-flow");
  assert.equal(slugify("ЭХО"), "echo");
  assert.equal(slugify("Правило ворктри"), "pravilo-vorktri");
  assert.equal(slugify("!!!"), "task");
});
