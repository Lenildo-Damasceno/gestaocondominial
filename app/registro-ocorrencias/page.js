'use client'

/**
 * app/registro-ocorrencias/page.js
 * 
 * Página de registro de ocorrências (rota: /registro-ocorrencias)
 * - Documenta problemas, defeitos e chamados nos condomínios
 * - Acompanha status de atendimento (Aberto, Em atendimento, Resolvido)
 * - Exibe ocorrências agrupadas por condomínio
 * - Interface para criar novo chamado e filtrar por status
 */

import { useState } from 'react'
import AdminShell from '@/views/components/admin-shell'
import { Checkbox } from '@/views/components/ui'

const ocorrencias = [
  {
    id: 'oc1',
    titulo: 'Vazamento no hall de entrada',
    condominio: 'Condominio Vista Parque',
    status: 'Em atendimento',
  },
  {
    id: 'oc2',
    titulo: 'Portão elétrico com falha',
    condominio: 'Condominio Jardins do Lago',
    status: 'Aguardando vistoria',
  },
]

export default function RegistroOcorrenciasPage() {
  const [selecionados, setSelecionados] = useState([])

  const toggleTodos = () => {
    if (selecionados.length === ocorrencias.length) {
      setSelecionados([])
    } else {
      setSelecionados(ocorrencias.map(o => o.id))
    }
  }

  const toggleItem = (id) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleImprimir = () => {
    if (selecionados.length === 0) {
      alert('Selecione pelo menos uma ocorrência para imprimir.')
      return
    }
    window.print()
  }

  return (
    <AdminShell
      title="Registro de ocorrências"
      subtitle="Documente problemas e acompanhe os chamados em aberto no sistema."
      currentPath="/registro-ocorrencias"
      headerActions={
        <button 
          onClick={handleImprimir}
          className="inline-flex rounded-full bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 hover:scale-105 active:scale-95 print:hidden"
        >
          🖨️ Imprimir selecionados ({selecionados.length})
        </button>
      }
    >
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-strong)]">
                Chamados
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--panel-strong)]">
                Ocorrências ativas
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Registre eventos operacionais, problemas de manutenção e comunique a equipe responsável.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end print:hidden">
              <button className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:brightness-95 hover:scale-105 active:scale-95">
                Nova ocorrência
              </button>
              <Checkbox 
                label="Selecionar todos" 
                checked={selecionados.length === ocorrencias.length && ocorrencias.length > 0} 
                onChange={toggleTodos}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {ocorrencias.map((item) => {
              const isSelecionado = selecionados.includes(item.id)
              return (
              <article
                key={item.id}
                className={`rounded-[1.75rem] border p-5 transition-all ${
                  isSelecionado ? 'border-[var(--accent)] bg-cyan-50/30' : 'border-slate-200/80 bg-[var(--soft)]'
                } ${!isSelecionado ? 'print:hidden' : ''}`}
              >
                <div className="flex gap-4 items-start">
                  <div className="print:hidden mt-1">
                    <Checkbox 
                      checked={isSelecionado} 
                      onChange={() => toggleItem(item.id)}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[var(--ink)]">{item.titulo}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.condominio}</p>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
                    {item.status}
                  </span>
                </div>
                </div>
              </article>
              )
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-cyan-200/50 bg-cyan-50/80 p-6 shadow-[0_18px_50px_rgba(34,211,238,0.12)] print:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">
            Onde usar
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--accent-strong)]">
            Registre ocorrências diretamente do menu quando precisar documentar um incidente, recorrência ou demanda de manutenção urgente.
          </p>
        </div>
      </section>
    </AdminShell>
  )
}
