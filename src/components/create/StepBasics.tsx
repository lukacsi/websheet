import { TextInput, Stack, Text } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '@/types/wizard';

export function StepBasics() {
  const { register, formState: { errors } } = useFormContext<WizardFormData>();

  return (
    <Stack gap="md">
      <Text size="sm" c="parchment.6" fs="italic">
        Every legend starts with a name.
      </Text>

      <TextInput
        label="Character Name"
        placeholder="Enter character name"
        size="lg"
        required
        error={errors.name?.message}
        styles={{ input: { fontFamily: 'Cinzel, serif', color: 'var(--mantine-color-gold-4)' } }}
        {...register('name')}
      />

      <TextInput
        label="Player Name"
        placeholder="Your name (optional)"
        {...register('playerName')}
      />
    </Stack>
  );
}
