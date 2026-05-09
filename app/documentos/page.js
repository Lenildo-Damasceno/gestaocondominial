/**
 * app/documentos/page.js
 * 
 * Página de gestão de documentos (rota: /documentos)
 * - Centraliza atas de assembleias, contratos e arquivos importantes
 * - Exibe documentos agrupados por condomínio
 * - Classifica por tipo: Ata, Documento, Contrato, etc.
 * - Interface para upload e gerenciamento de arquivos
 */

import AdminShell from '@/components/admin-shell'

const documentos = [
  {
    id: 'doc1',
    titulo: 'Ata da assembleia de maio',
    condominio: 'Condominio Vista Parque',
    tipo: 'Ata',
  },
  {
    id: 'doc2',
    titulo: 'Contrato de limpeza anual',
    condominio: 'Condominio Jardins do Lago',
    tipo: 'Documento',
  },
]

export default function DocumentosPage() {
  return (
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
          <button className="inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:brightness-95">
            Adicionar documento
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {documentos.map((doc) => (
            <article
              key={doc.id}
              className="rounded-[1.75rem] border border-slate-200/80 bg-[var(--soft)] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-[var(--ink)]">{doc.titulo}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{doc.condominio}</p>
                </div>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
                  {doc.tipo}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
