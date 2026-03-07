import { SimpleGrid, Text, NumberInput, Paper } from '@mantine/core';
import type { AbilityScores, AbilityKey } from '@/types';
import { ABILITY_NAMES, abilityModifier } from '@/types';
import { formatModifier } from '@/utils/derived-stats';

const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface Props {
  abilities: AbilityScores;
  onChange: (abilities: AbilityScores) => void;
}

export function AbilityScoresSection({ abilities, onChange }: Props) {
  function setScore(key: AbilityKey, value: number) {
    onChange({ ...abilities, [key]: value });
  }

  return (
    <SimpleGrid cols={{ base: 3, sm: 6 }} spacing="xs">
      {ABILITIES.map((key) => {
        const mod = abilityModifier(abilities[key]);
        return (
          <Paper
            key={key}
            p="xs"
            ta="center"
            style={{
              backgroundColor: 'var(--mantine-color-dark-7)',
              border: '1px solid var(--mantine-color-dark-5)',
            }}
          >
            <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb={4}>
              {ABILITY_NAMES[key]}
            </Text>
            <Text fw={700} size="xl" c={mod >= 0 ? 'parchment.2' : 'red.4'}>
              {formatModifier(mod)}
            </Text>
            <NumberInput
              value={abilities[key]}
              onChange={(v) => setScore(key, typeof v === 'number' ? v : 10)}
              min={1}
              max={30}
              size="xs"
              w={60}
              mx="auto"
              mt={4}
              styles={{
                input: { textAlign: 'center' },
              }}
            />
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
