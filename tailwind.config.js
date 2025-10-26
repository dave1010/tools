/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./tools/**/*.{html,js,ts,jsx,tsx}"
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['ui-monospace', 'monospace'],
    },
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      boxShadow: { soft: '0 2px 4px rgb(0 0 0 / 0.06)' },
      borderRadius: { xl: '1rem', '2xl': '1.5rem' }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  safelist: [
    { pattern: /^(text|bg|border|from|to|via)-(brand|gray|green|red|yellow)-(50|100|200|500|600|700)$/ },
    { pattern: /^(p|px|py|m|mx|my)-(0|1|2|3|4|6|8)$/ },
    { pattern: /^(grid-cols|cols)-(1|2|3|4)$/ },
    'prose','card','hidden','block','inline-flex','items-center','justify-between','gap-2','space-y-4'
  ]
}
