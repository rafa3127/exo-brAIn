---
name: exo-brain-knowledge
description: >
  Manages knowledge areas and documentation in the exo-brAIn vault. Trigger when
  the user wants to: create a knowledge area ("create an area", "new project
  for...", "start a study area"), or update documentation ("log this decision",
  "update the architecture", "mark as done", "update doc").
---

# exo-brAIn — Knowledge

## Vault location

The vault root is the folder containing `CLAUDE.md` and `_system/skill-specs/`. All paths below are relative to it. Resolve it in this order:

1. The current working directory (Claude Code) or the folder mounted in this Cowork session, if it contains `CLAUDE.md`.
2. No filesystem access (e.g. Chat): use the Obsidian MCP tools below — their paths are already vault-relative.
3. Still nothing: ask the user where the vault is.

## Configuration

Read `_system/config.json`. It is gitignored, so it is **absent in cloud sessions** (`CLAUDE_CODE_REMOTE=true`) and in remote modes (`EXO_BRAIN_MODE` set). In that case the vault **is configured**: use the defaults from `_system/config.template.json` for paths and conventions, and **never** run the quickstart.

## Sync check

On the **first** use of any exo-brain skill in a session, make sure the vault is up to date before reading it:

1. If the session context already contains a line `exo-brain sync: …` (from the SessionStart hook), use that status.
2. Otherwise, if you have a shell and the vault is a git repo (and not `CLAUDE_CODE_REMOTE=true`): run `node _system/scripts/sync-check.mjs` from the vault root and use its output line.
3. No shell or no git (e.g. Chat via MCP): skip silently.

If the status is `FAILED: <reason>`: tell the user the reason and ask whether to continue without the latest changes. **Do not continue until they answer.** `up-to-date`, `pulled N commits` and `skipped (…)` need no action (mention pulled commits briefly).

## Conventions
- Boilerplate: English. Session content: user's language.
- Temporal files: YYYY-MM-DD-slug.md
- Frontmatter audience: ai · human · shared
- _index.md files are auto-generated — never edit manually
- Cross-references in body: Obsidian [[wikilinks]]; inside tables escape the pipe: [[path\|alias]]
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

## Area Create

---
skill: area-create
audience: ai
version: 2
last_updated: 2026-03-31
---

# Skill: area-create

## Purpose

Create a new knowledge area with the correct structure for its type. Knowledge areas are NEVER created manually — always via this skill.

## When to use

- "create an area for...", "new project...", "start a course on..."
- "I need to organize notes about [topic]"
- When referencing an area that doesn't exist yet

## Area types

| Type | Use case | Example |
|------|----------|---------|
| `project` | Professional work, deliverables, codebases | Client Portal, ML Pipeline, Budget Tracker |
| `study` | Academic courses, training, certifications | University course, online master's |
| `knowledge` | Thematic knowledge base (zettelkasten) | TypeScript, databases, architecture |
| `personal` | Personal projects, hobbies, side work | Side project, language learning |

## Classifying folders

Area paths MUST start with a classifying folder. Never create areas at the vault root.

### Predefined folders

| Folder | Purpose |
|--------|---------|
| `work/` | Professional, remunerated projects — clients, contracts, paid engagements |
| `project/` | Personal (non-remunerated) projects — open source, side projects, own tools |
| `knowledge/` | Reusable, topic-agnostic reference — useful across multiple projects |
| `university/` | Academic — courses, certifications, formal training |

Users may create additional classifying folders as needed. When the area doesn't fit a predefined folder, ask the user where to place it.

### Decision rules

Before creating an area, apply these checks in order:

1. **Is it specific to a paid project or client?** → `work/[project]/` (as area or sub-area)
2. **Is it a personal project with deliverables?** → `project/[name]/`
3. **Is it generic, reusable knowledge — useful across projects?** → `knowledge/[topic]/`
4. **Is it academic coursework or formal study?** → `university/[course]/`
5. **None of the above?** → ask the user which folder fits best

### Antipattern: project-specific content in knowledge/

If the content only makes sense within one project (e.g., a client's business processes, a specific company's operational context, a project's internal architecture), it is NOT `knowledge/` — it belongs as a sub-area or document within that project's folder.

**Wrong:** `knowledge/acme-operations` (specific to one client)
**Right:** `work/acme-corp/operations` (sub-area within the project)

**Test:** "Would this be useful to someone who has never heard of [project]?" If no → it's project-specific, not knowledge.

## Procedure

1. Gather from user:
   - `name`: area name
   - `type`: project · study · knowledge · personal
   - `path`: vault path — must start with a classifying folder (e.g., `work/client-portal`, `knowledge/typescript`)
   - `description`: 1-2 sentences
   - `crosscutting` (optional): knowledge areas available for consultation from this area
   - `default_role` (optional): role alias to auto-load on boot
   - `audience`: ai · human · shared (default: shared)

2. Validate the path doesn't already exist

3. Read template from `_system/templates/[type].md`

4. Create directory structure:

**project:**
```
[path]/
├── _index.md
├── architecture.md
├── decisions/          (created when first decision is logged)
└── logs/               (created when first log is written)
```

**study:**
```
[path]/
├── _index.md
├── resources.md
└── notes/              (created when first note is written)
```

**knowledge:**
```
[path]/
├── _index.md
└── (atomic notes, no subdirectories)
```

**personal:**
```
[path]/
├── _index.md
├── tasks.md
└── ideas.md
```

5. Fill `_index.md` from template with user-provided data. Set `context_boot` by type:
   - project: `[_index.md, architecture.md]`
   - study: `[_index.md, resources.md]`
   - knowledge: `[_index.md]`
   - personal: `[_index.md, tasks.md]`

6. Confirm: "Area [name] created at [path] as [type]"

## _index.md frontmatter

```yaml
---
type: [type]
name: [name]
status: active
audience: [audience]
default_role: [alias or null]
crosscutting:
  - [declared paths]
context_boot:
  - [files to load on session start]
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
---
```

## Notes

- Empty directories don't show in Obsidian. Create subdirectories only when the first file goes in.
- Sub-areas (e.g., `work/client-portal/auth-module`) use this same skill with the full path.
- The structure is a starting point. Skills like `update-doc` can create additional files as needed.
- Use sub-areas when a project has distinct domains with their own document sets. For simple groupings, a subfolder within the project structure is enough.

---

## Update Doc

---
skill: update-doc
audience: ai
version: 5
last_updated: 2026-11-02
---

# Skill: update-doc

## Purpose

Update existing documentation using the correct pattern for each document type. Maintains audit trails when needed and handles unknown types gracefully.

## When to use

- "log this decision", "update the architecture doc"
- "mark item X as done", "add this to the checklist"
- After a technical discussion where a decision was made
- When new information needs to persist

## Update patterns by `doc_type`

### `decision`
- **Pattern**: Append chronological entry
- **Location**: `[area]/decisions/YYYY-MM-DD-slug.md`
- **Template**:
```yaml
---
audience: shared
doc_type: decision
date: YYYY-MM-DD
status: accepted | superseded | deprecated
area: [area path]
---

## Context
[Why this decision came up — 2-3 sentences]

## Decision
[What was decided — clear and concrete]

## Alternatives considered
- [Option A]: discarded because [reason]

## Consequences
- [What changes from now on]
```

### `log`
- **Pattern**: Append chronological, never edit past entries
- **Use**: append operation, never replace

### `checklist`
- **Pattern**: Toggle items `[ ]` ↔ `[x]`, add new items at end
- **Use**: patch by heading target

### `architecture`
- **Pattern**: Replace section + changelog entry
- **Steps**:
  1. Read current file
  2. Replace affected section
  3. Append to `## Changelog`: `- YYYY-MM-DD: [what changed and why]`
- **Never** delete sections without leaving a record

### `instruction`
- **Pattern**: Full replace + version bump
- **Steps**: Increment `version`, update `last_updated`, replace content

### `index`
- **Pattern**: Auto-regenerate entirely from directory contents
- **Never** edit `_index.md` manually — always regenerate
- ⚠️ Wikilinks inside markdown tables: always escape the alias pipe as `\|` → `[[path\|display name]]`. Unescaped `|` breaks Obsidian table rendering.

### `backlog-item`
- **Pattern**: Replace content + update status in frontmatter
- **Status values**: `raw` → `exploring` → `defined` → `discarded`
- **On define**: add `promoted_to: _tasks/YYYY-MM-DD-slug` to frontmatter
- **On discard**: add `discarded_reason` line

### `task`
- **Pattern**: Append to work log + update status in frontmatter
- **Status values**: `pending` → `in-progress` → `done` / `cancelled`
- **On complete / cancel**: follow **Completing or cancelling a task** in `task-define` (set `status` + `completed: YYYY-MM-DD`, then regenerate both task indexes; never move rows by hand)
- **On any status change** (e.g. → `in-progress`): regenerate both task indexes per `task-define`; `in-progress` tasks stay in `_index-pending.md`

### `note`
- **Pattern**: Flexible — append, edit, or replace as needed
- **This is the catch-all**: unknown or missing `doc_type` defaults to `note`

## Updating area `_index.md`

After significant area changes, update its `_index.md`:
1. `## Current state` → reflect new state
2. `## Next steps` → update pending items
3. `last_updated` in frontmatter → current date

## Graceful degradation

Unrecognized `doc_type`:
- Treat as `note` (generic append)
- Inform user: "This document type doesn't have a specific pattern — used generic append"
- Never fail

## Cross-referencing

When generating or updating user content (tasks, backlog items, captures, area docs), use Obsidian `[[wikilinks]]` in the **document body** to link related files:
- Tasks → `[[knowledge/typescript]]`, `[[_backlog/idea-slug]]`
- Backlog items → `[[_captures/2026-03-26]]`
- Captures → `[[_backlog/idea-slug]]` when promoting to backlog

**Frontmatter values remain plain strings** (e.g., `area: knowledge/typescript`, not `area: [[knowledge/typescript]]`). Wikilinks are for human navigation in Obsidian; frontmatter is for programmatic access.

**Skill-specs never use wikilinks** — they reference files by path for portability.

## Notes

- Always read a file before editing to avoid overwriting recent changes
- For `audience: ai` files, optimize content for token efficiency
- For `audience: human` files, maintain readability
- When unsure where to save something, ask the user
