"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminConfiguracao from "@/components/admin/admin-configuracao"
import { Loader2, PlusCircle, Users, ShoppingCart, BarChart3, Eye, Info, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AdminLayout from "@/components/admin/admin-layout"
import AdminHeader from "@/components/admin/admin-header"
import { listarCampanhas, excluirCampanha, type Campanha } from "@/lib/campanhas-store"
import { listarClientes, listarPedidos, listarAfiliados } from "@/lib/gateway-store"
import AdminPagamentos from "@/components/admin/admin-pagamentos"
import AdminIntegracoes from "@/components/admin/admin-integracoes"
import AdminAfiliados from "@/components/admin/admin-afiliados"
import AdminRelatorios from "@/components/admin/admin-relatorios"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("rifas")
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [buscarCampanhaId, setBuscarCampanhaId] = useState("")
  const [buscarNumero, setBuscarNumero] = useState("")
  const [rankingCampanhaId, setRankingCampanhaId] = useState("")
  const [pedidos, setPedidos] = useState<any[]>([])
  const [afiliados, setAfiliados] = useState<any[]>([])

  const carregarCampanhas = useCallback(() => {
    const dados = listarCampanhas()
    setCampanhas(dados)
  }, [])

  const carregarPedidos = useCallback(() => {
    setPedidos(listarPedidos())
  }, [])

  const carregarAfiliados = useCallback(() => {
    setAfiliados(listarAfiliados())
  }, [])

  useEffect(() => {
    // Verificar se o usuario esta autenticado como admin
    const adminData = localStorage.getItem("admin")

    if (!adminData) {
      router.push("/admin")
      return
    }

    try {
      const admin = JSON.parse(adminData)

      if (!admin || !admin.isAdmin) {
        localStorage.removeItem("admin")
        router.push("/admin")
        return
      }

      const loginTime = admin.loginTime || 0
      const currentTime = new Date().getTime()
      const hoursPassed = (currentTime - loginTime) / (1000 * 60 * 60)

      if (hoursPassed > 24) {
        localStorage.removeItem("admin")
        router.push("/admin")
        return
      }

      setIsLoading(false)
      carregarCampanhas()
      carregarPedidos()
      carregarAfiliados()
    } catch (error) {
      localStorage.removeItem("admin")
      router.push("/admin")
    }
  }, [router, carregarCampanhas, carregarPedidos, carregarAfiliados])

  // Listen for campanhas-updated events and storage changes
  useEffect(() => {
    const handleUpdate = () => carregarCampanhas()
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "campanhas") carregarCampanhas()
    }
    window.addEventListener("campanhas-updated", handleUpdate)
    window.addEventListener("storage", handleStorage)
    const timer = setTimeout(carregarCampanhas, 500)
    return () => {
      window.removeEventListener("campanhas-updated", handleUpdate)
      window.removeEventListener("storage", handleStorage)
      clearTimeout(timer)
    }
  }, [carregarCampanhas])

  // Listen for pedidos-updated events
  useEffect(() => {
    const handleUpdate = () => carregarPedidos()
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "pedidos") carregarPedidos()
    }
    window.addEventListener("pedidos-updated", handleUpdate)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("pedidos-updated", handleUpdate)
      window.removeEventListener("storage", handleStorage)
    }
  }, [carregarPedidos])

  // Listen for afiliados-updated events
  useEffect(() => {
    const handleUpdate = () => carregarAfiliados()
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "afiliados") carregarAfiliados()
    }
    window.addEventListener("afiliados-updated", handleUpdate)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("afiliados-updated", handleUpdate)
      window.removeEventListener("storage", handleStorage)
    }
  }, [carregarAfiliados])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB800]" />
      </div>
    )
  }

  // Computed stats from real data
  const totalCampanhas = campanhas.length
  const campanhasAtivas = campanhas.filter((c) => c.statusCampanha === "Ativo")
  const totalCotasVendidas = campanhas.reduce((sum, c) => sum + (c.cotasVendidas || 0), 0)
  const totalClientes = listarClientes().length
  const faturamento = campanhas.reduce((sum, c) => {
    const preco = parseFloat(c.valorPorCota) || 0
    return sum + preco * (c.cotasVendidas || 0)
  }, 0)

  const handleExcluirCampanha = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta campanha?")) {
      excluirCampanha(id)
      carregarCampanhas()
    }
  }

  const renderDashboardContent = () => (
    <>
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buscar Ganhador */}
          <div className="bg-[#171923] rounded-lg p-6 shadow-md">
            <h2 className="text-sm font-semibold uppercase text-gray-400 mb-4">BUSCAR GANHADOR</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-1">Campanha</label>
                <Select value={buscarCampanhaId} onValueChange={setBuscarCampanhaId}>
                  <SelectTrigger className="w-full bg-[#1A202C] border-0 text-white h-10">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2D3748] border-0">
                    {campanhas.length === 0 ? (
                      <SelectItem value="sem-dados">Nenhuma campanha disponivel</SelectItem>
                    ) : (
                      campanhas.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.titulo || "Sem titulo"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-1/3">
                <label className="block text-xs font-medium text-gray-400 mb-1">Numero</label>
                <Input
                  type="text"
                  placeholder="Digite o numero"
                  className="w-full bg-[#1A202C] border-0 text-white h-10"
                  value={buscarNumero}
                  onChange={(e) => setBuscarNumero(e.target.value)}
                />
              </div>
              <div className="md:w-auto self-end">
                <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium h-10 px-6">Buscar</Button>
              </div>
            </div>
          </div>

          {/* Ranking de Compradores */}
          <div className="bg-[#171923] rounded-lg p-6 shadow-md">
            <h2 className="text-sm font-semibold uppercase text-gray-400 mb-4">RANKING DE COMPRADORES</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-1">Campanha</label>
                <Select value={rankingCampanhaId} onValueChange={setRankingCampanhaId}>
                  <SelectTrigger className="w-full bg-[#1A202C] border-0 text-white h-10">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2D3748] border-0">
                    {campanhas.length === 0 ? (
                      <SelectItem value="sem-dados">Nenhuma campanha disponivel</SelectItem>
                    ) : (
                      campanhas.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.titulo || "Sem titulo"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-1/3">
                <label className="block text-xs font-medium text-gray-400 mb-1">Quantidade</label>
                <Select>
                  <SelectTrigger className="w-full bg-[#1A202C] border-0 text-white h-10">
                    <SelectValue placeholder="1" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2D3748] border-0">
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-auto self-end">
                <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium h-10 px-6">
                  Gerar lista
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de estatisticas - dados reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-[#171923] rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#00B5D8] flex items-center justify-center mr-4">
              <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Campanhas</h3>
              <p className="text-2xl font-bold text-white">{totalCampanhas}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#171923] rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#F56565] flex items-center justify-center mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Clientes</h3>
              <p className="text-2xl font-bold text-white">{totalClientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#171923] rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#4299E1] flex items-center justify-center mr-4">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Pedidos</h3>
              <p className="text-2xl font-bold text-white">{totalCotasVendidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#171923] rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#38B2AC] flex items-center justify-center mr-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Faturamento</h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-white mr-2">
                  R$ {faturamento.toFixed(2).replace(".", ",")}
                </p>
                <Eye className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteudo das abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="rifas">Rifas</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="integracoes">Integracoes</TabsTrigger>
          <TabsTrigger value="afiliados">Afiliados</TabsTrigger>
          <TabsTrigger value="relatorios">Relatorios</TabsTrigger>
          <TabsTrigger value="configuracao">Configuracao</TabsTrigger>
        </TabsList>

        <TabsContent value="rifas">
          <div className="bg-[#171923] rounded-lg p-6 shadow-md">
            {campanhas.length === 0 ? (
              <div className="text-center py-16">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white">Nenhuma rifa cadastrada</h3>
                <p className="text-gray-400 mb-6">Voce ainda nao possui rifas cadastradas no sistema.</p>
                <Button
                  className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium"
                  onClick={() => router.push("/admin/campanhas/new")}
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Criar Primeira Rifa
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {campanhas.length} campanha{campanhas.length !== 1 ? "s" : ""} cadastrada{campanhas.length !== 1 ? "s" : ""}
                  </h3>
                  <Button
                    className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium"
                    onClick={() => router.push("/admin/campanhas/new")}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Nova Rifa
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Campanha</TableHead>
                      <TableHead className="text-gray-300">Valor</TableHead>
                      <TableHead className="text-gray-300">Cotas</TableHead>
                      <TableHead className="text-gray-300">Vendidas</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300 text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campanhas.map((c) => (
                      <TableRow key={c.id} className="border-gray-700 hover:bg-[#1A1E2A]">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {c.imagemPrincipal ? (
                              <img src={c.imagemPrincipal} alt={c.titulo} className="w-10 h-10 rounded object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                                Img
                              </div>
                            )}
                            <div>
                              <p className="text-white font-medium">{c.titulo || "Sem titulo"}</p>
                              <p className="text-gray-500 text-xs">{c.subtitulo || ""}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          R$ {parseFloat(c.valorPorCota || "0").toFixed(2).replace(".", ",")}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {parseInt(c.quantidadeNumeros || "0").toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-gray-300">{c.cotasVendidas || 0}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              c.statusCampanha === "Ativo"
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                            }
                          >
                            {c.statusCampanha}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#FFB800]/20">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#171923] border-gray-700 text-white">
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#FFB800]/20"
                                onClick={() => router.push(`/rifas/${c.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" /> Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-[#FFB800]/20"
                                onClick={() => router.push(`/admin/campanhas/new?edit=${c.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-700" />
                              <DropdownMenuItem
                                className="cursor-pointer text-red-500 hover:bg-red-500/20"
                                onClick={() => handleExcluirCampanha(c.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pagamentos">
          <div className="bg-[#171923] rounded-lg p-6 shadow-md">
            <AdminPagamentos />
          </div>
        </TabsContent>

        <TabsContent value="integracoes">
          <div className="bg-[#171923] rounded-lg p-6 shadow-md">
            <AdminIntegracoes />
          </div>
        </TabsContent>

        <TabsContent value="afiliados">
          <div className="bg-[#171923] rounded-lg p-6 shadow-md">
            <AdminAfiliados />
          </div>
        </TabsContent>

        <TabsContent value="relatorios">
          <div className="bg-[#171923] rounded-lg p-6 shadow-md">
            <AdminRelatorios />
          </div>
        </TabsContent>

        <TabsContent value="configuracao">
          <AdminConfiguracao />
        </TabsContent>
      </Tabs>
    </>
  )

  return (
    <AdminLayout>
      <div className="p-8">
        <AdminHeader title="Dashboard" subtitle="Visao geral do sistema" />
        {renderDashboardContent()}
      </div>
    </AdminLayout>
  )
}
