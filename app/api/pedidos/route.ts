import { NextRequest, NextResponse } from "next/server"
import { addPedido } from "@/lib/pedidos-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "Pedido inválido (id e status obrigatórios)" }, { status: 400 })
    }
    addPedido(body)
    return NextResponse.json({ success: true, id: body.id })
  } catch (error) {
    console.error("Erro ao sincronizar pedido:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
