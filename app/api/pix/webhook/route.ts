import { NextRequest, NextResponse } from 'next/server'
import { confirmarPagamentoServer } from '@/lib/pedidos-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log do webhook para debug
    console.log('Webhook PIX recebido:', body?.event || body?.status || 'unknown')

    let txid: string | undefined

    // OpenPix: evento CHARGE_COMPLETED (detecção automática real)
    if (body?.event === 'OPENPIX:CHARGE_COMPLETED' && body?.charge?.correlationID) {
      txid = body.charge.correlationID
    }
    // Formato genérico ou simulado (Gateway Dinâmico - "Já fiz o pagamento")
    else if (body?.event === 'payment.confirmed' || body?.status === 'paid') {
      txid = body?.txid ?? body?.transaction_id ?? body?.id ?? body?.pedidoId ?? body?.charge?.correlationID
    }

    if (!txid) {
      return NextResponse.json({ message: 'Webhook processed' })
    }

    // Confirmar o pagamento no store do servidor (baixa automática)
    const pedido = confirmarPagamentoServer(String(txid))

    if (pedido) {
      console.log('Pagamento confirmado (baixa automática):', pedido.id)
      return NextResponse.json({ success: true, pedido: pedido.id })
    }

    console.warn('Pedido não encontrado para correlationID/txid:', txid)
    return NextResponse.json({ error: 'Pedido not found' }, { status: 404 })
  } catch (error) {
    console.error('Erro no webhook PIX:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}