# Notes — WebSheet

## 2026-04-16 — Notes system full redesign + code review

**Context:** User wanted to "nail note taking and multiclassing". Did comprehensive code review, then reenvisioned notes from scratch.

**Analysis:**
Code review found 5 HIGH severity issues:
1. Passphrase: unsalted SHA-256 (dictionary-attackable)
2. `save` closure reads stale `savedId` instead of `savedIdRef.current`
3. `notes: string | CharacterNotes` union leaks PB serialization into domain
4. `LoadCharacter.tsx:74` uses inline escape, not shared `escapeFilter`
5. `CreatureDetail.tsx` uses `any` — array maps throw if fields absent

Note-taking redesign evolved through several iterations → ended at Option B:
- **Unified entry pool** (`CharacterNotes.entries: NoteEntry[]`) — NPCs, quests, loot, locations, notes, session logs all share one array
- **Hierarchy via `links` with `kind='contains'`** (not `parentId`) — same entry can appear under multiple parents
- **Semantic relationships** use the same `links[]` with free-text `kind`
- Two views: **List** (flat, searchable, filtered by type chips) + **Outline** (tree from `contains` links)
- **EntryDrawer** for deep detail editing with tags, links, backrefs, "Nested under" panel
- Quick-capture bar at top (session by default, any type pickable)
- General scratchpad collapsible at bottom

Multiclassing: seven `.classes[0]` hardcodes across the app — data model supports multiclass but UI doesn't. Deferred to next session.

**Decisions:**
- Removed `MindMap.tsx` + `MindMapNode` from live data model (kept types for legacy migration)
- Removed `parentId`/`order` from `NoteEntry` — hierarchy is just a special link kind
- `contains` links filtered out of drawer's "Linked to" panel (shown in "Nested under" instead)
- Migration chain handles 4 shapes: raw string → per-type strings → per-type arrays → unified pool with contains links

**Done:**
- Code review saved → `docs/code-review-2026-04-15.md`
- Roadmap saved → `docs/roadmap-notes-and-multiclass.md`
- Created: `EntryDrawer.tsx`, `Outline.tsx`, `Outline.module.css`, `QuickSearch.tsx`, `Lookup.tsx`, `notes-migration.ts`
- Rewrote: `NotesSection.tsx`, `types/character.ts`, `CharacterSheet.tsx`, `hooks/useCharacterSheet.ts`
- Deleted: `MindMap.tsx`, `MindMap.module.css`
- Build green throughout (880-885kB, same warning about code-splitting)

**Outstanding (next session):**
- Commit current changes (15 modified + 6 new src files, plus 2 new docs files)
- Address the 5 HIGH review issues
- Multiclass de-hardcode (7 `.classes[0]` sites in `CharacterSheet.tsx`, `useCharacterSheet.ts`, `FeaturesSection.tsx`, `CombatFeaturesSection.tsx`)
- Level-up flow
- Test the outline migration path with real existing data
- Bundle size optimization (875kB → code-split candidates: Mantine icons, wiki detail views)

---

## 2026-03-09 — UX Review Round 2 (Functional Testing, ALL 13 Classes)

**Context:** Professional UX/UI review of WebSheet post-redesign. 13 rounds of testing covering all D&D 5e classes. Goal: find all functional gaps, edge cases, and automation opportunities.

**Analysis:**
25 functional gaps found (G1-G25) across 3 layers:
1. **Data persistence** — attacks lost on save (G8, confirmed 11/11 classes). Resources, spells, items persist fine.
2. **Data→Stats pipeline missing** — app stores correct data but doesn't derive stats: equipped armor doesn't affect AC (G19), class features don't modify saves/speed/AC (G6/G7/G20), attack bonus not computed (G23), resources not auto-created (G11), subclass features not loaded for 8/12 subclasses (G5).
3. **Wizard multi-level choices** — wizard handles Lv1 choices but ignores ASIs (G3), invocations (G16), fighting style (G24), pact boon (G18), oath spells (G22), equipment (G4).

Key discoveries:
- G1 (review wrong level): **13/13 classes** — universal bug, always shows Level 1
- G8 (attacks lost): **11/11 tested** — universal, resources always persist (different save paths)
- G5 (subclass features): 4/12 work (Evoker, Thief, Champion, Gloom Stalker), 8/12 fail. Root cause: PocketBase query failures for certain feature names (console errors on "Disciple of Life", "Circle Forms")
- Standard spell slots DO auto-populate correctly for all casters
- HP auto-calculation correct across all 13 classes
- Search ranking alphabetical not relevance — affects both spells AND items (G14)

**Decisions:**
- Automation should use "defaults with overrides" pattern — auto-compute AC/saves/attack bonus but let player edit
- "auto: +5" pattern (already used for Prof Bonus) is the right model for all derived stats
- Priority: fix persistence (G8) > fix review level (G1) > load subclass features (G5) > connect armor to AC (G19)

**Done:**
- `review/UX-REVIEW-2.md` — comprehensive review doc (~870 lines), 25 gaps, 13 rounds, final gap analysis
- 12 test characters created covering all classes (Monk, Warlock, Paladin, Wizard, Rogue, Druid, Fighter, Barbarian, Ranger, Bard, Cleric, Sorcerer)
- 60+ screenshots documenting all findings

## 2026-03-09 — Character Management Improvements + Review

**Context:** Four quality-of-life improvements needed: optional passphrase in wizard, passphrase for blank sheets, export/import JSON, localStorage-based recent characters (PB sort was broken). After implementation, thorough browser review uncovered additional bugs.

**Decisions:**
- Passphrase validation: empty = skip, non-empty = require 4+ chars + confirmation match (both wizard and blank sheet modal)
- Export strips PB metadata AND passphraseHash; import strips passphraseHash so imported characters are unprotected
- Recent characters stored in localStorage (max 8, deduped by ID) — tracked on both load and save
- Auto-save guard: new blank sheets must go through Create button + passphrase modal before first save (uses `savedIdRef` to avoid stale closure)
- 2024 (XPHB) race languages: 5e.tools source data omits `languageProficiencies` for 2024 content — fixed at import level by defaulting to Common + choose 2 standard languages

**Done:**
- Optional passphrase in wizard (skip button, conditional validation)
- Passphrase modal for blank sheet creation (skip or set)
- Export JSON button on character sheet, Import button on Load page
- localStorage recent characters on Home page
- Fixed: auto-save bypassed passphrase modal on blank sheets
- Fixed: export leaked passphraseHash in JSON
- Fixed: 2024 races had no language data — import now defaults Common + 2 choices
- Full browser review: wizard flow, blank sheet flow, export/import, passphrase lock/unlock, recent characters

## 2026-03-09 — UX Tickets Implementation (UX-01 through UX-06)

**Context:** 11 UX tickets from review, working through them by priority. 4 of the top 6 done in previous session (UX-01, UX-02, UX-04 already committed), continuing with remaining tickets.

**Decisions:**
- UX-05 identity row: click-to-edit toggle pattern (WikiLinks default, pencil icon reveals Selects) — first edit-mode pattern in the codebase
- UX-05 moved edition/XP/alignment/player to About tab under "Character Details" section
- UX-06 sidebar reorder by gameplay frequency: Senses > Conditions > Hit Dice > Death Saves
- UX-06 moved Proficiencies & Languages to About tab (was wrapping to 2 lines in sidebar)
- Hit dice compacted to 2-row layout: display row (badge + remaining) + edit row (labeled inputs)

**Done:**
- UX-03: Wizard sticky nav bar + empty state prompts + Cinzel name input + cardStyle wrapper
- UX-05: Header declutter — identity WikiLinks with edit toggle, prominent Rest buttons, clean Save/Create
- UX-06: Right sidebar polish — larger death saves, compact hit dice, empty states, sidebar reorder
- 6 of 11 tickets now complete (UX-01 through UX-06, skipping UX-04 done earlier)

## 2026-03-09 — UX Review + Ticket System

**Context:** UI redesign complete (Phases 1-7), needed professional UX assessment to identify remaining issues.

**Decisions:**
- Created structured ticket system (`docs/ux-tickets.md`) with 11 prioritized tickets from review
- Added workflow convention: commit after each ticket, mark progress in tickets file
- UX-01 (combat stats) needs planning before implementation — layout restructure is non-trivial

**Done:**
- Full visual UX review: 16 screenshots, comprehensive review doc (`review/UX-REVIEW.md`)
- 11 UX tickets created, priority-ordered by gameplay impact
- UX-04 (inventory overflow + currency wrapping) — fixed and committed
- Workflow section added to CLAUDE.md

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
