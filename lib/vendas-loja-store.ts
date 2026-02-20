// Dados de vendas da Loja Virtual (giros, caixas, produtos)
// Agrega pedidos com tipoEspecial roleta/box e futuros pedidos de produtos

import { listarPedidos, type Pedido } from "@/lib/gateway-store"
import { listarProdutos } from "@/lib/loja-store"

type PedidoComTipo = Pedido & { tipoEspecial?: "roleta" | "box"; quantidadeEspecial?: number }

export function listarVendasLoja(): PedidoComTipo[] {
  return listarPedidos().filter(
    (p) =>
      (p as PedidoComTipo).tipoEspecial === "roleta" ||
      (p as PedidoComTipo).tipoEspecial === "box" ||
      (p as PedidoComTipo).tipoEspecial === "produto_loja"
  ) as PedidoComTipo[]
}

export function listarVendasLojaPagas(): PedidoComTipo[] {
  return listarVendasLoja().filter((p) => p.status === "pago")
}

export function faturamentoLoja(): number {
  return listarVendasLojaPagas().reduce((sum, p) => sum + p.valorTotal, 0)
}

export function totalVendasLoja(): number {
  return listarVendasLojaPagas().length
}

export function vendasPorPeriodo(dias: number): { total: number; valor: number } {
  const corte = new Date()
  corte.setDate(corte.getDate() - dias)
  const vendas = listarVendasLojaPagas().filter((p) => new Date(p.pagoEm || p.criadoEm) >= corte)
  return {
    total: vendas.length,
    valor: vendas.reduce((s, p) => s + p.valorTotal, 0),
  }
}
