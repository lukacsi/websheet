# WebSheet UI Redesign Plan

## Context

WebSheet is a functional D&D 5e character sheet app that currently uses generic dark Mantine defaults with warm brown accents. The architecture is solid but the visual design is flat — every element has the same visual weight (`darkPaperStyle` with `dark-7` bg and `dark-5` border everywhere), no depth hierarchy, no atmosphere. The goal is "fantasy-functional" — leather-bound journal meets modern dashboard.

---

## Phase 1: Theme Foundation (biggest impact, least disruption)

**Files:** `src/theme/index.ts`, `src/theme/styles.ts`, `src/theme/global.css`

**Changes:**

### 1a. Richer color palette in `index.ts`
- Add a `gold` accent color tuple (for important values like HP, AC, level) — warm metallic gold
- Add a `bloodRed` color tuple (for damage, death saves, negative modifiers) — deeper than Mantine red
- Tune `parchment` slightly warmer (current is fine, minor tweak)
- Add component theme overrides:
  - `Paper`: default subtle shadow, slightly rounded
  - `Card`: hover lift effect via CSS transition
  - `Tabs`: custom indicator styling (gold underline instead of default)
  - `Table`: subtle row hover, alternating row tint
  - `Badge`: slightly more rounded, custom font
  - `Checkbox`: custom checked color using inkBrown

### 1b. Layered depth system in `styles.ts`
Replace the flat `darkPaperStyle` / `darkCardStyle` with a 3-tier depth system:
- **`surface`** — `dark-8` bg, no border (base layer, sidebars)
- **`card`** — `dark-7` bg, `dark-5` border, subtle `box-shadow` (content containers)
- **`elevated`** — `dark-6` bg, `dark-4` border, stronger shadow (important/interactive elements like StatBoxes, ability scores)

Also add:
- **`sectionDivider`** — parchment-tinted border instead of plain `dark-5`
- **`glowAccent`** — subtle warm glow for important interactive elements (save button, HP)

### 1c. Global CSS atmosphere in `global.css`
- Subtle CSS background texture — a very faint noise/grain overlay on `body` using CSS `background-image` with a tiny inline SVG data URI (no external deps). Just enough to break the flat digital feel.
- Custom focus ring — warm parchment glow instead of default blue
- Scrollbar thumb — inkBrown tint instead of plain gray
- Selection color — parchment-tinted
- Smooth transitions on interactive elements: `transition: background-color 0.15s, box-shadow 0.15s, border-color 0.15s`

**Why:** Every component imports from theme/styles. Changing the depth system here cascades everywhere instantly — all StatBoxes, ability blocks, cards, drawers get visual hierarchy without touching component code.

---

## Phase 2: Section Title & Layout Zones

**Files:** `src/components/sheet/SectionTitle.tsx`, `src/pages/CharacterSheet.module.css`, `src/pages/CharacterSheet.tsx`

**Changes:**

### 2a. SectionTitle redesign
Current: plain uppercase text with bottom border. Functional but invisible.

New design:
- Left accent bar (2-3px vertical line in parchment/gold) instead of bottom border
- Slightly larger, with letter-spacing for that engraved feel
- Optional decorative flourish character (em dash or similar) as CSS `::after` — subtle, not cheesy

### 2b. Layout zones in CSS module
Add visual zone separation to the 3-column grid:
- Left sidebar: `surface` depth, slight right border with parchment tint
- Center: no background (inherits body), content cards use `card` depth
- Right sidebar: `surface` depth, slight left border
- This creates a "book spread" feel — margins on the sides, content in the middle

### 2c. Header bar redesign in CharacterSheet.tsx
Current: single Paper with Grid of inputs — dense but undifferentiated.

New:
- Character name gets prominent treatment — larger font, gold tint, Cinzel font
- Race/Class/Background row becomes a compact badge-like display with WikiLinks
- Inspiration/Edition/XP row gets subtle separator
- Save status + buttons right-aligned with clear visual states (unsaved = warm pulse, saved = dimmed)
- Short/Long Rest buttons get icon treatment (bed icon, campfire icon from Tabler)

**Why:** Creates the "visual zones" the brief asks for. The sheet goes from "everything looks the same" to clear left/center/right territories with distinct purposes.

---

## Phase 3: Combat Stats & Core Interactions

**Files:** `src/components/sheet/CombatSidebar.tsx`, `src/components/sheet/AbilityBlock.tsx`, `src/components/sheet/SkillsSection.tsx`

**Changes:**

### 3a. StatBox elevation
Current: flat `darkPaperStyle` boxes in a grid. All look identical.

New:
- HP box: `elevated` depth + gold border accent when HP < max (visual alert)
- AC box: shield-like visual treatment (thicker top border, subtle gradient)
- Level box: gold accent
- Other boxes: `card` depth (standard)
- All StatBoxes: label text slightly more prominent, value text larger

### 3b. AbilityBlock polish
Current: 3x2 grid of identical papers.

New:
- Each ability card uses `elevated` depth
- Modifier value gets more visual weight — larger, bolder
- Saving throw proficiency checkbox gets a filled-circle style when checked
- Subtle color coding: STR/CON warm tones, DEX/INT cool tones, WIS/CHA neutral — very subtle, just enough to aid scanning

### 3c. SkillsSection density improvement
Current: 18-row table, functional but uniform.

New:
- Proficient skills get a subtle left border accent (inkBrown)
- Expertise skills get a stronger accent (gold)
- Non-proficient skills slightly dimmed
- Group visual separation between ability groups (STR skills, DEX skills, etc.) with micro-gaps

**Why:** These are the most-viewed, most-interacted-with components. Making HP/AC/Level pop and skills scannable has the highest UX impact.

---

## Phase 4: Tabs & Content Panels

**Files:** `src/pages/CharacterSheet.tsx` (tab styles), individual tab content components

**Changes:**

### 4a. Tab bar redesign
Current: Mantine default tabs with Cinzel font — works but generic.

New:
- Active tab: gold underline indicator (2px), slightly brighter text
- Inactive tabs: dimmed, subtle hover effect
- Tab bar gets a subtle bottom border for separation from content
- Icons before tab labels (sword for Combat, wand for Spells, backpack for Inventory, scroll for Features, quill for Notes, person for About) — small Tabler icons

### 4b. Tab panel backgrounds
Each tab panel gets a subtle visual identity:
- Combat: standard (tables)
- Spells: slightly different section grouping (spell level headers get more prominence)
- Inventory: currency section gets a coin-themed accent
- Features: accordion headers get warmer tones
- Notes/About: softer, more "journal" feel

**Why:** The tabs contain wildly different content types. Giving each a subtle identity helps orientation and makes the app feel intentional rather than "content dumped in panels."

---

## Phase 5: Home & Wizard Pages

**Files:** `src/pages/Home.tsx`, `src/pages/CreateCharacter.tsx`, `src/pages/LoadCharacter.tsx`, `src/components/AppShell.tsx`

**Changes:**

### 5a. Home page hero treatment
Current: centered title + 3 equal cards.

New:
- "WebSheet" title with Cinzel, larger, subtle text-shadow for depth
- Tagline in Crimson Text italic
- Primary action (Guided Create) gets `elevated` depth + gold border + larger size
- Secondary actions (Quick Create, Load) get `card` depth, smaller
- Recent characters: card hover effect, class/race badges with custom colors matching wiki tag colors
- Subtle decorative separator between actions and recent characters

### 5b. Wizard stepper refinement
Current: Mantine default Stepper.

New:
- Completed steps: gold checkmark
- Active step: gold circle
- Step connector lines: parchment tint
- Step content area: `card` depth container with padding
- Navigation buttons: Back (subtle), Next (inkBrown filled), Create (gold/green)

### 5c. AppShell header
Current: dark-8 bg, simple text links.

New:
- Subtle bottom border with parchment tint (warm separator)
- "WebSheet" logo text with subtle letter-spacing
- Nav links with hover underline animation
- Active page indicator

### 5d. Load page
- Search input gets a warmer border on focus
- Result cards match the recent-characters card style from Home
- Passphrase prompt card: distinct border (parchment-6) + lock icon

**Why:** First and last impressions. Home is the first thing users see, the wizard is the onboarding. These set expectations.

---

## Phase 6: Wiki & Drawers

**Files:** `src/components/wiki/WikiLink.tsx`, `src/components/wiki/EntityDrawer.tsx`, `src/components/wiki/EntityCard.tsx`

**Changes:**

### 6a. WikiLink hover preview
- HoverCard dropdown gets `elevated` depth with warm border
- Slightly larger preview area
- Source badge more prominent

### 6b. EntityDrawer
- Header gets parchment-tinted bg (not just dark-8)
- Navigation breadcrumb more visible
- Content area with slightly warmer tone
- Section headers within detail views match SectionTitle style

### 6c. EntityCard (wizard)
- Warmer border on hover
- Subtle hover lift transition
- Selected state with gold border

**Why:** The wiki integration is a differentiating feature. Making it feel polished elevates the entire app.

---

## Implementation Notes

### No new dependencies
All changes use:
- Mantine v8 theme system (component defaultProps, CSS variables)
- CSS (transitions, pseudo-elements, subtle shadows, inline SVG for texture)
- Tabler icons (already installed via `@tabler/icons-react`)

### Approach per phase
Each phase is independently deployable. Changes cascade from theme → layout → components, so earlier phases amplify later ones.

### Confirmed decisions
- **Texture:** Subtle CSS noise via inline SVG data URI on body
- **Tab icons:** Icons + text (Tabler icons before each tab label)
- **Migration:** Clean break — replace all `darkPaperStyle`/`darkCardStyle` imports in one pass per phase, no aliases

### Style constant migration
When updating `styles.ts`, replace all imports across components in a single pass:
- `darkPaperStyle` → appropriate depth level (`surfaceStyle`, `cardStyle`, `elevatedStyle`)
- `darkCardStyle` → `cardStyle` or `elevatedStyle` depending on context

### Testing
After each phase:
1. `pnpm dev` — visual check on all 4 pages
2. Check responsive breakpoints (desktop 3-col, tablet 2-col, mobile 1-col)
3. Verify no layout shifts or overflow issues
4. Check wiki hover cards still render correctly
5. Verify input interactions (NumberInput, Select, Checkbox) still work

---

## Phase order rationale

1. **Theme** first — biggest visual bang, zero component changes needed
2. **Layout zones** — creates structure that makes everything else look better
3. **Combat/Abilities** — highest-traffic components, most visible improvement
4. **Tabs** — polish the content organization
5. **Home/Wizard** — first impressions, but less time-spent than the sheet
6. **Wiki** — finishing touches on a differentiating feature

---

## Session Segmentation

The redesign is too large for a single session. Split into 4 independently deployable sessions:

### Session 1: Theme Foundation + Style Migration (Phase 1)
**The "big bang" — largest session, mostly mechanical**

Files:
- Rewrite `theme/index.ts` (41 → ~100 lines) — color palette, component overrides
- Rewrite `theme/styles.ts` (37 → ~80 lines) — new 3-tier depth system
- Rewrite `theme/global.css` (29 → ~80 lines) — texture, scrollbar, focus ring
- Migrate all 18 style importers to new constants

The migration is all-or-nothing — can't have half the files on old styles and half on new. `darkPaperStyle` → `surfaceStyle`/`cardStyle`/`elevatedStyle`, `darkCardStyle` → `cardStyle`/`elevatedStyle`.

**~25-30 file edits | Risk: Medium (bulk rename, no logic changes)**

### Session 2: Layout & Section Titles (Phase 2)

Files:
- `SectionTitle.tsx` (19 lines) — left accent bar, letter-spacing
- `CharacterSheet.module.css` (46 lines) — zone borders, sidebar depth
- `CharacterSheet.tsx` (407 lines) — header: name prominence, badge display, rest icons, save states

Most complex single-file edit (CharacterSheet.tsx) but isolated to one page.

**~3-4 file edits | Risk: Low-medium (layout overflow possible)**

### Session 3: Combat Stats & Core Components (Phase 3)

Files:
- `CombatSidebar.tsx` (131 lines) — StatBox elevation, HP/AC/Level accents
- `AbilityBlock.tsx` (77 lines) — elevated depth, modifier weight, color coding
- `SkillsSection.tsx` (85 lines) — proficiency accents, expertise gold, grouping

Three focused components in `components/sheet/`. No cross-cutting concerns.

**3 file edits | Risk: Low**

### Session 4: Polish Sweep (Phases 4 + 5 + 6)

Files:
- `CharacterSheet.tsx` — tab bar icons, gold indicator, panel identities
- `Home.tsx` (94 lines) — hero treatment, card hierarchy
- `CreateCharacter.tsx` (120 lines) — stepper styling
- `LoadCharacter.tsx` (158 lines) — search input, result cards
- `AppShell.tsx` (48 lines) — header border, nav hover
- `WikiLink.tsx` (136 lines) — hover card elevation
- `EntityDrawer.tsx` (102 lines) — header tint, section headers
- `EntityCard.tsx` — hover lift, selected state

All polish, none interdependent. Grouped because each change is small and self-contained.

**~8 file edits | Risk: Low**

### Session Summary

| Session | Phases | Files | Focus |
|---------|--------|-------|-------|
| 1 | Phase 1 | ~21 | Foundation + migration |
| 2 | Phase 2 | ~4 | Layout zones |
| 3 | Phase 3 | 3 | Core components |
| 4 | Phases 4-6 | ~8 | Polish sweep |

Session 1 is best suited for batch mode (mechanical migration). Sessions 2-4 could merge if context allows. Each session ends with `pnpm dev` visual verification.
