'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/views/components/admin-shell'
import { adicionarCondominio } from '@/controllers/condominio'

const inputClass = 'w-full rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">{label}</span>
      {children}
    </label>
  )
}

function formatarCNPJ(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function formatarCEP(valor) {
  return valor.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')
}

export default function NovoCondominioPage() {
  const [form, setForm] = useState({
    nome: '',
    cnpj: '',
    sindico: '',
    unidades: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  })
  const [salvando, setSalvando] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [erroCep, setErroCep] = useState('')
  const [erro, setErro] = useState('')

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function buscarCep(cepRaw) {
    const cep = cepRaw.replace(/\D/g, '')
    if (cep.length !== 8) return
    setBuscandoCep(true)
    setErroCep('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data.erro) {
        setErroCep('CEP não encontrado.')
      } else {
        setForm((f) => ({
          ...f,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }))
      }
    } catch {
      setErroCep('Erro ao buscar CEP. Verifique sua conexão.')
    }
    setBuscandoCep(false)
  }

  function cadastrar(e) {
    e.preventDefault()
    if (!form.nome || !form.sindico || !form.unidades) {
      setErro('Preencha pelo menos nome, síndico e unidades.')
      return
    }
    setSalvando(true)
    setErro('')
    const novo = adicionarCondominio(form)
    window.location.href = `/condominios/${novo.slug}`
  }

  return (
    <AdminShell
      title="Cadastrar novo condomínio"
      subtitle="Registre um novo cliente com todos os dados cadastrais."
      currentPath="/condominios/novo"
    >
      <form onSubmit={cadastrar} className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">

          {/* Dados principais */}
          <div className="rounded-[1.75rem] border border-black/5 bg-white/85 p-5 shadow-[0_18px_50px_rgba(71,47,24,0.08)]">
            <h2 className="text-base font-semibold text-[var(--ink)]">Dados principais</h2>
            <div className="mt-4 grid gap-3">
              <Field label="Nome do condomínio">
                <input
                  value={form.nome}
                  onChange={(e) => atualizar('nome', e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Condomínio Reserva das Flores"
                  required
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="CNPJ">
                  <input
                    value={form.cnpj}
                    onChange={(e) => atualizar('cnpj', formatarCNPJ(e.target.value))}
                    className={inputClass}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </Field>
                <Field label="Unidades">
                  <input
                    type="number"
                    min="1"
                    value={form.unidades}
                    onChange={(e) => atualizar('unidades', e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: 96"
                    required
                  />
                </Field>
              </div>

              <Field label="Síndico responsável">
                <input
                  value={form.sindico}
                  onChange={(e) => atualizar('sindico', e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Ana Bezerra"
                  required
                />
              </Field>
            </div>
          </div>

          {/* Endereço */}
          <div className="rounded-[1.75rem] border border-black/5 bg-white/85 p-5 shadow-[0_18px_50px_rgba(71,47,24,0.08)]">
            <h2 className="text-base font-semibold text-[var(--ink)]">Endereço</h2>
            <div className="mt-4 grid gap-3">

              <Field label="CEP">
                <div className="flex gap-2">
                  <input
                    value={form.cep}
                    onChange={(e) => {
                      const v = formatarCEP(e.target.value)
                      atualizar('cep', v)
                      if (v.replace(/\D/g, '').length === 8) buscarCep(v)
                    }}
                    className={inputClass}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {buscandoCep && (
                    <span className="flex items-center text-xs text-[var(--muted)] whitespace-nowrap">Buscando...</span>
                  )}
                </div>
                {erroCep && <p className="mt-1 text-xs text-red-500">{erroCep}</p>}
              </Field>

              <Field label="Logradouro">
                <input
                  value={form.logradouro}
                  onChange={(e) => atualizar('logradouro', e.target.value)}
                  className={inputClass}
                  placeholder="Rua, Avenida..."
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Número">
                  <input
                    value={form.numero}
                    onChange={(e) => atualizar('numero', e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: 123"
                  />
                </Field>
                <Field label="Complemento">
                  <input
                    value={form.complemento}
                    onChange={(e) => atualizar('complemento', e.target.value)}
                    className={inputClass}
                    placeholder="Apto, Bloco..."
                  />
                </Field>
              </div>

              <Field label="Bairro">
                <input
                  value={form.bairro}
                  onChange={(e) => atualizar('bairro', e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Centro"
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-[1fr_80px]">
                <Field label="Cidade">
                  <input
                    value={form.cidade}
                    onChange={(e) => atualizar('cidade', e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: Fortaleza"
                  />
                </Field>
                <Field label="UF">
                  <input
                    value={form.estado}
                    onChange={(e) => atualizar('estado', e.target.value.toUpperCase().slice(0, 2))}
                    className={inputClass}
                    placeholder="CE"
                    maxLength={2}
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-3">
          <div className="rounded-[1.75rem] border border-black/5 bg-[var(--ink)] p-5 text-white shadow-[0_18px_50px_rgba(71,47,24,0.1)]">
            <h2 className="text-base font-semibold">O que já nasce pronto</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/70">
              <li>• Condomínio entra na carteira e aparece no dashboard</li>
              <li>• Página individual para cadastrar contas, avisos e manutenções</li>
              <li>• Manutenções começam vazias para evitar alertas falsos no dashboard</li>
              <li>• CEP preenchido automaticamente via API dos Correios</li>
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-black/5 bg-white/85 p-5 shadow-[0_18px_50px_rgba(71,47,24,0.08)]">
            {erro && (
              <p className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>
            )}
            <button
              type="submit"
              disabled={salvando}
              className="w-full rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Criar condomínio'}
            </button>
            <Link
              href="/condominios"
              className="mt-3 block w-full rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--ink)] ring-1 ring-black/10 transition hover:bg-[var(--soft)]"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </AdminShell>
  )
}
