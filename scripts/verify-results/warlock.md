# Warlock Verification Report

## Class Basics

Two class entries exist: PHB (classic edition) and XPHB (one edition).

### PHB Warlock (classic)
- hitDie: 8 (hd.faces=8) — import: `c.hd?.faces || 8` ✓
- savingThrows: ["wis", "cha"] (proficiency) — import: `c.proficiency` ✓
- spellcastingAbility: "cha" ✓
- casterProgression: "pact" ✓
- armorProficiencies: ["light"] — import: `c.startingProficiencies?.armor` ✓
- weaponProficiencies: ["simple"] — import: `c.startingProficiencies?.weapons` ✓
- skillChoices: choose 2 from [arcana, deception, history, intimidation, investigation, nature, religion] ✓
- subclassTitle: "Otherworldly Patron" ✓
- edition field: "classic" ✓
- multiclassing: requires CHA 13; proficienciesGained: armor=light, weapons=simple ✓

### XPHB Warlock (one)
- hitDie: 8 (hd.faces=8) ✓
- savingThrows: ["wis", "cha"] ✓
- spellcastingAbility: "cha" ✓
- casterProgression: "pact" ✓
- armorProficiencies: ["light"] ✓
- weaponProficiencies: ["simple"] ✓
- skillChoices: same 7-skill pool, choose 2 ✓
- subclassTitle: "Warlock Subclass" ✓
- edition field: "one" ✓
- multiclassing (XPHB): no CHA requirement listed; proficienciesGained: armor=light only (no weapons) — differs from PHB ✓
- additionalSpells (class level): contact other plane at level 9 (Contact Patron feature) ✓

### Tool Proficiency Parsing Note
No tool proficiencies for Warlock (PHB or XPHB). `toolProficiencies` field is absent from `startingProficiencies`. The import stores `toolProficiencies: []` and `toolChoices: null`. ✓

## Class Features (Levels 1-20)

### PHB Warlock — classFeatures array (17 entries)

| Level | Feature | Type | gainSubclassFeature |
|-------|---------|------|---------------------|
| 1 | Pact Magic | string | — |
| 1 | Otherworldly Patron | dict | true |
| 2 | Eldritch Invocations | string | — |
| 3 | Pact Boon | string | — |
| 4 | Ability Score Improvement | string | — |
| 4 | Eldritch Versatility (TCE, variant) | string | — |
| 6 | Otherworldly Patron feature | dict | true |
| 8 | Ability Score Improvement | string | — |
| 10 | Otherworldly Patron feature | dict | true |
| 11 | Mystic Arcanum (6th level) | string | — |
| 12 | Ability Score Improvement | string | — |
| 13 | Mystic Arcanum (7th level) | string | — |
| 14 | Otherworldly Patron feature | dict | true |
| 15 | Mystic Arcanum (8th level) | string | — |
| 16 | Ability Score Improvement | string | — |
| 17 | Mystic Arcanum (9th level) | string | — |
| 19 | Ability Score Improvement | string | — |
| 20 | Eldritch Master | string | — |

Notes:
- Level 18 has no class feature entry (gap between 17 and 19). This is correct per PHB rules.
- Level 5 and level 7 also have no dedicated class features (correct per PHB).
- Eldritch Versatility (TCE) is `isClassFeatureVariant: true` in the classFeature definition — optional feature.
- Subclass features trigger at levels 1, 6, 10, 14 via `gainSubclassFeature: true`.

### XPHB Warlock — classFeatures array (19 entries)

| Level | Feature | Type | gainSubclassFeature |
|-------|---------|------|---------------------|
| 1 | Eldritch Invocations | string | — |
| 1 | Pact Magic | string | — |
| 1 | Eldritch Invocation Options | string | — |
| 2 | Magical Cunning | string | — |
| 3 | Warlock Subclass | dict | true |
| 4 | Ability Score Improvement | string | — |
| 6 | Subclass Feature | dict | true |
| 8 | Ability Score Improvement | string | — |
| 9 | Contact Patron | string | — |
| 10 | Subclass Feature | dict | true |
| 11 | Mystic Arcanum | string | — |
| 12 | Ability Score Improvement | string | — |
| 13 | Mystic Arcanum | string | — |
| 14 | Subclass Feature | dict | true |
| 15 | Mystic Arcanum | string | — |
| 16 | Ability Score Improvement | string | — |
| 17 | Mystic Arcanum | string | — |
| 19 | Epic Boon | string | — |
| 20 | Eldritch Master | string | — |

Notes:
- XPHB subclass features trigger at levels 3, 6, 10, 14 (subclass starts at level 3 in 2024 rules).
- XPHB Mystic Arcanum appears 4× (levels 11, 13, 15, 17) — one entry per arcanum level (6th/7th/8th/9th). PHB uses named features per level; XPHB uses the same name "Mystic Arcanum" for all four.
- Contact Patron at level 9 (XPHB) is a new feature not in PHB.
- Magical Cunning at level 2 (XPHB) replaces PHB's rest-to-regain approach with a 1-minute ritual mechanic.
- Eldritch Master (XPHB level 20): upgrades Magical Cunning to restore ALL pact slots. PHB version: 1-minute entreating restores all slots.

## Features with `type: "options"` Blocks

### PHB: Pact Boon (level 3) — classFeature

```json
{
  "type": "options",
  "count": 1,
  "entries": [
    { "type": "refOptionalfeature", "optionalfeature": "Pact of the Chain" },
    { "type": "refOptionalfeature", "optionalfeature": "Pact of the Blade" },
    { "type": "refOptionalfeature", "optionalfeature": "Pact of the Tome" },
    { "type": "refOptionalfeature", "optionalfeature": "Pact of the Talisman|TCE" }
  ]
}
```
- count: 1, refs: 4 refOptionalfeature entries
- Status: Standard player choice — one pact boon at level 3 ✓
- Note: Pact of the Talisman is TCE-sourced (optional). The base 3 are PHB.

### XPHB: Eldritch Invocation Options (level 1) — classFeature

This feature body contains a single `type: "options"` block with **28 refOptionalfeature entries** (all XPHB-sourced):

| # | Invocation |
|---|-----------|
| 1 | Agonizing Blast|XPHB |
| 2 | Armor of Shadows|XPHB |
| 3 | Ascendant Step|XPHB |
| 4 | Devil's Sight|XPHB |
| 5 | Devouring Blade|XPHB |
| 6 | Eldritch Mind|XPHB |
| 7 | Eldritch Smite|XPHB |
| 8 | Eldritch Spear|XPHB |
| 9 | Fiendish Vigor|XPHB |
| 10 | Gaze of Two Minds|XPHB |
| 11 | Gift of the Depths|XPHB |
| 12 | Gift of the Protectors|XPHB |
| 13 | Investment of the Chain Master|XPHB |
| 14 | Lessons of the First Ones|XPHB |
| 15 | Lifedrinker|XPHB |
| 16 | Mask of Many Faces|XPHB |
| 17 | Master of Myriad Forms|XPHB |
| 18 | Misty Visions|XPHB |
| 19 | One with Shadows|XPHB |
| 20 | Otherworldly Leap|XPHB |
| 21 | Pact of the Blade|XPHB |
| 22 | Pact of the Chain|XPHB |
| 23 | Pact of the Tome|XPHB |
| 24 | Repelling Blast|XPHB |
| 25 | Thirsting Blade|XPHB |
| 26 | Visions of Distant Realms|XPHB |
| 27 | Whispers of the Grave|XPHB |
| 28 | Witch Sight|XPHB |

- count: 1, refs: 28 ✓
- Note: In XPHB, Pact Boons (Chain, Blade, Tome) are Eldritch Invocations, not a separate feature. They appear here in the invocation list. No separate "Pact Boon" feature exists in the XPHB class. ✓
- Note: The PHB "Eldritch Invocations" classFeature (level 2) has NO options block — it's descriptive text only. The actual invocation list is controlled by `optionalfeatureProgression`. The XPHB "Eldritch Invocation Options" feature at level 1 is the one that carries the options block with all 28 refs.

### PHB: Eldritch Invocations (level 2) — classFeature

No `type: "options"` block. The feature text explains invocations and directs to the Optional Features page. The invocation pool is driven by `optionalfeatureProgression.featureType: ["EI"]` (type-based, not enumerated). This is correct — PHB invocations span many source books and are not enumerated in the class feature.

### Genie's Vessel (TCE subclassFeature, level 1) — options block inside

The Genie's Vessel subclass feature contains an options block:
```json
{
  "type": "options",
  "style": "list-hang-notitle",
  "entries": [
    { "type": "refSubclassFeature", "subclassFeature": "Bottled Respite|Warlock|PHB|Genie|TCE|1" },
    { "type": "refSubclassFeature", "subclassFeature": "Genie's Wrath|Warlock|PHB|Genie|TCE|1" }
  ]
}
```
- count: MISSING (no count field)
- refs: 2 refSubclassFeature entries
- Status: UNUSUAL — no `count` field, same pattern as Bard's Blade Flourish. Both Bottled Respite and Genie's Wrath are always available (not a pick-one choice). Consuming code must handle count-absent options blocks as "display all" ✓

## Subclasses (All Otherworldly Patrons)

21 total subclass entries: 12 unique patrons + 9 _copy variants.

### Classic-only Patrons (PHB classSource, not native XPHB)

#### The Archfey (PHB source, PHB classSource)
- additionalSpells: expanded s1-s5 (faerie fire, sleep; calm emotions, phantasmal force; blink, plant growth; dominate beast, greater invisibility; dominate person, seeming) ✓
- subclassFeatures: [level 1, 6, 10, 14] — 4 entries ✓
- Feature names: The Archfey, Misty Escape, Beguiling Defenses, Dark Delirium ✓
- subclassFeature entries in classFeature data: The Archfey (container), Fey Presence (L1/header:1), Misty Escape (L6), Beguiling Defenses (L10), Dark Delirium (L14) — 5 entries total (Archfey container + 4 features, Fey Presence is nested ref) ✓

#### The Fiend (PHB source, PHB classSource)
- additionalSpells: expanded s1-s5 (burning hands, command; blindness/deafness, scorching ray; fireball, stinking cloud; fire shield, wall of fire; flame strike, hallow) ✓
- subclassFeatures: [level 1, 6, 10, 14] — 4 entries ✓
- Feature names: The Fiend, Dark One's Own Luck, Fiendish Resilience, Hurl Through Hell ✓
- srd: true ✓

#### The Great Old One (PHB source, PHB classSource)
- additionalSpells: expanded s1-s5 (dissonant whispers, Tasha's hideous laughter; detect thoughts, phantasmal force; clairvoyance, sending; dominate beast, Evard's black tentacles; dominate person, telekinesis) ✓
- subclassFeatures: [level 1, 6, 10, 14] — 4 entries ✓
- Feature names: The Great Old One, Entropic Ward, Thought Shield, Create Thrall ✓

#### The Undying (SCAG source, PHB classSource)
- additionalSpells: known.1 = ["spare the dying#c"]; expanded s1-s5 (false life, ray of sickness; blindness/deafness, silence; feign death, speak with dead; aura of life, death ward; contagion, legend lore) ✓
- subclassFeatures: [level 1, 6, 10, 14] — 4 entries ✓
- Feature names: The Undying, Defy Death, Undying Nature, Indestructible Life ✓
- Note: known.1 spare the dying uses `#c` suffix (granted as cantrip) ✓

#### The Celestial (XGE source, PHB classSource)
- additionalSpells: known.1 = ["sacred flame#c", "light#c"]; expanded s1-s5 (cure wounds, guiding bolt; flaming sphere, lesser restoration; daylight, revivify; guardian of faith, wall of fire; flame strike, greater restoration) ✓
- subclassFeatures: [level 1, 6, 10, 14] — 4 entries ✓
- Feature names: The Celestial, Radiant Soul, Celestial Resilience, Searing Vengeance ✓
- Note: known.1 grants sacred flame and light as cantrips (`#c`). Two entries in one level. ✓

#### The Hexblade (XGE source, PHB classSource)
- additionalSpells: expanded s1-s5 (shield, wrathful smite; blur, branding smite; blink, elemental weapon; phantasmal killer, staggering smite; banishing smite, cone of cold) ✓
- subclassFeatures: [level 1, 6, 10, 14] — 4 entries ✓
- Feature names: The Hexblade, Accursed Specter, Armor of Hexes, Master of Hexes ✓
- Notable: Hex Warrior (L1) grants medium armor, shields, martial weapons — not reflected in class proficiency fields ✓

#### The Fathomless (TCE source, PHB classSource)
- additionalSpells: expanded s1-s5 (create or destroy water, thunderwave; gust of wind, silence; lightning bolt, sleet storm; control water, summon elemental|tce; Bigby's hand, cone of cold); known.10 = daily.1 = ["Evard's black tentacles"] ✓
- subclassFeatures: [level 1, 6, 6, 10, 14] — **5 entries** (two at level 6) ✓
- Feature names: The Fathomless, Oceanic Soul (L6), Guardian Coil (L6), Grasping Tentacles (L10), Fathomless Plunge (L14) ✓
- Note: Two subclass features at level 6 (Oceanic Soul + Guardian Coil). Consuming code must handle multiple features at same subclass level. ✓

#### The Genie (TCE source, PHB classSource)
- additionalSpells: 4 named expanded sets (Dao, Djinni, Efreeti, Marid), each with s1-s5 + a shared "9" level (wish) ✓
- subclassFeatures: [level 1, 6, 10, 14] — 4 entries ✓
- Feature names: The Genie, Elemental Gift, Sanctuary Vessel, Limited Wish ✓
- Notable: Multiple `additionalSpells` array entries (one per genie kind). Import uses `sc.additionalSpells?.[0]`, capturing only the first (Dao) spells. The remaining 3 variants (Djinni, Efreeti, Marid) are silently dropped. **See Issues.**

#### The Undead (VRGR source, PHB classSource)
- additionalSpells: expanded s1-s5 (bane, false life; blindness/deafness, phantasmal force; phantom steed, speak with dead; death ward, greater invisibility; antilife shell, cloudkill) ✓
- subclassFeatures: [level 1, 6, 10, 14] — 4 entries ✓
- Feature names: The Undead, Grave Touched, Necrotic Husk, Spirit Projection ✓

### Native 2024 Patrons (XPHB source, XPHB classSource)

These are entirely new subclass implementations, not _copy variants.

#### Archfey Patron (XPHB source, XPHB classSource)
- additionalSpells: prepared at levels 3/5/7/9; innate (CHA/day) = misty step ✓
- subclassFeatures: [level 3, 6, 10, 14] — 4 entries ✓
- Feature names: Archfey Patron, Misty Escape, Beguiling Defenses, Bewitching Magic ✓
- Note: Level 14 feature changed from Dark Delirium (PHB) to Bewitching Magic (XPHB) ✓
- Level 3 feature refs: Archfey Spells + Steps of the Fey (via refSubclassFeature) ✓

#### Celestial Patron (XPHB source, XPHB classSource)
- additionalSpells: known.1 = ["sacred flame|xphb#c", "light|xphb#c"]; prepared at levels 3/5/7/9 ✓
- subclassFeatures: [level 3, 6, 10, 14] — 4 entries ✓
- Feature names: Celestial Patron, Radiant Soul, Celestial Resilience, Searing Vengeance ✓
- Level 3 feature refs: Celestial Spells + Healing Light ✓

#### Fiend Patron (XPHB source, XPHB classSource)
- additionalSpells: prepared at levels 3/5/7/9 — different spells from PHB Fiend (suggestion added at 3, geas/insect plague at 9 instead of flame strike/hallow) ✓
- subclassFeatures: [level 3, 6, 10, 14] — 4 entries ✓
- Feature names: Fiend Patron, Dark One's Own Luck, Fiendish Resilience, Hurl Through Hell ✓
- srd52: true; basicRules2024: true ✓
- Level 3 feature refs: Fiend Spells + Dark One's Blessing ✓

#### Great Old One Patron (XPHB source, XPHB classSource)
- additionalSpells: prepared at levels 3/5/7/9; innate.10 = ["hex|xphb"] ✓
- subclassFeatures: [level 3, 6, 10, **10**, 14] — **5 entries** (two at level 10) ✓
- Feature names: Great Old One Patron, Clairvoyant Combatant (L6), Eldritch Hex (L10), Thought Shield (L10), Create Thrall (L14) ✓
- Note: Two subclass features at level 10 (Eldritch Hex + Thought Shield). ✓

### _copy Subclass Variants

9 subclass entries are `_copy` structs that override `classSource` to PHB or XPHB:

| Subclass | Source | classSource (original) | classSource (copy target) |
|----------|--------|------------------------|--------------------------|
| The Archfey | PHB | PHB | XPHB |
| The Fiend | PHB | PHB | XPHB |
| The Great Old One | PHB | PHB | XPHB |
| The Undying | SCAG | PHB | XPHB |
| The Fathomless | TCE | PHB | XPHB |
| The Genie | TCE | PHB | XPHB |
| The Undead | VRGR | PHB | XPHB |
| The Celestial | XGE | PHB | XPHB |
| The Hexblade | XGE | PHB | XPHB |

All resolved by `resolveAllCopies()` in import. Their subclassFeatures list is also overridden in the copy (using XPHB classSource in the feature ref string, with subclass level changed from 1 → 3 for the intro feature):
- e.g., The Archfey/XPHB: `"The Archfey|Warlock|XPHB|Archfey||3"` (level 3 intro, XPHB classSource)

The `edition()` function checks `source` (not `classSource`), so e.g. The Hexblade (XGE source, XPHB classSource) gets `edition="classic"`. This is the correct and intended behavior. ✓

## Spell Data

### PHB Warlock — Pact Magic (casterProgression: "pact")

This is the Warlock's unique spell slot system. Pact slots are NOT represented by `rowsSpellProgression` — they use the `classTableGroups` raw rows. The import's `spellSlotProgression` field (which looks for `rowsSpellProgression`) will be **null** for Warlock. Pact slot data is stored in `classTableGroups` instead.

Pact slot progression (from classTableGroups rows — col index 2=slots, 3=slot level as filter string):

| Level | Cantrips | Spells Known | Slots | Slot Level | Invocations |
|-------|----------|-------------|-------|------------|-------------|
| 1 | 2 | 2 | 1 | 1st | 0 |
| 2 | 2 | 3 | 2 | 1st | 2 |
| 3 | 2 | 4 | 2 | 2nd | 2 |
| 4 | 3 | 5 | 2 | 2nd | 2 |
| 5 | 3 | 6 | 2 | 3rd | 3 |
| 6 | 3 | 7 | 2 | 3rd | 3 |
| 7 | 3 | 8 | 2 | 4th | 4 |
| 8 | 3 | 9 | 2 | 4th | 4 |
| 9 | 3 | 10 | 2 | 5th | 5 |
| 10 | 4 | 10 | 2 | 5th | 5 |
| 11 | 4 | 11 | 3 | 5th | 5 |
| 12 | 4 | 11 | 3 | 5th | 6 |
| 13 | 4 | 12 | 3 | 5th | 6 |
| 14 | 4 | 12 | 3 | 5th | 6 |
| 15 | 4 | 13 | 3 | 5th | 7 |
| 16 | 4 | 13 | 3 | 5th | 7 |
| 17 | 4 | 14 | 4 | 5th | 7 |
| 18 | 4 | 14 | 4 | 5th | 8 |
| 19 | 4 | 15 | 4 | 5th | 8 |
| 20 | 4 | 15 | 4 | 5th | 8 |

Slot level caps at 5th from level 9 onward. Slots max at 4 from level 17. ✓

Mystic Arcanum (1/long rest each, not pact slots) at levels 11/13/15/17 for 6th/7th/8th/9th level spells — tracked via `spellsKnownProgressionFixedByLevel`. ✓

- optionalfeatureProgression (Eldritch Invocations): `[0,2,2,2,3,3,4,4,5,5,5,6,6,6,7,7,7,8,8,8]` — 0 at L1, starts at 2 at L2. Max 8 invocations at L20. ✓
- optionalfeatureProgression (Pact Boon): `{ "3": 1 }` — one pact boon at level 3 (dict format, not array). ✓

### XPHB Warlock — Pact Magic (casterProgression: "pact")

Same pact system, same slot maxima. XPHB uses `preparedSpellsProgression` (not `spellsKnownProgression`).

| Level | Invocations | Cantrips | Prepared | Slots | Slot Level |
|-------|-------------|----------|---------|-------|------------|
| 1 | 1 | 2 | 2 | 1 | 1 |
| 2 | 3 | 2 | 3 | 2 | 1 |
| 3 | 3 | 2 | 4 | 2 | 2 |
| 4 | 3 | 3 | 5 | 2 | 2 |
| 5 | 5 | 3 | 6 | 2 | 3 |
| 6 | 5 | 3 | 7 | 2 | 3 |
| 7 | 6 | 3 | 8 | 2 | 4 |
| 8 | 6 | 3 | 9 | 2 | 4 |
| 9 | 7 | 3 | 10 | 2 | 5 |
| 10 | 7 | 4 | 10 | 2 | 5 |
| 11 | 7 | 4 | 11 | 3 | 5 |
| 12 | 8 | 4 | 11 | 3 | 5 |
| 13 | 8 | 4 | 12 | 3 | 5 |
| 14 | 8 | 4 | 12 | 3 | 5 |
| 15 | 9 | 4 | 13 | 3 | 5 |
| 16 | 9 | 4 | 13 | 3 | 5 |
| 17 | 9 | 4 | 14 | 4 | 5 |
| 18 | 10 | 4 | 14 | 4 | 5 |
| 19 | 10 | 4 | 15 | 4 | 5 |
| 20 | 10 | 4 | 15 | 4 | 5 |

Slot level caps at 5th from level 9. Slots max at 4 from level 17. Invocations start at 1 (L1), max at 10 (L20). ✓

XPHB optionalfeatureProgression (Eldritch Invocations): `[1,3,3,3,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10]` ✓

## Issues Found

1. **spellSlotProgression is null for Warlock**: The import field `spellSlotProgression` looks for `classTableGroups[n].rowsSpellProgression`. Warlock has no such field — pact slots are embedded in the raw `classTableGroups` rows. The import correctly stores `classTableGroups` raw, but `spellSlotProgression` will be null. Consuming code must extract pact slot data from `classTableGroups.rows` (col indices differ between PHB and XPHB). This is a known structural difference between pact casters and full/half casters.

2. **Genie subclass: multiple additionalSpells entries, import takes only [0]**: The Genie has 4 additionalSpells entries in an array (Dao, Djinni, Efreeti, Marid), one per genie kind. The import uses `sc.additionalSpells?.[0]`, capturing only the Dao variant spells. The 3 remaining kind-specific spell lists are silently dropped. Consuming code for character creation will need to handle genie kind selection separately (ideally from the full array). The Genie's Wrath feature text encodes the genie-kind dependency narratively.

3. **PHB Eldritch Invocations (level 2) has no options block**: The PHB feature is descriptive text; the invocation pool is driven by `optionalfeatureProgression.featureType: ["EI"]`. Consuming code must use the feature type system to look up available invocations, not scan for options refs in this feature's entries. ✓ (correct pattern, but differs from XPHB which enumerates all 28 invocations in options refs)

4. **XPHB Pact Boons are Eldritch Invocations**: In XPHB, Pact of the Chain, Blade, and Tome appear as `refOptionalfeature` entries in the "Eldritch Invocation Options" block (items 21-23). There is no separate "Pact Boon" feature in the XPHB class. This means XPHB has no `optionalfeatureProgression` entry with featureType `["PB"]`. Consuming code must not expect a separate pact boon selection step for XPHB warlocks.

5. **Two subclass features at same level (Fathomless L6, Great Old One Patron L10)**: Fathomless has Oceanic Soul + Guardian Coil both at level 6. XPHB Great Old One Patron has Eldritch Hex + Thought Shield both at level 10. Both are correctly encoded in subclassFeatures with duplicate level values. The import stores the full array; consuming code must handle multiple entries at the same subclass level.

6. **Genie's Vessel options block has no count field**: The `type: "options"` block inside Genie's Vessel contains 2 `refSubclassFeature` entries but no `count` field. All options are always available (not a pick-one). Same pattern as Bard's Blade Flourish. Consuming code must handle absent `count` as "display all."

7. **Slot level encoding in PHB classTableGroups**: The slot level column (index 3) stores `{@filter Nth|spells|level=N|class=Warlock}` strings, not plain integers. Consuming code must parse or strip the filter tag to extract the numeric slot level. XPHB stores plain integers (1–5) in column index 4. Different column structures between editions require edition-aware parsing.

8. **XPHB multiclassing missing cha requirement and weapon profs**: PHB multiclassing requires CHA 13 and grants light armor + simple weapons. XPHB multiclassing lists only `proficienciesGained: { armor: ["light"] }` — no ability score requirement and no weapon proficiencies. This is intentional per 2024 rules, but consuming code must handle the absent `requirements` field gracefully.

9. **PHB Eldritch Invocations progression starts at 0 for level 1**: `optionalfeatureProgression` for PHB Eldritch Invocations is `[0,2,2,2,3,3,...]` — index 0 (level 1) is 0. Invocations don't start until level 2. XPHB starts at 1 at level 1. Consuming code reading level N uses index N-1.

## Fixes Applied

None — this is a read-only verification. No source files were modified.
