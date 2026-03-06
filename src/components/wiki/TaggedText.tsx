import { Text } from '@mantine/core';
import { parseTags, type DisplayTagType } from '@/utils/parse-tags';
import { WikiLink } from './WikiLink';

interface TaggedTextProps {
  text: string;
}

const ATK_LABELS: Record<string, string> = {
  mw: 'Melee Weapon Attack:',
  rw: 'Ranged Weapon Attack:',
  ms: 'Melee Spell Attack:',
  rs: 'Ranged Spell Attack:',
  'mw,rw': 'Melee or Ranged Weapon Attack:',
  'ms,rs': 'Melee or Ranged Spell Attack:',
};

function renderDisplayTag(tagType: DisplayTagType, value: string, extra?: string, key?: number) {
  switch (tagType) {
    // Text formatting
    case 'b':
    case 'bold':
      return <strong key={key}>{value}</strong>;
    case 'i':
    case 'italic':
      return <em key={key}>{value}</em>;
    case 's':
    case 'strike':
      return <s key={key}>{value}</s>;
    case 'u':
    case 'underline':
      return <u key={key}>{value}</u>;
    case 'sup':
      return <sup key={key}>{value}</sup>;
    case 'sub':
      return <sub key={key}>{value}</sub>;
    case 'code':
      return <code key={key}>{value}</code>;
    case 'kbd':
      return <kbd key={key} style={{ padding: '1px 4px', border: '1px solid var(--mantine-color-dark-4)', borderRadius: 3, fontSize: '0.85em' }}>{value}</kbd>;
    case 'highlight':
      return <mark key={key}>{value}</mark>;
    case 'color':
      return <span key={key} style={{ color: extra ? `#${extra}` : undefined }}>{value}</span>;
    case 'font':
      return <span key={key} style={{ fontFamily: extra || undefined }}>{value}</span>;

    // D&D mechanical tags
    case 'dc':
      return <Text key={key} component="span" size="sm" fw={700}>DC {value}</Text>;
    case 'atk':
      return <Text key={key} component="span" size="sm" fs="italic" fw={700}>{ATK_LABELS[value] ?? value}</Text>;
    case 'atkr':
      return <Text key={key} component="span" size="sm" fs="italic" fw={700}>{ATK_LABELS[value] ?? value}</Text>;
    case 'recharge':
      return <Text key={key} component="span" size="sm">(Recharge {value === '6' ? '6' : `${value}\u20136`})</Text>;
    case 'actSave':
      return <Text key={key} component="span" size="sm" fw={600}>{value} saving throw</Text>;
    case 'actSaveFail':
    case 'actSaveFailBy':
    case 'actResponse':
      return <Text key={key} component="span" size="sm" fs="italic">{value}</Text>;
    case 'hitYourSpellAttack':
      return <Text key={key} component="span" size="sm" fw={600}>your spell attack modifier</Text>;
    case 'dcYourSpellSave':
      return <Text key={key} component="span" size="sm" fw={600}>your spell save DC</Text>;
    case 'savingThrow':
    case 'skillCheck':
      return <Text key={key} component="span" size="sm" fw={600}>{value}</Text>;

    // Dice/number tags
    case 'damage':
    case 'dice':
    case 'scaledamage':
    case 'scaledice':
    case 'autodice':
      return <Text key={key} component="span" size="sm" ff="monospace">{value}</Text>;
    case 'hit':
      return <Text key={key} component="span" size="sm" ff="monospace">{value.startsWith('+') || value.startsWith('-') ? value : `+${value}`}</Text>;
    case 'd20':
    case 'chance':
    case 'coinflip':
      return <Text key={key} component="span" size="sm" ff="monospace">{value}</Text>;

    // Other
    case 'note':
    case 'tip':
      return <Text key={key} component="span" size="sm" c="dimmed" fs="italic">{value}</Text>;
    case 'status':
    case 'filter':
    case 'unit':
    case 'ability':
      return <Text key={key} component="span" size="sm">{value}</Text>;

    default:
      return <span key={key}>{value}</span>;
  }
}

export function TaggedText({ text }: TaggedTextProps) {
  const segments = parseTags(text);

  if (segments.length === 1 && segments[0].kind === 'text') {
    return <>{segments[0].value}</>;
  }

  return (
    <>
      {segments.map((seg, i) => {
        switch (seg.kind) {
          case 'text':
            return <span key={i}>{seg.value}</span>;
          case 'entity':
            return (
              <WikiLink
                key={i}
                tagType={seg.tagType}
                name={seg.name}
                source={seg.source}
                displayText={seg.displayText}
              />
            );
          case 'display':
            return renderDisplayTag(seg.tagType, seg.value, seg.extra, i);
        }
      })}
    </>
  );
}
