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
import { useSession } from '@/lib/useAuth'
import AdminShell from '@/views/components/admin-shell'
import DetalheModal from '@/views/components/detalhe-modal'
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
  registrarVisita,
  excluirVisita,
  editarVisita,
  atualizarCondominio,
  buscarCondominioPorSlug,
  calcularDiasParaData,
  descreverRecorrenciaConta,
  formatarData,
  formatarMoeda,
  frequenciasManutencao,
  normalizarConta,
  resumirUrgenciaConta,
} from '@/controllers/condominio'

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
  const [modalVisita, setModalVisita] = useState(false)
  const [visitaTipo, setVisitaTipo] = useState('normal')
  const [visitaMotivo, setVisitaMotivo] = useState('')
  const [visitaEditando, setVisitaEditando] = useState(null)
  const [visitaEditForm, setVisitaEditForm] = useState({ tipo: 'normal', motivo: '', observacao: '' })
  const [modal, setModal] = useState(null)

  function abrirModal(item, tipo) { setModal({ item, tipo }) }
  function fecharModal() { setModal(null); forceRefresh() }

  const { user } = useSession()
  const nomeUsuario = user?.user_metadata?.full_name || user?.email || 'Usuário'
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

  function fazerCheckin() {
    setVisitaTipo('normal')
    setVisitaMotivo('')
    setModalVisita(true)
  }

  function confirmarCheckin() {
    if (visitaTipo === 'urgencia' && !visitaMotivo.trim()) return
    const agora = new Date()
    const data = agora.toISOString().split('T')[0]
    const hora = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`
    registrarVisita(condominio.slug, {
      usuario: nomeUsuario,
      data,
      hora,
      motivo: visitaTipo === 'urgencia' ? visitaMotivo.trim() : 'Visita de rotina',
      tipo: visitaTipo,
    })
    setModalVisita(false)
    forceRefresh()
    alert(`Visita registrada com sucesso!\n\nUsuário: ${nomeUsuario}\nTipo: ${visitaTipo === 'urgencia' ? 'Urgência' : 'Rotina'}\nHora: ${hora}`)
  }

  function removerVisita(id) {
    if (!confirm('Excluir este registro de visita?')) return
    excluirVisita(condominio.slug, id)
    forceRefresh()
  }

  function abrirEdicaoVisita(v) {
    setVisitaEditando(v.id)
    setVisitaEditForm({ tipo: v.tipo || 'normal', motivo: v.motivo || '', observacao: v.observacao || '' })
  }

  function salvarEdicaoVisita(e) {
    e.preventDefault()
    editarVisita(condominio.slug, visitaEditando, {
      tipo: visitaEditForm.tipo,
      motivo: visitaEditForm.tipo === 'urgencia' ? visitaEditForm.motivo : 'Visita de rotina',
      observacao: visitaEditForm.observacao,
    }, nomeUsuario)
    setVisitaEditando(null)
    forceRefresh()
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
    { id: 'visitas', label: 'Visitas', helper: 'Check-in de visitas' },
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
          aria-current={secaoAtiva === 'visitas' ? 'page' : undefined}
          onClick={() => abrirSecao('visitas')}
          className={
            secaoAtiva === 'visitas'
              ? 'rounded-[1.5rem] bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] px-4 py-3 text-left text-white transition'
              : 'rounded-[1.5rem] bg-white/10 px-4 py-3 text-left text-white/82 transition hover:bg-white/16'
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Visitas</p>
              <p className="mt-1 text-xs text-white/62 hidden sm:block">Check-in de visitas</p>
            </div>
            <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold tracking-[0.25em] text-white/72">{(condominio.visitas || []).length.toString().padStart(2,'0')}</span>
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
    <div className="text-right text-sm">
      <p className="text-[var(--muted)]">{condominio.cidade}{condominio.sindico ? ` · Síndico: ${condominio.sindico}` : ''}</p>
      <p className="text-xs text-[var(--muted)] mt-0.5">{condominio.unidades} unidades</p>
    </div>
  )

  return (
    <>
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

            <div className="flex flex-wrap items-center gap-3">
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
              <span className="hidden lg:block h-6 w-px bg-slate-300" />
              <button
                type="button"
                onClick={fazerCheckin}
                className="rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                📍 Registrar visita
              </button>
              <Link
                href={`/condominios/${condominio.slug}/relatorio`}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                📄 Gerar relatório
              </Link>
            </div>
          </div>
        </section>

        {secaoAtiva === 'resumo' ? (
          <section id="resumo" className="space-y-3">

            {/* Contas */}
            <ContentPanel title="Contas" actionLabel="Nova conta" actionOpen={painelAberto === 'conta'} onActionToggle={() => setPainelAberto((a) => (a === 'conta' ? '' : 'conta'))}>
              {painelAberto === 'conta' && (
                <InlineFormWrap>
                  <FormPanel title="Nova conta" onSubmit={cadastrarConta} compact>
                    <Field label="Titulo"><input value={contaForm.titulo} onChange={(e) => atualizarForm(setContaForm, 'titulo', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Categoria"><input value={contaForm.categoria} onChange={(e) => atualizarForm(setContaForm, 'categoria', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Valor"><input type="number" step="0.01" value={contaForm.valor} onChange={(e) => atualizarForm(setContaForm, 'valor', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Vencimento"><input type="date" value={contaForm.vencimento} onChange={(e) => atualizarForm(setContaForm, 'vencimento', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Status"><select value={contaForm.status} onChange={(e) => atualizarForm(setContaForm, 'status', e.target.value)} className={inputClass}><option>Pendente</option><option>Agendada</option><option>Paga</option></select></Field>
                    <Field label="Recorrencia"><select value={contaForm.recorrencia} onChange={(e) => atualizarForm(setContaForm, 'recorrencia', e.target.value)} className={inputClass}><option value="nenhuma">Conta avulsa</option><option value="mensal-indeterminada">Todo mes por tempo indeterminado</option></select></Field>
                    {contaForm.recorrencia === 'mensal-indeterminada' && <Field label="Dia fixo do vencimento"><input type="number" min="1" max="31" value={contaForm.diaVencimento} onChange={(e) => atualizarForm(setContaForm, 'diaVencimento', e.target.value)} className={inputClass} required /></Field>}
                    <SubmitButton label="Salvar conta" />
                  </FormPanel>
                </InlineFormWrap>
              )}
              {contasNormalizadas.length === 0 ? <EmptyState text="Nenhuma conta cadastrada." /> : contasNormalizadas.slice(0, 3).map((conta) => (
                <button key={conta.id} onClick={() => abrirModal(conta, 'conta')} className="w-full flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-3 hover:bg-blue-50 hover:border-blue-200 transition text-left active:scale-95">
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--ink)] truncate">{conta.titulo}</p>
                    <p className="text-xs text-[var(--muted)]">Vence {formatarData(conta.proximoVencimento || conta.vencimento)} · {formatarMoeda(conta.valor)}</p>
                  </div>
                  <StatusPill tone={resumirUrgenciaConta(conta).tone}>{resumirUrgenciaConta(conta).label}</StatusPill>
                </button>
              ))}
              {contasNormalizadas.length > 3 && <button type="button" onClick={() => abrirSecao('contas')} className="w-full rounded-2xl border border-dashed border-[var(--line)] py-2 text-xs font-semibold text-[var(--accent-strong)] hover:bg-[var(--soft)]">Ver todas as {contasNormalizadas.length} contas →</button>}
            </ContentPanel>

            {/* Manutenções */}
            <ContentPanel title="Manutenções" actionLabel="Nova manutenção" actionOpen={painelAberto === 'manutencao'} onActionToggle={() => setPainelAberto((a) => (a === 'manutencao' ? '' : 'manutencao'))}>
              {painelAberto === 'manutencao' && (
                <InlineFormWrap>
                  <FormPanel title="Nova manutenção" onSubmit={cadastrarManutencao} compact>
                    <Field label="Título"><input value={manutencaoForm.titulo} onChange={(e) => atualizarForm(setManutencaoForm, 'titulo', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Tipo"><select value={manutencaoForm.tipo} onChange={(e) => atualizarForm(setManutencaoForm, 'tipo', e.target.value)} className={inputClass}><option value="Programada">Programada</option><option value="Corretiva">Corretiva</option></select></Field>
                    {manutencaoForm.tipo === 'Programada' && <><Field label="Frequência"><select value={manutencaoForm.frequencia} onChange={(e) => atualizarForm(setManutencaoForm, 'frequencia', e.target.value)} className={inputClass}>{frequenciasManutencao.map((f) => <option key={f}>{f}</option>)}</select></Field><Field label="Intervalo em meses"><input type="number" min="1" value={manutencaoForm.intervalMeses} onChange={(e) => atualizarForm(setManutencaoForm, 'intervalMeses', e.target.value)} className={inputClass} /></Field></>}
                    <Field label="Próxima data"><input type="date" value={manutencaoForm.proximaData} onChange={(e) => atualizarForm(setManutencaoForm, 'proximaData', e.target.value)} className={inputClass} /></Field>
                    <Field label="Responsável"><input value={manutencaoForm.responsavel} onChange={(e) => atualizarForm(setManutencaoForm, 'responsavel', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Status"><select value={manutencaoForm.status} onChange={(e) => atualizarForm(setManutencaoForm, 'status', e.target.value)} className={inputClass}><option>Programada</option><option>Agendada</option><option>Pendente</option><option>Concluída</option><option>Não realizada</option></select></Field>
                    <SubmitButton label="Salvar manutenção" />
                  </FormPanel>
                </InlineFormWrap>
              )}
              {condominio.manutencoes.length === 0 ? <EmptyState text="Nenhuma manutenção cadastrada." /> : condominio.manutencoes.slice(0, 3).map((item) => (
                <button key={item.id} onClick={() => abrirModal(item, 'manutencao')} className="w-full flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-3 hover:bg-blue-50 hover:border-blue-200 transition text-left active:scale-95">
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--ink)] truncate">{item.titulo}</p>
                    <p className="text-xs text-[var(--muted)]">{item.proximaData ? `Próxima: ${formatarData(item.proximaData)}` : 'Sem data'} · {item.responsavel || '—'}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </button>
              ))}
              {condominio.manutencoes.length > 3 && <button type="button" onClick={() => abrirSecao('manutencoes')} className="w-full rounded-2xl border border-dashed border-[var(--line)] py-2 text-xs font-semibold text-[var(--accent-strong)] hover:bg-[var(--soft)]">Ver todas as {condominio.manutencoes.length} manutenções →</button>}
            </ContentPanel>

            {/* Avisos */}
            <ContentPanel title="Avisos" actionLabel="Novo aviso" actionOpen={painelAberto === 'aviso'} onActionToggle={() => setPainelAberto((a) => (a === 'aviso' ? '' : 'aviso'))}>
              {painelAberto === 'aviso' && (
                <InlineFormWrap>
                  <FormPanel title="Novo aviso" onSubmit={cadastrarAviso} compact>
                    <Field label="Titulo"><input value={avisoForm.titulo} onChange={(e) => atualizarForm(setAvisoForm, 'titulo', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Data"><input type="date" value={avisoForm.data} onChange={(e) => atualizarForm(setAvisoForm, 'data', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Descricao"><textarea value={avisoForm.descricao} onChange={(e) => atualizarForm(setAvisoForm, 'descricao', e.target.value)} className={`${inputClass} min-h-20`} required /></Field>
                    <SubmitButton label="Salvar aviso" />
                  </FormPanel>
                </InlineFormWrap>
              )}
              {condominio.avisos.length === 0 ? <EmptyState text="Nenhum aviso cadastrado." /> : condominio.avisos.slice(0, 3).map((aviso) => (
                <button key={aviso.id} onClick={() => abrirModal(aviso, 'aviso')} className="w-full rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-3 hover:bg-blue-50 hover:border-blue-200 transition text-left active:scale-95">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[var(--ink)] truncate">{aviso.titulo}</p>
                    <p className="shrink-0 text-xs text-[var(--muted)]">{formatarData(aviso.data)}</p>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">{aviso.descricao}</p>
                </button>
              ))}
              {condominio.avisos.length > 3 && <button type="button" onClick={() => abrirSecao('avisos')} className="w-full rounded-2xl border border-dashed border-[var(--line)] py-2 text-xs font-semibold text-[var(--accent-strong)] hover:bg-[var(--soft)]">Ver todos os {condominio.avisos.length} avisos →</button>}
            </ContentPanel>

            {/* Assembleias */}
            <ContentPanel title="Assembleias" actionLabel="Nova assembleia" actionOpen={painelAberto === 'assembleia'} onActionToggle={() => setPainelAberto((a) => (a === 'assembleia' ? '' : 'assembleia'))}>
              {painelAberto === 'assembleia' && (
                <InlineFormWrap>
                  <FormPanel title="Nova assembleia" onSubmit={cadastrarAssembleia} compact>
                    <Field label="Titulo"><input value={assembleiaForm.titulo} onChange={(e) => atualizarForm(setAssembleiaForm, 'titulo', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Data"><input type="date" value={assembleiaForm.data} onChange={(e) => atualizarForm(setAssembleiaForm, 'data', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Horario"><input type="time" value={assembleiaForm.horario} onChange={(e) => atualizarForm(setAssembleiaForm, 'horario', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Local"><input value={assembleiaForm.local} onChange={(e) => atualizarForm(setAssembleiaForm, 'local', e.target.value)} className={inputClass} required /></Field>
                    <Field label="Pauta"><textarea value={assembleiaForm.pauta} onChange={(e) => atualizarForm(setAssembleiaForm, 'pauta', e.target.value)} className={`${inputClass} min-h-20`} required /></Field>
                    <SubmitButton label="Salvar assembleia" />
                  </FormPanel>
                </InlineFormWrap>
              )}
              {!condominio.assembleias?.length ? <EmptyState text="Nenhuma assembleia cadastrada." /> : condominio.assembleias.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[var(--ink)] truncate">{a.titulo}</p>
                    <p className="shrink-0 text-xs text-[var(--muted)]">{formatarData(a.data)}{a.horario ? ` · ${a.horario}` : ''}</p>
                  </div>
                  {a.local && <p className="mt-1 text-xs text-[var(--muted)]">Local: {a.local}</p>}
                </div>
              ))}
              {(condominio.assembleias?.length || 0) > 3 && <button type="button" onClick={() => abrirSecao('assembleias')} className="w-full rounded-2xl border border-dashed border-[var(--line)] py-2 text-xs font-semibold text-[var(--accent-strong)] hover:bg-[var(--soft)]">Ver todas as {condominio.assembleias.length} assembleias →</button>}
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

        {secaoAtiva === 'visitas' ? (
        <section id="visitas">
          <ContentPanel
            title="Visitas realizadas"
            actionLabel="Fazer check-in agora"
            actionOpen={false}
            onActionToggle={fazerCheckin}
          >
            {!(condominio.visitas || []).length ? (
              <EmptyState text="Nenhuma visita registrada. Clique em 'Fazer check-in agora' para registrar sua visita." />
            ) : (
              <div className="space-y-3">
                {(condominio.visitas || []).map((v) => (
                  <div key={v.id} className={`rounded-2xl border p-4 ${
                    v.tipo === 'urgencia'
                      ? 'border-red-200 bg-red-50'
                      : 'border-[var(--line)] bg-[var(--soft)]'
                  }`}>
                    {visitaEditando === v.id ? (
                      <form onSubmit={salvarEdicaoVisita} className="space-y-3">
                        <Field label="Tipo de visita">
                          <select value={visitaEditForm.tipo} onChange={(e) => setVisitaEditForm((f) => ({ ...f, tipo: e.target.value, motivo: '' }))} className={inputClass}>
                            <option value="normal">Diária normal</option>
                            <option value="urgencia">Urgência</option>
                          </select>
                        </Field>
                        {visitaEditForm.tipo === 'urgencia' && (
                          <Field label="Motivo da urgência">
                            <input value={visitaEditForm.motivo} onChange={(e) => setVisitaEditForm((f) => ({ ...f, motivo: e.target.value }))} className={inputClass} placeholder="Ex: Cano estourado, falta de energia..." required />
                          </Field>
                        )}
                        <Field label="Observação adicional">
                          <input value={visitaEditForm.observacao} onChange={(e) => setVisitaEditForm((f) => ({ ...f, observacao: e.target.value }))} className={inputClass} placeholder="Opcional" />
                        </Field>
                        <div className="flex gap-2">
                          <SubmitButton label="Salvar edição" />
                          <button type="button" onClick={() => setVisitaEditando(null)} className="w-full rounded-full border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-[var(--ink)]">👤 {v.usuario}</p>
                            {v.tipo === 'urgencia'
                              ? <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">⚠️ Urgência</span>
                              : <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">✅ Rotina</span>
                            }
                          </div>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {formatarData(v.data)}{v.hora ? ` · ${v.hora}` : ''}
                          </p>
                          {v.motivo && v.tipo === 'urgencia' && (
                            <p className="mt-1 text-sm font-medium text-red-700">Motivo: {v.motivo}</p>
                          )}
                          {v.observacao && (
                            <p className="mt-1 text-sm text-[var(--muted)]">Obs: {v.observacao}</p>
                          )}
                          {v.editadoPor && (
                            <p className="mt-1 text-xs text-[var(--muted)]">✏️ Editado por {v.editadoPor}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <button type="button" onClick={() => abrirEdicaoVisita(v)} className="text-xs font-semibold text-[var(--accent-strong)] hover:underline">Editar</button>
                          <button type="button" onClick={() => removerVisita(v.id)} className="text-xs font-semibold text-red-400 hover:text-red-600">Excluir</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-[var(--muted)]">
                  Total de visitas: <strong>{(condominio.visitas || []).length}</strong>
                  {' · '}
                  Urgências: <strong className="text-red-600">{(condominio.visitas || []).filter(v => v.tipo === 'urgencia').length}</strong>
                </div>
              </div>
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

    {modal && <DetalheModal item={modal.item} tipo={modal.tipo} slug={condominio.slug} onClose={fecharModal} onSaved={fecharModal} />}

    {modalVisita && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4"
        onClick={(e) => e.target === e.currentTarget && setModalVisita(false)}
      >
        <div className="w-full max-w-xs rounded-2xl bg-white shadow-2xl overflow-hidden">

          {/* Topo */}
          <div className="flex items-center justify-between bg-[var(--panel-strong)] px-4 py-2.5">
            <div>
              <p className="text-xs font-bold text-white leading-tight">{nomeUsuario}</p>
              <p className="text-[10px] text-white/50">{new Date().toLocaleDateString('pt-BR')} · {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <button type="button" onClick={() => setModalVisita(false)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white text-base leading-none">×</button>
          </div>

          <div className="px-4 py-3 space-y-3">
            {/* Tipo */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setVisitaTipo('normal'); setVisitaMotivo('') }}
                className={`rounded-xl border-2 px-2 py-2 text-center active:scale-95 transition ${
                  visitaTipo === 'normal' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className="text-base">🗓️</p>
                <p className="text-xs font-semibold text-[var(--ink)] mt-0.5">Normal</p>
              </button>
              <button
                type="button"
                onClick={() => setVisitaTipo('urgencia')}
                className={`rounded-xl border-2 px-2 py-2 text-center active:scale-95 transition ${
                  visitaTipo === 'urgencia' ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className="text-base">⚠️</p>
                <p className="text-xs font-semibold text-[var(--ink)] mt-0.5">Urgência</p>
              </button>
            </div>

            {/* Motivo */}
            {visitaTipo === 'urgencia' && (
              <input
                type="text"
                value={visitaMotivo}
                onChange={(e) => setVisitaMotivo(e.target.value)}
                placeholder="Descreva o motivo *"
                className="w-full rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-sm outline-none focus:border-red-400"
                autoFocus
              />
            )}

            {/* Botões */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalVisita(false)}
                className="flex-1 rounded-full border border-slate-200 py-2 text-sm font-semibold text-slate-600 active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarCheckin}
                disabled={visitaTipo === 'urgencia' && !visitaMotivo.trim()}
                className={`flex-1 rounded-full py-2 text-sm font-semibold text-white active:scale-95 transition ${
                  visitaTipo === 'urgencia'
                    ? 'bg-red-500 disabled:opacity-40'
                    : 'bg-[var(--panel-strong)]'
                }`}
              >
                {visitaTipo === 'urgencia' ? 'Registrar' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
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
    : status === 'Pago' || status === 'Paga' ? 'bg-emerald-100 text-emerald-700'
    : status === 'Não realizada' || status === 'Atrasada' ? 'bg-red-100 text-red-700'
    : status === 'Pendente' ? 'bg-amber-100 text-amber-700'
    : status === 'Agendada' ? 'bg-blue-100 text-blue-700'
    : status === 'Programada' ? 'bg-cyan-100 text-cyan-700'
    : 'bg-slate-100 text-slate-600'
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{status}</span>
  )
}

function StatusPill({ tone, children }) {
  const toneClass =
    tone === 'red' ? 'bg-red-100 text-red-700'
    : tone === 'amber' ? 'bg-amber-100 text-amber-700'
    : tone === 'emerald' ? 'bg-emerald-100 text-emerald-700'
    : 'bg-slate-100 text-slate-700'
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  )
}
