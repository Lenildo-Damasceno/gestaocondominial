/**
 * app/condominios/[slug]/page.js
 * 
 * Página de detalhe de condomínio (rota dinâmica: /condominios/[slug])
 * - Exibe todas as informações de um condomínio específico
 * - Seções: Resumo, Contas, Avisos, Manutenções, Assembleias
 * - Permite adicionar/editar: contas, avisos, manutenções, assembleias
 * - Validação de formulários com estados de erro
 * - Salva mudanças em localStorage
 * - Usa useReducer para gerenciar refresh de dados
 */

'use client'

import Link from 'next/link'
import React, { useReducer, useState } from 'react'
import { useParams } from 'next/navigation'
import AdminShell from '@/components/admin-shell'
import {
  adicionarAssembleiaAoCondominio,
  adicionarAvisoAoCondominio,
  adicionarContaAoCondominio,
  adicionarManutencaoAoCondominio,
  editarManutencaoDoCondominio,
  excluirManutencaoDoCondominio,
  excluirContaDoCondominio,
  excluirAvisoDoCondominio,
  excluirAssembleiaDoCondominio,
  registrarHistoricoManutencao,
  atualizarCondominio,
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
  const [manutencaoTipo, setManutencaoTipo] = useState('programadas')
  const [contaForm, setContaForm] = useState({
    titulo: '',
    categoria: '',
    valor: '',
    vencimento: '',
    status: 'Pendente',
    recorrencia: 'nenhuma',
    diaVencimento: '15',
  })
  const [historicoAberto, setHistoricoAberto] = useState(null)
  const [historicoForm, setHistoricoForm] = useState({ data: '', status: 'Concluída', executor: '', observacao: '' })
  const [manutencaoEditando, setManutencaoEditando] = useState(null)
  const [manutencaoEditForm, setManutencaoEditForm] = useState({})
  const [manutencaoForm, setManutencaoForm] = useState({
    titulo: '',
    tipo: 'Programada',
    frequencia: 'Mensal',
    intervalMeses: '12',
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
      tipo: 'Programada',
      frequencia: 'Mensal',
      intervalMeses: '12',
      proximaData: '',
      responsavel: '',
      status: 'Programada',
    })
    recarregar()
  }

  function abrirEdicaoManutencao(item) {
    setManutencaoEditando(item.id)
    setManutencaoEditForm({
      titulo: item.titulo,
      tipo: item.tipo || 'Programada',
      frequencia: item.frequencia,
      intervalMeses: item.intervalMeses || '',
      proximaData: item.proximaData || '',
      responsavel: item.responsavel,
      status: item.status,
    })
  }

  function salvarEdicaoManutencao(event) {
    event.preventDefault()
    editarManutencaoDoCondominio(condominio.slug, manutencaoEditando, manutencaoEditForm)
    setManutencaoEditando(null)
    forceRefresh()
  }

  function registrarHistorico(event, manutencaoId) {
    event.preventDefault()
    registrarHistoricoManutencao(condominio.slug, manutencaoId, historicoForm)
    setHistoricoAberto(null)
    setHistoricoForm({ data: '', status: 'Concluída', executor: '', observacao: '' })
    forceRefresh()
  }

  function excluirConta(id) {
    if (!confirm('Excluir esta conta?')) return
    excluirContaDoCondominio(condominio.slug, id)
    forceRefresh()
  }

  function excluirAviso(id) {
    if (!confirm('Excluir este aviso?')) return
    excluirAvisoDoCondominio(condominio.slug, id)
    forceRefresh()
  }

  function excluirAssembleia(id) {
    if (!confirm('Excluir esta assembleia?')) return
    excluirAssembleiaDoCondominio(condominio.slug, id)
    forceRefresh()
  }

  function excluirManutencao(id) {
    if (!confirm('Excluir esta manutenção?')) return
    excluirManutencaoDoCondominio(condominio.slug, id)
    forceRefresh()
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
    if (secao === 'manutencoes') {
      setManutencaoTipo('programadas')
    }
  }

  const menuItens = [
    { id: 'resumo', label: 'Resumo', helper: 'Visão geral do condomínio' },
    { id: 'manutencoes', label: 'Manutenções', helper: 'Programadas e recorrentes' },
    { id: 'contas', label: 'Contas', helper: 'Despesas e títulos' },
    { id: 'avisos', label: 'Avisos', helper: 'Comunicados' },
    { id: 'assembleias', label: 'Assembleias', helper: 'Atas e encontros' },
    { id: 'lembretes', label: 'Lembretes', helper: 'O que não pode esquecer' },
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

  // Calcular totalRecorrentes diretamente dos dados brutos para evitar diferenças de hidratação
  const totalRecorrentes = React.useMemo(() => {
    return condominio.contas.filter(
      (conta) => conta.recorrencia === 'mensal-indeterminada'
    ).length
  }, [condominio.contas])

  const manutencoesProgramadas = condominio.manutencoes.filter(
    (item) => item.proximaData || item.status === 'Agendada' || item.status === 'Programada'
  )
  const manutencoesRecorrentes = condominio.manutencoes
  const manutencoesRecorrentesPorFrequencia = manutencoesRecorrentes.reduce((map, item) => {
    if (!map[item.frequencia]) {
      map[item.frequencia] = []
    }
    map[item.frequencia].push(item)
    return map
  }, {})

  const sidebar = (
    <>
      <section className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[var(--accent)]">Condomínio ativo</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{condominio.nome}</h2>
        <p className="mt-3 text-sm leading-6 text-white/68">
          Navegue rapidamente entre as áreas desse condomínio e veja os principais detalhes.
        </p>
      </section>

      <nav aria-label="Navegação do condomínio" className="mt-4 grid gap-2">
        <button
          type="button"
          aria-current={secaoAtiva === 'resumo' ? 'page' : undefined}
          onClick={() => abrirSecao('resumo')}
          className={
            secaoAtiva === 'resumo'
              ? 'rounded-[1.5rem] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] px-4 py-3 text-left text-white transition'
              : 'rounded-[1.5rem] bg-white/10 px-4 py-3 text-left text-white/82 transition hover:bg-white/16'
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Resumo</p>
              <p className="mt-1 text-xs text-white/62 hidden sm:block">Visão geral do condomínio</p>
            </div>
            <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">01</span>
          </div>
        </button>

        <button
          type="button"
          aria-current={secaoAtiva === 'contas' ? 'page' : undefined}
          onClick={() => abrirSecao('contas')}
          className={
            secaoAtiva === 'contas'
              ? 'rounded-[1.5rem] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] px-4 py-3 text-left text-white transition'
              : 'rounded-[1.5rem] bg-white/10 px-4 py-3 text-left text-white/82 transition hover:bg-white/16'
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Contas</p>
              <p className="mt-1 text-xs text-white/62 hidden sm:block">Despesas do condomínio</p>
            </div>
            <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">02</span>
          </div>
        </button>

        <button
          type="button"
          aria-current={secaoAtiva === 'manutencoes' ? 'page' : undefined}
          onClick={() => abrirSecao('manutencoes')}
          className={
            secaoAtiva === 'manutencoes'
              ? 'rounded-[1.5rem] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] px-4 py-3 text-left text-white transition'
              : 'rounded-[1.5rem] bg-white/10 px-4 py-3 text-left text-white/82 transition hover:bg-white/16'
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Manutenções</p>
              <p className="mt-1 text-xs text-white/62 hidden sm:block">Programadas e recorrentes</p>
            </div>
            <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">03</span>
          </div>
        </button>

        <button
          type="button"
          aria-current={secaoAtiva === 'avisos' ? 'page' : undefined}
          onClick={() => abrirSecao('avisos')}
          className={
            secaoAtiva === 'avisos'
              ? 'rounded-[1.5rem] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] px-4 py-3 text-left text-white transition'
              : 'rounded-[1.5rem] bg-white/10 px-4 py-3 text-left text-white/82 transition hover:bg-white/16'
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Avisos</p>
              <p className="mt-1 text-xs text-white/62 hidden sm:block">Comunicados</p>
            </div>
            <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">04</span>
          </div>
        </button>

        <button
          type="button"
          aria-current={secaoAtiva === 'assembleias' ? 'page' : undefined}
          onClick={() => abrirSecao('assembleias')}
          className={
            secaoAtiva === 'assembleias'
              ? 'rounded-[1.5rem] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] px-4 py-3 text-left text-white transition'
              : 'rounded-[1.5rem] bg-white/10 px-4 py-3 text-left text-white/82 transition hover:bg-white/16'
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Assembleias</p>
              <p className="mt-1 text-xs text-white/62 hidden sm:block">Atas e reuniões</p>
            </div>
            <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">05</span>
          </div>
        </button>

        <button
          type="button"
          aria-current={secaoAtiva === 'lembretes' ? 'page' : undefined}
          onClick={() => abrirSecao('lembretes')}
          className={
            secaoAtiva === 'lembretes'
              ? 'rounded-[1.5rem] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] px-4 py-3 text-left text-white transition'
              : 'rounded-[1.5rem] bg-white/10 px-4 py-3 text-left text-white/82 transition hover:bg-white/16'
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Lembretes</p>
              <p className="mt-1 text-xs text-white/62 hidden sm:block">Ações importantes</p>
            </div>
            <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">06</span>
          </div>
        </button>
      </nav>

      <div className="mt-4 rounded-[1.25rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(168,85,247,0.16))] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Dados rápidos</p>
        <p className="mt-3 text-sm text-white/82">Síndico: {condominio.sindico}</p>
        <p className="mt-2 text-sm text-white/82">Unidades: {condominio.unidades}</p>
        <p className="mt-2 text-sm text-white/82">Cidade: {condominio.cidade}</p>
      </div>

      <div className="mt-3 space-y-2">
        <label className="block cursor-pointer rounded-[1.25rem] border border-white/10 bg-white/6 p-3 text-center text-xs font-semibold text-white/70 hover:bg-white/12 transition">
          {condominio.foto ? (
            <img src={condominio.foto} alt="Logo" className="mx-auto mb-2 h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="block mb-1 text-2xl">🏗️</span>
          )}
          {condominio.foto ? 'Trocar foto' : 'Adicionar foto/logo'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = (ev) => {
              atualizarCondominio(condominio.slug, (c) => ({ ...c, foto: ev.target.result }))
              forceRefresh()
            }
            reader.readAsDataURL(file)
          }} />
        </label>
        <Link
          href={`/condominios/${condominio.slug}/relatorio`}
          className="block rounded-[1.25rem] border border-white/10 bg-white/6 p-3 text-center text-xs font-semibold text-white/70 hover:bg-white/12 transition"
        >
          📄 Gerar relatório
        </Link>
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
      <div className="space-y-3">
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
          <section id="resumo" className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Sindico" value={condominio.sindico} />
              <SummaryCard label="Unidades" value={condominio.unidades} />
              <SummaryCard label="Contas recorrentes" value={totalRecorrentes} />
              <SummaryCard label="Assembleias" value={condominio.assembleias?.length || 0} />
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
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

            <ContentPanel
              title="Manutenções"
              actionLabel="Nova manutenção"
              actionOpen={painelAberto === 'manutencao'}
              onActionToggle={() => setPainelAberto((a) => (a === 'manutencao' ? '' : 'manutencao'))}
            >
              {painelAberto === 'manutencao' ? (
                <InlineFormWrap>
                  <FormPanel title="Nova manutenção" onSubmit={cadastrarManutencao} compact>
                    <Field label="Título">
                      <input value={manutencaoForm.titulo} onChange={(e) => atualizarForm(setManutencaoForm, 'titulo', e.target.value)} className={inputClass} required />
                    </Field>
                    <Field label="Tipo">
                      <select value={manutencaoForm.tipo} onChange={(e) => atualizarForm(setManutencaoForm, 'tipo', e.target.value)} className={inputClass}>
                        <option value="Programada">Programada — se repete</option>
                        <option value="Corretiva">Corretiva — ocorrência pontual</option>
                      </select>
                    </Field>
                    {manutencaoForm.tipo === 'Programada' && (
                      <>
                        <Field label="Frequência">
                          <select value={manutencaoForm.frequencia} onChange={(e) => atualizarForm(setManutencaoForm, 'frequencia', e.target.value)} className={inputClass}>
                            {frequenciasManutencao.map((f) => <option key={f}>{f}</option>)}
                          </select>
                        </Field>
                        <Field label="Intervalo em meses">
                          <input type="number" min="1" value={manutencaoForm.intervalMeses} onChange={(e) => atualizarForm(setManutencaoForm, 'intervalMeses', e.target.value)} className={inputClass} />
                        </Field>
                      </>
                    )}
                    <Field label="Próxima data">
                      <input type="date" value={manutencaoForm.proximaData} onChange={(e) => atualizarForm(setManutencaoForm, 'proximaData', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Responsável">
                      <input value={manutencaoForm.responsavel} onChange={(e) => atualizarForm(setManutencaoForm, 'responsavel', e.target.value)} className={inputClass} required />
                    </Field>
                    <Field label="Status">
                      <select value={manutencaoForm.status} onChange={(e) => atualizarForm(setManutencaoForm, 'status', e.target.value)} className={inputClass}>
                        <option>Programada</option>
                        <option>Agendada</option>
                        <option>Pendente</option>
                        <option>Concluída</option>
                        <option>Não realizada</option>
                      </select>
                    </Field>
                    <SubmitButton label="Salvar manutenção" />
                  </FormPanel>
                </InlineFormWrap>
              ) : null}
              {condominio.manutencoes.length === 0 ? (
                <EmptyState text="Nenhuma manutenção cadastrada." />
              ) : (
                condominio.manutencoes.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4">
                    {manutencaoEditando === item.id ? (
                      <form onSubmit={salvarEdicaoManutencao} className="space-y-3">
                        <Field label="Título">
                          <input value={manutencaoEditForm.titulo} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, titulo: e.target.value }))} className={inputClass} required />
                        </Field>
                        <Field label="Tipo">
                          <select value={manutencaoEditForm.tipo} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, tipo: e.target.value }))} className={inputClass}>
                            <option value="Programada">Programada</option>
                            <option value="Corretiva">Corretiva</option>
                          </select>
                        </Field>
                        {manutencaoEditForm.tipo === 'Programada' && (
                          <Field label="Intervalo em meses">
                            <input type="number" min="1" value={manutencaoEditForm.intervalMeses} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, intervalMeses: e.target.value }))} className={inputClass} />
                          </Field>
                        )}
                        <Field label="Próxima data">
                          <input type="date" value={manutencaoEditForm.proximaData} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, proximaData: e.target.value }))} className={inputClass} />
                        </Field>
                        <Field label="Responsável">
                          <input value={manutencaoEditForm.responsavel} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, responsavel: e.target.value }))} className={inputClass} />
                        </Field>
                        <Field label="Status">
                          <select value={manutencaoEditForm.status} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
                            <option>Programada</option>
                            <option>Agendada</option>
                            <option>Pendente</option>
                            <option>Concluída</option>
                            <option>Não realizada</option>
                          </select>
                        </Field>
                        <div className="flex gap-2">
                          <SubmitButton label="Salvar" />
                          <button type="button" onClick={() => setManutencaoEditando(null)} className="w-full rounded-full border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                            <p className="text-xs text-[var(--muted)] mt-0.5">
                              {item.tipo === 'Corretiva' ? 'Corretiva' : `Programada${item.intervalMeses ? ` · a cada ${item.intervalMeses} mês(es)` : ''}`}
                              {item.frequencia ? ` · ${item.frequencia}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={item.status} />
                            <button type="button" onClick={() => abrirEdicaoManutencao(item)} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent-strong)] ring-1 ring-slate-200 transition hover:bg-slate-50">Editar</button>
                            <button type="button" onClick={() => { setHistoricoAberto(historicoAberto === item.id ? null : item.id); setHistoricoForm({ data: '', status: 'Concluída', executor: '', observacao: '' }) }} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100">Histórico</button>
                            <button type="button" onClick={() => excluirManutencao(item.id)} className="text-xs font-semibold text-red-400 hover:text-red-600">Excluir</button>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-[var(--muted)]">
                          {item.proximaData ? `Próxima: ${formatarData(item.proximaData)}` : 'Sem data definida'}
                          {item.responsavel ? ` · ${item.responsavel}` : ''}
                        </div>
                        {historicoAberto === item.id && (
                          <div className="mt-3 rounded-2xl border border-[var(--line)] bg-white p-4 space-y-3">
                            <p className="text-sm font-semibold text-[var(--ink)]">Registrar execução</p>
                            <form onSubmit={(e) => registrarHistorico(e, item.id)} className="space-y-2">
                              <div className="grid gap-2 sm:grid-cols-2">
                                <Field label="Data">
                                  <input type="date" value={historicoForm.data} onChange={(e) => setHistoricoForm((f) => ({ ...f, data: e.target.value }))} className={inputClass} required />
                                </Field>
                                <Field label="Status">
                                  <select value={historicoForm.status} onChange={(e) => setHistoricoForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
                                    <option>Concluída</option>
                                    <option>Não realizada</option>
                                    <option>Parcial</option>
                                  </select>
                                </Field>
                              </div>
                              <Field label="Executor">
                                <input value={historicoForm.executor} onChange={(e) => setHistoricoForm((f) => ({ ...f, executor: e.target.value }))} className={inputClass} placeholder="Nome do técnico ou empresa" />
                              </Field>
                              <Field label="Observação">
                                <input value={historicoForm.observacao} onChange={(e) => setHistoricoForm((f) => ({ ...f, observacao: e.target.value }))} className={inputClass} placeholder="Opcional" />
                              </Field>
                              <SubmitButton label="Salvar registro" />
                            </form>
                            {(item.historico || []).length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Registros anteriores</p>
                                {(item.historico || []).map((h) => (
                                  <div key={h.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-[var(--ink)]">{formatarData(h.data)}</span>
                                      <StatusBadge status={h.status} />
                                    </div>
                                    {h.executor && <p className="mt-1 text-[var(--muted)]">Executor: {h.executor}</p>}
                                    {h.observacao && <p className="mt-0.5 text-[var(--muted)]">{h.observacao}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </ContentPanel>
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
                    <button type="button" onClick={() => excluirConta(conta.id)} className="ml-auto text-xs font-semibold text-red-400 hover:text-red-600">Excluir</button>
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
            <div className="mb-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setManutencaoTipo('programadas')}
                className={
                  manutencaoTipo === 'programadas'
                    ? 'rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110'
                    : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--panel-strong)] ring-1 ring-slate-200 transition hover:bg-[var(--soft)]'
                }
              >
                Programadas
              </button>
              <button
                type="button"
                onClick={() => setManutencaoTipo('recorrentes')}
                className={
                  manutencaoTipo === 'recorrentes'
                    ? 'rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110'
                    : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--panel-strong)] ring-1 ring-slate-200 transition hover:bg-[var(--soft)]'
                }
              >
                Recorrentes
              </button>
            </div>

            {painelAberto === 'manutencao' ? (
              <InlineFormWrap>
                <FormPanel title="Nova manutenção" onSubmit={cadastrarManutencao} compact>
                  <Field label="Título">
                    <input value={manutencaoForm.titulo} onChange={(e) => atualizarForm(setManutencaoForm, 'titulo', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Tipo">
                    <select value={manutencaoForm.tipo} onChange={(e) => atualizarForm(setManutencaoForm, 'tipo', e.target.value)} className={inputClass}>
                      <option value="Programada">Programada — se repete (ex: gerador todo mês)</option>
                      <option value="Corretiva">Corretiva — ocorrência pontual (ex: cano estourou)</option>
                    </select>
                  </Field>
                  {manutencaoForm.tipo === 'Programada' && (
                    <>
                      <Field label="Frequência">
                        <select value={manutencaoForm.frequencia} onChange={(e) => atualizarForm(setManutencaoForm, 'frequencia', e.target.value)} className={inputClass}>
                          {frequenciasManutencao.map((f) => <option key={f}>{f}</option>)}
                        </select>
                      </Field>
                      <Field label="Intervalo em meses (ex: 12 para anual)">
                        <input type="number" min="1" value={manutencaoForm.intervalMeses} onChange={(e) => atualizarForm(setManutencaoForm, 'intervalMeses', e.target.value)} className={inputClass} />
                      </Field>
                    </>
                  )}
                  <Field label="Próxima data">
                    <input type="date" value={manutencaoForm.proximaData} onChange={(e) => atualizarForm(setManutencaoForm, 'proximaData', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Responsável">
                    <input value={manutencaoForm.responsavel} onChange={(e) => atualizarForm(setManutencaoForm, 'responsavel', e.target.value)} className={inputClass} required />
                  </Field>
                  <Field label="Status">
                    <select value={manutencaoForm.status} onChange={(e) => atualizarForm(setManutencaoForm, 'status', e.target.value)} className={inputClass}>
                      <option>Programada</option>
                      <option>Agendada</option>
                      <option>Pendente</option>
                      <option>Concluída</option>
                      <option>Não realizada</option>
                    </select>
                  </Field>
                  <SubmitButton label="Salvar manutenção" />
                </FormPanel>
              </InlineFormWrap>
            ) : null}

            {manutencaoTipo === 'programadas' ? (
              manutencoesProgramadas.length === 0 ? (
                <EmptyState text="Nenhuma manutenção programada encontrada para este condomínio." />
              ) : (
                <div className="space-y-3">
                  {manutencoesProgramadas.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4">
                      {manutencaoEditando === item.id ? (
                        <form onSubmit={salvarEdicaoManutencao} className="space-y-3">
                          <Field label="Título">
                            <input value={manutencaoEditForm.titulo} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, titulo: e.target.value }))} className={inputClass} required />
                          </Field>
                          <Field label="Tipo">
                            <select value={manutencaoEditForm.tipo} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, tipo: e.target.value }))} className={inputClass}>
                              <option value="Programada">Programada</option>
                              <option value="Corretiva">Corretiva</option>
                            </select>
                          </Field>
                          {manutencaoEditForm.tipo === 'Programada' && (
                            <Field label="Intervalo em meses">
                              <input type="number" min="1" value={manutencaoEditForm.intervalMeses} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, intervalMeses: e.target.value }))} className={inputClass} />
                            </Field>
                          )}
                          <Field label="Próxima data">
                            <input type="date" value={manutencaoEditForm.proximaData} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, proximaData: e.target.value }))} className={inputClass} />
                          </Field>
                          <Field label="Responsável">
                            <input value={manutencaoEditForm.responsavel} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, responsavel: e.target.value }))} className={inputClass} />
                          </Field>
                          <Field label="Status">
                            <select value={manutencaoEditForm.status} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
                              <option>Programada</option>
                              <option>Agendada</option>
                              <option>Pendente</option>
                              <option>Concluída</option>
                              <option>Não realizada</option>
                            </select>
                          </Field>
                          <div className="flex gap-2">
                            <SubmitButton label="Salvar" />
                            <button type="button" onClick={() => setManutencaoEditando(null)} className="w-full rounded-full border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                              <p className="text-xs text-[var(--muted)] mt-0.5">
                                {item.tipo === 'Corretiva' ? 'Corretiva' : `Programada${item.intervalMeses ? ` · a cada ${item.intervalMeses} mês(es)` : ''}`}
                                {item.frequencia ? ` · ${item.frequencia}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={item.status} />
                              <button type="button" onClick={() => abrirEdicaoManutencao(item)} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent-strong)] ring-1 ring-slate-200 transition hover:bg-slate-50">Editar</button>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-[var(--muted)]">
                            {item.proximaData ? `Próxima: ${formatarData(item.proximaData)}` : 'Sem data definida'}
                            {item.responsavel ? ` · ${item.responsavel}` : ''}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-5">
                {Object.entries(manutencoesRecorrentesPorFrequencia).map(([frequencia, itens]) => (
                  <div key={frequencia} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--soft)] p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-[var(--ink)]">{frequencia}</h3>
                      <span className="text-sm text-[var(--muted)]">{itens.length} item(ns)</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {itens.map((item) => (
                        <div key={item.id} className="rounded-2xl bg-white px-4 py-4 ring-1 ring-black/5">
                          {manutencaoEditando === item.id ? (
                            <form onSubmit={salvarEdicaoManutencao} className="space-y-3">
                              <Field label="Título">
                                <input value={manutencaoEditForm.titulo} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, titulo: e.target.value }))} className={inputClass} required />
                              </Field>
                              <Field label="Status">
                                <select value={manutencaoEditForm.status} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
                                  <option>Programada</option>
                                  <option>Agendada</option>
                                  <option>Pendente</option>
                                  <option>Concluída</option>
                                  <option>Não realizada</option>
                                </select>
                              </Field>
                              <Field label="Próxima data">
                                <input type="date" value={manutencaoEditForm.proximaData} onChange={(e) => setManutencaoEditForm((f) => ({ ...f, proximaData: e.target.value }))} className={inputClass} />
                              </Field>
                              <div className="flex gap-2">
                                <SubmitButton label="Salvar" />
                                <button type="button" onClick={() => setManutencaoEditando(null)} className="w-full rounded-full border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium text-[var(--ink)]">{item.titulo}</p>
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={item.status} />
                                  <button type="button" onClick={() => abrirEdicaoManutencao(item)} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-[var(--accent-strong)] ring-1 ring-slate-200 transition hover:bg-slate-100">Editar</button>
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-[var(--muted)]">Responsável: {item.responsavel}</p>
                              <p className="mt-1 text-sm text-[var(--muted)]">{item.proximaData ? `Próxima: ${formatarData(item.proximaData)}` : 'Sem data'}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-[var(--muted)]">{formatarData(aviso.data)}</p>
                      <button type="button" onClick={() => excluirAviso(aviso.id)} className="text-xs font-semibold text-red-400 hover:text-red-600">Excluir</button>
                    </div>
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
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-[var(--muted)]">
                        {formatarData(assembleia.data)} {assembleia.horario ? `| ${assembleia.horario}` : ''}
                      </p>
                      <button type="button" onClick={() => excluirAssembleia(assembleia.id)} className="text-xs font-semibold text-red-400 hover:text-red-600">Excluir</button>
                    </div>
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

        {secaoAtiva === 'lembretes' ? (
        <section id="lembretes">
          <ContentPanel title="Lembretes do condomínio">
            {lembretes.length === 0 ? (
              <EmptyState text="Nenhum lembrete ativo no momento. Cadastre contas, manutenções ou assembleias para ver avisos aqui." />
            ) : (
              <div className="space-y-4">
                {lembretes.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-5">
                    <p className="text-lg font-semibold text-[var(--ink)]">{item.titulo}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{item.detalhe}</p>
                  </div>
                ))}
              </div>
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

function StatusBadge({ status }) {
  const cls =
    status === 'Concluída' ? 'bg-emerald-100 text-emerald-700'
    : status === 'Não realizada' ? 'bg-red-100 text-red-700'
    : status === 'Agendada' ? 'bg-blue-100 text-blue-700'
    : status === 'Programada' ? 'bg-cyan-100 text-cyan-700'
    : 'bg-slate-100 text-slate-600'
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{status}</span>
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
