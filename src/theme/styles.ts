/** Shared style constants used across sheet components. */

export const darkPaperStyle = {
  backgroundColor: 'var(--mantine-color-dark-7)',
  border: '1px solid var(--mantine-color-dark-5)',
} as const;

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

export const accordionDarkStyles = {
  item: { backgroundColor: 'var(--mantine-color-dark-7)' },
};

export const darkDrawerStyles = {
  body: { padding: 0, height: '100%', display: 'flex' as const, flexDirection: 'column' as const },
  content: { backgroundColor: 'var(--mantine-color-dark-8)' },
  header: { backgroundColor: 'var(--mantine-color-dark-8)' },
};

export const darkCardStyle = {
  backgroundColor: 'var(--mantine-color-dark-7)',
  border: '1px solid var(--mantine-color-dark-4)',
} as const;
