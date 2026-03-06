# Notes — WebSheet

## 2026-03-06 — Project created, Phase 1 foundation complete

**Context:** Need a D&D 5e character sheet web app for a play group (4+ players). Existing tools (D&D Beyond, DiceCloud) have gaps: rigid homebrew, no offline, poor formula transparency. Personal use — 5e.tools data is fair game.

**Analysis:** Researched 5e.tools data structure (flat JSON files, no API, custom `{@tag}` markup in entries), existing apps (D&D Beyond rigid/paywalled, DiceCloud flexible but steep), and tech stacks. PocketBase chosen over Dexie for multi-user access without accounts. Mantine v8 for data-dense UI with built-in dark mode, tabs, modals.

**Decisions:**
- React + Vite + TypeScript + Mantine v8 + PocketBase (Docker)
- Simple auth: character name + passphrase (no user accounts)
- Both 2014 ("classic") and 2024 ("one") edition support
- 5e.tools data seeded into PocketBase via one-time import
- 10-phase implementation plan (foundation → creation → sheet → spells → inventory → combat → dice → level-up → homebrew → export)
- PB collections: spells, classes, subclasses, class_features, races, items, backgrounds, characters

**Done:**
- Project scaffolded with all dependencies
- PocketBase running in Docker, 8 collections created
- TypeScript types for all D&D entities
- Dark parchment theme (Cinzel/Crimson Text fonts)
- App shell with routing
- Full audit completed, issues fixed
