# Phase 7: Final Polish — Make Everything Feel Alive

## Context

Phases 1-6 styled all sheet components with the warm parchment/fantasy theme. But the moment you leave the sheet — pages, drawers, create wizard, wiki details — you hit cold default Mantine blue. Select dropdowns have blue highlights, loaders spin blue, badges are blue/green/orange, and `c="dimmed"` is everywhere instead of warm parchment tones. This phase harmonizes **everything outside the sheet** so the entire app feels like one cohesive, warm, leather-bound experience.

## Scope

Three layers of work:

1. **Theme-level overrides** (index.ts) — fix Select, Loader, Button, Notification at the root so every instance inherits warm defaults
2. **Page-level cleanup** (4 pages) — hardcoded colors, dimmed text, rest buttons
3. **Component-level cleanup** (~15 files) — wiki details, create flow, shared components

## Files to modify

### Layer 1 — Theme Overrides
1. `src/theme/index.ts`

### Layer 2 — Pages
2. `src/pages/Home.tsx`
3. `src/pages/LoadCharacter.tsx`
4. `src/pages/CreateCharacter.tsx`
5. `src/pages/CharacterSheet.tsx`

### Layer 3 — Components
6. `src/components/wiki/EntityDrawer.tsx`
7. `src/components/wiki/WikiLink.tsx`
8. `src/components/wiki/TaggedText.tsx`
9. `src/components/wiki/details/SpellDetail.tsx`
10. `src/components/wiki/details/ItemDetail.tsx`
11. `src/components/wiki/details/ClassFeatureDetail.tsx`
12. `src/components/wiki/details/BackgroundDetail.tsx`
13. `src/components/wiki/details/FallbackDetail.tsx`
14. `src/components/wiki/details/CreatureDetail.tsx`
15. `src/components/create/EntityCard.tsx`
16. `src/components/create/StepClass.tsx`
17. `src/components/create/StepReview.tsx`
18. `src/components/create/AbilityScoreAllocator.tsx`
19. `src/components/create/BackgroundBonusPicker.tsx`
20. `src/components/create/SkillPicker.tsx`
21. `src/components/create/EntryRenderer.tsx`

## Changes

### Layer 1 — Theme Overrides (index.ts)

These fix entire categories globally. Most impactful work in the phase.

**a) Select dropdown — warm highlight**
Add to `components` in `createTheme`:
```tsx
Select: {
  styles: {
    option: {
      '&[data-combobox-selected]': {
        backgroundColor: 'var(--mantine-color-inkBrown-8)',
      },
      '&[data-combobox-active]': {
        backgroundColor: 'rgba(191, 157, 100, 0.08)',
      },
    },
    dropdown: {
      backgroundColor: 'var(--mantine-color-dark-7)',
      borderColor: 'var(--mantine-color-dark-4)',
    },
  },
},
```
This fixes every Select, MultiSelect, and Autocomplete dropdown across the app in one shot.

**b) Loader — gold instead of blue**
```tsx
Loader: {
  defaultProps: {
    color: 'gold',
  },
},
```

**c) Notification — warm defaults**
```tsx
Notification: {
  styles: {
    root: {
      backgroundColor: 'var(--mantine-color-dark-7)',
      borderColor: 'var(--mantine-color-dark-5)',
    },
  },
},
```

**d) Alert — themed**
```tsx
Alert: {
  styles: {
    root: {
      backgroundColor: 'var(--mantine-color-dark-7)',
      borderColor: 'var(--mantine-color-dark-5)',
    },
  },
},
```

**e) SegmentedControl — warm**
```tsx
SegmentedControl: {
  styles: {
    indicator: {
      backgroundColor: 'var(--mantine-color-inkBrown-8)',
    },
  },
},
```

### Layer 2 — Pages

#### 2. Home.tsx

**a) Subtitle — warm instead of dimmed**
- `c="dimmed"` on "D&D 5e Character Manager" → `c="parchment.5"`

**b) Card descriptions — warm instead of dimmed**
- 3× `c="dimmed"` on card descriptions → `c="parchment.6"`

**c) Recent character badges — theme colors**
- `color="blue"` (class) → `color="inkBrown"`
- `color="green"` (race) → `color="gold"`

#### 3. LoadCharacter.tsx

**a) Character badges — theme colors**
- `color="blue"` (class) → `color="inkBrown"`
- `color="green"` (race) → `color="gold"`
- `color="orange"` (background) → `color="parchment"`

**b) "No characters found" — warm**
- `c="dimmed"` → `c="parchment.6"`

**c) Notification color**
- `color: 'red'` on wrong passphrase → `color: 'bloodRed'`

**d) Passphrase card — use elevatedStyle**
Replace the inline style object on the passphrase Card with:
```tsx
style={elevatedStyle}
```
Import `elevatedStyle` from `@/theme/styles`. The manual `backgroundColor`/`border` it currently has is close but inconsistent.

#### 4. CreateCharacter.tsx

**a) Alert — bloodRed**
- `color="red"` → `color="bloodRed"`

**b) "Create Character" button — gold, not green**
- `color="green"` → `color="gold"` — gold is the theme's "go/success" accent

**c) Success notification — gold**
- `color: 'green'` → `color: 'gold'`

#### 5. CharacterSheet.tsx

**a) Rest buttons — theme colors**
- Short Rest: `color="teal"` → `color="parchment"` (subtle, mundane action)
- Long Rest: `color="blue"` → `color="gold"` (restorative, special)

**b) Subrace text — warm**
- `c="dimmed"` on `({character.subraceName})` → `c="parchment.6"`

**c) Saved status text — warm when not dirty**
- `c={dirty ? 'gold.4' : 'dimmed'}` → `c={dirty ? 'gold.4' : 'parchment.6'}`

### Layer 3 — Components

#### 6. EntityDrawer.tsx
- `c="dimmed"` on error/not-found text → `c="parchment.6"`

#### 7. WikiLink.tsx
- `c="dimmed"` on "Not found" → `c="parchment.6"`
- `c="dimmed"` on "Click for more..." → `c="parchment.6"`

#### 8. TaggedText.tsx
- `c="dimmed"` on italic text spans → `c="parchment.6"`

#### 9. SpellDetail.tsx
- `c="dimmed"` on level label → `c="parchment.6"`
- `c="dimmed"` on "Classes:" → `c="parchment.5"`
- `color="teal"` on Ritual badge → `color="gold"`
- `color="yellow"` on Concentration badge → `color="gold"`
- `color="orange"` on class badges → `color="inkBrown"`

#### 10. ItemDetail.tsx
- `color="teal"` on rarity badge → `color="gold"`
- `c="dimmed"` on attunement text → `c="parchment.6"`
- `c="dimmed"` on "Stealth disadvantage" → `c="parchment.6"`

#### 11. ClassFeatureDetail.tsx
- `color="orange"` on class badge → `color="inkBrown"`

#### 12. BackgroundDetail.tsx
- `color="yellow"` on feature badges → `color="gold"`

#### 13. FallbackDetail.tsx
- `c="dimmed"` → `c="parchment.6"`

#### 14. CreatureDetail.tsx
- `c="dimmed"` on creature type/alignment → `c="parchment.6"`
(Keep `color="red.8"` on creature stat dividers — that's intentional for monster statblock style)

#### 15. EntityCard.tsx (create flow)
- `c="dimmed"` on source text → `c="parchment.6"`

#### 16. StepClass.tsx
- 4× `c="dimmed"` → `c="parchment.6"` (source labels, "Details not available" messages)

#### 17. StepReview.tsx
- ~12× `c="dimmed"` → `c="parchment.5"` (these are field labels: Name, Player, Class, etc. — structural, so use .5 not .6)
- 1× `c="dimmed"` on em-dash (`—`) fallback → `c="parchment.6"`
- 1× `c="dimmed"` on spell save DC label → `c="parchment.5"`

#### 18. AbilityScoreAllocator.tsx
- `c="dimmed"` on cost column → `c="parchment.6"`
- `c="dimmed"` on em-dash bonus fallback → `c="parchment.6"`
- 3× `c="dimmed"` on method descriptions → `c="parchment.6"`

#### 19. BackgroundBonusPicker.tsx
- 2× `c="dimmed"` on helper text → `c="parchment.6"`

#### 20. SkillPicker.tsx
- `c="dimmed"` on helper text → `c="parchment.6"`

#### 21. EntryRenderer.tsx
- `c="dimmed"` on JSON fallback → `c="parchment.6"`

## What this does NOT change

- No structural/layout changes
- No logic changes
- No new dependencies
- Sheet components (already styled in Phases 3-6) are not touched except CharacterSheet.tsx page-level elements
- CreatureDetail.tsx red dividers kept — correct for monster statblocks
- AppShell.tsx already uses parchment colors — no changes needed

## Implementation notes

- **Layer 1 first** — theme overrides fix the most with the fewest edits. Do these before anything else.
- **`c="dimmed"` replacements** can use `replace_all` per file since we're replacing every instance
- **Badge colors follow this system:**
  - `inkBrown` = source/category badges (class, race, background, feat source)
  - `gold` = special/notable badges (ritual, concentration, rarity, choice needed, success actions)
  - `bloodRed` = danger/failure (remove buttons, death save failures, errors)
  - `parchment` = neutral/mundane badges

## Verification

1. `pnpm exec tsc --noEmit` — type-check
2. `grep -r 'c="dimmed"' src/` — should return zero results
3. `grep -rE 'color="(blue|green|orange|yellow|red)"' src/` — should return zero results (except CreatureDetail red dividers which are intentional)
4. Visual check:
   - Home page: warm card descriptions, inkBrown/gold character badges
   - Load page: warm badges, warm passphrase card
   - Create wizard: gold "Create Character" button, bloodRed error alert
   - Character sheet: warm rest buttons, gold save button pulse
   - Wiki drawer: gold loader, warm error states
   - Spell detail: gold ritual/concentration, inkBrown class badges
   - Select dropdowns everywhere: dark background, warm highlight on hover/selected
   - All loaders spin gold
