// Store de cotas ganhas na roleta/box - para concorrer ao prêmio principal no sorteio

export interface CotaGanhaRoletaBox {
  id: string
  campanhaId: string
  cpf: string
  cota: number
  origem: "roleta" | "box"
  premioNome: string
  criadoEm: string
}

const STORAGE_KEY = "cotas-ganhas-roleta-box"

function getAll(): CotaGanhaRoletaBox[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAll(items: CotaGanhaRoletaBox[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event("cotas-ganhas-roleta-box-updated"))
}

/** Registra cota ganha na roleta/box */
export function registrarCotaGanha(params: {
  campanhaId: string
  cpf: string
  cota: number
  origem: "roleta" | "box"
  premioNome: string
}): CotaGanhaRoletaBox {
  const items = getAll()
  const novo: CotaGanhaRoletaBox = {
    id: `cg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    campanhaId: params.campanhaId,
    cpf: params.cpf,
    cota: params.cota,
    origem: params.origem,
    premioNome: params.premioNome,
    criadoEm: new Date().toISOString(),
  }
  items.push(novo)
  saveAll(items)
  return novo
}

/** Busca cotas ganhas por campanha e cota (para verificar ganhador duplo no sorteio) */
export function buscarPorCampanhaECota(campanhaId: string, cota: number): CotaGanhaRoletaBox[] {
  return getAll().filter((c) => c.campanhaId === campanhaId && c.cota === cota)
}

/** Busca cotas ganhas por CPF e campanha */
export function buscarPorCpfCampanha(campanhaId: string, cpf: string): CotaGanhaRoletaBox[] {
  const cpfLimpo = cpf.replace(/\D/g, "")
  return getAll().filter(
    (c) => c.campanhaId === campanhaId && c.cpf.replace(/\D/g, "") === cpfLimpo
  )
}

/** Busca todas as cotas ganhas por CPF (todas as campanhas) */
export function buscarPorCpf(cpf: string): CotaGanhaRoletaBox[] {
  const cpfLimpo = cpf.replace(/\D/g, "")
  return getAll().filter((c) => c.cpf.replace(/\D/g, "") === cpfLimpo)
}

/** Retorna Set de cotas já atribuídas (roleta/box) para uma campanha - para não repetir */
export function cotasJaAtribuidas(campanhaId: string): Set<number> {
  const items = getAll().filter((c) => c.campanhaId === campanhaId)
  return new Set(items.map((c) => c.cota))
}
