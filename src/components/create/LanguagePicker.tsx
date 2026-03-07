import { useEffect, useState } from 'react';
import { MultiSelect, Stack, Loader } from '@mantine/core';
import type { LangChoice } from '@/types/common';
import pb from '@/api/pocketbase';

interface Props {
  choices: LangChoice[];
  chosen: string[];
  onChange: (chosen: string[]) => void;
  alreadyKnown?: string[];
}

export function LanguagePicker({ choices, chosen, onChange, alreadyKnown = [] }: Props) {
  const [allLanguages, setAllLanguages] = useState<string[]>([]);
  const [standardLanguages, setStandardLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    pb.collection('languages').getFullList({ sort: 'name' }).then(records => {
      if (cancelled) return;
      const all: string[] = [];
      const standard: string[] = [];
      const seen = new Set<string>();
      for (const r of records) {
        const name = r.name as string;
        if (seen.has(name)) continue;
        seen.add(name);
        all.push(name);
        if (r.languageType === 'standard' || !r.languageType) {
          standard.push(name);
        }
      }
      setAllLanguages(all);
      setStandardLanguages(standard);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader size="sm" />;

  const totalCount = choices.reduce((sum, c) => sum + c.count, 0);

  // Build available options based on choice types
  const available = new Set<string>();
  for (const choice of choices) {
    let pool: string[];
    if (choice.type === 'anyStandard') {
      pool = standardLanguages;
    } else if (choice.type === 'any') {
      pool = allLanguages;
    } else if (choice.type === 'specific' && choice.from) {
      pool = choice.from;
    } else {
      pool = allLanguages;
    }
    for (const lang of pool) {
      if (!alreadyKnown.includes(lang)) available.add(lang);
    }
  }

  const data = [...available].sort().map(name => ({ value: name, label: name }));

  return (
    <Stack gap="xs">
      <MultiSelect
        label={`Choose ${totalCount} language${totalCount > 1 ? 's' : ''}`}
        placeholder={`Select ${totalCount}...`}
        data={data}
        value={chosen}
        onChange={vals => onChange(vals.slice(0, totalCount))}
        maxValues={totalCount}
        searchable
      />
    </Stack>
  );
}
