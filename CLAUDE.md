# exo-brAIn

This vault is an AI-assisted external brain. Read this file and follow its protocols.

## First-Time Detection

Read `_system/config.json`. Check the `vault.name` field:

- If it says `"VAULT_NAME"` → **this vault needs setup**. Do the following:
  1. Greet the user and explain you've detected a fresh exo-brAIn vault
  2. Read `_system/quickstart.md`
  3. **Run the Pre-Setup Checks below** — these are NEVER skippable, even if the user is already running you from inside the vault
  4. Walk them through the remaining quickstart steps interactively, one at a time
  5. Wait for user confirmation before proceeding to each next step

- If it has a real name → **vault is configured**. Proceed to Session Protocol below.

## Pre-Setup Checks (mandatory)

Even if the user already cloned and is running you, verify these before proceeding with quickstart:

### 1. Repository ownership
Run `git remote -v` in the vault root. If the remote points to `rafa3127/exo-brAIn` (the template repo), the user does NOT own this repo yet. They must:
- Create their own repo on GitHub (offer to help via GitHub API if available)
- Change the remote: `git remote set-url origin <their-repo-url>`
- Push: `git push -u origin main`

**Do NOT skip this.** A vault pointing to the template repo means the user's personal data would push to someone else's repo.

### 2. Vault path structure
Check that the vault root (the folder containing `CLAUDE.md`) is the **direct** working directory or the intended Obsidian vault root. Watch for accidental nesting like:
```
~/Desktop/my-brain/exo-brAIn/CLAUDE.md  ← BAD (nested)
~/Desktop/my-brain/CLAUDE.md             ← GOOD (flat)
```
If nested, help the user move contents up and remove the extra folder. This matters because Obsidian opens a folder as vault root, and `claude` must run from that same root.

### 3. Git status
Run `git status` to confirm the repo is clean and on the `main` branch. If there are issues, resolve them before continuing setup.

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
