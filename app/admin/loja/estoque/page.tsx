"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  AlertTriangle,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  History,
  FileText,
  Warehouse,
  Truck,
  Calendar,
  Search,
  Edit,
  Trash2,
} from "lucide-react"
import { listarProdutos, type ProdutoLoja } from "@/lib/loja-store"
import {
  listarEstoqueProdutos,
  buscarEstoqueProduto,
  ajustarEstoque,
  listarMovimentacoes,
  registrarEntradaMercadorias,
  transferirEntreArmazens,
  listarLotes,
  criarLote,
  atualizarLote,
  listarFornecedores,
  criarFornecedor,
  atualizarFornecedor,
  excluirFornecedor,
  listarArmazens,
  criarArmazem,
  atualizarArmazem,
  excluirArmazem,
  listarAlertasEstoqueBaixo,
  type MovimentacaoEstoque,
  type Lote,
  type Fornecedor,
  type Armazem,
  type EstoqueProduto,
} from "@/lib/estoque-store"
import { formatarValor, formatarCNPJ, formatarTelefone } from "@/lib/formatadores"

export default function LojaEstoquePage() {
  const [produtos, setProdutos] = useState<ProdutoLoja[]>([])
  const [estoques, setEstoques] = useState<EstoqueProduto[]>([])
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [armazens, setArmazens] = useState<Armazem[]>([])
  const [abaAtiva, setAbaAtiva] = useState("controle")
  const [busca, setBusca] = useState("")
  const [filtroProduto, setFiltroProduto] = useState<string>("todos")
  const [filtroTipoMov, setFiltroTipoMov] = useState<string>("todos")
  const [dialogAjusteOpen, setDialogAjusteOpen] = useState(false)
  const [dialogEntradaOpen, setDialogEntradaOpen] = useState(false)
  const [dialogTransferenciaOpen, setDialogTransferenciaOpen] = useState(false)
  const [dialogLoteOpen, setDialogLoteOpen] = useState(false)
  const [dialogFornecedorOpen, setDialogFornecedorOpen] = useState(false)
  const [dialogArmazemOpen, setDialogArmazemOpen] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("")
  const [variacaoSelecionada, setVariacaoSelecionada] = useState<string>("")
  const [formAjuste, setFormAjuste] = useState({ quantidade: 0, motivo: "" })
  const [formEntrada, setFormEntrada] = useState({
    quantidade: 0,
    fornecedorId: "",
    loteId: "",
    armazemId: "",
    observacoes: "",
  })
  const [formTransferencia, setFormTransferencia] = useState({
    quantidade: 0,
    armazemOrigemId: "",
    armazemDestinoId: "",
    observacoes: "",
  })
  const [formLote, setFormLote] = useState({
    numeroLote: "",
    quantidade: 0,
    quantidadeInicial: 0,
    dataFabricacao: "",
    dataValidade: "",
    fornecedorId: "",
    armazemId: "",
  })
  const [formFornecedor, setFormFornecedor] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
  })
  const [formArmazem, setFormArmazem] = useState({
    nome: "",
    endereco: "",
    responsavel: "",
  })
  const [editandoFornecedor, setEditandoFornecedor] = useState<Fornecedor | null>(null)
  const [editandoArmazem, setEditandoArmazem] = useState<Armazem | null>(null)

  const carregar = () => {
    setProdutos(listarProdutos())
    setEstoques(listarEstoqueProdutos())
    setMovimentacoes(listarMovimentacoes())
    setLotes(listarLotes())
    setFornecedores(listarFornecedores())
    setArmazens(listarArmazens())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("loja-updated", h)
    window.addEventListener("estoque-updated", h)
    return () => {
      window.removeEventListener("loja-updated", h)
      window.removeEventListener("estoque-updated", h)
    }
  }, [])

  const produtosFiltrados = produtos.filter((p) => {
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false
    if (filtroProduto !== "todos" && p.id !== filtroProduto) return false
    return true
  })

  const movimentacoesFiltradas = movimentacoes.filter((m) => {
    if (filtroProduto !== "todos" && m.produtoId !== filtroProduto) return false
    if (filtroTipoMov !== "todos" && m.tipo !== filtroTipoMov) return false
    return true
  })

  const alertasEstoqueBaixo = listarAlertasEstoqueBaixo()

  const handleAjusteEstoque = () => {
    if (!produtoSelecionado || formAjuste.quantidade === 0 || !formAjuste.motivo.trim()) return
    ajustarEstoque(produtoSelecionado, variacaoSelecionada || undefined, formAjuste.quantidade, formAjuste.motivo)
    setDialogAjusteOpen(false)
    setFormAjuste({ quantidade: 0, motivo: "" })
    carregar()
  }

  const handleEntradaMercadorias = () => {
    if (!produtoSelecionado || formEntrada.quantidade <= 0) return
    registrarEntradaMercadorias(
      produtoSelecionado,
      variacaoSelecionada || undefined,
      formEntrada.quantidade,
      formEntrada.fornecedorId || undefined,
      formEntrada.loteId || undefined,
      formEntrada.armazemId || undefined,
      formEntrada.observacoes || undefined
    )
    setDialogEntradaOpen(false)
    setFormEntrada({ quantidade: 0, fornecedorId: "", loteId: "", armazemId: "", observacoes: "" })
    carregar()
  }

  const handleTransferencia = () => {
    if (!produtoSelecionado || formTransferencia.quantidade <= 0) return
    try {
      transferirEntreArmazens(
        produtoSelecionado,
        variacaoSelecionada || undefined,
        formTransferencia.quantidade,
        formTransferencia.armazemOrigemId,
        formTransferencia.armazemDestinoId,
        formTransferencia.observacoes || undefined
      )
      setDialogTransferenciaOpen(false)
      setFormTransferencia({ quantidade: 0, armazemOrigemId: "", armazemDestinoId: "", observacoes: "" })
      carregar()
    } catch (error: any) {
      alert(error.message || "Erro ao transferir estoque")
    }
  }

  const handleCriarLote = () => {
    if (!produtoSelecionado || !formLote.numeroLote.trim() || formLote.quantidade <= 0) return
    criarLote({
      produtoId: produtoSelecionado,
      variacaoId: variacaoSelecionada || undefined,
      ...formLote,
    })
    setDialogLoteOpen(false)
    setFormLote({
      numeroLote: "",
      quantidade: 0,
      quantidadeInicial: 0,
      dataFabricacao: "",
      dataValidade: "",
      fornecedorId: "",
      armazemId: "",
    })
    carregar()
  }

  const handleSalvarFornecedor = () => {
    if (!formFornecedor.nome.trim()) return
    if (editandoFornecedor) {
      atualizarFornecedor(editandoFornecedor.id, formFornecedor)
    } else {
      criarFornecedor({ ...formFornecedor, ativo: true })
    }
    setDialogFornecedorOpen(false)
    setEditandoFornecedor(null)
    setFormFornecedor({ nome: "", cnpj: "", telefone: "", email: "", endereco: "" })
    carregar()
  }

  const handleSalvarArmazem = () => {
    if (!formArmazem.nome.trim()) return
    if (editandoArmazem) {
      atualizarArmazem(editandoArmazem.id, formArmazem)
    } else {
      criarArmazem({ ...formArmazem, ativo: true })
    }
    setDialogArmazemOpen(false)
    setEditandoArmazem(null)
    setFormArmazem({ nome: "", endereco: "", responsavel: "" })
    carregar()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="h-8 w-8 text-[#FFB800]" />
          Controle de Estoque
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setDialogEntradaOpen(true)} variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" /> Entrada
          </Button>
          <Button onClick={() => setDialogAjusteOpen(true)} variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Ajuste Manual
          </Button>
        </div>
      </div>

      {alertasEstoqueBaixo.length > 0 && (
        <Card className="bg-yellow-500/10 border-yellow-500/50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">
                {alertasEstoqueBaixo.length} produto(s) com estoque baixo
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="controle">Controle</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="lotes">Lotes</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="armazens">Armazéns</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="controle">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white">Estoque por Produto</CardTitle>
                  <CardDescription>Controle de estoque de todos os produtos</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-8 w-64 bg-background"
                    />
                  </div>
                  <Select value={filtroProduto} onValueChange={setFiltroProduto}>
                    <SelectTrigger className="w-48 bg-background">
                      <SelectValue placeholder="Filtrar produto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os produtos</SelectItem>
                      {produtos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Produto</TableHead>
                    <TableHead className="text-gray-300">Variação</TableHead>
                    <TableHead className="text-gray-300">Estoque Atual</TableHead>
                    <TableHead className="text-gray-300">Mínimo</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Última Movimentação</TableHead>
                    <TableHead className="text-gray-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.map((produto) => {
                    const estoque = buscarEstoqueProduto(produto.id)
                    const estoqueAtual = estoque?.quantidade ?? 0
                    const estoqueMinimo = estoque?.quantidadeMinima ?? 0
                    const alerta = estoqueAtual <= estoqueMinimo
                    return (
                      <TableRow key={produto.id}>
                        <TableCell className="font-medium text-white">{produto.nome}</TableCell>
                        <TableCell className="text-gray-300">—</TableCell>
                        <TableCell className="text-gray-300 font-bold">{estoqueAtual}</TableCell>
                        <TableCell className="text-gray-300">{estoqueMinimo}</TableCell>
                        <TableCell>
                          {alerta ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400">Estoque Baixo</Badge>
                          ) : (
                            <Badge className="bg-green-500/20 text-green-400">OK</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">
                          {estoque?.ultimaMovimentacao
                            ? new Date(estoque.ultimaMovimentacao).toLocaleDateString("pt-BR")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setProdutoSelecionado(produto.id)
                              setDialogAjusteOpen(true)
                            }}
                          >
                            Ajustar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white">Histórico de Movimentações</CardTitle>
                  <CardDescription>Registro de todas as movimentações de estoque</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={filtroTipoMov} onValueChange={setFiltroTipoMov}>
                    <SelectTrigger className="w-40 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                      <SelectItem value="ajuste">Ajuste</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="venda">Venda</SelectItem>
                      <SelectItem value="devolucao">Devolução</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-gray-300">Produto</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Quantidade</TableHead>
                    <TableHead className="text-gray-300">Anterior</TableHead>
                    <TableHead className="text-gray-300">Nova</TableHead>
                    <TableHead className="text-gray-300">Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentacoesFiltradas.slice(0, 100).map((mov) => {
                    const produto = produtos.find((p) => p.id === mov.produtoId)
                    const tipoIcon =
                      mov.tipo === "entrada" ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : mov.tipo === "saida" ? (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      ) : mov.tipo === "transferencia" ? (
                        <ArrowLeftRight className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Edit className="h-4 w-4 text-yellow-400" />
                      )
                    return (
                      <TableRow key={mov.id}>
                        <TableCell className="text-gray-300 text-sm">
                          {new Date(mov.criadoEm).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="font-medium text-white">{produto?.nome || mov.produtoId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tipoIcon}
                            <span className="text-gray-300 capitalize">{mov.tipo}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{mov.quantidade}</TableCell>
                        <TableCell className="text-gray-300">{mov.quantidadeAnterior}</TableCell>
                        <TableCell className="text-gray-300 font-bold">{mov.quantidadeNova}</TableCell>
                        <TableCell className="text-gray-300 text-sm">{mov.motivo || "—"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lotes">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Gestão de Lotes</CardTitle>
                  <CardDescription>Controle de lotes e validade</CardDescription>
                </div>
                <Button onClick={() => setDialogLoteOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Lote
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Número do Lote</TableHead>
                    <TableHead className="text-gray-300">Produto</TableHead>
                    <TableHead className="text-gray-300">Quantidade</TableHead>
                    <TableHead className="text-gray-300">Fabricação</TableHead>
                    <TableHead className="text-gray-300">Validade</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotes.map((lote) => {
                    const produto = produtos.find((p) => p.id === lote.produtoId)
                    const vencido = lote.dataValidade && new Date(lote.dataValidade) < new Date()
                    return (
                      <TableRow key={lote.id}>
                        <TableCell className="font-medium text-white">{lote.numeroLote}</TableCell>
                        <TableCell className="text-gray-300">{produto?.nome || lote.produtoId}</TableCell>
                        <TableCell className="text-gray-300">{lote.quantidade}</TableCell>
                        <TableCell className="text-gray-300 text-sm">
                          {lote.dataFabricacao ? new Date(lote.dataFabricacao).toLocaleDateString("pt-BR") : "—"}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">
                          {lote.dataValidade ? new Date(lote.dataValidade).toLocaleDateString("pt-BR") : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              vencido
                                ? "bg-red-500/20 text-red-400"
                                : lote.status === "esgotado"
                                  ? "bg-gray-500/20 text-gray-400"
                                  : "bg-green-500/20 text-green-400"
                            }
                          >
                            {lote.status === "vencido" ? "Vencido" : lote.status === "esgotado" ? "Esgotado" : "Ativo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fornecedores">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Fornecedores</CardTitle>
                  <CardDescription>Gestão de fornecedores</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditandoFornecedor(null)
                  setFormFornecedor({ nome: "", cnpj: "", telefone: "", email: "", endereco: "" })
                  setDialogFornecedorOpen(true)
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">CNPJ</TableHead>
                    <TableHead className="text-gray-300">Telefone</TableHead>
                    <TableHead className="text-gray-300">E-mail</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fornecedores.map((fornecedor) => (
                    <TableRow key={fornecedor.id}>
                      <TableCell className="font-medium text-white">{fornecedor.nome}</TableCell>
                      <TableCell className="text-gray-300">{fornecedor.cnpj || "—"}</TableCell>
                      <TableCell className="text-gray-300">{fornecedor.telefone || "—"}</TableCell>
                      <TableCell className="text-gray-300">{fornecedor.email || "—"}</TableCell>
                      <TableCell>
                        <Badge className={fornecedor.ativo ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                          {fornecedor.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditandoFornecedor(fornecedor)
                            setFormFornecedor({
                              nome: fornecedor.nome,
                              cnpj: fornecedor.cnpj || "",
                              telefone: fornecedor.telefone || "",
                              email: fornecedor.email || "",
                              endereco: fornecedor.endereco || "",
                            })
                            setDialogFornecedorOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Excluir fornecedor?")) {
                              excluirFornecedor(fornecedor.id)
                              carregar()
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="armazens">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Armazéns</CardTitle>
                  <CardDescription>Gestão de armazéns (multi-armazém)</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditandoArmazem(null)
                  setFormArmazem({ nome: "", endereco: "", responsavel: "" })
                  setDialogArmazemOpen(true)
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Armazém
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Endereço</TableHead>
                    <TableHead className="text-gray-300">Responsável</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {armazens.map((armazem) => (
                    <TableRow key={armazem.id}>
                      <TableCell className="font-medium text-white">{armazem.nome}</TableCell>
                      <TableCell className="text-gray-300">{armazem.endereco || "—"}</TableCell>
                      <TableCell className="text-gray-300">{armazem.responsavel || "—"}</TableCell>
                      <TableCell>
                        <Badge className={armazem.ativo ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                          {armazem.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditandoArmazem(armazem)
                            setFormArmazem({
                              nome: armazem.nome,
                              endereco: armazem.endereco || "",
                              responsavel: armazem.responsavel || "",
                            })
                            setDialogArmazemOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Excluir armazém?")) {
                              excluirArmazem(armazem.id)
                              carregar()
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Alertas de Estoque Baixo</CardTitle>
              <CardDescription>Produtos que precisam de reposição</CardDescription>
            </CardHeader>
            <CardContent>
              {alertasEstoqueBaixo.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhum alerta de estoque baixo no momento.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Produto</TableHead>
                      <TableHead className="text-gray-300">Estoque Atual</TableHead>
                      <TableHead className="text-gray-300">Mínimo</TableHead>
                      <TableHead className="text-gray-300">Diferença</TableHead>
                      <TableHead className="text-gray-300 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertasEstoqueBaixo.map((estoque) => {
                      const produto = produtos.find((p) => p.id === estoque.produtoId)
                      const diferenca = estoque.quantidadeMinima - estoque.quantidade
                      return (
                        <TableRow key={`${estoque.produtoId}-${estoque.variacaoId || ""}`}>
                          <TableCell className="font-medium text-white">{produto?.nome || estoque.produtoId}</TableCell>
                          <TableCell className="text-red-400 font-bold">{estoque.quantidade}</TableCell>
                          <TableCell className="text-gray-300">{estoque.quantidadeMinima}</TableCell>
                          <TableCell className="text-yellow-400 font-semibold">-{diferenca}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setProdutoSelecionado(estoque.produtoId)
                                setVariacaoSelecionada(estoque.variacaoId || "")
                                setDialogEntradaOpen(true)
                              }}
                            >
                              Repor Estoque
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Ajuste Manual */}
      <Dialog open={dialogAjusteOpen} onOpenChange={setDialogAjusteOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Ajuste Manual de Estoque</DialogTitle>
            <DialogDescription>Defina a quantidade exata do estoque</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={formAjuste.quantidade}
                onChange={(e) => setFormAjuste((f) => ({ ...f, quantidade: parseInt(e.target.value, 10) || 0 }))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Textarea
                value={formAjuste.motivo}
                onChange={(e) => setFormAjuste((f) => ({ ...f, motivo: e.target.value }))}
                placeholder="Descreva o motivo do ajuste"
                className="bg-background"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAjusteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAjusteEstoque} disabled={!produtoSelecionado || !formAjuste.motivo.trim()}>
              Ajustar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Entrada de Mercadorias */}
      <Dialog open={dialogEntradaOpen} onOpenChange={setDialogEntradaOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Entrada de Mercadorias</DialogTitle>
            <DialogDescription>Registre a entrada de produtos no estoque</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  value={formEntrada.quantidade}
                  onChange={(e) => setFormEntrada((f) => ({ ...f, quantidade: parseInt(e.target.value, 10) || 0 }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select value={formEntrada.fornecedorId} onValueChange={(v) => setFormEntrada((f) => ({ ...f, fornecedorId: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.length === 0 ? (
                      <SelectItem value="nenhum" disabled>Nenhum fornecedor cadastrado</SelectItem>
                    ) : (
                      fornecedores.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Armazém</Label>
                <Select value={formEntrada.armazemId} onValueChange={(v) => setFormEntrada((f) => ({ ...f, armazemId: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {armazens.length === 0 ? (
                      <SelectItem value="nenhum" disabled>Nenhum armazém cadastrado</SelectItem>
                    ) : (
                      armazens.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lote</Label>
                <Select value={formEntrada.loteId} onValueChange={(v) => setFormEntrada((f) => ({ ...f, loteId: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {lotes.filter((l) => l.produtoId === produtoSelecionado).length === 0 ? (
                      <SelectItem value="nenhum" disabled>Nenhum lote cadastrado</SelectItem>
                    ) : (
                      lotes.filter((l) => l.produtoId === produtoSelecionado).map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.numeroLote}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formEntrada.observacoes}
                onChange={(e) => setFormEntrada((f) => ({ ...f, observacoes: e.target.value }))}
                className="bg-background"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEntradaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEntradaMercadorias} disabled={!produtoSelecionado || formEntrada.quantidade <= 0}>
              Registrar Entrada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Transferência */}
      <Dialog open={dialogTransferenciaOpen} onOpenChange={setDialogTransferenciaOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Transferência entre Armazéns</DialogTitle>
            <DialogDescription>Transfira produtos entre diferentes armazéns</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min={1}
                value={formTransferencia.quantidade}
                onChange={(e) => setFormTransferencia((f) => ({ ...f, quantidade: parseInt(e.target.value, 10) || 0 }))}
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Armazém Origem</Label>
                <Select value={formTransferencia.armazemOrigemId} onValueChange={(v) => setFormTransferencia((f) => ({ ...f, armazemOrigemId: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {armazens.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Armazém Destino</Label>
                <Select value={formTransferencia.armazemDestinoId} onValueChange={(v) => setFormTransferencia((f) => ({ ...f, armazemDestinoId: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {armazens.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formTransferencia.observacoes}
                onChange={(e) => setFormTransferencia((f) => ({ ...f, observacoes: e.target.value }))}
                className="bg-background"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogTransferenciaOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleTransferencia}
              disabled={
                !produtoSelecionado ||
                formTransferencia.quantidade <= 0 ||
                !formTransferencia.armazemOrigemId ||
                !formTransferencia.armazemDestinoId ||
                formTransferencia.armazemOrigemId === formTransferencia.armazemDestinoId
              }
            >
              Transferir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Lote */}
      <Dialog open={dialogLoteOpen} onOpenChange={setDialogLoteOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Lote</DialogTitle>
            <DialogDescription>Registre um novo lote com informações de validade</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número do Lote *</Label>
                <Input
                  value={formLote.numeroLote}
                  onChange={(e) => setFormLote((f) => ({ ...f, numeroLote: e.target.value }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  min={1}
                  value={formLote.quantidade}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value, 10) || 0
                    setFormLote((f) => ({ ...f, quantidade: qty, quantidadeInicial: qty }))
                  }}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Fabricação</Label>
                <Input
                  type="date"
                  value={formLote.dataFabricacao}
                  onChange={(e) => setFormLote((f) => ({ ...f, dataFabricacao: e.target.value }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input
                  type="date"
                  value={formLote.dataValidade}
                  onChange={(e) => setFormLote((f) => ({ ...f, dataValidade: e.target.value }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select value={formLote.fornecedorId} onValueChange={(v) => setFormLote((f) => ({ ...f, fornecedorId: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.length === 0 ? (
                      <SelectItem value="nenhum" disabled>Nenhum fornecedor cadastrado</SelectItem>
                    ) : (
                      fornecedores.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Armazém</Label>
                <Select value={formLote.armazemId} onValueChange={(v) => setFormLote((f) => ({ ...f, armazemId: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {armazens.length === 0 ? (
                      <SelectItem value="nenhum" disabled>Nenhum armazém cadastrado</SelectItem>
                    ) : (
                      armazens.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogLoteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarLote} disabled={!produtoSelecionado || !formLote.numeroLote.trim() || formLote.quantidade <= 0}>
              Criar Lote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Fornecedor */}
      <Dialog open={dialogFornecedorOpen} onOpenChange={setDialogFornecedorOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{editandoFornecedor ? "Editar" : "Novo"} Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formFornecedor.nome}
                onChange={(e) => setFormFornecedor((f) => ({ ...f, nome: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CNPJ</Label>
              <Input
                value={formFornecedor.cnpj}
                onChange={(e) => setFormFornecedor((f) => ({ ...f, cnpj: formatarCNPJ(e.target.value) }))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className="bg-background"
              />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
              <Input
                value={formFornecedor.telefone}
                onChange={(e) => setFormFornecedor((f) => ({ ...f, telefone: formatarTelefone(e.target.value) }))}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="bg-background"
              />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formFornecedor.email}
                onChange={(e) => setFormFornecedor((f) => ({ ...f, email: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Textarea
                value={formFornecedor.endereco}
                onChange={(e) => setFormFornecedor((f) => ({ ...f, endereco: e.target.value }))}
                className="bg-background"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogFornecedorOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarFornecedor} disabled={!formFornecedor.nome.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Armazém */}
      <Dialog open={dialogArmazemOpen} onOpenChange={setDialogArmazemOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{editandoArmazem ? "Editar" : "Novo"} Armazém</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formArmazem.nome}
                onChange={(e) => setFormArmazem((f) => ({ ...f, nome: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Textarea
                value={formArmazem.endereco}
                onChange={(e) => setFormArmazem((f) => ({ ...f, endereco: e.target.value }))}
                className="bg-background"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input
                value={formArmazem.responsavel}
                onChange={(e) => setFormArmazem((f) => ({ ...f, responsavel: e.target.value }))}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogArmazemOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarArmazem} disabled={!formArmazem.nome.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
