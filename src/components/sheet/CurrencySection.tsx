import { Group, NumberInput, Text } from '@mantine/core';
import type { Currency } from '@/types';

const COINS: { key: keyof Currency; label: string; color: string }[] = [
  { key: 'pp', label: 'PP', color: '#c0c0c0' },
  { key: 'gp', label: 'GP', color: '#d4a017' },
  { key: 'ep', label: 'EP', color: '#8a8a8a' },
  { key: 'sp', label: 'SP', color: '#a0a0a0' },
  { key: 'cp', label: 'CP', color: '#b87333' },
];

interface Props {
  currency: Currency;
  onChange: (currency: Currency) => void;
}

export function CurrencySection({ currency, onChange }: Props) {
  return (
    <Group gap="xs">
      {COINS.map(({ key, label, color }) => (
        <NumberInput
          key={key}
          value={currency[key]}
          onChange={(v) => onChange({ ...currency, [key]: typeof v === 'number' ? v : 0 })}
          min={0}
          size="xs"
          w={70}
          label={<Text size="xs" fw={600} style={{ color }}>{label}</Text>}
          styles={{ input: { textAlign: 'center' } }}
        />
      ))}
    </Group>
  );
}
