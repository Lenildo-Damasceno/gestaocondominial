/**
 * app/manutencoes/page.js
 * 
 * Página de manutenções (rota: /manutencoes)
 * - Menu de acesso às manutenções programadas e recorrentes
 * - Exibe dois cards navegaveis:
 *   1. Manutenções programadas (/manutencoes/programadas)
 *   2. Manutenções recorrentes (/manutencoes/recorrentes)
 * - Permite visualizar e gerenciar serviços de manutenção
 */

import Link from 'next/link'
import AdminShell from '@/views/components/admin-shell'

export default function ManutencoesPage() {
  return (
    <AdminShell
      title="Manutenções"
      subtitle="Acesse as manutenções programadas e os serviços recorrentes do seu portfólio."
      currentPath="/manutencoes"
    >
      <section className="grid gap-6 md:grid-cols-2">
        <Link
          href="/manutencoes/programadas"
          className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 text-left shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition hover:-translate-y-1"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-strong)]">
            Programadas
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--panel-strong)]">
            Manutenções agendadas
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Veja os serviços que já têm data definida para execução nos condomínios da sua carteira.
          </p>
        </Link>

        <Link
          href="/manutencoes/recorrentes"
          className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 text-left shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition hover:-translate-y-1"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-strong)]">
            Recorrentes
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--panel-strong)]">
            Serviços periódicos
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Acompanhe as manutenções repetitivas e garanta que as rotinas do condomínio estejam sempre em dia.
          </p>
        </Link>
      </section>
    </AdminShell>
  )
}
