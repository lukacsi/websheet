# Cleric Verification Report

## Class Basics

Two class entries exist in class-cleric.json: `Cleric|PHB` (edition: classic) and `Cleric|XPHB` (edition: one).

### PHB (classic)

Import script mapping (`c.hd?.faces`, `c.proficiency`, `c.spellcastingAbility`, `c.casterProgression`, `c.startingProficiencies?.armor`, `c.startingProficiencies?.weapons`):

- hitDie: 8 (hd.faces = 8) ✓
- savingThrows: ["wis", "cha"] (proficiency field) ✓
- spellcastingAbility: "wis" ✓
- casterProgression: "full" ✓
- armorProficiencies: ["light", "medium", "shield"] ✓
- weaponProficiencies: ["simple"] ✓

### XPHB (one)

- hitDie: 8 ✓
- savingThrows: ["wis", "cha"] ✓
- spellcastingAbility: "wis" ✓
- casterProgression: "full" ✓
- armorProficiencies: ["light", "medium", "shield"] ✓
- weaponProficiencies: ["simple"] ✓

All import mappings correctly read from source JSON fields. No issues.

---

## Feature Choices

Only one `type: "options"` block exists in all classFeature entries (the rest use plain `refClassFeature` refs without an options wrapper).

| Feature | Level | Source | Count | Refs | Status |
|---------|-------|--------|-------|------|--------|
| Divine Order | 1 | XPHB | 1 | Protector\|Cleric\|XPHB\|1\|XPHB, Thaumaturge\|Cleric\|XPHB\|1\|XPHB | OK — correct choice feature |

### Note: Blessed Strikes (XPHB, level 7)

`Blessed Strikes` presents two options (`Divine Strike|Cleric|XPHB|7` and `Potent Spellcasting|Cleric|XPHB|7`) as `refClassFeature` entries inside a `type: "entries"` block — **not** wrapped in `type: "options"`. The text says "you gain one of the following options of your choice," making this a player choice. However, the JSON does not use the `type: "options"` pattern. This is an inconsistency in the source data — the import script preserves entries as-is, so the character sheet would need to handle this case in rendering logic if it wants to surface it as a choice.

No `type: "options"` blocks appear in subclassFeature entries.

---

## Subclasses (43 total entries — 16 canonical PHB-class + 5 XPHB-native + 22 _copy aliases)

The file contains 43 subclass entries. Structure:
- 16 canonical entries with `classSource: PHB` (one per domain name, not `_copy`)
- 22 `_copy` entries with `classSource: XPHB` mirroring the PHB-class domains for the 2024 class
- 5 XPHB-native entries (new 2024 subclasses with `classSource: XPHB`, not `_copy`)

The import script calls `resolveAllCopies()` before importing, so `_copy` entries are resolved to their full data. All 43 entries will be imported.

### PHB-class Canonical Subclasses (16)

| Subclass | Source | Features (levels) | Spell List | Choice Features | Issues |
|----------|--------|-------------------|------------|-----------------|--------|
| Knowledge Domain | PHB | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| Life Domain | PHB | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| Light Domain | PHB | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9; known: light#c | None | None |
| Nature Domain | PHB | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9; known: choose druid cantrip | None | None |
| Tempest Domain | PHB | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| Trickery Domain | PHB | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| War Domain | PHB | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| Death Domain | DMG | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9; known: choose necromancy cantrip (count=1) | None | None |
| Arcana Domain | SCAG | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9,17; known: choose wizard cantrip ×2 | None | None |
| Ambition Domain (PSA) | PSA | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| Knowledge Domain (PSA) | PSA | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | isReprinted=true |
| Solidarity Domain (PSA) | PSA | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| Strength Domain (PSA) | PSA | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9; known: choose druid cantrip | None | None |
| Zeal Domain (PSA) | PSA | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| Forge Domain | XGE | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| Grave Domain | XGE | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9; known: spare the dying#c | None | None |
| Order Domain | TCE | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| Peace Domain | TCE | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |
| Twilight Domain | TCE | 1, 2, 6, 8(+TCE), 17 | prepared: 1,3,5,7,9 | None | None |

Note: "8(+TCE)" = level 8 has both a base feature (Divine Strike or Potent Spellcasting) and a TCE optional variant (Blessed Strikes). Import stores `additionalSpells?.[0]` — single-block pattern matches all domains.

### XPHB-native Subclasses (5)

These are 2024 PHB subclasses with fresh feature lists (subclass features start at level 3, matching the XPHB class's subclass gate).

| Subclass | Source | Features (levels) | Spell List | Issues |
|----------|--------|-------------------|------------|--------|
| Life Domain | XPHB | 3, 6, 17 | prepared: 3,5,7,9 (starts at 3, not 1) | None |
| Light Domain | XPHB | 3, 6, 17 | prepared: 3,5,7,9 | None |
| Trickery Domain | XPHB | 3, 6, 17 | prepared: 3,5,7,9 | None |
| War Domain | XPHB | 3, 6, 17 | prepared: 3,5,7,9 | None |
| Knowledge Domain | FRHoF | 3, 6, 17 | prepared: 3,5,7,9 | None |

**Note on spellcastingAbility override:** No subclass in this file sets `spellcastingAbility` at the subclass level. All inherit the class-level `"wis"`.

---

## Spell Data

### PHB (classic)

- casterProgression: "full" ✓
- cantripProgression: 20 values — [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5] ✓
- spellSlotProgression: 20 rows × 9 spell levels extracted from `classTableGroups[].rowsSpellProgression` ✓
  - Level 1: [2,0,0,0,0,0,0,0,0]
  - Level 20: [4,3,3,3,3,2,2,1,1]
- preparedSpells formula: `<$level$> + <$wis_mod$>` (string formula, imported as `preparedSpellsProgression: null`)

### XPHB (one)

- casterProgression: "full" ✓
- cantripProgression: 20 values — [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5] ✓ (same as PHB)
- spellSlotProgression: 20 rows × 9 spell levels ✓
  - Level 1: [2,0,0,0,0,0,0,0,0]
  - Level 20: [4,3,3,3,3,2,2,1,1]
- preparedSpellsProgression: explicit array [4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22] — correctly imported via `c.preparedSpellsProgression`

Import reads `classTableGroups?.find(g => g.rowsSpellProgression)?.rowsSpellProgression`. Both PHB and XPHB entries have `rowsSpellProgression` in the second `classTableGroups` entry (after cantrips/other columns). ✓

---

## Issues Found

### Issue 1 — Blessed Strikes (XPHB level 7) missing `type: "options"` wrapper

**Location:** classFeature `Blessed Strikes|Cleric|XPHB|7`

**Description:** This feature presents a choose-one between `Divine Strike` and `Potent Spellcasting` using plain `refClassFeature` refs inside a `type: "entries"` block, not a `type: "options"` block. The feature text says "You gain one of the following options of your choice," but the JSON structure does not signal it as a player choice the same way Divine Order does.

**Impact:** If the character sheet detects choice features by scanning for `type: "options"`, it will miss this feature. A separate rendering path or feature-name check for Blessed Strikes would be needed.

**Source:** This is a quirk of the 5e.tools source data, not an import script bug.

### Issue 2 — Import only stores `additionalSpells?.[0]`

**Location:** `importClasses()`, subclass record, line 624

```ts
additionalSpells: sc.additionalSpells?.[0] || null,
```

**Description:** All Cleric subclasses in this file have exactly one `additionalSpells` block, so `[0]` captures everything correctly. However, if a subclass ever had multiple blocks, only the first would be stored. Not a problem for current Cleric data but worth noting as a structural limitation.

**Impact:** None for current Cleric data. ✓

### Issue 3 — Arcana Domain additionalSpells at level 17

**Location:** Arcana Domain (SCAG, classSource=PHB), `additionalSpells[0].prepared["17"]`

**Description:** The Arcana Domain has domain spells at level 17 — four "choose from Wizard spell list" entries at levels 6, 7, 8, and 9. This is unusual (all other domains cap at level 9 cleric = 5th level slots). The import stores the entire `additionalSpells[0]` block verbatim, so this data is preserved. However, the character sheet would need to handle the non-standard `"17"` key and the `choose` object format at that level.

**Impact:** Potential rendering gap for Arcana Domain's level 17 "Arcane Mastery" spell expansion. Not an import bug — data is present.

### Issue 4 — `_copy` subclasses with no `edition` field

**Description:** The 22 `_copy` subclass entries (PHB domains duplicated for XPHB class) do not have an `edition` field. The import script calls `edition(sc.source, sc.edition)` — the `edition()` helper uses `sc.source` to determine edition when `sc.edition` is absent. After `resolveAllCopies()` resolution, these entries inherit the canonical subclass's data. The resolved copy will have the source of the original (e.g., `"PHB"`) which maps to `"classic"` edition. This is correct behavior.

**Impact:** None — resolved correctly. ✓

### Issue 5 — Nature Domain and Strength Domain (PSA) cantrip choices use `count` omitted (default 1)

**Description:** `Nature Domain` and `Strength Domain (PSA)` have `known["1"]["_"][{choose: "level=0|class=Druid"}]` without an explicit `count` field (unlike Death Domain which has `count: 1` explicitly, and Arcana which has `count: 2`). The import stores the raw `additionalSpells[0]` block, so the data is present. The character sheet's cantrip-choice UI would need to default `count` to 1 when absent.

**Impact:** Minor — character sheet should handle missing `count` as defaulting to 1. Not an import bug.

---

## Summary

| Area | Status |
|------|--------|
| Class basics (PHB) | All fields map correctly ✓ |
| Class basics (XPHB) | All fields map correctly ✓ |
| classFeature options detection | Divine Order (XPHB L1) correctly uses `type: "options"` ✓ |
| Blessed Strikes (XPHB L7) | Choice feature NOT wrapped in `type: "options"` — needs separate handling |
| Subclass count | 43 entries (19 canonical PHB-class, 5 XPHB-native, 22 _copy aliases) |
| All subclass domain spell lists | Present and correctly structured ✓ |
| Cantrip choices in domain spells | Present (Nature, Death, Arcana, Grave, Strength PSA) — count field may be absent ✓ |
| spellcastingAbility override | None — all subclasses inherit class-level "wis" ✓ |
| Spell slot progression | 20 levels × 9 spell levels, both editions ✓ |
| cantripProgression | 20 values, correct breakpoints (3→4 at L4, 4→5 at L10) ✓ |
| preparedSpellsProgression | PHB: formula string (null in DB), XPHB: explicit array ✓ |
