# Changelog

All notable changes to the exo-brAIn template are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
