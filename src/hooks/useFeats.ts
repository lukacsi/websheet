import { useEffect, useState } from 'react';
import { fetchAll } from '@/api/pocketbase';
import type { Entry } from '@/types';

export interface FeatRecord {
  id: string;
  name: string;
  source: string;
  entries: Entry[];
}

export function useFeats() {
  const [feats, setFeats] = useState<FeatRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAll<FeatRecord>('feats', undefined, 'name')
      .then((data) => { if (!cancelled) setFeats(data); })
      .catch(() => { /* fail silently */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { feats, loading };
}
