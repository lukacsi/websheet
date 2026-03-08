import { useEffect, useRef, useState } from 'react';
import { Anchor, HoverCard, Text, Stack, Badge, Group, Loader } from '@mantine/core';
import type { EntityTagType } from '@/utils/parse-tags';
import type { Entry } from '@/types/common';
import { lookupEntity } from '@/api/wiki';
import { useWikiDrawer } from './WikiDrawerContext';
import { EntryRenderer } from '@/components/create/EntryRenderer';

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

/** Simple hover preview — fetches on first hover, cached after */
function HoverPreview({ tagType, name, source }: { tagType: EntityTagType; name: string; source?: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    lookupEntity(tagType, name, source).then(result => {
      setData(result);
      setLoading(false);
    });
  }, [tagType, name, source]);

  if (loading) return <Loader size="xs" />;
  if (!data) return <Text size="xs" c="parchment.6">Not found</Text>;

  const entries = data.entries as Entry[] | undefined;
  // Show first entry only for preview
  const preview = entries?.slice(0, 2);

  return (
    <Stack gap={4} maw={360}>
      <Group gap="xs">
        <Text size="sm" fw={700}>{data.name as string}</Text>
        {typeof data.source === 'string' && <Badge size="xs" variant="outline">{data.source}</Badge>}
      </Group>
      {preview && preview.length > 0 && (
        <EntryRenderer entries={preview} />
      )}
      {entries && entries.length > 2 && (
        <Text size="xs" c="parchment.6" fs="italic">Click for more...</Text>
      )}
    </Stack>
  );
}

export function WikiLink({ tagType, name, source, displayText }: WikiLinkProps) {
  const { open } = useWikiDrawer();

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    open({ tagType, name, source });
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(e as unknown as React.MouseEvent); }}
      style={{ cursor: 'pointer' }}
    >
      <HoverCard
        width="auto"
        shadow="md"
        openDelay={400}
        closeDelay={100}
        position="bottom-start"
        withinPortal
      >
        <HoverCard.Target>
          <Anchor
            component="span"
            size="sm"
            c={TAG_COLORS[tagType] ?? 'dimmed'}
            td="underline dotted"
          >
            {displayText || name}
          </Anchor>
        </HoverCard.Target>
        <HoverCard.Dropdown
          style={{ maxHeight: 300, overflowY: 'auto' }}
        >
          <HoverPreview tagType={tagType} name={name} source={source} />
        </HoverCard.Dropdown>
      </HoverCard>
    </span>
  );
}
