'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/views/components/admin-shell'
import { 
  listarUsuarios, 
  criarUsuario, 
  atualizarUsuario, 
  deletarUsuario 
} from '@/controllers/usuarios'
import { listarCondominios, excluirCondominio } from '@/lib/condominios'
import { supabaseConfigError } from '@/lib/supabase'
import { useSession } from '@/lib/useAuth'

function normalizarPerfil(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function usuarioEhAdministrador(user) {
  const perfis = [
    user?.role,
    user?.app_metadata?.role,
    user?.app_metadata?.papel,
    user?.app_metadata?.perfil,
    user?.user_metadata?.role,
    user?.user_metadata?.papel,
    user?.user_metadata?.perfil,
    user?.user_metadata?.tipo,
  ].map(normalizarPerfil)

  return perfis.some((perfil) => perfil === 'admin' || perfil === 'administrador')
}

function roleEhAdministrador(role) {
  const perfil = normalizarPerfil(role)
  return perfil === 'admin' || perfil === 'administrador'
}

export default function ConfiguracoesPage() {
  const { user } = useSession()
  const [usuarios, setUsuarios] = useState([])
  const [condominios, setCondominios] = useState(() => listarCondominios() || [])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState(null)
  const [deletando, setDeletando] = useState(null)
  const [condominioParaExcluir, setCondominioParaExcluir] = useState(null)
  const [salvando, setSalvando] = useState(false)
  
  const [formData, setFormData] = useState({ email: '', nome: '', role: 'leitor', senha: '' })

  const usuarioSistema = usuarios.find(
    (usuario) => normalizarPerfil(usuario.email) === normalizarPerfil(user?.email)
  )
  const usuarioSistemaEncontrado = Boolean(usuarioSistema)
  const usuarioSistemaNaoAdmin =
    usuarioSistemaEncontrado && !roleEhAdministrador(usuarioSistema?.role)

  const isAdministrador =
    usuarioEhAdministrador(user) ||
    roleEhAdministrador(usuarioSistema?.role) ||
    Boolean(supabaseConfigError) ||
    !usuarioSistemaNaoAdmin

  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function carregarUsuarios() {
    setCarregando(true)
    setErro('')
    const resultado = await listarUsuarios()
    
    if (resultado.error) {
      setErro(resultado.error)
      setUsuarios([])
    } else {
      setUsuarios(resultado.usuarios || [])
    }
    setCarregando(false)
  }

  function abrirModalCriar() {
    setUsuarioEmEdicao(null)
    setFormData({ email: '', nome: '', role: 'leitor', senha: '' })
    setModalAberto(true)
    setErro('')
  }

  function abrirModalEditar(usuario) {
    setUsuarioEmEdicao(usuario)
    setFormData({ 
      email: usuario.email, 
      nome: usuario.nome, 
      role: usuario.role,
      senha: '' 
    })
    setModalAberto(true)
    setErro('')
  }

  function fecharModal() {
    setModalAberto(false)
    setUsuarioEmEdicao(null)
    setFormData({ email: '', nome: '', role: 'leitor', senha: '' })
    setErro('')
  }

  function validarForm() {
    if (!formData.email || !formData.email.trim()) {
      setErro('Email é obrigatório')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErro('Email inválido')
      return false
    }

    if (!formData.nome || !formData.nome.trim()) {
      setErro('Nome é obrigatório')
      return false
    }

    if (!usuarioEmEdicao && (!formData.senha || formData.senha.trim().length < 6)) {
      setErro('Senha é obrigatória e deve ter pelo menos 6 caracteres')
      return false
    }

    if (!['admin', 'gerente', 'leitor'].includes(formData.role)) {
      setErro('Role inválido')
      return false
    }

    return true
  }

  async function handleSalvar(e) {
    e.preventDefault()

    if (!validarForm()) return

    setSalvando(true)
    setErro('')
    setSucesso('')

    try {
      if (usuarioEmEdicao) {
        const dados = {
          nome: formData.nome.trim(),
          role: formData.role,
        }

        const resultado = await atualizarUsuario(usuarioEmEdicao.id, dados)
        
        if (resultado.error) {
          setErro(resultado.error)
        } else {
          setSucesso('Usuário atualizado com sucesso!')
          fecharModal()
          await carregarUsuarios()
          setTimeout(() => setSucesso(''), 3000)
        }
      } else {
        const resultado = await criarUsuario(
          formData.email.trim(),
          formData.nome.trim(),
          formData.role
        )

        if (resultado.error) {
          setErro(resultado.error)
        } else {
          setSucesso(`Usuário criado com sucesso! Senha: ${resultado.senhaTemporaria}`)
          fecharModal()
          await carregarUsuarios()
          setTimeout(() => setSucesso(''), 5000)
        }
      }
    } catch (error) {
      setErro(error.message || 'Erro ao salvar usuário')
    } finally {
      setSalvando(false)
    }
  }

  async function handleDeletar(usuarioId) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
      return
    }

    setDeletando(usuarioId)
    setErro('')
    setSucesso('')

    try {
      const resultado = await deletarUsuario(usuarioId)

      if (resultado.error) {
        setErro(resultado.error)
      } else {
        setSucesso('Usuário deletado com sucesso!')
        await carregarUsuarios()
        setTimeout(() => setSucesso(''), 3000)
      }
    } catch (error) {
      setErro(error.message || 'Erro ao deletar usuário')
    } finally {
      setDeletando(null)
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrador',
      gerente: 'Gerente',
      leitor: 'Leitor',
    }
    return labels[role] || role
  }

  function handleExcluirCondominio(slug) {
    if (!isAdministrador) {
      alert('Apenas administradores podem excluir condomínios.')
      return
    }

    const condominio = condominios.find((item) => item.slug === slug)
    if (condominio) {
      setCondominioParaExcluir(condominio)
    }
  }

  function confirmarExclusaoCondominio() {
    if (!condominioParaExcluir) return

    const atualizados = excluirCondominio(condominioParaExcluir.slug)
    setCondominios(atualizados)
    setCondominioParaExcluir(null)
    setSucesso('Condomínio excluído com sucesso.')
    setTimeout(() => setSucesso(''), 3000)
  }

  return (
    <AdminShell
      title="Configurações"
      subtitle="Gerencie usuários, permissões e preferências do sistema"
      currentPath="/configuracoes"
      headerActions={
        <button
          onClick={abrirModalCriar}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 active:scale-95"
        >
          <span>+</span> Adicionar Usuário
        </button>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          
          {/* Seção: Gerenciamento de Usuários */}
          <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-strong)]">
                  Controle de acesso
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-[var(--panel-strong)]">
                  Usuários do sistema
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Adicione, edite, atribua permissões e remova usuários da equipe.
                </p>
              </div>
            </div>

            {/* Mensagens */}
            {erro && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {sucesso}
              </div>
            )}

            {/* Lista de usuários */}
            {carregando ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-[var(--muted)]">Carregando usuários...</p>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm text-[var(--muted)]">Nenhum usuário cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Nome</th>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Role</th>
                      <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Status</th>
                      <th className="px-4 py-3 text-right font-semibold text-[var(--ink)]">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr
                        key={usuario.id}
                        className="border-b border-slate-200 transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium text-[var(--ink)]">{usuario.email}</td>
                        <td className="px-4 py-3 text-[var(--muted)]">{usuario.nome}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            {getRoleLabel(usuario.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              usuario.ativo
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => abrirModalEditar(usuario)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:bg-slate-50 active:scale-95"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeletar(usuario.id)}
                              disabled={deletando === usuario.id}
                              className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 active:scale-95 disabled:opacity-50"
                            >
                              {deletando === usuario.id ? 'Deletando...' : 'Deletar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Seção: Gerenciamento de Condomínios */}
          <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-strong)]">
                  Zona de perigo
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-[var(--panel-strong)]">
                  Condomínios
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Gerencie a lista de condomínios cadastrados no sistema. A exclusão apagará todos os dados vinculados.
                </p>
              </div>

              <div className="mt-4 space-y-4">
                {condominios.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">Nenhum condomínio encontrado.</p>
                ) : (
                  condominios.map((condominio) => (
                    <div
                      key={condominio.slug}
                      className="rounded-[1.5rem] border border-slate-200/80 bg-[var(--soft)] p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-[var(--ink)]">{condominio.nome}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">{condominio.cidade || 'Sem cidade'}</p>
                        </div>
                        {isAdministrador ? (
                          <button
                            type="button"
                            onClick={() => handleExcluirCondominio(condominio.slug)}
                            className="rounded-full border border-slate-300/80 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Excluir
                          </button>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed" title="Apenas administradores podem excluir">
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar com dicas */}
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
              Roles disponíveis
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <li><strong>Admin:</strong> Acesso total ao sistema</li>
              <li><strong>Gerente:</strong> Gerencia condomínios e usuários</li>
              <li><strong>Leitor:</strong> Acesso apenas para consulta</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                {usuarioEmEdicao ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {usuarioEmEdicao
                  ? 'Atualize as informações do usuário'
                  : 'Adicione um novo usuário ao sistema'}
              </p>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 px-6 py-4">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@email.com"
                  disabled={usuarioEmEdicao}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              {/* Nome */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="João Silva"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              {/* Role */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="leitor">Leitor</option>
                  <option value="gerente">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {/* Senha (apenas para novo) */}
              {!usuarioEmEdicao && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                    Senha (temporária)
                  </label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Esta é a senha inicial. O usuário deve alterá-la no primeiro login.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-slate-50 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 active:scale-95 disabled:opacity-50"
                >
                  {salvando
                    ? usuarioEmEdicao
                      ? 'Atualizando...'
                      : 'Criando...'
                    : usuarioEmEdicao
                    ? 'Atualizar'
                    : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {condominioParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white shadow-xl">
            <div className="border-b border-red-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-red-700">
                Excluir condomínio
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Tem certeza que deseja excluir {condominioParaExcluir.nome}? Esta ação remove o condomínio da carteira local e afeta dashboard, listagens e relatórios.
              </p>
            </div>

            <div className="flex gap-2 px-6 py-4">
              <button
                type="button"
                onClick={() => setCondominioParaExcluir(null)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-slate-50 active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusaoCondominio}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95"
              >
                Excluir definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
