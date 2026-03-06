import { fetchAll, fetchOne } from './pocketbase';
import type { Class } from '@/types';

interface ClassRecord extends Class {
  id: string;
}

export async function getClasses(): Promise<ClassRecord[]> {
  return fetchAll<ClassRecord>('classes', 'edition = "one"', 'name');
}

export async function getClass(id: string): Promise<ClassRecord> {
  return fetchOne<ClassRecord>('classes', id);
}
