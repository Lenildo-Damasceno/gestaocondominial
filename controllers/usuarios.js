'use client'

import { supabase } from '@/lib/supabase'

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function criarUsuario(email, nome, role = 'leitor') {
  try {
    if (!supabase) {
      return { error: 'Supabase não configurado' }
    }

    // Validações
    if (!email || !isValidEmail(email)) {
      return { error: 'Email inválido' }
    }

    if (!nome || nome.trim().length === 0) {
      return { error: 'Nome não pode estar vazio' }
    }

    // Gera uma senha padrão aleatória (deve ser enviada ao usuário de forma segura)
    const senhaTemporaria = Math.random().toString(36).slice(-12)

    // Criar usuário no Auth do Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: senhaTemporaria,
      email_confirm: true,
    })

    if (authError) {
      return { error: authError.message }
    }

    // Inserir registro na tabela usuarios_sistema
    const { data: usuario, error: dbError } = await supabase
      .from('usuarios_sistema')
      .insert([
        {
          id: authData.user.id,
          email: email.toLowerCase(),
          nome: nome.trim(),
          role: role,
          ativo: true,
          criado_em: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (dbError) {
      // Tenta deletar o usuário do Auth se houver erro na inserção
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { error: dbError.message }
    }

    return { usuario, senhaTemporaria }
  } catch (error) {
    return { error: error.message }
  }
}

export async function listarUsuarios() {
  try {
    if (!supabase) {
      return { error: 'Supabase não configurado' }
    }

    const { data: usuarios, error } = await supabase
      .from('usuarios_sistema')
      .select('*')
      .eq('ativo', true)
      .order('criado_em', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { usuarios }
  } catch (error) {
    return { error: error.message }
  }
}

export async function obterUsuario(usuarioId) {
  try {
    if (!supabase) {
      return { error: 'Supabase não configurado' }
    }

    if (!usuarioId || usuarioId.trim().length === 0) {
      return { error: 'ID do usuário é obrigatório' }
    }

    const { data: usuario, error } = await supabase
      .from('usuarios_sistema')
      .select('*')
      .eq('id', usuarioId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Usuário não encontrado' }
      }
      return { error: error.message }
    }

    return { usuario }
  } catch (error) {
    return { error: error.message }
  }
}

export async function atualizarUsuario(usuarioId, dados) {
  try {
    if (!supabase) {
      return { error: 'Supabase não configurado' }
    }

    if (!usuarioId || usuarioId.trim().length === 0) {
      return { error: 'ID do usuário é obrigatório' }
    }

    if (!dados || typeof dados !== 'object') {
      return { error: 'Dados de atualização são obrigatórios' }
    }

    // Valida campos opcionais que podem vir em dados
    const atualizacoes = {}

    if (dados.nome !== undefined && dados.nome !== null) {
      if (dados.nome.trim().length === 0) {
        return { error: 'Nome não pode estar vazio' }
      }
      atualizacoes.nome = dados.nome.trim()
    }

    if (dados.role !== undefined && dados.role !== null) {
      atualizacoes.role = dados.role
    }

    if (dados.ativo !== undefined && dados.ativo !== null) {
      atualizacoes.ativo = Boolean(dados.ativo)
    }

    if (Object.keys(atualizacoes).length === 0) {
      return { error: 'Nenhum dado válido para atualizar' }
    }

    const { data: usuario, error } = await supabase
      .from('usuarios_sistema')
      .update(atualizacoes)
      .eq('id', usuarioId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Usuário não encontrado' }
      }
      return { error: error.message }
    }

    return { usuario }
  } catch (error) {
    return { error: error.message }
  }
}

export async function deletarUsuario(usuarioId) {
  try {
    if (!supabase) {
      return { error: 'Supabase não configurado' }
    }

    if (!usuarioId || usuarioId.trim().length === 0) {
      return { error: 'ID do usuário é obrigatório' }
    }

    // Soft delete: marca como inativo
    const { error } = await supabase
      .from('usuarios_sistema')
      .update({ ativo: false })
      .eq('id', usuarioId)

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Usuário não encontrado' }
      }
      return { error: error.message }
    }

    return { mensagem: 'Usuário deletado com sucesso' }
  } catch (error) {
    return { error: error.message }
  }
}

export async function obterUsuarioPorEmail(email) {
  try {
    if (!supabase) {
      return { error: 'Supabase não configurado' }
    }

    if (!email || !isValidEmail(email)) {
      return { error: 'Email inválido' }
    }

    const { data: usuario, error } = await supabase
      .from('usuarios_sistema')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Usuário não encontrado' }
      }
      return { error: error.message }
    }

    return { usuario }
  } catch (error) {
    return { error: error.message }
  }
}
