import { NextRequest, NextResponse } from "next/server"
import { getPedido } from "@/lib/pedidos-server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pedido = getPedido(id)
    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }
    return NextResponse.json(pedido)
  } catch (error) {
    console.error("Erro ao buscar pedido:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
