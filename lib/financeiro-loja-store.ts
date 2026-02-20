// Store para gestão financeira completa da Loja Virtual

import { listarPedidos } from "./gateway-store"
import { faturamentoLoja, listarVendasLojaPagas } from "./vendas-loja-store"

export interface MovimentoFinanceiro {
  id: string
  tipo: "recebimento" | "pagamento" | "taxa" | "estorno" | "comissao"
  valor: number
  descricao: string
  pedidoId?: string
  referencia?: string
  data: string
  categoria?: string
}

export interface Fatura {
  id: string
  numero: string
  clienteId: string
  valor: number
  status: "pendente" | "paga" | "vencida" | "cancelada"
  vencimento: string
  pagamento?: string
}

export interface Boleto {
  id: string
  faturaId: string
  codigoBarras?: string
  linhaDigitavel?: string
  vencimento: string
  status: "gerado" | "pago" | "cancelado"
}

export interface CentroCusto {
  id: string
  nome: string
  descricao?: string
  orcamento?: number
  gasto: number
}

const MOVIMENTOS_KEY = "loja-financeiro-movimentos"
const FATURAS_KEY = "loja-financeiro-faturas"
const CENTROS_KEY = "loja-financeiro-centros"

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
  window.dispatchEvent(new Event("financeiro-updated"))
}

// ==================== RESUMO FINANCEIRO ====================

export function resumoFinanceiro() {
  const vendas = listarVendasLojaPagas()
  const pedidos = listarPedidos().filter((p) => p.status === "pago" && (p as any).tipoEspecial === "produto_loja")
  const faturamento = faturamentoLoja()
  const ticketMedio = vendas.length > 0 ? faturamento / vendas.length : 0
  
  return {
    faturamentoTotal: faturamento,
    totalVendas: vendas.length,
    ticketMedio,
    pedidosPagos: pedidos.length,
  }
}

// ==================== FLUXO DE CAIXA ====================

export function listarMovimentos(filtros?: { dataInicio?: string; dataFim?: string; tipo?: MovimentoFinanceiro["tipo"] }): MovimentoFinanceiro[] {
  let movimentos = getStorage<MovimentoFinanceiro[]>(MOVIMENTOS_KEY, [])
  
  // Gerar movimentos a partir dos pedidos se vazio
  if (movimentos.length === 0) {
    const vendas = listarVendasLojaPagas()
    vendas.forEach((p) => {
      movimentos.push({
        id: `MOV-${p.id}`,
        tipo: "recebimento",
        valor: p.valorTotal,
        descricao: `Venda ${p.id}`,
        pedidoId: p.id,
        data: p.pagoEm || p.criadoEm,
      })
      // Simular taxa de gateway (2%)
      movimentos.push({
        id: `TAX-${p.id}`,
        tipo: "taxa",
        valor: -(p.valorTotal * 0.02),
        descricao: "Taxa gateway",
        pedidoId: p.id,
        data: p.pagoEm || p.criadoEm,
      })
    })
  }
  
  if (filtros?.dataInicio) movimentos = movimentos.filter((m) => m.data >= filtros.dataInicio!)
  if (filtros?.dataFim) movimentos = movimentos.filter((m) => m.data <= filtros.dataFim!)
  if (filtros?.tipo) movimentos = movimentos.filter((m) => m.tipo === filtros.tipo)
  
  return movimentos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
}

export function fluxoCaixaPorPeriodo(dataInicio: string, dataFim: string) {
  const movimentos = listarMovimentos({ dataInicio, dataFim })
  const recebimentos = movimentos.filter((m) => m.tipo === "recebimento" || m.tipo === "estorno").reduce((s, m) => s + m.valor, 0)
  const pagamentos = movimentos.filter((m) => m.tipo === "pagamento" || m.tipo === "taxa" || m.tipo === "comissao").reduce((s, m) => s + Math.abs(m.valor), 0)
  return { recebimentos, pagamentos, saldo: recebimentos - pagamentos, movimentos }
}

// ==================== RECEBIMENTOS / PAGAMENTOS ====================

export function adicionarMovimento(movimento: Omit<MovimentoFinanceiro, "id">): MovimentoFinanceiro {
  const movimentos = listarMovimentos()
  const novo: MovimentoFinanceiro = {
    ...movimento,
    id: `MOV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  }
  movimentos.push(novo)
  setStorage(MOVIMENTOS_KEY, movimentos)
  return novo
}

// ==================== ESTORNOS ====================

export function listarEstornos(): MovimentoFinanceiro[] {
  return listarMovimentos().filter((m) => m.tipo === "estorno")
}

export function registrarEstorno(pedidoId: string, valor: number, motivo: string): MovimentoFinanceiro {
  return adicionarMovimento({
    tipo: "estorno",
    valor: -valor,
    descricao: `Estorno: ${motivo}`,
    pedidoId,
    data: new Date().toISOString(),
  })
}

// ==================== TAXAS DE GATEWAY ====================

export function totalTaxasGateway(): number {
  return listarMovimentos()
    .filter((m) => m.tipo === "taxa")
    .reduce((s, m) => s + Math.abs(m.valor), 0)
}

// ==================== COMISSÕES ====================

export function relatorioComissoes() {
  const movimentos = listarMovimentos().filter((m) => m.tipo === "comissao")
  return {
    total: movimentos.reduce((s, m) => s + Math.abs(m.valor), 0),
    movimentos,
  }
}

// ==================== RELATÓRIO DE IMPOSTOS ====================

export function relatorioImpostos(ano?: number) {
  const movimentos = listarMovimentos()
  const vendas = listarVendasLojaPagas()
  const faturamento = faturamentoLoja()
  const lucroBruto = faturamento
  const tributavel = lucroBruto * 0.06 // Simulação: 6% sobre faturamento
  return {
    faturamento,
    baseTributavel: tributavel,
    impostosEstimados: tributavel,
    ano: ano || new Date().getFullYear(),
  }
}

// ==================== RELATÓRIO DE LUCRO ====================

export function relatorioLucro(dataInicio?: string, dataFim?: string) {
  const { recebimentos, pagamentos } = fluxoCaixaPorPeriodo(
    dataInicio || new Date(0).toISOString(),
    dataFim || new Date().toISOString()
  )
  return {
    receita: recebimentos,
    despesas: pagamentos,
    lucro: recebimentos - pagamentos,
    margem: recebimentos > 0 ? ((recebimentos - pagamentos) / recebimentos) * 100 : 0,
  }
}

// ==================== CENTRO DE CUSTOS ====================

export function listarCentrosCusto(): CentroCusto[] {
  return getStorage<CentroCusto[]>(CENTROS_KEY, [])
}

export function criarCentroCusto(centro: Omit<CentroCusto, "id" | "gasto">): CentroCusto {
  const centros = listarCentrosCusto()
  const novo: CentroCusto = {
    ...centro,
    id: `CC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gasto: 0,
  }
  centros.push(novo)
  setStorage(CENTROS_KEY, centros)
  return novo
}

// ==================== FATURAS / BOLETOS ====================

export function listarFaturas(): Fatura[] {
  return getStorage<Fatura[]>(FATURAS_KEY, [])
}

export function criarFatura(fatura: Omit<Fatura, "id">): Fatura {
  const faturas = listarFaturas()
  const novo: Fatura = {
    ...fatura,
    id: `FAT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  }
  faturas.push(novo)
  setStorage(FATURAS_KEY, faturas)
  return novo
}
