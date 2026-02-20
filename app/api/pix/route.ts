import { NextRequest, NextResponse } from "next/server"

// POST /api/pix - Gerar cobranca PIX
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { chaveApi, pedidoId, valor, descricao } = body

    if (!chaveApi || !pedidoId || !valor) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Gerar payload PIX EMV
    const pixPayload = gerarPixPayload({ chaveApi, pedidoId, valor, descricao: descricao || "" })

    return NextResponse.json({
      sucesso: true,
      pedidoId,
      pixCopiaECola: pixPayload,
      valor,
      status: "pendente",
      criadoEm: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}

function gerarPixPayload(dados: {
  chaveApi: string
  pedidoId: string
  valor: number
  descricao: string
}): string {
  const chave = dados.chaveApi
  const valor = dados.valor.toFixed(2)
  const txid = dados.pedidoId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 25)
  const nome = "WebytePlay Rifas"
  const cidade = "SAO PAULO"

  function tlv(id: string, value: string): string {
    const len = value.length.toString().padStart(2, "0")
    return `${id}${len}${value}`
  }

  const gui = tlv("00", "br.gov.bcb.pix")
  const chaveTag = tlv("01", chave)
  const descTag = dados.descricao.length > 0 ? tlv("02", dados.descricao.substring(0, 72)) : ""
  const merchantAccount = tlv("26", gui + chaveTag + descTag)

  const mcc = tlv("52", "0000")
  const moeda = tlv("53", "986")
  const valorTag = tlv("54", valor)
  const pais = tlv("58", "BR")
  const nomeTag = tlv("59", nome)
  const cidadeTag = tlv("60", cidade)
  const txidTag = tlv("05", txid)
  const addData = tlv("62", txidTag)

  const payloadSemCRC =
    tlv("00", "01") +
    merchantAccount +
    mcc +
    moeda +
    valorTag +
    pais +
    nomeTag +
    cidadeTag +
    addData +
    "6304"

  const crc = crc16CCITT(payloadSemCRC)
  return payloadSemCRC + crc
}

function crc16CCITT(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc = crc << 1
      }
    }
    crc &= 0xffff
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}
