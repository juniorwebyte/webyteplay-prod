// Configurações e dados do WebytePay - Gateway profissional
// Persistência em localStorage

import { verificarCredenciaisAdmin } from "./auth-admin"

export interface WebytePayConfig {
  /** Modo sandbox (testes) ou produção */
  modo: "sandbox" | "producao"
  /** Nome da empresa */
  nomeEmpresa: string
  /** CNPJ */
  cnpj: string
  /** URL do webhook para notificações de pagamento */
  webhookUrl: string
  /** Chave de autenticação do webhook */
  webhookSecret: string
}

export interface WebytePayApiKey {
  id: string
  prefixo: string
  nome: string
  criadaEm: string
  ultimoUso?: string
  ativa: boolean
}

const CONFIG_KEY = "webytepay-config"
const API_KEYS_KEY = "webytepay-api-keys"

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
  window.dispatchEvent(new Event("webytepay-updated"))
}

const DEFAULT_CONFIG: WebytePayConfig = {
  modo: "sandbox",
  nomeEmpresa: "WebytePay Tecnologia em Pagamentos S.A.",
  cnpj: "",
  webhookUrl: "",
  webhookSecret: "",
}

export function getWebytePayConfig(): WebytePayConfig {
  return { ...DEFAULT_CONFIG, ...getStorage<Partial<WebytePayConfig>>(CONFIG_KEY, {}) }
}

export async function salvarWebytePayConfig(partial: Partial<WebytePayConfig>): Promise<WebytePayConfig> {
  const current = getWebytePayConfig()
  const updated = { ...current, ...partial }
  setStorage(CONFIG_KEY, updated)
  return updated
}

export function listarApiKeys(): WebytePayApiKey[] {
  return getStorage<WebytePayApiKey[]>(API_KEYS_KEY, [])
}

export function gerarApiKey(nome: string): { key: string; apiKey: WebytePayApiKey } {
  const keys = listarApiKeys()
  const prefixo = "wp_" + (getWebytePayConfig().modo === "sandbox" ? "test_" : "live_")
  const sufixo = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
  const keyPlain = `${prefixo}${sufixo}`
  const apiKey: WebytePayApiKey = {
    id: `key_${Date.now()}`,
    prefixo: prefixo + sufixo.substring(0, 8) + "...",
    nome: nome || "Chave API",
    criadaEm: new Date().toISOString(),
    ativa: true,
  }
  keys.push(apiKey)
  setStorage(API_KEYS_KEY, keys)
  return { key: keyPlain, apiKey }
}

export function revogarApiKey(id: string): boolean {
  const keys = listarApiKeys()
  const idx = keys.findIndex((k) => k.id === id)
  if (idx === -1) return false
  keys[idx] = { ...keys[idx], ativa: false }
  setStorage(API_KEYS_KEY, keys)
  return true
}
