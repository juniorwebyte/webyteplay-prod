"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Eye, MoreHorizontal, Filter, ArrowUpDown, Loader2, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AdminLayout from "@/components/admin/admin-layout"
import { listarCampanhas, excluirCampanha, clonarCampanha, type Campanha as CampanhaStore } from "@/lib/campanhas-store"

// Tipo para as campanhas na listagem
type Campanha = {
  id: string
  titulo: string
  premio: string
  valorCota: number
  totalCotas: number
  cotasVendidas: number
  status: "ativa" | "encerrada" | "pendente" | "sorteada"
  dataInicio: string
  dataFim: string
  imagem: string | null
}

export default function CampanhasPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showParticles, setShowParticles] = useState(false)

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

      // Carregar dados das campanhas
      fetchCampanhas()

      // Ativar partículas após um pequeno delay
      setTimeout(() => setShowParticles(true), 500)
    } catch (error) {
      localStorage.removeItem("admin")
      router.push("/admin")
    }
  }, [router])

  // Funcao para buscar campanhas do store
  const fetchCampanhas = () => {
    setIsLoading(true)
    try {
      const dados = listarCampanhas()
      const mapped: Campanha[] = dados.map((c) => {
        const statusMap: Record<string, "ativa" | "encerrada" | "pendente" | "sorteada"> = {
          Ativo: "ativa",
          Inativo: "encerrada",
          Pendente: "pendente",
          Sorteada: "sorteada",
        }
        return {
          id: c.id,
          titulo: c.titulo || "Sem titulo",
          premio: c.subtitulo || c.descricao || "",
          valorCota: parseFloat(c.valorPorCota) || 0,
          totalCotas: parseInt(c.quantidadeNumeros) || 0,
          cotasVendidas: c.cotasVendidas || 0,
          status: statusMap[c.statusCampanha] || "ativa",
          dataInicio: c.criadoEm || new Date().toISOString(),
          dataFim: c.dataInicio || new Date().toISOString(),
          imagem: c.imagemPrincipal || null,
        }
      })
      setCampanhas(mapped)
    } catch (err) {
      console.error("Erro ao carregar campanhas:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Escutar atualizacoes do store
  useEffect(() => {
    const handleUpdate = () => fetchCampanhas()
    window.addEventListener("campanhas-updated", handleUpdate)
    return () => window.removeEventListener("campanhas-updated", handleUpdate)
  }, [])

  // Função para filtrar campanhas
  const filteredCampanhas = campanhas.filter((campanha) => {
    const matchesSearch =
      campanha.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campanha.premio.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === null || campanha.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR")
  }

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
        return "bg-green-500 hover:bg-green-600"
      case "encerrada":
        return "bg-gray-500 hover:bg-gray-600"
      case "pendente":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "sorteada":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  // Função para traduzir status
  const traduzirStatus = (status: string) => {
    switch (status) {
      case "ativa":
        return "Ativa"
      case "encerrada":
        return "Encerrada"
      case "pendente":
        return "Pendente"
      case "sorteada":
        return "Sorteada"
      default:
        return status
    }
  }

  // Função para calcular progresso
  const calcularProgresso = (vendidas: number, total: number) => {
    return Math.round((vendidas / total) * 100)
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

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white animated-text">Gerenciamento de Campanhas</h1>

          <Button
            className="bg-[#FFB800] hover:bg-[#FFA500] text-black relative overflow-hidden group"
            onClick={() => router.push("/admin/campanhas/new")}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        </div>

        <div className="bg-[#171923] rounded-lg shadow-lg p-6 mb-6 border border-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0F1117] opacity-50"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar campanhas..."
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
                    onClick={() => setStatusFilter("ativa")}
                    className="hover:bg-accent/20 transition-colors duration-200"
                  >
                    Ativas
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("encerrada")}
                    className="hover:bg-accent/20 transition-colors duration-200"
                  >
                    Encerradas
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("pendente")}
                    className="hover:bg-accent/20 transition-colors duration-200"
                  >
                    Pendentes
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("sorteada")}
                    className="hover:bg-accent/20 transition-colors duration-200"
                  >
                    Sorteadas
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
                        <TableHead className="text-gray-300">Campanha</TableHead>
                        <TableHead className="text-gray-300">
                          <div className="flex items-center">
                            Valor
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Progresso</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Período</TableHead>
                        <TableHead className="text-gray-300 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampanhas.length === 0 ? (
                        <TableRow className="border-gray-700 hover:bg-[#1A1E2A]">
                          <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                            Nenhuma campanha encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCampanhas.map((campanha) => (
                          <TableRow
                            key={campanha.id}
                            className="border-gray-700 hover:bg-[#1A1E2A] transition-colors duration-200"
                          >
                            <TableCell className="text-gray-300 font-mono">{campanha.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                                  {campanha.imagem ? (
                                    <img
                                      src={campanha.imagem}
                                      alt={campanha.titulo}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-[#FFB800]/30 to-[#0F1117] flex items-center justify-center text-xs text-gray-400">
                                      Img
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-white hover:text-accent transition-colors duration-300">
                                    {campanha.titulo}
                                  </div>
                                  <div className="text-sm text-gray-400">{campanha.premio}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              R$ {campanha.valorCota.toFixed(2).replace(".", ",")}
                            </TableCell>
                            <TableCell>
                              <div className="w-full">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">{campanha.cotasVendidas} vendidas</span>
                                  <span className="text-gray-400">
                                    {calcularProgresso(campanha.cotasVendidas, campanha.totalCotas)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-[#FFB800] to-accent h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{
                                      width: `${calcularProgresso(campanha.cotasVendidas, campanha.totalCotas)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getStatusColor(campanha.status)} text-white shadow-glow transition-all duration-300`}
                              >
                                {traduzirStatus(campanha.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div className="text-sm">
                                <div>Início: {formatarData(campanha.dataInicio)}</div>
                                <div>Fim: {formatarData(campanha.dataFim)}</div>
                              </div>
                            </TableCell>
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
                                <DropdownMenuContent align="end" className="bg-[#171923] border-gray-700 text-white">
                                  <DropdownMenuItem
                                    className="cursor-pointer hover:bg-accent/20 transition-colors duration-200"
                                    onClick={() => router.push(`/rifas/${campanha.id}`)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Visualizar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer hover:bg-accent/20 transition-colors duration-200"
                                    onClick={() => router.push(`/admin/campanhas/new?edit=${campanha.id}`)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer hover:bg-accent/20 transition-colors duration-200"
                                    onClick={() => {
                                      const nova = clonarCampanha(campanha.id)
                                      if (nova) {
                                        fetchCampanhas()
                                        router.push(`/admin/campanhas/new?edit=${nova.id}`)
                                      }
                                    }}
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Clonar campanha
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-gray-700" />
                                  <DropdownMenuItem
                                    className="cursor-pointer text-red-500 hover:bg-red-500/20 transition-colors duration-200"
                                    onClick={() => {
                                      if (window.confirm("Tem certeza que deseja excluir esta campanha?")) {
                                        excluirCampanha(campanha.id)
                                        fetchCampanhas()
                                      }
                                    }}
                                  >
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
                    Mostrando {filteredCampanhas.length} de {campanhas.length} campanhas
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
        </div>
      </div>
    </AdminLayout>
  )
}
