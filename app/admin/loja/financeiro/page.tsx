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
import {
  DollarSign,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Receipt,
  FileText,
  BarChart3,
  RefreshCw,
  Calculator,
  Building2,
  Percent,
  Plus,
  Search,
} from "lucide-react"
import {
  resumoFinanceiro,
  listarMovimentos,
  fluxoCaixaPorPeriodo,
  adicionarMovimento,
  listarEstornos,
  registrarEstorno,
  totalTaxasGateway,
  relatorioComissoes,
  relatorioImpostos,
  relatorioLucro,
  listarCentrosCusto,
  criarCentroCusto,
  listarFaturas,
  criarFatura,
  type MovimentoFinanceiro,
} from "@/lib/financeiro-loja-store"
import { faturamentoLoja, listarVendasLojaPagas } from "@/lib/vendas-loja-store"
import { obterGatewayConfig } from "@/lib/gateway-store"
import { formatarValor } from "@/lib/formatadores"

export default function LojaFinanceiroPage() {
  const [resumo, setResumo] = useState({ faturamentoTotal: 0, totalVendas: 0, ticketMedio: 0, pedidosPagos: 0 })
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([])
  const [abaAtiva, setAbaAtiva] = useState("resumo")
  const [periodoInicio, setPeriodoInicio] = useState("")
  const [periodoFim, setPeriodoFim] = useState("")
  const [dialogMovimentoOpen, setDialogMovimentoOpen] = useState(false)
  const [dialogEstornoOpen, setDialogEstornoOpen] = useState(false)
  const [dialogCentroOpen, setDialogCentroOpen] = useState(false)
  const [formMovimento, setFormMovimento] = useState({ tipo: "pagamento" as const, valor: 0, descricao: "", categoria: "" })
  const [formEstorno, setFormEstorno] = useState({ pedidoId: "", valor: 0, motivo: "" })
  const [formCentro, setFormCentro] = useState({ nome: "", descricao: "", orcamento: 0 })

  const carregar = () => {
    setResumo(resumoFinanceiro())
    const hoje = new Date()
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const fim = periodoFim || hoje.toISOString().slice(0, 10)
    const inicio = periodoInicio || mesPassado.toISOString().slice(0, 10)
    setMovimentos(listarMovimentos({ dataInicio: inicio + "T00:00:00", dataFim: fim + "T23:59:59" }))
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("pedidos-updated", h)
    window.addEventListener("financeiro-updated", h)
    return () => {
      window.removeEventListener("pedidos-updated", h)
      window.removeEventListener("financeiro-updated", h)
    }
  }, [periodoInicio, periodoFim])

  const fluxo = fluxoCaixaPorPeriodo(
    (periodoInicio || "2020-01-01") + "T00:00:00",
    (periodoFim || new Date().toISOString().slice(0, 10)) + "T23:59:59"
  )
  const impostos = relatorioImpostos()
  const lucro = relatorioLucro(
    (periodoInicio || "2020-01-01") + "T00:00:00",
    (periodoFim || new Date().toISOString().slice(0, 10)) + "T23:59:59"
  )
  const taxasGateway = totalTaxasGateway()
  const comissoes = relatorioComissoes()
  const centrosCusto = listarCentrosCusto()
  const faturas = listarFaturas()
  const estornos = listarEstornos()
  const config = obterGatewayConfig()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <DollarSign className="h-8 w-8 text-[#FFB800]" />
        Financeiro
      </h1>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-6">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="recebimentos">Recebimentos</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="estornos">Estornos</TabsTrigger>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="impostos">Impostos</TabsTrigger>
          <TabsTrigger value="centros">Centro de Custos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-[#171923] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Faturamento Total</CardTitle>
                <Wallet className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{formatarValor(resumo.faturamentoTotal)}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#171923] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Ticket Médio</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{formatarValor(resumo.ticketMedio)}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#171923] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">WebytePay</CardTitle>
                <DollarSign className="h-4 w-4 text-[#FFB800]" />
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-white">{config.nome || "Gateway"}</p>
                <p className="text-xs text-gray-500">{config.gatewayAtivo || "N/A"}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#171923] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Taxas de Gateway</CardTitle>
                <Percent className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-400">{formatarValor(taxasGateway)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Resumo por Período</CardTitle>
              <CardDescription>Comparativo de faturamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Recebimentos</p>
                  <p className="text-xl font-bold text-green-400">{formatarValor(fluxo.recebimentos)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Pagamentos</p>
                  <p className="text-xl font-bold text-red-400">{formatarValor(fluxo.pagamentos)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Saldo</p>
                  <p className="text-xl font-bold text-white">{formatarValor(fluxo.saldo)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fluxo">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex flex-wrap gap-4">
                <div>
                  <Label className="text-gray-400">Data Início</Label>
                  <Input type="date" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} className="bg-background" />
                </div>
                <div>
                  <Label className="text-gray-400">Data Fim</Label>
                  <Input type="date" value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} className="bg-background" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Descrição</TableHead>
                    <TableHead className="text-gray-300">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentos.slice(0, 50).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-gray-300">{new Date(m.data).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            m.tipo === "recebimento" || m.tipo === "estorno"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {m.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{m.descricao}</TableCell>
                      <TableCell className={m.valor >= 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                        {formatarValor(m.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recebimentos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recebimentos</CardTitle>
              <CardDescription>Entradas de valores</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-gray-300">Descrição</TableHead>
                    <TableHead className="text-gray-300">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentos.filter((m) => m.tipo === "recebimento" || m.tipo === "estorno").slice(0, 30).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-gray-300">{new Date(m.data).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-white">{m.descricao}</TableCell>
                      <TableCell className="text-green-400 font-bold">{formatarValor(m.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Pagamentos</CardTitle>
                  <CardDescription>Saídas e despesas</CardDescription>
                </div>
                <Button onClick={() => setDialogMovimentoOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Registrar Pagamento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Descrição</TableHead>
                    <TableHead className="text-gray-300">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentos.filter((m) => m.tipo === "pagamento" || m.tipo === "taxa" || m.tipo === "comissao").slice(0, 30).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-gray-300">{new Date(m.data).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-gray-300">{m.tipo}</TableCell>
                      <TableCell className="text-white">{m.descricao}</TableCell>
                      <TableCell className="text-red-400 font-bold">{formatarValor(Math.abs(m.valor))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estornos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Estornos</CardTitle>
                  <CardDescription>Devoluções e estornos processados</CardDescription>
                </div>
                <Button onClick={() => setDialogEstornoOpen(true)}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Registrar Estorno
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {estornos.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum estorno registrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Data</TableHead>
                      <TableHead className="text-gray-300">Pedido</TableHead>
                      <TableHead className="text-gray-300">Motivo</TableHead>
                      <TableHead className="text-gray-300">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estornos.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-gray-300">{new Date(m.data).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-white">{m.pedidoId || "—"}</TableCell>
                        <TableCell className="text-gray-300">{m.descricao}</TableCell>
                        <TableCell className="text-red-400 font-bold">{formatarValor(Math.abs(m.valor))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faturas">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Faturas e Boletos</CardTitle>
              <CardDescription>Documentos fiscais e cobranças</CardDescription>
            </CardHeader>
            <CardContent>
              {faturas.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhuma fatura cadastrada.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Número</TableHead>
                      <TableHead className="text-gray-300">Valor</TableHead>
                      <TableHead className="text-gray-300">Vencimento</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faturas.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="text-white">{f.numero}</TableCell>
                        <TableCell className="text-gray-300">{formatarValor(f.valor)}</TableCell>
                        <TableCell className="text-gray-300">{new Date(f.vencimento).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell><Badge className={f.status === "paga" ? "bg-green-500/20" : "bg-yellow-500/20"}>{f.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impostos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Relatório de Impostos</CardTitle>
              <CardDescription>Base tributável e impostos estimados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Faturamento {impostos.ano}</p>
                  <p className="text-xl font-bold text-white">{formatarValor(impostos.faturamento)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Base Tributável</p>
                  <p className="text-xl font-bold text-white">{formatarValor(impostos.baseTributavel)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Impostos Estimados (6%)</p>
                  <p className="text-xl font-bold text-yellow-400">{formatarValor(impostos.impostosEstimados)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#171923] border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Relatório de Lucro</CardTitle>
              <CardDescription>DRE simplificado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">Receita</p>
                  <p className="text-xl font-bold text-green-400">{formatarValor(lucro.receita)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Despesas</p>
                  <p className="text-xl font-bold text-red-400">{formatarValor(lucro.despesas)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Lucro</p>
                  <p className="text-xl font-bold text-white">{formatarValor(lucro.lucro)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Margem</p>
                  <p className="text-xl font-bold text-[#FFB800]">{lucro.margem.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#171923] border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Relatório de Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{formatarValor(comissoes.total)}</p>
              <p className="text-sm text-gray-500">{comissoes.movimentos.length} registro(s)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centros">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Centro de Custos</CardTitle>
                  <CardDescription>Organize despesas por centro</CardDescription>
                </div>
                <Button onClick={() => setDialogCentroOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Centro
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {centrosCusto.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum centro de custo cadastrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Centro</TableHead>
                      <TableHead className="text-gray-300">Orçamento</TableHead>
                      <TableHead className="text-gray-300">Gasto</TableHead>
                      <TableHead className="text-gray-300">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centrosCusto.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-white">{c.nome}</TableCell>
                        <TableCell className="text-gray-300">{formatarValor(c.orcamento || 0)}</TableCell>
                        <TableCell className="text-gray-300">{formatarValor(c.gasto)}</TableCell>
                        <TableCell className={c.gasto > (c.orcamento || 0) ? "text-red-400" : "text-green-400"}>
                          {formatarValor((c.orcamento || 0) - c.gasto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Registrar Pagamento */}
      <Dialog open={dialogMovimentoOpen} onOpenChange={setDialogMovimentoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formMovimento.tipo} onValueChange={(v: any) => setFormMovimento((f) => ({ ...f, tipo: v }))}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pagamento">Pagamento</SelectItem>
                  <SelectItem value="taxa">Taxa</SelectItem>
                  <SelectItem value="comissao">Comissão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor *</Label>
              <Input type="number" step={0.01} value={formMovimento.valor} onChange={(e) => setFormMovimento((f) => ({ ...f, valor: parseFloat(e.target.value) || 0 }))} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input value={formMovimento.descricao} onChange={(e) => setFormMovimento((f) => ({ ...f, descricao: e.target.value }))} className="bg-background" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMovimentoOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (formMovimento.valor > 0 && formMovimento.descricao.trim()) {
                adicionarMovimento({
                  tipo: formMovimento.tipo,
                  valor: -formMovimento.valor,
                  descricao: formMovimento.descricao,
                  data: new Date().toISOString(),
                })
                carregar()
                setDialogMovimentoOpen(false)
              }
            }}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Estorno */}
      <Dialog open={dialogEstornoOpen} onOpenChange={setDialogEstornoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Registrar Estorno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pedido ID</Label>
              <Input value={formEstorno.pedidoId} onChange={(e) => setFormEstorno((f) => ({ ...f, pedidoId: e.target.value }))} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Valor *</Label>
              <Input type="number" step={0.01} value={formEstorno.valor} onChange={(e) => setFormEstorno((f) => ({ ...f, valor: parseFloat(e.target.value) || 0 }))} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Input value={formEstorno.motivo} onChange={(e) => setFormEstorno((f) => ({ ...f, motivo: e.target.value }))} className="bg-background" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEstornoOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (formEstorno.valor > 0 && formEstorno.motivo.trim()) {
                registrarEstorno(formEstorno.pedidoId, formEstorno.valor, formEstorno.motivo)
                carregar()
                setDialogEstornoOpen(false)
              }
            }}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Centro de Custo */}
      <Dialog open={dialogCentroOpen} onOpenChange={setDialogCentroOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Novo Centro de Custo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formCentro.nome} onChange={(e) => setFormCentro((f) => ({ ...f, nome: e.target.value }))} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={formCentro.descricao} onChange={(e) => setFormCentro((f) => ({ ...f, descricao: e.target.value }))} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Orçamento</Label>
              <Input type="number" value={formCentro.orcamento} onChange={(e) => setFormCentro((f) => ({ ...f, orcamento: parseFloat(e.target.value) || 0 }))} className="bg-background" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogCentroOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (formCentro.nome.trim()) {
                criarCentroCusto(formCentro)
                carregar()
                setDialogCentroOpen(false)
              }
            }}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
