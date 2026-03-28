---
audience: ai
doc_type: instruction
version: 3
last_updated: 2026-03-28
---

# Install exo-brAIn Skills

Installs the exo-brAIn skill suite into the user's AI platform. Skills are embedded (not referenced), so they work instantly without vault roundtrips.

> **Read this full spec before executing any step.**
> **Re-run this installer after updating any skill-spec in the vault** to sync changes.

---

## Step 1 — Detect Platform

### Claude (Anthropic)

**Detection:** Any of these is true:
- You are Claude Code CLI, Claude Desktop Chat, or Cowork mode
- The directory `~/.claude/` exists on the host system

**Action:** Proceed to **Step 2 — Claude Installation**.

### Other AI platforms

**Detection:** None of the Claude indicators above are present.

**Action:** Tell the user:
> "This installer is currently configured for Claude. For other platforms, refer to the skill-spec files in `_system/skill-specs/` and adapt them to your AI's skill/plugin system."

---

## Step 2 — Resolve Vault Path

Read `_system/config.json`. Extract `vault.path`.

- If set and valid → store as `VAULT_PATH`
- If `"VAULT_PATH"` or missing → ask user: "What is the full path to your exo-brAIn vault? (e.g., `~/Desktop/my-brain`)"

This path is embedded in each SKILL.md as a fallback reference. The actual spec content is embedded directly.

---

## Step 3 — Read All Specs

Read these files from the vault and hold them in memory. You will embed their content into the SKILL.md files in Step 4.

| Group | Files to read |
|---|---|
| exo-brain | `_system/skill-specs/review-contribution.md` |
| sessions | `_system/skill-specs/session-boot.md`, `_system/skill-specs/session-end.md`, `_system/skill-specs/load-context.md` |
| roles | `_system/skill-specs/role-load.md`, `_system/skill-specs/role-save.md` |
| knowledge | `_system/skill-specs/area-create.md`, `_system/skill-specs/update-doc.md` |
| tasks | `_system/skill-specs/task-define.md`, `_system/skill-specs/task-list.md`, `_system/skill-specs/backlog-add.md`, `_system/skill-specs/backlog-review.md` |
| capture | `_system/skill-specs/daily-capture.md` |

Also read:
- `_system/config.json` (for vault metadata)
- `_system/skill-specs/README.md` (for the routing table)

---

## Step 4 — Generate and Write SKILL.md Files

Create 6 skill directories under `~/.claude/skills/` and write each SKILL.md.

### Structure of each SKILL.md

Every SKILL.md follows this template:

```
---
name: [skill-name]
description: >
  [Trigger description — what natural language phrases activate this skill]
---

# [Title]

## Vault: {{VAULT_PATH}}

## Conventions
- Boilerplate: English. Session content: user's language.
- Temporal files: YYYY-MM-DD-slug.md
- Frontmatter audience: ai · human · shared
- _index.md files are auto-generated — never edit manually
- Always read the full procedure BEFORE executing

## MCP Operations (if available)
- obsidian_get_file_contents(filepath) — read
- obsidian_append_content(filepath, content) — create/append
- obsidian_patch_content(filepath, target, content, operation) — edit
- obsidian_simple_search(query) — search
- obsidian_list_files_in_dir(dirpath) — list
- obsidian_delete_file(filepath) — delete

If MCP is not available, use direct file access at {{VAULT_PATH}}/.

---

[EMBEDDED SPEC CONTENT — full content of each spec file in this group]
```

### The 6 Skills

**Create directories:**
```bash
mkdir -p ~/.claude/skills/exo-brain
mkdir -p ~/.claude/skills/exo-brain-sessions
mkdir -p ~/.claude/skills/exo-brain-roles
mkdir -p ~/.claude/skills/exo-brain-knowledge
mkdir -p ~/.claude/skills/exo-brain-tasks
mkdir -p ~/.claude/skills/exo-brain-capture
```

**Write each SKILL.md** using the template above with these specifics:

---

#### 4.1 `exo-brain/SKILL.md` — Main Router

**Frontmatter:**
```yaml
name: exo-brain
description: >
  Manages an AI-assisted exo-brAIn (external brain) in Obsidian. This is the
  main entry point. Trigger when the user mentions Obsidian, their vault,
  their notes, "exo-brain", "second brain", or wants to set up a new vault
  ("quickstart", "initialize vault", "set up obsidian"). Also triggers for
  general vault queries that don't match a more specific exo-brain-* skill,
  and for reviewing contribution PRs to the exo-brAIn template repo
  ("review this PR", "check this contribution").
```

**Body content:** Embed the routing table from `_system/skill-specs/README.md`, the boot sequence logic, and the review-contribution spec:
1. Read `_system/config.json` — if `vault.name` is `"VAULT_NAME"`, follow quickstart
2. Otherwise, route based on user intent to the specific skill or handle directly
3. Include the full MCP operations reference
4. Include the quickstart procedure summary (from `_system/quickstart.md` Steps 1-7)
5. Embed `review-contribution.md` (under heading `## Review Contribution`)

---

#### 4.2 `exo-brain-sessions/SKILL.md`

**Frontmatter:**
```yaml
name: exo-brain-sessions
description: >
  Manages work and study sessions in the exo-brAIn vault. Trigger when the user
  wants to: start a session ("let's work on...", "boot session", "open session",
  "continue with..."), end a session ("close session", "wrap up", "done for today",
  "end session"), or load additional context mid-session ("find notes about...",
  "check the architecture doc", "load context for...", "bring in the [file]").
```

**Body content:** Embed the FULL content of:
- `session-boot.md` (under heading `## Session Boot`)
- `session-end.md` (under heading `## Session End`)
- `load-context.md` (under heading `## Load Context`)

---

#### 4.3 `exo-brain-roles/SKILL.md`

**Frontmatter:**
```yaml
name: exo-brain-roles
description: >
  Manages AI roles and personas in the exo-brAIn vault. Trigger when the user
  wants to: list available roles ("what roles do I have", "show roles"), load or
  switch a role ("act as...", "switch role", "load the [name] role"), create a new
  role ("create a role", "new persona"), or edit an existing role ("edit the
  [name] role", "add cross-cutting concern to role").
```

**Body content:** Embed the FULL content of:
- `role-load.md` (under heading `## Role Load`)
- `role-save.md` (under heading `## Role Save`)

---

#### 4.4 `exo-brain-knowledge/SKILL.md`

**Frontmatter:**
```yaml
name: exo-brain-knowledge
description: >
  Manages knowledge areas and documentation in the exo-brAIn vault. Trigger
  when the user wants to: create a knowledge area ("create an area", "new
  project for...", "start a study area"), or update documentation ("log this
  decision", "update the architecture", "mark as done", "update doc").
```

**Body content:** Embed the FULL content of:
- `area-create.md` (under heading `## Area Create`)
- `update-doc.md` (under heading `## Update Doc`)

---

#### 4.5 `exo-brain-tasks/SKILL.md`

**Frontmatter:**
```yaml
name: exo-brain-tasks
description: >
  Manages tasks and backlog in the exo-brAIn vault. Trigger when the user wants
  to: define a new task ("define task", "create task", "turn this into a task"),
  list pending tasks or get a daily briefing ("what's on my plate", "daily briefing",
  "show my tasks", "what should I work on"), add an idea to the backlog ("add to
  backlog", "save this idea for later"), or review and triage backlog items
  ("review backlog", "what's in the backlog", "triage ideas").
```

**Body content:** Embed the FULL content of:
- `task-define.md` (under heading `## Task Define`)
- `task-list.md` (under heading `## Task List`)
- `backlog-add.md` (under heading `## Backlog Add`)
- `backlog-review.md` (under heading `## Backlog Review`)

---

#### 4.6 `exo-brain-capture/SKILL.md`

**Frontmatter:**
```yaml
name: exo-brain-capture
description: >
  Quick note capture in the exo-brAIn vault. Trigger when the user wants to:
  capture a quick thought ("capture this", "quick note", "jot this down"),
  add to today's daily note ("daily note", "add to today's notes"), or save a
  fleeting idea without full task or backlog formality.
```

**Body content:** Embed the FULL content of:
- `daily-capture.md` (under heading `## Daily Capture`)

---

## Step 5 — Verify

```bash
ls ~/.claude/skills/ | grep exo-brain
```

Expected: 6 directories.

Check one SKILL.md has actual spec content (not just a reference):
```bash
wc -l ~/.claude/skills/exo-brain-sessions/SKILL.md
```

Should be significantly more than 20 lines (the embedded specs add substantial content).

---

## Step 6 — Report

```
✅ exo-brAIn skills installed (embedded mode)
📂 Location: ~/.claude/skills/
🧩 6 skills: exo-brain, exo-brain-sessions, exo-brain-roles,
   exo-brain-knowledge, exo-brain-tasks, exo-brain-capture
⚡ Specs embedded — no vault roundtrip needed at runtime
🔄 To update after spec changes: re-run this installer
```

---

## Appendix — Updating Skills

When a skill-spec in `_system/skill-specs/` is modified, the installed skills become stale. To update:

1. Tell the AI: "Re-install exo-brain skills" or "Update exo-brain skills"
2. The AI re-reads this spec and re-runs Steps 2-6
3. All SKILL.md files are regenerated with fresh content

This can also be triggered from the quickstart flow (Step 5c) during initial setup.
