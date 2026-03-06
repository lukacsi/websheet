import { useState, useEffect } from 'react';
import { getBackgrounds, getBackground } from '@/api/backgrounds';
import type { Background } from '@/types';

interface BackgroundRecord extends Background { id: string }

export function useBackgrounds() {
  const [backgrounds, setBackgrounds] = useState<BackgroundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBackgrounds()
      .then(data => { if (!cancelled) setBackgrounds(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { backgrounds, loading, error };
}

export function useBackground(id: string | undefined) {
  const [background, setBackground] = useState<BackgroundRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setBackground(null); return; }
    let cancelled = false;
    setLoading(true);
    getBackground(id)
      .then(data => { if (!cancelled) setBackground(data); })
      .catch(() => { if (!cancelled) setBackground(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  return { background, loading };
}
