/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['var(--font-sans)'],
      mono: ['var(--font-mono)'],
    },
    colors: {
      beige: '#FDF4E9',
      red: '#E0797B',
      'dark-gray': '#333333',
      black: '#000000',
      white: '#FFFFFF',
    },
  },
  plugins: [],
};
