---
audience: human
doc_type: instruction
version: 2
last_updated: 2026-03-27
---

# exo-brAIn 🧠

An AI-assisted personal knowledge system built on Obsidian. Your AI handles sessions, roles, context loading, and documentation — you focus on thinking.

## What is this?

A **template vault** that turns Obsidian into a structured external brain. It works with any AI assistant that can read files, with first-class support for:

- **Claude Code** (CLI) — zero-config, just `cd` into the vault and run `claude`
- **claude.ai** (web/app) — via MCP connector to Obsidian
- **Any other AI** — reads plain markdown procedures, no vendor lock-in

## Quick Start (5 minutes)

### 1. Create your own repo from the template

> **Do NOT just clone `rafa3127/exo-brAIn` directly.** You need your own repo so your personal notes sync to YOUR GitHub, not the template.

1. Go to [github.com/rafa3127/exo-brAIn](https://github.com/rafa3127/exo-brAIn)
2. Click **"Use this template"** → **"Create a new repository"**
3. Name it whatever you want (e.g., `my-brain`, `exo-brain`, `vault`)
4. Clone **your new repo** into your desired vault folder:

```bash
git clone git@github.com:YOUR_USER/YOUR_REPO.git ~/Desktop/my-brain
```

> **The clone target IS your vault root.** Obsidian will open this folder directly. Do not clone into a subfolder of an existing folder (e.g., avoid `~/Desktop/my-brain/exo-brAIn/` — that creates unnecessary nesting).

<details>
<summary>Alternative: direct clone (if you can't use templates)</summary>

```bash
git clone git@github.com:rafa3127/exo-brAIn.git ~/Desktop/my-brain
cd ~/Desktop/my-brain
git remote remove origin
# Create a new empty repo on GitHub first, then:
git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git
git push -u origin main
```

</details>

### 2. Open in Obsidian

1. Download [Obsidian](https://obsidian.md) if you don't have it
2. Open Obsidian → **"Open folder as vault"** → select the cloned folder
3. When prompted about community plugins, click **"Trust and enable"**

### 3. Install required plugins

In Obsidian → Settings → Community Plugins → Browse:

| Plugin | Why |
|--------|-----|
| **Obsidian Git** | Auto-syncs your notes to GitHub |
| **Local REST API** | Lets AI tools read/write your vault |

**Configure Obsidian Git:**
- Auto-commit interval: 30 minutes
- Auto-push after commit: ON
- Pull on startup: ON

**Configure Local REST API:**
- Note the port (default: 27123)
- Generate an API key → save it somewhere safe

### 4. Connect your AI

#### Claude Code (recommended for developers)

```bash
cd ~/Desktop/my-brain
claude
```

That's it. Claude reads `CLAUDE.md` automatically and guides you through the rest.

#### claude.ai (web/app)

1. Install the MCP bridge:
   ```bash
   pip install mcp-obsidian
   # or: uv tool install mcp-obsidian
   ```
2. Connect mcp-obsidian in claude.ai (Settings → Connected apps)
3. Start a conversation and say: **"Read CLAUDE.md from my Obsidian vault and help me set up my exo-brAIn"**

#### Other AI tools

Open `CLAUDE.md` in your vault and paste its contents to your AI, or point your AI to `_system/quickstart.md`.

### 5. Let the AI guide you

Once connected, your AI will:
1. Detect this is a new vault (config has placeholder values)
2. Walk you through configuring `_system/config.json`
3. Help you create your first **role** (AI persona for your work)
4. Help you create your first **knowledge area**
5. Run a smoke test to verify everything works

---

## How it works

### Session flow

```
Open Obsidian → Start AI → "Let's work on [area]"
   ↓
AI boots session: loads area context + role + minimal files
   ↓
You work, discuss, decide → AI updates docs as you go
   ↓
"Close session" → AI logs progress, updates indexes
   ↓
Obsidian Git auto-syncs to GitHub
```

### Key concepts

| Concept | What it is |
|---------|------------|
| **Roles** | AI personas with specific expertise. Iterable — grow over time. |
| **Areas** | Structured folders for projects, study, knowledge, or personal topics. |
| **Skill-specs** | Markdown procedures the AI follows. Portable across tools. |
| **Sessions** | Work periods with automatic logging and context tracking. |
| **Cross-cutting** | Knowledge areas available for consultation from other areas. |
| **Captures** | Quick daily notes — append-only, one file per day. |
| **Backlog** | Raw ideas saved for future refinement or promotion to tasks. |
| **Tasks** | Defined, actionable work items linked to knowledge areas. |

### Vault structure

```
vault/
├── CLAUDE.md                  ← AI entry point (auto-loads in Claude Code)
├── _system/
│   ├── config.json            ← your vault settings (gitignored)
│   ├── quickstart.md          ← interactive AI-guided setup
│   ├── skill-specs/           ← all AI procedures (13 skills)
│   ├── roles/                 ← your AI personas
│   ├── templates/             ← area creation templates
│   └── sessions/              ← session logs (gitignored)
├── _captures/                 ← daily notes (append-only, one file per day)
├── _backlog/                  ← ideas for future refinement
├── _tasks/                    ← defined tasks linked to areas
└── [your knowledge areas]/    ← created via AI skill
```

### Available skills

| Skill | What it does |
|-------|-------------|
| `session-boot` | Start a session with minimal context loading |
| `session-end` | Close session, log progress, update indexes |
| `role-load` | List or activate an AI role |
| `role-save` | Create, edit, or evolve a role |
| `area-create` | Create a new knowledge area from template |
| `load-context` | Load files on demand during a session |
| `update-doc` | Update documentation by type (decisions, logs, etc.) |
| `review-contribution` | Review a PR against vault conventions and security |
| `daily-capture` | Quick append of ideas/notes to today's capture file |
| `backlog-add` | Add an idea to the backlog for future refinement |
| `backlog-review` | List and triage backlog items |
| `task-define` | Convert a backlog item or idea into a defined task |
| `task-list` | List pending tasks, daily briefing with calendar |

---

## FAQ

**Q: Do I need to be technical?**
A: You need basic comfort with Git (clone, push). The AI handles everything else.

**Q: Can I use this without AI?**
A: Yes — it's a normal Obsidian vault. The `_system/` folder just adds structure.

**Q: What if I switch AI tools?**
A: The skill-specs are plain markdown. Any AI that can read files can follow them. No vendor lock-in.

**Q: Is my data safe?**
A: Your vault is a local folder synced to YOUR private GitHub repo. Nothing leaves your machine unless you use a cloud AI.

**Q: Can I have multiple brains?**
A: Yes. Each is independent — clone the template once per vault.

---

## License

MIT
