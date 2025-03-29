/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8EFF6',
          100: '#D0DEEC',
          200: '#B9CEE3',
          300: '#A1BEDA',
          400: '#8AAED1',
          500: '#739DC7',
          600: '#5B8DBE',
          700: '#447DB5',
          800: '#2C6CAB',
          900: '#155CA2',
        },
        secondary: {
          50: '#020910',
          100: '#041220',
          200: '#061C31',
          300: '#082541',
          400: '#0B2E51',
          500: '#0D3761',
          600: '#0F4071',
          700: '#114A82',
          800: '#135392',
          900: '#155CA2',
        },
      },
    },
  },
  plugins: [],
}; 