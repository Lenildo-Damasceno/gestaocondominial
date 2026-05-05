import Link from 'next/link'
import './globals.css'

export const metadata = {
  title: 'Gestao de Condominios',
  description: 'Sistema de acesso para administracao de condominios',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-white text-gray-900">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-cyan-400/20 bg-[#04101d] shadow-[0_10px_35px_rgba(2,8,23,0.45)]">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <Link
                  href="/dashboard"
                  className="text-lg font-semibold tracking-tight text-white"
                >
                  Gestao de Condominios
                </Link>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-100">
                  Painel administrativo
                </p>
              </div>

              <nav className="flex flex-wrap items-center gap-2">
                <Link
                  href="/dashboard"
                  className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Inicio
                </Link>
                <Link
                  href="/condominios"
                  className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  Condominios
                </Link>
                <Link
                  href="/condominios/novo"
                  className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:brightness-95"
                >
                  Novo condominio
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-cyan-400/15 bg-[#04101d]">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-5 text-sm text-white/78 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <p>Gestao de Condominios para operacao de carteira, cobrancas, manutencoes e assembleias.</p>
              <p>Padrao visual unico em todas as paginas do sistema.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
