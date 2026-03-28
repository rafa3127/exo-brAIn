---
audience: ai
doc_type: instruction
version: 5
last_updated: 2026-03-28
---

# Install exo-brAIn Skills

Installs the exo-brAIn skill suite into the user's AI platform. Skills are embedded (not referenced), so they work instantly without vault roundtrips.

Skills are installed to **two targets** on Claude platforms:
- **Claude Code** (`~/.claude/skills/`) — for Code mode (CLI and Desktop Code tab)
- **Claude Desktop** (`.skill` packages or plugin directory) — for Chat and Cowork modes

Both targets use the same SKILL.md files but different registration mechanisms. The preferred Desktop method is `.skill` file packaging (available in Cowork), with direct plugin directory writing as fallback.

> **Read this full spec before executing any step.**
> **Re-run this installer after updating any skill-spec in the vault** to sync changes.

---

## Step 1 — Detect Platform

### Claude (Anthropic)

**Detection:** Any of these is true:
- You are Claude Code CLI, Claude Desktop Chat, or Cowork mode
- The directory `~/.claude/` exists on the host system

**Action:** Proceed to **Step 2 — Resolve Vault Path**.

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

## Step 4 — Generate and Write SKILL.md Files (Claude Code)

Create 6 skill directories under `~/.claude/skills/` and write each SKILL.md.

> This step makes skills available in **Claude Code CLI** and the **Code tab** in Claude Desktop.

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

## Step 5 — Install to Claude Desktop (Chat + Cowork)

> This step makes skills available as `/slash-commands` in **Claude Desktop Chat** and **Cowork** modes.
> If the user is only using Claude Code CLI (no Desktop app), skip this step.

**Choose the method based on available tools — try Option A first, fall back to Option B.**

### Option A — Package as `.skill` files (preferred)

**Detection:** You have access to `present_files` (Cowork) or `package_skill` (skill-creator).

This is the most reliable method. It packages each skill as a `.skill` file that the user installs with one click.

**Procedure:**

1. For each of the 6 skills, create a temporary directory with the SKILL.md:
   ```bash
   mkdir -p /tmp/exo-brain-skills/exo-brain
   # Copy the SKILL.md content generated in Step 4
   # Repeat for all 6 skills
   ```

2. Package each skill directory as a `.skill` file (which is a zip archive):
   ```bash
   cd /tmp/exo-brain-skills/exo-brain && zip -r /tmp/exo-brain.skill . -x "*.DS_Store"
   cd /tmp/exo-brain-skills/exo-brain-sessions && zip -r /tmp/exo-brain-sessions.skill . -x "*.DS_Store"
   cd /tmp/exo-brain-skills/exo-brain-roles && zip -r /tmp/exo-brain-roles.skill . -x "*.DS_Store"
   cd /tmp/exo-brain-skills/exo-brain-knowledge && zip -r /tmp/exo-brain-knowledge.skill . -x "*.DS_Store"
   cd /tmp/exo-brain-skills/exo-brain-tasks && zip -r /tmp/exo-brain-tasks.skill . -x "*.DS_Store"
   cd /tmp/exo-brain-skills/exo-brain-capture && zip -r /tmp/exo-brain-capture.skill . -x "*.DS_Store"
   ```

3. Copy the `.skill` files to the outputs folder and present them to the user:
   ```bash
   cp /tmp/exo-brain*.skill {{OUTPUTS_FOLDER}}/
   ```

4. Use `present_files` to show each `.skill` file to the user. Each file renders with a **"Copy to your skills"** button that the user clicks to install.

5. Tell the user: "Click 'Copy to your skills' on each file to install. After installing all 6, restart Claude Desktop for the skills to appear as `/slash-commands`."

### Option B — Write directly to plugin directory (fallback)

**Detection:** Option A is not available (no `present_files`, not in Cowork, no skill-creator).

This method writes skills directly into the Claude Desktop internal plugin directory. It works but may be reset by Claude Desktop updates.

#### 5b.1 — Locate the anthropic-skills plugin

The Claude Desktop plugin system stores plugins at:

**macOS:**
```
~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/
```

**Windows:**
```
%APPDATA%\Claude\local-agent-mode-sessions\skills-plugin\
```

Inside this directory, the structure uses UUID subdirectories:
```
skills-plugin/
└── {org-uuid}/
    └── {user-uuid}/
        ├── .claude-plugin/
        │   └── plugin.json          ← plugin metadata
        ├── manifest.json            ← skill registry (MUST be updated)
        └── skills/
            ├── docx/SKILL.md        ← existing Anthropic skills
            ├── pdf/SKILL.md
            └── exo-brain/SKILL.md   ← our skills go here
```

**Find the plugin root** by searching for `manifest.json` inside the `skills-plugin` directory:

```bash
# macOS
find ~/Library/Application\ Support/Claude/local-agent-mode-sessions/skills-plugin -name "manifest.json" -maxdepth 4 2>/dev/null
```

Store the directory containing `manifest.json` as `PLUGIN_ROOT`.

**If not found:** Tell the user:
> "I can't find the Claude Desktop plugin directory. Skills were installed for Claude Code only. To install for Desktop/Cowork, re-run this installer from Cowork mode where the `.skill` packaging method is available."

#### 5b.2 — Write SKILL.md files to the plugin

For each of the 6 skills, create the directory and write the **exact same SKILL.md** generated in Step 4:

```bash
PLUGIN_SKILLS="{{PLUGIN_ROOT}}/skills"
mkdir -p "$PLUGIN_SKILLS/exo-brain"
mkdir -p "$PLUGIN_SKILLS/exo-brain-sessions"
mkdir -p "$PLUGIN_SKILLS/exo-brain-roles"
mkdir -p "$PLUGIN_SKILLS/exo-brain-knowledge"
mkdir -p "$PLUGIN_SKILLS/exo-brain-tasks"
mkdir -p "$PLUGIN_SKILLS/exo-brain-capture"
```

Write the same SKILL.md content to each directory.

#### 5b.3 — Update manifest.json

Read the existing `{{PLUGIN_ROOT}}/manifest.json`. For each of the 6 exo-brAIn skills, add or update an entry in the `skills` array:

```json
{
  "skillId": "exo-brain",
  "name": "exo-brain",
  "description": "[same description from the SKILL.md frontmatter]",
  "creatorType": "user",
  "updatedAt": "[current ISO 8601 timestamp]",
  "enabled": true
}
```

**Important rules:**
- **Preserve all existing skills** in the manifest. Only add/update exo-brAIn entries.
- If an exo-brAIn skill already exists, **replace it** rather than duplicating.
- Update `lastUpdated` at the root level to the current timestamp in milliseconds.

---

## Step 6 — Verify

### Claude Code verification
```bash
ls ~/.claude/skills/ | grep exo-brain
```
Expected: 6 directories.

Check one SKILL.md has actual spec content (not just a reference):
```bash
wc -l ~/.claude/skills/exo-brain-sessions/SKILL.md
```
Should be significantly more than 20 lines (the embedded specs add substantial content).

### Claude Desktop verification (if Step 5 was executed)

**If Option A was used:** Ask the user to confirm they clicked "Copy to your skills" on all 6 files and restarted Claude Desktop. Then verify by typing `/exo-brain` in a new conversation — it should appear as an autocomplete option.

**If Option B was used:**
```bash
ls "{{PLUGIN_ROOT}}/skills/" | grep exo-brain
```
Expected: 6 directories.

Verify manifest was updated:
```bash
grep -c "exo-brain" "{{PLUGIN_ROOT}}/manifest.json"
```
Expected: at least 6 matches (one per skill entry).

---

## Step 7 — Report

```
✅ exo-brAIn skills installed (embedded mode)

Claude Code (CLI + Desktop Code tab):
📂 ~/.claude/skills/
🧩 6 skills installed

Claude Desktop (Chat + Cowork):
🧩 6 .skill files presented for installation (Option A)
   — or —
📂 {{PLUGIN_ROOT}}/skills/ (Option B)

Skills: exo-brain, exo-brain-sessions, exo-brain-roles,
  exo-brain-knowledge, exo-brain-tasks, exo-brain-capture
⚡ Specs embedded — no vault roundtrip needed at runtime
🔄 To update after spec changes: re-run this installer
```

If Step 5 was skipped:
```
✅ exo-brAIn skills installed (embedded mode, Code only)
📂 Location: ~/.claude/skills/
🧩 6 skills: exo-brain, exo-brain-sessions, exo-brain-roles,
   exo-brain-knowledge, exo-brain-tasks, exo-brain-capture
⚡ Specs embedded — no vault roundtrip needed at runtime
ℹ️ Claude Desktop not detected — skills available in Code mode only.
   To install for Desktop/Cowork, re-run this installer from Cowork.
🔄 To update after spec changes: re-run this installer
```

---

## Appendix — Updating Skills

When a skill-spec in `_system/skill-specs/` is modified, the installed skills become stale. To update:

1. Tell the AI: "Re-install exo-brain skills" or "Update exo-brain skills"
2. The AI re-reads this spec and re-runs Steps 2-7
3. All SKILL.md files are regenerated with fresh content in both targets

This can also be triggered from the quickstart flow (Step 5c) during initial setup.

## Appendix — Uninstalling Skills

To remove exo-brAIn skills from all targets:

**Claude Code:**
```bash
rm -rf ~/.claude/skills/exo-brain*
```

**Claude Desktop (if installed via Option A — .skill files):**
Open Claude Desktop → Settings → Skills → Remove each `exo-brain-*` skill.

**Claude Desktop (if installed via Option B — plugin directory):**
```bash
rm -rf "{{PLUGIN_ROOT}}/skills/exo-brain"*
```
Then remove the 6 exo-brAIn entries from `{{PLUGIN_ROOT}}/manifest.json` (preserve other skills) and update `lastUpdated`.
