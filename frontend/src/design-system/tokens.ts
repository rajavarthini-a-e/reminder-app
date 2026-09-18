/**
 * MentorAI Design System - Design Tokens
 * Radius, Shadows, Spacing, Typography, Motion, and Breakpoints.
 * Single source of truth mirroring index.css and tailwind.config.js.
 */

export const tokens = {
  // Radius Tokens
  radius: {
    sm: '8px',       // --radius-sm
    md: '12px',      // --radius-md
    lg: '16px',      // --radius-lg
    xl: '24px',      // --radius-xl (Card radius)
    card: '24px',    // Alias for card radius
    pill: '9999px',
    full: '50%',
  },

  // Shadow Tokens
  shadows: {
    sm: '0 1px 3px rgba(31, 41, 55, 0.04)',                           // --shadow-sm
    md: '0 4px 20px -2px rgba(31, 41, 55, 0.05)',                    // --shadow-md
    lg: '0 8px 24px -4px rgba(31, 41, 55, 0.08)',                    // --shadow-lg
    card: '0 4px 20px -2px rgba(31, 41, 55, 0.05)',                  // Alias for card shadow
    hover: '0 8px 24px -4px rgba(31, 41, 55, 0.08)',                 // Alias for hover shadow
  },

  // Spacing Rhythm (4px base)
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    touchTargetMin: '48px',
    cardPadding: '20px sm:24px',
  },

  // Typography Hierarchy
  typography: {
    display: {
      size: '36px',
      lineHeight: '1.2',
      weight: '800',
    },
    titleLg: {
      size: '28px',
      lineHeight: '1.3',
      weight: '700',
    },
    title: {
      size: '22px',
      lineHeight: '1.35',
      weight: '700',
    },
    heading: {
      size: '18px',
      lineHeight: '1.4',
      weight: '600',
    },
    bodyLg: {
      size: '18px',
      lineHeight: '1.5',
      weight: '400',
    },
    body: {
      size: '15px',
      lineHeight: '1.5',
      weight: '400',
    },
    label: {
      size: '13px',
      lineHeight: '1.4',
      weight: '600',
    },
    caption: {
      size: '12px',
      lineHeight: '1.4',
      weight: '500',
    },
    numeric: {
      variant: 'tabular-nums',
      weight: '700',
    },
  },

  // Motion & Animation Tokens
  motion: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '400ms',
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0.0, 0, 1)',
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.3, 0.0, 1, 1)',
    },
  },

  // Breakpoints
  breakpoints: {
    mobile: '390px',
    mobileLarge: '430px',
    tablet: '768px',
    desktop: '1024px',
    desktopWide: '1440px',
  },

  // Centered Container Max Width
  maxContainerWidth: '1100px',
} as const;

export default tokens;
