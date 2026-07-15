import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const skillPath = new URL("../../skills/worktree-finish/SKILL.md", import.meta.url);

test("worktree-finish locks one exact invocation target", async () => {
  const skill = await readFile(skillPath, "utf8");

  assert.match(skill, /^## Invocation Scope Lock$/m);
  assert.match(skill, /invocationCwd = realpath\(cwd\)/);
  assert.match(skill, /exactly equals `targetWorktree`/);
  assert.match(skill, /Keep the invocation single-target by default/);
  assert.match(skill, /Do not run repository or task inspection in another project/);
  assert.match(skill, /additional repository or worktree requires a separate explicit user request/i);
});

test("worktree-finish does not bundle a discovered stale worktree", async () => {
  const skill = await readFile(skillPath, "utf8");

  assert.match(skill, /mark it `out of scope` without inspecting or touching it/);
  assert.doesNotMatch(
    skill,
    /report it as a separate pending cleanup and ask its own fixed choice/,
  );
});
