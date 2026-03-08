import { createTheme, type MantineColorsTuple } from '@mantine/core';

const parchment: MantineColorsTuple = [
  '#faf6f1',
  '#f0e8dc',
  '#e3d5be',
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

export const theme = createTheme({
  primaryColor: 'inkBrown',
  primaryShade: { light: 6, dark: 6 },
  colors: {
    parchment,
    inkBrown,
  },
  fontFamily: '"Crimson Text", Georgia, "Times New Roman", serif',
  headings: {
    fontFamily: '"Cinzel", "Crimson Text", Georgia, serif',
  },
  defaultRadius: 'sm',
  other: {
    parchmentBg: '#1a1612',
    parchmentBorder: '#3d3227',
  },
});
