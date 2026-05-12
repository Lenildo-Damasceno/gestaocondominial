'use client'

/**
 * views/components/detalhe-modal.js
 * Modal de detalhes e edição rápida para contas, manutenções e avisos
 */

import { useState } from 'react'
import { editarContaDoCondominio, editarManutencaoDoCondominio, editarAvisoDoCondominio, formatarData, formatarMoeda, descreverRecorrenciaConta, resumirUrgenciaConta } from '@/controllers/condominio'

export default function DetalheModal({ item, tipo, slug, onClose, onSaved }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(() => {
    if (tipo === 'conta') return { status: item.status, valor: item.valor, vencimento: item.vencimento, titulo: item.titulo, categoria: item.categoria || '' }
    if (tipo === 'manutencao') return { status: item.status, proximaData: item.proximaData || '', responsavel: item.responsavel || '', observacao: '' }
    if (tipo === 'aviso') return { titulo: item.titulo, data: item.data, descricao: item.descricao }
    return {}
  })

  function salvar() {
    if (tipo === 'conta') {
      editarContaDoCondominio(slug, item.id, { status: form.status, valor: Number(form.valor), vencimento: form.vencimento, titulo: form.titulo, categoria: form.categoria })
    } else if (tipo === 'manutencao') {
      editarManutencaoDoCondominio(slug, item.id, { status: form.status, proximaData: form.proximaData, responsavel: form.responsavel })
    } else if (tipo === 'aviso') {
      editarAvisoDoCondominio(slug, item.id, { titulo: form.titulo, data: form.data, descricao: form.descricao })
    }
    alert('Salvo com sucesso!')
    onSaved?.()
    onClose()
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Cabeçalho */}
        <div className={`px-4 py-3 flex items-start justify-between gap-3 ${
          tipo === 'conta' ? 'bg-[#10203a]'
          : tipo === 'manutencao' ? 'bg-slate-700'
          : 'bg-slate-600'
        }`}>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
              {tipo === 'conta' ? '💰 Conta' : tipo === 'manutencao' ? '🔧 Manutenção' : '📢 Aviso'}
              {item.condominio ? ` · ${item.condominio}` : ''}
            </p>
            <p className="mt-0.5 text-sm font-bold text-white leading-tight">{item.titulo}</p>
          </div>
          <button onClick={onClose} className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white text-base">×</button>
        </div>

        <div className="px-4 py-4 space-y-3">

          {/* CONTA */}
          {tipo === 'conta' && !editando && (
            <>
              <Row label="Valor" value={formatarMoeda(item.valor)} />
              <Row label="Vencimento" value={formatarData(item.proximoVencimento || item.vencimento)} />
              <Row label="Categoria" value={item.categoria || '—'} />
              <Row label="Recorrência" value={descreverRecorrenciaConta(item)} />
              <Row label="Urgência" value={resumirUrgenciaConta(item).label} />
              <StatusRow status={item.status} tipo="conta" />
            </>
          )}
          {tipo === 'conta' && editando && (
            <>
              <Field label="Título"><input value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} className={inputCls} /></Field>
              <Field label="Valor (R$)"><input type="number" step="0.01" value={form.valor} onChange={(e) => setForm(f => ({ ...f, valor: e.target.value }))} className={inputCls} /></Field>
              <Field label="Vencimento"><input type="date" value={form.vencimento} onChange={(e) => setForm(f => ({ ...f, vencimento: e.target.value }))} className={inputCls} /></Field>
              <Field label="Categoria"><input value={form.categoria} onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))} className={inputCls} /></Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                  <option>Pendente</option>
                  <option>Agendada</option>
                  <option>Pago</option>
                </select>
              </Field>
            </>
          )}

          {/* MANUTENÇÃO */}
          {tipo === 'manutencao' && !editando && (
            <>
              <Row label="Próxima data" value={item.proximaData ? formatarData(item.proximaData) : 'Sem data'} />
              <Row label="Responsável" value={item.responsavel || '—'} />
              <Row label="Frequência" value={item.frequencia || '—'} />
              <Row label="Tipo" value={item.tipo || 'Programada'} />
              <StatusRow status={item.status} tipo="manutencao" />
              {(item.historico || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Últimas execuções</p>
                  <div className="space-y-1.5">
                    {(item.historico || []).slice(0, 3).map((h) => (
                      <div key={h.id} className="rounded-xl bg-slate-50 px-3 py-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-700">{formatarData(h.data)}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${h.status === 'Concluída' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{h.status}</span>
                        </div>
                        {h.executor && <p className="text-slate-500 mt-0.5">Executor: {h.executor}</p>}
                        {h.observacao && <p className="text-slate-500">{h.observacao}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {tipo === 'manutencao' && editando && (
            <>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                  <option>Programada</option>
                  <option>Agendada</option>
                  <option>Pendente</option>
                  <option>Concluída</option>
                  <option>Não realizada</option>
                </select>
              </Field>
              <Field label="Próxima data"><input type="date" value={form.proximaData} onChange={(e) => setForm(f => ({ ...f, proximaData: e.target.value }))} className={inputCls} /></Field>
              <Field label="Responsável"><input value={form.responsavel} onChange={(e) => setForm(f => ({ ...f, responsavel: e.target.value }))} className={inputCls} /></Field>
            </>
          )}

          {/* AVISO */}
          {tipo === 'aviso' && !editando && (
            <>
              <Row label="Data" value={formatarData(item.data)} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Descrição</p>
                <p className="text-sm text-slate-700 leading-relaxed">{item.descricao}</p>
              </div>
            </>
          )}
          {tipo === 'aviso' && editando && (
            <>
              <Field label="Título"><input value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} className={inputCls} /></Field>
              <Field label="Data"><input type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} className={inputCls} /></Field>
              <Field label="Descrição"><textarea value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} className={`${inputCls} min-h-20`} /></Field>
            </>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-1">
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="flex-1 rounded-full bg-[#10203a] py-2.5 text-sm font-semibold text-white active:scale-95"
              >
                Editar
              </button>
            )}
            {editando && (
              <>
                <button onClick={salvar} className="flex-1 rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white active:scale-95">Salvar</button>
                <button onClick={() => setEditando(false)} className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 active:scale-95">Cancelar</button>
              </>
            )}
            {!editando && (
              <button onClick={onClose} className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 active:scale-95">Fechar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className="font-medium text-slate-700 text-right">{value}</span>
    </div>
  )
}

function StatusRow({ status }) {
  const cls =
    status === 'Pago' || status === 'Paga' || status === 'Concluída' ? 'bg-emerald-100 text-emerald-700'
    : status === 'Não realizada' || status === 'Atrasada' ? 'bg-red-100 text-red-700'
    : status === 'Pendente' ? 'bg-amber-100 text-amber-700'
    : status === 'Agendada' ? 'bg-blue-100 text-blue-700'
    : status === 'Programada' ? 'bg-cyan-100 text-cyan-700'
    : 'bg-slate-100 text-slate-600'
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</span>
      <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${cls}`}>{status}</span>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      {children}
    </label>
  )
}
