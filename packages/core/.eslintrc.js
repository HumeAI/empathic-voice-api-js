/*eslint-env commonjs*/
// @ts-check
/** @type {import('eslint').ESLint.Options} */

module.exports = {
  root: true,
  extends: ['@humeai/eslint-config/base'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
};
