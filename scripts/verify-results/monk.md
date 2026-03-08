# Monk — 5e.tools Data Verification Report

**Source file:** `data/5etools-src/data/class/class-monk.json`
**Date:** 2026-03-07
**Editions present:** PHB (classic, 2014) and XPHB (one, 2024)

---

## A. Class Basics

### PHB (classic) — Monk

| Field | JSON value | Import mapping | Notes |
|---|---|---|---|
| hitDie | `hd.faces: 8` | `hitDie: 8` | Correct |
| savingThrows | `proficiency: ["str", "dex"]` | `savingThrows: ["str", "dex"]` | Correct |
| spellcastingAbility | (absent) | `spellcastingAbility: null` | Correct — Monk base has no spellcasting |
| casterProgression | (absent) | `casterProgression: null` | Correct |
| armorProficiencies | `startingProficiencies.armor`: absent | `armorProficiencies: []` | Correct — Monk gets no armor proficiencies |
| weaponProficiencies | `["simple", "{@item shortsword|phb|shortswords}"]` | `weaponProficiencies: ["simple", "{@item shortsword|phb|shortswords}"]` | Raw array stored as-is |
| toolProficiencies | `toolProficiencies: [{anyArtisansTool:1}, {anyMusicalInstrument:1}]` | `toolChoices` parsed via `parseProfChoices()` | See note below |

**Tool choice parsing note:** The raw tools field is a text array: `["any one type of {@item artisan's tools|PHB} or any one {@item musical instrument|PHB} of your choice"]`. The import prefers `parseProfChoices(startingProficiencies.tools)` — but `tools` here is a text string array, not structured objects. It falls back to `parseProfChoicesFromText()`. The text string contains "or" and both artisan and musical keywords, so `parseProfChoicesFromText()` should emit both `{type:"anyArtisansTool", count:1}` and `{type:"anyMusicalInstrument", count:1}`.

However, the `toolProficiencies` structured array (separate key from `tools`) contains `[{anyArtisansTool:1}, {anyMusicalInstrument:1}]`. The import reads `startingProficiencies.tools` (the text array), not `startingProficiencies.toolProficiencies`. If structured data is intended to be the source, the import is reading the wrong key. The `toolProficiencies` key with structured objects is ignored.

**FLAG:** Import reads `startingProficiencies.tools` (text strings) for `toolChoices`, but PHB Monk provides a structured `startingProficiencies.toolProficiencies` array. The text fallback works but the intent is `toolProficiencies`.

### XPHB (one) — Monk

| Field | JSON value | Import mapping | Notes |
|---|---|---|---|
| hitDie | `hd.faces: 8` | `hitDie: 8` | Correct |
| savingThrows | `proficiency: ["str", "dex"]` | `savingThrows: ["str", "dex"]` | Correct |
| spellcastingAbility | (absent) | `spellcastingAbility: null` | Correct |
| casterProgression | (absent) | `casterProgression: null` | Correct |
| armorProficiencies | absent | `armorProficiencies: []` | Correct |
| weaponProficiencies | `["simple", "Martial weapons that have the Light property..."]` | stored as-is | Correct |
| toolProficiencies | `toolProficiencies: [{anyArtisansTool:1}, {anyMusicalInstrument:1}]` | same issue as PHB | Same flag applies |
| multiclassing | `{}` (empty object) | `multiclassing: {}` | Unusual — XPHB Monk has empty multiclassing block |

---

## B. Class Features (Levels 1–20)

### PHB (classic) classFeatures array

| Level | Feature | Type | Notes |
|---|---|---|---|
| 1 | Unarmored Defense | string ref | |
| 1 | Martial Arts | string ref | |
| 2 | Ki | string ref | |
| 2 | Dedicated Weapon | string ref (TCE) | Optional class feature (isClassFeatureVariant) |
| 2 | Unarmored Movement | string ref | |
| 3 | Deflect Missiles | string ref | |
| 3 | Monastic Tradition | object with `gainSubclassFeature: true` | Subclass gate at level 3 |
| 3 | Ki-Fueled Attack | string ref (TCE) | Optional class feature |
| 4 | Ability Score Improvement | string ref | |
| 4 | Slow Fall | string ref | |
| 4 | Quickened Healing | string ref (TCE) | Optional class feature |
| 5 | Extra Attack | string ref | |
| 5 | Stunning Strike | string ref | |
| 5 | Focused Aim | string ref (TCE) | Optional class feature |
| 6 | Ki-Empowered Strikes | string ref | |
| 6 | Monastic Tradition feature | object with `gainSubclassFeature: true` | Subclass gate at level 6 |
| 7 | Evasion | string ref | |
| 7 | Stillness of Mind | string ref | |
| 8 | Ability Score Improvement | string ref | |
| 9 | Unarmored Movement improvement | string ref | |
| 10 | Purity of Body | string ref | |
| 11 | Monastic Tradition feature | object with `gainSubclassFeature: true` | Subclass gate at level 11 |
| 12 | Ability Score Improvement | string ref | |
| 13 | Tongue of the Sun and Moon | string ref | |
| 14 | Diamond Soul | string ref | |
| 15 | Timeless Body | string ref | |
| 16 | Ability Score Improvement | string ref | |
| 17 | Monastic Tradition feature | object with `gainSubclassFeature: true` | Subclass gate at level 17 |
| 18 | Empty Body | string ref | |
| 19 | Ability Score Improvement | string ref | |
| 20 | Perfect Self | string ref | |

Total: 30 entries (26 distinct feature strings + 4 subclass gate objects).

**Options blocks in classFeature entries:** None at the class level. Options blocks only appear inside subclassFeature entries (see Section C).

**Ki feature:** The `Ki` classFeature entry (level 2) contains inline `refClassFeature` refs to Flurry of Blows, Patient Defense, Step of the Wind — these are resolved as part of the feature body, not separate classFeature entries in the classFeatures list. The import stores the full entries array, so these sub-refs are preserved inside the entries JSON.

### XPHB (one) classFeatures array

| Level | Feature | Notes |
|---|---|---|
| 1 | Martial Arts | Refs Bonus Unarmed Strike, Martial Arts Die, Dexterous Attacks via refClassFeature |
| 1 | Unarmored Defense | |
| 2 | Monk's Focus | Replaces Ki; refs Flurry of Blows, Patient Defense, Step of the Wind |
| 2 | Unarmored Movement | |
| 2 | Uncanny Metabolism | New in 2024 |
| 3 | Deflect Attacks | Replaces Deflect Missiles |
| 3 | Monk Subclass | `gainSubclassFeature: true` — subclass gate level 3 |
| 4 | Ability Score Improvement | |
| 4 | Slow Fall | |
| 5 | Extra Attack | |
| 5 | Stunning Strike | |
| 6 | Empowered Strikes | Replaces Ki-Empowered Strikes |
| 6 | Subclass Feature | `gainSubclassFeature: true` |
| 7 | Evasion | |
| 8 | Ability Score Improvement | |
| 9 | Acrobatic Movement | New in 2024 |
| 10 | Heightened Focus | New in 2024 |
| 10 | Self-Restoration | New in 2024 |
| 11 | Subclass Feature | `gainSubclassFeature: true` |
| 12 | Ability Score Improvement | |
| 13 | Deflect Energy | New in 2024 |
| 14 | Disciplined Survivor | New in 2024 |
| 15 | Perfect Focus | New in 2024 |
| 16 | Ability Score Improvement | |
| 17 | Subclass Feature | `gainSubclassFeature: true` |
| 18 | Superior Defense | New in 2024 |
| 19 | Epic Boon | Handled via `featProgression` (category EB, level 19) |
| 20 | Body and Mind | |

Total: 28 entries (24 feature strings + 4 subclass gate objects).

**Unusual pattern:** XPHB has two features at level 10 (`Heightened Focus` and `Self-Restoration`) — this is valid but worth noting for the level-up UI.

---

## C. Subclasses (Monastic Traditions)

### PHB-sourced subclasses (classSource: PHB)

#### Way of the Open Hand (PHB, p.79) — srd:true
- Features at: 3, 6, 11, 17
- `additionalSpells`: level 11 innate `sanctuary` (1/day), ability: wis
- `spellcastingAbility`: not set (null)
- `options` blocks: none at subclass list level — Open Hand Technique at level 3 has no options block
- Import: `additionalSpells[0]` = `{innate:{11:{daily:{1:["sanctuary"]}}}, ability:"wis"}`; `spellcastingAbility: null`

#### Way of Shadow (PHB, p.80) — reprintedAs XPHB
- Features at: 3, 6, 11, 17
- `additionalSpells`:
  - known at 3: `minor illusion#c` (cantrip)
  - innate at 3: darkness, darkvision, pass without trace, silence — each costs 2 Ki points (resource: {2: [...]})
  - resourceName: "Ki", ability: wis
- `spellcastingAbility`: not set (null)
- `options` blocks: none in subclassFeatures list

#### Way of the Four Elements (PHB, p.80) — reprintedAs XPHB
- Features at: 3, 6, 11, 17 (all named "Extra Elemental Discipline" for 6/11/17)
- `spellcastingAbility`: "wis" — **explicit override on subclass**
- `optionalfeatureProgression`: Elemental Disciplines (type "ED") — progression 3:2, 6:3, 11:4, 17:5; required at 3: Elemental Attunement
- `options` block: present inside `Elemental Disciplines` subclassFeature (level 3)
  - type: "options", count: 2
  - 17 refOptionalfeature entries: Breath of Winter, Clench of the North Wind, Elemental Attunement (required), Eternal Mountain Defense, Fangs of the Fire Snake, Fist of Four Thunders, Unbroken Air, Flames of the Phoenix, Gong of the Summit, Mist Stance, Ride the Wind, River of Hungry Flame, Rush of the Gale Spirits, Shape the Flowing River, Sweeping Cinder Strike, Water Whip, Wave of Rolling Earth
- **FLAG:** The import does not map `optionalfeatureProgression` — this field is not in the classes or subclasses record schema. The discipline progression and `required` Elemental Attunement will be lost.
- Import `additionalSpells`: none (not set on subclass)
- Import `spellcastingAbility`: "wis" — **correctly captured**

#### Way of the Long Death (SCAG, p.130)
- Features at: 3, 6, 11, 17
- `additionalSpells`: none
- `spellcastingAbility`: not set (null)
- `options` blocks: none

#### Way of the Drunken Master (XGE, p.33)
- Features at: 3, 6, 11, 17
- `additionalSpells`: none
- `spellcastingAbility`: not set (null)
- `options` block: present inside `Tipsy Sway` subclassFeature (level 6)
  - type: "options" (no count field — implies choose all/display both)
  - 2 entries: refSubclassFeature to `Leap to Your Feet|Monk|PHB|Drunken Master|XGE|6` and `Redirect Attack|Monk|PHB|Drunken Master|XGE|6`
  - This is a presentational grouping (both features are always gained), not a true player choice
- **FLAG:** The options block has no `count` field — the import stores full `entries` JSON, so this is preserved but it's an unusual pattern. The UI must treat a missing `count` as "all" (not a pick-N choice).

#### Way of the Kensei (XGE, p.34)
- Features at: 3, 6, 11, 17
- `additionalSpells`: none
- `spellcastingAbility`: not set (null)
- `options` block: present inside `Path of the Kensei` subclassFeature (level 3)
  - type: "options" (no count field)
  - 2 entries: refSubclassFeature to `Agile Parry` and `Kensei's Shot`
  - Same pattern as Drunken Master — both features always gained, displayed as options group
- **FLAG:** Same missing-count pattern as Drunken Master.

#### Way of the Sun Soul (XGE, p.35)
- Features at: 3, 6, 11, 17
- `additionalSpells`: level 6 innate `burning hands` — costs 2 Ki (resource: {2: [...]})
- `spellcastingAbility`: not set (null)
- `options` blocks: none

#### Way of Mercy (TCE, p.49) — reprintedAs XPHB
- Features at: 3, 6, 11, 17
- `additionalSpells`: none
- `spellcastingAbility`: not set (null)
- `options` blocks: none

#### Way of the Astral Self (TCE, p.50)
- Features at: 3, 6, 11, 17
- `additionalSpells`: none
- `spellcastingAbility`: not set (null)
- `options` blocks: none

#### Way of the Ascendant Dragon (FTD, p.13)
- Features at: 3, 6, 11, 17
- `additionalSpells`: none
- `spellcastingAbility`: not set (null)
- `options` blocks: none

### XPHB-sourced _copy subclasses (classSource: PHB, resolved copies for XPHB class)

The following are `_copy` entries that reference their PHB counterparts. After `resolveAllCopies()` they become full duplicates (same data, different classSource = XPHB):
- Way of Shadow (PHB → classSource: XPHB)
- Way of the Four Elements (PHB → classSource: XPHB)
- Way of the Open Hand (PHB → classSource: XPHB)
- Way of the Long Death (SCAG → classSource: XPHB)
- Way of the Drunken Master (XGE → classSource: XPHB)
- Way of the Kensei (XGE → classSource: XPHB)
- Way of the Sun Soul (XGE → classSource: XPHB)
- Way of Mercy (TCE → classSource: XPHB) — has explicit `fluff` override
- Way of the Astral Self (TCE → classSource: XPHB) — has explicit `fluff` override
- Way of the Ascendant Dragon (FTD → classSource: XPHB) — has explicit `fluff` override

**FLAG:** All 10 _copy subclasses use `_preserve` for `page`, `otherSources`, `referenceSources`, `srd`, `basicRules`, `reprintedAs`. These are preserved from the base. The `resolveCopy()` function handles `_preserve` by retaining base fields only when the child also has them — which appears correct.

### XPHB-native subclasses (classSource: XPHB, edition: "one")

#### Warrior of Mercy (XPHB, p.104)
- Features at: 3, 6, 11, 17
- `additionalSpells`: none
- `spellcastingAbility`: not set (null)
- `options` blocks: none (level 3 feature refs Hand of Harm, Hand of Healing, Implements of Mercy via refSubclassFeature — not options)

#### Warrior of Shadow (XPHB, p.105)
- Features at: 3, 6, 11, 17
- `additionalSpells`:
  - known at 3: `minor illusion|xphb#c`
  - innate at 3: darkness|xphb — costs 1 Focus Point (resource: {1: [...]})
  - resourceName: "Focus Point", ability: wis
- `spellcastingAbility`: not set (null)
- Note: 2024 version casts Darkness for 1 Focus Point vs. PHB version's 2 Ki points

#### Warrior of the Elements (XPHB, p.106)
- Features at: 3, 6, 11, 17
- `additionalSpells`:
  - known at 3: `elementalism|xphb#c`
  - ability: wis
- `spellcastingAbility`: not set (null)
- `options` blocks: none
- Note: No optionalfeatureProgression — 2024 redesign is not discipline-based

#### Warrior of the Open Hand (XPHB, p.107) — srd52:true, basicRules2024:true
- Features at: 3, 6, 11, 17
- `additionalSpells`: none
- `spellcastingAbility`: not set (null)
- `options` blocks: none

---

## D. Spell Data / Caster Progression

- **PHB Monk base:** No `spellcastingAbility`, no `casterProgression`, no `cantripProgression`, no `preparedSpellsProgression`, no spell slot table in classTableGroups.
  - Import: `casterProgression: null`, `spellcastingAbility: null`. **Correct.**
- **XPHB Monk base:** Same — no spellcasting fields.
  - Import: same null mapping. **Correct.**
- The classTableGroups for both editions contain only: Martial Arts die, Ki/Focus Points, Unarmored Movement. No spell slots.
- `spellSlotProgression` (import line 602): looks for `rowsSpellProgression` in classTableGroups — not present for Monk. Maps to `null`. **Correct.**

---

## E. Summary of Issues / Flags

### FLAG 1 — toolChoices reads wrong key (minor, functional workaround exists)
**Location:** `importClasses()` line 590–594 in `import-5etools.ts`
**Issue:** Import calls `parseProfChoices(c.startingProficiencies?.tools)` where `tools` is a text string array for PHB Monk. PHB Monk provides structured data in `startingProficiencies.toolProficiencies` (separate key). The fallback to `parseProfChoicesFromText()` produces correct output (both anyArtisansTool and anyMusicalInstrument, count:1), but relies on text parsing instead of structured data.
**Impact:** Low — text parser handles this case correctly. The result is identical for Monk.

### FLAG 2 — optionalfeatureProgression not imported (medium)
**Location:** Way of the Four Elements subclass
**Issue:** The subclass has `optionalfeatureProgression` with Elemental Disciplines progression (3:2, 6:3, 11:4, 17:5) and a required discipline (Elemental Attunement at level 3). The import schema has no field for this. It is dropped entirely.
**Impact:** Medium — the Four Elements subclass's discipline selection logic cannot be implemented without this data. The subclass is otherwise imported correctly (spellcastingAbility:wis is captured).

### FLAG 3 — options blocks with no count (low, presentational)
**Location:** Drunken Master `Tipsy Sway` (level 6), Kensei `Path of the Kensei` (level 3)
**Issue:** Both have `type:"options"` blocks with no `count` field, grouping sub-features that are both always gained. Unlike Four Elements which has `count:2` for a genuine pick-N choice, these are display groupings.
**Impact:** Low — the import stores the full entries JSON. The UI needs to distinguish missing-count options (display all) from count-N options (player picks N). No data is lost.

### FLAG 4 — _copy subclasses for XPHB create duplicates (informational)
**Location:** 10 subclasses with `_copy` and `classSource: XPHB`
**Issue:** After resolution, these are identical to their PHB originals except for `classSource`. This is intentional — they attach PHB-edition subclasses to the XPHB class. The `upsert` key includes `className` and `classSource`, so they are stored as distinct records. **No issue — working as designed.**

### FLAG 5 — Warrior of Shadow resource cost differs from PHB Way of Shadow (informational)
**Location:** `additionalSpells` for Way of Shadow (PHB) vs. Warrior of Shadow (XPHB)
**Issue:** PHB Way of Shadow costs 2 Ki for Darkness/Darkvision/Pass Without Trace/Silence. XPHB Warrior of Shadow costs 1 Focus Point for Darkness only (and knows Minor Illusion as a cantrip). The data is correct per RAW — this is a genuine rule change between editions, not a data error.

---

## F. Import Mapping Summary (PHB Monk)

```
classes record:
  name:                 "Monk"
  source:               "PHB"
  edition:              "classic"
  hitDie:               8
  primaryAbility:       []                    (PHB has no primaryAbility field)
  savingThrows:         ["str", "dex"]
  spellcastingAbility:  null
  casterProgression:    null
  armorProficiencies:   []
  weaponProficiencies:  ["simple", "{@item shortsword|phb|shortswords}"]
  toolProficiencies:    [text strings]        (raw)
  toolChoices:          [{type:"anyArtisansTool",count:1},{type:"anyMusicalInstrument",count:1}]
  skillChoices:         {from:[acrobatics,athletics,history,insight,religion,stealth], count:2}
  classFeatures:        [30 entries — strings and gainSubclassFeature objects]
  subclassTitle:        "Monastic Tradition"
  multiclassing:        {requirements:{dex:13,wis:13}, proficienciesGained:{weapons:[...]}}
  cantripProgression:   null
  preparedSpellsProgression: null
  spellSlotProgression: null
  classTableGroups:     [Martial Arts / Ki Points / Unarmored Movement table]
```
