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
  Plus,
  Search,
  Eye,
  FileText,
  Printer,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Truck,
  Box,
  CreditCard,
  ArrowLeftRight,
  History,
  Receipt,
} from "lucide-react"
import {
  listarPedidosLoja,
  buscarPedidoLoja,
  atualizarStatusPedido,
  criarPedidoManual,
  solicitarReembolso,
  processarReembolso,
  solicitarTroca,
  solicitarDevolucao,
  abrirDisputa,
  atualizarNotaFiscal,
  atualizarRastreamento,
  type PedidoLoja,
  type StatusPedidoLoja,
} from "@/lib/pedidos-loja-store"
import { listarProdutos } from "@/lib/loja-store"
import { formatarValor, formatarCPF, formatarTelefone, formatarCEP } from "@/lib/formatadores"

export default function LojaPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoLoja[]>([])
  const [produtos, setProdutos] = useState(listarProdutos())
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<StatusPedidoLoja | "todos">("todos")
  const [abaAtiva, setAbaAtiva] = useState("todos")
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoLoja | null>(null)
  const [dialogDetalhesOpen, setDialogDetalhesOpen] = useState(false)
  const [dialogCriarOpen, setDialogCriarOpen] = useState(false)
  const [dialogReembolsoOpen, setDialogReembolsoOpen] = useState(false)
  const [dialogTrocaOpen, setDialogTrocaOpen] = useState(false)
  const [dialogDevolucaoOpen, setDialogDevolucaoOpen] = useState(false)
  const [dialogDisputaOpen, setDialogDisputaOpen] = useState(false)
  const [dialogNotaFiscalOpen, setDialogNotaFiscalOpen] = useState(false)
  const [dialogRastreamentoOpen, setDialogRastreamentoOpen] = useState(false)
  const [formCriar, setFormCriar] = useState({
    nomeComprador: "",
    emailComprador: "",
    telefoneComprador: "",
    cpfComprador: "",
    itens: [] as Array<{ produtoId: string; quantidade: number }>,
    enderecoEntrega: {
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
    observacoes: "",
  })
  const [formReembolso, setFormReembolso] = useState({ valor: 0, motivo: "" })
  const [formTroca, setFormTroca] = useState({ motivo: "", produtosTroca: [] as Array<{ produtoId: string; quantidade: number }> })
  const [formDevolucao, setFormDevolucao] = useState({ motivo: "" })
  const [formDisputa, setFormDisputa] = useState({ motivo: "" })
  const [formNotaFiscal, setFormNotaFiscal] = useState({ numero: "", serie: "", chaveAcesso: "" })
  const [formRastreamento, setFormRastreamento] = useState({ codigo: "", metodo: "" })

  const carregar = () => {
    const statusMap: Record<string, StatusPedidoLoja | "todos"> = {
      todos: "todos",
      pendentes: "pendente",
      pagos: "pago",
      cancelados: "cancelado",
      reembolsados: "reembolsado",
      separacao: "separacao",
      enviados: "enviado",
      entregues: "entregue",
      disputas: "disputa",
    }
    const status = statusMap[abaAtiva] || "todos"
    setPedidos(listarPedidosLoja(status === "todos" ? undefined : { status }))
    setProdutos(listarProdutos())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("pedidos-updated", h)
    window.addEventListener("pedidos-loja-updated", h)
    window.addEventListener("loja-updated", h)
    return () => {
      window.removeEventListener("pedidos-updated", h)
      window.removeEventListener("pedidos-loja-updated", h)
      window.removeEventListener("loja-updated", h)
    }
  }, [abaAtiva])

  const pedidosFiltrados = pedidos.filter((p) => {
    if (busca) {
      const buscaLower = busca.toLowerCase()
      return (
        p.id.toLowerCase().includes(buscaLower) ||
        p.nomeComprador.toLowerCase().includes(buscaLower) ||
        p.emailComprador.toLowerCase().includes(buscaLower) ||
        p.cpfComprador.includes(busca) ||
        p.campanhaTitulo.toLowerCase().includes(buscaLower)
      )
    }
    return true
  })

  const getStatusBadge = (status: StatusPedidoLoja) => {
    const badges: Record<StatusPedidoLoja, { label: string; className: string }> = {
      pendente: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-400" },
      pago: { label: "Pago", className: "bg-green-500/20 text-green-400" },
      cancelado: { label: "Cancelado", className: "bg-red-500/20 text-red-400" },
      reembolsado: { label: "Reembolsado", className: "bg-purple-500/20 text-purple-400" },
      separacao: { label: "Em Separação", className: "bg-blue-500/20 text-blue-400" },
      enviado: { label: "Enviado", className: "bg-indigo-500/20 text-indigo-400" },
      entregue: { label: "Entregue", className: "bg-green-600/20 text-green-500" },
      disputa: { label: "Disputa", className: "bg-orange-500/20 text-orange-400" },
    }
    return badges[status] || badges.pendente
  }

  const handleCriarPedido = () => {
    if (!formCriar.nomeComprador.trim() || !formCriar.emailComprador.trim() || !formCriar.cpfComprador.trim() || formCriar.itens.length === 0) {
      alert("Preencha todos os campos obrigatórios e adicione pelo menos um item")
      return
    }
    
    const itensCompletos = formCriar.itens.map((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId)
      return {
        produtoId: item.produtoId,
        nome: produto?.nome || "Produto",
        quantidade: item.quantidade,
        valorUnitario: produto?.precoReais || 0,
        sku: (produto as any)?.sku,
      }
    })
    
    criarPedidoManual({
      nomeComprador: formCriar.nomeComprador,
      emailComprador: formCriar.emailComprador,
      telefoneComprador: formCriar.telefoneComprador.replace(/\D/g, ""),
      cpfComprador: formCriar.cpfComprador.replace(/\D/g, ""),
      itens: itensCompletos,
      enderecoEntrega: formCriar.enderecoEntrega.cep ? formCriar.enderecoEntrega : undefined,
      observacoes: formCriar.observacoes,
    })
    
    setDialogCriarOpen(false)
    setFormCriar({
      nomeComprador: "",
      emailComprador: "",
      telefoneComprador: "",
      cpfComprador: "",
      itens: [],
      enderecoEntrega: {
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      },
      observacoes: "",
    })
    carregar()
  }

  const handleImprimirPedido = (pedido: PedidoLoja) => {
    const janela = window.open("", "_blank")
    if (!janela) return
    
    const html = `
      <html>
        <head><title>Pedido ${pedido.id}</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>Pedido #${pedido.id}</h1>
          <h2>Dados do Cliente</h2>
          <p><strong>Nome:</strong> ${pedido.nomeComprador}</p>
          <p><strong>E-mail:</strong> ${pedido.emailComprador}</p>
          <p><strong>Telefone:</strong> ${formatarTelefone(pedido.telefoneComprador)}</p>
          <p><strong>CPF:</strong> ${formatarCPF(pedido.cpfComprador)}</p>
          ${pedido.enderecoEntrega ? `
            <h2>Endereço de Entrega</h2>
            <p>${pedido.enderecoEntrega.rua}, ${pedido.enderecoEntrega.numero}</p>
            <p>${pedido.enderecoEntrega.bairro}, ${pedido.enderecoEntrega.cidade} - ${pedido.enderecoEntrega.estado}</p>
            <p>CEP: ${formatarCEP(pedido.enderecoEntrega.cep)}</p>
          ` : ""}
          <h2>Itens</h2>
          <table border="1" cellpadding="5" style="width: 100%; border-collapse: collapse;">
            <tr><th>Produto</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th></tr>
            ${pedido.itens?.map((i) => `
              <tr>
                <td>${i.nome}</td>
                <td>${i.quantidade}</td>
                <td>${formatarValor(i.valorUnitario)}</td>
                <td>${formatarValor(i.quantidade * i.valorUnitario)}</td>
              </tr>
            `).join("") || ""}
          </table>
          <h2>Total: ${formatarValor(pedido.valorTotal)}</h2>
          <p><strong>Status:</strong> ${getStatusBadge(pedido.statusLoja || "pendente").label}</p>
          <p><strong>Data:</strong> ${new Date(pedido.criadoEm).toLocaleString("pt-BR")}</p>
        </body>
      </html>
    `
    janela.document.write(html)
    janela.document.close()
    janela.print()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="h-8 w-8 text-[#FFB800]" />
          Gestão de Pedidos
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setDialogCriarOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Criar Pedido Manual
          </Button>
        </div>
      </div>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="grid w-full grid-cols-9 mb-6">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="separacao">Separação</TabsTrigger>
          <TabsTrigger value="enviados">Enviados</TabsTrigger>
          <TabsTrigger value="entregues">Entregues</TabsTrigger>
          <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
          <TabsTrigger value="reembolsados">Reembolsados</TabsTrigger>
          <TabsTrigger value="disputas">Disputas</TabsTrigger>
        </TabsList>

        <TabsContent value={abaAtiva}>
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white">Lista de Pedidos</CardTitle>
                  <CardDescription>Gerencie todos os pedidos da loja virtual</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pedidos..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-8 w-64 bg-background"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {pedidosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhum pedido encontrado.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Cliente</TableHead>
                      <TableHead className="text-gray-300">Itens</TableHead>
                      <TableHead className="text-gray-300">Valor Total</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Data</TableHead>
                      <TableHead className="text-gray-300 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosFiltrados.map((pedido) => {
                      const statusBadge = getStatusBadge(pedido.statusLoja || "pendente")
                      return (
                        <TableRow key={pedido.id}>
                          <TableCell className="font-medium text-white">#{pedido.id.slice(-8)}</TableCell>
                          <TableCell className="text-gray-300">
                            <div>
                              <div className="font-medium">{pedido.nomeComprador}</div>
                              <div className="text-sm text-gray-400">{pedido.emailComprador}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {pedido.itens?.length || 0} item(s)
                          </TableCell>
                          <TableCell className="text-gray-300 font-bold">{formatarValor(pedido.valorTotal)}</TableCell>
                          <TableCell>
                            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">
                            {new Date(pedido.criadoEm).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPedidoSelecionado(pedido)
                                  setDialogDetalhesOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleImprimirPedido(pedido)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Dialog Detalhes do Pedido */}
      <Dialog open={dialogDetalhesOpen} onOpenChange={setDialogDetalhesOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          {pedidoSelecionado && (
            <>
              <DialogHeader>
                <DialogTitle>Pedido #{pedidoSelecionado.id.slice(-8)}</DialogTitle>
                <DialogDescription>Detalhes completos do pedido</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Dados do Cliente</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nome:</strong> {pedidoSelecionado.nomeComprador}</p>
                      <p><strong>E-mail:</strong> {pedidoSelecionado.emailComprador}</p>
                      <p><strong>Telefone:</strong> {formatarTelefone(pedidoSelecionado.telefoneComprador)}</p>
                      <p><strong>CPF:</strong> {formatarCPF(pedidoSelecionado.cpfComprador)}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Informações do Pedido</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Status:</strong> <Badge className={getStatusBadge(pedidoSelecionado.statusLoja || "pendente").className}>{getStatusBadge(pedidoSelecionado.statusLoja || "pendente").label}</Badge></p>
                      <p><strong>Data:</strong> {new Date(pedidoSelecionado.criadoEm).toLocaleString("pt-BR")}</p>
                      {pedidoSelecionado.pagoEm && (
                        <p><strong>Pago em:</strong> {new Date(pedidoSelecionado.pagoEm).toLocaleString("pt-BR")}</p>
                      )}
                      {pedidoSelecionado.codigoRastreamento && (
                        <p><strong>Rastreamento:</strong> {pedidoSelecionado.codigoRastreamento}</p>
                      )}
                    </div>
                  </div>
                </div>

                {pedidoSelecionado.enderecoEntrega && (
                  <div>
                    <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                    <div className="text-sm">
                      <p>{pedidoSelecionado.enderecoEntrega.rua}, {pedidoSelecionado.enderecoEntrega.numero}</p>
                      {pedidoSelecionado.enderecoEntrega.complemento && (
                        <p>Complemento: {pedidoSelecionado.enderecoEntrega.complemento}</p>
                      )}
                      <p>{pedidoSelecionado.enderecoEntrega.bairro}, {pedidoSelecionado.enderecoEntrega.cidade} - {pedidoSelecionado.enderecoEntrega.estado}</p>
                      <p>CEP: {formatarCEP(pedidoSelecionado.enderecoEntrega.cep)}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Itens do Pedido</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Produto</TableHead>
                        <TableHead className="text-gray-300">SKU</TableHead>
                        <TableHead className="text-gray-300">Quantidade</TableHead>
                        <TableHead className="text-gray-300">Valor Unit.</TableHead>
                        <TableHead className="text-gray-300">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidoSelecionado.itens?.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-white">{item.nome}</TableCell>
                          <TableCell className="text-gray-300">{item.sku || "—"}</TableCell>
                          <TableCell className="text-gray-300">{item.quantidade}</TableCell>
                          <TableCell className="text-gray-300">{formatarValor(item.valorUnitario)}</TableCell>
                          <TableCell className="text-gray-300 font-bold">{formatarValor(item.quantidade * item.valorUnitario)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-right">
                    <p className="text-xl font-bold text-white">Total: {formatarValor(pedidoSelecionado.valorTotal)}</p>
                  </div>
                </div>

                {pedidoSelecionado.notaFiscal && (
                  <div>
                    <h3 className="font-semibold mb-2">Nota Fiscal</h3>
                    <div className="text-sm space-y-1">
                      {pedidoSelecionado.notaFiscal.numero && <p><strong>Número:</strong> {pedidoSelecionado.notaFiscal.numero}</p>}
                      {pedidoSelecionado.notaFiscal.serie && <p><strong>Série:</strong> {pedidoSelecionado.notaFiscal.serie}</p>}
                      {pedidoSelecionado.notaFiscal.chaveAcesso && <p><strong>Chave de Acesso:</strong> {pedidoSelecionado.notaFiscal.chaveAcesso}</p>}
                    </div>
                  </div>
                )}

                {pedidoSelecionado.historicoAlteracoes && pedidoSelecionado.historicoAlteracoes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Histórico de Alterações</h3>
                    <div className="space-y-2 text-sm">
                      {pedidoSelecionado.historicoAlteracoes.map((h, idx) => (
                        <div key={idx} className="border-l-2 border-gray-700 pl-3">
                          <p><strong>{h.acao}</strong> por {h.usuario}</p>
                          <p className="text-gray-400">{new Date(h.data).toLocaleString("pt-BR")}</p>
                          {h.detalhes && <p className="text-gray-400">{h.detalhes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const novoStatus = pedidoSelecionado.statusLoja === "pago" ? "separacao" : pedidoSelecionado.statusLoja === "separacao" ? "enviado" : pedidoSelecionado.statusLoja === "enviado" ? "entregue" : "pago"
                      atualizarStatusPedido(pedidoSelecionado.id, novoStatus, "Admin", "Atualização manual")
                      carregar()
                      setDialogDetalhesOpen(false)
                    }}
                  >
                    Atualizar Status
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setFormRastreamento({ codigo: pedidoSelecionado.codigoRastreamento || "", metodo: pedidoSelecionado.metodoEnvio || "" })
                    setDialogRastreamentoOpen(true)
                  }}>
                    <Truck className="mr-2 h-4 w-4" /> Rastreamento
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setFormNotaFiscal({
                      numero: pedidoSelecionado.notaFiscal?.numero || "",
                      serie: pedidoSelecionado.notaFiscal?.serie || "",
                      chaveAcesso: pedidoSelecionado.notaFiscal?.chaveAcesso || "",
                    })
                    setDialogNotaFiscalOpen(true)
                  }}>
                    <Receipt className="mr-2 h-4 w-4" /> Nota Fiscal
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setFormReembolso({ valor: pedidoSelecionado.valorTotal, motivo: "" })
                    setDialogReembolsoOpen(true)
                  }}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reembolso
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setFormTroca({ motivo: "", produtosTroca: [] })
                    setDialogTrocaOpen(true)
                  }}>
                    <ArrowLeftRight className="mr-2 h-4 w-4" /> Troca
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setFormDevolucao({ motivo: "" })
                    setDialogDevolucaoOpen(true)
                  }}>
                    <Box className="mr-2 h-4 w-4" /> Devolução
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setFormDisputa({ motivo: "" })
                    setDialogDisputaOpen(true)
                  }}>
                    <AlertCircle className="mr-2 h-4 w-4" /> Disputa
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Criar Pedido Manual */}
      <Dialog open={dialogCriarOpen} onOpenChange={setDialogCriarOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Pedido Manual</DialogTitle>
            <DialogDescription>Cadastre um pedido manualmente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Cliente *</Label>
                <Input value={formCriar.nomeComprador} onChange={(e) => setFormCriar((f) => ({ ...f, nomeComprador: e.target.value }))} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input type="email" value={formCriar.emailComprador} onChange={(e) => setFormCriar((f) => ({ ...f, emailComprador: e.target.value }))} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Telefone *</Label>
                <Input value={formCriar.telefoneComprador} onChange={(e) => setFormCriar((f) => ({ ...f, telefoneComprador: formatarTelefone(e.target.value) }))} maxLength={15} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input value={formCriar.cpfComprador} onChange={(e) => setFormCriar((f) => ({ ...f, cpfComprador: formatarCPF(e.target.value) }))} maxLength={14} className="bg-background" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Produtos *</Label>
              {formCriar.itens.map((item, idx) => {
                const produto = produtos.find((p) => p.id === item.produtoId)
                return (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                    <span className="flex-1">{produto?.nome || "Produto"}</span>
                    <span className="text-sm text-gray-400">Qtd: {item.quantidade}</span>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setFormCriar((f) => ({ ...f, itens: f.itens.filter((_, i) => i !== idx) }))
                    }}>Remover</Button>
                  </div>
                )
              })}
              <Select onValueChange={(produtoId) => {
                if (!formCriar.itens.find((i) => i.produtoId === produtoId)) {
                  setFormCriar((f) => ({ ...f, itens: [...f.itens, { produtoId, quantidade: 1 }] }))
                }
              }}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Adicionar produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.filter((p) => !formCriar.itens.find((i) => i.produtoId === p.id)).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input value={formCriar.enderecoEntrega.cep} onChange={(e) => setFormCriar((f) => ({ ...f, enderecoEntrega: { ...f.enderecoEntrega, cep: formatarCEP(e.target.value) } }))} maxLength={9} className="bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rua</Label>
                <Input value={formCriar.enderecoEntrega.rua} onChange={(e) => setFormCriar((f) => ({ ...f, enderecoEntrega: { ...f.enderecoEntrega, rua: e.target.value } }))} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input value={formCriar.enderecoEntrega.numero} onChange={(e) => setFormCriar((f) => ({ ...f, enderecoEntrega: { ...f.enderecoEntrega, numero: e.target.value } }))} className="bg-background" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={formCriar.observacoes} onChange={(e) => setFormCriar((f) => ({ ...f, observacoes: e.target.value }))} className="bg-background" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogCriarOpen(false)}>Cancelar</Button>
            <Button onClick={handleCriarPedido}>Criar Pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reembolso */}
      <Dialog open={dialogReembolsoOpen} onOpenChange={setDialogReembolsoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Solicitar Reembolso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input type="number" value={formReembolso.valor} onChange={(e) => setFormReembolso((f) => ({ ...f, valor: parseFloat(e.target.value) || 0 }))} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Textarea value={formReembolso.motivo} onChange={(e) => setFormReembolso((f) => ({ ...f, motivo: e.target.value }))} className="bg-background" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogReembolsoOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (pedidoSelecionado && formReembolso.motivo.trim()) {
                solicitarReembolso(pedidoSelecionado.id, formReembolso.valor, formReembolso.motivo, "Admin")
                carregar()
                setDialogReembolsoOpen(false)
              }
            }}>Solicitar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Troca */}
      <Dialog open={dialogTrocaOpen} onOpenChange={setDialogTrocaOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Solicitar Troca</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Textarea value={formTroca.motivo} onChange={(e) => setFormTroca((f) => ({ ...f, motivo: e.target.value }))} className="bg-background" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogTrocaOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (pedidoSelecionado && formTroca.motivo.trim()) {
                solicitarTroca(pedidoSelecionado.id, formTroca.motivo, formTroca.produtosTroca, "Admin")
                carregar()
                setDialogTrocaOpen(false)
              }
            }}>Solicitar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Devolução */}
      <Dialog open={dialogDevolucaoOpen} onOpenChange={setDialogDevolucaoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Solicitar Devolução</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Textarea value={formDevolucao.motivo} onChange={(e) => setFormDevolucao((f) => ({ ...f, motivo: e.target.value }))} className="bg-background" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogDevolucaoOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (pedidoSelecionado && formDevolucao.motivo.trim()) {
                solicitarDevolucao(pedidoSelecionado.id, formDevolucao.motivo, "Admin")
                carregar()
                setDialogDevolucaoOpen(false)
              }
            }}>Solicitar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Disputa */}
      <Dialog open={dialogDisputaOpen} onOpenChange={setDialogDisputaOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Abrir Disputa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Textarea value={formDisputa.motivo} onChange={(e) => setFormDisputa((f) => ({ ...f, motivo: e.target.value }))} className="bg-background" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogDisputaOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (pedidoSelecionado && formDisputa.motivo.trim()) {
                abrirDisputa(pedidoSelecionado.id, formDisputa.motivo, "Admin")
                carregar()
                setDialogDisputaOpen(false)
              }
            }}>Abrir Disputa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nota Fiscal */}
      <Dialog open={dialogNotaFiscalOpen} onOpenChange={setDialogNotaFiscalOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Nota Fiscal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número</Label>
                <Input value={formNotaFiscal.numero} onChange={(e) => setFormNotaFiscal((f) => ({ ...f, numero: e.target.value }))} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Série</Label>
                <Input value={formNotaFiscal.serie} onChange={(e) => setFormNotaFiscal((f) => ({ ...f, serie: e.target.value }))} className="bg-background" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Chave de Acesso</Label>
              <Input value={formNotaFiscal.chaveAcesso} onChange={(e) => setFormNotaFiscal((f) => ({ ...f, chaveAcesso: e.target.value }))} className="bg-background" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogNotaFiscalOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (pedidoSelecionado) {
                atualizarNotaFiscal(pedidoSelecionado.id, formNotaFiscal, "Admin")
                carregar()
                setDialogNotaFiscalOpen(false)
              }
            }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rastreamento */}
      <Dialog open={dialogRastreamentoOpen} onOpenChange={setDialogRastreamentoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Código de Rastreamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Código *</Label>
              <Input value={formRastreamento.codigo} onChange={(e) => setFormRastreamento((f) => ({ ...f, codigo: e.target.value }))} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Método de Envio</Label>
              <Input value={formRastreamento.metodo} onChange={(e) => setFormRastreamento((f) => ({ ...f, metodo: e.target.value }))} className="bg-background" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogRastreamentoOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (pedidoSelecionado && formRastreamento.codigo.trim()) {
                atualizarRastreamento(pedidoSelecionado.id, formRastreamento.codigo, formRastreamento.metodo, "Admin")
                carregar()
                setDialogRastreamentoOpen(false)
              }
            }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
