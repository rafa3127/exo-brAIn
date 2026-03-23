---
audience: shared
doc_type: instruction
version: 1
last_updated: 2026-03-23
---

# claude.ai Skill Installation

## What this does

Bridges claude.ai to your Obsidian exo-brAIn vault via MCP. When triggered, Claude reads skill-specs from `_system/skill-specs/` and follows the procedures.

## Prerequisites

- mcp-obsidian connected in claude.ai
- Obsidian running with Local REST API plugin active

## Installation

### Option A: Upload as custom skill

1. Copy the contents of `skill-definition.md` in this directory
2. In claude.ai → Settings → Skills → Add custom skill → Paste → Save

### Option B: Tell Claude manually

At the start of a conversation, say:
> "Read CLAUDE.md from my Obsidian vault and follow its instructions."

Less automatic, but works without skill installation.

## For Claude Code

No installation needed — Claude Code auto-loads `CLAUDE.md` from the vault root.
