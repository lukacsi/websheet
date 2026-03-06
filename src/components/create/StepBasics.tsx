import { TextInput, Stack } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '@/types/wizard';

export function StepBasics() {
  const { register, formState: { errors } } = useFormContext<WizardFormData>();

  return (
    <Stack gap="md">
      <TextInput
        label="Character Name"
        placeholder="Enter character name"
        required
        error={errors.name?.message}
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
