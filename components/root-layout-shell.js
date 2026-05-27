'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import MobileFooterNav from '@/components/mobile-footer-nav'

export default function RootLayoutShell({ children }) {
  const pathname = usePathname()
  
  // Se está em uma rota de login, não renderiza header/footer
  const isLoginPage = pathname === '/' || pathname.startsWith('/(login)')
  
  if (isLoginPage) {
    return (
      <body className="min-h-full flex flex-col">
        <main className="flex-1 pb-12 sm:pb-0">
          {children}
        </main>
      </body>
    )
  }

  return (
    <body className="min-h-full flex flex-col">
      
      {/* Cabeçalho */}
      <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b border-white/8 bg-[#04101d]/90 px-4 backdrop-blur print:hidden">
        <div className="flex h-full items-center gap-4 ml-2 overflow-hidden py-1">
          <img src="/assets/logo_es.png" alt="ES Gestão Condominial" className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          <span className="text-lg font-bold tracking-wide text-white hidden sm:inline-block drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">ES Gestão Condominial</span>
        </div>
        <Link
          href="/dashboard"
          className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#0f52ff] to-[#22d3ee] px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 active:scale-95 sm:inline-flex mr-12"
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
      <footer className="hidden sm:flex h-8 items-center justify-between border-t border-white/8 bg-[#04101d] px-6 text-xs text-white/30">
        <span>© {new Date().getFullYear()} ES Gestão Condominial</span>
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 transition hover:bg-white/20 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 22V9l11-7 11 7v13H15v-7h-6v7H1z"/>
          </svg>
          Voltar ao Início
        </Link>
      </footer>

      <MobileFooterNav />
    </body>
  )
}
