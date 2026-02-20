// Módulo de persistência da Loja Virtual (localStorage)
// Configuração e itens gerenciados pelo painel admin

export type IconeLoja = "Ticket" | "Gift" | "Zap" | "Gem" | "Star" | "ShoppingBag"

export type TipoProdutoLoja = "cota" | "desconto" | "giro_roleta" | "caixa" | "pack" | "emblema" | "outro"

export interface ProdutoLoja {
  id: string
  nome: string
  descricao: string
  precoPontos: number
  /** Se > 0, item é pago em reais e não pode ser resgatado só com pontos */
  precoReais: number
  icone: IconeLoja
  categoria: string
  /** Tipo do produto: giro, caixa, cota, desconto, pack, emblema */
  tipoProduto?: TipoProdutoLoja
  destaque: boolean
  ativo: boolean
  ordem: number
  /** ID da campanha vinculada (para giros/caixas/cotas de rifa específica) */
  campanhaId?: string
  /** URL da imagem/foto do produto (para produtos físicos) */
  imagemUrl?: string
}

export interface ConfigLoja {
  pontosInicialDemo: number
  titulo: string
  subtitulo: string
  habilitarLoja: boolean
}

const PRODUTOS_KEY = "loja-virtual-produtos"
const CONFIG_KEY = "loja-virtual-config"

const ICONES_MAP: Record<IconeLoja, string> = {
  Ticket: "Ticket",
  Gift: "Gift",
  Zap: "Zap",
  Gem: "Gem",
  Star: "Star",
  ShoppingBag: "ShoppingBag",
}

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
  window.dispatchEvent(new Event("loja-updated"))
}

const DEFAULT_CONFIG: ConfigLoja = {
  pontosInicialDemo: 850,
  titulo: "Loja Virtual",
  subtitulo: "Troque seus pontos por recompensas exclusivas",
  habilitarLoja: true,
}

export function getConfigLoja(): ConfigLoja {
  return { ...DEFAULT_CONFIG, ...getStorage<Partial<ConfigLoja>>(CONFIG_KEY, {}) }
}

export function salvarConfigLoja(partial: Partial<ConfigLoja>): ConfigLoja {
  const current = getConfigLoja()
  const updated = { ...current, ...partial }
  setStorage(CONFIG_KEY, updated)
  return updated
}

export function listarProdutos(): ProdutoLoja[] {
  return getStorage<ProdutoLoja[]>(PRODUTOS_KEY, []).sort((a, b) => a.ordem - b.ordem)
}

export function listarProdutosAtivos(): ProdutoLoja[] {
  return listarProdutos().filter((p) => p.ativo)
}

export function buscarProduto(id: string): ProdutoLoja | undefined {
  return listarProdutos().find((p) => p.id === id)
}

export function salvarProduto(produto: Omit<ProdutoLoja, "id"> | ProdutoLoja): ProdutoLoja {
  const list = listarProdutos()
  const hasId = "id" in produto && produto.id
  if (hasId) {
    const index = list.findIndex((p) => p.id === produto.id)
    const updated = { ...produto } as ProdutoLoja
    if (index >= 0) {
      list[index] = updated
      setStorage(PRODUTOS_KEY, list)
      return updated
    }
  }
  const novo: ProdutoLoja = {
    ...(produto as Omit<ProdutoLoja, "id">),
    id: `LV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  } as ProdutoLoja
  if (!novo.ordem) novo.ordem = list.length
  list.push(novo)
  setStorage(PRODUTOS_KEY, list)
  return novo
}

export function excluirProduto(id: string): boolean {
  const list = listarProdutos().filter((p) => p.id !== id)
  if (list.length === getStorage<ProdutoLoja[]>(PRODUTOS_KEY, []).length) return false
  setStorage(PRODUTOS_KEY, list)
  return true
}

export function reordenarProdutos(ids: string[]): void {
  const list = listarProdutos()
  const byId = new Map(list.map((p) => [p.id, p]))
  ids.forEach((id, i) => {
    const p = byId.get(id)
    if (p) p.ordem = i
  })
  setStorage(PRODUTOS_KEY, list.sort((a, b) => a.ordem - b.ordem))
}

const PONTOS_USUARIO_KEY = "loja-pontos-usuario"

export function getPontosUsuario(): number {
  if (typeof window === "undefined") return 0
  const config = getConfigLoja()
  const stored = localStorage.getItem(PONTOS_USUARIO_KEY)
  if (stored !== null) return parseInt(stored, 10) || 0
  localStorage.setItem(PONTOS_USUARIO_KEY, String(config.pontosInicialDemo))
  return config.pontosInicialDemo
}

export function setPontosUsuario(pontos: number): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PONTOS_USUARIO_KEY, String(Math.max(0, pontos)))
  window.dispatchEvent(new Event("loja-updated"))
}

export function descontarPontos(quantidade: number): boolean {
  const atuais = getPontosUsuario()
  if (atuais < quantidade) return false
  setPontosUsuario(atuais - quantidade)
  return true
}

export { ICONES_MAP }
