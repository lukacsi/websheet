import { Stack, Group, Text, Select, NumberInput, Table, Paper } from '@mantine/core';
import type { AbilityKey, AbilityScores, SpellSlots } from '@/types';
import { ABILITY_NAMES } from '@/types';
import { spellSaveDc, spellAttackBonus, formatModifier } from '@/utils/derived-stats';
import { numOrDefault } from '@/utils/form-helpers';
import { darkPaperStyle, centeredCompactInputStyles } from '@/theme/styles';

const SLOT_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

const CASTING_OPTIONS = [
  { value: '', label: 'None' },
  ...(['int', 'wis', 'cha', 'str', 'dex', 'con'] as AbilityKey[]).map((k) => ({
    value: k,
    label: ABILITY_NAMES[k],
  })),
];

interface Props {
  spellcastingAbility?: AbilityKey;
  abilities: AbilityScores;
  level: number;
  spellSlots: SpellSlots;
  onAbilityChange: (ability: AbilityKey | undefined) => void;
  onSlotsChange: (slots: SpellSlots) => void;
}

export function SpellcastingSection({
  spellcastingAbility, abilities, level, spellSlots,
  onAbilityChange, onSlotsChange,
}: Props) {
  const hasCasting = !!spellcastingAbility;
  const dc = hasCasting ? spellSaveDc(abilities[spellcastingAbility!], level) : null;
  const atk = hasCasting ? spellAttackBonus(abilities[spellcastingAbility!], level) : null;

  // Ensure spellSlots arrays have 9 entries (levels 1-9)
  const max = [...(spellSlots.max || []), ...Array(9).fill(0)].slice(0, 9);
  const used = [...(spellSlots.used || []), ...Array(9).fill(0)].slice(0, 9);

  // Only show columns up to the highest non-zero max slot (minimum 3)
  const highestSlotLevel = Math.max(3, max.findLastIndex((m) => m > 0) + 1);

  function setMax(idx: number, val: number) {
    const next = [...max];
    next[idx] = val;
    onSlotsChange({ max: next, used });
  }

  function setUsed(idx: number, val: number) {
    const next = [...used];
    next[idx] = val;
    onSlotsChange({ max, used: next });
  }

  return (
    <Stack gap="sm">
      <Group gap="md">
        <Select
          label="Casting Ability"
          data={CASTING_OPTIONS}
          value={spellcastingAbility ?? ''}
          onChange={(v) => onAbilityChange((v || undefined) as AbilityKey | undefined)}
          size="xs"
          w={140}
        />
        {dc !== null && (
          <Paper p="xs" ta="center" style={darkPaperStyle}>
            <Text size="xs" c="dimmed">Spell Save DC</Text>
            <Text fw={700} size="lg">{dc}</Text>
          </Paper>
        )}
        {atk !== null && (
          <Paper p="xs" ta="center" style={darkPaperStyle}>
            <Text size="xs" c="dimmed">Spell Attack</Text>
            <Text fw={700} size="lg">{formatModifier(atk)}</Text>
          </Paper>
        )}
      </Group>

      {hasCasting && (
        <Table withTableBorder withColumnBorders verticalSpacing={4} horizontalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              {SLOT_LABELS.slice(0, highestSlotLevel).map((label, i) => (
                <Table.Th key={i} ta="center" fz="xs">{label}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              {max.slice(0, highestSlotLevel).map((m, i) => (
                <Table.Td key={i} ta="center" p={2}>
                  <NumberInput
                    value={m}
                    onChange={(v) => setMax(i, numOrDefault(v, 0))}
                    min={0}
                    size="xs"
                    w={44}
                    styles={centeredCompactInputStyles}
                  />
                </Table.Td>
              ))}
            </Table.Tr>
            <Table.Tr>
              {used.slice(0, highestSlotLevel).map((u, i) => (
                <Table.Td key={i} ta="center" p={2}>
                  <Text size="xs" c="dimmed" mb={2}>used</Text>
                  <NumberInput
                    value={u}
                    onChange={(v) => setUsed(i, numOrDefault(v, 0))}
                    min={0}
                    max={max[i]}
                    size="xs"
                    w={44}
                    styles={centeredCompactInputStyles}
                  />
                </Table.Td>
              ))}
            </Table.Tr>
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
