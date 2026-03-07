import { Group, Stack, NumberInput, Text, Paper, SimpleGrid } from '@mantine/core';
import type { Character } from '@/types';
import { formatModifier } from '@/utils/derived-stats';

interface Props {
  character: Character;
  calculatedInitiative: number;
  calculatedProfBonus: number;
  onChange: (partial: Partial<Character>) => void;
}

function StatBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Paper
      p="xs"
      ta="center"
      style={{
        backgroundColor: 'var(--mantine-color-dark-7)',
        border: '1px solid var(--mantine-color-dark-5)',
      }}
    >
      <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb={4}>
        {label}
      </Text>
      {children}
    </Paper>
  );
}

export function CombatSection({ character, calculatedInitiative, calculatedProfBonus, onChange }: Props) {
  return (
    <Stack gap="xs">
      <SimpleGrid cols={{ base: 3, sm: 6 }} spacing="xs">
        <StatBox label="HP">
          <NumberInput
            value={character.hp}
            onChange={(v) => onChange({ hp: typeof v === 'number' ? v : 0 })}
            min={0}
            size="xs"
            styles={{ input: { textAlign: 'center', fontWeight: 700, fontSize: 18 } }}
          />
        </StatBox>

        <StatBox label="Max HP">
          <NumberInput
            value={character.maxHp}
            onChange={(v) => onChange({ maxHp: typeof v === 'number' ? v : 0 })}
            min={0}
            size="xs"
            styles={{ input: { textAlign: 'center', fontWeight: 700, fontSize: 18 } }}
          />
        </StatBox>

        <StatBox label="Temp HP">
          <NumberInput
            value={character.tempHp}
            onChange={(v) => onChange({ tempHp: typeof v === 'number' ? v : 0 })}
            min={0}
            size="xs"
            styles={{ input: { textAlign: 'center' } }}
          />
        </StatBox>

        <StatBox label="AC">
          <NumberInput
            value={character.ac}
            onChange={(v) => onChange({ ac: typeof v === 'number' ? v : 10 })}
            min={0}
            size="xs"
            styles={{ input: { textAlign: 'center', fontWeight: 700, fontSize: 18 } }}
          />
        </StatBox>

        <StatBox label="Initiative">
          <NumberInput
            value={character.initiative}
            onChange={(v) => onChange({ initiative: typeof v === 'number' ? v : 0 })}
            size="xs"
            styles={{ input: { textAlign: 'center', fontWeight: 700, fontSize: 18 } }}
          />
          <Text size="xs" c="dimmed">auto: {formatModifier(calculatedInitiative)}</Text>
        </StatBox>

        <StatBox label="Prof. Bonus">
          <NumberInput
            value={character.proficiencyBonus}
            onChange={(v) => onChange({ proficiencyBonus: typeof v === 'number' ? v : 2 })}
            size="xs"
            styles={{ input: { textAlign: 'center', fontWeight: 700, fontSize: 18 } }}
          />
          <Text size="xs" c="dimmed">auto: {formatModifier(calculatedProfBonus)}</Text>
        </StatBox>
      </SimpleGrid>

      <Group gap="md">
        <Group gap="xs">
          <Text size="sm" fw={500}>Speed:</Text>
          <NumberInput
            value={character.speed.walk}
            onChange={(v) => onChange({ speed: { ...character.speed, walk: typeof v === 'number' ? v : 30 } })}
            min={0}
            step={5}
            size="xs"
            w={70}
            suffix=" ft"
            styles={{ input: { textAlign: 'center' } }}
          />
        </Group>
        <Group gap="xs">
          <Text size="sm" fw={500}>Level:</Text>
          <NumberInput
            value={character.level}
            onChange={(v) => onChange({ level: typeof v === 'number' ? v : 1 })}
            min={1}
            max={20}
            size="xs"
            w={60}
            styles={{ input: { textAlign: 'center' } }}
          />
        </Group>
      </Group>
    </Stack>
  );
}
