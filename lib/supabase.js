import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getSupabaseConfigError() {
  if (!supabaseUrl || !supabaseKey) {
    return 'Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local.'
  }

  if (!/^https?:\/\//.test(supabaseUrl)) {
    return 'NEXT_PUBLIC_SUPABASE_URL precisa ser uma URL do projeto Supabase, por exemplo https://seu-projeto.supabase.co.'
  }

  return ''
}

export const supabaseConfigError = getSupabaseConfigError()

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
