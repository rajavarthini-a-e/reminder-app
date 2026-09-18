import { colors } from './colors.js';
import { tokens } from './tokens.js';

export { colors, tokens };

export const theme = {
  colors,
  tokens,
} as const;

export type Theme = typeof theme;
export default theme;
