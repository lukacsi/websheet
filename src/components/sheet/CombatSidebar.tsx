import { NumberInput, Text, Paper } from '@mantine/core';
import type { Character } from '@/types';
import { formatModifier } from '@/utils/derived-stats';
import { numOrDefault } from '@/utils/form-helpers';
import {
  elevatedStyle,
  glowAccent,
  centeredInputStyles,
  centeredBoldInputStyles,
  centeredLargeInputStyles,
} from '@/theme/styles';

interface Props {
  character: Character;
  calculatedInitiative: number;
  calculatedProfBonus: number;
  onChange: (partial: Partial<Character>) => void;
}

function StatBox({ label, children, extraStyle, labelColor }: {
  label: string;
  children: React.ReactNode;
  extraStyle?: React.CSSProperties;
  labelColor?: string;
}) {
  return (
    <Paper
      p="xs"
      ta="center"
      style={{ ...elevatedStyle, ...extraStyle }}
    >
      <Text size="xs" tt="uppercase" fw={600} c={labelColor ?? 'parchment.5'} mb={2} style={{ letterSpacing: '0.5px' }}>
        {label}
      </Text>
      {children}
    </Paper>
  );
}

export function CombatSidebar({ character, calculatedInitiative, calculatedProfBonus, onChange }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 'var(--mantine-spacing-xs)' }}>
      <StatBox
        label="HP"
        extraStyle={character.hp < character.maxHp ? { border: '1px solid var(--mantine-color-gold-6)', ...glowAccent } : undefined}
      >
        <NumberInput
          value={character.hp}
          onChange={(v) => onChange({ hp: numOrDefault(v, 0) })}
          min={0}
          size="xs"
          styles={centeredLargeInputStyles}
        />
      </StatBox>
      <StatBox label="Max">
        <NumberInput
          value={character.maxHp}
          onChange={(v) => onChange({ maxHp: numOrDefault(v, 0) })}
          min={0}
          size="xs"
          styles={centeredLargeInputStyles}
        />
      </StatBox>
      <StatBox label="Temp HP">
        <NumberInput
          value={character.tempHp}
          onChange={(v) => onChange({ tempHp: numOrDefault(v, 0) })}
          min={0}
          size="xs"
          styles={centeredInputStyles}
        />
      </StatBox>
      <StatBox label="AC" extraStyle={{ borderTop: '3px solid var(--mantine-color-parchment-6)' }}>
        <NumberInput
          value={character.ac}
          onChange={(v) => onChange({ ac: numOrDefault(v, 10) })}
          min={0}
          size="xs"
          styles={centeredLargeInputStyles}
        />
      </StatBox>
      <StatBox label="Speed">
        <NumberInput
          value={character.speed.walk ?? 30}
          onChange={(v) => onChange({ speed: { ...character.speed, walk: numOrDefault(v, 30) } })}
          min={0}
          step={5}
          size="xs"
          suffix=" ft"
          styles={centeredInputStyles}
        />
      </StatBox>
      {(['fly', 'swim', 'climb', 'burrow'] as const).map((type) => {
        const value = character.speed[type];
        if (!value) return null;
        return (
          <StatBox key={type} label={type}>
            <NumberInput
              value={value}
              onChange={(v) => onChange({ speed: { ...character.speed, [type]: numOrDefault(v, 0) } })}
              min={0}
              step={5}
              size="xs"
              suffix=" ft"
              styles={{ input: { textAlign: 'center', fontSize: 12 } }}
            />
          </StatBox>
        );
      })}
      <StatBox label="Initiative">
        <NumberInput
          value={character.initiative}
          onChange={(v) => onChange({ initiative: numOrDefault(v, 0) })}
          size="xs"
          styles={centeredBoldInputStyles}
        />
        <Text size="xs" c="parchment.6">auto: {formatModifier(calculatedInitiative)}</Text>
      </StatBox>
      <StatBox label="Prof.">
        <NumberInput
          value={character.proficiencyBonus}
          onChange={(v) => onChange({ proficiencyBonus: numOrDefault(v, 2) })}
          size="xs"
          styles={centeredBoldInputStyles}
        />
        <Text size="xs" c="parchment.6">auto: {formatModifier(calculatedProfBonus)}</Text>
      </StatBox>
      <StatBox label="Level" extraStyle={glowAccent} labelColor="gold.4">
        <NumberInput
          value={character.level}
          onChange={(v) => onChange({ level: numOrDefault(v, 1) })}
          min={1}
          max={20}
          size="xs"
          styles={centeredLargeInputStyles}
        />
      </StatBox>
    </div>
  );
}
