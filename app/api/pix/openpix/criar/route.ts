import { NextRequest, NextResponse } from "next/server"
import { addPedido } from "@/lib/pedidos-server"
import type { Pedido } from "@/lib/gateway-store"

const OPENPIX_API = "https://api.openpix.com.br/api/openpix/v1"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      openpixAppId,
      campanhaId,
      campanhaTitulo,
      quantidade,
      valorUnitario,
      nomeComprador,
      telefoneComprador,
      emailComprador,
      cpfComprador,
      tempoExpiracaoMinutos = 15,
      numerosEscolhidos,
    } = body

    if (!openpixAppId || !valorUnitario || !quantidade || !nomeComprador || !emailComprador || !cpfComprador) {
      return NextResponse.json(
        { error: "Dados incompletos (openpixAppId, valorUnitario, quantidade, nome, email, cpf obrigatórios)" },
        { status: 400 }
      )
    }

    const id = `PED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const valorTotal = quantidade * valorUnitario
    const valorCentavos = Math.round(valorTotal * 100)
    const now = new Date()
    const expira = new Date(now.getTime() + (tempoExpiracaoMinutos || 15) * 60 * 1000)

    const taxID = (cpfComprador || "").replace(/\D/g, "")
    const phone = (telefoneComprador || "").replace(/\D/g, "").padStart(11, "0").substring(0, 11)

    const res = await fetch(`${OPENPIX_API}/charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: openpixAppId,
      },
      body: JSON.stringify({
        correlationID: id,
        value: valorCentavos,
        comment: `${campanhaTitulo || "Rifa"} - ${quantidade} cota(s)`,
        customer: {
          name: nomeComprador,
          email: emailComprador,
          phone: phone ? `+55${phone}` : undefined,
          taxID: taxID ? { taxID, type: "BR:CPF" } : undefined,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("OpenPix create charge error:", res.status, err)
      return NextResponse.json(
        { error: "Falha ao criar cobrança na OpenPix", detalhe: err },
        { status: 502 }
      )
    }

    const charge = await res.json()
    const brCode = charge.brCode ?? charge.charge?.brCode ?? charge.data?.brCode
    const chargeId = charge.identifier ?? charge.charge?.identifier ?? charge.id ?? charge.data?.identifier

    if (!brCode) {
      return NextResponse.json(
        { error: "OpenPix não retornou o brCode (QR Code PIX)" },
        { status: 502 }
      )
    }

    const pedido: Pedido = {
      id,
      campanhaId: campanhaId || "unknown",
      campanhaTitulo: campanhaTitulo || "Rifa",
      quantidade,
      valorUnitario,
      valorTotal,
      nomeComprador,
      telefoneComprador: telefoneComprador || "",
      emailComprador,
      cpfComprador,
      status: "pendente",
      pixCopiaECola: brCode,
      numerosEscolhidos: Array.isArray(numerosEscolhidos) && numerosEscolhidos.length > 0
        ? [...numerosEscolhidos].sort((a: number, b: number) => a - b)
        : [],
      criadoEm: now.toISOString(),
      expiraEm: expira.toISOString(),
      pagoEm: null,
      openpixChargeId: chargeId,
    }

    addPedido(pedido)

    return NextResponse.json({
      success: true,
      pedido,
      pixCopiaECola: brCode,
    })
  } catch (error) {
    console.error("Erro ao criar cobrança OpenPix:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
