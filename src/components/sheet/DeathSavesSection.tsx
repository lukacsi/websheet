import { Group, Text, Checkbox, Stack, Paper } from '@mantine/core';
import type { DeathSaves } from '@/types';
import { elevatedStyle, glowAccent } from '@/theme/styles';

interface Props {
  deathSaves: DeathSaves;
  onChange: (deathSaves: DeathSaves) => void;
}

export function DeathSavesSection({ deathSaves, onChange }: Props) {
  const criticalStyle = deathSaves.successes === 3
    ? { ...elevatedStyle, ...glowAccent }
    : deathSaves.failures === 3
      ? { ...elevatedStyle, boxShadow: '0 0 8px rgba(204, 61, 61, 0.2), 0 2px 8px rgba(0, 0, 0, 0.35)' }
      : elevatedStyle;

  return (
    <Paper p="xs" style={criticalStyle}>
    <Stack gap={4}>
      <Group gap="xs">
        <Text size="sm" fw={500} w={70} c="teal.5">Successes</Text>
        {[0, 1, 2].map((i) => (
          <Checkbox
            key={`s${i}`}
            size="sm"
            checked={deathSaves.successes > i}
            onChange={() => {
              const next = deathSaves.successes > i ? i : i + 1;
              onChange({ ...deathSaves, successes: next });
            }}
          />
        ))}
      </Group>
      <Group gap="xs">
        <Text size="sm" fw={500} w={70} c="bloodRed.4">Failures</Text>
        {[0, 1, 2].map((i) => (
          <Checkbox
            key={`f${i}`}
            size="sm"
            color="bloodRed"
            checked={deathSaves.failures > i}
            onChange={() => {
              const next = deathSaves.failures > i ? i : i + 1;
              onChange({ ...deathSaves, failures: next });
            }}
          />
        ))}
      </Group>
    </Stack>
    </Paper>
  );
}
