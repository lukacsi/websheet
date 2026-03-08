# Wizard Class — 5e.tools Data Verification Report

**Source file:** `data/5etools-src/data/class/class-wizard.json`
**Import script:** `scripts/import-5etools.ts`
**Date:** 2026-03-07

---

## A. Class Basics

Two Wizard class entries exist in the file: one for PHB (classic/2014), one for XPHB (one/2024).

### PHB Wizard (classic edition)

| Field | JSON value | Import mapping | Status |
|---|---|---|---|
| hitDie | `hd.faces = 6` | `c.hd?.faces \|\| 8` → `hitDie: 6` | OK |
| savingThrows | `proficiency: ["int", "wis"]` | `c.proficiency` → `savingThrows: ["int", "wis"]` | OK |
| spellcastingAbility | `"int"` | `c.spellcastingAbility` → `"int"` | OK |
| casterProgression | `"full"` | `c.casterProgression` → `"full"` | OK |
| armorProficiencies | not present in `startingProficiencies` | `c.startingProficiencies?.armor \|\| []` → `[]` | OK (Wizard has no armor profs) |
| weaponProficiencies | `["daggers", "darts", "slings", "quarterstaffs", "light crossbows"]` (as {@item} refs) | `c.startingProficiencies?.weapons \|\| []` → raw array of 5 entries | OK |
| skillChoices | `choose: { from: ["arcana","history","insight","investigation","medicine","religion"], count: 2 }` | `parseSkillChoices(c.startingProficiencies?.skills?.[0])` → `{ from: [...6...], count: 2 }` | OK |
| subclassTitle | `"Arcane Tradition"` | `c.subclassTitle` → `"Arcane Tradition"` | OK |
| multiclassing | `{ requirements: { int: 13 } }` | `c.multiclassing` → stored as-is | OK |

### XPHB Wizard (one/2024 edition)

| Field | JSON value | Import mapping | Status |
|---|---|---|---|
| hitDie | `hd.faces = 6` | `c.hd?.faces` → `6` | OK |
| savingThrows | `proficiency: ["int", "wis"]` | same mapping → `["int", "wis"]` | OK |
| spellcastingAbility | `"int"` | same → `"int"` | OK |
| casterProgression | `"full"` | same → `"full"` | OK |
| armorProficiencies | not present | → `[]` | OK |
| weaponProficiencies | `["simple"]` | → `["simple"]` | OK |
| skillChoices | `choose: { from: ["arcana","history","insight","investigation","medicine","nature","religion"], count: 2 }` | → `{ from: [...7...], count: 2 }` | OK — note XPHB adds "nature" vs PHB |
| subclassTitle | `"Wizard Subclass"` | → `"Wizard Subclass"` | OK |
| multiclassing | `{}` (empty — XPHB has no int prereq listed) | → `{}` | OK |

---

## B. Class Features (Levels 1–20)

### PHB Wizard — classFeatures array

| Level | Feature | Has gainSubclassFeature |
|---|---|---|
| 1 | Arcane Recovery | no |
| 1 | Spellcasting | no |
| 2 | Arcane Tradition | **yes** |
| 3 | Cantrip Formulas (TCE, optional) | no |
| 4 | Ability Score Improvement | no |
| 6 | Arcane Tradition feature | **yes** |
| 8 | Ability Score Improvement | no |
| 10 | Arcane Tradition feature | **yes** |
| 12 | Ability Score Improvement | no |
| 14 | Arcane Tradition feature | **yes** |
| 16 | Ability Score Improvement | no |
| 18 | Spell Mastery | no |
| 19 | Ability Score Improvement | no |
| 20 | Signature Spells | no |

Total features: 14 entries. Subclass feature gates at levels 2, 6, 10, 14 (4 gates, correct per PHB).

Note: Levels 3, 5, 7, 9, 11, 13, 15, 17 are not in classFeatures (no non-spellslot feature at these levels — correct for Wizard).

### XPHB Wizard — classFeatures array

| Level | Feature | Has gainSubclassFeature |
|---|---|---|
| 1 | Spellcasting | no |
| 1 | Ritual Adept | no |
| 1 | Arcane Recovery | no |
| 2 | Scholar | no |
| 3 | Wizard Subclass | **yes** |
| 4 | Ability Score Improvement | no |
| 5 | Memorize Spell | no |
| 6 | Subclass Feature | **yes** |
| 8 | Ability Score Improvement | no |
| 10 | Subclass Feature | **yes** |
| 12 | Ability Score Improvement | no |
| 14 | Subclass Feature | **yes** |
| 16 | Ability Score Improvement | no |
| 18 | Spell Mastery | no |
| 19 | Epic Boon | no |
| 20 | Signature Spells | no |

Total: 16 entries. Subclass feature gates at levels 3, 6, 10, 14 (4 gates — XPHB subclass starts at 3, not 2).

### Options blocks in classFeature entries

No PHB/XPHB core class features use `type: "options"` blocks. No import concern here.

### Options blocks in subclass features

Two subclass features contain `type: "options"` blocks:

**The Third Eye** (Divination, level 10, PHB) — 4 options:
- Darkvision
- Ethereal Sight
- Greater Comprehension
- See Invisibility

**Master Transmuter** (Transmutation, level 14, PHB) — 4 options:
- Major Transformation
- Panacea
- Restore Life
- Restore Youth

**The Third Eye** (Diviner, XPHB, level 10) — 3 options (note: Ethereal Sight dropped in 2024):
- Darkvision
- Greater Comprehension
- See Invisibility

The import script stores `entries` as raw JSON. The `type: "options"` blocks are preserved verbatim in the stored entries. The import does not attempt to resolve options into separate DB rows — they remain embedded. This is consistent with how the importer handles other complex entry types.

---

## C. All Subclasses (Arcane Traditions)

### PHB subclasses (classSource: PHB, classic edition)

Each PHB subclass has 4 subclassFeature entries at levels 2, 6, 10, 14.

| Subclass | Source | Features | additionalSpells | Options blocks |
|---|---|---|---|---|
| School of Abjuration | PHB | Lvl 2: School of Abjuration (refs: Abjuration Savant, Arcane Ward); Lvl 6: Projected Ward; Lvl 10: Improved Abjuration; Lvl 14: Spell Resistance | none | none |
| School of Conjuration | PHB | Lvl 2: School of Conjuration (refs: Conjuration Savant, Minor Conjuration); Lvl 6: Benign Transposition; Lvl 10: Focused Conjuration; Lvl 14: Durable Summons | none | none |
| School of Divination | PHB | Lvl 2: School of Divination (refs: Divination Savant, Portent); Lvl 6: Expert Divination; Lvl 10: The Third Eye; Lvl 14: Greater Portent | none | **Yes — The Third Eye has 4 options** |
| School of Enchantment | PHB | Lvl 2: School of Enchantment (refs: Enchantment Savant, Hypnotic Gaze); Lvl 6: Instinctive Charm; Lvl 10: Split Enchantment; Lvl 14: Alter Memories | none | none |
| School of Evocation | PHB | Lvl 2: School of Evocation (refs: Evocation Savant, Sculpt Spells); Lvl 6: Potent Cantrip; Lvl 10: Empowered Evocation; Lvl 14: Overchannel | none | none |
| School of Illusion | PHB | Lvl 2: School of Illusion (refs: Illusion Savant, Improved Minor Illusion); Lvl 6: Malleable Illusions; Lvl 10: Illusory Self; Lvl 14: Illusory Reality | **Yes — `known["1"]: ["minor illusion#c"]`** | none |
| School of Necromancy | PHB | Lvl 2: School of Necromancy (refs: Necromancy Savant, Grim Harvest); Lvl 6: Undead Thralls; Lvl 10: Inured to Undeath; Lvl 14: Command Undead | none | none |
| School of Transmutation | PHB | Lvl 2: School of Transmutation (refs: Transmutation Savant, Minor Alchemy); Lvl 6: Transmuter's Stone; Lvl 10: Shapechanger; Lvl 14: Master Transmuter | none | **Yes — Master Transmuter has 4 options** |
| War Magic | XGE | Lvl 2: War Magic (refs: Arcane Deflection, Tactical Wit); Lvl 6: Power Surge; Lvl 10: Durable Magic; Lvl 14: Deflecting Shroud | none | none |
| Chronurgy Magic | EGW | Lvl 2: Chronurgy Magic (refs: Chronal Shift, Temporal Awareness); Lvl 6: Momentary Stasis; Lvl 10: Arcane Abeyance; Lvl 14: Convergent Future | **Yes — `expanded["1"]: [{all: "source=EGW"}]`** | none |
| Graviturgy Magic | EGW | Lvl 2: Graviturgy Magic (ref: Adjust Density); Lvl 6: Gravity Well; Lvl 10: Violent Attraction; Lvl 14: Event Horizon | **Yes — `expanded["1"]: [{all: "source=EGW"}]`** | none |
| Bladesinging | TCE | Lvl 2: Bladesinging (refs: Training in War and Song, Bladesong, Bladesinger Styles[inset]); Lvl 6: Extra Attack; Lvl 10: Song of Defense; Lvl 14: Song of Victory | none | none |
| Order of Scribes | TCE | Lvl 2: Order of Scribes (refs: Wizardly Quill, Awakened Spellbook); Lvl 6: Manifest Mind; Lvl 10: Master Scrivener; Lvl 14: One with the Word | none | none |

**Import note for additionalSpells:** The import script maps `sc.additionalSpells?.[0] || null`. This takes only the first element of the additionalSpells array. All wizard subclasses have at most one additionalSpells object, so this is fine.

### XPHB subclasses (classSource: XPHB, edition: one)

These are the native 2024 subclasses. Subclass features are at levels 3, 6, 10, 14.

| Subclass | Source | Features | additionalSpells |
|---|---|---|---|
| Abjurer | XPHB | Lvl 3: Abjurer (refs: Abjuration Savant, Arcane Ward); Lvl 6: Projected Ward; Lvl 10: Spell Breaker; Lvl 14: Spell Resistance | **Yes** — `known` (choose school=A spells at odd levels 3–17), `prepared["10"]: [counterspell, dispel magic]` |
| Diviner | XPHB | Lvl 3: Diviner (refs: Divination Savant, Portent); Lvl 6: Expert Divination; Lvl 10: The Third Eye; Lvl 14: Greater Portent | **Yes** — `known` (choose school=D spells at odd levels 3–17), `innate["10"]: [see invisibility]` |
| Evoker | XPHB | Lvl 3: Evoker (refs: Evocation Savant, Potent Cantrip); Lvl 6: Sculpt Spells; Lvl 10: Empowered Evocation; Lvl 14: Overchannel | **Yes** — `known` (choose school=V spells at odd levels 3–17) |
| Illusionist | XPHB | Lvl 3: Illusionist (refs: Illusion Savant, Improved Illusions); Lvl 6: Phantasmal Creatures; Lvl 10: Illusory Self; Lvl 14: Illusory Reality | **Yes** — `known["3"]: [minor illusion, choose I-school]`, `prepared["6"]: [summon beast, summon fey]` |
| Bladesinger | FRHoF | Lvl 3: Bladesinger (refs: Bladesong, Training in War and Song); Lvl 6: Extra Attack; Lvl 10: Song of Defense; Lvl 14: Song of Victory | none |

### PHB subclasses re-registered for XPHB classSource

The following PHB-sourced subclasses are duplicated for XPHB classSource (using `_copy` with `_preserve`). The import's `resolveAllCopies` resolves them. They have subclass feature entries at level 3 (vs. PHB's level 2) for the intro feature, with remaining features unchanged at 6, 10, 14.

- School of Abjuration (PHB/XPHB)
- School of Conjuration (PHB/XPHB)
- School of Divination (PHB/XPHB)
- School of Enchantment (PHB/XPHB)
- School of Evocation (PHB/XPHB)
- School of Illusion (PHB/XPHB) — retains `additionalSpells: known["1"]: minor illusion`
- School of Necromancy (PHB/XPHB)
- School of Transmutation (PHB/XPHB)
- War Magic (XGE/XPHB)
- Chronurgy Magic (EGW/XPHB) — retains `additionalSpells: expanded EGW`
- Graviturgy Magic (EGW/XPHB) — retains `additionalSpells: expanded EGW`
- Bladesinging (TCE/XPHB) — reprintedAs Bladesinger|FRHoF

Total subclass records in file: 18 (13 PHB-classSource + 5 XPHB-native + some are _copy entries that resolve to 18 effective subclasses).

---

## D. Spell Data

### casterProgression

Both PHB and XPHB Wizard entries have `"casterProgression": "full"`. This is correct — Wizard is a full caster. Import maps this directly. **OK.**

### cantripProgression

Both editions have identical cantripProgression arrays (20 values):
```
[3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5]
```

Cantrip counts by level:
- Lvl 1–3: 3 cantrips
- Lvl 4–9: 4 cantrips
- Lvl 10–20: 5 cantrips

This matches the PHB Wizard table exactly. **OK.**

### spellSlotProgression (rowsSpellProgression)

Both editions share the same spell slot table (verified — XPHB rows match PHB rows exactly). The import extracts this via:
```ts
c.classTableGroups?.find((g: any) => g.rowsSpellProgression)?.rowsSpellProgression || null
```

Full 20-level progression (9 columns: 1st–9th level slots):

| Lvl | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2 | - | - | - | - | - | - | - | - |
| 2 | 3 | - | - | - | - | - | - | - | - |
| 3 | 4 | 2 | - | - | - | - | - | - | - |
| 4 | 4 | 3 | - | - | - | - | - | - | - |
| 5 | 4 | 3 | 2 | - | - | - | - | - | - |
| 6 | 4 | 3 | 3 | - | - | - | - | - | - |
| 7 | 4 | 3 | 3 | 1 | - | - | - | - | - |
| 8 | 4 | 3 | 3 | 2 | - | - | - | - | - |
| 9 | 4 | 3 | 3 | 3 | 1 | - | - | - | - |
| 10 | 4 | 3 | 3 | 3 | 2 | - | - | - | - |
| 11 | 4 | 3 | 3 | 3 | 2 | 1 | - | - | - |
| 12 | 4 | 3 | 3 | 3 | 2 | 1 | - | - | - |
| 13 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | - | - |
| 14 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | - | - |
| 15 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | - |
| 16 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | - |
| 17 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | 1 |
| 18 | 4 | 3 | 3 | 3 | 3 | 1 | 1 | 1 | 1 |
| 19 | 4 | 3 | 3 | 3 | 3 | 2 | 1 | 1 | 1 |
| 20 | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 |

This matches the standard 5e full caster spell slot table. **OK.**

### spellsKnownProgressionFixed (Spellbook)

Both editions: starts at 6 spells (level 1), then +2 per level:
```
[6,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
```
`spellsKnownProgressionFixedAllowLowerLevel: true` — allows copying lower-level spells into the spellbook. Not directly imported as a top-level field (the import script does not include this flag). This is a minor omission but is fine since spellbook growth logic is editorial.

### preparedSpells

PHB: `"preparedSpells": "<$level$> + <$int_mod$>"` — formula, not a fixed array.
XPHB: `"preparedSpellsProgression": [4,5,6,7,9,10,11,12,14,15,16,16,17,18,19,21,22,23,24,25]` — explicit per-level values.

Import mapping:
- `preparedSpellsProgression: c.preparedSpellsProgression || null`
- The PHB formula string (`preparedSpells`) is NOT stored — the import has no field for it.

**Issue (minor):** The PHB `preparedSpells` formula is not captured by the import script. Only XPHB's `preparedSpellsProgression` array is stored. A character sheet using the PHB Wizard would need to compute prepared spells as `wizardLevel + intModifier` from separate logic, not from a stored progression. The import does not surface this formula. The XPHB value is fully captured.

---

## E. Issues and Observations

### Issues

1. **PHB `preparedSpells` formula not imported:** The string `"<$level$> + <$int_mod$>"` has no import mapping. The import stores `preparedSpellsProgression: null` for PHB Wizard. Character creation UI must handle this case differently for PHB vs XPHB.

2. **`spellsKnownProgressionFixedAllowLowerLevel` not stored:** The flag indicating that lower-level spells can be copied into the spellbook is present in both editions but not mapped in the import. This is a soft business-logic flag, not critical for data integrity.

3. **`additionalSpells?.[0]` — only first element taken:** The import uses `sc.additionalSpells?.[0] || null`. For wizard subclasses this is fine (all have 0 or 1 additionalSpells objects). No data loss for current subclasses.

4. **XPHB Illusionist `prepared["6"]` contains Conjuration spells:** `summon beast` and `summon fey` are always-prepared spells from a non-Illusion school. This is correctly stored in the additionalSpells object under `prepared` key. The import preserves the raw JSON, so the full object is retained.

5. **Chromurgy/Graviturgy `expanded` additionalSpells:** These use `expanded: { "1": [{ all: "source=EGW" }] }` — a dynamic filter rather than explicit spell names. The import stores the raw object. The character sheet UI will need to resolve this filter at runtime if it wants to display expanded spells.

### No Issues

- All 13 canonical PHB Arcane Traditions are present with correct 4-level feature progressions.
- All 5 XPHB-native subclasses are present with correct 4-level feature progressions at levels 3/6/10/14.
- Saving throws (INT, WIS) are correct and consistent across editions.
- Spell slot table matches the standard 5e full caster table exactly.
- Cantrip progression matches PHB/XPHB table.
- Hit die d6 is correct for Wizard.
- No armor proficiencies — correct.
- Weapon proficiencies: PHB lists 5 specific simple weapons; XPHB lists "simple" (all simple weapons). Both correct per their editions.
- Import upsert key for subclasses uses `[name, source, className, classSource]` — correctly distinguishes PHB/XPHB duplicates.
- `_copy` resolution chains work: XPHB-classSource entries for PHB-sourced subclasses resolve correctly via `resolveAllCopies`.
- The `edition()` function correctly assigns `"classic"` to PHB/XGE/EGW/TCE sources and `"one"` to XPHB/FRHoF sources.
