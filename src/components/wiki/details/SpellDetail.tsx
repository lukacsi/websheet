import { Stack, Text, Group, Badge, Divider } from '@mantine/core';
import type { Spell, SpellSchool } from '@/types/spell';
import { SPELL_SCHOOL_NAMES } from '@/types/spell';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import type { Entry } from '@/types/common';

function formatTime(time: Spell['time']): string {
  if (!time?.length) return 'Unknown';
  const t = time[0];
  const base = `${t.number} ${t.unit}${t.number > 1 ? 's' : ''}`;
  return t.condition ? `${base}, ${t.condition}` : base;
}

function formatRange(range: Spell['range']): string {
  if (!range) return 'Unknown';
  if (range.type === 'point') {
    if (!range.distance) return 'Self';
    if (range.distance.type === 'self') return 'Self';
    if (range.distance.type === 'touch') return 'Touch';
    return `${range.distance.amount} ${range.distance.type}`;
  }
  if (range.distance?.amount) {
    return `${range.type} (${range.distance.amount} ${range.distance.type})`;
  }
  return range.type;
}

function formatComponents(comp: Spell['components']): string {
  const parts: string[] = [];
  if (comp?.v) parts.push('V');
  if (comp?.s) parts.push('S');
  if (comp?.m) {
    const mat = typeof comp.m === 'string' ? comp.m : comp.m.text;
    parts.push(`M (${mat})`);
  }
  return parts.join(', ') || 'None';
}

function formatDuration(dur: Spell['duration']): string {
  if (!dur?.length) return 'Unknown';
  const d = dur[0];
  const prefix = d.concentration ? 'Concentration, up to ' : '';
  if (d.type === 'instant') return 'Instantaneous';
  if (d.type === 'permanent') return 'Until dispelled';
  if (d.type === 'special') return 'Special';
  if (d.duration) return `${prefix}${d.duration.amount} ${d.duration.type}${(d.duration.amount ?? 0) > 1 ? 's' : ''}`;
  return prefix + d.type;
}

interface Props {
  data: Record<string, unknown>;
}

export function SpellDetail({ data }: Props) {
  const spell = data as unknown as Spell;
  const levelLabel = spell.level === 0
    ? `${SPELL_SCHOOL_NAMES[spell.school]} cantrip`
    : `Level ${spell.level} ${SPELL_SCHOOL_NAMES[spell.school as SpellSchool]?.toLowerCase() ?? spell.school}`;

  return (
    <Stack gap="sm">
      <Text size="sm" c="parchment.6" fs="italic">{levelLabel}</Text>

      <Group gap="xs" wrap="wrap">
        {spell.isRitual && <Badge size="xs" color="gold" variant="light">Ritual</Badge>}
        {spell.duration?.[0]?.concentration && <Badge size="xs" color="gold" variant="light">Concentration</Badge>}
        <Badge size="xs" variant="outline">{spell.source}</Badge>
      </Group>

      <Divider />

      <DetailRow label="Casting Time" value={formatTime(spell.time)} />
      <DetailRow label="Range" value={formatRange(spell.range)} />
      <DetailRow label="Components" value={formatComponents(spell.components)} />
      <DetailRow label="Duration" value={formatDuration(spell.duration)} />

      <Divider />

      {spell.entries?.length > 0 && (
        <EntryRenderer entries={spell.entries as Entry[]} />
      )}

      {spell.entriesHigherLevel && spell.entriesHigherLevel.length > 0 && (
        <>
          <Divider />
          <EntryRenderer entries={spell.entriesHigherLevel as Entry[]} />
        </>
      )}

      {spell.classes?.length > 0 && (
        <>
          <Divider />
          <Group gap={4} wrap="wrap">
            <Text size="xs" c="parchment.5">Classes:</Text>
            {spell.classes.map(c => (
              <Badge key={c} size="xs" variant="outline" color="inkBrown">{c}</Badge>
            ))}
          </Group>
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
