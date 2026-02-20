"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, RotateCw, Sparkles, Ticket } from "lucide-react"
import confetti from "canvas-confetti"
import { getPontosUsuario, descontarPontos } from "@/lib/loja-store"

// Dados simulados dos prêmios da roleta
const premiosRoleta = [
  { id: 1, nome: "1 Número Grátis", cor: "#00ff00", probabilidade: 30, icone: "🎫" },
  { id: 2, nome: "5% de Cashback", cor: "#9c27b0", probabilidade: 20, icone: "💰" },
  { id: 3, nome: "10 Pontos VIP", cor: "#0088fe", probabilidade: 15, icone: "⭐" },
  { id: 4, nome: "Caixa Misteriosa", cor: "#ffbb28", probabilidade: 10, icone: "📦" },
  { id: 5, nome: "50% de Desconto", cor: "#ff8042", probabilidade: 5, icone: "🏷️" },
  { id: 6, nome: "Sem Prêmio", cor: "#8884d8", probabilidade: 20, icone: "❌" },
]

export default function RoletaPremiada() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedPrize, setSelectedPrize] = useState<(typeof premiosRoleta)[0] | null>(null)
  const [historicoPremios, setHistoricoPremios] = useState<Array<{ premio: (typeof premiosRoleta)[0]; data: Date }>>([])
  const [usuarioCpf, setUsuarioCpf] = useState<string | null>(null)
  const [jaUsouGiroGratis, setJaUsouGiroGratis] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [pontosUsuario, setPontosUsuario] = useState(0)
  const router = useRouter()

  const CUSTO_TICKET_PONTOS = 200 // 1 ticket = 200 pontos (equivalente a "Giro Extra na Roleta" da loja)

  const carregarUsuario = useCallback(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (!raw) {
        setUsuarioCpf(null)
        setMensagem("Faça login com seu CPF para liberar 1 giro grátis.")
        return
      }
      const parsed = JSON.parse(raw) as { cpf?: string | null; isLoggedIn?: boolean }
      const cpfLimpo = parsed?.cpf ? parsed.cpf.replace(/\D/g, "") : ""
      if (!parsed?.isLoggedIn || cpfLimpo.length !== 11) {
        setUsuarioCpf(null)
        setMensagem("Faça login com um CPF válido para liberar 1 giro grátis.")
        return
      }
      setUsuarioCpf(cpfLimpo)

      const usadosRaw = localStorage.getItem("roleta-giro-gratis-usados")
      const usados: string[] = usadosRaw ? JSON.parse(usadosRaw) : []
      if (usados.includes(cpfLimpo)) {
        setJaUsouGiroGratis(true)
        setMensagem("Você já utilizou o giro grátis. Use 200 pontos para girar novamente (botão 'Usar 1 Ticket').")
      } else {
        setJaUsouGiroGratis(false)
        setMensagem("Você tem direito a 1 giro grátis. Ou use 200 pontos (Usar 1 Ticket) para girar.")
      }
    } catch {
      setUsuarioCpf(null)
      setMensagem("Não foi possível validar o login. Tente novamente.")
    }
  }, [])

  useEffect(() => {
    carregarUsuario()
    setPontosUsuario(getPontosUsuario())
  }, [carregarUsuario])

  // Sincronização: revalidar usuário e pontos quando login/loja mudar
  useEffect(() => {
    const handler = () => {
      carregarUsuario()
      setPontosUsuario(getPontosUsuario())
    }
    window.addEventListener("user-login", handler)
    window.addEventListener("storage", handler)
    window.addEventListener("loja-updated", handler)
    return () => {
      window.removeEventListener("user-login", handler)
      window.removeEventListener("storage", handler)
      window.removeEventListener("loja-updated", handler)
    }
  }, [carregarUsuario])


  // Desenhar a roleta
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Desenhar setores da roleta
    const totalProbability = premiosRoleta.reduce((sum, premio) => sum + premio.probabilidade, 0)
    let startAngle = 0

    premiosRoleta.forEach((premio) => {
      const sliceAngle = (2 * Math.PI * premio.probabilidade) / totalProbability

      // Desenhar setor
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = premio.cor
      ctx.fill()
      ctx.stroke()

      // Adicionar texto
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = "right"
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 16px Arial"
      ctx.fillText(premio.icone, radius - 30, 5)
      ctx.restore()

      startAngle += sliceAngle
    })

    // Desenhar círculo central
    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
    ctx.fillStyle = "#1a1a2e"
    ctx.fill()
    ctx.stroke()

    // Desenhar seta
    ctx.beginPath()
    ctx.moveTo(centerX + 30, centerY)
    ctx.lineTo(centerX + 50, centerY - 10)
    ctx.lineTo(centerX + 50, centerY + 10)
    ctx.closePath()
    ctx.fillStyle = "#ff0000"
    ctx.fill()
  }, [])

  /** Executa o giro. isGratis=true usa o giro grátis (1 por CPF); isGratis=false usa ticket (200 pts) */
  const executarGiro = (isGratis: boolean) => {
    if (isSpinning) return
    setIsSpinning(true)
    setSelectedPrize(null)

    const canvas = canvasRef.current
    if (!canvas) {
      setIsSpinning(false)
      return
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      setIsSpinning(false)
      return
    }

    const randomValue = Math.random() * 100
    let cumulativeProbability = 0
    let selectedPrize = premiosRoleta[premiosRoleta.length - 1]
    let selectedIndex = premiosRoleta.length - 1
    for (let i = 0; i < premiosRoleta.length; i++) {
      cumulativeProbability += premiosRoleta[i].probabilidade
      if (randomValue <= cumulativeProbability) {
        selectedPrize = premiosRoleta[i]
        selectedIndex = i
        break
      }
    }

    // Calcular ângulo do centro do setor vencedor (para parar exatamente nele)
    const totalProbability = premiosRoleta.reduce((sum, premio) => sum + premio.probabilidade, 0)
    let startAngle = 0
    for (let i = 0; i < selectedIndex; i++) {
      startAngle += (2 * Math.PI * premiosRoleta[i].probabilidade) / totalProbability
    }
    const sliceAngle = (2 * Math.PI * selectedPrize.probabilidade) / totalProbability
    const sectorCenterRad = startAngle + sliceAngle / 2
    const sectorCenterDeg = (sectorCenterRad * 180) / Math.PI
    const totalRotation = 360 * 6 + (360 - sectorCenterDeg) + Math.random() * 20

    let rotation = 0
    const baseSpeed = 25
    let currentSpeed = baseSpeed

    const animate = () => {
      if (!canvas || !ctx) return
      rotation += currentSpeed
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)

      const radius = Math.min(centerX, centerY) - 10
      let startAngle = 0
      const totalProbability = premiosRoleta.reduce((sum, premio) => sum + premio.probabilidade, 0)
      premiosRoleta.forEach((premio) => {
        const sliceAngle = (2 * Math.PI * premio.probabilidade) / totalProbability
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fillStyle = premio.cor
        ctx.fill()
        ctx.stroke()
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(startAngle + sliceAngle / 2)
        ctx.textAlign = "right"
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 16px Arial"
        ctx.fillText(premio.icone, radius - 30, 5)
        ctx.restore()
        startAngle += sliceAngle
      })

      ctx.beginPath()
      ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
      ctx.fillStyle = "#1a1a2e"
      ctx.fill()
      ctx.stroke()
      ctx.restore()

      ctx.beginPath()
      ctx.moveTo(centerX + 30, centerY)
      ctx.lineTo(centerX + 50, centerY - 10)
      ctx.lineTo(centerX + 50, centerY + 10)
      ctx.closePath()
      ctx.fillStyle = "#ff0000"
      ctx.fill()

      if (rotation < totalRotation) {
        if (rotation > totalRotation * 0.6) currentSpeed = Math.max(0.5, currentSpeed * 0.96)
        requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)
        setSelectedPrize(selectedPrize)
        setHistoricoPremios((prev) => [...prev, { premio: selectedPrize, data: new Date() }])

        if (isGratis && usuarioCpf) {
          try {
            const usadosRaw = localStorage.getItem("roleta-giro-gratis-usados")
            const usados: string[] = usadosRaw ? JSON.parse(usadosRaw) : []
            if (!usados.includes(usuarioCpf)) {
              usados.push(usuarioCpf)
              localStorage.setItem("roleta-giro-gratis-usados", JSON.stringify(usados))
              setJaUsouGiroGratis(true)
              setMensagem("Seu giro grátis foi utilizado. Use 200 pontos para girar novamente.")
            }
          } catch {}
        }

        if (selectedPrize.id !== 6) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [selectedPrize.cor, "#ffffff", "#ffff00"],
          })
        }
        setPontosUsuario(getPontosUsuario())
      }
    }
    animate()
  }

  const spinWheel = () => {
    if (!usuarioCpf) {
      router.push("/login")
      return
    }
    if (jaUsouGiroGratis) {
      setMensagem("Use o botão 'Usar 1 Ticket' (200 pontos) para girar novamente.")
      return
    }
    executarGiro(true)
  }

  /** Usar 1 Ticket = 200 pontos para 1 giro (equivalente a Giro Extra na Loja) */
  const spinWithTicket = () => {
    if (!usuarioCpf) {
      router.push("/login")
      return
    }
    if (pontosUsuario < CUSTO_TICKET_PONTOS) {
      setMensagem(`Você precisa de ${CUSTO_TICKET_PONTOS} pontos para usar 1 ticket. Ganhe pontos na Loja.`)
      return
    }
    if (!descontarPontos(CUSTO_TICKET_PONTOS)) {
      setMensagem("Pontos insuficientes.")
      return
    }
    setPontosUsuario(getPontosUsuario())
    setMensagem(null)
    executarGiro(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCw className="h-6 w-6 text-primary" /> Roleta Premiada
          </CardTitle>
          <CardDescription>
            Um giro grátis por CPF. Login obrigatório para participar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative mb-6">
            <canvas ref={canvasRef} width={300} height={300} className="border rounded-full" />
            {isSpinning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {selectedPrize && !isSpinning && (
            <div className="text-center mb-6 p-4 border rounded-md bg-primary/10 animate-pulse">
              <h3 className="text-xl font-bold mb-2">Você ganhou:</h3>
              <div className="text-3xl mb-2">{selectedPrize.icone}</div>
              <p className="text-2xl font-bold text-primary">{selectedPrize.nome}</p>
              <p className="text-sm mt-2">O prêmio foi adicionado à sua conta!</p>
            </div>
          )}

          {mensagem && (
            <div className="mb-4 text-center text-sm text-muted-foreground max-w-md">
              {mensagem}
            </div>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={spinWheel}
              disabled={isSpinning || !usuarioCpf || jaUsouGiroGratis}
              className="relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                <RotateCw className="mr-2 h-5 w-5" /> Girar Grátis
              </span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={spinWithTicket}
              disabled={isSpinning || !usuarioCpf || pontosUsuario < CUSTO_TICKET_PONTOS}
              title={`1 ticket = ${CUSTO_TICKET_PONTOS} pontos. Você tem ${pontosUsuario} pts.`}
            >
              <Ticket className="mr-2 h-5 w-5" /> Usar 1 Ticket ({CUSTO_TICKET_PONTOS} pts)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Você tem <strong>{pontosUsuario}</strong> pontos. 1 ticket = {CUSTO_TICKET_PONTOS} pts.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" /> Prêmios Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {premiosRoleta.map((premio) => (
                <li key={premio.id} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: premio.cor }}
                  >
                    {premio.icone}
                  </div>
                  <span>{premio.nome}</span>
                  <Badge variant="outline" className="ml-auto">
                    {premio.probabilidade}%
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" /> Seus Últimos Prêmios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historicoPremios.length > 0 ? (
              <ul className="space-y-3">
                {historicoPremios
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: item.premio.cor }}
                      >
                        {item.premio.icone}
                      </div>
                      <span>{item.premio.nome}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{item.data.toLocaleTimeString()}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-4">Nenhum prêmio recebido ainda</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
