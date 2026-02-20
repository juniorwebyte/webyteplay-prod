import { NextRequest, NextResponse } from "next/server"
import { getLink, markLinkPaid } from "@/lib/links-pagamento-server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const link = getLink(id)
    if (!link) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 })
    }
    return NextResponse.json(link)
  } catch (error) {
    console.error("Erro ao buscar link:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { pedidoId, pagador } = body
    if (!pedidoId) {
      return NextResponse.json({ error: "pedidoId obrigatório" }, { status: 400 })
    }
    const link = getLink(id)
    if (!link) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 })
    }
    markLinkPaid(id, pedidoId, pagador)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar link:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
