---
skill: task-list
audience: ai
version: 1
last_updated: 2026-03-26
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
4. Regenerate `_tasks/_index-pending.md`
5. Begin work session

## Notes

- The briefing should be concise — not a wall of text
- If no calendar MCP is available, skip that section silently
- If no captures exist for today, skip that section
- If no tasks exist, say so and suggest checking the backlog
