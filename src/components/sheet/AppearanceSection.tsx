import { Group, TextInput, Stack, Image, Text } from '@mantine/core';
import type { CharacterAppearance } from '@/types';

interface Props {
  appearance: CharacterAppearance;
  portraitUrl?: string;
  onChange: (appearance: CharacterAppearance) => void;
  onPortraitChange: (url: string) => void;
}

const FIELDS: { key: keyof CharacterAppearance; label: string }[] = [
  { key: 'age', label: 'Age' },
  { key: 'height', label: 'Height' },
  { key: 'weight', label: 'Weight' },
  { key: 'eyes', label: 'Eyes' },
  { key: 'skin', label: 'Skin' },
  { key: 'hair', label: 'Hair' },
];

export function AppearanceSection({ appearance, portraitUrl, onChange, onPortraitChange }: Props) {
  function updateField(key: keyof CharacterAppearance, value: string) {
    onChange({ ...appearance, [key]: value });
  }

  return (
    <Stack gap="xs">
      <Group gap="xs" grow wrap="wrap">
        {FIELDS.map(({ key, label }) => (
          <TextInput
            key={key}
            label={label}
            value={appearance[key]}
            onChange={(e) => updateField(key, e.currentTarget.value)}
            size="xs"
            style={{ minWidth: 80 }}
          />
        ))}
      </Group>

      <Group gap="md" align="flex-start">
        <TextInput
          label="Portrait URL"
          value={portraitUrl ?? ''}
          onChange={(e) => onPortraitChange(e.currentTarget.value)}
          size="xs"
          placeholder="https://..."
          style={{ flex: 1 }}
        />
        {portraitUrl && (
          <Image
            src={portraitUrl}
            alt="Character portrait"
            w={80}
            h={80}
            radius="sm"
            fallbackSrc=""
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        {!portraitUrl && (
          <Text size="xs" c="dimmed" mt={24}>No portrait</Text>
        )}
      </Group>
    </Stack>
  );
}
