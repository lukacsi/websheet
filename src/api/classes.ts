import { fetchAll, fetchOne } from './pocketbase';
import type { Class } from '@/types';
import type { Subclass } from '@/types/class';

interface ClassRecord extends Class {
  id: string;
}

interface SubclassRecord extends Subclass {
  id: string;
}

export async function getClasses(): Promise<ClassRecord[]> {
  return fetchAll<ClassRecord>('classes', 'edition = "one"', 'name');
}

export async function getClass(id: string): Promise<ClassRecord> {
  return fetchOne<ClassRecord>('classes', id);
}

export async function getSubclass(id: string): Promise<SubclassRecord> {
  return fetchOne<SubclassRecord>('subclasses', id);
}

export async function getSubclasses(className: string, classSource: string): Promise<SubclassRecord[]> {
  const filter = `className="${className}" && classSource="${classSource}"`;
  return fetchAll<SubclassRecord>('subclasses', filter, 'name');
}
