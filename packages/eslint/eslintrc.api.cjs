const rules = require('./eslintrc.typescript.cjs');

module.exports = {
  ignorePatterns: ['node_modules/*', 'dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.eslint.json',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'prettier',
    'eslint:recommended',
  ],
  plugins: ['@typescript-eslint', 'jest'],
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  rules,
  overrides: [
    {
      files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
      extends: ['plugin:jest/recommended'],
    },
  ],
};
