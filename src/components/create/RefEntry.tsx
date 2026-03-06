import { useEffect, useState } from 'react';
import { Loader, Stack, Text } from '@mantine/core';
import type { Entry } from '@/types/common';
import type { EntityTagType } from '@/utils/parse-tags';
import { lookupEntity } from '@/api/wiki';
import { EntryRenderer } from './EntryRenderer';
import { WikiLink } from '@/components/wiki/WikiLink';

interface RefEntryProps {
  refType: 'refOptionalfeature' | 'refClassFeature' | 'refSubclassFeature' | 'refFeat';
  refKey: string;
}

/**
 * Parse ref keys into lookup parameters.
 *
 * Formats:
 *  refOptionalfeature: "Dueling" or "Blind Fighting|TCE"
 *  refClassFeature: "name|className|classSource|level" or "name|className|classSource|level|featureSource"
 *  refSubclassFeature: "name|className|classSource|subclassName|subclassSource|level" (+ optional featureSource)
 *  refFeat: "name" or "name|source"
 */
function parseRefKey(refType: string, refKey: string): { tagType: EntityTagType; name: string; source?: string; filter?: string } {
  const parts = refKey.split('|');

  switch (refType) {
    case 'refOptionalfeature':
      return { tagType: 'optfeature', name: parts[0], source: parts[1] || undefined };
    case 'refFeat':
      return { tagType: 'feat', name: parts[0], source: parts[1] || undefined };
    case 'refClassFeature':
      // name|className|classSource|level|featureSource
      return {
        tagType: 'classFeature',
        name: parts[0],
        source: parts[4] || parts[2] || undefined,
        filter: parts[1] ? `className="${parts[1]}"` : undefined,
      };
    case 'refSubclassFeature':
      // name|className|classSource|subclassName|subclassSource|level|featureSource
      return {
        tagType: 'subclassFeature',
        name: parts[0],
        source: parts[6] || parts[4] || undefined,
        filter: parts[3] ? `subclassName="${parts[3]}"` : undefined,
      };
    default:
      return { tagType: 'optfeature', name: parts[0] };
  }
}

export function RefEntry({ refType, refKey }: RefEntryProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const parsed = parseRefKey(refType, refKey);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    lookupEntity(parsed.tagType, parsed.name, parsed.source).then(result => {
      if (cancelled) return;
      if (result) {
        setData(result);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [parsed.tagType, parsed.name, parsed.source]);

  if (loading) {
    return <Loader size="xs" />;
  }

  if (notFound) {
    return (
      <Text size="sm">
        <WikiLink tagType={parsed.tagType} name={parsed.name} source={parsed.source} />
      </Text>
    );
  }

  const entries = data?.entries as Entry[] | undefined;
  const name = data?.name as string | undefined;

  return (
    <Stack gap="xs">
      {name && <Text size="sm" fw={600}>{name}</Text>}
      {entries && <EntryRenderer entries={entries} />}
    </Stack>
  );
}
