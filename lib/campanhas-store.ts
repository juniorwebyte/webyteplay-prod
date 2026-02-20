// Modulo centralizado de persistencia de campanhas (localStorage)
// Substituir por chamadas API quando um banco de dados for conectado

export interface Desconto {
  id: number
  quantidadeCotas: string
  valorDesconto: string
}

/** Cota premiada individual: número + prêmio específico */
export interface CotaPremiadaItem {
  id: string
  numero: number
  premio: string
}

/** Pacote promocional (ex: 5 giros por R$10) */
export interface PacotePromocional {
  id: string
  quantidade: number
  valor: number
  label?: string
}

/** Prêmio configurável da roleta/box - daCotaParaSorteio=true: ao ganhar, cliente recebe cota aleatória para concorrer ao prêmio principal */
export interface PremioRoletaBox {
  id: string
  nome: string
  probabilidade: number
  icone?: string
  /** Se true, ao ganhar este prêmio o cliente recebe uma cota aleatória; se no sorteio a cota vencedora for a dele, ganha prêmio principal + este */
  daCotaParaSorteio?: boolean
}

/** Configuração de roleta por campanha */
export interface RoletaConfig {
  id: string
  nome: string
  valorGiro: number
  moeda: "reais" | "tickets"
  pacotes: PacotePromocional[]
  regraDesconto?: string
  premios?: PremioRoletaBox[]
}

/** Configuração de box por campanha */
export interface BoxConfig {
  id: string
  nome: string
  valorAbertura: number
  moeda: "reais" | "tickets" | "gratis"
  pacotes: PacotePromocional[]
  regraDesconto?: string
  premios?: PremioRoletaBox[]
}

export interface Campanha {
  id: string
  titulo: string
  subtitulo: string
  descricao: string
  tipoCampanha: string
  valorCotas: { numero: number; valor: string }[]
  dataInicio: string
  campanhaPrivada: boolean
  destaque: boolean
  quantidadeNumeros: string
  valorPorCota: string
  tempoParaPagamento: string
  quantidadeLimiteCompra: string
  quantidadeMinima: string
  quantidadeMaximaCompra: string
  statusExibicao: string
  statusCampanha: string

  // Imagens
  imagemPrincipal: string | null
  imagensAdicionais: string[]

  // Descontos
  habilitarDesconto: boolean
  descontos: Desconto[]

  // Ranking
  habilitarRanking: boolean
  mostrarNomes: boolean
  tipoRanking: string
  quantidadeCompradores: string
  mensagemPromocao: string

  // Barra de Progresso
  exibirBarraProgresso: boolean

  // Ganhador
  habilitarGanhador: boolean
  nomeGanhador: string
  numeroSorteado: string

  // Cotas Premiadas (novo formato: lista individual com prêmio por cota)
  cotasPremiadas: boolean
  cotasPremiadas1: string
  cotasPremiadas2: string
  /** Lista de cotas premiadas: cada cota com seu prêmio específico */
  cotasPremiadasLista?: CotaPremiadaItem[]
  habilitarMaiorMenorCota: boolean
  habilitarMaiorMenorCotaDiaria: boolean
  habilitarRoleta: boolean
  habilitarBox: boolean
  habilitarBloqueioCotas: boolean
  /** Lista de cotas bloqueadas: nunca vendidas nem sorteadas. Libere quando atingir margem de lucro. */
  cotasBloqueadas?: number[]
  /** Configurações de roletas da campanha (exibidas na página de compra) */
  roletasConfig?: RoletaConfig[]
  /** Configurações de boxs da campanha (exibidas na página de compra) */
  boxsConfig?: BoxConfig[]
  /** Valor por giro na roleta (quando habilitarRoleta, fallback se roletasConfig vazio) */
  roletaValorGiro?: number
  /** Valor para abrir box (quando habilitarBox, fallback se boxsConfig vazio) */
  boxValorAbertura?: number

  // Metadados
  criadoEm: string
  atualizadoEm: string
  cotasVendidas: number
}

const STORAGE_KEY = "campanhas"

function getAll(): Campanha[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAll(campanhas: Campanha[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campanhas))
}

export function listarCampanhas(): Campanha[] {
  return getAll()
}

export function buscarCampanha(id: string): Campanha | undefined {
  return getAll().find((c) => c.id === id)
}

export function salvarCampanha(campanha: Omit<Campanha, "id" | "criadoEm" | "atualizadoEm" | "cotasVendidas">): Campanha {
  const campanhas = getAll()
  const now = new Date().toISOString()
  const novaCampanha: Campanha = {
    ...campanha,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    criadoEm: now,
    atualizadoEm: now,
    cotasVendidas: 0,
  }
  campanhas.push(novaCampanha)
  try {
    saveAll(campanhas)
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      campanhas.pop()
      novaCampanha.imagemPrincipal = null
      novaCampanha.imagensAdicionais = []
      campanhas.push(novaCampanha)
      saveAll(campanhas)
    } else {
      throw e
    }
  }
  window.dispatchEvent(new Event("campanhas-updated"))
  return novaCampanha
}

export function atualizarCampanha(id: string, dados: Partial<Campanha>): Campanha | undefined {
  const campanhas = getAll()
  const index = campanhas.findIndex((c) => c.id === id)
  if (index === -1) return undefined

  const atualizado = {
    ...campanhas[index],
    ...dados,
    atualizadoEm: new Date().toISOString(),
  }
  campanhas[index] = atualizado
  try {
    saveAll(campanhas)
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      atualizado.imagemPrincipal = null
      atualizado.imagensAdicionais = []
      campanhas[index] = atualizado
      saveAll(campanhas)
    } else {
      throw e
    }
  }
  window.dispatchEvent(new Event("campanhas-updated"))
  return campanhas[index]
}

export function excluirCampanha(id: string): boolean {
  const campanhas = getAll()
  const filtered = campanhas.filter((c) => c.id !== id)
  if (filtered.length === campanhas.length) return false
  saveAll(filtered)
  window.dispatchEvent(new Event("campanhas-updated"))
  return true
}

/** Clona uma campanha existente (novo id, cotasVendidas zerado). Imagens não são copiadas para evitar estourar o limite do localStorage. */
export function clonarCampanha(id: string): Campanha | undefined {
  const original = buscarCampanha(id)
  if (!original) return undefined
  const campanhas = getAll()
  const now = new Date().toISOString()
  const clone: Campanha = {
    ...original,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    titulo: `${original.titulo} (Cópia)`,
    criadoEm: now,
    atualizadoEm: now,
    cotasVendidas: 0,
    imagemPrincipal: null,
    imagensAdicionais: [],
  }
  campanhas.push(clone)
  try {
    saveAll(campanhas)
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("localStorage cheio: clone sem imagens já aplicado. Exclua campanhas antigas ou limpe dados do site.")
    }
    throw e
  }
  window.dispatchEvent(new Event("campanhas-updated"))
  return clone
}

export function listarCampanhasAtivas(): Campanha[] {
  return getAll().filter(
    (c) => c.statusCampanha === "Ativo" && !c.campanhaPrivada
  )
}

export function listarCampanhasDestaque(): Campanha[] {
  return getAll().filter(
    (c) => c.statusCampanha === "Ativo" && c.destaque && !c.campanhaPrivada
  )
}

// Converte arquivo para base64 data URL (sem compressão)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const MAX_WIDTH_CAMPANHA = 1200
const MAX_HEIGHT_CAMPANHA = 800
const JPEG_QUALITY = 0.82

/**
 * Comprime a imagem para caber no localStorage e evitar QuotaExceeded.
 * Redimensiona para no máximo 1200x800 e converte para JPEG com qualidade 0.82.
 */
export function compressImageForCampaign(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) return fileToBase64(file)

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > MAX_WIDTH_CAMPANHA || h > MAX_HEIGHT_CAMPANHA) {
        const r = Math.min(MAX_WIDTH_CAMPANHA / w, MAX_HEIGHT_CAMPANHA / h)
        w = Math.round(w * r)
        h = Math.round(h * r)
      }
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        fileToBase64(file).then(resolve).catch(reject)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY)
        resolve(dataUrl)
      } catch {
        fileToBase64(file).then(resolve).catch(reject)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      fileToBase64(file).then(resolve).catch(reject)
    }
    img.src = url
  })
}
