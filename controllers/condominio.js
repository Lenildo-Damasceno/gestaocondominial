/**
 * controllers/condominio.js
 * CONTROLLER — Lógica de negócio, formatação e operações sobre condomínios
 */

import {
  listarCondominios,
  salvarCondominios,
  atualizarCondominio,
  criarId,
  frequenciasManutencao,
} from '@/models/condominio'

export { listarCondominios, buscarCondominioPorSlug, atualizarCondominio, frequenciasManutencao } from '@/models/condominio'

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function criarCondominio({ nome, cnpj, sindico, unidades, cep, logradouro, numero, complemento, bairro, cidade, estado }) {
  const slug = slugify(nome)
  return {
    id: `cond-${slug}-${Date.now()}`,
    slug,
    nome,
    cnpj: cnpj || '',
    sindico,
    unidades: Number(unidades) || 0,
    cep: cep || '',
    logradouro: logradouro || '',
    numero: numero || '',
    complemento: complemento || '',
    bairro: bairro || '',
    cidade: cidade || '',
    estado: estado || '',
    contas: [],
    avisos: [],
    assembleias: [],
    manutencoes: frequenciasManutencao.map((frequencia, index) => ({
      id: `${slug}-man-${index + 1}`,
      titulo: `Planejar manutencao ${frequencia.toLowerCase()}`,
      frequencia,
      proximaData: '',
      responsavel: 'Definir fornecedor',
      status: 'Pendente',
    })),
  }
}

export function adicionarCondominio(dados) {
  const condominios = listarCondominios()
  const novo = criarCondominio(dados)
  salvarCondominios([novo, ...condominios])
  return novo
}

export function excluirCondominio(slug) {
  const condominios = listarCondominios()
  const atualizados = condominios.filter((item) => item.slug !== slug)
  salvarCondominios(atualizados)
  return atualizados
}

export function adicionarContaAoCondominio(slug, dados) {
  const recorrencia = dados.recorrencia || 'nenhuma'
  const diaVencimento = recorrencia === 'mensal-indeterminada'
    ? Number(dados.diaVencimento || extrairDia(dados.vencimento))
    : null
  return atualizarCondominio(slug, (c) => ({
    ...c,
    contas: [{ id: criarId('conta'), titulo: dados.titulo, categoria: dados.categoria, valor: Number(dados.valor) || 0, vencimento: dados.vencimento, status: dados.status, recorrencia, diaVencimento }, ...c.contas],
  }))
}

export function excluirContaDoCondominio(slug, id) {
  return atualizarCondominio(slug, (c) => ({ ...c, contas: c.contas.filter((item) => item.id !== id) }))
}

export function editarContaDoCondominio(slug, id, dados) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    contas: c.contas.map((item) => item.id === id ? { ...item, ...dados } : item),
  }))
}

export function adicionarAvisoAoCondominio(slug, dados) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    avisos: [{ id: criarId('aviso'), titulo: dados.titulo, data: dados.data, descricao: dados.descricao }, ...c.avisos],
  }))
}

export function excluirAvisoDoCondominio(slug, id) {
  return atualizarCondominio(slug, (c) => ({ ...c, avisos: c.avisos.filter((item) => item.id !== id) }))
}

export function editarAvisoDoCondominio(slug, id, dados) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    avisos: c.avisos.map((item) => item.id === id ? { ...item, ...dados } : item),
  }))
}

export function adicionarAssembleiaAoCondominio(slug, dados) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    assembleias: [{ id: criarId('assembleia'), titulo: dados.titulo, data: dados.data, horario: dados.horario, local: dados.local, pauta: dados.pauta }, ...c.assembleias],
  }))
}

export function excluirAssembleiaDoCondominio(slug, id) {
  return atualizarCondominio(slug, (c) => ({ ...c, assembleias: c.assembleias.filter((item) => item.id !== id) }))
}

export function adicionarManutencaoAoCondominio(slug, dados) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    manutencoes: [
      {
        id: criarId('manutencao'),
        titulo: dados.titulo,
        tipo: dados.tipo || 'Programada',
        frequencia: dados.frequencia,
        intervalMeses: dados.tipo === 'Programada' ? Number(dados.intervalMeses) || null : null,
        proximaData: dados.proximaData,
        responsavel: dados.responsavel,
        status: dados.status,
      },
      ...c.manutencoes,
    ],
  }))
}

export function editarManutencaoDoCondominio(slug, id, dados) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    manutencoes: c.manutencoes.map((item) => item.id === id ? { ...item, ...dados } : item),
  }))
}

export function excluirManutencaoDoCondominio(slug, id) {
  return atualizarCondominio(slug, (c) => ({ ...c, manutencoes: c.manutencoes.filter((item) => item.id !== id) }))
}

export function registrarHistoricoManutencao(slug, manutencaoId, registro) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    manutencoes: c.manutencoes.map((item) =>
      item.id === manutencaoId
        ? { ...item, historico: [{ id: criarId('hist'), data: registro.data, status: registro.status, observacao: registro.observacao || '', executor: registro.executor || '' }, ...(item.historico || [])] }
        : item
    ),
  }))
}

export function registrarVisita(slug, dados) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    visitas: [
      { id: criarId('visita'), usuario: dados.usuario, data: dados.data, hora: dados.hora || '', motivo: dados.motivo || '', observacao: dados.observacao || '' },
      ...(c.visitas || []),
    ],
  }))
}

export function excluirVisita(slug, id) {
  return atualizarCondominio(slug, (c) => ({ ...c, visitas: (c.visitas || []).filter((v) => v.id !== id) }))
}

export function editarVisita(slug, id, dados, usuarioEdicao) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    visitas: (c.visitas || []).map((v) =>
      v.id === id
        ? { ...v, ...dados, editadoPor: usuarioEdicao, editadoEm: new Date().toISOString() }
        : v
    ),
  }))
}

// ─── Formatação ───────────────────────────────────────────────────────────────

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0)
}

export function formatarData(data) {
  if (!data) return 'Definir data'
  try {
    const date = new Date(`${data}T00:00:00`)
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
  } catch {
    return 'Data inválida'
  }
}

function extrairDia(data) {
  if (!data || !String(data).includes('-')) return ''
  return String(data).split('-')[2]
}

function ajustarDiaNoMes(ano, mesIndex, dia) {
  const ultimoDia = new Date(ano, mesIndex + 1, 0).getDate()
  return Math.min(Math.max(Number(dia) || 1, 1), ultimoDia)
}

function formatarIsoData(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

export function calcularProximoVencimentoConta(conta, referencia = new Date()) {
  if (conta.recorrencia !== 'mensal-indeterminada') return conta.vencimento
  const dia = Number(conta.diaVencimento || extrairDia(conta.vencimento) || 1)
  const anoAtual = referencia.getFullYear()
  const mesAtual = referencia.getMonth()
  const hoje = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate())
  const diaNoMesAtual = ajustarDiaNoMes(anoAtual, mesAtual, dia)
  const dataAtual = new Date(anoAtual, mesAtual, diaNoMesAtual)
  if (dataAtual >= hoje) return formatarIsoData(dataAtual)
  const proximoMes = mesAtual === 11 ? 0 : mesAtual + 1
  const proximoAno = mesAtual === 11 ? anoAtual + 1 : anoAtual
  return formatarIsoData(new Date(proximoAno, proximoMes, ajustarDiaNoMes(proximoAno, proximoMes, dia)))
}

export function normalizarConta(conta) {
  let proximoVencimento = conta.proximoVencimento
  if (!proximoVencimento && conta.recorrencia === 'mensal-indeterminada') {
    proximoVencimento = calcularProximoVencimentoConta(conta)
  }
  return { ...conta, recorrencia: conta.recorrencia || 'nenhuma', diaVencimento: conta.diaVencimento || Number(extrairDia(conta.vencimento) || 0) || null, proximoVencimento }
}

export function descreverRecorrenciaConta(conta) {
  if (conta.recorrencia === 'mensal-indeterminada') return `Todo dia ${conta.diaVencimento} por tempo indeterminado`
  return 'Conta avulsa'
}

export function calcularDiasParaData(data, referencia = null) {
  if (!data) return null
  const hoje = referencia || new Date()
  const referenciaDate = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const alvo = new Date(`${data}T00:00:00`)
  return Math.round((alvo.getTime() - referenciaDate.getTime()) / 86400000)
}

export function resumirUrgenciaConta(conta) {
  if (conta.status === 'Pago' || conta.status === 'Paga') return { label: 'Pago', tone: 'emerald' }
  const diasRestantes = calcularDiasParaData(conta.proximoVencimento || conta.vencimento)
  if (diasRestantes === null) return { label: 'Sem data', tone: 'slate' }
  if (diasRestantes < 0) return { label: `Atrasada ha ${Math.abs(diasRestantes)} dia(s)`, tone: 'red' }
  if (diasRestantes === 0) return { label: 'Vence hoje', tone: 'amber' }
  if (diasRestantes <= 7) return { label: `Vence em ${diasRestantes} dia(s)`, tone: 'amber' }
  return { label: `Vence em ${diasRestantes} dia(s)`, tone: 'emerald' }
}

export function resumirDashboard(condominios) {
  const contas = condominios.flatMap((item) => item.contas.map((conta) => ({ ...conta, condominio: item.nome, slug: item.slug })))
  const avisos = condominios.flatMap((item) => item.avisos.map((aviso) => ({ ...aviso, condominio: item.nome, slug: item.slug })))
  const manutencoes = condominios.flatMap((item) => item.manutencoes.map((m) => ({ ...m, condominio: item.nome, slug: item.slug })))
  const assembleias = condominios.flatMap((item) => (item.assembleias || []).map((a) => ({ ...a, condominio: item.nome, slug: item.slug })))

  const STATUS_CRITICO = ['Não realizada', 'Pendente', 'Atrasada']

  return {
    totalCondominios: condominios.length,
    totalUnidades: condominios.reduce((acc, item) => acc + (item.unidades || 0), 0),
    contasPendentes: contas.filter((item) => item.status !== 'Pago').length,
    contasRecorrentes: contas.filter((item) => item.recorrencia === 'mensal-indeterminada').length,
    manutencoesProximas: manutencoes.filter((item) => item.proximaData).length,
    manutencoesAtrasadas: manutencoes.filter((item) => STATUS_CRITICO.includes(item.status)).length,
    proximasContas: [...contas].sort((a, b) => String(a.vencimento).localeCompare(String(b.vencimento))).slice(0, 5),
    proximasManutencoes: [...manutencoes].filter((item) => item.proximaData).sort((a, b) => String(a.proximaData).localeCompare(String(b.proximaData))).slice(0, 6),
    manutencoesAlerta: manutencoes.filter((item) => STATUS_CRITICO.includes(item.status)).slice(0, 6),
    proximosAvisos: [...avisos].sort((a, b) => String(a.data).localeCompare(String(b.data))).slice(0, 5),
    proximaAssembleia: [...assembleias].sort((a, b) => String(a.data).localeCompare(String(b.data))).find((item) => item.data) || null,
  }
}
