'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  {
    href: '/dashboard',
    label: 'Início',
    icon: <path d="M1 22V9l11-7 11 7v13H15v-7h-6v7H1z" />,
  },
  {
    href: '/condominios',
    label: 'Condomínios',
    icon: <path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zm-8 4H7v-2h2v2zm0-4H7V9h2v2zm0-4H7V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2z" />,
  },
  {
    href: '/configuracoes',
    label: 'Config.',
    icon: <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.01 7.01 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.47.47 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />,
  },
]

export default function MobileFooterNav() {
  const pathname = usePathname()

  return (
    <footer className="fixed inset-x-0 bottom-0 z-[9999] flex items-center justify-around border-t border-white/10 bg-[#04101d]/95 px-2 py-1 backdrop-blur sm:hidden">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition active:scale-95 ${
              isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                isActive
                  ? 'bg-gradient-to-br from-[#0f52ff] to-[#22d3ee] shadow-[0_8px_18px_rgba(15,82,255,0.35)]'
                  : 'bg-[#12365d]'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                {item.icon}
              </svg>
            </div>
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        )
      })}
    </footer>
  )
}