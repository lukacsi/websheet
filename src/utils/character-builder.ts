import type { Character, Skill } from '@/types';
import type { WizardFormData } from '@/types/wizard';
import type { Race } from '@/types';
import type { Class } from '@/types';
import type { Background } from '@/types';
import { finalAbilities } from './derived-stats';
import {
  calculateHp,
  calculateAc,
  calculateInitiative,
} from './derived-stats';
import { hashPassphrase } from './passphrase';

interface BuildInput {
  form: WizardFormData;
  race: Race & { id: string };
  cls: Class & { id: string };
  background: Background & { id: string };
}

/** Build a Character object from wizard form data + fetched entities */
export async function buildCharacter({ form, race, cls, background }: BuildInput): Promise<Character> {
  // 2024 rules: ability bonuses come from background, not race
  const abilities = finalAbilities(form.baseAbilities, form.backgroundBonuses, {});
  const passphraseHash = await hashPassphrase(form.passphrase);

  // Combine skill proficiencies from class choices + background
  const skillProficiencies: Skill[] = [
    ...(form.chosenSkills as Skill[]),
    ...(background.skillProficiencies ?? []) as Skill[],
  ];

  // Deduplicate
  const uniqueSkills = [...new Set(skillProficiencies)];

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
      level: 1,
    }],

    abilities,
    hp: calculateHp(cls.hitDie, abilities.con),
    maxHp: calculateHp(cls.hitDie, abilities.con),
    tempHp: 0,
    ac: calculateAc(abilities.dex),
    speed: { ...race.speed },
    initiative: calculateInitiative(abilities.dex),
    proficiencyBonus: 2,
    deathSaves: { successes: 0, failures: 0 },
    hitDice: [{ die: cls.hitDie, total: 1, used: 0 }],
    conditions: [],

    savingThrowProficiencies: [...cls.savingThrows],
    skillProficiencies: uniqueSkills,
    skillExpertise: [],
    armorProficiencies: [...(cls.armorProficiencies ?? [])],
    weaponProficiencies: [...(cls.weaponProficiencies ?? [])],
    toolProficiencies: [
      ...(cls.toolProficiencies ?? []),
      ...(background.toolProficiencies ?? []),
    ],
    languages: [...(race.languages ?? []), ...(background.languages ?? [])],

    spellcastingAbility: cls.spellcastingAbility ?? undefined,
    spellSlots: {
      max: cls.spellSlotProgression?.[0] ?? [],
      used: (cls.spellSlotProgression?.[0] ?? []).map(() => 0),
    },
    spells: [],

    items: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunementSlots: 3,

    featureIds: [],
    resources: [],

    level: 1,
    inspiration: false,
    notes: '',
  };
}
