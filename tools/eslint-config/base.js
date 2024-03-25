/* eslint-env commonjs*/
// @ts-check
/** @type {import('eslint').ESLint.Options} */

module.exports = {
  root: true,
  plugins: ['import', '@typescript-eslint', 'prettier', 'compat'],
  extends: ['eslint:recommended', 'prettier', 'plugin:compat/recommended'],
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
  },
  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['*.ts'],
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/quotes': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/no-use-before-define': [2, { functions: false }],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            format: ['PascalCase', 'camelCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
        ],
        '@typescript-eslint/no-non-null-assertion': 'error',
        'import/extensions': 'off',
      },
    },
  ],
  rules: {
    'arrow-body-style': 'off',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-nested-ternary': 'error',
    'prettier/prettier': 'error',
    'import/no-unresolved': 'off',
    'no-void': 'off',
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        groups: [
          //
          ['external', 'builtin'],
          ['internal'],
          ['index', 'sibling', 'parent'],
        ],
        // keep "$/" imports within the "external" group
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
      },
    ],
  },
};
