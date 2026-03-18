import { useState, useEffect, useMemo } from 'react';
import { Stack, Group, Paper, Text, Button, ActionIcon, Menu, Loader } from '@mantine/core';
import { IconPinnedOff, IconPlus } from '@tabler/icons-react';
import { WikiLink } from '@/components/wiki/WikiLink';
import { SectionTitle } from './SectionTitle';
import { fetchClassFeatures, fetchSubclassFeatures } from '@/api/wiki';
import { fetchOne, fetchAll } from '@/api/pocketbase';
import { extractEntryText } from '@/utils/features';
import type { CharacterClass, CharacterSpell, Entry } from '@/types';
import type { ClassFeatureRecord } from './features/types';
import { stripTags } from '@/utils/strip-tags';

interface FeatureRef {
  id: string;
  name: string;
  description: string;
  level: number;
  className: string;
  source: string;
}

interface SpellRef {
  id: string;
  name: string;
  castingTime: string;
}

interface Props {
  classes: CharacterClass[];
  level: number;
  spells: CharacterSpell[];
  pinnedFeatures: string[];
  pinnedSpells: string[];
  onPinFeature: (id: string) => void;
  onUnpinFeature: (id: string) => void;
  onPinSpell: (id: string) => void;
  onUnpinSpell: (id: string) => void;
}

const COMBAT_KEYWORDS = /\b(attack|damage|hit point|hit dice|bonus action|reaction|melee|ranged|weapon|armor|shield|armou?r class|saving throw|resistance|advantage|disadvantage|smite|sneak|rage|strike|surge|action|extra attack|critical|healing)/i;

const darkPaperStyle = { backgroundColor: 'var(--mantine-color-dark-7)', border: '1px solid var(--mantine-color-dark-5)' };

function isCombatRelevant(name: string, description: string): boolean {
  return COMBAT_KEYWORDS.test(description) || COMBAT_KEYWORDS.test(name);
}

export function CombatFeaturesSection({
  classes,
  level,
  spells,
  pinnedFeatures,
  pinnedSpells,
  onPinFeature,
  onUnpinFeature,
  onPinSpell,
  onUnpinSpell,
}: Props) {
  const [allFeatures, setAllFeatures] = useState<FeatureRef[]>([]);
  const [allSpellRefs, setAllSpellRefs] = useState<SpellRef[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch class features from PB
  useEffect(() => {
    const cls = classes[0];
    if (!cls?.classId) { setAllFeatures([]); return; }

    let cancelled = false;
    setLoading(true);

    fetchOne<{ name: string; source: string }>('classes', cls.classId)
      .then(async (classData) => {
        if (cancelled) return;
        const features = await fetchClassFeatures(classData.name, classData.source) as unknown as ClassFeatureRecord[];

        if (cls.subclassName) {
          const subFeatures = await fetchSubclassFeatures(
            classData.name, classData.source, cls.subclassName,
          ) as unknown as ClassFeatureRecord[];
          features.push(...subFeatures);
        }

        if (!cancelled) {
          const refs: FeatureRef[] = features
            .filter((f) => f.level <= level)
            .map((f) => ({
              id: f.id,
              name: f.name,
              description: stripTags(extractEntryText(f.entries)),
              level: f.level,
              className: classData.name,
              source: classData.source,
            }));
          setAllFeatures(refs);
        }
      })
      .catch(() => { if (!cancelled) setAllFeatures([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [classes, level]);

  // Fetch spell casting times from PB
  useEffect(() => {
    if (!spells.length) { setAllSpellRefs([]); return; }
    let cancelled = false;

    const ids = spells.map((s) => s.spellId).filter(Boolean);
    if (!ids.length) { setAllSpellRefs([]); return; }

    const filter = ids.map((id) => `id='${id}'`).join(' || ');
    fetchAll<{ id: string; name: string; time: Array<{ number: number; unit: string }> }>(
      'spells', { filter }
    )
      .then((items) => {
        if (cancelled) return;
        setAllSpellRefs(
          items.map((s) => ({
            id: s.id,
            name: s.name,
            castingTime: s.time?.[0] ? `${s.time[0].number} ${s.time[0].unit}` : '',
          }))
        );
      })
      .catch(() => { if (!cancelled) setAllSpellRefs([]); });

    return () => { cancelled = true; };
  }, [spells]);

  const pinnedFeatureItems = useMemo(
    () => allFeatures.filter((f) => pinnedFeatures.includes(f.id)),
    [allFeatures, pinnedFeatures]
  );
  const pinnedSpellItems = useMemo(
    () => allSpellRefs.filter((s) => pinnedSpells.includes(s.id)),
    [allSpellRefs, pinnedSpells]
  );

  const suggestedFeatures = useMemo(
    () => allFeatures.filter((f) => !pinnedFeatures.includes(f.id) && isCombatRelevant(f.name, f.description)),
    [allFeatures, pinnedFeatures]
  );
  const suggestedSpells = useMemo(
    () => allSpellRefs.filter((s) => !pinnedSpells.includes(s.id) && (s.castingTime.includes('bonus') || s.castingTime.includes('reaction'))),
    [allSpellRefs, pinnedSpells]
  );

  const otherFeatures = useMemo(
    () => allFeatures.filter((f) => !pinnedFeatures.includes(f.id) && !isCombatRelevant(f.name, f.description)),
    [allFeatures, pinnedFeatures]
  );
  const otherSpells = useMemo(
    () => allSpellRefs.filter((s) => !pinnedSpells.includes(s.id) && !s.castingTime.includes('bonus') && !s.castingTime.includes('reaction')),
    [allSpellRefs, pinnedSpells]
  );

  if (loading) return <Loader size="sm" color="gold" />;
  if (allFeatures.length === 0 && allSpellRefs.length === 0) return null;

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <SectionTitle>Combat Features</SectionTitle>
        <Group gap={4}>
          {(suggestedFeatures.length > 0 || otherFeatures.length > 0) && (
            <Menu shadow="md" width={280} position="bottom-end" withinPortal>
              <Menu.Target>
                <Button size="compact-xs" variant="subtle" leftSection={<IconPlus size={12} />}>
                  Pin feature
                </Button>
              </Menu.Target>
              <Menu.Dropdown mah={300} style={{ overflowY: 'auto' }}>
                {suggestedFeatures.length > 0 && (
                  <>
                    <Menu.Label>Suggested (combat-relevant)</Menu.Label>
                    {suggestedFeatures.map((f) => (
                      <Menu.Item key={f.id} onClick={() => onPinFeature(f.id)}>
                        <Text size="sm">{f.name}</Text>
                        <Text size="xs" c="parchment.5" lineClamp={1}>{f.description}</Text>
                      </Menu.Item>
                    ))}
                  </>
                )}
                {otherFeatures.length > 0 && (
                  <>
                    <Menu.Label>Other features</Menu.Label>
                    {otherFeatures.map((f) => (
                      <Menu.Item key={f.id} onClick={() => onPinFeature(f.id)}>
                        {f.name}
                      </Menu.Item>
                    ))}
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
          {(suggestedSpells.length > 0 || otherSpells.length > 0) && (
            <Menu shadow="md" width={280} position="bottom-end" withinPortal>
              <Menu.Target>
                <Button size="compact-xs" variant="subtle" leftSection={<IconPlus size={12} />}>
                  Pin spell
                </Button>
              </Menu.Target>
              <Menu.Dropdown mah={300} style={{ overflowY: 'auto' }}>
                {suggestedSpells.length > 0 && (
                  <>
                    <Menu.Label>Quick-cast (bonus/reaction)</Menu.Label>
                    {suggestedSpells.map((s) => (
                      <Menu.Item key={s.id} onClick={() => onPinSpell(s.id)}>
                        {s.name} <Text component="span" size="xs" c="parchment.5">({s.castingTime})</Text>
                      </Menu.Item>
                    ))}
                  </>
                )}
                {otherSpells.length > 0 && (
                  <>
                    <Menu.Label>Other spells</Menu.Label>
                    {otherSpells.slice(0, 20).map((s) => (
                      <Menu.Item key={s.id} onClick={() => onPinSpell(s.id)}>
                        {s.name}
                      </Menu.Item>
                    ))}
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>

      {pinnedFeatureItems.length === 0 && pinnedSpellItems.length === 0 &&
       suggestedFeatures.length === 0 && suggestedSpells.length === 0 && (
        <Text size="xs" c="parchment.5" fs="italic">
          No combat features found. Pin features from the Features tab.
        </Text>
      )}

      {/* Auto-show suggested features even before pinning */}
      {pinnedFeatureItems.length === 0 && suggestedFeatures.length > 0 && (
        <Text size="xs" c="parchment.5" fs="italic" mb={-4}>
          {suggestedFeatures.length} combat-relevant features found — pin to keep here
        </Text>
      )}

      {pinnedFeatureItems.map((f) => (
        <Paper key={f.id} p="xs" radius="sm" style={darkPaperStyle}>
          <Group justify="space-between" wrap="nowrap">
            <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
              <Group gap={4}>
                <WikiLink tagType="classFeature" name={f.name} source={f.source} />
                <Text size="xs" c="parchment.5">Lv {f.level}</Text>
              </Group>
              <Text size="xs" c="parchment.4" lineClamp={2}>{f.description}</Text>
            </Stack>
            <ActionIcon size="sm" variant="subtle" color="parchment" onClick={() => onUnpinFeature(f.id)} title="Unpin">
              <IconPinnedOff size={14} />
            </ActionIcon>
          </Group>
        </Paper>
      ))}

      {pinnedSpellItems.map((s) => (
        <Paper key={s.id} p="xs" radius="sm" style={darkPaperStyle}>
          <Group justify="space-between" wrap="nowrap">
            <Group gap={4}>
              <WikiLink tagType="spell" name={s.name} />
              <Text size="xs" c="parchment.5">{s.castingTime}</Text>
            </Group>
            <ActionIcon size="sm" variant="subtle" color="parchment" onClick={() => onUnpinSpell(s.id)} title="Unpin">
              <IconPinnedOff size={14} />
            </ActionIcon>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
