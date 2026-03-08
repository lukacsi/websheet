# Sorcerer Class Verification Report

**Source file:** `data/5etools-src/data/class/class-sorcerer.json`
**Import script:** `scripts/import-5etools.ts`
**Date:** 2026-03-07

---

## A. Class Basics

Two editions present in the file: PHB (classic, 2014) and XPHB (one, 2024).

### PHB (classic edition)

| Field | JSON value | Import mapping | Result |
|-------|-----------|----------------|--------|
| hitDie | `hd.faces = 6` | `c.hd?.faces \|\| 8` | OK — d6 |
| savingThrows | `proficiency: ["con", "cha"]` | `c.proficiency \|\| []` | OK — Con, Cha |
| spellcastingAbility | `"cha"` | `c.spellcastingAbility \|\| null` | OK |
| casterProgression | `"full"` | `c.casterProgression \|\| null` | OK |
| armorProficiencies | `[]` (no armor) | `c.startingProficiencies?.armor \|\| []` | OK — empty |
| weaponProficiencies | 5 specific items as 5etools tag strings | `c.startingProficiencies?.weapons \|\| []` | OK — stored as-is (see note) |
| cantripProgression | present, 20-entry array | `c.cantripProgression \|\| null` | OK |
| preparedSpellsProgression | absent (PHB uses known model) | `c.preparedSpellsProgression \|\| null` | null — correct |
| spellSlotProgression | extracted from `classTableGroups.rowsSpellProgression` | `?.find(g => g.rowsSpellProgression)` | OK |

**Note — weapon proficiency format:** PHB stores 5 individual weapons as raw 5etools tag strings (e.g., `"{@item dagger|phb|daggers}"`). XPHB stores `["simple"]` (category shorthand). The import script stores both as-is with no normalization. This is a format inconsistency in the database between editions, but not a data loss issue.

**Note — spellsKnownProgression not mapped:** The PHB Sorcerer uses a "known spells" model with `spellsKnownProgression` in the JSON (`[2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15]`). The import script does **not** map this field — only `cantripProgression`, `preparedSpellsProgression`, and `spellSlotProgression` are written to the DB. The PHB Sorcerer's per-level spells-known count is not stored. **BUG** — character sheet cannot display or enforce the known-spell cap for PHB Sorcerers.

### XPHB (one edition)

| Field | JSON value | Import mapping | Result |
|-------|-----------|----------------|--------|
| hitDie | `hd.faces = 6` | same | OK — d6 |
| savingThrows | `["con", "cha"]` | same | OK |
| spellcastingAbility | `"cha"` | same | OK |
| casterProgression | `"full"` | same | OK |
| armorProficiencies | `[]` | same | OK — empty |
| weaponProficiencies | `["simple"]` | same | OK (category shorthand) |
| preparedSpellsProgression | present, 20-entry array | `c.preparedSpellsProgression \|\| null` | OK |

---

## B. Class Features (Levels 1–20)

### PHB Sorcerer — classFeatures list (18 entries)

| # | Level | Feature | Notes |
|---|-------|---------|-------|
| 1 | 1 | Spellcasting | |
| 2 | 1 | Sorcerous Origin | `gainSubclassFeature: true` |
| 3 | 2 | Font of Magic | |
| 4 | 3 | Metamagic | options block — see below |
| 5 | 3 | Metamagic Options | TCE optional feature variant — see edge case |
| 6 | 4 | Ability Score Improvement | |
| 7 | 4 | Sorcerous Versatility | TCE optional feature variant |
| 8 | 5 | Magical Guidance | TCE optional feature variant |
| 9 | 6 | Sorcerous Origin feature | `gainSubclassFeature: true` |
| 10 | 8 | Ability Score Improvement | |
| 11 | 10 | Metamagic | additional option |
| 12 | 12 | Ability Score Improvement | |
| 13 | 14 | Sorcerous Origin feature | `gainSubclassFeature: true` |
| 14 | 16 | Ability Score Improvement | |
| 15 | 17 | Metamagic | additional option |
| 16 | 18 | Sorcerous Origin feature | `gainSubclassFeature: true` |
| 17 | 19 | Ability Score Improvement | |
| 18 | 20 | Sorcerous Restoration | |

**Subclass feature gates (PHB):** L1, L6, L14, L18.

**Missing levels from classFeatures:** L7, L9, L11, L13, L15 — correct, PHB Sorcerer has no base class features at those levels.

### XPHB Sorcerer — classFeatures list (19 entries)

| # | Level | Feature | Notes |
|---|-------|---------|-------|
| 1 | 1 | Spellcasting | |
| 2 | 1 | Innate Sorcery | new in 2024 |
| 3 | 2 | Font of Magic | |
| 4 | 2 | Metamagic | options block — see below |
| 5 | 2 | Metamagic Options | |
| 6 | 3 | Sorcerer Subclass | `gainSubclassFeature: true` |
| 7 | 4 | Ability Score Improvement | |
| 8 | 5 | Sorcerous Restoration | moved from L20 |
| 9 | 6 | Subclass Feature | `gainSubclassFeature: true` |
| 10 | 7 | Sorcery Incarnate | new in 2024 |
| 11 | 8 | Ability Score Improvement | |
| 12 | 10 | Metamagic | +2 options |
| 13 | 12 | Ability Score Improvement | |
| 14 | 14 | Subclass Feature | `gainSubclassFeature: true` |
| 15 | 16 | Ability Score Improvement | |
| 16 | 17 | Metamagic | +2 options |
| 17 | 18 | Subclass Feature | `gainSubclassFeature: true` |
| 18 | 19 | Epic Boon | |
| 19 | 20 | Arcane Apotheosis | |

**Subclass feature gates (XPHB):** L3, L6, L14, L18.

### options blocks in classFeatures

#### PHB — Metamagic (L3, source PHB)

```json
{ "type": "options", "count": 2, "entries": [ 8 refOptionalfeature entries ] }
```

- count: `2` (explicit number)
- Options: Careful Spell, Distant Spell, Empowered Spell, Extended Spell, Heightened Spell, Quickened Spell, Subtle Spell, Twinned Spell
- Total refs: **8**

#### PHB — Metamagic Options (L3, source TCE)

```json
{ "type": "options", "entries": [ 2 refOptionalfeature entries ] }
```

- count: **MISSING** — no `count` field present
- `isClassFeatureVariant: true` — this is an optional class feature (Tasha's optional), not a standard pick
- Options: Seeking Spell|TCE, Transmuted Spell|TCE
- Total refs: **2**
- Behavior: This block expands the pool of available Metamagic options when the optional feature is in use. It does not grant a fixed number of picks — it adds to the pool from which the player selects during standard Metamagic acquisition. The absence of `count` is intentional and correct for this feature type. The import script stores `entries` as-is in the `class_features` table; the character sheet UI must handle the missing `count` as "add to pool."

**EDGE CASE CONFIRMED:** Metamagic Options (TCE, L3) has no `count` field. This matches the expected design: the feature is an optional expansion to the Metamagic option pool, not a separate grant. Any code that assumes `options.count` is always a number will fail here and should treat `count === undefined` as "all options added to pool."

#### XPHB — Metamagic Options (L2, source XPHB)

```json
{ "type": "options", "count": 2, "entries": [ 10 refOptionalfeature entries ] }
```

- count: `2` (explicit number — initial grant at L2)
- Options: Careful, Distant, Empowered, Extended, Heightened, Quickened, Seeking, Subtle, Transmuted, Twinned (all XPHB)
- Total refs: **10**
- Note: Seeking Spell and Transmuted Spell are now in the base XPHB pool (no longer optional/TCE only)

---

## C. Subclasses (Sorcerous Origins)

The file contains **23 subclass entries** total: 14 native entries (non-`_copy`) + 9 `_copy` entries (variant rules for XPHB classSource).

### Native subclasses (non-_copy)

| Name | Source | classSource | Level Gates | additionalSpells | Features count |
|------|--------|-------------|-------------|-----------------|----------------|
| Draconic Bloodline | PHB | PHB | 1, 6, 14, 18 | No | 4 |
| Wild Magic | PHB | PHB | 1, 6, 14, 18 | No | 4 |
| Pyromancer (PSK) | PSK | PHB | 1, 6, 14, 18 | No | 4 |
| Divine Soul | XGE | PHB | 1, 6, 14, 18 | **Yes — 5 entries** | 4 |
| Shadow Magic | XGE | PHB | 1, 6, 14, 18 | Yes — 1 entry | 4 |
| Storm Sorcery | XGE | PHB | 1, 6, 6, 14, 18 | No | 5 |
| Aberrant Mind | TCE | PHB | 1, 6, 6, 14, 18 | Yes — 1 entry | 5 |
| Clockwork Soul | TCE | PHB | 1, 6, 14, 18 | Yes — 1 entry | 4 |
| Lunar Sorcery | DSotDQ | PHB | 1, 6, 6, 14, 18 | Yes — 1 entry | 5 |
| Aberrant Sorcery | XPHB | XPHB | 3, 6, 6, 14, 18 | Yes — 1 entry | 5 |
| Clockwork Sorcery | XPHB | XPHB | 3, 6, 14, 18 | Yes — 1 entry | 4 |
| Draconic Sorcery | XPHB | XPHB | 3, 6, 14, 18 | Yes — 1 entry | 4 |
| Wild Magic Sorcery | XPHB | XPHB | 3, 6, 14, 18 | No | 4 |
| Spellfire Sorcery | FRHoF | XPHB | 3, 6, 14, 18 | Yes — 1 entry | 4 |

### _copy subclasses (9 entries, all for XPHB classSource)

These are copies of PHB/XGE/TCE/PSK/DSotDQ subclasses adapted for XPHB classSource (allowing classic subclasses to apply to XPHB class). The `_copy` mechanism clones the base entry and applies `_preserve` for page/sources. The import script `resolveCopy()` handles these correctly.

| Base name | Base source | classSource after copy |
|-----------|-------------|----------------------|
| Draconic Bloodline | PHB | XPHB |
| Wild Magic | PHB | XPHB |
| Pyromancer (PSK) | PSK | XPHB |
| Divine Soul | XGE | XPHB |
| Shadow Magic | XGE | XPHB |
| Storm Sorcery | XGE | XPHB |
| Aberrant Mind | TCE | XPHB |
| Clockwork Soul | TCE | XPHB |
| Lunar Sorcery | DSotDQ | XPHB |

### additionalSpells detail

**Divine Soul (XGE/PHB) — CRITICAL BUG:** The `additionalSpells` array has **5 entries**, one per alignment (Good, Evil, Law, Chaos, Neutrality). Each entry has `name`, `known`, and `expanded` fields. The import script at line 624 takes `sc.additionalSpells?.[0]` — only index 0 (the "Good" alignment entry) is stored. The remaining 4 alignment variants (Evil, Law, Chaos, Neutrality) are **silently dropped**. This is a data loss bug. The character sheet cannot present Divine Soul's alignment-based spell choices correctly.

After `_copy` resolution, the XGE/XPHB variant of Divine Soul also inherits the same 5-entry `additionalSpells` from the base and will be affected by the same truncation.

All other subclasses with `additionalSpells` have exactly 1 entry in the array — the `[0]` access is safe for them.

### Subclass options blocks

No subclasses in this file contain `type: "options"` blocks directly. Options selection (Metamagic) is handled at the class level via `optionalfeatureProgression`. Subclass features use `refSubclassFeature` or plain text entries.

---

## D. Spell Data

### casterProgression

Both PHB and XPHB: `"full"` — correct. Standard full-caster progression (matches Wizard, Cleric pattern).

### cantripProgression

PHB and XPHB both define `cantripProgression` as a 20-element array:

```
[4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
```

Verified: This matches the `classTableGroups` cantrip column exactly for both editions. Mapping: `c.cantripProgression || null` — **OK**.

### spellSlotProgression

Extracted from `classTableGroups[n].rowsSpellProgression` (9 columns, one per spell level, 20 rows).

PHB key rows:

| Level | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 3 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 20 | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 |

XPHB spell slot progression is identical to PHB (both are standard full-caster tables). Import mapping: `?.find(g => g.rowsSpellProgression)?.rowsSpellProgression || null` — **OK**, finds the right group.

### spellsKnownProgression (PHB only)

PHB: `[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15]`

This field is present in the JSON but **not mapped in the import script**. The import script has `cantripProgression`, `preparedSpellsProgression`, and `spellSlotProgression` — no `spellsKnownProgression` field. This means the PHB Sorcerer's known-spells cap per level is not persisted. See Bug section.

### optionalfeatureProgression (Metamagic)

PHB:
```json
[{ "name": "Metamagic", "featureType": ["MM"], "progression": {"3": 2, "10": 3, "17": 4} }]
```
- L3: 2 choices, L10: total 3, L17: total 4
- Not mapped in import script (no `optionalfeatureProgression` field in the class record). The Metamagic grant is implicitly encoded in the `classFeatures` entries referencing the options blocks.

XPHB:
```json
[{ "name": "Metamagic", "featureType": ["MM"], "progression": {"2": 2, "10": 4, "17": 6} }]
```
- L2: 2 choices, L10: total 4, L17: total 6 (2024 rules grant more Metamagic options overall)

### preparedSpellsProgression (XPHB only)

`[2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22]`

Verified against classTableGroups table: matches exactly. Mapped as `c.preparedSpellsProgression || null` — **OK**.

### Sorcery Points (class table data)

Both editions: L1=0, L2=2, L3=3 … L20=20. Full progression:
`[0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]`

This is stored in `classTableGroups` and available via `classTableGroups` in the DB record — **OK**.

---

## E. Summary of Issues

### Critical / Data Loss

1. **`Divine Soul` additionalSpells truncation** — Import line 624 takes `additionalSpells?.[0]` only. Divine Soul has 5 alignment-keyed entries (Good, Evil, Law, Chaos, Neutrality). Only the "Good" entry is stored; the other 4 are silently dropped. Affects both XGE/PHB and (after _copy resolution) XGE/XPHB variants.
   - Fix: store the full array, not `[0]`.

2. **`spellsKnownProgression` not mapped** — PHB Sorcerer uses a known-spells model. The `spellsKnownProgression` array is present in the JSON but no corresponding field exists in the import record. The character sheet cannot enforce or display the known-spell cap for PHB Sorcerers without this data.
   - Fix: add `spellsKnownProgression: c.spellsKnownProgression || null` to the class import record.

### Non-critical / Warnings

3. **Metamagic Options (TCE, L3) has no `count` field** — This is intentional 5etools design. The block is an optional-feature variant (`isClassFeatureVariant: true`) that extends the Metamagic pool, not a fixed grant. Any code path that does `options.count` without a null check will throw or behave incorrectly. The UI must handle `count === undefined` as "add all listed options to the available pool."

4. **Weapon proficiency format inconsistency** — PHB stores 5 specific weapon names as 5etools tag strings with `{@item ...}` markup; XPHB stores `["simple"]`. Import script passes both through unmodified. Consumer code must handle both formats (strip tags for PHB, resolve category for XPHB).

5. **`optionalfeatureProgression` not mapped** — The per-level Metamagic option count (PHB: 2/3/4; XPHB: 2/4/6) is in the JSON but not stored as a standalone field in the DB. It is implicitly derivable from the classFeatures entries but requires parsing the entries array.

6. **Storm Sorcery / Aberrant Mind / Lunar Sorcery level 6 appears twice** — These subclasses have two separate features at L6 (e.g., Storm Sorcery has both "Heart of the Storm" and "Storm Guide" at L6). Both feature refs appear in `subclassFeatures`. This is correct per the source material and not a bug, but the importer and UI must handle multiple features at the same level.

### Verified Correct

- hitDie: d6 — correct for both editions
- savingThrows: Con + Cha — correct
- spellcastingAbility: cha — correct
- casterProgression: "full" — correct
- cantripProgression: verified against table, matches exactly
- spellSlotProgression: standard full-caster table, correct L1-L20
- PHB classFeatures: 18 entries, subclass gates at L1/6/14/18
- XPHB classFeatures: 19 entries, subclass gates at L3/6/14/18
- PHB Metamagic L3: count=2, 8 options — correct
- XPHB Metamagic Options L2: count=2, 10 options — correct (Seeking and Transmuted now in base pool)
- _copy resolution: 9 XPHB classSource copies resolve correctly from their bases
- Sorcery points table: L1=0, L2=2 through L20=20 — correct
- All 14 unique subclasses present with correct level gate patterns
