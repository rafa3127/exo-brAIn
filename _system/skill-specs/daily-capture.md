---
skill: daily-capture
audience: ai
version: 1
last_updated: 2026-03-26
depends_on: []
---

# Skill: daily-capture

## Purpose

Quickly append ideas, notes, or reminders to today's daily capture file. Captures are append-only, timestamped entries in a single file per day.

## When to use

- "anota esto", "nota rapida", "apunta que..."
- "idea:", "recordatorio:", "pin this"
- Any quick thought the user wants to persist without creating a full document
- Voice transcriptions that need to be saved

## Procedure

1. **Determine today's file**: `_captures/YYYY-MM-DD.md` using current date

2. **If file does not exist**, create it with:
```markdown
---
audience: shared
doc_type: log
date: YYYY-MM-DD
---

# Captures — YYYY-MM-DD
```

3. **Append entry** at the end of the file:
```markdown

**HH:MM** — {{content}}
```

4. **Tagging** (optional): if the user's input suggests a category, add inline tags:
   - Task-like → append `#task`
   - Idea → append `#idea`
   - Follow-up needed → append `#followup`
   - Only tag if clearly applicable. When in doubt, don't tag.

5. **If user says "send to backlog"** or similar after capturing, chain to `backlog-add` skill with the captured content.

6. **Confirm** briefly: "Captured." — no verbose confirmation needed.

## Notes

- Never edit past entries — append only
- No `_index.md` for captures — file date is the index
- Keep entries short. The user is capturing, not writing documentation
- If the user provides multiple items at once, create one entry per item with the same timestamp
