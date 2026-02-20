"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import PagamentoPix from "@/components/pagamento-pix"
import { criarPedido, obterGatewayConfig, adicionarPedidoLocal, type Pedido } from "@/lib/gateway-store"
import Header from "@/components/header"
import ParticlesContainer from "@/components/particles-container"

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
}

export default function PagarPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const v = searchParams.get("v")
  const d = searchParams.get("d")
  const [link, setLink] = useState<{ id: string; valor: number; descricao: string; status: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [telefone, setTelefone] = useState("")

  useEffect(() => {
    if (!id) return
    fetch(`/api/links/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error && v) {
          const valor = parseFloat(String(v).replace(",", "."))
          if (!isNaN(valor) && valor > 0) {
            setLink({ id, valor, descricao: decodeURIComponent(d || "Pagamento"), status: "ativo" })
          } else {
            setErro(data.error || "Link não encontrado")
          }
        } else if (data.error) {
          setErro(data.error || "Link não encontrado")
        } else {
          setLink(data)
        }
      })
      .catch(() => {
        if (v) {
          const valor = parseFloat(String(v).replace(",", "."))
          if (!isNaN(valor) && valor > 0) {
            setLink({ id, valor, descricao: decodeURIComponent(d || "Pagamento"), status: "ativo" })
          } else {
            setErro("Erro ao carregar")
          }
        } else {
          setErro("Erro ao carregar")
        }
      })
      .finally(() => setLoading(false))
  }, [id, v, d])

  const handlePagar = async () => {
    if (!link || link.status !== "ativo") return
    if (!nome.trim() || !email.trim() || !cpf.trim()) {
      setErro("Preencha nome, e-mail e CPF.")
      return
    }
    setErro("")
    const config = obterGatewayConfig()
    if (!config.ativo) {
      setErro("Gateway de pagamento não configurado.")
      return
    }
    try {
      if (config.gatewayAtivo === "openpix" && config.openpixAppId) {
        const res = await fetch("/api/pix/openpix/criar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            openpixAppId: config.openpixAppId,
            campanhaId: "link-" + link.id,
            campanhaTitulo: link.descricao,
            quantidade: 1,
            valorUnitario: link.valor,
            nomeComprador: nome.trim(),
            emailComprador: email.trim(),
            cpfComprador: cpf,
            telefoneComprador: telefone,
            tempoExpiracaoMinutos: config.tempoExpiracaoMinutos ?? 15,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.pedido) {
          setErro(data?.error || "Erro ao gerar cobrança.")
          return
        }
        adicionarPedidoLocal(data.pedido)
        setPedido(data.pedido)
      } else {
        const p = criarPedido({
          campanhaId: "link-" + link.id,
          campanhaTitulo: link.descricao,
          quantidade: 1,
          valorUnitario: link.valor,
          nomeComprador: nome.trim(),
          emailComprador: email.trim(),
          cpfComprador: cpf,
          telefoneComprador: telefone,
        })
        await fetch("/api/pedidos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
        }).catch(() => {})
        setPedido(p)
      }
    } catch {
      setErro("Erro ao gerar pagamento.")
    }
  }

  const handlePago = async (pedidoPago: Pedido) => {
    try {
      await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: pedidoPago.id, pagador: pedidoPago.nomeComprador }),
      })
    } catch {}
  }

  const handleVoltar = () => setPedido(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB800]" />
      </div>
    )
  }

  if (erro && !link) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-[#171923] border-gray-800 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white">Link inválido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">{erro}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 z-10 relative">
        {pedido ? (
          <div className="max-w-lg mx-auto">
            <PagamentoPix pedido={pedido} onVoltar={handleVoltar} onPago={handlePago} />
          </div>
        ) : link ? (
          <Card className="bg-[#171923] border-[#FFB800]/20 max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-white">Pagamento</CardTitle>
              <p className="text-gray-400">{link.descricao}</p>
              <p className="text-2xl font-bold text-[#FFB800]">{formatarMoeda(link.valor)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {erro && <p className="text-red-400 text-sm">{erro}</p>}
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="bg-black/30" required />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="bg-black/30" required />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className="bg-black/30" required />
              </div>
              <div className="space-y-2">
                <Label>Telefone (opcional)</Label>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className="bg-black/30" />
              </div>
              <Button onClick={handlePagar} className="w-full bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium">
                Pagar com PIX
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
