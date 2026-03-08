import { useMemo, useEffect, useState } from 'react';
import { Stack, Text, Loader, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { CharacterClass, CharacterFeat, Entry } from '@/types';
import { fetchOne } from '@/api/pocketbase';
import { fetchClassFeatures, fetchSubclassFeatures } from '@/api/wiki';
import { useFeats } from '@/hooks/useFeats';
import {
  isSubclassPlaceholder,
  collectOptionFeatureNames,
  extractEntryText,
} from '@/utils/features';
import type { ClassFeatureRecord, RaceTraits, BackgroundFeature } from './features/types';
import { RaceTraitsAccordion } from './features/RaceTraitsAccordion';
import { BackgroundFeatureAccordion } from './features/BackgroundFeatureAccordion';
import { ClassFeaturesAccordion } from './features/ClassFeaturesAccordion';
import { FeatListAccordion } from './features/FeatListAccordion';

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

  const { feats: allFeats, loading: featsLoading } = useFeats();

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

        if (cls.subclassName) {
          const subFeatures = await fetchSubclassFeatures(
            classData.name,
            classData.source,
            cls.subclassName,
          ) as unknown as ClassFeatureRecord[];
          features.push(...subFeatures);
        }

        if (!cancelled) {
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

  // Filter out sub-features referenced in parent options blocks
  const optionFeatureNames = useMemo(
    () => collectOptionFeatureNames(classFeatures),
    [classFeatures],
  );

  const visibleFeatures = useMemo(
    () => classFeatures.filter((f) => !optionFeatureNames.has(f.name)),
    [classFeatures, optionFeatureNames],
  );

  // Search filtering
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
        <Text size="sm" c="parchment.6">Select a class, race, or background to see features.</Text>
      )}

      {raceTraits && showRace && (
        <RaceTraitsAccordion
          raceTraits={raceTraits}
          raceName={raceName}
          featureChoices={featureChoices}
          onFeatureChoicesChange={onFeatureChoicesChange}
        />
      )}

      {bgFeature && showBg && bgFeature.featureName && (
        <BackgroundFeatureAccordion bgFeature={bgFeature} />
      )}

      {filteredFeatures.length > 0 && (
        <ClassFeaturesAccordion
          features={filteredFeatures}
          featureChoices={featureChoices}
          onFeatureChoicesChange={onFeatureChoicesChange}
        />
      )}

      <FeatListAccordion
        feats={q ? feats.filter((f) => f.name.toLowerCase().includes(q)) : feats}
        onFeatsChange={onFeatsChange}
        allFeats={allFeats}
        featsLoading={featsLoading}
      />
    </Stack>
  );
}
