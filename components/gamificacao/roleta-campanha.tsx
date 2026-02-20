"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCw, Ticket } from "lucide-react"
import confetti from "canvas-confetti"
import type { Campanha } from "@/lib/campanhas-store"
import { listarPedidos, criarPedido, buscarClientePorCpf, type Pedido } from "@/lib/gateway-store"
import { cotasJaAtribuidas, registrarCotaGanha } from "@/lib/cotas-premiadas-roleta-box-store"
import PagamentoPix from "@/components/pagamento-pix"
import { formatarValor } from "@/lib/formatadores"

const PREMIOS_PADRAO = [
  { id: 1, nome: "1 Número Grátis", cor: "#00ff00", probabilidade: 30, icone: "🎫", daCotaParaSorteio: true },
  { id: 2, nome: "5% Cashback", cor: "#9c27b0", probabilidade: 20, icone: "💰" },
  { id: 3, nome: "10 Pontos VIP", cor: "#0088fe", probabilidade: 15, icone: "⭐" },
  { id: 4, nome: "Caixa Misteriosa", cor: "#ffbb28", probabilidade: 10, icone: "📦" },
  { id: 5, nome: "50% Desconto", cor: "#ff8042", probabilidade: 5, icone: "🏷️" },
  { id: 6, nome: "Sem Prêmio", cor: "#8884d8", probabilidade: 20, icone: "❌" },
]

interface RoletaCampanhaProps {
  campanha: Campanha
}

export default function RoletaCampanha({ campanha }: RoletaCampanhaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedPrize, setSelectedPrize] = useState<(typeof PREMIOS_PADRAO)[0] & { cotaGanha?: number } | null>(null)
  const [usuarioCpf, setUsuarioCpf] = useState<string | null>(null)
  const [usuarioNome, setUsuarioNome] = useState<string>("")
  const [usuarioTelefone, setUsuarioTelefone] = useState<string>("")
  const [usuarioEmail, setUsuarioEmail] = useState<string>("")
  const [jaUsouGiroGratis, setJaUsouGiroGratis] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [pedidoAtual, setPedidoAtual] = useState<Pedido | null>(null)
  const [quantidadeGirosPendente, setQuantidadeGirosPendente] = useState(0)
  const [girosPagosPendentes, setGirosPagosPendentes] = useState<number[]>([])
  const router = useRouter()

  const valorGiro = campanha.roletaValorGiro ?? 5
  const pacotes = campanha.roletasConfig?.[0]?.pacotes || []
  const premios = campanha.roletasConfig?.[0]?.premios?.length
    ? campanha.roletasConfig[0].premios.map((p, i) => ({
        id: i + 1,
        nome: p.nome,
        cor: ["#00ff00", "#9c27b0", "#0088fe", "#ffbb28", "#ff8042", "#8884d8"][i % 6],
        probabilidade: p.probabilidade,
        icone: p.icone || "🎁",
        daCotaParaSorteio: p.daCotaParaSorteio,
      }))
    : PREMIOS_PADRAO

  const carregarUsuario = () => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (!raw) {
        setUsuarioCpf(null)
        return
      }
      const parsed = JSON.parse(raw) as { cpf?: string | null; nome?: string; telefone?: string; celular?: string; email?: string; isLoggedIn?: boolean }
      const cpfLimpo = parsed?.cpf ? parsed.cpf.replace(/\D/g, "") : ""
      if (!parsed?.isLoggedIn || cpfLimpo.length !== 11) {
        setUsuarioCpf(null)
        return
      }
      setUsuarioCpf(cpfLimpo)
      const cliente = buscarClientePorCpf(cpfLimpo)
      setUsuarioNome(parsed.nome || cliente?.nome || "")
      setUsuarioTelefone(parsed.telefone || parsed.celular || cliente?.telefone || "")
      setUsuarioEmail(parsed.email || cliente?.email || "")
      const usadosRaw = localStorage.getItem(`roleta-giro-gratis-${campanha.id}`)
      const usados: string[] = usadosRaw ? JSON.parse(usadosRaw) : []
      setJaUsouGiroGratis(usados.includes(cpfLimpo))
    } catch {
      setUsuarioCpf(null)
    }
  }

  useEffect(() => {
    carregarUsuario()
  }, [campanha.id])

  useEffect(() => {
    const h = () => carregarUsuario()
    window.addEventListener("user-login", h)
    window.addEventListener("storage", h)
    return () => {
      window.removeEventListener("user-login", h)
      window.removeEventListener("storage", h)
    }
  }, [campanha.id])

  // Sincronização: atualizar giro grátis quando pedidos/cotas mudarem
  useEffect(() => {
    const handleUpdate = () => {
      if (usuarioCpf) {
        const usadosRaw = localStorage.getItem(`roleta-giro-gratis-${campanha.id}`)
        const usados: string[] = usadosRaw ? JSON.parse(usadosRaw) : []
        setJaUsouGiroGratis(usados.includes(usuarioCpf))
      }
    }
    window.addEventListener("pedidos-updated", handleUpdate)
    window.addEventListener("cotas-ganhas-roleta-box-updated", handleUpdate)
    return () => {
      window.removeEventListener("pedidos-updated", handleUpdate)
      window.removeEventListener("cotas-ganhas-roleta-box-updated", handleUpdate)
    }
  }, [campanha.id, usuarioCpf])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10
    const totalP = premios.reduce((s, p) => s + p.probabilidade, 0)
    let startAngle = 0
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    premios.forEach((p) => {
      const sliceAngle = (2 * Math.PI * p.probabilidade) / totalP
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = p.cor
      ctx.fill()
      ctx.stroke()
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = "#fff"
      ctx.font = "bold 14px Arial"
      ctx.fillText(p.icone, radius - 25, 5)
      ctx.restore()
      startAngle += sliceAngle
    })
    ctx.beginPath()
    ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI)
    ctx.fillStyle = "#1a1a2e"
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(centerX + 25, centerY)
    ctx.lineTo(centerX + 45, centerY - 8)
    ctx.lineTo(centerX + 45, centerY + 8)
    ctx.closePath()
    ctx.fillStyle = "#ff0000"
    ctx.fill()
  }, [premios])

  const handlePago = (pedidoPago: Pedido) => {
    setShowPayment(false)
    setPedidoAtual(null)
    const qtd = quantidadeGirosPendente
    setQuantidadeGirosPendente(0)
    window.dispatchEvent(new Event("pedidos-updated"))
    window.dispatchEvent(new Event("cotas-ganhas-roleta-box-updated"))
    // Executar os giros pagos sequencialmente
    if (qtd > 0) {
      const giros = Array.from({ length: qtd }, (_, i) => i)
      setGirosPagosPendentes(giros)
      executarProximoGiroPago()
    }
  }

  const executarProximoGiroPago = () => {
    if (girosPagosPendentes.length === 0 || isSpinning) return
    const novosGiros = [...girosPagosPendentes]
    novosGiros.shift()
    setGirosPagosPendentes(novosGiros)
    executarGiro(false)
    if (novosGiros.length > 0) {
      setTimeout(() => executarProximoGiroPago(), 3500)
    }
  }

  const executarGiro = (isGratis: boolean) => {
    if (isSpinning) {
      // Se já está girando, aguardar um pouco
      setTimeout(() => executarGiro(isGratis), 1000)
      return
    }
    setIsSpinning(true)
    setSelectedPrize(null)

    const randomValue = Math.random() * 100
    let cumulative = 0
    let winner = premios[premios.length - 1]
    let winnerIndex = premios.length - 1
    for (let i = 0; i < premios.length; i++) {
      cumulative += premios[i].probabilidade
      if (randomValue <= cumulative) {
        winner = premios[i]
        winnerIndex = i
        break
      }
    }

    const totalP = premios.reduce((s, p) => s + p.probabilidade, 0)
    let startAngle = 0
    for (let i = 0; i < winnerIndex; i++) {
      startAngle += (2 * Math.PI * premios[i].probabilidade) / totalP
    }
    const sliceAngle = (2 * Math.PI * winner.probabilidade) / totalP
    const sectorCenterDeg = ((startAngle + sliceAngle / 2) * 180) / Math.PI
    const totalRotation = 360 * 6 + (360 - sectorCenterDeg) + Math.random() * 20

    let rotation = 0
    const baseSpeed = 22
    let currentSpeed = baseSpeed
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) {
      setIsSpinning(false)
      return
    }

    const animate = () => {
      rotation += currentSpeed
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
      const radius = Math.min(centerX, centerY) - 10
      const totalP = premios.reduce((s, p) => s + p.probabilidade, 0)
      let startAngle = 0
      premios.forEach((p) => {
        const sliceAngle = (2 * Math.PI * p.probabilidade) / totalP
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = p.cor
        ctx.fill()
        ctx.stroke()
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(startAngle + sliceAngle / 2)
        ctx.textAlign = "right"
        ctx.fillStyle = "#fff"
        ctx.font = "bold 14px Arial"
        ctx.fillText(p.icone, radius - 25, 5)
        ctx.restore()
        startAngle += sliceAngle
      })
      ctx.beginPath()
      ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI)
      ctx.fillStyle = "#1a1a2e"
      ctx.fill()
      ctx.stroke()
      ctx.restore()
      ctx.beginPath()
      ctx.moveTo(centerX + 25, centerY)
      ctx.lineTo(centerX + 45, centerY - 8)
      ctx.lineTo(centerX + 45, centerY + 8)
      ctx.closePath()
      ctx.fillStyle = "#ff0000"
      ctx.fill()

      if (rotation < totalRotation) {
        if (rotation > totalRotation * 0.6) currentSpeed = Math.max(0.5, currentSpeed * 0.96)
        requestAnimationFrame(animate)
      } else {
        let cotaGanha: number | undefined
        if (usuarioCpf && (winner as { daCotaParaSorteio?: boolean }).daCotaParaSorteio) {
          const totalCotas = parseInt(campanha.quantidadeNumeros || "100", 10) || 100
          const bloqueadas = new Set(campanha.cotasBloqueadas ?? [])
          const vendidas = new Set<number>()
          listarPedidos()
            .filter((p) => p.campanhaId === campanha.id && p.status === "pago" && Array.isArray(p.numerosEscolhidos))
            .forEach((p) => p.numerosEscolhidos?.forEach((n) => vendidas.add(n)))
          const atribuidas = cotasJaAtribuidas(campanha.id)
          const disponiveis = Array.from({ length: totalCotas }, (_, i) => i + 1).filter(
            (n) => !bloqueadas.has(n) && !vendidas.has(n) && !atribuidas.has(n)
          )
          if (disponiveis.length > 0) {
            cotaGanha = disponiveis[Math.floor(Math.random() * disponiveis.length)]
            registrarCotaGanha({
              campanhaId: campanha.id,
              cpf: usuarioCpf,
              cota: cotaGanha,
              origem: "roleta",
              premioNome: winner.nome,
            })
            // Disparar evento para sincronização
            window.dispatchEvent(new Event("cotas-ganhas-roleta-box-updated"))
          }
        }
        setIsSpinning(false)
        setSelectedPrize({ ...winner, cotaGanha })
        if (winner.nome !== "Sem Prêmio") {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
        }
        try {
          const usadosRaw = localStorage.getItem(`roleta-giro-gratis-${campanha.id}`)
          const usados: string[] = usadosRaw ? JSON.parse(usadosRaw) : []
          if (usuarioCpf && isGratis && !usados.includes(usuarioCpf)) {
            usados.push(usuarioCpf)
            localStorage.setItem(`roleta-giro-gratis-${campanha.id}`, JSON.stringify(usados))
            setJaUsouGiroGratis(true)
          }
        } catch {}
        // Se há giros pagos pendentes, executar o próximo após um delay
        setTimeout(() => {
          setGirosPagosPendentes((prev) => {
            if (prev.length > 0) {
              setTimeout(() => executarProximoGiroPago(), 1000)
            }
            return prev
          })
        }, 2000)
      }
    }
    animate()
  }

  const spinWheel = () => {
    if (!usuarioCpf) {
      router.push("/login")
      return
    }
    if (jaUsouGiroGratis) return
    if (isSpinning) return
    executarGiro(true)
  }

  const comprarGiros = (quantidade: number, valorTotal: number) => {
    if (!usuarioCpf) {
      router.push("/login")
      return
    }
    // Buscar dados do cliente se não estiverem disponíveis
    if (!usuarioNome || !usuarioTelefone) {
      const cliente = buscarClientePorCpf(usuarioCpf)
      if (!cliente || !cliente.nome || !cliente.telefone) {
        alert("Complete seu cadastro com nome e telefone para comprar giros.")
        router.push("/cadastro")
        return
      }
      setUsuarioNome(cliente.nome)
      setUsuarioTelefone(cliente.telefone)
      setUsuarioEmail(cliente.email)
    }
    const cliente = buscarClientePorCpf(usuarioCpf)
    const pedido = criarPedido({
      campanhaId: campanha.id,
      campanhaTitulo: `${campanha.titulo} - ${quantidade} giro${quantidade > 1 ? "s" : ""} na roleta`,
      quantidade: quantidade,
      valorUnitario: valorTotal / quantidade,
      nomeComprador: usuarioNome || cliente?.nome || "Cliente",
      telefoneComprador: usuarioTelefone || cliente?.telefone || "",
      emailComprador: usuarioEmail || cliente?.email || "",
      cpfComprador: usuarioCpf,
      tipoEspecial: "roleta",
      quantidadeEspecial: quantidade,
    })
    setPedidoAtual(pedido)
    setQuantidadeGirosPendente(quantidade)
    setShowPayment(true)
  }

  if (showPayment && pedidoAtual) {
    return (
      <Card className="bg-black/40 border-[#FFB800]/20">
        <PagamentoPix pedido={pedidoAtual} onVoltar={() => { setShowPayment(false); setPedidoAtual(null) }} onPago={handlePago} />
      </Card>
    )
  }

  return (
    <Card className="bg-black/40 border-[#FFB800]/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-[#FFB800]">
          <RotateCw className="h-5 w-5" /> Roleta Premiada
        </CardTitle>
        <p className="text-sm text-gray-400">
          {jaUsouGiroGratis
            ? "Você já usou seu giro grátis nesta campanha."
            : usuarioCpf
              ? "Você tem direito a 1 giro grátis."
              : "Faça login para liberar 1 giro grátis."}
          {valorGiro > 0 && ` Giros adicionais: ${formatarValor(valorGiro)} cada.`}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative mb-4">
          <canvas ref={canvasRef} width={220} height={220} className="rounded-full border-2 border-[#FFB800]/30" />
          {isSpinning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FFB800] border-t-transparent" />
            </div>
          )}
        </div>
        {selectedPrize && !isSpinning && (
          <div className="text-center mb-3 p-3 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/30">
            <p className="text-2xl mb-1">{selectedPrize.icone}</p>
            <p className="font-bold text-[#FFB800]">{selectedPrize.nome}</p>
            {selectedPrize.cotaGanha && (
              <p className="text-sm text-gray-300 mt-1">
                Sua cota para o sorteio: <span className="font-bold text-[#FFB800]">{selectedPrize.cotaGanha}</span>
                <br />
                <span className="text-xs">Se esta for a cota vencedora, você ganha o prêmio principal + este!</span>
              </p>
            )}
          </div>
        )}
        <div className="w-full space-y-2">
          <Button
            size="sm"
            className="w-full bg-[#FFB800] hover:bg-[#FFA500] text-black"
            onClick={spinWheel}
            disabled={isSpinning || jaUsouGiroGratis || !usuarioCpf}
          >
            <RotateCw className="h-4 w-4 mr-1" /> Girar Grátis
          </Button>
          {pacotes.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400 text-center">Pacotes Promocionais:</p>
              {pacotes.map((pacote) => (
                <Button
                  key={pacote.id}
                  size="sm"
                  variant="outline"
                  className="w-full border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800]/10 text-xs"
                  onClick={() => comprarGiros(pacote.quantidade, pacote.valor)}
                  disabled={!usuarioCpf}
                >
                  {pacote.quantidade} giros por {formatarValor(pacote.valor)}
                </Button>
              ))}
            </div>
          )}
          {valorGiro > 0 && pacotes.length === 0 && (
            <Button
              size="sm"
              variant="outline"
              className="w-full border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800]/10"
              onClick={() => comprarGiros(1, valorGiro)}
              disabled={!usuarioCpf}
            >
              <Ticket className="h-4 w-4 mr-1" /> Girar por {formatarValor(valorGiro)}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
