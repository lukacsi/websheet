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
        <Group key={i} gap="xs">
          <Badge variant="light" color="inkBrown" size="lg">d{hd.die}</Badge>
          <NumberInput
            value={hd.die}
            onChange={(v) => updateDie(i, { die: numOrDefault(v, 8) })}
            min={4}
            max={12}
            step={2}
            size="xs"
            w={55}
            styles={centeredInputStyles}
          />
          <Text size="xs" c="dimmed">remaining:</Text>
          <Text size="sm" fw={600}>{hd.total - hd.used}</Text>
          <Text size="xs" c="dimmed">/ {hd.total}</Text>
          <NumberInput
            value={hd.total}
            onChange={(v) => updateDie(i, { total: numOrDefault(v, 1) })}
            min={0}
            size="xs"
            w={50}
            label="total"
            styles={centeredInputStyles}
          />
          <NumberInput
            value={hd.used}
            onChange={(v) => updateDie(i, { used: numOrDefault(v, 0) })}
            min={0}
            max={hd.total}
            size="xs"
            w={50}
            label="used"
            styles={centeredInputStyles}
          />
          <RemoveButton onClick={() => removeDie(i)} />
        </Group>
      ))}
      <ActionIcon size="sm" variant="light" onClick={addDie} title="Add hit die type">
        +
      </ActionIcon>
    </Stack>
  );
}
