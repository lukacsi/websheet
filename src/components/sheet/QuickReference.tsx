import { Paper, Group, Text, Divider } from '@mantine/core';
import { cardStyle } from '@/theme/styles';
import { spellSaveDc, spellAttackBonus, formatModifier } from '@/utils/derived-stats';
import type { CharacterAttack, SpellSlots, TrackedResource, AbilityKey, AbilityScores } from '@/types';

interface QuickReferenceProps {
  attacks: CharacterAttack[];
  spellcastingAbility?: AbilityKey;
  abilities: AbilityScores;
  level: number;
  spellSlots: SpellSlots;
  resources: TrackedResource[];
  onSlotsChange: (spellSlots: SpellSlots) => void;
  onResourcesChange: (resources: TrackedResource[]) => void;
  onTabChange: (tab: string) => void;
}

function bestAttack(attacks: CharacterAttack[]): CharacterAttack | null {
  if (attacks.length === 0) return null;
  let best = attacks[0];
  let bestVal = parseBonus(best.attackBonus);
  for (let i = 1; i < attacks.length; i++) {
    const val = parseBonus(attacks[i].attackBonus);
    if (val > bestVal) {
      best = attacks[i];
      bestVal = val;
    }
  }
  return best;
}

function parseBonus(s: string): number {
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

function AttackCluster({ attack, onTabChange }: { attack: CharacterAttack; onTabChange: (t: string) => void }) {
  return (
    <Group gap={6} style={{ cursor: 'pointer' }} onClick={() => onTabChange('combat')}>
      <Text size="xs" c="parchment.2" fw={700}>{attack.attackBonus}</Text>
      <Text size="xs" c="parchment.4">{attack.damage}</Text>
    </Group>
  );
}

function SlotPips({
  level,
  max,
  used,
  onToggle,
}: {
  level: number;
  max: number;
  used: number;
  onToggle: (slotIndex: number) => void;
}) {
  const available = max - used;
  const pips = [];
  for (let i = 0; i < max; i++) {
    const filled = i < available;
    pips.push(
      <span
        key={i}
        onClick={(e) => { e.stopPropagation(); onToggle(i); }}
        style={{ cursor: 'pointer', fontSize: 10, color: filled ? 'var(--mantine-color-gold-4)' : 'var(--mantine-color-parchment-7)' }}
      >
        {filled ? '●' : '○'}
      </span>,
    );
  }
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 10, color: 'var(--mantine-color-parchment-6)', marginRight: 2 }}>{level}:</span>
      {pips}
    </span>
  );
}

function SpellCluster({
  spellcastingAbility,
  abilities,
  level,
  spellSlots,
  onSlotsChange,
  onTabChange,
}: {
  spellcastingAbility: AbilityKey;
  abilities: AbilityScores;
  level: number;
  spellSlots: SpellSlots;
  onSlotsChange: (s: SpellSlots) => void;
  onTabChange: (t: string) => void;
}) {
  const abilityScore = abilities[spellcastingAbility];
  const dc = spellSaveDc(abilityScore, level);
  const atkBonus = formatModifier(spellAttackBonus(abilityScore, level));

  const toggleSlot = (slotLevel: number, pipIndex: number) => {
    const newUsed = [...spellSlots.used];
    const available = spellSlots.max[slotLevel] - (newUsed[slotLevel] || 0);
    if (pipIndex < available) {
      // Clicking a filled pip → use a slot
      newUsed[slotLevel] = (newUsed[slotLevel] || 0) + 1;
    } else {
      // Clicking an empty pip → restore a slot
      newUsed[slotLevel] = Math.max(0, (newUsed[slotLevel] || 0) - 1);
    }
    onSlotsChange({ ...spellSlots, used: newUsed });
  };

  const hasSlots = spellSlots.max.some((m) => m > 0);

  return (
    <Group gap={8} wrap="wrap">
      <Group gap={6} style={{ cursor: 'pointer' }} onClick={() => onTabChange('spells')}>
        <Text size="xs" c="parchment.6">DC</Text>
        <Text size="xs" c="parchment.2" fw={700}>{dc}</Text>
        <Text size="xs" c="parchment.2" fw={700}>{atkBonus}</Text>
        <Text size="xs" c="parchment.6">atk</Text>
      </Group>
      {hasSlots && (
        <Group gap={6} wrap="wrap">
          {spellSlots.max.map((max, i) =>
            max > 0 ? (
              <SlotPips
                key={i}
                level={i + 1}
                max={max}
                used={spellSlots.used[i] || 0}
                onToggle={(pipIndex) => toggleSlot(i, pipIndex)}
              />
            ) : null,
          )}
        </Group>
      )}
    </Group>
  );
}

function ResourceCluster({ resources, onTabChange }: { resources: TrackedResource[]; onTabChange: (t: string) => void }) {
  const shown = resources.slice(0, 3);
  const extra = resources.length - shown.length;
  return (
    <Group gap={8} style={{ cursor: 'pointer' }} onClick={() => onTabChange('combat')} wrap="wrap">
      {shown.map((r) => (
        <Text key={r.name} size="xs" c="parchment.2">
          {r.name} <Text span c="parchment.5">{r.max - r.used}/{r.max}</Text>
        </Text>
      ))}
      {extra > 0 && <Text size="xs" c="parchment.6">+{extra} more</Text>}
    </Group>
  );
}

export function QuickReference({
  attacks,
  spellcastingAbility,
  abilities,
  level,
  spellSlots,
  resources,
  onSlotsChange,
  onResourcesChange: _onResourcesChange,
  onTabChange,
}: QuickReferenceProps) {
  const best = bestAttack(attacks);
  const hasSpellcasting = !!spellcastingAbility;
  const hasResources = resources.length > 0;

  if (!best && !hasSpellcasting && !hasResources) return null;

  const clusters: React.ReactNode[] = [];

  if (best) {
    clusters.push(<AttackCluster key="atk" attack={best} onTabChange={onTabChange} />);
  }

  if (hasSpellcasting) {
    clusters.push(
      <SpellCluster
        key="spell"
        spellcastingAbility={spellcastingAbility}
        abilities={abilities}
        level={level}
        spellSlots={spellSlots}
        onSlotsChange={onSlotsChange}
        onTabChange={onTabChange}
      />,
    );
  }

  if (hasResources) {
    clusters.push(<ResourceCluster key="res" resources={resources} onTabChange={onTabChange} />);
  }

  return (
    <Paper p={6} mt="xs" style={cardStyle}>
      <Group justify="space-between" gap="sm" wrap="nowrap">
        {clusters.map((cluster, i) => (
          <Group key={i} gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            {i > 0 && <Divider orientation="vertical" color="parchment.8" />}
            {cluster}
          </Group>
        ))}
      </Group>
    </Paper>
  );
}
