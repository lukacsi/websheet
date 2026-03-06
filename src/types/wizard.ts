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
  level: number;
  chosenSkills: Skill[];

  // Step 2: Background
  backgroundId: string;
  backgroundBonusMode: '+2/+1' | '+1/+1/+1';
  backgroundBonuses: Partial<Record<AbilityKey, number>>;

  // Step 3: Species
  raceId: string;

  // Step 4: Ability Scores
  abilityMethod: AbilityMethod;
  baseAbilities: AbilityScores;

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
  level: z.number().min(1).max(20),
  chosenSkills: z.array(z.string()).min(1, 'Choose at least one skill'),

  backgroundId: z.string().min(1, 'Background is required'),
  backgroundBonusMode: z.enum(['+2/+1', '+1/+1/+1']),
  backgroundBonuses: z.record(z.number()).default({}),

  raceId: z.string().min(1, 'Species is required'),

  abilityMethod: z.enum(['pointBuy', 'standardArray', 'manual']),
  baseAbilities: abilityScoreSchema,

  passphrase: z.string().min(4, 'Passphrase must be at least 4 characters'),
  passphraseConfirm: z.string(),
}).refine(d => d.passphrase === d.passphraseConfirm, {
  message: 'Passphrases must match',
  path: ['passphraseConfirm'],
});

/** Fields to validate per wizard step */
export const STEP_FIELDS: (keyof WizardFormData)[][] = [
  ['name'],                                              // Step 0: Basics
  ['classId', 'level', 'chosenSkills'],                   // Step 1: Class
  ['backgroundId'],                                      // Step 2: Background
  ['raceId'],                                            // Step 3: Species
  ['abilityMethod', 'baseAbilities'],                    // Step 4: Ability Scores
  ['passphrase', 'passphraseConfirm'],                   // Step 5: Review
];

export const WIZARD_DEFAULTS: WizardFormData = {
  name: '',
  playerName: '',
  classId: '',
  level: 1,
  chosenSkills: [],
  backgroundId: '',
  backgroundBonusMode: '+2/+1',
  backgroundBonuses: {},
  raceId: '',
  abilityMethod: 'pointBuy',
  baseAbilities: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
  passphrase: '',
  passphraseConfirm: '',
};
