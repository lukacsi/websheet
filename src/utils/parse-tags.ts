/** Entity tag types — these map to PocketBase collections and are clickable */
export type EntityTagType =
  | 'spell' | 'item' | 'class' | 'subclass' | 'classFeature' | 'subclassFeature'
  | 'race' | 'background' | 'feat' | 'condition' | 'skill' | 'variantrule'
  | 'action' | 'creature' | 'optfeature' | 'deity' | 'language' | 'sense'
  | 'disease' | 'reward' | 'table' | 'card' | 'deck' | 'vehicle' | 'vehupgrade'
  | 'hazard' | 'trap' | 'object' | 'facility' | 'charoption' | 'cult' | 'boon'
  | 'psionic' | 'recipe' | 'itemProperty' | 'itemMastery';

/** Display tag types — styled inline text, not clickable */
export type DisplayTagType =
  | 'damage' | 'dice' | 'scaledamage' | 'scaledice'
  | 'hit' | 'd20' | 'chance'
  | 'b' | 'i' | 'bold' | 'italic'
  | 'filter' | 'note' | 'status'
  | 'dc' | 'atk' | 'atkr' | 'recharge'
  | 'actSave' | 'actSaveFail' | 'actSaveFailBy' | 'actResponse'
  | 'hitYourSpellAttack' | 'dcYourSpellSave' | 'savingThrow' | 'skillCheck'
  | 'color' | 'unit'
  | 's' | 'strike' | 'u' | 'underline'
  | 'sup' | 'sub' | 'highlight' | 'font' | 'tip'
  | 'coinflip' | 'code' | 'kbd' | 'autodice' | 'ability';

export type TagSegment =
  | { kind: 'text'; value: string }
  | { kind: 'entity'; tagType: EntityTagType; name: string; source?: string; displayText?: string }
  | { kind: 'display'; tagType: DisplayTagType; value: string; extra?: string };

const ENTITY_TAGS = new Set<string>([
  'spell', 'item', 'class', 'subclass', 'classFeature', 'subclassFeature',
  'race', 'background', 'feat', 'condition', 'skill', 'variantrule',
  'action', 'creature', 'optfeature', 'deity', 'language', 'sense',
  'disease', 'reward', 'table', 'card', 'deck', 'vehicle', 'vehupgrade',
  'hazard', 'trap', 'object', 'facility', 'charoption', 'cult', 'boon',
  'psionic', 'recipe', 'itemProperty', 'itemMastery',
]);

const DISPLAY_TAGS = new Set<string>([
  'damage', 'dice', 'scaledamage', 'scaledice',
  'hit', 'd20', 'chance',
  'b', 'i', 'bold', 'italic',
  'filter', 'note', 'status',
  'dc', 'atk', 'atkr', 'recharge',
  'actSave', 'actSaveFail', 'actSaveFailBy', 'actResponse',
  'hitYourSpellAttack', 'dcYourSpellSave', 'savingThrow', 'skillCheck',
  'color', 'unit',
  's', 'strike', 'u', 'underline',
  'sup', 'sub', 'highlight', 'font', 'tip',
  'coinflip', 'code', 'kbd', 'autodice', 'ability',
]);

const TAG_RE = /\{@(\w+) ([^}]+)\}/g;

export function parseTags(text: string): TagSegment[] {
  const segments: TagSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TAG_RE)) {
    const before = text.slice(lastIndex, match.index);
    if (before) segments.push({ kind: 'text', value: before });

    const tagType = match[1];
    const inner = match[2];

    if (ENTITY_TAGS.has(tagType)) {
      const parts = inner.split('|');
      segments.push({
        kind: 'entity',
        tagType: tagType as EntityTagType,
        name: parts[0],
        source: parts[1] || undefined,
        displayText: parts[2] || undefined,
      });
    } else if (DISPLAY_TAGS.has(tagType)) {
      const parts = inner.split('|');
      segments.push({
        kind: 'display',
        tagType: tagType as DisplayTagType,
        value: parts[0],
        extra: parts[1] || undefined,
      });
    } else {
      // Unknown tag type — extract display name and render as plain text
      const parts = inner.split('|');
      segments.push({ kind: 'text', value: parts[0] });
    }

    lastIndex = match.index! + match[0].length;
  }

  const tail = text.slice(lastIndex);
  if (tail) segments.push({ kind: 'text', value: tail });

  return segments;
}
