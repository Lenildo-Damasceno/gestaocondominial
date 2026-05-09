/**
 * app/page.js
 * 
 * Página de login (rota raiz: /)
 * - Componente client-side com formulário de autenticação
 * - Verifica sessão existente e redireciona para dashboard se autenticado
 * - Integra com Supabase Auth para sign-in com email/senha
 * - Exibe erros de validação e conexão
 * - Estados: carregando, erro, redirecionamento
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase, supabaseConfigError } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(supabaseConfigError)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!supabase) {
      return
    }

    let ativo = true

    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (ativo && session) {
        window.location.href = '/dashboard'
      }
    }

    verificarSessao()

    return () => {
      ativo = false
    }
  }, [])

  async function entrar(e) {
    e.preventDefault()

    if (supabaseConfigError || !supabase) {
      setErro(supabaseConfigError || 'Supabase nao configurado.')
      return
    }

    setCarregando(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          ES Gestão Condominial
        </h1>
        <p className="mb-6 text-gray-500">Faca login para acessar o sistema</p>

        <form onSubmit={entrar} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua senha"
              required
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando || Boolean(supabaseConfigError)}
            className="rounded-lg bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
