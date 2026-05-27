'use client'

import { useEffect } from 'react'

export default function DocumentosPage() {
  useEffect(() => {
    window.location.href = '/condominios'
  }, [])

  return null
}
