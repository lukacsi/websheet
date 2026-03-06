import { Stack, Badge, Group, Divider } from '@mantine/core';
import type { ClassFeature } from '@/types/class';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import type { Entry } from '@/types/common';

interface Props {
  data: Record<string, unknown>;
}

export function ClassFeatureDetail({ data }: Props) {
  const feature = data as unknown as ClassFeature;

  return (
    <Stack gap="sm">
      <Group gap="xs" wrap="wrap">
        <Badge size="xs" variant="light" color="orange">{feature.className}</Badge>
        <Badge size="xs" variant="outline">Level {feature.level}</Badge>
        <Badge size="xs" variant="outline">{feature.source}</Badge>
        {feature.isSubclassFeature && feature.subclassName && (
          <Badge size="xs" variant="light" color="grape">{feature.subclassName}</Badge>
        )}
      </Group>

      <Divider />

      {feature.entries?.length > 0 && (
        <EntryRenderer entries={feature.entries as Entry[]} />
      )}
    </Stack>
  );
}
