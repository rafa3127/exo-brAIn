---
skill: backlog-add
audience: ai
version: 1
last_updated: 2026-03-26
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

4. **Update `_backlog/_index.md`**: regenerate from directory contents (see index format below)

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
