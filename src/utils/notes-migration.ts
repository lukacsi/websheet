/**
 * Migrate CharacterNotes across versions into the unified entry pool shape.
 *
 * Shapes handled:
 *   v1: notes = string (raw general text)
 *   v2: notes = { session[], npcs: string, quests: string, loot: string, general: string }
 *   v3: notes = { session[], npcs: NoteEntry[], quests: NoteEntry[], loot: NoteEntry[], locations: NoteEntry[], general, mindmap[] }
 *   v4: notes = { session[], entries: NoteEntry[], general, mindmap[] }   <- current
 */

import type { CharacterNotes, NoteEntry, NoteEntryType, MindMapNode, MindMapNodeType } from '@/types/character';

const nowIso = () => new Date().toISOString();

function firstLine(text: string): string {
  const line = (text ?? '').split('\n')[0].trim();
  return line.length > 60 ? line.slice(0, 57) + '…' : line;
}

function newEntry(type: NoteEntryType, name: string, detail = '', checked?: boolean): NoteEntry {
  const ts = nowIso();
  return {
    id: crypto.randomUUID(),
    type,
    name: name || 'Unnamed',
    detail,
    checked,
    createdAt: ts,
    updatedAt: ts,
  };
}

const EMPTY_NOTES: CharacterNotes = {
  entries: [],
  general: '',
};

export function normalizeNotes(raw: string | CharacterNotes | undefined | null): CharacterNotes {
  if (!raw) return { ...EMPTY_NOTES };

  // PocketBase text field round-tripping
  if (typeof raw === 'string') {
    if (raw.trim().startsWith('{')) {
      try {
        return normalizeNotes(JSON.parse(raw));
      } catch {
        return { ...EMPTY_NOTES, general: raw };
      }
    }
    return { ...EMPTY_NOTES, general: raw };
  }

  const result: CharacterNotes = {
    ...EMPTY_NOTES,
    entries: [...(raw.entries ?? [])],
    general: raw.general ?? '',
  };

  // Drain legacy session log entries into pool as type='session'
  if (Array.isArray(raw.session)) {
    for (const s of raw.session) {
      result.entries.push({
        id: s.id ?? crypto.randomUUID(),
        type: 'session',
        name: firstLine(s.text) || 'Session note',
        detail: s.text,
        createdAt: s.timestamp ?? nowIso(),
        updatedAt: s.timestamp ?? nowIso(),
      });
    }
  }

  // Drain legacy per-type fields into unified pool
  const drainLegacy = (field: 'npcs' | 'quests' | 'loot' | 'locations', type: NoteEntryType) => {
    const legacy = raw[field];
    if (!legacy) return;
    if (typeof legacy === 'string') {
      // v2 plain string — single imported entry
      if (legacy.trim()) {
        result.entries.push(newEntry(type, `Imported ${field}`, legacy));
      }
    } else if (Array.isArray(legacy)) {
      // v3 NoteEntry[] — upgrade each entry with new fields
      for (const e of legacy) {
        result.entries.push({
          id: e.id ?? crypto.randomUUID(),
          type,
          name: e.name ?? 'Unnamed',
          detail: e.detail ?? '',
          checked: e.checked,
          createdAt: e.createdAt ?? nowIso(),
          updatedAt: e.updatedAt ?? nowIso(),
        } as NoteEntry);
      }
    }
    delete (result as unknown as Record<string, unknown>)[field];
  };

  drainLegacy('npcs', 'npc');
  drainLegacy('quests', 'quest');
  drainLegacy('loot', 'loot');
  drainLegacy('locations', 'location');

  // Dedupe entries by id (defensive)
  const seen = new Set<string>();
  result.entries = result.entries.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  // Legacy parentId/order on entries → convert to 'contains' links on the parent
  const legacyParents = new Map<string, Array<{ childId: string; order: number }>>();
  for (const e of result.entries) {
    const anyE = e as NoteEntry & { parentId?: string; order?: number };
    if (anyE.parentId) {
      const list = legacyParents.get(anyE.parentId) ?? [];
      list.push({ childId: e.id, order: anyE.order ?? 0 });
      legacyParents.set(anyE.parentId, list);
    }
  }
  for (const [parentId, kids] of legacyParents) {
    const parent = result.entries.find((e) => e.id === parentId);
    if (!parent) continue;
    kids.sort((a, b) => a.order - b.order);
    const existingContains = new Set(
      (parent.links ?? []).filter((l) => l.kind === 'contains').map((l) => l.targetId),
    );
    const newLinks = [...(parent.links ?? [])];
    for (const k of kids) {
      if (!existingContains.has(k.childId)) {
        newLinks.push({ targetId: k.childId, kind: 'contains' });
      }
    }
    parent.links = newLinks;
  }
  // Strip the legacy fields
  result.entries = result.entries.map((e) => {
    const { parentId: _pid, order: _ord, ...rest } = e as NoteEntry & { parentId?: string; order?: number };
    void _pid; void _ord;
    return rest;
  });

  // Legacy mindmap tree → contains links
  if (Array.isArray(raw.mindmap)) {
    const existingIds = new Set(result.entries.map((e) => e.id));
    const mmTypeToEntry: Record<MindMapNodeType, NoteEntryType> = {
      note: 'note', npc: 'npc', quest: 'quest', location: 'location', loot: 'loot', session: 'session',
    };

    const resolveNodeToEntryId = (n: MindMapNode): string => {
      // If linked to an existing entry, reuse it
      if (n.linkedEntryId && existingIds.has(n.linkedEntryId)) return n.linkedEntryId;
      // Otherwise create a new entry
      const id = n.linkedEntryId && !existingIds.has(n.linkedEntryId) ? n.linkedEntryId : n.id;
      result.entries.push({
        id,
        type: mmTypeToEntry[n.type] ?? 'note',
        name: n.text || 'Unnamed',
        detail: n.detail ?? '',
        checked: n.checked,
        createdAt: n.timestamp ?? nowIso(),
        updatedAt: n.timestamp ?? nowIso(),
      });
      existingIds.add(id);
      return id;
    };

    const walk = (nodes: MindMapNode[], parentEntryId?: string) => {
      for (const n of nodes) {
        const entryId = resolveNodeToEntryId(n);
        if (parentEntryId) {
          const parent = result.entries.find((e) => e.id === parentEntryId);
          if (parent) {
            const already = (parent.links ?? []).some((l) => l.kind === 'contains' && l.targetId === entryId);
            if (!already) parent.links = [...(parent.links ?? []), { targetId: entryId, kind: 'contains' }];
          }
        }
        if (n.children?.length) walk(n.children, entryId);
      }
    };
    walk(raw.mindmap);
  }

  delete (result as unknown as Record<string, unknown>).mindmap;
  delete (result as unknown as Record<string, unknown>).session;

  return result;
}

/** Find an entry by id in the flat pool */
export function findEntry(entries: NoteEntry[], id: string): NoteEntry | undefined {
  return entries.find((e) => e.id === id);
}

/** Filter entries by type */
export function entriesByType(entries: NoteEntry[], type: NoteEntryType): NoteEntry[] {
  return entries.filter((e) => e.type === type);
}
