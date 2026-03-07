import { useEffect, useState } from 'react';
import { fetchAll } from '@/api/pocketbase';
import type { Spell } from '@/types';

export interface SpellRecord extends Spell {
  id: string;
}

export function useSpells() {
  const [spells, setSpells] = useState<SpellRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAll<SpellRecord>('spells', undefined, 'name')
      .then((data) => { if (!cancelled) setSpells(data); })
      .catch(() => { /* fail silently */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { spells, loading };
}
