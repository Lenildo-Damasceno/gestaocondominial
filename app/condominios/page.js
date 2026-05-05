'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-shell'
import {
  excluirCondominio,
  formatarData,
  listarCondominios,
} from '@/lib/condominios'

export default function CondominiosPage() {
  const [excluindo, setExcluindo] = useState('')
  const [, setVersao] = useState(0)

  const condominios = listarCondominios()

  function removerCondominio(slug, nome) {
    const confirmado = window.confirm(
      `Deseja realmente excluir o condominio "${nome}"? Esta acao remove o cadastro salvo neste navegador.`
    )

    if (!confirmado) {
      return
    }

    setExcluindo(slug)
    excluirCondominio(slug)
    setVersao((atual) => atual + 1)
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
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {condominios.map((condominio) => {
                const proximaManutencao = condominio.manutencoes.find(
                  (item) => item.proximaData
                )

                return (
                  <article
                    key={condominio.id}
                    className="group flex min-h-[290px] flex-col justify-between rounded-[2rem] border border-cyan-100 bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(236,248,255,0.95))] p-6 shadow-[0_20px_50px_rgba(14,165,233,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(14,165,233,0.16)]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
                          {condominio.unidades} und
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            removerCondominio(condominio.slug, condominio.nome)
                          }
                          disabled={excluindo === condominio.slug}
                          className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {excluindo === condominio.slug ? 'Excluindo' : 'Excluir'}
                        </button>
                      </div>

                      <Link
                        href={`/condominios/${condominio.slug}`}
                        className="mt-6 block rounded-[1.5rem] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] px-5 py-10 text-white shadow-[0_20px_45px_rgba(15,82,255,0.28)] transition hover:brightness-105"
                      >
                        <p className="text-sm uppercase tracking-[0.32em] text-white/70">
                          Abrir condominio
                        </p>
                        <h3 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
                          {condominio.nome}
                        </h3>
                      </Link>

                      <div className="mt-5 space-y-2 text-sm text-[var(--muted)]">
                        <p>{condominio.cidade}</p>
                        <p>Sindico: {condominio.sindico}</p>
                        <p>{condominio.contas.length} contas cadastradas</p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[1.4rem] border border-slate-200/80 bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                        Proxima manutencao
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                        {proximaManutencao
                          ? `${proximaManutencao.titulo} em ${formatarData(proximaManutencao.proximaData)}`
                          : 'Nenhuma data definida ainda.'}
                      </p>
                    </div>
                  </article>
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
