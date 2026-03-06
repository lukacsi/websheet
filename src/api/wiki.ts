import type { EntityTagType } from '@/utils/parse-tags';
import pb from './pocketbase';

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

  let filter: string;
  if (source) {
    filter = `name="${escapeFilter(name)}" && source="${escapeFilter(source)}"`;
  } else {
    // Prefer edition="one" (2024 rules) when no source given
    filter = `name="${escapeFilter(name)}"`;
  }

  try {
    const records = await pb.collection(collection).getList(1, 1, {
      filter,
      sort: source ? undefined : '-edition',
    });
    return records.items[0] as unknown as Record<string, unknown> ?? null;
  } catch {
    return null;
  }
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
