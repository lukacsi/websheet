import { Group, Text, NumberInput, ActionIcon, Stack, Badge } from '@mantine/core';
import type { HitDice } from '@/types';

interface Props {
  hitDice: HitDice[];
  onChange: (hitDice: HitDice[]) => void;
}

export function HitDiceSection({ hitDice, onChange }: Props) {
  function updateDie(index: number, partial: Partial<HitDice>) {
    const next = hitDice.map((hd, i) => (i === index ? { ...hd, ...partial } : hd));
    onChange(next);
  }

  function addDie() {
    onChange([...hitDice, { die: 8, total: 1, used: 0 }]);
  }

  function removeDie(index: number) {
    onChange(hitDice.filter((_, i) => i !== index));
  }

  return (
    <Stack gap="xs">
      {hitDice.map((hd, i) => (
        <Group key={i} gap="xs">
          <Badge variant="light" color="inkBrown" size="lg">d{hd.die}</Badge>
          <NumberInput
            value={hd.die}
            onChange={(v) => updateDie(i, { die: typeof v === 'number' ? v : 8 })}
            min={4}
            max={12}
            step={2}
            size="xs"
            w={55}
            styles={{ input: { textAlign: 'center' } }}
          />
          <Text size="xs" c="dimmed">remaining:</Text>
          <Text size="sm" fw={600}>{hd.total - hd.used}</Text>
          <Text size="xs" c="dimmed">/ {hd.total}</Text>
          <NumberInput
            value={hd.total}
            onChange={(v) => updateDie(i, { total: typeof v === 'number' ? v : 1 })}
            min={0}
            size="xs"
            w={50}
            label="total"
            styles={{ input: { textAlign: 'center' } }}
          />
          <NumberInput
            value={hd.used}
            onChange={(v) => updateDie(i, { used: typeof v === 'number' ? v : 0 })}
            min={0}
            max={hd.total}
            size="xs"
            w={50}
            label="used"
            styles={{ input: { textAlign: 'center' } }}
          />
          <ActionIcon size="xs" variant="subtle" color="red" onClick={() => removeDie(i)}>
            &times;
          </ActionIcon>
        </Group>
      ))}
      <ActionIcon size="sm" variant="light" onClick={addDie} title="Add hit die type">
        +
      </ActionIcon>
    </Stack>
  );
}
