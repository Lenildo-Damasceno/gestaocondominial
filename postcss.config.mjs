/**
 * postcss.config.mjs
 * 
 * Configuração do PostCSS para o projeto
 * - Integra plugin @tailwindcss/postcss para compilar Tailwind CSS v4
 * - Transforma arquivos CSS com utilidades do Tailwind
 * - Requerido para funcionar com app/globals.css
 */

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
