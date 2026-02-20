// Store de links de pagamento no servidor (para página pública /pagar/[id])
// API routes usam este store

export interface LinkPagamentoServer {
  id: string
  valor: number
  descricao: string
  criadoEm: string
  status: "ativo" | "pago" | "expirado"
  pedidoId?: string
  pagador?: string
}

const store = new Map<string, LinkPagamentoServer>()

export function addLink(link: LinkPagamentoServer) {
  store.set(link.id, { ...link })
}

export function getLink(id: string): LinkPagamentoServer | undefined {
  return store.get(id)
}

export function markLinkPaid(id: string, pedidoId: string, pagador?: string) {
  const link = store.get(id)
  if (!link) return
  store.set(id, { ...link, status: "pago", pedidoId, pagador })
}

export function listarTodos(): LinkPagamentoServer[] {
  return Array.from(store.values()).sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}
