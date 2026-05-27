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
  formatarMoeda,
  formatarData,
  calcularProximoVencimentoConta,
  normalizarConta,
  descreverRecorrenciaConta,
  calcularDiasParaData,
  resumirUrgenciaConta,
  resumirDashboard,
  buscarCondominioPorSlug
} from '@/lib/condominios'

export { 
  listarCondominios, 
  buscarCondominioPorSlug, 
  atualizarCondominio, 
  frequenciasManutencao,
  formatarMoeda,
  formatarData,
  calcularProximoVencimentoConta,
  normalizarConta,
  descreverRecorrenciaConta,
  calcularDiasParaData,
  resumirUrgenciaConta,
  resumirDashboard
} from '@/lib/condominios'

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
    manutencoes: [],
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

function extrairDia(data) {
  if (!data || !String(data).includes('-')) return '01'
  return String(data).split('-')[2]
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

export function adicionarDocumentoAoCondominio(slug, dados) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    documentos: [
      { id: criarId('doc'), titulo: dados.titulo, tipo: dados.tipo, data: dados.data, arquivo: dados.arquivo },
      ...(c.documentos || []),
    ],
  }))
}

export function excluirDocumentoDoCondominio(slug, id) {
  return atualizarCondominio(slug, (c) => ({
    ...c,
    documentos: (c.documentos || []).filter((d) => d.id !== id),
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
