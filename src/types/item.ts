import type { Edition, Entry, DamageType } from './common';

export type ItemRarity = 'none' | 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact' | 'varies';

export type ItemType =
  | 'M' | 'R'                     // melee/ranged weapon
  | 'LA' | 'MA' | 'HA' | 'S'     // armor types + shield
  | 'W' | 'P' | 'SC' | 'RD'     // wondrous, potion, scroll, rod
  | 'ST' | 'WD' | 'RG'          // staff, wand, ring
  | 'G' | 'AT' | 'FD'           // gear, artisan tool, food
  | 'SCF' | 'INS' | 'GS'       // spellcasting focus, instrument, gaming set
  | 'A' | 'EXP'                 // ammunition, explosive
  | string;                      // catch-all for unknown types

export type WeaponCategory = 'simple' | 'martial';

export interface Item {
  id?: string;
  name: string;
  source: string;
  edition?: Edition;
  type?: ItemType;
  rarity: ItemRarity;
  weight?: number;
  value?: number; // in copper pieces
  weaponCategory?: WeaponCategory;
  damage?: string; // e.g. "1d8"
  damageType?: DamageType;
  versatileDamage?: string; // e.g. "1d10"
  range?: string; // e.g. "20/60"
  properties: string[];
  ac?: number;
  strengthRequirement?: number;
  stealthDisadvantage?: boolean;
  requiresAttunement?: boolean | string;
  bonusWeapon?: string;
  bonusAc?: string;
  bonusSpellAttack?: string;
  bonusSpellSaveDc?: string;
  entries: Entry[];
  isHomebrew?: boolean;
  homebrewCreatedBy?: string;
}
