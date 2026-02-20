"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react"
import AdminLayout from "@/components/admin/admin-layout"
import AdminHeader from "@/components/admin/admin-header"
import { listarPedidos, confirmarPagamento, type Pedido } from "@/lib/gateway-store"

export default function PedidosPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  const carregar = useCallback(() => {
    setPedidos(listarPedidos().sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()))
  }, [])

  useEffect(() => {
    const adminData = localStorage.getItem("admin")
    if (!adminData) { router.push("/admin"); return }
    try {
      const admin = JSON.parse(adminData)
      if (!admin?.isAdmin) { router.push("/admin"); return }
      const hours = (Date.now() - (admin.loginTime || 0)) / 3600000
      if (hours > 24) { localStorage.removeItem("admin"); router.push("/admin"); return }
      setIsLoading(false)
      carregar()
    } catch { router.push("/admin") }
  }, [router, carregar])

  useEffect(() => {
    const handle = () => carregar()
    window.addEventListener("pedidos-updated", handle)
    window.addEventListener("storage", (e) => { if (e.key === "pedidos") carregar() })
    const interval = setInterval(carregar, 5000)
    return () => { window.removeEventListener("pedidos-updated", handle); clearInterval(interval) }
  }, [carregar])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB800]" />
      </div>
    )
  }

  const pedidosPagos = pedidos.filter((p) => p.status === "pago")
  const pedidosPendentes = pedidos.filter((p) => p.status === "pendente")
  const pedidosExpirados = pedidos.filter((p) => p.status === "expirado")
  const faturamento = pedidosPagos.reduce((s, p) => s + p.valorTotal, 0)
  const cotasTotal = pedidosPagos.reduce((s, p) => s + p.quantidade, 0)

  const filteredPedidos = pedidos.filter((p) => {
    if (activeTab === "pagos" && p.status !== "pago") return false
    if (activeTab === "pendentes" && p.status !== "pendente") return false
    if (activeTab === "expirados" && p.status !== "expirado") return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return (
        p.id.toLowerCase().includes(s) ||
        p.campanhaTitulo.toLowerCase().includes(s) ||
        p.nomeComprador.toLowerCase().includes(s)
      )
    }
    return true
  })

  return (
    <AdminLayout>
      <div className="p-8">
        <AdminHeader title="Pedidos" subtitle="Gerenciar pedidos e pagamentos" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#171923] border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Aprovados</p>
                  <p className="text-xl font-bold text-white">{pedidosPagos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#171923] border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Pendentes</p>
                  <p className="text-xl font-bold text-white">{pedidosPendentes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#171923] border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00B5D8]/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#00B5D8]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Faturamento</p>
                  <p className="text-xl font-bold text-white">R$ {faturamento.toFixed(2).replace(".", ",")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#171923] border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFB800]/20 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-[#FFB800]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cotas Vendidas</p>
                  <p className="text-xl font-bold text-white">{cotasTotal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#171923] border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-white">Gerenciar Pedidos</CardTitle>
                <CardDescription className="text-gray-400">{pedidos.length} pedidos no total</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar por ID, campanha ou comprador..."
                  className="pl-8 w-full md:w-[300px] bg-[#1A202C] border-gray-700 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="todos">Todos ({pedidos.length})</TabsTrigger>
                <TabsTrigger value="pagos">Pagos ({pedidosPagos.length})</TabsTrigger>
                <TabsTrigger value="pendentes">Pendentes ({pedidosPendentes.length})</TabsTrigger>
                <TabsTrigger value="expirados">Expirados ({pedidosExpirados.length})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredPedidos.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Pedido</TableHead>
                          <TableHead className="text-gray-300">Campanha</TableHead>
                          <TableHead className="text-gray-300">Comprador</TableHead>
                          <TableHead className="text-gray-300">Cotas</TableHead>
                          <TableHead className="text-gray-300">Valor</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Data</TableHead>
                          <TableHead className="text-gray-300">Acoes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPedidos.map((p) => (
                          <TableRow key={p.id} className="border-gray-700 hover:bg-[#1A1E2A]">
                            <TableCell className="text-white font-mono text-xs">{p.id}</TableCell>
                            <TableCell className="text-gray-300 max-w-[150px]">
                              <span className="flex items-center gap-2 flex-wrap">
                                <span className="truncate">{p.campanhaTitulo}</span>
                                {p.campanhaId?.startsWith("link-") && (
                                  <Badge variant="outline" className="shrink-0 text-[10px] border-[#FFB800]/50 text-[#FFB800]">Via Link</Badge>
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-300">{p.nomeComprador || "---"}</TableCell>
                            <TableCell className="text-gray-300">{p.quantidade}</TableCell>
                            <TableCell className="text-white font-medium">
                              R$ {p.valorTotal.toFixed(2).replace(".", ",")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  p.status === "pago"
                                    ? "bg-green-500/20 text-green-400"
                                    : p.status === "pendente"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-red-500/20 text-red-400"
                                }
                              >
                                {p.status === "pago" ? "Pago" : p.status === "pendente" ? "Pendente" : "Expirado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400 text-xs">
                              {new Date(p.criadoEm).toLocaleString("pt-BR")}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {p.status === "pendente" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-green-500/20"
                                    title="Confirmar pagamento"
                                    onClick={() => {
                                      confirmarPagamento(p.id)
                                      carregar()
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
