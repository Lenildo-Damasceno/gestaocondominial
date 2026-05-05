'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    helper: 'Visao geral',
    badge: '01',
  },
  {
    href: '/condominios',
    label: 'Condominios',
    helper: 'Selecionar e gerenciar',
    badge: '02',
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
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    let ativo = true

    async function carregarSessao() {
      if (!supabase) {
        window.location.href = '/'
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!ativo) {
        return
      }

      if (!session) {
        window.location.href = '/'
        return
      }

      setEmail(session.user.email || '')
      setCarregando(false)
    }

    carregarSessao()

    return () => {
      ativo = false
    }
  }, [])

  async function sair() {
    if (!supabase) {
      window.location.href = '/'
      return
    }

    setSaindo(true)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4">
        <p className="text-sm font-medium text-[var(--muted)]">
          Carregando painel...
        </p>
      </main>
    )
  }

  function navClass(path) {
    return currentPath === path
      ? 'bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] text-white shadow-[0_18px_35px_rgba(14,165,233,0.25)]'
      : 'bg-white/10 text-white/82 ring-1 ring-white/12 hover:bg-white/16'
  }

  const sidebarContent = sidebar || (
    <>
      <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[var(--accent)]">
          Gestao central
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          Seu painel
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/68">
          Controle sua carteira de condominios com uma navegacao fixa e foco na operacao.
        </p>
      </div>

      <nav className="mt-4 grid gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group rounded-[1rem] px-3.5 py-3 transition ${navClass(item.href)}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-inherit/70">{item.helper}</p>
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.22),_transparent_28%),linear-gradient(135deg,_#041324_0%,_#0c1f35_48%,_#111a32_100%)] px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1600px] flex-col gap-4 lg:flex-row">
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-[280px] lg:flex-none">
          <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,24,44,0.96),rgba(11,20,36,0.92))] p-5 text-white shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur">
            {sidebarContent}

            <div className="mt-4 rounded-[1.3rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(168,85,247,0.16))] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200">
                Administrador
              </p>
              <p className="mt-3 break-all text-sm font-medium text-white/88">
                {email}
              </p>
              <button
                type="button"
                onClick={sair}
                disabled={saindo}
                className="mt-4 w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-[var(--panel-strong)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saindo ? 'Saindo...' : 'Sair do sistema'}
              </button>
            </div>

            <div className="mt-auto rounded-[1.3rem] border border-white/8 bg-white/6 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-fuchsia-200">
                Operacao
              </p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                Use a aba de condominios para escolher um condominio especifico e acompanhar somente aquela rotina.
              </p>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#0f52ff]">
                    Painel administrativo
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--panel-strong)] sm:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                    {subtitle}
                  </p>
                </div>

                {headerActions ? (
                  <div className="flex flex-wrap gap-3 lg:justify-end">
                    {headerActions}
                  </div>
                ) : null}
              </div>
            </header>

            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  )
}
