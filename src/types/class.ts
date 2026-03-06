import type { Edition, Entry, Skill } from './common';
import type { AbilityKey } from './ability';

export type CasterProgression = 'full' | '1/2' | '1/3' | 'pact' | 'artificer' | null;

export interface ClassFeature {
  id?: string;
  name: string;
  source: string;
  className: string;
  classSource: string;
  level: number;
  entries: Entry[];
  isSubclassFeature?: boolean;
  subclassName?: string;
}

export interface Subclass {
  id?: string;
  name: string;
  shortName: string;
  source: string;
  className: string;
  classSource: string;
  edition?: Edition;
  features: string[];
  spellcastingAbility?: AbilityKey;
}

export interface Class {
  id?: string;
  name: string;
  source: string;
  edition?: Edition;
  hitDie: number;
  primaryAbility: AbilityKey[];
  savingThrows: AbilityKey[];
  spellcastingAbility?: AbilityKey;
  casterProgression: CasterProgression;
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: { from: Skill[]; count: number };
  startingEquipment: Entry[];
  classFeatures: string[];
  subclassTitle: string;
  subclasses: Subclass[];
  multiclassing?: {
    requirements: Record<AbilityKey, number>;
    proficienciesGained: {
      armor?: string[];
      weapons?: string[];
      tools?: string[];
      skills?: { from: Skill[]; count: number };
    };
  };
  /** Cantrips known per level (index 0 = level 1) */
  cantripProgression?: number[];
  /** Spells prepared per level */
  preparedSpellsProgression?: number[];
  /** Spell slots per level — each row is [1st, 2nd, ..., 9th] */
  spellSlotProgression?: number[][];
}
