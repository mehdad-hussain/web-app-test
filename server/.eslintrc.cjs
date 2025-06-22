module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: ["plugin:@typescript-eslint/recommended"],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.cjs"],
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-restricted-properties": [
      "error",
      {
        object: "process",
        property: "env",
        message: "Please use `env` from `src/lib/env.js` instead of `process.env`.",
      },
    ],
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0, "maxBOF": 0 }],
  },
  overrides: [
    {
      files: ["src/lib/env.ts"],
      rules: {
        "no-restricted-properties": "off",
      },
    },
  ],
};
