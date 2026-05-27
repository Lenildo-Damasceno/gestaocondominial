'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase = null
let supabaseConfigError = null

if (!supabaseUrl || !supabaseKey) {
  supabaseConfigError = 'Variáveis de ambiente Supabase não configuradas.'
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey)
  } catch (error) {
    supabaseConfigError = `Erro ao inicializar Supabase: ${error.message}`
  }
}

export { supabase, supabaseConfigError }
