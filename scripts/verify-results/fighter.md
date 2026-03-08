# Fighter Class Verification Report

**Source file:** `data/5etools-src/data/class/class-fighter.json`
**Import script:** `scripts/import-5etools.ts`
**Date:** 2026-03-07

---

## A. Class Basics

Two editions of the Fighter class are defined:

### Fighter (PHB) — classic edition

| Field | JSON value | Import mapping | Status |
|-------|-----------|----------------|--------|
| hitDie | `hd.faces = 10` | `c.hd?.faces \|\| 8` → `10` | OK |
| savingThrows | `proficiency: ["str", "con"]` | `c.proficiency \|\| []` → `["str", "con"]` | OK |
| spellcastingAbility | not present | `c.spellcastingAbility \|\| null` → `null` | OK |
| casterProgression | not present | `c.casterProgression \|\| null` → `null` | OK |
| armorProficiencies | `startingProficiencies.armor: ["light","medium","heavy","shield"]` | `c.startingProficiencies?.armor` → as-is | OK |
| weaponProficiencies | `startingProficiencies.weapons: ["simple","martial"]` | `c.startingProficiencies?.weapons` → as-is | OK |
| subclassTitle | `"Martial Archetype"` | `c.subclassTitle \|\| "Subclass"` | OK |
| optionalfeatureProgression | `[{name:"Fighting Style", featureType:["FS:F"], progression:{"1":1}}]` | Not imported to class record (not in schema) | NOTE (see below) |

**Multiclassing:** requirements `str:13 OR dex:13`; gains light, medium, shield, simple, martial.

### Fighter (XPHB) — one edition

| Field | JSON value | Import mapping | Status |
|-------|-----------|----------------|--------|
| hitDie | `hd.faces = 10` | → `10` | OK |
| savingThrows | `proficiency: ["str", "con"]` | → `["str", "con"]` | OK |
| spellcastingAbility | not present | → `null` | OK |
| casterProgression | not present | → `null` | OK |
| armorProficiencies | `["light","medium","heavy","shield"]` | as-is | OK |
| weaponProficiencies | `["simple","martial"]` | as-is | OK |
| subclassTitle | `"Fighter Subclass"` | OK | OK |
| featProgression | `[{name:"Fighting Style",category:["FS"],progression:{"1":1}}, {name:"Epic Boon",category:["EB"],progression:{"19":1}}]` | Not imported to class record | NOTE (see below) |

**XPHB skill list differs from PHB:** adds `"persuasion"` (PHB has 8 skills, XPHB has 9).

**NOTE — optionalfeatureProgression / featProgression not imported:** The import script does not include `optionalfeatureProgression` or `featProgression` in the class record stored to PocketBase. The Fighting Style selection mechanism at level 1 is therefore not captured in the `classes` collection. This is a data gap if the app needs to know which optional feature types a class unlocks.

---

## B. Class Features (Levels 1–20)

### PHB Fighter — classFeatures array (20 entries)

| Level | Feature | Type | Notes |
|-------|---------|------|-------|
| 1 | Fighting Style | classFeature | Has `type:"options"` block — uses **refOptionalfeature** (shared pool FS:F). Count: choose 1 from 11 options |
| 1 | Second Wind | classFeature | Plain feature |
| 2 | Action Surge | classFeature | Plain feature |
| 3 | Martial Archetype | classFeature | `gainSubclassFeature: true` |
| 4 | Ability Score Improvement | classFeature | Plain feature |
| 4 | Martial Versatility (TCE) | classFeature | `isClassFeatureVariant: true`; optional |
| 5 | Extra Attack | classFeature | Plain feature |
| 6 | Ability Score Improvement | classFeature | Plain feature |
| 7 | Martial Archetype feature | classFeature | `gainSubclassFeature: true` |
| 8 | Ability Score Improvement | classFeature | Plain feature |
| 9 | Indomitable | classFeature | Plain feature |
| 10 | Martial Archetype feature | classFeature | `gainSubclassFeature: true` |
| 11 | Extra Attack (2) | classFeature | Plain feature |
| 12 | Ability Score Improvement | classFeature | Plain feature |
| 13 | Indomitable (two uses) | classFeature | Plain feature |
| 14 | Ability Score Improvement | classFeature | Plain feature |
| 15 | Martial Archetype feature | classFeature | `gainSubclassFeature: true` |
| 16 | Ability Score Improvement | classFeature | Plain feature |
| 17 | Action Surge (two uses) | classFeature | Plain feature |
| 17 | Indomitable (three uses) | classFeature | Plain feature |
| 18 | Martial Archetype feature | classFeature | `gainSubclassFeature: true` |
| 19 | Ability Score Improvement | classFeature | Plain feature |
| 20 | Extra Attack (3) | classFeature | Plain feature |

**Subclass feature slots (PHB):** levels 3, 7, 10, 15, 18.

### XPHB Fighter — classFeatures array (20 entries)

| Level | Feature | Type | Notes |
|-------|---------|------|-------|
| 1 | Fighting Style | classFeature | References `featProgression` (category FS), not `optionalfeatureProgression` |
| 1 | Second Wind | classFeature | Uses 2x per short rest (upgraded from PHB) |
| 1 | Weapon Mastery | classFeature | New in 2024 |
| 2 | Action Surge | classFeature | Plain feature |
| 2 | Tactical Mind | classFeature | New in 2024 |
| 3 | Fighter Subclass | classFeature | `gainSubclassFeature: true` |
| 4 | Ability Score Improvement | classFeature | Plain feature |
| 5 | Extra Attack | classFeature | Plain feature |
| 5 | Tactical Shift | classFeature | New in 2024 |
| 6 | Ability Score Improvement | classFeature | Plain feature |
| 7 | Subclass Feature | classFeature | `gainSubclassFeature: true` |
| 8 | Ability Score Improvement | classFeature | Plain feature |
| 9 | Indomitable | classFeature | Plain feature |
| 9 | Tactical Master | classFeature | New in 2024 |
| 10 | Subclass Feature | classFeature | `gainSubclassFeature: true` |
| 11 | Two Extra Attacks | classFeature | Renamed from "Extra Attack (2)" |
| 12 | Ability Score Improvement | classFeature | Plain feature |
| 13 | Indomitable | classFeature | Same name as level 9 entry (upgrade note in text) |
| 13 | Studied Attacks | classFeature | New in 2024 |
| 14 | Ability Score Improvement | classFeature | Plain feature |
| 15 | Subclass Feature | classFeature | `gainSubclassFeature: true` |
| 16 | Ability Score Improvement | classFeature | Plain feature |
| 17 | Action Surge | classFeature | Same name as level 2 entry (upgrade note in text) |
| 17 | Indomitable | classFeature | Same name as level 9/13 entry |
| 18 | Subclass Feature | classFeature | `gainSubclassFeature: true` |
| 19 | Epic Boon | classFeature | Via featProgression (category EB) |
| 20 | Three Extra Attacks | classFeature | Renamed from "Extra Attack (3)" |

**Subclass feature slots (XPHB):** levels 3, 7, 10, 15, 18.

### Fighting Style — refOptionalfeature verification (PHB)

The Fighting Style classFeature (PHB, level 1) contains a `type:"options"` block with `count:1`.
All 11 entries use `type:"refOptionalfeature"` — they reference the shared `optionalfeatures` pool, NOT `refClassFeature`. This is correct 5e.tools behavior for Fighting Styles.

**Options listed (PHB Fighting Style):**
1. Archery
2. Defense
3. Dueling
4. Great Weapon Fighting
5. Protection
6. Two-Weapon Fighting
7. Blind Fighting (TCE)
8. Interception (TCE)
9. Superior Technique (TCE)
10. Thrown Weapon Fighting (TCE)
11. Unarmed Fighting (TCE)

**Import script handling:** The import script imports `classFeature.entries` verbatim (as a JSON blob), so the `refOptionalfeature` references are preserved in the stored data. However, there is no import-time resolution of these references into a separate list — the app must interpret the entries array at runtime.

**XPHB Fighting Style** uses `featProgression` with `category:["FS"]` rather than `optionalfeatureProgression`. The classFeature text at level 1 (XPHB) just says "gain a Fighting Style feat of your choice" — no options block in the feature entries.

---

## C. All Subclasses

### PHB Subclasses (classSource: PHB)

#### Battle Master (PHB/PHB) — classic
- **Features:** 3, 7, 7, 7, 10, 10, 15, 15, 15, 18 (10 entries)
- **optionalfeatureProgression:** Maneuvers (featureType MV:B): 3→3, 7→5, 10→7, 15→9
- **Options blocks:** Maneuvers subclass feature (level 3) has `type:"options"`, count 3, 16 refOptionalfeature entries (PHB maneuvers). Maneuver Options (TCE, level 3) adds 7 more via refOptionalfeature.
- **spellcastingAbility:** null
- **additionalSpells:** none
- **reprintedAs:** `Battle Master|Fighter|XPHB|XPHB`

#### Champion (PHB/PHB) — classic
- **Features:** 3, 7, 10, 15, 18 (5 entries)
- **optionalfeatureProgression:** Fighting Style (featureType FS:F) at level 10 (gain a second style)
- **Options blocks:** none (Additional Fighting Style at level 10 is prose only, no refOptionalfeature block)
- **spellcastingAbility:** null
- **additionalSpells:** none
- **reprintedAs:** `Champion|Fighter|XPHB|XPHB`

#### Eldritch Knight (PHB/PHB) — classic
- **Features:** 3, 7, 10, 15, 18 (5 entries)
- **spellcastingAbility:** `"int"` — imported correctly via `sc.spellcastingAbility || null`
- **casterProgression:** `"1/3"` — NOTE: import script does NOT import subclass `casterProgression` into the subclasses record. Only `spellcastingAbility` is captured. This is a data gap.
- **cantripProgression:** [0,0,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3]
- **spellsKnownProgression:** [0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13]
- **additionalSpells (expanded):** Wizard spells unlocked at levels 3, 7, 13, 19 (levels 0-1, 2, 3, 4)
- **Import:** `additionalSpells?.[0]` captures the first additionalSpells entry. OK.
- **reprintedAs:** `Eldritch Knight|Fighter|XPHB|XPHB`

#### Purple Dragon Knight / Banneret (SCAG/PHB) — classic
- **Features:** 3, 7, 10, 15, 18 (5 entries, but level 18 is a duplicate "Inspiring Surge" upgrade entry)
- **spellcastingAbility:** null
- **additionalSpells:** none
- **Options blocks:** none
- **reprintedAs:** `Banneret|Fighter|XPHB|FRHoF`

### XGE Subclasses (classSource: PHB)

#### Arcane Archer (XGE/PHB) — classic
- **Features:** 3, 7, 7, 7, 10, 15, 15, 18 (8 entries)
- **optionalfeatureProgression:** Arcane Shots (featureType AS): 3→2, 7→3, 10→4, 15→5, 18→6
- **additionalSpells (known):** at level 3, choice of either `prestidigitation#c` OR `druidcraft#c` (two separate additionalSpells entries, each with one known cantrip — import takes only `[0]`, so only `prestidigitation` is captured)
- **Options blocks:** Arcane Shot Options (level 3) has `type:"options"`, count 2, 8 refOptionalfeature entries (Arcane Shot options from XGE).
- **spellcastingAbility:** null
- **ISSUE:** `additionalSpells?.[0]` only captures the first of two additionalSpells entries. The druidcraft cantrip alternative is dropped.

#### Cavalier (XGE/PHB) — classic
- **Features:** 3, 7, 10, 15, 18 (5 entries)
- **spellcastingAbility:** null
- **additionalSpells:** none
- **Options blocks:** none

#### Samurai (XGE/PHB) — classic
- **Features:** 3, 7, 10, 15, 18 (5 entries)
- **spellcastingAbility:** null
- **additionalSpells:** none
- **Options blocks:** none

### EGW Subclasses (classSource: PHB)

#### Echo Knight (EGW/PHB) — classic
- **Features:** 3, 7, 10, 15, 18 (5 entries)
- **spellcastingAbility:** null
- **additionalSpells:** none
- **Options blocks:** none (refSubclassFeature used at level 3 to reference sub-features, not options)

### TCE Subclasses (classSource: PHB)

#### Psi Warrior (TCE/PHB) — classic
- **Features:** 3, 7, 10, 15, 18 (5 entries)
- **spellcastingAbility:** null
- **additionalSpells (innate):** at level 18, daily 1x `telekinesis` — no spellcastingAbility override, treated as innate
- **Options blocks:** Psionic Power (level 3) contains `type:"options"` with 3 refSubclassFeature entries (Protective Field, Psionic Strike, Telekinetic Movement). Telekinetic Adept (level 7) contains `type:"options"` with 2 refSubclassFeature entries. These are **refSubclassFeature**, not refOptionalfeature.
- **reprintedAs:** `Psi Warrior|Fighter|XPHB|XPHB`

#### Rune Knight (TCE/PHB) — classic
- **Features:** 3, 7, 7, 10, 10, 15, 15, 18 (8 entries)
- **optionalfeatureProgression:** Runes (featureType RN): 3→2, 7→3, 10→4, 15→5
- **Options blocks:** Rune Carver (level 3) has `type:"options"`, count 2, 6 refOptionalfeature entries (Cloud, Fire, Frost, Stone, Hill, Storm runes from TCE).
- **spellcastingAbility:** null
- **additionalSpells:** none

### _copy Entries (XGE/SCAG/TCE/EGW subclasses for XPHB base class)

Each classic subclass that applies to both PHB and XPHB versions of the Fighter has a `_copy` entry with `classSource: XPHB`. These are resolved by `resolveAllCopies()` in the import script and result in duplicate records (same subclass features, both classSource variants). This is correct behavior.

Affected: Battle Master (PHB→XPHB), Champion (PHB→XPHB), Eldritch Knight (PHB→XPHB), Purple Dragon Knight (SCAG→XPHB), Arcane Archer (XGE→XPHB), Cavalier (XGE→XPHB), Samurai (XGE→XPHB), Echo Knight (EGW→XPHB), Psi Warrior (TCE→XPHB), Rune Knight (TCE→XPHB).

### XPHB Native Subclasses (classSource: XPHB, source: XPHB)

#### Battle Master (XPHB/XPHB) — one edition
- **Features:** 3, 7, 10, 15, 18 (5 entries)
- **optionalfeatureProgression:** Maneuvers (MV:B): 3→3, 7→5, 10→7, 15→9
- **Options blocks:** Maneuver Options (level 3) has `type:"options"`, count 3, 20 refOptionalfeature entries (XPHB maneuvers).
- **spellcastingAbility:** null
- **additionalSpells:** none

#### Champion (XPHB/XPHB) — one edition
- **Features:** 3, 7, 10, 15, 18 (5 entries)
- **featProgression:** Fighting Style (category FS) at level 7 (second style)
- **spellcastingAbility:** null
- **additionalSpells:** none
- **Options blocks:** none

#### Eldritch Knight (XPHB/XPHB) — one edition
- **spellcastingAbility:** `"int"` — imported correctly
- **casterProgression:** `"1/3"` — NOT imported (same gap as PHB version)
- **preparedSpellsProgression:** [0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13] — uses prepared spells model (2024)
- **preparedSpellsChange:** `"level"` — not imported
- **cantripProgression:** same as PHB version
- **additionalSpells (expanded):** same as PHB version (Wizard spells at levels 3, 7, 13, 19)
- **Features:** 3, 7, 10, 15, 18 (5 entries)

#### Psi Warrior (XPHB/XPHB) — one edition
- **Features:** 3, 7, 10, 15, 18 (5 entries)
- **spellcastingAbility:** null
- **additionalSpells (innate):** at level 18, daily 1x `telekinesis|xphb`
- **subclassTableGroups:** Psionic Energy Die size and count progression table

### FRHoF Subclasses (classSource: XPHB)

#### Banneret (FRHoF/XPHB) — one edition
- **Features:** 3, 7, 10, 15, 18 (5 entries)
- **additionalSpells (innate + ability):** at level 3, ritual `comprehend languages|xphb`, spellcasting ability `cha`
- **spellcastingAbility override:** NOT in subclass record directly; the additionalSpells entry has `"ability": "cha"` — import takes `additionalSpells?.[0]` which captures this. The subclass record's `spellcastingAbility` field remains null because the JSON has no top-level `spellcastingAbility` field.
- **Options blocks:** none

---

## D. Spell Data / Caster Progression

### Base Fighter class
- **PHB Fighter:** no `spellcastingAbility`, no `casterProgression` — correctly null in both editions
- **XPHB Fighter:** same — no spellcasting at class level

### Spellcasting Subclasses

| Subclass | Source | casterProgression | spellcastingAbility | Import status |
|----------|--------|-------------------|---------------------|---------------|
| Eldritch Knight | PHB/PHB | `"1/3"` | `"int"` | spellcastingAbility imported; casterProgression NOT imported |
| Eldritch Knight | PHB/XPHB | (_copy of above_) | `"int"` | same |
| Eldritch Knight | XPHB/XPHB | `"1/3"` | `"int"` | spellcastingAbility imported; casterProgression NOT imported |
| Banneret | FRHoF/XPHB | none | none (cha in additionalSpells.ability) | additionalSpells[0] captures the entry |
| Psi Warrior | TCE/PHB | none | none (innate only) | additionalSpells[0] captures telekinesis |
| Psi Warrior | XPHB/XPHB | none | none (innate only) | additionalSpells[0] captures telekinesis|xphb |
| Arcane Archer | XGE/PHB | none | none (cantrips via additionalSpells.known) | additionalSpells[0] captures prestidigitation only |

**Eldritch Knight spell slot tables** are defined in `subclassTableGroups.rowsSpellProgression` (both PHB and XPHB versions). The import script imports `classTableGroups` for the base class but does NOT import `subclassTableGroups`. The spell slot progression for Eldritch Knight is therefore not captured in the subclasses collection.

---

## E. Issues and Gaps

### BUGS / Missing data

1. **Eldritch Knight `casterProgression` not imported:** The import script maps `sc.spellcastingAbility` but not `sc.casterProgression`. The `"1/3"` casterProgression for Eldritch Knight is lost. If the app needs to compute spell slots for a subclass spellcaster, this is a critical omission.

2. **`subclassTableGroups` not imported:** Eldritch Knight's spell slot table (`rowsSpellProgression`) and Psi Warrior's energy die table are stored in `subclassTableGroups` in the JSON, but the import script does not handle this field. The spell progression table is not available in PocketBase.

3. **`optionalfeatureProgression` not imported for classes or subclasses:** The class-level Fighting Style progression (which featureType and how many per level) and subclass-level progressions (Battle Master maneuvers, Rune Knight runes, Arcane Archer shots) are not persisted. If the app generates character sheets with these choices, the feature pool type/count must be re-derived from the raw JSON at runtime.

4. **Arcane Archer `additionalSpells[1]` dropped:** The subclass offers a choice of either `prestidigitation` or `druidcraft` as a cantrip. The import does `additionalSpells?.[0]` which takes only the prestidigitation entry. The druidcraft alternative is silently discarded.

5. **Eldritch Knight `preparedSpellsChange: "level"` not imported (XPHB):** The XPHB Eldritch Knight switches from spells-known to prepared-spells model. The `preparedSpellsChange` field is not imported.

### CORRECT behavior confirmed

- hitDie (d10), savingThrows (str/con), armor/weapon proficiencies: correctly mapped for both editions
- `spellcastingAbility: "int"` on Eldritch Knight subclass: imported correctly
- `gainSubclassFeature` entries: preserved in `classFeatures` array verbatim (not resolved, just stored)
- `_copy` resolution: handled by `resolveAllCopies()` — cross-edition subclass copies are resolved correctly
- `edition` field: mapped from `c.edition` with fallback via `edition(source, edition)` helper
- Fighting Style uses `refOptionalfeature` (not `refClassFeature`): confirmed in JSON and entries are stored in the `class_features` record's `entries` blob
- Subclass features at correct levels (3, 7, 10, 15, 18 for all subclasses): confirmed
