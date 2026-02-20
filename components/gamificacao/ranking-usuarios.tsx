"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Medal, Star, Gift, Search, Users, DollarSign, Ticket } from "lucide-react"
import { listarClientes, type Cliente } from "@/lib/gateway-store"
import { listarPedidos } from "@/lib/gateway-store"
import { getPontosUsuario } from "@/lib/loja-store"
import { formatarValor } from "@/lib/formatadores"

interface UsuarioRanking {
  id: string
  nome: string
  cpf: string
  pontos: number
  rifasGanhas: number
  ticketsComprados: number
  valorGasto: number
  nivel: number
  vip: string
}

function calcularNivel(valorGasto: number): number {
  return Math.floor(valorGasto / 50) + 1
}

function calcularVIP(valorGasto: number): string {
  if (valorGasto >= 5000) return "Diamante"
  if (valorGasto >= 3000) return "Platina"
  if (valorGasto >= 2000) return "Ouro"
  if (valorGasto >= 1000) return "Prata"
  if (valorGasto >= 500) return "Bronze"
  return "Padrão"
}

function getVipColor(vip: string) {
  switch (vip) {
    case "Diamante":
      return "bg-blue-500"
    case "Platina":
      return "bg-slate-400"
    case "Ouro":
      return "bg-yellow-500"
    case "Prata":
      return "bg-gray-400"
    case "Bronze":
      return "bg-amber-700"
    default:
      return "bg-gray-500"
  }
}

function getPosicaoIcon(posicao: number) {
  switch (posicao) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Medal className="h-5 w-5 text-amber-700" />
    default:
      return <span className="text-sm font-medium">{posicao}</span>
  }
}

export default function RankingUsuarios() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTab, setCurrentTab] = useState("pontos")
  const [usuariosRanking, setUsuariosRanking] = useState<UsuarioRanking[]>([])
  const [usuarioAtualCpf, setUsuarioAtualCpf] = useState<string | null>(null)

  useEffect(() => {
    // Carregar CPF do usuário logado
    try {
      const raw = localStorage.getItem("user")
      if (raw) {
        const parsed = JSON.parse(raw) as { cpf?: string; isLoggedIn?: boolean }
        if (parsed?.isLoggedIn && parsed.cpf) {
          const cpfLimpo = parsed.cpf.replace(/\D/g, "")
          if (cpfLimpo.length === 11) setUsuarioAtualCpf(cpfLimpo)
        }
      }
    } catch {}

    const carregarRanking = () => {
      const clientes = listarClientes()
      const pedidos = listarPedidos().filter((p) => p.status === "pago")

      const usuarios: UsuarioRanking[] = clientes.map((cliente) => {
        const pedidosCliente = pedidos.filter(
          (p) => p.cpfComprador.replace(/\D/g, "") === cliente.cpf.replace(/\D/g, "")
        )
        const valorGasto = pedidosCliente.reduce((s, p) => s + p.valorTotal, 0)
        const ticketsComprados = pedidosCliente.reduce((s, p) => s + p.quantidade, 0)
        const pontos = getPontosUsuario() // TODO: implementar sistema de pontos real baseado em compras
        const nivel = calcularNivel(valorGasto)
        const vip = calcularVIP(valorGasto)

        // Contar rifas ganhas (precisa verificar sorteios)
        const rifasGanhas = 0 // TODO: implementar contagem real de rifas ganhas

        return {
          id: cliente.id,
          nome: cliente.nome,
          cpf: cliente.cpf,
          pontos,
          rifasGanhas,
          ticketsComprados,
          valorGasto,
          nivel,
          vip,
        }
      })

      setUsuariosRanking(usuarios)
    }

    carregarRanking()
    const h = () => carregarRanking()
    window.addEventListener("pedidos-updated", h)
    window.addEventListener("loja-updated", h)
    return () => {
      window.removeEventListener("pedidos-updated", h)
      window.removeEventListener("loja-updated", h)
    }
  }, [])

  const filteredUsuarios = usuariosRanking.filter((usuario) =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedUsuarios = [...filteredUsuarios].sort((a, b) => {
    switch (currentTab) {
      case "pontos":
        return b.pontos - a.pontos
      case "rifas":
        return b.rifasGanhas - a.rifasGanhas
      case "tickets":
        return b.ticketsComprados - a.ticketsComprados
      case "gastos":
        return b.valorGasto - a.valorGasto
      default:
        return b.pontos - a.pontos
    }
  })

  const posicaoUsuarioAtual = usuarioAtualCpf
    ? sortedUsuarios.findIndex((u) => u.cpf.replace(/\D/g, "") === usuarioAtualCpf) + 1
    : 0
  const usuarioAtual = usuarioAtualCpf
    ? sortedUsuarios.find((u) => u.cpf.replace(/\D/g, "") === usuarioAtualCpf)
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar usuários..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{filteredUsuarios.length} usuários no ranking</span>
        </div>
      </div>

      {sortedUsuarios.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum usuário no ranking</h3>
            <p className="text-gray-400">Os rankings serão atualizados conforme as compras forem realizadas.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="pontos" onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pontos">
                <Star className="mr-2 h-4 w-4" /> Pontos
              </TabsTrigger>
              <TabsTrigger value="rifas">
                <Gift className="mr-2 h-4 w-4" /> Rifas Ganhas
              </TabsTrigger>
              <TabsTrigger value="tickets">
                <Ticket className="mr-2 h-4 w-4" /> Tickets Comprados
              </TabsTrigger>
              <TabsTrigger value="gastos">
                <DollarSign className="mr-2 h-4 w-4" /> Valor Gasto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pontos" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Pontos</CardTitle>
                  <CardDescription>Os jogadores com mais pontos acumulados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {sortedUsuarios.length >= 3 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {sortedUsuarios.slice(0, 3).map((usuario, index) => (
                          <Card
                            key={usuario.id}
                            className={`overflow-hidden ${
                              usuario.cpf.replace(/\D/g, "") === usuarioAtualCpf ? "border-2 border-primary" : ""
                            }`}
                          >
                            <div
                              className={`h-2 ${
                                index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"
                              }`}
                            ></div>
                            <CardContent className="pt-6">
                              <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                  <Avatar className="h-20 w-20">
                                    <AvatarFallback>
                                      {usuario.nome
                                        .split(" ")
                                        .slice(0, 2)
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="absolute -top-3 -right-3 rounded-full bg-background p-1 shadow">
                                    {getPosicaoIcon(index + 1)}
                                  </div>
                                </div>
                                <h3 className="text-lg font-bold mb-1">{usuario.nome}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getVipColor(usuario.vip)}>{usuario.vip}</Badge>
                                  <Badge variant="outline">Nível {usuario.nivel}</Badge>
                                </div>
                                <p className="text-2xl font-bold text-primary">{usuario.pontos.toLocaleString()} pts</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    <div className="border rounded-md overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                        <div className="col-span-1 text-center">Pos.</div>
                        <div className="col-span-5 md:col-span-4">Jogador</div>
                        <div className="col-span-2 text-center hidden md:block">Nível</div>
                        <div className="col-span-2 text-center">VIP</div>
                        <div className="col-span-4 md:col-span-3 text-right">Pontos</div>
                      </div>

                      {sortedUsuarios.slice(3).map((usuario, index) => (
                        <div
                          key={usuario.id}
                          className={`grid grid-cols-12 gap-2 p-3 border-t ${
                            usuario.cpf.replace(/\D/g, "") === usuarioAtualCpf ? "bg-primary/10" : ""
                          }`}
                        >
                          <div className="col-span-1 flex justify-center items-center">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              {index + 4}
                            </div>
                          </div>
                          <div className="col-span-5 md:col-span-4 flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {usuario.nome
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{usuario.nome}</span>
                          </div>
                          <div className="col-span-2 hidden md:block">
                            <div className="flex items-center justify-center">
                              <Badge variant="outline">Nível {usuario.nivel}</Badge>
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center justify-center">
                            <Badge className={getVipColor(usuario.vip)}>{usuario.vip}</Badge>
                          </div>
                          <div className="col-span-4 md:col-span-3 flex items-center justify-end font-bold">
                            {usuario.pontos.toLocaleString()} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rifas" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Rifas Ganhas</CardTitle>
                  <CardDescription>Os jogadores com mais rifas ganhas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                      <div className="col-span-1 text-center">Pos.</div>
                      <div className="col-span-5 md:col-span-6">Jogador</div>
                      <div className="col-span-2 text-center hidden md:block">Nível</div>
                      <div className="col-span-6 md:col-span-3 text-right">Rifas Ganhas</div>
                    </div>

                    {sortedUsuarios.map((usuario, index) => (
                      <div
                        key={usuario.id}
                        className={`grid grid-cols-12 gap-2 p-3 border-t ${
                          usuario.cpf.replace(/\D/g, "") === usuarioAtualCpf ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="col-span-1 flex justify-center items-center">
                          {index < 3 ? (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center">
                              {getPosicaoIcon(index + 1)}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {usuario.nome
                                .split(" ")
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="truncate block">{usuario.nome}</span>
                            <Badge className={`${getVipColor(usuario.vip)} md:hidden`}>{usuario.vip}</Badge>
                          </div>
                        </div>
                        <div className="col-span-2 hidden md:flex items-center justify-center">
                          <Badge variant="outline">Nível {usuario.nivel}</Badge>
                        </div>
                        <div className="col-span-6 md:col-span-3 flex items-center justify-end font-bold">
                          {usuario.rifasGanhas} rifas
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Tickets Comprados</CardTitle>
                  <CardDescription>Os jogadores que mais compraram tickets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                      <div className="col-span-1 text-center">Pos.</div>
                      <div className="col-span-5 md:col-span-6">Jogador</div>
                      <div className="col-span-2 text-center hidden md:block">VIP</div>
                      <div className="col-span-6 md:col-span-3 text-right">Tickets</div>
                    </div>

                    {sortedUsuarios.map((usuario, index) => (
                      <div
                        key={usuario.id}
                        className={`grid grid-cols-12 gap-2 p-3 border-t ${
                          usuario.cpf.replace(/\D/g, "") === usuarioAtualCpf ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="col-span-1 flex justify-center items-center">
                          {index < 3 ? (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center">
                              {getPosicaoIcon(index + 1)}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {usuario.nome
                                .split(" ")
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{usuario.nome}</span>
                        </div>
                        <div className="col-span-2 hidden md:block">
                          <div className="flex items-center justify-center">
                            <Badge className={getVipColor(usuario.vip)}>{usuario.vip}</Badge>
                          </div>
                        </div>
                        <div className="col-span-6 md:col-span-3 flex items-center justify-end font-bold">
                          {usuario.ticketsComprados.toLocaleString()} tickets
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gastos" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Valor Gasto</CardTitle>
                  <CardDescription>Os jogadores que mais investiram na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                      <div className="col-span-1 text-center">Pos.</div>
                      <div className="col-span-5 md:col-span-6">Jogador</div>
                      <div className="col-span-2 text-center hidden md:block">VIP</div>
                      <div className="col-span-6 md:col-span-3 text-right">Valor Gasto</div>
                    </div>

                    {sortedUsuarios.map((usuario, index) => (
                      <div
                        key={usuario.id}
                        className={`grid grid-cols-12 gap-2 p-3 border-t ${
                          usuario.cpf.replace(/\D/g, "") === usuarioAtualCpf ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="col-span-1 flex justify-center items-center">
                          {index < 3 ? (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center">
                              {getPosicaoIcon(index + 1)}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {usuario.nome
                                .split(" ")
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{usuario.nome}</span>
                        </div>
                        <div className="col-span-2 hidden md:block">
                          <div className="flex items-center justify-center">
                            <Badge className={getVipColor(usuario.vip)}>{usuario.vip}</Badge>
                          </div>
                        </div>
                        <div className="col-span-6 md:col-span-3 flex items-center justify-end font-bold">
                          {formatarValor(usuario.valorGasto)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {usuarioAtual && posicaoUsuarioAtual > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Sua Posição no Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold">{posicaoUsuarioAtual}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        Você está na posição <span className="font-bold">{posicaoUsuarioAtual}</span> do ranking
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentTab === "pontos"
                          ? `Com ${usuarioAtual.pontos.toLocaleString()} pontos`
                          : currentTab === "rifas"
                            ? `Com ${usuarioAtual.rifasGanhas} rifas ganhas`
                            : currentTab === "tickets"
                              ? `Com ${usuarioAtual.ticketsComprados.toLocaleString()} tickets comprados`
                              : `Com ${formatarValor(usuarioAtual.valorGasto)} gastos`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
