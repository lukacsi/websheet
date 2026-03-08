# Barbarian Verification Report

## Class Basics

Two class entries exist: PHB (classic edition) and XPHB (one edition).

### PHB Barbarian (classic)
- hitDie: 12 (hd.faces=12) — import: `c.hd?.faces || 8` ✓
- savingThrows: ["str", "con"] (proficiency field) — import: `c.proficiency` ✓
- spellcastingAbility: null — field absent in JSON, import: `c.spellcastingAbility || null` → null ✓
- casterProgression: null — field absent in JSON, import: `c.casterProgression || null` → null ✓
- armorProficiencies: ["light", "medium", "shield"] — import: `c.startingProficiencies?.armor` ✓
- weaponProficiencies: ["simple", "martial"] — import: `c.startingProficiencies?.weapons` ✓

### XPHB Barbarian (one)
- hitDie: 12 (hd.faces=12) ✓
- savingThrows: ["str", "con"] ✓
- spellcastingAbility: null ✓
- casterProgression: null ✓
- armorProficiencies: ["light", "medium", "shield"] ✓
- weaponProficiencies: ["simple", "martial"] ✓

### Tool Proficiency Note
Neither PHB nor XPHB Barbarian has `startingProficiencies.tools`. Import correctly produces `toolProficiencies: []` and `toolChoices: null`.

## Feature Choices (class-level)

No class-level `classFeature` entries for the Barbarian contain `type: "options"` blocks. Subclass choice slots (Primal Path, Path Feature, Subclass Feature) use `gainSubclassFeature: true` in the `classFeatures` array and are represented by placeholder classFeature records (e.g. "Primal Path" at level 3, "Path Feature" at level 6/10/14). These placeholder features do NOT use `type: "options"` blocks — they are simple text entries.

| Feature | Level | Count | Refs | Status |
|---------|-------|-------|------|--------|
| (no options blocks at class-feature level) | — | — | — | N/A |

### PHB classFeatures Array (levels 1–20)
| Level | Feature | Gain Subclass? |
|-------|---------|----------------|
| 1 | Rage | No |
| 1 | Unarmored Defense | No |
| 2 | Danger Sense | No |
| 2 | Reckless Attack | No |
| 3 | Primal Path | Yes (gainSubclassFeature=true) |
| 3 | Primal Knowledge [TCE] | No |
| 4 | Ability Score Improvement | No |
| 5 | Extra Attack | No |
| 5 | Fast Movement | No |
| 6 | Path Feature | Yes (gainSubclassFeature=true) |
| 7 | Feral Instinct | No |
| 7 | Instinctive Pounce [TCE] | No |
| 8 | Ability Score Improvement | No |
| 9 | Brutal Critical (1 die) | No |
| 10 | Path feature | Yes (gainSubclassFeature=true) |
| 11 | Relentless Rage | No |
| 12 | Ability Score Improvement | No |
| 13 | Brutal Critical (2 dice) | No |
| 14 | Path feature | Yes (gainSubclassFeature=true) |
| 15 | Persistent Rage | No |
| 16 | Ability Score Improvement | No |
| 17 | Brutal Critical (3 dice) | No |
| 18 | Indomitable Might | No |
| 19 | Ability Score Improvement | No |
| 20 | Primal Champion | No |

Note: The subclass slot feature names in the `classFeatures` array are inconsistent — "Path Feature" (capital F) at level 6, "Path feature" (lowercase f) at levels 10 and 14. The corresponding `classFeature` records match exactly, so the upsert lookup succeeds with no mismatch.

## Subclasses (13 unique originals, 22 total entries including 9 _copy variants)

_Copy entries are subclasses duplicated with `classSource=XPHB` instead of `classSource=PHB`, resolved by the import's `resolveAllCopies` function before upsert. Upsert key is `name + source + className + classSource` — all 22 entries have unique keys.

| Subclass | Source | classSource | Edition | SpellcastingAbility | AdditionalSpells | Choice Features | Issues |
|----------|--------|-------------|---------|---------------------|------------------|-----------------|--------|
| Path of the Berserker | PHB | PHB | classic | none | No | refSubclassFeature x1 at Lv3 | None |
| Path of the Totem Warrior | PHB | PHB | classic | none | Yes (innate ritual: beast sense, speak with animals Lv3; commune with nature Lv10) | options block x3 (Lv3,6,14) | See Issues #1 |
| Path of the Battlerager | SCAG | PHB | classic | none | No | refSubclassFeature x2 at Lv3 | None |
| Path of the Ancestral Guardian | XGE | PHB | classic | wis | Yes (innate: augury, clairvoyance at Lv10) | refSubclassFeature x1 at Lv3 | None |
| Path of the Storm Herald | XGE | PHB | classic | none | No | options blocks x3 (Lv3,6,14) — missing count field | See Issues #2 |
| Path of the Zealot | XGE | PHB | classic | none | No | refSubclassFeature x2 at Lv3 | None |
| Path of the Beast | TCE | PHB | classic | none | No | refSubclassFeature x1 at Lv3 | None |
| Path of Wild Magic | TCE | PHB | classic | none | No | refSubclassFeature x2 at Lv3 | None |
| Path of the Giant | BGG | PHB | classic | wis | Yes (2 entries: druidcraft cantrip OR thaumaturgy cantrip at Lv3) | refSubclassFeature x2 at Lv3 | See Issues #3 |
| Path of the Berserker | XPHB | XPHB | one | none | No | refSubclassFeature x1 at Lv3 | None |
| Path of the Wild Heart | XPHB | XPHB | one | none | Yes (innate ritual: beast sense, speak with animals Lv3; commune with nature Lv10) | Inline `entries` named blocks (not options refs) | See Issues #4 |
| Path of the World Tree | XPHB | XPHB | one | none | No | refSubclassFeature x1 at Lv3 | None |
| Path of the Zealot | XPHB | XPHB | one | none | No | refSubclassFeature x2 at Lv3 | None |

## Feature Choices (subclass-level options blocks)

### Totem Warrior — Totem Spirit (Lv3), Aspect of the Beast (Lv6), Totemic Attunement (Lv14)
Each of these three subclass features contains one `type: "options"` block with `count: 1` and 5 choices via `refSubclassFeature`.

| Feature | Level | count | Refs (count) | Status |
|---------|-------|-------|--------------|--------|
| Totem Spirit | 3 | 1 | Bear, Eagle, Elk (SCAG), Tiger (SCAG), Wolf — 5 refs | count=1 ✓ |
| Aspect of the Beast | 6 | 1 | Bear, Eagle, Elk (SCAG), Tiger (SCAG), Wolf — 5 refs | count=1 ✓ |
| Totemic Attunement | 14 | 1 | Bear, Eagle, Elk (SCAG), Tiger (SCAG), Wolf — 5 refs | count=1 ✓ |

### Storm Herald — Storm Aura (Lv3), Storm Soul (Lv6), Raging Storm (Lv14)
Each of these three subclass features contains one `type: "options"` block with **no `count` field** and 3 choices via `refSubclassFeature`.

| Feature | Level | count | Refs (count) | Status |
|---------|-------|-------|--------------|--------|
| Storm Aura | 3 | MISSING | Desert (XGE), Sea (XGE), Tundra (XGE) — 3 refs | Missing count — defaults to 1 via `?? 1` in FeatureChoicePicker ✓ |
| Storm Soul | 6 | MISSING | Desert (XGE), Sea (XGE), Tundra (XGE) — 3 refs | Missing count — defaults to 1 ✓ |
| Raging Storm | 14 | MISSING | Desert (XGE), Sea (XGE), Tundra (XGE) — 3 refs | Missing count — defaults to 1 ✓ |

## Spell Data

- Caster type: none (no `casterProgression` field on class)
- Cantrip progression: N/A
- Slot progression: N/A
- No `spellcastingAbility` on base class (PHB or XPHB)
- Subclasses with spellcastingAbility override: Ancestral Guardian (wis), Path of the Giant (wis)

## Issues Found

### Issue #1 — Totem Warrior: FeatureChoicePicker ambiguous ref resolution for Bear, Eagle, Wolf
**Location:** `src/components/create/FeatureChoicePicker.tsx` line 75

Ref format for Bear/Eagle/Wolf choices is `"Bear|Barbarian||Totem Warrior||3"` (no source in position 6 or 4). The picker resolves this as `lookupEntity("subclassFeature", "Bear", undefined)` — no source filter. Since Bear, Eagle, and Wolf each have **three records** in `class_features` (levels 3, 6, and 14 for each), the lookup returns an arbitrary record (sorted by `-edition`, which for PHB-only features has no differentiation). The displayed preview text when a user selects "Bear" will be unpredictable — it could show the Lv3, Lv6, or Lv14 text regardless of which parent feature (Totem Spirit / Aspect of the Beast / Totemic Attunement) is being displayed.

Elk and Tiger are correctly source-qualified with `|SCAG` at position 6, but they have the same level-ambiguity problem when looking up by name+source without level — all three levels match.

**Root cause:** The ref key format (`Name|ClassName|ClassSource|SubclassShortName|SubclassSource|Level`) does not include the feature's own source at the end (it would be `|FeatureSource`), and `lookupEntity` has no level parameter.

**Affected refs:**
- `Bear|Barbarian||Totem Warrior||3/6/14` (no source → 3 ambiguous records)
- `Eagle|Barbarian||Totem Warrior||3/6/14` (no source → 3 ambiguous records)
- `Wolf|Barbarian||Totem Warrior||3/6/14` (no source → 3 ambiguous records)
- `Elk|Barbarian|PHB|Totem Warrior||3/6/14|SCAG` (SCAG source → still 3 level-ambiguous records)
- `Tiger|Barbarian|PHB|Totem Warrior||3/6/14|SCAG` (SCAG source → still 3 level-ambiguous records)

**Impact:** Choice preview text may show wrong level's description. The choices are still presented and selectable correctly; only the preview display is potentially wrong.

**Fix needed in:** `src/components/create/FeatureChoicePicker.tsx` — `lookupEntity` needs a level parameter, OR the picker needs to parse the level from the refKey (position 5) and filter records by level before display.

### Issue #2 — Storm Herald: options blocks missing `count` field
**Location:** `data/5etools-src/data/class/class-barbarian.json` — subclassFeature entries for Storm Aura, Storm Soul, Raging Storm

The `type: "options"` blocks in these three features have no `count` property. `FeatureChoicePicker` defaults to `count ?? 1`, which is functionally correct for Storm Herald (pick one environment type). No behavioral bug, but the 5e.tools data omission is worth noting.

**Impact:** None — the `?? 1` fallback is correct.

### Issue #3 — Path of the Giant: second additionalSpells entry dropped by import
**Location:** `scripts/import-5etools.ts` line 624 — `additionalSpells: sc.additionalSpells?.[0] || null`

Path of the Giant has an unusual `additionalSpells` array with **2 entries** instead of the standard 1:
```json
"additionalSpells": [
  { "innate": { "3": ["druidcraft#c"] } },
  { "innate": { "3": ["thaumaturgy#c"] } }
]
```
The import takes only `[0]` (druidcraft). The second entry (thaumaturgy) is silently dropped. In the actual subclass, the player chooses one of the two cantrips; both options should be stored. The `Giant Power` subclassFeature text explicitly states "you learn a cantrip of your choice: either druidcraft or thaumaturgy."

**Impact:** The imported `additionalSpells` for Path of the Giant only contains druidcraft, not the thaumaturgy alternative.

**Fix needed in:** `scripts/import-5etools.ts` — store the full `additionalSpells` array (all entries) rather than just `[0]`. The display layer would need to handle the two-entry format as a cantrip choice.

### Issue #4 — Path of the Wild Heart (XPHB): choice features use inline `entries` blocks, not `type: "options"` refs
**Location:** `data/5etools-src/data/class/class-barbarian.json` — subclassFeature entries for Rage of the Wilds (Lv3), Aspect of the Wilds (Lv6), Power of the Wilds (Lv14)

These XPHB features present choices as **named `type: "entries"` blocks** (inline text) rather than `type: "options"` with `refSubclassFeature` refs. For example, `Rage of the Wilds` lists Bear / Eagle / Wolf as named entries sub-blocks within the main entries array. This is a different data pattern than the PHB Totem Warrior.

`FeatureChoicePicker` only detects `type: "options"` blocks with ref children. It will NOT detect these inline `type: "entries"` choice blocks as requiring a pick. The feature will display as a plain text block with all options shown together — no "Choice needed" badge, no radio picker.

**Impact:** For XPHB Wild Heart, the UI does not prompt the player to choose one option from Rage of the Wilds / Aspect of the Wilds / Power of the Wilds. All alternatives are rendered as prose text, which is confusing but not technically incorrect.

**Fix needed in:** `src/components/sheet/FeaturesSection.tsx` — the `findListChoiceBlocks` function (already used for races) could be extended to detect named `type: "entries"` blocks within subclass features and present a radio picker, similar to how Gnomish Lineage is handled for races.

## Fixes Applied

None — this is a read-only verification report.
