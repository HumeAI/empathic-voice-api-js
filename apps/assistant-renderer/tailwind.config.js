/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        custom: 'inset rgba(var(--hume-tan-700)) 0px 0px 32px -12px',
      },
      colors: {
        initial: 'initial',
        inherit: 'inherit',
        transparent: 'transparent',

        black: 'rgba(var(--black) / <alpha-value>)',
        white: 'rgba(var(--white) / <alpha-value>)',

        background: {
          dark: 'var(--darkBackground)',
          light: 'var(--lightBackground)',
          gray: 'var(--grayBackground)',
        },

        gray: {
          800: 'rgb(var(--hume-black-800) / <alpha-value>)',
          700: 'rgb(var(--hume-black-700) / <alpha-value>)',
          600: 'rgb(var(--hume-black-600) / <alpha-value>)',
          500: 'rgb(var(--hume-black-500) / <alpha-value>)',
          400: 'rgb(var(--hume-black-400) / <alpha-value>)',
          300: 'rgb(var(--hume-black-300) / <alpha-value>)',
          200: 'rgb(var(--hume-black-200) / <alpha-value>)',
          100: 'rgb(var(--hume-black-100) / <alpha-value>)',
        },

        tan: {
          700: 'rgb(var(--hume-tan-700) / <alpha-value>)',
          600: 'rgb(var(--hume-tan-600) / <alpha-value>)',
          500: 'rgb(var(--hume-tan-500) / <alpha-value>)',
          400: 'rgb(var(--hume-tan-400) / <alpha-value>)',
          300: 'rgb(var(--hume-tan-300) / <alpha-value>)',
          200: 'rgb(var(--hume-tan-200) / <alpha-value>)',
        },

        orange: {
          400: 'rgb(var(--accent-orange-400) / <alpha-value>)',
          300: 'rgb(var(--accent-orange-300) / <alpha-value>)',
          200: 'rgb(var(--accent-orange-200) / <alpha-value>)',
          100: 'rgb(var(--accent-orange-100) / <alpha-value>)',
        },

        pink: {
          400: 'rgb(var(--accent-pink-400) / <alpha-value>)',
          300: 'rgb(var(--accent-pink-300) / <alpha-value>)',
          200: 'rgb(var(--accent-pink-200) / <alpha-value>)',
          100: 'rgb(var(--accent-pink-100) / <alpha-value>)',
        },

        purple: {
          400: 'rgb(var(--accent-purple-400) / <alpha-value>)',
          300: 'rgb(var(--accent-purple-300) / <alpha-value>)',
          200: 'rgb(var(--accent-purple-200) / <alpha-value>)',
          100: 'rgb(var(--accent-purple-100) / <alpha-value>)',
        },

        blue: {
          400: 'rgb(var(--accent-blue-400) / <alpha-value>)',
          300: 'rgb(var(--accent-blue-300) / <alpha-value>)',
          200: 'rgb(var(--accent-blue-200) / <alpha-value>)',
          100: 'rgb(var(--accent-blue-100) / <alpha-value>)',
        },

        turquoise: {
          400: 'rgb(var(--accent-turquoise-400) / <alpha-value>)',
          300: 'rgb(var(--accent-turquoise-300) / <alpha-value>)',
          200: 'rgb(var(--accent-turquoise-200) / <alpha-value>)',
          100: 'rgb(var(--accent-turquoise-100) / <alpha-value>)',
        },

        green: {
          400: 'rgb(var(--accent-green-400) / <alpha-value>)',
          300: 'rgb(var(--accent-green-300) / <alpha-value>)',
          200: 'rgb(var(--accent-green-200) / <alpha-value>)',
          100: 'rgb(var(--accent-green-100) / <alpha-value>)',
        },
      },
    },
    fontFamily: {
      sans: ['var(--font-sans)'],
      mono: ['var(--font-mono)'],
    },
  },
  plugins: [],
};
