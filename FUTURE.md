# WebSheet — Backlog

## Schema / Types
- Add `Feat` type and PocketBase collection (needed for level-up and backgrounds)
- Add `subraces` PocketBase collection (currently only in TS type, no storage)
- Add `page` field to PB spells collection (exists in TS type but not in PB)
- Add feats importer to import-5etools.ts (data/feats.json)
- Add optional features importer (fighting styles, invocations — data/optionalfeatures.json)

## Infrastructure
- Fix PocketBase JS migrations to auto-apply (current Docker image doesn't run them — using setup script as workaround)
- Add 404 / catch-all route with error boundary
- Batch PB API calls in importer (currently 1 request per record — could batch for speed)

## Phase 2: Character Creation
- Stat generation UI (point buy, standard array, manual/rolled with dice roller)
- Race picker with trait preview and ability bonus application (2014 + 2024)
- Class picker with starting proficiencies, equipment, features
- Background picker
- Derived stats calculation engine (modifiers, saves, skills, AC, HP, initiative, passive perception)
- Character summary/review step
- Save to PocketBase with name + passphrase

## Phase 3: Character Sheet View
- Responsive layout: single-page desktop, tabbed mobile
- Ability scores, skills, saves, combat stats
- Class features + racial traits with inline 5e.tools entry rendering
- Proficiencies and languages
- Load character by name + passphrase

## Phase 4: Spell Management
- Spell list by level with full inline descriptions
- Spell slot tracking (expend/recover)
- Prepared spell toggling, concentration tracking
- Spell search from full 5e.tools database

## Phase 5: Inventory & Equipment
- Item list with descriptions, weight/encumbrance, attunement (3 max)
- Equipment slots (worn/wielded vs carried)
- Currency tracking with auto-conversion

## Phase 6: Combat & Gameplay
- HP/temp HP, death saves, condition tracking
- Round tracker with action economy (action/bonus/reaction)
- Initiative roller
- Short/long rest with auto-reset of resources
- Tracked resources for limited-use features

## Phase 7: Dice Roller
- Inline dice (d4-d100), modifier-aware rolls
- Advantage/disadvantage toggle, roll history
- Integrated into attack/save/check buttons

## Phase 8: Level-Up
- Guided flow: class pick (multiclass), HP (roll or average)
- Feature selection (subclass, ASI/feat, spells)
- Auto-update derived stats, show diff

## Phase 9: Homebrew Editor
- Custom item creator (start here), then spells, races, subclasses
- Export/import homebrew as JSON
- Share between characters

## Phase 10: Export & Polish
- JSON and PDF export
- Auto-save (debounced writes)
- Campaign roster (multiple characters)
- Responsive polish, parchment theme refinement
