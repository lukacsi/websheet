import { useState } from 'react';
import { createRecord } from '@/api/pocketbase';
import { buildCharacter } from '@/utils/character-builder';
import { getRace } from '@/api/races';
import { getClass } from '@/api/classes';
import { getBackground } from '@/api/backgrounds';
import type { WizardFormData } from '@/types/wizard';
import type { Character } from '@/types';

export function useCreateCharacter() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCharacter(form: WizardFormData): Promise<Character | null> {
    setSaving(true);
    setError(null);
    try {
      const [race, cls, background] = await Promise.all([
        getRace(form.raceId),
        getClass(form.classId),
        getBackground(form.backgroundId),
      ]);

      const character = await buildCharacter({ form, race, cls, background });
      const saved = await createRecord<Character>('characters', character as unknown as Record<string, unknown>);
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
      return null;
    } finally {
      setSaving(false);
    }
  }

  return { createCharacter, saving, error };
}
