import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { EntityTagType } from '@/utils/parse-tags';

export interface WikiTarget {
  tagType: EntityTagType;
  name: string;
  source?: string;
}

interface WikiDrawerState {
  stack: WikiTarget[];
  open: (target: WikiTarget) => void;
  back: () => void;
  close: () => void;
}

const WikiDrawerCtx = createContext<WikiDrawerState | null>(null);

export function WikiDrawerProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<WikiTarget[]>([]);

  const open = useCallback((target: WikiTarget) => {
    setStack(prev => [...prev, target]);
  }, []);

  const back = useCallback(() => {
    setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : []));
  }, []);

  const close = useCallback(() => {
    setStack([]);
  }, []);

  return (
    <WikiDrawerCtx.Provider value={{ stack, open, back, close }}>
      {children}
    </WikiDrawerCtx.Provider>
  );
}

export function useWikiDrawer(): WikiDrawerState {
  const ctx = useContext(WikiDrawerCtx);
  if (!ctx) throw new Error('useWikiDrawer must be used within WikiDrawerProvider');
  return ctx;
}
