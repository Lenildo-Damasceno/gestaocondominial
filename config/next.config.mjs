/**
 * next.config.mjs
 * 
 * Configurações do Next.js 16
 * - Otimizações CSS experimental (experimental.optimizeCss)
 * - Imagens não otimizadas em dev (unoptimized: true)
 * - Headers de segurança: X-Content-Type-Options nosniff
 * - Melhor cache e prevenção de MIME type sniffing
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações para performance e LCP
  experimental: {
    optimizeCss: true,
  },
  // Reduz o impacto do carregamento em background
  images: {
    unoptimized: true, // Para desenvolvimento, evita processamento de imagens
  },
  // Headers para melhor cache e performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

export default nextConfig