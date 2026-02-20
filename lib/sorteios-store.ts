// Módulo de persistência de sorteios (localStorage)
// Sincronizado com campanhas para dados de rifa, cotas e valor

export interface Sorteio {
  id: string
  campanhaId: string
  rifa: string
  dataSorteio: string
  status: "agendado" | "realizado"
  cotasVendidas: number
  totalCotas: number
  valorArrecadado: number
  cotaPremiada?: number
  ganhador?: string
  realizadoEm?: string
}

const STORAGE_KEY = "sorteios"

function getAll(): Sorteio[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAll(sorteios: Sorteio[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sorteios))
  window.dispatchEvent(new Event("sorteios-updated"))
}

export function listarSorteios(): Sorteio[] {
  return getAll()
}

export function buscarSorteio(id: string): Sorteio | undefined {
  return getAll().find((s) => s.id === id)
}

export function agendarSorteio(params: {
  campanhaId: string
  rifa: string
  dataSorteio: string
  cotasVendidas: number
  totalCotas: number
  valorArrecadado: number
}): Sorteio {
  const sorteios = getAll()
  const novo: Sorteio = {
    id: `SORT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    campanhaId: params.campanhaId,
    rifa: params.rifa,
    dataSorteio: params.dataSorteio,
    status: "agendado",
    cotasVendidas: params.cotasVendidas,
    totalCotas: params.totalCotas,
    valorArrecadado: params.valorArrecadado,
  }
  sorteios.push(novo)
  saveAll(sorteios)
  return novo
}

export function realizarSorteio(
  id: string,
  cotaPremiada: number,
  ganhador: string
): Sorteio | undefined {
  const sorteios = getAll()
  const index = sorteios.findIndex((s) => s.id === id)
  if (index === -1) return undefined
  sorteios[index] = {
    ...sorteios[index],
    status: "realizado",
    cotaPremiada,
    ganhador,
    realizadoEm: new Date().toISOString(),
  }
  saveAll(sorteios)
  return sorteios[index]
}

export function excluirSorteio(id: string): boolean {
  const sorteios = getAll().filter((s) => s.id !== id)
  if (sorteios.length === getAll().length) return false
  saveAll(sorteios)
  return true
}

export function listarProximos(): Sorteio[] {
  return getAll()
    .filter((s) => s.status === "agendado")
    .sort((a, b) => new Date(a.dataSorteio).getTime() - new Date(b.dataSorteio).getTime())
}

export function listarRealizados(): Sorteio[] {
  return getAll()
    .filter((s) => s.status === "realizado")
    .sort((a, b) => new Date(b.dataSorteio).getTime() - new Date(a.dataSorteio).getTime())
}
