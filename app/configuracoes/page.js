'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/views/components/admin-shell'
import { supabase } from '@/models/supabase'

export default function ConfiguracoesPage() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(null)

  const [form, setForm] = useState({ email: '', senha: '', papel: 'Operador' })

  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function carregarUsuarios() {
    setCarregando(true)
    setErro('')

    if (!supabase) {
      setErro('Supabase não configurado.')
      setCarregando(false)
      return
    }

    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      // Fallback: lista apenas o usuário atual se não tiver permissão admin
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData?.session?.user) {
        setUsuarios([{
          id: sessionData.session.user.id,
          email: sessionData.session.user.email,
          papel: sessionData.session.user.user_metadata?.papel || 'Administrador',
          criado_em: sessionData.session.user.created_at,
        }])
      }
    } else {
      setUsuarios(
        (data?.users || []).map((u) => ({
          id: u.id,
          email: u.email,
          papel: u.user_metadata?.papel || 'Operador',
          criado_em: u.created_at,
        }))
      )
    }

    setCarregando(false)
  }

  async function cadastrarUsuario(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    setSucesso('')

    if (!supabase) {
      setErro('Supabase não configurado.')
      setSalvando(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: {
        data: { papel: form.papel },
      },
    })

    if (error) {
      setErro(error.message === 'User already registered'
        ? 'Este e-mail já está cadastrado.'
        : `Erro ao cadastrar: ${error.message}`)
      setSalvando(false)
      return
    }

    setSucesso(`Usuário ${form.email} cadastrado! Um e-mail de confirmação foi enviado.`)
    setForm({ email: '', senha: '', papel: 'Operador' })
    setMostrarForm(false)
    await carregarUsuarios()
    setSalvando(false)
  }

  async function excluirUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    setExcluindo(id)
    setErro('')

    if (!supabase) {
      setErro('Supabase não configurado.')
      setExcluindo(null)
      return
    }

    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) {
      setErro(`Erro ao excluir: ${error.message}`)
    } else {
      setSucesso('Usuário excluído com sucesso.')
      await carregarUsuarios()
    }

    setExcluindo(null)
  }

  return (
    <AdminShell
      title="Configurações"
      subtitle="Adicione, remova e gerencie usuários do sistema com segurança."
      currentPath="/configuracoes"
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-strong)]">
                Controle de acesso
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--panel-strong)]">
                Usuários do sistema
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Adicione ou remova usuários e gerencie permissões da equipe.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setMostrarForm(!mostrarForm); setErro(''); setSucesso('') }}
              className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:brightness-95"
            >
              {mostrarForm ? 'Cancelar' : 'Adicionar usuário'}
            </button>
          </div>

          {mostrarForm && (
            <form onSubmit={cadastrarUsuario} className="mt-6 rounded-[1.5rem] border border-slate-200/80 bg-[var(--soft)] p-5 space-y-4">
              <p className="text-sm font-semibold text-[var(--ink)]">Novo usuário</p>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted)]">E-mail</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="usuario@email.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Papel</label>
                <select
                  value={form.papel}
                  onChange={(e) => setForm({ ...form, papel: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Operador">Operador</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="w-full rounded-full bg-[var(--ink)] py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
              >
                {salvando ? 'Cadastrando...' : 'Cadastrar usuário'}
              </button>
            </form>
          )}

          {erro && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>
          )}
          {sucesso && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{sucesso}</p>
          )}

          <div className="mt-8 space-y-4">
            {carregando ? (
              <p className="text-sm text-[var(--muted)]">Carregando usuários...</p>
            ) : usuarios.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Nenhum usuário encontrado.</p>
            ) : (
              usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-[var(--soft)] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-[var(--ink)]">{usuario.email}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{usuario.papel}</p>
                    </div>
                    <button
                      type="button"
                      disabled={excluindo === usuario.id}
                      onClick={() => excluirUsuario(usuario.id)}
                      className="rounded-full border border-slate-300/80 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {excluindo === usuario.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-cyan-200/50 bg-cyan-50/80 p-6 shadow-[0_18px_50px_rgba(34,211,238,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-700">
              Dica rápida
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--accent-strong)]">
              Use essa área para manter o acesso ao painel centralizado. Cada usuário pode ter permissões diferentes na operação dos condomínios.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-strong)]">
              Configurações rápidas
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <li>• Limpar usuários inativos</li>
              <li>• Ajustar níveis de acesso</li>
              <li>• Rever logs de cadastro</li>
            </ul>
          </div>
        </div>
      </section>
    </AdminShell>
  )
}
