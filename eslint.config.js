import eslint from "@eslint/js";

import prettierPlugin from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],

  {
    plugins: {
      "typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
    ignores: ["vite.config.ts", "eslint.config.js"],
  },
  {
    ignores: ["dist/*"],
  },
  prettierPlugin,
);
