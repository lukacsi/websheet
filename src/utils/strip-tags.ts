/**
 * Strip 5e.tools {@tag value|source} markup to just the display value.
 * Handles: {@spell Fireball|PHB}, {@item Dagger|XPHB}, {@filter Light|items|...}, etc.
 */
export function stripTags(text: string): string {
  return text.replace(/\{@\w+ ([^|}]+)(?:\|[^}]*)?\}/g, '$1');
}
