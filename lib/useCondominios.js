'use client'

import { useEffect, useState } from 'react'
import { escutarMudancasCondominios, listarCondominios } from '@/lib/condominios'

export function useCondominios() {
  const [condominios, setCondominios] = useState(() => listarCondominios())

  useEffect(() => {
    return escutarMudancasCondominios(() => {
      setCondominios(listarCondominios())
    })
  }, [])

  return condominios
}
