---
skill: update-doc
audience: ai
version: 1
last_updated: 2026-03-23
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

## Notes

- Always read a file before editing to avoid overwriting recent changes
- For `audience: ai` files, optimize content for token efficiency
- For `audience: human` files, maintain readability
- When unsure where to save something, ask the user
