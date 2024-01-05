/*eslint-env commonjs*/
// @ts-check
/** @type {import('eslint').ESLint.Options} */
module.exports = {
  root: true,
  plugins: ['jest', 'react', 'react-hooks', 'jsx-a11y', 'storybook'],
  extends: [
    '@humeai/eslint-config/base',
    'eslint:recommended',
    'plugin:jsx-a11y/strict',
    'plugin:@next/next/core-web-vitals',
    'plugin:react/jsx-runtime',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:storybook/recommended',
    'plugin:tailwindcss/recommended',
  ],
  ignorePatterns: ['!.storybook', '!.prettierrc.js', '!next-env.d.ts'],
  settings: {
    react: {
      version: 'detect',
    },
    tailwindcss: {
      config: 'tailwind.config.ts',
      callees: ['classnames', 'cn', 'cva'],
      cssFiles: [
        // load valid classnames from css files
        './src/**/*.css',
        '!**/node_modules',
      ],
    },
  },
  overrides: [
    // don't use default exports unless exporting a next.js api handler or page component
    {
      files: ['./src/**/*.ts', './src/**/*.tsx'],
      excludedFiles: [
        'src/pages/**/*',
        'src/**/?(*.)stories.tsx',
        '.storybook/main.ts',
      ],
      rules: {
        'import/no-default-export': 'error',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['airbnb-typescript'],
      rules: {
        'no-unused-vars': 'off',
      },
    },
    {
      files: [
        './src/**/*.ts',
        './src/**/*.tsx',
        './src/**/*.js',
        './src/**/*.jsx',
      ],
    },
    {
      files: ['./e2e/**.*.ts', './e2e/**.*.tsx'],
      extends: ['plugin:playwright/recommended'],
    },
  ],
  rules: {
    'jest/no-focused-tests': 'error',
    'react/jsx-key': [
      'error',
      {
        checkFragmentShorthand: true,
      },
    ],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/hook-use-state': 'error',
    'react/jsx-no-leaked-render': 'error',
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
        pathGroups: [
          { group: 'external', pattern: '$/**' },
          { group: 'external', pattern: '$storybook/**' },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
      },
    ],
    'jsx-a11y/label-has-associated-control': [
      2,
      {
        labelComponents: ['Label'],
        labelAttributes: ['label', 'aria-label'],
        controlComponents: [
          'Input',
          'Select',
          'Textarea',
          'Checkbox',
          'Radio',
          'Switch',
        ],
        depth: 3,
      },
    ],
    // cspell:ignore classname
    'tailwindcss/no-custom-classname': 'error',
  },
};
