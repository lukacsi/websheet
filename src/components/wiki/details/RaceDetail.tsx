import { Stack, Text, Group, Badge, Divider } from '@mantine/core';
import type { Race } from '@/types/race';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import type { Entry } from '@/types/common';

const SIZE_NAMES: Record<string, string> = {
  T: 'Tiny', S: 'Small', M: 'Medium', L: 'Large', H: 'Huge', G: 'Gargantuan',
};

interface Props {
  data: Record<string, unknown>;
}

export function RaceDetail({ data }: Props) {
  const race = data as unknown as Race;
  const sizes = (race.size ?? []).map(s => SIZE_NAMES[s] ?? s).join(' or ');

  return (
    <Stack gap="sm">
      <Group gap="xs" wrap="wrap">
        {sizes && <Badge size="xs" variant="light">{sizes}</Badge>}
        <Badge size="xs" variant="outline">{race.source}</Badge>
      </Group>

      <Divider />

      <DetailRow label="Speed" value={`${race.speed?.walk ?? 30} ft.`} />
      {race.darkvision && (
        <DetailRow label="Darkvision" value={`${race.darkvision} ft.`} />
      )}
      {race.languages?.length > 0 && (
        <DetailRow label="Languages" value={race.languages.join(', ')} />
      )}
      {race.resistances?.length && (
        <DetailRow label="Resistances" value={race.resistances.join(', ')} />
      )}

      {race.traits?.length > 0 && (
        <>
          <Divider />
          <EntryRenderer entries={race.traits as Entry[]} />
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
