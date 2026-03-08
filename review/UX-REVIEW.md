# UX/UI Design Review -- WebSheet (D&D 5e Character Manager)

**Date:** 2026-03-08
**Reviewer:** Claude (Senior UX/UI Designer perspective)
**Benchmark:** Official D&D 5e character sheet PDF

---

## 1. HOME PAGE

### First Impression
Clean and confident entry point. The Cinzel headings give immediate fantasy authority. But the page feels hollow -- the three cards sit in a sea of dead space with no visual warmth below them. When the "Recent Characters" grid fails to load (API error in console), you're left staring at 60% black void. The page reads as a template that hasn't been filled in yet.

### Paper Sheet Comparison
N/A -- paper sheets don't have a landing page. But compared to D&D Beyond's dashboard, this lacks personality. No illustration, no ambient texture, no reason to linger.

### Hierarchy & Visual Weight
- The "WebSheet" title and the three cards compete equally. The title is huge but meaningless after first visit -- the action cards are what matters.
- All three cards have identical visual weight. "Guided Create" has a filled gold button but the card itself is indistinguishable from the others. The primary path (Wizard) should dominate.
- The nav bar duplicates the cards below it ("New Character" = Wizard, "Load" = Load Character). Redundant affordances with no differentiation.

### Spacing, Color & Typography
- Cards have good internal padding but the gap between them and the title above is too tight relative to the void below.
- Description text in cards is low-contrast (dimmed parchment on dark-7). At body font size, this is borderline for readability.
- The gold underline on the header bar is the strongest horizontal element on the page. It works well.

### Component-Level Issues
- "Blank Sheet" and "Load Character" buttons are `light` variant but read as disabled/ghost buttons. They look unclickable compared to the gold "Wizard" button.
- No empty state for "Recent Characters" -- just nothing. Should show a gentle prompt ("No characters yet -- create your first one").

### Verdict: **Fix**
- Make "Guided Create" the hero -- larger card, or single prominent CTA with the others as secondary links below.
- Add empty state for recent characters.
- Reduce the title size on repeat visits or give it a subtitle with more utility ("Welcome back -- pick up where you left off").
- Bump description text contrast.

---

## 2. CREATE WIZARD

### Step 1 (Basics) -- First Impression
Brutally sparse. Two text inputs floating in space. The step indicator looks good (gold active ring, clean labels), but the content area has the density of a login form on a page designed for a multi-step workflow. The huge gap between the inputs and the Back/Next buttons emphasizes the emptiness.

### Hierarchy & Visual Weight
- The stepper is the dominant element, which is wrong -- it should orient, not dominate. The form content should be the star.
- "Character Name *" and "Player Name" have identical styling. The required field asterisk is the only differentiator. "Character Name" should feel more important -- it's the character's identity.

### Verdict: **Fix**
- Add flavor: character name could be larger (it's the identity!), add a brief intro paragraph, or show a silhouette/class illustration placeholder.
- Consider adding alignment and edition selection here to fill the step.

---

### Step 2 (Class -- Empty State)
Same emptiness problem. Single dropdown + number input. The Level field is small and orphaned to the right of the wide class selector.

### Step 2 (Class -- Fighter Selected)
This is where the wizard shines. The EntityCard is well-structured: class name + source badge top, stat badges, armor/weapon pills, skill picker, progression table, feature descriptions with WikiLinks. The information density is appropriate and the hierarchy is clear (bold feature titles in gold, XPHB source aligned right, body text below).

**Issues:**
- The skill proficiency checkboxes use a 3-column grid that works, but "0 / 2 selected" is gold-colored text that reads as a link or success state. It should be neutral until complete, then gold.
- The class progression table is well-structured but the empty column between "Features" and "Second Wind" is suspicious -- looks like a rendering gap.
- Feature text with WikiLinks (dotted underline) is readable. The links are appropriately subtle.
- The entire EntityCard is long -- on a 1080p screen the Back/Next buttons scroll off. The buttons should be sticky at the bottom.

### Verdict: **Fix**
- Make Back/Next sticky at bottom of viewport during wizard.
- Fix the skill counter color state (neutral -> gold on completion).
- Empty states for steps need more content/guidance.

---

### Step 3 (Background -- Soldier)
Same pattern as Class. EntityCard works well. The ability score bonus picker (+2/+1 radio toggle with dropdown selectors) is compact and clear. The bulleted details list at the bottom (Feat, Skills, Tool, Equipment) with WikiLinks is scannable.

**Issue:** The equipment description is dense single-line text with many WikiLinks. "Choose A or B: (A) Spear, Shortbow, 20 Arrows..." is functional but visually overwhelming in one paragraph. Consider formatting options A and B on separate lines.

### Verdict: **Keep** (minor formatting tweaks)

---

### Step 4 (Species -- Human)
Clean. The EntityCard for Human is short and well-structured: size/speed badges, three trait headings with descriptions. WikiLinks in trait text are clear. Good information density for a simple species.

### Verdict: **Keep**

---

### Step 5 (Abilities -- Point Buy)
This is solid. The method selector (Point Buy / Standard Array / Manual) as a segmented control is immediately clear. The table with ability names, +/- score controls, cost, total, and modifier columns is dense but scannable -- exactly what a point buy interface should look like. The "27/27 Points remaining" badge is prominent and well-placed.

**Issues:**
- The minus buttons are disabled (at floor of 8) but look identical to enabled buttons in the dark theme. Disabled state needs more visual differentiation -- lower opacity or different color.
- The "Scores range 8-15. Cost increases at 14 (7) and 15 (9)." help text is italic and dimmed -- good placement but might benefit from being in a subtle info box.

### Verdict: **Keep** (fix disabled button visibility)

---

### Step 6 (Review)
Good information density. The summary flows logically: name -> class/bg/species -> derived stats (HP, AC, Init, Prof, Hit Die) -> ability score table -> saving throws -> skills -> passphrase.

**Issues:**
- The derived stat row (HP 9, AC 9, Initiative -1, Prof. Bonus +2, Hit Die d10) uses very small labels with bold values below. The labels are too small -- "HP" and "AC" need to be instantly scannable, not squinting-small.
- "Skills: Athletics, Perception, Athletics, Intimidation" -- **Athletics is listed twice**. This is a data bug, not just visual.
- The ability score table shows "---" in the Bonus column for all abilities (no background bonuses were assigned). The em-dash styling varies -- some appear gold-ish, some neutral. Inconsistent.
- The passphrase section at the bottom feels tacked on. It's a security concern mixed into a character review. Consider a separate step or a modal on "Create Character" click.

### Verdict: **Fix**
- Fix the duplicate skill bug.
- Increase derived stat label size.
- Separate passphrase from character review.
- Standardize Bonus column empty-state styling.

---

## 3. CHARACTER SHEET (The Core Screen)

### First Impression
This is genuinely impressive in ambition. The 3-column layout with ability cards, stat boxes, tabbed content, and sidebar utilities is the right architecture. The warm color palette on dark is atmospheric. But it's trying to do too much at once and several elements fight for attention without clear hierarchy.

The header bar (character name, race/class/background selects, alignment, player) is dense and functional. The gold "Character Name" input stands out appropriately. The edition select, XP, rest buttons, and save status on the second row are sensible groupings.

### Paper Sheet Comparison
The paper D&D sheet has one massive advantage: **everything is on one page, simultaneously visible**. WebSheet's tab system hides Combat, Spells, Inventory, Features, Notes, and About behind clicks. A player mid-combat needs:
- HP (visible -- stat bar)
- AC (visible -- stat bar)
- Attack bonuses (hidden -- Combat tab)
- Spell slots (hidden -- Spells tab)
- Key features like Second Wind (hidden -- Features tab)

The paper sheet puts attacks, spellcasting, features, and equipment all on pages 1-2. WebSheet requires tab-switching for the most combat-critical information. This is the app's fundamental tension.

### Hierarchy & Visual Weight
- **Stat bar** (HP/Max/TempHP/AC/Speed/Init/Prof/Level): These elevated Paper boxes are the right concept but they all have identical visual weight. AC should be the most prominent defensive stat. HP should scream louder than "Prof." or "Level." Currently they're 8 identical boxes in a row.
- **Ability score cards** (3x2 grid): Well-designed individually. The abbreviation (STR), modifier (+0), score input, and save line are cleanly stacked. The gold border on the left works. But the 3x2 grid competes with the stat bar above it for attention.
- **Skills table**: This is the densest single element. 18 rows with proficiency checkbox, expertise checkbox, modifier, skill name (WikiLink), and ability badge. It's compact but functional. The two-checkbox system (proficiency + expertise) is correct but the checkboxes are tiny and undifferentiated.
- **Right sidebar**: Death Saves, Hit Dice, Conditions, Senses, Proficiencies & Languages. This is the "utility drawer" and it works as such. Senses are well-presented (label + bold number). But the whole sidebar scrolls independently from the center, which could confuse users.

### At-the-Table Usability
**The 2-second test:**
- "What's your AC?" -- YES, visible in stat bar.
- "What's your HP?" -- YES, visible in stat bar.
- "Roll Athletics" -- Need to scan the skills list (left column). It's there but requires finding the row. The alphabetical sort helps. ~3 seconds.
- "What's your attack bonus with a longsword?" -- NO. Must click Combat tab, and the attack must be pre-entered. This is worse than paper.
- "Do you have any spell slots left?" -- NO. Must click Spells tab.
- "What's your passive perception?" -- YES, right sidebar under Senses. Good.
- "Use Second Wind" -- Must click Features tab, find it, then go back to Combat to update HP. Two tab switches for one action.

**Key gap:** The most frequent combat actions (attacks, spell usage) are behind tabs. The stat bar has the right stats but lacks the "what can I do right now" information.

### Spacing, Color & Typography

**Stat bar:**
- The labels (HP, MAX, TEMP HP, AC, SPEED, INITIATIVE, PROF., LEVEL) are in small uppercase parchment. Good for labels but they're slightly too small.
- AC has a gold border distinguishing it. Good. But HP should also be visually distinct (maybe bloodRed border when below max?).
- "auto: +0" and "auto: +2" hints below Initiative and Prof. are nice but visually orphaned -- they float below the box without clear connection.

**Left sidebar:**
- The Abilities heading with left gold border is clean.
- Ability cards have good internal spacing but the gap between the top row (STR/DEX/CON) and bottom row (INT/WIS/CHA) creates a visual break that doesn't map to any D&D concept.
- Skills table: The ability badges (D, W, I, S, C) on the right are color-coded but tiny. They help experienced players but are cryptic for newcomers. The skill names in gold/parchment WikiLink style are readable.

**Center column:**
- Tab labels in Cinzel uppercase work well. The active tab indicator (underline or background shift) is subtle but sufficient.
- Section titles ("ATTACKS & SPELLCASTING", "RESOURCES") with the left gold border are consistent and scannable.

**Right sidebar:**
- Death Saves: The Successes/Failures labels are green and red respectively with three checkboxes each. Functional. The checkbox size is small for a "during combat, hands might be shaky" use case.
- "Proficiencies & Languages" section title wraps to two lines -- consider abbreviating to "Proficiencies" or using a smaller font.

### Component-Level Issues

1. **Stat bar NumberInputs**: The up/down chevrons are tiny and hard to hit. For HP (the most-clicked control), bigger +/- buttons or direct keyboard input would be faster.

2. **Inventory tab horizontal scrollbar**: There's a gold horizontal scrollbar visible at the bottom of the inventory area. This indicates the content is overflowing its container. This is a layout bug.

3. **Death Save checkboxes**: Very small. In a tense combat moment, these need to be larger and more tactile. Consider larger toggles or clickable circles.

4. **Hit Dice section**: Just a "+" button with no context. No die type shown, no count, no "remaining/total" display. Essentially non-functional without a hit die entry.

5. **Conditions section**: Just "+ condition" button. The empty state doesn't convey what this area does or how it works.

6. **Currency in Inventory tab**: PP/GP/EP/SP/CP in a row with NumberInputs. CP wraps to a second line below. This is a layout break -- all 5 should be in one row or use a more compact layout.

7. **Header row second line**: Inspiration checkbox, edition select, XP, Short Rest, Long Rest, save status, Create button. This feels like a dumping ground for "everything else." The Short Rest and Long Rest buttons are important gameplay actions buried between UI controls.

8. **"New" and "Create" in the top right**: "New" is a status indicator but reads as a button. "Create" is the actual save button. Confusing pairing.

---

## TAB-BY-TAB VERDICTS

### Combat Tab: **Fix**
- Right concept (attacks table + resources table) but empty state is just "+ Add attack" and "+ Add resource" -- very bare.
- Needs pre-populated rows for a created character, or at minimum a more helpful empty state.
- Consider showing the most critical combat info (AC, HP, best attack) in a "quick reference" summary at the top of this tab.

### Spells Tab: **Fix**
- Spellcasting ability selector + spell search/add is correct architecture.
- Empty state ("No spells added yet") is fine but the Casting Ability dropdown showing "None" without context is confusing for a Fighter (who doesn't cast spells by default).
- For caster classes, the spell slot tracking grid (not visible on blank sheet) is critical -- need to see it with data.

### Inventory Tab: **Fix**
- The horizontal scrollbar is a bug.
- Attunement Slots / Used display is good.
- Currency section's CP wrapping to a second row is a layout issue.
- Item search/add + custom item button is correct.
- The 7/5 split between items and currency described in the spec isn't evident -- they appear stacked.

### Features Tab: **Fix**
- "Select a class, race, or background to see features" empty state is correct but the page feels very empty.
- Add feat search + custom feat at the bottom is fine but should be more prominent.
- Needs to show features in organized accordions when a class is selected.

### Notes Tab: **Keep**
- Simple textarea with label. Does exactly what it needs to. No issues.

### About Tab: **Keep** (minor fixes)
- Personality section (traits/ideals/bonds/flaws) in a 2x2 grid is clean.
- Appearance section with 6 fields in a row + portrait URL is well laid out.
- Backstory & Allies with two textareas is straightforward.
- Minor: "No portrait" placeholder text next to the URL input is good.

---

## 4. LOAD PAGE

### First Impression
Stark. Title + search bar + button. That's it. Feels unfinished compared to the rest of the app.

### Issues
- No indication of what happens if you search (do you need exact name? partial match?)
- No recent/saved characters list (could pre-populate on page load if backend is available)
- The gold "Search" button feels heavy for a text filter operation -- could be an inline search icon or search-on-type.

### Verdict: **Fix**
- Show all characters by default (or recent ones), filter on type.
- Add placeholder help text like "Enter character name (partial match works)" if applicable.
- Consider making this a modal or overlay rather than a full page -- reduces navigation friction.

---

## 5. WIKI SYSTEM

### Hover Card (Not Found State)
The "Not found" tooltip is tiny and unhelpful. When hovering over "acrobatics" in the skills table, the hover card shows just "Not found" in a small popover. This suggests the wiki data isn't loaded or the skill lookup isn't connected to the wiki backend.

### Verdict: **Fix**
- Skills should either have wiki descriptions or not be WikiLinks at all. A "Not found" tooltip on every skill hover is worse than no tooltip.
- If wiki data requires backend connection, degrade gracefully -- remove the dotted underline styling from skills that have no wiki entry.

---

## PRIORITIZED ACTION LIST (Top 10)

| # | Area | Change | Impact | Verdict |
|---|------|--------|--------|---------|
| **1** | Character Sheet -- Stat Bar | Differentiate HP and AC visually (larger, color-coded borders, bigger +/- controls). These are the two most-checked stats in combat. | Critical | **Fix** |
| **2** | Character Sheet -- Tabs | Add a "Quick Reference" panel or mini-summary above tabs showing attack bonus, spell save DC, and key resources -- the things currently hidden behind tab clicks | Critical | **Redesign** |
| **3** | Wizard -- Sticky Navigation | Make Back/Next buttons sticky at viewport bottom. On data-heavy steps (Class, Background), they scroll out of view. | High | **Fix** |
| **4** | Character Sheet -- Inventory | Fix the horizontal scrollbar overflow bug. Fix CP currency wrapping. | High | **Fix** |
| **5** | Wizard -- Empty Step States | Steps 1, 2 (empty), 3 (empty) are desolate. Add intro text, visual hints, or collapse the Basics step into Class. | Medium | **Fix** |
| **6** | Character Sheet -- Death Saves & Hit Dice | Enlarge death save checkboxes, show hit die type and remaining/total count, add visual state for "you're making death saves right now." | Medium | **Fix** |
| **7** | Home Page -- Action Hierarchy & Empty State | Make Guided Create the clear primary CTA. Add empty state for Recent Characters. | Medium | **Fix** |
| **8** | Review Step -- Bugs | Fix duplicate "Athletics" in skills. Separate passphrase into its own step or confirmation modal. | Medium | **Fix** |
| **9** | Wiki -- Graceful Degradation | Remove WikiLink styling from entities with no wiki data (skills showing "Not found"). Only style items that have actual content. | Medium | **Fix** |
| **10** | Load Page -- Default Content | Show all/recent characters on load, search filters inline, not an empty search box. Consider making it a modal. | Low | **Fix** |

---

## OVERALL ASSESSMENT

### What works well
- The color palette is genuinely attractive -- warm browns and golds on dark feel right for D&D
- Cinzel + Crimson Text pairing is strong. Fantasy authority without LARPing.
- The 3-column sheet layout is the right architecture
- The creation wizard with EntityCards is well-structured and information-rich
- Point buy interface is excellent
- The 3-tier depth system (surface/card/elevated) creates readable layering
- Section title styling (gold left border + uppercase + letter-spacing)
- About tab layout (personality/appearance/backstory)
- Notes tab (simple, does its job)

### The core problem
The app is built around **information architecture** (everything is organized correctly into tabs and sections) but not around **workflow architecture** (what does a player need to see and do, in what sequence, during actual gameplay?). The paper sheet solves this by putting everything on 2-3 pages simultaneously. This app needs a way to surface combat-critical information without tab-switching -- whether that's a persistent combat quick-reference, a collapsible "combat mode" overlay, or pinnable widgets.

### Second biggest issue
Empty states throughout the app (home, wizard steps, character sheet tabs, load page) are all minimal to nonexistent. Empty states are where new users form their first impression of each feature. Right now, many parts of the app look broken or unfinished when there's no data.

---

## Screenshots

All review screenshots saved to `review/` directory:
- `01-home.png` -- Home page
- `02-wizard-step1.png` -- Wizard Step 1 (Basics)
- `03-wizard-step2-class-empty.png` -- Wizard Step 2 (Class, empty)
- `04-wizard-step2-fighter.png` -- Wizard Step 2 (Fighter selected, full page)
- `05-wizard-step3-bg-empty.png` -- Wizard Step 3 (Background, empty)
- `06-wizard-step3-soldier.png` -- Wizard Step 3 (Soldier selected)
- `07-wizard-step4-human.png` -- Wizard Step 4 (Human selected)
- `08-wizard-step5-abilities.png` -- Wizard Step 5 (Point Buy)
- `09-wizard-step6-review.png` -- Wizard Step 6 (Review summary)
- `10-sheet-combat.png` -- Character Sheet (Combat tab)
- `11-sheet-spells.png` -- Character Sheet (Spells tab)
- `12-sheet-inventory.png` -- Character Sheet (Inventory tab)
- `13-sheet-features.png` -- Character Sheet (Features tab)
- `14-sheet-notes.png` -- Character Sheet (Notes tab)
- `15-sheet-about.png` -- Character Sheet (About tab, full page)
- `16-load-page.png` -- Load Character page
- `17-hover-card-notfound.png` -- Wiki hover card ("Not found" state)
