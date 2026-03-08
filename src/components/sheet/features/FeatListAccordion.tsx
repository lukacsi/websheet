import { useEffect, useState } from 'react';
import { Accordion, Badge, Group, Text, TextInput, Textarea, ActionIcon, Select, Button } from '@mantine/core';
import type { CharacterFeat, Entry } from '@/types';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import { accordionStyles } from '@/theme/styles';

interface FeatRecord {
  id: string;
  name: string;
  source: string;
  entries: Entry[];
}

interface Props {
  feats: CharacterFeat[];
  onFeatsChange: (feats: CharacterFeat[]) => void;
  allFeats: FeatRecord[];
  featsLoading: boolean;
}

export function FeatListAccordion({ feats, onFeatsChange, allFeats, featsLoading }: Props) {
  const [featSearch, setFeatSearch] = useState<string | null>(null);
  const [resolvedFeatEntries, setResolvedFeatEntries] = useState<Record<string, Entry[]>>({});

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

  return (
    <>
      {feats.length > 0 && (
        <Accordion variant="separated" chevronPosition="left" styles={accordionStyles}>
          {feats.map((feat, i) => {
            const entries = feat.featId ? resolvedFeatEntries[feat.featId] : undefined;
            return (
              <Accordion.Item key={`feat-${i}`} value={`feat-${i}`}>
                <Accordion.Control>
                  <Group gap="xs">
                    <Badge size="xs" variant="light" color="inkBrown">
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
                      <Text size="xs" c="parchment.6">(background)</Text>
                    )}
                    <div style={{ flex: 1 }} />
                    {feat.source !== 'background' && (
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="bloodRed"
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
                    <Text size="sm" c="parchment.6">Loading...</Text>
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
    </>
  );
}
