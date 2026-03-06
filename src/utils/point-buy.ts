import type { AbilityKey, AbilityScores } from '@/types';

/** Point buy cost for each ability score value */
export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

export const POINT_BUY_TOTAL = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

/** Standard array values for D&D 5e */
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

/** Default ability scores (all 10s) */
export const DEFAULT_ABILITIES: AbilityScores = {
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
};

/** Default point-buy starting scores (all 8s) */
export const POINT_BUY_DEFAULT: AbilityScores = {
  str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8,
};

/** Calculate total points spent in point buy */
export function pointBuySpent(scores: AbilityScores): number {
  return Object.values(scores).reduce((sum, v) => sum + (POINT_BUY_COSTS[v] ?? 0), 0);
}

/** Points remaining in point buy */
export function pointBuyRemaining(scores: AbilityScores): number {
  return POINT_BUY_TOTAL - pointBuySpent(scores);
}

/** Check if a point buy allocation is valid */
export function isPointBuyValid(scores: AbilityScores): boolean {
  const allInRange = Object.values(scores).every(v => v >= POINT_BUY_MIN && v <= POINT_BUY_MAX);
  return allInRange && pointBuySpent(scores) <= POINT_BUY_TOTAL;
}

/** Check if incrementing an ability is allowed in point buy */
export function canIncrement(scores: AbilityScores, ability: AbilityKey): boolean {
  const current = scores[ability];
  if (current >= POINT_BUY_MAX) return false;
  const costDelta = POINT_BUY_COSTS[current + 1]! - POINT_BUY_COSTS[current]!;
  return pointBuyRemaining(scores) >= costDelta;
}

/** Check if decrementing an ability is allowed in point buy */
export function canDecrement(scores: AbilityScores, _ability: AbilityKey): boolean {
  return scores[_ability] > POINT_BUY_MIN;
}

/** Check if a standard array assignment is complete (all 6 unique values used) */
export function isStandardArrayComplete(scores: AbilityScores): boolean {
  const values = Object.values(scores).sort((a, b) => b - a);
  const target = [...STANDARD_ARRAY].sort((a, b) => b - a);
  return values.every((v, i) => v === target[i]);
}
