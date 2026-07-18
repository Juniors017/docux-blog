import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import prettier from "eslint-config-prettier";

// Shared rules for unused code, applied to both JS and TS blocks below.
const unusedVarsRule = [
  "error",
  {
    // Ignore intentionally-unused args/vars prefixed with `_`.
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_",
    // Allow destructuring a key out only to omit it from a `...rest` object
    // (e.g. dropping `height`/`width` in MDXComponents).
    ignoreRestSiblings: true,
  },
];

export default tseslint.config(
  {
    // Generated output and vendored files are never linted.
    ignores: ["build/**", ".docusaurus/**", "node_modules/**", "static/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest", // Enables recent syntax such as import attributes.
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Docusaurus injects React automatically and we rely on PropTypes only
      // where it makes sense, so these two rules add noise here.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // Literal quotes/apostrophes in JSX prose are fine and would otherwise
      // flood the report; keep the linter focused on real issues.
      "react/no-unescaped-entities": "off",
      // Empty `catch {}` is a deliberate "swallow" pattern for analytics/optional code.
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": unusedVarsRule,
    },
  },
  {
    // TypeScript / TSX components (parsed with the TS parser, no type-checking).
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
      // Use the TS-aware version so type-only imports aren't flagged as unused.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": unusedVarsRule,
    },
  },
  // Must stay last so it can turn off rules that conflict with Prettier.
  prettier
);
