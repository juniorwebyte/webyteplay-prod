"use client"

import { useState, useEffect, useCallback } from "react"
import ParticlesContainer from "@/components/particles-container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Trophy, Medal, Award, Download, Gift, Star, Crown, ShoppingCart, Info } from "lucide-react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { listarClientes } from "@/lib/gateway-store"
import { listarAfiliados } from "@/lib/gateway-store"
import { listarCampanhas } from "@/lib/campanhas-store"

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState("compradores")
  const [searchTerm, setSearchTerm] = useState("")
  const [periodoFiltro, setPeriodoFiltro] = useState("todos")
  const [compradoresData, setCompradoresData] = useState<{
    id: string
    nome: string
    email: string
    valorGasto: number
    totalCompras: number
    ultimaCompra: string
    status: string
  }[]>([])
  const [afiliadosData, setAfiliadosData] = useState<{
    id: string
    nome: string
    email: string
    totalVendas: number
    valorVendas: number
    comissao: number
    ultimaVenda: string
    status: string
  }[]>([])
  const [rifasData, setRifasData] = useState<{
    id: string
    titulo: string
    descricao: string
    cotasVendidas: number
    totalCotas: number
    valorArrecadado: number
    status: string
  }[]>([])

  const carregarDados = useCallback(() => {
    const clientes = listarClientes()
      .map((c) => ({
        id: c.id,
        nome: c.nome,
        email: c.email,
        valorGasto: c.valorGasto || 0,
        totalCompras: c.totalCompras || 0,
        ultimaCompra: c.ultimaCompra || "",
        status: c.status || "ativo",
      }))
      .sort((a, b) => b.valorGasto - a.valorGasto)
    setCompradoresData(clientes)
    const afiliados = listarAfiliados()
      .map((a) => ({
        id: a.id,
        nome: a.nome,
        email: a.email,
        totalVendas: a.vendas || 0,
        valorVendas: a.valorVendas || 0,
        comissao: a.valorComissao || 0,
        ultimaVenda: (a as { ultimaVenda?: string }).ultimaVenda || "",
        status: a.status || "ativo",
      }))
      .sort((a, b) => b.valorVendas - a.valorVendas)
    setAfiliadosData(afiliados)
    const totalCotasNum = (c: { quantidadeNumeros?: string }) => parseInt(c.quantidadeNumeros || "0", 10) || 100
    const campanhas = listarCampanhas()
      .map((c) => ({
        id: c.id,
        titulo: c.titulo,
        descricao: c.subtitulo || c.descricao || "",
        cotasVendidas: c.cotasVendidas || 0,
        totalCotas: totalCotasNum(c),
        valorArrecadado: (c.cotasVendidas || 0) * (parseFloat(c.valorPorCota || "0") || 0),
        status: c.statusCampanha === "Ativo" ? "ativa" : "finalizada",
      }))
      .sort((a, b) => b.cotasVendidas - a.cotasVendidas)
    setRifasData(campanhas)
  }, [])

  useEffect(() => {
    carregarDados()
    window.addEventListener("clientes-updated", carregarDados)
    window.addEventListener("afiliados-updated", carregarDados)
    window.addEventListener("campanhas-updated", carregarDados)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "clientes" || e.key === "afiliados" || e.key === "campanhas") carregarDados()
    }
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("clientes-updated", carregarDados)
      window.removeEventListener("afiliados-updated", carregarDados)
      window.removeEventListener("campanhas-updated", carregarDados)
      window.removeEventListener("storage", onStorage)
    }
  }, [carregarDados])

  // Filtrar compradores com base no termo de busca (sempre vazio no estado inicial)
  const compradoresFiltrados = compradoresData.filter((comprador) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return comprador.nome.toLowerCase().includes(searchLower) || comprador.email.toLowerCase().includes(searchLower)
    }
    return true
  })

  // Filtrar afiliados com base no termo de busca (sempre vazio no estado inicial)
  const afiliadosFiltrados = afiliadosData.filter((afiliado) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return afiliado.nome.toLowerCase().includes(searchLower) || afiliado.email.toLowerCase().includes(searchLower)
    }
    return true
  })

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <div className="flex flex-1 z-10 relative">
        <AdminSidebar />

        <div className="flex-1 overflow-auto p-8">
          <h1 className="text-2xl font-bold mb-6 text-white">Ranking</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="compradores">Compradores</TabsTrigger>
              <TabsTrigger value="afiliados">Afiliados</TabsTrigger>
              <TabsTrigger value="rifas">Rifas</TabsTrigger>
            </TabsList>

            <TabsContent value="compradores">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Ranking de Compradores</CardTitle>
                      <CardDescription>Os compradores que mais participaram de rifas</CardDescription>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Buscar por nome ou email..."
                          className="pl-8 w-full md:w-[250px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todo o período</SelectItem>
                            <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                            <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                            <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" /> Exportar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {[0, 1, 2].map((i) => {
                      const c = compradoresData[i]
                      const labels = ["1º Lugar", "2º Lugar", "3º Lugar"]
                      const icons = [Trophy, Medal, Award]
                      const Icon = icons[i]
                      return (
                        <Card key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 border-gray-700">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <Avatar className="h-16 w-16 border-4 border-gray-700 bg-gray-800">
                                  <AvatarFallback>{c ? c.nome.split(" ").map((n) => n[0]).join("").slice(0, 2) : `${i + 1}º`}</AvatarFallback>
                                </Avatar>
                                <Icon className="absolute -bottom-2 -right-2 h-8 w-8 text-gray-500 drop-shadow-md" />
                              </div>
                              <div>
                                <div className="text-sm font-medium uppercase">{labels[i]}</div>
                                <div className="text-xl font-bold">{c ? c.nome : "Aguardando dados"}</div>
                                <div className="mt-1 text-sm">
                                  <span className="font-semibold">R$ {c ? c.valorGasto.toFixed(2).replace(".", ",") : "0,00"}</span> em {c ? c.totalCompras : 0} compras
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Tabela vazia com mensagem de estado inicial */}
                  {compradoresFiltrados.length === 0 ? (
                    <div className="text-center py-12 border border-gray-700 rounded-lg bg-gray-800/50">
                      <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-200 mb-1">Nenhum comprador registrado</h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Quando os clientes começarem a comprar rifas, eles aparecerão aqui no ranking de compradores.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Total Compras</TableHead>
                          <TableHead>Valor Gasto</TableHead>
                          <TableHead>Última Compra</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {compradoresFiltrados.map((comprador, index) => (
                          <TableRow key={comprador.id}>
                            <TableCell>
                              <div className="flex items-center">
                                {index === 0 ? (
                                  <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                                ) : index === 1 ? (
                                  <Medal className="h-5 w-5 text-slate-400 mr-2" />
                                ) : index === 2 ? (
                                  <Award className="h-5 w-5 text-amber-600 mr-2" />
                                ) : (
                                  <span className="font-medium text-muted-foreground mr-2">{index + 1}º</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comprador.avatar || "/placeholder.svg"} alt="Avatar" />
                                  <AvatarFallback>
                                    {comprador.nome
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{comprador.nome}</div>
                                  <div className="text-xs text-muted-foreground">{comprador.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{comprador.totalCompras}</TableCell>
                            <TableCell>R$ {comprador.valorGasto.toFixed(2)}</TableCell>
                            <TableCell>{comprador.ultimaCompra ? new Date(comprador.ultimaCompra).toLocaleDateString("pt-BR") : "-"}</TableCell>
                            <TableCell>
                              <Badge variant={comprador.status === "ativo" ? "default" : "secondary"}>
                                {comprador.status === "ativo" ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Gift className="mr-2 h-4 w-4" /> Premiar
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Star className="mr-2 h-4 w-4" /> VIP
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="afiliados">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Ranking de Afiliados</CardTitle>
                      <CardDescription>Os afiliados que mais venderam rifas</CardDescription>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Buscar por nome ou email..."
                          className="pl-8 w-full md:w-[250px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todo o período</SelectItem>
                            <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                            <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                            <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" /> Exportar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Estado vazio para os cards de destaque */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16 border-4 border-gray-700 bg-gray-800">
                              <AvatarFallback>1º</AvatarFallback>
                            </Avatar>
                            <Crown className="absolute -bottom-2 -right-2 h-8 w-8 text-gray-500 drop-shadow-md" />
                          </div>
                          <div>
                            <div className="text-sm font-medium uppercase">1º Lugar</div>
                            <div className="text-xl font-bold">Aguardando dados</div>
                            <div className="mt-1 text-sm">
                              <span className="font-semibold">R$ 0,00</span> em 0 vendas
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16 border-4 border-gray-700 bg-gray-800">
                              <AvatarFallback>2º</AvatarFallback>
                            </Avatar>
                            <Medal className="absolute -bottom-2 -right-2 h-8 w-8 text-gray-500 drop-shadow-md" />
                          </div>
                          <div>
                            <div className="text-sm font-medium uppercase">2º Lugar</div>
                            <div className="text-xl font-bold">Aguardando dados</div>
                            <div className="mt-1 text-sm">
                              <span className="font-semibold">R$ 0,00</span> em 0 vendas
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16 border-4 border-gray-700 bg-gray-800">
                              <AvatarFallback>3º</AvatarFallback>
                            </Avatar>
                            <Award className="absolute -bottom-2 -right-2 h-8 w-8 text-gray-500 drop-shadow-md" />
                          </div>
                          <div>
                            <div className="text-sm font-medium uppercase">3º Lugar</div>
                            <div className="text-xl font-bold">Aguardando dados</div>
                            <div className="mt-1 text-sm">
                              <span className="font-semibold">R$ 0,00</span> em 0 vendas
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabela vazia com mensagem de estado inicial */}
                  {afiliadosFiltrados.length === 0 ? (
                    <div className="text-center py-12 border border-gray-700 rounded-lg bg-gray-800/50">
                      <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-200 mb-1">Nenhum afiliado registrado</h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Quando os afiliados começarem a vender rifas, eles aparecerão aqui no ranking de afiliados.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Afiliado</TableHead>
                          <TableHead>Total Vendas</TableHead>
                          <TableHead>Valor Vendas</TableHead>
                          <TableHead>Comissão</TableHead>
                          <TableHead>Última Venda</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {afiliadosFiltrados.map((afiliado, index) => (
                          <TableRow key={afiliado.id}>
                            <TableCell>
                              <div className="flex items-center">
                                {index === 0 ? (
                                  <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                                ) : index === 1 ? (
                                  <Medal className="h-5 w-5 text-slate-400 mr-2" />
                                ) : index === 2 ? (
                                  <Award className="h-5 w-5 text-amber-600 mr-2" />
                                ) : (
                                  <span className="font-medium text-muted-foreground mr-2">{index + 1}º</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={afiliado.avatar || "/placeholder.svg"} alt="Avatar" />
                                  <AvatarFallback>
                                    {afiliado.nome
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{afiliado.nome}</div>
                                  <div className="text-xs text-muted-foreground">{afiliado.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{afiliado.totalVendas}</TableCell>
                            <TableCell>R$ {afiliado.valorVendas.toFixed(2).replace(".", ",")}</TableCell>
                            <TableCell>R$ {afiliado.comissao.toFixed(2).replace(".", ",")}</TableCell>
                            <TableCell>{afiliado.ultimaVenda ? new Date(afiliado.ultimaVenda).toLocaleDateString("pt-BR") : "-"}</TableCell>
                            <TableCell>
                              <Badge variant={afiliado.status === "ativo" ? "default" : "secondary"}>
                                {afiliado.status === "ativo" ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Gift className="mr-2 h-4 w-4" /> Bonificar
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Star className="mr-2 h-4 w-4" /> Destaque
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rifas">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Ranking de Rifas</CardTitle>
                      <CardDescription>As rifas mais vendidas e populares</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrar por período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todo o período</SelectItem>
                          <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                          <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                          <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Exportar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Estado vazio para os cards de destaque */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700">
                              <ShoppingCart className="h-8 w-8 text-gray-500" />
                            </div>
                            <Trophy className="absolute -bottom-2 -right-2 h-8 w-8 text-gray-500 drop-shadow-md" />
                          </div>
                          <div>
                            <div className="text-sm font-medium uppercase">1º Lugar</div>
                            <div className="text-xl font-bold">Aguardando dados</div>
                            <div className="mt-1 text-sm">
                              <span className="font-semibold">R$ 0,00</span> em 0 cotas
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700">
                              <ShoppingCart className="h-8 w-8 text-gray-500" />
                            </div>
                            <Medal className="absolute -bottom-2 -right-2 h-8 w-8 text-gray-500 drop-shadow-md" />
                          </div>
                          <div>
                            <div className="text-sm font-medium uppercase">2º Lugar</div>
                            <div className="text-xl font-bold">Aguardando dados</div>
                            <div className="mt-1 text-sm">
                              <span className="font-semibold">R$ 0,00</span> em 0 cotas
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700">
                              <ShoppingCart className="h-8 w-8 text-gray-500" />
                            </div>
                            <Award className="absolute -bottom-2 -right-2 h-8 w-8 text-gray-500 drop-shadow-md" />
                          </div>
                          <div>
                            <div className="text-sm font-medium uppercase">3º Lugar</div>
                            <div className="text-xl font-bold">Aguardando dados</div>
                            <div className="mt-1 text-sm">
                              <span className="font-semibold">R$ 0,00</span> em 0 cotas
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabela vazia com mensagem de estado inicial */}
                  {rifasData.length === 0 ? (
                    <div className="text-center py-12 border border-gray-700 rounded-lg bg-gray-800/50">
                      <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-200 mb-1">Nenhuma rifa registrada</h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Quando as rifas começarem a ser vendidas, elas aparecerão aqui no ranking de rifas.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Rifa</TableHead>
                          <TableHead>Cotas Vendidas</TableHead>
                          <TableHead>Total Cotas</TableHead>
                          <TableHead>% Preenchimento</TableHead>
                          <TableHead>Valor Arrecadado</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rifasData
                          .sort((a, b) => b.valorArrecadado - a.valorArrecadado)
                          .map((rifa, index) => (
                            <TableRow key={rifa.id}>
                              <TableCell>
                                <div className="flex items-center">
                                  {index === 0 ? (
                                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                                  ) : index === 1 ? (
                                    <Medal className="h-5 w-5 text-slate-400 mr-2" />
                                  ) : index === 2 ? (
                                    <Award className="h-5 w-5 text-amber-600 mr-2" />
                                  ) : (
                                    <span className="font-medium text-muted-foreground mr-2">{index + 1}º</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{rifa.titulo}</div>
                                  <div className="text-xs text-muted-foreground">{rifa.descricao}</div>
                                </div>
                              </TableCell>
                              <TableCell>{rifa.cotasVendidas}</TableCell>
                              <TableCell>{rifa.totalCotas}</TableCell>
                              <TableCell>{rifa.totalCotas > 0 ? ((rifa.cotasVendidas / rifa.totalCotas) * 100).toFixed(1) : "0"}%</TableCell>
                              <TableCell>R$ {rifa.valorArrecadado.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant={rifa.status === "ativa" ? "default" : "secondary"}>
                                  {rifa.status === "ativa" ? "Ativa" : "Finalizada"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
