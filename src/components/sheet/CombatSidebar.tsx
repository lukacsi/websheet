import { NumberInput, Text, Paper, Group, Stack, ActionIcon } from '@mantine/core';
import { IconPlus, IconMinus } from '@tabler/icons-react';
import type { Character } from '@/types';
import { formatModifier } from '@/utils/derived-stats';
import { numOrDefault } from '@/utils/form-helpers';
import {
  elevatedStyle,
  glowAccent,
  centeredLargeInputStyles,
  centeredCompactInputStyles,
} from '@/theme/styles';

interface Props {
  character: Character;
  calculatedInitiative: number;
  calculatedProfBonus: number;
  calculatedAc: number;
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

export function CombatSidebar({ character, calculatedInitiative, calculatedProfBonus, calculatedAc, onChange }: Props) {
  const hpPct = character.maxHp > 0
    ? Math.min(100, Math.max(0, (character.hp / character.maxHp) * 100))
    : 100;
  const hpBorderColor = hpPct >= 100
    ? 'var(--mantine-color-parchment-8)'
    : hpPct > 50
      ? 'var(--mantine-color-parchment-6)'
      : hpPct > 25
        ? 'var(--mantine-color-gold-7)'
        : 'var(--mantine-color-bloodRed-5)';

  return (
    <Stack gap="xs">
      {/* HP Bar — full width, compact horizontal layout */}
      <Paper
        p="xs"
        style={{
          ...elevatedStyle,
          borderBottom: `3px solid ${hpBorderColor}`,
          transition: 'border-color 0.3s ease',
        }}
      >
        <Group gap="sm" align="center" wrap="nowrap">
          <ActionIcon
            size="md"
            variant="subtle"
            color="bloodRed"
            onClick={() => onChange({ hp: Math.max(0, character.hp - 1) })}
          >
            <IconMinus size={16} />
          </ActionIcon>
          <NumberInput
            value={character.hp}
            onChange={(v) => onChange({ hp: numOrDefault(v, 0) })}
            min={0}
            size="xs"
            styles={centeredLargeInputStyles}
            style={{ width: 60 }}
          />
          <Text size="xs" c="parchment.6">/</Text>
          <NumberInput
            value={character.maxHp}
            onChange={(v) => onChange({ maxHp: numOrDefault(v, 0) })}
            min={0}
            size="xs"
            styles={centeredCompactInputStyles}
            style={{ width: 48 }}
          />
          <ActionIcon
            size="md"
            variant="subtle"
            color="gold"
            onClick={() => onChange({ hp: character.hp + 1 })}
          >
            <IconPlus size={16} />
          </ActionIcon>
          <Text size="xs" tt="uppercase" fw={600} c="parchment.5" style={{ letterSpacing: '0.5px' }}>
            Hit Points
          </Text>
          <div style={{ flex: 1 }} />
          <Text size="xs" c="parchment.6">Temp:</Text>
          <NumberInput
            value={character.tempHp}
            onChange={(v) => onChange({ tempHp: numOrDefault(v, 0) })}
            min={0}
            size="xs"
            styles={centeredCompactInputStyles}
            style={{ width: 44 }}
          />
        </Group>
      </Paper>

      {/* Stats Grid — AC first with distinct styling */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 'var(--mantine-spacing-xs)' }}>
        <StatBox
          label="AC"
          extraStyle={{
            borderLeft: '3px solid var(--mantine-color-parchment-4)',
          }}
          labelColor="parchment.3"
        >
          <NumberInput
            value={character.ac}
            onChange={(v) => onChange({ ac: numOrDefault(v, 10) })}
            min={0}
            size="xs"
            styles={centeredLargeInputStyles}
          />
          <Text size="xs" c="parchment.6">auto: {calculatedAc}</Text>
        </StatBox>
        <StatBox label="Speed">
          <NumberInput
            value={character.speed.walk ?? 30}
            onChange={(v) => onChange({ speed: { ...character.speed, walk: numOrDefault(v, 30) } })}
            min={0}
            step={5}
            size="xs"
            suffix=" ft"
            styles={centeredLargeInputStyles}
          />
        </StatBox>
        <StatBox label="Initiative">
          <NumberInput
            value={character.initiative}
            onChange={(v) => onChange({ initiative: numOrDefault(v, 0) })}
            size="xs"
            prefix="+"
            styles={centeredLargeInputStyles}
          />
          <Text size="xs" c="parchment.6">auto: {formatModifier(calculatedInitiative)}</Text>
        </StatBox>
        <StatBox label="Prof.">
          <NumberInput
            value={character.proficiencyBonus}
            onChange={(v) => onChange({ proficiencyBonus: numOrDefault(v, 2) })}
            size="xs"
            prefix="+"
            styles={centeredLargeInputStyles}
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
                styles={centeredCompactInputStyles}
              />
            </StatBox>
          );
        })}
      </div>
    </Stack>
  );
}
