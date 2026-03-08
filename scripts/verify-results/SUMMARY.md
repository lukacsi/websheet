# Batch Verification Summary — All 12 Classes

## Phase 1 Changes Applied

1. **Subclass selector** added to CharacterSheet header (dropdown, auto-populates spells)
2. **`additionalSpells`** field added to Subclass type, import, and PB migration
3. **`source` field** added to `CharacterSpell` for tracking spell origin
4. **Full array storage** — import stores entire `additionalSpells[]` array, not just `[0]`
5. **Spell name normalization** — `split('|')[0]` strips source suffixes (e.g. `"blur|xphb"` → `"blur"`)

## Already Fixed Issues

| Issue | Affected Classes | Fix |
|-------|-----------------|-----|
| `additionalSpells[0]` truncation | Druid (Land: 8 variants), Warlock (Genie: 4 kinds), Sorcerer (Divine Soul: 5 alignments), Barbarian (Giant: 2 cantrips), Fighter (Arcane Archer: 2 cantrips) | Store full array |

## Catalog of Remaining Issues (Future Work)

### HIGH — Data Import Gaps

| Issue | Detail | Affected |
|-------|--------|----------|
| Subclass `casterProgression` not imported | Eldritch Knight (1/3), Arcane Trickster (1/3) lose caster type | Fighter, Rogue |
| `spellsKnownProgression` not imported | PHB known-spell caps per level | Sorcerer, Bard, Ranger |
| Pact slot progression null | Warlock needs custom `classTableGroups` parsing | Warlock |
| `optionalfeatureProgression` not imported | Fighting Style pools (FS:F, FS:R), maneuvers, invocations, disciplines | Fighter, Ranger, Paladin, Monk, Warlock |

### MEDIUM — Feature Detection Gaps

| Issue | Detail | Affected |
|-------|--------|----------|
| `refFeat` not detected | XPHB Fighting Style uses `refFeat` instead of `refOptionalfeature` | Fighter, Paladin, Ranger (XPHB) |
| Options blocks without `count` | Code defaults `count ?? 1`, works for single-choice but wrong for "display all" | Bard (Blade Flourish), Monk (Drunken Master, Kensei), Warlock (Genie's Vessel), Sorcerer (TCE Metamagic) |
| Inline choice entries | XPHB uses `type: "entries"` instead of `type: "options"` with refs | Barbarian (Wild Heart) |
| Totem Warrior lookup ambiguity | Same feature name at different levels (Bear L3/L6/L14) | Barbarian |
| Blessed Strikes not in `options` block | Cleric L7 choice uses plain `refClassFeature` inside `type: "entries"` | Cleric (XPHB) |

### LOW — Missing Fields (non-blocking)

| Field | Detail |
|-------|--------|
| `featProgression` | XPHB Fighting Style (feat-based) and Epic Boons |
| `preparedSpellsChange` | XPHB formula-based prepared spell counts |
| `preparedSpells` formula | PHB `"<$level$> + <$wis_mod$>"` strings |
| `subclassTableGroups` | Eldritch Knight/Arcane Trickster slot tables, Psi Warrior dice |

## Per-Class Report Status

| Class | Report | Issues | Critical |
|-------|--------|--------|----------|
| Barbarian | ✓ | 4 | additionalSpells[0] (fixed) |
| Bard | ✓ | 7 | None blocking |
| Cleric | ✓ | 5 | None blocking |
| Druid | ✓ | 1 critical | additionalSpells[0] (fixed) |
| Fighter | ✓ | 5 | Eldritch Knight casterProgression |
| Monk | ✓ | 3 | None blocking |
| Paladin | ✓ | 4 | None blocking |
| Ranger | ✓ | 5 | XPHB artificer casterProgression |
| Rogue | ✓ | 4 | Arcane Trickster casterProgression |
| Sorcerer | ✓ | 4 | additionalSpells[0] (fixed), spellsKnownProgression |
| Warlock | ✓ | 5 | additionalSpells[0] (fixed), pact slots |
| Wizard | ✓ | 3 | None blocking |
