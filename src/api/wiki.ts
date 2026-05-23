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

export function escapeFilter(s: string): string {
  return s.replace(/"/g, '\\"');
}

export async function lookupEntity(
  tagType: EntityTagType,
  name: string,
  source?: string,
  edition?: 'one' | 'classic',
): Promise<Record<string, unknown> | null> {
  const collection = COLLECTION_MAP[tagType];
  if (!collection) return null;

  const escaped = escapeFilter(name);
  const editionSort = edition === 'classic' ? 'edition' : '-edition';

  // Try exact name match first (case-insensitive), then fall back to contains
  const filters: string[] = [];
  if (source) {
    filters.push(`name="${escaped}" && source="${escapeFilter(source)}"`);
    filters.push(`name~"${escaped}" && source="${escapeFilter(source)}"`);
  } else if (edition) {
    filters.push(`name="${escaped}" && edition="${edition}"`);
    filters.push(`name="${escaped}"`);
    filters.push(`name~"${escaped}" && edition="${edition}"`);
    filters.push(`name~"${escaped}"`);
  } else {
    filters.push(`name="${escaped}"`);
    filters.push(`name~"${escaped}"`);
  }

  for (const filter of filters) {
    try {
      const records = await pb.collection(collection).getList(1, 1, {
        filter,
        sort: source ? undefined : editionSort,
      });
      if (records.items[0]) return records.items[0] as unknown as Record<string, unknown>;
    } catch {
      // try next filter
    }
  }

  // Try fallback collections (e.g. @item → item_groups)
  const fallbacks = COLLECTION_FALLBACKS[tagType];
  if (fallbacks) {
    for (const fb of fallbacks) {
      for (const filter of filters) {
        try {
          const records = await pb.collection(fb).getList(1, 1, {
            filter,
            sort: source ? undefined : editionSort,
          });
          if (records.items[0]) return records.items[0] as unknown as Record<string, unknown>;
        } catch {
          // try next
        }
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
