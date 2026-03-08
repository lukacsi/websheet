# WebSheet — Full UI Redesign Brief

## What This Is

A D&D 5e character sheet web app. Create characters via a guided wizard, manage them on a dense interactive sheet, look up rules via inline wiki links. Built with React 19 + Mantine v8 + TypeScript. PocketBase backend.

## Current State

The codebase is clean (just finished a 10-batch UI audit). The architecture is solid — hooks, shared components, CSS modules, style constants. What needs work is the **visual design and UX**. Right now it's functional but generic — dark Mantine defaults with some warm brown accents. It doesn't feel like a product yet.

## Design Direction

**Fantasy-functional.** The app should feel like a well-crafted tool for D&D players — warm, atmospheric, but never sacrificing usability for aesthetics. Think "leather-bound journal meets modern dashboard." Dense but readable. Every pixel earns its place.

Reference points (mood, not copy):
- D&D Beyond's information density but with more warmth
- Notion's clean interaction patterns
- Old paper/leather textures as subtle accents, not wallpaper

## Pages & Layout

### Home (`/`)
Current: Centered container, 3 action cards, recent characters grid.
Goal: First impression — should immediately communicate "D&D tool" without being cheesy. The action cards (Create / Quick Create / Load) need visual hierarchy — guided create is the primary action. Recent characters should feel like a personal collection, not a list.

### Create Wizard (`/create`)
Current: 6-step Mantine Stepper (Basics, Class, Background, Race, Abilities, Review). React Hook Form + Zod. Each step has Select dropdowns, skill/tool pickers, feature choice accordions, progression tables.
Goal: The wizard is the onboarding experience — it should feel guided and confident, not overwhelming. Steps should have clear visual separation. The class/race selection steps are data-heavy (entity cards, feature lists, progression tables) — they need careful information hierarchy. The Review step should feel like a satisfying summary.

### Character Sheet (`/character/:id`)
Current: 3-column CSS Grid (left sidebar 240-260px | center flex | right sidebar 220-240px). Header with character info selects. Center has a CombatSidebar stat grid + 6 tabs (Combat, Spells, Inventory, Features, Notes, About). Responsive collapses to 2-col then 1-col.
Goal: This is the core screen — players spend hours here. It must be scannable at a glance and efficient for frequent interactions. The 3-column layout works but the visual weight is flat — everything looks the same importance. Needs clear visual zones. The tab content varies wildly in density (Combat is tables, About is textareas, Spells is a complex list) — each tab should feel purposeful, not just "content in a panel."

### Load Character (`/load`)
Current: Search bar + results list + passphrase prompt card.
Goal: Simple and fast. The passphrase prompt is the key interaction — make it feel secure but not intimidating.

## Component Inventory

### Shared Style System (`src/theme/`)
- **Theme:** Mantine createTheme with custom `parchment` and `inkBrown` color tuples, Crimson Text body font, Cinzel heading font
- **Style constants:** `darkPaperStyle`, `darkCardStyle`, `darkDrawerStyles`, `accordionDarkStyles`, 4 centered input variants
- **CSS:** `global.css` (scrollbar, body bg, base resets), `CharacterSheet.module.css` (grid layout)

### Sheet Components (`src/components/sheet/`)
- **AbilityBlock** — 3x2 grid of ability scores with modifiers, save checkboxes
- **SkillsSection** — 18-row table with prof/expertise checkboxes, modifier display
- **CombatSidebar** — Auto-fill grid of StatBox components (HP, AC, Speed, Initiative, etc.)
- **AttacksSection** — Table with name/bonus/damage columns
- **ResourcesSection** — Table with name/used/max/reset columns
- **SpellcastingSection** — Ability select + spell slot grid
- **SpellsSection** — Search + spell list grouped by level, with badges (school, components, ritual, concentration)
- **InventorySection** — Item search + attunement tracker + items table
- **CurrencySection** — 5 coin type inputs (PP/GP/EP/SP/CP)
- **FeaturesSection** — 4 accordion sub-components (race traits, class features, background, feats)
- **DeathSavesSection** — Success/failure checkbox rows
- **HitDiceSection** — Die type + remaining/total list
- **ConditionsSection** — Condition pills + add menu + exhaustion tracker
- **SensesSection** — Calculated passive perception/insight/investigation
- **ProficienciesSection** — Multi-select for armor/weapons/tools/languages
- **PersonalitySection** — 4 textareas (traits, ideals, bonds, flaws)
- **AppearanceSection** — Description textarea + portrait URL
- **BackstorySection** — Backstory + allies textareas
- **NotesSection** — Single autosize textarea
- **SectionTitle** — Uppercase label with bottom border (parchment.4)
- **RemoveButton** — Compact delete icon

### Wiki Components (`src/components/wiki/`)
- **WikiLink** — Dotted-underline text, color-coded by type, HoverCard preview on hover, opens EntityDrawer on click
- **EntityDrawer** — Right-side Drawer with navigation stack, dark-8 bg
- **EntityDetailView** — Renders 5e.tools entry format (text, lists, tables, inline rolls)
- **EntityCard** — Card wrapper for wizard entity display (dark-7 bg, dark-4 border)

### Create Components (`src/components/create/`)
- Step components for the wizard
- Pickers for skills, tools, languages, features

## Technical Constraints

- **Mantine v8** — use its component API, theming, and CSS variables. Don't fight it.
- **Existing architecture** — the component decomposition is final. Redesign styling and layout, not component boundaries.
- **Responsive** — must work at desktop (3-col sheet), tablet (2-col), mobile (stacked). The CSS module handles breakpoints.
- **Data density** — D&D sheets are inherently dense. Don't sacrifice information for whitespace. Players need to see stats, skills, spells, inventory without excessive scrolling.
- **Performance** — no heavy animations or layout thrash. The sheet has dozens of controlled inputs.
- **Fonts** — Cinzel (headings) and Crimson Text (body) are loaded and working. Keep or replace, but stay serif/fantasy.
- **Dark mode only** — no light mode needed.

## What to Deliver

A phased redesign plan, then implementation. For each phase:
1. Which files change
2. What the visual change is (describe or ASCII mockup)
3. Why it improves the experience

Start with the **theme and global styles** (biggest bang for least disruption), then move outward to **layout**, then **individual components**.

## Files to Know

| File | What |
|------|------|
| `src/theme/index.ts` | Mantine theme (colors, fonts, radius) |
| `src/theme/styles.ts` | Shared style constants |
| `src/theme/global.css` | Global CSS (scrollbar, body, resets) |
| `src/pages/CharacterSheet.tsx` | Main sheet page (imports all sheet components) |
| `src/pages/CharacterSheet.module.css` | Sheet grid layout + responsive breakpoints |
| `src/pages/Home.tsx` | Landing page |
| `src/pages/CreateCharacter.tsx` | Wizard page |
| `src/pages/LoadCharacter.tsx` | Load page |
| `src/App.tsx` | Router + AppShell layout |
| `src/components/sheet/` | All sheet section components |
| `src/components/wiki/` | WikiLink, EntityDrawer, EntityDetailView |
| `src/components/create/` | Wizard step components, EntityCard |

## Non-Goals

- No new features. This is visual/UX only.
- No component restructuring. The decomposition is done.
- No backend changes.
- No new dependencies unless strongly justified (e.g., a specific animation library).
