/**
 * app/layout.js
 * 
 * Layout raiz do Next.js (aplicado a todas as páginas)
 * - Define estrutura HTML, meta tags e título global
 * - Implementa header sticky com branding e botão "Início"
 * - Implementa footer com descrição do sistema
 * - Aplica tema escuro (#04101d) com acentos em ciano
 * - Estrutura: <header> -> <main> -> <footer>
 */

import './globals.css'
import RootLayoutShell from '@/components/root-layout-shell'

export const metadata = {
  title: 'ES Gestão Condominial',
  description: 'Sistema de gestão condominial ES Gestão Condominial',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full antialiased" data-scroll-behavior="smooth">
      <RootLayoutShell>
        {children}
      </RootLayoutShell>
    </html>
  )
}
