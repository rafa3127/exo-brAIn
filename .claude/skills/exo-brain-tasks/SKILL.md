---
name: exo-brain-tasks
description: >
  Manages tasks and backlog in the exo-brAIn vault. Trigger when the user wants
  to: define a new task ("define task", "create task", "turn this into a task"),
  list pending tasks or get a daily briefing ("what's on my plate", "daily
  briefing", "show my tasks", "what should I work on"), add an idea to the
  backlog ("add to backlog", "save this idea for later"), or review and triage
  backlog items ("review backlog", "what's in the backlog", "triage ideas").
---

# exo-brAIn — Tasks

## Vault location

The vault root is the folder containing `CLAUDE.md` and `_system/skill-specs/`. All paths below are relative to it. Resolve it in this order:

1. The current working directory (Claude Code) or the folder mounted in this Cowork session, if it contains `CLAUDE.md`.
2. No filesystem access (e.g. Chat): use the Obsidian MCP tools below — their paths are already vault-relative.
3. Still nothing: ask the user where the vault is.

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

## Task Define

---
skill: task-define
audience: ai
version: 2
last_updated: 2026-03-31
depends_on: [backlog-add]
---

# Skill: task-define

## Purpose

Convert a backlog item (or a new idea) into a fully defined task with scope, date, and links to knowledge areas. Tasks are actionable — they have enough context for the agent to help execute them.

## When to use

- "define this task", "let's scope this out"
- "convert this backlog item to a task"
- "I want to work on X by Friday"
- When a backlog item reaches `defined` status

## Procedure

1. **Source the idea**:
   - If from backlog: read the backlog item file for context
   - If new: gather description from user

2. **Refine with user** — ask for (or infer):
   - `title`: clear, actionable name
   - `description`: what needs to be done (can be multi-paragraph)
   - `due` (optional): target date in YYYY-MM-DD
   - `area`: which vault area this relates to (e.g., `knowledge/typescript`)
   - `deliverables` (optional): what the output looks like
   - `context_files` (optional): files in the vault to load when working on this

3. **Create task file** at `_tasks/YYYY-MM-DD-{{slug}}.md` (date = creation date):
```yaml
---
audience: shared
doc_type: task
status: pending
created: YYYY-MM-DD
due: {{due or null}}
area: {{area path or null}}
backlog_source: {{backlog slug or null}}
---

# {{title}}

## Description

{{description}}

## Deliverables

{{deliverables or "To be defined during execution"}}

## Context files

{{list of files to load, or "None specified"}}

## Work log

_Entries added during execution sessions._
```

4. **If sourced from backlog**:
   - Update backlog item status to `defined`
   - Add `promoted_to: _tasks/YYYY-MM-DD-{{slug}}` to its frontmatter
   - Regenerate `_backlog/_index.md`

5. **Update `_tasks/_index-pending.md`**: regenerate from directory contents (pending tasks only). ⚠️ Wikilinks inside markdown tables: always escape the alias pipe as `\|` → `[[path\|display name]]`. Unescaped `|` breaks Obsidian table rendering.

6. **Confirm**: "Task '{{title}}' created. Due: {{due or 'no date'}}. Linked to: {{area or 'none'}}."

## Task lifecycle

```
pending → in-progress → done
                      → cancelled
```

- `pending`: defined but not started
- `in-progress`: actively being worked on
- `done`: completed — move from `_index-pending.md` to `_index-done.md`
- `cancelled`: abandoned — move from `_index-pending.md` to `_index-done.md`

## Completing a task

When a task is finished:
1. Update its frontmatter: `status: done`, add `completed: YYYY-MM-DD`
2. Remove from `_tasks/_index-pending.md`
3. Add to `_tasks/_index-done.md` (escape `|` in wikilinks as `\|` inside table cells)

## Notes

- Tasks should be scoped small enough to complete in 1-3 sessions
- If a task is too large, split it into multiple tasks
- The work log section is appended to during execution sessions — it's the history of what was done
- Context files help the agent load the right information when the user says "let's work on task X"

---

## Task List

---
skill: task-list
audience: ai
version: 2
last_updated: 2026-03-31
depends_on: [task-define]
---

# Skill: task-list

## Purpose

Show the user their current tasks, optionally combined with today's captures and calendar. This is the "what's on my plate" view.

## When to use

- "what tasks do I have", "my agenda", "what's pending"
- "what should I work on", "give me my day"
- At the start of a session when the user wants orientation
- "what did I do this week" (switches to done view)

## Procedure

### Pending tasks view (default)

1. **Read `_tasks/_index-pending.md`**
2. **Present as table**: title, status, due date, linked area
3. **Highlight overdue** tasks (due date < today)
4. **Sort by**: overdue first, then by due date (soonest first), then undated

### Done tasks view

1. **Read `_tasks/_index-done.md`**
2. **Present as table**: title, completed date, linked area
3. **If user asks for a date range**, filter by `completed` field

### "Give me my day" (combined briefing)

1. Read `_tasks/_index-pending.md` → pending tasks
2. Read `_captures/YYYY-MM-DD.md` (today) → today's captures (if exists)
3. Query calendar if available (Google Calendar via MCP) → today's events
4. Present combined briefing:

```
## Your day — YYYY-MM-DD

### Calendar
- 10:00 — Team standup
- 14:00 — Client call

### Pending tasks
| Task | Due | Area |
|------|-----|------|
| ... | ... | ... |

### Today's captures
- HH:MM — [capture content]
```

### Acting on a task

If user wants to work on a task:
1. Read the full task file
2. Load its `context_files` if specified
3. Update status to `in-progress`
4. Regenerate `_tasks/_index-pending.md` (escape `|` in wikilinks as `\|` inside table cells)
5. Begin work session

## Notes

- The briefing should be concise — not a wall of text
- If no calendar MCP is available, skip that section silently
- If no captures exist for today, skip that section
- If no tasks exist, say so and suggest checking the backlog

---

## Backlog Add

---
skill: backlog-add
audience: ai
version: 2
last_updated: 2026-03-31
depends_on: []
---

# Skill: backlog-add

## Purpose

Add an idea or rough concept to the backlog for future refinement. Backlog items are raw — they don't need dates, priorities, or full definitions yet.

## When to use

- "add to backlog", "save for later", "backlog this"
- "I want to explore this idea eventually"
- After a `daily-capture` when user says "send to backlog"
- When an idea comes up during a session but is out of scope

## Procedure

1. **Gather from user** (or infer from context):
   - `title`: short descriptive name for the idea
   - `description`: 1-3 sentences explaining the idea (can be rough)
   - `related_areas` (optional): vault areas this connects to

2. **Generate slug** from title: lowercase, hyphens, no spaces. Example: "RAG for client project" → `rag-for-client-project`

3. **Create file** at `_backlog/{{slug}}.md`:
```yaml
---
audience: shared
doc_type: backlog-item
status: raw
created: YYYY-MM-DD
source: {{where it came from — e.g., "capture/2026-03-26" or "session"}}
related_areas: []
---

# {{title}}

{{description}}
```

4. **Update `_backlog/_index.md`**: regenerate from directory contents. ⚠️ Wikilinks inside markdown tables: always escape the alias pipe as `\|` → `[[path\|display name]]`. Unescaped `|` breaks Obsidian table rendering.

5. **Confirm**: "Added '{{title}}' to backlog."

## Status values

- `raw` — just captured, not yet explored
- `exploring` — being discussed or refined
- `defined` — ready to become a task (use `task-define` skill)
- `discarded` — decided not to pursue (keep file for record)

## Notes

- Backlog items are intentionally lightweight — resist the urge to over-structure them
- If the user already has a clear definition with dates and scope, suggest using `task-define` directly instead
- Related areas are optional at creation — they get filled during refinement

---

## Backlog Review

---
skill: backlog-review
audience: ai
version: 2
last_updated: 2026-03-31
depends_on: [backlog-add]
---

# Skill: backlog-review

## Purpose

List and review backlog items. Helps the user decide which ideas to refine, discard, or promote to tasks.

## When to use

- "what's in my backlog", "review backlog", "show ideas"
- "what should I work on next"
- During planning sessions or weekly reviews
- When user wants to triage accumulated ideas

## Procedure

1. **Read `_backlog/_index.md`** to get the current list

2. **If user wants overview**: present a summary table:
   - Title, status, created date, related areas
   - Group by status: `raw` first, then `exploring`, then `defined`
   - Omit `discarded` unless user asks

3. **If user wants to act on an item**, offer options:
   - **Explore**: read the full file and discuss it → update status to `exploring`
   - **Define**: chain to `task-define` skill → moves item to `_tasks/`
   - **Discard**: update status to `discarded`, add a `discarded_reason` line

4. **After any status change**: update the item's frontmatter and regenerate `_backlog/_index.md` (escape `|` in wikilinks as `\|` inside table cells)

5. **If backlog is empty**: inform user and suggest checking `_captures/` for ideas that could be promoted

## Notes

- Keep the review conversational — this is a brainstorming/triage session, not a formal process
- If an item has been `raw` for a long time, gently flag it: "This has been in backlog since X — still relevant?"
- Never auto-discard items. The user always decides.
