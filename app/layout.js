/**
 * app/layout.js
 * 
 * Layout raiz do Next.js (aplicado a todas as páginas)
 * - Define estrutura HTML, meta tags e título global
 * - Implementa header sticky com branding e botão "Início"
 * - Implementa footer com descrição do sistema
 * - Aplica tema escuro (#04101d) com acentos em ciano
 * - Estrutura: <header> -> <main> -> <footer>
 */

import Link from 'next/link'
import './globals.css'

export const metadata = {
  title: 'ES Gestão Condominial',
  description: 'Sistema de gestão condominial ES Gestão Condominial',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a3a5c] shadow-[0_2px_16px_rgba(26,58,92,0.3)]" role="banner">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div>
                <Link
                  href="/dashboard"
                  className="text-base font-semibold tracking-tight text-white transition hover:text-blue-100"
                >
                  ES Gestão Condominial
                </Link>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mt-0.5">
                  Painel administrativo
                </p>
              </div>

              <Link
                href="/dashboard"
                aria-label="Ir para a página inicial"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white/90 transition hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                Início
              </Link>
            </div>
          </header>

          <main className="flex-1" aria-label="Conteúdo principal">{children}</main>

          <footer className="border-t border-cyan-400/15 bg-[#04101d]">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-1 px-4 py-5 text-sm text-white/60 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <p className="font-medium text-white/80">ES Gestão Condominial</p>
              <p>© {new Date().getFullYear()} ES Gestão Condominial. Todos os direitos reservados.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
