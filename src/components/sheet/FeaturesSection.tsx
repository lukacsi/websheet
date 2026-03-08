import { useMemo, useEffect, useState } from 'react';
import { Stack, Text, Accordion, Badge, Group, Select, ActionIcon, Button, Loader, Radio, TextInput, Textarea } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { CharacterClass, CharacterFeat, Entry } from '@/types';
import { fetchOne } from '@/api/pocketbase';
import { fetchClassFeatures, fetchSubclassFeatures } from '@/api/wiki';
import { useFeats } from '@/hooks/useFeats';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import {
  FeatureChoicePicker,
  findOptionsBlocks,
  stripOptionsEntries,
} from '@/components/create/FeatureChoicePicker';
import {
  isSubclassPlaceholder,
  collectOptionFeatureNames,
  findListChoiceBlocks,
  stripListChoiceEntries,
  extractEntryText,
} from '@/utils/features';
import { accordionDarkStyles } from '@/theme/styles';

interface ClassFeatureRecord {
  id: string;
  name: string;
  level: number;
  entries: Entry[];
  isSubclassFeature: boolean;
  subclassName?: string;
}

interface RaceTraits {
  name: string;
  traits: Entry[];
}

interface BackgroundFeature {
  name: string;
  featureName: string;
  featureEntries: Entry[];
}

interface Props {
  classes: CharacterClass[];
  level: number;
  raceId: string;
  raceName: string;
  backgroundId: string;
  feats: CharacterFeat[];
  onFeatsChange: (feats: CharacterFeat[]) => void;
  featureChoices: Record<string, string[]>;
  onFeatureChoicesChange: (choices: Record<string, string[]>) => void;
}

export function FeaturesSection({
  classes,
  level,
  raceId,
  raceName,
  backgroundId,
  feats,
  onFeatsChange,
  featureChoices,
  onFeatureChoicesChange,
}: Props) {
  const [classFeatures, setClassFeatures] = useState<ClassFeatureRecord[]>([]);
  const [raceTraits, setRaceTraits] = useState<RaceTraits | null>(null);
  const [bgFeature, setBgFeature] = useState<BackgroundFeature | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Feat adder
  const { feats: allFeats, loading: featsLoading } = useFeats();
  const [featSearch, setFeatSearch] = useState<string | null>(null);
  // Resolved feat entries cache for display (featId → entries)
  const [resolvedFeatEntries, setResolvedFeatEntries] = useState<Record<string, Entry[]>>({});

  // Fetch class features
  useEffect(() => {
    const cls = classes[0];
    if (!cls?.classId) { setClassFeatures([]); return; }

    let cancelled = false;
    setLoading(true);

    fetchOne<{ name: string; source: string }>('classes', cls.classId)
      .then(async (classData) => {
        if (cancelled) return;
        const features = await fetchClassFeatures(classData.name, classData.source) as unknown as ClassFeatureRecord[];

        // Also fetch subclass features if subclass is set
        if (cls.subclassName) {
          const subFeatures = await fetchSubclassFeatures(
            classData.name,
            classData.source,
            cls.subclassName,
          ) as unknown as ClassFeatureRecord[];
          features.push(...subFeatures);
        }

        if (!cancelled) {
          // Filter to current level, remove subclass placeholders, and sort
          const filtered = features
            .filter((f) => f.level <= level)
            .filter((f) => !isSubclassPlaceholder(f))
            .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
          setClassFeatures(filtered);
        }
      })
      .catch(() => { if (!cancelled) setClassFeatures([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [classes, level]);

  // Fetch race traits
  useEffect(() => {
    if (!raceId) { setRaceTraits(null); return; }
    let cancelled = false;

    fetchOne<{ name: string; traits: Entry[] }>('races', raceId)
      .then((data) => {
        if (!cancelled && data.traits?.length) {
          setRaceTraits({ name: data.name, traits: data.traits });
        }
      })
      .catch(() => { if (!cancelled) setRaceTraits(null); });

    return () => { cancelled = true; };
  }, [raceId]);

  // Fetch background feature
  useEffect(() => {
    if (!backgroundId) { setBgFeature(null); return; }
    let cancelled = false;

    fetchOne<{ name: string; feature: { name: string; entries: Entry[] } }>('backgrounds', backgroundId)
      .then((data) => {
        if (cancelled) return;
        setBgFeature({
          name: data.name,
          featureName: data.feature?.name ?? '',
          featureEntries: data.feature?.entries ?? [],
        });
      })
      .catch(() => { if (!cancelled) setBgFeature(null); });

    return () => { cancelled = true; };
  }, [backgroundId]);

  // Collect names of features that are options within other features (e.g. Protector, Thaumaturge)
  const optionFeatureNames = useMemo(
    () => collectOptionFeatureNames(classFeatures),
    [classFeatures],
  );

  // Filter out sub-features that are referenced in options blocks of parent features
  const visibleFeatures = useMemo(
    () => classFeatures.filter((f) => !optionFeatureNames.has(f.name)),
    [classFeatures, optionFeatureNames],
  );

  const q = search.toLowerCase();
  const filteredFeatures = useMemo(
    () => q ? visibleFeatures.filter((f) =>
      f.name.toLowerCase().includes(q) || extractEntryText(f.entries).toLowerCase().includes(q)
    ) : visibleFeatures,
    [visibleFeatures, q],
  );
  const showRace = !q || (raceTraits?.name ?? '').toLowerCase().includes(q)
    || (raceTraits ? extractEntryText(raceTraits.traits).toLowerCase().includes(q) : false);
  const showBg = !q || (bgFeature?.featureName ?? '').toLowerCase().includes(q)
    || (bgFeature ? extractEntryText(bgFeature.featureEntries).toLowerCase().includes(q) : false);
  const filteredFeats = useMemo(
    () => q ? feats.filter((f) => {
      if (f.name.toLowerCase().includes(q)) return true;
      const entries = resolvedFeatEntries[f.featId];
      return entries ? extractEntryText(entries).toLowerCase().includes(q) : false;
    }) : feats,
    [feats, q, resolvedFeatEntries],
  );

  // Build feat Select data — exclude already-added feats
  const existingFeatIds = new Set(feats.map((f) => f.featId).filter(Boolean));
  const featSelectData = allFeats
    .filter((f) => !existingFeatIds.has(f.id))
    .map((f) => ({ value: f.id, label: `${f.name} (${f.source})` }));

  function addFeat(featId: string | null) {
    if (!featId) return;
    const feat = allFeats.find((f) => f.id === featId);
    if (!feat) return;
    onFeatsChange([...feats, { featId: feat.id, name: feat.name }]);
    // Cache entries for display
    setResolvedFeatEntries((prev) => ({ ...prev, [feat.id]: feat.entries }));
    setFeatSearch(null);
  }

  function addHomebrewFeat() {
    onFeatsChange([...feats, { featId: '', name: '' }]);
  }

  function updateFeat(index: number, partial: Partial<CharacterFeat>) {
    onFeatsChange(feats.map((f, i) => i === index ? { ...f, ...partial } : f));
  }

  function removeFeat(index: number) {
    onFeatsChange(feats.filter((_, i) => i !== index));
  }

  // Resolve entries for feats that don't have cached entries (e.g. loaded from save)
  useEffect(() => {
    for (const feat of feats) {
      if (!feat.featId || resolvedFeatEntries[feat.featId]) continue;
      const known = allFeats.find((f) => f.id === feat.featId);
      if (known) {
        setResolvedFeatEntries((prev) => ({ ...prev, [feat.featId]: known.entries }));
      }
    }
  }, [feats, allFeats, resolvedFeatEntries]);

  const hasContent = visibleFeatures.length > 0 || raceTraits || bgFeature || feats.length > 0;

  return (
    <Stack gap="xs">
      {hasContent && (
        <TextInput
          placeholder="Search features..."
          size="xs"
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      )}

      {loading && <Loader size="sm" />}

      {!loading && !hasContent && (
        <Text size="sm" c="dimmed">Select a class, race, or background to see features.</Text>
      )}

      {/* Race traits */}
      {raceTraits && showRace && (() => {
        const raceKey = `race:${raceName}`;
        const hasRefOptions = findOptionsBlocks(raceKey, raceTraits.traits).length > 0;
        const refSelected = featureChoices[raceKey] ?? [];
        const listChoices = findListChoiceBlocks(raceTraits.traits);
        const hasChoices = hasRefOptions || listChoices.length > 0;

        return (
          <Accordion variant="separated" chevronPosition="left" styles={accordionDarkStyles}>
            <Accordion.Item value="race-traits">
              <Accordion.Control>
                <Group gap="xs">
                  <Badge size="xs" variant="light" color="green">Race</Badge>
                  <Text size="sm" fw={600}>{raceName} Traits</Text>
                  {hasChoices && !hasRefOptions && listChoices.some((lc) => !(featureChoices[`race:${lc.parentName}`]?.[0])) && (
                    <Badge size="xs" variant="light" color="yellow">Choice needed</Badge>
                  )}
                  {hasRefOptions && refSelected.length === 0 && (
                    <Badge size="xs" variant="light" color="yellow">Choice needed</Badge>
                  )}
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                {(() => {
                  let displayEntries = raceTraits.traits;
                  if (hasRefOptions) {
                    displayEntries = stripOptionsEntries(displayEntries);
                  }
                  for (const lc of listChoices) {
                    const choiceKey = `race:${lc.parentName}`;
                    const sel = featureChoices[choiceKey]?.[0];
                    displayEntries = stripListChoiceEntries(displayEntries, sel);
                  }
                  return <EntryRenderer entries={displayEntries} />;
                })()}

                {hasRefOptions && (
                  <FeatureChoicePicker
                    featureName={raceKey}
                    entries={raceTraits.traits}
                    selected={refSelected}
                    onChange={(sel) => onFeatureChoicesChange({ ...featureChoices, [raceKey]: sel })}
                  />
                )}

                {listChoices.map((lc) => {
                  const choiceKey = `race:${lc.parentName}`;
                  const selected = featureChoices[choiceKey]?.[0] ?? '';
                  return (
                    <Radio.Group
                      key={choiceKey}
                      value={selected}
                      onChange={(v) => onFeatureChoicesChange({ ...featureChoices, [choiceKey]: v ? [v] : [] })}
                    >
                      <Stack gap="xs" mt="sm">
                        <Text size="sm" fw={500}>Choose one ({lc.parentName}):</Text>
                        <Group gap="md">
                          {lc.items.map((item) => (
                            <Radio key={item.name} value={item.name} label={item.name} />
                          ))}
                        </Group>
                      </Stack>
                    </Radio.Group>
                  );
                })}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );
      })()}

      {/* Background feature */}
      {bgFeature && showBg && bgFeature.featureName && (
        <Accordion variant="separated" chevronPosition="left" styles={accordionDarkStyles}>
          <Accordion.Item value="bg-feature">
            <Accordion.Control>
              <Group gap="xs">
                <Badge size="xs" variant="light" color="orange">Background</Badge>
                <Text size="sm" fw={600}>{bgFeature.featureName}</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <EntryRenderer entries={bgFeature.featureEntries} />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {/* Class features */}
      {filteredFeatures.length > 0 && (
        <Accordion variant="separated" chevronPosition="left" styles={accordionDarkStyles}>
          {filteredFeatures.map((f) => {
            const hasOptions = findOptionsBlocks(f.name, f.entries).length > 0;
            const selected = featureChoices[f.name] ?? [];
            return (
              <Accordion.Item key={f.id} value={f.id}>
                <Accordion.Control>
                  <Group gap="xs">
                    <Badge size="xs" variant="light" color="blue">
                      Lv {f.level}
                    </Badge>
                    {f.isSubclassFeature && (
                      <Badge size="xs" variant="light" color="grape">
                        {f.subclassName}
                      </Badge>
                    )}
                    <Text size="sm" fw={600}>{f.name}</Text>
                    {hasOptions && selected.length === 0 && (
                      <Badge size="xs" variant="light" color="yellow">Choice needed</Badge>
                    )}
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <EntryRenderer entries={hasOptions ? stripOptionsEntries(f.entries) : f.entries} />
                  {hasOptions && (
                    <FeatureChoicePicker
                      featureName={f.name}
                      entries={f.entries}
                      selected={selected}
                      onChange={(sel) => onFeatureChoicesChange({ ...featureChoices, [f.name]: sel })}
                    />
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}

      {/* Feat list */}
      {filteredFeats.length > 0 && (
        <Accordion variant="separated" chevronPosition="left" styles={accordionDarkStyles}>
          {filteredFeats.map((feat, i) => {
            const entries = feat.featId ? resolvedFeatEntries[feat.featId] : undefined;
            return (
              <Accordion.Item key={`feat-${i}`} value={`feat-${i}`}>
                <Accordion.Control>
                  <Group gap="xs">
                    <Badge size="xs" variant="light" color={feat.source === 'background' ? 'orange' : 'teal'}>
                      Feat
                    </Badge>
                    {feat.featId ? (
                      <Text size="sm" fw={600}>{feat.name}</Text>
                    ) : (
                      <TextInput
                        value={feat.name}
                        onChange={(e) => { e.stopPropagation(); updateFeat(i, { name: e.currentTarget.value }); }}
                        onClick={(e) => e.stopPropagation()}
                        size="xs"
                        variant="unstyled"
                        placeholder="Custom feat name"
                        styles={{ input: { fontWeight: 600 } }}
                      />
                    )}
                    {feat.source === 'background' && (
                      <Text size="xs" c="dimmed">(background)</Text>
                    )}
                    <div style={{ flex: 1 }} />
                    {feat.source !== 'background' && (
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="red"
                        onClick={(e) => { e.stopPropagation(); removeFeat(i); }}
                        title="Remove"
                      >
                        &times;
                      </ActionIcon>
                    )}
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  {entries?.length ? (
                    <EntryRenderer entries={entries} />
                  ) : feat.featId ? (
                    <Text size="sm" c="dimmed">Loading...</Text>
                  ) : (
                    <Textarea
                      value={feat.description ?? ''}
                      onChange={(e) => updateFeat(i, { description: e.currentTarget.value })}
                      placeholder="Feat description..."
                      autosize
                      minRows={1}
                      size="sm"
                    />
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}

      {/* Feat adder */}
      <Group gap="xs">
        <Select
          placeholder="Add a feat..."
          data={featSelectData}
          value={featSearch}
          onChange={addFeat}
          searchable
          clearable
          nothingFoundMessage={featsLoading ? 'Loading feats...' : 'No feats found'}
          size="xs"
          limit={30}
          style={{ flex: 1 }}
        />
        <Button size="compact-xs" variant="subtle" onClick={addHomebrewFeat}>+ Custom feat</Button>
      </Group>
    </Stack>
  );
}
