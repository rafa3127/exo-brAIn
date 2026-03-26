---
audience: shared
doc_type: index
version: 2
last_updated: 2026-03-25
---

# Skill Specs

Portable, AI-agnostic procedures for managing your exo-brAIn. Each file describes one operation — what it does, when to use it, and how to execute it step by step.

These are **specifications**, not code. Any AI with access to the vault can read and follow them.

## Available Skills

| Skill | File | Direction | Purpose |
|-------|------|-----------|----------|
| role-load | `role-load.md` | Read | List available roles or load one by alias |
| role-save | `role-save.md` | Write | Create, edit, or iterate on roles |
| area-create | `area-create.md` | Write | Create a knowledge area from template |
| session-boot | `session-boot.md` | Read | Start a session: load area + role + minimal context |
| load-context | `load-context.md` | Read | Load a file on demand during session |
| update-doc | `update-doc.md` | Write | Update documentation by type |
| session-end | `session-end.md` | Write | End session: log progress + update indexes |
| review-contribution | `review-contribution.md` | Read | Review a PR against vault conventions and security |

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
