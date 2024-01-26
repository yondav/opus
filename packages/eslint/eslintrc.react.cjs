// @yonbon/eslint/eslintrc.react.cjs

const rules = require('./eslintrc.typescript.cjs');

module.exports = {
  ignorePatterns: ['node_modules/*', 'dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  plugins: ['react-refresh'],
  env: { browser: true, es2020: true },
  rules: {
    ...rules,
    'react/jsx-key': 'off',
    'react/require-default-props': 0,
    'react/function-component-definition': 0,
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-pascal-case': 'off',
    'react/no-unknown-property': ['error', { ignore: ['css', 'tw'] }],
    'react-hooks/exhaustive-deps': 2,
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
