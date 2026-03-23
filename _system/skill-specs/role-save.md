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
- **Pattern discovered** → "update role X: we learned that for Prosight, always verify GeoJSON zones"

The skill handles partial edits without requiring a full rewrite.
