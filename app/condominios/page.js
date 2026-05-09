/**
 * app/condominios/page.js
 * 
 * Lista de condomínios (rota: /condominios)
 * - Exibe todos os condomínios cadastrados em cards coloridos (gradientes)
 * - Permite visualizar detalhes (link para /condominios/[slug])
 * - Funcionalidade de exclusão com confirmação de usuário
 * - Exclusão afeta apenas localStorage do navegador
 * - Cards com informações: nome, cidade, síndico, unidades
 * - Botões: "Ver detalhes" e ícone de exclusão
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-shell'
import {
  excluirCondominio,
  formatarData,
  listarCondominios,
} from '@/lib/condominios'

export default function CondominiosPage() {
  const [excluindo, setExcluindo] = useState('')
  const [condominios, setCondominios] = useState([])

  useEffect(() => {
    setCondominios(listarCondominios())
  }, [])

  function recarregar() {
    setCondominios(listarCondominios())
  }

  function removerCondominio(slug, nome) {
    const confirmado = window.confirm(
      `Deseja realmente excluir o condominio "${nome}"? Esta acao remove o cadastro salvo neste navegador.`
    )

    if (!confirmado) {
      return
    }

    setExcluindo(slug)
    excluirCondominio(slug)
    recarregar()
    setExcluindo('')
  }

  return (
    <AdminShell
      title="Condominios"
      subtitle="Escolha abaixo o condominio que voce quer abrir. Cada bloco leva direto para a pagina daquele condominio."
      currentPath="/condominios"
    >
      <section className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-strong)]">
              Sua carteira
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--panel-strong)] sm:text-3xl">
              Selecione um condominio
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Toque ou clique no quadrado do condominio para entrar e ver somente as contas, manutencoes e avisos dele.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-[var(--soft)] px-4 py-2 text-sm font-semibold text-[var(--ink)] ring-1 ring-slate-200">
            {condominios.length} condominio(s)
          </span>
        </div>

        <div className="mt-8">
          {condominios.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-[var(--line)] bg-[var(--soft)] px-6 py-12 text-center">
              <p className="text-lg font-semibold text-[var(--panel-strong)]">
                Nenhum condominio cadastrado
              </p>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Cadastre um novo condominio no bloco do rodape desta pagina.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {condominios.map((condominio) => {
                const proximaManutencao = condominio.manutencoes.find((item) => item.proximaData)

                return (
                  <Link
                    key={condominio.id}
                    href={`/condominios/${condominio.slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#1e3a5f,#1a5276)] p-4 shadow-[0_4px_20px_rgba(26,82,118,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(26,82,118,0.4)] cursor-pointer block"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-100">
                        {condominio.unidades} und
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); removerCondominio(condominio.slug, condominio.nome) }}
                        disabled={excluindo === condominio.slug}
                        className="text-[11px] font-semibold text-red-300 transition hover:text-red-200 disabled:opacity-50"
                      >
                        {excluindo === condominio.slug ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>

                    <h3 className="mt-3 text-base font-semibold leading-snug text-white transition group-hover:text-blue-200">
                      {condominio.nome}
                    </h3>

                    <div className="mt-2 space-y-0.5 text-xs text-blue-200/70">
                      <p>{condominio.cidade}</p>
                      <p>Síndico: {condominio.sindico}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-xs text-blue-200/60">
                        {proximaManutencao
                          ? formatarData(proximaManutencao.proximaData)
                          : 'Sem manutenção'}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                        Abrir →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(15,82,255,0.1),rgba(34,211,238,0.08),rgba(249,115,22,0.08))] p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-strong)]">
              Cadastro
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--panel-strong)]">
              Cadastrar condominio novo
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Se entrou um novo cliente na sua administracao, use este botao para criar mais um condominio na lista acima.
            </p>
          </div>

          <Link
            href="/condominios/novo"
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--panel-strong)] px-6 py-4 text-sm font-semibold text-white transition hover:brightness-110 sm:w-auto"
          >
            Cadastrar condominio
          </Link>
        </div>
      </section>
    </AdminShell>
  )
}
