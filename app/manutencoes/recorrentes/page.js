'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin-shell'
import { formatarData, listarCondominios } from '@/lib/condominios'

const STATUS_ALERTA = ['Não realizada', 'Pendente', 'Atrasada']

export default function ManutencoesRecorrentesPage() {
  const [agrupado, setAgrupado] = useState({})

  useEffect(() => {
    const todas = listarCondominios().flatMap((c) =>
      c.manutencoes.map((m) => ({ ...m, condominio: c.nome }))
    )
    const mapa = {}
    todas.forEach((m) => {
      if (!mapa[m.frequencia]) mapa[m.frequencia] = []
      mapa[m.frequencia].push(m)
    })
    setAgrupado(mapa)
  }, [])

  const statusClass = (status) =>
    STATUS_ALERTA.includes(status)
      ? 'bg-red-100 text-red-700'
      : status === 'Concluída'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'Agendada'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-cyan-100 text-cyan-700'

  const entradas = Object.entries(agrupado)

  return (
    <AdminShell
      title="Manutenções recorrentes"
      subtitle="Rotinas periódicas agrupadas por frequência em todos os condomínios."
      currentPath="/manutencoes/recorrentes"
    >
      <section className="grid gap-6">
        {entradas.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-semibold text-[var(--panel-strong)]">Nenhuma manutenção recorrente</p>
            <p className="mt-3 text-sm text-[var(--muted)]">Adicione manutenções periódicas nos condomínios.</p>
          </div>
        ) : (
          entradas.map(([frequencia, itens]) => (
            <div key={frequencia} className="rounded-[1.75rem] border border-slate-200/80 bg-[var(--soft)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[var(--ink)]">{frequencia}</h2>
                <span className="text-sm text-[var(--muted)]">{itens.length} item(ns)</span>
              </div>
              <div className="mt-4 space-y-3">
                {itens.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white px-4 py-4 ring-1 ring-black/5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                        <p className="text-sm text-[var(--muted)]">{item.condominio}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                      {item.responsavel && <p>Responsável: {item.responsavel}</p>}
                      <p>{item.proximaData ? `Próxima: ${formatarData(item.proximaData)}` : 'Sem data'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </AdminShell>
  )
}
