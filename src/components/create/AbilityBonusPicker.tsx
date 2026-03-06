import { Checkbox, Group, Text, Stack } from '@mantine/core';
import { ABILITY_NAMES, type AbilityKey } from '@/types';

interface AbilityBonusPickerProps {
  from: AbilityKey[];
  count: number;
  amount: number;
  chosen: Partial<Record<AbilityKey, number>>;
  onChange: (chosen: Partial<Record<AbilityKey, number>>) => void;
  /** Abilities that already have a fixed bonus (shown but disabled) */
  fixedBonuses?: Partial<Record<AbilityKey, number>>;
}

export function AbilityBonusPicker({
  from,
  count,
  amount,
  chosen,
  onChange,
  fixedBonuses = {},
}: AbilityBonusPickerProps) {
  const selectedKeys = Object.keys(chosen) as AbilityKey[];
  const atMax = selectedKeys.length >= count;

  function toggle(ability: AbilityKey) {
    const next = { ...chosen };
    if (next[ability] !== undefined) {
      delete next[ability];
    } else if (!atMax) {
      next[ability] = amount;
    }
    onChange(next);
  }

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        Choose {count} ability {count === 1 ? 'score' : 'scores'} to increase by {amount}
      </Text>
      <Group gap="sm">
        {from.map(ability => {
          const hasFixed = fixedBonuses[ability] !== undefined;
          const isChosen = chosen[ability] !== undefined;
          return (
            <Checkbox
              key={ability}
              label={`${ABILITY_NAMES[ability]}${hasFixed ? ` (already +${fixedBonuses[ability]})` : ''}`}
              checked={isChosen}
              disabled={hasFixed || (!isChosen && atMax)}
              onChange={() => toggle(ability)}
            />
          );
        })}
      </Group>
    </Stack>
  );
}
