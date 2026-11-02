---
skill: task-define
audience: ai
version: 3
last_updated: 2026-11-02
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

5. **Regenerate the task indexes** following [Task indexes](#task-indexes) below. The active index includes `pending` **and** `in-progress` tasks.

6. **Confirm**: "Task '{{title}}' created. Due: {{due or 'no date'}}. Linked to: {{area or 'none'}}."

## Task lifecycle

```
pending → in-progress → done
                      → cancelled
```

- `pending`: defined but not started
- `in-progress`: actively being worked on
- `done`: completed — listed in `_index-done.md`
- `cancelled`: abandoned — listed in `_index-done.md`

A task's index is decided **only** by its `status`: `pending` / `in-progress` → `_index-pending.md`; `done` / `cancelled` → `_index-done.md`. Every task file appears in exactly one index.

## Completing or cancelling a task

1. Update its frontmatter: `status: done` (or `cancelled`) and `completed: YYYY-MM-DD` (closing date, also for cancelled). If `completed` already exists, overwrite it — never add a second one
2. If cancelled, append the reason to the work log: `- YYYY-MM-DD — Cancelled: {{reason}}`
3. Regenerate **both** indexes following [Task indexes](#task-indexes). Do not add or remove rows by hand — that is what produces duplicates and orphans

## Task frontmatter rules

- **Lifecycle keys** — `status`, `created`, `due`, `area`, `backlog_source`, `completed` — are **top-level** (no indentation) and hold a single scalar: a string, a date, or `null` (unquoted; treat `"null"` or an empty value as null). `backlog_source` is a slug string, never a block
- Key order: `audience`, `doc_type`, `status`, `created`, `due`, `area`, `backlog_source`, then `completed` when closed. Other keys (e.g. `tags`, `priority`) are allowed after these
- Valid `status`: `pending` | `in-progress` | `done` | `cancelled`
- **Repair during regeneration:** if a lifecycle key ended up nested inside another value (e.g. a `completed: YYYY-MM-DD` line inside a `due: |-` block), move it back to top level and restore the parent value (`due: YYYY-MM-DD` or `null`). This is a structural fix only: never change or invent values, and report each repaired file to the user

## Task indexes

Both indexes are **always regenerated in full** from the frontmatter of every `_tasks/*.md` file (excluding the `_index-*.md` files). Never edit or patch individual rows.

Each row links as `[[_tasks/<filename without .md>\|<H1 title>]]`. ⚠️ Inside tables the alias pipe must be escaped as `\|`, or Obsidian breaks the table. `Area` shows `—` when `area` is null. Headers and boilerplate stay in English.

**`_tasks/_index-pending.md`** — active tasks: `status` is `pending` or `in-progress`. Sorted by `created` ascending, then filename.

```markdown
---
audience: ai
doc_type: index
auto_generated: true
last_updated: YYYY-MM-DD
---

# Active Tasks

Includes `pending` and `in-progress` tasks. Sorted by created date asc.

| Task | Status | Created | Due | Area |
|------|--------|---------|-----|------|
| [[_tasks/2026-01-10-example\|Example task]] | **in-progress** | 2026-01-10 | — | knowledge/example |
```

- `Status`: `pending`, or `**in-progress**` (bold). `Due`: date or `—`
- No active tasks → instead of the table: `_No active tasks. Use the task-define skill to create one._`

**`_tasks/_index-done.md`** — closed tasks: `status` is `done` or `cancelled`. Sorted by `completed` descending, then filename; tasks without `completed` go last.

```markdown
---
audience: ai
doc_type: index
auto_generated: true
last_updated: YYYY-MM-DD
---

# Completed Tasks

Includes `done` and `cancelled` tasks. Sorted by completed date desc.

| Task | Status | Completed | Area |
|------|--------|-----------|------|
| [[_tasks/2026-01-05-example\|Example task]] | done | 2026-01-12 | — |
```

- `Completed`: the date, or `⚠️ missing` when the task has no `completed` field — flag it to the user, never invent a date
- No closed tasks → instead of the table: `_No completed tasks yet._`

**Self-check after regenerating:** rows across both tables = number of task files, and no filename appears twice. If not, regenerate both from scratch.

## Notes

- Tasks should be scoped small enough to complete in 1-3 sessions
- If a task is too large, split it into multiple tasks
- The work log section is appended to during execution sessions — it's the history of what was done
- Context files help the agent load the right information when the user says "let's work on task X"
