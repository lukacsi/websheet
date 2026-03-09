import type { EntityTagType } from '@/utils/parse-tags';
import pb from './pocketbase';

/** Fallback collections to try when primary lookup misses (e.g. @item can be an itemGroup) */
const COLLECTION_FALLBACKS: Partial<Record<EntityTagType, string[]>> = {
  item: ['item_groups'],
};

const COLLECTION_MAP: Record<EntityTagType, string | null> = {
  spell: 'spells',
  item: 'items',
  class: 'classes',
  subclass: 'subclasses',
  classFeature: 'class_features',
  subclassFeature: 'class_features',
  race: 'races',
  background: 'backgrounds',
  feat: 'feats',
  condition: 'conditions',
  skill: 'skills',
  variantrule: 'variantrules',
  action: 'actions',
  creature: 'creatures',
  optfeature: 'optionalfeatures',
  deity: 'deities',
  language: 'languages',
  sense: 'senses',
  disease: 'conditions',
  reward: 'rewards',
  table: 'tables_data',
  card: 'cards',
  deck: 'decks',
  vehicle: 'vehicles',
  vehupgrade: 'vehicle_upgrades',
  hazard: 'trapshazards',
  trap: 'trapshazards',
  object: 'objects',
  facility: 'bastions',
  charoption: 'charcreationoptions',
  cult: 'cultsboons',
  boon: 'cultsboons',
  psionic: 'psionics',
  recipe: 'recipes',
  itemProperty: 'item_properties',
  itemMastery: 'item_masteries',
};

function escapeFilter(s: string): string {
  return s.replace(/"/g, '\\"');
}

export async function lookupEntity(
  tagType: EntityTagType,
  name: string,
  source?: string,
): Promise<Record<string, unknown> | null> {
  const collection = COLLECTION_MAP[tagType];
  if (!collection) return null;

  // Use ~ (case-insensitive contains) for name matching — PB stores "Acrobatics"
  // but Skill types use "acrobatics", "sleight of hand" vs "Sleight of Hand", etc.
  let filter: string;
  if (source) {
    filter = `name~"${escapeFilter(name)}" && source="${escapeFilter(source)}"`;
  } else {
    filter = `name~"${escapeFilter(name)}"`;
  }

  try {
    const records = await pb.collection(collection).getList(1, 1, {
      filter,
      sort: source ? undefined : '-edition',
    });
    if (records.items[0]) return records.items[0] as unknown as Record<string, unknown>;
  } catch {
    // primary lookup failed
  }

  // Try fallback collections (e.g. @item → item_groups)
  const fallbacks = COLLECTION_FALLBACKS[tagType];
  if (fallbacks) {
    for (const fb of fallbacks) {
      try {
        const records = await pb.collection(fb).getList(1, 1, {
          filter,
          sort: source ? undefined : '-edition',
        });
        if (records.items[0]) return records.items[0] as unknown as Record<string, unknown>;
      } catch {
        // fallback failed
      }
    }
  }

  return null;
}

/** Fetch all class features for a given class, sorted by level */
export async function fetchClassFeatures(
  className: string,
  classSource: string,
): Promise<Record<string, unknown>[]> {
  try {
    const records = await pb.collection('class_features').getFullList({
      filter: `className="${escapeFilter(className)}" && classSource="${escapeFilter(classSource)}" && isSubclassFeature=false`,
      sort: 'level,name',
    });
    return records as unknown as Record<string, unknown>[];
  } catch {
    return [];
  }
}

/** Fetch subclass features for a given subclass, sorted by level */
export async function fetchSubclassFeatures(
  className: string,
  classSource: string,
  subclassShortName: string,
): Promise<Record<string, unknown>[]> {
  try {
    const records = await pb.collection('class_features').getFullList({
      filter: `className="${escapeFilter(className)}" && classSource="${escapeFilter(classSource)}" && subclassName="${escapeFilter(subclassShortName)}" && isSubclassFeature=true`,
      sort: 'level,name',
    });
    return records as unknown as Record<string, unknown>[];
  } catch {
    return [];
  }
}
