import { Group, Text, NumberInput, ActionIcon, Stack, Badge } from '@mantine/core';
import type { HitDice } from '@/types';
import { numOrDefault } from '@/utils/form-helpers';
import { centeredInputStyles } from '@/theme/styles';
import { RemoveButton } from './RemoveButton';

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
        <Stack key={i} gap={2}>
          <Group gap="xs" justify="space-between" align="center">
            <Group gap="xs" align="center">
              <Badge variant="light" color="inkBrown" size="lg">d{hd.die}</Badge>
              <Text size="sm" fw={600}>{hd.total - hd.used} / {hd.total}</Text>
              <Text size="xs" c="parchment.6">remaining</Text>
            </Group>
            <RemoveButton onClick={() => removeDie(i)} />
          </Group>
          <Group gap="xs" align="center">
            <NumberInput
              value={hd.die}
              onChange={(v) => updateDie(i, { die: numOrDefault(v, 8) })}
              min={4} max={12} step={2} size="xs" w={50}
              label="die" styles={centeredInputStyles}
            />
            <NumberInput
              value={hd.total}
              onChange={(v) => updateDie(i, { total: numOrDefault(v, 1) })}
              min={0} size="xs" w={50}
              label="total" styles={centeredInputStyles}
            />
            <NumberInput
              value={hd.used}
              onChange={(v) => updateDie(i, { used: numOrDefault(v, 0) })}
              min={0} max={hd.total} size="xs" w={50}
              label="used" styles={centeredInputStyles}
            />
          </Group>
        </Stack>
      ))}
      {hitDice.length === 0 && (
        <Text size="sm" c="parchment.6" fs="italic">No hit dice — add from class</Text>
      )}
      <ActionIcon size="sm" variant="light" onClick={addDie} title="Add hit die type">
        +
      </ActionIcon>
    </Stack>
  );
}
