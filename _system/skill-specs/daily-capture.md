---
skill: daily-capture
audience: ai
version: 2
last_updated: 2026-11-03
depends_on: []
---

# Skill: daily-capture

## Purpose

Quickly append ideas, notes, or reminders to today's daily capture file. Captures are timestamped entries in a single file per day. They are append-only, except for the conversion mark added when an entry is resolved.

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

## Conversion marks

When a capture is resolved, add a mark at the very end of its line, after any tags, so nobody has to re-read it or search the vault to find out what happened to it.

| Mark | Meaning |
|------|---------|
| `→ [[path/to/destination]]` | Became a task, backlog item, knowledge note or area. Several destinations: `→ [[a]], [[b]]` |
| `→ done` | Already resolved, with no destination file |
| `→ discarded` | Decided not to pursue |

An optional `(YYYY-MM-DD)` may follow the mark. The markers themselves stay in English because agents parse them.

Only the **end of the line** counts: entries often contain `→` in their text (`Caracas → CDMX`). To list the entries still unresolved in a file, without opening any destination:

```bash
grep -E '^\*\*' _captures/YYYY-MM-DD.md | grep -vE '→ (\[\[.*\]\]|done|discarded)( \([0-9-]+\))?\s*$'
```

## Notes

- Never edit past entries, except to add a conversion mark at the end of the line
- No `_index.md` for captures — file date is the index
- Keep entries short. The user is capturing, not writing documentation
- If the user provides multiple items at once, create one entry per item with the same timestamp
