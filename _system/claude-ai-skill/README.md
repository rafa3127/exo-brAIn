---
audience: shared
doc_type: instruction
version: 5
last_updated: 2026-11-02
---

# exo-brAIn Skill Installation

## What this does

Installs the exo-brAIn skill suite so vault operations are available as `/slash-commands` on every Claude surface (claude.ai web/mobile, Desktop Chat, Cowork, Claude Code CLI and Desktop Code tab).

## Prerequisites

- Node.js (to run the build script)
- Recommended: mcp-obsidian connected (see quickstart Step 5a-5b) so the skills can reach the vault from Chat

## Installation

Run the automated installer:

1. Tell your AI agent: "Read `_system/skill-specs/install-skills.md` from my vault and follow it"
2. The installer runs `node _system/scripts/build-skills.mjs`, which regenerates the project skills in `.claude/skills/` and 6 ZIPs in `dist/skills/`. You then upload the ZIPs once in claude.ai → Customize → Skills; from there they reach Chat, Cowork and Claude Code (via account sync)

After installation, these appear as `/exo-brain-*` commands in Claude (in Claude Code outside the vault: `/anthropic-skills:exo-brain-*`):

| Installed skill | Contains | Description |
|---|---|---|
| `exo-brain` | skill index, quickstart, review-contribution | Main router, vault setup, and maintenance |
| `exo-brain-sessions` | session-boot, session-end, load-context | Start/end sessions, load files on demand |
| `exo-brain-roles` | role-load, role-save | List, load, create, edit AI personas |
| `exo-brain-knowledge` | area-create, update-doc | Knowledge areas and documentation |
| `exo-brain-tasks` | task-define, task-list, backlog-add, backlog-review | Define tasks, daily briefings, manage backlog |
| `exo-brain-capture` | daily-capture | Quick append to today's daily note |

The build also generates `exo-brain-inbox`, a **project-only** skill for the optional remote inbox (`_system/remote/README.md`). It has no ZIP. Don't upload it to the account.

## Updating skills

If you modify any skill-spec in `_system/skill-specs/`, re-run the installer to rebuild and re-upload:
> "Re-install exo-brain skills" or "Update exo-brain skills"

Account skills can't be edited in place — the installer tells you to delete the old ones and upload the new ZIPs.

## Without installation

The AI can still operate by reading `CLAUDE.md` from the vault root when running inside the vault directory (e.g., `claude` from the vault folder in Claude Code). However, skills won't trigger automatically from natural language in other contexts.

## Legacy

- The monolithic `skill-definition.md` that used to live here has been removed (see git history). Do not upload it: it uses the name `exo-brain` and would collide with the router.
- install-skills v5 and earlier wrote copies to `~/.claude/skills/` and into the Desktop `skills-plugin` folder. Both are obsolete; remove old copies with `rm -rf ~/.claude/skills/exo-brain*`.
