"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Sparkles, Trophy, Gift } from "lucide-react"
import Link from "next/link"
import { listarPromocoes, type Promocao } from "@/lib/marketing-loja-store"
import { listarPedidos } from "@/lib/gateway-store"

export default function EventosTematicos() {
  const [promocoes, setPromocoes] = useState<Promocao[]>([])

  useEffect(() => {
    const load = () => {
      const ativas = listarPromocoes().filter((p) => p.ativo)
      setPromocoes(ativas)
    }
    load()
    window.addEventListener("marketing-loja-updated", load)
    return () => window.removeEventListener("marketing-loja-updated", load)
  }, [])

  const getStatus = (p: Promocao) => {
    const agora = new Date()
    const inicio = new Date(p.inicio)
    const fim = new Date(p.fim)
    if (agora < inicio) return "em_breve"
    if (agora > fim) return "encerrado"
    return "ativo"
  }

  const getParticipantes = (p: Promocao) => {
    const pedidos = listarPedidos().filter((x) => x.status === "pago")
    const inicio = new Date(p.inicio).getTime()
    const fim = new Date(p.fim).getTime()
    return pedidos.filter((x) => {
      const t = new Date(x.pagoEm || x.criadoEm).getTime()
      return t >= inicio && t <= fim
    }).length
  }

  const icones = [Sparkles, Trophy, Gift]
  const cores = [
    "from-yellow-500 to-orange-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-teal-500",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Eventos Temáticos</h2>
        <p className="text-gray-400 text-sm">
          Participe de promoções e eventos especiais
        </p>
      </div>

      {promocoes.length === 0 ? (
        <Card className="bg-[#171923] border-gray-800">
          <CardContent className="py-12 text-center">
            <Sparkles className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Nenhum evento ativo no momento</p>
            <p className="text-sm text-gray-500">
              Os eventos são criados nas configurações de Marketing da loja
            </p>
            <Button asChild className="mt-4 bg-[#FFB800] hover:bg-[#FFA500] text-black" variant="outline">
              <Link href="/gamificacao?tab=loja">Ir para Loja Virtual</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promocoes.map((evento, i) => {
            const status = getStatus(evento)
            const Icone = icones[i % icones.length]
            const cor = cores[i % cores.length]

            return (
              <Card
                key={evento.id}
                className="bg-[#171923] border-gray-800 hover:border-[#FFB800]/50 transition-colors overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${cor}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`bg-gradient-to-r ${cor} p-2 rounded-lg`}>
                        <Icone className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-white text-base">{evento.nome}</CardTitle>
                    </div>
                    {status === "ativo" && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Ativo</Badge>
                    )}
                    {status === "em_breve" && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Em breve</Badge>
                    )}
                    {status === "encerrado" && (
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">Encerrado</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    {evento.tipo === "percentual" && evento.valor
                      ? `Desconto de ${evento.valor}%`
                      : evento.tipo === "preco" && evento.valor
                        ? `Preço especial`
                        : "Promoção especial"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(evento.inicio).toLocaleDateString("pt-BR")} -{" "}
                        {new Date(evento.fim).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{getParticipantes(evento)} participantes</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className={
                      status === "ativo"
                        ? "w-full bg-[#FFB800] hover:bg-[#FFA500] text-black"
                        : "w-full bg-gray-700 text-gray-400"
                    }
                    disabled={status !== "ativo"}
                    asChild={status === "ativo"}
                  >
                    {status === "ativo" ? (
                      <Link href="/gamificacao?tab=loja">
                        Participar
                      </Link>
                    ) : status === "em_breve" ? (
                      "Aguarde"
                    ) : (
                      "Encerrado"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
