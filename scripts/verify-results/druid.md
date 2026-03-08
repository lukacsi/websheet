# Druid Class Verification Report

**Source file:** `data/5etools-src/data/class/class-druid.json`
**Date:** 2026-03-07
**Editions covered:** classic (PHB) and one (XPHB)

---

## A. Class Basics

### PHB (classic edition)

| Field | JSON value | Import mapping | Status |
|---|---|---|---|
| hitDie | `hd.faces = 8` | `hitDie: c.hd?.faces \|\| 8` | OK |
| savingThrows | `proficiency: ["int", "wis"]` | `savingThrows: c.proficiency \|\| []` | OK |
| spellcastingAbility | `"wis"` | `spellcastingAbility: c.spellcastingAbility \|\| null` | OK |
| casterProgression | `"full"` | `casterProgression: c.casterProgression \|\| null` | OK |
| armorProficiencies | `["light", "medium", {proficiency:"shield", full:"shields (druids will not wear armor or use shields made of metal)"}]` | `armorProficiencies: c.startingProficiencies?.armor \|\| []` | OK — object entry for shield preserved as-is |
| weaponProficiencies | 10 specific weapons: clubs, daggers, darts, javelins, maces, quarterstaffs, scimitars, sickles, slings, spears (as `{@item ...}` refs) | `weaponProficiencies: c.startingProficiencies?.weapons \|\| []` | OK — raw ref strings stored |
| toolProficiencies | `["{@item Herbalism kit|PHB}"]` | `toolProficiencies: c.startingProficiencies?.tools \|\| []` | OK |
| skillChoices | `choose: {from: [arcana, animal handling, insight, medicine, nature, perception, religion, survival], count: 2}` | `skillChoices: parseSkillChoices(c.startingProficiencies?.skills?.[0])` | OK |
| subclassTitle | `"Druid Circle"` | `subclassTitle: c.subclassTitle \|\| "Subclass"` | OK |
| preparedSpells formula | `"<$level$> + <$wis_mod$>"` | Not mapped — field `preparedSpells` is not imported | MISSING — `preparedSpells` text formula not stored |
| preparedSpellsProgression | not present (PHB uses formula string) | `preparedSpellsProgression: c.preparedSpellsProgression \|\| null` | OK — correctly null for PHB |

### XPHB (one edition)

| Field | JSON value | Import mapping | Status |
|---|---|---|---|
| hitDie | `hd.faces = 8` | same mapping | OK |
| savingThrows | `proficiency: ["int", "wis"]` | same mapping | OK |
| spellcastingAbility | `"wis"` | same mapping | OK |
| casterProgression | `"full"` | same mapping | OK |
| armorProficiencies | `["light", "shield"]` | same mapping | OK — simpler than PHB (no medium, no metal caveat) |
| weaponProficiencies | `["simple"]` | same mapping | OK — XPHB uses category string |
| preparedSpellsProgression | `[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22]` | `preparedSpellsProgression: c.preparedSpellsProgression \|\| null` | OK |
| additionalSpells | `prepared: {1: ["speak with animals|xphb"], 2: ["find familiar|xphb"]}` | not imported at class level | NOTE — class-level `additionalSpells` (XPHB Druidic feature) is not imported; only subclass additionalSpells are imported |
| featProgression | Epic Boon at level 19 | not mapped | NOTE — no `featProgression` field in import record; Epic Boon is handled as a class feature |

---

## B. Class Features (Levels 1–20)

### PHB Druid classFeatures array

| Level | Feature | Type | Notes |
|---|---|---|---|
| 1 | Druidic | string ref | OK |
| 1 | Spellcasting | string ref | OK |
| 2 | Wild Shape | string ref | OK |
| 2 | Wild Companion | string ref with source TCE | Optional feature (`isClassFeatureVariant: true`) |
| 2 | Druid Circle | object with `gainSubclassFeature: true` | Subclass trigger at level 2 |
| 4 | Wild Shape Improvement | string ref | OK |
| 4 | Ability Score Improvement | string ref | OK |
| 4 | Cantrip Versatility | string ref with source TCE | Optional feature (`isClassFeatureVariant: true`) |
| 6 | Druid Circle feature | object with `gainSubclassFeature: true` | Subclass trigger |
| 8 | Wild Shape Improvement | string ref | OK |
| 8 | Ability Score Improvement | string ref | OK |
| 10 | Druid Circle feature | object with `gainSubclassFeature: true` | Subclass trigger |
| 12 | Ability Score Improvement | string ref | OK |
| 14 | Druid Circle feature | object with `gainSubclassFeature: true` | Subclass trigger |
| 16 | Ability Score Improvement | string ref | OK |
| 18 | Timeless Body | string ref | OK |
| 18 | Beast Spells | string ref | OK |
| 19 | Ability Score Improvement | string ref | OK |
| 20 | Archdruid | string ref | OK |

**Subclass trigger levels (PHB):** 2, 6, 10, 14 — matches 5e SRD.

**options blocks in PHB classFeatures:** None. No `type: "options"` blocks in the base PHB class feature list.

### XPHB Druid classFeatures array

| Level | Feature | Type | Notes |
|---|---|---|---|
| 1 | Druidic | string ref | OK |
| 1 | Primal Order | string ref | Contains `type: "options"` block — see below |
| 1 | Spellcasting | string ref | OK |
| 2 | Wild Companion | string ref | Core feature in XPHB (not optional) |
| 2 | Wild Shape | string ref | OK |
| 3 | Druid Subclass | object with `gainSubclassFeature: true` | Subclass trigger at level 3 (one edition shifted) |
| 4 | Ability Score Improvement | string ref | OK |
| 5 | Wild Resurgence | string ref | New XPHB feature |
| 6 | Subclass Feature | object with `gainSubclassFeature: true` | Subclass trigger |
| 7 | Elemental Fury | string ref | Contains `type: "options"` block — see below |
| 8 | Ability Score Improvement | string ref | OK |
| 10 | Subclass Feature | object with `gainSubclassFeature: true` | Subclass trigger |
| 12 | Ability Score Improvement | string ref | OK |
| 14 | Subclass Feature | object with `gainSubclassFeature: true` | Subclass trigger |
| 15 | Improved Elemental Fury | string ref | OK |
| 16 | Ability Score Improvement | string ref | OK |
| 18 | Beast Spells | string ref | OK |
| 19 | Epic Boon | string ref | OK |
| 20 | Archdruid | string ref | OK |

**Subclass trigger levels (XPHB):** 3, 6, 10, 14.

**IMPORTANT DIFFERENCE:** PHB subclass triggers at level 2; XPHB triggers at level 3.

### options blocks in classFeature entries

**Primal Order (XPHB, level 1):**
- `type: "options"`, count: 1
- Refs: `Magician|Druid|XPHB|1`, `Warden|Druid|XPHB|1`
- Player chooses one of two orders at level 1

**Elemental Fury (XPHB, level 7):**
- `type: "options"`, count: 1
- Refs: `Potent Spellcasting|Druid|XPHB|7`, `Primal Strike|Druid|XPHB|7`
- Player chooses one elemental fury option

**IMPORT CONCERN:** The import script stores `classFeatures` as a raw array and `entries` as raw JSON. The `type: "options"` blocks within feature entries are stored but not parsed into a structured options model. The character sheet UI will need to handle these inline options blocks when rendering Primal Order and Elemental Fury selection.

---

## C. Subclasses (Druid Circles)

The file contains **15 subclass entries** (unique name+source+classSource combinations):

### PHB subclasses (classSource: PHB, edition: classic)

#### Circle of the Land (PHB)
- **subclassFeatures:** levels 2, 6, 10, 14
- **additionalSpells:** 8 named land-type variants (Arctic, Coast, Desert, Forest, Grassland, Mountain, Swamp, Underdark)
  - Each has `known` at level 1 (free cantrip choice) and `prepared` at 3, 5, 7, 9 (2 spells each)
- **options blocks:** None in subclassFeature entries
- **spellcastingAbility override:** None

**IMPORT CONCERN:** `additionalSpells` is `sc.additionalSpells?.[0]` — this takes only the **first** element of the additionalSpells array. Circle of the Land has **8 named variants** in the additionalSpells array (index 0 = Arctic through index 7 = Underdark). The import will only store the Arctic variant. The remaining 7 land types (Coast, Desert, Forest, Grassland, Mountain, Swamp, Underdark) will be lost.

#### Circle of the Moon (PHB)
- **subclassFeatures:** levels 2, 6, 10, 14
- **additionalSpells:** `known: {14: ["alter self"]}` — single entry, single array element
- **options blocks:** None
- **spellcastingAbility override:** None
- Import correctly captures `additionalSpells?.[0]`

#### Circle of Dreams (XGE, classSource: PHB)
- **subclassFeatures:** levels 2, 6, 10, 14
- **additionalSpells:** None
- **options blocks:** None

#### Circle of the Shepherd (XGE, classSource: PHB)
- **subclassFeatures:** levels 2, 6, 10, 14
- **additionalSpells:** None
- **options blocks:** None

#### Circle of Spores (TCE, classSource: PHB)
- **subclassFeatures:** levels 2, 6, 10, 14
- **additionalSpells:** `known: {2: ["chill touch#c"]}` and `prepared` at 3, 5, 7, 9 — single array element
- **options blocks:** None
- Import correctly captures `additionalSpells?.[0]`
- **Note:** `"chill touch#c"` uses `#c` cantrip annotation

#### Circle of Stars (TCE, classSource: PHB)
- **subclassFeatures:** levels 2, 6, 10, 14
- **additionalSpells:** `known: {2: ["guidance#c"]}` and `prepared: {2: ["guiding bolt"]}` — single array element
- **options blocks:** Starry Form feature contains 3 `refSubclassFeature` choices (Archer, Chalice, Dragon) — but these are `type: "refSubclassFeature"` not `type: "options"`. No `type: "options"` block.
- Import correctly captures `additionalSpells?.[0]`

#### Circle of Wildfire (TCE, classSource: PHB)
- **subclassFeatures:** levels 2, 6, 10, 14
- **additionalSpells:** `prepared` at 2, 3, 5, 7, 9 — single array element
- **options blocks:** None

### PHB subclasses re-exported for XPHB (classSource: XPHB, _copy from PHB)

Seven subclasses are defined as `_copy` entries pointing to their PHB counterparts but with classSource: XPHB. This allows them to be used with the XPHB Druid. They shift the first subclassFeature from level 2 to level 3 (to match XPHB's subclass entry at level 3):

| Subclass | Source | classSource | First feature level |
|---|---|---|---|
| Circle of the Land | PHB | XPHB | 3 (copied from PHB level 2) |
| Circle of the Moon | PHB | XPHB | 3 (copied from PHB level 2) |
| Circle of Dreams | XGE | XPHB | 3 (copied from XGE level 2) |
| Circle of the Shepherd | XGE | XPHB | 3 (copied from XGE level 2) |
| Circle of Spores | TCE | XPHB | 3 (copied from TCE level 2) |
| Circle of Stars | TCE | XPHB | 3 (copied from TCE level 2) |
| Circle of Wildfire | TCE | XPHB | 3 (copied from TCE level 2) |

The `_copy` resolution in the import script handles these correctly. The first subclassFeature string in each of these XPHB-compat subclasses correctly references the feature at level 3 (e.g., `"Circle of the Land|Druid|XPHB|Land||3"`).

**IMPORT CONCERN for _copy Land (XPHB classSource):** The PHB Land subclass's `additionalSpells` array (8 elements) is inherited via `_copy` without modification. The `additionalSpells?.[0]` mapping still captures only Arctic.

### XPHB native subclasses (source: XPHB, classSource: XPHB, edition: one)

#### Circle of the Land (XPHB)
- **subclassFeatures:** levels 3, 6, 10, 14
- **additionalSpells:** 4 named land variants (Arid, Polar, Temperate, Tropical)
  - `prepared` at levels 3, 5, 7, 9 — each variant at 3rd level has 3 spells (not 2 like PHB)
- **options blocks:** None in subclassFeature entries
- **spellcastingAbility override:** None
- **IMPORT CONCERN:** Same `additionalSpells?.[0]` issue — 4 land variants in array, only first (Arid) stored

#### Circle of the Moon (XPHB)
- **subclassFeatures:** levels 3, 6, 10, 14
- **additionalSpells:** Single entry with `prepared` at 3, 5, 7, 9
- **options blocks:** None
- Import correctly captures `additionalSpells?.[0]`

#### Circle of the Sea (XPHB)
- **subclassFeatures:** levels 3, 6, 10, 14
- **additionalSpells:** Single entry with `prepared` at 3 (5 spells), 5 (2 spells), 7 (2 spells), 9 (2 spells)
- **options blocks:** None
- Import correctly captures `additionalSpells?.[0]`

#### Circle of the Stars (XPHB)
- **subclassFeatures:** levels 3, 6, 10, 14
- **additionalSpells:** `known: {3: ["guidance|xphb#c"]}` and `prepared: {3: ["guiding bolt|xphb"]}` — single array element
- **options blocks:** Starry Form uses `refSubclassFeature` (not `type: "options"`)
- Import correctly captures `additionalSpells?.[0]`

### Summary of all subclasses

| Subclass | Source | classSource | Edition | Feature levels | additionalSpells |
|---|---|---|---|---|---|
| Circle of the Land | PHB | PHB | classic | 2, 6, 10, 14 | 8-element array (BROKEN: only [0] stored) |
| Circle of the Moon | PHB | PHB | classic | 2, 6, 10, 14 | 1-element array (OK) |
| Circle of Dreams | XGE | PHB | classic | 2, 6, 10, 14 | None |
| Circle of the Shepherd | XGE | PHB | classic | 2, 6, 10, 14 | None |
| Circle of Spores | TCE | PHB | classic | 2, 6, 10, 14 | 1-element array (OK) |
| Circle of Stars | TCE | PHB | classic | 2, 6, 10, 14 | 1-element array (OK) |
| Circle of Wildfire | TCE | PHB | classic | 2, 6, 10, 14 | 1-element array (OK) |
| Circle of the Land (_copy) | PHB | XPHB | classic | 3, 6, 10, 14 | inherited 8-element array (BROKEN) |
| Circle of the Moon (_copy) | PHB | XPHB | classic | 3, 6, 10, 14 | 1-element array (OK) |
| Circle of Dreams (_copy) | XGE | XPHB | classic | 3, 6, 10, 14 | None |
| Circle of the Shepherd (_copy) | XGE | XPHB | classic | 3, 6, 10, 14 | None |
| Circle of Spores (_copy) | TCE | XPHB | classic | 3, 6, 10, 14 | inherited 1-element array (OK) |
| Circle of Stars (_copy) | TCE | XPHB | classic | 3, 6, 10, 14 | inherited 1-element array (OK) |
| Circle of Wildfire (_copy) | TCE | XPHB | classic | 3, 6, 10, 14 | inherited 1-element array (OK) |
| Circle of the Land | XPHB | XPHB | one | 3, 6, 10, 14 | 4-element array (BROKEN: only [0] stored) |
| Circle of the Moon | XPHB | XPHB | one | 3, 6, 10, 14 | 1-element array (OK) |
| Circle of the Sea | XPHB | XPHB | one | 3, 6, 10, 14 | 1-element array (OK) |
| Circle of the Stars | XPHB | XPHB | one | 3, 6, 10, 14 | 1-element array (OK) |

**Total distinct subclass entries in JSON:** 18 (15 unique name+source combinations, 3 have dual classSource entries counted separately above)

---

## D. Spell Data

### casterProgression

Both PHB and XPHB Druid: `"full"` — correct for a full spellcaster.

### cantripProgression

Both editions: `[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4]` (20 values, levels 1–20).

| Levels | Cantrips |
|---|---|
| 1–3 | 2 |
| 4–9 | 3 |
| 10–20 | 4 |

Matches the standard Druid cantrip table. Import maps to `cantripProgression`.

### spellSlotProgression

Extracted from `classTableGroups[].rowsSpellProgression` — 20 rows, 9 columns (spell levels 1–9).

Both PHB and XPHB Druid have identical slot tables:

| Class Level | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2 | — | — | — | — | — | — | — | — |
| 2 | 3 | — | — | — | — | — | — | — | — |
| 3 | 4 | 2 | — | — | — | — | — | — | — |
| 4 | 4 | 3 | — | — | — | — | — | — | — |
| 5 | 4 | 3 | 2 | — | — | — | — | — | — |
| 6 | 4 | 3 | 3 | — | — | — | — | — | — |
| 7 | 4 | 3 | 3 | 1 | — | — | — | — | — |
| 8 | 4 | 3 | 3 | 2 | — | — | — | — | — |
| 9 | 4 | 3 | 3 | 3 | 1 | — | — | — | — |
| 10 | 4 | 3 | 3 | 3 | 2 | — | — | — | — |
| 11 | 4 | 3 | 3 | 3 | 2 | 1 | — | — | — |
| 12 | 4 | 3 | 3 | 3 | 2 | 1 | — | — | — |
| 13 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | — | — |
| 14 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | — | — |
| 15 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | — |
| 16 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | — |
| 17 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | 1 |
| 18 | 4 | 3 | 3 | 3 | 3 | 1 | 1 | 1 | 1 |
| 19 | 4 | 3 | 3 | 3 | 3 | 2 | 1 | 1 | 1 |
| 20 | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 |

Standard full caster progression. Matches PHB Druid table. Import correctly extracts via `classTableGroups?.find(g => g.rowsSpellProgression)?.rowsSpellProgression`.

### preparedSpellsProgression (XPHB only)

`[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22]`

This is a fixed table (not `level + wis_mod`). Correctly stored. PHB uses a formula string (`preparedSpells` field) which is not imported.

---

## E. Issues and Flags

### BUGS

**B1 — Circle of the Land additionalSpells truncation (HIGH)**
The import script uses `sc.additionalSpells?.[0]` which captures only the first element of the array. Circle of the Land (both PHB and XPHB editions) stores multiple named land type spell lists as separate array elements. Only the first land type is imported; all others are silently dropped.

Affected subclasses:
- Circle of the Land (PHB, classSource: PHB) — 8 variants, only Arctic stored
- Circle of the Land (PHB, classSource: XPHB via _copy) — same 8 variants, only Arctic stored
- Circle of the Land (XPHB, classSource: XPHB) — 4 variants, only Arid stored

Fix required: store the full `additionalSpells` array, not just `[0]`.

### MISSING DATA

**M1 — preparedSpells formula not imported (LOW)**
PHB Druid has `preparedSpells: "<$level$> + <$wis_mod$>"`. This formula string is not in the import record. The XPHB equivalent (`preparedSpellsProgression`) is imported. The PHB formula must be handled by the character sheet using its own logic (level + WIS mod).

**M2 — class-level additionalSpells not imported (LOW)**
XPHB Druid has `additionalSpells` at the class level (Druidic gives Speak with Animals at level 1; and Find Familiar at level 2 from Wild Companion). These are not captured in the class import record. Only subclass-level additionalSpells are imported.

**M3 — featProgression not imported (INFO)**
XPHB Druid has `featProgression: [{name: "Epic Boon", category: ["EB"], progression: {19: 1}}]`. Not mapped. Epic Boon at level 19 is handled as a classFeature string instead, which is functionally equivalent for the character sheet.

### IMPORT LOGIC NOTES

**N1 — options blocks stored as raw entries JSON**
`Primal Order` (level 1, XPHB) and `Elemental Fury` (level 7, XPHB) contain `type: "options"` blocks with `count: 1`. These are stored in the `entries` JSON field of the class_features record. The character sheet must parse this `type: "options"` pattern to render a selection UI for these choices.

**N2 — isClassFeatureVariant features included**
`Wild Companion` (TCE, PHB classSource, level 2) and `Cantrip Versatility` (TCE, PHB classSource, level 4) have `isClassFeatureVariant: true`. They are included in the `classFeatures` array and will be imported. The character sheet should handle these as optional features or display them appropriately.

**N3 — _copy resolution for XPHB-compat subclasses**
Seven PHB-era subclasses are defined with `classSource: XPHB` using `_copy` from their PHB counterparts. The `resolveAllCopies` function handles these correctly. After resolution, the subclassFeatures arrays shift the first feature from level 2 to level 3 (using explicit `subclassFeatures` overrides in the _copy entries, not _mod). The _preserve blocks handle page/srd fields correctly.

**N4 — Starry Form sub-options are refSubclassFeature, not type:options**
Circle of Stars (both TCE and XPHB) Starry Form feature uses `type: "refSubclassFeature"` to reference Archer/Chalice/Dragon sub-features, not `type: "options"`. This is a display pattern (inline expansion of sub-features), not a player choice block. The sub-features (Archer, Chalice, Dragon) are each stored as separate subclassFeature records at level 2/3 with `header: 2`.

---

## F. Summary

| Category | Status |
|---|---|
| Class basics (PHB) | OK |
| Class basics (XPHB) | OK |
| PHB classFeatures list (levels 1–20) | OK |
| XPHB classFeatures list (levels 1–20) | OK |
| PHB subclasses (7) | OK except Land additionalSpells bug |
| XPHB-compat subclasses via _copy (7) | OK except Land additionalSpells bug |
| XPHB native subclasses (4) | OK except Land additionalSpells bug |
| casterProgression | OK — "full" both editions |
| cantripProgression | OK — correct 20-entry array |
| spellSlotProgression | OK — standard full caster table |
| preparedSpellsProgression | OK (XPHB); not applicable (PHB uses formula) |
| options blocks handling | Stored as raw JSON — UI must parse |
