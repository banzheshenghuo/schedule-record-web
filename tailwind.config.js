/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00d9a3',
          dark: '#00b386',
          light: '#5cf0c8',
        },
        accent: {
          amber: '#fbbf24',
          coral: '#ff6b6b',
        },
        ink: {
          50: '#f0f2f5',
          100: '#e2e6ec',
          200: '#c4cbd6',
          300: '#9ba5b5',
          400: '#6b7689',
          500: '#4a5468',
          600: '#36404f',
          700: '#262f3d',
          800: '#1a212c',
          850: '#141921',
          900: '#0e1219',
          950: '#080b11',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Helvetica Neue', 'sans-serif'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scan': 'scan 3s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-1px)' },
          '40%': { transform: 'translateX(1px)' },
          '60%': { transform: 'translateX(-0.5px)' },
          '80%': { transform: 'translateX(0.5px)' },
        },
      },
    },
  },
  plugins: [],
};
