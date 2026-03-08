/** Shared style constants — 3-tier depth system + input helpers. */

/* ── Depth tiers ── */

/** Base layer — sidebars, headers, drawer backgrounds. */
export const surfaceStyle = {
  backgroundColor: 'var(--mantine-color-dark-8)',
} as const;

/** Content containers — papers, cards, accordion items. */
export const cardStyle = {
  backgroundColor: 'var(--mantine-color-dark-7)',
  border: '1px solid var(--mantine-color-dark-5)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
} as const;

/** Important/interactive elements — stat boxes, ability scores, spell stats. */
export const elevatedStyle = {
  backgroundColor: 'var(--mantine-color-dark-6)',
  border: '1px solid var(--mantine-color-dark-4)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.2)',
} as const;

/* ── Decorative ── */

/** Warm border for section dividers. */
export const sectionDivider = {
  borderColor: 'rgba(191, 157, 100, 0.15)',
} as const;

/** Warm glow for important interactive elements. */
export const glowAccent = {
  boxShadow: '0 0 8px rgba(232, 190, 42, 0.15), 0 2px 8px rgba(0, 0, 0, 0.35)',
} as const;

/* ── Input styles ── */

export const centeredInputStyles = {
  input: { textAlign: 'center' as const },
};

export const centeredBoldInputStyles = {
  input: { textAlign: 'center' as const, fontWeight: 700 },
};

export const centeredLargeInputStyles = {
  input: { textAlign: 'center' as const, fontWeight: 700, fontSize: 18 },
};

export const centeredCompactInputStyles = {
  input: { textAlign: 'center' as const, padding: 2 },
};

/* ── Component-specific ── */

/** Accordion with card-depth item backgrounds. */
export const accordionStyles = {
  item: {
    backgroundColor: 'var(--mantine-color-dark-7)',
    borderColor: 'var(--mantine-color-dark-5)',
  },
};

/** Drawer with surface-depth background. */
export const drawerStyles = {
  body: { padding: 0, height: '100%', display: 'flex' as const, flexDirection: 'column' as const },
  content: { backgroundColor: 'var(--mantine-color-dark-8)' },
  header: {
    backgroundColor: 'var(--mantine-color-dark-8)',
    borderBottom: '1px solid rgba(191, 157, 100, 0.12)',
  },
};
