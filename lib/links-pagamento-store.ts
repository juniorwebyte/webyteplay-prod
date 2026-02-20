// Links de pagamento - gerar link para cobrança PIX
// Persistência em localStorage

export interface LinkPagamento {
  id: string
  valor: number
  descricao: string
  criadoEm: string
  status: "ativo" | "pago" | "expirado"
  pedidoId?: string
  pagador?: string
}

const STORAGE_KEY = "webytepay-links-pagamento"

function getAll(): LinkPagamento[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAll(links: LinkPagamento[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
  window.dispatchEvent(new Event("links-pagamento-updated"))
}

export function listarLinks(): LinkPagamento[] {
  return getAll().sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}

export function buscarLink(id: string): LinkPagamento | undefined {
  return getAll().find((l) => l.id === id)
}

export function criarLink(valor: number, descricao: string): LinkPagamento {
  const links = getAll()
  const id = `LNK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const novo: LinkPagamento = {
    id,
    valor,
    descricao: descricao || "Pagamento",
    criadoEm: new Date().toISOString(),
    status: "ativo",
  }
  links.push(novo)
  saveAll(links)
  return novo
}

export function marcarLinkPago(id: string, pedidoId: string, pagador?: string): void {
  const links = getAll()
  const idx = links.findIndex((l) => l.id === id)
  if (idx === -1) return
  links[idx] = { ...links[idx], status: "pago", pedidoId, pagador }
  saveAll(links)
}

export function excluirLink(id: string): boolean {
  const links = getAll().filter((l) => l.id !== id)
  if (links.length === getAll().length) return false
  saveAll(links)
  return true
}
