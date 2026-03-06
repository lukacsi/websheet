import { fetchAll, fetchOne } from './pocketbase';
import type { Background } from '@/types';

interface BackgroundRecord extends Background {
  id: string;
}

export async function getBackgrounds(): Promise<BackgroundRecord[]> {
  return fetchAll<BackgroundRecord>('backgrounds', 'edition = "one"', 'name');
}

export async function getBackground(id: string): Promise<BackgroundRecord> {
  return fetchOne<BackgroundRecord>('backgrounds', id);
}
