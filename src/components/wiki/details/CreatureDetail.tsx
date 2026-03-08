import { Stack, Text, Group, SimpleGrid, Divider, Title } from '@mantine/core';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import type { Entry } from '@/types/common';

const SIZE_NAMES: Record<string, string> = {
  T: 'Tiny', S: 'Small', M: 'Medium', L: 'Large', H: 'Huge', G: 'Gargantuan',
};

const ABILITY_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const ABILITY_LABELS: Record<string, string> = {
  str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
};

function mod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
}

function formatAc(ac: unknown): string {
  if (ac == null) return '—';
  if (Array.isArray(ac)) {
    return ac.map(a => {
      if (typeof a === 'number') return String(a);
      if (typeof a === 'object' && a !== null) {
        const parts = [String(a.ac ?? '?')];
        if (a.from?.length) parts.push(`(${a.from.join(', ')})`);
        return parts.join(' ');
      }
      return String(a);
    }).join(', ');
  }
  return String(ac);
}

function formatHp(hp: unknown): string {
  if (hp == null) return '—';
  if (typeof hp === 'number') return String(hp);
  if (typeof hp === 'object' && hp !== null) {
    const h = hp as { average?: number; formula?: string; special?: string };
    if (h.special) return h.special;
    if (h.average != null && h.formula) return `${h.average} (${h.formula})`;
    if (h.average != null) return String(h.average);
    if (h.formula) return h.formula;
  }
  return String(hp);
}

function formatSpeed(speed: unknown): string {
  if (speed == null) return '30 ft.';
  if (typeof speed === 'number') return `${speed} ft.`;
  if (typeof speed === 'object' && speed !== null) {
    const s = speed as Record<string, unknown>;
    const parts: string[] = [];
    if (s.walk != null) {
      const w = typeof s.walk === 'object' ? (s.walk as { number: number }).number : s.walk;
      parts.push(`${w} ft.`);
    }
    for (const mode of ['fly', 'swim', 'climb', 'burrow'] as const) {
      if (s[mode] != null) {
        const v = typeof s[mode] === 'object' ? (s[mode] as { number: number }).number : s[mode];
        const extra = typeof s[mode] === 'object' && (s[mode] as { condition?: string }).condition
          ? ` (${(s[mode] as { condition: string }).condition})`
          : '';
        parts.push(`${mode} ${v} ft.${extra}`);
      }
    }
    return parts.join(', ') || '0 ft.';
  }
  return String(speed);
}

function formatCreatureType(ct: unknown): string {
  if (typeof ct === 'string') return ct;
  if (typeof ct === 'object' && ct !== null) {
    const t = ct as { type?: string; tags?: unknown[] };
    let result = t.type ?? 'unknown';
    if (t.tags?.length) {
      const tagStrs = t.tags.map(tag => typeof tag === 'string' ? tag : (tag as { tag: string }).tag);
      result += ` (${tagStrs.join(', ')})`;
    }
    return result;
  }
  return String(ct ?? 'unknown');
}

function formatSaves(save: Record<string, string> | null): string {
  if (!save) return '';
  return Object.entries(save).map(([k, v]) => `${ABILITY_LABELS[k] ?? k} ${v}`).join(', ');
}

function formatSkills(skill: Record<string, string> | null): string {
  if (!skill) return '';
  return Object.entries(skill)
    .map(([k, v]) => `${k.replace(/\b\w/g, c => c.toUpperCase())} ${v}`)
    .join(', ');
}

function formatDamageList(list: unknown): string {
  if (!list || !Array.isArray(list)) return '';
  return list.map(item => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      const obj = item as { special?: string; preNote?: string; resist?: string[]; immune?: string[]; vulnerable?: string[]; note?: string };
      if (obj.special) return obj.special;
      const parts: string[] = [];
      if (obj.preNote) parts.push(obj.preNote);
      const types = obj.resist || obj.immune || obj.vulnerable || [];
      parts.push(types.join(', '));
      if (obj.note) parts.push(obj.note);
      return parts.join(' ');
    }
    return String(item);
  }).join('; ');
}

function formatConditionImmune(list: unknown): string {
  if (!list || !Array.isArray(list)) return '';
  return list.map(item => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      const obj = item as { conditionImmune?: string[]; preNote?: string; note?: string };
      const parts: string[] = [];
      if (obj.preNote) parts.push(obj.preNote);
      if (obj.conditionImmune) parts.push(obj.conditionImmune.join(', '));
      if (obj.note) parts.push(obj.note);
      return parts.join(' ');
    }
    return String(item);
  }).join('; ');
}

function formatSenses(senses: unknown): string {
  if (!senses) return '';
  if (typeof senses === 'string') return senses;
  if (Array.isArray(senses)) return senses.join(', ');
  return String(senses);
}

function formatLanguages(languages: unknown): string {
  if (!languages) return '—';
  if (typeof languages === 'string') return languages;
  if (Array.isArray(languages)) return languages.join(', ') || '—';
  return String(languages);
}

function crToXp(cr: string | null): string {
  if (!cr) return '';
  const XP_TABLE: Record<string, string> = {
    '0': '0', '1/8': '25', '1/4': '50', '1/2': '100',
    '1': '200', '2': '450', '3': '700', '4': '1,100', '5': '1,800',
    '6': '2,300', '7': '2,900', '8': '3,900', '9': '5,000', '10': '5,900',
    '11': '7,200', '12': '8,400', '13': '10,000', '14': '11,500', '15': '13,000',
    '16': '15,000', '17': '18,000', '18': '20,000', '19': '22,000', '20': '25,000',
    '21': '33,000', '22': '41,000', '23': '50,000', '24': '62,000', '25': '75,000',
    '26': '90,000', '27': '105,000', '28': '120,000', '29': '135,000', '30': '155,000',
  };
  return XP_TABLE[cr] ?? '';
}

interface Props {
  data: Record<string, unknown>;
}

export function CreatureDetail({ data }: Props) {
  const m = data as Record<string, any>;
  const sizes = Array.isArray(m.size)
    ? m.size.map((s: string) => SIZE_NAMES[s] ?? s).join(' or ')
    : '';
  const typeStr = formatCreatureType(m.creatureType);
  const xp = crToXp(m.cr);

  const saves = formatSaves(m.save);
  const skills = formatSkills(m.skill);
  const resistStr = formatDamageList(m.resist);
  const immuneStr = formatDamageList(m.immune);
  const vulnerableStr = formatDamageList(m.vulnerable);
  const condImmune = formatConditionImmune(m.conditionImmune);
  const sensesStr = formatSenses(m.senses);

  return (
    <Stack gap={0}>
      {/* Type line */}
      <Text size="sm" fs="italic" c="parchment.6">
        {[sizes, typeStr].filter(Boolean).join(' ')}
      </Text>

      <Divider my="xs" color="red.8" size="sm" />

      {/* Core stats */}
      <DetailRow label="Armor Class" value={formatAc(m.ac)} />
      <DetailRow label="Hit Points" value={formatHp(m.hp)} />
      <DetailRow label="Speed" value={formatSpeed(m.speed)} />

      <Divider my="xs" color="red.8" size="sm" />

      {/* Ability scores */}
      <SimpleGrid cols={6} spacing={4}>
        {ABILITY_ORDER.map(ab => (
          <Stack key={ab} gap={0} align="center">
            <Text size="xs" fw={700} c="red.4">{ABILITY_LABELS[ab]}</Text>
            <Text size="sm">
              {m[ab] ?? 10} ({mod(m[ab] ?? 10)})
            </Text>
          </Stack>
        ))}
      </SimpleGrid>

      <Divider my="xs" color="red.8" size="sm" />

      {/* Secondary stats */}
      {saves && <DetailRow label="Saving Throws" value={saves} />}
      {skills && <DetailRow label="Skills" value={skills} />}
      {vulnerableStr && <DetailRow label="Damage Vulnerabilities" value={vulnerableStr} />}
      {resistStr && <DetailRow label="Damage Resistances" value={resistStr} />}
      {immuneStr && <DetailRow label="Damage Immunities" value={immuneStr} />}
      {condImmune && <DetailRow label="Condition Immunities" value={condImmune} />}
      {sensesStr && <DetailRow label="Senses" value={sensesStr} />}
      {m.passive != null && <DetailRow label="Passive Perception" value={String(m.passive)} />}
      <DetailRow label="Languages" value={formatLanguages(m.languages)} />
      {m.cr && (
        <DetailRow label="Challenge" value={`${m.cr}${xp ? ` (${xp} XP)` : ''}`} />
      )}

      <Divider my="xs" color="red.8" size="sm" />

      {/* Traits */}
      {m.trait && Array.isArray(m.trait) && m.trait.length > 0 && (
        <Stack gap="xs" mt="xs">
          {m.trait.map((t: any, i: number) => (
            <Stack key={i} gap={2}>
              <Text size="sm" fw={700} fs="italic">{t.name}.</Text>
              {t.entries && <EntryRenderer entries={t.entries as Entry[]} />}
            </Stack>
          ))}
        </Stack>
      )}

      {/* Actions */}
      {m.actionEntries && Array.isArray(m.actionEntries) && m.actionEntries.length > 0 && (
        <Stack gap="xs" mt="sm">
          <Title order={6} c="red.4" style={{ borderBottom: '1px solid var(--mantine-color-red-8)' }}>
            Actions
          </Title>
          {m.actionEntries.map((a: any, i: number) => (
            <Stack key={i} gap={2}>
              <Text size="sm" fw={700} fs="italic">{a.name}.</Text>
              {a.entries && <EntryRenderer entries={a.entries as Entry[]} />}
            </Stack>
          ))}
        </Stack>
      )}

      {/* Bonus Actions */}
      {m.bonus && Array.isArray(m.bonus) && m.bonus.length > 0 && (
        <Stack gap="xs" mt="sm">
          <Title order={6} c="red.4" style={{ borderBottom: '1px solid var(--mantine-color-red-8)' }}>
            Bonus Actions
          </Title>
          {m.bonus.map((b: any, i: number) => (
            <Stack key={i} gap={2}>
              <Text size="sm" fw={700} fs="italic">{b.name}.</Text>
              {b.entries && <EntryRenderer entries={b.entries as Entry[]} />}
            </Stack>
          ))}
        </Stack>
      )}

      {/* Reactions */}
      {m.reaction && Array.isArray(m.reaction) && m.reaction.length > 0 && (
        <Stack gap="xs" mt="sm">
          <Title order={6} c="red.4" style={{ borderBottom: '1px solid var(--mantine-color-red-8)' }}>
            Reactions
          </Title>
          {m.reaction.map((r: any, i: number) => (
            <Stack key={i} gap={2}>
              <Text size="sm" fw={700} fs="italic">{r.name}.</Text>
              {r.entries && <EntryRenderer entries={r.entries as Entry[]} />}
            </Stack>
          ))}
        </Stack>
      )}

      {/* Legendary Actions */}
      {m.legendary && Array.isArray(m.legendary) && m.legendary.length > 0 && (
        <Stack gap="xs" mt="sm">
          <Title order={6} c="red.4" style={{ borderBottom: '1px solid var(--mantine-color-red-8)' }}>
            Legendary Actions
          </Title>
          {m.legendary.map((l: any, i: number) => (
            <Stack key={i} gap={2}>
              {l.name && <Text size="sm" fw={700} fs="italic">{l.name}.</Text>}
              {l.entries ? (
                <EntryRenderer entries={l.entries as Entry[]} />
              ) : typeof l === 'string' ? (
                <Text size="sm">{l}</Text>
              ) : null}
            </Stack>
          ))}
        </Stack>
      )}

      {/* Entries (general description) */}
      {m.entries && Array.isArray(m.entries) && m.entries.length > 0 && (
        <Stack gap="xs" mt="sm">
          <EntryRenderer entries={m.entries as Entry[]} />
        </Stack>
      )}
    </Stack>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Group gap="xs" wrap="nowrap" align="flex-start" py={1}>
      <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>{label}:</Text>
      <Text size="sm">{value}</Text>
    </Group>
  );
}
