/**
 * models/condominio.js
 * MODEL — Dados e persistência dos condomínios (localStorage)
 */

const STORAGE_KEY = 'gestao-condominio:condominios'

export const frequenciasManutencao = ['Diaria', 'Mensal', 'Trimestral', 'Semestral', 'Anual']

const condominiosBase = [
  {
    id: 'cond-vista-parque',
    slug: 'vista-parque',
    nome: 'Condominio Vista Parque',
    cidade: 'Fortaleza',
    sindico: 'Marina Alves',
    unidades: 84,
    contas: [
      { id: 'vp-conta-1', titulo: 'Energia das areas comuns', categoria: 'Conta fixa', valor: 1840, vencimento: '2026-05-08', status: 'Pendente', recorrencia: 'nenhuma' },
      { id: 'vp-conta-2', titulo: 'Contrato de limpeza', categoria: 'Servico', valor: 2450, vencimento: '2026-05-13', status: 'Agendada', recorrencia: 'mensal-indeterminada', diaVencimento: 15 },
    ],
    avisos: [
      { id: 'vp-aviso-1', titulo: 'Lavagem da garagem', data: '2026-05-10', descricao: 'A garagem sera interditada por bloco das 8h as 12h.' },
      { id: 'vp-aviso-2', titulo: 'Assembleia extraordinaria', data: '2026-05-18', descricao: 'Reuniao para aprovacao do orcamento do segundo semestre.' },
    ],
    manutencoes: [
      { id: 'vp-man-1', titulo: 'Inspecao da portaria', frequencia: 'Diaria', proximaData: '2026-05-06', responsavel: 'Equipe interna', status: 'Programada' },
      { id: 'vp-man-2', titulo: 'Limpeza da caixa d agua', frequencia: 'Semestral', proximaData: '2026-06-15', responsavel: 'Acqua Service', status: 'Agendada' },
      { id: 'vp-man-3', titulo: 'Revisao dos extintores', frequencia: 'Anual', proximaData: '2026-09-04', responsavel: 'Fogo Zero', status: 'Pendente' },
    ],
    assembleias: [
      { id: 'vp-ass-1', titulo: 'Assembleia ordinaria', data: '2026-05-28', horario: '19:30', local: 'Salao de festas', pauta: 'Prestacao de contas e aprovacao do fundo de reserva.' },
    ],
  },
  {
    id: 'cond-jardins-do-lago',
    slug: 'jardins-do-lago',
    nome: 'Condominio Jardins do Lago',
    cidade: 'Aquiraz',
    sindico: 'Paulo Mendes',
    unidades: 132,
    contas: [
      { id: 'jl-conta-1', titulo: 'Manutencao dos elevadores', categoria: 'Contrato', valor: 3200, vencimento: '2026-05-09', status: 'Pendente', recorrencia: 'nenhuma' },
      { id: 'jl-conta-2', titulo: 'Internet da portaria', categoria: 'Conta fixa', valor: 389, vencimento: '2026-05-20', status: 'Agendada', recorrencia: 'mensal-indeterminada', diaVencimento: 20 },
    ],
    avisos: [
      { id: 'jl-aviso-1', titulo: 'Teste do gerador', data: '2026-05-07', descricao: 'Havera interrupcao breve de energia para validacao do gerador.' },
    ],
    manutencoes: [
      { id: 'jl-man-1', titulo: 'Ronda das bombas', frequencia: 'Diaria', proximaData: '2026-05-06', responsavel: 'Zeladoria', status: 'Programada' },
      { id: 'jl-man-2', titulo: 'Revisao do portao automatico', frequencia: 'Mensal', proximaData: '2026-05-12', responsavel: 'Porto Acesso', status: 'Agendada' },
      { id: 'jl-man-3', titulo: 'Dedetizacao', frequencia: 'Trimestral', proximaData: '2026-07-01', responsavel: 'Controle Ambiental', status: 'Pendente' },
    ],
    assembleias: [
      { id: 'jl-ass-1', titulo: 'Assembleia de manutencao', data: '2026-06-06', horario: '18:45', local: 'Espaco gourmet', pauta: 'Aprovacao da reforma da guarita e do cronograma semestral.' },
    ],
  },
]

function isClient() {
  return typeof window !== 'undefined'
}

export function criarId(prefixo) {
  return `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export function listarCondominios() {
  try {
    if (isClient()) {
      const salvo = window.localStorage.getItem(STORAGE_KEY)
      if (salvo) {
        const parsed = JSON.parse(salvo)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    }
  } catch (error) {
    console.warn('Erro ao carregar dados do localStorage:', error)
  }
  return condominiosBase
}

export function salvarCondominios(condominios) {
  if (!isClient()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(condominios))
}

export function buscarCondominioPorSlug(slug) {
  return listarCondominios().find((item) => item.slug === slug) || null
}

export function atualizarCondominio(slug, atualizador) {
  const condominios = listarCondominios()
  let atualizado = null
  const proximos = condominios.map((item) => {
    if (item.slug !== slug) return item
    atualizado = typeof atualizador === 'function' ? atualizador(item) : { ...item, ...atualizador }
    return atualizado
  })
  salvarCondominios(proximos)
  return atualizado
}
