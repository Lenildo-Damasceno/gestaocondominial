const STORAGE_KEY = 'gestao-condominio:condominios'

const condominiosBase = [
  {
    id: 'cond-vista-parque',
    slug: 'vista-parque',
    nome: 'Condominio Vista Parque',
    cidade: 'Fortaleza',
    sindico: 'Marina Alves',
    unidades: 84,
    contas: [
      {
        id: 'vp-conta-1',
        titulo: 'Energia das areas comuns',
        categoria: 'Conta fixa',
        valor: 1840,
        vencimento: '2026-05-08',
        status: 'Pendente',
        recorrencia: 'nenhuma',
      },
      {
        id: 'vp-conta-2',
        titulo: 'Contrato de limpeza',
        categoria: 'Servico',
        valor: 2450,
        vencimento: '2026-05-13',
        status: 'Agendada',
        recorrencia: 'mensal-indeterminada',
        diaVencimento: 15,
      },
    ],
    avisos: [
      {
        id: 'vp-aviso-1',
        titulo: 'Lavagem da garagem',
        data: '2026-05-10',
        descricao: 'A garagem sera interditada por bloco das 8h as 12h.',
      },
      {
        id: 'vp-aviso-2',
        titulo: 'Assembleia extraordinaria',
        data: '2026-05-18',
        descricao: 'Reuniao para aprovacao do orcamento do segundo semestre.',
      },
    ],
    manutencoes: [
      {
        id: 'vp-man-1',
        titulo: 'Inspecao da portaria',
        frequencia: 'Diaria',
        proximaData: '2026-05-06',
        responsavel: 'Equipe interna',
        status: 'Programada',
      },
      {
        id: 'vp-man-2',
        titulo: 'Limpeza da caixa d agua',
        frequencia: 'Semestral',
        proximaData: '2026-06-15',
        responsavel: 'Acqua Service',
        status: 'Agendada',
      },
      {
        id: 'vp-man-3',
        titulo: 'Revisao dos extintores',
        frequencia: 'Anual',
        proximaData: '2026-09-04',
        responsavel: 'Fogo Zero',
        status: 'Pendente',
      },
    ],
    assembleias: [
      {
        id: 'vp-ass-1',
        titulo: 'Assembleia ordinaria',
        data: '2026-05-28',
        horario: '19:30',
        local: 'Salao de festas',
        pauta: 'Prestacao de contas e aprovacao do fundo de reserva.',
      },
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
      {
        id: 'jl-conta-1',
        titulo: 'Manutencao dos elevadores',
        categoria: 'Contrato',
        valor: 3200,
        vencimento: '2026-05-09',
        status: 'Pendente',
        recorrencia: 'nenhuma',
      },
      {
        id: 'jl-conta-2',
        titulo: 'Internet da portaria',
        categoria: 'Conta fixa',
        valor: 389,
        vencimento: '2026-05-20',
        status: 'Agendada',
        recorrencia: 'mensal-indeterminada',
        diaVencimento: 20,
      },
    ],
    avisos: [
      {
        id: 'jl-aviso-1',
        titulo: 'Teste do gerador',
        data: '2026-05-07',
        descricao: 'Havera interrupcao breve de energia para validacao do gerador.',
      },
    ],
    manutencoes: [
      {
        id: 'jl-man-1',
        titulo: 'Ronda das bombas',
        frequencia: 'Diaria',
        proximaData: '2026-05-06',
        responsavel: 'Zeladoria',
        status: 'Programada',
      },
      {
        id: 'jl-man-2',
        titulo: 'Revisao do portao automatico',
        frequencia: 'Mensal',
        proximaData: '2026-05-12',
        responsavel: 'Porto Acesso',
        status: 'Agendada',
      },
      {
        id: 'jl-man-3',
        titulo: 'Dedetizacao',
        frequencia: 'Trimestral',
        proximaData: '2026-07-01',
        responsavel: 'Controle Ambiental',
        status: 'Pendente',
      },
    ],
    assembleias: [
      {
        id: 'jl-ass-1',
        titulo: 'Assembleia de manutencao',
        data: '2026-06-06',
        horario: '18:45',
        local: 'Espaco gourmet',
        pauta: 'Aprovacao da reforma da guarita e do cronograma semestral.',
      },
    ],
  },
]

export const frequenciasManutencao = [
  'Diaria',
  'Mensal',
  'Trimestral',
  'Semestral',
  'Anual',
]

function isClient() {
  return typeof window !== 'undefined'
}

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function criarId(prefixo) {
  return `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export function listarCondominios() {
  if (!isClient()) {
    return condominiosBase
  }

  const salvo = window.localStorage.getItem(STORAGE_KEY)

  if (!salvo) {
    return condominiosBase
  }

  try {
    const parsed = JSON.parse(salvo)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : condominiosBase
  } catch {
    return condominiosBase
  }
}

export function salvarCondominios(condominios) {
  if (!isClient()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(condominios))
}

export function criarCondominio({ nome, cidade, sindico, unidades }) {
  const slug = slugify(nome)

  return {
    id: `cond-${slug}-${Date.now()}`,
    slug,
    nome,
    cidade,
    sindico,
    unidades: Number(unidades) || 0,
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

export function buscarCondominioPorSlug(slug) {
  return listarCondominios().find((item) => item.slug === slug) || null
}

export function atualizarCondominio(slug, atualizador) {
  const condominios = listarCondominios()
  let atualizado = null

  const proximos = condominios.map((item) => {
    if (item.slug !== slug) {
      return item
    }

    atualizado =
      typeof atualizador === 'function' ? atualizador(item) : { ...item, ...atualizador }

    return atualizado
  })

  salvarCondominios(proximos)
  return atualizado
}

export function adicionarContaAoCondominio(slug, dados) {
  const recorrencia = dados.recorrencia || 'nenhuma'
  const diaVencimento =
    recorrencia === 'mensal-indeterminada'
      ? Number(dados.diaVencimento || extrairDia(dados.vencimento))
      : null

  return atualizarCondominio(slug, (condominio) => ({
    ...condominio,
    contas: [
      {
        id: criarId('conta'),
        titulo: dados.titulo,
        categoria: dados.categoria,
        valor: Number(dados.valor) || 0,
        vencimento: dados.vencimento,
        status: dados.status,
        recorrencia,
        diaVencimento,
      },
      ...condominio.contas,
    ],
  }))
}

export function adicionarAvisoAoCondominio(slug, dados) {
  return atualizarCondominio(slug, (condominio) => ({
    ...condominio,
    avisos: [
      {
        id: criarId('aviso'),
        titulo: dados.titulo,
        data: dados.data,
        descricao: dados.descricao,
      },
      ...condominio.avisos,
    ],
  }))
}

export function adicionarAssembleiaAoCondominio(slug, dados) {
  return atualizarCondominio(slug, (condominio) => ({
    ...condominio,
    assembleias: [
      {
        id: criarId('assembleia'),
        titulo: dados.titulo,
        data: dados.data,
        horario: dados.horario,
        local: dados.local,
        pauta: dados.pauta,
      },
      ...condominio.assembleias,
    ],
  }))
}

export function adicionarManutencaoAoCondominio(slug, dados) {
  return atualizarCondominio(slug, (condominio) => ({
    ...condominio,
    manutencoes: [
      {
        id: criarId('manutencao'),
        titulo: dados.titulo,
        frequencia: dados.frequencia,
        proximaData: dados.proximaData,
        responsavel: dados.responsavel,
        status: dados.status,
      },
      ...condominio.manutencoes,
    ],
  }))
}

export function resumirDashboard(condominios) {
  const contas = condominios.flatMap((item) =>
    item.contas.map((conta) => ({
      ...normalizarConta(conta),
      condominio: item.nome,
      slug: item.slug,
    }))
  )
  const avisos = condominios.flatMap((item) =>
    item.avisos.map((aviso) => ({ ...aviso, condominio: item.nome, slug: item.slug }))
  )
  const manutencoes = condominios.flatMap((item) =>
    item.manutencoes.map((manutencao) => ({
      ...manutencao,
      condominio: item.nome,
      slug: item.slug,
    }))
  )

  const contasOrdenadas = [...contas].sort((a, b) =>
    String(a.proximoVencimento || a.vencimento).localeCompare(
      String(b.proximoVencimento || b.vencimento)
    )
  )
  const avisosOrdenados = [...avisos].sort((a, b) =>
    String(a.data).localeCompare(String(b.data))
  )
  const manutencoesOrdenadas = [...manutencoes].sort((a, b) =>
    String(a.proximaData).localeCompare(String(b.proximaData))
  )
  const assembleias = condominios.flatMap((item) =>
    (item.assembleias || []).map((assembleia) => ({
      ...assembleia,
      condominio: item.nome,
      slug: item.slug,
    }))
  )
  const assembleiasOrdenadas = [...assembleias].sort((a, b) =>
    String(a.data).localeCompare(String(b.data))
  )
  const contasComUrgencia = contas.map((item) => ({
    ...item,
    diasRestantes: calcularDiasParaData(item.proximoVencimento || item.vencimento),
  }))

  return {
    totalCondominios: condominios.length,
    totalUnidades: condominios.reduce((acc, item) => acc + (item.unidades || 0), 0),
    contasPendentes: contas.filter((item) => item.status !== 'Pago').length,
    contasRecorrentes: contas.filter((item) => item.recorrencia === 'mensal-indeterminada').length,
    contasAtrasadas: contasComUrgencia.filter((item) => item.diasRestantes < 0 && item.status !== 'Pago').length,
    contasDaSemana: contasComUrgencia.filter((item) => item.diasRestantes >= 0 && item.diasRestantes <= 7 && item.status !== 'Pago').length,
    manutencoesProximas: manutencoes.filter((item) => item.proximaData).length,
    proximasContas: contasOrdenadas.slice(0, 5),
    proximasManutencoes: manutencoesOrdenadas.filter((item) => item.proximaData).slice(0, 6),
    proximosAvisos: avisosOrdenados.slice(0, 5),
    proximaAssembleia: assembleiasOrdenadas.find((item) => item.data) || null,
  }
}

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor) || 0)
}

export function formatarData(data) {
  if (!data) {
    return 'Definir data'
  }

  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${data}T00:00:00`))
}

function extrairDia(data) {
  if (!data || !String(data).includes('-')) {
    return ''
  }

  return String(data).split('-')[2]
}

function ajustarDiaNoMes(ano, mesIndex, dia) {
  const ultimoDia = new Date(ano, mesIndex + 1, 0).getDate()
  return Math.min(Math.max(Number(dia) || 1, 1), ultimoDia)
}

function formatarIsoData(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function calcularProximoVencimentoConta(conta, referencia = new Date()) {
  if (conta.recorrencia !== 'mensal-indeterminada') {
    return conta.vencimento
  }

  const dia = Number(conta.diaVencimento || extrairDia(conta.vencimento) || 1)
  const anoAtual = referencia.getFullYear()
  const mesAtual = referencia.getMonth()
  const hoje = new Date(
    referencia.getFullYear(),
    referencia.getMonth(),
    referencia.getDate()
  )

  const diaNoMesAtual = ajustarDiaNoMes(anoAtual, mesAtual, dia)
  const dataAtual = new Date(anoAtual, mesAtual, diaNoMesAtual)

  if (dataAtual >= hoje) {
    return formatarIsoData(dataAtual)
  }

  const proximoMes = mesAtual === 11 ? 0 : mesAtual + 1
  const proximoAno = mesAtual === 11 ? anoAtual + 1 : anoAtual
  const diaNoProximoMes = ajustarDiaNoMes(proximoAno, proximoMes, dia)

  return formatarIsoData(new Date(proximoAno, proximoMes, diaNoProximoMes))
}

export function normalizarConta(conta) {
  const proximoVencimento = calcularProximoVencimentoConta(conta)

  return {
    ...conta,
    recorrencia: conta.recorrencia || 'nenhuma',
    diaVencimento:
      conta.diaVencimento || Number(extrairDia(conta.vencimento) || 0) || null,
    proximoVencimento,
  }
}

export function descreverRecorrenciaConta(conta) {
  if (conta.recorrencia === 'mensal-indeterminada') {
    return `Todo dia ${conta.diaVencimento} por tempo indeterminado`
  }

  return 'Conta avulsa'
}

export function calcularDiasParaData(data) {
  if (!data) {
    return null
  }

  const hoje = new Date()
  const referencia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const alvo = new Date(`${data}T00:00:00`)
  const diff = alvo.getTime() - referencia.getTime()

  return Math.round(diff / 86400000)
}

export function resumirUrgenciaConta(conta) {
  const diasRestantes = calcularDiasParaData(conta.proximoVencimento || conta.vencimento)

  if (diasRestantes === null) {
    return {
      label: 'Sem data',
      tone: 'slate',
    }
  }

  if (diasRestantes < 0) {
    return {
      label: `Atrasada ha ${Math.abs(diasRestantes)} dia(s)`,
      tone: 'red',
    }
  }

  if (diasRestantes === 0) {
    return {
      label: 'Vence hoje',
      tone: 'amber',
    }
  }

  if (diasRestantes <= 7) {
    return {
      label: `Vence em ${diasRestantes} dia(s)`,
      tone: 'amber',
    }
  }

  return {
    label: `Vence em ${diasRestantes} dia(s)`,
    tone: 'emerald',
  }
}
