'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-shell'
import { adicionarCondominio } from '@/lib/condominios'

export default function NovoCondominioPage() {
  const [form, setForm] = useState({
    nome: '',
    cidade: '',
    sindico: '',
    unidades: '',
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function atualizarCampo(evento) {
    const { name, value } = evento.target
    setForm((atual) => ({ ...atual, [name]: value }))
  }

  function validar() {
    if (!form.nome || !form.cidade || !form.sindico || !form.unidades) {
      return 'Preencha nome, cidade, sindico e quantidade de unidades.'
    }

    return ''
  }

  function cadastrar(evento) {
    evento.preventDefault()

    const mensagemErro = validar()
    if (mensagemErro) {
      setErro(mensagemErro)
      return
    }

    setSalvando(true)
    setErro('')

    const novo = adicionarCondominio(form)
    window.location.href = `/condominios/${novo.slug}`
  }

  return (
    <AdminShell
      title="Cadastrar novo condominio"
      subtitle="Registre um novo cliente e ja deixe pronta a estrutura inicial de manutencoes, avisos e contas para comecar a operacao."
      currentPath="/condominios/novo"
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={cadastrar}
          className="rounded-[1.75rem] border border-black/5 bg-white/85 p-6 shadow-[0_18px_50px_rgba(71,47,24,0.08)]"
        >
          <h2 className="text-xl font-semibold text-[var(--ink)]">Dados do condominio</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Esta primeira versao ja cria a base do condominio e uma lista inicial de manutencoes por frequencia.
          </p>

          <div className="mt-6 grid gap-4">
            <Field label="Nome do condominio">
              <input
                name="nome"
                value={form.nome}
                onChange={atualizarCampo}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                placeholder="Ex.: Condominio Reserva das Flores"
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Cidade">
                <input
                  name="cidade"
                  value={form.cidade}
                  onChange={atualizarCampo}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  placeholder="Ex.: Fortaleza"
                />
              </Field>

              <Field label="Unidades">
                <input
                  type="number"
                  min="1"
                  name="unidades"
                  value={form.unidades}
                  onChange={atualizarCampo}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  placeholder="Ex.: 96"
                />
              </Field>
            </div>

            <Field label="Sindico responsavel">
              <input
                name="sindico"
                value={form.sindico}
                onChange={atualizarCampo}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                placeholder="Ex.: Ana Bezerra"
              />
            </Field>
          </div>

          {erro ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Criar condominio'}
            </button>
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] ring-1 ring-black/10 transition hover:bg-[var(--soft)]"
            >
              Voltar ao dashboard
            </Link>
          </div>
        </form>

        <section className="rounded-[1.75rem] border border-black/5 bg-[var(--ink)] p-6 text-white shadow-[0_18px_50px_rgba(71,47,24,0.1)]">
          <h2 className="text-xl font-semibold">O que ja nasce pronto</h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/75">
            <p>O condominio entra na sua carteira de administracao e aparece no dashboard inicial.</p>
            <p>A pagina individual do condominio fica pronta com visao de contas, avisos e manutencoes.</p>
            <p>As manutencoes baseadas em rotina sao criadas nas frequencias diaria, mensal, trimestral, semestral e anual.</p>
          </div>
        </section>
      </section>
    </AdminShell>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--ink)]">{label}</span>
      {children}
    </label>
  )
}
