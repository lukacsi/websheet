import { Anchor } from '@mantine/core';
import type { EntityTagType } from '@/utils/parse-tags';
import { useWikiDrawer } from './WikiDrawerContext';

const TAG_COLORS: Partial<Record<EntityTagType, string>> = {
  spell: 'violet',
  item: 'teal',
  class: 'orange',
  subclass: 'orange',
  classFeature: 'orange',
  subclassFeature: 'orange',
  feat: 'yellow',
  condition: 'red',
  disease: 'red',
  skill: 'blue',
  race: 'cyan',
  background: 'grape',
  variantrule: 'gray',
  action: 'blue',
  creature: 'green',
  optfeature: 'orange',
  deity: 'yellow',
  language: 'indigo',
  sense: 'lime',
  reward: 'yellow',
  table: 'gray',
  card: 'pink',
  deck: 'pink',
  vehicle: 'teal',
  vehupgrade: 'teal',
  hazard: 'red',
  trap: 'red',
  object: 'gray',
  facility: 'cyan',
  charoption: 'grape',
  cult: 'red',
  boon: 'yellow',
  psionic: 'indigo',
  recipe: 'lime',
  itemProperty: 'teal',
  itemMastery: 'teal',
};

interface WikiLinkProps {
  tagType: EntityTagType;
  name: string;
  source?: string;
  displayText?: string;
}

export function WikiLink({ tagType, name, source, displayText }: WikiLinkProps) {
  const { open } = useWikiDrawer();

  return (
    <Anchor
      component="span"
      size="sm"
      c={TAG_COLORS[tagType] ?? 'dimmed'}
      td="underline dotted"
      style={{ cursor: 'pointer' }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        open({ tagType, name, source });
      }}
    >
      {displayText || name}
    </Anchor>
  );
}
