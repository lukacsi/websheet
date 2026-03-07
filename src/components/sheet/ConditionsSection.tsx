import { Group, Badge, Menu, Button } from '@mantine/core';
import type { Condition } from '@/types';
import { WikiLink } from '@/components/wiki/WikiLink';

const ALL_CONDITIONS: Condition[] = [
  'blinded', 'charmed', 'deafened', 'exhaustion', 'frightened',
  'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified',
  'poisoned', 'prone', 'restrained', 'stunned', 'unconscious',
];

interface Props {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

export function ConditionsSection({ conditions, onChange }: Props) {
  const available = ALL_CONDITIONS.filter((c) => !conditions.includes(c));

  return (
    <Group gap="xs" wrap="wrap">
      {conditions.map((c) => (
        <Group key={c} gap={2} wrap="nowrap">
          <WikiLink tagType="condition" name={c} />
          <Badge
            color="red"
            variant="light"
            size="xs"
            style={{ cursor: 'pointer' }}
            onClick={() => onChange(conditions.filter((x) => x !== c))}
            title="Remove"
          >
            &times;
          </Badge>
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
                onClick={() => onChange([...conditions, c])}
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
