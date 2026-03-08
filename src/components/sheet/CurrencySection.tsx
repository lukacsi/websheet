import { Group, NumberInput, Text } from '@mantine/core';
import type { Currency } from '@/types';
import { numOrDefault } from '@/utils/form-helpers';
import { centeredInputStyles } from '@/theme/styles';

const COINS: { key: keyof Currency; label: string; color: string }[] = [
  { key: 'pp', label: 'PP', color: 'var(--mantine-color-gray-4)' },
  { key: 'gp', label: 'GP', color: 'var(--mantine-color-gold-5)' },
  { key: 'ep', label: 'EP', color: 'var(--mantine-color-gray-6)' },
  { key: 'sp', label: 'SP', color: 'var(--mantine-color-gray-5)' },
  { key: 'cp', label: 'CP', color: 'var(--mantine-color-orange-7)' },
];

interface Props {
  currency: Currency;
  onChange: (currency: Currency) => void;
}

export function CurrencySection({ currency, onChange }: Props) {
  return (
    <Group gap="xs" wrap="nowrap">
      {COINS.map(({ key, label, color }) => (
        <NumberInput
          key={key}
          value={currency[key]}
          onChange={(v) => onChange({ ...currency, [key]: numOrDefault(v, 0) })}
          min={0}
          size="xs"
          style={{ flex: 1 }}
          label={<Text size="xs" fw={600} style={{ color }}>{label}</Text>}
          styles={centeredInputStyles}
        />
      ))}
    </Group>
  );
}
