/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  // 启用类暗色模式
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        medical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        neon: {
          cyan: '#22d3ee',
          blue: '#60a5fa',
          purple: '#a78bfa',
          pink: '#fb7185',
          lime: '#a3e635'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(34, 211, 238, 0.35)',
        'neon-strong': '0 0 35px rgba(167, 139, 250, 0.45)'
      }
    },
  },
  plugins: [],
}