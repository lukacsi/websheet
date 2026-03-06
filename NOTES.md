# Notes — WebSheet

## 2026-03-06 — _copy resolution, level selector, complete data import

**Context:** ~1,440 entities (mainly subclasses, monsters, items) were skipped during import due to 5e.tools `_copy` templating mechanism. Creator needed level selector for multi-level characters.

**Decisions:**
- Built generic `resolveCopy` engine handling all `_mod` operations (replaceArr, appendArr, removeArr, insertArr, replaceTxt, setProp, etc.)
- Iterative chain resolution (max depth 3 in practice, 315 chains found)
- Cross-file resolution for directory-based data (spells, classes, bestiary)
- Subclass upsert key changed from name+source to name+source+className+classSource (124 pairs collided)
- Item `@item` tag now falls back to `item_groups` collection
- Level selector uses NumberInput (1-20), inline progression table shows only selected levels

**Done:**
- 1,438 new entities imported (total PB: 14,709 across 36 collections)
- StepClass restructured: class+level selectors, progression table, expanded features inline
- Character builder: multi-level HP, proficiency bonus, hit dice, spell slots
- Item groups now store `items` list, rendered as clickable WikiLinks

## 2026-03-06 — 5e.tools data importer complete, Phase 1 done

**Context:** Needed to seed PocketBase with D&D 5e data from 5e.tools for character creation and gameplay.

**Decisions:**
- Sparse git clone of 5etools-mirror-3 (data/ only, ~few hundred MB vs full repo)
- Skip foundry.json files (VTT stubs, no actual spell/item data)
- Skip `_copy` entries (5e.tools internal templating)
- PocketBase number fields can't be `required` (rejects `0` — cantrips are level 0)
- Upsert by name+source for idempotent re-imports

**Done:**
- `scripts/import-5etools.ts` with --update and --only flags
- 6016 records: 912 spells, 2220 class entities, 141 races, 2594 items, 149 backgrounds
- Re-run safe (~5s full import)

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
