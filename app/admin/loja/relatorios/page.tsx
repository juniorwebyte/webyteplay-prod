"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileBarChart,
  Download,
  TrendingUp,
  Package,
  Percent,
  ShoppingCart,
  Users,
  DollarSign,
  Archive,
  Megaphone,
  Receipt,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { formatarValor } from "@/lib/formatadores"
import {
  faturamentoLoja,
  totalVendasLoja,
  listarVendasLojaPagas,
} from "@/lib/vendas-loja-store"
import { listarProdutos } from "@/lib/loja-store"
import {
  relatorioVendas,
  relatorioProdutos,
  relatorioConversao,
  relatorioCarrinhoAbandonado,
  relatorioClientes,
  relatorioFinanceiro,
  relatorioEstoque,
  relatorioMarketing,
  relatorioTaxas,
} from "@/lib/relatorios-loja-store"
import { listarClientesLoja } from "@/lib/clientes-loja-store"

function exportarCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => String(c).replace(/;/g, ",")).join(";"))].join("\n")
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function LojaRelatoriosPage() {
  const [periodo, setPeriodo] = useState("30")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  useEffect(() => {
    const hoje = new Date()
    const mesAtras = new Date(hoje)
    mesAtras.setMonth(mesAtras.getMonth() - 1)
    setDataInicio(mesAtras.toISOString().slice(0, 10))
    setDataFim(hoje.toISOString().slice(0, 10))
  }, [])

  const dias = parseInt(periodo, 10) || 30
  const vendas = listarVendasLojaPagas()
  const faturamento = faturamentoLoja()
  const produtos = listarProdutos()

  const repVendas = relatorioVendas(dias)
  const repProdutos = relatorioProdutos()
  const repConversao = relatorioConversao(dias)
  const repCarrinho = relatorioCarrinhoAbandonado()
  const repClientes = relatorioClientes()
  const repFinanceiro = relatorioFinanceiro(
    (dataInicio || "2020-01-01") + "T00:00:00",
    (dataFim || new Date().toISOString().slice(0, 10)) + "T23:59:59"
  )
  const repEstoque = relatorioEstoque()
  const repMarketing = relatorioMarketing()
  const repTaxas = relatorioTaxas(
    (dataInicio || "2020-01-01") + "T00:00:00",
    (dataFim || new Date().toISOString().slice(0, 10)) + "T23:59:59"
  )

  const chartVendasPorDia = useMemo(() => {
    const pedidos = vendas.filter((v) => {
      const d = new Date(v.pagoEm || v.criadoEm)
      const lim = new Date()
      lim.setDate(lim.getDate() - dias)
      return d >= lim
    })
    const porDia: Record<string, { data: string; valor: number }> = {}
    const hoje = new Date()
    for (let i = dias - 1; i >= 0; i--) {
      const d = new Date(hoje)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      porDia[key] = { data: key.slice(8, 10) + "/" + key.slice(5, 7), valor: 0 }
    }
    pedidos.forEach((v) => {
      const key = (v.pagoEm || v.criadoEm).slice(0, 10)
      if (porDia[key]) porDia[key].valor += v.valorTotal || 0
    })
    return Object.values(porDia)
  }, [vendas, dias])

  const exportarVendas = () => {
    const headers = ["Data", "Produto", "Cliente", "CPF", "Valor", "Status"]
    const rows = vendas.map((v) => [
      new Date(v.pagoEm || v.criadoEm).toLocaleString("pt-BR"),
      v.campanhaTitulo || "—",
      v.nomeComprador,
      v.cpfComprador,
      v.valorTotal.toFixed(2),
      "Pago",
    ])
    exportarCSV(headers, rows, "relatorio-vendas")
  }

  const exportarProdutos = () => {
    const headers = ["Nome", "Preço", "Estoque", "Ativo", "Destaque"]
    const rows = produtos.map((p) => [
      p.nome,
      (p as { preco?: number }).preco ?? 0,
      (p as { estoque?: number }).estoque ?? 0,
      p.ativo ? "Sim" : "Não",
      p.destaque ? "Sim" : "Não",
    ])
    exportarCSV(headers, rows, "relatorio-produtos")
  }

  const exportarClientes = () => {
    const clientes = listarClientesLoja()
    const headers = ["Nome", "CPF", "E-mail", "Telefone", "Total Compras", "Valor Gasto"]
    const rows = clientes.map((c) => [c.nome, c.cpf, c.email, c.telefone, c.totalCompras ?? 0, (c.valorGasto ?? 0).toFixed(2)])
    exportarCSV(headers, rows, "relatorio-clientes")
  }

  const exportarGeral = () => {
    const headers = ["Métrica", "Valor"]
    const rows = [
      ["Faturamento total", faturamento.toFixed(2)],
      ["Total vendas", totalVendasLoja().toString()],
      ["Produtos cadastrados", produtos.length.toString()],
      ["Ticket médio", vendas.length > 0 ? (faturamento / vendas.length).toFixed(2) : "0"],
    ]
    exportarCSV(headers, rows, "relatorio-geral")
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <FileBarChart className="h-8 w-8 text-[#FFB800]" />
        Relatórios
      </h1>

      <Tabs defaultValue="vendas" className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-6 bg-[#171923] border border-gray-800 max-h-32 overflow-y-auto">
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="conversao">Conversão</TabsTrigger>
          <TabsTrigger value="carrinho">Carrinho Abandonado</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="taxas">Taxas</TabsTrigger>
          <TabsTrigger value="exportacao">Exportação</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Relatório de Vendas</CardTitle>
                <CardDescription>Vendas e faturamento no período.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="w-40 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={exportarVendas}><Download className="h-4 w-4 mr-2" /> CSV</Button>
              </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Vendas no período</p>
                  <p className="text-xl font-bold text-white">{repVendas.vendasPeriodo}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Valor</p>
                  <p className="text-xl font-bold text-[#FFB800]">{formatarValor(repVendas.valorPeriodo)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Ticket médio</p>
                  <p className="text-xl font-bold text-white">{formatarValor(repVendas.ticketMedio)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Taxa conversão</p>
                  <p className="text-xl font-bold text-green-400">{repVendas.taxaConversao.toFixed(1)}%</p>
                </div>
              </div>
              {chartVendasPorDia.length > 0 && (
                <ChartContainer config={{ valor: { label: "Valor" } }} className="h-[260px] w-full mt-6">
                  <BarChart data={chartVendasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-700" />
                    <XAxis dataKey="data" tick={{ fill: "#9ca3af" }} />
                    <YAxis tick={{ fill: "#9ca3af" }} tickFormatter={(v) => `R$ ${v}`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatarValor(Number(v))} />} />
                    <Bar dataKey="valor" fill="#FFB800" radius={[4, 4, 0, 0]} name="Valor" />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><Package className="h-5 w-5" /> Relatório de Produtos</CardTitle>
                <CardDescription>Ranking e métricas.</CardDescription>
              </div>
              <Button variant="outline" onClick={exportarProdutos}><Download className="h-4 w-4 mr-2" /> CSV</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Total produtos</p>
                  <p className="text-xl font-bold text-white">{repProdutos.totalProdutos}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Ativos</p>
                  <p className="text-xl font-bold text-green-400">{repProdutos.ativos}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Destaque</p>
                  <p className="text-xl font-bold text-[#FFB800]">{repProdutos.destaque}</p>
                </div>
              </div>
              {repProdutos.rankingVendas.length > 0 && (
                <ChartContainer config={{ valor: { label: "Valor" } }} className="h-[260px] w-full mb-6">
                  <BarChart data={repProdutos.rankingVendas.slice(0, 8)} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-700" />
                    <XAxis type="number" tick={{ fill: "#9ca3af" }} tickFormatter={(v) => `R$ ${v}`} />
                    <YAxis type="category" dataKey="nome" width={55} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatarValor(Number(v))} />} />
                    <Bar dataKey="valor" fill="#FFB800" radius={[0, 4, 4, 0]} name="Valor" />
                  </BarChart>
                </ChartContainer>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Produto</TableHead>
                    <TableHead className="text-gray-300">Qtd vendida</TableHead>
                    <TableHead className="text-gray-300">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repProdutos.rankingVendas.slice(0, 15).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-white">{r.nome}</TableCell>
                      <TableCell className="text-gray-400">{r.quantidade}</TableCell>
                      <TableCell className="text-[#FFB800]">{formatarValor(r.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversao">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Percent className="h-5 w-5" /> Relatório de Conversão</CardTitle>
              <CardDescription>Pedidos criados vs pagos no período.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Pedidos criados</p>
                  <p className="text-xl font-bold text-white">{repConversao.totalCriados}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Pagados</p>
                  <p className="text-xl font-bold text-green-400">{repConversao.pagos}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Taxa pagamento</p>
                  <p className="text-xl font-bold text-white">{repConversao.taxaPagamento.toFixed(1)}%</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Valor convertido</p>
                  <p className="text-xl font-bold text-[#FFB800]">{formatarValor(repConversao.valorConvertido)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carrinho">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Relatório de Carrinho Abandonado</CardTitle>
              <CardDescription>Pedidos iniciados mas não finalizados.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">{repCarrinho.mensagem}</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Abandonos</p>
                  <p className="text-xl font-bold text-white">{repCarrinho.totalAbandonos}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Valor perdido</p>
                  <p className="text-xl font-bold text-red-400">{formatarValor(repCarrinho.valorPerdido)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Ticket médio</p>
                  <p className="text-xl font-bold text-white">{formatarValor(repCarrinho.ticketMedioAbandono)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><Users className="h-5 w-5" /> Relatório de Clientes</CardTitle>
                <CardDescription>Base de clientes e compradores.</CardDescription>
              </div>
              <Button variant="outline" onClick={exportarClientes}><Download className="h-4 w-4 mr-2" /> CSV</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Total clientes</p>
                  <p className="text-xl font-bold text-white">{repClientes.totalClientes}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Compradores únicos</p>
                  <p className="text-xl font-bold text-green-400">{repClientes.compradoresUnicos}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Novos (30 dias)</p>
                  <p className="text-xl font-bold text-white">{repClientes.novosClientes}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">VIPs</p>
                  <p className="text-xl font-bold text-[#FFB800]">{repClientes.vips}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><DollarSign className="h-5 w-5" /> Relatório Financeiro</CardTitle>
              <CardDescription>Fluxo de caixa e estornos no período.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div><Label className="text-gray-400">De</Label><Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="bg-background" /></div>
                <div><Label className="text-gray-400">Até</Label><Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="bg-background" /></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Recebimentos</p>
                  <p className="text-xl font-bold text-green-400">{formatarValor(repFinanceiro.recebimentos)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Pagamentos</p>
                  <p className="text-xl font-bold text-red-400">{formatarValor(repFinanceiro.pagamentos)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Saldo</p>
                  <p className="text-xl font-bold text-white">{formatarValor(repFinanceiro.saldo)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Taxas gateway</p>
                  <p className="text-xl font-bold text-amber-400">{formatarValor(repFinanceiro.taxasGateway)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Estornos</p>
                  <p className="text-xl font-bold text-red-400">{formatarValor(repFinanceiro.totalEstornos)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Archive className="h-5 w-5" /> Relatório de Estoque</CardTitle>
              <CardDescription>Produtos e alertas de estoque baixo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Total produtos</p>
                  <p className="text-xl font-bold text-white">{repEstoque.totalProdutos}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Com estoque</p>
                  <p className="text-xl font-bold text-green-400">{repEstoque.comEstoque}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Sem estoque</p>
                  <p className="text-xl font-bold text-red-400">{repEstoque.semEstoque}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Alertas baixo</p>
                  <p className="text-xl font-bold text-amber-400">{repEstoque.alertasEstoqueBaixo.length}</p>
                </div>
              </div>
              {repEstoque.alertasEstoqueBaixo.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Produto</TableHead>
                      <TableHead className="text-gray-300">Estoque</TableHead>
                      <TableHead className="text-gray-300">Mínimo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repEstoque.alertasEstoqueBaixo.map((a, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-white">{a.nome}</TableCell>
                        <TableCell className="text-red-400">{a.estoque}</TableCell>
                        <TableCell className="text-gray-400">{a.minimo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Megaphone className="h-5 w-5" /> Relatório de Marketing</CardTitle>
              <CardDescription>Cupons, campanhas e banners.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Cupons ativos</p>
                  <p className="text-xl font-bold text-white">{repMarketing.cuponsAtivos}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Total usos cupons</p>
                  <p className="text-xl font-bold text-[#FFB800]">{repMarketing.cuponsTotalUsos}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Campanhas ativas</p>
                  <p className="text-xl font-bold text-white">{repMarketing.campanhasAtivas}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Banners ativos</p>
                  <p className="text-xl font-bold text-white">{repMarketing.bannersAtivos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxas">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Receipt className="h-5 w-5" /> Relatório de Taxas</CardTitle>
              <CardDescription>Taxas de gateway e transações.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Taxas gateway (total)</p>
                  <p className="text-xl font-bold text-amber-400">{formatarValor(repTaxas.totalTaxasGateway)}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Transações (período)</p>
                  <p className="text-xl font-bold text-white">{repTaxas.transacoesPeriodo}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Pagamentos</p>
                  <p className="text-xl font-bold text-green-400">{repTaxas.porTipo.pagamento}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Falhas</p>
                  <p className="text-xl font-bold text-red-400">{repTaxas.porTipo.falha}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exportacao">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Download className="h-5 w-5" /> Exportação CSV / Excel</CardTitle>
              <CardDescription>Baixe relatórios em CSV (compatível com Excel).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={exportarVendas} className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
                  <Download className="h-4 w-4 mr-2" /> Vendas (CSV)
                </Button>
                <Button onClick={exportarProdutos} variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Produtos (CSV)
                </Button>
                <Button onClick={exportarClientes} variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Clientes (CSV)
                </Button>
                <Button onClick={exportarGeral} variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Resumo geral (CSV)
                </Button>
              </div>
              <p className="text-sm text-gray-500">Os arquivos CSV podem ser abertos no Excel. Use separador &quot;;&quot; (ponto-e-vírgula) ao importar.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
