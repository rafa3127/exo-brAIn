# Changelog

All notable changes to the exo-brAIn template are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
