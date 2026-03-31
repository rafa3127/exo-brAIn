---
skill: area-create
audience: ai
version: 2
last_updated: 2026-03-31
---

# Skill: area-create

## Purpose

Create a new knowledge area with the correct structure for its type. Knowledge areas are NEVER created manually — always via this skill.

## When to use

- "create an area for...", "new project...", "start a course on..."
- "I need to organize notes about [topic]"
- When referencing an area that doesn't exist yet

## Area types

| Type | Use case | Example |
|------|----------|---------|
| `project` | Professional work, deliverables, codebases | Client Portal, ML Pipeline, Budget Tracker |
| `study` | Academic courses, training, certifications | University course, online master's |
| `knowledge` | Thematic knowledge base (zettelkasten) | TypeScript, databases, architecture |
| `personal` | Personal projects, hobbies, side work | Side project, language learning |

## Classifying folders

Area paths MUST start with a classifying folder. Never create areas at the vault root.

### Predefined folders

| Folder | Purpose |
|--------|---------|
| `work/` | Professional, remunerated projects — clients, contracts, paid engagements |
| `project/` | Personal (non-remunerated) projects — open source, side projects, own tools |
| `knowledge/` | Reusable, topic-agnostic reference — useful across multiple projects |
| `university/` | Academic — courses, certifications, formal training |

Users may create additional classifying folders as needed. When the area doesn't fit a predefined folder, ask the user where to place it.

### Decision rules

Before creating an area, apply these checks in order:

1. **Is it specific to a paid project or client?** → `work/[project]/` (as area or sub-area)
2. **Is it a personal project with deliverables?** → `project/[name]/`
3. **Is it generic, reusable knowledge — useful across projects?** → `knowledge/[topic]/`
4. **Is it academic coursework or formal study?** → `university/[course]/`
5. **None of the above?** → ask the user which folder fits best

### Antipattern: project-specific content in knowledge/

If the content only makes sense within one project (e.g., a client's business processes, a specific company's operational context, a project's internal architecture), it is NOT `knowledge/` — it belongs as a sub-area or document within that project's folder.

**Wrong:** `knowledge/clinic-operations` (specific to one client)
**Right:** `work/neurohealth/clinic-operations` (sub-area within the project)

**Test:** "Would this be useful to someone who has never heard of [project]?" If no → it's project-specific, not knowledge.

## Procedure

1. Gather from user:
   - `name`: area name
   - `type`: project · study · knowledge · personal
   - `path`: vault path — must start with a classifying folder (e.g., `work/client-portal`, `knowledge/typescript`)
   - `description`: 1-2 sentences
   - `crosscutting` (optional): knowledge areas available for consultation from this area
   - `default_role` (optional): role alias to auto-load on boot
   - `audience`: ai · human · shared (default: shared)

2. Validate the path doesn't already exist

3. Read template from `_system/templates/[type].md`

4. Create directory structure:

**project:**
```
[path]/
├── _index.md
├── architecture.md
├── decisions/          (created when first decision is logged)
└── logs/               (created when first log is written)
```

**study:**
```
[path]/
├── _index.md
├── resources.md
└── notes/              (created when first note is written)
```

**knowledge:**
```
[path]/
├── _index.md
└── (atomic notes, no subdirectories)
```

**personal:**
```
[path]/
├── _index.md
├── tasks.md
└── ideas.md
```

5. Fill `_index.md` from template with user-provided data. Set `context_boot` by type:
   - project: `[_index.md, architecture.md]`
   - study: `[_index.md, resources.md]`
   - knowledge: `[_index.md]`
   - personal: `[_index.md, tasks.md]`

6. Confirm: "Area [name] created at [path] as [type]"

## _index.md frontmatter

```yaml
---
type: [type]
name: [name]
status: active
audience: [audience]
default_role: [alias or null]
crosscutting:
  - [declared paths]
context_boot:
  - [files to load on session start]
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
---
```

## Notes

- Empty directories don't show in Obsidian. Create subdirectories only when the first file goes in.
- Sub-areas (e.g., `work/client-portal/auth-module`) use this same skill with the full path.
- The structure is a starting point. Skills like `update-doc` can create additional files as needed.
- Use sub-areas when a project has distinct domains with their own document sets. For simple groupings, a subfolder within the project structure is enough.
