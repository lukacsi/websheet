# WebSheet UX — Implementation Plan

Based on `docs/ux-tickets.md` and `review/UX-REVIEW.md`. Organized by dependency order — each wave unblocks the next.

## Prerequisites

### Install Playwright
```bash
cd ~/AI/Projects/websheet
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

### Baseline Screenshots
Before any changes, capture baseline screenshots of every page/tab for before/after comparison:
```bash
pnpm exec playwright test tests/screenshots.spec.ts --update-snapshots
```

### Dev Server
Must be running on `http://localhost:5173` throughout. Verify with `curl -s http://localhost:5173 | head -1`.

### PocketBase
Must be running (`docker compose up -d`). Needed for character data in sheet/load pages.

---

## Dependency Graph

```
UX-04 (inventory bug)     ─┐
UX-08 (review bugs)       ─┤── Wave 1: no blockers, quick wins
UX-09 (wiki degradation)  ─┤
UX-11 (color cleanup)     ─┘

UX-01 (combat stats)      ─┬── Wave 2: foundation (parallel)
UX-05 (header declutter)  ─┘
         │
         ├── UX-01 blocks → UX-02 (quick ref needs final CombatSidebar layout)
         ├── UX-05 blocks → UX-02 (quick ref needs header metadata moved out)
         └── UX-05 blocks → UX-06 (both add content to About tab)

UX-02 (quick ref panel)   ─┬── Wave 3: depends on Wave 2
UX-06 (right sidebar)     ─┘

UX-03 (wizard)             ─┐
UX-07 (home page)          ─┤── Wave 4: independent polish
UX-10 (load page)          ─┘
```

---

## Wave 1 — Bug Fixes (no blockers)

Fix visible bugs and inconsistencies. Each is a small, independent task.

### Session 1a: UX-04 — Inventory Layout Bug
- Fix horizontal scrollbar overflow in inventory tab
- Fix CurrencySection CP wrapping to second row
- Files: `InventorySection.tsx`, `CurrencySection.tsx`, `CharacterSheet.tsx`

**Verify:**
1. `pnpm exec tsc --noEmit` — type-check clean
2. Playwright: navigate to `/character/<id>`, click Inventory tab
   - Assert no horizontal scrollbar: `await expect(page.locator('.mantine-Tabs-panel')).toHaveCSS('overflow-x', 'visible')` or screenshot comparison
   - Assert all 5 currency inputs (PP/GP/EP/SP/CP) are in one row: screenshot `page.locator('[data-testid="currency-section"]')` — verify single-row layout
   - Resize viewport to 1024px width, re-check (tablet breakpoint)
3. Screenshot before/after: `tests/screenshots/inventory-tab.png`

**Commit:** `fix: inventory tab overflow and currency row wrapping (UX-04)`

### Session 1b: UX-08 — Review Step Bugs
- Deduplicate skills list (Athletics appears twice)
- Increase derived stat label size (HP, AC too small)
- Standardize em-dash styling in Bonus column
- Separate passphrase from review (move to modal on Create click, or add Step 7)
- Files: `StepReview.tsx`, character builder logic

**Verify:**
1. `pnpm exec tsc --noEmit`
2. Playwright: navigate to `/create`, fill wizard through to Review step
   - Assert skills list contains no duplicates: `const skills = await page.locator('[data-testid="review-skills"] .skill-item').allTextContents(); expect(new Set(skills).size).toBe(skills.length)`
   - Assert derived stat labels are readable: screenshot the derived stats row, visual check for size
   - Assert passphrase is not visible on the Review step (if moved to modal): `await expect(page.locator('input[type="password"]')).not.toBeVisible()`
3. Screenshot: `tests/screenshots/wizard-review.png`

**Commit:** `fix: deduplicate review skills, enlarge stat labels, separate passphrase (UX-08)`

### Session 1c: UX-09 — Wiki Link Degradation
- WikiLink renders as plain text when entity has no wiki data
- Remove "Not found" hover cards entirely
- Files: `WikiLink.tsx`, possibly `SkillsSection.tsx`

**Verify:**
1. `pnpm exec tsc --noEmit`
2. Playwright: navigate to a character sheet
   - Hover over a skill name (e.g., "Acrobatics") in the skills table
   - Assert no "Not found" text appears: `await page.locator('.skill-link').first().hover(); await page.waitForTimeout(500); await expect(page.getByText('Not found')).not.toBeVisible()`
   - If skills are now plain text: assert no dotted-underline styling on skill names that lack wiki data
3. Screenshot: `tests/screenshots/skill-hover.png`

**Commit:** `fix: degrade WikiLinks gracefully when entity has no data (UX-09)`

### Session 1d: UX-11 — Color Cleanup
- Grep and fix all remaining `"dimmed"` → `parchment.5`/`parchment.6`
- Evaluate AbilityBlock border colors (teal/blue/violet)
- Files: multiple, grep-driven

**Verify:**
1. `pnpm exec tsc --noEmit`
2. Grep: `grep -rn '"dimmed"' src/` — assert zero results
3. Grep: `grep -rn "c=\"dimmed\"" src/` — assert zero results
4. Grep: `grep -rn "color=\"dimmed\"" src/` — assert zero results
5. Playwright: navigate to character sheet, screenshot left sidebar (abilities + skills) — visual check that no text appears in Mantine's default gray dimmed color

**Commit:** `fix: replace all remaining dimmed colors with theme values (UX-11)`

---

## Wave 2 — Foundation (unblocks Wave 3)

Two independent sessions. Both must complete before Wave 3 starts.

### Session 2a: UX-01 — Combat Stats Hero Treatment
- Replace auto-fill grid with intentional layout
- HP/AC visually dominant (larger inputs, distinct borders)
- HP group (HP/Max/Temp) as one cluster
- bloodRed border on HP when damaged
- Bigger touch targets for HP adjustment
- Secondary stats (Speed, Init, Prof, Level) smaller row below
- Files: `CombatSidebar.tsx`
- **Blocks:** UX-02

**Verify:**
1. `pnpm exec tsc --noEmit`
2. Playwright: navigate to character sheet
   - Screenshot CombatSidebar area: `tests/screenshots/combat-stats.png`
   - Assert HP input is visually larger than Speed input: compare bounding box heights
     ```ts
     const hpBox = page.locator('[data-stat="hp"]');
     const speedBox = page.locator('[data-stat="speed"]');
     const hpHeight = (await hpBox.boundingBox())!.height;
     const speedHeight = (await speedBox.boundingBox())!.height;
     expect(hpHeight).toBeGreaterThan(speedHeight);
     ```
   - Set HP below Max HP → assert bloodRed border appears on HP box
   - Set HP equal to Max HP → assert no bloodRed border
   - Test at 1920px, 1024px, 768px widths — layout doesn't break
3. Before/after screenshot comparison against baseline

**Commit:** `feat: combat stats hero layout — HP/AC dominant, grouped HP cluster (UX-01)`

### Session 2b: UX-05 — Header Declutter
- Row 1: character name prominent + race/class/background as readable text with WikiLinks
- Row 2: rest buttons + save + inspiration only
- Move edition/XP/alignment/player to About tab
- Fix "New"/"Create" confusion
- Files: `CharacterSheet.tsx`, About tab section
- **Blocks:** UX-02, UX-06

**Verify:**
1. `pnpm exec tsc --noEmit`
2. Playwright: navigate to character sheet
   - Assert edition/XP/alignment/player inputs are NOT in header: `await expect(page.locator('.sheet-header select[data-field="edition"]')).not.toBeVisible()`
   - Assert they ARE in About tab: click About tab, assert fields are present
   - Assert no "New" status text next to save button — only one save/create button visible
   - Assert rest buttons are visible in header row 2
   - Screenshot header: `tests/screenshots/header.png`
3. Navigate to `/character/new` (new character) — assert save button says "Create" or "Save", not both
4. Playwright: navigate to character sheet, click edit trigger for race/class — assert selects appear (edit mode works)
5. Test at 1024px and 768px — header doesn't overflow

**Commit:** `feat: declutter header — identity row + action row, metadata to About tab (UX-05)`

---

## Wave 3 — Core UX Improvements (blocked by Wave 2)

### Session 3a: UX-02 — Combat Quick Reference Panel
**The only Redesign-level item.** Cannot start until UX-01 and UX-05 are done.

- New `QuickReference.tsx` component between CombatSidebar and tabs
- Shows: best attack bonus + damage, spell save DC, slot summary (interactive pips), key resource uses
- Compact 1-2 row strip — "combat HUD"
- Slot pips clickable to mark used without tab switch
- Clicking elements jumps to relevant tab
- Files: new `QuickReference.tsx`, `CharacterSheet.tsx`, `SpellcastingSection.tsx`
- **Blocked by:** UX-01, UX-05

**Verify:**
1. `pnpm exec tsc --noEmit`
2. Playwright: navigate to character sheet with a spellcaster character (has spell slots)
   - Assert quick reference panel is visible between combat stats and tabs
   - Assert spell slot pips are visible without clicking Spells tab
   - Click a slot pip → assert it marks as used (visual change)
   - Click Spells tab → assert the slot change is reflected in the full SpellcastingSection
   - Assert attack bonus is shown (if attacks exist)
   - Assert spell save DC is shown (if spellcasting ability set)
   - Screenshot: `tests/screenshots/quick-reference.png`
3. Navigate to character sheet with a non-caster (Fighter with no spellcasting)
   - Assert quick ref shows attack info but no spell slots
   - Assert panel doesn't show empty/broken sections
4. Navigate to blank sheet (`/character/new`)
   - Assert quick ref is either hidden or shows graceful empty state
5. Test at 1024px and 768px — panel wraps or collapses cleanly

**Commit:** `feat: combat quick reference panel with inline spell slot pips (UX-02)`

### Session 3b: UX-06 — Right Sidebar Polish
Cannot start until UX-05 is done.

- Reorder: Senses (top) → Conditions → Hit Dice → Death Saves
- Move Proficiencies & Languages to About tab
- Death Saves: larger checkboxes (sm/md)
- Hit Dice: show die type + remaining/total even when empty
- Conditions: empty state text "No active conditions"
- Files: `CharacterSheet.tsx`, `DeathSavesSection.tsx`, `HitDiceSection.tsx`, `ConditionsSection.tsx`
- **Blocked by:** UX-05

**Verify:**
1. `pnpm exec tsc --noEmit`
2. Playwright: navigate to character sheet
   - Assert right sidebar section order is Senses → Conditions → Hit Dice → Death Saves:
     ```ts
     const sections = await page.locator('.sidebarRight .section-title').allTextContents();
     expect(sections).toEqual(['Senses', 'Conditions', 'Hit Dice', 'Death Saves']);
     ```
   - Assert Proficiencies & Languages is NOT in right sidebar
   - Click About tab → assert Proficiencies & Languages section is present
   - Assert death save checkboxes are visually larger than before (bounding box check or screenshot)
   - Assert conditions section shows "No active conditions" text when empty
   - Assert hit dice section shows die type and count even when no dice added
   - Screenshot: `tests/screenshots/right-sidebar.png`
3. Add a condition via the menu → assert it appears, remove it → assert empty state returns
4. Test Senses values visible without scrolling at 1080px viewport height

**Commit:** `feat: right sidebar reorder, larger death saves, move proficiencies to About (UX-06)`

---

## Wave 4 — Polish (no blockers, lower priority)

### Session 4a: UX-03 — Wizard Sticky Nav + Empty States
- Sticky Back/Next buttons at bottom of viewport
- Step 1: larger character name input, flavor intro text
- Steps 2/3 empty states: prompt text instead of lone dropdown
- Step content in `cardStyle` container
- Files: `CreateCharacter.tsx`, `StepBasics.tsx`

**Verify:**
1. `pnpm exec tsc --noEmit`
2. Playwright: navigate to `/create`
   - Assert Step 1 has intro/flavor text visible
   - Assert character name input is visually larger than player name input
   - Click Next to Step 2 (Class) — assert empty state prompt text is visible (not just a lone dropdown)
   - Screenshot Step 2 empty: `tests/screenshots/wizard-step2-empty.png`
3. Select a class with lots of content (Fighter) that overflows the viewport
   - Scroll down — assert Back/Next buttons remain visible (sticky):
     ```ts
     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
     await expect(page.getByRole('button', { name: 'Next' })).toBeInViewport();
     ```
   - Screenshot at scroll bottom: `tests/screenshots/wizard-sticky-nav.png`
4. Test at 768px width — sticky nav doesn't overlap content

**Commit:** `feat: wizard sticky navigation and empty state guidance (UX-03)`

### Session 4b: UX-07 — Home Page Hierarchy
- Guided Create as hero card (larger, elevated, gold button)
- Quick Create + Load as secondary (smaller, less prominent buttons)
- Recent Characters empty state
- Bump description text contrast
- Files: `Home.tsx`

**Verify:**
1. `pnpm exec tsc --noEmit`
2. Playwright: navigate to `/`
   - Assert Guided Create card is visually larger than other cards:
     ```ts
     const heroCard = page.locator('[data-testid="guided-create"]');
     const secondaryCard = page.locator('[data-testid="quick-create"]');
     const heroHeight = (await heroCard.boundingBox())!.height;
     const secHeight = (await secondaryCard.boundingBox())!.height;
     expect(heroHeight).toBeGreaterThan(secHeight);
     ```
   - Assert secondary buttons don't look disabled (check opacity > 0.7, or specific non-ghost styling)
   - Screenshot: `tests/screenshots/home.png`
3. With no characters in PB (or empty filter): assert empty state text is visible ("No characters yet" or similar)
4. With characters: assert Recent Characters grid renders with readable class/race badges

**Commit:** `feat: home page hero card hierarchy and empty state (UX-07)`

### Session 4c: UX-10 — Load Page Polish
- Show all/recent characters on page load
- Search-on-type instead of click-to-search
- Passphrase prompt with lock icon, more intentional feel
- Files: `LoadCharacter.tsx`

**Verify:**
1. `pnpm exec tsc --noEmit`
2. Playwright: navigate to `/load`
   - Assert characters are visible on page load (no search required):
     ```ts
     await expect(page.locator('.character-card')).toHaveCount({ minimum: 1 }, { timeout: 3000 });
     ```
   - Type in search box → assert results filter in real-time (no search button click needed)
   - Assert lock icon visible on passphrase-protected character card
   - Click protected character → assert passphrase prompt appears with lock icon
   - Screenshot: `tests/screenshots/load-page.png`
3. Test with empty PB (no characters) — assert friendly empty state, not blank page

**Commit:** `feat: load page auto-shows characters, search-on-type, lock icon (UX-10)`

---

## Verification Checklist (run after each session)

Every session must pass before moving to the next:

```bash
# 1. Type check
pnpm exec tsc --noEmit

# 2. Build check (catches import/bundle errors tsc misses)
pnpm build

# 3. Playwright visual regression
pnpm exec playwright test tests/screenshots.spec.ts

# 4. Manual spot-check (open http://localhost:5173 in browser)
#    - Navigate all pages
#    - Check responsive at 1920/1024/768 widths
#    - Verify no console errors
```

---

## Summary

| Wave | Sessions | Tickets | Blocked by | Key verification |
|------|----------|---------|------------|-----------------|
| 0 | Setup | Playwright install + baselines | Nothing | Baseline screenshots captured |
| 1 | 1a-1d | UX-04, 08, 09, 11 | Nothing | No overflow, no dupes, no "Not found", no "dimmed" |
| 2 | 2a-2b | UX-01, 05 | Nothing | HP/AC dominant, header clean, responsive OK |
| 3 | 3a-3b | UX-02, 06 | Wave 2 | Quick ref visible, slots clickable, sidebar reordered |
| 4 | 4a-4c | UX-03, 07, 10 | Nothing | Sticky nav, hero card, auto-load characters |

**Critical path:** Wave 2 → Wave 3a (UX-02 Quick Reference Panel is the highest-impact item and depends on both Wave 2 sessions completing first).

Total: 11 sessions across 4 waves. Waves 1 and 4 can be interleaved freely. Wave 2 must complete before Wave 3 starts.
