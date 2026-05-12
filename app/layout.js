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

export const metadata = {
  title: 'ES Gestão Condominial',
  description: 'Sistema de gestão condominial ES Gestão Condominial',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">

        {/* Cabeçalho */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/8 bg-[#04101d]/90 px-5 py-3 backdrop-blur">
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
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 22V9l11-7 11 7v13H15v-7h-6v7H1z"/>
            </svg>
            Início
          </Link>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 pb-14 sm:pb-0">
          {children}
        </main>

        {/* Rodapé desktop */}
        <footer className="hidden sm:flex items-center justify-between border-t border-white/8 bg-[#04101d] px-6 py-4 text-xs text-white/30">
          <span>© {new Date().getFullYear()} ES Gestão Condominial</span>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/40 transition hover:text-white/70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 22V9l11-7 11 7v13H15v-7h-6v7H1z"/>
            </svg>
            Início
          </Link>
        </footer>

        {/* Rodapé mobile fixo */}
        <footer className="fixed bottom-0 inset-x-0 z-[9999] flex sm:hidden items-center justify-around border-t border-white/10 bg-[#04101d] px-2 py-1">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-white/60 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M1 22V9l11-7 11 7v13H15v-7h-6v7H1z"/></svg>
            <span className="text-[10px] font-semibold">Início</span>
          </Link>
          <Link href="/condominios" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-white/60 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zm-8 4H7v-2h2v2zm0-4H7V9h2v2zm0-4H7V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2z"/></svg>
            <span className="text-[10px] font-semibold">Condomínios</span>
          </Link>
          <Link href="/configuracoes" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-white/60 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.01 7.01 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.47.47 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
            <span className="text-[10px] font-semibold">Config.</span>
          </Link>
        </footer>

      </body>
    </html>
  )
}
