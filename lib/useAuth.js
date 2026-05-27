'use client'

import { useEffect, useState } from 'react'
import { supabase, supabaseConfigError } from '@/lib/supabase'

const QUERY_TIMEOUT_MS = 1500

function comTimeout(promise, fallback, timeout = QUERY_TIMEOUT_MS) {
  return Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise((resolve) => {
      setTimeout(() => resolve(fallback), timeout)
    }),
  ])
}

async function carregarDadosUsuario(authUser) {
  if (!supabase || !authUser) {
    return { user: authUser ?? null, permissoes: null }
  }

  const perfilPorIdPromise = supabase
      .from('usuarios_sistema')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle()

  const permissoesPromise = supabase
      .from('permissoes_usuario')
      .select('condominio_id')
      .eq('usuario_id', authUser.id)

  const [{ data: userInfo }, { data: perms }] = await Promise.all([
    comTimeout(perfilPorIdPromise, { data: null }),
    comTimeout(permissoesPromise, { data: [] }),
  ])

  let perfilUsuario = userInfo

  if (!perfilUsuario?.role && authUser.email) {
    const { data: userInfoByEmail } = await comTimeout(
      supabase
        .from('usuarios_sistema')
        .select('role')
        .eq('email', authUser.email.toLowerCase())
        .maybeSingle(),
      { data: null }
    )

    perfilUsuario = userInfoByEmail
  }

  return {
    user: perfilUsuario?.role ? { ...authUser, role: perfilUsuario.role } : authUser,
    permissoes: perms ? perms.map((p) => p.condominio_id) : [],
  }
}

export async function signIn(email, password) {
  if (supabaseConfigError || !supabase) {
    return { error: supabaseConfigError || 'Supabase nao configurado.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error ? 'E-mail ou senha incorretos.' : null }
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function sendPasswordReset(email) {
  if (!supabase) return { error: 'Supabase nao configurado.' }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/nova-senha`,
  })

  return { error: error ? 'Erro ao enviar e-mail. Verifique o endereco.' : null }
}

export function useSession() {
  const [user, setUser] = useState(null)
  const [permissoes, setPermissoes] = useState(null)
  const [carregando, setCarregando] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return

    let ativo = true

    async function aplicarSessao(session) {
      const authUser = session?.user ?? null

      if (!authUser) {
        setUser(null)
        setPermissoes(null)
        setCarregando(false)
        return
      }

      setUser((atual) => (atual?.id === authUser.id ? atual : authUser))
      setPermissoes((atuais) => atuais ?? [])
      setCarregando(false)

      try {
        const dados = await carregarDadosUsuario(authUser)
        if (!ativo) return
        setUser(dados.user)
        setPermissoes(dados.permissoes)
      } catch (error) {
        console.error('Erro ao carregar dados do usuario:', error)
        if (!ativo) return
        setUser(authUser)
        setPermissoes([])
      }
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!ativo) return
      await aplicarSessao(session)
      if (ativo) setCarregando(false)
    }).catch(() => {
      if (ativo) setCarregando(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (ativo) await aplicarSessao(session)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, permissoes, carregando, configError: supabaseConfigError }
}
