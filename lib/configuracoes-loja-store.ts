// Store para Configurações Gerais da Loja Virtual

export interface ConfigLoja {
  nome: string
  slogan?: string
  modoManutencao: boolean
  itensPorPagina: number
}

export interface InfoEmpresa {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  inscricaoEstadual?: string
  endereco: string
  bairro?: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  email: string
}

export interface ConfigDominio {
  dominioPrincipal: string
  dominioAlternativo?: string
  sslHabilitado: boolean
}

export interface ConfigAparencia {
  tema: "claro" | "escuro" | "sistema"
  corPrimaria: string
  corSecundaria: string
  logoUrl?: string
  faviconUrl?: string
}

export interface ConfigLayout {
  headerFixo: boolean
  sidebarEsquerda: boolean
  rodapeComLinks: boolean
  exibirBreadcrumb: boolean
}

export interface ConfigCoresBranding {
  corPrimaria: string
  corSecundaria: string
  corDestaque: string
  corFundo: string
  corTexto: string
}

export interface ConfigEmail {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  remetenteNome: string
  remetenteEmail: string
  usaTls: boolean
}

export interface TemplateEmail {
  id: string
  codigo: string
  nome: string
  assunto: string
  corpoHtml: string
  variaveis: string[]
  ativo: boolean
  criadoEm: string
}

export interface ConfigMoeda {
  codigo: string
  simbolo: string
  casasDecimais: number
  separadorMilhar: string
  separadorDecimal: string
  posicaoSymbol: "antes" | "depois"
}

export interface ConfigImpostos {
  icmsPadrao: number
  pisPadrao: number
  cofinsPadrao: number
  incidencia: "incluso" | "excluso"
}

export interface ConfigRegiaoIdioma {
  pais: string
  idioma: string
  fusoHorario: string
  formatoData: string
  formatoHora: string
}

export interface ConfigIntegracao {
  id: string
  nome: string
  tipo: "api" | "webhook" | "outro"
  url?: string
  apiKey?: string
  ativo: boolean
  criadoEm: string
}

export interface ConfigWebhook {
  id: string
  evento: string
  url: string
  secret?: string
  ativo: boolean
  criadoEm: string
}

export interface ConfigNotificacoes {
  emailPedidoNovo: boolean
  emailPedidoPago: boolean
  emailCarrinhoAbandonado: boolean
  pushHabilitado: boolean
  adminRecebeAlertas: boolean
  emailAdminAlertas?: string
}

const LOJA_KEY = "loja-config-loja"
const EMPRESA_KEY = "loja-config-empresa"
const DOMINIO_KEY = "loja-config-dominio"
const APARENCIA_KEY = "loja-config-aparencia"
const LAYOUT_KEY = "loja-config-layout"
const CORES_KEY = "loja-config-cores"
const EMAIL_KEY = "loja-config-email"
const TEMPLATES_EMAIL_KEY = "loja-config-templates-email"
const MOEDA_KEY = "loja-config-moeda"
const IMPOSTOS_KEY = "loja-config-impostos"
const REGIAO_KEY = "loja-config-regiao"
const INTEGRACOES_KEY = "loja-config-integracoes"
const WEBHOOKS_KEY = "loja-config-webhooks"
const NOTIFICACOES_KEY = "loja-config-notificacoes"
const PRIVACIDADE_KEY = "loja-config-privacidade"
const TERMOS_KEY = "loja-config-termos"

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
  window.dispatchEvent(new Event("configuracoes-loja-updated"))
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
}

// ==================== CONFIG LOJA ====================
const DEFAULT_LOJA: ConfigLoja = { nome: "WebytePlay Loja", slogan: "", modoManutencao: false, itensPorPagina: 12 }

export function getConfigLoja(): ConfigLoja {
  return { ...DEFAULT_LOJA, ...getStorage<Partial<ConfigLoja>>(LOJA_KEY, {}) }
}

export function salvarConfigLoja(p: Partial<ConfigLoja>): ConfigLoja {
  const cur = getConfigLoja()
  const updated = { ...cur, ...p }
  setStorage(LOJA_KEY, updated)
  return updated
}

// ==================== EMPRESA ====================
const DEFAULT_EMPRESA: InfoEmpresa = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  endereco: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  telefone: "",
  email: "",
}

export function getInfoEmpresa(): InfoEmpresa {
  return { ...DEFAULT_EMPRESA, ...getStorage<Partial<InfoEmpresa>>(EMPRESA_KEY, {}) }
}

export function salvarInfoEmpresa(p: Partial<InfoEmpresa>): InfoEmpresa {
  const cur = getInfoEmpresa()
  const updated = { ...cur, ...p }
  setStorage(EMPRESA_KEY, updated)
  return updated
}

// ==================== DOMÍNIO ====================
const DEFAULT_DOMINIO: ConfigDominio = { dominioPrincipal: "", sslHabilitado: true }

export function getConfigDominio(): ConfigDominio {
  return { ...DEFAULT_DOMINIO, ...getStorage<Partial<ConfigDominio>>(DOMINIO_KEY, {}) }
}

export function salvarConfigDominio(p: Partial<ConfigDominio>): ConfigDominio {
  const cur = getConfigDominio()
  const updated = { ...cur, ...p }
  setStorage(DOMINIO_KEY, updated)
  return updated
}

// ==================== APARÊNCIA ====================
const DEFAULT_APARENCIA: ConfigAparencia = { tema: "escuro", corPrimaria: "#FFB800", corSecundaria: "#1a1a2e", logoUrl: "", faviconUrl: "" }

export function getConfigAparencia(): ConfigAparencia {
  return { ...DEFAULT_APARENCIA, ...getStorage<Partial<ConfigAparencia>>(APARENCIA_KEY, {}) }
}

export function salvarConfigAparencia(p: Partial<ConfigAparencia>): ConfigAparencia {
  const cur = getConfigAparencia()
  const updated = { ...cur, ...p }
  setStorage(APARENCIA_KEY, updated)
  return updated
}

// ==================== LAYOUT ====================
const DEFAULT_LAYOUT: ConfigLayout = { headerFixo: true, sidebarEsquerda: true, rodapeComLinks: true, exibirBreadcrumb: true }

export function getConfigLayout(): ConfigLayout {
  return { ...DEFAULT_LAYOUT, ...getStorage<Partial<ConfigLayout>>(LAYOUT_KEY, {}) }
}

export function salvarConfigLayout(p: Partial<ConfigLayout>): ConfigLayout {
  const cur = getConfigLayout()
  const updated = { ...cur, ...p }
  setStorage(LAYOUT_KEY, updated)
  return updated
}

// ==================== CORES / BRANDING ====================
const DEFAULT_CORES: ConfigCoresBranding = { corPrimaria: "#FFB800", corSecundaria: "#1a1a2e", corDestaque: "#FFB800", corFundo: "#0f1117", corTexto: "#ffffff" }

export function getConfigCoresBranding(): ConfigCoresBranding {
  return { ...DEFAULT_CORES, ...getStorage<Partial<ConfigCoresBranding>>(CORES_KEY, {}) }
}

export function salvarConfigCoresBranding(p: Partial<ConfigCoresBranding>): ConfigCoresBranding {
  const cur = getConfigCoresBranding()
  const updated = { ...cur, ...p }
  setStorage(CORES_KEY, updated)
  return updated
}

// ==================== E-MAIL ====================
const DEFAULT_EMAIL: ConfigEmail = { smtpHost: "", smtpPort: 587, smtpUser: "", smtpPass: "", remetenteNome: "Loja", remetenteEmail: "", usaTls: true }

export function getConfigEmail(): ConfigEmail {
  return { ...DEFAULT_EMAIL, ...getStorage<Partial<ConfigEmail>>(EMAIL_KEY, {}) }
}

export function salvarConfigEmail(p: Partial<ConfigEmail>): ConfigEmail {
  const cur = getConfigEmail()
  const updated = { ...cur, ...p }
  setStorage(EMAIL_KEY, updated)
  return updated
}

// ==================== TEMPLATES E-MAIL ====================
export function listarTemplatesEmail(): TemplateEmail[] {
  return getStorage<TemplateEmail[]>(TEMPLATES_EMAIL_KEY, [])
}

export function salvarTemplateEmail(t: Omit<TemplateEmail, "id" | "criadoEm"> | TemplateEmail): TemplateEmail {
  const list = listarTemplatesEmail()
  if ("id" in t && t.id) {
    const idx = list.findIndex((x) => x.id === t.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...t }
      setStorage(TEMPLATES_EMAIL_KEY, list)
      return list[idx]
    }
  }
  const novo: TemplateEmail = { ...(t as Omit<TemplateEmail, "id" | "criadoEm">), id: uid("TPL"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(TEMPLATES_EMAIL_KEY, list)
  return novo
}

// ==================== MOEDA ====================
const DEFAULT_MOEDA: ConfigMoeda = { codigo: "BRL", simbolo: "R$", casasDecimais: 2, separadorMilhar: ".", separadorDecimal: ",", posicaoSymbol: "antes" }

export function getConfigMoeda(): ConfigMoeda {
  return { ...DEFAULT_MOEDA, ...getStorage<Partial<ConfigMoeda>>(MOEDA_KEY, {}) }
}

export function salvarConfigMoeda(p: Partial<ConfigMoeda>): ConfigMoeda {
  const cur = getConfigMoeda()
  const updated = { ...cur, ...p }
  setStorage(MOEDA_KEY, updated)
  return updated
}

// ==================== IMPOSTOS ====================
const DEFAULT_IMPOSTOS: ConfigImpostos = { icmsPadrao: 18, pisPadrao: 1.65, cofinsPadrao: 7.6, incidencia: "incluso" }

export function getConfigImpostos(): ConfigImpostos {
  return { ...DEFAULT_IMPOSTOS, ...getStorage<Partial<ConfigImpostos>>(IMPOSTOS_KEY, {}) }
}

export function salvarConfigImpostos(p: Partial<ConfigImpostos>): ConfigImpostos {
  const cur = getConfigImpostos()
  const updated = { ...cur, ...p }
  setStorage(IMPOSTOS_KEY, updated)
  return updated
}

// ==================== REGIÃO / IDIOMA ====================
const DEFAULT_REGIAO: ConfigRegiaoIdioma = { pais: "BR", idioma: "pt-BR", fusoHorario: "America/Sao_Paulo", formatoData: "dd/MM/yyyy", formatoHora: "HH:mm" }

export function getConfigRegiaoIdioma(): ConfigRegiaoIdioma {
  return { ...DEFAULT_REGIAO, ...getStorage<Partial<ConfigRegiaoIdioma>>(REGIAO_KEY, {}) }
}

export function salvarConfigRegiaoIdioma(p: Partial<ConfigRegiaoIdioma>): ConfigRegiaoIdioma {
  const cur = getConfigRegiaoIdioma()
  const updated = { ...cur, ...p }
  setStorage(REGIAO_KEY, updated)
  return updated
}

// ==================== INTEGRAÇÕES ====================
export function listarIntegracoes(): ConfigIntegracao[] {
  return getStorage<ConfigIntegracao[]>(INTEGRACOES_KEY, [])
}

export function salvarIntegracao(i: Omit<ConfigIntegracao, "id" | "criadoEm"> | ConfigIntegracao): ConfigIntegracao {
  const list = listarIntegracoes()
  if ("id" in i && i.id) {
    const idx = list.findIndex((x) => x.id === i.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...i }
      setStorage(INTEGRACOES_KEY, list)
      return list[idx]
    }
  }
  const novo: ConfigIntegracao = { ...(i as Omit<ConfigIntegracao, "id" | "criadoEm">), id: uid("INT"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(INTEGRACOES_KEY, list)
  return novo
}

// ==================== WEBHOOKS ====================
export function listarWebhooks(): ConfigWebhook[] {
  return getStorage<ConfigWebhook[]>(WEBHOOKS_KEY, [])
}

export function salvarWebhook(w: Omit<ConfigWebhook, "id" | "criadoEm"> | ConfigWebhook): ConfigWebhook {
  const list = listarWebhooks()
  if ("id" in w && w.id) {
    const idx = list.findIndex((x) => x.id === w.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...w }
      setStorage(WEBHOOKS_KEY, list)
      return list[idx]
    }
  }
  const novo: ConfigWebhook = { ...(w as Omit<ConfigWebhook, "id" | "criadoEm">), id: uid("WH"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(WEBHOOKS_KEY, list)
  return novo
}

// ==================== NOTIFICAÇÕES ====================
const DEFAULT_NOTIF: ConfigNotificacoes = {
  emailPedidoNovo: true, emailPedidoPago: true, emailCarrinhoAbandonado: false, pushHabilitado: false, adminRecebeAlertas: true, emailAdminAlertas: "",
}

export function getConfigNotificacoes(): ConfigNotificacoes {
  return { ...DEFAULT_NOTIF, ...getStorage<Partial<ConfigNotificacoes>>(NOTIFICACOES_KEY, {}) }
}

export function salvarConfigNotificacoes(p: Partial<ConfigNotificacoes>): ConfigNotificacoes {
  const cur = getConfigNotificacoes()
  const updated = { ...cur, ...p }
  setStorage(NOTIFICACOES_KEY, updated)
  return updated
}

// ==================== PRIVACIDADE / TERMOS ====================
export function getTextoPrivacidade(): string {
  return getStorage<string>(PRIVACIDADE_KEY, "Política de privacidade. Configure o conteúdo aqui.")
}

export function salvarTextoPrivacidade(texto: string): void {
  setStorage(PRIVACIDADE_KEY, texto)
}

export function getTextoTermos(): string {
  return getStorage<string>(TERMOS_KEY, "Termos de uso. Configure o conteúdo aqui.")
}

export function salvarTextoTermos(texto: string): void {
  setStorage(TERMOS_KEY, texto)
}
