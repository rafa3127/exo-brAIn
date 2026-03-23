# exo-brAIn

This vault is an AI-assisted external brain. Read this file and follow its protocols.

## First-Time Detection

Read `_system/config.json`. Check the `vault.name` field:

- If it says `"VAULT_NAME"` → **this vault needs setup**. Do the following:
  1. Greet the user and explain you've detected a fresh exo-brAIn vault
  2. Read `_system/quickstart.md`
  3. Skip steps the user has clearly already completed (they've cloned the repo and are running you — so git and repo steps are done)
  4. Walk them through the remaining steps interactively, one at a time
  5. Wait for user confirmation before proceeding to each next step

- If it has a real name → **vault is configured**. Proceed to Session Protocol below.

## Session Protocol

**Starting:** When the user says what to work on, read `_system/skill-specs/session-boot.md` and follow it.

**During:** Read additional skill-specs as needed:
- `load-context.md` to bring in files on demand
- `update-doc.md` to persist changes, decisions, logs

**Ending:** When the user wraps up, read `_system/skill-specs/session-end.md` and follow it.

## Skill-Spec Reference

Read the spec BEFORE performing the operation. Follow the documented procedure.

| Need | Read |
|------|------|
| Start session | `_system/skill-specs/session-boot.md` |
| End session | `_system/skill-specs/session-end.md` |
| List/load role | `_system/skill-specs/role-load.md` |
| Create/edit role | `_system/skill-specs/role-save.md` |
| Create area | `_system/skill-specs/area-create.md` |
| Load file on demand | `_system/skill-specs/load-context.md` |
| Update documentation | `_system/skill-specs/update-doc.md` |
| Full skill index | `_system/skill-specs/README.md` |

## Conventions

- Boilerplate and structure: English. Session content: user's language.
- Temporal files: `YYYY-MM-DD-slug.md`
- Frontmatter `audience`: `ai` (compressed) · `human` (readable) · `shared` (balanced)
- Frontmatter `doc_type`: determines update pattern (see `update-doc` spec)
- `_index.md` files are auto-generated — never edit manually
- Knowledge areas are created only via the `area-create` spec
