/*eslint-env commonjs*/
// @ts-check
/** @type {import('eslint').ESLint.Options} */

module.exports = {
  root: true,
  extends: [
    '@humeai/eslint-config/base',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
  },
};
