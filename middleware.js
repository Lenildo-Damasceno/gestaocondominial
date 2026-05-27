import { NextResponse } from 'next/server'

export function middleware(request) {
  // Se acessar /login, redireciona para /
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/login'],
}
