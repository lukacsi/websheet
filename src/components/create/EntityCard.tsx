import { Card, Text, Group, Badge, Stack, Divider } from '@mantine/core';
import { EntryRenderer } from './EntryRenderer';
import type { Entry } from '@/types';

interface EntityCardProps {
  name: string;
  source: string;
  badges?: string[];
  entries?: Entry[];
  children?: React.ReactNode;
}

export function EntityCard({ name, source, badges, entries, children }: EntityCardProps) {
  return (
    <Card
      padding="md"
      radius="sm"
      style={{
        backgroundColor: 'var(--mantine-color-dark-7)',
        border: '1px solid var(--mantine-color-dark-4)',
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={700} size="lg">{name}</Text>
          <Text size="xs" c="dimmed">{source}</Text>
        </Group>

        {badges && badges.length > 0 && (
          <Group gap="xs">
            {badges.map(b => (
              <Badge key={b} size="sm" variant="light" color="inkBrown">{b}</Badge>
            ))}
          </Group>
        )}

        {children}

        {entries && entries.length > 0 && (
          <>
            <Divider color="dark.4" />
            <EntryRenderer entries={entries} />
          </>
        )}
      </Stack>
    </Card>
  );
}
