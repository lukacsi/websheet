import { Stack, Text, Badge, Group, Divider } from '@mantine/core';
import type { EntityTagType } from '@/utils/parse-tags';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import type { Entry } from '@/types/common';

interface Props {
  tagType: EntityTagType;
  data: Record<string, unknown>;
}

export function FallbackDetail({ tagType, data }: Props) {
  const name = data.name as string | undefined;
  const source = data.source as string | undefined;
  const entries = data.entries as Entry[] | undefined;

  return (
    <Stack gap="sm">
      <Group gap="xs" wrap="wrap">
        <Badge size="xs" variant="outline">{tagType}</Badge>
        {source && <Badge size="xs" variant="outline">{source}</Badge>}
      </Group>

      {name && <Text fw={700}>{name}</Text>}

      {entries && entries.length > 0 ? (
        <>
          <Divider />
          <EntryRenderer entries={entries} />
        </>
      ) : (
        <Text c="parchment.6" size="sm" mt="md">
          Detailed data for this {tagType} is not available yet.
        </Text>
      )}
    </Stack>
  );
}
