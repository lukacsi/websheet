import type { Character, Skill } from '@/types';
import type { WizardFormData } from '@/types/wizard';
import type { Race } from '@/types';
import type { Class } from '@/types';
import type { Background } from '@/types';
import type { Subclass } from '@/types/class';
import { finalAbilities } from './derived-stats';
import {
  calculateAc,
  calculateInitiative,
  proficiencyBonus,
} from './derived-stats';
import { hashPassphrase } from './passphrase';

interface BuildInput {
  form: WizardFormData;
  race: Race & { id: string };
  cls: Class & { id: string };
  background: Background & { id: string };
  subclass?: Subclass & { id: string };
}

/** HP at a given level: hitDie max + (level-1) * avg(hitDie) + level * CON mod */
function calculateMultiLevelHp(hitDie: number, conScore: number, level: number): number {
  const conMod = Math.floor((conScore - 10) / 2);
  const avgRoll = Math.floor(hitDie / 2) + 1;
  return Math.max(1, hitDie + (level - 1) * avgRoll + level * conMod);
}

/** Build a Character object from wizard form data + fetched entities */
export async function buildCharacter({ form, race, cls, background, subclass }: BuildInput): Promise<Character> {
  const level = form.level;
  // 2024 rules: ability bonuses come from background, not race
  const abilities = finalAbilities(form.baseAbilities, form.backgroundBonuses, {});
  const passphraseHash = form.passphrase
    ? await hashPassphrase(form.passphrase)
    : undefined;

  // Combine skill proficiencies from class choices + background
  const skillProficiencies: Skill[] = [
    ...(form.chosenSkills as Skill[]),
    ...(background.skillProficiencies ?? []) as Skill[],
  ];

  // Deduplicate
  const uniqueSkills = [...new Set(skillProficiencies)];

  const hp = calculateMultiLevelHp(cls.hitDie, abilities.con, level);
  const slotRow = cls.spellSlotProgression?.[level - 1] ?? [];

  return {
    name: form.name,
    passphraseHash,
    edition: 'one',
    playerName: form.playerName || undefined,

    raceId: race.id,
    raceName: race.name,
    backgroundId: background.id,
    backgroundName: background.name,
    classes: [{
      classId: cls.id,
      className: cls.name,
      subclassId: subclass?.id,
      subclassName: subclass?.name,
      level,
    }],

    abilities,
    hp,
    maxHp: hp,
    tempHp: 0,
    ac: calculateAc(abilities.dex),
    speed: { ...race.speed },
    initiative: calculateInitiative(abilities.dex),
    proficiencyBonus: proficiencyBonus(level),
    deathSaves: { successes: 0, failures: 0 },
    hitDice: [{ die: cls.hitDie, total: level, used: 0 }],
    conditions: [],
    exhaustionLevel: 0,

    savingThrowProficiencies: [...cls.savingThrows],
    skillProficiencies: uniqueSkills,
    skillExpertise: [],
    armorProficiencies: [...(cls.armorProficiencies ?? [])],
    weaponProficiencies: [...(cls.weaponProficiencies ?? [])],
    toolProficiencies: [
      ...(cls.toolProficiencies ?? []),
      ...(background.toolProficiencies ?? []),
      ...(form.chosenClassTools ?? []),
      ...(form.chosenBackgroundTools ?? []),
    ],
    languages: [
      ...(race.languages ?? []),
      ...(background.languages ?? []),
      ...(form.chosenRaceLanguages ?? []),
      ...(form.chosenBackgroundLanguages ?? []),
    ],

    spellcastingAbility: cls.spellcastingAbility ?? undefined,
    spellSlots: {
      max: slotRow,
      used: slotRow.map(() => 0),
    },
    spells: [],

    items: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunementSlots: 3,

    attacks: [],
    featureIds: [],
    featureChoices: form.featureChoices ?? {},
    resources: [],

    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    appearance: { age: '', height: '', weight: '', eyes: '', skin: '', hair: '' },
    backstory: '',
    alliesAndOrganizations: '',
    additionalFeaturesAndTraits: '',

    level,
    inspiration: false,
    notes: '',
  };
}
