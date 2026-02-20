"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { obterGatewayConfig, confirmarPagamento, expirarPedido, buscarPedido, receberPedidoConfirmado, type Pedido } from "@/lib/gateway-store"
import { formatarCPF, formatarValor } from "@/lib/formatadores"
import QRCode from "qrcode"

interface PagamentoPixProps {
  pedido: Pedido
  onVoltar: () => void
  onPago?: (pedido: Pedido) => void
}

function QRCodeCanvas({ data, size = 220 }: { data: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data) return
    QRCode.toCanvas(canvasRef.current, data, {
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch((err: Error) => {
      console.error("[v0] QRCode generation error:", err)
    })
  }, [data, size])

  return <canvas ref={canvasRef} className="rounded" style={{ width: size, height: size }} />
}

export default function PagamentoPix({ pedido, onVoltar, onPago }: PagamentoPixProps) {
  const [copiado, setCopiado] = useState(false)
  const [debugLoading, setDebugLoading] = useState(false)
  const [debugResult, setDebugResult] = useState<any>(null)
  const [status, setStatus] = useState<"pendente" | "processando" | "pago" | "expirado">(
    pedido.status === "pago" ? "pago" : pedido.status === "expirado" ? "expirado" : "pendente"
  )
  const [tempoRestante, setTempoRestante] = useState(0)
  const config = obterGatewayConfig()

  // Verificar se está usando chave de teste
  const isChaveTeste = !config.chavePix || config.chavePix === "teste@webyteplay.com"

  // Calculate remaining time
  useEffect(() => {
    const expiraMs = new Date(pedido.expiraEm).getTime()
    const calcRestante = () => Math.max(0, Math.floor((expiraMs - Date.now()) / 1000))
    setTempoRestante(calcRestante())

    if (status !== "pendente" && status !== "processando") return

    const timer = setInterval(() => {
      const rest = calcRestante()
      setTempoRestante(rest)
      if (rest <= 0) {
        setStatus("expirado")
        expirarPedido(pedido.id)
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [pedido.expiraEm, pedido.id, status])

  // Poll: verificação automática da baixa do PIX (OpenPix, API servidor, localStorage)
  useEffect(() => {
    if (status === "pago" || status === "expirado") return
    const pedidoOpenPix = pedido as Pedido & { openpixChargeId?: string }
    const isOpenPix = !!pedidoOpenPix?.openpixChargeId
    const appId = config.gatewayAtivo === "openpix" ? config.openpixAppId : null

    const poll = setInterval(async () => {
      try {
        // OpenPix: consulta direta na API para detecção automática imediata
        if (isOpenPix && appId) {
          const resVer = await fetch(
            `/api/pix/openpix/verificar?pedidoId=${encodeURIComponent(pedido.id)}&appId=${encodeURIComponent(appId)}`
          )
          if (resVer.ok) {
            const data = await resVer.json()
            if (data.status === "pago" && data.pedido) {
              const local = receberPedidoConfirmado(data.pedido)
              setStatus("pago")
              onPago?.(local ?? data.pedido)
              return
            }
          }
        }

        // Fallback: API pedidos (webhook já confirmou no servidor)
        const res = await fetch(`/api/pedidos/${encodeURIComponent(pedido.id)}`)
        if (res.ok) {
          const p: Pedido = await res.json()
          if (p.status === "pago") {
            const local = receberPedidoConfirmado(p)
            setStatus("pago")
            onPago?.(local ?? p)
            return
          }
        }
      } catch {
        // Fallback: checar apenas localStorage (ex.: confirmação manual no admin)
      }
      const p = buscarPedido(pedido.id)
      if (p?.status === "pago") {
        setStatus("pago")
        onPago?.(p)
      }
    }, isOpenPix ? 2000 : 3000) // OpenPix: poll mais rápido para detecção imediata
    return () => clearInterval(poll)
  }, [pedido.id, status, onPago, config.gatewayAtivo, config.openpixAppId])

  const formatarTempo = useCallback(() => {
    const min = Math.floor(tempoRestante / 60)
    const sec = tempoRestante % 60
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }, [tempoRestante])

  const copiarChavePix = () => {
    navigator.clipboard.writeText(pedido.pixCopiaECola).catch(() => {})
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  const handleDebugPix = async () => {
    setDebugResult(null)
    setDebugLoading(true)
    try {
      const res = await fetch('/api/pix/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido }),
      })
      const json = await res.json()
      setDebugResult(json)
    } catch (error) {
      setDebugResult({ error: String(error) })
    } finally {
      setDebugLoading(false)
    }
  }

  const handleConfirmarManual = () => {
    // "Ja fiz o pagamento" moves to "processando" and waits for real confirmation.
    // In test mode with baixaAutomatica, it auto-confirms after the configured delay.
    // In production, this would trigger a webhook from the payment gateway.
    setStatus("processando")

    if (config.baixaAutomatica && config.ativo) {
      // Simular webhook automático após o tempo configurado
      setTimeout(async () => {
        try {
          const response = await fetch('/api/pix/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              event: 'payment.confirmed',
              txid: pedido.id,
              status: 'paid',
              amount: pedido.valorTotal,
            }),
          })

          if (response.ok) {
            const result = await response.json()
            console.log('Webhook simulado com sucesso:', result)
            // O polling vai detectar a mudança
          } else {
            console.error('Erro no webhook simulado')
            // Fallback para confirmação direta
            const updated = confirmarPagamento(pedido.id)
            if (updated) {
              setStatus("pago")
              onPago?.(updated)
            }
          }
        } catch (error) {
          console.error('Erro ao chamar webhook:', error)
          // Fallback para confirmação direta
          const updated = confirmarPagamento(pedido.id)
          if (updated) {
            setStatus("pago")
            onPago?.(updated)
          }
        }
      }, config.tempoSimulacaoBaixaSegundos * 1000)
    } else {
      // Em produção, aguardar webhook real do gateway
      console.log('Aguardando webhook real do gateway de pagamento')
    }
  }

  return (
    <Card className="bg-black/40 border-[#FFB800]/20">
      <CardContent className="p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onVoltar} className="text-gray-300 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <Badge
            className={
              status === "pago"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : status === "expirado"
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : status === "processando"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }
          >
            {status === "pago" && <CheckCircle className="h-3 w-3 mr-1" />}
            {status === "expirado" && <AlertTriangle className="h-3 w-3 mr-1" />}
            {status === "processando" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            {status === "pendente" && <Clock className="h-3 w-3 mr-1" />}
            {status === "pago"
              ? "Pagamento Confirmado"
              : status === "expirado"
                ? "QR Code Expirado"
                : status === "processando"
                  ? "Verificando Pagamento..."
                  : "Aguardando Pagamento"}
          </Badge>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-1">Pagamento via PIX</h2>
          <p className="text-gray-400 text-sm">
            {status === "pago"
              ? "Seu pagamento foi confirmado com sucesso!"
              : status === "processando"
                ? "Estamos verificando seu pagamento. Aguarde..."
                : "Escaneie o QR Code ou copie o codigo PIX para pagar"}
          </p>
          {isChaveTeste && status === "pendente" && (
            <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-xs">
                ⚠️ Usando chave PIX de teste. Configure uma chave válida no painel admin para pagamentos reais.
              </p>
            </div>
          )}
        </div>

        {/* Success State */}
        {status === "pago" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center space-y-3">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            <h3 className="text-white font-bold text-lg">Pagamento Confirmado!</h3>
            <p className="text-gray-300 text-sm">
              {pedido.quantidade} cota{pedido.quantidade > 1 ? "s" : ""} adquirida{pedido.quantidade > 1 ? "s" : ""} com sucesso.
              Seus numeros foram gerados automaticamente.
            </p>
            <div className="bg-black/30 rounded p-3 text-left space-y-1 text-sm">
              <p className="text-gray-400">Pedido: <span className="text-white font-mono">{pedido.id}</span></p>
              <p className="text-gray-400">Valor: <span className="text-green-400 font-bold">{formatarValor(pedido.valorTotal)}</span></p>
              <p className="text-gray-400">CPF: <span className="text-white font-mono">{formatarCPF(pedido.cpfComprador || "")}</span></p>
              {pedido.numerosEscolhidos && pedido.numerosEscolhidos.length > 0 && (
                <div className="text-gray-400">
                  Numeros:{" "}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pedido.numerosEscolhidos.slice(0, 20).map((n) => (
                      <span key={n} className="bg-[#FFB800]/20 text-[#FFB800] px-2 py-0.5 rounded text-xs font-mono">
                        {n.toString().padStart(5, "0")}
                      </span>
                    ))}
                    {pedido.numerosEscolhidos.length > 20 && (
                      <span className="text-gray-500 text-xs">+{pedido.numerosEscolhidos.length - 20} mais</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <p className="text-gray-500 text-xs">
              Consulte suas cotas usando seu CPF ou telefone na pagina "Minhas Cotas"
            </p>
            <Button onClick={onVoltar} className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium mt-2">
              Voltar para a Campanha
            </Button>
          </div>
        )}

        {/* Processing State */}
        {status === "processando" && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-center space-y-3">
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto" />
            <h3 className="text-white font-bold text-lg">Verificando Pagamento</h3>
            <p className="text-gray-300 text-sm">
              Estamos aguardando a confirmacao do seu pagamento pelo banco. Isso pode levar alguns instantes.
            </p>
            <div className="bg-black/30 rounded p-3 text-sm">
              <p className="text-gray-400">Pedido: <span className="text-white font-mono">{pedido.id}</span></p>
              <p className="text-gray-400">Valor: <span className="text-white font-bold">{formatarValor(pedido.valorTotal)}</span></p>
            </div>
          </div>
        )}

        {/* QR Code and Payment - only visible when pending */}
        {status === "pendente" && (
          <>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-3 rounded-lg">
                <QRCodeCanvas data={pedido.pixCopiaECola} size={220} />
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center text-[#FFB800]">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="font-mono">Expira em: {formatarTempo()}</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {formatarValor(pedido.valorTotal)}
                </p>
                <p className="text-gray-500 text-xs font-mono">{pedido.id}</p>
              </div>
            </div>

            {/* PIX Copia e Cola */}
            <div className="space-y-2">
              <Label className="text-white text-sm">PIX Copia e Cola</Label>
              <div className="flex">
                <Input
                  value={pedido.pixCopiaECola}
                  readOnly
                  className="rounded-r-none bg-black/30 border-[#FFB800]/30 text-white text-xs font-mono"
                />
                <Button
                  onClick={copiarChavePix}
                  className={`rounded-l-none shrink-0 ${
                    copiado
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-[#FFB800] hover:bg-[#FFA500] text-black"
                  }`}
                >
                  {copiado ? <CheckCircle className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copiado ? "Copiado" : "Copiar"}
                </Button>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Button onClick={handleDebugPix} className="text-xs" disabled={debugLoading}>
                  {debugLoading ? 'Debugando...' : 'Debug PIX'}
                </Button>
                {debugResult && (
                  <div className="flex-1 bg-black/20 text-xs rounded p-2 font-mono text-white overflow-auto max-h-40">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(debugResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirmarManual}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Ja fiz o pagamento
            </Button>

            {/* Info box */}
            <div className="bg-black/30 rounded-lg p-4 space-y-2 border border-gray-800">
              <h3 className="font-bold text-white text-sm">Como pagar com PIX:</h3>
              <ol className="text-gray-400 text-xs space-y-1.5 list-decimal list-inside">
                <li>Abra o aplicativo do seu banco</li>
                <li>Escolha pagar via PIX (QR Code ou Copia e Cola)</li>
                <li>Escaneie o QR Code acima ou cole o codigo copiado</li>
                <li>Confirme o valor e finalize o pagamento</li>
                <li>Clique em "Ja fiz o pagamento" e aguarde a confirmacao</li>
              </ol>
            </div>
          </>
        )}

        {/* Expired State */}
        {status === "expirado" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center space-y-3">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
            <h3 className="text-white font-bold text-lg">QR Code Expirado</h3>
            <p className="text-gray-300 text-sm">
              O tempo para pagamento expirou. Por favor, gere um novo pedido.
            </p>
            <Button onClick={onVoltar} className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium mt-2">
              Voltar e Gerar Novo Pedido
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
