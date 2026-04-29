---
name: starter-rule-share
description: Primary project-local skill for sharing the current approved new-project-starter governance baseline outward to owner-approved active downstream projects. Use after starter-rule-sync has imported and verified reusable rules in New Project Starter, when Codex needs to propose target projects, require owner approval, and prepare approval-safe per-project task seeds for updating starter references or importing reusable baseline rules without overwriting downstream product-specific governance.
---

# Starter Rule Share

Use this skill after `new-project-starter` has received approved reusable rules and passed deterministic QA. The skill shares the updated baseline outward only to owner-approved active projects. It must never bulk-copy rules into every local repository and must never overwrite downstream product-specific charter, adapters, profiles, private notes, or local state.

Charter fit: outbound sharing supports the mission and JTBD by letting active downstream projects receive the latest reusable operational baseline without rebuilding governance by hand. Keep downstream product specificity in the downstream project.

## Workflow

1. Read `.memory-bank/product-charter.md`, `AGENTS.md`, `.memory-bank/index.md`, and `.memory-bank/code-rules.md`.
2. Confirm the starter import is actually ready:
   - starter working tree is clean;
   - the rule-sync import task passed deterministic QA;
   - the rules being shared are reusable starter baseline rules, not product-specific source-project details.
3. Ensure local target-project config exists in ignored `runtime/rule-share/config.json`:
   ```json
   {
     "roots": ["/path/to/project-root-folder"],
     "allowlist": ["/path/to/active-project"],
     "ignorelist": ["/path/to/old-or-paused-project"],
     "starterPath": "vendor/new-project-starter"
   }
   ```
   Keep this file uncommitted. It may contain personal local paths.
4. Run or inspect the latest rule-share scan:
   - `npm run rule-share:scan`
   - `npm run rule-share:report -- --latest`
5. Present the owner report in this order:
   - `Предложения к проектам`
   - `Готово к обновлению`
   - `Требует ручной проверки`
   - `Заблокировано`
   - `Диагностика`
6. Ask the owner to approve the target project list before apply-plan. Use project ids only as traceability after the project names and recommended actions are clear.
7. After explicit approval, write an ignored approval JSON such as `runtime/rule-share/approvals/<date>-approval.json`:
   ```json
   {
     "approvedProjects": ["rsh-project-id"],
     "notes": {
       "rsh-project-id": "Preserve local product charter wording."
     }
   }
   ```
8. Prepare outbound tasks with:
   - `npm run rule-share:apply-plan -- --approval <path> --dry-run`
9. For each returned project task seed:
   - run the target project's managed `task:start` from that project's root;
   - apply the appropriate update inside the target task worktree;
   - run the target project's deterministic QA;
   - finish/publish through the target project's normal conveyor.

## Delivery Modes

- `update_starter_reference`: for projects that keep starter under `vendor/new-project-starter`; update that versioned reference and check shared skills.
- `prepare_rule_import`: for copied starter-baseline projects; compare starter canonical files and import only reusable governance/rules with surgical diffs.
- `manual_review`: for projects without a clean managed task flow, without starter baseline signals, or with conflicts requiring owner judgment.

## Safety Rules

- Never share to projects outside `runtime/rule-share/config.json` allowlist.
- Never apply outbound changes directly from starter into downstream source files.
- Never edit dirty downstream projects; ask for cleanup/commit/stash in that project first.
- Never overwrite downstream product charter or product-specific instructions.
- Never copy `.system`, plugin-managed, generated skill trees, credentials, runtime state, or private local files.
- Treat `rule-share:apply-plan` output as preparation, not implementation. Real downstream edits still require the target project's managed worktree and QA.
- If a project is archived, paused, unclear, or not starter-based, leave it in `Требует ручной проверки` or `Заблокировано`.
