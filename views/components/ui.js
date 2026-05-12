'use client'

/**
 * views/components/ui.js
 * VIEW — Componentes UI reutilizáveis entre as páginas
 */

export const inputClass =
  'w-full rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]'

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--ink)]">{label}</span>
      {children}
    </label>
  )
}

export function SubmitButton({ label }) {
  return (
    <button
      type="submit"
      className="w-full rounded-full bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
    >
      {label}
    </button>
  )
}

export function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--soft)] px-4 py-5 text-sm text-[var(--muted)]">
      {text}
    </div>
  )
}

export function StatusBadge({ status }) {
  const cls =
    status === 'Concluída' ? 'bg-emerald-100 text-emerald-700'
    : status === 'Não realizada' ? 'bg-red-100 text-red-700'
    : status === 'Agendada' ? 'bg-blue-100 text-blue-700'
    : status === 'Programada' ? 'bg-cyan-100 text-cyan-700'
    : 'bg-slate-100 text-slate-600'
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{status}</span>
  )
}

export function StatusPill({ tone, children }) {
  const toneClass =
    tone === 'red' ? 'bg-red-100 text-red-700'
    : tone === 'amber' ? 'bg-amber-100 text-amber-700'
    : tone === 'emerald' ? 'bg-emerald-100 text-emerald-700'
    : 'bg-slate-100 text-slate-700'
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  )
}

export function ContentPanel({ title, children, actionLabel, actionOpen = false, onActionToggle }) {
  return (
    <section className="rounded-[1.75rem] border border-black/5 bg-white/85 p-6 shadow-[0_18px_50px_rgba(71,47,24,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-[var(--ink)]">{title}</h2>
        {actionLabel ? (
          <button
            type="button"
            onClick={onActionToggle}
            className="inline-flex w-fit rounded-full bg-[var(--panel-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110"
          >
            {actionOpen ? 'Fechar' : actionLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  )
}

export function InlineFormWrap({ children }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(34,211,238,0.06),rgba(255,255,255,0.85))] p-4">
      {children}
    </div>
  )
}

export function FormPanel({ title, onSubmit, children, compact = false }) {
  return (
    <form
      onSubmit={onSubmit}
      className={compact ? '' : 'rounded-[1.75rem] border border-black/5 bg-white/85 p-6 shadow-[0_18px_50px_rgba(71,47,24,0.08)]'}
    >
      <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </form>
  )
}
