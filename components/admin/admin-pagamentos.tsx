"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Filter, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { listarPedidos, type Pedido } from "@/lib/gateway-store"
import { formatarValor } from "@/lib/formatadores"

export default function AdminPagamentos() {
  const [pagamentos, setPagamentos] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [busca, setBusca] = useState("")

  const carregarPagamentos = useCallback(() => {
    const todos = listarPedidos()
    setPagamentos(todos)
  }, [])

  useEffect(() => {
    carregarPagamentos()
    const handleUpdate = () => carregarPagamentos()
    const onStorage = (e: StorageEvent) => { if (e.key === "pedidos") carregarPagamentos() }
    window.addEventListener("pedidos-updated", handleUpdate)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("pedidos-updated", handleUpdate)
      window.removeEventListener("storage", onStorage)
    }
  }, [carregarPagamentos])

  const filtrarPorStatus = (status: string) => {
    return pagamentos.filter((p) => {
      if (status === "todos") return true
      if (status === "aprovados") return p.status === "pago"
      if (status === "pendentes") return p.status === "pendente"
      if (status === "recusados") return p.status === "expirado"
      return true
    }).filter((p) => {
      if (!busca) return true
      const buscaLower = busca.toLowerCase()
      return (
        p.nomeComprador.toLowerCase().includes(buscaLower) ||
        p.campanhaTitulo.toLowerCase().includes(buscaLower) ||
        p.id.toLowerCase().includes(buscaLower)
      )
    })
  }

  const pagamentosFiltrados = filtrarPorStatus(filtroStatus)

  return (
    <Tabs value={filtroStatus} onValueChange={setFiltroStatus} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="todos">Todos</TabsTrigger>
        <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
        <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
        <TabsTrigger value="recusados">Recusados</TabsTrigger>
      </TabsList>

      <div className="flex items-center justify-between my-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar pagamento..."
              className="pl-8 w-[250px]"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Exportar
        </Button>
      </div>

      <TabsContent value="todos">
        <Card>
          <CardHeader>
            <CardTitle>Todos os Pagamentos</CardTitle>
            <CardDescription>Visualize todos os pagamentos realizados no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {pagamentosFiltrados.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Rifa</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentosFiltrados.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id.substring(0, 12)}...</TableCell>
                      <TableCell>{p.nomeComprador}</TableCell>
                      <TableCell>{p.campanhaTitulo}</TableCell>
                      <TableCell>{formatarValor(p.valorTotal)}</TableCell>
                      <TableCell>{p.criadoEm ? new Date(p.criadoEm).toLocaleDateString("pt-BR") : "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "pago"
                              ? "default"
                              : p.status === "pendente"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {p.status === "pago" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {p.status === "pendente" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {p.status === "expirado" && <XCircle className="h-3 w-3 mr-1" />}
                          {p.status === "pago" ? "Aprovado" : p.status === "pendente" ? "Pendente" : "Expirado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-20 bg-black/10 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold mb-2">Nenhum pagamento registrado</h3>
                <p className="text-gray-500">Os pagamentos aparecerão aqui quando forem realizados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="aprovados">
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Aprovados</CardTitle>
            <CardDescription>Visualize todos os pagamentos aprovados no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {filtrarPorStatus("aprovados").length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Rifa</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrarPorStatus("aprovados").map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id.substring(0, 12)}...</TableCell>
                      <TableCell>{p.nomeComprador}</TableCell>
                      <TableCell>{p.campanhaTitulo}</TableCell>
                      <TableCell>{formatarValor(p.valorTotal)}</TableCell>
                      <TableCell>{p.pagoEm ? new Date(p.pagoEm).toLocaleDateString("pt-BR") : "-"}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-20 bg-black/10 rounded-lg border border-gray-200">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold mb-2">Nenhum pagamento aprovado</h3>
                <p className="text-gray-500">Os pagamentos aprovados aparecerão aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pendentes">
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Pendentes</CardTitle>
            <CardDescription>Visualize todos os pagamentos pendentes no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {filtrarPorStatus("pendentes").length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Rifa</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrarPorStatus("pendentes").map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id.substring(0, 12)}...</TableCell>
                      <TableCell>{p.nomeComprador}</TableCell>
                      <TableCell>{p.campanhaTitulo}</TableCell>
                      <TableCell>{formatarValor(p.valorTotal)}</TableCell>
                      <TableCell>{p.expiraEm ? new Date(p.expiraEm).toLocaleDateString("pt-BR") : "-"}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-20 bg-black/10 rounded-lg border border-gray-200">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold mb-2">Nenhum pagamento pendente</h3>
                <p className="text-gray-500">Os pagamentos pendentes aparecerão aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recusados">
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Expirados</CardTitle>
            <CardDescription>Visualize todos os pagamentos expirados no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {filtrarPorStatus("recusados").length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Rifa</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Expirou em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrarPorStatus("recusados").map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id.substring(0, 12)}...</TableCell>
                      <TableCell>{p.nomeComprador}</TableCell>
                      <TableCell>{p.campanhaTitulo}</TableCell>
                      <TableCell>{formatarValor(p.valorTotal)}</TableCell>
                      <TableCell>{p.expiraEm ? new Date(p.expiraEm).toLocaleDateString("pt-BR") : "-"}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-20 bg-black/10 rounded-lg border border-gray-200">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold mb-2">Nenhum pagamento expirado</h3>
                <p className="text-gray-500">Os pagamentos expirados aparecerão aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
