---
audience: shared
doc_type: instruction
version: 4
last_updated: 2026-03-26
---

# exo-brAIn — Interactive Setup

> **For AI agents:** Follow this guide step by step WITH the user. Ask, wait for confirmation, help at each stage. Skip steps that are clearly already completed based on context (e.g., if you're running inside the vault, the user already cloned and has the AI tool working).
>
> **For humans:** Your AI walks you through this. Just answer its questions.

---

## Context Detection

Before starting, figure out how the user got here:

- **Running in Claude Code inside the vault?** → The clone exists and AI tool works, but **you must still run Step 1 checks** (repo ownership + path structure). Then continue from Step 2.
- **Talking in claude.ai with MCP connected?** → MCP works, but **you must still run Step 1 checks**. Then continue from Step 2.
- **User pasted this file manually?** → Start from Step 1.
- **AI is helping from a different directory** (user shared the repo URL or asked to set it up) → Start from Step 1, full flow. Pay special attention to clone target directory.
- **Not sure?** → Ask: "Have you already cloned this repo and opened it in Obsidian?"

> **IMPORTANT:** Step 1 checks (repo ownership and path structure) are NEVER skipped. A user running you from inside a direct clone of the template still has the wrong remote and possibly a nested folder structure.

---

## Step 1 — Repository Setup & Verification

> **Never fully skip this step.** Even if the vault is already cloned, run the verification checks below.

### If setting up from scratch:

**Ask the user:**
- "Do you already have this repo cloned, or should we set it up?"

If not cloned yet:
1. They need a GitHub account and Git installed
2. **Recommended:** Use the GitHub template — go to `https://github.com/rafa3127/exo-brAIn`, click "Use this template" → "Create a new repository". This gives them their own repo automatically.
3. Clone **their own repo** (not the template) into the target directory:
   ```bash
   git clone git@github.com:USER/THEIR_REPO.git ~/Desktop/VAULT_NAME
   ```
   > **Clone target = vault root.** The folder you clone into IS the Obsidian vault. Do NOT clone into a subfolder of the vault. For example, if the vault folder is `~/Desktop/my-brain`, clone directly there — not into `~/Desktop/my-brain/exo-brAIn/`.
4. If SSH fails (passphrase prompt in non-interactive terminal), use HTTPS:
   ```bash
   git clone https://github.com/USER/THEIR_REPO.git ~/Desktop/VAULT_NAME
   ```

### Verification checks (always run):

**Check 1 — Repo ownership:**
Run `git remote -v`. If the origin points to `rafa3127/exo-brAIn`, the user cloned the template directly instead of creating their own repo. Fix this:
1. Help them create a new repo on GitHub (via API or instruct them manually)
2. Change remote: `git remote set-url origin git@github.com:USER/THEIR_REPO.git`
3. Push: `git push -u origin main`

**Check 2 — No nested folders:**
Verify that `CLAUDE.md` is at the root of the working directory, not inside a subfolder. If the structure looks like:
```
vault-folder/exo-brAIn/CLAUDE.md   ← WRONG
```
Then move all contents up one level:
```bash
mv vault-folder/exo-brAIn/* vault-folder/exo-brAIn/.* vault-folder/ 2>/dev/null
rmdir vault-folder/exo-brAIn
```

**Check 3 — Git health:**
Run `git status`. Confirm clean state and `main` branch.

---

## Step 2 — Open in Obsidian

> Skip if Obsidian is already running with this vault.

1. Download [Obsidian](https://obsidian.md) if not installed
2. Open Obsidian → **"Open folder as vault"** → select the cloned folder
3. When prompted about community plugins → **"Trust and enable"**

**Ask:** "Is the vault open in Obsidian? Can you see the `_system` folder?"

---

## Step 3 — Install Obsidian Plugins

**Ask:** "Do you already have the Obsidian Git and Local REST API plugins installed?"

If not:

### Obsidian Git
1. Settings → Community Plugins → Browse → search "Obsidian Git" → Install → Enable
2. Configure:
   - Auto-commit interval: 30 minutes (or their preference)
   - Auto-push after commit: ON
   - Pull on startup: ON

### Local REST API
1. Settings → Community Plugins → Browse → search "Local REST API" → Install → Enable
2. Note the **port** (default: 27123)
3. Generate an **API key** in the plugin settings

**Ask:** "What port is the REST API running on? Please paste the API key here — I'll need it to configure the MCP connection in Step 5."

> **Important:** Store the API key and port in memory for Step 5. You will need them to configure the MCP bridge.

---

## Step 4 — Configure the Vault

Read `_system/config.json` and help the user fill in real values:

```json
{
  "vault": {
    "name": "Their vault name",
    "path": "/full/path/to/vault",
    "github": "user/repo-name"
  },
  "mcp": {
    "port": 27123,
    "protocol": "http"
  },
  "paths": {
    "sessions": "_system/sessions",
    "context": "_system/context",
    "skillSpecs": "_system/skill-specs",
    "roles": "_system/roles",
    "templates": "_system/templates",
    "config": "_system/config.json",
    "captures": "_captures",
    "backlog": "_backlog",
    "tasks": "_tasks"
  },
  "areaTypes": ["project", "study", "knowledge", "personal"],
  "conventions": {
    "temporalNaming": "YYYY-MM-DD-slug",
    "audienceTypes": ["ai", "human", "shared"],
    "docTypes": ["decision", "log", "checklist", "architecture", "instruction", "index", "note", "backlog-item", "task"]
  }
}
```

**Gather from user:**
- What do they want to call their brain? (name)
- Where is it on disk? (path — help them find it if needed)
- What's their GitHub user/repo?
- What port did the REST API report? (usually 27123)

Write the updated `_system/config.json`.

---

## Step 5 — Connect MCP & Install Skills

> MCP enables search and write operations. Without it, the AI can still read files directly (in Claude Code) but loses search and write-back capabilities.

**Ask:** "Would you like to set up the MCP bridge for full vault integration? This lets me search and write to your vault directly."

If yes:

### 5a — Install mcp-obsidian

```bash
uv tool install mcp-obsidian
```

Locate the binary path for the next step:
```bash
which uvx
```

### 5b — Configure the MCP connection

Use the API key and port obtained from Step 3. **Execute the configuration yourself** — do not just show the user what to do.

**For Claude Code CLI**, add the MCP server to `~/.claude/settings.json` under the `mcpServers` key:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "uvx",
      "args": ["mcp-obsidian"],
      "env": {
        "OBSIDIAN_API_KEY": "{{API_KEY_FROM_STEP_3}}",
        "OBSIDIAN_HOST": "127.0.0.1",
        "OBSIDIAN_PORT": "{{PORT_FROM_STEP_3}}"
      }
    }
  }
}
```

> If `uvx` is not found at runtime, use the absolute path from `which uvx` (e.g., `/Users/name/.local/bin/uvx`).

**For Claude Desktop / Cowork**, add the same server block to the Claude desktop config file at `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) under `mcpServers`.

> **Note:** Claude Code CLI and Claude Desktop use **separate config files**. To have the MCP available in both, add it to both files.

### 5c — Install the exo-brAIn skills

The vault includes an automated skill installer at `_system/skill-specs/install-skills.md`. This installs 6 skills that make vault operations available via `/slash-commands` across Claude Code, Desktop Chat, and Cowork.

**Procedure:**
1. Read `_system/skill-specs/install-skills.md`
2. Follow it step by step — it will detect the platform, read the skill-specs from the vault, and install them to the correct location

The installed skills are:
- `exo-brain` — main router and quickstart
- `exo-brain-sessions` — start/end sessions, load context
- `exo-brain-roles` — list, load, create, edit roles
- `exo-brain-knowledge` — areas and documentation
- `exo-brain-tasks` — tasks, backlog, daily briefings
- `exo-brain-capture` — quick daily notes

Without skills installed, the AI still works via `CLAUDE.md` when inside the vault directory, but won't trigger from natural language in other contexts.

**Ask:** "I've configured the MCP connection. Let me verify it works — can you confirm Obsidian is open?"

---

## Step 6 — Smoke Test

Run these checks:

1. **Read:** "List the files in my vault" or "Read `_system/config.json`"
2. **Write:** "Create a test note at `_system/sessions/test.md` with the content 'smoke test'"
3. **Search** (MCP only): "Search for 'config' in my vault"
4. **Cleanup:** Delete the test note
5. **Git sync:** Verify Obsidian Git auto-commits (check status in the Obsidian Git plugin panel)

**Walk through each test** and confirm results with the user.

---

## Step 7 — Create First Role and Area

The system is ready. Now make it personal:

**Ask:** "What do you mainly use this for? Work? Study? Personal projects? Tell me about your main activity and I'll create a role and knowledge area for you."

Based on their answer:
1. Run `role-save` to create their first AI persona
2. Run `area-create` to create their first knowledge area
3. Run `session-boot` to experience the full flow

---

## Setup Complete

Once all steps pass, confirm:

```
✅ exo-brAIn configured
🧠 Vault: [name]
🔗 GitHub: [user/repo]
🎭 Roles: [first role created]
📂 Areas: [first area created]

You're ready to go. Start any session by telling me what you want to work on.
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MCP "connection refused" | Obsidian must be open (REST API runs inside it) |
| Git push fails | Check SSH keys: `ssh -T git@github.com` |
| Claude Code doesn't see CLAUDE.md | Run `claude` from the vault root directory |
| Plugin not found in Obsidian | Enable Community Plugins first in Settings |
| `uvx` not found | Use absolute path or install with `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
