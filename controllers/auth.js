'use client'

/**
 * controllers/auth.js
 * CONTROLLER — Lógica de autenticação e hook de sessão
 */

import { useState, useEffect } from 'react'
import { supabase, supabaseConfigError } from '@/models/supabase'

export async function signIn(email, password) {
  if (supabaseConfigError || !supabase) {
    return { error: supabaseConfigError || 'Supabase não configurado.' }
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error ? 'E-mail ou senha incorretos.' : null }
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function sendPasswordReset(email) {
  if (!supabase) return { error: 'Supabase não configurado.' }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/nova-senha`,
  })
  return { error: error ? 'Erro ao enviar e-mail. Verifique o endereço.' : null }
}

export function useSession() {
  const [user, setUser] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setCarregando(false)
      return
    }

    let ativo = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (ativo) {
        setUser(session?.user ?? null)
        setCarregando(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (ativo) setUser(session?.user ?? null)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, carregando, configError: supabaseConfigError }
}
