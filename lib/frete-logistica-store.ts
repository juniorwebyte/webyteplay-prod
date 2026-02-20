// Store para Frete e Logística da Loja Virtual

export interface MetodoEnvio {
  id: string
  nome: string
  tipo: "correios" | "transportadora" | "retirada" | "digital" | "outro"
  ativo: boolean
  prazoMin: number // dias
  prazoMax: number
  valorFixo?: number
  usaTabela: boolean
  tabelaId?: string
  apiCorreios?: boolean
  criadoEm: string
}

export interface ConfigCorreios {
  cepOrigem: string
  codigoServicoSedex: string
  codigoServicoPac: string
  contrato: string
  senha: string
  ativo: boolean
}

export interface TabelaFrete {
  id: string
  nome: string
  tipo: "peso" | "valor" | "fixo"
  regras: Array<{
    min: number // kg ou R$
    max: number
    valor: number
    prazo: number
  }>
  ativo: boolean
  criadoEm: string
}

export interface Transportadora {
  id: string
  nome: string
  codigo: string
  urlRastreio: string
  ativo: boolean
  criadoEm: string
}

export interface ZonaEntrega {
  id: string
  nome: string
  ceps: string[] // faixas ou CEPs
  prazoAdicional: number // dias
  valorAdicional: number
  ativo: boolean
  criadoEm: string
}

export interface ConfigLogisticaReversa {
  habilitado: boolean
  prazoSolicitacaoDias: number
  instrucoes: string
}

const METODOS_KEY = "loja-frete-metodos"
const CORREIOS_KEY = "loja-frete-correios"
const TABELAS_KEY = "loja-frete-tabelas"
const TRANSPORTADORAS_KEY = "loja-frete-transportadoras"
const ZONAS_KEY = "loja-frete-zonas"
const REVERSA_KEY = "loja-frete-reversa"
const ETIQUETAS_KEY = "loja-frete-etiquetas"

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
  window.dispatchEvent(new Event("frete-logistica-updated"))
}

// ==================== MÉTODOS DE ENVIO ====================

export function listarMetodosEnvio(): MetodoEnvio[] {
  return getStorage<MetodoEnvio[]>(METODOS_KEY, []).sort((a, b) => a.prazoMin - b.prazoMin)
}

export function salvarMetodoEnvio(metodo: Omit<MetodoEnvio, "id" | "criadoEm"> | MetodoEnvio): MetodoEnvio {
  const metodos = listarMetodosEnvio()
  const hasId = "id" in metodo && metodo.id
  if (hasId) {
    const idx = metodos.findIndex((m) => m.id === metodo.id)
    if (idx >= 0) {
      metodos[idx] = { ...metodo } as MetodoEnvio
      setStorage(METODOS_KEY, metodos)
      return metodos[idx]
    }
  }
  const novo: MetodoEnvio = {
    ...(metodo as Omit<MetodoEnvio, "id" | "criadoEm">),
    id: `ENV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    criadoEm: new Date().toISOString(),
  }
  metodos.push(novo)
  setStorage(METODOS_KEY, metodos)
  return novo
}

export function excluirMetodoEnvio(id: string): boolean {
  const metodos = listarMetodosEnvio().filter((m) => m.id !== id)
  setStorage(METODOS_KEY, metodos)
  return true
}

// ==================== API CORREIOS ====================

const DEFAULT_CORREIOS: ConfigCorreios = {
  cepOrigem: "",
  codigoServicoSedex: "04014",
  codigoServicoPac: "04510",
  contrato: "",
  senha: "",
  ativo: false,
}

export function getConfigCorreios(): ConfigCorreios {
  return { ...DEFAULT_CORREIOS, ...getStorage<Partial<ConfigCorreios>>(CORREIOS_KEY, {}) }
}

export function salvarConfigCorreios(partial: Partial<ConfigCorreios>): ConfigCorreios {
  const current = getConfigCorreios()
  const updated = { ...current, ...partial }
  setStorage(CORREIOS_KEY, updated)
  return updated
}

// ==================== TABELAS DE FRETE ====================

export function listarTabelasFrete(): TabelaFrete[] {
  return getStorage<TabelaFrete[]>(TABELAS_KEY, [])
}

export function salvarTabelaFrete(tabela: Omit<TabelaFrete, "id" | "criadoEm"> | TabelaFrete): TabelaFrete {
  const tabelas = listarTabelasFrete()
  const hasId = "id" in tabela && tabela.id
  if (hasId) {
    const idx = tabelas.findIndex((t) => t.id === tabela.id)
    if (idx >= 0) {
      tabelas[idx] = { ...tabela } as TabelaFrete
      setStorage(TABELAS_KEY, tabelas)
      return tabelas[idx]
    }
  }
  const novo: TabelaFrete = {
    ...(tabela as Omit<TabelaFrete, "id" | "criadoEm">),
    id: `TAB-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    criadoEm: new Date().toISOString(),
  }
  tabelas.push(novo)
  setStorage(TABELAS_KEY, tabelas)
  return novo
}

export function excluirTabelaFrete(id: string): boolean {
  setStorage(TABELAS_KEY, listarTabelasFrete().filter((t) => t.id !== id))
  return true
}

// ==================== TRANSPORTADORAS ====================

export function listarTransportadoras(): Transportadora[] {
  return getStorage<Transportadora[]>(TRANSPORTADORAS_KEY, [])
}

export function salvarTransportadora(t: Omit<Transportadora, "id" | "criadoEm"> | Transportadora): Transportadora {
  const list = listarTransportadoras()
  const hasId = "id" in t && t.id
  if (hasId) {
    const idx = list.findIndex((x) => x.id === t.id)
    if (idx >= 0) {
      list[idx] = { ...t } as Transportadora
      setStorage(TRANSPORTADORAS_KEY, list)
      return list[idx]
    }
  }
  const novo: Transportadora = {
    ...(t as Omit<Transportadora, "id" | "criadoEm">),
    id: `TRP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    criadoEm: new Date().toISOString(),
  }
  list.push(novo)
  setStorage(TRANSPORTADORAS_KEY, list)
  return novo
}

export function excluirTransportadora(id: string): boolean {
  setStorage(TRANSPORTADORAS_KEY, listarTransportadoras().filter((x) => x.id !== id))
  return true
}

// ==================== ZONAS DE ENTREGA ====================

export function listarZonasEntrega(): ZonaEntrega[] {
  return getStorage<ZonaEntrega[]>(ZONAS_KEY, [])
}

export function salvarZonaEntrega(z: Omit<ZonaEntrega, "id" | "criadoEm"> | ZonaEntrega): ZonaEntrega {
  const list = listarZonasEntrega()
  const hasId = "id" in z && z.id
  if (hasId) {
    const idx = list.findIndex((x) => x.id === z.id)
    if (idx >= 0) {
      list[idx] = { ...z } as ZonaEntrega
      setStorage(ZONAS_KEY, list)
      return list[idx]
    }
  }
  const novo: ZonaEntrega = {
    ...(z as Omit<ZonaEntrega, "id" | "criadoEm">),
    id: `ZON-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    criadoEm: new Date().toISOString(),
  }
  list.push(novo)
  setStorage(ZONAS_KEY, list)
  return novo
}

export function excluirZonaEntrega(id: string): boolean {
  setStorage(ZONAS_KEY, listarZonasEntrega().filter((x) => x.id !== id))
  return true
}

// ==================== PRAZO DE ENTREGA ====================

export function getPrazoEntregaPadrao(): { min: number; max: number } {
  const metodos = listarMetodosEnvio()
  if (metodos.length === 0) return { min: 1, max: 5 }
  const min = Math.min(...metodos.map((m) => m.prazoMin))
  const max = Math.max(...metodos.map((m) => m.prazoMax))
  return { min, max }
}

// ==================== LOGÍSTICA REVERSA ====================

const DEFAULT_REVERSA: ConfigLogisticaReversa = {
  habilitado: false,
  prazoSolicitacaoDias: 7,
  instrucoes: "Entre em contato para solicitar devolução.",
}

export function getConfigLogisticaReversa(): ConfigLogisticaReversa {
  return { ...DEFAULT_REVERSA, ...getStorage<Partial<ConfigLogisticaReversa>>(REVERSA_KEY, {}) }
}

export function salvarConfigLogisticaReversa(partial: Partial<ConfigLogisticaReversa>): ConfigLogisticaReversa {
  const current = getConfigLogisticaReversa()
  const updated = { ...current, ...partial }
  setStorage(REVERSA_KEY, updated)
  return updated
}

// ==================== ETIQUETAS (referência) ====================

export interface EtiquetaEnvio {
  id: string
  pedidoId: string
  codigoRastreio: string
  transportadoraId: string
  geradaEm: string
  urlImpressao?: string
}

export function listarEtiquetas(): EtiquetaEnvio[] {
  return getStorage<EtiquetaEnvio[]>(ETIQUETAS_KEY, [])
}

export function registrarEtiqueta(etiqueta: Omit<EtiquetaEnvio, "id" | "geradaEm">): EtiquetaEnvio {
  const list = listarEtiquetas()
  const novo: EtiquetaEnvio = {
    ...etiqueta,
    id: `ETQ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    geradaEm: new Date().toISOString(),
  }
  list.push(novo)
  setStorage(ETIQUETAS_KEY, list)
  return novo
}
