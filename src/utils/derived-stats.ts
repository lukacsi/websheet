import type { AbilityKey, AbilityScores } from '@/types';
import type { Skill } from '@/types';
import { abilityModifier, SKILL_ABILITY } from '@/types';

/** Calculate final ability scores = base + bonuses (from background in 2024 rules) */
export function finalAbilities(
  base: AbilityScores,
  fixedBonuses: Partial<Record<AbilityKey, number>>,
  chosenBonuses: Partial<Record<AbilityKey, number>>,
): AbilityScores {
  const result = { ...base };
  for (const [key, val] of Object.entries(fixedBonuses)) {
    result[key as AbilityKey] += val;
  }
  for (const [key, val] of Object.entries(chosenBonuses)) {
    result[key as AbilityKey] += val;
  }
  return result;
}

/** All ability modifiers */
export function abilityModifiers(abilities: AbilityScores): Record<AbilityKey, number> {
  return {
    str: abilityModifier(abilities.str),
    dex: abilityModifier(abilities.dex),
    con: abilityModifier(abilities.con),
    int: abilityModifier(abilities.int),
    wis: abilityModifier(abilities.wis),
    cha: abilityModifier(abilities.cha),
  };
}

/** HP at level 1 = hitDie max + CON modifier (minimum 1) */
export function calculateHp(hitDie: number, conScore: number): number {
  return Math.max(1, hitDie + abilityModifier(conScore));
}

/** AC = 10 + DEX modifier (unarmored) */
export function calculateAc(dexScore: number): number {
  return 10 + abilityModifier(dexScore);
}

/** Initiative = DEX modifier */
export function calculateInitiative(dexScore: number): number {
  return abilityModifier(dexScore);
}

/** Proficiency bonus (always 2 at level 1) */
export function proficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/** Saving throw value = ability mod + (proficiency bonus if proficient) */
export function savingThrow(
  abilityScore: number,
  proficient: boolean,
  level: number = 1,
): number {
  return abilityModifier(abilityScore) + (proficient ? proficiencyBonus(level) : 0);
}

/** Skill check value = ability mod + prof bonus if proficient + 2x prof if expertise */
export function skillModifier(
  abilityScore: number,
  proficient: boolean,
  expertise: boolean = false,
  level: number = 1,
): number {
  const mod = abilityModifier(abilityScore);
  const prof = proficiencyBonus(level);
  if (expertise) return mod + prof * 2;
  if (proficient) return mod + prof;
  return mod;
}

/** All skill modifiers */
export function allSkillModifiers(
  abilities: AbilityScores,
  proficientSkills: Skill[],
  expertiseSkills: Skill[] = [],
  level: number = 1,
): Record<Skill, number> {
  const entries = Object.entries(SKILL_ABILITY) as [Skill, AbilityKey][];
  const result = {} as Record<Skill, number>;
  for (const [skill, ability] of entries) {
    result[skill] = skillModifier(
      abilities[ability],
      proficientSkills.includes(skill),
      expertiseSkills.includes(skill),
      level,
    );
  }
  return result;
}

/** Passive perception = 10 + WIS mod + prof bonus if proficient */
export function passivePerception(
  wisScore: number,
  proficient: boolean,
  level: number = 1,
): number {
  return 10 + skillModifier(wisScore, proficient, false, level);
}

/** Spell save DC = 8 + proficiency bonus + casting ability modifier */
export function spellSaveDc(
  castingAbilityScore: number,
  level: number = 1,
): number {
  return 8 + proficiencyBonus(level) + abilityModifier(castingAbilityScore);
}

/** Spell attack bonus = proficiency bonus + casting ability modifier */
export function spellAttackBonus(
  castingAbilityScore: number,
  level: number = 1,
): number {
  return proficiencyBonus(level) + abilityModifier(castingAbilityScore);
}

/** Format a modifier for display: +2, -1, +0 */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Calculate weapon attack bonus: prof bonus + STR/DEX mod (finesse uses higher) */
export function weaponAttackBonus(
  itemType: string,
  properties: string[],
  abilities: AbilityScores,
  level: number,
): string {
  const strMod = abilityModifier(abilities.str);
  const dexMod = abilityModifier(abilities.dex);
  const isFinesse = properties.includes('F');
  const isRanged = itemType === 'R';
  const mod = isFinesse ? Math.max(strMod, dexMod) : isRanged ? dexMod : strMod;
  return formatModifier(mod + proficiencyBonus(level));
}

/** Calculate weapon damage string: e.g. "1d8+3 slashing" */
export function weaponDamage(
  damage: string,
  damageType: string,
  itemType: string,
  properties: string[],
  abilities: AbilityScores,
): string {
  const strMod = abilityModifier(abilities.str);
  const dexMod = abilityModifier(abilities.dex);
  const isFinesse = properties.includes('F');
  const isRanged = itemType === 'R';
  const mod = isFinesse ? Math.max(strMod, dexMod) : isRanged ? dexMod : strMod;
  const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
  return `${damage}${modStr} ${damageType}`;
}
