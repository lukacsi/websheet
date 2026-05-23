# Roadmap: Notes & Multiclassing

Two feature areas that need to be nailed before WebSheet is ready.

---

## NOTE TAKING

### Current state (post-refactor)

- Tabs (NPCs/Quests/Loot/Locations) are source of truth as `NoteEntry[]`
- Mindmap nodes can link to tab entries via `linkedEntryId`
- Session Log is timestamped quick-add entries
- General tab is freeform textarea
- Persistence: JSON-stringified into PB `notes` text field

### Works
- Tab entries as accordions (name + detail)
- Mindmap tree: drag-drop reorder, indent/outdent, keyboard navigation, 6 node types
- Auto-link: typing a name in a typed mindmap node auto-creates the tab entry on blur
- Jump-to-tab from mindmap link icon
- Back-to-mindmap link from tabs
- Old string notes migrate to structured format

### Broken / Missing

#### Sync bugs
- **Delete mindmap node → tab entry orphaned** (no cascade)
- **Delete tab entry → mindmap node has dangling `linkedEntryId`** (no backref cleanup)
- **Rename tab entry → mindmap node text stale** (one-way sync only)
- **Rename mindmap node → tab entry name stale** (same, reverse)
- **Add tab entry directly → never appears in mindmap** (one-way creation only)

#### Navigation
- `handleNavigate(tab, entryId)` accepts entryId but drops it (`void entryId` TODO) — clicking link icon on mindmap node jumps to tab but doesn't scroll to or expand the linked accordion

#### Relationships
- No way to link NPC↔Quest↔Location (e.g., "Gandalf is in Moria quest at the Bridge")
- No cross-tab backref UI ("This NPC appears in: 2 quests, 1 location")
- Mindmap's tree hierarchy is the only relationship model, but a Quest node with NPC children ≠ "these NPCs are in this quest" — they're just tree-nested

#### Session Log
- Isolated from everything — no way to reference an NPC or Quest in a session entry
- No way to tag entries (combat / roleplay / discovery / loot gained)
- No session number grouping

### Rough edges

- No visual indicator on mindmap showing orphaned vs linked nodes
- Delete actions (tab entry, mindmap node) are silent — no confirmation
- "Add from Mindmap" messaging implies 1:1 parity but tab-only entries can exist

### Proposal: Nail the sync

**Two-way sync:**
1. Delete mindmap node with `linkedEntryId` → also remove tab entry
2. Delete tab entry → find all mindmap nodes with matching `linkedEntryId` and remove them (or just clear the link)
3. Rename mindmap node → update linked entry's `name`
4. Rename tab entry → update all mindmap nodes with matching `linkedEntryId` (text field)

**Two-way creation:**
5. "Pin to mindmap" button on tab entries → adds a root node to mindmap
6. "Link to existing entry" menu option on mindmap nodes → picker to attach `linkedEntryId` to an existing tab entry instead of creating new

**Navigation:**
7. When jumping from mindmap to tab, scroll accordion to the linked entry and expand it

**Session Log upgrades:**
8. `@mention` syntax in session log (e.g. `@Gandalf`) that auto-links to the NPC entry
9. Tag chips per entry (combat/roleplay/etc.)
10. Group by session number

**Relationship layer:**
11. `NoteEntry.links?: string[]` — array of other entry IDs for cross-references
12. On each entry detail view, show "Related: [list of other entries]" with clickable links

---

## MULTICLASSING

### Current state

- Data model supports it: `Character.classes: CharacterClass[]`
- Character.level is a single "total level across all classes" field
- `HitDice[]` array exists

### Works
- Data model is correct shape for multiclass
- `Character.level` drives proficiency bonus correctly (when kept in sync)

### Broken / Missing

#### Seven `.classes[0]` hardcodes — app is effectively single-class

1. `CharacterSheet.tsx:119,127` — class/subclass selects only touch `classes[0]`
2. `CharacterSheet.tsx:155-162` — header only shows first class
3. `useCharacterSheet.ts:92` — `currentClass` only resolves for `classes[0]`
4. `useCharacterSheet.ts:263` — subclass change only updates `classes[0]`
5. `FeaturesSection.tsx` — features fetched for `classes[0]` only
6. `CombatFeaturesSection.tsx` — same
7. `useCharacterSheet.ts` `handleClassChange` — replaces entire `classes` array (wipes multiclass)

#### Missing functionality

- **No level-up flow** — can't add a class level post-creation
- **No class add/remove UI** — can't go from Fighter 5 → Fighter 5/Wizard 1
- **Proficiencies overwritten on class change** — not merged
- **Features show only class[0]** — Fighter 3/Wizard 2 doesn't see Wizard features
- **Spell slots are single pool** — no PHB multiclass caster formula (full casters + ½ partial casters + ⅓ EK/AT)
- **Hit dice not per class** — created as single entry with `character.level` total
- **No ASI tracking per class** — ASIs happen at levels 4/8/12/16/19 *per class*, not total
- **No multiclass prerequisites** — PHB requires STR/DEX 13 for Fighter, DEX 13 for Rogue, etc.
- **No starting proficiencies vs multiclass proficiencies distinction** — PHB gives a reduced proficiency set when multiclassing (e.g. Fighter multiclass = light+medium armor + shields, NOT martial weapons)

### Proposal: Nail multiclass

**Phase 1 — De-hardcode:**
1. Replace all `.classes[0]` with iteration over `classes[]`
2. `FeaturesSection` / `CombatFeaturesSection` → fetch features for each class, group by class name
3. Header display → show all classes: "Fighter 3 / Wizard 2" (already done in Home.tsx + LoadCharacter — apply same pattern here)

**Phase 2 — Level-up flow:**
4. New component: `LevelUpModal` accessible from character sheet button
5. Options: "Level up existing class" (pick from current classes) or "Add new class" (class picker with multiclass prereqs)
6. Handles: increment `level`, increment selected class's `level`, grant HP (roll or avg), grant proficiencies (multiclass set), grant class features at new level

**Phase 3 — Derived stats:**
7. `computeSpellSlots(classes)` helper: PHB multiclass caster rules
   - Full casters (Bard/Cleric/Druid/Sorcerer/Wizard): level counts as-is
   - Half casters (Paladin/Ranger/Artificer): ½ level (round down, round up for Artificer at 1st level)
   - ⅓ casters (EK Fighter, AT Rogue): ⅓ level
   - Sum → look up slot progression
   - Warlock slots tracked separately (pact magic)
8. `computeHitDice(classes)` → array of `{die, total, used}` per class
9. `computeProficiencies(classes)` → merge from starting class + multiclass sets

**Phase 4 — Validation:**
10. Multiclass prereq check before adding a new class (warn or block)
11. ASI tracker per class

---

## Priorities

Given the user said "we need to nail note taking and multiclassing":

### Tier 1 (must-have)
- Notes two-way sync (delete cascade, rename propagation)
- Multiclass de-hardcode (remove `.classes[0]` everywhere)
- Level-up flow for existing class (simplest case first, no new class)

### Tier 2 (should-have)
- Notes: scroll-to-entry on navigate
- Notes: pin tab entry to mindmap, link to existing entry
- Multiclass: proper spell slot computation
- Multiclass: features from all classes shown

### Tier 3 (nice-to-have)
- Notes: session log @mentions
- Notes: relationship layer (entry.links)
- Multiclass: add new class with prereqs
- Multiclass: ASI tracker
