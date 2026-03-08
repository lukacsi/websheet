import { useEffect, useState } from 'react';
import { Stack, Text, Group, Badge, Divider, Table, Loader, Title, ScrollArea } from '@mantine/core';
import type { Class, ClassFeature } from '@/types/class';
import type { Entry } from '@/types/common';
import { ABILITY_NAMES, type AbilityKey } from '@/types/ability';
import { stripTags } from '@/utils/strip-tags';
import { TaggedText } from '@/components/wiki/TaggedText';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import { fetchClassFeatures } from '@/api/wiki';

interface Props {
  data: Record<string, unknown>;
}

/** Parse primaryAbility — can be AbilityKey[] or [{dex: true, wis: true}] */
function parsePrimaryAbility(raw: unknown): string {
  if (!raw || !Array.isArray(raw)) return 'None';
  const names = raw.flatMap((item: unknown) => {
    if (typeof item === 'string') return [ABILITY_NAMES[item as AbilityKey] ?? item];
    if (typeof item === 'object' && item !== null) {
      return Object.keys(item)
        .filter(k => (item as Record<string, boolean>)[k])
        .map(k => ABILITY_NAMES[k as AbilityKey] ?? k);
    }
    return [];
  });
  return names.join(' and ') || 'None';
}

interface FeatureRef {
  name: string;
  level: number;
  isSubclass: boolean;
}

function parseFeatureRefs(classFeatures: unknown[]): FeatureRef[] {
  return classFeatures.map((f: unknown) => {
    const str = typeof f === 'string' ? f : (f as { classFeature: string }).classFeature;
    const isSubclass = typeof f === 'object' && f !== null && (f as { gainSubclassFeature?: boolean }).gainSubclassFeature === true;
    const parts = str.split('|');
    return { name: parts[0], level: parseInt(parts[3]) || 0, isSubclass };
  });
}

function profBonus(level: number): string {
  return `+${Math.floor((level - 1) / 4) + 2}`;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Render a classTableGroups cell value */
function renderTableCell(cell: unknown): string {
  if (cell == null) return '\u2014';
  if (typeof cell === 'number') return cell === 0 ? '\u2014' : String(cell);
  if (typeof cell === 'string') return cell;
  if (typeof cell === 'object' && cell !== null) {
    const obj = cell as Record<string, unknown>;
    // Dice type: {type: "dice", toRoll: [{number: 1, faces: 6}]}
    if (obj.type === 'dice' && Array.isArray(obj.toRoll)) {
      const dice = obj.toRoll as Array<{ number: number; faces: number }>;
      return dice.map(d => `${d.number}d${d.faces}`).join('+');
    }
    // Bonus speed: {type: "bonusSpeed", value: 10}
    if (obj.type === 'bonusSpeed') {
      const val = obj.value as number;
      return val === 0 ? '\u2014' : `+${val} ft.`;
    }
    // Bonus: {type: "bonus", value: "+1"}
    if (obj.type === 'bonus') return String(obj.value ?? '\u2014');
  }
  return String(cell);
}

export function ClassDetail({ data }: Props) {
  const cls = data as unknown as Class & { classTableGroups?: TableGroup[] };
  const [features, setFeatures] = useState<ClassFeature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    setLoadingFeatures(true);
    fetchClassFeatures(cls.name, cls.source)
      .then(f => setFeatures(f as unknown as ClassFeature[]))
      .finally(() => setLoadingFeatures(false));
  }, [cls.name, cls.source]);

  const featureRefs = parseFeatureRefs((cls.classFeatures as unknown[]) ?? []);

  // Build feature name → ClassFeature map
  const featureMap = new Map<string, ClassFeature>();
  for (const f of features) {
    featureMap.set(f.name, f);
  }

  // Group features by level for the inline display
  const byLevel = new Map<number, FeatureRef[]>();
  for (const ref of featureRefs) {
    const arr = byLevel.get(ref.level) ?? [];
    arr.push(ref);
    byLevel.set(ref.level, arr);
  }

  // Parse classTableGroups for extra columns
  const extraCols: { label: string; rows: unknown[] }[] = [];
  if (cls.classTableGroups) {
    for (const group of cls.classTableGroups) {
      if (group.rowsSpellProgression) continue; // spell slots handled separately
      const labels = (group.colLabels ?? []) as string[];
      const rows = (group.rows ?? []) as unknown[][];
      for (let c = 0; c < labels.length; c++) {
        extraCols.push({
          label: stripTags(labels[c]),
          rows: rows.map(row => row[c]),
        });
      }
    }
  }

  return (
    <Stack gap="md">
      {/* Feature Progression Table */}
      <ScrollArea>
        <Table withTableBorder withColumnBorders striped highlightOnHover style={{ fontSize: '0.8rem' }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40}>Level</Table.Th>
              <Table.Th w={30}>PB</Table.Th>
              <Table.Th>Features</Table.Th>
              {extraCols.map((col, i) => (
                <Table.Th key={i} style={{ whiteSpace: 'nowrap' }}>{col.label}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.from({ length: 20 }, (_, i) => i + 1).map(level => {
              const levelFeatures = byLevel.get(level) ?? [];
              return (
                <Table.Tr key={level}>
                  <Table.Td>{ordinal(level)}</Table.Td>
                  <Table.Td>{profBonus(level)}</Table.Td>
                  <Table.Td>
                    {levelFeatures.map((f, i) => (
                      <span key={f.name}>
                        {i > 0 && ', '}
                        <Text component="span" size="xs" c={f.isSubclass ? 'grape' : 'orange'}>
                          {f.name}
                        </Text>
                      </span>
                    ))}
                    {levelFeatures.length === 0 && '\u2014'}
                  </Table.Td>
                  {extraCols.map((col, ci) => (
                    <Table.Td key={ci}>{renderTableCell(col.rows[level - 1])}</Table.Td>
                  ))}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Divider />

      {/* Core Traits */}
      <Title order={4}>{cls.name}</Title>
      <Text size="sm" fw={700}>Core Traits</Text>
      <TraitRow label="Primary Ability" value={parsePrimaryAbility(cls.primaryAbility)} />
      <TraitRow label="Hit Point Die" value={`D${cls.hitDie} per ${cls.name} level`} />
      <TraitRow label="Hit Points at Level 1" value={`${cls.hitDie} + Con. modifier`} />
      <TraitRow label={`Hit Points per additional ${cls.name} Level`} value={`D${cls.hitDie} (or ${Math.floor(cls.hitDie / 2) + 1}) + Con. modifier`} />
      <TraitRow label="Saving Throw Proficiencies" value={cls.savingThrows.map(a => ABILITY_NAMES[a]).join(', ')} />

      {cls.skillChoices && (
        <TraitRow
          label="Skill Proficiencies"
          value={`Choose ${cls.skillChoices.count}: ${cls.skillChoices.from.map((s: string) => s.replace(/\b\w/g, (c: string) => c.toUpperCase())).join(', ')}`}
        />
      )}

      {cls.weaponProficiencies?.length > 0 && (
        <Group gap="xs" wrap="wrap" align="flex-start">
          <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>Weapon Proficiencies:</Text>
          <Text size="sm">{cls.weaponProficiencies.map((w: string, i: number) => (
            <span key={i}>{i > 0 && ', '}<TaggedText text={w} /></span>
          ))}</Text>
        </Group>
      )}

      {cls.armorProficiencies?.length > 0 && (
        <Group gap="xs" wrap="wrap">
          <Text size="sm" fw={600}>Armor Proficiencies:</Text>
          <Group gap={4}>
            {cls.armorProficiencies.map((a: string) => (
              <Badge key={a} size="xs" variant="outline">{stripTags(a)}</Badge>
            ))}
          </Group>
        </Group>
      )}

      {cls.toolProficiencies?.length > 0 && (
        <Group gap="xs" wrap="wrap" align="flex-start">
          <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>Tool Proficiencies:</Text>
          <Text size="sm">{cls.toolProficiencies.map((t: string, i: number) => (
            <span key={i}>{i > 0 && ', '}<TaggedText text={t} /></span>
          ))}</Text>
        </Group>
      )}

      {cls.startingEquipment?.length > 0 && (
        <Group gap="xs" wrap="wrap" align="flex-start">
          <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>Starting Equipment:</Text>
          <Text size="sm">{cls.startingEquipment.map((e: Entry, i: number) => (
            <span key={i}>{i > 0 && ' '}<TaggedText text={typeof e === 'string' ? e : ''} /></span>
          ))}</Text>
        </Group>
      )}

      {cls.spellcastingAbility && (
        <TraitRow label="Spellcasting Ability" value={ABILITY_NAMES[cls.spellcastingAbility] ?? cls.spellcastingAbility} />
      )}

      {/* Multiclassing */}
      {cls.multiclassing && Object.keys(cls.multiclassing).length > 0 && (
        <>
          <Divider />
          <Text size="sm" fw={700}>Multiclassing</Text>
          {cls.multiclassing.requirements && (
            <TraitRow
              label="Prerequisites"
              value={Object.entries(cls.multiclassing.requirements)
                .map(([k, v]) => `${ABILITY_NAMES[k as AbilityKey] ?? k} ${v}+`)
                .join(', ')}
            />
          )}
          {cls.multiclassing.proficienciesGained?.armor && (
            <TraitRow label="Armor gained" value={cls.multiclassing.proficienciesGained.armor.join(', ')} />
          )}
          {cls.multiclassing.proficienciesGained?.weapons && (
            <TraitRow label="Weapons gained" value={cls.multiclassing.proficienciesGained.weapons.join(', ')} />
          )}
        </>
      )}

      <Divider />

      {/* ALL Features — Expanded Inline */}
      {loadingFeatures ? (
        <Loader size="sm" mx="auto" />
      ) : (
        Array.from({ length: 20 }, (_, i) => i + 1).map(level => {
          const levelRefs = byLevel.get(level)?.filter(r => !r.isSubclass) ?? [];
          if (levelRefs.length === 0) return null;
          return (
            <Stack key={level} gap="sm">
              {levelRefs.map(ref => {
                const feature = featureMap.get(ref.name);
                return (
                  <Stack key={ref.name} gap="xs">
                    <Group justify="space-between" align="baseline">
                      <Title order={5} c="orange">
                        Level {level}: {ref.name}
                      </Title>
                      <Text size="xs" c="parchment.6">{cls.source}</Text>
                    </Group>
                    {feature?.entries?.length ? (
                      <EntryRenderer entries={feature.entries as Entry[]} />
                    ) : (
                      <Text size="sm" c="parchment.6">Details not available.</Text>
                    )}
                  </Stack>
                );
              })}
            </Stack>
          );
        })
      )}

      {/* Spell Slot Progression */}
      {cls.spellSlotProgression && cls.spellSlotProgression.length > 0 && (
        <>
          <Divider />
          <Text size="sm" fw={700}>Spell Slots</Text>
          <ScrollArea>
            <Table withTableBorder withColumnBorders striped style={{ fontSize: '0.8rem' }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Lvl</Table.Th>
                  {cls.cantripProgression && <Table.Th>Cantrips</Table.Th>}
                  {cls.preparedSpellsProgression && <Table.Th>Prepared</Table.Th>}
                  {cls.spellSlotProgression[0].map((_: number, i: number) => (
                    <Table.Th key={i}>{ordinal(i + 1)}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {cls.spellSlotProgression.map((row: number[], lvl: number) => (
                  <Table.Tr key={lvl}>
                    <Table.Td>{lvl + 1}</Table.Td>
                    {cls.cantripProgression && <Table.Td>{cls.cantripProgression[lvl] ?? '\u2014'}</Table.Td>}
                    {cls.preparedSpellsProgression && <Table.Td>{cls.preparedSpellsProgression[lvl] ?? '\u2014'}</Table.Td>}
                    {row.map((slots: number, i: number) => (
                      <Table.Td key={i}>{slots || '\u2014'}</Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </>
      )}
    </Stack>
  );
}

function TraitRow({ label, value }: { label: string; value: string }) {
  return (
    <Group gap="xs" wrap="nowrap" align="flex-start">
      <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>{label}:</Text>
      <Text size="sm">{value}</Text>
    </Group>
  );
}

interface TableGroup {
  colLabels?: string[];
  rows?: unknown[][];
  rowsSpellProgression?: number[][];
}
