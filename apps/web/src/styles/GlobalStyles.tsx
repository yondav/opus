// src/styles/GlobalStyles.tsx
import { createGlobalStyle } from 'styled-components';
import tw, { theme, GlobalStyles as BaseStyles } from 'twin.macro';

import { colors } from './colors';

const CustomStyles = createGlobalStyle({
  ':root': {
    '--brand-header-ff': "'Dosis', sans-serif",
    '--brand-body-ff': "'League Spartan', sans-serif",

    '--brand-black': colors.black,
    '--brand-white': colors.white,

    '--brand-neutral-50': colors.neutral[50],
    '--brand-neutral-100': colors.neutral[100],
    '--brand-neutral-200': colors.neutral[200],
    '--brand-neutral-300': colors.neutral[300],
    '--brand-neutral-400': colors.neutral[400],
    '--brand-neutral-500': colors.neutral[500],
    '--brand-neutral-600': colors.neutral[600],
    '--brand-neutral-700': colors.neutral[700],
    '--brand-neutral-800': colors.neutral[800],
    '--brand-neutral-900': colors.neutral[900],
    '--brand-neutral-950': colors.neutral[950],

    '--brand-primary-50': colors.primary[50],
    '--brand-primary-100': colors.primary[100],
    '--brand-primary-200': colors.primary[200],
    '--brand-primary-300': colors.primary[300],
    '--brand-primary-400': colors.primary[400],
    '--brand-primary-500': colors.primary[500],
    '--brand-primary-600': colors.primary[600],
    '--brand-primary-700': colors.primary[700],
    '--brand-primary-800': colors.primary[800],
    '--brand-primary-900': colors.primary[900],
    '--brand-primary-950': colors.primary[950],

    '--brand-secondary-50': colors.secondary[50],
    '--brand-secondary-100': colors.secondary[100],
    '--brand-secondary-200': colors.secondary[200],
    '--brand-secondary-300': colors.secondary[300],
    '--brand-secondary-400': colors.secondary[400],
    '--brand-secondary-500': colors.secondary[500],
    '--brand-secondary-600': colors.secondary[600],
    '--brand-secondary-700': colors.secondary[700],
    '--brand-secondary-800': colors.secondary[800],
    '--brand-secondary-900': colors.secondary[900],
    '--brand-secondary-950': colors.secondary[950],
  },

  '*': {
    ...tw`focus-visible:(outline-0 ring ring-primary-400 ring-offset-1 ring-offset-primary-200)`,
  },

  html: {
    minHeight: '100%',
    backgroundSize: '100% 100%',
    backgroundPosition: '0px 0px,0px 0px,0px 0px,0px 0px,0px 0px',
    backgroundImage: `linear-gradient(180deg, ${theme`colors.neutral.50`} 1%, #2344C200 29%), radial-gradient(113% 91% at 105% 0%, ${theme`colors.primary.400`} 0%, #2344C200 47%), radial-gradient(113% 91% at 17% -2%, ${theme`colors.secondary.300`} 0%, ${theme`colors.neutral.50`} 43%), radial-gradient(142% 91% at -6% 74%, ${theme`colors.neutral.50`} 1%, #FF000000 99%), radial-gradient(142% 91% at 111% 84%, ${theme`colors.white`} 0%, ${theme`colors.neutral.50`} 100%)`,
  },

  body: {
    // backgroundColor: theme`colors.neutral.50`,
    ...tw`text-neutral-950 text-p-sm md:text-p-md lg:text-p-md font-body`,
    WebkitTapHighlightColor: theme`colors.secondary.500`,
    ...tw`antialiased`,
  },

  h1: {
    ...tw`text-h1-sm md:text-h1-md lg:text-h1-lg font-header font-extrabold`,
  },

  h2: {
    ...tw`text-h2-sm md:text-h2-md lg:text-h2-lg font-header font-bold`,
  },

  h3: {
    ...tw`text-h3-sm md:text-h3-md lg:text-h3-lg font-header font-semibold`,
  },

  h4: {
    ...tw`text-o-sm md:text-o-md font-body font-light`,
  },

  h5: {
    ...tw`text-helper font-body font-extralight`,
  },

  a: {
    ...tw`font-normal text-primary-500 hover:brightness-75 transition-all cursor-pointer`,
  },
});

const GlobalStyles = () => (
  <>
    <BaseStyles />
    <CustomStyles />
  </>
);

export default GlobalStyles;
