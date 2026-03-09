import type { Character } from '@/types';

/** PocketBase metadata fields to strip on export */
const PB_FIELDS = ['id', 'collectionId', 'collectionName', 'created', 'updated', 'createdAt', 'updatedAt'];

/** Export a character as a clean JSON string (strips PB metadata) */
export function exportCharacter(char: Character): string {
  const clean = Object.fromEntries(
    Object.entries(char).filter(([key]) => !PB_FIELDS.includes(key)),
  );
  return JSON.stringify(clean, null, 2);
}

/** Required fields for a valid character import */
const REQUIRED_FIELDS: (keyof Character)[] = ['name', 'abilities', 'hp', 'maxHp', 'ac', 'level'];

/** Parse and validate imported character JSON. Returns clean Character or throws. */
export function importCharacter(json: string): Character {
  const parsed = JSON.parse(json);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid JSON: expected an object');
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in parsed)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Strip PB metadata so it gets a fresh ID on save
  for (const key of PB_FIELDS) {
    delete parsed[key];
  }
  // Remove passphrase hash — imported characters are unprotected
  delete parsed.passphraseHash;

  return parsed as Character;
}

/** Trigger a JSON file download in the browser */
export function downloadJson(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
