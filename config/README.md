# Configuração do Projeto

Diretório centralizado para todas as configurações do projeto.

## Arquivos

- **eslint.config.mjs** - Configuração ESLint para validação de código
  - Estende eslint-config-next/core-web-vitals
  - Define ignores globais: .next, out, build, next-env.d.ts

- **next.config.mjs** - Configuração Next.js 16
  - Otimizações CSS experimental (experimental.optimizeCss)
  - Headers de segurança: X-Content-Type-Options nosniff

- **postcss.config.mjs** - Configuração PostCSS
  - Integra plugin @tailwindcss/postcss para compilar Tailwind CSS v4

- **jsconfig.json** - Configuração de path aliases
  - Define alias '@/*' para importações limpas

## Notas

Os arquivos neste diretório são auto-detectados pelo Next.js e ferramentas de build. Nenhuma alteração adicional necessária em imports.
