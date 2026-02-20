// Store para configurações de pagamentos da Loja Virtual

import { listarPedidos } from "./gateway-store"

export interface ConfigParcelamento {
  habilitado: boolean
  maxParcelas: number
  parcelaMinima: number
  semJurosAte: number
}

export interface ConfigJuros {
  tipo: "composto" | "simples" | "preco"
  taxaMensal: number
  aplicarAposParcela: number
}

export interface MetodoPagamento {
  id: string
  nome: string
  tipo: "pix" | "cartao_credito" | "cartao_debito" | "boleto" | "outro"
  ativo: boolean
  ordem: number
}

export interface ConfigAntifraude {
  habilitado: boolean
  limiteValorSemAnalise: number
  bloquearCpfRepetido: boolean
  maxTentativasCartao: number
  listaBloqueioCpf: string[]
  listaBloqueioEmail: string[]
}

export interface LogTransacao {
  id: string
  pedidoId: string
  tipo: "criacao" | "pagamento" | "estorno" | "falha" | "webhook"
  gateway: string
  valor: number
  criadoEm: string
}

const PARCELAMENTO_KEY = "loja-pagamentos-parcelamento"
const JUROS_KEY = "loja-pagamentos-juros"
const METODOS_KEY = "loja-pagamentos-metodos"
const ANTIFRAUDE_KEY = "loja-pagamentos-antifraude"
const LOGS_KEY = "loja-pagamentos-logs"

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
  window.dispatchEvent(new Event("pagamentos-loja-updated"))
}

const DEFAULT_PARCELAMENTO: ConfigParcelamento = {
  habilitado: true,
  maxParcelas: 12,
  parcelaMinima: 50,
  semJurosAte: 3,
}

export function getConfigParcelamento(): ConfigParcelamento {
  return { ...DEFAULT_PARCELAMENTO, ...getStorage<Partial<ConfigParcelamento>>(PARCELAMENTO_KEY, {}) }
}

export function salvarConfigParcelamento(partial: Partial<ConfigParcelamento>): ConfigParcelamento {
  const current = getConfigParcelamento()
  const updated = { ...current, ...partial }
  setStorage(PARCELAMENTO_KEY, updated)
  return updated
}

const DEFAULT_JUROS: ConfigJuros = {
  tipo: "composto",
  taxaMensal: 1.99,
  aplicarAposParcela: 4,
}

export function getConfigJuros(): ConfigJuros {
  return { ...DEFAULT_JUROS, ...getStorage<Partial<ConfigJuros>>(JUROS_KEY, {}) }
}

export function salvarConfigJuros(partial: Partial<ConfigJuros>): ConfigJuros {
  const current = getConfigJuros()
  const updated = { ...current, ...partial }
  setStorage(JUROS_KEY, updated)
  return updated
}

const DEFAULT_METODOS: MetodoPagamento[] = [
  { id: "pix", nome: "PIX", tipo: "pix", ativo: true, ordem: 0 },
  { id: "cc", nome: "Cartão de Crédito", tipo: "cartao_credito", ativo: true, ordem: 1 },
  { id: "cd", nome: "Cartão de Débito", tipo: "cartao_debito", ativo: true, ordem: 2 },
  { id: "boleto", nome: "Boleto", tipo: "boleto", ativo: false, ordem: 3 },
]

export function listarMetodosPagamento(): MetodoPagamento[] {
  const stored = getStorage<MetodoPagamento[]>(METODOS_KEY, [])
  return stored.length > 0 ? stored : DEFAULT_METODOS
}

export function salvarMetodoPagamento(metodo: MetodoPagamento): MetodoPagamento[] {
  const metodos = listarMetodosPagamento()
  const idx = metodos.findIndex((m) => m.id === metodo.id)
  if (idx >= 0) metodos[idx] = metodo
  else metodos.push(metodo)
  setStorage(METODOS_KEY, metodos.sort((a, b) => a.ordem - b.ordem))
  return listarMetodosPagamento()
}

const DEFAULT_ANTIFRAUDE: ConfigAntifraude = {
  habilitado: true,
  limiteValorSemAnalise: 500,
  bloquearCpfRepetido: false,
  maxTentativasCartao: 3,
  listaBloqueioCpf: [],
  listaBloqueioEmail: [],
}

export function getConfigAntifraude(): ConfigAntifraude {
  return { ...DEFAULT_ANTIFRAUDE, ...getStorage<Partial<ConfigAntifraude>>(ANTIFRAUDE_KEY, {}) }
}

export function salvarConfigAntifraude(partial: Partial<ConfigAntifraude>): ConfigAntifraude {
  const current = getConfigAntifraude()
  const updated = { ...current, ...partial }
  setStorage(ANTIFRAUDE_KEY, updated)
  return updated
}

export function adicionarBloqueioCpf(cpf: string): void {
  const cfg = getConfigAntifraude()
  const limpo = cpf.replace(/\D/g, "")
  if (!cfg.listaBloqueioCpf.includes(limpo)) {
    cfg.listaBloqueioCpf.push(limpo)
    setStorage(ANTIFRAUDE_KEY, cfg)
  }
}

export function removerBloqueioCpf(cpf: string): void {
  const cfg = getConfigAntifraude()
  cfg.listaBloqueioCpf = cfg.listaBloqueioCpf.filter((c) => c !== cpf.replace(/\D/g, ""))
  setStorage(ANTIFRAUDE_KEY, cfg)
}

export function listarLogsTransacoes(filtros?: { pedidoId?: string; tipo?: LogTransacao["tipo"] }): LogTransacao[] {
  let logs = getStorage<LogTransacao[]>(LOGS_KEY, [])
  const pedidos = listarPedidos()
  if (logs.length === 0 && pedidos.length > 0) {
    pedidos.slice(0, 50).forEach((p) => {
      logs.push({
        id: `LOG-${p.id}`,
        pedidoId: p.id,
        tipo: p.status === "pago" ? "pagamento" : "criacao",
        gateway: "webytepay",
        valor: p.valorTotal,
        criadoEm: p.pagoEm || p.criadoEm,
      })
    })
    setStorage(LOGS_KEY, logs)
  }
  if (filtros?.pedidoId) logs = logs.filter((l) => l.pedidoId === filtros.pedidoId)
  if (filtros?.tipo) logs = logs.filter((l) => l.tipo === filtros.tipo)
  return logs.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}
