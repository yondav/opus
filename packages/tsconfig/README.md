# @yonbon/tsconfig

## Configurations

### 1. Base Configuration

- File: `api.json`
- Usage: Recommended for Node.js and API projects.

### 2. React Configuration

- File: `react.json`
- Usage: Recommended for React applications.

### 3. Node Configuration

- File: `node.json`
- Usage: Reference config for ViteJS app.

## Usage

```json
{
  "extends": "@yonbon/tsconfig/web.json",
  "references": [{ "path": "./tsconfig.node.json" }],
  "include": ["src", "types"]
}
```
