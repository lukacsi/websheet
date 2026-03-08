import { Text, List, Table, Stack, Title, Group, Divider, Blockquote } from '@mantine/core';
import type { Entry, EntryObject } from '@/types';
import { stripTags } from '@/utils/strip-tags';
import { TaggedText } from '@/components/wiki/TaggedText';
import { RefEntry } from './RefEntry';

const ABILITY_ABBR: Record<string, string> = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
};

function RenderEntry({ entry }: { entry: Entry }) {
  if (typeof entry === 'string') {
    return <Text size="sm"><TaggedText text={entry} /></Text>;
  }
  return <RenderEntryObject entry={entry} />;
}

function RenderEntryObject({ entry }: { entry: EntryObject }) {
  switch (entry.type) {
    case 'item':
      return (
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}><TaggedText text={entry.name ?? ''} /></Text>
          <Stack gap="xs">
            {entry.entry && <Text size="sm"><TaggedText text={String(entry.entry)} /></Text>}
            {entry.entries?.map((e, i) => <RenderEntry key={i} entry={e} />)}
          </Stack>
        </Group>
      );

    case 'itemSub':
      return (
        <Group gap="xs" wrap="nowrap" align="flex-start" pl="md">
          <Text size="sm" fs="italic" fw={600} style={{ whiteSpace: 'nowrap' }}><TaggedText text={entry.name ?? ''} /></Text>
          <Text size="sm"><TaggedText text={String(entry.entry ?? '')} /></Text>
        </Group>
      );

    case 'entries':
    case 'section':
      return (
        <Stack gap="xs">
          {entry.name && <Title order={6}>{stripTags(entry.name)}</Title>}
          {entry.entries?.map((e, i) => <RenderEntry key={i} entry={e} />)}
        </Stack>
      );

    case 'list':
    case 'options':
      return (
        <List size="sm" withPadding>
          {(entry.items ?? entry.entries ?? []).map((item, i) => (
            <List.Item key={i}>
              {typeof item === 'string' ? <TaggedText text={item} /> : <RenderEntry entry={item} />}
            </List.Item>
          ))}
        </List>
      );

    case 'table':
      return (
        <Table withTableBorder>
          {(entry as EntryObject & { caption?: string }).caption && (
            <Table.Caption><TaggedText text={(entry as EntryObject & { caption?: string }).caption!} /></Table.Caption>
          )}
          {entry.colLabels && (
            <Table.Thead>
              <Table.Tr>
                {entry.colLabels.map((label, i) => (
                  <Table.Th key={i}><TaggedText text={label} /></Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
          )}
          <Table.Tbody>
            {entry.rows?.map((row, i) => (
              <Table.Tr key={i}>
                {(row as (string | EntryObject)[]).map((cell, j) => (
                  <Table.Td key={j}>
                    {typeof cell === 'string' ? <TaggedText text={cell} /> :
                     typeof cell === 'object' && cell !== null ? <RenderEntry entry={cell as Entry} /> :
                     String(cell)}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      );

    case 'tableGroup': {
      const tables = (entry as EntryObject & { tables?: EntryObject[] }).tables;
      return (
        <Stack gap="sm">
          {entry.name && <Title order={6}>{stripTags(entry.name)}</Title>}
          {tables?.map((t, i) => <RenderEntryObject key={i} entry={t} />)}
        </Stack>
      );
    }

    case 'inset':
    case 'insetReadaloud':
      return (
        <Stack gap="xs" p="xs" style={{ borderLeft: '3px solid var(--mantine-color-inkBrown-6)', paddingLeft: 12 }}>
          {entry.name && <Text size="sm" fw={700}><TaggedText text={entry.name} /></Text>}
          {entry.entries?.map((e, i) => <RenderEntry key={i} entry={e} />)}
        </Stack>
      );

    case 'variant':
    case 'variantInner':
    case 'variantSub':
      return (
        <Stack gap="xs" p="xs" style={{ borderLeft: '3px solid var(--mantine-color-yellow-7)', paddingLeft: 12 }}>
          {entry.name && (
            <Text size="sm" fw={700} fs="italic">
              {entry.type === 'variant' ? 'Variant: ' : ''}<TaggedText text={entry.name} />
            </Text>
          )}
          {entry.entries?.map((e, i) => <RenderEntry key={i} entry={e} />)}
        </Stack>
      );

    case 'quote': {
      const by = (entry as EntryObject & { by?: string }).by;
      return (
        <Blockquote cite={by ? `\u2014 ${stripTags(by)}` : undefined} p="sm" my="xs">
          {entry.entries?.map((e, i) => <RenderEntry key={i} entry={e} />)}
        </Blockquote>
      );
    }

    case 'hr':
      return <Divider my="xs" />;

    case 'inline':
    case 'inlineBlock':
      return (
        <Text size="sm" component={entry.type === 'inlineBlock' ? 'div' : 'span'}>
          {entry.entries?.map((e, i) => (
            typeof e === 'string' ? <TaggedText key={i} text={e} /> : <RenderEntry key={i} entry={e} />
          ))}
        </Text>
      );

    case 'abilityDc': {
      const attrs = ((entry as EntryObject & { attributes?: string[] }).attributes ?? [])
        .map(a => ABILITY_ABBR[a] || a).join(' or ');
      return (
        <Text size="sm" fw={600}>
          {entry.name ?? 'Spell'} save DC = 8 + your proficiency bonus + your {attrs} modifier
        </Text>
      );
    }

    case 'abilityAttackMod': {
      const attrs = ((entry as EntryObject & { attributes?: string[] }).attributes ?? [])
        .map(a => ABILITY_ABBR[a] || a).join(' or ');
      return (
        <Text size="sm" fw={600}>
          {entry.name ?? 'Spell'} attack modifier = your proficiency bonus + your {attrs} modifier
        </Text>
      );
    }

    case 'abilityGeneric': {
      const text = (entry as EntryObject & { text?: string }).text ?? '';
      const attrs = ((entry as EntryObject & { attributes?: string[] }).attributes ?? [])
        .map(a => ABILITY_ABBR[a] || a).join(' or ');
      return (
        <Text size="sm" fw={600}>
          {entry.name && <>{entry.name} = </>}{text || attrs}
        </Text>
      );
    }

    // Ref entry types — inline PB lookups
    case 'refOptionalfeature':
      return <RefEntry refType="refOptionalfeature" refKey={(entry as EntryObject & { optionalfeature?: string }).optionalfeature ?? ''} />;

    case 'refClassFeature':
      return <RefEntry refType="refClassFeature" refKey={(entry as EntryObject & { classFeature?: string }).classFeature ?? ''} />;

    case 'refSubclassFeature':
      return <RefEntry refType="refSubclassFeature" refKey={(entry as EntryObject & { subclassFeature?: string }).subclassFeature ?? ''} />;

    case 'refFeat':
      return <RefEntry refType="refFeat" refKey={(entry as EntryObject & { feat?: string }).feat ?? ''} />;

    // Skip types — images, stat blocks, flowcharts, spellcasting
    case 'image':
    case 'gallery':
    case 'statblock':
    case 'statblockInline':
    case 'flowchart':
    case 'flowBlock':
    case 'spellcasting':
      return null;

    default:
      // Fallback: try to render entries or stringify
      if (entry.entries) {
        return (
          <Stack gap="xs">
            {entry.name && <Text size="sm" fw={700}><TaggedText text={entry.name} /></Text>}
            {entry.entries.map((e, i) => <RenderEntry key={i} entry={e} />)}
          </Stack>
        );
      }
      if (entry.entry) {
        return (
          <Text size="sm">
            {entry.name && <Text component="span" fw={600}><TaggedText text={entry.name} /> </Text>}
            <TaggedText text={String(entry.entry)} />
          </Text>
        );
      }
      return <Text size="sm" c="parchment.6">{JSON.stringify(entry)}</Text>;
  }
}

export function EntryRenderer({ entries }: { entries: Entry[] }) {
  if (!entries?.length) return null;
  return (
    <Stack gap="xs">
      {entries.map((entry, i) => (
        <RenderEntry key={i} entry={entry} />
      ))}
    </Stack>
  );
}
