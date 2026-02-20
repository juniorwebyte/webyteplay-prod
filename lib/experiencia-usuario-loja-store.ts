// Store para Experiência do Usuário da Loja Virtual

export interface AvaliacaoReview {
  id: string
  produtoId: string
  clienteId: string
  clienteNome: string
  nota: number
  titulo?: string
  texto: string
  aprovado: boolean
  respondido: boolean
  resposta?: string
  respostaEm?: string
  criadoEm: string
}

export interface PerguntaResposta {
  id: string
  produtoId: string
  clienteId?: string
  clienteNome: string
  pergunta: string
  resposta?: string
  respondidoEm?: string
  aprovado: boolean
  criadoEm: string
}

export interface ConfigChat {
  habilitado: boolean
  tipo: "widget" | "flutuante" | "integrado"
  horarioFuncionamento?: string
  mensagemOffline?: string
  widgetScript?: string
}

export interface ArtigoAjuda {
  id: string
  titulo: string
  slug: string
  conteudo: string
  categoria: string
  ordem: number
  ativo: boolean
  criadoEm: string
}

export interface CategoriaAjuda {
  id: string
  nome: string
  descricao?: string
  ordem: number
  ativo: boolean
  criadoEm: string
}

const REVIEWS_KEY = "loja-ux-reviews"
const PERGUNTAS_KEY = "loja-ux-perguntas"
const CHAT_KEY = "loja-ux-chat"
const ARTIGOS_AJUDA_KEY = "loja-ux-artigos"
const CATEGORIAS_AJUDA_KEY = "loja-ux-categorias"

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
  window.dispatchEvent(new Event("experiencia-usuario-loja-updated"))
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
}

// ==================== AVALIAÇÕES E REVIEWS ====================
export function listarAvaliacoes(filtros?: { produtoId?: string; aprovado?: boolean }): AvaliacaoReview[] {
  let list = getStorage<AvaliacaoReview[]>(REVIEWS_KEY, [])
  if (filtros?.produtoId) list = list.filter((r) => r.produtoId === filtros.produtoId)
  if (filtros?.aprovado !== undefined) list = list.filter((r) => r.aprovado === filtros.aprovado)
  return list.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}

export function salvarAvaliacao(a: Omit<AvaliacaoReview, "id" | "criadoEm"> | AvaliacaoReview): AvaliacaoReview {
  const list = listarAvaliacoes()
  if ("id" in a && a.id) {
    const idx = list.findIndex((x) => x.id === a.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...a }
      setStorage(REVIEWS_KEY, list)
      return list[idx]
    }
  }
  const novo: AvaliacaoReview = { ...(a as Omit<AvaliacaoReview, "id" | "criadoEm">), id: uid("REV"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(REVIEWS_KEY, list)
  return novo
}

export function responderReview(id: string, resposta: string): AvaliacaoReview | undefined {
  const list = listarAvaliacoes()
  const idx = list.findIndex((r) => r.id === id)
  if (idx < 0) return undefined
  list[idx].resposta = resposta
  list[idx].respondido = true
  list[idx].respostaEm = new Date().toISOString()
  setStorage(REVIEWS_KEY, list)
  return list[idx]
}

// ==================== PERGUNTAS E RESPOSTAS ====================
export function listarPerguntasRespostas(filtros?: { produtoId?: string; aprovado?: boolean }): PerguntaResposta[] {
  let list = getStorage<PerguntaResposta[]>(PERGUNTAS_KEY, [])
  if (filtros?.produtoId) list = list.filter((p) => p.produtoId === filtros.produtoId)
  if (filtros?.aprovado !== undefined) list = list.filter((p) => p.aprovado === filtros.aprovado)
  return list.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}

export function salvarPerguntaResposta(p: Omit<PerguntaResposta, "id" | "criadoEm"> | PerguntaResposta): PerguntaResposta {
  const list = listarPerguntasRespostas()
  if ("id" in p && p.id) {
    const idx = list.findIndex((x) => x.id === p.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...p }
      setStorage(PERGUNTAS_KEY, list)
      return list[idx]
    }
  }
  const novo: PerguntaResposta = { ...(p as Omit<PerguntaResposta, "id" | "criadoEm">), id: uid("PQR"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(PERGUNTAS_KEY, list)
  return novo
}

export function responderPergunta(id: string, resposta: string): PerguntaResposta | undefined {
  const list = listarPerguntasRespostas()
  const idx = list.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
  list[idx].resposta = resposta
  list[idx].respondidoEm = new Date().toISOString()
  setStorage(PERGUNTAS_KEY, list)
  return list[idx]
}

// ==================== CHAT ONLINE ====================
const DEFAULT_CHAT: ConfigChat = {
  habilitado: false,
  tipo: "widget",
  mensagemOffline: "No momento não estamos online. Deixe sua mensagem.",
}

export function getConfigChat(): ConfigChat {
  return { ...DEFAULT_CHAT, ...getStorage<Partial<ConfigChat>>(CHAT_KEY, {}) }
}

export function salvarConfigChat(p: Partial<ConfigChat>): ConfigChat {
  const cur = getConfigChat()
  const updated = { ...cur, ...p }
  setStorage(CHAT_KEY, updated)
  return updated
}

// ==================== CENTRAL DE AJUDA / BASE DE CONHECIMENTO ====================
export function listarCategoriasAjuda(): CategoriaAjuda[] {
  return getStorage<CategoriaAjuda[]>(CATEGORIAS_AJUDA_KEY, []).sort((a, b) => a.ordem - b.ordem)
}

export function salvarCategoriaAjuda(c: Omit<CategoriaAjuda, "id" | "criadoEm"> | CategoriaAjuda): CategoriaAjuda {
  const list = listarCategoriasAjuda()
  if ("id" in c && c.id) {
    const idx = list.findIndex((x) => x.id === c.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...c }
      setStorage(CATEGORIAS_AJUDA_KEY, list)
      return list[idx]
    }
  }
  const novo: CategoriaAjuda = { ...(c as Omit<CategoriaAjuda, "id" | "criadoEm">), id: uid("CAT"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(CATEGORIAS_AJUDA_KEY, list)
  return novo
}

export function listarArtigosAjuda(filtros?: { categoria?: string }): ArtigoAjuda[] {
  let list = getStorage<ArtigoAjuda[]>(ARTIGOS_AJUDA_KEY, [])
  if (filtros?.categoria) list = list.filter((a) => a.categoria === filtros.categoria)
  return list.sort((a, b) => a.ordem - b.ordem || new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}

export function salvarArtigoAjuda(a: Omit<ArtigoAjuda, "id" | "criadoEm"> | ArtigoAjuda): ArtigoAjuda {
  const list = listarArtigosAjuda()
  if ("id" in a && a.id) {
    const idx = list.findIndex((x) => x.id === a.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...a }
      setStorage(ARTIGOS_AJUDA_KEY, list)
      return list[idx]
    }
  }
  const novo: ArtigoAjuda = { ...(a as Omit<ArtigoAjuda, "id" | "criadoEm">), id: uid("ART"), criadoEm: new Date().toISOString() }
  list.push(novo)
  setStorage(ARTIGOS_AJUDA_KEY, list)
  return novo
}
