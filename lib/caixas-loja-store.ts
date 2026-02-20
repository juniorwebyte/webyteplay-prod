// Caixas premiadas configuráveis no painel admin (Loja Virtual)
// Substitui dados fictícios

export interface PremioCaixa {
  id: string
  nome: string
  probabilidade: number
  raridade: string
  icone: string
}

export interface CaixaLoja {
  id: string
  nome: string
  descricao: string
  preco: number
  moeda: "tickets" | "reais" | "gratis"
  imagem: string
  raridade: string
  premios: PremioCaixa[]
  ativo: boolean
  ordem: number
}

const CAIXAS_KEY = "loja-caixas"

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function setStorage(key: string, data: CaixaLoja[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
  window.dispatchEvent(new Event("loja-updated"))
}

export function listarCaixas(): CaixaLoja[] {
  return getStorage<CaixaLoja[]>(CAIXAS_KEY, []).sort((a, b) => a.ordem - b.ordem)
}

export function listarCaixasAtivas(): CaixaLoja[] {
  return listarCaixas().filter((c) => c.ativo)
}

export function buscarCaixa(id: string): CaixaLoja | undefined {
  return listarCaixas().find((c) => c.id === id)
}

export function salvarCaixa(caixa: Omit<CaixaLoja, "id"> | CaixaLoja): CaixaLoja {
  const list = listarCaixas()
  const hasId = "id" in caixa && caixa.id
  if (hasId) {
    const index = list.findIndex((c) => c.id === caixa.id)
    if (index >= 0) {
      list[index] = { ...caixa } as CaixaLoja
      setStorage(CAIXAS_KEY, list)
      return list[index]
    }
  }
  const novo: CaixaLoja = {
    ...(caixa as Omit<CaixaLoja, "id">),
    id: `CX-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  } as CaixaLoja
  if (!novo.ordem) novo.ordem = list.length
  list.push(novo)
  setStorage(CAIXAS_KEY, list)
  return novo
}

export function excluirCaixa(id: string): boolean {
  const list = listarCaixas().filter((c) => c.id !== id)
  if (list.length === getStorage<CaixaLoja[]>(CAIXAS_KEY, []).length) return false
  setStorage(CAIXAS_KEY, list)
  return true
}
