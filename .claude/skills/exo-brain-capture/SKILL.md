---
name: exo-brain-capture
description: >
  Quick note capture in the exo-brAIn vault. Trigger when the user wants to:
  capture a quick thought ("capture this", "quick note", "jot this down"), add
  to today's daily note ("daily note", "add to today's notes"), or save a
  fleeting idea without full task or backlog formality.
---

# exo-brAIn — Capture

## Vault location

The vault root is the folder containing `CLAUDE.md` and `_system/skill-specs/`. All paths below are relative to it. Resolve it in this order:

1. The current working directory (Claude Code) or the folder mounted in this Cowork session, if it contains `CLAUDE.md`.
2. No filesystem access (e.g. Chat): use the Obsidian MCP tools below — their paths are already vault-relative.
3. Still nothing: ask the user where the vault is.

## Configuration

Read `_system/config.json`. It is gitignored, so it is **absent in cloud sessions** (`CLAUDE_CODE_REMOTE=true`) and in remote modes (`EXO_BRAIN_MODE` set). In that case the vault **is configured**: use the defaults from `_system/config.template.json` for paths and conventions, and **never** run the quickstart.

## Sync check

On the **first** use of any exo-brain skill in a session, make sure the vault is up to date before reading it:

1. If the session context already contains a line `exo-brain sync: …` (from the SessionStart hook), use that status.
2. Otherwise, if you have a shell and the vault is a git repo (and not `CLAUDE_CODE_REMOTE=true`): run `node _system/scripts/sync-check.mjs` from the vault root and use its output line.
3. No shell or no git (e.g. Chat via MCP): skip silently.

If the status is `FAILED: <reason>`: tell the user the reason and ask whether to continue without the latest changes. **Do not continue until they answer.** `up-to-date`, `pulled N commits` and `skipped (…)` need no action (mention pulled commits briefly).

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

## Daily Capture

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
