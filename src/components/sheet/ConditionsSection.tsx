import { Group, Menu, Button, NumberInput, Text } from '@mantine/core';
import type { Condition, Edition } from '@/types';
import { WikiLink } from '@/components/wiki/WikiLink';
import { numOrDefault } from '@/utils/form-helpers';
import { centeredCompactInputStyles } from '@/theme/styles';
import { RemoveButton } from './RemoveButton';

const ALL_CONDITIONS: Condition[] = [
  'blinded', 'charmed', 'deafened', 'exhaustion', 'frightened',
  'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified',
  'poisoned', 'prone', 'restrained', 'stunned', 'unconscious',
];

interface Props {
  conditions: Condition[];
  edition?: Edition;
  exhaustionLevel?: number;
  onChange: (conditions: Condition[]) => void;
  onExhaustionChange?: (level: number) => void;
}

export function ConditionsSection({ conditions, edition, exhaustionLevel = 0, onChange, onExhaustionChange }: Props) {
  const available = ALL_CONDITIONS.filter((c) => !conditions.includes(c));
  const maxExhaustion = edition === 'classic' ? 6 : 10;
  const hasExhaustion = conditions.includes('exhaustion');

  return (
    <Group gap="xs" wrap="wrap" align="center">
      {conditions.map((c) => (
        <Group key={c} gap={2} wrap="nowrap" align="center">
          <WikiLink tagType="condition" name={c} />
          {c === 'exhaustion' && hasExhaustion && onExhaustionChange && (
            <Group gap={2} wrap="nowrap">
              <NumberInput
                value={exhaustionLevel}
                onChange={(v) => onExhaustionChange(numOrDefault(v, 0))}
                min={0}
                max={maxExhaustion}
                size="xs"
                w={45}
                styles={centeredCompactInputStyles}
              />
              <Text size="xs" c="dimmed">/ {maxExhaustion}</Text>
            </Group>
          )}
          <RemoveButton
            variant="badge"
            onClick={() => {
              onChange(conditions.filter((x) => x !== c));
              if (c === 'exhaustion' && onExhaustionChange) onExhaustionChange(0);
            }}
          />
        </Group>
      ))}
      {available.length > 0 && (
        <Menu shadow="md" width={180}>
          <Menu.Target>
            <Button size="compact-xs" variant="subtle" color="dimmed">+ condition</Button>
          </Menu.Target>
          <Menu.Dropdown>
            {available.map((c) => (
              <Menu.Item
                key={c}
                onClick={() => {
                  onChange([...conditions, c]);
                  if (c === 'exhaustion' && onExhaustionChange) onExhaustionChange(1);
                }}
                style={{ textTransform: 'capitalize' }}
              >
                {c}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  );
}
