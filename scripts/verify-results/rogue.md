# Rogue Class Verification Report

**Source file:** `data/5etools-src/data/class/class-rogue.json`
**Date:** 2026-03-07

---

## A. Class Basics

The JSON contains two `class` entries: `Rogue|PHB` (classic/2014) and `Rogue|XPHB` (one/2024).

### Rogue|PHB (classic)

| Field | JSON value | Import script maps to | Notes |
|---|---|---|---|
| hitDie | `hd.faces = 8` | `hitDie: c.hd?.faces \|\| 8` | Correct: d8 |
| savingThrows | `proficiency: ["dex", "int"]` | `savingThrows: c.proficiency \|\| []` | Correct: Dexterity, Intelligence |
| spellcastingAbility | not present | `spellcastingAbility: c.spellcastingAbility \|\| null` | Correct: null (base class has no spellcasting) |
| casterProgression | not present | `casterProgression: c.casterProgression \|\| null` | Correct: null |
| armorProficiencies | `startingProficiencies.armor: ["light"]` | `armorProficiencies: c.startingProficiencies?.armor \|\| []` | Correct: light |
| weaponProficiencies | `["simple", hand crossbows, longswords, rapiers, shortswords]` | `weaponProficiencies: c.startingProficiencies?.weapons \|\| []` | Correct: 5 entries |
| toolProficiencies | `["{@item thieves' tools|PHB}"]` | `toolProficiencies: c.startingProficiencies?.tools \|\| []` | Correct |
| skillChoices | `choose: {from: 11 skills, count: 4}` | `skillChoices: parseSkillChoices(...)` | Correct: pick 4 from 11 skills |
| subclassTitle | `"Roguish Archetype"` | `subclassTitle: c.subclassTitle \|\| "Subclass"` | Correct |
| multiclassing req | `dex: 13` | `multiclassing: c.multiclassing \|\| null` | Correct |

### Rogue|XPHB (one/2024)

| Field | JSON value | Import script maps to | Notes |
|---|---|---|---|
| hitDie | `hd.faces = 8` | `hitDie: c.hd?.faces \|\| 8` | Correct: d8 |
| savingThrows | `proficiency: ["dex", "int"]` | `savingThrows: c.proficiency \|\| []` | Correct: Dexterity, Intelligence |
| spellcastingAbility | not present | `spellcastingAbility: null` | Correct: null |
| casterProgression | not present | `casterProgression: null` | Correct: null |
| armorProficiencies | `["light"]` | Correct | |
| weaponProficiencies | `["simple", "Martial weapons that have the Finesse or Light property"]` | Correct: 2 entries (simple + filtered martial) | XPHB uses a filter string for martial weapons |
| weaponProficiencies (structured) | `weaponProficiencies: [{simple: true, all: {fromFilter: "type=martial weapon\|property=light;finesse"}}]` | Not mapped — import uses `weapons` text array only | The structured `weaponProficiencies` object is not read by the importer; only the human-readable `weapons` text array |
| subclassTitle | `"Rogue Subclass"` | Correct | |
| featProgression | `[{name: "Epic Boon", category: ["EB"], progression: {19: 1}}]` | Not mapped — no `featProgression` field in import record | XPHB-only field; not imported |

---

## B. Class Features (Levels 1-20)

### Rogue|PHB classFeatures array (20 entries + 1 optional variant)

| Level | Feature | gainSubclassFeature | Notes |
|---|---|---|---|
| 1 | Expertise | - | |
| 1 | Sneak Attack | - | |
| 1 | Thieves' Cant | - | |
| 2 | Cunning Action | - | |
| 3 | Roguish Archetype | yes | Subclass trigger |
| 3 | Steady Aim (TCE) | - | `isClassFeatureVariant: true` — optional feature |
| 4 | Ability Score Improvement | - | |
| 5 | Uncanny Dodge | - | |
| 6 | Expertise | - | Second Expertise pick |
| 7 | Evasion | - | |
| 8 | Ability Score Improvement | - | |
| 9 | Roguish Archetype feature | yes | Subclass trigger |
| 10 | Ability Score Improvement | - | |
| 11 | Reliable Talent | - | |
| 12 | Ability Score Improvement | - | |
| 13 | Roguish Archetype feature | yes | Subclass trigger |
| 14 | Blindsense | - | |
| 15 | Slippery Mind | - | |
| 16 | Ability Score Improvement | - | |
| 17 | Roguish Archetype feature | yes | Subclass trigger |
| 18 | Elusive | - | |
| 19 | Ability Score Improvement | - | |
| 20 | Stroke of Luck | - | |

Subclass feature slots at levels: 3, 9, 13, 17 (4 total).

### Rogue|XPHB classFeatures array

| Level | Feature | gainSubclassFeature | Notes |
|---|---|---|---|
| 1 | Expertise | - | |
| 1 | Sneak Attack | - | |
| 1 | Thieves' Cant | - | |
| 1 | Weapon Mastery | - | New in XPHB |
| 2 | Cunning Action | - | |
| 3 | Rogue Subclass | yes | Subclass trigger |
| 3 | Steady Aim | - | Now a core feature (not variant) |
| 4 | Ability Score Improvement | - | |
| 5 | Cunning Strike | - | New in XPHB |
| 5 | Uncanny Dodge | - | Moved from level 5 (same) |
| 6 | Expertise | - | |
| 7 | Evasion | - | |
| 7 | Reliable Talent | - | Moved from level 11 to 7 |
| 8 | Ability Score Improvement | - | |
| 9 | Subclass Feature | yes | Subclass trigger |
| 10 | Ability Score Improvement | - | |
| 11 | Improved Cunning Strike | - | New in XPHB |
| 12 | Ability Score Improvement | - | |
| 13 | Subclass Feature | yes | Subclass trigger |
| 14 | Devious Strikes | - | New in XPHB; adds Daze/Knock Out/Obscure Cunning Strike options |
| 15 | Slippery Mind | - | Now grants Wis + Cha saves (PHB was Wis only) |
| 16 | Ability Score Improvement | - | |
| 17 | Subclass Feature | yes | Subclass trigger |
| 18 | Elusive | - | |
| 19 | Epic Boon | - | Replaces PHB ASI at 19 |
| 20 | Stroke of Luck | - | |

Subclass feature slots at levels: 3, 9, 13, 17 (4 total, same as PHB).

### classFeature entries with `type: "options"` or `refClassFeature` in entries

#### PHB features — no `type: "options"` blocks at class level (all options are plain text).

#### XPHB features with options/refs in entries:

| Feature | Level | Refs / Type |
|---|---|---|
| Cunning Strike | 5 | `type: "entries"` containing 3x `refClassFeature`: Poison (Cost: 1d6), Trip (Cost: 1d6), Withdraw (Cost: 1d6) |
| Devious Strikes | 14 | `type: "entries"` containing 3x `refClassFeature`: Daze (Cost: 2d6), Knock Out (Cost: 6d6), Obscure (Cost: 3d6) |

These sub-features (Poison, Trip, Withdraw, Daze, Knock Out, Obscure) are separate `classFeature` records in the JSON at their respective levels. The import script stores the raw `entries` array and does not specially process `refClassFeature` refs — they remain as inline references in the stored JSON.

---

## C. All Subclasses (Roguish Archetypes)

The JSON contains 22 subclass entries total (including `_copy` entries that alias PHB subclasses under `classSource: "XPHB"`).

### Distinct subclasses by source:

| Subclass | Source | classSource | Edition | spellcastingAbility | casterProgression | additionalSpells | options blocks |
|---|---|---|---|---|---|---|---|
| Arcane Trickster | PHB | PHB | classic | int | 1/3 | yes (mage hand known at 3; expanded wizard spells by level) | None in subclassFeatures |
| Arcane Trickster | PHB | XPHB | classic | (via _copy) | (via _copy) | (via _copy) | — |
| Assassin | PHB | PHB | classic | null | null | none | None |
| Assassin | PHB | XPHB | classic | (via _copy) | (via _copy) | — | — |
| Thief | PHB | PHB | classic | null | null | none | None |
| Thief | PHB | XPHB | classic | (via _copy) | (via _copy) | — | — |
| Inquisitive | XGE | PHB | classic | null | null | none | None |
| Inquisitive | XGE | XPHB | classic | (via _copy) | (via _copy) | — | — |
| Mastermind | XGE | PHB | classic | null | null | none | None |
| Mastermind | XGE | XPHB | classic | (via _copy) | (via _copy) | — | — |
| Scout | XGE | PHB | classic | null | null | none | None |
| Scout | XGE | XPHB | classic | (via _copy) | (via _copy) | — | — |
| Swashbuckler | XGE | PHB | classic | null | null | none | None |
| Swashbuckler | XGE | XPHB | classic | (via _copy) | (via _copy) | — | — |
| Phantom | TCE | PHB | classic | null | null | none | None |
| Phantom | TCE | XPHB | classic | (via _copy) | (via _copy) | — | — |
| Soulknife | TCE | PHB | classic | null | null | none | None |
| Soulknife | TCE | XPHB | classic | (via _copy) | (via _copy) | — | — |
| Arcane Trickster | XPHB | XPHB | one | int | 1/3 | yes (mage hand known at 3; expanded wizard spells by level) | None in subclassFeatures |
| Assassin | XPHB | XPHB | one | null | null | none | None |
| Soulknife | XPHB | XPHB | one | null | null | none | None |
| Thief | XPHB | XPHB | one | null | null | none | None |
| Scion of the Three | FRHoF | XPHB | one | null (ability: "int" only in additionalSpells) | null | yes (innate cantrip choice at 3: minor illusion/blade ward/chill touch; ability: "int") | None |

### Subclass feature entries per subclass

#### Arcane Trickster|PHB (classSource: PHB)
Features (4 entries):
- Level 3: Arcane Trickster (refs Spellcasting + Mage Hand Legerdemain)
- Level 9: Magical Ambush
- Level 13: Versatile Trickster
- Level 17: Spell Thief

Level 3 subclassFeature contains `refSubclassFeature` for Spellcasting and Mage Hand Legerdemain — no `type: "options"` block.

#### Assassin|PHB (classSource: PHB)
Features (4 entries, 6 subclassFeature records):
- Level 3: Assassin (refs Assassinate + Bonus Proficiencies)
- Level 9: Infiltration Expertise
- Level 13: Impostor
- Level 17: Death Strike

#### Thief|PHB (classSource: PHB)
Features (4 entries, 6 subclassFeature records):
- Level 3: Thief (refs Fast Hands + Second-Story Work)
- Level 9: Supreme Sneak
- Level 13: Use Magic Device
- Level 17: Thief's Reflexes

#### Inquisitive|XGE (classSource: PHB)
Features (4 entries, 7 subclassFeature records):
- Level 3: Inquisitive (refs Ear for Deceit + Eye for Detail + Insightful Fighting)
- Level 9: Steady Eye
- Level 13: Unerring Eye
- Level 17: Eye for Weakness

#### Mastermind|XGE (classSource: PHB)
Features (4 entries, 6 subclassFeature records):
- Level 3: Mastermind (refs Master of Intrigue + Master of Tactics)
- Level 9: Insightful Manipulator
- Level 13: Misdirection
- Level 17: Soul of Deceit

#### Scout|XGE (classSource: PHB)
Features (4 entries, 6 subclassFeature records):
- Level 3: Scout (refs Skirmisher + Survivalist)
- Level 9: Superior Mobility
- Level 13: Ambush Master
- Level 17: Sudden Strike

#### Swashbuckler|XGE (classSource: PHB)
Features (4 entries, 6 subclassFeature records):
- Level 3: Swashbuckler (refs Fancy Footwork + Rakish Audacity)
- Level 9: Panache
- Level 13: Elegant Maneuver
- Level 17: Master Duelist

#### Phantom|TCE (classSource: PHB)
Features (4 entries, 6 subclassFeature records):
- Level 3: Phantom (refs Whispers of the Dead + Wails from the Grave)
- Level 9: Tokens of the Departed
- Level 13: Ghost Walk
- Level 17: Death's Friend

#### Soulknife|TCE (classSource: PHB)
Features (4 entries, 8 subclassFeature records):
- Level 3: Soulknife (refs Psionic Power + Psychic Blades)
  - Psionic Power contains **`type: "options"`** block with 2 refs: Psi-Bolstered Knack, Psychic Whispers
- Level 9: Soul Blades
  - Soul Blades contains **`type: "options"`** block with 2 refs: Homing Strikes, Psychic Teleportation
- Level 13: Psychic Veil
- Level 17: Rend Mind

#### Arcane Trickster|XPHB (classSource: XPHB)
Features (4 entries):
- Level 3: Arcane Trickster (refs Spellcasting + Mage Hand Legerdemain)
- Level 9: Magical Ambush
- Level 13: Versatile Trickster
- Level 17: Spell Thief

spellcastingAbility: `"int"`, casterProgression: `"1/3"`. additionalSpells: known mage hand at 3 + expanded wizard spells.

#### Assassin|XPHB (classSource: XPHB)
Features (4 entries, 6 subclassFeature records):
- Level 3: Assassin (refs Assassinate + Assassin's Tools)
- Level 9: Infiltration Expertise
- Level 13: Envenom Weapons (replaces PHB's Impostor)
- Level 17: Death Strike

#### Soulknife|XPHB (classSource: XPHB)
Features (4 entries, 8 subclassFeature records):
- Level 3: Soulknife (refs Psionic Power + Psychic Blades)
  - Psionic Power contains inline `refSubclassFeature` for Psi-Bolstered Knack and Psychic Whispers (not a `type: "options"` block — uses direct refs)
- Level 9: Soul Blades (refs Homing Strikes + Psychic Teleportation — not a `type: "options"` block)
- Level 13: Psychic Veil
- Level 17: Rend Mind

#### Thief|XPHB (classSource: XPHB)
Features (4 entries, 6 subclassFeature records):
- Level 3: Thief (refs Fast Hands + Second-Story Work)
- Level 9: Supreme Sneak (adds Stealth Attack Cunning Strike option)
- Level 13: Use Magic Device (now grants attunement/charges/scrolls benefits)
- Level 17: Thief's Reflexes

#### Scion of the Three|FRHoF (classSource: XPHB)
Features (4 entries, 5 subclassFeature records):
- Level 3: Scion of the Three (refs Bloodthirst + Dread Allegiance)
- Level 9: Strike Fear
- Level 13: Aura of Malevolence
- Level 17: Dread Incarnate

additionalSpells: `innate` at level 3 — choose 1 of minor illusion/blade ward/chill touch; `ability: "int"`.

**Import script note:** The importer stores only `additionalSpells?.[0]` (first element). Both Arcane Trickster and Scion of the Three have exactly one element in the `additionalSpells` array, so this is correctly captured.

---

## D. Spell Data / Caster Progression

### Base class
- Rogue|PHB: `spellcastingAbility = null`, `casterProgression = null` — correct, no spellcasting.
- Rogue|XPHB: `spellcastingAbility = null`, `casterProgression = null` — correct, no spellcasting.

### Arcane Trickster|PHB
- `spellcastingAbility: "int"`, `casterProgression: "1/3"`
- `cantripProgression`: 20 values, 0/0/2/2/2/2/2/2/2/3/3/3/3/3/3/3/3/3/3/3
- `spellsKnownProgression`: 20 values starting at 0/0/3/4...13
- `subclassTableGroups` with `rowsSpellProgression`: spell slots for 4 levels (1st–4th), up to 4/3/3/1 at level 20
- Import maps: `spellcastingAbility: sc.spellcastingAbility \|\| null` — **correctly captured on subclass record**
- `casterProgression` is NOT mapped on the subclass record — the import script does not include `casterProgression` in the subclass record. This is a **gap**: the 1/3 caster progression is not stored on the subclass in PocketBase.

### Arcane Trickster|XPHB
- `spellcastingAbility: "int"`, `casterProgression: "1/3"`
- `preparedSpellsProgression` instead of `spellsKnownProgression` (2024 rule change: prepared spells instead of known)
- `preparedSpellsChange: "level"` — changes on level up
- `cantripProgression`: same shape as PHB version
- Import maps: `spellcastingAbility` captured, `casterProgression` NOT stored on subclass record (same gap as PHB)
- `preparedSpellsProgression` is NOT mapped on subclass record (only mapped for classes: `c.preparedSpellsProgression`)

### All other subclasses
No `spellcastingAbility` or `casterProgression` fields. Correctly resolve to null via importer.

### Scion of the Three
- `additionalSpells[0].ability: "int"` — this is a spellcasting ability indicator for innate spells only, not full subclass spellcasting.
- No `spellcastingAbility` field on the subclass record itself. Import will set `spellcastingAbility: null`.
- The `ability` field in `additionalSpells` is stored in the raw `additionalSpells?.[0]` object, so it is preserved in the stored JSON.

---

## E. Import Script Mapping Issues

### Findings / Gaps

1. **Subclass `casterProgression` not stored:** The import script builds the subclass record without a `casterProgression` field. Arcane Trickster (PHB and XPHB) has `casterProgression: "1/3"` on the subclass, but this is not written to PocketBase. The class-level `casterProgression` is correctly null for the Rogue base class. This affects spell slot calculation at the subclass level.

2. **Subclass `preparedSpellsProgression` not stored:** XPHB Arcane Trickster uses `preparedSpellsProgression` (not `spellsKnownProgression`). The importer maps `preparedSpellsProgression` only for the class record, not for subclass records.

3. **XPHB weaponProficiencies structured data:** The `weaponProficiencies` array (structured with `fromFilter`) is present in XPHB Rogue but the importer only maps the human-readable `weapons` text array. The filter-based weapon selection is not parsed into structured data.

4. **`featProgression` not stored:** XPHB Rogue has `featProgression` (Epic Boon at level 19). This field is not present in the import record and is not stored.

5. **`_copy` alias subclasses (PHB subclasses under classSource: XPHB):** The JSON contains 8 `_copy` subclass entries that alias PHB subclasses for `classSource: "XPHB"`. The `resolveAllCopies` function in the importer handles these and they resolve correctly. However, note these copies use `_preserve` to keep `page`, `otherSources`, `referenceSources`, `srd`, `basicRules`, and `reprintedAs` from the base entity — the resolved copy will have `classSource: "XPHB"` as the only differentiating field.

6. **Soulknife TCE `type: "options"` in subclassFeature entries:** The Psionic Power and Soul Blades features use `type: "options"` with `refSubclassFeature` refs. These are stored as raw `entries` JSON — the options structure is preserved but not extracted into a structured field.

7. **Cunning Strike / Devious Strikes `refClassFeature` refs:** Sub-feature options (Poison, Trip, Withdraw, Daze, Knock Out, Obscure) are stored as inline `refClassFeature` refs in the `entries` array. They are also stored as separate `classFeature` records. The importer stores both correctly, but the cross-reference linking is not resolved at import time — the character sheet will need to resolve refs at render time.

### What is correctly mapped

- hitDie: d8 — correct for both editions
- savingThrows: [dex, int] — correct
- spellcastingAbility on base class: null — correct
- casterProgression on base class: null — correct
- armorProficiencies: light — correct
- weaponProficiencies (text): correct
- toolProficiencies: thieves' tools — correct
- skillChoices: 4 from 11 skills (PHB) / 4 from 10 skills (XPHB, "performance" dropped) — correctly picked up via `parseSkillChoices`
- subclassTitle: "Roguish Archetype" (PHB) / "Rogue Subclass" (XPHB) — correct
- Subclass spellcastingAbility (Arcane Trickster): "int" — correctly stored
- additionalSpells first element: stored correctly for Arcane Trickster and Scion of the Three
- All 20+ classFeature and subclassFeature records: all entries imported as separate records with correct level, className, classSource, and subclassName fields
