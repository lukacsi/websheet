/** Pure utility functions extracted from FeaturesSection. */

import type { Entry, EntryObject } from '@/types';
import { findOptionsBlocks } from '@/components/create/FeatureChoicePicker';

/** Detect subclass placeholder features (e.g. "Sorcerer Subclass", "Path Feature") */
export function isSubclassPlaceholder(f: { name: string; entries: Entry[] }): boolean {
  if (f.name === 'Subclass Feature' || f.name === 'Subclass feature' || f.name.endsWith(' Subclass')) return true;
  if (f.entries.length <= 2 && f.entries.every((e) => typeof e === 'string')) {
    const text = (f.entries[0] as string).toLowerCase();
    if (text.includes('you gain a feature from your') || text.includes('you gain a feature granted by your')) return true;
    if (/you choose (a |an |to )/.test(text) && /subclass|path|college|domain|circle|archetype|origin|patron|tradition|oath|way|conclave/i.test(text)) return true;
  }
  return false;
}

/** Collect names of features referenced inside options blocks (sub-features like Protector, Thaumaturge) */
export function collectOptionFeatureNames(features: { entries: Entry[] }[]): Set<string> {
  const names = new Set<string>();
  for (const f of features) {
    for (const block of findOptionsBlocks('', f.entries)) {
      for (const choice of block.choices) {
        names.add(choice.name);
      }
    }
  }
  return names;
}

/** A list-based choice block in entries (e.g. Gnomish Lineage: Forest Gnome / Rock Gnome) */
export interface ListChoiceBlock {
  parentName: string;
  items: { name: string; entries: Entry[] }[];
}

/** Find list-based choice blocks in entries */
export function findListChoiceBlocks(entries: Entry[]): ListChoiceBlock[] {
  const blocks: ListChoiceBlock[] = [];
  for (const entry of entries) {
    if (typeof entry === 'string') continue;
    const obj = entry as EntryObject;
    if (obj.type === 'entries' && obj.name && obj.entries) {
      for (const child of obj.entries) {
        if (typeof child === 'string') continue;
        const c = child as EntryObject;
        if (c.type === 'list' && c.items?.length) {
          const items: { name: string; entries: Entry[] }[] = [];
          for (const item of c.items) {
            if (typeof item === 'string') continue;
            const it = item as EntryObject;
            if (it.type === 'item' && it.name && it.entries) {
              items.push({ name: it.name, entries: it.entries });
            }
          }
          if (items.length >= 2) {
            blocks.push({ parentName: obj.name, items });
          }
        }
      }
      blocks.push(...findListChoiceBlocks(obj.entries));
    }
  }
  return blocks;
}

/** Strip list choice blocks from entries (replace with just the selected item's content) */
export function stripListChoiceEntries(entries: Entry[], selectedName: string | undefined): Entry[] {
  return entries.reduce<Entry[]>((acc, entry) => {
    if (typeof entry === 'string') { acc.push(entry); return acc; }
    const obj = entry as EntryObject;
    if (obj.type === 'list' && obj.items?.length) {
      const items = obj.items.filter((it): it is EntryObject =>
        typeof it !== 'string' && (it as EntryObject).type === 'item' && !!(it as EntryObject).name
      );
      if (items.length >= 2 && selectedName) {
        const selected = items.find((it) => (it as EntryObject).name === selectedName);
        if (selected) {
          acc.push({ type: 'entries', name: (selected as EntryObject).name, entries: (selected as EntryObject).entries ?? [] });
          return acc;
        }
      }
    }
    if (obj.entries) {
      acc.push({ ...obj, entries: stripListChoiceEntries(obj.entries, selectedName) });
    } else {
      acc.push(entry);
    }
    return acc;
  }, []);
}

/** Recursively extract all text from an Entry array for search matching */
export function extractEntryText(entries: Entry[]): string {
  const parts: string[] = [];
  for (const e of entries) {
    if (typeof e === 'string') { parts.push(e); continue; }
    const obj = e as EntryObject;
    if (obj.name) parts.push(obj.name);
    if (obj.entry) parts.push(obj.entry);
    if (obj.entries) parts.push(extractEntryText(obj.entries));
    if (obj.items) parts.push(extractEntryText(obj.items));
  }
  return parts.join(' ');
}
