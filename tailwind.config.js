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
        brand: { 50:'#f5f7ff',100:'#e6ebff',500:'#4f6ef7',600:'#3d58d9',700:'#2c44b3' }
      },
      boxShadow: { soft: '0 2px 4px rgb(0 0 0 / 0.06)' },
      borderRadius: { xl: '1rem', '2xl': '1.5rem' }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  safelist: [
    { pattern: /^(text|bg|border|from|to|via)-(brand|gray|green|red|yellow)-(50|100|500|600|700)$/ },
    { pattern: /^(p|px|py|m|mx|my)-(0|1|2|3|4|6|8)$/ },
    { pattern: /^(grid-cols|cols)-(1|2|3|4)$/ },
    'prose','card','hidden','block','inline-flex','items-center','justify-between','gap-2','space-y-4'
  ]
}
