'use client'

import { supabase } from '@/lib/supabase'

function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export async function registrarLog(usuarioId, acao, condominioId = null, descricao = null) {
  try {
    if (!supabase) return { error: 'Supabase não configurado' }

    if (!usuarioId || !isValidUUID(usuarioId)) {
      return { error: 'usuarioId inválido' }
    }

    if (!acao || typeof acao !== 'string') {
      return { error: 'acao é obrigatória e deve ser uma string' }
    }

    if (condominioId && !isValidUUID(condominioId)) {
      return { error: 'condominioId inválido' }
    }

    const { data, error } = await supabase
      .from('logs_sistema')
      .insert([
        {
          usuario_id: usuarioId,
          acao: acao,
          condominio_id: condominioId,
          descricao: descricao,
        },
      ])
      .select()

    if (error) {
      return { error: error.message }
    }

    return { log: data?.[0] || null, error: null }
  } catch (error) {
    return { error: error.message }
  }
}

export async function obterLogsUsuario(usuarioId, limite = 100) {
  try {
    if (!supabase) return { error: 'Supabase não configurado' }

    if (!usuarioId || !isValidUUID(usuarioId)) {
      return { error: 'usuarioId inválido' }
    }

    if (limite < 1 || !Number.isInteger(limite)) {
      return { error: 'limite deve ser um número inteiro positivo' }
    }

    const { data, error } = await supabase
      .from('logs_sistema')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('data_hora', { ascending: false })
      .limit(limite)

    if (error) {
      return { error: error.message }
    }

    return { logs: data || [], error: null }
  } catch (error) {
    return { error: error.message }
  }
}

export async function obterLogsCondominio(condominioId, limite = 100) {
  try {
    if (!supabase) return { error: 'Supabase não configurado' }

    if (!condominioId || !isValidUUID(condominioId)) {
      return { error: 'condominioId inválido' }
    }

    if (limite < 1 || !Number.isInteger(limite)) {
      return { error: 'limite deve ser um número inteiro positivo' }
    }

    const { data, error } = await supabase
      .from('logs_sistema')
      .select('*')
      .eq('condominio_id', condominioId)
      .order('data_hora', { ascending: false })
      .limit(limite)

    if (error) {
      return { error: error.message }
    }

    return { logs: data || [], error: null }
  } catch (error) {
    return { error: error.message }
  }
}

export async function obterTodosLogs(limite = 500) {
  try {
    if (!supabase) return { error: 'Supabase não configurado' }

    if (limite < 1 || !Number.isInteger(limite)) {
      return { error: 'limite deve ser um número inteiro positivo' }
    }

    const { data, error } = await supabase
      .from('logs_sistema')
      .select('*')
      .order('data_hora', { ascending: false })
      .limit(limite)

    if (error) {
      return { error: error.message }
    }

    return { logs: data || [], error: null }
  } catch (error) {
    return { error: error.message }
  }
}

export async function obterLogsEntreDatas(dataInicio, dataFim) {
  try {
    if (!supabase) return { error: 'Supabase não configurado' }

    if (!dataInicio || !dataFim) {
      return { error: 'dataInicio e dataFim são obrigatórias' }
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?$/
    if (!dateRegex.test(dataInicio) || !dateRegex.test(dataFim)) {
      return { error: 'Datas devem estar no formato ISO (YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss)' }
    }

    const { data, error } = await supabase
      .from('logs_sistema')
      .select('*')
      .gte('data_hora', dataInicio)
      .lte('data_hora', dataFim)
      .order('data_hora', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { logs: data || [], error: null }
  } catch (error) {
    return { error: error.message }
  }
}
