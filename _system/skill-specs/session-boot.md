---
skill: session-boot
audience: ai
version: 1
last_updated: 2026-03-23
depends_on: [role-load, load-context]
---

# Skill: session-boot

## Purpose

Start a working session by loading minimal context: knowledge area, role, and boot files. This is the standard entry point for any session.

## When to use

- User indicates what to work on: "let's work on...", "study session for...", "continue with..."
- "boot [area]", "start session on [area]"

## Procedure

### Step 1: Identify the area

1. From the user's message, identify the area path (e.g., "prosight" → `work/prosight-ui`)
2. If ambiguous, search the vault and present options
3. If area doesn't exist, suggest creating it with `area-create`

### Step 2: Load manifest

1. Read `[area]/_index.md`
2. From frontmatter extract:
   - `type` → area type
   - `status` → warn if `archived` or `paused`
   - `default_role` → role to load
   - `crosscutting` → areas available for consultation
   - `context_boot` → files to load
3. From body extract:
   - `## Current state` → where we left off
   - `## Next steps` → what's pending

### Step 3: Load boot files

1. For each file in `context_boot`:
   - Resolve relative paths against the area path
   - Read the file
   - If file doesn't exist, skip with warning (don't fail)
2. Compress content:
   - `audience: ai` → load as-is (already optimized)
   - `audience: human/shared` → extract key info, skip decorative prose
3. Target total boot cost: **< 2000 tokens**

### Step 4: Load role

1. If `default_role` exists in manifest → execute `role-load` with that alias
2. If user specified a different role → use that instead
3. If no role → continue in generic mode
4. Merge cross-cutting: `area.crosscutting ∪ role.crosscutting` (deduplicated)

### Step 5: Confirm to user

Present a compact summary:

```
📂 Area: [name] ([type])
🎭 Role: [role name] (or "none")
📊 State: [1-line summary of current state]
📋 Pending: [summarized next steps]
📚 Cross-cutting: [available areas for consultation]
```

Ask: "What are we working on today?" or continue if already stated.

## Stale detection

If `last_updated` on `_index.md` is older than 30 days:
- Warn: "This area's context is [N] days old. Want me to check what may have changed?"
- Don't block — just inform.

## Notes

- Boot is **lazy**: only loads what's in `context_boot`. Everything else via `load-context`.
- If the vault is unreachable (Obsidian closed), inform user instead of failing silently.
- Boot is read-only — it creates no files.
