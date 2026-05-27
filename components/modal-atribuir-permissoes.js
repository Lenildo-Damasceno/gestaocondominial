'use client'

import { useState, useEffect } from 'react'
import { atualizarPermissoes, obterCondominiosDoUsuario } from '@/controllers/permissoes'
import { listarCondominios } from '@/controllers/condominio'

export default function ModalAtribuirPermissoes({
  usuarioId,
  usuarioNome,
  isOpen,
  onClose,
  onSalvar,
}) {
  const [condominios, setCondominios] = useState([])
  const [selecionados, setSelecionados] = useState(new Set())
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!isOpen) return

    async function carregarDados() {
      try {
        setCarregando(true)
        setErro('')

        // Buscar todos os condomínios
        const todosCondominios = listarCondominios()
        setCondominios(todosCondominios)

        // Buscar condomínios que o usuário já tem acesso
        const { condominioIds, error: erroPermissoes } = await obterCondominiosDoUsuario(usuarioId)

        if (erroPermissoes) {
          setErro(erroPermissoes)
          return
        }

        // Marcar como selecionados os condomínios que o usuário já tem
        const novosSelecionados = new Set(condominioIds || [])
        setSelecionados(novosSelecionados)
      } catch (e) {
        setErro(`Erro ao carregar dados: ${e.message}`)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [isOpen, usuarioId])

  function alternarSelecao(condominioId) {
    const novosSelecionados = new Set(selecionados)
    if (novosSelecionados.has(condominioId)) {
      novosSelecionados.delete(condominioId)
    } else {
      novosSelecionados.add(condominioId)
    }
    setSelecionados(novosSelecionados)
  }

  async function handleSalvar() {
    try {
      setSalvando(true)
      setErro('')

      // Converter Set para Array de IDs
      const ids = Array.from(selecionados)

      // Chamar função de atualização
      const { error: erroAtualizacao } = await atualizarPermissoes(usuarioId, ids)

      if (erroAtualizacao) {
        setErro(erroAtualizacao)
        return
      }

      // Sucesso - fechar modal e chamar callback
      if (onSalvar) {
        onSalvar()
      }
      onClose()
    } catch (e) {
      setErro(`Erro ao salvar: ${e.message}`)
    } finally {
      setSalvando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Card modal */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.25)]">
        {/* Header */}
        <div className="border-b border-slate-200 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Atribuir Condomínios
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {usuarioNome}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Fechar modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6l-12 12M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-h-96 overflow-y-auto p-4 sm:p-6">
          {erro && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
              <span className="ml-2 text-sm text-slate-600">Carregando...</span>
            </div>
          ) : condominios.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-600">
              Nenhum condomínio disponível
            </p>
          ) : (
            <div className="space-y-2">
              {condominios.map((condominio) => (
                <label
                  key={condominio.id}
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50 transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selecionados.has(condominio.id)}
                    onChange={() => alternarSelecao(condominio.id)}
                    disabled={salvando}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600 disabled:opacity-50"
                  />
                  <span className="flex-1 text-sm font-medium text-slate-900">
                    {condominio.nome}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer com botões */}
        <div className="flex gap-2 border-t border-slate-200 bg-slate-50 p-4 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={salvando || carregando}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {salvando ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
