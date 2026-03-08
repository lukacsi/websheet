import { SimpleGrid, Text, NumberInput, Paper, Checkbox, Group } from '@mantine/core';
import type { AbilityScores, AbilityKey } from '@/types';
import { ABILITY_NAMES, abilityModifier } from '@/types';
import { savingThrow, formatModifier } from '@/utils/derived-stats';
import { numOrDefault, toggleArrayItem } from '@/utils/form-helpers';
import { darkPaperStyle } from '@/theme/styles';

const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface Props {
  abilities: AbilityScores;
  savingThrowProficiencies: AbilityKey[];
  level: number;
  onAbilitiesChange: (abilities: AbilityScores) => void;
  onSavesChange: (proficiencies: AbilityKey[]) => void;
}

export function AbilityBlock({
  abilities, savingThrowProficiencies, level,
  onAbilitiesChange, onSavesChange,
}: Props) {
  function setScore(key: AbilityKey, value: number) {
    onAbilitiesChange({ ...abilities, [key]: value });
  }

  function toggleSaveProf(key: AbilityKey) {
    onSavesChange(toggleArrayItem(savingThrowProficiencies, key));
  }

  return (
    <SimpleGrid cols={3} spacing="xs">
      {ABILITIES.map((key) => {
        const mod = abilityModifier(abilities[key]);
        const proficient = savingThrowProficiencies.includes(key);
        const save = savingThrow(abilities[key], proficient, level);
        return (
          <Paper
            key={key}
            p={6}
            ta="center"
            style={darkPaperStyle}
          >
            <Text size="xs" tt="uppercase" fw={700} c="parchment.4" mb={2}>
              {ABILITY_NAMES[key].slice(0, 3)}
            </Text>
            <Text fw={700} size="lg" c={mod >= 0 ? 'parchment.2' : 'red.4'} lh={1.1}>
              {formatModifier(mod)}
            </Text>
            <NumberInput
              value={abilities[key]}
              onChange={(v) => setScore(key, numOrDefault(v, 10))}
              min={1}
              max={30}
              size="xs"
              w={50}
              mx="auto"
              mt={2}
              styles={{ input: { textAlign: 'center', padding: '2px 4px' } }}
            />
            <Group gap={4} justify="center" mt={4}>
              <Checkbox
                size="xs"
                checked={proficient}
                onChange={() => toggleSaveProf(key)}
                title="Saving throw proficiency"
                styles={{ input: { cursor: 'pointer' } }}
              />
              <Text size="xs" fw={500} c="dimmed">
                Save {formatModifier(save)}
              </Text>
            </Group>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
