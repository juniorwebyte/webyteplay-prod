import { NextResponse } from 'next/server'
import { buscarPedido } from '@/lib/gateway-store'

// GET: tenta recuperar um pedido no armazenamento (server-side). Geralmente retornará 404
// porque pedidos são mantidos no localStorage do navegador.
// POST: aceita um objeto JSON { pedido } enviado pelo client (localStorage) e retorna o pix.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pedidoId = searchParams.get('pedidoId')

    if (!pedidoId) {
      return NextResponse.json({ error: 'pedidoId is required' }, { status: 400 })
    }

    const pedido = buscarPedido(pedidoId)
    if (!pedido) {
      // Explicar limitação: pedidos residem em localStorage do navegador
      return NextResponse.json({
        error: 'Pedido not found on server. Note: pedidos are stored in browser localStorage. To debug, POST the pedido object from the browser to this endpoint.'
      }, { status: 404 })
    }

    return NextResponse.json({
      pedidoId: pedido.id,
      pixCopiaECola: (pedido as any).pixCopiaECola || null,
      pixValido: (pedido as any).pixCopiaECola ? true : false,
    })
  } catch (error) {
    console.error('API /api/pix/debug GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || !body.pedido) {
      return NextResponse.json({ error: 'pedido object required in body' }, { status: 400 })
    }

    const pedido = body.pedido

    // If pixCopiaECola present, return it; otherwise attempt to construct minimal response
    const pix = pedido.pixCopiaECola || null

    return NextResponse.json({
      pedidoId: pedido.id || null,
      pixCopiaECola: pix,
      pixValido: pix ? true : false,
      note: 'POST used: client-sent pedido (use this from browser where localStorage is available)'
    })
  } catch (error) {
    console.error('API /api/pix/debug POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
