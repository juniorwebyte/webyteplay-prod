import { NextRequest, NextResponse } from "next/server"
import { getPedido, confirmarPagamentoServer } from "@/lib/pedidos-server"

const OPENPIX_API = "https://api.openpix.com.br/api/openpix/v1"

/** GET /api/pix/openpix/verificar?pedidoId=xxx&appId=yyy
 * Consulta o status da cobrança na OpenPix e confirma automaticamente se pago */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pedidoId = searchParams.get("pedidoId")
    const appId = searchParams.get("appId")

    if (!pedidoId || !appId) {
      return NextResponse.json(
        { error: "pedidoId e appId são obrigatórios" },
        { status: 400 }
      )
    }

    const pedido = getPedido(pedidoId)
    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }
    if (pedido.status === "pago") {
      return NextResponse.json({ status: "pago", pedido })
    }

    const chargeId = (pedido as { openpixChargeId?: string }).openpixChargeId
    if (!chargeId) {
      return NextResponse.json({ status: pedido.status, pedido })
    }

    const res = await fetch(`${OPENPIX_API}/charge/${chargeId}`, {
      headers: { Authorization: appId },
    })

    if (!res.ok) {
      return NextResponse.json({ status: pedido.status, pedido })
    }

    const data = await res.json()
    const charge = data.charge || data
    const statusCharge = (charge.status || "").toUpperCase()

    if (statusCharge === "COMPLETED") {
      const confirmado = confirmarPagamentoServer(pedidoId)
      return NextResponse.json({ status: "pago", pedido: confirmado })
    }

    return NextResponse.json({ status: pedido.status, pedido })
  } catch (error) {
    console.error("Erro ao verificar cobrança OpenPix:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
