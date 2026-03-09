const STORAGE_KEY = 'websheet-recent';
const MAX_ENTRIES = 8;

export interface RecentEntry {
  id: string;
  name: string;
  raceName: string;
  classes: { className: string; level: number }[];
  level: number;
  timestamp: number;
}

export function getRecentCharacters(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentEntry[];
  } catch {
    return [];
  }
}

export function addRecentCharacter(entry: Omit<RecentEntry, 'timestamp'>): void {
  const list = getRecentCharacters();
  const updated = [
    { ...entry, timestamp: Date.now() },
    ...list.filter((e) => e.id !== entry.id),
  ].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
