import { useEffect, useState } from 'react';
import { fetchAll } from '@/api/pocketbase';
import type { Item } from '@/types';

export interface ItemRecord extends Item {
  id: string;
}

export function useItems() {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAll<ItemRecord>('items', undefined, 'name')
      .then((data) => { if (!cancelled) setItems(data); })
      .catch(() => { /* fail silently */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { items, loading };
}
