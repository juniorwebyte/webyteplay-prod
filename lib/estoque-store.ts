// Store para gestão de estoque da Loja Virtual
// Suporta produtos físicos e digitais, variações, lotes, validade, etc.

export interface MovimentacaoEstoque {
  id: string
  produtoId: string
  variacaoId?: string
  tipo: "entrada" | "saida" | "ajuste" | "transferencia" | "venda" | "devolucao"
  quantidade: number
  quantidadeAnterior: number
  quantidadeNova: number
  motivo?: string
  fornecedorId?: string
  loteId?: string
  armazemOrigemId?: string
  armazemDestinoId?: string
  usuarioId?: string
  observacoes?: string
  criadoEm: string
}

export interface Lote {
  id: string
  produtoId: string
  variacaoId?: string
  numeroLote: string
  quantidade: number
  quantidadeInicial: number
  dataFabricacao?: string
  dataValidade?: string
  fornecedorId?: string
  armazemId?: string
  status: "ativo" | "vencido" | "esgotado"
  criadoEm: string
}

export interface Fornecedor {
  id: string
  nome: string
  cnpj?: string
  telefone?: string
  email?: string
  endereco?: string
  ativo: boolean
  criadoEm: string
}

export interface Armazem {
  id: string
  nome: string
  endereco?: string
  responsavel?: string
  ativo: boolean
  criadoEm: string
}

export interface EstoqueProduto {
  produtoId: string
  variacaoId?: string
  quantidade: number
  quantidadeMinima: number
  quantidadeMaxima?: number
  armazemId?: string
  ultimaMovimentacao?: string
  alertaEstoqueBaixo: boolean
}

const MOVIMENTACOES_KEY = "loja-estoque-movimentacoes"
const LOTES_KEY = "loja-estoque-lotes"
const FORNECEDORES_KEY = "loja-estoque-fornecedores"
const ARMAZENS_KEY = "loja-estoque-armazens"
const ESTOQUE_KEY = "loja-estoque-produtos"

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
  window.dispatchEvent(new Event("estoque-updated"))
}

// ==================== MOVIMENTAÇÕES ====================

export function listarMovimentacoes(filtros?: {
  produtoId?: string
  variacaoId?: string
  tipo?: MovimentacaoEstoque["tipo"]
  dataInicio?: string
  dataFim?: string
}): MovimentacaoEstoque[] {
  let movimentacoes = getStorage<MovimentacaoEstoque[]>(MOVIMENTACOES_KEY, [])
  
  if (filtros) {
    if (filtros.produtoId) {
      movimentacoes = movimentacoes.filter((m) => m.produtoId === filtros.produtoId)
    }
    if (filtros.variacaoId) {
      movimentacoes = movimentacoes.filter((m) => m.variacaoId === filtros.variacaoId)
    }
    if (filtros.tipo) {
      movimentacoes = movimentacoes.filter((m) => m.tipo === filtros.tipo)
    }
    if (filtros.dataInicio) {
      movimentacoes = movimentacoes.filter((m) => m.criadoEm >= filtros.dataInicio!)
    }
    if (filtros.dataFim) {
      movimentacoes = movimentacoes.filter((m) => m.criadoEm <= filtros.dataFim!)
    }
  }
  
  return movimentacoes.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}

export function registrarMovimentacao(movimentacao: Omit<MovimentacaoEstoque, "id" | "criadoEm">): MovimentacaoEstoque {
  const movimentacoes = listarMovimentacoes()
  const nova: MovimentacaoEstoque = {
    ...movimentacao,
    id: `MOV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    criadoEm: new Date().toISOString(),
  }
  movimentacoes.push(nova)
  setStorage(MOVIMENTACOES_KEY, movimentacoes)
  
  // Atualizar estoque do produto
  atualizarEstoqueProduto(movimentacao.produtoId, movimentacao.variacaoId, movimentacao.quantidadeNova)
  
  return nova
}

// ==================== ESTOQUE DE PRODUTOS ====================

export function listarEstoqueProdutos(): EstoqueProduto[] {
  return getStorage<EstoqueProduto[]>(ESTOQUE_KEY, [])
}

export function buscarEstoqueProduto(produtoId: string, variacaoId?: string): EstoqueProduto | undefined {
  const estoques = listarEstoqueProdutos()
  return estoques.find(
    (e) => e.produtoId === produtoId && (e.variacaoId || "") === (variacaoId || "")
  )
}

export function atualizarEstoqueProduto(
  produtoId: string,
  variacaoId: string | undefined,
  quantidade: number,
  quantidadeMinima?: number
): EstoqueProduto {
  const estoques = listarEstoqueProdutos()
  const index = estoques.findIndex(
    (e) => e.produtoId === produtoId && (e.variacaoId || "") === (variacaoId || "")
  )
  
  const estoque: EstoqueProduto = {
    produtoId,
    variacaoId,
    quantidade,
    quantidadeMinima: quantidadeMinima ?? estoques[index]?.quantidadeMinima ?? 0,
    alertaEstoqueBaixo: quantidade <= (quantidadeMinima ?? estoques[index]?.quantidadeMinima ?? 0),
    ultimaMovimentacao: new Date().toISOString(),
  }
  
  if (index >= 0) {
    estoques[index] = estoque
  } else {
    estoques.push(estoque)
  }
  
  setStorage(ESTOQUE_KEY, estoques)
  return estoque
}

export function ajustarEstoque(
  produtoId: string,
  variacaoId: string | undefined,
  quantidade: number,
  motivo: string,
  usuarioId?: string
): MovimentacaoEstoque {
  const estoqueAtual = buscarEstoqueProduto(produtoId, variacaoId)
  const quantidadeAnterior = estoqueAtual?.quantidade ?? 0
  const quantidadeNova = quantidade
  
  registrarMovimentacao({
    produtoId,
    variacaoId,
    tipo: "ajuste",
    quantidade: Math.abs(quantidadeNova - quantidadeAnterior),
    quantidadeAnterior,
    quantidadeNova,
    motivo,
    usuarioId,
  })
  
  return listarMovimentacoes({ produtoId, variacaoId })[0]
}

// ==================== LOTES ====================

export function listarLotes(filtros?: {
  produtoId?: string
  variacaoId?: string
  status?: Lote["status"]
}): Lote[] {
  let lotes = getStorage<Lote[]>(LOTES_KEY, [])
  
  if (filtros) {
    if (filtros.produtoId) {
      lotes = lotes.filter((l) => l.produtoId === filtros.produtoId)
    }
    if (filtros.variacaoId) {
      lotes = lotes.filter((l) => l.variacaoId === filtros.variacaoId)
    }
    if (filtros.status) {
      lotes = lotes.filter((l) => l.status === filtros.status)
    }
  }
  
  return lotes
}

export function criarLote(lote: Omit<Lote, "id" | "criadoEm" | "status">): Lote {
  const lotes = listarLotes()
  const novo: Lote = {
    ...lote,
    id: `LOTE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: "ativo",
    criadoEm: new Date().toISOString(),
  }
  
  // Verificar validade
  if (novo.dataValidade && new Date(novo.dataValidade) < new Date()) {
    novo.status = "vencido"
  }
  if (novo.quantidade <= 0) {
    novo.status = "esgotado"
  }
  
  lotes.push(novo)
  setStorage(LOTES_KEY, lotes)
  
  // Atualizar estoque
  const estoqueAtual = buscarEstoqueProduto(lote.produtoId, lote.variacaoId)
  atualizarEstoqueProduto(
    lote.produtoId,
    lote.variacaoId,
    (estoqueAtual?.quantidade ?? 0) + lote.quantidade
  )
  
  return novo
}

export function atualizarLote(loteId: string, updates: Partial<Lote>): Lote | undefined {
  const lotes = listarLotes()
  const index = lotes.findIndex((l) => l.id === loteId)
  if (index === -1) return undefined
  
  lotes[index] = { ...lotes[index], ...updates }
  
  // Verificar status
  if (lotes[index].dataValidade && new Date(lotes[index].dataValidade!) < new Date()) {
    lotes[index].status = "vencido"
  }
  if (lotes[index].quantidade <= 0) {
    lotes[index].status = "esgotado"
  }
  
  setStorage(LOTES_KEY, lotes)
  return lotes[index]
}

// ==================== FORNECEDORES ====================

export function listarFornecedores(): Fornecedor[] {
  return getStorage<Fornecedor[]>(FORNECEDORES_KEY, [])
}

export function criarFornecedor(fornecedor: Omit<Fornecedor, "id" | "criadoEm">): Fornecedor {
  const fornecedores = listarFornecedores()
  const novo: Fornecedor = {
    ...fornecedor,
    id: `FORN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    criadoEm: new Date().toISOString(),
  }
  fornecedores.push(novo)
  setStorage(FORNECEDORES_KEY, fornecedores)
  return novo
}

export function atualizarFornecedor(fornecedorId: string, updates: Partial<Fornecedor>): Fornecedor | undefined {
  const fornecedores = listarFornecedores()
  const index = fornecedores.findIndex((f) => f.id === fornecedorId)
  if (index === -1) return undefined
  fornecedores[index] = { ...fornecedores[index], ...updates }
  setStorage(FORNECEDORES_KEY, fornecedores)
  return fornecedores[index]
}

export function excluirFornecedor(fornecedorId: string): boolean {
  const fornecedores = listarFornecedores().filter((f) => f.id !== fornecedorId)
  if (fornecedores.length === getStorage<Fornecedor[]>(FORNECEDORES_KEY, []).length) return false
  setStorage(FORNECEDORES_KEY, fornecedores)
  return true
}

// ==================== ARMAZÉNS ====================

export function listarArmazens(): Armazem[] {
  return getStorage<Armazem[]>(ARMAZENS_KEY, [])
}

export function criarArmazem(armazem: Omit<Armazem, "id" | "criadoEm">): Armazem {
  const armazens = listarArmazens()
  const novo: Armazem = {
    ...armazem,
    id: `ARM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    criadoEm: new Date().toISOString(),
  }
  armazens.push(novo)
  setStorage(ARMAZENS_KEY, armazens)
  return novo
}

export function atualizarArmazem(armazemId: string, updates: Partial<Armazem>): Armazem | undefined {
  const armazens = listarArmazens()
  const index = armazens.findIndex((a) => a.id === armazemId)
  if (index === -1) return undefined
  armazens[index] = { ...armazens[index], ...updates }
  setStorage(ARMAZENS_KEY, armazens)
  return armazens[index]
}

export function excluirArmazem(armazemId: string): boolean {
  const armazens = listarArmazens().filter((a) => a.id !== armazemId)
  if (armazens.length === getStorage<Armazem[]>(ARMAZENS_KEY, []).length) return false
  setStorage(ARMAZENS_KEY, armazens)
  return true
}

// ==================== ALERTAS ====================

export function listarAlertasEstoqueBaixo(): EstoqueProduto[] {
  const estoques = listarEstoqueProdutos()
  return estoques.filter((e) => e.alertaEstoqueBaixo)
}

// ==================== ENTRADA DE MERCADORIAS ====================

export function registrarEntradaMercadorias(
  produtoId: string,
  variacaoId: string | undefined,
  quantidade: number,
  fornecedorId?: string,
  loteId?: string,
  armazemId?: string,
  observacoes?: string
): MovimentacaoEstoque {
  const estoqueAtual = buscarEstoqueProduto(produtoId, variacaoId)
  const quantidadeAnterior = estoqueAtual?.quantidade ?? 0
  const quantidadeNova = quantidadeAnterior + quantidade
  
  return registrarMovimentacao({
    produtoId,
    variacaoId,
    tipo: "entrada",
    quantidade,
    quantidadeAnterior,
    quantidadeNova,
    fornecedorId,
    loteId,
    armazemDestinoId: armazemId,
    observacoes,
  })
}

// ==================== TRANSFERÊNCIA ENTRE ARMAZÉNS ====================

export function transferirEntreArmazens(
  produtoId: string,
  variacaoId: string | undefined,
  quantidade: number,
  armazemOrigemId: string,
  armazemDestinoId: string,
  observacoes?: string
): MovimentacaoEstoque {
  const estoqueOrigem = buscarEstoqueProduto(produtoId, variacaoId)
  if (!estoqueOrigem || estoqueOrigem.quantidade < quantidade) {
    throw new Error("Estoque insuficiente no armazém de origem")
  }
  
  const quantidadeAnterior = estoqueOrigem.quantidade
  const quantidadeNova = quantidadeAnterior - quantidade
  
  // Atualizar estoque origem
  atualizarEstoqueProduto(produtoId, variacaoId, quantidadeNova)
  
  // Atualizar estoque destino
  const estoqueDestino = buscarEstoqueProduto(produtoId, variacaoId)
  atualizarEstoqueProduto(produtoId, variacaoId, (estoqueDestino?.quantidade ?? 0) + quantidade)
  
  return registrarMovimentacao({
    produtoId,
    variacaoId,
    tipo: "transferencia",
    quantidade,
    quantidadeAnterior,
    quantidadeNova,
    armazemOrigemId,
    armazemDestinoId,
    observacoes,
  })
}
