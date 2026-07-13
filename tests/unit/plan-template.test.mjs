// @ts-check

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
/** @param {string} relativePath */
const read = (relativePath) => readFileSync(path.join(REPO_ROOT, relativePath), "utf8");

const CORE_HEADINGS = [
  "## Связь с charter проекта",
  "## Цель",
  "## Контекст",
  "## Job Story",
  "## Входные данные",
  "## Ожидаемый результат",
  "## Критерии приёмки",
  "## План проверки",
  "## Eval spec"
];

test("task templates use one owner-language Job Story and keep verification separate", () => {
  for (const relativePath of ["plans/_template.md", "plans/_bugfix_template.md"]) {
    const text = read(relativePath);
    let previous = -1;
    for (const heading of CORE_HEADINGS) {
      const index = text.indexOf(heading);
      assert.ok(index > previous, `${relativePath}: missing or out-of-order heading ${heading}`);
      previous = index;
    }
    assert.doesNotMatch(text, /^## (JTBD|Job Stories|User Story|User Stories|Пользовательский сценарий)\s*$/m);
    assert.doesNotMatch(text, /^(Проблема \/ JTBD|JTBD \/ проблема|Job Stories?|User Stories?):\s*$/m);
    assert.match(text, /одну Job Story/);
    assert.match(text, /Критерии приёмки/);
    assert.match(text, /Eval spec/);
  }
});

test("task template preserves the owner-approved Job Story example", () => {
  assert.match(
    read("plans/_template.md"),
    /Когда владелец начинает задачу в отдельном worktree и для её выполнения нужен уже подключённый сервис, он хочет сразу приступить к работе без повторной настройки и риска утечки секретов\./
  );
});

test("project-level JTBD remains outside the task templates", () => {
  assert.match(read(".memory-bank/product-charter.md"), /^## (?:\d+\.\s+)?JTBD(?: \/ проблема)?$/m);
});
