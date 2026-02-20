import { NextRequest, NextResponse } from "next/server"
import { addLink, listarTodos } from "@/lib/links-pagamento-server"

export async function GET() {
  try {
    const links = listarTodos()
    return NextResponse.json(links)
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { valor, descricao } = body
    if (!valor || valor <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 })
    }
    const id = `LNK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const link = {
      id,
      valor: Number(valor),
      descricao: descricao || "Pagamento",
      criadoEm: new Date().toISOString(),
      status: "ativo" as const,
    }
    addLink(link)
    return NextResponse.json({ success: true, link })
  } catch (error) {
    console.error("Erro ao criar link:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
