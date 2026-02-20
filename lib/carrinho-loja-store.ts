// Carrinho exclusivo da Loja Virtual (giros, caixas, cotas, descontos, packs, emblemas)
// Sincronizado com loja-store e configurável no painel admin

export type TipoItemCarrinho =
  | "giro_roleta"
  | "caixa"
  | "cota"
  | "desconto"
  | "pack"
  | "emblema"
  | "produto_loja"

export interface ItemCarrinhoLoja {
  id: string
  tipo: TipoItemCarrinho
  produtoId: string
  nome: string
  quantidade: number
  valorUnitario: number
  /** ID da campanha (para giros/caixas/cotas vinculados a uma rifa) */
  campanhaId?: string
  /** Dados extras (ex: pacote de giros) */
  extras?: Record<string, unknown>
}

const CARRINHO_KEY = "loja-carrinho-itens"

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function setStorage(key: string, data: ItemCarrinhoLoja[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
  window.dispatchEvent(new Event("carrinho-loja-updated"))
}

export function listarItensCarrinho(): ItemCarrinhoLoja[] {
  return getStorage<ItemCarrinhoLoja[]>(CARRINHO_KEY, [])
}

export function adicionarAoCarrinho(item: Omit<ItemCarrinhoLoja, "id">): ItemCarrinhoLoja {
  const itens = listarItensCarrinho()
  const existente = itens.find(
    (i) =>
      i.produtoId === item.produtoId &&
      i.tipo === item.tipo &&
      (i.campanhaId || "") === (item.campanhaId || "")
  )
  if (existente) {
    existente.quantidade += item.quantidade
    setStorage(CARRINHO_KEY, itens)
    return existente
  }
  const novo: ItemCarrinhoLoja = {
    ...item,
    id: `CL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  }
  itens.push(novo)
  setStorage(CARRINHO_KEY, itens)
  return novo
}

export function removerDoCarrinho(id: string): boolean {
  const itens = listarItensCarrinho().filter((i) => i.id !== id)
  if (itens.length === getStorage<ItemCarrinhoLoja[]>(CARRINHO_KEY, []).length) return false
  setStorage(CARRINHO_KEY, itens)
  return true
}

export function atualizarQuantidade(id: string, quantidade: number): boolean {
  const itens = listarItensCarrinho()
  const item = itens.find((i) => i.id === id)
  if (!item) return false
  if (quantidade <= 0) return removerDoCarrinho(id)
  item.quantidade = quantidade
  setStorage(CARRINHO_KEY, itens)
  return true
}

export function limparCarrinho(): void {
  setStorage(CARRINHO_KEY, [])
}

export function totalItensCarrinho(): number {
  return listarItensCarrinho().reduce((sum, i) => sum + i.quantidade, 0)
}

export function valorTotalCarrinho(): number {
  return listarItensCarrinho().reduce((sum, i) => sum + i.quantidade * i.valorUnitario, 0)
}
