'use client'

import Link from 'next/link'
import { useReducer, useState } from 'react'
import { useParams } from 'next/navigation'
import AdminShell from '@/components/admin-shell'
import {
  adicionarAssembleiaAoCondominio,
  adicionarAvisoAoCondominio,
  adicionarContaAoCondominio,
  adicionarManutencaoAoCondominio,
  buscarCondominioPorSlug,
  calcularDiasParaData,
  descreverRecorrenciaConta,
  formatarData,
  formatarMoeda,
  frequenciasManutencao,
  normalizarConta,
  resumirUrgenciaConta,
} from '@/lib/condominios'

export default function CondominioPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const [, forceRefresh] = useReducer((value) => value + 1, 0)
  const [secaoAtiva, setSecaoAtiva] = useState('resumo')
  const [painelAberto, setPainelAberto] = useState('')
  const [contaForm, setContaForm] = useState({
    titulo: '',
    categoria: '',
    valor: '',
    vencimento: '',
    status: 'Pendente',
    recorrencia: 'nenhuma',
    diaVencimento: '15',
  })
  const [manutencaoForm, setManutencaoForm] = useState({
    titulo: '',
    frequencia: 'Mensal',
    proximaData: '',
    responsavel: '',
    status: 'Programada',
  })
  const [avisoForm, setAvisoForm] = useState({
    titulo: '',
    data: '',
    descricao: '',
  })
  const [assembleiaForm, setAssembleiaForm] = useState({
    titulo: '',
    data: '',
    horario: '',
    local: '',
    pauta: '',
  })

  const condominio = slug ? buscarCondominioPorSlug(slug) : null

  const manutencoesPorFrequencia = (() => {
    const mapa = {}

    frequenciasManutencao.forEach((frequencia) => {
      mapa[frequencia] = condominio
        ? condominio.manutencoes.filter((item) => item.frequencia === frequencia)
        : []
    })

    return mapa
  })()

  if (!condominio) {
    return (
      <AdminShell
        title="Condominio nao encontrado"
        subtitle="Confira se o condominio ainda esta cadastrado na base local deste navegador."
        currentPath=""
      >
        <section className="rounded-[1.75rem] border border-black/5 bg-white/85 p-8 text-center shadow-[0_18px_50px_rgba(71,47,24,0.08)]">
          <p className="text-[var(--muted)]">
            Nao encontramos esse condominio. Volte ao dashboard para escolher outro cadastro.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white"
          >
            Ir para dashboard
          </Link>
        </section>
      </AdminShell>
    )
  }

  function atualizarForm(setter, campo, valor) {
    setter((atual) => ({ ...atual, [campo]: valor }))
  }

  function recarregar() {
    forceRefresh()
    setPainelAberto('')
  }

  function cadastrarConta(event) {
    event.preventDefault()
    adicionarContaAoCondominio(condominio.slug, contaForm)
    setContaForm({
      titulo: '',
      categoria: '',
      valor: '',
      vencimento: '',
      status: 'Pendente',
      recorrencia: 'nenhuma',
      diaVencimento: '15',
    })
    recarregar()
  }

  function cadastrarManutencao(event) {
    event.preventDefault()
    adicionarManutencaoAoCondominio(condominio.slug, manutencaoForm)
    setManutencaoForm({
      titulo: '',
      frequencia: 'Mensal',
      proximaData: '',
      responsavel: '',
      status: 'Programada',
    })
    recarregar()
  }

  function cadastrarAviso(event) {
    event.preventDefault()
    adicionarAvisoAoCondominio(condominio.slug, avisoForm)
    setAvisoForm({
      titulo: '',
      data: '',
      descricao: '',
    })
    recarregar()
  }

  function cadastrarAssembleia(event) {
    event.preventDefault()
    adicionarAssembleiaAoCondominio(condominio.slug, assembleiaForm)
    setAssembleiaForm({
      titulo: '',
      data: '',
      horario: '',
      local: '',
      pauta: '',
    })
    recarregar()
  }

  function abrirSecao(secao) {
    setSecaoAtiva(secao)
    setPainelAberto('')
  }

  const menuItens = [
    { id: 'resumo', label: 'Resumo' },
    { id: 'contas', label: 'Contas' },
    { id: 'manutencoes', label: 'Manutencoes' },
    { id: 'avisos', label: 'Avisos' },
    { id: 'assembleias', label: 'Assembleias' },
  ]

  const contasNormalizadas = condominio.contas.map((conta) => normalizarConta(conta))
  const proximaConta = [...contasNormalizadas].sort((a, b) =>
    String(a.proximoVencimento || a.vencimento).localeCompare(
      String(b.proximoVencimento || b.vencimento)
    )
  )[0]
  const proximaManutencao = [...condominio.manutencoes]
    .filter((item) => item.proximaData)
    .sort((a, b) => String(a.proximaData).localeCompare(String(b.proximaData)))[0]
  const proximaAssembleia = [...(condominio.assembleias || [])]
    .filter((item) => item.data)
    .sort((a, b) => String(a.data).localeCompare(String(b.data)))[0]
  const totalRecorrentes = contasNormalizadas.filter(
    (item) => item.recorrencia === 'mensal-indeterminada'
  ).length

  const sidebar = (
    <>
      <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[var(--accent)]">
          Condominio ativo
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          {condominio.nome}
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/68">
          Menu exclusivo deste condominio para ver contas, manutencoes, avisos e assembleias.
        </p>
      </div>

      <nav className="mt-4 grid gap-2">
        <Link
          href="/dashboard"
          className="rounded-[1rem] bg-white/10 px-3.5 py-3 text-white/88 transition hover:bg-white/16"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Inicio do sistema</p>
              <p className="mt-1 text-xs text-white/62">Voltar ao painel principal</p>
            </div>
            <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">
              00
            </span>
          </div>
        </Link>

        <Link
          href="/condominios"
          className="rounded-[1rem] bg-white/10 px-3.5 py-3 text-white/88 transition hover:bg-white/16"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Todos os condominios</p>
              <p className="mt-1 text-xs text-white/62">Voltar para a carteira</p>
            </div>
            <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">
              01
            </span>
          </div>
        </Link>

        {menuItens.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => abrirSecao(item.id)}
            className={
              secaoAtiva === item.id
                ? 'rounded-[1rem] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] px-3.5 py-3 text-left text-white transition'
                : 'rounded-[1rem] bg-white/10 px-3.5 py-3 text-left text-white/88 transition hover:bg-white/16'
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-white/62">Abrir secao</p>
              </div>
              <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">
                {String(index + 2).padStart(2, '0')}
              </span>
            </div>
          </button>
        ))}
      </nav>

      <div className="mt-4 rounded-[1.25rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(168,85,247,0.16))] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200">
          Dados rapidos
        </p>
        <p className="mt-3 text-sm text-white/82">Sindico: {condominio.sindico}</p>
        <p className="mt-2 text-sm text-white/82">Unidades: {condominio.unidades}</p>
        <p className="mt-2 text-sm text-white/82">Cidade: {condominio.cidade}</p>
      </div>
    </>
  )

  const headerActions = (
    <>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--panel-strong)] ring-1 ring-slate-200 transition hover:bg-[var(--soft)]"
      >
        Inicio do sistema
      </Link>
      <Link
        href="/condominios"
        className="inline-flex items-center justify-center rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Todos os condominios
      </Link>
    </>
  )

  return (
    <AdminShell
      title={condominio.nome}
      subtitle={`Painel operacional do condominio em ${condominio.cidade}. O menu lateral agora pertence a este condominio.`}
      currentPath=""
      sidebar={sidebar}
      headerActions={headerActions}
    >
      <div className="space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(15,82,255,0.08),rgba(34,211,238,0.08),rgba(249,115,22,0.08))] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Acoes rapidas
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Use estes botoes para cadastrar rapidamente novos itens neste condominio.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <QuickActionButton
                label="Cadastrar conta"
                active={painelAberto === 'conta'}
                onClick={() =>
                  (setSecaoAtiva('contas'),
                  setPainelAberto((atual) => (atual === 'conta' ? '' : 'conta')))
                }
              />
              <QuickActionButton
                label="Cadastrar manutencao"
                active={painelAberto === 'manutencao'}
                onClick={() =>
                  (setSecaoAtiva('manutencoes'),
                  setPainelAberto((atual) => (atual === 'manutencao' ? '' : 'manutencao')))
                }
              />
              <QuickActionButton
                label="Cadastrar aviso"
                active={painelAberto === 'aviso'}
                onClick={() =>
                  (setSecaoAtiva('avisos'),
                  setPainelAberto((atual) => (atual === 'aviso' ? '' : 'aviso')))
                }
              />
              <QuickActionButton
                label="Cadastrar assembleia"
                active={painelAberto === 'assembleia'}
                onClick={() =>
                  (setSecaoAtiva('assembleias'),
                  setPainelAberto((atual) => (atual === 'assembleia' ? '' : 'assembleia')))
                }
              />
            </div>
          </div>
        </section>

        {secaoAtiva === 'resumo' ? (
          <section id="resumo" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Sindico" value={condominio.sindico} />
              <SummaryCard label="Unidades" value={condominio.unidades} />
              <SummaryCard label="Contas recorrentes" value={totalRecorrentes} />
              <SummaryCard label="Assembleias" value={condominio.assembleias?.length || 0} />
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <InsightCard
                title="Proxima conta"
                description={
                  proximaConta
                    ? `${proximaConta.titulo} · ${formatarMoeda(proximaConta.valor)}`
                    : 'Nenhuma conta cadastrada.'
                }
                meta={
                  proximaConta
                    ? `${formatarData(proximaConta.proximoVencimento || proximaConta.vencimento)} · ${resumirUrgenciaConta(proximaConta).label}`
                    : 'Cadastre uma conta para acompanhar o financeiro.'
                }
              />
              <InsightCard
                title="Proxima manutencao"
                description={
                  proximaManutencao
                    ? proximaManutencao.titulo
                    : 'Nenhuma manutencao com data definida.'
                }
                meta={
                  proximaManutencao
                    ? `${formatarData(proximaManutencao.proximaData)} · ${proximaManutencao.responsavel}`
                    : 'Defina as proximas rotinas operacionais.'
                }
              />
              <InsightCard
                title="Proxima assembleia"
                description={
                  proximaAssembleia
                    ? proximaAssembleia.titulo
                    : 'Nenhuma assembleia agendada.'
                }
                meta={
                  proximaAssembleia
                    ? `${formatarData(proximaAssembleia.data)} · faltam ${calcularDiasParaData(proximaAssembleia.data)} dia(s)`
                    : 'Cadastre o calendario de assembleias.'
                }
              />
            </div>
          </section>
        ) : null}

        {secaoAtiva === 'contas' ? (
        <section id="contas">
          <ContentPanel
            title="Contas do condominio"
            actionLabel="Nova conta"
            actionOpen={painelAberto === 'conta'}
            onActionToggle={() =>
              setPainelAberto((atual) => (atual === 'conta' ? '' : 'conta'))
            }
          >
            {painelAberto === 'conta' ? (
              <InlineFormWrap>
                <FormPanel title="Nova conta" onSubmit={cadastrarConta} compact>
                  <Field label="Titulo">
                    <input value={contaForm.titulo} onChange={(e) => atualizarForm(setContaForm, 'titulo', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Categoria">
                    <input value={contaForm.categoria} onChange={(e) => atualizarForm(setContaForm, 'categoria', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Valor">
                    <input type="number" step="0.01" value={contaForm.valor} onChange={(e) => atualizarForm(setContaForm, 'valor', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Vencimento">
                    <input type="date" value={contaForm.vencimento} onChange={(e) => atualizarForm(setContaForm, 'vencimento', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Status">
                    <select value={contaForm.status} onChange={(e) => atualizarForm(setContaForm, 'status', e.target.value)} className={inputClass}>
                      <option>Pendente</option>
                      <option>Agendada</option>
                      <option>Paga</option>
                    </select>
                  </Field>
                  <Field label="Recorrencia">
                    <select value={contaForm.recorrencia} onChange={(e) => atualizarForm(setContaForm, 'recorrencia', e.target.value)} className={inputClass}>
                      <option value="nenhuma">Conta avulsa</option>
                      <option value="mensal-indeterminada">Todo mes por tempo indeterminado</option>
                    </select>
                  </Field>
                  {contaForm.recorrencia === 'mensal-indeterminada' ? (
                    <Field label="Dia fixo do vencimento">
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={contaForm.diaVencimento}
                        onChange={(e) => atualizarForm(setContaForm, 'diaVencimento', e.target.value)}
                        className={inputClass}
                        required
                      />
                    </Field>
                  ) : null}
                  {contaForm.recorrencia === 'mensal-indeterminada' ? (
                    <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
                      Essa conta ficara agendada por tempo indeterminado e o sistema vai lembrar sempre do proximo vencimento mensal.
                    </p>
                  ) : null}
                  <SubmitButton label="Salvar conta" />
                </FormPanel>
              </InlineFormWrap>
            ) : null}
            {contasNormalizadas.length === 0 ? (
              <EmptyState text="Nenhuma conta cadastrada para este condominio." />
            ) : (
              contasNormalizadas.map((conta) => (
                <div
                  key={conta.id}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-[var(--ink)]">{conta.titulo}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{conta.categoria}</p>
                    </div>
                    <p className="font-semibold text-[var(--ink)]">{formatarMoeda(conta.valor)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
                    <span>Vence em {formatarData(conta.proximoVencimento || conta.vencimento)}</span>
                    <span>{conta.status}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusPill tone={resumirUrgenciaConta(conta).tone}>
                      {resumirUrgenciaConta(conta).label}
                    </StatusPill>
                    <p className="text-sm text-[var(--muted)]">
                      {descreverRecorrenciaConta(conta)}
                    </p>
                  </div>
                </div>
                ))
              )}
          </ContentPanel>
        </section>
        ) : null}

        {secaoAtiva === 'manutencoes' ? (
        <section id="manutencoes">
          <ContentPanel
            title="Manutencoes do condominio"
            actionLabel="Nova manutencao"
            actionOpen={painelAberto === 'manutencao'}
            onActionToggle={() =>
              setPainelAberto((atual) => (atual === 'manutencao' ? '' : 'manutencao'))
            }
          >
            {painelAberto === 'manutencao' ? (
              <InlineFormWrap>
                <FormPanel title="Nova manutencao" onSubmit={cadastrarManutencao} compact>
                  <Field label="Titulo">
                    <input value={manutencaoForm.titulo} onChange={(e) => atualizarForm(setManutencaoForm, 'titulo', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Frequencia">
                    <select value={manutencaoForm.frequencia} onChange={(e) => atualizarForm(setManutencaoForm, 'frequencia', e.target.value)} className={inputClass}>
                      {frequenciasManutencao.map((frequencia) => (
                        <option key={frequencia}>{frequencia}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Proxima data">
                    <input type="date" value={manutencaoForm.proximaData} onChange={(e) => atualizarForm(setManutencaoForm, 'proximaData', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Responsavel">
                    <input value={manutencaoForm.responsavel} onChange={(e) => atualizarForm(setManutencaoForm, 'responsavel', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Status">
                    <select value={manutencaoForm.status} onChange={(e) => atualizarForm(setManutencaoForm, 'status', e.target.value)} className={inputClass}>
                      <option>Programada</option>
                      <option>Agendada</option>
                      <option>Pendente</option>
                      <option>Concluida</option>
                    </select>
                  </Field>
                  <SubmitButton label="Salvar manutencao" />
                </FormPanel>
              </InlineFormWrap>
            ) : null}
            <div className="space-y-5">
              {frequenciasManutencao.map((frequencia) => (
                <div key={frequencia} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--soft)] p-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold text-[var(--ink)]">{frequencia}</h3>
                    <span className="text-sm text-[var(--muted)]">
                      {manutencoesPorFrequencia[frequencia].length} item(ns)
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {manutencoesPorFrequencia[frequencia].length === 0 ? (
                      <p className="text-sm text-[var(--muted)]">Nenhuma manutencao nessa frequencia.</p>
                    ) : (
                      manutencoesPorFrequencia[frequencia].map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-white px-4 py-4 ring-1 ring-black/5"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                              {item.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            Responsavel: {item.responsavel}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            Proxima data: {formatarData(item.proximaData)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                ))}
            </div>
          </ContentPanel>
        </section>
        ) : null}

        {secaoAtiva === 'avisos' ? (
        <section id="avisos">
          <ContentPanel
            title="Avisos do condominio"
            actionLabel="Novo aviso"
            actionOpen={painelAberto === 'aviso'}
            onActionToggle={() => setPainelAberto((atual) => (atual === 'aviso' ? '' : 'aviso'))}
          >
            {painelAberto === 'aviso' ? (
              <InlineFormWrap>
                <FormPanel title="Novo aviso" onSubmit={cadastrarAviso} compact>
                  <Field label="Titulo">
                    <input value={avisoForm.titulo} onChange={(e) => atualizarForm(setAvisoForm, 'titulo', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Data">
                    <input type="date" value={avisoForm.data} onChange={(e) => atualizarForm(setAvisoForm, 'data', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Descricao">
                    <textarea value={avisoForm.descricao} onChange={(e) => atualizarForm(setAvisoForm, 'descricao', e.target.value)} className={`${inputClass} min-h-28`} required />
                  </Field>
                  <SubmitButton label="Salvar aviso" />
                </FormPanel>
              </InlineFormWrap>
            ) : null}
            {condominio.avisos.length === 0 ? (
              <EmptyState text="Nenhum aviso cadastrado para este condominio." />
            ) : (
              condominio.avisos.map((aviso) => (
                <div
                  key={aviso.id}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium text-[var(--ink)]">{aviso.titulo}</p>
                    <p className="text-sm text-[var(--muted)]">{formatarData(aviso.data)}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{aviso.descricao}</p>
                </div>
                ))
              )}
          </ContentPanel>
        </section>
        ) : null}

        {secaoAtiva === 'assembleias' ? (
        <section id="assembleias">
          <ContentPanel
            title="Assembleias do condominio"
            actionLabel="Nova assembleia"
            actionOpen={painelAberto === 'assembleia'}
            onActionToggle={() =>
              setPainelAberto((atual) => (atual === 'assembleia' ? '' : 'assembleia'))
            }
          >
            {painelAberto === 'assembleia' ? (
              <InlineFormWrap>
                <FormPanel title="Nova assembleia" onSubmit={cadastrarAssembleia} compact>
                  <Field label="Titulo">
                    <input value={assembleiaForm.titulo} onChange={(e) => atualizarForm(setAssembleiaForm, 'titulo', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Data">
                    <input type="date" value={assembleiaForm.data} onChange={(e) => atualizarForm(setAssembleiaForm, 'data', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Horario">
                    <input type="time" value={assembleiaForm.horario} onChange={(e) => atualizarForm(setAssembleiaForm, 'horario', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Local">
                    <input value={assembleiaForm.local} onChange={(e) => atualizarForm(setAssembleiaForm, 'local', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Pauta">
                    <textarea value={assembleiaForm.pauta} onChange={(e) => atualizarForm(setAssembleiaForm, 'pauta', e.target.value)} className={`${inputClass} min-h-28`} required />
                  </Field>
                  <SubmitButton label="Salvar assembleia" />
                </FormPanel>
              </InlineFormWrap>
            ) : null}
            {condominio.assembleias?.length ? (
              condominio.assembleias.map((assembleia) => (
                <div
                  key={assembleia.id}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium text-[var(--ink)]">{assembleia.titulo}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {formatarData(assembleia.data)} {assembleia.horario ? `| ${assembleia.horario}` : ''}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">Local: {assembleia.local}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{assembleia.pauta}</p>
                </div>
              ))
            ) : (
              <EmptyState text="Nenhuma assembleia cadastrada para este condominio." />
              )}
          </ContentPanel>
        </section>
        ) : null}
      </div>
    </AdminShell>
  )
}

const inputClass =
  'w-full rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]'

function SummaryCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-black/5 bg-white/85 p-5 shadow-[0_16px_40px_rgba(71,47,24,0.06)]">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">{value}</p>
    </article>
  )
}

function InsightCard({ title, description, meta }) {
  return (
    <article className="rounded-[1.5rem] border border-black/5 bg-[linear-gradient(135deg,rgba(15,82,255,0.08),rgba(34,211,238,0.06),rgba(255,255,255,0.92))] p-5 shadow-[0_16px_40px_rgba(71,47,24,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-strong)]">
        Proxima acao
      </p>
      <h3 className="mt-3 text-lg font-semibold text-[var(--panel-strong)]">{title}</h3>
      <p className="mt-3 text-base font-medium text-[var(--ink)]">{description}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{meta}</p>
    </article>
  )
}

function QuickActionButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110'
          : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--panel-strong)] ring-1 ring-slate-200 transition hover:bg-[var(--soft)]'
      }
    >
      {label}
    </button>
  )
}

function ContentPanel({
  title,
  children,
  actionLabel,
  actionOpen = false,
  onActionToggle,
}) {
  return (
    <section className="rounded-[1.75rem] border border-black/5 bg-white/85 p-6 shadow-[0_18px_50px_rgba(71,47,24,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-[var(--ink)]">{title}</h2>
        {actionLabel ? (
          <button
            type="button"
            onClick={onActionToggle}
            className="inline-flex w-fit rounded-full bg-[var(--panel-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110"
          >
            {actionOpen ? 'Fechar' : actionLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  )
}

function InlineFormWrap({ children }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(34,211,238,0.06),rgba(255,255,255,0.85))] p-4">
      {children}
    </div>
  )
}

function FormPanel({ title, onSubmit, children, compact = false }) {
  return (
    <form
      onSubmit={onSubmit}
      className={compact ? '' : 'rounded-[1.75rem] border border-black/5 bg-white/85 p-6 shadow-[0_18px_50px_rgba(71,47,24,0.08)]'}
    >
      <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--ink)]">{label}</span>
      {children}
    </label>
  )
}

function SubmitButton({ label }) {
  return (
    <button
      type="submit"
      className="w-full rounded-full bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
    >
      {label}
    </button>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--soft)] px-4 py-5 text-sm text-[var(--muted)]">
      {text}
    </div>
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
