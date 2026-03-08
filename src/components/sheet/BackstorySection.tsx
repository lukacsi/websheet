import { Stack, Textarea } from '@mantine/core';

interface Props {
  backstory: string;
  alliesAndOrganizations: string;
  onChange: (field: string, value: string) => void;
}

export function BackstorySection({ backstory, alliesAndOrganizations, onChange }: Props) {
  return (
    <Stack gap="xs">
      <Textarea
        label="Backstory"
        value={backstory}
        onChange={(e) => onChange('backstory', e.currentTarget.value)}
        autosize
        minRows={4}
        size="sm"
      />
      <Textarea
        label="Allies & Organizations"
        value={alliesAndOrganizations}
        onChange={(e) => onChange('alliesAndOrganizations', e.currentTarget.value)}
        autosize
        minRows={2}
        size="sm"
      />
    </Stack>
  );
}
