# @yonbon/eslint

This package provides ESLint configurations for TypeScript projects, specifically tailored for API and React applications.

## Configurations

### 1. API Configuration

- File: `eslintrc.api.cjs`
- Usage: Recommended for Node.js and API projects.
- Rules:
  - TypeScript ESLint rules
  - Prettier integration
  - Jest recommended rules for tests

### 2. React Configuration

- File: `eslintrc.react.cjs`
- Usage: Recommended for React applications.
- Rules:
  - TypeScript ESLint rules
  - Prettier integration
  - React and React Hooks recommended rules
  - Custom overrides for React-specific scenarios

### 3. TypeScript Configuration

- File: `eslintrc.typescript.cjs`
- Usage: Common TypeScript rules shared between API and React configurations.
- Rules:
  - No console usage
  - Consistent type imports
  - Warn on unused variables
  - Import order enforcement

## Installation

1. Install the package:

   ```bash
   npm install @yonbon/eslint --save-dev
   ```

2. Create an ESLint configuration file in your project's root directory (e.g., .eslintrc.cjs) and extend the desired configuration:

```js
// For API projects
module.exports = require('@yonbon/eslint/eslintrc.api.cjs');
```

```js
// For React projects
module.exports = require('@yonbon/eslint/eslintrc.react.cjs');
```

## Dependencies

- [@typescript-eslint/eslint-plugin](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin)
- [@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser)
- [eslint](https://www.npmjs.com/package/eslint)
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier)
- [eslint-import-resolver-typescript](https://www.npmjs.com/package/eslint-import-resolver-typescript)
- [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import)
- [eslint-plugin-jest](https://www.npmjs.com/package/eslint-plugin-jest)
- [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier)
- [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react)
- [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [eslint-plugin-react-refresh](https://www.npmjs.com/package/eslint-plugin-react-refresh)
