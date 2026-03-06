import { useState, useEffect } from 'react';
import { getClasses, getClass } from '@/api/classes';
import type { Class } from '@/types';

interface ClassRecord extends Class { id: string }

export function useClasses() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getClasses()
      .then(data => { if (!cancelled) setClasses(data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { classes, loading, error };
}

export function useClass(id: string | undefined) {
  const [cls, setCls] = useState<ClassRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setCls(null); return; }
    let cancelled = false;
    setLoading(true);
    getClass(id)
      .then(data => { if (!cancelled) setCls(data); })
      .catch(() => { if (!cancelled) setCls(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  return { cls, loading };
}
