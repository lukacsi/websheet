import type { AbilityScores, AbilityKey } from './ability';
import type { Edition, Condition, Skill, Speed } from './common';

export interface CharacterClass {
  classId: string;
  className: string;
  subclassId?: string;
  subclassName?: string;
  level: number;
}

export interface SpellSlots {
  /** Slots per spell level: index 0 = 1st level */
  max: number[];
  used: number[];
}

export interface HitDice {
  die: number; // e.g. 10 for d10
  total: number;
  used: number;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface CharacterItem {
  itemId: string;
  name: string;
  quantity: number;
  equipped: boolean;
  attuned: boolean;
}

export interface CharacterSpell {
  spellId: string;
  name: string;
  prepared: boolean;
  alwaysPrepared?: boolean;
  /** Origin of the spell: 'class', 'subclass', 'race', 'item', or undefined for manual */
  source?: string;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface TrackedResource {
  name: string;
  max: number;
  used: number;
  resetsOn: 'short' | 'long' | 'dawn' | 'never';
}

export interface CharacterFeat {
  featId: string;   // PB record ID, empty string for homebrew
  name: string;
  description?: string; // homebrew feat description
  source?: string;  // 'background' | undefined (manual)
}

export interface CharacterAttack {
  name: string;
  attackBonus: string;   // e.g. "+5"
  damage: string;        // e.g. "1d8+3 slashing"
  itemId?: string;       // optional link to inventory weapon
}

export interface CharacterAppearance {
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
}

export interface Character {
  id?: string;
  name: string;
  passphraseHash?: string;
  edition: Edition;
  playerName?: string;

  // Core identity
  raceId: string;
  raceName: string;
  subraceId?: string;
  subraceName?: string;
  backgroundId: string;
  backgroundName: string;
  classes: CharacterClass[];
  alignment?: string;

  // Ability scores
  abilities: AbilityScores;

  // Combat
  hp: number;
  maxHp: number;
  tempHp: number;
  ac: number;
  speed: Speed;
  initiative: number;
  proficiencyBonus: number;
  deathSaves: DeathSaves;
  hitDice: HitDice[];
  conditions: Condition[];
  exhaustionLevel: number;

  // Proficiencies
  savingThrowProficiencies: AbilityKey[];
  skillProficiencies: Skill[];
  skillExpertise: Skill[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  languages: string[];

  // Spells
  spellcastingAbility?: AbilityKey;
  spellSlots: SpellSlots;
  spells: CharacterSpell[];

  // Inventory
  items: CharacterItem[];
  currency: Currency;
  attunementSlots: number;

  // Attacks
  attacks: CharacterAttack[];

  // Features & resources
  featureIds: string[];
  featureChoices: Record<string, string[]>;
  feats: CharacterFeat[];
  resources: TrackedResource[];

  // Personality (Page 2)
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;

  // Appearance (Page 2)
  appearance: CharacterAppearance;
  backstory: string;
  alliesAndOrganizations: string;
  additionalFeaturesAndTraits: string;

  // Meta
  level: number; // total level across all classes
  xp?: number;
  inspiration: boolean;
  notes: string;
  portraitUrl?: string;

  createdAt?: string;
  updatedAt?: string;
}

/** Derived stats computed from character data */
export interface DerivedStats {
  abilityModifiers: Record<AbilityKey, number>;
  savingThrows: Record<AbilityKey, number>;
  skills: Record<Skill, number>;
  passivePerception: number;
  spellSaveDc?: number;
  spellAttackBonus?: number;
  carryCapacity: number;
  encumbrance: number;
}
