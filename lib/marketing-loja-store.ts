// Store para Marketing da Loja Virtual

export interface Cupom {
  id: string
  codigo: string
  tipo: "percentual" | "fixo"
  valor: number
  valorMinimo?: number
  maxUso?: number
  usado: number
  ativo: boolean
  validade?: string
  criadoEm: string
}

export interface Promocao {
  id: string
  nome: string
  tipo: "preco" | "percentual" | "compre_x_leve_y"
  valor?: number
  produtoIds?: string[]
  ativo: boolean
  inicio: string
  fim: string
  criadoEm: string
}

export interface Campanha {
  id: string
  nome: string
  canal: "email" | "sms" | "push" | "banner"
  segmento?: string
  ativo: boolean
  inicio?: string
  fim?: string
  criadoEm: string
}

export interface Banner {
  id: string
  titulo: string
  imagem?: string
  link?: string
  posicao: "home_top" | "home_meio" | "sidebar" | "checkout"
  ativo: boolean
  ordem: number
  criadoEm: string
}

export interface Popup {
  id: string
  titulo: string
  conteudo: string
  gatilho: "entrada" | "saida" | "scroll" | "tempo"
  valorGatilho?: number
  ativo: boolean
  inicio?: string
  fim?: string
  criadoEm: string
}

export interface LandingPage {
  id: string
  slug: string
  titulo: string
  conteudo: string
  metaDescricao?: string
  ativo: boolean
  criadoEm: string
}

export interface EmailEnviado {
  id: string
  campanhaId: string
  destinatarios: number
  enviados: number
  aberturas: number
  cliques: number
  enviadoEm: string
}

export interface Segmento {
  id: string
  nome: string
  regras: Array<{ campo: string; operador: string; valor: string }>
  ativo: boolean
  criadoEm: string
}

export interface Afiliado {
  id: string
  nome: string
  email: string
  codigo: string
  comissao: number
  vendas: number
  totalGanho: number
  ativo: boolean
  criadoEm: string
}

export interface ConfigCashback {
  habilitado: boolean
  percentual: number
  minCompra?: number
}

export interface ConfigIndicacao {
  habilitado: boolean
  bonusIndicador: number
  bonusIndicado: number
}

export interface ConfigSEO {
  titulo: string
  descricao: string
  palavrasChave: string
  imagemOg?: string
}

export interface PostBlog {
  id: string
  titulo: string
  slug: string
  conteudo: string
  resumo?: string
  imagem?: string
  publicado: boolean
  publicadoEm?: string
  criadoEm: string
}

const CUPONS_KEY = "loja-marketing-cupons"
const PROMOCOES_KEY = "loja-marketing-promocoes"
const CAMPANHAS_KEY = "loja-marketing-campanhas"
const BANNERS_KEY = "loja-marketing-banners"
const POPUPS_KEY = "loja-marketing-popups"
const LANDINGS_KEY = "loja-marketing-landings"
const EMAILS_KEY = "loja-marketing-emails"
const SEGMENTOS_KEY = "loja-marketing-segmentos"
const AFILIADOS_KEY = "loja-marketing-afiliados"
const CASHBACK_KEY = "loja-marketing-cashback"
const INDICACAO_KEY = "loja-marketing-indicacao"
const SEO_KEY = "loja-marketing-seo"
const BLOG_KEY = "loja-marketing-blog"

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
  window.dispatchEvent(new Event("marketing-loja-updated"))
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
}

// ==================== CUPONS ====================
export function listarCupons(): Cupom[] {
  return getStorage<Cupom[]>(CUPONS_KEY, [])
}

/** Valida cupom e retorna o valor do desconto. Retorna null se inválido. */
export function validarCupom(codigo: string, valorMinimoCarrinho: number): { cupom: Cupom; desconto: number } | null {
  const list = listarCupons()
  const cupom = list.find(
    (c) => c.ativo && c.codigo.toUpperCase().trim() === codigo.toUpperCase().trim()
  )
  if (!cupom) return null
  if (cupom.validade && new Date(cupom.validade) < new Date()) return null
  if (cupom.valorMinimo != null && valorMinimoCarrinho < cupom.valorMinimo) return null
  if (cupom.maxUso != null && cupom.usado >= cupom.maxUso) return null

  const desconto =
    cupom.tipo === "percentual"
      ? (valorMinimoCarrinho * cupom.valor) / 100
      : Math.min(cupom.valor, valorMinimoCarrinho)
  return { cupom, desconto }
}

export function salvarCupom(c: Omit<Cupom, "id" | "usado" | "criadoEm"> | Cupom): Cupom {
  const list = listarCupons()
  if ("id" in c && c.id) {
    const idx = list.findIndex((x) => x.id === c.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...c }
      setStorage(CUPONS_KEY, list)
      return list[idx]
    }
  }
  const novo: Cupom = {
    ...(c as Omit<Cupom, "id" | "usado" | "criadoEm">),
    id: uid("CUP"),
    usado: 0,
    criadoEm: new Date().toISOString(),
  }
  list.push(novo)
  setStorage(CUPONS_KEY, list)
  return novo
}

// ==================== PROMOÇÕES ====================
export function listarPromocoes(): Promocao[] {
  return getStorage<Promocao[]>(PROMOCOES_KEY, [])
}

export function salvarPromocao(p: Omit<Promocao, "id" | "criadoEm"> | Promocao): Promocao {
  const list = listarPromocoes()
  if ("id" in p && p.id) {
    const idx = list.findIndex((x) => x.id === p.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...p }
      setStorage(PROMOCOES_KEY, list)
      return list[idx]
    }
  }
  const novo: Promocao = { ...(p as Omit<Promocao, "id" | "criadoEm">), id: uid("PRM"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(PROMOCOES_KEY, list)
  return novo
}

// ==================== CAMPANHAS ====================
export function listarCampanhas(): Campanha[] {
  return getStorage<Campanha[]>(CAMPANHAS_KEY, [])
}

export function salvarCampanha(c: Omit<Campanha, "id" | "criadoEm"> | Campanha): Campanha {
  const list = listarCampanhas()
  if ("id" in c && c.id) {
    const idx = list.findIndex((x) => x.id === c.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...c }
      setStorage(CAMPANHAS_KEY, list)
      return list[idx]
    }
  }
  const novo: Campanha = { ...(c as Omit<Campanha, "id" | "criadoEm">), id: uid("CMP"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(CAMPANHAS_KEY, list)
  return novo
}

// ==================== BANNERS ====================
export function listarBanners(): Banner[] {
  return getStorage<Banner[]>(BANNERS_KEY, []).sort((a, b) => a.ordem - b.ordem)
}

export function salvarBanner(b: Omit<Banner, "id" | "criadoEm"> | Banner): Banner {
  const list = listarBanners()
  if ("id" in b && b.id) {
    const idx = list.findIndex((x) => x.id === b.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...b }
      setStorage(BANNERS_KEY, list)
      return list[idx]
    }
  }
  const novo: Banner = { ...(b as Omit<Banner, "id" | "criadoEm">), id: uid("BNR"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(BANNERS_KEY, list)
  return novo
}

// ==================== POPUPS ====================
export function listarPopups(): Popup[] {
  return getStorage<Popup[]>(POPUPS_KEY, [])
}

export function salvarPopup(p: Omit<Popup, "id" | "criadoEm"> | Popup): Popup {
  const list = listarPopups()
  if ("id" in p && p.id) {
    const idx = list.findIndex((x) => x.id === p.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...p }
      setStorage(POPUPS_KEY, list)
      return list[idx]
    }
  }
  const novo: Popup = { ...(p as Omit<Popup, "id" | "criadoEm">), id: uid("POP"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(POPUPS_KEY, list)
  return novo
}

// ==================== LANDING PAGES ====================
export function listarLandings(): LandingPage[] {
  return getStorage<LandingPage[]>(LANDINGS_KEY, [])
}

export function salvarLanding(l: Omit<LandingPage, "id" | "criadoEm"> | LandingPage): LandingPage {
  const list = listarLandings()
  if ("id" in l && l.id) {
    const idx = list.findIndex((x) => x.id === l.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...l }
      setStorage(LANDINGS_KEY, list)
      return list[idx]
    }
  }
  const novo: LandingPage = { ...(l as Omit<LandingPage, "id" | "criadoEm">), id: uid("LND"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(LANDINGS_KEY, list)
  return novo
}

// ==================== E-MAIL (histórico) ====================
export function listarEmailsEnviados(): EmailEnviado[] {
  return getStorage<EmailEnviado[]>(EMAILS_KEY, [])
}

// ==================== SEGMENTOS ====================
export function listarSegmentos(): Segmento[] {
  return getStorage<Segmento[]>(SEGMENTOS_KEY, [])
}

export function salvarSegmento(s: Omit<Segmento, "id" | "criadoEm"> | Segmento): Segmento {
  const list = listarSegmentos()
  if ("id" in s && s.id) {
    const idx = list.findIndex((x) => x.id === s.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...s }
      setStorage(SEGMENTOS_KEY, list)
      return list[idx]
    }
  }
  const novo: Segmento = { ...(s as Omit<Segmento, "id" | "criadoEm">), id: uid("SEG"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(SEGMENTOS_KEY, list)
  return novo
}

// ==================== AFILIADOS ====================
export function listarAfiliados(): Afiliado[] {
  return getStorage<Afiliado[]>(AFILIADOS_KEY, [])
}

export function salvarAfiliado(a: Omit<Afiliado, "id" | "vendas" | "totalGanho" | "criadoEm"> | Afiliado): Afiliado {
  const list = listarAfiliados()
  if ("id" in a && a.id) {
    const idx = list.findIndex((x) => x.id === a.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...a }
      setStorage(AFILIADOS_KEY, list)
      return list[idx]
    }
  }
  const novo: Afiliado = {
    ...(a as Omit<Afiliado, "id" | "vendas" | "totalGanho" | "criadoEm">),
    id: uid("AFL"),
    vendas: 0,
    totalGanho: 0,
    criadoEm: new Date().toISOString(),
  }
  list.push(novo)
  setStorage(AFILIADOS_KEY, list)
  return novo
}

// ==================== CASHBACK ====================
const DEFAULT_CASHBACK: ConfigCashback = { habilitado: false, percentual: 5, minCompra: 50 }

export function getConfigCashback(): ConfigCashback {
  return { ...DEFAULT_CASHBACK, ...getStorage<Partial<ConfigCashback>>(CASHBACK_KEY, {}) }
}

export function salvarConfigCashback(p: Partial<ConfigCashback>): ConfigCashback {
  const cur = getConfigCashback()
  const updated = { ...cur, ...p }
  setStorage(CASHBACK_KEY, updated)
  return updated
}

// ==================== INDICAÇÃO ====================
const DEFAULT_INDICACAO: ConfigIndicacao = { habilitado: false, bonusIndicador: 10, bonusIndicado: 10 }

export function getConfigIndicacao(): ConfigIndicacao {
  return { ...DEFAULT_INDICACAO, ...getStorage<Partial<ConfigIndicacao>>(INDICACAO_KEY, {}) }
}

export function salvarConfigIndicacao(p: Partial<ConfigIndicacao>): ConfigIndicacao {
  const cur = getConfigIndicacao()
  const updated = { ...cur, ...p }
  setStorage(INDICACAO_KEY, updated)
  return updated
}

// ==================== SEO ====================
const DEFAULT_SEO: ConfigSEO = { titulo: "WebytePlay", descricao: "Loja virtual", palavrasChave: "" }

export function getConfigSEO(): ConfigSEO {
  return { ...DEFAULT_SEO, ...getStorage<Partial<ConfigSEO>>(SEO_KEY, {}) }
}

export function salvarConfigSEO(p: Partial<ConfigSEO>): ConfigSEO {
  const cur = getConfigSEO()
  const updated = { ...cur, ...p }
  setStorage(SEO_KEY, updated)
  return updated
}

// ==================== BLOG ====================
export function listarPostsBlog(): PostBlog[] {
  return getStorage<PostBlog[]>(BLOG_KEY, [])
}

export function salvarPostBlog(p: Omit<PostBlog, "id" | "criadoEm"> | PostBlog): PostBlog {
  const list = listarPostsBlog()
  if ("id" in p && p.id) {
    const idx = list.findIndex((x) => x.id === p.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...p }
      setStorage(BLOG_KEY, list)
      return list[idx]
    }
  }
  const novo: PostBlog = { ...(p as Omit<PostBlog, "id" | "criadoEm">), id: uid("BLG"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(BLOG_KEY, list)
  return novo
}
