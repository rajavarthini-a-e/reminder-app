/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '390px',
      'sm': '430px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
    },
    extend: {
      colors: {
        // Direct CSS Variable token mappings from :root
        background: 'var(--background)',
        app: 'var(--background)',
        surface: {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
          dark: '#1E1C1A',
          darkCard: '#181614',
          darkBorder: '#2F2B26',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          soft: 'var(--lavender)',
          light: 'var(--lavender)',
        },
        success: {
          DEFAULT: 'var(--success)',
          hover: 'var(--success-hover)',
          active: 'var(--success-active)',
          soft: 'var(--success-soft)',
        },
        lavender: {
          DEFAULT: 'var(--lavender)',
          dark: '#2B2342',
        },
        peach: {
          DEFAULT: 'var(--peach)',
          hover: 'var(--peach-hover)',
          text: 'var(--peach-text)',
          soft: 'var(--peach-soft)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          text: 'var(--warning-text)',
          soft: 'var(--warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          text: 'var(--danger-text)',
          soft: 'var(--danger-soft)',
        },
        border: {
          DEFAULT: 'var(--border)',
          dark: '#2F2B26',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'primary-text': 'var(--text-primary)',
        'secondary-text': 'var(--text-secondary)',
        disabled: '#D1D5DB',

        // Semantic hero gradient and cell tokens
        hero: {
          start: '#E4F2E9',
          end: 'var(--background)',
          border: '#C8E6D3',
          darkStart: '#1C2E23',
          darkEnd: '#151412',
          darkBorder: '#2D4534',
        },
        cell: {
          light: '#EDE8DF',
          dark: '#2A2A30',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        card: 'var(--radius-xl)',
        '2xl': '20px',
        '3xl': 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        card: 'var(--shadow-md)',
        hover: 'var(--shadow-lg)',
        subtle: 'var(--shadow-sm)',
        soft: 'var(--shadow-sm)',
        modal: 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        content: '1100px',
      },
    },
  },
  plugins: [],
}
