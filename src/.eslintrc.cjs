module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-restricted-properties': [
      'error',
      {
        object: 'import',
        property: 'meta',
        message:
          'Please use `env` from `src/lib/env.ts` instead of `import.meta.env`.',
      },
    ],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0, 'maxBOF': 0 }],
  },
  overrides: [
    {
      files: ['src/lib/env.ts'],
      rules: {
        'no-restricted-properties': 'off',
      },
    },
  ],
}; 