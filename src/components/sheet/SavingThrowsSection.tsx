import { Table, Checkbox, Text } from '@mantine/core';
import type { AbilityKey, AbilityScores } from '@/types';
import { ABILITY_NAMES } from '@/types';
import { savingThrow, formatModifier } from '@/utils/derived-stats';

const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface Props {
  abilities: AbilityScores;
  proficiencies: AbilityKey[];
  level: number;
  onChange: (proficiencies: AbilityKey[]) => void;
}

export function SavingThrowsSection({ abilities, proficiencies, level, onChange }: Props) {
  function toggleProf(key: AbilityKey) {
    if (proficiencies.includes(key)) {
      onChange(proficiencies.filter((k) => k !== key));
    } else {
      onChange([...proficiencies, key]);
    }
  }

  return (
    <Table withRowBorders={false} verticalSpacing={4}>
      <Table.Tbody>
        {ABILITIES.map((key) => {
          const proficient = proficiencies.includes(key);
          const mod = savingThrow(abilities[key], proficient, level);
          return (
            <Table.Tr key={key}>
              <Table.Td w={30}>
                <Checkbox
                  size="xs"
                  checked={proficient}
                  onChange={() => toggleProf(key)}
                />
              </Table.Td>
              <Table.Td w={40}>
                <Text size="sm" fw={600}>{formatModifier(mod)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{ABILITY_NAMES[key]}</Text>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
