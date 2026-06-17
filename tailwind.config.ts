import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        claudio: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          700: '#B45309',
          900: '#78350F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
