import { useState, useEffect } from 'react';
import { getRaces, getRace } from '@/api/races';
import type { Race } from '@/types';

interface RaceRecord extends Race { id: string }

export function useRaces() {
  const [races, setRaces] = useState<RaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRaces()
      .then(data => { if (!cancelled) setRaces(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { races, loading, error };
}

export function useRace(id: string | undefined) {
  const [race, setRace] = useState<RaceRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setRace(null); return; }
    let cancelled = false;
    setLoading(true);
    getRace(id)
      .then(data => { if (!cancelled) setRace(data); })
      .catch(() => { if (!cancelled) setRace(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  return { race, loading };
}
