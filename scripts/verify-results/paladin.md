# Paladin Class Verification Report

**Source file:** `data/5etools-src/data/class/class-paladin.json`
**Import script:** `scripts/import-5etools.ts` (`importClasses()`)
**Date:** 2026-03-07

---

## A. Class Basics

Two class entries exist in the file: PHB (classic, 2014) and XPHB (one, 2024).

### PHB (classic)

| Field | JSON path | Value | Import script mapping | Status |
|---|---|---|---|---|
| hitDie | `hd.faces` | 10 | `c.hd?.faces \|\| 8` | OK |
| savingThrows | `proficiency` | `["wis", "cha"]` | `c.proficiency \|\| []` | OK |
| spellcastingAbility | `spellcastingAbility` | `"cha"` | `c.spellcastingAbility` | OK |
| casterProgression | `casterProgression` | `"1/2"` | `c.casterProgression` | OK |
| armorProficiencies | `startingProficiencies.armor` | `["light","medium","heavy","shield"]` | `c.startingProficiencies?.armor` | OK |
| weaponProficiencies | `startingProficiencies.weapons` | `["simple","martial"]` | `c.startingProficiencies?.weapons` | OK |
| toolProficiencies | `startingProficiencies.tools` | `[]` (absent) | `c.startingProficiencies?.tools \|\| []` | OK (no tools) |
| skillChoices | `startingProficiencies.skills[0]` | choose 2 from athletics/insight/intimidation/medicine/persuasion/religion | `parseSkillChoices(...)` | OK |
| subclassTitle | `subclassTitle` | `"Sacred Oath"` | `c.subclassTitle \|\| "Subclass"` | OK |
| edition | `edition` | `"classic"` | `edition("PHB", "classic")` -> `"classic"` | OK |

**Not imported (present in JSON, absent from import record):**
- `optionalfeatureProgression`: `[{name: "Fighting Style", featureType: ["FS:P"], progression: {2: 1}}]` — not in import record. The Fighting Style pick is only detectable from `class_features.entries` (the `options` block in the Fighting Style classFeature).
- `preparedSpells`: formula string `"<$level$> / 2 + <$cha_mod$>"` — not imported.
- `preparedSpellsChange`: `"restLong"` — not imported.

### XPHB (one, 2024)

| Field | JSON path | Value | Import script mapping | Status |
|---|---|---|---|---|
| hitDie | `hd.faces` | 10 | same | OK |
| savingThrows | `proficiency` | `["wis", "cha"]` | same | OK |
| spellcastingAbility | `spellcastingAbility` | `"cha"` | same | OK |
| casterProgression | `casterProgression` | `"artificer"` | `c.casterProgression` | OK — but this differs from PHB `"1/2"`. XPHB paladin gains slots from level 1 (same progression table shape as artificer). Imported as-is. |
| armorProficiencies | `startingProficiencies.armor` | `["light","medium","heavy","shield"]` | same | OK |
| weaponProficiencies | `startingProficiencies.weapons` | `["simple","martial"]` | same | OK |
| subclassTitle | `subclassTitle` | `"Paladin Subclass"` | same | OK |
| edition | `edition` | `"one"` | `edition("XPHB", "one")` -> `"one"` | OK |
| preparedSpellsProgression | `preparedSpellsProgression` | 20-element array (2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15) | `c.preparedSpellsProgression \|\| null` | OK |

**Not imported (XPHB-specific gaps):**
- `featProgression`: `[{name:"Fighting Style", category:["FS","FS:P"], progression:{2:1}}, {name:"Epic Boon", category:["EB"], progression:{19:1}}]` — not in import record. XPHB uses feat-based Fighting Style (not optionalfeature pool), so detection requires a different mechanism than PHB.
- `additionalSpells` (base class level): `[{prepared: {2:["divine smite|xphb"], 5:["find steed|xphb"]}}]` — these are always-prepared spells granted by class features (Paladin's Smite at L2, Faithful Steed at L5). Not imported into the classes record. They are described in their respective classFeature entries.

**Spell slot progression difference — PHB vs XPHB:**
- PHB L1: `[0,0,0,0,0]` (no slots at L1, spellcasting starts at L2)
- XPHB L1: `[2,0,0,0,0]` (2 first-level slots from L1, spellcasting starts at L1)
- Both correctly stored in `spellSlotProgression` via `classTableGroups.rowsSpellProgression` (20 rows each).

---

## B. Class Features (Levels 1–20)

### PHB classFeatures

All 22 entries (including `Martial Versatility|TCE` optional) are string refs or `gainSubclassFeature` objects.

| Level | Feature | Type | Notes |
|---|---|---|---|
| 1 | Divine Sense | string ref | PHB only — moved to Channel Divinity in XPHB |
| 1 | Lay on Hands | string ref | |
| 2 | Divine Smite | string ref | Expend spell slot; XPHB reimplements as spell |
| 2 | Fighting Style | string ref | Has `options` block (see below) |
| 2 | Spellcasting | string ref | Spellcasting starts L2 for PHB |
| 3 | Divine Health | string ref | PHB only — not present in XPHB |
| 3 | Sacred Oath | gainSubclassFeature=true | |
| 4 | Ability Score Improvement | string ref | |
| 4 | Martial Versatility | string ref (TCE optional) | `isClassFeatureVariant: true` |
| 5 | Extra Attack | string ref | |
| 6 | Aura of Protection | string ref | |
| 7 | Sacred Oath feature | gainSubclassFeature=true | |
| 8 | Ability Score Improvement | string ref | |
| 10 | Aura of Courage | string ref | |
| 11 | Improved Divine Smite | string ref | PHB only; XPHB equivalent = Radiant Strikes |
| 12 | Ability Score Improvement | string ref | |
| 14 | Cleansing Touch | string ref | PHB only; XPHB equivalent = Restoring Touch |
| 15 | Sacred Oath feature | gainSubclassFeature=true | |
| 16 | Ability Score Improvement | string ref | |
| 18 | Aura improvements | string ref | |
| 19 | Ability Score Improvement | string ref | |
| 20 | Sacred Oath feature | gainSubclassFeature=true | |

**Missing levels in PHB:** 9, 13, 17 — no class features at these levels.

### XPHB classFeatures

| Level | Feature | Type | Notes |
|---|---|---|---|
| 1 | Lay on Hands | string ref | Bonus action (was action in PHB) |
| 1 | Spellcasting | string ref | Starts at L1 for XPHB |
| 1 | Weapon Mastery | string ref | New in XPHB |
| 2 | Fighting Style | string ref | Uses `refFeat` (not `refOptionalfeature`) |
| 2 | Paladin's Smite | string ref | New in XPHB (Divine Smite reimplemented as always-prepared spell) |
| 3 | Channel Divinity | string ref | Different from PHB (2 uses, regain on short rest) |
| 3 | Paladin Subclass | gainSubclassFeature=true | |
| 4 | Ability Score Improvement | string ref | |
| 5 | Extra Attack | string ref | |
| 5 | Faithful Steed | string ref | New in XPHB |
| 6 | Aura of Protection | string ref | |
| 7 | Subclass Feature | gainSubclassFeature=true | |
| 8 | Ability Score Improvement | string ref | |
| 9 | Abjure Foes | string ref | New in XPHB (was not present in PHB at L9) |
| 10 | Aura of Courage | string ref | |
| 11 | Radiant Strikes | string ref | Renamed from Improved Divine Smite |
| 12 | Ability Score Improvement | string ref | |
| 14 | Restoring Touch | string ref | Renamed/expanded from Cleansing Touch |
| 15 | Subclass Feature | gainSubclassFeature=true | |
| 16 | Ability Score Improvement | string ref | |
| 18 | Aura Expansion | string ref | Renamed from Aura improvements |
| 19 | Epic Boon | string ref | Replaces ASI at L19 in XPHB |
| 20 | Subclass Feature | gainSubclassFeature=true | |

### Features with `type: "options"` blocks

**Only one options block exists in the entire file:**

| Feature | Source | Level | Block type | count | Options (refOptionalfeature) |
|---|---|---|---|---|---|
| Fighting Style | PHB | 2 | `options` | 1 | Defense, Dueling, Great Weapon Fighting, Protection, Blessed Warrior\|TCE, Blind Fighting\|TCE, Interception\|TCE (7 total) |

The XPHB Fighting Style classFeature does **not** use `options`/`refOptionalfeature`. It uses `refFeat: "Blessed Warrior|XPHB"` inline and defers to `featProgression` (category `["FS","FS:P"]`) for the full pool. This requires separate handling.

### Fighting Style Detection

- **PHB:** `optionalfeatureProgression[0].featureType = ["FS:P"]`, progression `{2: 1}`. The classFeature `Fighting Style (PHB, L2)` contains `type: "options"` with 7 `refOptionalfeature` entries. The options block is stored in `class_features.entries`. **`optionalfeatureProgression` is not imported** — the app must scan feature entries to detect the options block.
- **XPHB:** `featProgression[0].category = ["FS", "FS:P"]`, progression `{2: 1}`. No options block in classFeature entries. The feat pool is resolved differently (feat category lookup). **`featProgression` is not imported.** This is a gap — the XPHB Fighting Style mechanism is entirely absent from the imported data.

---

## C. Subclasses (Sacred Oaths)

### Summary Table

| Subclass | Source | classSource | Edition | _copy of | Features (refs) | additionalSpells | spellcastingAbility override |
|---|---|---|---|---|---|---|---|
| Oath of Devotion | PHB | PHB | classic | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of Devotion | PHB | XPHB | classic | PHB/PHB | 4 (inherited) | yes (inherited) | none |
| Oath of the Ancients | PHB | PHB | classic | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of the Ancients | PHB | XPHB | classic | PHB/PHB | 4 (inherited) | yes (inherited) | none |
| Oath of Vengeance | PHB | PHB | classic | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of Vengeance | PHB | XPHB | classic | PHB/PHB | 4 (inherited) | yes (inherited) | none |
| Oathbreaker | DMG | PHB | classic | — | 4 | yes (5 levels, 10 spells) | none |
| Oathbreaker | DMG | XPHB | classic | DMG/PHB | 4 (inherited) | yes (inherited) | none |
| Oath of the Crown | SCAG | PHB | classic | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of the Crown | SCAG | XPHB | classic | SCAG/PHB | 4 (inherited) | yes (inherited) | none |
| Oath of Conquest | XGE | PHB | classic | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of Conquest | XGE | XPHB | classic | XGE/PHB | 4 (inherited) | yes (inherited) | none |
| Oath of Redemption | XGE | PHB | classic | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of Redemption | XGE | XPHB | classic | XGE/PHB | 4 (inherited) | yes (inherited) | none |
| Oath of Glory | TCE | PHB | classic | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of Glory | TCE | XPHB | classic | TCE/PHB | 4 (inherited) | yes (inherited) | none |
| Oath of the Watchers | TCE | PHB | classic | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of the Watchers | TCE | XPHB | classic | TCE/PHB | 4 (inherited) | yes (inherited) | none |
| Oath of Devotion | XPHB | XPHB | one | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of Glory | XPHB | XPHB | one | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of the Ancients | XPHB | XPHB | one | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of Vengeance | XPHB | XPHB | one | — | 4 | yes (5 levels, 10 spells) | none |
| Oath of the Noble Genies | FRHoF | XPHB | one | — | 4 | yes (5 levels, **11 spells**) | none |

**Total: 23 subclass entries** (14 originals + 9 _copy cross-class-source entries).

No subclass overrides `spellcastingAbility`.

### Subclass Feature Levels (all original subclasses)

All original subclasses follow the same 4-feature pattern at levels: **3, 7, 15, 20** — matching the PHB/XPHB `gainSubclassFeature` entries in classFeatures.

### _copy Resolution

Nine subclasses (PHB/XGE/TCE/SCAG/DMG originals) are copied to `classSource: XPHB` via `_copy`. The `_copy` blocks contain no `_mod` operations — pure structural copies. After resolution these have:
- `className: Paladin`, `classSource: XPHB` (overridden by child)
- `edition: "classic"` (inherited from base, no override — this is correct per import script logic)
- `additionalSpells` and `subclassFeatures` inherited from base
- `page`, `srd`, `basicRules`, `reprintedAs` fields **deleted** (in `_preserve` but not in child entity — import script `resolveCopy` deletes these as intended)

Import upsert key for subclasses: `[name, source, className, classSource]` — ensures PHB/PHB and PHB/XPHB copies are stored as distinct records.

### Oath Spells (additionalSpells)

All subclasses provide oath spells via `additionalSpells[0].prepared` at levels 3, 5, 9, 13, 17 (2 spells each), matching the game rule that oath spells are unlocked at each tier.

**Exception:** Oath of the Noble Genies (FRHoF) has **3 spells at level 3** (`chromatic orb`, `elementalism`, `thunderous smite`) — total 11 spells. The import script imports `sc.additionalSpells?.[0]` — the entire prepared map — so all 11 are captured correctly.

**Notable oath spell differences (XPHB editions):**
- Oath of Devotion XPHB L3: `shield of faith` replaces `sanctuary` (PHB)
- Oath of Devotion XPHB L5: `aid` replaces `lesser restoration` (PHB)
- Oath of Glory XPHB L17: `legend lore` + `yolande's regal presence` replace `commune` + `flame strike` (PHB/TCE)
- All XPHB oath spell refs include `|xphb` source suffix (e.g. `"protection from evil and good|xphb"`)

**Import script mapping:** `sc.additionalSpells?.[0] || null` — imports only the first element of the additionalSpells array. All Paladin subclasses have exactly one element, so this is correct.

### Subclass Features with options blocks

**None.** No subclass feature in the file uses a `type: "options"` block. All Channel Divinity options within subclasses are exposed via `refSubclassFeature` references.

---

## D. Spell Data

### casterProgression

| Edition | Value | Meaning |
|---|---|---|
| PHB | `"1/2"` | Half-caster: spell slots start at L2, max 5th-level spells |
| XPHB | `"artificer"` | Artificer-style half-caster: spell slots start at L1 (same slot count as artificer) |

The PHB value `"1/2"` is the standard half-caster progression. The XPHB value `"artificer"` represents the same progression shape but shifted one level earlier (slots at L1 instead of L2). Both are correctly stored via `c.casterProgression`.

### Spell Slot Table Verification (PHB)

Stored in `spellSlotProgression` via `classTableGroups[0].rowsSpellProgression` (20 rows, 5 columns):

| Level | 1st | 2nd | 3rd | 4th | 5th |
|---|---|---|---|---|---|
| 1 | 0 | 0 | 0 | 0 | 0 |
| 2 | 2 | 0 | 0 | 0 | 0 |
| 5 | 4 | 2 | 0 | 0 | 0 |
| 9 | 4 | 3 | 2 | 0 | 0 |
| 13 | 4 | 3 | 3 | 1 | 0 |
| 17 | 4 | 3 | 3 | 3 | 1 |
| 20 | 4 | 3 | 3 | 3 | 2 |

Matches PHB table. Status: **OK**.

### Spell Slot Table Verification (XPHB)

Stored in `spellSlotProgression` via `classTableGroups[1].rowsSpellProgression` (20 rows, 5 columns). First `classTableGroup` (index 0) stores Channel Divinity and Prepared Spells columns — import script's `.find((g) => g.rowsSpellProgression)` correctly selects the second group.

| Level | 1st | 2nd | 3rd | 4th | 5th |
|---|---|---|---|---|---|
| 1 | 2 | 0 | 0 | 0 | 0 |
| 2 | 2 | 0 | 0 | 0 | 0 |
| 5 | 4 | 2 | 0 | 0 | 0 |
| 17 | 4 | 3 | 3 | 3 | 1 |
| 20 | 4 | 3 | 3 | 3 | 2 |

Matches XPHB table. Status: **OK**.

### Oath Spell Lists in additionalSpells

All 14 original subclasses have `additionalSpells[0].prepared` with oath spells at levels 3/5/9/13/17. These are imported as `subclasses.additionalSpells` (raw JSON object). The import correctly takes index `[0]` — there is always exactly one element in the array for all Paladin subclasses.

---

## E. Issues and Gaps

### Critical

None identified. Core class mechanics (hitDie, saves, spell progression, subclasses, oath spells) are correctly mapped.

### Notable Gaps (import record missing fields)

1. **`optionalfeatureProgression` not imported (PHB).** The PHB Fighting Style pool metadata (`featureType: ["FS:P"]`, `progression: {2: 1}`) is absent from the `classes` record. The app can detect Fighting Style via the `options` block in the `class_features` entry for Fighting Style (PHB, L2), but must parse raw entries JSON to do so. The count (1) and the pool type (FS:P) are embedded there.

2. **`featProgression` not imported (XPHB).** The XPHB Fighting Style and Epic Boon feat progression descriptors are not in the `classes` record. XPHB Fighting Style uses the feat system (`refFeat`, not `refOptionalfeature`), so the PHB `options` block detection logic does not apply. The app has no imported signal for XPHB Fighting Style as a feat-selection event. This needs a dedicated handling path.

3. **XPHB base class `additionalSpells` not imported.** `divine smite|xphb` (L2) and `find steed|xphb` (L5) are always-prepared spells described in `additionalSpells` on the XPHB class object. These are not imported into `classes`. They are instead described in the `Paladin's Smite` and `Faithful Steed` classFeature entries — the app must parse those feature texts to surface them.

4. **`preparedSpells` formula not imported (PHB).** The string `"<$level$> / 2 + <$cha_mod$>"` is not imported. The app must compute prepared spell count from class level and CHA modifier. For XPHB, `preparedSpellsProgression` is imported as an array, which is sufficient.

### Informational

- The XPHB `casterProgression` value `"artificer"` is non-standard for a paladin. App code that switches on `casterProgression` must handle `"artificer"` as equivalent to `"1/2"` but with slots starting at L1 — or use `spellSlotProgression` directly (which is the more robust approach).
- Nine `_copy` subclasses (classSource=XPHB) correctly inherit content from their PHB/XGE/TCE/SCAG/DMG originals. Their `edition` field will be `"classic"` after resolution, which is correct — these are classic-rules oaths bridged to the XPHB class.
- No subclass uses `spellcastingAbility` override — all Paladin subclasses cast via CHA, inherited from the base class.
- Oathbreaker (DMG) subclass feature entries reference sub-features (`Oathbreaker Spells`, `Channel Divinity`, `Control Undead`, `Dreadful Aspect`) via `refSubclassFeature` rather than inline text. These sub-features are present in `subclassFeature[]` and will be imported as separate `class_features` records with `isSubclassFeature: true`.
