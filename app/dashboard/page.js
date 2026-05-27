'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/views/components/admin-shell'
import DetalheModal from '@/views/components/detalhe-modal'
import { useSession } from '@/lib/useAuth'
import {
  calcularDiasParaData,
  formatarData,
  formatarMoeda,
  listarCondominios,
  normalizarConta,
  resumirUrgenciaConta,
} from '@/controllers/condominio'

export default function DashboardPage() {
  const { user } = useSession()
  const [condominios, setCondominios] = useState([])
  const [modal, setModal] = useState(null)

  useEffect(() => {
    setCondominios(listarCondominios())
  }, [])

  function abrirModal(item, tipo, slug) {
    setModal({ item, tipo, slug })
  }

  function fecharModal() {
    setModal(null)
    setCondominios(listarCondominios())
  }

  const dados = useMemo(() => {
    const todasContas = condominios.flatMap((c) =>
      c.contas.map((conta) => ({ ...normalizarConta(conta), condominio: c.nome, slug: c.slug }))
    )
    const todasManutencoes = condominios.flatMap((c) =>
      c.manutencoes.map((m) => ({ ...m, condominio: c.nome, slug: c.slug }))
    )
    const todosAvisos = condominios.flatMap((c) =>
      c.avisos.map((a) => ({ ...a, condominio: c.nome, slug: c.slug }))
    )

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const contasVencidasHoje = todasContas.filter((c) => {
      const dias = calcularDiasParaData(c.proximoVencimento || c.vencimento)
      return dias === 0 && c.status !== 'Pago'
    })

    const alertasContas = todasContas
      .filter((c) => {
        const dias = calcularDiasParaData(c.proximoVencimento || c.vencimento)
        return dias !== null && dias >= 0 && dias <= 3 && c.status !== 'Pago'
      })
      .sort((a, b) =>
        calcularDiasParaData(a.proximoVencimento || a.vencimento) -
        calcularDiasParaData(b.proximoVencimento || b.vencimento)
      )

    const alertasManutencoes = todasManutencoes
      .filter((m) => {
        if (!m.proximaData) return false
        const dias = calcularDiasParaData(m.proximaData)
        return dias !== null && dias >= 0 && dias <= 3
      })
      .sort((a, b) => calcularDiasParaData(a.proximaData) - calcularDiasParaData(b.proximaData))

    const STATUS_CRITICO = ['Não realizada', 'Pendente', 'Atrasada']
    const manutencoesAlerta = todasManutencoes.filter((m) => STATUS_CRITICO.includes(m.status))

    const proximasContas = [...todasContas]
      .filter((c) => c.status !== 'Pago')
      .sort((a, b) =>
        String(a.proximoVencimento || a.vencimento).localeCompare(
          String(b.proximoVencimento || b.vencimento)
        )
      )
      .slice(0, 6)

    const proximasManutencoes = [...todasManutencoes]
      .filter((m) => m.proximaData)
      .sort((a, b) => String(a.proximaData).localeCompare(String(b.proximaData)))
      .slice(0, 5)

    const avisosRecentes = [...todosAvisos]
      .sort((a, b) => String(b.data).localeCompare(String(a.data)))
      .slice(0, 4)

    const condominiosComPendencias = condominios.map((c) => {
      const contasPendentes = c.contas.filter((ct) => ct.status !== 'Pago').length
      const manutencoesCriticas = c.manutencoes.filter((m) => STATUS_CRITICO.includes(m.status)).length
      return { ...c, contasPendentes, manutencoesCriticas }
    })

    return {
      totalCondominios: condominios.length,
      totalUnidades: condominios.reduce((acc, c) => acc + (c.unidades || 0), 0),
      contasVencidasHoje: contasVencidasHoje.length,
      manutencoesAtrasadas: manutencoesAlerta.length,
      alertasContas,
      alertasManutencoes,
      proximasContas,
      proximasManutencoes,
      manutencoesAlerta,
      avisosRecentes,
      condominiosComPendencias,
    }
  }, [condominios])

  const temAlertas = dados.alertasContas.length > 0 || dados.alertasManutencoes.length > 0

  return (
    <>
    <AdminShell
      title="Dashboard"
      subtitle="Visão geral da sua carteira de condomínios."
      currentPath="/dashboard"
    >
      <div className="space-y-3">

        {/* Boas-vindas */}
        {user && (
          <div className="text-sm font-medium text-[var(--muted)]">
            Bem-vindo, <span className="text-[var(--ink)] font-semibold">{user.email?.split('@')[0] || user.email}</span>
          </div>
        )}

        {/* Alertas críticos */}
        {temAlertas && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-red-700">🚨 Atenção — próximos 3 dias</p>
            {dados.alertasContas.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-red-500 mb-1">Contas</p>
                {dados.alertasContas.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-red-900 truncate mr-2">
                      {a.titulo} <span className="font-normal text-red-600">— {a.condominio}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-red-200 px-2 py-0.5 text-xs font-bold text-red-800">
                      {calcularDiasParaData(a.proximoVencimento || a.vencimento) === 0 ? 'Hoje' : `${calcularDiasParaData(a.proximoVencimento || a.vencimento)} dia(s)`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {dados.alertasManutencoes.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 mb-1">Manutenções</p>
                {dados.alertasManutencoes.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-amber-900 truncate mr-2">
                      {m.titulo} <span className="font-normal text-amber-700">— {m.condominio}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800">
                      {calcularDiasParaData(m.proximaData) === 0 ? 'Hoje' : `${calcularDiasParaData(m.proximaData)} dia(s)`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard label="Condomínios" value={dados.totalCondominios} helper="Na sua carteira" tone="blue" />
          <MetricCard label="Unidades" value={dados.totalUnidades} helper="Total administrado" tone="cyan" />
          <MetricCard label="Vencem hoje" value={dados.contasVencidasHoje} helper="Contas para pagar" tone={dados.contasVencidasHoje > 0 ? 'red' : 'green'} />
          <MetricCard label="Manutenções críticas" value={dados.manutencoesAtrasadas} helper="Pendentes ou atrasadas" tone={dados.manutencoesAtrasadas > 0 ? 'amber' : 'green'} />
        </div>

        {/* Condomínios — acesso rápido */}
        <section className="rounded-2xl border border-black/5 bg-white/85 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[var(--ink)]">Seus condomínios</h2>
            <Link href="/condominios" className="text-xs font-semibold text-[var(--accent-strong)] hover:underline">Ver todos →</Link>
          </div>
          {dados.condominiosComPendencias.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Nenhum condomínio cadastrado.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {dados.condominiosComPendencias.map((c) => (
                <Link
                  key={c.slug}
                  href={`/condominios/${c.slug}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 py-2.5 transition hover:bg-blue-50 hover:border-blue-200 active:scale-95"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--ink)] truncate">{c.nome}</p>
                    <p className="text-xs text-[var(--muted)]">{c.cidade} · {c.unidades} un.</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 ml-2">
                    {c.contasPendentes > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">{c.contasPendentes} conta{c.contasPendentes > 1 ? 's' : ''}</span>
                    )}
                    {c.manutencoesCriticas > 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">{c.manutencoesCriticas} mant.</span>
                    )}
                    {c.contasPendentes === 0 && c.manutencoesCriticas === 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">OK</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Contas próximas + Manutenções */}
        <div className="grid gap-3 xl:grid-cols-2">

          <section className="rounded-2xl border border-black/5 bg-white/85 p-4 shadow-sm">
            <h2 className="text-base font-semibold text-[var(--ink)] mb-3">Contas próximas</h2>
            {dados.proximasContas.length === 0 ? (
              <EmptyState text="Nenhuma conta pendente." />
            ) : (
              <div className="space-y-2">
                {dados.proximasContas.map((item) => {
                  const urgencia = resumirUrgenciaConta(item)
                  return (
                    <button key={item.id} onClick={() => abrirModal(item, 'conta', item.slug)} className="w-full flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 py-2 hover:bg-blue-50 hover:border-blue-200 transition text-left active:scale-95">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--ink)] truncate">{item.titulo}</p>
                        <p className="text-xs text-[var(--muted)] truncate">{item.condominio} · {formatarData(item.proximoVencimento || item.vencimento)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 ml-2">
                        <span className="text-sm font-semibold text-[var(--ink)]">{formatarMoeda(item.valor)}</span>
                        <StatusPill tone={urgencia.tone}>{urgencia.label}</StatusPill>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <div className="space-y-3">
            <section className="rounded-2xl border border-black/5 bg-white/85 p-4 shadow-sm">
              <h2 className="text-base font-semibold text-[var(--ink)] mb-3">Manutenções próximas</h2>
              {dados.proximasManutencoes.length === 0 ? (
                <EmptyState text="Nenhuma manutenção com data definida." />
              ) : (
                <div className="space-y-2">
                  {dados.proximasManutencoes.map((item) => (
                    <button key={item.id} onClick={() => abrirModal(item, 'manutencao', item.slug)} className="w-full flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 py-2 hover:bg-blue-50 hover:border-blue-200 transition text-left active:scale-95">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--ink)] truncate">{item.titulo}</p>
                        <p className="text-xs text-[var(--muted)] truncate">{item.condominio} · {formatarData(item.proximaData)}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {dados.manutencoesAlerta.length > 0 && (
              <section className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <h2 className="text-base font-semibold text-red-800 mb-3">Manutenções em alerta</h2>
                <div className="space-y-2">
                  {dados.manutencoesAlerta.slice(0, 4).map((item) => (
                    <button key={item.id} onClick={() => abrirModal(item, 'manutencao', item.slug)} className="w-full flex items-center justify-between rounded-xl border border-red-200 bg-white px-3 py-2 hover:bg-red-50 transition text-left active:scale-95">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--ink)] truncate">{item.titulo}</p>
                        <p className="text-xs text-[var(--muted)] truncate">{item.condominio}</p>
                      </div>
                      <span className="shrink-0 ml-2 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">{item.status}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Avisos recentes */}
        {dados.avisosRecentes.length > 0 && (
          <section className="rounded-2xl border border-black/5 bg-white/85 p-4 shadow-sm">
            <h2 className="text-base font-semibold text-[var(--ink)] mb-3">Avisos recentes</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {dados.avisosRecentes.map((item) => (
                <button key={item.id} onClick={() => abrirModal(item, 'aviso', item.slug)} className="w-full rounded-xl border border-[var(--line)] bg-[var(--soft)] px-3 py-2.5 hover:bg-blue-50 hover:border-blue-200 transition text-left active:scale-95">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--ink)] truncate">{item.titulo}</p>
                    <p className="shrink-0 text-xs text-[var(--muted)]">{formatarData(item.data)}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)] truncate">{item.condominio}</p>
                  <p className="mt-1 text-xs text-[var(--ink)]/70 line-clamp-2">{item.descricao}</p>
                </button>
              ))}
            </div>
          </section>
        )}

      </div>
    </AdminShell>
    {modal && <DetalheModal item={modal.item} tipo={modal.tipo} slug={modal.slug} onClose={fecharModal} onSaved={fecharModal} />}
    </>
  )
}

function MetricCard({ label, value, helper, tone }) {
  const colors = {
    blue:  'bg-blue-50 border-blue-100 text-blue-700',
    cyan:  'bg-cyan-50 border-cyan-100 text-cyan-700',
    red:   'bg-red-50 border-red-100 text-red-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  }
  return (
    <article className={`rounded-2xl border p-4 ${colors[tone] || colors.blue}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs opacity-60">{helper}</p>
    </article>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm text-[var(--muted)]">
      {text}
    </div>
  )
}

function StatusPill({ tone, children }) {
  const cls =
    tone === 'red' ? 'bg-red-100 text-red-700'
    : tone === 'amber' ? 'bg-amber-100 text-amber-700'
    : tone === 'emerald' ? 'bg-emerald-100 text-emerald-700'
    : 'bg-slate-100 text-slate-700'
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{children}</span>
}

function StatusBadge({ status }) {
  const cls =
    status === 'Concluída' || status === 'Pago' || status === 'Paga' ? 'bg-emerald-100 text-emerald-700'
    : status === 'Não realizada' || status === 'Atrasada' ? 'bg-red-100 text-red-700'
    : status === 'Pendente' ? 'bg-amber-100 text-amber-700'
    : status === 'Agendada' ? 'bg-blue-100 text-blue-700'
    : status === 'Programada' ? 'bg-cyan-100 text-cyan-700'
    : 'bg-amber-100 text-amber-700'
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>{status}</span>
}
