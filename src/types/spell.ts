import type { Edition, Entry } from './common';

export type SpellSchool = 'A' | 'C' | 'D' | 'E' | 'V' | 'I' | 'N' | 'T';

export const SPELL_SCHOOL_NAMES: Record<SpellSchool, string> = {
  A: 'Abjuration',
  C: 'Conjuration',
  D: 'Divination',
  E: 'Enchantment',
  V: 'Evocation',
  I: 'Illusion',
  N: 'Necromancy',
  T: 'Transmutation',
};

export interface SpellTime {
  number: number;
  unit: 'action' | 'bonus' | 'reaction' | 'minute' | 'hour';
  condition?: string;
}

export interface SpellRange {
  type: string;
  distance?: {
    type: string;
    amount?: number;
  };
}

export interface SpellComponents {
  v?: boolean;
  s?: boolean;
  m?: string | { text: string; cost?: number; consume?: boolean };
}

export interface SpellDuration {
  type: 'instant' | 'timed' | 'permanent' | 'special';
  duration?: {
    type: string;
    amount?: number;
  };
  concentration?: boolean;
}

export interface Spell {
  id?: string;
  name: string;
  source: string;
  page?: number;
  edition?: Edition;
  level: number;
  school: SpellSchool;
  time: SpellTime[];
  range: SpellRange;
  components: SpellComponents;
  duration: SpellDuration[];
  entries: Entry[];
  entriesHigherLevel?: Entry[];
  isRitual?: boolean;
  damageInflict?: string[];
  conditionInflict?: string[];
  savingThrow?: string[];
  spellAttack?: string[];
  classes: string[];
}
