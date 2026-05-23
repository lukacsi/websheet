# Code Review — 2026-04-15

Full codebase review of WebSheet (React 18 + Vite + TS + Mantine + PocketBase).

## HIGH Severity (5)

### 1. Passphrase protection is unsalted SHA-256
- **File:** `src/utils/passphrase.ts:2-8`
- **Risk:** Hash is stored in PB `characters` (open read rules). Offline dictionary attack against unsalted SHA-256 is trivial (hashcat mode 1400). 4-char minimum gives tiny keyspace.
- **Fix:** PBKDF2 with per-character random salt (stored as `passphraseSalt` on the record), 100k+ iterations via `window.crypto.subtle.deriveKey('PBKDF2', ...)`. OR document explicitly that this is obscurity-only.

### 2. Stale `savedId` closure in `save`
- **File:** `src/hooks/useCharacterSheet.ts:159-190`
- **Risk:** `save` reads `savedId` from closure. `update` uses `savedIdRef.current` correctly, but `save` itself can race — two rapid calls after initial create could both hit the create branch.
- **Fix:** Inside `save`, branch on `savedIdRef.current` instead of closure `savedId`.

### 3. `notes` union type leaks serialization to domain
- **Files:** `src/types/character.ts:209`, `src/hooks/useCharacterSheet.ts:161`
- **Risk:** `notes: string | CharacterNotes` forces every consumer to defensively normalize. New components bypassing `normalize()` will crash at runtime with TS not catching it.
- **Fix:** Keep `notes: CharacterNotes` in domain. Add `toRecordPayload(char)` at API boundary that stringifies.

### 4. `LoadCharacter` uses inline filter escape instead of `escapeFilter`
- **File:** `src/pages/LoadCharacter.tsx:74`
- **Risk:** Identical logic today but will silently drift if `escapeFilter` is hardened.
- **Fix:** Import `escapeFilter` from `src/api/wiki.ts`.

### 5. `CreatureDetail` uses `any`
- **File:** `src/components/wiki/details/CreatureDetail.tsx:165,229,244,259,274,289`
- **Risk:** Only file in codebase with `any`. Array maps throw if fields absent.
- **Fix:** Define `CreatureRecord` in `src/types/creature.ts`. Add null guards before `.map()`.

## MEDIUM Severity (10)

### 6. `portraitUrl` rendered as `<img src>` with no scheme validation
- **File:** `src/components/sheet/AppearanceSection.tsx:41-60`
- **Fix:** Validate `^https?://` before rendering.

### 7. Open PB rules undocumented in code
- **Fix:** Add comment near `src/api/pocketbase.ts` noting all collections have open rules.

### 8. `handleBackgroundChange` makes 8+ sequential HTTP calls with no cancellation
- **File:** `src/hooks/useCharacterSheet.ts:314-376`
- **Fix:** Parallelize with `Promise.allSettled`, add cancellation flag.

### 9. `useCharacterSheet` is 457 lines and owns 5 PB hooks + dropdown logic + rest actions + AC calc
- **Fix:** Split into `useCharacterPersistence`, `useCharacterDropdowns`. Inline AC `useMemo` into `CombatSidebar`.

### 10. `CombatFeaturesSection` has 3 overlapping `useEffect` hooks with redundant fetches and premature loading=false
- **File:** `src/components/sheet/CombatFeaturesSection.tsx:71-235`
- **Fix:** Merge into single effect with counter-based loading.

### 11. `importCharacter` validates only 6 field keys, no types
- **File:** `src/utils/character-import.ts:22-42`
- **Fix:** Use existing Zod dep to validate full shape.

### 12. `as unknown as` casts leak out of API layer into components
- **Fix:** Confine casts to `src/api/` functions that return typed objects.

### 13. `normalize(notes)` runs on every render (parses JSON on every keystroke)
- **File:** `src/components/sheet/NotesSection.tsx:195`
- **Fix:** `const data = useMemo(() => normalize(notes), [notes])`.

### 14. `MindMap` NodeRow prop-drills 10 props through recursion
- **Fix:** Local React context scoped to `MindMap` for drag/focus state.

### 15. `CharacterSheet.tsx` is 570 lines, mixes header + modal + tab routing
- **Fix:** Extract `CharacterSheetHeader` and `PassphraseModal` components.

## LOW Severity (5)

### 16. `handleCreateWithPassphrase` race between `update()` and `save()`
- **File:** `src/pages/CharacterSheet.tsx:53-74`
- **Fix:** Remove the redundant `update({ passphraseHash: hash })`, keep only `save(charWithHash)`.

### 17. `CombatFeaturesSection` feat filter uses `id='${id}'` not `escapeFilter`
- **File:** `src/components/sheet/CombatFeaturesSection.tsx:121,218`
- **Fix:** Pattern consistency.

### 18. `indentNode` confusing variable naming suggests off-by-one
- **File:** `src/components/sheet/MindMap.tsx:62-77`
- **Fix:** Use `before[before.length - 1]` instead of `before[i - 1]`.

### 19. Dead `entryId` param in `handleNavigate` (TODO suppressed)
- **File:** `src/components/sheet/NotesSection.tsx:230-234`
- **Fix:** Either implement scroll-to-entry or remove param threading.

### 20. `useItems()` fetches full items collection to compute AC for 0-5 equipped items
- **File:** `src/hooks/useCharacterSheet.ts:420-433`
- **Fix:** Filter by equipped IDs, or cache `ac`/`type` on `CharacterItem` at add-time.

## Green Flags (no action)

- `escapeFilter` consistently applied in `wiki.ts`, `classes.ts`, `QuickSearch`, `Lookup`
- No `dangerouslySetInnerHTML` anywhere
- `useEffect` cancellation pattern applied consistently
- `TaggedText` renders as React text nodes (no XSS surface from D&D data)
- TS strict mode, only one file with `any`

## No tests

There is no `__tests__/`, `*.test.ts`, or `*.spec.ts` anywhere. Candidates for first tests:
- `src/utils/derived-stats.ts` — pure functions
- `src/utils/passphrase.ts` — security critical
- `src/components/sheet/MindMap.tsx` tree ops (`indentNode`, `outdentNode`, `moveUp`, `moveDown`) — subtle edge cases

## Priority Order

1. Passphrase security (highest real-world risk)
2. `save` stale closure
3. `notes` union type cleanup
4. `LoadCharacter` escapeFilter
5. `importCharacter` Zod validation
