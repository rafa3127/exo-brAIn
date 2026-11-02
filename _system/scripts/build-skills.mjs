#!/usr/bin/env node
// Builds the exo-brAIn skills from _system/skill-specs/ (embedded mode).
//
// Output:
//   .claude/skills/<name>/SKILL.md   -> project skills (Claude Code inside the vault, incl. cloud sessions)
//   dist/skills/<name>.zip           -> upload to claude.ai (Customize > Skills) — 6 skills;
//                                       exo-brain-inbox is project-only (accountZip: false), no ZIP
//
// Usage (from vault root):  node _system/scripts/build-skills.mjs
// Known clone paths come from _system/config.json: vault.paths (one per machine) + vault.path.
// Without config.json (e.g. the template itself) no machine paths are embedded.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_SKILLS = path.join(ROOT, ".claude", "skills");
const OUT_DIST = path.join(ROOT, "dist", "skills");

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n").trim();
const spec = (f) => read(`_system/skill-specs/${f}`);

// Every machine where this vault is cloned. Skills synced via claude.ai are
// shared across machines, so they must not hardcode a single path.
let vault = {};
if (fs.existsSync(path.join(ROOT, "_system", "config.json"))) {
  try {
    vault = JSON.parse(read("_system/config.json"))?.vault ?? {};
  } catch (e) {
    console.warn(`⚠ _system/config.json is not valid JSON (${e.message}) — building without known vault paths`);
  }
}
const norm = (p) => p.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
const paths = [];
for (const p of [...(Array.isArray(vault.paths) ? vault.paths : []), vault.path]) {
  if (typeof p !== "string" || !p.trim() || p === "VAULT_PATH") continue;
  if (!paths.some((q) => norm(q) === norm(p))) paths.push(p.trim());
}

const locationSteps = [
  "The current working directory (Claude Code) or the folder mounted in this Cowork session, if it contains `CLAUDE.md`.",
  ...(paths.length ? [`One of the known clones:\n${paths.map((p) => `   - ${p}`).join("\n")}`] : []),
  "No filesystem access (e.g. Chat): use the Obsidian MCP tools below — their paths are already vault-relative.",
  "Still nothing: ask the user where the vault is.",
];

const header = (title) => `# exo-brAIn — ${title}

## Vault location

The vault root is the folder containing \`CLAUDE.md\` and \`_system/skill-specs/\`. All paths below are relative to it. Resolve it in this order:

${locationSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Configuration

Read \`_system/config.json\`. It is gitignored, so it is **absent in cloud sessions** (\`CLAUDE_CODE_REMOTE=true\`) and in remote modes (\`EXO_BRAIN_MODE\` set). In that case the vault **is configured**: use the defaults from \`_system/config.template.json\` for paths and conventions, and **never** run the quickstart.

## Sync check

On the **first** use of any exo-brain skill in a session, make sure the vault is up to date before reading it:

1. If the session context already contains a line \`exo-brain sync: …\` (from the SessionStart hook), use that status.
2. Otherwise, if you have a shell and the vault is a git repo (and not \`CLAUDE_CODE_REMOTE=true\`): run \`node _system/scripts/sync-check.mjs\` from the vault root and use its output line.
3. No shell or no git (e.g. Chat via MCP): skip silently.

If the status is \`FAILED: <reason>\`: tell the user the reason and ask whether to continue without the latest changes. **Do not continue until they answer.** \`up-to-date\`, \`pulled N commits\` and \`skipped (…)\` need no action (mention pulled commits briefly).

## Conventions
- Boilerplate: English. Session content: user's language.
- Temporal files: YYYY-MM-DD-slug.md
- Frontmatter audience: ai · human · shared
- _index.md files are auto-generated — never edit manually
- Cross-references in body: Obsidian [[wikilinks]]; inside tables escape the pipe: [[path\\|alias]]
- Always read the full procedure BEFORE executing

## MCP Operations (if available)
- obsidian_get_file_contents(filepath) — read
- obsidian_append_content(filepath, content) — create/append
- obsidian_patch_content(filepath, target, content, operation) — edit
- obsidian_simple_search(query) — search
- obsidian_list_files_in_dir(dirpath) — list
- obsidian_delete_file(filepath) — delete

If MCP is not available, use direct file access at the vault root.

---
`;

const section = (heading, body) => `## ${heading}\n\n${body}\n`;

const SKILLS = [
  {
    name: "exo-brain",
    title: "Main Router",
    description: `Manages an AI-assisted exo-brAIn (external brain) in Obsidian. This is the main entry point. Trigger when the user mentions Obsidian, their vault, their notes, "exo-brain", "second brain", or wants to set up a new vault ("quickstart", "initialize vault", "set up obsidian"). Also triggers for general vault queries that don't match a more specific exo-brain-* skill, for reinstalling/updating the exo-brain skills, and for reviewing contribution PRs to the exo-brAIn template repo ("review this PR", "check this contribution").`,
    body: () => [
      section(
        "Routing",
        'On any vault query: if `EXO_BRAIN_MODE=inbox`, use `exo-brain-inbox` only. In a cloud session (`CLAUDE_CODE_REMOTE=true`) or with `EXO_BRAIN_MODE` set, the vault counts as configured even without `_system/config.json` (see Configuration above) — never run the Quickstart there. Otherwise read `_system/config.json`: if it is missing or `vault.name` is `"VAULT_NAME"`, follow the Quickstart below. Then route by intent to the matching `exo-brain-*` skill (sessions, roles, knowledge, tasks, capture), or handle directly. To reinstall/update skills, read `_system/skill-specs/install-skills.md` from the vault.'
      ),
      section("Routing Table (README)", spec("README.md")),
      section("Quickstart", read("_system/quickstart.md")),
      section("Review Contribution", spec("review-contribution.md")),
    ],
  },
  {
    name: "exo-brain-sessions",
    title: "Sessions",
    description: `Manages work and study sessions in the exo-brAIn vault. Trigger when the user wants to: start a session ("let's work on...", "boot session", "open session", "continue with..."), end a session ("close session", "wrap up", "done for today", "end session"), or load additional context mid-session ("find notes about...", "check the architecture doc", "load context for...", "bring in the [file]").`,
    body: () => [
      section("Session Boot", spec("session-boot.md")),
      section("Session End", spec("session-end.md")),
      section("Load Context", spec("load-context.md")),
    ],
  },
  {
    name: "exo-brain-roles",
    title: "Roles",
    description: `Manages AI roles and personas in the exo-brAIn vault. Trigger when the user wants to: list available roles ("what roles do I have", "show roles"), load or switch a role ("act as...", "switch role", "load the [name] role"), create a new role ("create a role", "new persona"), or edit an existing role ("edit the [name] role", "add cross-cutting concern to role").`,
    body: () => [section("Role Load", spec("role-load.md")), section("Role Save", spec("role-save.md"))],
  },
  {
    name: "exo-brain-knowledge",
    title: "Knowledge",
    description: `Manages knowledge areas and documentation in the exo-brAIn vault. Trigger when the user wants to: create a knowledge area ("create an area", "new project for...", "start a study area"), or update documentation ("log this decision", "update the architecture", "mark as done", "update doc").`,
    body: () => [section("Area Create", spec("area-create.md")), section("Update Doc", spec("update-doc.md"))],
  },
  {
    name: "exo-brain-tasks",
    title: "Tasks",
    description: `Manages tasks and backlog in the exo-brAIn vault. Trigger when the user wants to: define a new task ("define task", "create task", "turn this into a task"), list pending tasks or get a daily briefing ("what's on my plate", "daily briefing", "show my tasks", "what should I work on"), add an idea to the backlog ("add to backlog", "save this idea for later"), or review and triage backlog items ("review backlog", "what's in the backlog", "triage ideas").`,
    body: () => [
      section("Task Define", spec("task-define.md")),
      section("Task List", spec("task-list.md")),
      section("Backlog Add", spec("backlog-add.md")),
      section("Backlog Review", spec("backlog-review.md")),
    ],
  },
  {
    name: "exo-brain-capture",
    title: "Capture",
    description: `Quick note capture in the exo-brAIn vault. Trigger when the user wants to: capture a quick thought ("capture this", "quick note", "jot this down"), add to today's daily note ("daily note", "add to today's notes"), or save a fleeting idea without full task or backlog formality.`,
    body: () => [section("Daily Capture", spec("daily-capture.md"))],
  },
  {
    name: "exo-brain-inbox",
    title: "Inbox (restricted remote mode)",
    // Project-only: written to .claude/skills/ for cloud runs, never packaged for the claude.ai account.
    accountZip: false,
    description: `Restricted inbox mode for remote capture. ONLY applies when the environment variable EXO_BRAIN_MODE=inbox is set (a dedicated cloud scheduled task fired with a <routine-fire-payload>). Records the payload — a voice transcription or text — as new tasks, captures or backlog items in the exo-brAIn vault, commits and pushes. Never use it in interactive sessions or when EXO_BRAIN_MODE is not inbox; use exo-brain-capture or exo-brain-tasks instead.`,
    body: () => [
      section("Inbox", spec("inbox.md")),
      section("Daily Capture", spec("daily-capture.md")),
      section("Task Define", spec("task-define.md")),
      section("Backlog Add", spec("backlog-add.md")),
    ],
  },
];

const yamlFolded = (s) => {
  const words = s.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 78) {
      lines.push(cur.trim());
      cur = w;
    } else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return ">\n" + lines.map((l) => "  " + l).join("\n");
};

fs.mkdirSync(OUT_DIST, { recursive: true });
for (const s of SKILLS) {
  if (s.description.length > 1024) throw new Error(`${s.name}: description > 1024 chars`);
  const md = `---\nname: ${s.name}\ndescription: ${yamlFolded(s.description)}\n---\n\n${header(s.title)}\n${s
    .body()
    .join("\n---\n\n")}`;
  const dir = path.join(OUT_SKILLS, s.name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "SKILL.md"), md, "utf8");

  // ZIP with the skill folder at the root: <name>/SKILL.md
  const zip = path.join(OUT_DIST, `${s.name}.zip`);
  fs.rmSync(zip, { force: true });
  if (s.accountZip === false) {
    console.log(`✔ ${s.name}  (${md.split("\n").length} lines)  -> project only (.claude/skills, no ZIP)`);
    continue;
  }
  if (process.platform === "win32") {
    execFileSync(path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe"), ["-a", "-c", "-f", zip, "-C", OUT_SKILLS, s.name]);
  } else {
    execFileSync("zip", ["-r", "-X", zip, s.name, "-x", "*.DS_Store"], { cwd: OUT_SKILLS });
  }
  console.log(`✔ ${s.name}  (${md.split("\n").length} lines)  -> ${path.relative(ROOT, zip)}`);
}
