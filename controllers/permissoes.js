'use client'

import { supabase, supabaseConfigError } from '@/lib/supabase'

/**
 * Valida se uma string é um UUID válido
 * @param {string} id - ID a validar
 * @returns {boolean}
 */
function isValidUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return typeof id === 'string' && uuidRegex.test(id)
}

/**
 * Atribui um condomínio a um usuário (concede acesso)
 * @param {string} usuarioId - ID do usuário
 * @param {string} condominioId - ID do condomínio
 * @returns {Promise<{permissao?: object, error?: string}>}
 */
export async function atribuirCondominio(usuarioId, condominioId) {
  try {
    if (!supabase) {
      return { error: supabaseConfigError || 'Supabase não configurado' }
    }

    if (!usuarioId || !condominioId) {
      return { error: 'usuarioId e condominioId são obrigatórios' }
    }

    // Validar UUIDs
    if (!isValidUUID(usuarioId)) {
      return { error: 'usuarioId inválido' }
    }

    if (!isValidUUID(condominioId)) {
      return { error: 'condominioId inválido' }
    }

    // Verificar se a permissão já existe
    const { data: existing, error: checkError } = await supabase
      .from('permissoes_usuario')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('condominio_id', condominioId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      return { error: `Erro ao verificar permissão existente: ${checkError.message}` }
    }

    if (existing) {
      return { error: 'Usuário já tem permissão para este condomínio' }
    }

    // Inserir nova permissão
    const { data: permissao, error: insertError } = await supabase
      .from('permissoes_usuario')
      .insert({ usuario_id: usuarioId, condominio_id: condominioId })
      .select()
      .single()

    if (insertError) {
      return { error: `Erro ao atribuir condomínio: ${insertError.message}` }
    }

    return { permissao }
  } catch (error) {
    return { error: `Erro inesperado: ${error.message}` }
  }
}

/**
 * Remove acesso de um usuário a um condomínio
 * @param {string} usuarioId - ID do usuário
 * @param {string} condominioId - ID do condomínio
 * @returns {Promise<{error?: string}>}
 */
export async function removerCondominio(usuarioId, condominioId) {
  try {
    if (!supabase) {
      return { error: supabaseConfigError || 'Supabase não configurado' }
    }

    if (!usuarioId || !condominioId) {
      return { error: 'usuarioId e condominioId são obrigatórios' }
    }

    // Validar UUIDs
    if (!isValidUUID(usuarioId)) {
      return { error: 'usuarioId inválido' }
    }

    if (!isValidUUID(condominioId)) {
      return { error: 'condominioId inválido' }
    }

    // Deletar permissão
    const { error: deleteError } = await supabase
      .from('permissoes_usuario')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('condominio_id', condominioId)

    if (deleteError) {
      return { error: `Erro ao remover condomínio: ${deleteError.message}` }
    }

    return {}
  } catch (error) {
    return { error: `Erro inesperado: ${error.message}` }
  }
}

/**
 * Obtém todos os condomínios que um usuário tem acesso
 * @param {string} usuarioId - ID do usuário
 * @returns {Promise<{condominioIds?: string[], error?: string}>}
 */
export async function obterCondominiosDoUsuario(usuarioId) {
  try {
    if (!supabase) {
      return { error: supabaseConfigError || 'Supabase não configurado' }
    }

    if (!usuarioId) {
      return { error: 'usuarioId é obrigatório' }
    }

    // Validar UUID
    if (!isValidUUID(usuarioId)) {
      return { error: 'usuarioId inválido' }
    }

    const { data, error } = await supabase
      .from('permissoes_usuario')
      .select('condominio_id')
      .eq('usuario_id', usuarioId)

    if (error) {
      return { error: `Erro ao obter condomínios: ${error.message}` }
    }

    const condominioIds = data.map((row) => row.condominio_id)
    return { condominioIds }
  } catch (error) {
    return { error: `Erro inesperado: ${error.message}` }
  }
}

/**
 * Obtém todos os usuários que têm acesso a um condomínio
 * @param {string} condominioId - ID do condomínio
 * @returns {Promise<{usuarioIds?: string[], error?: string}>}
 */
export async function obterUsuariosDoCondominio(condominioId) {
  try {
    if (!supabase) {
      return { error: supabaseConfigError || 'Supabase não configurado' }
    }

    if (!condominioId) {
      return { error: 'condominioId é obrigatório' }
    }

    // Validar UUID
    if (!isValidUUID(condominioId)) {
      return { error: 'condominioId inválido' }
    }

    const { data, error } = await supabase
      .from('permissoes_usuario')
      .select('usuario_id')
      .eq('condominio_id', condominioId)

    if (error) {
      return { error: `Erro ao obter usuários: ${error.message}` }
    }

    const usuarioIds = data.map((row) => row.usuario_id)
    return { usuarioIds }
  } catch (error) {
    return { error: `Erro inesperado: ${error.message}` }
  }
}

/**
 * Verifica se um usuário tem acesso a um condomínio
 * @param {string} usuarioId - ID do usuário
 * @param {string} condominioId - ID do condomínio
 * @returns {Promise<{temPermissao: boolean, error?: string}>}
 */
export async function verificarPermissao(usuarioId, condominioId) {
  try {
    if (!supabase) {
      return { temPermissao: false, error: supabaseConfigError || 'Supabase não configurado' }
    }

    if (!usuarioId || !condominioId) {
      return { temPermissao: false, error: 'usuarioId e condominioId são obrigatórios' }
    }

    // Validar UUIDs
    if (!isValidUUID(usuarioId)) {
      return { temPermissao: false, error: 'usuarioId inválido' }
    }

    if (!isValidUUID(condominioId)) {
      return { temPermissao: false, error: 'condominioId inválido' }
    }

    const { data, error } = await supabase
      .from('permissoes_usuario')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('condominio_id', condominioId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return { temPermissao: false, error: `Erro ao verificar permissão: ${error.message}` }
    }

    const temPermissao = !!data
    return { temPermissao }
  } catch (error) {
    return { temPermissao: false, error: `Erro inesperado: ${error.message}` }
  }
}

/**
 * Atualiza as permissões de um usuário (remove antigos, adiciona novos)
 * @param {string} usuarioId - ID do usuário
 * @param {string[]} condominioIds - Array com IDs dos condomínios
 * @returns {Promise<{error?: string}>}
 */
export async function atualizarPermissoes(usuarioId, condominioIds) {
  try {
    if (!supabase) {
      return { error: supabaseConfigError || 'Supabase não configurado' }
    }

    if (!usuarioId) {
      return { error: 'usuarioId é obrigatório' }
    }

    // Validar UUID do usuário
    if (!isValidUUID(usuarioId)) {
      return { error: 'usuarioId inválido' }
    }

    if (!Array.isArray(condominioIds)) {
      return { error: 'condominioIds deve ser um array' }
    }

    // Validar UUIDs dos condomínios
    for (const id of condominioIds) {
      if (!isValidUUID(id)) {
        return { error: `condominioId inválido: ${id}` }
      }
    }

    // Usar transação: deletar todas as permissões antigas
    const { error: deleteError } = await supabase
      .from('permissoes_usuario')
      .delete()
      .eq('usuario_id', usuarioId)

    if (deleteError) {
      return { error: `Erro ao remover permissões antigas: ${deleteError.message}` }
    }

    // Se não há condomínios novos, apenas retornar sucesso
    if (condominioIds.length === 0) {
      return {}
    }

    // Inserir novas permissões
    const novasPermissoes = condominioIds.map((condominioId) => ({
      usuario_id: usuarioId,
      condominio_id: condominioId,
    }))

    const { error: insertError } = await supabase
      .from('permissoes_usuario')
      .insert(novasPermissoes)

    if (insertError) {
      return { error: `Erro ao adicionar novas permissões: ${insertError.message}` }
    }

    return {}
  } catch (error) {
    return { error: `Erro inesperado: ${error.message}` }
  }
}
