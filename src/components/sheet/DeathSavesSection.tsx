import { Group, Text, Checkbox, Stack } from '@mantine/core';
import type { DeathSaves } from '@/types';

interface Props {
  deathSaves: DeathSaves;
  onChange: (deathSaves: DeathSaves) => void;
}

export function DeathSavesSection({ deathSaves, onChange }: Props) {
  return (
    <Stack gap={4}>
      <Group gap="xs">
        <Text size="sm" fw={500} w={70}>Successes</Text>
        {[0, 1, 2].map((i) => (
          <Checkbox
            key={`s${i}`}
            size="xs"
            checked={deathSaves.successes > i}
            onChange={() => {
              const next = deathSaves.successes > i ? i : i + 1;
              onChange({ ...deathSaves, successes: next });
            }}
          />
        ))}
      </Group>
      <Group gap="xs">
        <Text size="sm" fw={500} w={70}>Failures</Text>
        {[0, 1, 2].map((i) => (
          <Checkbox
            key={`f${i}`}
            size="xs"
            color="red"
            checked={deathSaves.failures > i}
            onChange={() => {
              const next = deathSaves.failures > i ? i : i + 1;
              onChange({ ...deathSaves, failures: next });
            }}
          />
        ))}
      </Group>
    </Stack>
  );
}
