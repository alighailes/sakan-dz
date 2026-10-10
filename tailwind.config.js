/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nordic Minimalist — green-slate brand
        // Primary Action: #295255 (Hover: #203f42)
        primary: {
          50: '#F0F5F7',
          100: '#DCE7E7',
          200: '#B9CFCF',
          300: '#8FADB0',
          400: '#577877',
          500: '#355E61',
          600: '#295255',
          700: '#203f42',
          800: '#1A2F2D',
          900: '#162623',
          950: '#0D1A18',
        },
        // Brand tokens — Nordic Minimalist
        brand: {
          DEFAULT: '#295255',
          primary: '#295255',
          hover: '#203f42',
          surface: '#F0F5F7',
          dark: '#162623',
          muted: '#577877',
        },
        // Warm Slate / Zinc neutrals
        surface: {
          light: '#F0F5F7',
          dark: '#09090b',
        },
        // Luxury Gold / Amber accents
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Readex Pro', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'Noto Sans Arabic', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 4px 12px -2px rgb(0 0 0 / 0.06)',
        'soft-lg': '0 4px 20px -4px rgb(0 0 0 / 0.08), 0 12px 40px -12px rgb(0 0 0 / 0.12)',
        'soft-xl': '0 8px 30px -6px rgb(0 0 0 / 0.1), 0 20px 60px -15px rgb(0 0 0 / 0.15)',
        'glow': '0 0 20px -2px rgb(41 82 85 / 0.25)',
        'glow-accent': '0 0 20px -2px rgb(41 82 85 / 0.3)',
        'glass': '0 8px 32px -8px rgb(0 0 0 / 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSoft: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.15)' },
          '60%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
