# Notes — WebSheet

## 2026-03-08 — Phase 7: Final Polish — Full App Color Harmonization

**Context:** Phases 1-6 themed all sheet components, but pages, wiki drawers, create wizard, and global component defaults still used Mantine blue/green/orange defaults and `c="dimmed"` text.

**Decisions:**
- Theme-level component overrides for Select (warm dropdown), Loader (gold), Notification/Alert (warm containers), SegmentedControl (warm indicator) — fixes all instances app-wide without per-component edits
- LoadCharacter passphrase card switched from inline style to shared `elevatedStyle` constant
- `c="dimmed"` distinction maintained: `parchment.5` for structural labels (StepReview field names), `parchment.6` for secondary/supplementary text (descriptions, fallbacks, em-dashes)

**Done:**
- 22 files modified: theme index, 4 pages, 10 wiki components (including bonus ClassDetail.tsx), 7 create flow components
- Zero `c="dimmed"` remaining in entire codebase
- Zero hardcoded Mantine color names (`blue`/`green`/`orange`/`yellow`/`red`) remaining (CreatureDetail `red.8` dividers preserved — intentional statblock convention)
- Type-check clean
- UI redesign Phases 1-7 complete

## 2026-03-08 — Phases 5-6: Sheet Components Fully Themed

**Context:** Phases 1-4 had styled theme foundation, layout, core stats, and gameplay. Remaining sheet components (inventory, resources, spellcasting slots, currency, proficiencies, personality, backstory, notes, appearance) still used default Mantine styling. Badge/button colors and `c="dimmed"` text were inconsistent across all sheet components.

**Decisions:**
- Badge color system established: `inkBrown` for source/category, `gold` for special/notable, `bloodRed` for danger/failure, `parchment` for neutral
- `c="dimmed"` replaced with `parchment.5` (structural labels) or `parchment.6` (secondary/supplementary text) — semantic distinction
- Spell school colors remapped to theme while preserving identity (Abjuration→inkBrown, Evocation→bloodRed, Transmutation→gold; Conjuration/Enchantment/Illusion/Necromancy kept)
- Text-heavy sections use `variant="unstyled"` textareas + warm uppercase labels — consistent with inline-editing pattern

**Done:**
- Phase 5: 5 files — warm table headers, equipped/attuned row borders, depleted resource dimming, theme-var coin colors, warm proficiency labels
- Phase 6: 18 files — warm textarea labels, unstyled textareas, portrait card border, school color remap, RemoveButton→bloodRed, DeathSaves→bloodRed, all feature badges→inkBrown/gold, zero `c="dimmed"` remaining in sheet components, zero hardcoded Mantine color names in sheet components
- Phase 7 prompt written (`.claude/phase7-prompt.md`) — covers remaining pages, wiki details, create flow, theme-level overrides
- Type-check clean after all changes

## 2026-03-08 — UI Audit Complete + Redesign Brief

**Context:** 10-batch UI audit complete. All 16 audit items resolved (done or explicitly skipped). Codebase is clean — shared style constants, extracted hooks, decomposed components, CSS modules, no dead code.

**Decisions:**
- Skipped 4 items with rationale: theme component overrides (risk to wizard), useListCrud (too specialized), CurrencySection colors (domain-specific), StatBox promotion (styling differs)
- Next step: full visual redesign. Wrote comprehensive prompt at `docs/redesign-prompt.md` covering all pages, components, constraints, and design direction ("fantasy-functional")

**Done:**
- Batch 10: CSS module for CharacterSheet layout, `darkDrawerStyles`/`darkCardStyle` constants, dead `theme.other` removal, FUTURE.md audit section finalized
- Batches 7-10 committed (30 files, net -788 lines)
- Redesign prompt written — ready for a fresh session

## 2026-03-08 — UI Audit & Streamlining Plan

**Context:** Full audit of the character sheet UI — all 19 sheet components, 4 pages, AppShell, theme config. Goal: identify redundancy, inconsistency, complexity, UX friction, and theme drift before streamlining.

**Analysis:**

Key findings across 3 categories:

**Redundancy (high impact):**
- Dark Paper style (`dark-7` bg + `dark-5` border) copy-pasted ~12 times across components
- `typeof v === 'number' ? v : fallback` NumberInput guard repeated ~20 times
- `styles={{ input: { textAlign: 'center' } }}` repeated ~19 times
- CRUD list operations (update/add/remove by index) identical in HitDice, Attacks, Resources
- Array toggle pattern (`includes ? filter : [...arr, item]`) in 5+ places
- Two different remove button patterns (ActionIcon vs Badge) doing the same thing

**Theme drift:**
- AppShell uses raw hex colors (`#1e1a15`, `#3d3227`, `#1a1612`) instead of theme tokens
- global.css duplicates theme tokens as hardcoded hex
- CurrencySection has 5 hardcoded hex colors for coin badges
- `theme.other` tokens (`parchmentBg`, `parchmentBgLight`, `parchmentBorder`, `textMuted`) defined but never consumed
- No `components` theme overrides — Mantine defaults to blue-gray dark palette, not warm brown
- No `primaryShade` set

**Complexity / UX:**
- CharacterSheet.tsx is 854 lines (layout + state + sub-components + inline `<style>`)
- FeaturesSection.tsx is ~553 lines with `backgroundName` unused prop
- Right sidebar clipped off-screen in all screenshots
- HitDice row has 8 elements in one horizontal Group
- Embedded `<style>` tag for responsive layout instead of CSS modules

**Decisions:**
- Audit complete, streamlining plan created with 16 prioritized items
- Quick wins first (shared constants, helpers), then medium refactors (shared components), then larger decompositions
- Dead code identified: `backgroundName` prop, `theme.other.parchmentBgLight`, `theme.other.textMuted`

**Done:**
- Full Phase 1-3 audit report produced

## 2026-03-07 — Sandbox character sheet page

**Context:** Needed a character sheet page that works as a sandbox — all fields editable, no rule enforcement, but with auto-calculated modifiers and full wiki integration. Also needed manual character creation without the wizard.

**Decisions:**
- React state (not React Hook Form) for live-editing sheet, debounced auto-save to PB
- `/character/new` for blank sheet creation, `/character/:id` for editing — same component detects mode
- PB-backed searchable Selects for race/class/background with auto-populate of proficiencies, languages, speed, hit dice, spellcasting ability on selection
- WikiLinks on skills, conditions, tools, languages, spells, items, race/class/background — clicking opens entity detail drawer
- Short Rest resets short-rest resources; Long Rest restores HP, spell slots, hit dice (half level), clears conditions/death saves, resets all resources
- Subraces shown in race dropdown as separate "Lineages" entries (stored as subraceId/subraceName)

**Done:**
- 13 section components in `src/components/sheet/`
- Full character sheet: abilities (6 scores + mods), combat (HP/AC/init/speed/level), saving throws, skills (prof + expertise), spellcasting (ability/DC/attack/slots), spells (searchable PB picker, grouped by level), inventory (PB search + custom), currency, resources (tracked with reset triggers), proficiencies & languages, conditions, death saves, hit dice, notes
- Home page: 3 cards (Guided Create, Quick Create, Load)
- `updateRecord` added to PB API, `useSpells` and `useItems` hooks
- Fixed production build issues (strict tsconfig)

## 2026-03-06 — Character creation choices, creature stat blocks, WikiLink fix

**Context:** Many 5e.tools choice points were lost during import — class tool choices were just text, background language choices dropped, race resistance choices lost, creature tags showed no stat block. WikiLink clicks not working in wizard feature entries.

**Decisions:**
- Class tool proficiencies are raw text strings (not structured objects like backgrounds/races) — parse with regex after stripping `{@item}` tags, handle "or" patterns (Monk) by emitting both types with count 1
- Background/race tool/language/resistance choices use structured `choose`/`anyStandard`/`anyArtisansTool` objects — parse directly
- Creature stat block uses standard D&D layout with red dividers, ability score grid, conditional sections
- WikiLink click handler moved from Anchor inside HoverCard.Target to outer wrapper span — HoverCard.Target was interfering with click event propagation

**Done:**
- PB migration adding choice fields to classes/backgrounds/races, featureChoices to characters, 12 stat block fields to creatures
- Import script: `parseProfChoices()`, `parseProfChoicesFromText()`, `parseLanguageChoices()` + creature stat fields
- 3 new picker components: ToolProficiencyPicker (queries PB items), LanguagePicker (queries PB languages), ResistancePicker
- 5 new wizard form fields with schema validation, step field mapping, defaults
- Pickers integrated into StepClass, StepBackground, StepRace with reset-on-change
- Character builder merges chosen tools/languages into character record
- CreatureDetail.tsx: full stat block (AC, HP, speed, abilities, saves, skills, DR/DI/DV, CI, senses, CR/XP, traits, actions, bonus/reactions/legendary)
- WikiLink click fix for all entity links

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
