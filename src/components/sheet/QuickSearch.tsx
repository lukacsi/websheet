import { useRef, useState } from 'react';
import { Autocomplete } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useWikiDrawer } from '@/components/wiki/WikiDrawerContext';
import type { EntityTagType } from '@/utils/parse-tags';
import pb from '@/api/pocketbase';
import { escapeFilter } from '@/api/wiki';

const SEARCH_TARGETS: { collection: string; tagType: EntityTagType; label: string }[] = [
  { collection: 'spells', tagType: 'spell', label: 'Spell' },
  { collection: 'items', tagType: 'item', label: 'Item' },
  { collection: 'classes', tagType: 'class', label: 'Class' },
  { collection: 'races', tagType: 'race', label: 'Race' },
  { collection: 'feats', tagType: 'feat', label: 'Feat' },
  { collection: 'conditions', tagType: 'condition', label: 'Condition' },
  { collection: 'backgrounds', tagType: 'background', label: 'Background' },
  { collection: 'class_features', tagType: 'classFeature', label: 'Feature' },
  { collection: 'actions', tagType: 'action', label: 'Action' },
  { collection: 'variantrules', tagType: 'variantrule', label: 'Rule' },
];

interface Match {
  value: string;
  name: string;
  tagType: EntityTagType;
  source?: string;
}

interface QuickSearchProps {
  edition?: 'one' | 'classic';
}

export function QuickSearch({ edition }: QuickSearchProps) {
  const { open } = useWikiDrawer();
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<Match[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleChange(val: string) {
    setValue(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setOptions([]);
      return;
    }
    debounceRef.current = setTimeout(() => fetchOptions(val.trim()), 200);
  }

  async function fetchOptions(term: string) {
    const filter = `name~"${escapeFilter(term)}"`;
    const promises = SEARCH_TARGETS.map(async (t) => {
      try {
        const res = await pb.collection(t.collection).getList(1, 3, {
          filter,
          sort: 'name',
          requestKey: `qs-${t.collection}-${Date.now()}`,
        });
        return res.items.map((r): Match => {
          const rec = r as unknown as { name: string; source?: string };
          return {
            value: `${rec.name} [${t.label}]`,
            name: rec.name,
            tagType: t.tagType,
            source: rec.source,
          };
        });
      } catch {
        return [];
      }
    });
    const all = (await Promise.all(promises)).flat();
    // Prefix matches first
    const lower = term.toLowerCase();
    all.sort((a, b) => {
      const ap = a.name.toLowerCase().startsWith(lower) ? 0 : 1;
      const bp = b.name.toLowerCase().startsWith(lower) ? 0 : 1;
      return ap !== bp ? ap - bp : a.name.localeCompare(b.name);
    });
    // Deduplicate display values (same name+type from different sources/editions)
    const seen = new Set<string>();
    const deduped = all.filter((o) => {
      if (seen.has(o.value)) return false;
      seen.add(o.value);
      return true;
    });
    setOptions(deduped.slice(0, 15));
  }

  function handleSelect(val: string) {
    const match = options.find((o) => o.value === val);
    if (match) {
      open({ tagType: match.tagType, name: match.name, source: match.source, edition });
    }
    setValue('');
    setOptions([]);
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'contents' }}>
      <Autocomplete
        value={value}
        onChange={handleChange}
        onOptionSubmit={handleSelect}
        data={options.map((o) => o.value)}
        placeholder="Quick lookup..."
        leftSection={<IconSearch size={14} />}
        size="xs"
        style={{ width: 180 }}
        comboboxProps={{ transitionProps: { duration: 0 } }}
      />
    </form>
  );
}
