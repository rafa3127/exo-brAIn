# Changelog

All notable changes to the exo-brAIn template are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Template updates**: `template-update` skill-spec and `_system/scripts/template-update.mjs`. It compares the vault with the published releases, explains what's new, asks, and applies the update on a branch, keeping personal edits. It only sees `vX.Y.Z` tags, never unreleased work, and works on vaults with no history in common with the template. Tests: `template-update.test.mjs`
- `_system/VERSION`: the release a vault is on
- `### Migration` changelog section for steps a release needs beyond file changes
- **Task list from the remote inbox**: asking "what do I have pending this week?" by voice or text answers with the active tasks in the notification. It uses the same flow, with no new commands, reads only `_tasks/_index-pending.md`, and commits nothing when nothing was recorded (`inbox` spec v4, saved prompt v4)
- **Capture conversion marks**: a resolved capture ends in `→ [[destination]]`, `→ done` or `→ discarded`, so nobody has to re-read it or search the vault. `task-define`, `backlog-add`, `area-create` and `update-doc` add the mark, and `task-list` and `backlog-review` skip marked entries. Inbox mode is unchanged: it only creates entries
- Backlog status `promoted`: separates items already converted from `defined` items that are ready to convert. `backlog-review` omits them

### Changed
- `inbox-guard.mjs`: notification text limit raised from 600 to 3500 characters, for the task list
- `daily-capture` v2: captures stay append-only, except for the conversion mark
- `task-define` now sets a backlog item to `promoted` instead of `defined`. Items already converted can be migrated by changing the status of those with `promoted_to`

### Migration
- Backlog items that have `promoted_to` and are not `promoted`: set `status: promoted`. Edits those notes
- Manual: paste the updated prompt from `_system/remote/inbox-task-prompt.md` into the inbox scheduled task on claude.ai. Until then it keeps recording these questions as captures

## [0.6.0] - 2026-11-02

### Added
- **Remote inbox (restricted cloud agent)**: record notes, tasks and ideas from anywhere through a Claude Code scheduled task with an API trigger (`_system/remote/README.md`: architecture, cloud environment setup, scheduled task, bridge contract; `_system/remote/inbox-task-prompt.md`: exact saved prompt)
- `inbox` skill-spec and project-only skill `exo-brain-inbox` (embeds inbox, daily-capture, task-define, backlog-add). Generated into `.claude/skills/` but **not** packaged as a ZIP for the account (`accountZip: false` in `build-skills.mjs`). Only applies with `EXO_BRAIN_MODE=inbox`
- `_system/scripts/inbox-guard.mjs` — PreToolUse hook enforcing inbox mode. It allows writes only to new tasks/backlog items, today's capture and two indexes. It allowlists Bash (read-only commands, specific git commands, `printenv EXO_BRAIN_MODE` / `EXO_BRAIN_NOTIFY_URL`, the notify curl) and rejects chaining, pipes, redirection and substitution. On `git commit` it checks the staged files. All other tools are denied; it fails closed and is a no-op outside inbox mode. Tests: `inbox-guard.test.mjs` (123 cases)
- `_system/scripts/sync-check.mjs` — SessionStart hook: `git pull --ff-only` when the last fetch is older than `sync.pullIntervalMinutes`. It never stashes, merges or rebases, always exits 0, and prints `exo-brain sync: …` as session context. Skipped in cloud sessions. Tests: `sync-check.test.mjs`
- `.claude/settings.json` registering both hooks
- Inbox payload **metadata header**: optional `key: value` lines (`reply_to`, `source`, `received_at`, `suggested_type`) up to the first blank line. They are never recorded as content, and unknown keys are ignored. `received_at` (ISO 8601 with offset) sets today and the base for relative dates in the user's timezone. `suggested_type` is a strong classification hint. `source` is recorded as provenance (`source: inbox/<source>`, `(voz)` on voice captures). The guard's UTC ±1 day capture window is covered by tests for offsets −12…+14 (`inbox` spec v2, remote README and prompt v2)
- `sync` block in `config.template.json` (`autoPull`, `pullIntervalMinutes`)

### Changed
- Generated skills share two new header sections. **Configuration**: in cloud sessions or remote modes, a missing `config.json` means "configured" and template defaults are used; the quickstart never runs there. **Sync check**: on first use, use the hook's status or run `sync-check.mjs`; on `FAILED`, ask the user before continuing
- `CLAUDE.md` First-Time Detection: remote sessions (`CLAUDE_CODE_REMOTE=true` or `EXO_BRAIN_MODE` set) count as configured without `config.json`; inbox mode follows only `inbox.md`
- `exo-brain` router: inbox routing and cloud configuration rule
- `install-skills` v7, `skill-specs/README` v7, `claude-ai-skill/README` v5, root `README` v4, `quickstart` v6: document the 7th project-only skill, `.claude/settings.json`, the sync check and the remote inbox

### Fixed
- Inbox runs sometimes skipped the notification. The condition "and `EXO_BRAIN_NOTIFY_URL` is set" led the agent to check the variable with `printenv`/`echo`; the guard denied that and "don't retry denied actions" turned it into "don't notify". The notify step now only depends on `reply_to` and says to run the curl directly without checking the variable (`inbox` spec v3, remote prompt v3, remote README v3). The guard also allows exactly `printenv EXO_BRAIN_NOTIFY_URL` as a fallback; `echo $…`, `env`, bare `printenv` and other variables stay denied

## [0.5.0] - 2026-11-02

### Added
- `_system/scripts/build-skills.mjs` — deterministic Node build that generates the 6 grouped skills into `.claude/skills/<name>/SKILL.md` (project skills, committed) and `dist/skills/<name>.zip` (upload packages, gitignored). Validates description length (≤1024 chars); uses bsdtar on Windows and `zip` on macOS/Linux
- `.claude/skills/` — generated project skills, so Claude Code (local and cloud sessions) gets the short `/exo-brain-*` names inside the vault
- `vault.paths` in `config.template.json` — vault location on every machine where it is cloned; embedded in the generated skills

### Changed
- `install-skills.md` v6: the claude.ai account (Customize → Skills) is now the single source of truth for every surface — Chat, Cowork and Claude Code (via account sync, `/anthropic-skills:exo-brain-*`). The installer builds ZIPs and the user uploads them; it no longer writes to `~/.claude/skills/` or to the Desktop `skills-plugin` cache (old Option A/B are obsolete)
- Generated skills no longer hardcode a vault path: they resolve it via cwd/Cowork folder → known clones from `config.json` → Obsidian MCP → ask the user
- `exo-brain` router embeds the full quickstart and treats a missing `config.json` like `"VAULT_NAME"`
- `install-skills.md` now follows the skill-spec structure (`skill:` frontmatter, `Purpose` / `When to use` / `Procedure` sections)
- `config.template.json`: MCP defaults now `27124` / `https` (Local REST API plugin defaults)
- `skill-specs/README.md` v6, `CLAUDE.md`: grouped-skills section applies to all Claude surfaces, not only Desktop
- `claude-ai-skill/README.md` v4 and root `README.md` v3: installation section describes the build + upload flow

### Fixed
- Task indexes dropped `in-progress` tasks: `task-define` regenerated `_index-pending.md` with "pending tasks only", and `task-list` inherited that rule right after setting a task to `in-progress`, leaving it in no index. The active index now explicitly includes `pending` + `in-progress` (`task-define` v3, `task-list` v3, `update-doc` v5)
- Duplicate rows and missing dates in `_index-done.md`: closing a task now sets `status` + `completed` (also for `cancelled`) and regenerates **both** indexes in full from frontmatter instead of moving rows by hand
- `task-define` declares the canonical format of both task indexes (frontmatter, columns, sort order, empty state, self-check) and task frontmatter rules (lifecycle keys must be top-level scalars; `"null"` treated as null) so regenerations are consistent across agents. Regeneration repairs lifecycle keys nested inside another value (e.g. `completed:` inside a `due: |-` block) without changing values
- Quickstart v5, Step 5 (MCP): Claude Code registration uses `claude mcp add-json obsidian --scope user` (Claude Code does not read `mcpServers` from `~/.claude/settings.json`); added Windows paths for `claude_desktop_config.json`; port/protocol `27124`/`https` with `OBSIDIAN_PROTOCOL`; API key/port read from the plugin's `data.json` instead of asking; `uv tool install` + absolute executable path instead of `uvx` (first-run download exceeded the ~30 s MCP startup timeout); `winget install astral-sh.uv` for Windows
- Root README: removed the claude.ai "Connected apps" instruction for mcp-obsidian (a local stdio server can't be connected there)

### Removed
- `_system/claude-ai-skill/skill-definition.md` — legacy monolithic skill; its `exo-brain` name collided with the router

## [0.4.3] - 2026-03-31

### Changed
- `area-create` skill v2: added classifying folders convention with 4 predefined folders (`work/`, `project/`, `knowledge/`, `university/`), decision rules for routing areas, and explicit antipattern for project-specific content in `knowledge/`
- Area paths now must start with a classifying folder — prevents areas created at vault root
- Added sub-area guidance note

## [0.4.2] - 2026-03-31

### Fixed
- Wikilinks inside markdown tables now require escaped alias pipe (`\|`) to prevent broken Obsidian rendering
- Added global convention to `CLAUDE.md` Conventions section
- Added escape instructions to `task-define` v2, `task-list` v2, `backlog-add` v2, `backlog-review` v2, and `update-doc` v4 — every point where `_index` tables with wikilinks are generated

## [0.4.1] - 2026-03-28

### Changed
- `install-skills.md` v5: dual-target installation with two Desktop methods — Option A packages `.skill` files via `present_files` (preferred, works reliably in Cowork), Option B writes directly to plugin directory (fallback)
- Skills now install to both Claude Code (`~/.claude/skills/`) and Claude Desktop (Chat + Cowork) in a single run
- Added uninstall appendix with cleanup instructions for both methods

## [0.4.0] - 2026-03-28

### Added
- `install-skills.md` skill-spec — automated installer that generates 6 grouped SKILL.md files with embedded spec content for Claude Desktop/Code/Cowork

### Changed
- Skill grouping: moved `review-contribution` from `exo-brain-knowledge` to `exo-brain` (meta/maintenance group)
- Quickstart Step 5 rewritten: correct MCP config paths, separate instructions for Code CLI vs Desktop, new Step 5c points to automated installer
- `claude-ai-skill/README.md` rewritten to point to automated installer instead of removed manual upload flow
- `CLAUDE.md` now includes grouped skills table and `install-skills` in spec reference
- `README.md` (skill-specs index) now includes grouped skills table

## [0.3.1] - 2026-03-27

### Fixed
- Added wikilink convention to `CLAUDE.md` Conventions section and `update-doc` skill-spec (v3)
- User-generated content now explicitly uses `[[wikilinks]]` for cross-references; frontmatter stays plain strings; skill-specs stay portable (no wikilinks)

## [0.3.0] - 2026-03-26

### Added
- Productivity system: captures, backlog, and tasks pipeline
- `daily-capture` skill-spec — quick append of ideas/notes to daily capture file
- `backlog-add` skill-spec — add ideas to backlog for future refinement
- `backlog-review` skill-spec — list and triage backlog items
- `task-define` skill-spec — convert backlog items into defined, actionable tasks
- `task-list` skill-spec — list pending tasks and combined daily briefing with calendar
- `_captures/` directory for daily notes (append-only, one file per day)
- `_backlog/` directory with `_index.md` for idea tracking
- `_tasks/` directory with split indexes: `_index-pending.md` and `_index-done.md`
- New `doc_type` values: `backlog-item`, `task`
- New paths in `config.json`: `captures`, `backlog`, `tasks`

## [0.2.3] - 2026-03-26

### Fixed
- Replaced personal project references in skill-spec examples with generic placeholders
- Added `.git_credentials_input` to `.gitignore` (contained local system paths)

### Changed
- `review-contribution` skill now requires all examples to be 100% generic — no real project names, client names, or user-specific knowledge

## [0.2.2] - 2026-03-26

### Fixed
- CHANGELOG update is now a required step in contribution process (CONTRIBUTING.md, PR template, review-contribution skill)
- Added release process documentation to CONTRIBUTING.md

## [0.2.1] - 2026-03-26

### Fixed
- Quickstart Step 3 now explicitly asks user to provide API key and retains it for MCP configuration
- Quickstart Step 5 rewritten as imperative — agent executes MCP config instead of showing a JSON block
- Added Step 5c for skill installation via `skill-creator` or manual fallback

## [0.2.0] - 2026-03-25

### Added
- `CONTRIBUTING.md` with contribution guidelines, conventions, and review process
- `review-contribution` skill-spec for AI-assisted PR review and security scanning
- Pull request template (`.github/PULL_REQUEST_TEMPLATE.md`)
- Issue templates: skill proposal, bug report, area type proposal
- `CHANGELOG.md`

## [0.1.0] - 2026-03-23

### Added
- Initial vault template structure
- 7 core skill-specs: session-boot, session-end, role-load, role-save, area-create, load-context, update-doc
- 4 area templates: project, study, knowledge, personal
- Roles system with auto-generated index
- `CLAUDE.md` entry point with session protocol
- Interactive quickstart guide (`_system/quickstart.md`)
- Vault configuration template (`_system/config.json`)
