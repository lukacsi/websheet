import { SegmentedControl, Select, Stack, Text, Group } from '@mantine/core';
import { ABILITY_NAMES, type AbilityKey } from '@/types';

interface BackgroundBonusPickerProps {
  eligible: AbilityKey[];
  mode: '+2/+1' | '+1/+1/+1';
  bonuses: Partial<Record<AbilityKey, number>>;
  onModeChange: (mode: '+2/+1' | '+1/+1/+1') => void;
  onBonusesChange: (bonuses: Partial<Record<AbilityKey, number>>) => void;
}

export function BackgroundBonusPicker({
  eligible,
  mode,
  bonuses,
  onModeChange,
  onBonusesChange,
}: BackgroundBonusPickerProps) {
  const plus2Ability = Object.entries(bonuses).find(([, v]) => v === 2)?.[0] as AbilityKey | undefined;
  const plus1Ability = Object.entries(bonuses).find(([, v]) => v === 1)?.[0] as AbilityKey | undefined;

  function handleModeChange(newMode: string) {
    const m = newMode as '+2/+1' | '+1/+1/+1';
    onModeChange(m);
    if (m === '+1/+1/+1') {
      // Auto-apply +1 to all eligible
      const next: Partial<Record<AbilityKey, number>> = {};
      for (const key of eligible) next[key] = 1;
      onBonusesChange(next);
    } else {
      // Reset — user must pick
      onBonusesChange({});
    }
  }

  function handlePlus2Change(value: string | null) {
    if (!value) return;
    const key = value as AbilityKey;
    const next: Partial<Record<AbilityKey, number>> = { [key]: 2 };
    // Keep +1 if it's a different ability
    if (plus1Ability && plus1Ability !== key) next[plus1Ability] = 1;
    onBonusesChange(next);
  }

  function handlePlus1Change(value: string | null) {
    if (!value) return;
    const key = value as AbilityKey;
    const next: Partial<Record<AbilityKey, number>> = { [key]: 1 };
    // Keep +2 if it's a different ability
    if (plus2Ability && plus2Ability !== key) next[plus2Ability] = 2;
    onBonusesChange(next);
  }

  const selectOptions = eligible.map(k => ({
    value: k,
    label: ABILITY_NAMES[k],
  }));

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>Ability Score Bonuses</Text>
      <Text size="xs" c="dimmed">
        Eligible: {eligible.map(k => ABILITY_NAMES[k]).join(', ')}
      </Text>

      <SegmentedControl
        value={mode}
        onChange={handleModeChange}
        data={[
          { label: '+2 / +1', value: '+2/+1' },
          { label: '+1 / +1 / +1', value: '+1/+1/+1' },
        ]}
        size="xs"
      />

      {mode === '+2/+1' && (
        <Group gap="md">
          <Select
            label="+2 to"
            data={selectOptions.map(o => ({
              ...o,
              disabled: o.value === plus1Ability,
            }))}
            value={plus2Ability ?? null}
            onChange={handlePlus2Change}
            size="xs"
            w={160}
            placeholder="Select..."
          />
          <Select
            label="+1 to"
            data={selectOptions.map(o => ({
              ...o,
              disabled: o.value === plus2Ability,
            }))}
            value={plus1Ability ?? null}
            onChange={handlePlus1Change}
            size="xs"
            w={160}
            placeholder="Select..."
          />
        </Group>
      )}

      {mode === '+1/+1/+1' && (
        <Text size="xs" c="dimmed">
          +1 applied to all three eligible abilities.
        </Text>
      )}
    </Stack>
  );
}
