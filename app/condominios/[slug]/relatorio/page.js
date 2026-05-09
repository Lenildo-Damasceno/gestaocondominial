'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { buscarCondominioPorSlug, formatarData, formatarMoeda, normalizarConta, resumirUrgenciaConta } from '@/lib/condominios'

export default function RelatorioPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const condominio = slug ? buscarCondominioPorSlug(slug) : null

  if (!condominio) {
    return (
      <div className="p-8 text-center">
        <p>Condomínio não encontrado.</p>
        <Link href="/condominios" className="mt-4 inline-block text-blue-600 underline">Voltar</Link>
      </div>
    )
  }

  const contasNormalizadas = condominio.contas.map(normalizarConta)
  const manutencoesPendentes = condominio.manutencoes.filter((m) => m.status !== 'Concluída')
  const hoje = new Date().toLocaleDateString('pt-BR')

  return (
    <div className="min-h-screen bg-white">
      {/* Barra de ações — não aparece na impressão */}
      <div className="print:hidden flex items-center justify-between gap-4 border-b px-6 py-3 bg-[#1a3a5c]">
        <span className="text-sm font-semibold text-white">Relatório — {condominio.nome}</span>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#1a3a5c] transition hover:bg-blue-50"
          >
            Imprimir / Salvar PDF
          </button>
          <Link href={`/condominios/${slug}`} className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20">
            Voltar
          </Link>
        </div>
      </div>

      {/* Conteúdo do relatório */}
      <div className="mx-auto max-w-3xl px-8 py-10 text-slate-800">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between border-b-2 border-[#1a3a5c] pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">ES Gestão Condominial</p>
            <h1 className="mt-1 text-2xl font-bold text-[#1a3a5c]">{condominio.nome}</h1>
            {condominio.cnpj && <p className="mt-1 text-sm text-slate-500">CNPJ: {condominio.cnpj}</p>}
            {condominio.cidade && <p className="text-sm text-slate-500">{condominio.logradouro ? `${condominio.logradouro}, ${condominio.numero} — ` : ''}{condominio.cidade}{condominio.estado ? `/${condominio.estado}` : ''}</p>}
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Gerado em {hoje}</p>
            <p className="mt-1">Síndico: {condominio.sindico}</p>
            <p>Unidades: {condominio.unidades}</p>
          </div>
        </div>

        {/* Contas */}
        <section className="mt-8">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#1a3a5c]">Contas</h2>
          {contasNormalizadas.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Nenhuma conta cadastrada.</p>
          ) : (
            <table className="mt-3 w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-4">Título</th>
                  <th className="py-2 pr-4">Categoria</th>
                  <th className="py-2 pr-4">Vencimento</th>
                  <th className="py-2 pr-4">Valor</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {contasNormalizadas.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium">{c.titulo}</td>
                    <td className="py-2 pr-4 text-slate-500">{c.categoria}</td>
                    <td className="py-2 pr-4">{formatarData(c.proximoVencimento || c.vencimento)}</td>
                    <td className="py-2 pr-4">{formatarMoeda(c.valor)}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${resumirUrgenciaConta(c).tone === 'red' ? 'bg-red-100 text-red-700' : resumirUrgenciaConta(c).tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Manutenções */}
        <section className="mt-8">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#1a3a5c]">Manutenções pendentes</h2>
          {manutencoesPendentes.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Nenhuma manutenção pendente.</p>
          ) : (
            <table className="mt-3 w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-4">Título</th>
                  <th className="py-2 pr-4">Frequência</th>
                  <th className="py-2 pr-4">Próxima data</th>
                  <th className="py-2 pr-4">Responsável</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {manutencoesPendentes.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium">{m.titulo}</td>
                    <td className="py-2 pr-4 text-slate-500">{m.frequencia || '—'}</td>
                    <td className="py-2 pr-4">{m.proximaData ? formatarData(m.proximaData) : '—'}</td>
                    <td className="py-2 pr-4 text-slate-500">{m.responsavel || '—'}</td>
                    <td className="py-2 text-xs font-semibold text-slate-600">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Avisos */}
        <section className="mt-8">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#1a3a5c]">Avisos</h2>
          {condominio.avisos.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Nenhum aviso cadastrado.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {condominio.avisos.map((a) => (
                <div key={a.id} className="border-l-2 border-[#1a3a5c] pl-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{a.titulo}</p>
                    <p className="text-xs text-slate-500">{formatarData(a.data)}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{a.descricao}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Assembleias */}
        <section className="mt-8">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#1a3a5c]">Assembleias</h2>
          {!condominio.assembleias?.length ? (
            <p className="mt-3 text-sm text-slate-400">Nenhuma assembleia cadastrada.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {condominio.assembleias.map((a) => (
                <div key={a.id} className="border-l-2 border-[#1a3a5c] pl-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{a.titulo}</p>
                    <p className="text-xs text-slate-500">{formatarData(a.data)}{a.horario ? ` · ${a.horario}` : ''}</p>
                  </div>
                  {a.local && <p className="text-sm text-slate-500">Local: {a.local}</p>}
                  {a.pauta && <p className="mt-1 text-sm text-slate-500">{a.pauta}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Rodapé */}
        <div className="mt-12 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          ES Gestão Condominial · Relatório gerado em {hoje}
        </div>
      </div>
    </div>
  )
}
