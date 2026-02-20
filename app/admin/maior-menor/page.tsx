"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  Loader2,
  Settings,
  BarChart2,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Tipo para as apostas maior/menor
type Aposta = {
  id: string
  usuario: string
  valor: number
  tipo: "maior" | "menor"
  multiplicador: number
  valorPossivel: number
  status: "pendente" | "ganhou" | "perdeu"
  data: string
}

// Tipo para as configurações
type Configuracao = {
  multiplicadorMaior: number
  multiplicadorMenor: number
  valorMinimo: number
  valorMaximo: number
  tempoLimite: number
  ativo: boolean
}

export default function MaiorMenorPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [apostas, setApostas] = useState<Aposta[]>([])
  const [configuracao, setConfiguracao] = useState<Configuracao>({
    multiplicadorMaior: 1.8,
    multiplicadorMenor: 1.8,
    valorMinimo: 5,
    valorMaximo: 1000,
    tempoLimite: 60,
    ativo: true,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showParticles, setShowParticles] = useState(false)
  const [activeTab, setActiveTab] = useState("apostas")
  const [valorAtual, setValorAtual] = useState(100)
  const [tendencia, setTendencia] = useState<"subindo" | "descendo" | "estavel">("estavel")
  const [historicoValores, setHistoricoValores] = useState<number[]>([95, 98, 102, 105, 103, 100])

  // Verificar autenticação
  useEffect(() => {
    const adminData = localStorage.getItem("admin")

    if (!adminData) {
      router.push("/admin")
      return
    }

    try {
      const admin = JSON.parse(adminData)
      if (!admin || !admin.isAdmin) {
        router.push("/admin")
        return
      }

      // Verificar se o login expirou (24 horas)
      const loginTime = admin.loginTime || 0
      const currentTime = new Date().getTime()
      const hoursPassed = (currentTime - loginTime) / (1000 * 60 * 60)

      if (hoursPassed > 24) {
        localStorage.removeItem("admin")
        router.push("/admin")
        return
      }

      // Carregar dados das apostas
      fetchApostas()

      // Ativar partículas após um pequeno delay
      setTimeout(() => setShowParticles(true), 500)

      // Iniciar simulação de valor flutuante
      const interval = setInterval(() => {
        simularValorFlutuante()
      }, 3000)

      return () => clearInterval(interval)
    } catch (error) {
      localStorage.removeItem("admin")
      router.push("/admin")
    }
  }, [router])

  // Função para buscar apostas (simulada)
  const fetchApostas = async () => {
    setIsLoading(true)

    // Simulando uma chamada de API - agora retornando um array vazio
    setTimeout(() => {
      const mockApostas: Aposta[] = []
      setApostas(mockApostas)
      setIsLoading(false)
    }, 1000)
  }

  // Função para simular valor flutuante
  const simularValorFlutuante = () => {
    // Gerar um valor aleatório entre -5 e +5
    const variacao = Math.random() * 10 - 5
    const novoValor = Math.max(50, Math.min(150, valorAtual + variacao))

    // Atualizar tendência
    let novaTendencia: "subindo" | "descendo" | "estavel" = "estavel"
    if (novoValor > valorAtual + 1) {
      novaTendencia = "subindo"
    } else if (novoValor < valorAtual - 1) {
      novaTendencia = "descendo"
    }

    // Atualizar histórico
    const novoHistorico = [...historicoValores, novoValor].slice(-6)

    setValorAtual(Math.round(novoValor))
    setTendencia(novaTendencia)
    setHistoricoValores(novoHistorico)
  }

  // Função para filtrar apostas
  const filteredApostas = apostas.filter((aposta) => {
    const matchesSearch =
      aposta.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aposta.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === null || aposta.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleString("pt-BR")
  }

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ganhou":
        return "bg-green-500 hover:bg-green-600"
      case "perdeu":
        return "bg-red-500 hover:bg-red-600"
      case "pendente":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  // Função para traduzir status
  const traduzirStatus = (status: string) => {
    switch (status) {
      case "ganhou":
        return "Ganhou"
      case "perdeu":
        return "Perdeu"
      case "pendente":
        return "Pendente"
      default:
        return status
    }
  }

  // Função para traduzir tipo
  const traduzirTipo = (tipo: string) => {
    switch (tipo) {
      case "maior":
        return "Maior"
      case "menor":
        return "Menor"
      default:
        return tipo
    }
  }

  // Renderizar partículas
  const renderParticles = () => {
    const particles = []
    for (let i = 0; i < 20; i++) {
      const left = Math.random() * 100
      const top = Math.random() * 100
      const size = Math.random() * 3 + 1
      const delay = Math.random() * 5
      const duration = Math.random() * 10 + 5
      const isGreen = Math.random() > 0.7

      particles.push(
        <div
          key={i}
          className={`particle ${isGreen ? "green" : ""}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />,
      )
    }
    return particles
  }

  // Função para salvar configurações
  const salvarConfiguracoes = () => {
    // Aqui seria implementada a lógica para salvar as configurações
    alert("Configurações salvas com sucesso!")
  }

  return (
    <div className="flex h-screen bg-[#0F1117] overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 overflow-auto relative">
        {showParticles && <div className="particles absolute inset-0 pointer-events-none">{renderParticles()}</div>}

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white animated-text">Sistema Maior e Menor</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-[#171923] border-gray-800 shadow-lg overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Valor Atual</CardTitle>
                <CardDescription>Valor de referência para apostas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-5xl font-bold text-white flex items-center">
                    {tendencia === "subindo" && <ChevronUp className="text-green-500 h-8 w-8 mr-2" />}
                    {tendencia === "descendo" && <ChevronDown className="text-red-500 h-8 w-8 mr-2" />}
                    {valorAtual}
                  </div>
                </div>
                <div className="mt-4 h-16">
                  <div className="flex items-end justify-between h-full">
                    {historicoValores.map((valor, index) => (
                      <div
                        key={index}
                        className="w-8 bg-gradient-to-t from-purple-600 to-accent rounded-t-sm"
                        style={{ height: `${(valor / 150) * 100}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#171923] border-gray-800 shadow-lg overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Estatísticas</CardTitle>
                <CardDescription>Resumo das apostas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1A1E2A] p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Total de apostas</p>
                    <p className="text-2xl font-bold text-white">{apostas.length}</p>
                  </div>
                  <div className="bg-[#1A1E2A] p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Valor apostado</p>
                    <p className="text-2xl font-bold text-white">
                      R$ {apostas.reduce((sum, aposta) => sum + aposta.valor, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-[#1A1E2A] p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Apostas ganhas</p>
                    <p className="text-2xl font-bold text-green-500">
                      {apostas.filter((a) => a.status === "ganhou").length}
                    </p>
                  </div>
                  <div className="bg-[#1A1E2A] p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Apostas perdidas</p>
                    <p className="text-2xl font-bold text-red-500">
                      {apostas.filter((a) => a.status === "perdeu").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#171923] border-gray-800 shadow-lg overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Ações Rápidas</CardTitle>
                <CardDescription>Gerenciamento do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sistema-ativo" className="text-white">
                      Sistema ativo
                    </Label>
                    <Switch
                      id="sistema-ativo"
                      checked={configuracao.ativo}
                      onCheckedChange={(checked) => setConfiguracao({ ...configuracao, ativo: checked })}
                    />
                  </div>
                  <Button
                    className="w-full bg-[#FFB800] hover:bg-[#FFA500] text-black"
                    onClick={() => setActiveTab("configuracoes")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Button>
                  <Button className="w-full" variant="outline">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Relatório Detalhado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="apostas">Apostas</TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="apostas">
              <Card className="bg-[#171923] rounded-lg shadow-lg p-6 mb-6 border border-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0F1117] opacity-50"></div>

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        placeholder="Buscar apostas..."
                        className="pl-10 bg-[#0F1117] border-gray-700 text-white focus:border-accent focus:ring-accent transition-all duration-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-gray-700 text-gray-300 hover:border-accent hover:text-white transition-colors duration-300"
                        >
                          <Filter className="mr-2 h-4 w-4" />
                          Filtrar por Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#171923] border-gray-700 text-white">
                        <DropdownMenuItem
                          onClick={() => setStatusFilter(null)}
                          className="hover:bg-accent/20 transition-colors duration-200"
                        >
                          Todos
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("ganhou")}
                          className="hover:bg-accent/20 transition-colors duration-200"
                        >
                          Ganhou
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("perdeu")}
                          className="hover:bg-accent/20 transition-colors duration-200"
                        >
                          Perdeu
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("pendente")}
                          className="hover:bg-accent/20 transition-colors duration-200"
                        >
                          Pendente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-[#FFB800]" />
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-700 hover:bg-[#1A1E2A]">
                              <TableHead className="text-gray-300">ID</TableHead>
                              <TableHead className="text-gray-300">Usuário</TableHead>
                              <TableHead className="text-gray-300">
                                <div className="flex items-center">
                                  Valor
                                  <ArrowUpDown className="ml-2 h-4 w-4" />
                                </div>
                              </TableHead>
                              <TableHead className="text-gray-300">Tipo</TableHead>
                              <TableHead className="text-gray-300">Multiplicador</TableHead>
                              <TableHead className="text-gray-300">Possível Ganho</TableHead>
                              <TableHead className="text-gray-300">Status</TableHead>
                              <TableHead className="text-gray-300">Data</TableHead>
                              <TableHead className="text-gray-300 text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredApostas.length === 0 ? (
                              <TableRow className="border-gray-700 hover:bg-[#1A1E2A]">
                                <TableCell colSpan={9} className="text-center py-10 text-gray-400">
                                  Nenhuma aposta encontrada
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredApostas.map((aposta) => (
                                <TableRow
                                  key={aposta.id}
                                  className="border-gray-700 hover:bg-[#1A1E2A] transition-colors duration-200"
                                >
                                  <TableCell className="text-gray-300 font-mono">{aposta.id}</TableCell>
                                  <TableCell className="text-white">{aposta.usuario}</TableCell>
                                  <TableCell className="text-gray-300">
                                    R$ {aposta.valor.toFixed(2).replace(".", ",")}
                                  </TableCell>
                                  <TableCell className="text-gray-300">
                                    <Badge
                                      variant="outline"
                                      className={
                                        aposta.tipo === "maior"
                                          ? "border-green-500 text-green-400"
                                          : "border-red-500 text-red-400"
                                      }
                                    >
                                      {traduzirTipo(aposta.tipo)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-gray-300">{aposta.multiplicador.toFixed(2)}x</TableCell>
                                  <TableCell className="text-gray-300">
                                    R$ {aposta.valorPossivel.toFixed(2).replace(".", ",")}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`${getStatusColor(aposta.status)} text-white shadow-glow transition-all duration-300`}
                                    >
                                      {traduzirStatus(aposta.status)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-gray-300">{formatarData(aposta.data)}</TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className="h-8 w-8 p-0 hover:bg-accent/20 transition-colors duration-200"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="bg-[#171923] border-gray-700 text-white"
                                      >
                                        <DropdownMenuItem className="cursor-pointer hover:bg-accent/20 transition-colors duration-200">
                                          <Eye className="mr-2 h-4 w-4" />
                                          Visualizar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer hover:bg-accent/20 transition-colors duration-200">
                                          <Edit className="mr-2 h-4 w-4" />
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-gray-700" />
                                        <DropdownMenuItem className="cursor-pointer text-red-500 hover:bg-red-500/20 transition-colors duration-200">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-400">
                          Mostrando {filteredApostas.length} de {apostas.length} apostas
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="border-gray-700 text-gray-300 hover:border-accent hover:text-white transition-colors duration-300"
                            disabled
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-700 text-gray-300 hover:border-accent hover:text-white transition-colors duration-300"
                            disabled
                          >
                            Próxima
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="configuracoes">
              <Card className="bg-[#171923] rounded-lg shadow-lg p-6 mb-6 border border-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0F1117] opacity-50"></div>

                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white mb-6">Configurações do Sistema Maior e Menor</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="multiplicador-maior" className="text-white">
                          Multiplicador para Maior
                        </Label>
                        <Input
                          id="multiplicador-maior"
                          type="number"
                          step="0.1"
                          min="1"
                          max="10"
                          value={configuracao.multiplicadorMaior}
                          onChange={(e) =>
                            setConfiguracao({ ...configuracao, multiplicadorMaior: Number.parseFloat(e.target.value) })
                          }
                          className="bg-[#0F1117] border-gray-700 text-white"
                        />
                        <p className="text-xs text-gray-400">Multiplicador aplicado às apostas "Maior"</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="multiplicador-menor" className="text-white">
                          Multiplicador para Menor
                        </Label>
                        <Input
                          id="multiplicador-menor"
                          type="number"
                          step="0.1"
                          min="1"
                          max="10"
                          value={configuracao.multiplicadorMenor}
                          onChange={(e) =>
                            setConfiguracao({ ...configuracao, multiplicadorMenor: Number.parseFloat(e.target.value) })
                          }
                          className="bg-[#0F1117] border-gray-700 text-white"
                        />
                        <p className="text-xs text-gray-400">Multiplicador aplicado às apostas "Menor"</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tempo-limite" className="text-white">
                          Tempo Limite (segundos)
                        </Label>
                        <Input
                          id="tempo-limite"
                          type="number"
                          min="10"
                          max="300"
                          value={configuracao.tempoLimite}
                          onChange={(e) =>
                            setConfiguracao({ ...configuracao, tempoLimite: Number.parseInt(e.target.value) })
                          }
                          className="bg-[#0F1117] border-gray-700 text-white"
                        />
                        <p className="text-xs text-gray-400">
                          Tempo limite para realizar apostas antes da atualização do valor
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="valor-minimo" className="text-white">
                          Valor Mínimo de Aposta (R$)
                        </Label>
                        <Input
                          id="valor-minimo"
                          type="number"
                          min="1"
                          max="1000"
                          value={configuracao.valorMinimo}
                          onChange={(e) =>
                            setConfiguracao({ ...configuracao, valorMinimo: Number.parseInt(e.target.value) })
                          }
                          className="bg-[#0F1117] border-gray-700 text-white"
                        />
                        <p className="text-xs text-gray-400">Valor mínimo permitido para apostas</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valor-maximo" className="text-white">
                          Valor Máximo de Aposta (R$)
                        </Label>
                        <Input
                          id="valor-maximo"
                          type="number"
                          min="100"
                          max="10000"
                          value={configuracao.valorMaximo}
                          onChange={(e) =>
                            setConfiguracao({ ...configuracao, valorMaximo: Number.parseInt(e.target.value) })
                          }
                          className="bg-[#0F1117] border-gray-700 text-white"
                        />
                        <p className="text-xs text-gray-400">Valor máximo permitido para apostas</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sistema-ativo-config" className="text-white">
                            Sistema ativo
                          </Label>
                          <Switch
                            id="sistema-ativo-config"
                            checked={configuracao.ativo}
                            onCheckedChange={(checked) => setConfiguracao({ ...configuracao, ativo: checked })}
                          />
                        </div>
                        <p className="text-xs text-gray-400">Ativar ou desativar o sistema de apostas</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white mr-2">
                      Cancelar
                    </Button>
                    <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={salvarConfiguracoes}>
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style jsx>{`
        .shadow-glow {
          box-shadow: 0 0 10px rgba(156, 39, 176, 0.3);
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .particles {
          z-index: 1;
        }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #9c27b0;
          border-radius: 50%;
          box-shadow: 0 0 10px #9c27b0, 0 0 20px #9c27b0;
          animation: float 6s ease-in-out infinite;
        }
        
        .particle.green {
          background: #00ff00;
          box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
        }
      `}</style>
    </div>
  )
}
