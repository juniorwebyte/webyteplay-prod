"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Award, Users, BarChart3 } from "lucide-react"
import { listarCampanhas, excluirCampanha, type Campanha } from "@/lib/campanhas-store"

export default function AdminRifas() {
  const router = useRouter()
  const [rifas, setRifas] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("listar")
  const [isLoading, setIsLoading] = useState(true)

  const carregarRifas = () => {
    try {
      const campanhas = listarCampanhas()
      const mapped = campanhas.map((c) => ({
        id: c.id,
        titulo: c.titulo || "Sem titulo",
        preco: parseFloat(c.valorPorCota) || 0,
        totalCotas: parseInt(c.quantidadeNumeros) || 0,
        cotasVendidas: c.cotasVendidas || 0,
        status: c.statusCampanha === "Ativo" ? "ativa" : "finalizada",
        dataFim: c.dataInicio || c.criadoEm || "",
      }))
      setRifas(mapped)
    } catch (err) {
      console.error("Erro ao carregar rifas:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarRifas()
    const handleUpdate = () => carregarRifas()
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "campanhas") carregarRifas()
    }
    window.addEventListener("campanhas-updated", handleUpdate)
    window.addEventListener("storage", handleStorage)
    const timer = setTimeout(carregarRifas, 500)
    return () => {
      window.removeEventListener("campanhas-updated", handleUpdate)
      window.removeEventListener("storage", handleStorage)
      clearTimeout(timer)
    }
  }, [])

  // Redirect "criar" tab to the proper campanhas/new page
  useEffect(() => {
    if (activeTab === "criar") {
      router.push("/admin/campanhas/new")
    }
  }, [activeTab, router])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="listar">Listar Rifas</TabsTrigger>
        <TabsTrigger value="criar">Criar Nova Rifa</TabsTrigger>
        <TabsTrigger value="fazendinha">Sistema de Fazendinha</TabsTrigger>
      </TabsList>

      <TabsContent value="listar">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Rifas</CardTitle>
            <CardDescription>Visualize, edite ou exclua as rifas existentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Input placeholder="Buscar rifas..." className="max-w-sm" />
              <Button onClick={() => router.push("/admin/campanhas/new")}>
                <Plus className="mr-2 h-4 w-4" /> Nova Rifa
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : rifas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titulo</TableHead>
                    <TableHead>Preco</TableHead>
                    <TableHead>Cotas</TableHead>
                    <TableHead>Vendidas</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rifas.map((rifa) => (
                    <TableRow key={rifa.id}>
                      <TableCell className="font-medium">{rifa.titulo}</TableCell>
                      <TableCell>R$ {rifa.preco.toFixed(2).replace(".", ",")}</TableCell>
                      <TableCell>{rifa.totalCotas.toLocaleString("pt-BR")}</TableCell>
                      <TableCell>{rifa.cotasVendidas}</TableCell>
                      <TableCell>{rifa.dataFim ? new Date(rifa.dataFim).toLocaleDateString("pt-BR") : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={rifa.status === "ativa" ? "default" : "secondary"}>
                          {rifa.status === "ativa" ? "Ativa" : "Finalizada"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" title="Visualizar" onClick={() => router.push(`/rifas/${rifa.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" title="Editar" onClick={() => router.push(`/admin/campanhas/new?edit=${rifa.id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            title="Excluir"
                            onClick={() => {
                              if (window.confirm("Tem certeza que deseja excluir esta rifa?")) {
                                excluirCampanha(rifa.id)
                                carregarRifas()
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-20 bg-black/10 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold mb-2">Nenhuma rifa cadastrada</h3>
                <p className="text-gray-500 mb-6">Crie sua primeira rifa para comecar.</p>
                <Button onClick={() => router.push("/admin/campanhas/new")}>
                  <Plus className="mr-2 h-4 w-4" /> Criar Primeira Rifa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="criar">
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-gray-400">Redirecionando para criacao de campanha...</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fazendinha">
        <Card>
          <CardHeader>
            <CardTitle>Sistema de Fazendinha</CardTitle>
            <CardDescription>Configure o sistema de Fazendinha com meio bicho ou bicho inteiro.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tipoFazendinha">Tipo de Jogo</Label>
                  <Select defaultValue="bichoInteiro">
                    <SelectTrigger id="tipoFazendinha">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bichoInteiro">Bicho Inteiro</SelectItem>
                      <SelectItem value="meioBicho">Meio Bicho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precoFazendinha">Preco por Bilhete (R$)</Label>
                  <Input id="precoFazendinha" type="number" min="1" step="0.5" placeholder="Ex: 5.00" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Animais Disponiveis</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    "Avestruz", "Aguia", "Burro", "Borboleta", "Cachorro", "Cabra",
                    "Carneiro", "Camelo", "Cobra", "Coelho", "Cavalo", "Elefante",
                    "Galo", "Gato", "Jacare", "Leao", "Macaco", "Porco",
                    "Pavao", "Peru", "Touro", "Tigre", "Urso", "Veado",
                  ].map((animal, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Switch id={`animal-${index}`} defaultChecked />
                      <Label htmlFor={`animal-${index}`}>{animal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="premiosFazendinha">Premios</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="premio1">1o Premio</Label>
                    <Input id="premio1" placeholder="Valor ou descricao do premio" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premio2">2o Premio</Label>
                    <Input id="premio2" placeholder="Valor ou descricao do premio" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premio3">3o Premio</Label>
                    <Input id="premio3" placeholder="Valor ou descricao do premio" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premio4">4o Premio</Label>
                    <Input id="premio4" placeholder="Valor ou descricao do premio" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFimFazendinha">Data do Sorteio</Label>
                <Input id="dataFimFazendinha" type="date" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="ativarFazendinha" />
                <Label htmlFor="ativarFazendinha">Ativar Sistema de Fazendinha</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Salvar Configuracoes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
