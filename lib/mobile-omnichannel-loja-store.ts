// Store para Mobile e Omnichannel da Loja Virtual

export interface ConfigWhatsApp {
  habilitado: boolean
  numero: string
  mensagemPadrao: string
  apiKey?: string
  webhookUrl?: string
}

export interface ConfigInstagram {
  habilitado: boolean
  usuario: string
  token?: string
  feedProdutos: boolean
}

export interface ConfigMarketplace {
  habilitado: boolean
  marketplaces: Array<{ nome: string; ativo: boolean; apiKey?: string; sellerId?: string }>
}

export interface ConfigERP {
  habilitado: boolean
  provedor: string
  url: string
  apiKey?: string
  sincronizarEstoque: boolean
  sincronizarPedidos: boolean
}

export interface ConfigCRM {
  habilitado: boolean
  provedor: string
  url: string
  apiKey?: string
  sincronizarClientes: boolean
}

export interface ConfigAPIPublica {
  habilitada: boolean
  chaveApi?: string
  limiteRequisicoesMinuto: number
  documentacaoUrl?: string
}

export interface ConfigAppMobile {
  habilitado: boolean
  nomeApp: string
  deepLink?: string
  playStoreUrl?: string
  appStoreUrl?: string
}

const WHATSAPP_KEY = "loja-mobile-whatsapp"
const INSTAGRAM_KEY = "loja-mobile-instagram"
const MARKETPLACE_KEY = "loja-mobile-marketplace"
const ERP_KEY = "loja-mobile-erp"
const CRM_KEY = "loja-mobile-crm"
const API_KEY = "loja-mobile-api"
const APP_KEY = "loja-mobile-app"

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
  window.dispatchEvent(new Event("mobile-omnichannel-loja-updated"))
}

const DEFAULT_WHATSAPP: ConfigWhatsApp = { habilitado: false, numero: "", mensagemPadrao: "Olá! Preciso de ajuda." }
const DEFAULT_INSTAGRAM: ConfigInstagram = { habilitado: false, usuario: "", feedProdutos: false }
const DEFAULT_MARKETPLACE: ConfigMarketplace = { habilitado: false, marketplaces: [] }
const DEFAULT_ERP: ConfigERP = { habilitado: false, provedor: "", url: "", sincronizarEstoque: true, sincronizarPedidos: true }
const DEFAULT_CRM: ConfigCRM = { habilitado: false, provedor: "", url: "", sincronizarClientes: true }
const DEFAULT_API: ConfigAPIPublica = { habilitada: false, limiteRequisicoesMinuto: 60 }
const DEFAULT_APP: ConfigAppMobile = { habilitado: false, nomeApp: "Loja", playStoreUrl: "", appStoreUrl: "" }

export function getConfigWhatsApp(): ConfigWhatsApp {
  return { ...DEFAULT_WHATSAPP, ...getStorage<Partial<ConfigWhatsApp>>(WHATSAPP_KEY, {}) }
}
export function salvarConfigWhatsApp(p: Partial<ConfigWhatsApp>): ConfigWhatsApp {
  const cur = getConfigWhatsApp()
  const updated = { ...cur, ...p }
  setStorage(WHATSAPP_KEY, updated)
  return updated
}

export function getConfigInstagram(): ConfigInstagram {
  return { ...DEFAULT_INSTAGRAM, ...getStorage<Partial<ConfigInstagram>>(INSTAGRAM_KEY, {}) }
}
export function salvarConfigInstagram(p: Partial<ConfigInstagram>): ConfigInstagram {
  const cur = getConfigInstagram()
  const updated = { ...cur, ...p }
  setStorage(INSTAGRAM_KEY, updated)
  return updated
}

export function getConfigMarketplace(): ConfigMarketplace {
  return { ...DEFAULT_MARKETPLACE, ...getStorage<Partial<ConfigMarketplace>>(MARKETPLACE_KEY, {}) }
}
export function salvarConfigMarketplace(p: Partial<ConfigMarketplace>): ConfigMarketplace {
  const cur = getConfigMarketplace()
  const updated = { ...cur, ...p }
  setStorage(MARKETPLACE_KEY, updated)
  return updated
}

export function getConfigERP(): ConfigERP {
  return { ...DEFAULT_ERP, ...getStorage<Partial<ConfigERP>>(ERP_KEY, {}) }
}
export function salvarConfigERP(p: Partial<ConfigERP>): ConfigERP {
  const cur = getConfigERP()
  const updated = { ...cur, ...p }
  setStorage(ERP_KEY, updated)
  return updated
}

export function getConfigCRM(): ConfigCRM {
  return { ...DEFAULT_CRM, ...getStorage<Partial<ConfigCRM>>(CRM_KEY, {}) }
}
export function salvarConfigCRM(p: Partial<ConfigCRM>): ConfigCRM {
  const cur = getConfigCRM()
  const updated = { ...cur, ...p }
  setStorage(CRM_KEY, updated)
  return updated
}

export function getConfigAPIPublica(): ConfigAPIPublica {
  return { ...DEFAULT_API, ...getStorage<Partial<ConfigAPIPublica>>(API_KEY, {}) }
}
export function salvarConfigAPIPublica(p: Partial<ConfigAPIPublica>): ConfigAPIPublica {
  const cur = getConfigAPIPublica()
  const updated = { ...cur, ...p }
  setStorage(API_KEY, updated)
  return updated
}

export function getConfigAppMobile(): ConfigAppMobile {
  return { ...DEFAULT_APP, ...getStorage<Partial<ConfigAppMobile>>(APP_KEY, {}) }
}
export function salvarConfigAppMobile(p: Partial<ConfigAppMobile>): ConfigAppMobile {
  const cur = getConfigAppMobile()
  const updated = { ...cur, ...p }
  setStorage(APP_KEY, updated)
  return updated
}
