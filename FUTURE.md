# WebSheet — Backlog

## UI Streamlining (from 2026-03-08 audit)

### Done
- [x] Extract shared style constants (`darkPaperStyle`, `accordionDarkStyles`, 4 input styles, `darkDrawerStyles`, `darkCardStyle`)
- [x] Extract `numOrDefault` helper
- [x] Extract `toggleArrayItem` helper (centralized in `form-helpers.ts`)
- [x] Extract shared `RemoveButton` component
- [x] Promote `SectionTitle` to shared component
- [x] Split FeaturesSection into 4 sub-components
- [x] Fix right sidebar clipping (minmax grid)
- [x] Decompose CharacterSheet (`useCharacterSheet` hook)
- [x] Normalize callback signatures (BackstorySection)
- [x] Replace embedded `<style>` tag with CSS module
- [x] Remove unused `theme.other` dead code
- [x] AppShell already uses CSS variables
- [x] global.css already uses CSS variables
- [x] `primaryShade` already set
- [x] `backgroundName` prop already removed
- [x] `parchmentBgLight` / `textMuted` tokens never existed

### Skipped (with rationale)
- **Theme component overrides** — `darkPaperStyle`/`accordionDarkStyles` constants work; global defaults risk breaking wizard
- **useListCrud hook** — add functions too specialized per component
- **CurrencySection coin colors** — domain-specific, not theme drift
- **StatBox promotion** — AbilityBlock uses different styling; not worth unifying

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
