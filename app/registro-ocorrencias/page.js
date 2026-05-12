/**
 * app/registro-ocorrencias/page.js
 * 
 * Página de registro de ocorrências (rota: /registro-ocorrencias)
 * - Documenta problemas, defeitos e chamados nos condomínios
 * - Acompanha status de atendimento (Aberto, Em atendimento, Resolvido)
 * - Exibe ocorrências agrupadas por condomínio
 * - Interface para criar novo chamado e filtrar por status
 */

import AdminShell from '@/views/components/admin-shell'

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
  return (
    <AdminShell
      title="Registro de ocorrências"
      subtitle="Documente problemas e acompanhe os chamados em aberto no sistema."
      currentPath="/registro-ocorrencias"
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
            <button className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:brightness-95">
              Nova ocorrência
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {ocorrencias.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.75rem] border border-slate-200/80 bg-[var(--soft)] p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[var(--ink)]">{item.titulo}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.condominio}</p>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-cyan-200/50 bg-cyan-50/80 p-6 shadow-[0_18px_50px_rgba(34,211,238,0.12)]">
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
