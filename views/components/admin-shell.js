'use client'

/**
 * views/components/admin-shell.js
 * VIEW — Layout wrapper reutilizável para páginas administrativas
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from '@/controllers/auth'
import { supabaseConfigError } from '@/models/supabase'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', helper: 'Tela inicial', badge: '01' },
  { href: '/condominios', label: 'Condomínios', helper: 'Selecione um condomínio', badge: '02' },
  { href: '/documentos', label: 'Documentos', helper: 'Atas e contratos', badge: '03' },
  { href: '/configuracoes', label: 'Configurações', helper: 'Gerenciar usuários', badge: '04' },
]

export default function AdminShell({ title, subtitle, currentPath, children, sidebar, headerActions }) {
  const { user, carregando } = useSession()
  const [saindo, setSaindo] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  const email = user?.email || ''

  useEffect(() => {
    if (supabaseConfigError) return
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
      ? 'rounded-2xl bg-[linear-gradient(135deg,#0f52ff,#22d3ee)] text-white shadow-[0_18px_35px_rgba(14,165,233,0.25)] lg:bg-white lg:text-[var(--panel-strong)] lg:shadow-none'
      : 'rounded-2xl border border-white/12 bg-white/10 text-white/82 hover:bg-white/16'
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

  const userPanel = (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Administrador</p>
      <p className="mt-3 break-all text-sm font-medium text-white/88">{email}</p>
      <button
        type="button"
        onClick={sair}
        disabled={saindo}
        className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[var(--panel-strong)] transition hover:brightness-95 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saindo ? 'Saindo...' : 'Sair do sistema'}
      </button>
    </div>
  )

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-100">

      <div className="relative z-10">

        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          className="fixed bottom-20 right-4 z-[9998] flex h-11 w-11 flex-col items-center justify-center gap-1 rounded-full bg-[var(--panel-strong)] shadow-[0_10px_24px_rgba(15,23,42,0.22)] transition hover:brightness-110 hover:scale-110 active:scale-90 lg:hidden"
          aria-label="Abrir menu"
        >
          <span className="h-1 w-1 rounded-full bg-white" />
          <span className="h-1 w-1 rounded-full bg-white" />
          <span className="h-1 w-1 rounded-full bg-white" />
        </button>

        {menuAberto && (
          <div className="fixed inset-0 z-[9998] bg-black/50 lg:hidden" onClick={() => setMenuAberto(false)} />
        )}

        <div className={`fixed inset-y-0 left-0 z-[9999] w-72 transform transition-transform duration-300 lg:hidden ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-full flex-col overflow-y-auto rounded-r-2xl border-r border-white/10 bg-slate-800 p-4 text-white shadow-[4px_0_32px_rgba(2,6,23,0.35)]">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-white/80">Menu</p>
              <button type="button" onClick={() => setMenuAberto(false)} className="rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            {sidebarContent}
            {userPanel}
          </div>
        </div>

        <div className="flex min-h-screen w-full flex-col lg:flex-row items-stretch">
          <aside className="hidden lg:block lg:w-[280px] lg:flex-none bg-slate-800 print:hidden">
            <div className="sticky top-[57px] flex h-[calc(100vh-57px)] flex-col overflow-y-auto p-4 text-white sm:p-5">
              {sidebarContent}
              {userPanel}
            </div>
          </aside>

          <section className="min-w-0 flex-1 bg-white">
            <div className="min-h-screen border-l border-slate-200 bg-white print:border-none">
              <header className="relative overflow-hidden border-b border-slate-200 bg-white p-4 sm:p-6 print:hidden">
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-4xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">Painel administrativo</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--panel-strong)] sm:text-3xl">{title}</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
                  </div>
                  {headerActions ? <div className="flex flex-wrap gap-3 lg:justify-end">{headerActions}</div> : null}
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
