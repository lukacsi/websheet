import { Stack, Textarea, Text } from '@mantine/core';

interface Props {
  backstory: string;
  alliesAndOrganizations: string;
  onChange: (field: string, value: string) => void;
}

const warmLabel = (text: string) => (
  <Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>{text}</Text>
);

export function BackstorySection({ backstory, alliesAndOrganizations, onChange }: Props) {
  return (
    <Stack gap="xs">
      <Textarea
        label={warmLabel('Backstory')}
        value={backstory}
        onChange={(e) => onChange('backstory', e.currentTarget.value)}
        autosize
        minRows={4}
        size="sm"
        variant="unstyled"
      />
      <Textarea
        label={warmLabel('Allies & Organizations')}
        value={alliesAndOrganizations}
        onChange={(e) => onChange('alliesAndOrganizations', e.currentTarget.value)}
        autosize
        minRows={2}
        size="sm"
        variant="unstyled"
      />
    </Stack>
  );
}
