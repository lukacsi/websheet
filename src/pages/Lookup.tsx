import { useRef, useState } from 'react';
import {
  Container, TextInput, SegmentedControl, Stack, Card, Text,
  Group, Badge, Loader, Center, ScrollArea,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { EntityTagType } from '@/utils/parse-tags';
import { useWikiDrawer } from '@/components/wiki/WikiDrawerContext';
import { cardStyle } from '@/theme/styles';
import pb from '@/api/pocketbase';
import { escapeFilter } from '@/api/wiki';

/** Searchable categories — maps display label to PocketBase collection + EntityTagType */
const CATEGORIES: { label: string; collection: string; tagType: EntityTagType }[] = [
  { label: 'Spells', collection: 'spells', tagType: 'spell' },
  { label: 'Items', collection: 'items', tagType: 'item' },
  { label: 'Classes', collection: 'classes', tagType: 'class' },
  { label: 'Races', collection: 'races', tagType: 'race' },
  { label: 'Backgrounds', collection: 'backgrounds', tagType: 'background' },
  { label: 'Feats', collection: 'feats', tagType: 'feat' },
  { label: 'Conditions', collection: 'conditions', tagType: 'condition' },
  { label: 'Features', collection: 'class_features', tagType: 'classFeature' },
  { label: 'Actions', collection: 'actions', tagType: 'action' },
  { label: 'Creatures', collection: 'creatures', tagType: 'creature' },
  { label: 'Languages', collection: 'languages', tagType: 'language' },
  { label: 'Rules', collection: 'variantrules', tagType: 'variantrule' },
];

interface SearchResult {
  id: string;
  name: string;
  source?: string;
  edition?: string;
  level?: number;
  tagType: EntityTagType;
  category: string;
  extra?: string;
}

export function Lookup() {
  const { open } = useWikiDrawer();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleQueryChange(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => search(trimmed, category), 250);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    if (query.trim().length >= 2) {
      search(query.trim(), value);
    }
  }

  async function search(term: string, cat: string) {
    setLoading(true);
    const filter = `name~"${escapeFilter(term)}"`;
    const cats = cat === 'All' ? CATEGORIES : CATEGORIES.filter((c) => c.label === cat);

    const promises = cats.map(async (c) => {
      try {
        const records = await pb.collection(c.collection).getList(1, cat === 'All' ? 5 : 25, {
          filter,
          sort: 'name',
          requestKey: `lookup-${c.collection}-${Date.now()}`,
        });
        return records.items.map((r): SearchResult => ({
          id: r.id,
          name: (r as unknown as { name: string }).name,
          source: (r as unknown as { source?: string }).source,
          edition: (r as unknown as { edition?: string }).edition,
          level: (r as unknown as { level?: number }).level,
          tagType: c.tagType,
          category: c.label,
          extra: buildExtra(c.tagType, r as unknown as Record<string, unknown>),
        }));
      } catch {
        return [];
      }
    });

    const all = (await Promise.all(promises)).flat();
    all.sort((a, b) => {
      // Exact prefix matches first
      const aPrefix = a.name.toLowerCase().startsWith(term.toLowerCase()) ? 0 : 1;
      const bPrefix = b.name.toLowerCase().startsWith(term.toLowerCase()) ? 0 : 1;
      if (aPrefix !== bPrefix) return aPrefix - bPrefix;
      return a.name.localeCompare(b.name);
    });
    setResults(all);
    setLoading(false);
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <TextInput
          placeholder="Search spells, items, classes, races, feats..."
          leftSection={<IconSearch size={18} />}
          value={query}
          onChange={(e) => handleQueryChange(e.currentTarget.value)}
          size="md"
          autoFocus
        />

        <ScrollArea type="auto" offsetScrollbars scrollbarSize={4}>
          <SegmentedControl
            data={['All', ...CATEGORIES.map((c) => c.label)]}
            value={category}
            onChange={handleCategoryChange}
            size="xs"
          />
        </ScrollArea>

        {loading && <Center py="lg"><Loader size="sm" /></Center>}

        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <Text c="parchment.6" ta="center" py="lg">No results for "{query}"</Text>
        )}

        {!loading && results.map((r) => (
          <Card
            key={`${r.tagType}-${r.id}`}
            padding="sm"
            style={{ ...cardStyle, cursor: 'pointer' }}
            onClick={() => open({ tagType: r.tagType, name: r.name, source: r.source, edition: r.edition as 'one' | 'classic' | undefined })}
          >
            <Group justify="space-between" wrap="nowrap">
              <div style={{ minWidth: 0 }}>
                <Text fw={600} truncate>{r.name}</Text>
                {r.extra && <Text size="xs" c="parchment.6" truncate>{r.extra}</Text>}
              </div>
              <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                <Badge size="xs" variant="light" color="gold">{r.category}</Badge>
                {r.source && <Badge size="xs" variant="light" color="parchment">{r.source}</Badge>}
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}

/** Build a short description line from entity data */
function buildExtra(tagType: EntityTagType, data: Record<string, unknown>): string | undefined {
  switch (tagType) {
    case 'spell': {
      const level = data.level as number | undefined;
      const school = data.school as string | undefined;
      return [level === 0 ? 'Cantrip' : level ? `Level ${level}` : null, school].filter(Boolean).join(' · ');
    }
    case 'item': {
      const type = data.type as string | undefined;
      const rarity = data.rarity as string | undefined;
      return [type, rarity].filter(Boolean).join(' · ');
    }
    case 'classFeature': {
      const cls = data.className as string | undefined;
      const level = data.level as number | undefined;
      return [cls, level ? `Level ${level}` : null].filter(Boolean).join(' · ');
    }
    case 'feat':
      return (data.prerequisite as string) || undefined;
    case 'creature': {
      const cr = data.cr as string | undefined;
      const type = data.type as string | undefined;
      return [type, cr ? `CR ${cr}` : null].filter(Boolean).join(' · ');
    }
    default:
      return undefined;
  }
}
