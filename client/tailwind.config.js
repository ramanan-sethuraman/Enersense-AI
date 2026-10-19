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
        slate: {
          950: '#000000',
          900: '#0A0A0A',
          850: '#141414',
          800: '#1F1F1F',
          750: '#2A2A2A',
          700: '#333333',
        },
        brand: {
          darkGreen: '#14532D',
          green: '#22C55E',
          greenLight: '#DCFCE7',
          blue: '#2563EB',
          blueLight: '#DBEAFE',
          bg: '#F8FAFC',
          text: '#0F172A',
          subtext: '#64748B',
          warning: '#F59E0B',
          danger: '#DC2626',
          card: '#FFFFFF',
          darkBg: '#000000',
          darkCard: '#0A0A0A',
          darkBorder: '#1F1F1F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 20px -5px rgba(34, 197, 94, 0.4)',
        'glow-blue': '0 0 20px -5px rgba(37, 99, 235, 0.4)',
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
      }
    },
  },
  plugins: [],
}
