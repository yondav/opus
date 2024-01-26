const { join } = require('path');

module.exports = {
  extends: '../../node_modules/@yonbon/eslint/eslintrc.api.cjs',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: join(__dirname, 'tsconfig.eslint.json'),
  },
};
