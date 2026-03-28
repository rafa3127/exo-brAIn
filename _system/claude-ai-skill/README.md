---
audience: shared
doc_type: instruction
version: 3
last_updated: 2026-03-28
---

# exo-brAIn Skill Installation

## What this does

Installs the exo-brAIn skill suite so vault operations are available as `/slash-commands` across all Claude interfaces (Code CLI, Desktop Chat, and Cowork).

## Prerequisites

- mcp-obsidian connected (see quickstart Step 5a-5b)
- Obsidian running with Local REST API plugin active

## Installation

Run the automated installer:

1. Tell your AI agent: "Read `_system/skill-specs/install-skills.md` from my vault and follow it"
2. The installer detects the platform, reads the skill-specs, and writes 6 skills to `~/.claude/skills/`

After installation, these appear as `/exo-brain-*` commands in Claude:

| Installed skill | Contains | Description |
|---|---|---|
| `exo-brain` | quickstart, install-skills, review-contribution | Main router, vault setup, and maintenance |
| `exo-brain-sessions` | session-boot, session-end, load-context | Start/end sessions, load files on demand |
| `exo-brain-roles` | role-load, role-save | List, load, create, edit AI personas |
| `exo-brain-knowledge` | area-create, update-doc | Knowledge areas and documentation |
| `exo-brain-tasks` | task-define, task-list, backlog-add, backlog-review | Define tasks, daily briefings, manage backlog |
| `exo-brain-capture` | daily-capture | Quick append to today's daily note |

## Updating skills

If you modify any skill-spec in `_system/skill-specs/`, re-run the installer to sync the changes:
> "Re-install exo-brain skills" or "Update exo-brain skills"

## Without installation

The AI can still operate by reading `CLAUDE.md` from the vault root when running inside the vault directory (e.g., `claude` from the vault folder in Claude Code). However, skills won't trigger automatically from natural language in other contexts.

## Legacy

The file `skill-definition.md` in this directory contains a monolithic skill definition from before the installer existed. It is kept for reference but the recommended approach is now the automated installer above.
