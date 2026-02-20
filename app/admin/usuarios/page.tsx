"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  Loader2,
  Lock,
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { listarClientes, type Cliente } from "@/lib/gateway-store"

// Tipo para os usuários
type Usuario = {
  id: string
  nome: string
  email: string
  cargo: string
  permissoes: string[]
  ultimoAcesso: string
  status: "ativo" | "inativo" | "bloqueado"
  avatar: string
}

// Tipo para as permissões
type Permissao = {
  id: string
  nome: string
  descricao: string
  categoria: string
}

export default function UsuariosPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [permissoes, setPermissoes] = useState<Permissao[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showParticles, setShowParticles] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: "operador",
    senha: "",
    confirmarSenha: "",
    status: "ativo",
    permissoes: [] as string[],
  })

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

      // Carregar dados dos usuários
      fetchUsuarios()
      fetchPermissoes()

      // Ativar partículas após um pequeno delay
      setTimeout(() => setShowParticles(true), 500)
    } catch (error) {
      localStorage.removeItem("admin")
      router.push("/admin")
    }
  }, [router])

  // Função para buscar usuários (de clientes reais)
  const fetchUsuarios = async () => {
    setIsLoading(true)

    // Usar dados reais de clientes
    setTimeout(() => {
      const clientes = listarClientes()
      const usuariosReais: Usuario[] = clientes.map((cliente, index) => ({
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        cargo: "cliente",
        permissoes: ["cliente"],
        ultimoAcesso: cliente.ultimaCompra || cliente.dataCadastro,
        status: cliente.status === "ativo" ? "ativo" : "inativo",
        avatar: "/placeholder.svg?height=40&width=40",
      }))

      // Adicionar admin se não existir
      const adminExists = usuariosReais.find(u => u.email === "admin@webyteplay.com")
      if (!adminExists) {
        usuariosReais.unshift({
          id: "usr-001",
          nome: "Admin Master",
          email: "admin@webyteplay.com",
          cargo: "administrador",
          permissoes: ["all"],
          ultimoAcesso: new Date().toISOString(),
          status: "ativo",
          avatar: "/placeholder.svg?height=40&width=40",
        })
      }

      setUsuarios(usuariosReais)
      setIsLoading(false)
    }, 500)
  }

  // Função para buscar permissões (simulada)
  const fetchPermissoes = async () => {
    // Simulando uma chamada de API
    setTimeout(() => {
      const mockPermissoes: Permissao[] = [
        {
          id: "all",
          nome: "Acesso Total",
          descricao: "Acesso completo a todas as funcionalidades",
          categoria: "sistema",
        },
        { id: "campanhas", nome: "Campanhas", descricao: "Gerenciar campanhas e rifas", categoria: "operacional" },
        { id: "pedidos", nome: "Pedidos", descricao: "Visualizar e gerenciar pedidos", categoria: "operacional" },
        { id: "relatorios", nome: "Relatórios", descricao: "Acessar relatórios e estatísticas", categoria: "analise" },
        { id: "clientes", nome: "Clientes", descricao: "Gerenciar clientes", categoria: "operacional" },
        {
          id: "pagamentos",
          nome: "Pagamentos",
          descricao: "Gerenciar pagamentos e reembolsos",
          categoria: "financeiro",
        },
        { id: "afiliados", nome: "Afiliados", descricao: "Gerenciar programa de afiliados", categoria: "marketing" },
        { id: "sorteios", nome: "Sorteios", descricao: "Realizar e gerenciar sorteios", categoria: "operacional" },
        { id: "usuarios", nome: "Usuários", descricao: "Gerenciar usuários administrativos", categoria: "sistema" },
        {
          id: "configuracoes",
          nome: "Configurações",
          descricao: "Alterar configurações do sistema",
          categoria: "sistema",
        },
      ]

      setPermissoes(mockPermissoes)
    }, 800)
  }

  // Função para filtrar usuários
  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cargo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === null || usuario.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-500 hover:bg-green-600"
      case "inativo":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "bloqueado":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  // Função para traduzir status
  const traduzirStatus = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo"
      case "inativo":
        return "Inativo"
      case "bloqueado":
        return "Bloqueado"
      default:
        return status
    }
  }

  // Função para traduzir cargo
  const traduzirCargo = (cargo: string) => {
    switch (cargo) {
      case "administrador":
        return "Administrador"
      case "gerente":
        return "Gerente"
      case "operador":
        return "Operador"
      case "suporte":
        return "Suporte"
      case "financeiro":
        return "Financeiro"
      case "marketing":
        return "Marketing"
      default:
        return cargo
    }
  }

  // Função para adicionar usuário
  const handleAddUser = () => {
    // Validar formulário
    if (!formData.nome || !formData.email || !formData.cargo) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      alert("As senhas não coincidem.")
      return
    }

    // Simulando adição de usuário
    const newUser: Usuario = {
      id: `usr-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      nome: formData.nome,
      email: formData.email,
      cargo: formData.cargo,
      permissoes: formData.permissoes,
      ultimoAcesso: new Date().toISOString(),
      status: formData.status as "ativo" | "inativo" | "bloqueado",
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setUsuarios([...usuarios, newUser])
    setShowAddDialog(false)

    // Limpar formulário
    setFormData({
      nome: "",
      email: "",
      cargo: "operador",
      senha: "",
      confirmarSenha: "",
      status: "ativo",
      permissoes: [],
    })
  }

  // Função para editar usuário
  const handleEditUser = () => {
    if (!currentUser) return

    // Validar formulário
    if (!formData.nome || !formData.email || !formData.cargo) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      alert("As senhas não coincidem.")
      return
    }

    // Simulando edição de usuário
    const updatedUsers = usuarios.map((user) => {
      if (user.id === currentUser.id) {
        return {
          ...user,
          nome: formData.nome,
          email: formData.email,
          cargo: formData.cargo,
          permissoes: formData.permissoes,
          status: formData.status as "ativo" | "inativo" | "bloqueado",
        }
      }
      return user
    })

    setUsuarios(updatedUsers)
    setShowEditDialog(false)
    setCurrentUser(null)
  }

  // Função para excluir usuário
  const handleDeleteUser = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      const updatedUsers = usuarios.filter((user) => user.id !== id)
      setUsuarios(updatedUsers)
    }
  }

  // Função para abrir diálogo de edição
  const openEditDialog = (user: Usuario) => {
    setCurrentUser(user)
    setFormData({
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      senha: "",
      confirmarSenha: "",
      status: user.status,
      permissoes: user.permissoes,
    })
    setShowEditDialog(true)
  }

  // Função para alternar permissão
  const togglePermission = (permissionId: string) => {
    if (formData.permissoes.includes(permissionId)) {
      setFormData({
        ...formData,
        permissoes: formData.permissoes.filter((id) => id !== permissionId),
      })
    } else {
      setFormData({
       ...formData,
       permissoes: [...formData.permissoes, permissionId],
     })
    }
  }

  // Renderizar partículas\
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
    <div className="flex h-screen bg-[#0F1117] overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 overflow-auto relative">
        {showParticles && <div className="particles absolute inset-0 pointer-events-none">{renderParticles()}</div>}

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white animated-text">Gerenciamento de Usuários</h1>

            <Button
              className="bg-[#FFB800] hover:bg-[#FFA500] text-black relative overflow-hidden group"
              onClick={() => setShowAddDialog(true)}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </div>

          <div className="bg-[#171923] rounded-lg shadow-lg p-6 mb-6 border border-gray-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0F1117] opacity-50"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Buscar usuários..."
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
                      onClick={() => setStatusFilter("ativo")}
                      className="hover:bg-accent/20 transition-colors duration-200"
                    >
                      Ativos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("inativo")}
                      className="hover:bg-accent/20 transition-colors duration-200"
                    >
                      Inativos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("bloqueado")}
                      className="hover:bg-accent/20 transition-colors duration-200"
                    >
                      Bloqueados
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
                              Cargo
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="text-gray-300">Permissões</TableHead>
                          <TableHead className="text-gray-300">Último Acesso</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300 text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsuarios.length === 0 ? (
                          <TableRow className="border-gray-700 hover:bg-[#1A1E2A]">
                            <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                              Nenhum usuário encontrado
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsuarios.map((usuario) => (
                            <TableRow
                              key={usuario.id}
                              className="border-gray-700 hover:bg-[#1A1E2A] transition-colors duration-200"
                            >
                              <TableCell className="text-gray-300 font-mono">{usuario.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden">
                                    <img
                                      src={usuario.avatar || "/placeholder.svg"}
                                      alt={usuario.nome}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium text-white hover:text-accent transition-colors duration-300">
                                      {usuario.nome}
                                    </div>
                                    <div className="text-sm text-gray-400">{usuario.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300">{traduzirCargo(usuario.cargo)}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {usuario.permissoes.includes("all") ? (
                                    <Badge className="bg-purple-600 text-white">Acesso Total</Badge>
                                  ) : (
                                    usuario.permissoes.map((permissao) => (
                                      <Badge key={permissao} className="bg-blue-600 text-white">
                                        {permissao}
                                      </Badge>
                                    ))
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300">{formatarData(usuario.ultimoAcesso)}</TableCell>
                              <TableCell>
                                <Badge
                                  className={`${getStatusColor(usuario.status)} text-white shadow-glow transition-all duration-300`}
                                >
                                  {traduzirStatus(usuario.status)}
                                </Badge>
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
                                      onClick={() => openEditDialog(usuario)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer hover:bg-accent/20 transition-colors duration-200">
                                      <Lock className="mr-2 h-4 w-4" />
                                      Redefinir Senha
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-red-500 hover:bg-red-500/20 transition-colors duration-200"
                                      onClick={() => handleDeleteUser(usuario.id)}
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
                      Mostrando {filteredUsuarios.length} de {usuarios.length} usuários
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

          {/* Informações sobre permissões */}
          <div className="bg-[#171923] rounded-lg shadow-lg p-6 border border-gray-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0F1117] opacity-50"></div>

            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Shield className="mr-2 h-5 w-5 text-[#FFB800]" />
                Níveis de Acesso e Permissões
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#1A1E2A] border-gray-700 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Administrador</CardTitle>
                    <CardDescription className="text-gray-400">Acesso total ao sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                        <span>Acesso a todas as funcionalidades</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                        <span>Gerenciamento de usuários</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                        <span>Configurações do sistema</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A1E2A] border-gray-700 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Gerente</CardTitle>
                    <CardDescription className="text-gray-400">Acesso amplo com algumas restrições</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                        <span>Gerenciamento de campanhas</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                        <span>Acesso a relatórios</span>
                      </li>
                      <li className="flex items-start">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                        <span>Sem acesso a configurações avançadas</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A1E2A] border-gray-700 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Operador</CardTitle>
                    <CardDescription className="text-gray-400">Acesso limitado a operações básicas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                        <span>Visualização de pedidos</span>
                      </li>
                      <li className="flex items-start">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                        <span>Sem acesso a relatórios avançados</span>
                      </li>
                      <li className="flex items-start">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                        <span>Sem permissões de gerenciamento</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Alert className="mt-6 bg-[#1A1E2A] border-yellow-600 text-white">
                <AlertDescription className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>
                    Importante: Atribua permissões com cuidado. Usuários com acesso total podem gerenciar outros
                    usuários e alterar configurações críticas do sistema.
                  </span>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo para adicionar usuário */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#171923] text-white border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Adicionar Novo Usuário</DialogTitle>
            <DialogDescription className="text-gray-400">
              Preencha os dados para criar um novo usuário administrativo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  placeholder="Nome do usuário"
                  className="bg-[#0F1117] border-gray-700 text-white"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  className="bg-[#0F1117] border-gray-700 text-white"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Select value={formData.cargo} onValueChange={(value) => setFormData({ ...formData, cargo: value })}>
                  <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#171923] border-gray-700 text-white">
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="operador">Operador</SelectItem>
                    <SelectItem value="suporte">Suporte</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#171923] border-gray-700 text-white">
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Digite a senha"
                  className="bg-[#0F1117] border-gray-700 text-white"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  placeholder="Confirme a senha"
                  className="bg-[#0F1117] border-gray-700 text-white"
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Permissões</Label>
              <div className="bg-[#0F1117] border border-gray-700 rounded-md p-4 h-[300px] overflow-y-auto">
                <div className="space-y-3">
                  {permissoes.map((permissao) => (
                    <div key={permissao.id} className="flex items-start space-x-2">
                      <Switch
                        checked={formData.permissoes.includes(permissao.id)}
                        onCheckedChange={() => togglePermission(permissao.id)}
                      />
                      <div>
                        <Label className="text-sm font-medium">{permissao.nome}</Label>
                        <p className="text-xs text-gray-400">{permissao.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button onClick={handleAddUser} className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
              Adicionar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
