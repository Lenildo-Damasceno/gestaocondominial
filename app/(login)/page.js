'use client'

import { useEffect, useState } from 'react'
import { signIn, sendPasswordReset, useSession } from '@/lib/useAuth'

const RATE_LIMIT_SEGUNDOS = 30
const MAX_TENTATIVAS = 3

export default function Login() {
  const { user, carregando: verificandoSessao, configError } = useSession()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState(configError || '')
  const [carregando, setCarregando] = useState(false)
  const [tentativas, setTentativas] = useState(0)
  const [bloqueadoAte, setBloqueadoAte] = useState(null)
  const [tempoRestante, setTempoRestante] = useState(0)
  const [modoReset, setModoReset] = useState(false)
  const [resetEnviado, setResetEnviado] = useState(false)

  useEffect(() => {
    if (!verificandoSessao && user) window.location.href = '/dashboard'
  }, [user, verificandoSessao])

  useEffect(() => {
    if (!bloqueadoAte) return
    const intervalo = setInterval(() => {
      const restante = Math.ceil((bloqueadoAte - Date.now()) / 1000)
      if (restante <= 0) {
        setBloqueadoAte(null)
        setTempoRestante(0)
        setTentativas(0)
      } else {
        setTempoRestante(restante)
      }
    }, 1000)
    return () => clearInterval(intervalo)
  }, [bloqueadoAte])

  async function entrar(e) {
    e.preventDefault()
    if (bloqueadoAte && Date.now() < bloqueadoAte) return
    setCarregando(true)
    setErro('')
    const { error } = await signIn(email, senha)
    if (error) {
      const novasTentativas = tentativas + 1
      setTentativas(novasTentativas)
      if (novasTentativas >= MAX_TENTATIVAS) {
        setBloqueadoAte(Date.now() + RATE_LIMIT_SEGUNDOS * 1000)
        setErro(`Muitas tentativas. Aguarde ${RATE_LIMIT_SEGUNDOS} segundos.`)
      } else {
        setErro(`${error} (${novasTentativas}/${MAX_TENTATIVAS} tentativas)`)
      }
      setCarregando(false)
      return
    }
    window.location.href = '/dashboard'
  }

  async function enviarReset(e) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    const { error } = await sendPasswordReset(email)
    setCarregando(false)
    if (error) return setErro(error)
    setResetEnviado(true)
  }

  const bloqueado = bloqueadoAte && Date.now() < bloqueadoAte

  if (verificandoSessao) return null

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#04101d]">

      {/* Orbs de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#0f52ff]/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#22d3ee]/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0f52ff]/10 blur-[100px]" />
      </div>

      {/* Grid sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">

          {/* Logo / Marca */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f52ff] to-[#22d3ee] shadow-[0_8px_32px_rgba(15,82,255,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 22V9l11-7 11 7v13H15v-7h-6v7H1z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">ES Gestão Condominial</h1>
            <p className="mt-1 text-sm text-white/40">
              {modoReset ? 'Redefinição de senha' : 'Painel administrativo'}
            </p>
          </div>

          {resetEnviado ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-emerald-300">E-mail enviado com sucesso!</p>
              <p className="mt-1 text-xs text-white/40">Verifique sua caixa de entrada.</p>
              <button
                onClick={() => { setModoReset(false); setResetEnviado(false) }}
                className="mt-4 text-sm text-[#22d3ee] hover:underline"
              >
                Voltar ao login
              </button>
            </div>
          ) : (
            <form onSubmit={modoReset ? enviarReset : entrar} className="flex flex-col gap-4">

              {/* Campo e-mail */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-white/40">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErro('') }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#0f52ff]/60 focus:ring-2 focus:ring-[#0f52ff]/20"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {/* Campo senha */}
              {!modoReset && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-white/40">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => { setSenha(e.target.value); setErro('') }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-white/20 outline-none transition focus:border-[#0f52ff]/60 focus:ring-2 focus:ring-[#0f52ff]/20"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/70"
                    >
                      {mostrarSenha ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => { setModoReset(true); setErro('') }}
                      className="text-xs text-white/40 transition hover:text-[#22d3ee]"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                </div>
              )}

              {/* Erros */}
              {erro && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p className="text-xs text-red-300">{erro}</p>
                </div>
              )}

              {bloqueado && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  <p className="text-xs text-amber-300">Aguarde {tempoRestante}s para tentar novamente.</p>
                </div>
              )}

              {/* Botão */}
              <button
                type="submit"
                disabled={carregando || Boolean(configError) || bloqueado}
                className="mt-1 w-full rounded-xl bg-gradient-to-r from-[#0f52ff] to-[#0ea5e9] py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,82,255,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {carregando ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Aguarde...
                  </span>
                ) : modoReset ? 'Enviar e-mail de redefinição' : 'Entrar no sistema'}
              </button>

              {modoReset && (
                <button
                  type="button"
                  onClick={() => { setModoReset(false); setErro('') }}
                  className="text-center text-xs text-white/30 transition hover:text-white/60"
                >
                  ← Voltar ao login
                </button>
              )}
            </form>
          )}

          {/* Rodapé do card */}
          <p className="mt-8 text-center text-[11px] text-white/20">
            © {new Date().getFullYear()} ES Gestão Condominial
          </p>
        </div>
      </div>
    </div>
  )
}
