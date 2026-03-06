import { useCallback, useRef, useState } from 'react';
import type { EntityTagType } from '@/utils/parse-tags';
import { lookupEntity } from '@/api/wiki';

interface CacheEntry {
  data: Record<string, unknown> | null;
  key: string;
}

const MAX_CACHE = 100;

function cacheKey(tagType: EntityTagType, name: string, source?: string): string {
  return `${tagType}::${name}::${source ?? ''}`;
}

export function useEntityLookup() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<CacheEntry[]>([]);

  const lookup = useCallback(async (tagType: EntityTagType, name: string, source?: string) => {
    const key = cacheKey(tagType, name, source);

    // Check cache
    const cached = cache.current.find(e => e.key === key);
    if (cached) {
      setData(cached.data);
      setLoading(false);
      setError(cached.data ? null : 'Not found');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await lookupEntity(tagType, name, source);
      setData(result);
      if (!result) setError('Not found');

      // Add to cache (LRU eviction)
      cache.current.push({ key, data: result });
      if (cache.current.length > MAX_CACHE) {
        cache.current.shift();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, lookup };
}
