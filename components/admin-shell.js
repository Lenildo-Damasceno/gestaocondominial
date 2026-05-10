/**
 * components/admin-shell.js
 * 
 * Componente wrapper/layout reutilizável para páginas administrativas
 * - Exibe header com título, subtítulo e ações customizadas
 * - Navbar lateral com itens navegáveis (Dashboard, Condomínios, Configurações)
 * - Barra de usuário com email e botão de logout
 * - Gerencia autenticação Supabase e logout do usuário
 * - Recebe props: title, subtitle, currentPath, children, sidebar, headerActions
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from '@/lib/useAuth'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    helper: 'Tela inicial',
    badge: '01',
  },
  {
    href: '/condominios',
    label: 'Condomínios',
    helper: 'Selecione um condomínio',
    badge: '02',
  },
  {
    href: '/configuracoes',
    label: 'Configurações',
    helper: 'Gerenciar usuários',
    badge: '03',
  },
]

export default function AdminShell({
  title,
  subtitle,
  currentPath,
  children,
  sidebar,
  headerActions,
}) {
  const { user, carregando } = useSession()
  const [saindo, setSaindo] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  const email = user?.email || ''

  useEffect(() => {
    if (!carregando && !user) window.location.href = '/'
  }, [user, carregando])

  async function sair() {
    setSaindo(true)
    await signOut()
    window.location.href = '/'
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4">
        <p className="text-sm font-medium text-[var(--muted)]">Carregando painel...</p>
      </main>
    )
  }

  function navClass(path) {
    return currentPath === path
      ? 'bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] text-white shadow-[0_18px_35px_rgba(14,165,233,0.25)]'
      : 'rounded-[1.5rem] border border-white/12 bg-white/10 text-white/82 hover:bg-white/16'
  }

  const sidebarContent = sidebar || (
    <>
      <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[var(--accent)]">Você está em</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">
          {navItems.find((i) => i.href === currentPath)?.label || 'Painel'}
        </h2>
        <p className="mt-2 text-xs text-white/60">
          {navItems.find((i) => i.href === currentPath)?.helper || 'Navegue pelo menu abaixo'}
        </p>
      </div>

      <nav aria-label="Menu principal" className="mt-5 grid gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={currentPath === item.href ? 'page' : undefined}
            className={`${navClass(item.href)} group px-4 py-3 transition`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-inherit/70 hidden sm:block">{item.helper}</p>
              </div>
              <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">
                {item.badge}
              </span>
            </div>
          </Link>
        ))}
      </nav>

    </>
  )

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#04101d] px-3 py-3 sm:px-4 sm:py-4">

      {/* Orbs de fundo */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#0f52ff]/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#22d3ee]/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0f52ff]/10 blur-[100px]" />
      </div>

      {/* Grid sutil */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      />

      <div className="relative z-10">

        {/* Botão 3 pontinhos mobile */}
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          className="fixed bottom-5 right-5 z-50 flex lg:hidden h-12 w-12 flex-col items-center justify-center gap-1 rounded-full bg-[#1a3a5c] shadow-[0_4px_20px_rgba(26,58,92,0.5)] transition hover:bg-[#1e4a72]"
          aria-label="Abrir menu"
        >
          <span className="h-1 w-1 rounded-full bg-white" />
          <span className="h-1 w-1 rounded-full bg-white" />
          <span className="h-1 w-1 rounded-full bg-white" />
        </button>

        {/* Overlay */}
        {menuAberto && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMenuAberto(false)}
          />
        )}

        {/* Drawer mobile */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex h-full flex-col overflow-y-auto rounded-r-[2rem] border-r border-white/10 bg-[linear-gradient(180deg,rgba(11,24,44,0.98),rgba(11,20,36,0.95))] p-5 text-white shadow-[4px_0_40px_rgba(2,6,23,0.5)]">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-white/80">Menu</p>
              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                className="rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            {sidebarContent}
            <div className="mt-4 rounded-[1.3rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(168,85,247,0.16))] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Administrador</p>
              <p className="mt-3 break-all text-sm font-medium text-white/88">{email}</p>
              <button
                type="button"
                onClick={sair}
                disabled={saindo}
                className="mt-4 w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-[var(--panel-strong)] transition hover:brightness-95 disabled:opacity-50"
              >
                {saindo ? 'Saindo...' : 'Sair do sistema'}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1600px] flex-col gap-4 lg:flex-row">
          <aside className="hidden lg:block lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-[300px] lg:flex-none">
            <div className="flex h-full min-h-0 flex-col overflow-hidden overflow-y-auto max-h-[calc(100vh-3.5rem)] rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,24,44,0.96),rgba(11,20,36,0.92))] p-4 text-white shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur sm:p-5">
              {sidebarContent}
              <div className="mt-4 rounded-[1.3rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(168,85,247,0.16))] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Administrador</p>
                <p className="mt-3 break-all text-sm font-medium text-white/88">{email}</p>
                <button
                  type="button"
                  onClick={sair}
                  disabled={saindo}
                  className="mt-4 w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-[var(--panel-strong)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saindo ? 'Saindo...' : 'Sair do sistema'}
                </button>
              </div>
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="rounded-[2rem] border border-white/10 bg-white/88 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur">
              <header className="relative overflow-hidden rounded-t-[2rem] border-b border-slate-300/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(228,241,255,0.96),rgba(213,233,255,0.94))] p-6 sm:p-8">
                <div className="absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full bg-cyan-300/25 blur-3xl" />
                <div className="absolute bottom-[-30px] left-[28%] h-32 w-32 rounded-full bg-orange-300/25 blur-3xl" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-4xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#0f52ff]">Painel administrativo</p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--panel-strong)] sm:text-4xl">{title}</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">{subtitle}</p>
                  </div>
                  {headerActions ? (
                    <div className="flex flex-wrap gap-3 lg:justify-end">{headerActions}</div>
                  ) : null}
                </div>
              </header>
              <div className="p-3 sm:p-4 lg:p-6">{children}</div>
            </div>
          </section>
        </div>

      </div>
    </main>
  )
}
