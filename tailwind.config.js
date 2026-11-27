/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#0d1222',
          950: '#070a14',
        },
        violet: {
          DEFAULT: '#7c5cff',
          500: '#7c5cff',
          600: '#6540fa',
        },
        cyan: {
          DEFAULT: '#22e3ff',
          400: '#22e3ff',
          500: '#00c7e6',
        },
        lime: {
          DEFAULT: '#b6ff3b',
          400: '#b6ff3b',
          500: '#94e815',
        },
        teal: {
          400: '#22e3ff',
          500: '#7c5cff',
          600: '#6540fa',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#1e293b',
          800: '#141c34',
          900: '#0d1222',
          950: '#070a14',
        }
      }
    },
  },
  plugins: [],
}
