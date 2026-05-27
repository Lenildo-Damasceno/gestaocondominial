'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import AdminShell from '@/views/components/admin-shell'
import { registrarLog } from '@/controllers/logs'
import { useCondominios } from '@/lib/useCondominios'
import { useSession } from '@/lib/useAuth'

const coresCondominio = [
  'from-[#0f52ff] to-[#22d3ee]',
  'from-[#0f766e] to-[#14b8a6]',
  'from-[#7c2d12] to-[#ea580c]',
  'from-[#4338ca] to-[#7c3aed]',
  'from-[#9f1239] to-[#e11d48]',
]

export default function CondominiosPage() {
  const condominios = useCondominios()
  const { user, permissoes, carregando: verificandoSessao } = useSession()

  useEffect(() => {
    if (user) {
      registrarLog(user.id, 'VER_LISTAGEM_CONDOMINIOS', null, 'Acessou listagem de condomínios').catch(() => {})
    }
  }, [user])

  // Filtrar condomínios baseado em permissões e role
  const isAdmin = user?.role === 'admin' || user?.user_metadata?.papel === 'Administrador'
  const temPermissoesConfiguradas = Array.isArray(permissoes) && permissoes.length > 0
  const condominiosFiltrados = isAdmin || !temPermissoesConfiguradas ? condominios : condominios.filter(cond => {
    // Admin vê todos
    if (user?.role === 'admin') {
      return true
    }
    // Não-admin vê apenas os que tem permissão
    return permissoes?.includes(cond.id) || false
  })
  const semPermissoes = !verificandoSessao && condominios.length > 0 && condominiosFiltrados.length === 0

  return (
    <AdminShell
      title="Condominios"
      subtitle="Escolha abaixo o condominio que voce quer abrir."
      currentPath="/condominios"
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Sua carteira
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--panel-strong)]">
              Selecione um condominio
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[var(--ink)]">
            {condominiosFiltrados.length}
          </span>
        </div>

        <div className="mt-5">
          {verificandoSessao ? (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--soft)] px-4 py-8 text-center">
              <p className="text-sm font-semibold text-[var(--panel-strong)]">
                Carregando condomínios...
              </p>
            </div>
          ) : semPermissoes ? (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--soft)] px-4 py-8 text-center">
              <p className="text-sm font-semibold text-[var(--panel-strong)]">
                Você não tem acesso a nenhum condomínio. Contate o administrador.
              </p>
            </div>
          ) : condominiosFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--soft)] px-4 py-8 text-center">
              <p className="text-sm font-semibold text-[var(--panel-strong)]">
                Nenhum condominio cadastrado
              </p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {condominiosFiltrados.map((condominio, index) => (
                <Link
                  key={condominio.id}
                  href={`/condominios/${condominio.slug}`}
                  className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${coresCondominio[index % coresCondominio.length]} p-4 text-white shadow-md transition hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] sm:p-5`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                  <div className="relative z-10 flex items-center gap-3">
                    {condominio.foto ? (
                      <img 
                        src={condominio.foto} 
                        alt={condominio.nome} 
                        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-white/20"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 text-lg ring-1 ring-white/20">
                        🏢
                      </div>
                    )}
                    <p className="font-semibold text-white line-clamp-2">{condominio.nome}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              Cadastro
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--panel-strong)]">
              Cadastrar condominio novo
            </h2>
          </div>

          <Link
            href="/condominios/novo"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--panel-strong)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 sm:w-auto"
          >
            Cadastrar condominio
          </Link>
        </div>
      </section>
    </AdminShell>
  )
}
