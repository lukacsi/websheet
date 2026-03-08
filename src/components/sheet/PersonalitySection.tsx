import { SimpleGrid, Textarea } from '@mantine/core';

interface Props {
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  onChange: (field: string, value: string) => void;
}

export function PersonalitySection({ personalityTraits, ideals, bonds, flaws, onChange }: Props) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
      <Textarea
        label="Personality Traits"
        value={personalityTraits}
        onChange={(e) => onChange('personalityTraits', e.currentTarget.value)}
        autosize
        minRows={2}
        size="sm"
      />
      <Textarea
        label="Ideals"
        value={ideals}
        onChange={(e) => onChange('ideals', e.currentTarget.value)}
        autosize
        minRows={2}
        size="sm"
      />
      <Textarea
        label="Bonds"
        value={bonds}
        onChange={(e) => onChange('bonds', e.currentTarget.value)}
        autosize
        minRows={2}
        size="sm"
      />
      <Textarea
        label="Flaws"
        value={flaws}
        onChange={(e) => onChange('flaws', e.currentTarget.value)}
        autosize
        minRows={2}
        size="sm"
      />
    </SimpleGrid>
  );
}
