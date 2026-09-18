/**
 * MentorAI Design System - Color Tokens
 * Single source of truth for all color specifications.
 * Components consume semantic tokens, which map to CSS variables in index.css and tailwind.config.js.
 * Four warm color families: Sage, Lavender, Peach, Coral over Cream (#F5F2EB) & White (#FFFFFF).
 */

export const colors = {
  // Core Surface & Background Tokens (Warm Linen & Clean White)
  background: '#F5F2EB',        // --background (warm linen cream, visibly warmer than #FFFFFF)
  surface: '#FFFFFF',           // --surface (clean white card surface)
  surfaceSecondary: '#EDE8DF',  // --surface-secondary (half-step sunken cream for wells, inputs)

  // Mentor Presence & Accent Tokens (Warm Heather Lavender - R >= B and R+G > 2B with wide headroom)
  primary: '#945B70',           // --primary (warm heather lavender mentor accent, R:148, G:91, B:112)
  primaryHover: '#834D62',      // hover state (R:131, G:77, B:98)
  primaryActive: '#753E54',     // active/pressed state
  lavender: '#FAF2F3',          // --lavender (soft warm heather lavender surface, R:250, G:242, B:243)

  // Primary Action (Forest Sage Green - 6.44:1 contrast on white)
  success: '#2D6A45',           // --success (solid sage primary action)
  successHover: '#245939',      // hover state (8.19:1 contrast)
  successActive: '#1D492E',     // active state (10.27:1 contrast)
  successSoft: '#E4F2E9',       // --success-soft (soft tinted sage badge/container)

  // Warm Peach Family (Highlights, Secondary Moments, Motivation)
  peach: '#D4683B',             // --peach (warm terracotta peach accent)
  peachHover: '#BD5930',        // peach hover
  peachText: '#B84E25',         // deep peach text for WCAG AA compliance (6.0:1 on soft)
  peachSoft: '#FDF1EB',         // --peach-soft (soft warm peach container)

  // Urgency & Status Tokens (Amber & Soft Coral)
  warning: '#F5A623',           // --warning (amber indicator)
  warningText: '#824E00',       // deep amber text for AA compliance (6.21:1 on soft)
  warningSoft: '#FDF2D8',       // --warning-soft (soft amber container)
  danger: '#DC445D',            // --danger (rich coral red for critical/overdue)
  dangerText: '#B8233C',        // high contrast coral text (5.51:1 on soft)
  dangerSoft: '#FDECEF',        // --danger-soft (soft coral container)

  // Border & Divider Token (Warm subtle divider)
  border: '#E2DCD2',            // --border (warm stone divider)

  // Typography Tokens (Warm Espresso Charcoal & Warm Mid-Grey)
  textPrimary: '#231F1C',       // --text-primary (warm espresso near-black, 16.35:1 on white)
  textSecondary: '#686058',     // --text-secondary (warm mid-grey, 6.17:1 on white)

  // Dark Mode Overrides (Warm Charcoal, never blue-grey or pure black)
  dark: {
    background: '#151412',
    surface: '#1E1C1A',
    surfaceSecondary: '#181614',
    primary: '#B6758C',
    lavender: '#2E1E26',
    success: '#4FAE7A',
    successHover: '#439B6C',
    successActive: '#38845A',
    successSoft: '#1C2E23',
    peach: '#E07A5F',
    peachSoft: '#2E1D18',
    warning: '#F5A623',
    warningSoft: '#2E2313',
    danger: '#E85D75',
    dangerSoft: '#2E181D',
    border: '#2F2B26',
    textPrimary: '#F4F1EA',
    textSecondary: '#A69F94',
  },
} as const;

export type ColorToken = keyof typeof colors;
export default colors;
