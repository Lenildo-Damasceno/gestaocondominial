'use client'

import Link from 'next/link'
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
  const condominios = listarCondominios()
  const resumo = resumirDashboard(condominios)

  return (
    <AdminShell
      title="Painel do administrador"
      subtitle="Acompanhe os condominios que voce administra, enxergue contas a vencer, manutencoes proximas e comunicados importantes em um unico lugar."
      currentPath="/dashboard"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          label="Contas criticas"
          value={resumo.contasAtrasadas}
          helper="Titulos atrasados que pedem acao imediata"
        />
        <MetricCard
          label="Vencem nesta semana"
          value={resumo.contasDaSemana}
          helper="Contas proximas dos proximos 7 dias"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[1.75rem] border border-black/5 bg-white/85 p-6 shadow-[0_18px_50px_rgba(71,47,24,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--ink)]">
                Seus condominios
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Entre rapidamente em cada operacao ou use a aba de condominios para selecionar e gerenciar sua carteira.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/condominios"
                className="inline-flex rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
              >
                Selecionar condominio
              </Link>
              <Link
                href="/condominios/novo"
                className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:brightness-95"
              >
                Cadastrar novo
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {condominios.map((condominio) => (
              <Link
                key={condominio.id}
                href={`/condominios/${condominio.slug}`}
                className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--soft)] p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--ink)]">
                      {condominio.nome}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {condominio.cidade} | Sindico: {condominio.sindico}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    {condominio.unidades} und
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-[var(--muted)]">
                  <InfoMini label="Contas" value={condominio.contas.length} />
                  <InfoMini label="Avisos" value={condominio.avisos.length} />
                  <InfoMini
                    label="Manutencoes"
                    value={condominio.manutencoes.length}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
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
        </div>
      </section>

      <section className="mt-6">
        <PanelList
          title="Avisos recentes"
          items={resumo.proximosAvisos}
          emptyLabel="Nenhum aviso registrado."
          renderItem={(item) => (
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                <p className="text-sm text-[var(--muted)]">
                  {formatarData(item.data)}
                </p>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.condominio}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--ink)]/80">
                {item.descricao}
              </p>
            </div>
          )}
        />
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

function InfoMini({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{value}</p>
    </div>
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
