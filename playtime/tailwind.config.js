/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0e0a0a',
        blood: '#5e0a10',
        primary: '#d01b2b',
        danger: '#d01b2b',
        cream: '#f1e2c2',
        paper: '#f8eedb',
        hazard: '#ffc917',
        teal: '#22d3c5',
      },
      fontFamily: {
        display: ['"Luckiest Guy"', 'system-ui', 'sans-serif'],
        mono: ['"Special Elite"', 'ui-monospace', 'monospace'],
        sans: ['Rubik', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
