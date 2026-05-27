/**
 * app/documentos/page.js
 * 
 * Página de gestão de documentos (rota: /documentos)
 * - Centraliza atas de assembleias, contratos e arquivos importantes
 * - Exibe documentos agrupados por condomínio
 * - Classifica por tipo: Ata, Documento, Contrato, etc.
 * - Interface para upload e gerenciamento de arquivos
 */

'use client'

import { useRef, useState, useMemo, useReducer, useEffect } from 'react'
import AdminShell from '@/views/components/admin-shell'
import { listarCondominios, adicionarDocumentoAoCondominio, formatarData } from '@/controllers/condominio'
import { inputClass, Field, SubmitButton } from '@/views/components/ui'

export default function DocumentosPage() {
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const [condominios, setCondominios] = useState([])
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setCondominios(listarCondominios())
    setMontado(true)
  }, [])
  
  // Agrupar todos os documentos de todos os condomínios cadastrados
  const todosDocumentos = useMemo(() => {
    if (!condominios.length) return []
    const docs = []
    condominios.forEach(c => {
      if (c.documentos) {
        c.documentos.forEach(d => {
          docs.push({ ...d, slug: c.slug, nomeCondominio: c.nome })
        })
      }
    })
    return docs.sort((a, b) => String(b.data).localeCompare(String(a.data)))
  }, [condominios])

  const fileInputRef = useRef(null)
  const [modalUpload, setModalUpload] = useState(null) // { file, base64 }
  const [form, setForm] = useState({ 
    slug: '', 
    tipo: 'Contrato', 
    titulo: '', 
    data: new Date().toISOString().split('T')[0] 
  })

  // Atualiza o slug padrão quando os condomínios carregam
  useEffect(() => {
    if (condominios.length > 0 && !form.slug) {
      setForm(prev => ({ ...prev, slug: condominios[0].slug }))
    }
  }, [condominios])

  function handleEnviarClick() {
    // Aciona o clique no input escondido para abrir o seletor de arquivos do Windows/Mac
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setModalUpload({ file, base64: ev.target.result })
      setForm(prev => ({ ...prev, titulo: file.name }))
    }
    reader.readAsDataURL(file)
  }

  function salvarDocumento(e) {
    e.preventDefault()
    if (!modalUpload) return

    adicionarDocumentoAoCondominio(form.slug, {
      titulo: form.titulo,
      tipo: form.tipo,
      data: form.data,
      arquivo: modalUpload.base64
    })

    setModalUpload(null)
    forceUpdate()
    alert('Documento enviado e salvo com sucesso!')
  }

  if (!montado) return null // Evita erro de hidratação

  return (
    <>
    <AdminShell
      title="Documentos"
      subtitle="Guarde atas, contratos e arquivos importantes de cada condomínio."
      currentPath="/documentos"
    >
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent-strong)]">
              Arquivos
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--panel-strong)]">
              Documentos e atas
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Visualize e organize os principais documentos de cada condomínio em um único espaço.
            </p>
          </div>

          {/* Input de arquivo escondido para abrir o explorador do sistema */}
          <input 
            type="file" 
            accept="image/*,.pdf" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button 
            onClick={handleEnviarClick}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-sm font-bold text-[var(--ink)] shadow-lg shadow-cyan-500/15 transition hover:scale-105 hover:brightness-95 active:scale-95"
          >
            📤 Enviar documentos
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)] mb-5 px-1">
            Todos os documentos ({todosDocumentos.length})
          </h3>
          
          {todosDocumentos.length === 0 ? (
            <div className="rounded-[1.75rem] border-2 border-dashed border-slate-200 p-10 text-center text-slate-400">
              Nenhum documento encontrado. Clique em enviar para começar.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {todosDocumentos.map((doc) => (
                <article
                  key={doc.id}
                  className="rounded-[1.75rem] border border-slate-200/80 bg-[var(--soft)] p-5 transition hover:shadow-md hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-[var(--ink)] truncate">{doc.titulo}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{doc.nomeCondominio}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{formatarData(doc.data)}</p>
                      {doc.arquivo && (
                        <a href={doc.arquivo} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-bold text-[var(--accent-strong)] hover:underline">
                          📄 Visualizar anexo
                        </a>
                      )}
                    </div>
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800 shrink-0">
                      {doc.tipo}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>

    {/* Modal para finalizar o envio do contrato/documento */}
    {modalUpload && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <h3 className="text-2xl font-bold text-[var(--panel-strong)] mb-2">Finalizar envio</h3>
          <p className="text-sm text-[var(--muted)] mb-6">Selecione o condomínio e o tipo de documento para salvar.</p>

          <form onSubmit={salvarDocumento} className="space-y-4">
            <Field label="Nome do documento">
              <input value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} className={inputClass} required />
            </Field>

            <Field label="Destino (Condomínio)">
              <select value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className={inputClass} required>
                {condominios.map(c => <option key={c.slug} value={c.slug}>{c.nome}</option>)}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo">
                <select value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))} className={inputClass}>
                  <option value="Contrato">Contrato</option>
                  <option value="Ata">Ata</option>
                  <option value="Regulamento">Regulamento</option>
                  <option value="Outros">Outros</option>
                </select>
              </Field>
              <Field label="Data">
                <input type="date" value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} className={inputClass} required />
              </Field>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setModalUpload(null)} className="flex-1 rounded-full border border-slate-200 py-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95">
                Cancelar
              </button>
              <SubmitButton label="Salvar documento" />
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  )
}
