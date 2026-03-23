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
