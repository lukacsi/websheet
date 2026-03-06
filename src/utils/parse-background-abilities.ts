import type { AbilityKey } from '@/types';
import type { Entry, EntryObject } from '@/types';

const NAME_TO_KEY: Record<string, AbilityKey> = {
  'Strength': 'str',
  'Dexterity': 'dex',
  'Constitution': 'con',
  'Intelligence': 'int',
  'Wisdom': 'wis',
  'Charisma': 'cha',
};

/**
 * Parse eligible ability score keys from a 2024 background's entries.
 *
 * Looks for an item entry with name "Ability Scores:" inside entries[0].items[],
 * then parses the entry text like "Constitution, Intelligence, Wisdom"
 * into AbilityKey[].
 */
export function parseBackgroundAbilities(entries: Entry[]): AbilityKey[] {
  for (const entry of entries) {
    if (typeof entry === 'string') continue;
    const obj = entry as EntryObject;

    // Check items directly on this entry (e.g. entries[0] is a list with items)
    if (obj.items) {
      const found = findAbilityScoresItem(obj.items);
      if (found.length > 0) return found;
    }

    // Check nested entries
    if (obj.entries) {
      const result = parseBackgroundAbilities(obj.entries);
      if (result.length > 0) return result;
    }
  }

  return [];
}

function findAbilityScoresItem(items: Entry[]): AbilityKey[] {
  for (const item of items) {
    if (typeof item === 'string') continue;
    const obj = item as EntryObject;
    if (obj.name === 'Ability Scores:' && typeof obj.entry === 'string') {
      return parseAbilityNames(obj.entry);
    }
  }
  return [];
}

function parseAbilityNames(text: string): AbilityKey[] {
  return text
    .split(',')
    .map(s => s.trim())
    .map(s => NAME_TO_KEY[s])
    .filter((k): k is AbilityKey => k !== undefined);
}
