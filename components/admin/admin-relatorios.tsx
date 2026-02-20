"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, CalendarIcon, FileText, Info } from "lucide-react"
import { listarPedidos } from "@/lib/gateway-store"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts"
import { formatarValor } from "@/lib/formatadores"

export default function AdminRelatorios() {
  const [vendasTotais, setVendasTotais] = useState(0)
  const [rifasVendidas, setRifasVendidas] = useState(0)
  const [ticketMedio, setTicketMedio] = useState(0)
  const [periodoVendas, setPeriodoVendas] = useState("14dias")

  const carregarDados = useCallback(() => {
    const pedidos = listarPedidos().filter((p) => p.status === "pago")
    const totalVendas = pedidos.reduce((s, p) => s + (p.valorTotal || 0), 0)
    const totalCotas = pedidos.reduce((s, p) => s + (p.quantidade || 0), 0)
    setVendasTotais(totalVendas)
    setRifasVendidas(totalCotas)
    setTicketMedio(pedidos.length > 0 ? totalVendas / pedidos.length : 0)
  }, [])

  const diasPeriodo = useMemo(() => {
    const map: Record<string, number> = { "7dias": 7, "14dias": 14, "30dias": 30, "90dias": 90 }
    return map[periodoVendas] || 14
  }, [periodoVendas])

  const dadosVendasPorDia = useMemo(() => {
    const pedidos = listarPedidos().filter((p) => p.status === "pago")
    const porDia: Record<string, { data: string; valor: number; qtd: number }> = {}
    const hoje = new Date()
    for (let i = diasPeriodo - 1; i >= 0; i--) {
      const d = new Date(hoje)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      porDia[key] = { data: key.slice(8, 10) + "/" + key.slice(5, 7), valor: 0, qtd: 0 }
    }
    pedidos.forEach((p) => {
      const key = (p.pagoEm || p.criadoEm).slice(0, 10)
      if (porDia[key]) {
        porDia[key].valor += p.valorTotal || 0
        porDia[key].qtd += p.quantidade || 1
      }
    })
    return Object.values(porDia)
  }, [diasPeriodo])

  const dadosPorCategoria = useMemo(() => {
    const pedidos = listarPedidos().filter((p) => p.status === "pago")
    const porCampanha: Record<string, { nome: string; valor: number }> = {}
    pedidos.forEach((p) => {
      const nome = (p.campanhaTitulo || "Outros").slice(0, 20)
      if (!porCampanha[nome]) porCampanha[nome] = { nome, valor: 0 }
      porCampanha[nome].valor += p.valorTotal || 0
    })
    return Object.values(porCampanha).sort((a, b) => b.valor - a.valor).slice(0, 8)
  }, [])

  const dadosPorGateway = useMemo(() => {
    const pedidos = listarPedidos().filter((p) => p.status === "pago")
    const porTipo: Record<string, number> = {}
    pedidos.forEach(() => {
      porTipo.PIX = (porTipo.PIX || 0) + 1
    })
    const arr = Object.entries(porTipo).map(([nome, valor]) => ({ nome, valor }))
    return arr.length > 0 ? arr : [{ nome: "Sem dados", valor: 1 }]
  }, [])

  useEffect(() => {
    carregarDados()
    const onStorage = (e: StorageEvent) => { if (e.key === "pedidos") carregarDados() }
    window.addEventListener("pedidos-updated", carregarDados)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("pedidos-updated", carregarDados)
      window.removeEventListener("storage", onStorage)
    }
  }, [carregarDados])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">R$ {vendasTotais.toFixed(2).replace(".", ",")}</CardTitle>
            <CardDescription>Vendas Totais</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Valor total dos pedidos pagos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{rifasVendidas}</CardTitle>
            <CardDescription>Rifas Vendidas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total de cotas vendidas (pedidos pagos)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">R$ {ticketMedio.toFixed(2).replace(".", ",")}</CardTitle>
            <CardDescription>Ticket Médio</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Média por pedido pago
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Vendas por Dia</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={periodoVendas} onValueChange={setPeriodoVendas}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                    <SelectItem value="14dias">Últimos 14 dias</SelectItem>
                    <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                    <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            <ChartContainer
              config={{ valor: { label: "Valor (R$)" }, qtd: { label: "Quantidade" } }}
              className="h-[280px] w-full"
            >
              <BarChart data={dadosVendasPorDia}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="data" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `R$ ${v}`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatarValor(Number(v))} />} />
                <Bar dataKey="valor" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Valor" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Vendas por Categoria</CardTitle>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            <ChartContainer config={{ valor: { label: "Valor (R$)" } }} className="h-[280px] w-full">
              <BarChart data={dadosPorCategoria} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `R$ ${v}`} />
                <YAxis type="category" dataKey="nome" width={80} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatarValor(Number(v))} />} />
                <Bar dataKey="valor" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Valor" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Vendas por Gateway de Pagamento</CardTitle>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          <ChartContainer
            config={Object.fromEntries(dadosPorGateway.map((d) => [d.nome, { label: d.nome, color: "#FFB800" }]))}
            className="h-[280px] w-full"
          >
            <PieChart>
              <ChartTooltip formatter={(v: number, n: string) => [n === "Sem dados" ? "Nenhum pedido pago" : `${v} pedidos`, "Quantidade"]} />
              <Pie
                data={dadosPorGateway}
                dataKey="valor"
                nameKey="nome"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                label={({ nome, valor }) => (valor > 0 || nome === "Sem dados" ? `${nome}${valor > 0 ? `: ${valor}` : ""}` : nome)}
              >
                {dadosPorGateway.map((_, i) => (
                  <Cell key={i} fill={["#FFB800", "#00B5D8", "#10b981", "#8b5cf6", "#ef4444"][i % 5]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Relatórios Disponíveis</CardTitle>
              <CardDescription>Gere e visualize relatórios detalhados do sistema</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="todos">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as categorias</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="rifas">Rifas</SelectItem>
                  <SelectItem value="afiliados">Afiliados</SelectItem>
                  <SelectItem value="premios">Prêmios</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Selecionar período
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" numberOfMonths={2} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
            <Info className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum relatório disponível</h3>
            <p>Não há relatórios disponíveis para exibição no momento.</p>
            <p className="text-sm mt-2">Os relatórios aparecerão aqui quando forem gerados.</p>
            <Button className="mt-6">
              <FileText className="mr-2 h-4 w-4" /> Gerar Novo Relatório
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
