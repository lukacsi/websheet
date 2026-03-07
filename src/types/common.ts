export type Edition = 'classic' | 'one';

export type Size = 'T' | 'S' | 'M' | 'L' | 'H' | 'G';

export type DamageType =
  | 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force'
  | 'lightning' | 'necrotic' | 'piercing' | 'poison'
  | 'psychic' | 'radiant' | 'slashing' | 'thunder';

export type Condition =
  | 'blinded' | 'charmed' | 'deafened' | 'exhaustion'
  | 'frightened' | 'grappled' | 'incapacitated' | 'invisible'
  | 'paralyzed' | 'petrified' | 'poisoned' | 'prone'
  | 'restrained' | 'stunned' | 'unconscious';

export type Skill =
  | 'acrobatics' | 'animal handling' | 'arcana' | 'athletics'
  | 'deception' | 'history' | 'insight' | 'intimidation'
  | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleight of hand'
  | 'stealth' | 'survival';

import type { AbilityKey } from './ability';

export const SKILL_ABILITY: Record<Skill, AbilityKey> = {
  'acrobatics': 'dex',
  'animal handling': 'wis',
  'arcana': 'int',
  'athletics': 'str',
  'deception': 'cha',
  'history': 'int',
  'insight': 'wis',
  'intimidation': 'cha',
  'investigation': 'int',
  'medicine': 'wis',
  'nature': 'int',
  'perception': 'wis',
  'performance': 'cha',
  'persuasion': 'cha',
  'religion': 'int',
  'sleight of hand': 'dex',
  'stealth': 'dex',
  'survival': 'wis',
};

export interface Speed {
  walk: number;
  fly?: number;
  swim?: number;
  climb?: number;
  burrow?: number;
}

/** 5e.tools rich text entry — can be a string or structured object */
export type Entry = string | EntryObject;

export interface EntryObject {
  type: string;
  name?: string;
  entry?: string;  // used by type: "item" (name-value pair)
  entries?: Entry[];
  items?: Entry[];
  style?: string;
  colLabels?: string[];
  rows?: unknown[][];
  [key: string]: unknown;
}

export interface SourceRef {
  name: string;
  source: string;
  page?: number;
}

/** Structured tool proficiency choice from 5e.tools data */
export interface ProfChoice {
  type: 'anyArtisansTool' | 'anyMusicalInstrument' | 'anyGamingSet' | 'specific';
  count: number;
  from?: string[];
}

/** Structured language choice from 5e.tools data */
export interface LangChoice {
  type: 'anyStandard' | 'any' | 'specific';
  count: number;
  from?: string[];
}

/** Resistance choice (e.g. classic Dragonborn choosing damage type) */
export interface ResistanceChoice {
  from: DamageType[];
}
