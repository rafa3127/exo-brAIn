---
name: exo-brain
description: >
  Manages an AI-assisted exo-brAIn (external brain) in Obsidian. Trigger this skill whenever
  the user wants to: start or end a work/study session ("let's work on...", "boot session",
  "close session", "wrap up"), manage AI roles or personas ("create a role", "switch role",
  "act as...", "what roles do I have"), create or navigate knowledge areas ("create an area",
  "new project for...", "start a study area"), load or search vault content ("find notes about...",
  "check the architecture doc", "load context for..."), update documentation ("log this decision",
  "update the architecture", "mark as done"), or set up a new exo-brAIn ("quickstart",
  "initialize vault", "set up obsidian"). Also triggers when the user references Obsidian,
  their vault, their notes, "exo-brain", or "second brain" in any context. This skill reads
  procedures from the vault's _system/skill-specs/ directory and follows them step by step.
---

# exo-brAIn

This skill connects claude.ai to an Obsidian vault acting as a persistent external brain. All procedures live in the vault itself as portable markdown specs.

## How it works

1. Read skill-spec files from `_system/skill-specs/` in the user's Obsidian vault via MCP
2. Follow the procedure described in each spec
3. The vault is the source of truth — specs evolve and you always read the latest version

## Quick Reference — Which spec to read

| User intent | Read this spec |
|-------------|----------------|
| First-time setup, "quickstart" | `_system/quickstart.md` |
| "Let's work on...", start session | `_system/skill-specs/session-boot.md` |
| "Close session", "wrap up" | `_system/skill-specs/session-end.md` |
| "What roles do I have?", list roles | `_system/skill-specs/role-load.md` |
| "Act as...", load a role | `_system/skill-specs/role-load.md` |
| "Create a role", "new persona" | `_system/skill-specs/role-save.md` |
| "Edit role", "add cross-cutting to role" | `_system/skill-specs/role-save.md` |
| "Create area", "new project" | `_system/skill-specs/area-create.md` |
| "Find notes about...", search vault | `_system/skill-specs/load-context.md` |
| "Check the [doc]", load a file | `_system/skill-specs/load-context.md` |
| "Log decision", "update architecture" | `_system/skill-specs/update-doc.md` |
| "What skills are available?" | `_system/skill-specs/README.md` |

## Boot sequence

At the start of ANY conversation where this skill triggers:

1. Read `_system/config.json` from the vault
2. If `vault.name` is `"VAULT_NAME"` → new vault, read and follow `_system/quickstart.md`
3. Otherwise → vault is configured, proceed based on user intent

## Key vault operations (MCP)

- `obsidian_get_file_contents(filepath)` — read a file
- `obsidian_append_content(filepath, content)` — create or append
- `obsidian_patch_content(filepath, target, content, operation)` — edit sections
- `obsidian_simple_search(query)` — search vault
- `obsidian_list_files_in_dir(dirpath)` — list directory
- `obsidian_delete_file(filepath)` — delete (with confirmation)

If MCP is not connected or Obsidian is not running:
> "I can't reach your Obsidian vault. Make sure Obsidian is open and the Local REST API plugin is active."

## Conventions

- Boilerplate: English. Session content: user's language.
- Temporal files: `YYYY-MM-DD-slug.md`
- Frontmatter `audience`: `ai` · `human` · `shared`
- `_index.md` files are auto-generated — never edit manually
- Knowledge areas created only via `area-create` spec

## Important

- Always read the full skill-spec BEFORE performing an operation
- Skill-specs may have been updated — always read the latest version
- When the spec says "ask the user", ask. When it says "confirm", confirm.
