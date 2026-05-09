'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/admin-shell'
import { formatarData, listarCondominios } from '@/lib/condominios'

export default function ManutencoesProgramadasPage() {
  const [manutencoes, setManutencoes] = useState([])

  useEffect(() => {
    const dados = listarCondominios()
      .flatMap((c) => c.manutencoes.map((m) => ({ ...m, condominio: c.nome })))
      .filter((m) => m.status === 'Programada' || m.status === 'Agendada')
    setManutencoes(dados)
  }, [])

  const statusClass = (status) =>
    status === 'Agendada' ? 'bg-blue-100 text-blue-700' : 'bg-cyan-100 text-cyan-700'

  return (
    <AdminShell
      title="Manutenções programadas"
      subtitle="Serviços com data ou agendamento confirmado no seu portfólio."
      currentPath="/manutencoes/programadas"
    >
      <section className="grid gap-4">
        {manutencoes.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-semibold text-[var(--panel-strong)]">Nenhuma manutenção programada</p>
            <p className="mt-3 text-sm text-[var(--muted)]">Cadastre manutenções nos condomínios para que apareçam aqui.</p>
          </div>
        ) : (
          manutencoes.map((item) => (
            <article key={item.id} className="rounded-[1.75rem] border border-slate-200/80 bg-[var(--soft)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--ink)]">{item.titulo}</p>
                  <p className="text-sm text-[var(--muted)]">{item.condominio}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusClass(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <p>Frequência: {item.frequencia}</p>
                <p>Próxima data: {item.proximaData ? formatarData(item.proximaData) : 'Não definida'}</p>
                {item.responsavel && <p>Responsável: {item.responsavel}</p>}
              </div>
            </article>
          ))
        )}
      </section>
    </AdminShell>
  )
}
