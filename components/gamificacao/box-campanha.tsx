"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Gift } from "lucide-react"
import confetti from "canvas-confetti"
import type { Campanha } from "@/lib/campanhas-store"
import { listarPedidos, criarPedido, buscarClientePorCpf, type Pedido } from "@/lib/gateway-store"
import { cotasJaAtribuidas, registrarCotaGanha } from "@/lib/cotas-premiadas-roleta-box-store"
import PagamentoPix from "@/components/pagamento-pix"
import { formatarValor } from "@/lib/formatadores"

const PREMIOS_PADRAO = [
  { nome: "1 Número Grátis", probabilidade: 40, icone: "🎫", daCotaParaSorteio: true },
  { nome: "5% Cashback", probabilidade: 30, icone: "💰" },
  { nome: "10 Pontos VIP", probabilidade: 20, icone: "⭐" },
  { nome: "1 Ticket Roleta", probabilidade: 10, icone: "🎟️" },
]

interface BoxCampanhaProps {
  campanha: Campanha
}

export default function BoxCampanha({ campanha }: BoxCampanhaProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [showPrize, setShowPrize] = useState<{ nome: string; icone: string; cotaGanha?: number } | null>(null)
  const [usuarioCpf, setUsuarioCpf] = useState<string | null>(null)
  const [usuarioNome, setUsuarioNome] = useState<string>("")
  const [usuarioTelefone, setUsuarioTelefone] = useState<string>("")
  const [usuarioEmail, setUsuarioEmail] = useState<string>("")
  const [showPayment, setShowPayment] = useState(false)
  const [pedidoAtual, setPedidoAtual] = useState<Pedido | null>(null)
  const [quantidadeAberturasPendente, setQuantidadeAberturasPendente] = useState(0)
  const [aberturasPagosPendentes, setAberturasPagosPendentes] = useState<number[]>([])
  const router = useRouter()

  useEffect(() => {
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
      // Buscar dados do cliente no gateway-store se não estiverem no localStorage
      const cliente = buscarClientePorCpf(cpfLimpo)
      setUsuarioNome(parsed.nome || cliente?.nome || "")
      setUsuarioTelefone(parsed.telefone || parsed.celular || cliente?.telefone || "")
      setUsuarioEmail(parsed.email || cliente?.email || "")
    } catch {
      setUsuarioCpf(null)
    }
  }, [])

  // Sincronização: atualizar quando houver mudanças
  useEffect(() => {
    const handleUpdate = () => {
      // Recarregar dados se necessário
    }
    window.addEventListener("pedidos-updated", handleUpdate)
    window.addEventListener("cotas-ganhas-roleta-box-updated", handleUpdate)
    return () => {
      window.removeEventListener("pedidos-updated", handleUpdate)
      window.removeEventListener("cotas-ganhas-roleta-box-updated", handleUpdate)
    }
  }, [])

  const valorAbertura = campanha.boxValorAbertura ?? 10
  const pacotes = campanha.boxsConfig?.[0]?.pacotes || []
  const premios =
    campanha.boxsConfig?.[0]?.premios?.length
      ? campanha.boxsConfig[0].premios.map((p) => ({
          nome: p.nome,
          probabilidade: p.probabilidade,
          icone: p.icone || "🎁",
          daCotaParaSorteio: p.daCotaParaSorteio,
        }))
      : PREMIOS_PADRAO

  const handlePago = (pedidoPago: Pedido) => {
    setShowPayment(false)
    setPedidoAtual(null)
    const qtd = quantidadeAberturasPendente
    setQuantidadeAberturasPendente(0)
    window.dispatchEvent(new Event("pedidos-updated"))
    window.dispatchEvent(new Event("cotas-ganhas-roleta-box-updated"))
    // Executar as aberturas pagas sequencialmente
    if (qtd > 0) {
      const aberturas = Array.from({ length: qtd }, (_, i) => i)
      setAberturasPagosPendentes(aberturas)
      executarProximaAberturaPaga()
    }
  }

  const executarProximaAberturaPaga = () => {
    if (aberturasPagosPendentes.length === 0 || isOpening) return
    const novasAberturas = [...aberturasPagosPendentes]
    novasAberturas.shift()
    setAberturasPagosPendentes(novasAberturas)
    executarAbertura(false)
    if (novasAberturas.length > 0) {
      setTimeout(() => executarProximaAberturaPaga(), 2500)
    }
  }

  const executarAbertura = (isGratis: boolean) => {
    if (isOpening) {
      // Se já está abrindo, aguardar um pouco
      setTimeout(() => executarAbertura(isGratis), 1000)
      return
    }
    setIsOpening(true)
    setShowPrize(null)

    setTimeout(() => {
      const randomValue = Math.random() * 100
      let cumulative = 0
      let winner = premios[premios.length - 1] as typeof premios[0] & { daCotaParaSorteio?: boolean }
      for (const p of premios) {
        cumulative += (p as { probabilidade: number }).probabilidade
        if (randomValue <= cumulative) {
          winner = p as typeof winner
          break
        }
      }
      let cotaGanha: number | undefined
      if (usuarioCpf && winner.daCotaParaSorteio) {
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
            origem: "box",
            premioNome: winner.nome,
          })
          // Disparar evento para sincronização
          window.dispatchEvent(new Event("cotas-ganhas-roleta-box-updated"))
        }
      }
      setShowPrize({ nome: winner.nome, icone: winner.icone, cotaGanha })
      setIsOpening(false)
      if (winner.nome !== "Sem Prêmio") {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
      }
      // Se há aberturas pagas pendentes, executar a próxima após um delay
      setTimeout(() => {
        setAberturasPagosPendentes((prev) => {
          if (prev.length > 0) {
            setTimeout(() => executarProximaAberturaPaga(), 1000)
          }
          return prev
        })
      }, 2000)
    }, 1500)
  }

  const openBox = () => {
    if (isOpening) return
    if (!usuarioCpf) {
      router.push("/login")
      return
    }
    if (valorAbertura > 0) {
      comprarAbertura(1, valorAbertura)
    } else {
      executarAbertura(true)
    }
  }

  const comprarAbertura = (quantidade: number, valorTotal: number) => {
    if (!usuarioCpf) {
      router.push("/login")
      return
    }
    // Buscar dados do cliente se não estiverem disponíveis
    if (!usuarioNome || !usuarioTelefone) {
      const cliente = buscarClientePorCpf(usuarioCpf)
      if (!cliente || !cliente.nome || !cliente.telefone) {
        alert("Complete seu cadastro com nome e telefone para abrir boxes.")
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
      campanhaTitulo: `${campanha.titulo} - ${quantidade} abertura${quantidade > 1 ? "s" : ""} de box`,
      quantidade: quantidade,
      valorUnitario: valorTotal / quantidade,
      nomeComprador: usuarioNome || cliente?.nome || "Cliente",
      telefoneComprador: usuarioTelefone || cliente?.telefone || "",
      emailComprador: usuarioEmail || cliente?.email || "",
      cpfComprador: usuarioCpf,
      tipoEspecial: "box",
      quantidadeEspecial: quantidade,
    })
    setPedidoAtual(pedido)
    setQuantidadeAberturasPendente(quantidade)
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
          <Package className="h-5 w-5" /> Caixa Premiada
        </CardTitle>
        <p className="text-sm text-gray-400">
          {usuarioCpf ? "Abra a caixa e ganhe prêmios exclusivos desta campanha. Aumente suas chances de ganhar!" : "Faça login para abrir a caixa e concorrer a prêmios."}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative mb-4 flex justify-center">
          <div
            className={`w-24 h-24 rounded-lg border-2 border-[#FFB800]/50 flex items-center justify-center text-4xl transition-all ${
              isOpening ? "animate-pulse scale-110" : ""
            }`}
          >
            {isOpening ? (
              <span className="animate-bounce">📦</span>
            ) : (
              <Package className="h-12 w-12 text-[#FFB800]" />
            )}
          </div>
        </div>
        {showPrize && (
          <div className="text-center mb-3 p-3 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/30">
            <p className="text-2xl mb-1">{showPrize.icone}</p>
            <p className="font-bold text-[#FFB800]">{showPrize.nome}</p>
            {showPrize.cotaGanha && (
              <p className="text-sm text-gray-300 mt-1">
                Sua cota para o sorteio: <span className="font-bold text-[#FFB800]">{showPrize.cotaGanha}</span>
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
            onClick={openBox}
            disabled={isOpening || !usuarioCpf}
          >
            <Gift className="h-4 w-4 mr-1" />
            {valorAbertura > 0 ? `Abrir por ${formatarValor(valorAbertura)}` : "Abrir Grátis"}
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
                  onClick={() => comprarAbertura(pacote.quantidade, pacote.valor)}
                  disabled={!usuarioCpf}
                >
                  {pacote.quantidade} aberturas por {formatarValor(pacote.valor)}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
