**UX/UI Design Review — D&D 5e Character Sheet Web App ("WebSheet")**

You are a senior UX/UI designer reviewing a D&D 5e character sheet web application. The app replaces paper character sheets and editable PDFs for a small play group. It's functional and feature-complete but the visual design feels off — I need a professional eye to identify exactly what's wrong.

**The benchmark this must beat:**
The official D&D 5e character sheet PDF — familiar layout, scannable at a glance during gameplay, zero learning curve for players who've used paper sheets. If a player mid-combat can't find their AC faster than flipping a page, this app has failed. If the DM asks "what's your passive perception?" and the player has to hunt through tabs, it's worse than paper.

**What the app does:**
- Create D&D 5e characters via a 6-step guided wizard (race, class, background, abilities, etc.)
- Manage characters on a dense interactive sheet (3-column layout)
- Inline wiki integration — hover any spell, item, skill, condition to see a preview card; click to open a detail drawer
- Load characters by name + passphrase (no accounts)
- Dark mode only

**Design intent:**
"Fantasy-functional" — warm, atmospheric, dense but readable. Not a medieval cosplay site — a real tool that feels like it belongs at the table. D&D Beyond's information density with more warmth. The paper character sheet's scannability with the benefits of auto-calculation and integrated rules lookup.

**Tech stack (constraints):**
- React + Mantine v8 component library (dark theme)
- Custom color palette: parchment (warm tan), inkBrown (warm brown, primary), gold (metallic accent), bloodRed (danger/negative)
- Fonts: Cinzel (headings — engraved/fantasy), Crimson Text (body — warm serif)
- 3-tier depth system: surface (dark-8, base layer), card (dark-7, bordered, shadow), elevated (dark-6, stronger border+shadow)
- CSS background texture (subtle noise grain on body)
- Responsive: 3-col desktop, 2-col tablet, 1-col mobile

---

## App Structure (for context while reviewing screenshots)

### Home Page (`/`)
- Centered container with "WebSheet" title (Cinzel) + "D&D 5e Character Manager" subtitle
- 3 action cards in a row: Guided Create (filled button), Quick Create (light button), Load Character (light button) — all same visual weight
- Recent Characters grid below (4 columns, cards with name + class/race badges)

### Character Sheet (`/character/:id`) — the core screen
**Header bar:** Single Paper with Grid of inputs — character name (large, gold, Cinzel), race/class/subclass/background selects with WikiLinks below each, alignment + player text inputs. Second row: inspiration checkbox, edition select, XP input, Short Rest + Long Rest buttons, save status + save button.

**3-column body:**

- **Left sidebar (240-260px):** Abilities (3x2 grid of ability score cards — each has name, modifier display, score input, saving throw checkbox) + Skills (18-row table with proficiency/expertise checkboxes, ability badge, modifier). Separated by warm border-right.

- **Center column:** CombatSidebar stat grid at top (auto-fill 3-col grid of StatBoxes: HP/MaxHP/TempHP, AC, Speed, Initiative, Proficiency Bonus, Level — each is an elevated-depth Paper with label + centered large NumberInput). Then 6 tabs below (Cinzel uppercase, gold active indicator):
  - **Combat tab:** Attacks table (name/bonus/damage) + Resources table (name/used/max/reset-trigger)
  - **Spells tab:** Spellcasting config (ability select, auto-calc DC/attack) + spell slot grid (9 levels, max/used rows) + spell list grouped by level with badges (school, V/S/M, ritual, concentration)
  - **Inventory tab:** 7/5 split grid — item table (name/qty/equipped/attuned with search-add) + currency inputs (PP/GP/EP/SP/CP)
  - **Features tab:** Search filter + 4 accordions (class features by level, race traits, background feature, feats with add/remove)
  - **Notes tab:** Single large autosize textarea
  - **About tab:** Personality (4 textareas: traits/ideals/bonds/flaws), Appearance (6 text inputs + portrait URL), Backstory (2 textareas)

- **Right sidebar (220-240px):** Death Saves (3 success + 3 failure checkboxes), Hit Dice (die type + remaining/total), Conditions (pill badges + add menu + exhaustion tracker), Senses (auto-calc passive perception/investigation/insight), Proficiencies & Languages (tag lists with add input). Separated by warm border-left.

### Create Wizard (`/create`)
- "Create Character" title + 6-step Mantine Stepper (Basics, Class, Background, Species, Abilities, Review)
- Each step is its own form panel with Select dropdowns, entity cards, skill/tool pickers, feature accordions, progression tables
- Bottom: Back (default variant) + Next (inkBrown filled) or Create Character (gold) buttons

### Load Character (`/load`)
- "Load Character" title + search bar with button
- Results as cards (name, class/race/background badges, "Protected" badge if passphrased)
- Passphrase prompt card (elevated depth) appears below when clicking a protected character

### Wiki System
- **WikiLink:** Dotted-underline text, color-coded by entity type (spell=violet, item=teal, class=orange, race=green, etc.). HoverCard preview on hover (400ms delay), click opens EntityDrawer.
- **EntityDrawer:** Right-side drawer (XL size), sticky header with back/close, scrollable content. Entity detail views with badges, dividers, formatted 5e.tools text. Creature stat blocks have red dividers and 6-column ability grid.
- **EntityCard:** Card wrapper used in wizard — name, source badge, formatted entries.

### Visual System
- **Section titles:** Uppercase, parchment.5 color, 3px left border (parchment.6), letter-spacing
- **Tables:** Warm row hover (rgba gold 0.04), parchment.5 uppercase table headers
- **Status borders:** Gold = attuned/always-prepared/special, inkBrown = equipped/proficient, bloodRed = danger/failure
- **Dimming:** Opacity 0.5 for depleted resources/used spell slots
- **Badges:** Crimson Text font, inkBrown for source/category, gold for notable, bloodRed for danger

---

## What I need from you

For each screenshot, provide:

1. **First impression** (2-3 sentences) — What hits you immediately? What feels "off"? Does this feel like a tool you'd want open at the table?

2. **Paper sheet comparison** — What does the classic D&D PDF do better here? What information is harder to find than it should be? What's buried in tabs/clicks that should be visible at a glance? Would a player used to paper sheets feel lost?

3. **Hierarchy & visual weight** — Where does the eye go? Where *should* it go? What elements compete for attention? What critical gameplay info (HP, AC, spell slots, key modifiers) lacks visual prominence?

4. **At-the-table usability** — Can a player glance at this during combat and get what they need in under 2 seconds? Are the most frequent actions (update HP, check a modifier, mark a spell slot) obvious and fast? Is anything more than 2 clicks away that shouldn't be?

5. **Spacing, color & typography** — Inconsistent padding, cramped areas, readability issues, contrast problems, font sizes that don't create hierarchy, elements that blend into backgrounds

6. **Component-level issues** — Specific UI elements that look amateur, broken, or inconsistent

7. **Verdict per section/tab:**
   - **Keep** — works well, minor tweaks at most
   - **Fix** — right concept, wrong execution (list specific fixes)
   - **Redesign** — fundamentally doesn't work, needs a new approach (explain why and suggest direction)

**Pages/screens you'll see:**
- Home page (landing with action cards + recent characters)
- Character creation wizard (6 steps with varying data density)
- Character sheet (the core — 3 columns, 6 tabs, show each tab)
- Load character page
- Wiki drawer and hover cards

**Be ruthless.** I don't need validation. Every rough edge, every "almost but not quite," every place where a player would squint or hesitate mid-session. Prioritize by impact — what makes the biggest difference if fixed first?

At the end, provide a **prioritized action list** — the top 10 changes ranked by visual impact, with a clear Keep/Fix/Redesign verdict for each major area.
