---
skill: session-end
audience: ai
version: 1
last_updated: 2026-03-23
depends_on: [update-doc]
---

# Skill: session-end

## Purpose

Close a working session by indexing what was learned, done, and left pending. Generates a session log and updates the area's state.

## When to use

- "close session", "we're done for today", "save progress"
- User indicates they're switching areas or wrapping up
- Before ending a long conversation where work was done on an area

## Procedure

### Step 1: Analyze the session

Review the conversation and extract:

1. **Summary**: What was done? (2-3 sentences max)
2. **Decisions**: List of decisions made (if any)
3. **Changes**: Files created, edited, or deleted during session
4. **Learnings**: New knowledge discovered (patterns, bugs, insights)
5. **Next steps**: What's pending for the next session
6. **Blockers** (if any): What couldn't be resolved and why

### Step 2: Generate session log

Create file at `_system/sessions/YYYY-MM-DD-HHmm-[slug].md`:

```yaml
---
date: YYYY-MM-DDTHH:MM
area: [area path]
role: [role alias or null]
audience: ai
doc_type: log
tags: [relevant tags]
---

## Summary
[2-3 sentences]

## Decisions
- [decision 1]: [reason]
(or "No formal decisions this session")

## Changes
- Created: [file]
- Edited: [file] — [what changed]
(or "No file changes")

## Learnings
- [insight 1]
(or "No new learnings")

## Next steps
- [ ] [task 1]
- [ ] [task 2]

## Blockers
- [blocker and context]
(or "No blockers")
```

### Step 3: Update the area

1. Read `[area]/_index.md`
2. Update `## Current state` with where we left off
3. Replace `## Next steps` with new pending items
4. Update `last_updated` in frontmatter

### Step 4: Create decision logs (if applicable)

For significant decisions (architecture, technology, strategy):
- Create individual files in `[area]/decisions/` using `update-doc` decision pattern
- Skip micro-decisions

### Step 5: Confirm to user

```
✅ Session closed
📝 Log: _system/sessions/[filename]
📊 Area updated: [area name]
📋 [N] next steps registered
```

## Detail calibration

| Session type | Summary | Decisions | Learnings |
|--------------|---------|-----------|-----------|
| Deep technical work | Detailed | All | Patterns, bugs, insights |
| Study/reading | Brief | Few | Key concepts learned |
| Planning | Medium | Many | Perspective shifts |
| Quick fix / short task | Minimal | If any | Optional |

## Notes

- Session logs are `audience: ai` — optimized for AI re-reading efficiency
- Don't duplicate info already in area files (e.g., if architecture.md was updated, just note "Edited: architecture.md — new auth section")
- User can request "close without log" — in that case, only update `_index.md`
- Session slug should be descriptive: `2026-03-23-1530-prosight-auth-flow.md`, not `2026-03-23-session.md`
