---
skill: load-context
audience: ai
version: 1
last_updated: 2026-03-23
---

# Skill: load-context

## Purpose

Load a specific file from the vault on demand during an active session. This is the dynamic loading mechanism — bring in only what's needed, when it's needed.

## When to use

- AI needs info not loaded during boot
- User references a file or topic: "check the auth decision", "what does architecture.md say?"
- Cross-cutting area consultation: "how do we handle errors in the TS knowledge base?"
- Exploratory search: "do we have anything about rate limiting?"

## Procedure

### Direct mode (known path)

1. Receive file path (relative to vault root)
2. Read the file
3. Apply audience compression:
   - `audience: ai` → return as-is
   - `audience: human/shared` → extract key info:
     - Preserve: code, configs, technical data, dates, names, decisions with rationale
     - Compress: long explanations → 1 sentence, decorative lists → key items only
     - Omit: greetings, disclaimers, redundancy, padding
     - Never omit: warnings, breaking changes, dependencies, constraints
4. Present relevant content to current context

### Search mode (keyword)

1. Execute vault search with the query
2. Filter results:
   - Prioritize files in the active area
   - Then files in declared cross-cutting areas
   - Deprioritize out-of-scope results (unless highly relevant)
3. Present results to user (title + snippet)
4. If user selects one, load it (direct mode)

### Cross-cutting mode

1. For cross-cutting area queries:
   - First read that area's `_index.md` only (lightweight summary)
   - If more depth needed, load specific files from that area
2. Never load an entire cross-cutting area — only what's punctually needed

## Notes

- This is the workhorse skill. It gets used many times per session, often implicitly.
- Track what's been loaded to avoid re-reading files already in context.
- For large files (>3000 estimated tokens), load by section and ask if more is needed.
