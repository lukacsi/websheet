# WebSheet UX Tickets

Actionable tickets based on the visual UX review (`review/UX-REVIEW.md`). Each is scoped for one plan+implement cycle. Ordered by impact.

---

## UX-01: Combat Stats Hero Treatment

**Review finding:** "These elevated Paper boxes are the right concept but they all have identical visual weight. AC should be the most prominent defensive stat. HP should scream louder than Prof. or Level. Currently they're 8 identical boxes in a row." Also: "The up/down chevrons are tiny and hard to hit. For HP, bigger +/- buttons or direct keyboard input would be faster."

**Files:** `src/components/sheet/CombatSidebar.tsx`

**Changes:**
- Replace `auto-fill` grid with intentional layout — HP/AC as visually dominant (larger inputs, bolder labels), secondary stats (Speed, Init, Prof, Level) smaller below
- Group HP/MaxHP/TempHP as one visual cluster — HP is the hero value, Max and Temp are secondary
- AC gets distinct treatment (thicker border or shield-like shape)
- HP gets bloodRed border accent when below max (review noted this is missing)
- Consider larger +/- controls or quick-adjust buttons for HP (the most-clicked control)

**Acceptance:** HP and AC are identifiable in under 1 second without reading labels. HP has bigger touch targets than Prof Bonus.

---

## UX-02: Combat Quick Reference Panel

**Review finding:** "The paper sheet puts attacks, spellcasting, features, and equipment all on pages 1-2. WebSheet requires tab-switching for the most combat-critical information." Specific failures on the 2-second test: attack bonus (hidden in Combat tab), spell slots (hidden in Spells tab), key features like Second Wind (hidden in Features tab).

**Verdict from review:** **Redesign** — the only Redesign-level finding.

**Files:** `src/pages/CharacterSheet.tsx`, new component `src/components/sheet/QuickReference.tsx`

**Changes:**
- Add a persistent quick-reference strip between CombatSidebar and the tabs (or above CombatSidebar)
- Shows: best attack bonus + damage, spell save DC + available slots summary (dots/pips per level), key resource with uses remaining (e.g., "Second Wind 1/1")
- Compact — one or two rows, not a full panel. Think "combat HUD"
- Clicking any element in the quick ref jumps to the relevant tab
- Slot pips are interactive — click to mark used without switching to Spells tab

**Acceptance:** A player can answer "what's your attack bonus?" and "any spell slots left?" without switching tabs.

---

## UX-03: Wizard Sticky Navigation + Empty States

**Review finding:** "On a 1080p screen the Back/Next buttons scroll off. The buttons should be sticky at the bottom." Also: Steps 1, 2 (empty), 3 (empty) are "desolate" — "Two text inputs floating in space."

**Files:** `src/pages/CreateCharacter.tsx`, `src/components/create/StepBasics.tsx`

**Changes:**
- Make Back/Next/Create button row sticky at bottom of viewport (`position: sticky; bottom: 0`) with a subtle top border/shadow to separate from scrolling content
- Step 1 (Basics): make character name input larger (it's the character's identity), add brief flavor intro text. Consider moving alignment and edition here to fill the step
- Steps 2/3 empty states: add a brief prompt ("Select a class to see its features and abilities") instead of just a lone dropdown
- Wrap step content in a `cardStyle` container for visual separation from the stepper

**Acceptance:** Back/Next are always visible on data-heavy steps. No step feels empty or broken.

---

## UX-04: Inventory Layout Bug + Currency Fix

**Review finding:** "There's a gold horizontal scrollbar visible at the bottom of the inventory area. This indicates the content is overflowing its container. This is a layout bug." Also: "CP wraps to a second line below. This is a layout break — all 5 should be in one row."

**Files:** `src/components/sheet/InventorySection.tsx`, `src/components/sheet/CurrencySection.tsx`, `src/pages/CharacterSheet.tsx`

**Changes:**
- Fix the inventory container overflow causing horizontal scrollbar — likely a table or inner element exceeding the grid column width
- Fix CurrencySection so all 5 coin types (PP/GP/EP/SP/CP) stay in one row — reduce input widths or switch to a more compact layout
- Verify the 7/5 grid split between inventory and currency is working as intended on all viewport sizes

**Acceptance:** No horizontal scrollbar on inventory tab. All 5 currency inputs visible in one row.

---

## UX-05: Header Declutter

**Review finding:** "This feels like a dumping ground for everything else" (second header row). Also: "'New' is a status indicator but reads as a button. 'Create' is the actual save button. Confusing pairing." Rest buttons are "important gameplay actions buried between UI controls."

**Files:** `src/pages/CharacterSheet.tsx`

**Changes:**
- **Row 1 — Identity:** Character name prominent. Race/Class/Background as readable text with WikiLinks, not stacked Select+WikiLink combos. Selects move to an edit mode (click-to-edit or gear icon opens edit panel)
- **Row 2 — Actions only:** Rest buttons (prominent — these are gameplay actions), save button, inspiration. Move edition/XP/alignment/player to the About tab — they're set-once values
- Fix the "New"/"Create" confusion — when unsaved, show just "Save" or "Create Character" with no ambiguous status text next to it
- Short Rest / Long Rest buttons get more visual presence — they're important gameplay actions

**Acceptance:** Header has two clear purposes: identity (top) and actions (bottom). No set-once metadata cluttering gameplay view.

---

## UX-06: Death Saves, Hit Dice, Conditions — Right Sidebar Polish

**Review finding:** "Very small. In a tense combat moment, these need to be larger and more tactile." Hit Dice section: "Just a '+' button with no context. No die type shown, no count." Conditions: "Just '+ condition' button. The empty state doesn't convey what this area does."

**Files:** `src/components/sheet/DeathSavesSection.tsx`, `src/components/sheet/HitDiceSection.tsx`, `src/components/sheet/ConditionsSection.tsx`

**Changes:**
- Death Saves: larger checkboxes (size "sm" or "md" instead of "xs"). Consider clickable circles instead of tiny checkboxes
- Hit Dice: show die type and remaining/total count even with no entries. Empty state should say "No hit dice — add from class" not just a "+" button
- Conditions: empty state text like "No active conditions" instead of just the "+ condition" button floating alone
- Reorder right sidebar sections by gameplay frequency: Senses (top), Conditions, Hit Dice, Death Saves. Move Proficiencies & Languages to About tab
- "Proficiencies & Languages" title wraps to two lines — abbreviate or move section entirely

**Acceptance:** Death save checkboxes are easy to hit under stress. Hit dice section is understandable without prior knowledge. Empty conditions section doesn't look broken.

---

## UX-07: Home Page — Action Hierarchy + Empty State

**Review finding:** "All three cards compete equally. The primary path (Wizard) should dominate." Also: "No empty state for Recent Characters — just nothing."

**Files:** `src/pages/Home.tsx`

**Changes:**
- Guided Create as hero — larger card or prominent CTA, `elevatedStyle`, filled gold button. Could include a brief feature list
- Quick Create and Load as secondary — smaller, `cardStyle`, subtle buttons. Fix: "Blank Sheet" and "Load Character" light buttons "read as disabled/ghost buttons"
- Recent Characters empty state: "No characters yet — create your first one" with a link to the wizard
- Reduce title dominance on repeat visits — it's meaningful on first visit, dead weight after
- Bump card description text contrast (review noted "borderline for readability")

**Acceptance:** New user immediately sees "Guided Create" as the primary path. Empty state doesn't show a void.

---

## UX-08: Review Step Bugs

**Review finding:** "Athletics is listed twice" (data bug). "The passphrase section at the bottom feels tacked on. It's a security concern mixed into a character review." Derived stat labels "too small — HP and AC need to be instantly scannable." Em-dash styling in Bonus column is inconsistent.

**Files:** `src/components/create/StepReview.tsx`, character builder logic

**Changes:**
- Fix duplicate skill bug — Athletics appears twice when selected from both class and background. Deduplicate the skills list before display
- Increase derived stat label size — HP, AC, Initiative labels are squinting-small
- Standardize em-dash styling in the Bonus column (currently some appear gold, some neutral)
- Separate passphrase from review — either a final Step 7, or a modal/prompt on "Create Character" click

**Acceptance:** No duplicate skills. Derived stats are scannable. Passphrase is a separate interaction from character review.

---

## UX-09: Wiki Link Graceful Degradation

**Review finding:** "When hovering over 'acrobatics' in the skills table, the hover card shows just 'Not found' in a small popover. This suggests the wiki data isn't loaded." "Skills should either have wiki descriptions or not be WikiLinks at all."

**Files:** `src/components/wiki/WikiLink.tsx`, `src/components/sheet/SkillsSection.tsx`

**Changes:**
- WikiLink should check if the entity exists before rendering as a link. If no wiki data: render as plain text (no dotted underline, no hover card)
- Alternatively: add skill descriptions to the wiki data so they resolve properly
- At minimum: "Not found" hover cards should not appear — either show content or show nothing

**Acceptance:** No "Not found" tooltips anywhere in the app. Every WikiLink either resolves to content or renders as plain text.

---

## UX-10: Load Page — Default Content + Polish

**Review finding:** "Stark. Title + search bar + button. That's it. Feels unfinished." No indication of what the search does. No pre-populated character list.

**Files:** `src/pages/LoadCharacter.tsx`

**Changes:**
- On page load: show all characters (or recent ones) — don't wait for a search query
- Search filters the existing list inline (search-on-type instead of click-to-search)
- Add placeholder help text: "Search by character name..."
- Passphrase prompt: add a lock icon, make it feel more intentional (review suggested "modal or overlay")
- Consider making Load a modal/drawer from the home page instead of a full page — reduces navigation friction

**Acceptance:** Characters are visible on page load. Searching filters in real-time. The page doesn't feel empty.

---

## UX-11: Color Cleanup — Stale Values

**Review finding:** Spotted indirectly — `c="dimmed"` in skills section, `color="dimmed"` on conditions button.

**Files:** Multiple — grep across `src/`

**Known instances:**
- `src/components/sheet/SkillsSection.tsx:56` — `c="dimmed"` for zero modifiers
- `src/components/sheet/ConditionsSection.tsx:59` — `color="dimmed"` on `+ condition` button
- Any remaining `"teal"` in AbilityBlock colors (line 13 — `dex: 'var(--mantine-color-teal-8)'`)
- Any remaining `"blue"` in AbilityBlock colors (line 14 — `int: 'var(--mantine-color-blue-8)'`)
- Any remaining `"violet"` in AbilityBlock colors (line 15 — `wis: 'var(--mantine-color-violet-8)'`)

**Changes:**
- Replace `"dimmed"` with `parchment.5` or `parchment.6`
- Evaluate ability border colors — are teal/blue/violet intentional design choices or leftovers?
- Full grep sweep for stray Mantine defaults

**Acceptance:** Zero `"dimmed"` in component props. All color choices are intentional theme colors.

---

## Priority Order

| # | Ticket | Impact | Verdict |
|---|--------|--------|---------|
| 1 | ~~UX-01~~ | ~~Combat stats = #1 viewed element during play~~ | **Done** |
| 2 | UX-02 | Combat info behind tabs = worse than paper | **Redesign** |
| 3 | UX-03 | Wizard nav scrolls off + empty steps look broken | Fix |
| 4 | ~~UX-04~~ | ~~Inventory overflow = visible layout bug~~ | **Done** |
| 5 | UX-05 | Header clutter hurts whole sheet perception | Fix |
| 6 | UX-06 | Right sidebar components too small/empty | Fix |
| 7 | UX-07 | Home page = first impression, currently flat | Fix |
| 8 | UX-08 | Review step has actual data bugs | Fix |
| 9 | UX-09 | "Not found" tooltips look broken | Fix |
| 10 | UX-10 | Load page feels unfinished | Fix |
| 11 | UX-11 | Color consistency sweep | Fix |
