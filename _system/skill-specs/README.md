---
audience: shared
doc_type: index
version: 5
last_updated: 2026-03-28
---

# Skill Specs

Portable, AI-agnostic procedures for managing your exo-brAIn. Each file describes one operation — what it does, when to use it, and how to execute it step by step.

These are **specifications**, not code. Any AI with access to the vault can read and follow them.

## Grouped Skills (Claude Desktop)

When installed via `install-skills.md`, the specs are grouped into 6 skills available as `/slash-commands`. Each group embeds the full content of its specs for instant access.

| Installed skill | Contains | Description |
|---|---|---|
| `exo-brain` | quickstart, install-skills, review-contribution, this index | Main router, vault setup, and maintenance |
| `exo-brain-sessions` | session-boot, session-end, load-context | Start/end sessions, load files on demand |
| `exo-brain-roles` | role-load, role-save | List, load, create, edit AI personas |
| `exo-brain-knowledge` | area-create, update-doc | Knowledge areas and documentation |
| `exo-brain-tasks` | task-define, task-list, backlog-add, backlog-review | Define tasks, daily briefings, manage backlog |
| `exo-brain-capture` | daily-capture | Quick append to today's daily note |

## Individual Specs

| Spec | File | Direction | Purpose |
|------|------|-----------|--------|
| session-boot | `session-boot.md` | Read | Start a session: load area + role + minimal context |
| session-end | `session-end.md` | Write | End session: log progress + update indexes |
| load-context | `load-context.md` | Read | Load a file on demand during session |
| role-load | `role-load.md` | Read | List available roles or load one by alias |
| role-save | `role-save.md` | Write | Create, edit, or iterate on roles |
| area-create | `area-create.md` | Write | Create a knowledge area from template |
| update-doc | `update-doc.md` | Write | Update documentation by type |
| review-contribution | `review-contribution.md` | Read | Review a PR against vault conventions and security |
| task-define | `task-define.md` | Write | Convert a backlog item or idea into a defined task |
| task-list | `task-list.md` | Read | List pending tasks, daily briefing with calendar |
| backlog-add | `backlog-add.md` | Write | Add an idea to the backlog for future refinement |
| backlog-review | `backlog-review.md` | Read | List and triage backlog items |
| daily-capture | `daily-capture.md` | Write | Quickly append ideas/notes to today's capture file |
| install-skills | `install-skills.md` | Write | Install the skill suite into the AI platform |

## How to Use

1. Identify which skill matches the current need
2. Read the full skill-spec file
3. Follow the procedure step by step
4. Use the vault's file operations (MCP, REST API, or direct file access)

## Design Principles

- **Minimal boot**: Load only what's needed. Expand on demand.
- **Graceful degradation**: Unknown doc_types fall back to generic note. Missing files skip with warnings.
- **Audience-aware**: `ai` files are compressed. `human` files are verbose. `shared` balances both.
- **Iterable**: Roles and areas evolve over time. Skills handle partial updates.
- **Portable**: No dependency on any specific AI provider. Markdown in, markdown out.
