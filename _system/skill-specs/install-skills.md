---
audience: ai
doc_type: instruction
version: 6
last_updated: 2026-11-02
---

# Install exo-brAIn Skills

Installs the 6 exo-brAIn skills (specs embedded, no vault roundtrip at runtime) on every Claude surface.

> **Read this full spec before executing any step.**
> **Re-run after editing any skill-spec** so installed copies don't go stale.

## How distribution works (as of Nov 2026)

There is **one source of truth for all surfaces: the user's claude.ai account** (Customize > Skills).

| Surface | Gets the skills from | Name shown |
|---|---|---|
| claude.ai web / mobile / Desktop **Chat** | account | `exo-brain-*` |
| Desktop **Cowork** | account (cached locally under `%LOCALAPPDATA%\Claude-Data\…\skills-plugin\` on Windows MSIX, `~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/` on macOS) | `exo-brain-*` |
| **Claude Code** CLI + Desktop **Code** tab (signed in with claude.ai, v2.1.273+) | account, auto-synced to `~/.claude/skills/synced/` (read-only, refreshes ~every 10 min) | `/anthropic-skills:exo-brain-*` |
| **Claude Code inside the vault** | project skills in `.claude/skills/` (committed) | `/exo-brain-*` (local wins the short name) |

Consequences:
- **Do not** write to `~/.claude/skills/` — the account sync already covers Claude Code everywhere. A personal copy would just be a third copy that drifts.
- **Do not** write into the Desktop `skills-plugin` folder or edit its `manifest.json` — it is a server-synced cache and gets overwritten (old Option B is obsolete).
- Uploading to the account is **manual** (no public API/CLI): the user uploads one ZIP per skill.
- Skills are shared across machines, so SKILL.md must not hardcode a single vault path. The build script embeds a vault-location fallback chain (cwd → known clones from `config.json` → Obsidian MCP → ask) instead.

---

## Step 1 — Check prerequisites

- Node.js available (`node --version`).
- `_system/config.json` exists (gitignored). If missing, create it from `config.template.json` with this machine's `vault.path` (forward slashes on Windows).
- `vault.paths` lists the vault path on **every** machine where it is cloned (e.g. `["C:/Users/me/Desktop/my-brain", "/Users/me/Desktop/my-brain"]`). Account skills are shared across machines, so add this machine's path if it is missing. `vault.path` is always included automatically. Optional: with no paths, the skills fall back to cwd → MCP → ask.

## Step 2 — Build

From the vault root:

```bash
node _system/scripts/build-skills.mjs
```

This regenerates:
- `.claude/skills/<name>/SKILL.md` — project skills (commit these)
- `dist/skills/<name>.zip` — upload packages (gitignored). Each ZIP contains `<name>/SKILL.md`; folder name = skill name.

Grouping (edit the `SKILLS` array in the script to change it):

| Skill | Embeds |
|---|---|
| `exo-brain` | README routing table, `quickstart.md`, `review-contribution.md` |
| `exo-brain-sessions` | `session-boot.md`, `session-end.md`, `load-context.md` |
| `exo-brain-roles` | `role-load.md`, `role-save.md` |
| `exo-brain-knowledge` | `area-create.md`, `update-doc.md` |
| `exo-brain-tasks` | `task-define.md`, `task-list.md`, `backlog-add.md`, `backlog-review.md` |
| `exo-brain-capture` | `daily-capture.md` |

## Step 3 — Upload to the claude.ai account (user does this)

Tell the user, in their language:

1. Open claude.ai (or Claude Desktop) → **Customize → Skills**. Code execution must be enabled in Settings → Capabilities.
2. **Updating?** Custom skills can't be edited in place: for each existing `exo-brain*` skill, toggle it off → `…` → **Delete**. Also delete stray duplicates (e.g. `exo-brain-2`).
3. **+ → Create skill → Upload a skill**, and upload each ZIP from `dist/skills/` (6 total). Toggle each on.
4. **Upgrading from install-skills v5 or earlier?** Delete the old personal copies with `rm -rf ~/.claude/skills/exo-brain*` — a local skill keeps the short name and would shadow the synced, up-to-date one.
5. Restart Claude Desktop so Chat/Cowork pick them up. Claude Code picks them up on next session start.

If running in Cowork with `present_files`, you may present the ZIPs so the user can click "Copy to your skills" instead of uploading by hand.

## Step 4 — Verify

- Account/Desktop: in a new Chat or Cowork conversation type `/exo-brain` — 6 entries should autocomplete, none duplicated.
- Claude Code: run `/skills`. Outside the vault the 6 appear under "claude.ai sync" as `anthropic-skills:exo-brain-*`; inside the vault the project copies also appear with the short name.
- Optional cache check (Windows MSIX): `ls "$LOCALAPPDATA/Claude-Data"/*/local-agent-mode-sessions/skills-plugin/*/*/skills | grep exo-brain`

## Step 5 — Report

```
✅ exo-brAIn skills built (embedded mode)
📂 Project skills: .claude/skills/ (commit)
📦 Upload packages: dist/skills/*.zip (6)
⏳ Pending (user): delete old exo-brain* in Customize > Skills, upload the 6 ZIPs, restart Desktop
🔄 After editing any spec: re-run the build and re-upload
```

## Uninstall

- Account (all surfaces): Customize → Skills → delete each `exo-brain*`.
- Project: `rm -rf .claude/skills/exo-brain*`.
- Legacy personal copies, if any: `rm -rf ~/.claude/skills/exo-brain*`.
