"use client"

import { useState, useEffect } from "react"
import { getConfigLoja, type ConfigLoja } from "@/lib/loja-store"

export function useConfiguracoesLoja() {
  const [configLoja, setConfigLoja] = useState<ConfigLoja | null>(
    () => (typeof window !== "undefined" ? getConfigLoja() : null)
  )

  useEffect(() => {
    const load = () => setConfigLoja(getConfigLoja())
    window.addEventListener("loja-updated", load)
    return () => window.removeEventListener("loja-updated", load)
  }, [])

  return { configLoja }
}
