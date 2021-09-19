module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:shopify/esnext',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'import',
  ],
  rules: {
    'max-len': ['error', {code: 120}],
    '@typescript-eslint/no-empty-function': 'off',
    'no-mixed-operators': 'off',
    'no-lonely-if': 'off',
    'no-empty-function': 'off',
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    'no-console': 'off',
    'shopify/binary-assignment-parens': 'off',
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/no-non-null-assertion": "off",
    'no-warning-comments': 'off',
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: "detect",
    },
  },
  globals: {
    JSX: true,
  },
};
