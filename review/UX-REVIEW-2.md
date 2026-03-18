# WebSheet UX/UI Review — March 2026 (Post-Redesign)

Review of the current state after Phases 1-7 redesign + UX tickets UX-01 through UX-06.

---

## 1. HOME PAGE (`/`)

### First impression
Clean and atmospheric — the warm dark palette with Cinzel headings immediately says "fantasy tool." The hierarchy is correct: Guided Create is the clear hero, secondary options recede. But the page feels *sparse* — there's a large void below the recent characters grid. The overall impression is "landing page for a tool with 3 buttons" rather than "your D&D home base."

### Paper sheet comparison
N/A — no paper equivalent. This is the app's front door.

### Hierarchy & visual weight
- **Good:** Guided Create card dominates correctly, gold "Start Wizard" button draws the eye
- **Issue:** "WebSheet" title appears twice — once in the navbar and once as the main heading. The page title is doing double-duty as branding when the navbar already handles that. Wastes prime vertical space.
- **Issue:** Quick Create and Load Character cards have identical visual weight (same size, same ghost button style). Load Character is used far more often — a returning player's first action is loading their character, not creating a blank sheet.
- **Issue:** Recent Characters section title uses gold/parchment color that's the same as section headers elsewhere — doesn't visually connect it to the "this is YOUR stuff" concept.

### Spacing, color & typography
- Description text on the hero card is very low contrast (parchment.5 or dimmed on dark-7 background). The bullet list items are borderline unreadable — squint territory.
- The gap between the hero card and the two secondary cards is generous, which is fine. But the gap between the secondary cards and Recent Characters is the same — it should be tighter to group them as "actions vs. your characters."
- Secondary card buttons ("Blank Sheet", "Load Character") are ghost/outline buttons that nearly disappear against the card background. The borders are barely visible.

### Component-level issues
- Recent character cards show duplicates (two "Zara Stormcaller Lv 1" entries with no distinguishing info) — this is a data issue but the UI should handle it (show class/race/background if available, or a date).
- Cards without class/race data just show "Lv 1" as a lonely badge — looks incomplete. An empty state or at least "Level 1" spelled out would be less jarring.
- The hero card's bullet list uses tiny decorative icons that add visual noise without helping scannability. A simple dash or indented text would be cleaner.

### Verdict: **Fix**
The concept is right. Specific fixes:
1. Remove the duplicate "WebSheet" page title — the navbar already has it. Use that space for a warmer welcome or just remove the gap.
2. Boost description/bullet text contrast significantly.
3. Make ghost buttons more visible (thicker border, or subtle filled background on hover).
4. Recent Character cards: always show class + race badges, fall back to "Level X" only when class data is missing. De-duplicate by ID.

---

## 2. CREATE WIZARD (`/create`)

### First impression
The stepper is clean and the step-by-step flow makes sense. Step 1 (Basics) is too sparse — just two text inputs on a big empty card feels like a loading error. But Step 2 (Class) with data populated is genuinely impressive: entity card, progression table, features with inline wiki links. This is the wizard's strength.

### Paper sheet comparison
The wizard does something paper can't — it guides you through valid choices and auto-calculates. This is purely better than paper. No complaints about information architecture here.

### Hierarchy & visual weight
- **Step 1 (Basics):** The "Every legend starts with a name" flavor text is nice but the step feels empty. Two inputs floating in a big card creates dead space anxiety.
- **Step 2 (Class):** The entity card (Fighter) is dense and well-organized. The progression table is excellent — scannable, clear headers, gold links for features.
- **Sticky Back/Next bar:** The Back/Next buttons are properly positioned (left/right). Gold "Next" draws the eye. Back is appropriately subdued.

### At-the-table usability
Wizard is a one-time flow (character creation), so combat-speed isn't relevant here. The flow is logical. My only concern: the class step has A LOT of vertical scrolling. On the Fighter page I can see the Back/Next bar is mid-page with feature descriptions continuing below it. This means the nav bar is NOT sticky (or it is but the content extends below it). Need to verify the Back/Next bar stays visible during scroll.

### Spacing, color & typography
- The skill proficiency grid ("Choose 2 skill proficiencies") uses a clean 3-column checkbox layout — good.
- "0 / 2 selected" counter in gold/parchment is a nice touch.
- Class entity card badges (HIT DIE: D10, PRIMARY: STRENGTH, DEXTERITY) are well-designed — clear, compact.
- Feature descriptions have good line height and paragraph spacing.

### Component-level issues
- The stepper step circles use the gold ring for current step but the completed step (Basics with checkmark) is filled gold — clear and good.
- Inactive step numbers are barely visible (grey circles on dark background). They read as disabled rather than "upcoming."
- The level input spinner is tiny and could be hard to interact with on touch.

### Verdict: **Keep** (minor tweaks)
This is the strongest part of the app. The data presentation when a class/race/background is selected is excellent. Tweaks:
1. Step 1: Add a brief illustration or flavor element to fill the dead space. Or combine with Edition selection.
2. Verify Back/Next bar stickiness on content-heavy steps.
3. Brighten inactive step numbers.

---

## 3. CHARACTER SHEET — Header

### First impression
The header is clean and functional. Character name is large, gold, Cinzel — immediate identification. Race/Class/Background as WikiLinks with dot separators is clever and space-efficient. The pencil toggle for edit mode is non-obvious but appropriate.

### Paper sheet comparison
Paper sheet has the name prominently at top with class/level/race/background in labeled boxes. Here, the info is there but the class level isn't shown in the header at all — it's buried in the stat grid below. On paper, "Fighter 3" is immediately visible. Here you see "Fighter" then have to find the Level box.

### Hierarchy & visual weight
- **Good:** Name dominates. WikiLinks are clearly interactive (dotted underline, colored).
- **Issue:** The action row (Inspiration, Short Rest, Long Rest, Export, Save) has uneven visual weight. Short Rest and Long Rest are filled gold/red buttons that SCREAM for attention — they're the loudest elements on the entire sheet. But you rest maybe once per session. Meanwhile, Save is a subtle default button in the far right corner.
- **Issue:** Inspiration checkbox is visually small and lost next to the flashy rest buttons.

### Component-level issues
- Export JSON button is an unlabeled icon — mystery meat navigation. It's fine for power users but could use a tooltip at minimum.
- Save button doesn't show save status (saved/unsaved/error). It's just "Save" with no feedback about whether there are pending changes.

### Verdict: **Fix**
1. Add level to the header identity line (e.g., "Fighter 3" instead of just "Fighter").
2. Tone down Rest buttons — they should be accessible but not the loudest thing on the page. Use outline/default variant, not filled.
3. Show save status indicator (dot, text, or icon change).

---

## 4. CHARACTER SHEET — Left Sidebar (Abilities + Skills)

### First impression
This is the densest and most important column — it's what players reference constantly. The 3x2 ability grid is well-designed: abbreviation, modifier (large), score input, saving throw checkbox with calculated value. This is genuinely better than the paper sheet for ongoing reference.

### Paper sheet comparison
The paper sheet has the same layout — abilities on the left with modifiers prominently displayed. This digital version improves on it with the gold border for proficient saves making them scannable. The skill table below closely mirrors the paper layout with the addition of WikiLink names.

### Hierarchy & visual weight
- **Good:** Ability modifiers are the largest element in each card — correct priority. The +3 in STR immediately reads.
- **Good:** Proficient saves get a blue/gold checkbox that creates visual grouping.
- **Issue:** The skills table has 18 rows of identical visual weight. On paper, proficient skills have a filled bubble that creates visual grouping. Here, the proficiency checkbox is a small, low-contrast element that doesn't create enough visual distinction between proficient (+5 Athletics) and non-proficient (-1 Arcana) skills.
- **Issue:** The modifier column uses red for negative values (good for visibility) but the same weight for positive values. The key modifiers a player needs mid-combat (+5 Athletics, +1 Intimidation) don't stand out from the wall of -1s.

### At-the-table usability
- "DM asks for a Perception check" — player looks at skills, finds Perception... it's in alphabetical order, which is correct. The modifier (-1) is visible. This works but could be faster if proficient skills were visually grouped or highlighted.
- **Good:** Skills are WikiLinks — hovering shows the skill description. Players who forget what Investigation vs Perception covers can check instantly.

### Spacing, color & typography
- Ability cards have consistent sizing. The 3x2 grid uses available width well.
- Skills table rows are tight but readable. The two checkbox columns (proficiency + expertise) take up width for a feature (expertise) that most characters won't use.
- The "DEX", "WIS", "STR" ability tags in the rightmost column are useful but could be smaller/dimmer — they're reference info, not primary.

### Component-level issues
- Expertise checkboxes are disabled (greyed out) for non-proficient skills — this is correct behavior but creates visual noise. 16 of 18 rows have a disabled checkbox that serves no purpose for the player.
- Left border accent on proficient skills (gold/yellow line) is subtle — effective but could be more prominent.

### Verdict: **Fix**
1. Make proficient skills visually distinct — bolder modifier, background tint, or stronger left-border accent. The player should be able to scan and see their "good skills" at a glance.
2. Consider hiding the expertise checkbox column by default if no skills have expertise. Or collapse it to a smaller indicator.
3. Dim the ability abbreviation column (DEX, WIS) — it's supplementary.

---

## 5. CHARACTER SHEET — Combat Stats Grid

### First impression
The HP bar is the hero — good. The minus/HP/slash/maxHP/plus with "Hit Points" label is functional and clear. The secondary stat boxes (AC, Speed, Initiative, Prof., Level) in a uniform grid below are clean and scannable.

### Paper sheet comparison
Paper sheet gives AC its own prominent shield-shaped box. Here it's the same size as Speed and Prof. Bonus. AC needs to be visually louder — it's the most-referenced defensive stat in combat.

### Hierarchy & visual weight
- **Issue:** AC, Speed, Initiative, Prof., and Level all have identical visual treatment — same box size, same border, same label placement. But they have vastly different importance:
  - **AC**: Referenced every attack against the character — should be the loudest
  - **HP**: Already the hero — good
  - **Speed**: Referenced occasionally — current treatment is fine
  - **Initiative**: Set once per combat — doesn't need prominence
  - **Prof. Bonus**: Rarely looked at directly — it's baked into other numbers
  - **Level**: Almost never changes mid-session — least important
- All six stat boxes competing equally is the biggest hierarchy problem on the sheet.

### At-the-table usability
- HP modification (the most frequent combat action) has dedicated -/+ buttons flanking the HP input. This is smart and fast.
- Temp HP is tucked to the far right ("Temp: 0") — fine for a rarely-used value.
- "auto: +1" and "auto: +2" labels below Initiative and Prof. are informational but add visual noise. Players don't need to see these during gameplay.

### Component-level issues
- The "Level" box is in the stat grid but Level is not a combat stat. It's character metadata. It belongs in the header or About tab.
- Speed shows "30 ft" as a text input rather than a number — this is correct (fly speed, swim speed etc. need text), but the spinner arrows on the input are misleading.

### Verdict: **Redesign** (stat hierarchy)
The uniform grid doesn't match the importance hierarchy. Proposed direction:
1. AC gets special treatment — larger, or distinct visual style (the previous attempt at a shield accent was right in concept, just needed better execution).
2. HP bar stays as-is — it works.
3. Group the secondary stats (Speed, Initiative, Prof., Level) smaller. Level could move to the header.
4. Remove "auto:" labels or make them appear only on hover/focus.

---

## 6. CHARACTER SHEET — Combat Tab

### First impression
Nearly empty for this character (no attacks or resources added). The "Attacks & Spellcasting" and "Resources" sections are just headers with "+ Add" buttons. This is fine as an empty state, but most characters will have at least 2-3 attacks. The empty state dominates the largest column — the center of the sheet is a void.

### Paper sheet comparison
Paper sheet has the attacks table pre-drawn with empty rows — it looks like a table waiting to be filled. Here, there's no table structure at all until you add an attack. The empty state should hint at what the filled state will look like.

### Verdict: **Fix**
1. Show the table structure even when empty (header row with "Name / Bonus / Damage" columns), with a "No attacks yet" message in the body. Makes the empty state look intentional rather than broken.
2. The "+ Add attack" and "+ Add resource" buttons are text links. On the paper sheet, adding an attack means writing in a pre-existing row. The button should feel that low-friction — perhaps an inline "add row" at the bottom of the table.

---

## 7. CHARACTER SHEET — Spells Tab

### First impression
Clean for an empty state. The spellcasting config (ability select + auto-calc DC/attack) at top is well-placed. The spell search below is clear.

### Verdict: **Keep** — needs review with populated data (spellcaster character).

---

## 8. CHARACTER SHEET — Inventory Tab

### First impression
The 7/5 split grid (items left, currency right) is a good use of space. Currency inputs (PP/GP/EP/SP/CP) are properly arranged in descending value order. Attunement slots with used counter is a nice touch.

### Component-level issues
- Currency labels (PP, GP, EP, SP, CP) use abbreviations that D&D players know, but the color coding varies — GP is gold-colored which is thematic, CP appears to have a different color. The color coding isn't consistent enough to be intentional or useful.
- Empty inventory shows "Search and add an item" and "+ Custom item" — good dual-path UX.

### Verdict: **Keep** (minor tweaks)
1. Ensure currency label colors are intentionally thematic (gold for GP, silver for SP, copper for CP) or just use consistent parchment color.

---

## 9. CHARACTER SHEET — Features Tab

### First impression
Clean accordion layout with search filter. Race traits at top, class features grouped by level, feat section at bottom. The badges ("RACE", "LV 1") on each accordion item are clear and color-coded.

### Verdict: **Keep** — well-organized, clear hierarchy.

---

## 10. CHARACTER SHEET — Notes Tab

### First impression
A single large textarea. Minimal and correct — notes are freeform by nature.

### Issue
The section heading "NOTES" and the textarea label "Notes" are redundant (same word twice stacked). Remove one.

### Verdict: **Keep** (remove redundant label)

---

## 11. CHARACTER SHEET — About Tab

### First impression
This is the junk drawer — Character Details (edition, XP, alignment, player), Personality, Appearance, Backstory, Proficiencies & Languages. It's a lot of sections but they're appropriately organized. This is the "edit once, reference rarely" tab.

### Component-level issues
- Personality section shows 4 textareas in a 2x2 grid (Traits/Ideals/Bonds/Flaws). These are tall empty boxes when unfilled — lots of wasted space for a new character.
- Backstory textareas are enormous empty voids.
- Proficiencies & Languages section with tag pills and "Add..." inputs is well-executed. Tags with x-remove buttons are clear.
- "No portrait" text next to the Portrait URL input is a nice empty state.

### Verdict: **Keep** — this is the right place for these fields. No redesign needed.

---

## 12. CHARACTER SHEET — Right Sidebar

### First impression
Senses at top (correct — DM asks for passive perception frequently), then Conditions, Hit Dice, Death Saves. The order is logical.

### Component-level issues
- **Senses** are clear: label + number, right-aligned. Good scannability.
- **Conditions** empty state ("No active conditions" + "+ condition") is appropriate.
- **Hit Dice** display (D10 badge + "1/1 remaining") is good at a glance. But the edit row below (die/total/used number inputs) is permanently visible and adds complexity. These inputs are setup, not gameplay — they should be hidden or collapsed by default.
- **Death Saves** checkboxes are appropriately sized. Successes (green) and Failures (red) color coding is clear.
- The "x" delete button on the hit dice row is positioned ambiguously — is it deleting the hit die type or resetting the count?

### Verdict: **Fix**
1. Collapse hit dice edit inputs — show them on click/hover, not permanently. The display row (D10, 1/1 remaining) is enough for gameplay.

---

## 13. LOAD PAGE (`/load`)

### First impression
Full-width cards in a single column is appropriate for a list. Filter-by-name search at top. Character cards show name + badges (class, race, background). Protected characters get a lock icon.

### Issues
- **Character cards are all the same visual weight** — there's no distinction between a fully-fleshed "Thalion Brightforge, Fighter 5, Human, Soldier" and a test entry like "asdasd, Level 1" or "p, Bard 3." The list needs visual cleanup (test data), but the UI should also handle low-quality entries gracefully.
- Cards without class/race/background just show a lonely "LEVEL 1" badge — looks broken. Show a more complete fallback.
- **No sort options** — alphabetical is the only order. By last-modified would be more useful for returning to a character.
- The lock icon (protected) is small and low-contrast. It communicates well if you know what it means, but there's no tooltip.
- The Import button in the top-right is a nice addition.

### Verdict: **Fix**
1. Add sort options (alphabetical, last modified, level).
2. Show last-played date on cards if available.
3. Add tooltip to lock icon ("Protected with passphrase").

---

## 14. WIKI SYSTEM (HoverCard + Drawer)

### First impression
The HoverCard is minimal — just "Fighter" + "XPHB" badge. This is the right amount of info for a quick tooltip. The drawer is comprehensive — full class progression table, features, starting equipment, multiclassing rules. The wiki system is genuinely the app's killer feature.

### Component-level issues
- HoverCard appears promptly on hover and is well-positioned near the trigger.
- Drawer title ("Fighter") is clear with a close button.
- The progression table in the drawer has excellent readability — row striping/hover, gold links for features.
- WikiLinks within the drawer (e.g., "Defense", "Bonus Action", "Hit Points") are clickable — this is the nested wiki experience that makes the app better than paper.

### Verdict: **Keep** — this is the best-executed feature in the app.

---

## CROSS-CUTTING ISSUES

### 1. Color contrast
The biggest systemic issue. Text that uses parchment.5 or "dimmed" on dark backgrounds fails readability in multiple places:
- Home page description text and bullet items
- "auto: +1" labels on stat boxes
- Empty state text throughout
- Secondary labels and hints

Recommendation: Audit all text and ensure WCAG AA contrast ratios (4.5:1 for body text). Parchment.5 on dark-7/dark-8 is likely failing.

### 2. Empty states
Empty states vary in quality:
- **Good:** Features tab (search + add), Conditions ("No active conditions"), Hit Dice ("No hit dice - add from class")
- **Bad:** Combat tab (just "+ Add" buttons in a void), Spells tab (functional but bare)
- **Ugly:** About tab textareas (massive empty boxes)

Recommendation: Show table/card structure even when empty. Use subtle placeholder illustrations or structured empty rows.

### 3. Input density
The sheet uses Mantine NumberInput with spinner arrows everywhere. This is appropriate for ability scores and level, but overkill for HP (which changes rapidly). The -/+ buttons on HP are good, but the spinner arrows on the HP number inputs add visual noise.

### 4. The "edit vs. display" tension
The sheet is permanently in edit mode — every value is an input. Paper sheets are "display with pencil marks." The app never feels like you're *reading* your character sheet; it always feels like you're *filling out a form*. The header's pencil toggle for WikiLinks-vs-selects is a step toward solving this, but the rest of the sheet hasn't adopted this pattern.

This is the deepest design tension and probably not worth solving now — it would be a major architectural change. But it's the root cause of why the sheet feels "busy."

---

## FUNCTIONAL GAPS — Found During Round 2 (Populated Character)

Creating a Level 10 Human Monk (Warrior of Shadow) / Criminal and populating all tabs revealed significant functional gaps beyond the cosmetic issues in Round 1.

### G1. Wizard Review shows wrong level — **Bug**
The wizard Review step (step 6) displays "Monk (Level 1)" despite selecting Level 10 in Step 2. HP also shows 9 (level 1 value). The character IS created at level 10 with correct HP (63), Prof (+4), and features — so the summary display is wrong, not the creation logic. First impression of the review step is "something went wrong."

### G2. No HP calculation method choice — **Missing Feature**
When creating above level 1, the wizard should ask how to calculate HP per level: average (default) or rolled. Currently it silently uses average (63 = 8+1 + 9*(5+1)). Players who roll HP will get incorrect totals with no way to correct during creation. The character sheet also has no "HP per level" breakdown anywhere.

### G3. Ability Score Improvements not interactive — **Missing Feature**
Features list shows "Lv 4 Ability Score Improvement" and "Lv 8 Ability Score Improvement" as accordion entries, but they're just text descriptions. A Monk 10 gets two ASIs — the wizard never prompted for these. The character's ability scores reflect only Point Buy + racial bonuses. Players must manually edit ability scores post-creation and mentally track which ASI went where. This means a level 10 character comes out of the wizard with level-1 ability scores.

### G4. No starting equipment — **Missing Feature**
The wizard never offers equipment selection. D&D 5e characters get starting equipment from their class and background. After creating a Level 10 Monk, the inventory was completely empty — no darts, no explorer's pack, no criminal tools. I had to manually add everything. For a guided wizard, this is a significant gap vs. the paper sheet experience where equipment is listed right on the class page.

### G5. Subclass features missing — **Bug**
The Features tab shows all generic Monk class features (Lv1-10) but zero Warrior of Shadow subclass features. Shadow Arts (Lv 3), Shadow Step (Lv 6), etc. are completely absent despite "Warrior of Shadow" being displayed in the header and selected during creation. The subclass selection is stored but its features aren't loaded.

### G6. Unarmored Defense not applied to AC — **Bug**
AC shows 13 (= 10 + DEX mod 3). Monk's Unarmored Defense should calculate AC as 10 + DEX mod + WIS mod = 10 + 3 + 2 = **15**. The WIS modifier isn't being factored in. This is a core class feature that's listed in the features panel but not reflected in the actual stat.

### G7. Unarmored Movement not applied to Speed — **Bug**
Speed shows 30 ft (base human speed). A level 10 Monk gets +20 ft from Unarmored Movement (gained at Lv 2, scaling at higher levels). Speed should be **50 ft**. Like AC, the feature is listed but not mechanically applied.

### G8. Attacks not persisted on save — **Bug**
Added "Unarmed Strike" (+7, 1d10+3 bludgeoning) and "Dart" (+7, 1d4+3 piercing) to the Combat tab. After saving and reloading the page, the attacks are gone — only the Resources table (Focus Points) persisted. The attacks table data is lost on save/reload.

### G9. Unresolved proficiency choices — **Missing Feature**
The About tab's Tools section shows raw choice text: "Choose one type of Artisan's Tools or Musical Instrument" from the Monk class. The wizard should have resolved this choice during creation, or the sheet should present it as a selectable dropdown. Currently it's displayed as literal descriptive text with WikiLinks but no interaction to actually make the choice.

### G10. Proficiencies incomplete / no source tracking — **Gap**
Proficiencies show Weapons (Simple, Martial Light) and Tools (thieves' tools + unresolved monk choice), but there's no indication of where each proficiency comes from (class vs. background vs. race). The paper sheet doesn't track sources either, but a digital tool should — especially when proficiencies overlap or conflict between class and background.

### G11. No focus points / ki auto-created — **Gap**
Focus Points (ki) is a core Monk resource (equal to Monk level). The wizard knows you're a Monk but doesn't auto-create this resource on the Combat tab. I had to manually add "Focus Points" with max 10. Same applies to other class resources (Rage for Barbarian, Sorcery Points, etc.).

### Summary: Wizard creates a cosmetically correct but mechanically incomplete character

The wizard successfully sets: name, class, subclass label, background, race, ability scores (base + racial), saving throw proficiencies, skill proficiencies, HP (average), proficiency bonus, hit dice, and class features list.

The wizard does NOT handle: ASI application, starting equipment, subclass feature loading, AC class formula, speed bonuses, HP method choice, class resource creation, or proficiency choice resolution.

The result is that a player using the wizard still needs to manually fix 5+ values on the sheet before it's playable — which defeats much of the wizard's purpose.

---

## PRIORITIZED ACTION LIST — Top 15

### Functional (Blocking)

These prevent the wizard from producing a playable character.

| # | Ref | Area | Change | Impact |
|---|-----|------|--------|--------|
| 1 | G8 | Attacks persistence | **Attacks table data lost on save/reload** — combat tab attacks don't persist | **Critical** |
| 2 | G5 | Subclass features | **Subclass features not loaded** — Warrior of Shadow features entirely missing from Features tab | **Critical** |
| 3 | G6 | AC calculation | **Unarmored Defense not applied** — AC shows 13 instead of 15 (missing WIS mod for Monk) | **Critical** |
| 4 | G7 | Speed calculation | **Unarmored Movement not applied** — Speed shows 30 ft instead of 50 ft at level 10 | **Critical** |
| 5 | G3 | Wizard — ASI | **No ASI prompts** — wizard doesn't let you apply Ability Score Improvements at Lv 4/8/etc. | **High** |
| 6 | G4 | Wizard — Equipment | **No starting equipment** — inventory empty after creation, should offer class/background equipment | **High** |
| 7 | G1 | Wizard — Review | **Summary shows wrong level** — displays "Level 1" and Lv1 HP despite selecting Level 10 | **High** |
| 8 | G2 | Wizard — HP method | **No HP calculation choice** — silently uses average, no option for rolled HP | **Medium** |
| 9 | G11 | Class resources | **Ki/Focus Points not auto-created** — core Monk resource must be added manually | **Medium** |
| 10 | G9 | Proficiency choices | **Unresolved choices displayed as text** — "Choose one type of Artisan's Tools or Musical Instrument" shown literally | **Medium** |

### Visual / UX (Polish)

From the Round 1 review — cosmetic and interaction improvements.

| # | Area | Change | Impact |
|---|------|--------|--------|
| 11 | Combat stats grid | Create visual hierarchy — AC prominent, HP stays, secondary stats smaller, Level to header | **High** |
| 12 | Skills table | Make proficient skills visually distinct (bold modifier, background tint, stronger accent) | **High** |
| 13 | Header actions | Tone down Rest buttons (outline not filled), add level to identity line, add save status | **High** |
| 14 | Global contrast | Audit all dimmed/parchment.5 text for WCAG AA compliance | **High** |
| 15 | Combat tab empty state | Show table structure when empty (headers + placeholder row) | **Medium** |

### Summary by section

| Section | Visual | Functional |
|---------|--------|------------|
| Home page | Fix | — |
| Create wizard | Keep (minor) | **Broken** (ASI, equipment, HP method, review summary, proficiency choices) |
| Sheet — Header | Fix | — |
| Sheet — Left sidebar | Fix | — |
| Sheet — Combat stats | **Redesign** | **Bug** (AC formula, speed bonuses not applied) |
| Sheet — Combat tab | Fix | **Bug** (attacks not persisted) |
| Sheet — Spells tab | Keep | — |
| Sheet — Inventory tab | Keep (minor) | — |
| Sheet — Features tab | Keep | **Bug** (subclass features missing) |
| Sheet — Notes tab | Keep (minor) | — |
| Sheet — About tab | Keep | Gap (unresolved proficiency choices) |
| Sheet — Right sidebar | Fix | — |
| Load page | Fix | — |
| Wiki system | Keep | — |

### What's working well
- **Color palette and typography** — the parchment/inkBrown/gold theme with Cinzel/Crimson Text is cohesive and distinctive. This looks like a D&D tool, not a generic dark-mode app.
- **Wiki integration** — hover cards and drawer are the killer feature. The inline WikiLinks throughout the sheet and wizard are genuinely superior to paper.
- **Wizard data presentation** — class/race/background entity cards with progression tables are excellent.
- **3-column layout** — the overall information architecture mirrors the paper sheet effectively. Left sidebar for abilities/skills, center for active gameplay, right for status tracking.
- **Ability score cards** — well-designed, scannable, correct visual hierarchy within each card.
- **HP auto-calculation** — average HP for level 10 computed correctly (63 for d8 + CON 1).
- **Class features auto-loaded** — all 22 generic Monk features from Lv1-10 populated automatically. The accordion display with level badges is excellent.
- **Proficiency bonus, saving throws, skill modifiers** — all correctly calculated for level 10.

---

## FUNCTIONAL GAPS — Found During Round 3 (Spellcaster — Warlock)

Creating a Level 10 Tiefling Warlock (Fiend Patron) / Sage and populating the Spells tab revealed spellcasting-specific gaps in addition to confirming Round 2 issues.

### G12. Spell slot grid doesn't auto-populate — **Bug**
The spell slot grid shows 1st/2nd/3rd with all values at 0. A Level 10 Warlock with Pact Magic should have slots auto-populated based on class and level. The player must manually set slot counts — error-prone and defeats the purpose of selecting a class.

### G13. No Pact Magic support — **Missing Feature**
The spell slot grid uses standard spellcasting slots (1st, 2nd, 3rd) but Warlocks use Pact Magic: a fixed number of slots at a single level (Level 10 Warlock = 2 slots at 5th level, all recharge on Short Rest). The grid has no way to represent this — it maxes out at 3rd level columns, there's no 4th/5th+ column, and no way to indicate "Pact Magic" vs standard slots. This makes the Spells tab fundamentally broken for Warlocks.

### G14. Spell search picks wrong match — **Bug**
Searching "Fireball" returned "Delayed Blast Fireball" (Lv7) as the first option. The search uses alphabetical ordering, not relevance — "Delayed Blast Fireball" comes before "Fireball" alphabetically. Players expecting to find exact spell names quickly will add the wrong spell.

### G15. Duplicate spells in search results — **UX Issue**
Most spells appear twice in the dropdown (PHB and XPHB versions) with no way to distinguish them — both show identical labels like "Eldritch Blast (Lvl 0, Evoc)". No source badge, no edition indicator. Players can't tell which version they're adding.

### G16. Wizard invocation choices incomplete — **Missing Feature**
The wizard (Step 2 - Class) offered only 1 Eldritch Invocation choice (the one gained at level 1). A Level 10 Warlock should have 7 invocations (gained at Lv 1, 2, 5, 7, 9, plus more). Same pattern as ASIs — the wizard only processes level 1 choices, not scaling choices for higher levels.

### G17. Spell HoverCard missing metadata — **UX Issue**
Hovering on a spell (Eldritch Blast) shows the name, source badge (PHB), and description text. Missing: casting time, range, duration, component details, and spell level. These are the first things a player checks when reviewing a spell. The HoverCard is useful but incomplete — a player still needs to look up the spell externally for the stat block.

### G18. Pact Boon (Lv3) missing from features — **Bug**
The Features tab shows 7 Warlock class features but omits the Pact Boon choice at Level 3 (Pact of the Blade/Chain/Tome). Like invocations, this is a choice the wizard should prompt for but doesn't.

### G5 confirmed. Subclass features missing (Fiend Patron)
Same as Monk — "Fiend Patron" is displayed in the header and was selected in the wizard, but zero Fiend subclass features appear: no Dark One's Blessing (Lv1), Dark One's Own Luck (Lv6), or Fiendish Resilience (Lv10).

### G1 confirmed. Review shows wrong level
Wizard review displays "Warlock (Level 1)", HP 10, Prof +2 despite Level 10 selected. Character created correctly at Lv10 with HP 73, Prof +4.

### Round 3 — What's working well (Spells tab)
- **Spell list organization** — grouped by level with clear headers (Cantrips, Level 1, Level 2, etc.)
- **School badges** — colored pills (Evoc, Ill, Conj, Abj, Ench) provide quick spell school identification
- **Components display** — V, S, M shown compactly with Concentration indicator (C)
- **Spell search** — combobox with type-ahead filtering works smoothly (aside from ranking issue)
- **Prepared toggle** — checkbox per spell for prepared/not prepared tracking
- **Feature text rendering** — Pact Magic expanded with full XPHB text, inline WikiLinks for spells and items

---

## FUNCTIONAL GAPS — Found During Round 4 (Edge Case Stress Test — Paladin)

Created a Level 13 Human Paladin (Oath of Devotion) / Noble — chosen because Paladin touches nearly every system: half-caster spell slots, unique resources (Lay on Hands, Channel Divinity), aura modifiers (Aura of Protection), armor-based AC, Divine Smite slot spending, Oath spells (always prepared), Fighting Style choice, Weapon Mastery choice.

### G19. Equipped armor doesn't affect AC — **Bug**
AC shows 10 with Plate Armor equipped (E checkbox checked) in inventory. Should show 18 (Plate = AC 18, no DEX bonus). With Shield also in inventory, should show 20. The "equipped" flag is cosmetic — the inventory has no mechanical connection to derived stats. This is the most impactful bug for armored classes (Paladin, Fighter, Cleric).

### G20. Aura of Protection not reflected in saving throws — **Missing Feature**
At Level 6+, Paladin's Aura of Protection adds CHA modifier (+3) to ALL saving throws within 10 ft. Current saves: STR +3, DEX +0, CON +1, INT -1, WIS +5, CHA +8. Should be STR +6, DEX +3, CON +4, INT +2, WIS +8, CHA +11. The feature is listed in the Features tab but not mechanically applied. This is an automation opportunity that directly helps at the table.

### G21. No spell list filtering by class — **Missing Feature**
Spell search shows ALL spells from all classes. A Paladin could accidentally add Wizard-only spells (Fireball, Counterspell). No class-based filtering or "Paladin Spells" label. Players must cross-reference the Paladin spell list externally. This is a prime automation candidate — the app knows the class.

### G22. No "always prepared" / Oath spell support — **Missing Feature**
Oath of Devotion gives specific Oath Spells at each spell level (Protection from Evil and Good + Sanctuary at 3rd, Lesser Restoration + Zone of Truth at 5th, etc.). These should be auto-added to the spell list and marked "always prepared" (can't be un-prepared, don't count against preparation limit). Currently no Oath spells appear, and the Prepared checkbox has no "always" state.

### G23. Attack bonus not auto-calculated — **Gap**
Adding attacks requires manually typing "+8" for the attack bonus. The app knows STR (+3), Prof (+5), and that a Longsword is a STR weapon. The attack bonus should auto-compute as ability mod + proficiency. The damage formula also requires manual entry. This is a significant sandbox feel issue — the player has to calculate what the app already knows.

### G24. Fighting Style / Weapon Mastery have no wizard selector — **Missing Feature**
The wizard's class step shows "Fighting Style: choose" and "Weapon Mastery: choose two kinds" as feature descriptions, but provides no actual selector to make these choices. Players see the feature text but can't interact with it. The choices are never recorded.

### G14 confirmed. Item search also alphabetical, not relevance
Searching "Shield" returns 15 alphabetical prefix matches (Animated Shield, Arrow-Catching Shield, etc.) before the basic "Shield (PHB)" at position 16. Same ranking issue as spells.

### G15 confirmed. Item duplicates (PHB/XPHB)
Plate Armor (PHB) and Plate Armor (XPHB) appear as separate items. Same for Shield, Longsword, etc. No source badge to distinguish in the dropdown.

### G5 confirmed (3rd class). Subclass features missing (Oath of Devotion)
16 base Paladin features loaded correctly (Lv1–13), but zero Oath of Devotion features appear: no Sacred Weapon, no Aura of Devotion (Lv7), no Oath Spells table. Despite the wizard showing Oath of Devotion subclass features during class selection.

### G8 confirmed (3rd class). Attacks lost on save/reload
Added Longsword (+8, 1d8+3 slash + 1d8 radiant) and Divine Smite 2nd (+8, 1d8+3 slash + 3d8 radiant). Resources (Lay on Hands 65, Channel Divinity 3, Divine Sense 5) persisted correctly. Attacks gone after reload.

### G1 confirmed (3rd class). Review shows wrong level
Wizard review displays "Paladin (Level 1)", HP 11, Prof +2. Character created correctly at Lv13 with HP 95, Prof +5.

### G12 refinement: Standard spellcasting slots DO work
Paladin spell slot grid correctly shows 4/3/3/1 for a 13th-level half-caster with "used" tracking row. This means G12 is **specific to Pact Magic / Warlock**, not a general slot population bug. The standard spellcasting progression table works correctly.

### Round 4 — What's working well
- **Standard spell slots auto-populated** — 4/3/3/1 for Lv13 half-caster, correct and with pip display
- **Spell slot used tracking** — each slot level has a "used" counter with spinners
- **Resource stat bar** — "Lay on Hands 65/65 Channel Divinity 3/3 Divine Sense 5/5" shown inline, excellent at-the-table visibility
- **Resource reset types** — Short Rest / Long Rest / Dawn / Never dropdown per resource — thoughtful design
- **Inventory table** — clean Item/Qty/E/A columns, WikiLink item names, attunement tracking
- **Item search** — comprehensive item database with source book labels (PHB, XPHB, DMG, TCE, etc.)
- **Resources persist on save** — unlike attacks, resources survive reload correctly

### Round 4 — Automation opportunities (preserving sandbox feel)

The user specifically asked about "things that can be automated that don't break the sandbox feel." Key distinction: **automation should provide defaults, not lock the player out of overrides.**

| Automation | What it does | Sandbox-safe? |
|------------|-------------|---------------|
| AC from equipped armor | Read armor type from inventory, compute base AC + DEX cap + shield | Yes — player can still override AC manually for homebrew/magic items |
| Aura of Protection save bonus | Add CHA mod to all saves when feature present | Yes — conditional bonus, show as "+3 aura" annotation, player can toggle |
| Oath spells auto-added | Pre-populate spell list with Oath spells at appropriate levels | Yes — mark "always prepared" but let player remove if using variant rules |
| Class spell list filter | Default search to class spell list, "Show All" toggle for multiclass | Yes — filter not restriction, toggle available |
| Attack bonus auto-calc | Compute ability + prof from weapon properties | Yes — auto-fill the +X field, player can override for magic weapons |
| Resource auto-creation | Create Lay on Hands (5×level), Channel Divinity, Divine Sense from class features | Yes — pre-populate, player can edit/delete |
| Subclass features auto-load | Load Oath of Devotion features alongside base features | Yes — they're class data, same as base features |
| Fighting Style selector | In-wizard choice from class list | Yes — wizard already handles skill choices, same pattern |

---

## PRIORITIZED ACTION LIST — Top 25

### Functional (Blocking)

These prevent the wizard from producing a playable character.

| # | Ref | Area | Change | Impact |
|---|-----|------|--------|--------|
| 1 | G8 | Attacks persistence | **Attacks table data lost on save/reload** — confirmed on Monk, Warlock, Paladin | **Critical** |
| 2 | G5 | Subclass features | **Subclass features not loaded** — confirmed on Monk, Warlock, Paladin (3 classes) | **Critical** |
| 3 | G19 | AC from armor | **Equipped armor doesn't affect AC** — Plate Armor equipped, AC still 10. Should be 18 (20 with Shield) | **Critical** |
| 4 | G6 | AC class formula | **Unarmored Defense not applied** — Monk AC 13 instead of 15 (missing WIS mod) | **Critical** |
| 5 | G7 | Speed calculation | **Unarmored Movement not applied** — Speed 30 ft instead of 50 ft at Monk level 10 | **Critical** |
| 6 | G13 | Pact Magic | **Warlock Pact Magic not supported** — slot grid only has 1st-3rd, no 5th+, no short-rest recharge | **Critical** |
| 7 | G20 | Aura of Protection | **CHA mod not added to saves** — Paladin Lv6+ aura not reflected in saving throw values | **High** |
| 8 | G22 | Oath spells | **Oath/subclass spells not auto-added** — no "always prepared" support | **High** |
| 9 | G3 | Wizard — ASI | **No ASI prompts** — wizard doesn't let you apply Ability Score Improvements at Lv 4/8/etc. | **High** |
| 10 | G21 | Spell list filtering | **All spells shown, no class filter** — Paladin can add Wizard-only spells | **High** |
| 11 | G4 | Wizard — Equipment | **No starting equipment** — inventory empty after creation | **High** |
| 12 | G1 | Wizard — Review | **Summary shows wrong level** — confirmed on all 3 test classes | **High** |
| 13 | G23 | Attack auto-calc | **Attack bonus not computed** — must manually type +X despite known ability/prof | **High** |
| 14 | G24 | Fighting Style | **No wizard selector** for Fighting Style or Weapon Mastery despite "choose" text | **High** |
| 15 | G16 | Wizard — Invocations | **Only Lv1 invocation choice** — Lv10 Warlock should pick 7 invocations | **High** |
| 16 | G14 | Search ranking | **Alphabetical not relevance** — affects both spells and items. "Shield" buried under 15 matches | **Medium** |
| 17 | G15 | Duplicates | **PHB/XPHB duplicates** — in both spell and item search, no source badge to distinguish | **Medium** |
| 18 | G11 | Class resources | **Resources not auto-created** — Lay on Hands, Ki, Channel Divinity must be added manually | **Medium** |
| 19 | G2 | Wizard — HP method | **No HP calculation choice** — silently uses average | **Medium** |
| 20 | G18 | Wizard — Pact Boon | **Pact Boon (Lv3) missing** — no prompt for Blade/Chain/Tome | **Medium** |

### Visual / UX (Polish)

| # | Ref | Area | Change | Impact |
|---|------|------|--------|--------|
| 21 | — | Combat stats grid | Create visual hierarchy — AC prominent, secondary stats smaller, Level to header | **High** |
| 22 | — | Skills table | Make proficient skills visually distinct (bold modifier, background tint) | **High** |
| 23 | G17 | Spell HoverCard | **Add spell metadata** — casting time, range, duration, components missing from popup | **High** |
| 24 | — | Header actions | Tone down Rest buttons (outline not filled), add level to identity line | **High** |
| 25 | — | Global contrast | Audit all dimmed/parchment.5 text for WCAG AA compliance | **High** |

### Summary by section

| Section | Visual | Functional |
|---------|--------|------------|
| Home page | Fix | — |
| Create wizard | Keep (minor) | **Broken** (ASI, equipment, HP method, review summary, invocations, pact boon, fighting style, proficiency choices) |
| Sheet — Header | Fix | — |
| Sheet — Left sidebar | Fix | **Bug** (Aura of Protection not reflected in saves) |
| Sheet — Combat stats | **Redesign** | **Bug** (AC not connected to armor/class features, speed bonuses not applied) |
| Sheet — Combat tab | Fix | **Bug** (attacks not persisted, attack bonus not auto-calculated) |
| Sheet — Spells tab | Fix (HoverCard) | **Broken** (no Pact Magic, search ranking, duplicates, no class filter, no Oath spells) |
| Sheet — Inventory tab | Fix | **Bug** (equipped armor doesn't affect AC) |
| Sheet — Features tab | Keep | **Bug** (subclass features missing on all 3 tested classes) |
| Sheet — Notes tab | Keep (minor) | — |
| Sheet — About tab | Keep | Gap (unresolved proficiency choices) |
| Sheet — Right sidebar | Fix | — |
| Load page | Fix | — |
| Wiki system | Keep | — |

### What's working well
- **Color palette and typography** — the parchment/inkBrown/gold theme with Cinzel/Crimson Text is cohesive and distinctive
- **Wiki integration** — hover cards and drawer are the killer feature. Inline WikiLinks throughout the sheet and wizard are genuinely superior to paper
- **Wizard data presentation** — class/race/background entity cards with progression tables are excellent
- **3-column layout** — mirrors the paper sheet effectively
- **Ability score cards** — well-designed, scannable, correct visual hierarchy
- **HP auto-calculation** — average HP computed correctly for Monk (63), Warlock (73), Paladin (95)
- **Standard spell slot auto-population** — Paladin correctly shows 4/3/3/1 for Lv13 half-caster with pip display
- **Spell slot used tracking** — each level has a "used" counter, smart at-the-table design
- **Class features auto-loaded** — generic features for all 3 classes loaded correctly with accordion + level badges
- **Proficiency bonus, saving throws, skill modifiers** — all correctly calculated (base values)
- **Spell list UX** — level grouping, school badges, component display, concentration markers, prepared toggles
- **Feature text rendering** — expanded features show full source text with inline WikiLinks
- **Resource stat bar** — resources shown inline (Lay on Hands 65/65, Channel Divinity 3/3) for at-a-glance tracking
- **Resource persistence** — resources survive save/reload correctly (unlike attacks)
- **Resource reset types** — Short Rest / Long Rest / Dawn / Never — thoughtful design
- **Inventory item database** — comprehensive with source book labels (PHB, XPHB, DMG, TCE, etc.)

### The big picture
Four rounds of testing (cosmetic review, populated Monk, populated Warlock, edge-case Paladin) reveal a consistent pattern: **the visual shell is polished but the data layer has significant gaps, and there's no bridge between inventory/features and derived stats**.

The core disconnect: the app stores data correctly (class, subclass, armor, features) but doesn't use it to derive stats. This creates a "beautiful but inert" character sheet where every computed value must be entered manually.

**Three layers of gaps:**

1. **Data persistence** — attacks lost on save (confirmed 3 classes). Resources work. Spells work. Items work.

2. **Data → Stats pipeline missing** — the app knows the class, level, subclass, and equipped items, but:
   - Equipped Plate Armor (AC 18) doesn't change the AC box (still 10)
   - Monk Unarmored Defense doesn't add WIS to AC
   - Paladin Aura of Protection doesn't add CHA to saves
   - Unarmored Movement doesn't add to Speed
   - Subclass features stored but never loaded into Features tab
   - Spell list not filtered to class
   - Attack bonus not computed from ability + proficiency
   - Resources not auto-created from class features

3. **Wizard: multi-level choices** — the wizard handles level 1 choices correctly but ignores all scaling choices:
   - ASIs at Lv 4/8/12 (all classes)
   - Invocations at Lv 1/2/5/7/9 (Warlock)
   - Pact Boon at Lv 3 (Warlock)
   - Fighting Style at Lv 2 (Paladin/Fighter/Ranger)
   - Weapon Mastery choices (martial classes)
   - Oath Spells auto-preparation (Paladin)
   - Starting equipment (all classes)

**The automation opportunity** is significant: most of the gaps can be solved with the data the app already has. The "sandbox feel" (user can override any value) should be preserved by treating automation as *defaults with overrides*, not restrictions. The stat bar already demonstrates this well — auto-calculated proficiency shows "auto: +5" below the editable field.

---

## Round 5 — Wizard Lv18 (Elara Spellweaver, Elf Evoker)

**Character:** Elara Spellweaver — Lv18 Elf Wizard (Evoker, XPHB) / Sage — at `/character/kahkdiqbz68sv1g`

### Stats verification
- HP: 110 — correct (d6 hit die, +2 CON mod × 18 levels)
- Level: 18, Prof: +6 — correct
- Spell DC: 17, Spell Attack: +9 — correct (8 + 6 + 3 INT at creation, though INT was 17 base)
- Spell slots: **Full 9-column grid — 4/3/3/3/3/1/1/1/1** — correct for Lv18 Wizard

### Key findings
- **G1 CONFIRMED (5th class):** Review step shows "Wizard (Level 1)" with HP 8, Prof +2 instead of Level 18, HP 110, Prof +6
- **G8 CONFIRMED (4th class):** Fire Bolt attack (+9 / 4d10+3 fire) lost after save/reload. Arcane Recovery resource (1/Long Rest) persisted.
- **G5 NOT REPRODUCED:** Evoker subclass features (Evocation Savant, Potent Cantrip, Sculpt Spells, Empowered Evocation, Overchannel) all present after creation AND survived save/reload with gold "EVOKER" badges
- **G14 CONFIRMED:** Search for "Magic Missile" returned "Jim's Magic Missile" first; "Shield" → "Cacophonic Shield"; "Fireball" → "Delayed Blast Fireball"
- **Full 9-column spell slot grid works perfectly** — all 9 level columns display, all counts correct, used tracking works

### Screenshots
- `review/r5-01-wizard-sheet.png` — main sheet view
- `review/r5-02-wizard-spells-empty.png` — 9-column slot grid
- `review/r5-03-wizard-spells-populated.png` — 18 spells across 9 levels
- `review/r5-04-wizard-features.png` — Evoker subclass features present
- `review/r5-05-wizard-features-reload.png` — subclass features survived reload

---

## Round 6 — Rogue Lv12 (Shade Quickfingers, Halfling Thief)

**Character:** Shade Quickfingers — Lv12 Halfling Rogue (Thief, XPHB) / Criminal — at `/character/8ch5kwkhzuxvp98`

### Stats verification
- HP: 87 — correct
- Level: 12, Prof: +4 — correct
- DEX: 17 (+3) — correct (15 base + 2 Criminal background)

### Key findings
- **G1 CONFIRMED (6th class):** Review step shows "Rogue (Level 1)" instead of Level 12
- **G5 NOT REPRODUCED:** Thief subclass features (Fast Hands, Second-Story Work, Supreme Sneak) visible after creation with gold "THIEF" badges
- **Expertise works correctly:** Stealth +11 and Sleight of Hand +11 (3 DEX + 4 prof × 2 = +11). Expertise checkbox correctly enabled only for proficient skills and doubles the proficiency bonus.
- Skills table correctly reflects 4 proficiencies from class (Stealth, Perception, Sleight of Hand, Acrobatics) + background skills

### Screenshots
- `review/r6-01-rogue-sheet.png` — main sheet with Expertise visible
- `review/r6-02-rogue-features.png` — Thief subclass features

---

## Round 7 — Druid Lv9 (Willow Thornbriar, Dwarf Circle of the Moon)

**Character:** Willow Thornbriar — Lv9 Dwarf Druid (Circle of the Moon, XPHB) / Hermit — at `/character/pm1gkfc8t9jhure`

### Stats verification
- HP: 75 — correct (d8 + 3 CON × 9 levels)
- Level: 9, Prof: +4 — correct
- Spell DC: 15, Spell Attack: +7 — correct (8 + 4 + 3 WIS)
- Spell slots: 4/3/3/3/1 — correct for Lv9 full caster (5-column grid)
- Speed: 30 ft — correct for XPHB Dwarf (2024 Dwarves have 30 ft, not 25 ft like 2014)

### Key findings
- **G1 CONFIRMED (7th class):** Review step shows "Druid (Level 1)" with HP 11, Prof +2 instead of Level 9
- **G8 CONFIRMED (5th class):** "Produce Flame +7 / 2d8 fire" attack lost after save/reload. Wild Shape resource (2/Short Rest) persisted.
- **G5 CONFIRMED for Druid — subclass features NEVER loaded:** Circle of the Moon features missing both before AND after reload. Only base Druid features shown (Druidic, Primal Order, Spellcasting, Wild Shape, Wild Companion, ASIs, Wild Resurgence, Elemental Fury). Console errors during subclass selection suggest broken data.
- **G15 CONFIRMED:** Duplicate entries for Cure Wounds (Evoc/Abj), Moonbeam (Evoc/Evoc), Call Lightning (Conj/Conj)
- **NEW — Console errors on Circle of the Moon:** Two errors when selecting subclass: (1) "Encountered two children with the same key" (React duplicate key), (2) "Failed to load resource" for query filtering `name~"Circle Forms"`. Suggests broken subclass data import for Circle of the Moon.

### Screenshots
- `review/r7-01-druid-sheet.png` — main sheet view
- `review/r7-02-druid-features.png` — features tab with NO subclass features
- `review/r7-03-druid-reload.png` — after reload: attack gone, resource persisted

---

## Updated Gap Analysis (After 7 Rounds)

### G5 — Subclass Features: Inconsistent Behavior

G5 behavior varies by class/subclass:

| Round | Class/Subclass | Subclass Features? | After Reload? |
|-------|---------------|-------------------|---------------|
| R2 | Monk / Warrior of Shadow | Reported missing | — |
| R3 | Warlock / Fiend Patron | Reported missing | — |
| R4 | Paladin / Oath of Devotion | Reported missing | — |
| R5 | Wizard / Evoker (XPHB) | **Present** | **Survived** |
| R6 | Rogue / Thief (XPHB) | **Present** | Not tested |
| R7 | Druid / Circle of the Moon (XPHB) | **Never loaded** | **Never loaded** |

This suggests G5 is **subclass-specific** rather than universal. Possible causes:
1. Some subclass data has import issues (Circle of the Moon has broken PB data with console errors)
2. The `_copy` resolution system may work for some subclasses but fail for others during import
3. Earlier R2-R4 findings should be re-verified — may have been intermittent or class-specific

### G8 — Attacks Lost on Save: Now Confirmed on 5 Classes

Confirmed on: Monk (R2), Warlock (R3), Paladin (R4), Wizard (R5), Druid (R7). Resources always persist. This is definitely a save-path bug — attacks use a different persistence mechanism than resources.

### G1 — Wizard Review Shows Wrong Level: Confirmed on ALL 7 Classes

Every character tested shows "Level 1" in the review step regardless of selected level. Consistent, reproducible bug affecting all classes.

### Confirmed Gap Counts

| Gap | Confirmed On | Total Classes |
|-----|-------------|---------------|
| G1 (review wrong level) | All 7 | 7/7 |
| G8 (attacks lost) | Monk, Warlock, Paladin, Wizard, Druid | 5/7 |
| G5 (subclass features) | Monk, Warlock, Paladin, Druid | 4/7 (2 worked: Wizard, Rogue) |
| G14 (search ranking) | Spells (R3, R5), Items (R4) | Multiple |
| G15 (PHB/XPHB duplicates) | Spells (R3, R5, R7), Items (R4) | Multiple |

### New Findings

| # | Area | Issue | Severity |
|---|------|-------|----------|
| G25 | Circle of the Moon | Console errors on subclass selection — duplicate React keys and failed "Circle Forms" query. Subclass features never load. | **Critical** |

### What Works Well (New Confirmations)
- **Full 9-level spell slot grid** — Lv18 Wizard displays all 9 columns correctly (4/3/3/3/3/1/1/1/1)
- **Expertise mechanic** — Rogue expertise checkbox works perfectly, doubles proficiency bonus correctly
- **HP auto-calculation** — correct across all 7 classes (Monk 63, Warlock 73, Paladin 95, Wizard 110, Rogue 87, Druid 75)
- **Standard spell slot auto-population** — correct for all tested casters (Paladin half-caster, Wizard full caster, Druid full caster)
- **Resource persistence** — resources survive save/reload on all 5 tested classes (Ki, Patron, Lay on Hands/Channel Divinity, Arcane Recovery, Wild Shape)
- **XPHB subclass features** — Evoker and Thief (both XPHB) load correctly with gold subclass badges

---

## Rounds 8–13 — Remaining Classes (Fighter, Barbarian, Ranger, Bard, Cleric, Sorcerer)

### Round 8 — Fighter Lv11 (Gareth Ironheart, Human Champion / Soldier)

**Character:** `/character/ffdmtrehgtjao75`
**Stats:** HP 103, Level 11, Prof +4, AC 12, STR 17(+3), DEX 14(+2), CON 16(+3)

**Findings:**
- **G1 confirmed** (8th class) — Review shows "Fighter (Level 1)" HP 13
- **G5 NOT reproduced** — Champion subclass features ALL loaded: Improved Critical (Lv3), Remarkable Athlete (Lv3), Additional Fighting Style (Lv7), Heroic Warrior (Lv10), Two Extra Attacks (Lv11). 18 total features Lv1-11.
- **G8 confirmed** (6th class) — Greatsword attack lost after save/reload. Second Wind resource (1/1, Short Rest) persisted.

**Screenshot:** `r8-01-fighter-reload.png`

### Round 9 — Barbarian Lv8 (Grok Stormfury, Orc Berserker / Guard)

**Character:** `/character/97vpypyoc9ywgdf`
**Stats:** HP 77, Level 8, Prof +3, AC 12, STR 17(+3), DEX 14(+2), CON 15(+2)

**Findings:**
- **G1 confirmed** (9th class)
- **G5 confirmed** — Berserker subclass features NOT loaded. Should have: Frenzy (Lv3), Path of the Berserker (Lv3), Mindless Rage (Lv6). Only 12 base class features present (Rage, Unarmored Defense, Weapon Mastery, Danger Sense, Reckless Attack, Primal Knowledge, ASIs, Extra Attack, Fast Movement, Feral Instinct, Instinctive Pounce).
- **G8 confirmed** (7th class) — Greataxe attack lost. Rage resource persisted (1/1, Long Rest).

### Round 10 — Ranger Lv7 (Talon Windwalker, Elf Gloom Stalker / Guide)

**Character:** `/character/r0k7xbsaswvj3oa`
**Stats:** DEX 17(+3), WIS 16(+3), CON 14(+2)

**Findings:**
- **G1 confirmed** (10th class)
- **G5 NOT reproduced** — Gloom Stalker features ALL loaded: Dread Ambusher (Lv3), Gloom Stalker (Lv3), Gloom Stalker Spells (Lv3), Umbral Sight (Lv3), Iron Mind (Lv7). 14 total features.
- **G8 confirmed** (8th class) — Longbow attack lost.

### Round 11 — Bard Lv10 (Lyra Songweaver, Halfling College of Lore / Entertainer)

**Character:** `/character/cynv0e4wujqt5ic`
**Stats:** CHA 17, DEX 15, CON 14

**Findings:**
- **G1 confirmed** (11th class)
- **G5 confirmed** — College of Lore features NOT loaded. Should have: Cutting Words (Lv3), Bonus Proficiencies (Lv3), College of Lore (Lv3), Peerless Skill (Lv6). Only 11 base class features present: Bardic Inspiration, Spellcasting, Expertise (Lv2), Jack of All Trades, ASIs, Font of Inspiration, Countercharm, Expertise (Lv9), Magical Secrets.
- **G8 confirmed** (9th class) — Rapier attack lost.

### Round 12 — Cleric Lv14 (Brother Cedric, Dwarf Life Domain / Acolyte)

**Character:** `/character/d6zxp1lswmugmjr`
**Stats:** WIS 17(+3), CON 15(+2), STR 13(+1)

**Findings:**
- **G1 confirmed** (12th class)
- **G5 confirmed** — Life Domain features NOT loaded. Should have: Disciple of Life (Lv3), Preserve Life (Lv6), Blessed Healer (Lv6), Life Domain spells. Only 15 base class features. Console errors during creation: `Failed to load resource... filter=name~"Disciple of Life"` — same query failure pattern as Circle of the Moon (G25).
- **G8 confirmed** (10th class) — Mace attack lost.

### Round 13 — Sorcerer Lv6 (Zara Flameheart, Tiefling Draconic Sorcery / Sage)

**Character:** `/character/3n0l5q1tj29uuno`
**Stats:** CHA 15, CON 16(+2), DEX 14(+2)

**Findings:**
- **G1 confirmed** (13th class — ALL classes tested)
- **G5 confirmed** — Draconic Sorcery features NOT loaded. Should have: Draconic Resilience (Lv3), Draconic Sorcery (Lv3), Elemental Affinity (Lv6). Only 8 base class features: Innate Sorcery, Spellcasting, Font of Magic, Metamagic, Metamagic Options, ASI, Sorcerous Restoration.
- **G8 confirmed** (11th class) — Fire Bolt attack lost.

---

## Final Gap Analysis — All 13 Classes Tested

### G1 — Wizard Review Shows Wrong Level: 13/13 classes (100%)

Universal bug. Every class shows "Level 1" in review step.

### G8 — Attacks Lost on Save/Reload: 11/13 classes tested

Confirmed on: Monk, Warlock, Paladin, Wizard, Druid, Fighter, Barbarian, Ranger, Bard, Cleric, Sorcerer (all 11 classes where attacks were added and tested). Resources always persist. Attack persistence is definitively broken.

### G5 — Subclass Features Not Loaded: Subclass-Specific

| Class | Subclass | Features Loaded? | Notes |
|-------|----------|-----------------|-------|
| Monk | Way of Shadow | NO | R2 |
| Warlock | Fiend Patron | NO | R3 |
| Paladin | Oath of Devotion | NO | R4 |
| Wizard | Evoker | YES | R5 — only XPHB worked |
| Rogue | Thief | YES | R6 — only XPHB worked |
| Druid | Circle of Moon | NO | R7 — console errors, query failure |
| Fighter | Champion | YES | R8 — XPHB, features loaded |
| Barbarian | Berserker | NO | R9 |
| Ranger | Gloom Stalker | YES | R10 — XPHB, features loaded |
| Bard | College of Lore | NO | R11 |
| Cleric | Life Domain | NO | R12 — console errors, query failure |
| Sorcerer | Draconic Sorcery | NO | R13 |

**Pattern:** 4/12 subclasses load (Evoker, Thief, Champion, Gloom Stalker). 8/12 fail. All 4 that work are XPHB. Some that fail are also XPHB (Berserker, Lore, Life, Draconic). The common factor among failures may be the feature name query — console errors show failed PocketBase queries for feature names like "Disciple of Life" and "Circle Forms."

### Characters Created

| # | Round | Name | Class/Level | Subclass | Species | Background | URL |
|---|-------|------|------------|----------|---------|------------|-----|
| 1 | R2 | Kira Shadowstep | Monk 10 | Warrior of Shadow | Human | Criminal | — |
| 2 | R3 | Vesper Nighthollow | Warlock 10 | Fiend Patron | Tiefling | Sage | — |
| 3 | R4 | Ser Aldric Voss | Paladin 13 | Oath of Devotion | Human | Noble | `/character/x5tj6j4hepnyefs` |
| 4 | R5 | Elara Spellweaver | Wizard 18 | Evoker | Elf | — | `/character/kahkdiqbz68sv1g` |
| 5 | R6 | Shade Quickfingers | Rogue 12 | Thief | Halfling | — | `/character/8ch5kwkhzuxvp98` |
| 6 | R7 | Willow Thornbriar | Druid 9 | Circle of Moon | Dwarf | — | `/character/pm1gkfc8t9jhure` |
| 7 | R8 | Gareth Ironheart | Fighter 11 | Champion | Human | Soldier | `/character/ffdmtrehgtjao75` |
| 8 | R9 | Grok Stormfury | Barbarian 8 | Berserker | Orc | Guard | `/character/97vpypyoc9ywgdf` |
| 9 | R10 | Talon Windwalker | Ranger 7 | Gloom Stalker | Elf | Guide | `/character/r0k7xbsaswvj3oa` |
| 10 | R11 | Lyra Songweaver | Bard 10 | College of Lore | Halfling | Entertainer | `/character/cynv0e4wujqt5ic` |
| 11 | R12 | Brother Cedric | Cleric 14 | Life Domain | Dwarf | Acolyte | `/character/d6zxp1lswmugmjr` |
| 12 | R13 | Zara Flameheart | Sorcerer 6 | Draconic Sorcery | Tiefling | Sage | `/character/3n0l5q1tj29uuno` |
