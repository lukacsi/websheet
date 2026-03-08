import { createTheme, type MantineColorsTuple } from '@mantine/core';

const parchment: MantineColorsTuple = [
  '#faf5ef',
  '#f0e6d8',
  '#e3d3ba',
  '#d4be9a',
  '#c9ad7f',
  '#c2a26e',
  '#bf9d64',
  '#a88953',
  '#967a48',
  '#836938',
];

const inkBrown: MantineColorsTuple = [
  '#f9f1e7',
  '#eedfc9',
  '#e0c9a1',
  '#d2b074',
  '#c89e55',
  '#c29442',
  '#bf8f39',
  '#a87c2d',
  '#966e24',
  '#835e17',
];

const gold: MantineColorsTuple = [
  '#fef9e7',
  '#fcf0c8',
  '#f7e08a',
  '#f2ce4e',
  '#e8be2a',
  '#d4a917',
  '#b8920f',
  '#96760c',
  '#7a610a',
  '#634e08',
];

const bloodRed: MantineColorsTuple = [
  '#fce8e8',
  '#f5cccc',
  '#e89999',
  '#db6666',
  '#cc3d3d',
  '#b82222',
  '#9e1a1a',
  '#821515',
  '#6b1111',
  '#570d0d',
];

export const theme = createTheme({
  primaryColor: 'inkBrown',
  primaryShade: { light: 6, dark: 6 },
  colors: {
    parchment,
    inkBrown,
    gold,
    bloodRed,
  },
  fontFamily: '"Crimson Text", Georgia, "Times New Roman", serif',
  headings: {
    fontFamily: '"Cinzel", "Crimson Text", Georgia, serif',
  },
  defaultRadius: 'sm',
  components: {
    Paper: {
      defaultProps: {
        radius: 'sm',
      },
      styles: {
        root: {
          transition: 'box-shadow 0.15s, border-color 0.15s',
        },
      },
    },
    Card: {
      styles: {
        root: {
          transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    Tabs: {
      styles: {
        tab: {
          transition: 'color 0.15s, border-color 0.15s',
          '&[data-active]': {
            borderColor: 'var(--mantine-color-gold-5)',
            color: 'var(--mantine-color-gold-3)',
          },
        },
      },
    },
    Table: {
      styles: {
        tr: {
          transition: 'background-color 0.1s',
          '&:hover': {
            backgroundColor: 'rgba(191, 157, 100, 0.04)',
          },
        },
      },
    },
    Badge: {
      styles: {
        root: {
          fontFamily: '"Crimson Text", Georgia, serif',
        },
      },
    },
    Checkbox: {
      styles: {
        input: {
          '&:checked': {
            backgroundColor: 'var(--mantine-color-inkBrown-6)',
            borderColor: 'var(--mantine-color-inkBrown-6)',
          },
        },
      },
    },
    Select: {
      styles: {
        dropdown: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-4)',
        },
        option: {
          '&[data-selected]': {
            backgroundColor: 'var(--mantine-color-inkBrown-8)',
          },
          '&[data-highlighted]': {
            backgroundColor: 'rgba(191, 157, 100, 0.08)',
          },
        },
      },
    },
    Loader: {
      defaultProps: { color: 'gold' },
    },
    Notification: {
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-5)',
        },
      },
    },
    Alert: {
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-5)',
        },
      },
    },
    SegmentedControl: {
      styles: {
        indicator: {
          backgroundColor: 'var(--mantine-color-inkBrown-8)',
        },
      },
    },
  },
});
