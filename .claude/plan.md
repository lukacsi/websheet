# Phase 6: Text-Heavy Sections & Color Harmonization

## Context

Phases 1-5 established the warm parchment theme across stats, gameplay, tables, and inventory. Two categories of work remain:

1. **Text-heavy sections** — PersonalitySection, BackstorySection, NotesSection, AppearanceSection still use bare Mantine defaults (plain textareas, no warm labels)
2. **Color harmonization** — 14 hardcoded Mantine colors (`blue`, `grape`, `green`, `teal`, `red`, `yellow`, `orange`) across badges/buttons need to use theme palette; 14 instances of `c="dimmed"` should use warm parchment tones

These are naturally two sub-phases, but small enough to do together.

## Files to modify

### Part A — Text-Heavy Sections
1. `src/components/sheet/PersonalitySection.tsx` (48 lines)
2. `src/components/sheet/BackstorySection.tsx` (30 lines)
3. `src/components/sheet/NotesSection.tsx` (19 lines)
4. `src/components/sheet/AppearanceSection.tsx` (66 lines)

### Part B — Color Harmonization
5. `src/components/sheet/SpellsSection.tsx` (160 lines) — school colors + dimmed text
6. `src/components/sheet/RemoveButton.tsx` (30 lines) — `red` → `bloodRed`
7. `src/components/sheet/DeathSavesSection.tsx` (52 lines) — `red` → `bloodRed`
8. `src/components/sheet/AttacksSection.tsx` (line 135) — `teal` button
9. `src/components/sheet/features/ClassFeaturesAccordion.tsx` (57 lines) — badge colors
10. `src/components/sheet/features/RaceTraitsAccordion.tsx` (91 lines) — badge colors
11. `src/components/sheet/features/BackgroundFeatureAccordion.tsx` (26 lines) — badge color
12. `src/components/sheet/features/FeatListAccordion.tsx` (145 lines) — badge + dimmed
13. `src/components/sheet/SensesSection.tsx` (39 lines) — dimmed labels
14. `src/components/sheet/HitDiceSection.tsx` (77 lines) — dimmed text
15. `src/components/sheet/CombatSidebar.tsx` (140 lines) — dimmed "auto:" hints
16. `src/components/sheet/ConditionsSection.tsx` (line 43) — dimmed text
17. `src/components/sheet/AbilityBlock.tsx` (line 77) — dimmed save text
18. `src/components/sheet/FeaturesSection.tsx` (line 162) — dimmed placeholder

## Changes

### Part A — Text-Heavy Sections

#### 1. PersonalitySection.tsx — Warm textarea labels

**a) Import Text**
- Add `Text` to Mantine imports

**b) Textarea labels — warm parchment style**
- Wrap each `label` prop in `<Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>` — matches every other label treatment in the sheet
- Labels: "Personality Traits", "Ideals", "Bonds", "Flaws"

**c) Textarea variant — unstyled border**
- Add `variant="unstyled"` to all 4 textareas — removes the default bordered input look, matching the inline-editing pattern used elsewhere (resources, inventory, attacks)
- Keeps the textarea functional but eliminates visual noise

#### 2. BackstorySection.tsx — Same treatment

**a) Import Text**

**b) Textarea labels — warm parchment**
- Same `<Text>` wrapper pattern as PersonalitySection for "Backstory" and "Allies & Organizations"

**c) Textarea variant — unstyled**
- Add `variant="unstyled"` to both textareas

#### 3. NotesSection.tsx — Add label + warm it

**a) Import Text**

**b) Add a label**
- Currently has no label at all, just a placeholder. Add:
  `label={<Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Notes</Text>}`

**c) Textarea variant — unstyled**
- Add `variant="unstyled"`

#### 4. AppearanceSection.tsx — Warm labels + portrait placeholder

**a) Appearance field labels — warm**
- The 6 TextInput `label` props (Age, Height, Weight, Eyes, Skin, Hair) are plain strings. Wrap each in `<Text size="xs" fw={600} c="parchment.5">` (no uppercase here — these are short field labels, not section headers)

**b) Portrait URL label — warm**
- Same `<Text>` wrapper for "Portrait URL" label

**c) "No portrait" text — warm instead of dimmed**
- Change `c="dimmed"` to `c="parchment.6"` on the "No portrait" text

**d) Portrait image — card treatment**
- Wrap the Image in a subtle container: add `style={{ border: '1px solid var(--mantine-color-dark-5)', borderRadius: 'var(--mantine-radius-sm)' }}` to the Image — gives it the card-depth border treatment without a full Paper wrapper

### Part B — Color Harmonization

#### 5. SpellsSection.tsx — Theme-aware school colors + warm dimmed

**a) SCHOOL_COLORS — use theme palette**
Current colors are generic Mantine (`blue`, `teal`, `violet`, `pink`, `red`, `indigo`, `gray`, `yellow`). Map to the warm theme while preserving school identity:
```tsx
const SCHOOL_COLORS: Record<string, string> = {
  A: 'inkBrown',   // Abjuration — protective/shielding
  C: 'teal',       // Conjuration — keep teal (summoning)
  D: 'grape',      // Divination — mystical purple
  E: 'pink',       // Enchantment — keep pink (charm)
  V: 'bloodRed',   // Evocation — destructive energy
  I: 'indigo',     // Illusion — keep indigo (deceptive)
  N: 'gray',       // Necromancy — keep gray (death)
  T: 'gold',       // Transmutation — alchemical gold
};
```
Key changes: Abjuration `blue`→`inkBrown` (theme primary), Evocation `red`→`bloodRed` (theme red), Transmutation `yellow`→`gold` (theme gold). Others stay — they already work fine in the palette.

**b) Ritual/Concentration badges — warm**
- `color="teal"` on Ritual badge → `color="gold"` (ritual is special/precious)
- `color="yellow"` on Concentration badge → `color="gold"` (unifies with theme)

**c) VSM components — warm dimmed**
- Change 3× `c="dimmed"` on V/S/M text → `c="parchment.6"`

**d) Empty state — warm dimmed**
- Change `c="dimmed"` on "No spells added yet" → `c="parchment.6"`

#### 6. RemoveButton.tsx — `bloodRed` theme color

- Change both `color="red"` to `color="bloodRed"` (Badge variant and ActionIcon variant)
- This propagates to every remove button across the entire sheet

#### 7. DeathSavesSection.tsx — `bloodRed` theme color

- Change `color="red"` on failure Checkboxes → `color="bloodRed"`
- Change `c="red.4"` on "Failures" label → `c="bloodRed.4"`
- Keep `c="teal.5"` on "Successes" — green/teal is the natural opposite

#### 8. AttacksSection.tsx — Warm "From weapon" button

- Change `color="teal"` → `color="gold"` on the "+ From weapon" button — gold for secondary actions, consistent with tabs/accent usage

#### 9. ClassFeaturesAccordion.tsx — Theme badge colors

- `color="blue"` (level badge) → `color="inkBrown"` — matches theme primary
- `color="grape"` (subclass badge) → `color="gold"` — gold for special/notable
- `color="yellow"` (choice needed) → `color="gold"` — unify with theme gold

#### 10. RaceTraitsAccordion.tsx — Theme badge colors

- `color="green"` (Race badge) → `color="inkBrown"` — primary for source badges
- `color="yellow"` (choice needed, 2×) → `color="gold"`

#### 11. BackgroundFeatureAccordion.tsx — Theme badge color

- `color="orange"` (Background badge) → `color="inkBrown"` — all source-type badges use primary

#### 12. FeatListAccordion.tsx — Theme colors + warm dimmed

- `color="orange"` / `color="teal"` on Feat badge → `color="inkBrown"` (unify source badges)
- `color="red"` on remove ActionIcon → `color="bloodRed"`
- `c="dimmed"` on "(background)" text → `c="parchment.6"`
- `c="dimmed"` on "Loading..." text → `c="parchment.6"`

#### 13-18. Remaining `c="dimmed"` → warm variants

All remaining `c="dimmed"` instances get warm replacements:

| File | Text | New color |
|------|------|-----------|
| SensesSection.tsx:32 | Passive sense labels | `c="parchment.5"` |
| HitDiceSection.tsx:48 | "remaining / {total}" | `c="parchment.6"` |
| CombatSidebar.tsx:117 | "auto: {initiative}" | `c="parchment.6"` |
| CombatSidebar.tsx:126 | "auto: {profBonus}" | `c="parchment.6"` |
| ConditionsSection.tsx:43 | "/ {maxExhaustion}" | `c="parchment.6"` |
| AbilityBlock.tsx:77 | "Save {modifier}" | `c="parchment.6"` |
| FeaturesSection.tsx:162 | "Select a class..." | `c="parchment.6"` |

**Color choice reasoning:**
- `parchment.5` for structural labels (senses — these are always visible, label-like)
- `parchment.6` for secondary/supplementary text (hints, auto-calculated values, loading states)

## What this does NOT change

- No structural/layout changes — same grids, stacks, groups
- No logic changes — same data flow, same callbacks
- No new dependencies — only uses existing theme colors (parchment, inkBrown, gold, bloodRed)
- Spell school colors keep distinct hues — just mapped to theme-aware palette
- `c="teal.5"` on DeathSaves "Successes" kept — it's the correct semantic opposite of bloodRed

## Verification

1. `pnpm exec tsc --noEmit` — type-check
2. Visual check:
   - Personality/Backstory/Notes: warm labels, clean unstyled textareas
   - Appearance: warm field labels, warm "No portrait", portrait border
   - Spells: school badges use warm palette, ritual/concentration are gold, VSM warm
   - All remove buttons use bloodRed (subtle, not jarring)
   - Death saves: bloodRed failures
   - Feature badges: inkBrown for sources, gold for choices/special
   - No remaining `c="dimmed"` anywhere in sheet components
   - No hardcoded Mantine color names (blue, green, grape, orange, yellow, teal, red) in sheet components
