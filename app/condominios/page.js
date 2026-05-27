'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/views/components/admin-shell'
import { excluirCondominio, listarCondominios } from '@/controllers/condominio'

const coresCondominio = [
  'bg-[#12365d] hover:bg-[#0f2f52]',
  'bg-[#0f766e] hover:bg-[#115e59]',
  'bg-[#7c2d12] hover:bg-[#6b2810]',
  'bg-[#4338ca] hover:bg-[#3730a3]',
  'bg-[#9f1239] hover:bg-[#881337]',
]

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
      subtitle="Escolha abaixo o condominio que voce quer abrir."
      currentPath="/condominios"
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Sua carteira
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--panel-strong)]">
              Selecione um condominio
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[var(--ink)]">
            {condominios.length}
          </span>
        </div>

        <div className="mt-5">
          {condominios.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--soft)] px-4 py-8 text-center">
              <p className="text-sm font-semibold text-[var(--panel-strong)]">
                Nenhum condominio cadastrado
              </p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {condominios.map((condominio, index) => (
                <Link
                  key={condominio.id}
                  href={`/condominios/${condominio.slug}`}
                  className={`flex min-h-10 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] ${coresCondominio[index % coresCondominio.length]}`}
                >
                  <span className="min-w-0 truncate">{condominio.nome}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      removerCondominio(condominio.slug, condominio.nome)
                    }}
                    disabled={excluindo === condominio.slug}
                    className="shrink-0 rounded-lg bg-white/12 px-2 py-1 text-[11px] font-semibold text-white/75 transition hover:bg-white/18 hover:text-white disabled:opacity-50"
                  >
                    {excluindo === condominio.slug ? '...' : 'Excluir'}
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Cadastro
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--panel-strong)]">
              Cadastrar condominio novo
            </h2>
          </div>

          <Link
            href="/condominios/novo"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--panel-strong)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 sm:w-auto"
          >
            Cadastrar condominio
          </Link>
        </div>
      </section>
    </AdminShell>
  )
}
