import { SimpleGrid, Textarea, Text } from '@mantine/core';

interface Props {
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  onChange: (field: string, value: string) => void;
}

const warmLabel = (text: string) => (
  <Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>{text}</Text>
);

export function PersonalitySection({ personalityTraits, ideals, bonds, flaws, onChange }: Props) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
      <Textarea
        label={warmLabel('Personality Traits')}
        value={personalityTraits}
        onChange={(e) => onChange('personalityTraits', e.currentTarget.value)}
        autosize
        minRows={2}
        size="sm"
        variant="unstyled"
      />
      <Textarea
        label={warmLabel('Ideals')}
        value={ideals}
        onChange={(e) => onChange('ideals', e.currentTarget.value)}
        autosize
        minRows={2}
        size="sm"
        variant="unstyled"
      />
      <Textarea
        label={warmLabel('Bonds')}
        value={bonds}
        onChange={(e) => onChange('bonds', e.currentTarget.value)}
        autosize
        minRows={2}
        size="sm"
        variant="unstyled"
      />
      <Textarea
        label={warmLabel('Flaws')}
        value={flaws}
        onChange={(e) => onChange('flaws', e.currentTarget.value)}
        autosize
        minRows={2}
        size="sm"
        variant="unstyled"
      />
    </SimpleGrid>
  );
}
