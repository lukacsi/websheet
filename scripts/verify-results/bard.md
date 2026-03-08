# Bard Verification Report

## Class Basics

Two class entries exist: PHB (classic edition) and XPHB (one edition).

### PHB Bard (classic)
- hitDie: 8 (hd.faces=8) — import: `c.hd?.faces || 8` ✓
- savingThrows: ["dex", "cha"] (proficiency) — import: `c.proficiency` ✓
- spellcastingAbility: "cha" ✓
- casterProgression: "full" ✓
- armorProficiencies: ["light"] — import: `c.startingProficiencies?.armor` ✓
- weaponProficiencies: ["simple", "{@item hand crossbow|phb|hand crossbows}", "{@item longsword|phb|longswords}", "{@item rapier|phb|rapiers}", "{@item shortsword|phb|shortswords}"] — import stores raw array with {@item} tags ✓

### XPHB Bard (one)
- hitDie: 8 (hd.faces=8) ✓
- savingThrows: ["dex", "cha"] ✓
- spellcastingAbility: "cha" ✓
- casterProgression: "full" ✓
- armorProficiencies: ["light"] ✓
- weaponProficiencies: ["simple"] (XPHB bard loses hand crossbow/longsword/rapier/shortsword from starting profs) ✓

### Tool Proficiency Parsing Note
The import calls `parseProfChoices(c.startingProficiencies?.tools)` first, then falls back to `parseProfChoicesFromText()`. The `tools` field contains string entries; the structured `toolProficiencies` field (which has `{ anyMusicalInstrument: 3 }`) is NOT used by the import. The fallback `parseProfChoicesFromText()` correctly parses:
- PHB: `"three {@item musical instrument|PHB|musical instruments} of your choice"` → `{ type: "anyMusicalInstrument", count: 3 }` ✓
- XPHB: `"Choose three {@item Musical Instrument|XPHB|Musical Instruments}"` → `{ type: "anyMusicalInstrument", count: 3 }` ✓

## Feature Choices

### PHB Class Features with `type: "options"` blocks
No class-level features (classFeature array) in the PHB Bard contain `type: "options"` blocks. Expertise and Magical Secrets are narrative/text features with no options refs.

### XPHB Class Features with `type: "options"` blocks
No class-level features in the XPHB Bard contain `type: "options"` blocks.

| Feature | Level | Count | Refs | Status |
|---------|-------|-------|------|--------|
| (none at class level) | — | — | — | N/A |

Options blocks are found only at the **subclassFeature** level (see Subclasses section).

## Subclasses (13 total unique, 19 entries including _copy variants)

### Unique Subclasses (non-_copy, by source)

| Subclass | Source | classSource | Features OK | Spell List | Choice Features | Issues |
|----------|--------|-------------|-------------|------------|-----------------|--------|
| College of Lore | PHB | PHB | 3 features (lvl 3,6,14) ✓ | known.6: 2x choose up to lvl 3 | refSubclassFeature x2 at lvl 3 | None |
| College of Valor | PHB | PHB | 3 features (lvl 3,6,14) ✓ | None | refSubclassFeature x2 at lvl 3 | None |
| College of Glamour | XGE | PHB | 3 features (lvl 3,6,14) ✓ | innate.6: ["command"] | refSubclassFeature x2 at lvl 3 | None |
| College of Swords | XGE | PHB | 3 features (lvl 3,6,14) ✓ | None | options block (Blade Flourish, no count); options block (Fighting Style, count=1) | See issues |
| College of Whispers | XGE | PHB | 3 features (lvl 3,6,14) ✓ | None | refSubclassFeature x2 at lvl 3 | None |
| College of Creation | TCE | PHB | 3 features (lvl 3,6,14) ✓ | None | refSubclassFeature x2 at lvl 3 | None |
| College of Eloquence | TCE | PHB | 4 features (lvl 3,6,6,14) ✓ | None | refSubclassFeature x2 at lvl 3 | Two features at level 6 |
| College of Spirits | VRGR | PHB | 3 features (lvl 3,6,14) ✓ | known.3: ["guidance#c"] | refSubclassFeature x3 at lvl 3 | None |
| College of Dance | XPHB | XPHB | 4 features (lvl 3,6,6,14) ✓ | None | refSubclassFeature x1 at lvl 3 (Dazzling Footwork, which refs 4 sub-features) | Two features at level 6; nested ref pattern |
| College of Glamour | XPHB | XPHB | 3 features (lvl 3,6,14) ✓ | prepared.3: charm person+mirror image; prepared.6+innate.6: command | refSubclassFeature x2 at lvl 3 | None |
| College of Lore | XPHB | XPHB | 3 features (lvl 3,6,14) ✓ | prepared.6: 2x choose from Cleric/Druid/Wizard up to lvl 3 | refSubclassFeature x2 at lvl 3 | None |
| College of Valor | XPHB | XPHB | 3 features (lvl 3,6,14) ✓ | None | refSubclassFeature x2 at lvl 3 | None |
| College of the Moon | FRHoF | XPHB | 3 features (lvl 3,6,14) ✓ | innate.3: choose 1 druid cantrip; prepared.6: moonbeam via daily/1e nested structure | refSubclassFeature x2 at lvl 3 | Unusual nested additionalSpells |

### _copy Subclasses (resolved at import time — no independent data)
These 6 entries copy their base and override `classSource` to `XPHB`:
- College of Lore (PHB → XPHB classSource)
- College of Valor (PHB → XPHB classSource)
- College of Glamour (XGE → XPHB classSource)
- College of Swords (XGE → XPHB classSource)
- College of Whispers (XGE → XPHB classSource)
- College of Creation (TCE → XPHB classSource)
- College of Eloquence (TCE → XPHB classSource)
- College of Spirits (VRGR → XPHB classSource)

All resolved by `resolveAllCopies()` in import. The `edition()` function uses `source` field (not classSource), so e.g. College of Swords always gets `edition="classic"` regardless of classSource. ✓

## Detailed: Options Blocks in Subclass Features

### College of Swords — Fighting Style (XGE, level 3)
```json
{
  "type": "options",
  "count": 1,
  "entries": [
    { "type": "refOptionalfeature", "optionalfeature": "Dueling" },
    { "type": "refOptionalfeature", "optionalfeature": "Two-Weapon Fighting" }
  ]
}
```
- count: 1, refs: 2 refOptionalfeature entries
- Status: Normal player choice ✓
- Note: This is controlled by `optionalfeatureProgression` on the subclass: `{ name: "Fighting Style", featureType: ["FS:B"], progression: { "3": 1 } }`

### College of Swords — Blade Flourish (XGE, level 3)
```json
{
  "type": "options",
  "entries": [
    { "type": "refSubclassFeature", "subclassFeature": "Defensive Flourish|Bard|PHB|Swords|XGE|3" },
    { "type": "refSubclassFeature", "subclassFeature": "Slashing Flourish|Bard|PHB|Swords|XGE|3" },
    { "type": "refSubclassFeature", "subclassFeature": "Mobile Flourish|Bard|PHB|Swords|XGE|3" }
  ]
}
```
- count: MISSING (no count field), refs: 3 refSubclassFeature entries
- Status: UNUSUAL — no `count` field means this is a "display all" listing, not a pick-N choice. These are always-available options (use one per turn). Correct per rules — all 3 flourishes are always available, not chosen at creation. ✓ (semantically correct, but unusual pattern compared to Fighting Style)

### College of Dance — Dazzling Footwork (XPHB, level 3)
The `Dazzling Footwork` feature body contains 4 `refSubclassFeature` entries (not inside a `type: "options"` wrapper):
- Dance Virtuoso, Unarmored Defense, Agile Strikes, Bardic Damage — all granted simultaneously (not choices)
- Status: Normal "all granted" pattern ✓ (no options wrapper)

## Spell Data

### PHB Bard (classic)
- Caster type: full ✓
- cantripProgression: 20 values [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4] ✓
- spellsKnownProgression: 20 values [4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22] ✓
- spellSlotProgression: present in classTableGroups (rowsSpellProgression), 20 rows, 9 columns ✓
- Import extracts via: `c.classTableGroups?.find((g) => g.rowsSpellProgression)?.rowsSpellProgression` ✓
- preparedSpellsProgression: null (PHB uses spellsKnown, not prepared) — import correctly stores `null` ✓
- Subclass spell lists: 4 subclasses have additionalSpells (Lore/PHB, Glamour/XGE, Spirits/VRGR, and Lore/PHB for XPHB classSource via _copy)

### XPHB Bard (one)
- Caster type: full ✓
- cantripProgression: 20 values [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4] ✓
- preparedSpellsProgression: present [4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22] ✓
- preparedSpellsChange: "level" (swap spells on level-up) — stored in `multiclassing` or raw JSON, not separately extracted by import. Not in import record. Minor gap.
- spellSlotProgression: present in classTableGroups, identical table to PHB ✓
- Subclass spell lists: Glamour/XPHB (prepared+innate), Lore/XPHB (prepared), Moon/FRHoF (innate+prepared)

### additionalSpells Issues
1. PHB class `additionalSpells.known["18"]` contains `{ "choose": "" }` (empty string) — this should represent "choose any spell of any level" but the empty string is ambiguous. The import does NOT store class-level `additionalSpells` — only subclass `additionalSpells` is stored (`sc.additionalSpells?.[0]`). So this does not affect the import, but is a data quality note.
2. College of the Moon `additionalSpells.prepared["6"]` uses `{ "daily": { "1e": ["moonbeam|xphb"] } }` — unusual nested structure instead of a flat array. This is a 5etools-specific encoding for "1/day always prepared" spells. The import stores this raw as `sc.additionalSpells?.[0]`, so the nested structure is preserved but must be handled by consuming code.

## Issues Found

1. **PHB class additionalSpells level 18**: `"choose": ""` is an empty string — should specify spell level filter (e.g. `"level=0;1;2;3;4;5;6;7;8;9"`). Does not affect import (class additionalSpells are not imported), but is a data quality issue in the source.

2. **College of Swords Blade Flourish options block has no `count` field**: This is intentional (all options always available), but differs from the Fighting Style options block which has `count: 1`. Consuming code must handle the `count`-absent case.

3. **XPHB class `preparedSpellsChange: "level"` not imported**: The import record for classes does not include `preparedSpellsChange`. For XPHB classes that use prepared spells, this field distinguishes per-level swap from on-rest swap. Low priority since the field is informational, but worth adding.

4. **College of the Moon nested additionalSpells structure**: `prepared["6"]` is `{ "daily": { "1e": [...] } }` rather than a flat array. The import stores this raw — consuming code must handle this 5etools `daily` encoding.

5. **College of Eloquence has 4 subclassFeature entries at level 6** (Unfailing Inspiration + Universal Speech at level 6). This is correct per rules but unusual — two separate features at the same subclass level. The import stores all features; consuming code must handle multiple same-level subclass features. ✓ (data is correct)

6. **College of Dance `Dazzling Footwork` contains 4 inline refSubclassFeature entries** (not inside an options block). All 4 features are granted simultaneously. The import stores the raw entries array; consuming code must recursively resolve these refs to display all sub-features. ✓ (data is correct)

7. **_copy subclasses use `classSource: "XPHB"` but source stays original**: e.g., College of Swords (XGE source, XPHB classSource) will get `edition="classic"` from the `edition()` function (which checks `source`, not `classSource`). This means PHB-edition subclasses paired with XPHB class are stored as "classic" edition. This is likely intended behavior (the subclass rules haven't changed, just the class version changed).

## Fixes Applied

None — this is a read-only verification. No source files were modified.
