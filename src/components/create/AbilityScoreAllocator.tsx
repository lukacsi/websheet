import { Group, Text, Stack, ActionIcon, Select, Table, Badge } from '@mantine/core';
import { IconPlus, IconMinus } from '@tabler/icons-react';
import { ABILITY_NAMES, abilityModifier, type AbilityKey, type AbilityScores } from '@/types';
import type { AbilityMethod } from '@/types/wizard';
import {
  POINT_BUY_COSTS,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
  STANDARD_ARRAY,
  canIncrement,
  canDecrement,
  pointBuyRemaining,
} from '@/utils/point-buy';
import { formatModifier } from '@/utils/derived-stats';

const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface AbilityScoreAllocatorProps {
  method: AbilityMethod;
  scores: AbilityScores;
  onChange: (scores: AbilityScores) => void;
  /** Background bonuses to display alongside base scores */
  bonuses?: Partial<Record<AbilityKey, number>>;
}

function BonusCell({ bonus }: { bonus: number }) {
  return (
    <Table.Td ta="center">
      {bonus > 0 ? <Text size="sm" c="inkBrown">+{bonus}</Text> : <Text size="sm" c="dimmed">{'\u2014'}</Text>}
    </Table.Td>
  );
}

function PointBuyRow({
  ability,
  scores,
  onChange,
  bonus,
  showBonus,
}: {
  ability: AbilityKey;
  scores: AbilityScores;
  onChange: (scores: AbilityScores) => void;
  bonus: number;
  showBonus: boolean;
}) {
  const value = scores[ability];
  const cost = POINT_BUY_COSTS[value] ?? 0;
  const total = value + bonus;

  return (
    <Table.Tr>
      <Table.Td><Text fw={500}>{ABILITY_NAMES[ability]}</Text></Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            size="sm"
            variant="subtle"
            disabled={!canDecrement(scores, ability)}
            onClick={() => onChange({ ...scores, [ability]: value - 1 })}
          >
            <IconMinus size={14} />
          </ActionIcon>
          <Text w={24} ta="center" fw={600}>{value}</Text>
          <ActionIcon
            size="sm"
            variant="subtle"
            disabled={!canIncrement(scores, ability)}
            onClick={() => onChange({ ...scores, [ability]: value + 1 })}
          >
            <IconPlus size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
      <Table.Td ta="center"><Text size="sm" c="dimmed">{cost}</Text></Table.Td>
      {showBonus && <BonusCell bonus={bonus} />}
      <Table.Td ta="center"><Text fw={600}>{total}</Text></Table.Td>
      <Table.Td ta="center"><Text fw={500}>{formatModifier(abilityModifier(total))}</Text></Table.Td>
    </Table.Tr>
  );
}

function StandardArrayRow({
  ability,
  scores,
  onChange,
  allScores,
  bonus,
  showBonus,
}: {
  ability: AbilityKey;
  scores: AbilityScores;
  onChange: (scores: AbilityScores) => void;
  allScores: AbilityScores;
  bonus: number;
  showBonus: boolean;
}) {
  const usedValues = new Set(
    ABILITIES.filter(a => a !== ability).map(a => allScores[a]),
  );
  const options = STANDARD_ARRAY.map(v => ({
    value: String(v),
    label: String(v),
    disabled: usedValues.has(v),
  }));
  const total = scores[ability] + bonus;

  return (
    <Table.Tr>
      <Table.Td><Text fw={500}>{ABILITY_NAMES[ability]}</Text></Table.Td>
      <Table.Td>
        <Select
          data={options}
          value={String(scores[ability])}
          onChange={v => v && onChange({ ...scores, [ability]: Number(v) })}
          size="xs"
          w={80}
          allowDeselect={false}
        />
      </Table.Td>
      {showBonus && <BonusCell bonus={bonus} />}
      <Table.Td ta="center"><Text fw={600}>{total}</Text></Table.Td>
      <Table.Td ta="center"><Text fw={500}>{formatModifier(abilityModifier(total))}</Text></Table.Td>
    </Table.Tr>
  );
}

function ManualRow({
  ability,
  scores,
  onChange,
  bonus,
  showBonus,
}: {
  ability: AbilityKey;
  scores: AbilityScores;
  onChange: (scores: AbilityScores) => void;
  bonus: number;
  showBonus: boolean;
}) {
  const value = scores[ability];
  const total = value + bonus;

  return (
    <Table.Tr>
      <Table.Td><Text fw={500}>{ABILITY_NAMES[ability]}</Text></Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            size="sm"
            variant="subtle"
            disabled={value <= 3}
            onClick={() => onChange({ ...scores, [ability]: value - 1 })}
          >
            <IconMinus size={14} />
          </ActionIcon>
          <Text w={24} ta="center" fw={600}>{value}</Text>
          <ActionIcon
            size="sm"
            variant="subtle"
            disabled={value >= 18}
            onClick={() => onChange({ ...scores, [ability]: value + 1 })}
          >
            <IconPlus size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
      {showBonus && <BonusCell bonus={bonus} />}
      <Table.Td ta="center"><Text fw={600}>{total}</Text></Table.Td>
      <Table.Td ta="center"><Text fw={500}>{formatModifier(abilityModifier(total))}</Text></Table.Td>
    </Table.Tr>
  );
}

export function AbilityScoreAllocator({
  method,
  scores,
  onChange,
  bonuses = {},
}: AbilityScoreAllocatorProps) {
  const hasBonuses = Object.values(bonuses).some(v => v !== 0);

  return (
    <Stack gap="sm">
      {method === 'pointBuy' && (
        <Group gap="xs">
          <Text size="sm">Points remaining:</Text>
          <Badge
            color={pointBuyRemaining(scores) === 0 ? 'green' : pointBuyRemaining(scores) < 0 ? 'red' : 'inkBrown'}
            variant="filled"
          >
            {pointBuyRemaining(scores)} / 27
          </Badge>
        </Group>
      )}

      <Table withTableBorder withColumnBorders verticalSpacing="xs" horizontalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ability</Table.Th>
            <Table.Th>{method === 'standardArray' ? 'Assign' : 'Score'}</Table.Th>
            {method === 'pointBuy' && <Table.Th ta="center">Cost</Table.Th>}
            {hasBonuses && <Table.Th ta="center">Bonus</Table.Th>}
            <Table.Th ta="center">Total</Table.Th>
            <Table.Th ta="center">Mod</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {ABILITIES.map(ability => {
            const bonus = bonuses[ability] ?? 0;
            switch (method) {
              case 'pointBuy':
                return (
                  <PointBuyRow
                    key={ability}
                    ability={ability}
                    scores={scores}
                    onChange={onChange}
                    bonus={bonus}
                    showBonus={hasBonuses}
                  />
                );
              case 'standardArray':
                return (
                  <StandardArrayRow
                    key={ability}
                    ability={ability}
                    scores={scores}
                    onChange={onChange}
                    allScores={scores}
                    bonus={bonus}
                    showBonus={hasBonuses}
                  />
                );
              case 'manual':
                return (
                  <ManualRow
                    key={ability}
                    ability={ability}
                    scores={scores}
                    onChange={onChange}
                    bonus={bonus}
                    showBonus={hasBonuses}
                  />
                );
            }
          })}
        </Table.Tbody>
      </Table>

      {method === 'pointBuy' && (
        <Text size="xs" c="dimmed">
          Scores range {POINT_BUY_MIN}–{POINT_BUY_MAX}. Cost increases at 14 ({POINT_BUY_COSTS[14]}) and 15 ({POINT_BUY_COSTS[15]}).
        </Text>
      )}
      {method === 'standardArray' && (
        <Text size="xs" c="dimmed">
          Assign each value from the standard array ({STANDARD_ARRAY.join(', ')}) to one ability.
        </Text>
      )}
      {method === 'manual' && (
        <Text size="xs" c="dimmed">
          Enter scores manually (3–18). Use this for rolled stats or custom values.
        </Text>
      )}
    </Stack>
  );
}
