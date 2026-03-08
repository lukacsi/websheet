# Ranger Class Verification Report

**Source file:** `data/5etools-src/data/class/class-ranger.json`
**Import script:** `scripts/import-5etools.ts`
**Date:** 2026-03-07

---

## A. Class Basics

The file contains two class entries: `Ranger|PHB` (2014, "classic" edition) and `Ranger|XPHB` (2024, "one" edition).

### Ranger|PHB (classic)

| Field | Source value | Import mapping | Status |
|---|---|---|---|
| hitDie | `hd.faces: 10` | `hitDie: c.hd?.faces \|\| 8` | OK — maps to 10 |
| savingThrows | `proficiency: ["str", "dex"]` | `savingThrows: c.proficiency \|\| []` | OK |
| spellcastingAbility | `"wis"` | `spellcastingAbility: c.spellcastingAbility \|\| null` | OK |
| casterProgression | `"1/2"` | `casterProgression: c.casterProgression \|\| null` | OK — confirmed "1/2" |
| armorProficiencies | `["light", "medium", "shield"]` | `armorProficiencies: c.startingProficiencies?.armor \|\| []` | OK |
| weaponProficiencies | `["simple", "martial"]` | `weaponProficiencies: c.startingProficiencies?.weapons \|\| []` | OK |
| skillChoices | `choose: { from: [8 skills], count: 3 }` | `skillChoices: parseSkillChoices(c.startingProficiencies?.skills?.[0])` | OK |
| edition | `"classic"` | `edition(c.source, c.edition)` → "classic" | OK |

**optionalfeatureProgression (Fighting Style):**
```json
{
  "name": "Fighting Style",
  "featureType": ["FS:R"],
  "progression": { "2": 1 }
}
```
This is stored in `optionalfeatureProgression` on the class, not in `classFeatures`. The import maps `classFeatures: c.classFeatures || []` — the `optionalfeatureProgression` array is NOT explicitly mapped to its own field in the import record. It is only present in `classTableGroups` indirectly. **ISSUE: `optionalfeatureProgression` is not imported as a separate field.** The class feature entry for "Fighting Style" at level 2 uses `type: "options"` with `refOptionalfeature` refs (see Section B).

### Ranger|XPHB (one/2024)

| Field | Source value | Import mapping | Status |
|---|---|---|---|
| hitDie | `hd.faces: 10` | same mapping | OK |
| savingThrows | `proficiency: ["str", "dex"]` | same mapping | OK |
| spellcastingAbility | `"wis"` | same mapping | OK |
| casterProgression | `"artificer"` | same mapping | NOTE: 2024 Ranger uses `"artificer"` progression (half-caster, starts at level 1, not level 2) |
| armorProficiencies | `["light", "medium", "shield"]` | same mapping | OK |
| weaponProficiencies | `["simple", "martial"]` | same mapping | OK |
| skillChoices | `choose: { from: [8 skills], count: 3 }` | same mapping | OK |
| edition | `"one"` | `edition(c.source, c.edition)` → "one" | OK |

**Notable difference:** The 2024 Ranger has `"casterProgression": "artificer"` (not `"1/2"`). This means the 2024 Ranger gets spell slots at level 1 (like an Artificer), whereas the classic Ranger doesn't get spells until level 2. The import script stores this value verbatim — the sheet must handle `"artificer"` as a progression type.

**additionalSpells (XPHB class-level):**
```json
"prepared": { "1": ["hunter's mark|xphb"] }
```
Hunter's Mark is always prepared starting at level 1. **NOTE: This class-level `additionalSpells` field is NOT imported** — the import record for classes does not include an `additionalSpells` field. This data is lost during import.

**featProgression (XPHB):**
```json
[
  { "name": "Fighting Style", "category": ["FS", "FS:R"], "progression": { "2": 1 } },
  { "name": "Epic Boon", "category": ["EB"], "progression": { "19": 1 } }
]
```
This is the 2024 equivalent of `optionalfeatureProgression`. Also not imported as a separate field.

---

## B. Class Features (Levels 1–20)

### Ranger|PHB classFeatures list

| Level | Feature | Notes |
|---|---|---|
| 1 | Favored Enemy\|Ranger\|\|1 | Standard class feature |
| 1 | Favored Foe\|Ranger\|\|1\|TCE | Optional variant (TCE) |
| 1 | Natural Explorer\|Ranger\|\|1 | Standard class feature |
| 1 | Deft Explorer\|Ranger\|\|1\|TCE | Optional variant (TCE) |
| 2 | Fighting Style\|Ranger\|\|2 | Has `type: "options"` — see below |
| 2 | Spellcasting\|Ranger\|\|2 | Standard |
| 2 | Spellcasting Focus\|Ranger\|\|2\|TCE | Optional variant (TCE) |
| 3 | Ranger Archetype\|Ranger\|\|3 | `gainSubclassFeature: true` |
| 3 | Primeval Awareness\|Ranger\|\|3 | Standard |
| 3 | Primal Awareness\|Ranger\|\|3\|TCE | Optional variant (TCE) |
| 4 | Ability Score Improvement\|Ranger\|\|4 | Standard |
| 4 | Martial Versatility\|Ranger\|\|4\|TCE | Optional variant (TCE) |
| 5 | Extra Attack\|Ranger\|\|5 | Standard |
| 6 | Favored Enemy and Natural Explorer improvements\|Ranger\|\|6 | Standard |
| 6 | Deft Explorer Improvement\|Ranger\|\|6\|TCE | Optional variant (TCE) |
| 7 | Ranger Archetype feature\|Ranger\|\|7 | `gainSubclassFeature: true` |
| 8 | Ability Score Improvement\|Ranger\|\|8 | Standard |
| 8 | Land's Stride\|Ranger\|\|8 | Standard |
| 10 | Hide in Plain Sight\|Ranger\|\|10 | Standard |
| 10 | Nature's Veil\|Ranger\|\|10\|TCE | Optional variant (TCE) |
| 10 | Natural Explorer improvement\|Ranger\|\|10 | Standard |
| 10 | Deft Explorer Improvement\|Ranger\|\|10\|TCE | Optional variant (TCE) |
| 11 | Ranger Archetype feature\|Ranger\|\|11 | `gainSubclassFeature: true` |
| 12 | Ability Score Improvement\|Ranger\|\|12 | Standard |
| 14 | Vanish\|Ranger\|\|14 | Standard |
| 14 | Favored Enemy improvement\|Ranger\|\|14 | Standard |
| 15 | Ranger Archetype feature\|Ranger\|\|15 | `gainSubclassFeature: true` |
| 16 | Ability Score Improvement\|Ranger\|\|16 | Standard |
| 18 | Feral Senses\|Ranger\|\|18 | Standard |
| 19 | Ability Score Improvement\|Ranger\|\|19 | Standard |
| 20 | Foe Slayer\|Ranger\|\|20 | Standard |

**Total classFeature entries (PHB):** 30 (including TCE optional variants at various levels, and 4 subclass gates)

**Missing levels in classFeatures list:** Levels 9, 13, 17 have no entries (no features at those levels for classic Ranger — correct per PHB).

### Ranger|XPHB classFeatures list

| Level | Feature |
|---|---|
| 1 | Spellcasting\|Ranger\|XPHB\|1 |
| 1 | Favored Enemy\|Ranger\|XPHB\|1 |
| 1 | Weapon Mastery\|Ranger\|XPHB\|1 |
| 2 | Deft Explorer\|Ranger\|XPHB\|2 |
| 2 | Fighting Style\|Ranger\|XPHB\|2 |
| 3 | Ranger Subclass\|Ranger\|XPHB\|3 (`gainSubclassFeature: true`) |
| 4 | Ability Score Improvement\|Ranger\|XPHB\|4 |
| 5 | Extra Attack\|Ranger\|XPHB\|5 |
| 6 | Roving\|Ranger\|XPHB\|6 |
| 7 | Subclass Feature\|Ranger\|XPHB\|7 (`gainSubclassFeature: true`) |
| 8 | Ability Score Improvement\|Ranger\|XPHB\|8 |
| 9 | Expertise\|Ranger\|XPHB\|9 |
| 10 | Tireless\|Ranger\|XPHB\|10 |
| 11 | Subclass Feature\|Ranger\|XPHB\|11 (`gainSubclassFeature: true`) |
| 12 | Ability Score Improvement\|Ranger\|XPHB\|12 |
| 13 | Relentless Hunter\|Ranger\|XPHB\|13 |
| 14 | Nature's Veil\|Ranger\|XPHB\|14 |
| 15 | Subclass Feature\|Ranger\|XPHB\|15 (`gainSubclassFeature: true`) |
| 16 | Ability Score Improvement\|Ranger\|XPHB\|16 |
| 17 | Precise Hunter\|Ranger\|XPHB\|17 |
| 18 | Feral Senses\|Ranger\|XPHB\|18 |
| 19 | Epic Boon\|Ranger\|XPHB\|19 |
| 20 | Foe Slayer\|Ranger\|XPHB\|20 |

**Total classFeature entries (XPHB):** 23 (cleaner — no optional variants, all levels filled except none intentionally skipped)

### Options Blocks in Class Features

**Fighting Style (PHB, level 2):**
```json
{
  "type": "options",
  "count": 1,
  "entries": [
    { "type": "refOptionalfeature", "optionalfeature": "Archery" },
    { "type": "refOptionalfeature", "optionalfeature": "Defense" },
    { "type": "refOptionalfeature", "optionalfeature": "Dueling" },
    { "type": "refOptionalfeature", "optionalfeature": "Two-Weapon Fighting" },
    { "type": "refOptionalfeature", "optionalfeature": "Blind Fighting|TCE" },
    { "type": "refOptionalfeature", "optionalfeature": "Druidic Warrior|TCE" },
    { "type": "refOptionalfeature", "optionalfeature": "Thrown Weapon Fighting|TCE" }
  ]
}
```
- **count:** 1
- **refs:** 7 `refOptionalfeature` entries (shared pool with other classes via featureType `FS:R`)
- **Detection:** Uses `refOptionalfeature` (NOT inline `entries`). The import script stores `entries` as raw JSON, so these refs will be preserved in the `class_features` collection. The import does NOT expand the optional feature pool — the sheet UI must resolve `refOptionalfeature` pointers to the global optional features data.
- **Class-level `optionalfeatureProgression`:** Confirms `featureType: ["FS:R"]` at level 2 — the Ranger draws from the shared Ranger Fighting Style pool (separate from Fighter `FS:F`).

**Fighting Style (XPHB, level 2):**
```json
{
  "type": "entries",
  "entries": [
    { "type": "refFeat", "feat": "Druidic Warrior|XPHB" }
  ]
}
```
The 2024 Fighting Style uses `refFeat` (not `refOptionalfeature`) pointing to a Fighting Style feat from the feat pool (categories `FS` and `FS:R`). This is a structural difference from the classic edition. The sheet must handle both `refOptionalfeature` and `refFeat` reference types.

---

## C. Subclasses (Ranger Conclaves / Archetypes)

### Summary table

| Subclass | Source | classSource | Edition | Levels | additionalSpells | options blocks |
|---|---|---|---|---|---|---|
| Beast Master | PHB | PHB | classic | 3, 7, 11, 15 | No | No direct options; level 3 has `refSubclassFeature` to Ranger's Companion and Primal Companion (TCE variant) |
| Beast Master | PHB | XPHB | classic | (\_copy of PHB/PHB) | (copied) | (copied) |
| Hunter | PHB | PHB | classic | 3, 7, 11, 15 | No | Yes — multiple options blocks (see detail) |
| Hunter | PHB | XPHB | classic | (\_copy of PHB/PHB) | (copied) | (copied) |
| Gloom Stalker | XGE | PHB | classic | 3, 7, 11, 15 | Yes (`known`) | No |
| Gloom Stalker | XGE | XPHB | classic | (\_copy of XGE/PHB) | (copied) | (copied) |
| Horizon Walker | XGE | PHB | classic | 3, 7, 11, 15 | Yes (`known`) | No |
| Horizon Walker | XGE | XPHB | classic | (\_copy of XGE/PHB) | (copied) | (copied) |
| Monster Slayer | XGE | PHB | classic | 3, 7, 11, 15 | Yes (`known`) | No |
| Monster Slayer | XGE | XPHB | classic | (\_copy of XGE/PHB) | (copied) | (copied) |
| Fey Wanderer | TCE | PHB | classic | 3, 7, 11, 15 | Yes (`known`) | No |
| Fey Wanderer | TCE | XPHB | classic | (\_copy of TCE/PHB, with fluff) | (copied) | (copied) |
| Swarmkeeper | TCE | PHB | classic | 3, 7, 11, 15 | Yes (`known`) | No |
| Swarmkeeper | TCE | XPHB | classic | (\_copy of TCE/PHB, with fluff) | (copied) | (copied) |
| Drakewarden | FTD | PHB | classic | 3, 7, 11, 15 | Yes (`known`) | No |
| Drakewarden | FTD | XPHB | classic | (\_copy of FTD/PHB, with fluff) | (copied) | (copied) |
| Beast Master | XPHB | XPHB | one | 3, 7, 11, 15 | No | No |
| Fey Wanderer | XPHB | XPHB | one | 3, 7, 11, 15 | Yes (`known`) | No |
| Gloom Stalker | XPHB | XPHB | one | 3, 7, 11, 15 | Yes (`prepared`) | No |
| Hunter | XPHB | XPHB | one | 3, 7, 11, 15 | No | No (inline options in subclassFeature entries) |
| Winter Walker | FRHoF | XPHB | one | 3, 7, 11, 15 | Yes (`prepared`) | No |

**Total distinct subclass entries:** 21 (including `_copy` entries for cross-edition compatibility)

**spellcastingAbility override:** No subclass in this file overrides `spellcastingAbility`. The field is present in the import mapping (`spellcastingAbility: sc.spellcastingAbility || null`) but will be null for all Ranger subclasses. OK — all Ranger subclasses use the class default (Wisdom).

### Subclass additionalSpells detail

**Import mapping:** `additionalSpells: sc.additionalSpells?.[0] || null`
Only the first element of the `additionalSpells` array is imported. All Ranger subclasses have exactly one element in their `additionalSpells` array, so this is fine.

**`known` vs `prepared` distinction:**
- Classic subclasses (PHB/XGE/TCE/FTD) use `"known"` key — spells are added to known spells list
- 2024 subclasses (XPHB/FRHoF) use `"prepared"` key — spells are always prepared
- The import stores the raw object (`sc.additionalSpells?.[0]`), preserving whichever key is present. The sheet must distinguish `known` vs `prepared` when rendering.

**Per-subclass spell lists:**

| Subclass | Levels | Spells |
|---|---|---|
| Gloom Stalker (XGE) | 3,5,9,13,17 | disguise self, rope trick, fear, greater invisibility, seeming |
| Horizon Walker (XGE) | 3,5,9,13,17 | protection from evil and good, misty step, haste, banishment, teleportation circle |
| Monster Slayer (XGE) | 3,5,9,13,17 | protection from evil and good, zone of truth, magic circle, banishment, hold monster |
| Fey Wanderer (TCE) | 3,5,9,13,17 | charm person, misty step, dispel magic, dimension door, mislead |
| Swarmkeeper (TCE) | 3,5,9,13,17 | mage hand (cantrip, `#c` suffix), faerie fire, web, gaseous form, arcane eye, insect plague |
| Drakewarden (FTD) | 3 only | thaumaturgy (cantrip, `#c` suffix) |
| Fey Wanderer (XPHB) | 3,5,9,13,17 | charm person, misty step, summon fey, dimension door, mislead |
| Gloom Stalker (XPHB) | 3,5,9,13,17 | disguise self, rope trick, fear, greater invisibility, seeming |
| Winter Walker (FRHoF) | 3,5,9,13,17 | ice knife, hold person, remove curse, ice storm, cone of cold |

**Note on `#c` suffix:** The `mage hand#c` and `thaumaturgy#c` entries use a 5e.tools convention indicating these are cantrips. The import stores them verbatim — the sheet must strip or handle the `#c` suffix when resolving spell references.

### Hunter subclass options blocks (PHB)

The Hunter subclass has the most complex options structure:

**Level 3 — Hunter's Prey** (`type: "options"`, count: 1):
- `refSubclassFeature: Colossus Slayer|Ranger||Hunter||3`
- `refSubclassFeature: Giant Killer|Ranger||Hunter||3`
- `refSubclassFeature: Horde Breaker|Ranger||Hunter||3`

**Level 7 — Defensive Tactics** (`type: "options"`, count: 1):
- `refSubclassFeature: Escape the Horde|Ranger||Hunter||7`
- `refSubclassFeature: Multiattack Defense|Ranger||Hunter||7`
- `refSubclassFeature: Steel Will|Ranger||Hunter||7`

**Level 11 — Multiattack** (`type: "options"`, count: 1):
- `refSubclassFeature: Volley|Ranger||Hunter||11`
- `refSubclassFeature: Whirlwind Attack|Ranger||Hunter||11`

**Level 15 — Superior Hunter's Defense** (`type: "options"`, count: 1):
- `refSubclassFeature: Evasion|Ranger||Hunter||15`
- `refSubclassFeature: Stand Against the Tide|Ranger||Hunter||15`
- `refSubclassFeature: Uncanny Dodge|Ranger||Hunter||15`

**XPHB Hunter (2024):** Does NOT use `refSubclassFeature` options blocks. Instead, Hunter's Prey (level 3) and Defensive Tactics (level 7) present inline options text within the feature entries — `Colossus Slayer` or `Horde Breaker` (choose one, swappable on rest); `Escape the Horde` or `Multiattack Defense` (swappable on rest). Level 11 is `Superior Hunter's Prey` (no choice). Level 15 is `Superior Hunter's Defense` (no choice — single feature granting resistance as reaction).

### Beast Master level 3 variants

The Beast Master level 3 feature (`subclassFeature`) contains:
- `refSubclassFeature: Ranger's Companion|Ranger||Beast Master||3` (PHB original)
- `refSubclassFeature: Primal Companion|Ranger||Beast Master||3|TCE` (TCE optional variant, `isClassFeatureVariant: true`)

Both are inline via `refSubclassFeature`. The sheet must handle optional feature variants at the subclass level.

---

## D. Spell Data / Caster Progression

### Classic Ranger (PHB)

- `casterProgression: "1/2"` — confirmed in source
- Spellcasting starts at level 2 (level 1 row in `spellsKnownProgression` is 0; level 2 row is 2)
- `spellsKnownProgression` (20 values): `[0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]`
- `rowsSpellProgression` (20 rows × 5 columns): Matches standard half-caster table. Level 1 row = `[0,0,0,0,0]`, level 2 = `[2,0,0,0,0]`, reaches max `[4,3,3,3,2]` at level 19–20
- Import maps `spellSlotProgression` from `classTableGroups` — correctly finds the group with `rowsSpellProgression`

### 2024 Ranger (XPHB)

- `casterProgression: "artificer"` — NOT `"1/2"`
- Spellcasting starts at level 1 (level 1 row = `[2,0,0,0,0]`)
- Uses `preparedSpellsProgression` instead of `spellsKnownProgression`
- `preparedSpellsProgression` (20 values): `[2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15]`
- Import maps `preparedSpellsProgression: c.preparedSpellsProgression || null` — correctly captured
- `rowsSpellProgression` is same slot table as classic (half-caster), but starts at level 1

**Summary:** The `"1/2"` caster progression is confirmed for the classic (PHB) Ranger. The 2024 (XPHB) Ranger uses `"artificer"` progression — a half-caster that starts spellcasting at level 1. Both are correctly stored verbatim by the import script.

---

## E. Issues and Action Items

### ISSUE 1: `optionalfeatureProgression` not imported (medium)
The class-level `optionalfeatureProgression` field (PHB Ranger, specifying `featureType: ["FS:R"]` Fighting Style pool at level 2) and `featProgression` (XPHB Ranger, similar) are not stored in the import record. The import only stores `classFeatures` (the feature reference list). If the sheet needs to programmatically determine which optional feature pool to offer at a given level, this data is lost. The raw `classTableGroups` is stored, but it does not contain this information.

**Recommendation:** Add `optionalfeatureProgression: c.optionalfeatureProgression || null` and `featProgression: c.featProgression || null` to the class import record.

### ISSUE 2: Class-level `additionalSpells` not imported (medium)
The XPHB Ranger class has a top-level `additionalSpells` field specifying Hunter's Mark is always prepared at level 1. This is not imported — the class record has no `additionalSpells` field. The subclass `additionalSpells` IS imported. Only the class-level one is missed.

**Recommendation:** Add `additionalSpells: c.additionalSpells || null` to the class import record.

### ISSUE 3: `refOptionalfeature` vs `refFeat` types in Fighting Style (low — awareness)
Classic Fighting Style uses `refOptionalfeature` pointing to the global optional features pool. 2024 Fighting Style uses `refFeat` pointing to feats with category `FS`/`FS:R`. The import stores raw entries JSON — the sheet UI layer must handle both reference types when rendering feature options.

### ISSUE 4: `#c` cantrip suffix in additionalSpells (low — awareness)
Swarmkeeper (mage hand) and Drakewarden (thaumaturgy) use `#c` suffix in their `additionalSpells.known` entries to indicate cantrips. The import stores these verbatim. The sheet must strip the `#c` suffix when resolving spell lookups.

### ISSUE 5: `"artificer"` casterProgression not "1/2" (awareness — no bug)
The 2024 Ranger uses `casterProgression: "artificer"`. This is not a bug in the data — it correctly reflects that the 2024 Ranger gets spell slots from level 1. However, if the sheet has hardcoded logic expecting `"1/2"` for half-casters, it will break for the XPHB Ranger. The sheet must handle `"artificer"` as a valid progression type for half-casters that start at level 1.

### ISSUE 6: `_copy` subclasses with `fluff` override (low — awareness)
Several TCE/FTD subclasses copied to XPHB classSource include a `fluff` override block:
```json
"fluff": {
  "_subclassFluff": { "name": "Fey Wanderer", ... }
}
```
(Fey Wanderer TCE/XPHB, Swarmkeeper TCE/XPHB, Drakewarden FTD/XPHB). The import script does not handle `fluff` or `_subclassFluff` — this is expected since fluff is display text. No action needed.

---

## F. Verification Summary

| Check | Result |
|---|---|
| hitDie = 10 (d10) | PASS |
| savingThrows = STR, DEX | PASS |
| spellcastingAbility = WIS | PASS |
| casterProgression = "1/2" (PHB) | PASS |
| casterProgression = "artificer" (XPHB) | PASS — stored correctly, sheet must handle both |
| armorProficiencies = light, medium, shield | PASS |
| weaponProficiencies = simple, martial | PASS |
| classFeatures list complete (PHB) | PASS — 30 entries, subclass gates at 3/7/11/15 |
| classFeatures list complete (XPHB) | PASS — 23 entries, subclass gates at 3/7/11/15 |
| Fighting Style uses refOptionalfeature | PASS — correctly detected, 7 refs in PHB |
| Fighting Style XPHB uses refFeat | PASS — correct structural difference |
| optionalfeatureProgression imported | FAIL — not mapped in import record |
| Class-level additionalSpells imported | FAIL — not mapped in import record (XPHB only) |
| Subclass additionalSpells imported | PASS — `sc.additionalSpells?.[0]` |
| Hunter options blocks (4 levels) | PASS — present as refSubclassFeature in entries JSON |
| All 21 subclass entries present | PASS |
| No subclass spellcastingAbility overrides | PASS — all null |
| Spell slot table (rowsSpellProgression) | PASS — both PHB and XPHB tables correct |
| `#c` cantrip suffix handling | WARNING — stored verbatim, sheet must strip |
