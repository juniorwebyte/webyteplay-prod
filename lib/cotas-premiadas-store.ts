// Módulo central de Cotas Premiadas via localStorage.
// Foco: registrar premiações reais com base em números de cotas cadastrados na campanha.

import type { Pedido } from "@/lib/gateway-store"
import { buscarCampanha } from "@/lib/campanhas-store"

export type StatusPremiacao = "pendente" | "pago"

export interface PremiacaoCotaPremiada {
  id: string
  campanhaId: string
  pedidoId: string
  numeroPremiado: number | null
  cpf: string
  telefone: string
  nome: string
  premio: string
  status: StatusPremiacao
  criadoEm: string
}

const PREMIACOES_KEY = "cotas-premiadas-premiacoes"

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

function dispatchEvent(name: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(name))
}

function nowIso() {
  return new Date().toISOString()
}

function dateKey(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function limparCpf(cpf: string) {
  return (cpf || "").replace(/\D/g, "")
}

// ---------- Premiações ----------

export function listarPremiacoes(): PremiacaoCotaPremiada[] {
  const list = getStorage<PremiacaoCotaPremiada[]>(PREMIACOES_KEY, [])
  return Array.isArray(list) ? list : []
}

export function listarPremiacoesPorCampanha(campanhaId: string): PremiacaoCotaPremiada[] {
  return listarPremiacoes().filter((p) => p.campanhaId === campanhaId)
}

export function buscarPremiacoesPorTelefone(telefone: string): PremiacaoCotaPremiada[] {
  const tel = (telefone || "").replace(/\D/g, "")
  return listarPremiacoes().filter((p) => p.telefone.replace(/\D/g, "").includes(tel))
}

export function buscarPremiacoesPorNumero(numero: string): PremiacaoCotaPremiada[] {
  const n = (numero || "").replace(/\D/g, "")
  return listarPremiacoes().filter((p) => String(p.numeroPremiado ?? "").includes(n))
}

export function atualizarStatusPremiacao(id: string, status: StatusPremiacao): PremiacaoCotaPremiada | undefined {
  const list = listarPremiacoes()
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  list[idx] = { ...list[idx], status }
  setStorage(PREMIACOES_KEY, list)
  dispatchEvent("cotas-premiadas-premiacoes-updated")
  return list[idx]
}

export function processarCotasPremiadasParaPedido(pedido: Pedido): PremiacaoCotaPremiada | null {
  if (typeof window === "undefined") return null
  if (!pedido || pedido.status !== "pago") return null

  const campanhaId = pedido.campanhaId
  if (!campanhaId) return null

  const campanha = buscarCampanha(campanhaId)
  if (!campanha) return null
  if (!campanha.cotasPremiadas) return null

  // Mapa: numero -> premio (novo formato: cotasPremiadasLista; fallback: cotasPremiadas1 + cotasPremiadas2)
  const numeroParaPremio = new Map<number, string>()
  const lista = campanha.cotasPremiadasLista
  if (Array.isArray(lista) && lista.length > 0) {
    for (const item of lista) {
      const n = Number(item?.numero)
      // Aceita 0-99 para fazendinha (dezena 00) e 1+ para rifas numéricas
      if (Number.isFinite(n) && n >= 0 && item?.premio) {
        numeroParaPremio.set(n, String(item.premio).trim() || "Cota premiada")
      }
    }
  } else {
    const numerosStr = (campanha.cotasPremiadas1 || "").toString()
    const premioPadrao = (campanha.cotasPremiadas2 || "Cota premiada").trim()
    if (numerosStr.trim()) {
      const nums = numerosStr
        .split(/[^0-9]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n) && n >= 0)
      for (const n of nums) numeroParaPremio.set(n, premioPadrao)
    }
  }

  if (numeroParaPremio.size === 0) return null

  const cpfClean = limparCpf(pedido.cpfComprador)
  if (cpfClean.length !== 11) return null

  const existentes = listarPremiacoes()
  const existentesSet = new Set(
    existentes.filter((p) => p.pedidoId === pedido.id).map((p) => `${p.pedidoId}:${p.numeroPremiado}`),
  )

  const numerosPedido = Array.isArray(pedido.numerosEscolhidos) ? pedido.numerosEscolhidos : []
  if (numerosPedido.length === 0) return null

  let primeira: PremiacaoCotaPremiada | null = null
  const listaAtualizada = [...existentes]

  for (const num of numerosPedido) {
    const premioDescricao = numeroParaPremio.get(num)
    if (!premioDescricao) continue
    const chave = `${pedido.id}:${num}`
    if (existentesSet.has(chave)) continue

    const premiacao: PremiacaoCotaPremiada = {
      id: `PCP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      campanhaId,
      pedidoId: pedido.id,
      numeroPremiado: num,
      cpf: pedido.cpfComprador,
      telefone: pedido.telefoneComprador,
      nome: pedido.nomeComprador,
      premio: premioDescricao,
      status: "pendente",
      criadoEm: nowIso(),
    }

    listaAtualizada.push(premiacao)
    existentesSet.add(chave)
    if (!primeira) primeira = premiacao
  }

  if (!primeira) return null

  setStorage(PREMIACOES_KEY, listaAtualizada)
  dispatchEvent("cotas-premiadas-premiacoes-updated")
  return primeira
}

