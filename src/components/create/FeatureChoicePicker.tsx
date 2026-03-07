import { useEffect, useState } from 'react';
import { Radio, Checkbox, Stack, Text, Loader, Group } from '@mantine/core';
import type { Entry, EntryObject } from '@/types';
import { lookupEntity } from '@/api/wiki';
import { EntryRenderer } from './EntryRenderer';

interface OptionChoice {
  refKey: string;
  refType: 'refClassFeature' | 'refOptionalfeature' | 'refSubclassFeature';
  name: string;
}

interface OptionsBlock {
  featureName: string;
  count: number;
  choices: OptionChoice[];
}

/** Extract the display name from a ref key */
function refDisplayName(refKey: string): string {
  return refKey.split('|')[0];
}

/** Recursively find options blocks within entries */
function findOptionsBlocks(featureName: string, entries: Entry[]): OptionsBlock[] {
  const blocks: OptionsBlock[] = [];
  for (const entry of entries) {
    if (typeof entry === 'string') continue;
    const obj = entry as EntryObject;
    if (obj.type === 'options' && obj.entries?.length) {
      const count = (obj as EntryObject & { count?: number }).count ?? 1;
      const choices: OptionChoice[] = [];
      for (const child of obj.entries) {
        if (typeof child === 'string') continue;
        const c = child as EntryObject;
        if (c.type === 'refClassFeature') {
          const key = (c as EntryObject & { classFeature?: string }).classFeature ?? '';
          choices.push({ refKey: key, refType: 'refClassFeature', name: refDisplayName(key) });
        } else if (c.type === 'refOptionalfeature') {
          const key = (c as EntryObject & { optionalfeature?: string }).optionalfeature ?? '';
          choices.push({ refKey: key, refType: 'refOptionalfeature', name: refDisplayName(key) });
        } else if (c.type === 'refSubclassFeature') {
          const key = (c as EntryObject & { subclassFeature?: string }).subclassFeature ?? '';
          choices.push({ refKey: key, refType: 'refSubclassFeature', name: refDisplayName(key) });
        }
      }
      if (choices.length > 0) {
        blocks.push({ featureName, count, choices });
      }
    }
    // Recurse into nested entries
    if (obj.entries) {
      blocks.push(...findOptionsBlocks(featureName, obj.entries));
    }
  }
  return blocks;
}

/** Resolve a ref to get the entity's entries for preview */
function useResolvedEntries(refKey: string, refType: string) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!refKey) return;
    setLoading(true);
    const parts = refKey.split('|');
    let promise: Promise<Record<string, unknown> | null>;

    if (refType === 'refClassFeature') {
      promise = lookupEntity('classFeature', parts[0], parts[4] || parts[2] || undefined);
    } else if (refType === 'refOptionalfeature') {
      promise = lookupEntity('optfeature', parts[0], parts[1] || undefined);
    } else {
      promise = lookupEntity('subclassFeature', parts[0], parts[6] || parts[4] || undefined);
    }

    promise
      .then(r => setEntries((r?.entries as Entry[]) ?? null))
      .finally(() => setLoading(false));
  }, [refKey, refType]);

  return { entries, loading };
}

function ChoicePreview({ refKey, refType }: { refKey: string; refType: string }) {
  const { entries, loading } = useResolvedEntries(refKey, refType);
  if (loading) return <Loader size="xs" />;
  if (!entries?.length) return null;
  return <EntryRenderer entries={entries} />;
}

interface Props {
  featureName: string;
  entries: Entry[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function FeatureChoicePicker({ featureName, entries, selected, onChange }: Props) {
  const blocks = findOptionsBlocks(featureName, entries);
  if (blocks.length === 0) return null;

  return (
    <Stack gap="sm">
      {blocks.map((block, bi) => {
        if (block.count === 1) {
          // Single choice — radio group
          const value = selected.find(s => block.choices.some(c => c.refKey === s)) ?? '';
          return (
            <Radio.Group
              key={bi}
              value={value}
              onChange={v => {
                const others = selected.filter(s => !block.choices.some(c => c.refKey === s));
                onChange(v ? [...others, v] : others);
              }}
            >
              <Stack gap="xs">
                <Text size="sm" fw={500}>Choose one:</Text>
                <Group gap="md">
                  {block.choices.map(c => (
                    <Radio key={c.refKey} value={c.refKey} label={c.name} />
                  ))}
                </Group>
                {value && <ChoicePreview refKey={value} refType={block.choices.find(c => c.refKey === value)!.refType} />}
              </Stack>
            </Radio.Group>
          );
        }

        // Multiple choices — checkboxes
        const blockKeys = new Set(block.choices.map(c => c.refKey));
        const blockSelected = selected.filter(s => blockKeys.has(s));
        return (
          <Stack key={bi} gap="xs">
            <Text size="sm" fw={500}>Choose {block.count}:</Text>
            <Group gap="md">
              {block.choices.map(c => (
                <Checkbox
                  key={c.refKey}
                  label={c.name}
                  checked={blockSelected.includes(c.refKey)}
                  disabled={!blockSelected.includes(c.refKey) && blockSelected.length >= block.count}
                  onChange={e => {
                    const others = selected.filter(s => !blockKeys.has(s));
                    if (e.currentTarget.checked) {
                      onChange([...others, ...blockSelected, c.refKey]);
                    } else {
                      onChange([...others, ...blockSelected.filter(s => s !== c.refKey)]);
                    }
                  }}
                />
              ))}
            </Group>
            {blockSelected.map(key => (
              <ChoicePreview key={key} refKey={key} refType={block.choices.find(c => c.refKey === key)!.refType} />
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
}

/** Remove options blocks from entries so EntryRenderer doesn't render them as bullet lists */
function stripOptionsEntries(entries: Entry[]): Entry[] {
  return entries.reduce<Entry[]>((acc, entry) => {
    if (typeof entry === 'string') { acc.push(entry); return acc; }
    const obj = entry as EntryObject;
    if (obj.type === 'options') return acc;
    if (obj.entries) {
      const stripped = stripOptionsEntries(obj.entries);
      // If an 'entries' wrapper only contained options, skip it entirely
      if (stripped.length === 0 && !obj.name) return acc;
      acc.push({ ...obj, entries: stripped });
    } else {
      acc.push(entry);
    }
    return acc;
  }, []);
}

export { findOptionsBlocks, stripOptionsEntries };
export type { OptionsBlock };
