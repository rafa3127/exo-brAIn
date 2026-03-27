---
skill: backlog-review
audience: ai
version: 1
last_updated: 2026-03-26
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

4. **After any status change**: update the item's frontmatter and regenerate `_backlog/_index.md`

5. **If backlog is empty**: inform user and suggest checking `_captures/` for ideas that could be promoted

## Notes

- Keep the review conversational — this is a brainstorming/triage session, not a formal process
- If an item has been `raw` for a long time, gently flag it: "This has been in backlog since X — still relevant?"
- Never auto-discard items. The user always decides.
