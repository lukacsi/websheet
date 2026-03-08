import { Stack, Text, Group, Badge, Divider } from '@mantine/core';
import type { Background } from '@/types/background';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import type { Entry } from '@/types/common';

interface Props {
  data: Record<string, unknown>;
}

export function BackgroundDetail({ data }: Props) {
  const bg = data as unknown as Background;

  return (
    <Stack gap="sm">
      <Group gap="xs" wrap="wrap">
        <Badge size="xs" variant="outline">{bg.source}</Badge>
      </Group>

      <Divider />

      {bg.skillProficiencies?.length > 0 && (
        <DetailRow label="Skills" value={bg.skillProficiencies.join(', ')} />
      )}
      {bg.toolProficiencies && bg.toolProficiencies.length > 0 && (
        <DetailRow label="Tools" value={bg.toolProficiencies.join(', ')} />
      )}
      {bg.languages && bg.languages.length > 0 && (
        <DetailRow label="Languages" value={bg.languages.join(', ')} />
      )}
      {bg.feats && bg.feats.length > 0 && (
        <Group gap="xs">
          <Text size="sm" fw={600}>Feat:</Text>
          {bg.feats.map(f => (
            <Badge key={f} size="xs" variant="light" color="gold">
              {f.split('|')[0].replace(/\b\w/g, c => c.toUpperCase())}
            </Badge>
          ))}
        </Group>
      )}

      {bg.feature && (
        <>
          <Divider />
          <Text size="sm" fw={700}>{bg.feature.name}</Text>
          <EntryRenderer entries={bg.feature.entries as Entry[] ?? []} />
        </>
      )}

      {bg.entries?.length > 0 && (
        <>
          <Divider />
          <EntryRenderer entries={bg.entries as Entry[]} />
        </>
      )}
    </Stack>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Group gap="xs" wrap="nowrap" align="flex-start">
      <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>{label}:</Text>
      <Text size="sm">{value}</Text>
    </Group>
  );
}
