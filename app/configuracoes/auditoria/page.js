'use client'

import { useState, useEffect, useMemo } from 'react'
import AdminShell from '@/components/admin-shell'
import { obterTodosLogs, obterLogsEntreDatas } from '@/controllers/logs'

const ACOES_DISPONIVEIS = [
  'LOGIN',
  'LOGOUT',
  'VER_CONDOMINIO',
  'EDITAR_CONDOMINIO',
  'CRIAR_CONDOMINIO',
  'DELETAR_CONDOMINIO',
  'VER_USUARIO',
  'EDITAR_USUARIO',
  'CRIAR_USUARIO',
  'DELETAR_USUARIO',
]

function obterCorAcao(acao) {
  if (acao === 'LOGIN') return 'text-green-600 bg-green-50'
  if (acao === 'LOGOUT') return 'text-gray-600 bg-gray-50'
  if (acao?.startsWith('VER_')) return 'text-blue-600 bg-blue-50'
  if (acao?.startsWith('EDITAR_')) return 'text-yellow-600 bg-yellow-50'
  if (acao?.startsWith('CRIAR_')) return 'text-lime-600 bg-lime-50'
  if (acao?.startsWith('DELETAR_')) return 'text-red-600 bg-red-50'
  return 'text-slate-600 bg-slate-50'
}

function formatarData(dataIso) {
  if (!dataIso) return '-'
  try {
    const data = new Date(dataIso)
    const dia = String(data.getDate()).padStart(2, '0')
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const ano = data.getFullYear()
    const horas = String(data.getHours()).padStart(2, '0')
    const minutos = String(data.getMinutes()).padStart(2, '0')
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`
  } catch {
    return '-'
  }
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState([])
  const [todosOsLogs, setTodosOsLogs] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState(null)
  const [usuariosUnicos, setUsuariosUnicos] = useState([])

  const [filtros, setFiltros] = useState({
    usuario: '',
    acao: '',
    dataInicio: '',
    dataFim: '',
  })

  const [paginaAtual, setPaginaAtual] = useState(1)
  const LOGS_POR_PAGINA = 50

  useEffect(() => {
    carregarLogs()
  }, [])

  async function carregarLogs() {
    try {
      setCarregando(true)
      setErroCarregamento(null)

      const { logs: dados, error } = await obterTodosLogs(5000)

      if (error) {
        setErroCarregamento(error)
        setLogs([])
        setTodosOsLogs([])
        return
      }

      if (!dados || dados.length === 0) {
        setLogs([])
        setTodosOsLogs([])
        setUsuariosUnicos([])
        return
      }

      // Enriquecer logs com dados do usuário (caso necessário)
      const logsComUsuario = dados.map((log) => ({
        ...log,
        usuario_email: log.usuario_email || 'Desconhecido',
      }))

      setTodosOsLogs(logsComUsuario)
      setLogs(logsComUsuario)

      // Extrair usuários únicos para autocomplete
      const usuarios = [
        ...new Set(logsComUsuario.map((log) => log.usuario_email).filter(Boolean)),
      ].sort()
      setUsuariosUnicos(usuarios)
    } catch (erro) {
      setErroCarregamento(erro?.message || 'Erro ao carregar logs')
      setLogs([])
      setTodosOsLogs([])
    } finally {
      setCarregando(false)
    }
  }

  async function aplicarFiltros() {
    try {
      setCarregando(true)
      setPaginaAtual(1)

      let logsFiltrados = [...todosOsLogs]

      // Filtro por usuário
      if (filtros.usuario.trim()) {
        logsFiltrados = logsFiltrados.filter((log) =>
          log.usuario_email?.toLowerCase().includes(filtros.usuario.toLowerCase())
        )
      }

      // Filtro por ação
      if (filtros.acao) {
        logsFiltrados = logsFiltrados.filter((log) => log.acao === filtros.acao)
      }

      // Filtro por data
      if (filtros.dataInicio || filtros.dataFim) {
        const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null
        const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null

        logsFiltrados = logsFiltrados.filter((log) => {
          const dataLog = new Date(log.data_hora)

          if (dataInicio && dataLog < dataInicio) return false
          if (dataFim) {
            const dataFimComFim = new Date(dataFim)
            dataFimComFim.setHours(23, 59, 59, 999)
            if (dataLog > dataFimComFim) return false
          }

          return true
        })
      }

      setLogs(logsFiltrados)
    } catch (erro) {
      setErroCarregamento(erro?.message || 'Erro ao filtrar logs')
    } finally {
      setCarregando(false)
    }
  }

  function limparFiltros() {
    setFiltros({
      usuario: '',
      acao: '',
      dataInicio: '',
      dataFim: '',
    })
    setLogs(todosOsLogs)
    setPaginaAtual(1)
  }

  // Paginação
  const logsTotal = logs.length
  const totalPaginas = Math.ceil(logsTotal / LOGS_POR_PAGINA)
  const indiceInicio = (paginaAtual - 1) * LOGS_POR_PAGINA
  const indiceFim = indiceInicio + LOGS_POR_PAGINA
  const logsPagina = logs.slice(indiceInicio, indiceFim)

  function irParaPagina(novaPagina) {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <AdminShell
      title="Auditoria"
      subtitle="Histórico de todas as ações realizadas no sistema"
      currentPath="/configuracoes"
    >
      <div className="space-y-6">
        {/* Seção de Filtros */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filtros</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            {/* Email do Usuário */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email do Usuário
              </label>
              <input
                type="text"
                placeholder="Digite o email..."
                value={filtros.usuario}
                onChange={(e) =>
                  setFiltros({ ...filtros, usuario: e.target.value })
                }
                list="usuarios-list"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <datalist id="usuarios-list">
                {usuariosUnicos.map((email) => (
                  <option key={email} value={email} />
                ))}
              </datalist>
            </div>

            {/* Ação */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ação
              </label>
              <select
                value={filtros.acao}
                onChange={(e) =>
                  setFiltros({ ...filtros, acao: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as ações</option>
                {ACOES_DISPONIVEIS.map((acao) => (
                  <option key={acao} value={acao}>
                    {acao}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                De
              </label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataInicio: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Até
              </label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataFim: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={aplicarFiltros}
              disabled={carregando}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {carregando ? 'Filtrando...' : 'Filtrar'}
            </button>
            <button
              onClick={limparFiltros}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Mensagem de erro */}
        {erroCarregamento && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              Erro: {erroCarregamento}
            </p>
          </div>
        )}

        {/* Seção de Tabela */}
        <div>
          {carregando && logs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-500">Carregando logs...</p>
            </div>
          ) : logsPagina.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-12">
              <p className="text-sm text-slate-500">Nenhum log encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">
                        Data/Hora
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">
                        Usuário
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">
                        Ação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">
                        Condomínio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">
                        Descrição
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsPagina.map((log, idx) => (
                      <tr
                        key={`${log.id}-${idx}`}
                        className="border-b border-slate-200 hover:bg-slate-50 transition"
                      >
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {formatarData(log.data_hora)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {log.usuario_email || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${obterCorAcao(
                              log.acao
                            )}`}
                          >
                            {log.acao}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {log.condominio_nome || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {log.descricao || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-slate-600">
                    Mostrando {indiceInicio + 1} a {Math.min(
                      indiceFim,
                      logsTotal
                    )} de {logsTotal} logs
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => irParaPagina(paginaAtual - 1)}
                      disabled={paginaAtual === 1}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                    >
                      Anterior
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                      (pagina) => {
                        // Mostrar apenas as primeiras 3, últimas 3 e ao redor da atual
                        if (
                          pagina <= 3 ||
                          pagina > totalPaginas - 3 ||
                          Math.abs(pagina - paginaAtual) <= 1
                        ) {
                          return (
                            <button
                              key={pagina}
                              onClick={() => irParaPagina(pagina)}
                              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                paginaAtual === pagina
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {pagina}
                            </button>
                          )
                        } else if (
                          (pagina === 4 && totalPaginas > 6) ||
                          (pagina === totalPaginas - 3 && totalPaginas > 6)
                        ) {
                          return (
                            <span key={pagina} className="px-2 py-2 text-slate-500">
                              ...
                            </span>
                          )
                        }
                        return null
                      }
                    )}

                    <button
                      onClick={() => irParaPagina(paginaAtual + 1)}
                      disabled={paginaAtual === totalPaginas}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
