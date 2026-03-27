---
skill: task-define
audience: ai
version: 1
last_updated: 2026-03-26
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

5. **Update `_tasks/_index-pending.md`**: regenerate from directory contents (pending tasks only)

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
3. Add to `_tasks/_index-done.md`

## Notes

- Tasks should be scoped small enough to complete in 1-3 sessions
- If a task is too large, split it into multiple tasks
- The work log section is appended to during execution sessions — it's the history of what was done
- Context files help the agent load the right information when the user says "let's work on task X"
