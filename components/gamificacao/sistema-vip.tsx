"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Crown, Star, Gift, Zap, Lock, Check, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { getPontosUsuario } from "@/lib/loja-store"
import { buscarClientePorCpf, isClienteVIP } from "@/lib/gateway-store"
import { listarCampanhas } from "@/lib/marketing-loja-store"

const NIVEIS_VIP = [
  { id: "padrao", nome: "Padrão", cor: "bg-gray-500", pontosNecessarios: 0, cashback: "0%" },
  { id: "bronze", nome: "Bronze", cor: "bg-amber-700", pontosNecessarios: 1000, cashback: "5%" },
  { id: "prata", nome: "Prata", cor: "bg-gray-400", pontosNecessarios: 3000, cashback: "10%" },
  { id: "ouro", nome: "Ouro", cor: "bg-yellow-500", pontosNecessarios: 5000, cashback: "15%" },
  { id: "platina", nome: "Platina", cor: "bg-slate-400", pontosNecessarios: 10000, cashback: "20%" },
  { id: "diamante", nome: "Diamante", cor: "bg-blue-500", pontosNecessarios: 20000, cashback: "25%" },
]

function nivelPorPontos(pontos: number) {
  for (let i = NIVEIS_VIP.length - 1; i >= 0; i--) {
    if (pontos >= NIVEIS_VIP[i].pontosNecessarios) return NIVEIS_VIP[i]
  }
  return NIVEIS_VIP[0]
}

export default function SistemaVIP() {
  const [pontos, setPontos] = useState(0)
  const [ehVIP, setEhVIP] = useState(false)
  const [clienteId, setClienteId] = useState<string | null>(null)

  useEffect(() => {
    const load = () => {
      setPontos(getPontosUsuario())
      try {
        const raw = localStorage.getItem("user")
        if (raw) {
          const user = JSON.parse(raw) as { cpf?: string }
          const cpf = user?.cpf?.replace(/\D/g, "")
          if (cpf?.length === 11) {
            const cliente = buscarClientePorCpf(cpf)
            if (cliente) {
              setClienteId(cliente.id)
              setEhVIP(isClienteVIP(cliente.id))
            }
          }
        }
      } catch {}
    }
    load()
    window.addEventListener("loja-updated", load)
    window.addEventListener("clientes-loja-updated", load)
    return () => {
      window.removeEventListener("loja-updated", load)
      window.removeEventListener("clientes-loja-updated", load)
    }
  }, [])

  const nivelAtual = nivelPorPontos(pontos)
  const proximoNivel = NIVEIS_VIP[NIVEIS_VIP.indexOf(nivelAtual) + 1]
  const progresso = proximoNivel
    ? Math.min(
        100,
        Math.floor(
          ((pontos - nivelAtual.pontosNecessarios) /
            (proximoNivel.pontosNecessarios - nivelAtual.pontosNecessarios)) *
            100
        )
      )
    : 100

  return (
    <div className="space-y-6">
      <Card className="bg-[#171923] border-gray-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-white">Seu Status VIP</CardTitle>
              <CardDescription className="text-gray-400">
                Acompanhe seu progresso e benefícios VIP
              </CardDescription>
            </div>
            <Badge className={nivelAtual.cor}>
              <Crown className="mr-1 h-4 w-4" /> {nivelAtual.nome}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Nível atual: <span className="font-bold text-white">{nivelAtual.nome}</span></span>
                <span>
                  {proximoNivel ? (
                    <>Próximo: <span className="font-bold text-white">{proximoNivel.nome}</span></>
                  ) : (
                    "Nível máximo!"
                  )}
                </span>
              </div>
              <Progress value={progresso} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{pontos.toLocaleString()} pontos</span>
                {proximoNivel && (
                  <span>
                    Faltam{" "}
                    {(proximoNivel.pontosNecessarios - pontos).toLocaleString()} para{" "}
                    <span className="font-medium text-gray-400">{proximoNivel.nome}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-black/30 border-gray-700">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Star className="h-8 w-8 text-yellow-500 mb-2" />
                  <p className="text-lg font-bold text-white">{pontos.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Pontos VIP</p>
                </CardContent>
              </Card>
              <Card className="bg-black/30 border-gray-700">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Gift className="h-8 w-8 text-[#FFB800] mb-2" />
                  <p className="text-lg font-bold text-white">{nivelAtual.cashback}</p>
                  <p className="text-sm text-gray-400">Cashback Atual</p>
                </CardContent>
              </Card>
              <Card className="bg-black/30 border-gray-700">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Zap className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-lg font-bold text-white">{ehVIP ? "VIP" : "Padrão"}</p>
                  <p className="text-sm text-gray-400">Status na Lista</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-[#FFB800] hover:bg-[#FFA500] text-black" asChild>
            <Link href="/gamificacao?tab=loja">
              <Sparkles className="mr-2 h-4 w-4" /> Ganhar Pontos na Loja
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-[#171923] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5" /> Níveis VIP
          </CardTitle>
          <CardDescription className="text-gray-400">
            Quanto mais pontos, mais benefícios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={nivelAtual.id}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4 bg-gray-800">
              {NIVEIS_VIP.map((n) => (
                <TabsTrigger key={n.id} value={n.id} className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black">
                  {n.nome}
                </TabsTrigger>
              ))}
            </TabsList>

            {NIVEIS_VIP.map((nivel) => (
              <TabsContent key={nivel.id} value={nivel.id}>
                <Card className="bg-black/20 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <Badge className={nivel.cor}>
                        <Crown className="mr-1 h-4 w-4" /> {nivel.nome}
                      </Badge>
                      {nivel.id === nivelAtual.id && (
                        <Badge variant="outline" className="border-[#FFB800] text-[#FFB800]">
                          Seu nível atual
                        </Badge>
                      )}
                      {nivel.pontosNecessarios > pontos && nivel.id !== nivelAtual.id && (
                        <Badge variant="outline" className="text-gray-500">
                          <Lock className="mr-1 h-3 w-3" /> Bloqueado
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-400">
                      {nivel.pontosNecessarios > 0
                        ? `Necessário ${nivel.pontosNecessarios.toLocaleString()} pontos VIP`
                        : "Nível inicial para todos"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">
                      Cashback: <span className="font-bold text-[#FFB800]">{nivel.cashback}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Ganhe pontos comprando na Loja Virtual e em rifas
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-[#171923] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Rifas Ativas</CardTitle>
          <CardDescription className="text-gray-400">
            Participe das rifas e acumule pontos VIP
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listarCampanhas().filter((c) => c.ativo).length > 0 ? (
            <Button asChild className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
              <Link href="/#rifas-ativas">
                Ver Rifas Ativas <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <p className="text-gray-500">Nenhuma campanha ativa no momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
