/**
 * eslint.config.mjs
 * 
 * Configuração do ESLint para o projeto
 * - Estende eslint-config-next/core-web-vitals para regras Next.js
 * - Estende eslint-config-next/typescript para suporte TypeScript
 * - Define ignores globais: .next, out, build, next-env.d.ts
 * - Garante qualidade e consistência do código
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;