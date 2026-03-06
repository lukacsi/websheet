import { SegmentedControl, Stack, Text } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import type { WizardFormData, AbilityMethod } from '@/types/wizard';
import { POINT_BUY_DEFAULT, DEFAULT_ABILITIES } from '@/utils/point-buy';
import { AbilityScoreAllocator } from './AbilityScoreAllocator';

const STANDARD_ARRAY_DEFAULT = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };

export function StepAbilityScores() {
  const { setValue, watch } = useFormContext<WizardFormData>();
  const method = watch('abilityMethod');
  const scores = watch('baseAbilities');
  const backgroundBonuses = watch('backgroundBonuses');

  function handleMethodChange(newMethod: string) {
    const m = newMethod as AbilityMethod;
    setValue('abilityMethod', m);
    // Reset scores when switching methods
    switch (m) {
      case 'pointBuy':
        setValue('baseAbilities', { ...POINT_BUY_DEFAULT });
        break;
      case 'standardArray':
        setValue('baseAbilities', { ...STANDARD_ARRAY_DEFAULT });
        break;
      case 'manual':
        setValue('baseAbilities', { ...DEFAULT_ABILITIES });
        break;
    }
  }

  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Text size="sm" fw={500}>Method</Text>
        <SegmentedControl
          value={method}
          onChange={handleMethodChange}
          data={[
            { label: 'Point Buy', value: 'pointBuy' },
            { label: 'Standard Array', value: 'standardArray' },
            { label: 'Manual', value: 'manual' },
          ]}
          fullWidth
        />
      </Stack>

      <AbilityScoreAllocator
        method={method}
        scores={scores}
        onChange={s => setValue('baseAbilities', s)}
        bonuses={backgroundBonuses}
      />
    </Stack>
  );
}
