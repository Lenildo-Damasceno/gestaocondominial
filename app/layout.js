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

import './globals.css'
import Link from 'next/link'
import MobileFooterNav from '@/components/mobile-footer-nav'

export const metadata = {
  title: 'ES Gestão Condominial',
  description: 'Sistema de gestão condominial ES Gestão Condominial',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">

        {/* Cabeçalho */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/8 bg-[#04101d]/90 px-4 py-3 backdrop-blur print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f52ff] to-[#22d3ee]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 22V9l11-7 11 7v13H15v-7h-6v7H1z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">ES Gestão Condominial</span>
          </div>
          <Link
            href="/dashboard"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#0f52ff] to-[#22d3ee] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 active:scale-95 sm:inline-flex"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 22V9l11-7 11 7v13H15v-7h-6v7H1z"/>
            </svg>
            <span>Início</span>
          </Link>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 pb-12 sm:pb-0">
          {children}
        </main>

        {/* Rodapé desktop */}
        <footer className="hidden sm:flex items-center justify-between border-t border-white/8 bg-[#04101d] px-6 py-4 text-xs text-white/30">
          <span>© {new Date().getFullYear()} ES Gestão Condominial</span>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 22V9l11-7 11 7v13H15v-7h-6v7H1z"/>
            </svg>
            Voltar ao Início
          </Link>
        </footer>

        <MobileFooterNav />

      </body>
    </html>
  )
}
