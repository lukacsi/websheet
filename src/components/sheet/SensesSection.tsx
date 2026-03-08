import { Stack, Group, Text, Paper } from '@mantine/core';
import type { AbilityScores, Skill } from '@/types';
import { skillModifier } from '@/utils/derived-stats';
import { cardStyle } from '@/theme/styles';

interface Props {
  abilities: AbilityScores;
  skillProficiencies: Skill[];
  level: number;
}

function passiveScore(
  abilityScore: number,
  proficient: boolean,
  level: number,
): number {
  return 10 + skillModifier(abilityScore, proficient, false, level);
}

export function SensesSection({ abilities, skillProficiencies, level }: Props) {
  const senses = [
    { label: 'Passive Perception', value: passiveScore(abilities.wis, skillProficiencies.includes('perception'), level) },
    { label: 'Passive Investigation', value: passiveScore(abilities.int, skillProficiencies.includes('investigation'), level) },
    { label: 'Passive Insight', value: passiveScore(abilities.wis, skillProficiencies.includes('insight'), level) },
  ];

  return (
    <Paper p="xs" style={cardStyle}>
      <Stack gap={4}>
        {senses.map((s) => (
          <Group key={s.label} justify="space-between">
            <Text size="xs" c="parchment.5">{s.label}</Text>
            <Text size="sm" fw={600}>{s.value}</Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
