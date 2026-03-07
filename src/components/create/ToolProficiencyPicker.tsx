import { useEffect, useState } from 'react';
import { Select, MultiSelect, Stack, Loader } from '@mantine/core';
import type { ProfChoice } from '@/types/common';
import pb from '@/api/pocketbase';

interface Props {
  choices: ProfChoice[];
  chosen: string[];
  onChange: (chosen: string[]) => void;
}

interface ItemOption {
  value: string;
  label: string;
}

const TYPE_FILTERS: Record<string, string> = {
  anyArtisansTool: 'type="AT"',
  anyMusicalInstrument: 'type="INS"',
  anyGamingSet: 'type="GS"',
};

export function ToolProficiencyPicker({ choices, chosen, onChange }: Props) {
  const [optionsByType, setOptionsByType] = useState<Record<string, ItemOption[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const needed = new Set<string>();
    for (const c of choices) {
      if (c.type === 'specific') continue;
      needed.add(c.type);
    }

    const promises = [...needed].map(async (type) => {
      const filter = TYPE_FILTERS[type];
      if (!filter) return { type, items: [] };
      try {
        const records = await pb.collection('items').getFullList({ filter, sort: 'name' });
        // Deduplicate by name (may have classic + one editions)
        const seen = new Set<string>();
        const items: ItemOption[] = [];
        for (const r of records) {
          const name = r.name as string;
          if (!seen.has(name)) {
            seen.add(name);
            items.push({ value: name, label: name });
          }
        }
        return { type, items };
      } catch {
        return { type, items: [] };
      }
    });

    // Handle 'specific' choices — items from `from` list
    for (const c of choices) {
      if (c.type === 'specific' && c.from?.length) {
        const key = `specific:${c.from.join(',')}`;
        if (!needed.has(key)) {
          needed.add(key);
          promises.push(
            Promise.resolve({
              type: key,
              items: c.from.map(name => ({ value: name, label: name })),
            })
          );
        }
      }
    }

    Promise.all(promises).then(results => {
      if (cancelled) return;
      const map: Record<string, ItemOption[]> = {};
      for (const r of results) map[r.type] = r.items;
      setOptionsByType(map);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [choices]);

  if (loading) return <Loader size="sm" />;

  // Track which items are chosen per-choice-group for multi-choice scenarios
  let usedCount = 0;

  return (
    <Stack gap="xs">
      {choices.map((choice, idx) => {
        const key = choice.type === 'specific'
          ? `specific:${choice.from?.join(',') ?? ''}`
          : choice.type;
        const options = optionsByType[key]
          ?? (choice.type === 'specific' && choice.from
            ? choice.from.map(n => ({ value: n, label: n }))
            : []);

        // Calculate which portion of `chosen` belongs to this choice group
        const start = usedCount;
        const end = start + choice.count;
        const groupChosen = chosen.slice(start, end);
        usedCount = end;

        const typeLabel = choice.type === 'anyArtisansTool' ? "Artisan's Tools"
          : choice.type === 'anyMusicalInstrument' ? 'Musical Instruments'
          : choice.type === 'anyGamingSet' ? 'Gaming Sets'
          : 'Tools';

        if (choice.count === 1) {
          return (
            <Select
              key={idx}
              label={`Choose ${typeLabel}`}
              placeholder={`Select one...`}
              data={options}
              value={groupChosen[0] || null}
              onChange={val => {
                const newChosen = [...chosen];
                newChosen.splice(start, groupChosen.length, ...(val ? [val] : []));
                onChange(newChosen);
              }}
              searchable
              clearable
            />
          );
        }

        return (
          <MultiSelect
            key={idx}
            label={`Choose ${choice.count} ${typeLabel}`}
            placeholder={`Select ${choice.count}...`}
            data={options}
            value={groupChosen}
            onChange={vals => {
              const newChosen = [...chosen];
              newChosen.splice(start, groupChosen.length, ...vals.slice(0, choice.count));
              onChange(newChosen);
            }}
            maxValues={choice.count}
            searchable
          />
        );
      })}
    </Stack>
  );
}
