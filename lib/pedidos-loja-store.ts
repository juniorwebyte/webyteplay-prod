// Store para gestão completa de pedidos da Loja Virtual
// Extende o sistema de pedidos existente com funcionalidades específicas de e-commerce

import { listarPedidos, type Pedido } from "./gateway-store"

export type StatusPedidoLoja =
  | "pendente"
  | "pago"
  | "cancelado"
  | "reembolsado"
  | "separacao"
  | "enviado"
  | "entregue"
  | "disputa"

export interface PedidoLoja extends Pedido {
  statusLoja?: StatusPedidoLoja
  tipoPedido: "loja_virtual" | "rifa" | "outro"
  itens?: Array<{
    produtoId: string
    nome: string
    quantidade: number
    valorUnitario: number
    sku?: string
  }>
  enderecoEntrega?: {
    cep: string
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
  }
  metodoEnvio?: string
  codigoRastreamento?: string
  notaFiscal?: {
    numero?: string
    serie?: string
    chaveAcesso?: string
    emitidaEm?: string
  }
  reembolso?: {
    valor: number
    motivo: string
    solicitadoEm: string
    processadoEm?: string
    status: "pendente" | "processado" | "negado"
  }
  troca?: {
    motivo: string
    solicitadoEm: string
    status: "pendente" | "aprovado" | "negado" | "concluido"
    produtosTroca?: Array<{ produtoId: string; quantidade: number }>
  }
  devolucao?: {
    motivo: string
    solicitadoEm: string
    status: "pendente" | "aprovado" | "negado" | "concluido"
  }
  disputa?: {
    motivo: string
    abertaEm: string
    status: "aberta" | "resolvida" | "fechada"
    resolucao?: string
  }
  historicoAlteracoes?: Array<{
    data: string
    usuario: string
    acao: string
    detalhes?: string
  }>
}

const PEDIDOS_LOJA_KEY = "loja-pedidos-extras"

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
  window.dispatchEvent(new Event("pedidos-loja-updated"))
}

interface PedidosExtras {
  [pedidoId: string]: Omit<PedidoLoja, keyof Pedido>
}

function getPedidosExtras(): PedidosExtras {
  return getStorage<PedidosExtras>(PEDIDOS_LOJA_KEY, {})
}

function salvarPedidoExtra(pedidoId: string, extra: Partial<Omit<PedidoLoja, keyof Pedido>>): void {
  const extras = getPedidosExtras()
  extras[pedidoId] = { ...extras[pedidoId], ...extra }
  setStorage(PEDIDOS_LOJA_KEY, extras)
}

function adicionarHistorico(pedidoId: string, usuario: string, acao: string, detalhes?: string): void {
  const extras = getPedidosExtras()
  if (!extras[pedidoId]) extras[pedidoId] = {} as any
  if (!extras[pedidoId].historicoAlteracoes) extras[pedidoId].historicoAlteracoes = []
  extras[pedidoId].historicoAlteracoes!.push({
    data: new Date().toISOString(),
    usuario,
    acao,
    detalhes,
  })
  setStorage(PEDIDOS_LOJA_KEY, extras)
}

export function listarPedidosLoja(filtros?: {
  status?: StatusPedidoLoja
  tipoPedido?: "loja_virtual" | "rifa" | "outro"
  dataInicio?: string
  dataFim?: string
}): PedidoLoja[] {
  const pedidos = listarPedidos()
  const extras = getPedidosExtras()
  
  let pedidosLoja: PedidoLoja[] = pedidos.map((p) => {
    const extra = extras[p.id] || {}
    const tipoPedido: "loja_virtual" | "rifa" | "outro" =
      (p as any).tipoEspecial === "produto_loja" ? "loja_virtual" : p.campanhaId !== "loja-virtual" ? "rifa" : "outro"
    
    return {
      ...p,
      ...extra,
      tipoPedido,
      statusLoja: extra.statusLoja || (p.status === "pago" ? "pago" : p.status === "expirado" ? "cancelado" : "pendente"),
    } as PedidoLoja
  })
  
  if (filtros) {
    if (filtros.status) {
      pedidosLoja = pedidosLoja.filter((p) => p.statusLoja === filtros.status)
    }
    if (filtros.tipoPedido) {
      pedidosLoja = pedidosLoja.filter((p) => p.tipoPedido === filtros.tipoPedido)
    }
    if (filtros.dataInicio) {
      pedidosLoja = pedidosLoja.filter((p) => p.criadoEm >= filtros.dataInicio!)
    }
    if (filtros.dataFim) {
      pedidosLoja = pedidosLoja.filter((p) => p.criadoEm <= filtros.dataFim!)
    }
  }
  
  return pedidosLoja.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}

export function buscarPedidoLoja(pedidoId: string): PedidoLoja | undefined {
  const pedidos = listarPedidosLoja()
  return pedidos.find((p) => p.id === pedidoId)
}

/** Atualiza dados extras do pedido (endereço, frete, cupom, etc.) */
export function atualizarPedidoLoja(
  pedidoId: string,
  extra: Partial<Omit<PedidoLoja, keyof Pedido>>
): void {
  salvarPedidoExtra(pedidoId, extra)
}

export function atualizarStatusPedido(
  pedidoId: string,
  novoStatus: StatusPedidoLoja,
  usuario: string,
  detalhes?: string
): PedidoLoja | undefined {
  const pedido = buscarPedidoLoja(pedidoId)
  if (!pedido) return undefined
  
  salvarPedidoExtra(pedidoId, { statusLoja: novoStatus })
  adicionarHistorico(pedidoId, usuario, `Status alterado para: ${novoStatus}`, detalhes)
  
  return buscarPedidoLoja(pedidoId)
}

export function criarPedidoManual(dados: {
  nomeComprador: string
  emailComprador: string
  telefoneComprador: string
  cpfComprador: string
  itens: Array<{ produtoId: string; nome: string; quantidade: number; valorUnitario: number; sku?: string }>
  enderecoEntrega?: PedidoLoja["enderecoEntrega"]
  observacoes?: string
}): PedidoLoja {
  const { criarPedido } = require("./gateway-store")
  
  const valorTotal = dados.itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0)
  const quantidadeTotal = dados.itens.reduce((s, i) => s + i.quantidade, 0)
  
  const pedido = criarPedido({
    campanhaId: "loja-virtual",
    campanhaTitulo: `Loja Virtual - ${dados.itens.map((i) => i.nome).join(", ")}`,
    quantidade: quantidadeTotal,
    valorUnitario: valorTotal / quantidadeTotal,
    nomeComprador: dados.nomeComprador,
    emailComprador: dados.emailComprador,
    telefoneComprador: dados.telefoneComprador,
    cpfComprador: dados.cpfComprador,
    tipoEspecial: "produto_loja",
  })
  
  salvarPedidoExtra(pedido.id, {
    tipoPedido: "loja_virtual",
    statusLoja: "pendente",
    itens: dados.itens,
    enderecoEntrega: dados.enderecoEntrega,
  })
  
  adicionarHistorico(pedido.id, "Sistema", "Pedido criado manualmente", dados.observacoes)
  
  return buscarPedidoLoja(pedido.id)!
}

export function solicitarReembolso(
  pedidoId: string,
  valor: number,
  motivo: string,
  usuario: string
): PedidoLoja | undefined {
  const pedido = buscarPedidoLoja(pedidoId)
  if (!pedido) return undefined
  
  salvarPedidoExtra(pedidoId, {
    reembolso: {
      valor,
      motivo,
      solicitadoEm: new Date().toISOString(),
      status: "pendente",
    },
    statusLoja: "reembolsado",
  })
  
  adicionarHistorico(pedidoId, usuario, "Reembolso solicitado", `Valor: R$ ${valor.toFixed(2)}, Motivo: ${motivo}`)
  
  return buscarPedidoLoja(pedidoId)
}

export function processarReembolso(
  pedidoId: string,
  aprovado: boolean,
  usuario: string,
  observacoes?: string
): PedidoLoja | undefined {
  const pedido = buscarPedidoLoja(pedidoId)
  if (!pedido || !pedido.reembolso) return undefined
  
  salvarPedidoExtra(pedidoId, {
    reembolso: {
      ...pedido.reembolso,
      status: aprovado ? "processado" : "negado",
      processadoEm: new Date().toISOString(),
    },
  })
  
  adicionarHistorico(
    pedidoId,
    usuario,
    aprovado ? "Reembolso aprovado" : "Reembolso negado",
    observacoes
  )
  
  return buscarPedidoLoja(pedidoId)
}

export function solicitarTroca(
  pedidoId: string,
  motivo: string,
  produtosTroca: Array<{ produtoId: string; quantidade: number }>,
  usuario: string
): PedidoLoja | undefined {
  const pedido = buscarPedidoLoja(pedidoId)
  if (!pedido) return undefined
  
  salvarPedidoExtra(pedidoId, {
    troca: {
      motivo,
      solicitadoEm: new Date().toISOString(),
      status: "pendente",
      produtosTroca,
    },
  })
  
  adicionarHistorico(pedidoId, usuario, "Troca solicitada", motivo)
  
  return buscarPedidoLoja(pedidoId)
}

export function solicitarDevolucao(
  pedidoId: string,
  motivo: string,
  usuario: string
): PedidoLoja | undefined {
  const pedido = buscarPedidoLoja(pedidoId)
  if (!pedido) return undefined
  
  salvarPedidoExtra(pedidoId, {
    devolucao: {
      motivo,
      solicitadoEm: new Date().toISOString(),
      status: "pendente",
    },
  })
  
  adicionarHistorico(pedidoId, usuario, "Devolução solicitada", motivo)
  
  return buscarPedidoLoja(pedidoId)
}

export function abrirDisputa(
  pedidoId: string,
  motivo: string,
  usuario: string
): PedidoLoja | undefined {
  const pedido = buscarPedidoLoja(pedidoId)
  if (!pedido) return undefined
  
  salvarPedidoExtra(pedidoId, {
    disputa: {
      motivo,
      abertaEm: new Date().toISOString(),
      status: "aberta",
    },
    statusLoja: "disputa",
  })
  
  adicionarHistorico(pedidoId, usuario, "Disputa aberta", motivo)
  
  return buscarPedidoLoja(pedidoId)
}

export function atualizarNotaFiscal(
  pedidoId: string,
  notaFiscal: PedidoLoja["notaFiscal"],
  usuario: string
): PedidoLoja | undefined {
  const pedido = buscarPedidoLoja(pedidoId)
  if (!pedido) return undefined
  
  salvarPedidoExtra(pedidoId, {
    notaFiscal: {
      ...notaFiscal,
      emitidaEm: notaFiscal?.emitidaEm || new Date().toISOString(),
    },
  })
  
  adicionarHistorico(pedidoId, usuario, "Nota fiscal atualizada", `Número: ${notaFiscal?.numero || "N/A"}`)
  
  return buscarPedidoLoja(pedidoId)
}

export function atualizarRastreamento(
  pedidoId: string,
  codigoRastreamento: string,
  metodoEnvio: string,
  usuario: string
): PedidoLoja | undefined {
  const pedido = buscarPedidoLoja(pedidoId)
  if (!pedido) return undefined
  
  salvarPedidoExtra(pedidoId, {
    codigoRastreamento,
    metodoEnvio,
    statusLoja: "enviado",
  })
  
  adicionarHistorico(pedidoId, usuario, "Código de rastreamento adicionado", codigoRastreamento)
  
  return buscarPedidoLoja(pedidoId)
}
