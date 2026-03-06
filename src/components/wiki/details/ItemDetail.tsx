import { Stack, Text, Group, Badge, Divider } from '@mantine/core';
import type { Item } from '@/types/item';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import type { Entry } from '@/types/common';

interface Props {
  data: Record<string, unknown>;
}

export function ItemDetail({ data }: Props) {
  const item = data as unknown as Item;

  const attunement = item.requiresAttunement
    ? typeof item.requiresAttunement === 'string'
      ? `Requires attunement ${item.requiresAttunement}`
      : 'Requires attunement'
    : null;

  return (
    <Stack gap="sm">
      <Group gap="xs" wrap="wrap">
        {item.rarity && item.rarity !== 'none' && (
          <Badge size="xs" variant="light" color="teal">{item.rarity}</Badge>
        )}
        {item.type && <Badge size="xs" variant="outline">{item.type}</Badge>}
        <Badge size="xs" variant="outline">{item.source}</Badge>
      </Group>

      {attunement && <Text size="xs" c="dimmed" fs="italic">{attunement}</Text>}

      <Divider />

      {item.damage && (
        <DetailRow label="Damage" value={`${item.damage}${item.damageType ? ` ${item.damageType}` : ''}`} />
      )}
      {item.versatileDamage && (
        <DetailRow label="Versatile" value={item.versatileDamage} />
      )}
      {item.ac != null && (
        <DetailRow label="AC" value={String(item.ac)} />
      )}
      {item.range && (
        <DetailRow label="Range" value={item.range} />
      )}
      {item.weight != null && (
        <DetailRow label="Weight" value={`${item.weight} lb.`} />
      )}
      {item.properties?.length > 0 && (
        <DetailRow label="Properties" value={item.properties.join(', ')} />
      )}
      {item.stealthDisadvantage && (
        <Text size="sm" c="dimmed">Stealth disadvantage</Text>
      )}

      {item.entries?.length > 0 && (
        <>
          <Divider />
          <EntryRenderer entries={item.entries as Entry[]} />
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
