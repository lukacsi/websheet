import { useEffect, useState } from 'react';
import { Select, Stack, Text, Loader, Group, Badge, Divider, Table, NumberInput, ScrollArea, Title } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '@/types/wizard';
import type { Skill, AbilityKey, Entry } from '@/types';
import type { ClassFeature } from '@/types/class';
import { ABILITY_NAMES } from '@/types';
import { useClasses, useClass, useSubclasses } from '@/hooks/useClasses';
import { EntityCard } from './EntityCard';
import { EntryRenderer } from './EntryRenderer';
import { SkillPicker } from './SkillPicker';
import { stripTags } from '@/utils/strip-tags';
import { TaggedText } from '@/components/wiki/TaggedText';
import { fetchClassFeatures, fetchSubclassFeatures } from '@/api/wiki';
import { FeatureChoicePicker, findOptionsBlocks, stripOptionsEntries } from './FeatureChoicePicker';
import { ToolProficiencyPicker } from './ToolProficiencyPicker';

/** primaryAbility can be AbilityKey[] or [{dex: true, wis: true}] from PocketBase */
function parsePrimaryAbilities(primaryAbility: unknown): string[] {
  if (!primaryAbility || !Array.isArray(primaryAbility)) return [];
  return primaryAbility.flatMap(item => {
    if (typeof item === 'string') return [ABILITY_NAMES[item as AbilityKey] ?? item];
    if (typeof item === 'object' && item !== null) {
      return Object.keys(item)
        .filter(k => (item as Record<string, boolean>)[k])
        .map(k => ABILITY_NAMES[k as AbilityKey] ?? k);
    }
    return [];
  });
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

function renderTableCell(cell: unknown): string {
  if (cell == null) return '\u2014';
  if (typeof cell === 'number') return cell === 0 ? '\u2014' : String(cell);
  if (typeof cell === 'string') return cell;
  if (typeof cell === 'object' && cell !== null) {
    const obj = cell as Record<string, unknown>;
    if (obj.type === 'dice' && Array.isArray(obj.toRoll)) {
      const dice = obj.toRoll as Array<{ number: number; faces: number }>;
      return dice.map(d => `${d.number}d${d.faces}`).join('+');
    }
    if (obj.type === 'bonusSpeed') {
      const val = obj.value as number;
      return val === 0 ? '\u2014' : `+${val} ft.`;
    }
    if (obj.type === 'bonus') return String(obj.value ?? '\u2014');
  }
  return String(cell);
}

interface TableGroup {
  colLabels?: string[];
  rows?: unknown[][];
  rowsSpellProgression?: number[][];
}

export function StepClass() {
  const { setValue, watch, formState: { errors } } = useFormContext<WizardFormData>();
  const classId = watch('classId');
  const subclassId = watch('subclassId');
  const level = watch('level');
  const chosenSkills = watch('chosenSkills');
  const chosenClassTools = watch('chosenClassTools');
  const featureChoices = watch('featureChoices');

  const { classes, loading } = useClasses();
  const { cls } = useClass(classId || undefined);
  const { subclasses } = useSubclasses(cls?.name, cls?.source);

  const [features, setFeatures] = useState<ClassFeature[]>([]);
  const [subclassFeatures, setSubclassFeatures] = useState<ClassFeature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);

  useEffect(() => {
    if (!cls) { setFeatures([]); return; }
    setLoadingFeatures(true);
    fetchClassFeatures(cls.name, cls.source)
      .then(f => setFeatures(f as unknown as ClassFeature[]))
      .finally(() => setLoadingFeatures(false));
  }, [cls?.name, cls?.source]);

  // Fetch subclass features when subclass is selected
  const selectedSubclass = subclasses.find(sc => sc.id === subclassId);
  useEffect(() => {
    if (!cls || !selectedSubclass) { setSubclassFeatures([]); return; }
    fetchSubclassFeatures(cls.name, cls.source, selectedSubclass.shortName)
      .then(f => setSubclassFeatures(f as unknown as ClassFeature[]));
  }, [cls?.name, cls?.source, selectedSubclass?.shortName]);

  const selectData = classes.map(c => ({
    value: c.id,
    label: `${c.name} (${c.source})`,
  }));

  function handleClassChange(id: string | null) {
    setValue('classId', id ?? '');
    setValue('subclassId', '');
    setValue('chosenSkills', []);
    setValue('chosenClassTools', []);
    setValue('featureChoices', {});
  }

  const badges: string[] = [];
  if (cls) {
    badges.push(`Hit Die: d${cls.hitDie}`);
    const primaryNames = parsePrimaryAbilities(cls.primaryAbility);
    if (primaryNames.length) {
      badges.push(`Primary: ${primaryNames.join(', ')}`);
    }
    if (cls.spellcastingAbility) {
      badges.push(`Casting: ${ABILITY_NAMES[cls.spellcastingAbility]}`);
    }
  }

  // Parse feature refs and group by level
  const featureRefs = cls ? parseFeatureRefs((cls.classFeatures as unknown[]) ?? []) : [];
  const byLevel = new Map<number, FeatureRef[]>();
  for (const ref of featureRefs) {
    const arr = byLevel.get(ref.level) ?? [];
    arr.push(ref);
    byLevel.set(ref.level, arr);
  }

  // Detect subclass gain level (first feature ref with gainSubclassFeature)
  const subclassLevel = featureRefs.find(r => r.isSubclass)?.level ?? 3;
  const needsSubclass = level >= subclassLevel;

  // Subclass select data
  const subclassSelectData = subclasses.map(sc => ({
    value: sc.id,
    label: `${sc.name} (${sc.source})`,
  }));

  // Build feature name → ClassFeature map
  const featureMap = new Map<string, ClassFeature>();
  for (const f of features) {
    featureMap.set(f.name, f);
  }

  // Group subclass features by level
  const subclassFeaturesByLevel = new Map<number, ClassFeature[]>();
  for (const f of subclassFeatures) {
    const lvl = (f as unknown as { level: number }).level;
    const arr = subclassFeaturesByLevel.get(lvl) ?? [];
    arr.push(f);
    subclassFeaturesByLevel.set(lvl, arr);
  }

  // Parse classTableGroups for extra columns
  const clsAny = cls as unknown as Record<string, unknown> | null;
  const tableGroups = (clsAny?.classTableGroups ?? []) as TableGroup[];
  const extraCols: { label: string; rows: unknown[] }[] = [];
  for (const group of tableGroups) {
    if (group.rowsSpellProgression) continue;
    const labels = (group.colLabels ?? []) as string[];
    const rows = (group.rows ?? []) as unknown[][];
    for (let c = 0; c < labels.length; c++) {
      extraCols.push({
        label: stripTags(labels[c]),
        rows: rows.map(row => row[c]),
      });
    }
  }

  // Background skills not known yet at this step
  const alreadyProficient: Skill[] = [];

  return (
    <Stack gap="md">
      {/* Row 1: Class selector + Level input + Subclass */}
      <Group grow align="flex-start">
        {loading ? (
          <Loader size="sm" />
        ) : (
          <Select
            label="Class"
            placeholder="Search for a class..."
            data={selectData}
            value={classId || null}
            onChange={handleClassChange}
            searchable
            required
            error={errors.classId?.message}
          />
        )}
        <NumberInput
          label="Level"
          value={level}
          onChange={v => setValue('level', typeof v === 'number' ? v : 1)}
          min={1}
          max={20}
          clampBehavior="strict"
          w={80}
          style={{ flex: '0 0 80px' }}
        />
      </Group>

      {!classId && !loading && (
        <Text size="sm" c="parchment.6" ta="center" py="xl" fs="italic">
          Select a class to see its features and abilities.
        </Text>
      )}

      {cls && (
        <EntityCard
          name={cls.name}
          source={cls.source}
          badges={badges}
        >
          {/* Row 2: Compact proficiency summary */}
          <Group gap="xs">
            <Text size="sm" fw={500}>Saving Throws:</Text>
            <Text size="sm">{cls.savingThrows.map(a => ABILITY_NAMES[a]).join(', ')}</Text>
          </Group>

          {cls.armorProficiencies?.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Armor:</Text>
              <Group gap={4}>
                {cls.armorProficiencies.map(a => (
                  <Badge key={a} size="xs" variant="outline">{stripTags(a)}</Badge>
                ))}
              </Group>
            </Group>
          )}

          {cls.weaponProficiencies?.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Weapons:</Text>
              <Group gap={4}>
                {cls.weaponProficiencies.map(w => (
                  <Badge key={w} size="xs" variant="outline">{stripTags(w)}</Badge>
                ))}
              </Group>
            </Group>
          )}

          {cls.toolProficiencies?.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>Tools:</Text>
              <Text size="sm">{cls.toolProficiencies.map((t, i) => (
                <span key={i}>{i > 0 && ', '}<TaggedText text={t} /></span>
              ))}</Text>
            </Group>
          )}

          {/* Row 3: Skill picker */}
          {cls.skillChoices && (
            <>
              <Divider color="dark.4" />
              <SkillPicker
                from={cls.skillChoices.from}
                count={cls.skillChoices.count}
                chosen={chosenSkills as Skill[]}
                onChange={s => setValue('chosenSkills', s)}
                alreadyProficient={alreadyProficient}
              />
            </>
          )}

          {/* Tool proficiency picker */}
          {cls.toolChoices && cls.toolChoices.length > 0 && (
            <>
              <Divider color="dark.4" />
              <ToolProficiencyPicker
                choices={cls.toolChoices}
                chosen={chosenClassTools}
                onChange={t => setValue('chosenClassTools', t)}
              />
            </>
          )}

          {/* Row 4: Subclass selector */}
          {needsSubclass && (
            <>
              <Divider color="dark.4" />
              <Select
                label={cls.subclassTitle || 'Subclass'}
                placeholder={`Choose a ${cls.subclassTitle?.toLowerCase() || 'subclass'}...`}
                data={subclassSelectData}
                value={subclassId || null}
                onChange={v => setValue('subclassId', v ?? '')}
                searchable
                clearable
                error={errors.subclassId?.message}
              />
            </>
          )}

          {/* Row 5: Progression table (levels 1..selected) */}
          <Divider color="dark.4" />
          <Text size="sm" fw={700}>Class Progression (Levels 1–{level})</Text>
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
                {Array.from({ length: level }, (_, i) => i + 1).map(lvl => {
                  const levelFeatures = byLevel.get(lvl) ?? [];
                  return (
                    <Table.Tr key={lvl}>
                      <Table.Td>{ordinal(lvl)}</Table.Td>
                      <Table.Td>{profBonus(lvl)}</Table.Td>
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
                        <Table.Td key={ci}>{renderTableCell(col.rows[lvl - 1])}</Table.Td>
                      ))}
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          {/* Row 5: Expanded features for levels 1..selectedLevel */}
          <Divider color="dark.4" />
          {loadingFeatures ? (
            <Loader size="sm" mx="auto" />
          ) : (
            Array.from({ length: level }, (_, i) => i + 1).map(lvl => {
              const classRefs = byLevel.get(lvl)?.filter(r => !r.isSubclass) ?? [];
              const scFeatures = selectedSubclass
                ? subclassFeaturesByLevel.get(lvl) ?? []
                : [];
              if (classRefs.length === 0 && scFeatures.length === 0) return null;
              return (
                <Stack key={lvl} gap="sm">
                  {classRefs.map(ref => {
                    const feature = featureMap.get(ref.name);
                    const featureEntries = feature?.entries as Entry[] | undefined;
                    const hasOptions = featureEntries ? findOptionsBlocks(ref.name, featureEntries).length > 0 : false;
                    const displayEntries = hasOptions && featureEntries ? stripOptionsEntries(featureEntries) : featureEntries;
                    return (
                      <Stack key={ref.name} gap="xs">
                        <Group justify="space-between" align="baseline">
                          <Title order={5} c="orange">
                            Level {lvl}: {ref.name}
                          </Title>
                          <Text size="xs" c="parchment.6">{cls.source}</Text>
                        </Group>
                        {featureEntries?.length ? (
                          <>
                            {displayEntries?.length ? <EntryRenderer entries={displayEntries} /> : null}
                            {hasOptions && (
                              <FeatureChoicePicker
                                featureName={ref.name}
                                entries={featureEntries}
                                selected={featureChoices[ref.name] ?? []}
                                onChange={sel => setValue('featureChoices', { ...featureChoices, [ref.name]: sel })}
                              />
                            )}
                          </>
                        ) : (
                          <Text size="sm" c="parchment.6">Details not available.</Text>
                        )}
                      </Stack>
                    );
                  })}
                  {scFeatures.map(feature => {
                    const featureEntries = feature.entries as Entry[] | undefined;
                    const hasOptions = featureEntries ? findOptionsBlocks(feature.name, featureEntries).length > 0 : false;
                    const displayEntries = hasOptions && featureEntries ? stripOptionsEntries(featureEntries) : featureEntries;
                    return (
                      <Stack key={`sc-${feature.name}`} gap="xs">
                        <Group justify="space-between" align="baseline">
                          <Title order={5} c="grape">
                            Level {lvl}: {feature.name}
                          </Title>
                          <Text size="xs" c="parchment.6">{selectedSubclass?.source}</Text>
                        </Group>
                        {featureEntries?.length ? (
                          <>
                            {displayEntries?.length ? <EntryRenderer entries={displayEntries} /> : null}
                            {hasOptions && (
                              <FeatureChoicePicker
                                featureName={feature.name}
                                entries={featureEntries}
                                selected={featureChoices[feature.name] ?? []}
                                onChange={sel => setValue('featureChoices', { ...featureChoices, [feature.name]: sel })}
                              />
                            )}
                          </>
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
        </EntityCard>
      )}
    </Stack>
  );
}
