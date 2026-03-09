import { z } from 'zod/v3';
import type { AbilityKey, AbilityScores } from './ability';
import type { Skill } from './common';

export type AbilityMethod = 'pointBuy' | 'standardArray' | 'manual';

export interface WizardFormData {
  // Step 0: Basics
  name: string;
  playerName: string;

  // Step 1: Class
  classId: string;
  subclassId: string;
  level: number;
  chosenSkills: Skill[];
  chosenClassTools: string[];

  // Step 2: Background
  backgroundId: string;
  backgroundBonusMode: '+2/+1' | '+1/+1/+1';
  backgroundBonuses: Partial<Record<AbilityKey, number>>;
  chosenBackgroundTools: string[];
  chosenBackgroundLanguages: string[];

  // Step 3: Species
  raceId: string;
  chosenRaceLanguages: string[];
  chosenResistance: string;

  // Step 4: Ability Scores
  abilityMethod: AbilityMethod;
  baseAbilities: AbilityScores;

  // Feature choices (e.g. Divine Order: Protector/Thaumaturge)
  featureChoices: Record<string, string[]>;

  // Step 5: Review & Save
  passphrase: string;
  passphraseConfirm: string;
}

const abilityScoreSchema = z.object({
  str: z.number().min(1).max(30),
  dex: z.number().min(1).max(30),
  con: z.number().min(1).max(30),
  int: z.number().min(1).max(30),
  wis: z.number().min(1).max(30),
  cha: z.number().min(1).max(30),
});

export const wizardSchema = z.object({
  name: z.string().min(1, 'Character name is required').max(100),
  playerName: z.string().max(100).default(''),

  classId: z.string().min(1, 'Class is required'),
  subclassId: z.string().default(''),
  level: z.number().min(1).max(20),
  chosenSkills: z.array(z.string()).min(1, 'Choose at least one skill'),
  chosenClassTools: z.array(z.string()).default([]),

  backgroundId: z.string().min(1, 'Background is required'),
  backgroundBonusMode: z.enum(['+2/+1', '+1/+1/+1']),
  backgroundBonuses: z.record(z.number()).default({}),
  chosenBackgroundTools: z.array(z.string()).default([]),
  chosenBackgroundLanguages: z.array(z.string()).default([]),

  featureChoices: z.record(z.array(z.string())).default({}),

  raceId: z.string().min(1, 'Species is required'),
  chosenRaceLanguages: z.array(z.string()).default([]),
  chosenResistance: z.string().default(''),

  abilityMethod: z.enum(['pointBuy', 'standardArray', 'manual']),
  baseAbilities: abilityScoreSchema,

  passphrase: z.string().default(''),
  passphraseConfirm: z.string().default(''),
}).refine(d => !d.passphrase || d.passphrase.length >= 4, {
  message: 'Passphrase must be at least 4 characters',
  path: ['passphrase'],
}).refine(d => !d.passphrase || d.passphrase === d.passphraseConfirm, {
  message: 'Passphrases must match',
  path: ['passphraseConfirm'],
});

/** Fields to validate per wizard step */
export const STEP_FIELDS: (keyof WizardFormData)[][] = [
  ['name'],                                                          // Step 0: Basics
  ['classId', 'subclassId', 'level', 'chosenSkills', 'chosenClassTools'], // Step 1: Class
  ['backgroundId', 'chosenBackgroundTools', 'chosenBackgroundLanguages'], // Step 2: Background
  ['raceId', 'chosenRaceLanguages', 'chosenResistance'],             // Step 3: Species
  ['abilityMethod', 'baseAbilities'],                                // Step 4: Ability Scores
  [],                                                                  // Step 5: Review (passphrase via modal)
];

export const WIZARD_DEFAULTS: WizardFormData = {
  name: '',
  playerName: '',
  classId: '',
  subclassId: '',
  level: 1,
  chosenSkills: [],
  chosenClassTools: [],
  backgroundId: '',
  backgroundBonusMode: '+2/+1',
  backgroundBonuses: {},
  chosenBackgroundTools: [],
  chosenBackgroundLanguages: [],
  raceId: '',
  chosenRaceLanguages: [],
  chosenResistance: '',
  abilityMethod: 'pointBuy',
  baseAbilities: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
  featureChoices: {},
  passphrase: '',
  passphraseConfirm: '',
};
