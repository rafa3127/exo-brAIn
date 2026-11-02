---
name: exo-brain-roles
description: >
  Manages AI roles and personas in the exo-brAIn vault. Trigger when the user
  wants to: list available roles ("what roles do I have", "show roles"), load or
  switch a role ("act as...", "switch role", "load the [name] role"), create a
  new role ("create a role", "new persona"), or edit an existing role ("edit the
  [name] role", "add cross-cutting concern to role").
---

# exo-brAIn — Roles

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

## Role Load

---
skill: role-load
audience: ai
version: 1
last_updated: 2026-03-23
---

# Skill: role-load

## Purpose

Load an AI role/persona for the current session. Roles define behavior, tone, expertise, and cross-cutting knowledge areas.

## When to use

- User specifies a role: "act as...", "use the role...", "switch to..."
- User wants to see available roles: "what roles do I have?"
- Automatically from `session-boot` if the area has a `default_role`

## Procedure

### List mode (no argument)

1. Read `_system/roles/_index.md`
2. Present the roles table to the user
3. If empty, suggest creating a role with `role-save`
4. Expected cost: ~200 tokens

### Load mode (with alias)

1. Read `_system/roles/[alias].md`
2. If not found, inform user and show available list
3. Extract from frontmatter:
   - `name`, `alias`, `tags` — for reference
   - `crosscutting` — list of knowledge area paths available for consultation
4. Load the body as behavior instructions
5. If `crosscutting` has entries, register them as available for `load-context` — do NOT load them yet
6. Confirm: "Role [name] active. Cross-cutting knowledge available: [list]"

## Role file structure

```yaml
---
name: Descriptive Name
alias: short-slug
audience: ai
tags: [tag1, tag2]
crosscutting:
  - path/to/knowledge/area
  - another/path
version: 1
last_updated: YYYY-MM-DD
---

[Behavior instructions in prose. This content is incorporated
as context for the AI during the session.]
```

## Notes

- An active role persists for the entire session until changed or session ends
- Roles are **iterable** — they can be modified via `role-save` at any time
- Cross-cutting knowledge from the role is merged with the area's (no duplicates)

---

## Role Save

---
skill: role-save
audience: ai
version: 1
last_updated: 2026-03-23
---

# Skill: role-save

## Purpose

Create, edit, or iterate on roles. Roles are living documents — cross-cutting knowledge can be added later, instructions can be refined, behavior can evolve.

## When to use

- "create a role for...", "new role", "save this profile"
- "add X to my role...", "update the role..."
- "add cross-cutting knowledge of [area] to role [alias]"
- After creating a new area that should be cross-cutting to an existing role

## Procedure

### Create mode

1. Gather from user (ask for anything missing):
   - `name`: descriptive name
   - `alias`: short slug (kebab-case, no spaces, no accents)
   - `tags`: relevant categories
   - `crosscutting`: knowledge area paths (can be empty initially)
   - Behavior instructions (the body)
2. Validate alias doesn't exist (read `_system/roles/_index.md`)
3. Create `_system/roles/[alias].md` with frontmatter + body
4. Regenerate `_system/roles/_index.md` (see "Regenerate index")

### Edit mode

1. Read existing role: `_system/roles/[alias].md`
2. Apply requested changes:
   - **Add cross-cutting**: append path to `crosscutting` array
   - **Modify instructions**: edit body (replace section or append)
   - **Change tags**: update array
   - **Any other field**: update frontmatter
3. Increment `version`, update `last_updated`
4. Write the full updated file
5. Regenerate `_system/roles/_index.md`

### Delete mode

1. Confirm with user (name + alias)
2. Delete `_system/roles/[alias].md`
3. Regenerate index

### Regenerate index

After any change:

1. List all `.md` in `_system/roles/` except `_index.md`
2. Read frontmatter of each
3. Rebuild table in `_system/roles/_index.md`:

```markdown
| Alias | Name | Tags | Cross-cutting |
|-------|------|------|---------------|
| ts-dev | Senior TS Developer | code, typescript | knowledge/typescript |
```

4. Update `last_updated`

## Iterability notes

Common evolution patterns:
- **New area created** → user adds it as cross-cutting to a role
- **Instructions refined** → "add to role X: always use ESM imports"
- **Pattern discovered** → "update role X: we learned that for the API, always validate input schemas"

The skill handles partial edits without requiring a full rewrite.
