import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/**", "coverage/**", "src/generated/**"]),

  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },

  // Type-aware rules. `projectService` resolves each file to the nearest
  // tsconfig, so prisma.config.ts and this file are covered too.
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        // tsconfigRootDir is omitted on purpose: it defaults to process.cwd(),
        // which is the project root when linting via `npm run lint`. Setting it
        // to `import.meta.dirname` needs this file inside a tsconfig with an
        // ESM `module` setting, which the CommonJS tsconfig.json does not give.
        projectService: true,
      },
    },
  },

  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      // Express handlers are async but return void; without this every
      // `app.get("/", async …)` is flagged.
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { arguments: false, attributes: false } },
      ],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // This file is not part of tsconfig.json, so type-aware rules cannot resolve
  // it to a project. Lint it with syntactic rules only.
  {
    files: ["eslint.config.mts"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Must stay last: switches off rules that fight Prettier.
  prettier,
]);
