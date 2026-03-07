import { Select, Stack } from '@mantine/core';
import type { ResistanceChoice } from '@/types/common';

interface Props {
  choices: ResistanceChoice[];
  chosen: string;
  onChange: (chosen: string) => void;
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

export function ResistancePicker({ choices, chosen, onChange }: Props) {
  // Merge all from arrays into one set of options
  const options = new Set<string>();
  for (const choice of choices) {
    for (const type of choice.from) options.add(type);
  }

  const data = [...options].sort().map(type => ({
    value: type,
    label: capitalize(type),
  }));

  return (
    <Stack gap="xs">
      <Select
        label="Choose damage resistance"
        placeholder="Select one..."
        data={data}
        value={chosen || null}
        onChange={val => onChange(val ?? '')}
        searchable
        clearable
      />
    </Stack>
  );
}
