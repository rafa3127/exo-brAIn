---
name: exo-brain-sessions
description: >
  Manages work and study sessions in the exo-brAIn vault. Trigger when the user
  wants to: start a session ("let's work on...", "boot session", "open session",
  "continue with..."), end a session ("close session", "wrap up", "done for
  today", "end session"), or load additional context mid-session ("find notes
  about...", "check the architecture doc", "load context for...", "bring in the
  [file]").
---

# exo-brAIn — Sessions

## Vault location

The vault root is the folder containing `CLAUDE.md` and `_system/skill-specs/`. All paths below are relative to it. Resolve it in this order:

1. The current working directory (Claude Code) or the folder mounted in this Cowork session, if it contains `CLAUDE.md`.
2. No filesystem access (e.g. Chat): use the Obsidian MCP tools below — their paths are already vault-relative.
3. Still nothing: ask the user where the vault is.

## Conventions
- Boilerplate: English. Session content: user's language.
- Temporal files: YYYY-MM-DD-slug.md
- Frontmatter audience: ai · human · shared
- _index.md files are auto-generated — never edit manually
- Cross-references in body: Obsidian [[wikilinks]]; inside tables escape the pipe: [[path\|alias]]
- Always read the full procedure BEFORE executing

## MCP Operations (if available)
- obsidian_get_file_contents(filepath) — read
- obsidian_append_content(filepath, content) — create/append
- obsidian_patch_content(filepath, target, content, operation) — edit
- obsidian_simple_search(query) — search
- obsidian_list_files_in_dir(dirpath) — list
- obsidian_delete_file(filepath) — delete

If MCP is not available, use direct file access at the vault root.

---

## Session Boot

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

1. From the user's message, identify the area path (e.g., "my portal" → `work/client-portal`)
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

---

## Session End

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
- Session slug should be descriptive: `2026-03-23-1530-api-auth-flow.md`, not `2026-03-23-session.md`

---

## Load Context

---
skill: load-context
audience: ai
version: 1
last_updated: 2026-03-23
---

# Skill: load-context

## Purpose

Load a specific file from the vault on demand during an active session. This is the dynamic loading mechanism — bring in only what's needed, when it's needed.

## When to use

- AI needs info not loaded during boot
- User references a file or topic: "check the auth decision", "what does architecture.md say?"
- Cross-cutting area consultation: "how do we handle errors in the TS knowledge base?"
- Exploratory search: "do we have anything about rate limiting?"

## Procedure

### Direct mode (known path)

1. Receive file path (relative to vault root)
2. Read the file
3. Apply audience compression:
   - `audience: ai` → return as-is
   - `audience: human/shared` → extract key info:
     - Preserve: code, configs, technical data, dates, names, decisions with rationale
     - Compress: long explanations → 1 sentence, decorative lists → key items only
     - Omit: greetings, disclaimers, redundancy, padding
     - Never omit: warnings, breaking changes, dependencies, constraints
4. Present relevant content to current context

### Search mode (keyword)

1. Execute vault search with the query
2. Filter results:
   - Prioritize files in the active area
   - Then files in declared cross-cutting areas
   - Deprioritize out-of-scope results (unless highly relevant)
3. Present results to user (title + snippet)
4. If user selects one, load it (direct mode)

### Cross-cutting mode

1. For cross-cutting area queries:
   - First read that area's `_index.md` only (lightweight summary)
   - If more depth needed, load specific files from that area
2. Never load an entire cross-cutting area — only what's punctually needed

## Notes

- This is the workhorse skill. It gets used many times per session, often implicitly.
- Track what's been loaded to avoid re-reading files already in context.
- For large files (>3000 estimated tokens), load by section and ask if more is needed.
