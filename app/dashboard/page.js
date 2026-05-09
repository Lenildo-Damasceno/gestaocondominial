/**
 * app/dashboard/page.js
 * 
 * Dashboard principal do sistema (rota: /dashboard)
 * - Página protegida apenas para usuários autenticados
 * - Exibe resumo de todos os condomínios: total de unidades, contas pendentes
 * - Lista contas críticas (vencidas ou prestes a vencer) em tempo real
 * - Mostra contas da semana organizadas por urgência
 * - Usa AdminShell para layout padrão com navegação
 * - Calcula dados no cliente com useMemo para evitar hidratação
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminShell from '@/components/admin-shell'
import {
  calcularDiasParaData,
  descreverRecorrenciaConta,
  formatarData,
  formatarMoeda,
  listarCondominios,
  resumirUrgenciaConta,
  resumirDashboard,
} from '@/lib/condominios'

export default function DashboardPage() {
  const [condominios, setCondominios] = useState([])

  useEffect(() => {
    setCondominios(listarCondominios())
  }, [])

  const resumo = resumirDashboard(condominios)

  const contasDaSemana = useMemo(() => {
    const contas = condominios.flatMap((item) =>
      item.contas.map((conta) => ({
        ...conta,
        condominio: item.nome,
        slug: item.slug,
      }))
    )
    const contasComUrgencia = contas.map((item) => ({
      ...item,
      diasRestantes: calcularDiasParaData(item.vencimento),
    }))
    return contasComUrgencia.filter((item) => item.diasRestantes >= 0 && item.diasRestantes <= 7 && item.status !== 'Pago').length
  }, [condominios])

  const alertas = useMemo(() => {
    const lista = []
    condominios.forEach((cond) => {
      cond.contas.forEach((conta) => {
        const dias = calcularDiasParaData(conta.vencimento)
        if (dias !== null && dias >= 0 && dias <= 3 && conta.status !== 'Pago') {
          lista.push({ tipo: 'conta', titulo: conta.titulo, condominio: cond.nome, dias, id: conta.id })
        }
      })
      cond.manutencoes.forEach((m) => {
        if (m.proximaData) {
          const dias = calcularDiasParaData(m.proximaData)
          if (dias !== null && dias >= 0 && dias <= 3) {
            lista.push({ tipo: 'manutencao', titulo: m.titulo, condominio: cond.nome, dias, id: m.id })
          }
        }
      })
    })
    return lista
  }, [condominios])

  return (
    <AdminShell
      title="Dashboard administrativo"
      subtitle="Tela inicial com visão consolidada de contas, manutenções, avisos e a carteira de condomínios."
      currentPath="/dashboard"
    >
      {alertas.length > 0 && (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-700">⚠️ Vencimentos nos próximos 3 dias</p>
          <div className="space-y-1">
            {alertas.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-amber-900">{a.titulo} <span className="font-normal text-amber-700">— {a.condominio}</span></span>
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  {a.dias === 0 ? 'Hoje' : `${a.dias} dia(s)`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
<section className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Condominios ativos"
          value={resumo.totalCondominios}
          helper="Base atual sob sua administracao"
        />
        <MetricCard
          label="Unidades acompanhadas"
          value={resumo.totalUnidades}
          helper="Total estimado entre os condominios"
        />
        <MetricCard
          label="Manutencoes criticas"
          value={resumo.manutencoesAtrasadas}
          helper="Pendentes, nao realizadas ou atrasadas"
        />
        <MetricCard
          label="Vencem nesta semana"
          value={contasDaSemana}
          helper="Contas proximas dos proximos 7 dias"
        />
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <PriorityCard
          title="Proxima acao recomendada"
          description={
            resumo.proximasContas[0]
              ? `${resumo.proximasContas[0].titulo} no ${resumo.proximasContas[0].condominio}`
              : 'Nenhuma conta cadastrada para acompanhamento.'
          }
          meta={
            resumo.proximasContas[0]
              ? `${formatarData(resumo.proximasContas[0].proximoVencimento || resumo.proximasContas[0].vencimento)} · ${resumirUrgenciaConta(resumo.proximasContas[0]).label}`
              : 'Cadastre contas para comecar os lembretes.'
          }
        />

        <PriorityCard
          title="Proxima assembleia"
          description={
            resumo.proximaAssembleia
              ? `${resumo.proximaAssembleia.titulo} em ${resumo.proximaAssembleia.condominio}`
              : 'Nenhuma assembleia agendada no momento.'
          }
          meta={
            resumo.proximaAssembleia
              ? `${formatarData(resumo.proximaAssembleia.data)} · faltam ${calcularDiasParaData(resumo.proximaAssembleia.data)} dia(s)`
              : 'Cadastre assembleias para acompanhar o calendario.'
          }
        />
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-3">
          <PanelList
            title="Contas proximas"
            items={resumo.proximasContas}
            emptyLabel="Nenhuma conta cadastrada."
            renderItem={(item) => (
              <>
                <div>
                  <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                  <p className="text-sm text-[var(--muted)]">{item.condominio}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--ink)]">
                    {formatarMoeda(item.valor)}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {formatarData(item.proximoVencimento || item.vencimento)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                  <StatusPill tone={resumirUrgenciaConta(item).tone}>
                    {resumirUrgenciaConta(item).label}
                  </StatusPill>
                  <p className="text-xs text-[var(--muted)]">
                    {descreverRecorrenciaConta(item)}
                  </p>
                </div>
              </>
            )}
          />

          <PanelList
            title="Avisos recentes"
            items={resumo.proximosAvisos}
            emptyLabel="Nenhum aviso registrado."
            renderItem={(item) => (
              <div className="w-full">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                  <p className="text-sm text-[var(--muted)]">{formatarData(item.data)}</p>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.condominio}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink)]/80">{item.descricao}</p>
              </div>
            )}
          />
        </div>

        <div className="grid gap-3">
          <PanelList
            title="Manutencoes proximas"
            items={resumo.proximasManutencoes}
            emptyLabel="Nenhuma manutencao com data definida."
            renderItem={(item) => (
              <>
                <div>
                  <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {item.condominio} | {item.frequencia}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {formatarData(item.proximaData)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    {item.status}
                  </p>
                </div>
              </>
            )}
          />

          {resumo.manutencoesAlerta.length > 0 && (
            <PanelList
              title="Manutencoes com alerta"
              items={resumo.manutencoesAlerta}
              emptyLabel=""
              renderItem={(item) => (
                <>
                  <div>
                    <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                    <p className="text-sm text-[var(--muted)]">{item.condominio}</p>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    {item.status}
                  </span>
                </>
              )}
            />
          )}

          <PanelList
            title="Proxima assembleia"
            items={resumo.proximaAssembleia ? [resumo.proximaAssembleia] : []}
            emptyLabel="Nenhuma assembleia agendada."
            renderItem={(item) => (
              <div className="w-full">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                  <p className="text-sm text-[var(--muted)]">{formatarData(item.data)}{item.horario ? ` · ${item.horario}` : ''}</p>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.condominio}</p>
                {item.local && <p className="mt-1 text-sm text-[var(--muted)]">Local: {item.local}</p>}
                {item.pauta && <p className="mt-2 text-sm leading-6 text-[var(--ink)]/80">{item.pauta}</p>}
              </div>
            )}
          />
        </div>
      </section>
    </AdminShell>
  )
}

function MetricCard({ label, value, helper }) {
  return (
    <article className="rounded-[1.75rem] border border-black/5 bg-white/85 p-5 shadow-[0_16px_40px_rgba(71,47,24,0.06)]">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--ink)]">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{helper}</p>
    </article>
  )
}

function PriorityCard({ title, description, meta }) {
  return (
    <article className="rounded-[1.75rem] border border-black/5 bg-[linear-gradient(135deg,rgba(15,82,255,0.08),rgba(34,211,238,0.08),rgba(255,255,255,0.92))] p-6 shadow-[0_16px_40px_rgba(71,47,24,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
        Prioridade
      </p>
      <h2 className="mt-3 text-xl font-semibold text-[var(--ink)]">{title}</h2>
      <p className="mt-3 text-base font-medium text-[var(--panel-strong)]">{description}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{meta}</p>
    </article>
  )
}

function PanelList({ title, items, emptyLabel, renderItem }) {
  return (
    <section className="rounded-[1.75rem] border border-black/5 bg-white/85 p-6 shadow-[0_18px_50px_rgba(71,47,24,0.08)]">
      <h2 className="text-xl font-semibold text-[var(--ink)]">{title}</h2>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--soft)] px-4 py-5 text-sm text-[var(--muted)]">
            {emptyLabel}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function StatusPill({ tone, children }) {
  const toneClass =
    tone === 'red'
      ? 'bg-red-100 text-red-700'
      : tone === 'amber'
        ? 'bg-amber-100 text-amber-700'
        : tone === 'emerald'
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-700'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  )
}
