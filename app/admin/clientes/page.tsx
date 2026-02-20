"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Eye,
  Mail,
  Phone,
  ShoppingCart,
  User,
  Users,
  UserPlus,
  ArrowLeft,
  Ticket,
} from "lucide-react"
import AdminLayout from "@/components/admin/admin-layout"
import { listarClientes, type Cliente } from "@/lib/gateway-store"
import { listarPedidos, type Pedido } from "@/lib/gateway-store"
import { formatarCPF, formatarTelefone, formatarValor } from "@/lib/formatadores"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [activeTab, setActiveTab] = useState("listar")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)

  const carregar = useCallback(() => {
    setClientes(listarClientes())
    setPedidos(listarPedidos())
  }, [])

  useEffect(() => {
    carregar()
    const handleUpdate = () => carregar()
    window.addEventListener("clientes-updated", handleUpdate)
    window.addEventListener("pedidos-updated", handleUpdate)
    const interval = setInterval(carregar, 5000)
    return () => {
      window.removeEventListener("clientes-updated", handleUpdate)
      window.removeEventListener("pedidos-updated", handleUpdate)
      clearInterval(interval)
    }
  }, [carregar])

  const totalClientes = clientes.length
  const clientesAtivos = clientes.filter((c) => c.status === "ativo").length
  const totalGasto = clientes.reduce((sum, c) => sum + c.valorGasto, 0)
  const ticketMedio = totalClientes > 0 ? totalGasto / totalClientes : 0

  const filteredClientes = clientes.filter((c) => {
    if (!searchTerm) return true
    const s = searchTerm.toLowerCase()
    return (
      c.nome.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.telefone.includes(s) ||
      c.cpf.includes(s)
    )
  })

  const pedidosDoCliente = selectedCliente
    ? pedidos.filter((p) => selectedCliente.pedidos.includes(p.id))
    : []

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-white">Clientes</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">{totalClientes}</CardTitle>
              <CardDescription className="text-gray-400">Total de Clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-400 mr-2" />
                <p className="text-sm text-gray-400">
                  <span className="text-blue-400">Cadastrados automaticamente</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">{clientesAtivos}</CardTitle>
              <CardDescription className="text-gray-400">Clientes Ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <User className="h-4 w-4 text-green-400 mr-2" />
                <p className="text-sm text-gray-400">
                  {totalClientes > 0 ? Math.round((clientesAtivos / totalClientes) * 100) : 0}% do total
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">
                {formatarValor(totalGasto)}
              </CardTitle>
              <CardDescription className="text-gray-400">Valor Total Gasto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingCart className="h-4 w-4 text-green-400 mr-2" />
                <p className="text-sm text-gray-400">Total de compras</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">
                {formatarValor(ticketMedio)}
              </CardTitle>
              <CardDescription className="text-gray-400">Ticket Medio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserPlus className="h-4 w-4 text-blue-400 mr-2" />
                <p className="text-sm text-gray-400">Por cliente</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="listar">Listar Clientes</TabsTrigger>
            <TabsTrigger value="detalhes" disabled={!selectedCliente}>
              {selectedCliente ? `Detalhes: ${selectedCliente.nome}` : "Detalhes do Cliente"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listar">
            <Card className="bg-[#171923] border-gray-800">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">Gerenciar Clientes</CardTitle>
                    <CardDescription className="text-gray-400">
                      Clientes sao cadastrados automaticamente ao confirmar pagamento
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Buscar por nome, email, CPF ou telefone..."
                      className="pl-8 w-full md:w-[300px] bg-[#0F1117] border-gray-700 text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredClientes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Cliente</TableHead>
                          <TableHead className="text-gray-300">Contato</TableHead>
                          <TableHead className="text-gray-300">CPF</TableHead>
                          <TableHead className="text-gray-300">Cadastro</TableHead>
                          <TableHead className="text-gray-300">Ult. Compra</TableHead>
                          <TableHead className="text-gray-300">Compras</TableHead>
                          <TableHead className="text-gray-300">Valor Gasto</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Acoes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClientes.map((cliente) => (
                          <TableRow key={cliente.id} className="border-gray-700 hover:bg-[#1A1E2A]">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-[#FFB800]/20 text-[#FFB800] text-xs">
                                    {cliente.nome
                                      .split(" ")
                                      .slice(0, 2)
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="font-medium text-white">{cliente.nome}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1 text-gray-500" />
                                  <span className="text-xs text-gray-300">{cliente.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1 text-gray-500" />
                                  <span className="text-xs text-gray-300">{formatarTelefone(cliente.telefone || "")}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300 text-sm font-mono">{formatarCPF(cliente.cpf || "")}</TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {new Date(cliente.dataCadastro).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {new Date(cliente.ultimaCompra).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-white font-medium">{cliente.totalCompras}</TableCell>
                            <TableCell className="text-green-400 font-medium">
                              {formatarValor(cliente.valorGasto)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  cliente.status === "ativo"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-gray-500/20 text-gray-400"
                                }
                              >
                                {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-[#FFB800]/20"
                                title="Ver detalhes"
                                onClick={() => {
                                  setSelectedCliente(cliente)
                                  setActiveTab("detalhes")
                                }}
                              >
                                <Eye className="h-4 w-4 text-gray-400" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-black/20 rounded-lg border border-gray-800">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2 text-white">Nenhum cliente cadastrado</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                      Clientes sao registrados automaticamente quando um pagamento e confirmado.
                      Crie campanhas e receba compras para ver os clientes aqui.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detalhes">
            {selectedCliente && (
              <Card className="bg-[#171923] border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={() => setActiveTab("listar")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                    </Button>
                    <div>
                      <CardTitle className="text-white">{selectedCliente.nome}</CardTitle>
                      <CardDescription className="text-gray-400">
                        Cliente desde {new Date(selectedCliente.dataCadastro).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Client info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-500 text-xs mb-1">CPF</p>
                      <p className="text-white font-mono">{formatarCPF(selectedCliente.cpf || "")}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-500 text-xs mb-1">E-mail</p>
                      <p className="text-white text-sm">{selectedCliente.email}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-500 text-xs mb-1">Telefone</p>
                      <p className="text-white">{formatarTelefone(selectedCliente.telefone || "")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                      <p className="text-gray-500 text-xs mb-1">Total de Compras</p>
                      <p className="text-2xl font-bold text-white">{selectedCliente.totalCompras}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                      <p className="text-gray-500 text-xs mb-1">Valor Gasto</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatarValor(selectedCliente.valorGasto)}
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 text-center">
                      <p className="text-gray-500 text-xs mb-1">Ultima Compra</p>
                      <p className="text-lg font-bold text-white">
                        {new Date(selectedCliente.ultimaCompra).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {/* Pedidos */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Historico de Pedidos</h3>
                    {pedidosDoCliente.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-gray-300">Pedido</TableHead>
                            <TableHead className="text-gray-300">Campanha</TableHead>
                            <TableHead className="text-gray-300">Cotas</TableHead>
                            <TableHead className="text-gray-300">Valor</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300">Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pedidosDoCliente.map((p) => (
                            <TableRow key={p.id} className="border-gray-700">
                              <TableCell className="text-white font-mono text-xs">{p.id}</TableCell>
                              <TableCell className="text-gray-300">{p.campanhaTitulo}</TableCell>
                              <TableCell className="text-gray-300">{p.quantidade}</TableCell>
                              <TableCell className="text-green-400 font-medium">
                                {formatarValor(p.valorTotal)}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-500/20 text-green-400">Pago</Badge>
                              </TableCell>
                              <TableCell className="text-gray-400 text-xs">
                                {new Date(p.pagoEm || p.criadoEm).toLocaleString("pt-BR")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 bg-black/20 rounded border border-gray-800">
                        <Ticket className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Nenhum pedido encontrado</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
