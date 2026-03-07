import PocketBase, { type RecordModel } from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_PB_URL ?? 'http://127.0.0.1:8090');

export default pb;

/** Fetch all records from a collection, auto-paginating */
export async function fetchAll<T = RecordModel>(
  collection: string,
  filter?: string,
  sort?: string,
): Promise<T[]> {
  const records = await pb.collection(collection).getFullList({
    filter,
    sort,
  });
  return records as unknown as T[];
}

/** Fetch a single record by ID */
export async function fetchOne<T = RecordModel>(
  collection: string,
  id: string,
): Promise<T> {
  const record = await pb.collection(collection).getOne(id);
  return record as unknown as T;
}

/** Create a record in a collection */
export async function createRecord<T = RecordModel>(
  collection: string,
  data: Record<string, unknown>,
): Promise<T> {
  const record = await pb.collection(collection).create(data);
  return record as unknown as T;
}

/** Update an existing record */
export async function updateRecord<T = RecordModel>(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<T> {
  const record = await pb.collection(collection).update(id, data);
  return record as unknown as T;
}
