// @ts-check

import { parseArgs } from "./lib/runtime.mjs";
import { getRepoSkillsStatus, linkRepoSkills, unlinkRepoSkills } from "./lib/skills-manager.mjs";

/**
 * @returns {never}
 */
function usage() {
  throw new Error(
    [
      "Usage: node scripts/skills-manage.mjs <status|link|unlink> [--codex-home <path>] [--adopt]",
      "       node scripts/skills-manage.mjs <status|link|unlink> [--source <skills-root>]",
      "",
      "Examples:",
      "  node scripts/skills-manage.mjs status",
      "  node scripts/skills-manage.mjs link --adopt",
      "  node scripts/skills-manage.mjs unlink --codex-home /tmp/codex-home",
      "  node scripts/skills-manage.mjs link --source vendor/new-project-starter/skills",
      "  node scripts/skills-manage.mjs link --source skills/worktree-finish --adopt"
    ].join("\n")
  );
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const action = positionals[0];
  const codexHome = typeof flags["codex-home"] === "string" ? flags["codex-home"] : undefined;
  const source = typeof flags.source === "string" ? flags.source : undefined;
  const adopt = flags.adopt === true;

  if (!action) {
    usage();
  }

  const repoRoot = process.cwd();
  let summary;
  if (action === "status") {
    summary = await getRepoSkillsStatus(repoRoot, { codexHome, source });
  } else if (action === "link") {
    summary = await linkRepoSkills(repoRoot, { codexHome, source, adopt });
  } else if (action === "unlink") {
    summary = await unlinkRepoSkills(repoRoot, { codexHome, source });
  } else {
    usage();
  }

  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) {
    process.exitCode = 1;
  }
}

await main();
