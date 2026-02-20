// Store de pedidos no servidor (memória) para o webhook PIX dar baixa
// Usado apenas por API routes; o cliente sincroniza ao criar e ao receber confirmação

import type { Pedido } from "./gateway-store"

const store = new Map<string, Pedido>()

function gerarNumeros(quantidade: number, maxNumero: number): number[] {
  const numeros = new Set<number>()
  const max = Math.min(maxNumero, 99999)
  while (numeros.size < quantidade && numeros.size < max) {
    numeros.add(Math.floor(Math.random() * max) + 1)
  }
  return Array.from(numeros).sort((a, b) => a - b)
}

export function addPedido(pedido: Pedido): void {
  store.set(pedido.id, { ...pedido })
}

export function getPedido(id: string): Pedido | undefined {
  return store.get(id)
}

export function getPedidoByTxId(txid: string): Pedido | undefined {
  // txid pode ser o id do pedido (ex: PED-xxx) ou transaction_id do gateway
  const byId = store.get(txid)
  if (byId) return byId
  for (const p of store.values()) {
    if (p.id.replace(/[^a-zA-Z0-9]/g, "").includes(txid.replace(/[^a-zA-Z0-9]/g, "")))
      return p
  }
  return undefined
}

export function confirmarPagamentoServer(txid: string): Pedido | undefined {
  const pedido = getPedidoByTxId(txid)
  if (!pedido || pedido.status === "pago") return pedido

  const numeros =
    pedido.numerosEscolhidos && pedido.numerosEscolhidos.length >= pedido.quantidade
      ? pedido.numerosEscolhidos.slice(0, pedido.quantidade)
      : gerarNumeros(pedido.quantidade, 99999)
  const atualizado: Pedido = {
    ...pedido,
    status: "pago",
    pagoEm: new Date().toISOString(),
    numerosEscolhidos: numeros,
  }
  store.set(pedido.id, atualizado)
  return atualizado
}

export function listarPedidosServer(): Pedido[] {
  return Array.from(store.values())
}
