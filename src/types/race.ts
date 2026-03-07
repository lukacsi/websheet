import type { Edition, Entry, Size, Speed, DamageType, Condition, ProfChoice, LangChoice, ResistanceChoice } from './common';
import type { AbilityKey } from './ability';

export interface AbilityBonus {
  fixed?: Partial<Record<AbilityKey, number>>;
  choose?: { from: AbilityKey[]; count: number; amount: number };
}

export interface Race {
  id?: string;
  name: string;
  source: string;
  edition?: Edition;
  size: Size[];
  speed: Speed;
  darkvision?: number;
  abilityBonuses: AbilityBonus[];
  resistances?: DamageType[];
  immunities?: DamageType[];
  conditionImmunities?: Condition[];
  skillProficiencies?: string[];
  weaponProficiencies?: string[];
  toolProficiencies?: string[];
  toolChoices?: ProfChoice[];
  languages: string[];
  languageChoices?: LangChoice[];
  resistanceChoices?: ResistanceChoice[];
  traits: Entry[];
  subraces?: Subrace[];
}

export interface Subrace {
  id?: string;
  name: string;
  source: string;
  raceName: string;
  raceSource: string;
  abilityBonuses?: AbilityBonus[];
  traits: Entry[];
}
