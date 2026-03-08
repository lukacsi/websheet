/** Shared form utility functions. */

/** Return `value` when it's a number, otherwise `fallback`. */
export function numOrDefault(value: string | number, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

/** Toggle an item in an array: remove if present, append if absent. */
export function toggleArrayItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item)
    ? arr.filter((x) => x !== item)
    : [...arr, item];
}
