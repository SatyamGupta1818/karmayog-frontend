/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          50: '#ffffff',
          100: '#f5f5f0',
          200: '#e8e8e0',
          300: '#cccccc',
          400: '#aaaaaa',
          500: '#888888',
          600: '#666666',
          700: '#444444',
          800: '#222222',
          900: '#111111',
          950: '#000000',
        },
        brand: {
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
          950: '#451a03',
        },
        ink: {
          DEFAULT: '#0a0f1e',
          soft: '#1e2a4a',
          muted: '#64748b',
        }
      },
      boxShadow: {
        'sidebar': '4px 0 24px rgba(26,21,18,0.08)',
        'card': '0 2px 12px rgba(26,21,18,0.06), 0 1px 3px rgba(26,21,18,0.04)',
        'card-hover': '0 8px 24px rgba(26,21,18,0.12), 0 2px 6px rgba(26,21,18,0.06)',
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        }
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
        'fade-up': 'fade-up 0.3s ease-out',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
