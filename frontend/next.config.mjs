/**
 * next.config.mjs (Frontend)
 * 
 * Configurações do Next.js 16
 * - Otimizações CSS experimental
 * - Headers de segurança
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    unoptimized: true,
  },
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