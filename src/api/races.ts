import { fetchAll, fetchOne } from './pocketbase';
import type { Race } from '@/types';

interface RaceRecord extends Race {
  id: string;
}

export async function getRaces(): Promise<RaceRecord[]> {
  return fetchAll<RaceRecord>('races', 'edition = "one"', 'name');
}

export async function getRace(id: string): Promise<RaceRecord> {
  return fetchOne<RaceRecord>('races', id);
}
