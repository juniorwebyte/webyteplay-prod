"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/admin-layout"
import AdminAuthModal from "@/components/admin/admin-auth-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  ArrowDownRight,
  Search,
  Loader2,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Key,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Save,
  Link2,
  Download,
} from "lucide-react"
import { listarPedidos, type Pedido } from "@/lib/gateway-store"
import { obterGatewayConfig } from "@/lib/gateway-store"
import {
  getWebytePayConfig,
  salvarWebytePayConfig,
  listarApiKeys,
  gerarApiKey,
  revogarApiKey,
  type WebytePayConfig,
} from "@/lib/webytepay-store"
import {
  listarLinks as listarLinksLocal,
  criarLink as criarLinkLocal,
  marcarLinkPago,
} from "@/lib/links-pagamento-store"

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)
}

function formatarData(dataStr: string) {
  return new Date(dataStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function WebytePayPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("visao-geral")
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [busca, setBusca] = useState("")
  const [config, setConfig] = useState<WebytePayConfig>(getWebytePayConfig())
  const [apiKeys, setApiKeys] = useState(listarApiKeys())
  const [novaKeyNome, setNovaKeyNome] = useState("")
  const [keyGerada, setKeyGerada] = useState<string | null>(null)
  const [configSalvo, setConfigSalvo] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [links, setLinks] = useState<{ id: string; valor: number; descricao: string; status: string; criadoEm: string }[]>(() => listarLinksLocal())
  const [filtroPeriodo, setFiltroPeriodo] = useState<"7" | "30" | "todos">("todos")
  const [linkValor, setLinkValor] = useState("")
  const [linkDescricao, setLinkDescricao] = useState("")
  const isWebytePayAtivo = obterGatewayConfig().gatewayAtivo === "dinamico"

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false)

  const carregar = useCallback(() => {
    setPedidos(listarPedidos().sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()))
  }, [])

  useEffect(() => {
    const admin = localStorage.getItem("admin")
    if (!admin) {
      router.push("/admin")
      return
    }
    try {
      const d = JSON.parse(admin)
      if (!d?.isAdmin || (Date.now() - (d.loginTime || 0)) / 3600000 > 24) {
        router.push("/admin")
        return
      }
      setLoading(false)
      carregar()
    } catch {
      router.push("/admin")
    }
  }, [router, carregar])

  useEffect(() => {
    const h = () => carregar()
    window.addEventListener("pedidos-updated", h)
    const i = setInterval(carregar, 5000)
    return () => {
      window.removeEventListener("pedidos-updated", h)
      clearInterval(i)
    }
  }, [carregar])

  useEffect(() => {
    const h = () => {
      setConfig(getWebytePayConfig())
      setApiKeys(listarApiKeys())
    }
    window.addEventListener("webytepay-updated", h)
    return () => window.removeEventListener("webytepay-updated", h)
  }, [])

  const salvarConfig = () => {
    setShowAuthModal(true)
  }

  const handleAuthSuccess = async () => {
    setShowAuthModal(false)
    try {
      await salvarWebytePayConfig(config)
      setConfigSalvo(true)
      setTimeout(() => setConfigSalvo(false), 2000)
    } catch (error) {
      alert(error.message || "Erro ao salvar configuração")
    }
  }

  const handleAuthCancel = () => {
    setShowAuthModal(false)
  }

  const handleGerarApiKey = () => {
    const { key, apiKey } = gerarApiKey(novaKeyNome || "Chave API")
    setKeyGerada(key)
    setNovaKeyNome("")
    setApiKeys(listarApiKeys())
  }

  const handleRevogarKey = (id: string) => {
    if (confirm("Revogar esta chave API? Ela deixará de funcionar.")) {
      revogarApiKey(id)
      setApiKeys(listarApiKeys())
    }
  }

  const carregarLinks = useCallback(() => {
    const locais = listarLinksLocal()
    const pedidosViaLink = pedidos.filter((p) => p.status === "pago" && p.campanhaId.startsWith("link-"))
    locais.forEach((l) => {
      if (l.status === "ativo") {
        const ped = pedidosViaLink.find((p) => p.campanhaId === "link-" + l.id)
        if (ped) marcarLinkPago(l.id, ped.id, ped.nomeComprador)
      }
    })
    setLinks(listarLinksLocal())
  }, [pedidos])

  useEffect(() => {
    if (activeTab === "links") {
      carregarLinks()
      const i = setInterval(carregarLinks, 10000)
      return () => clearInterval(i)
    }
  }, [activeTab, carregarLinks])

  const handleCriarLink = async () => {
    const valor = parseFloat(String(linkValor).replace(",", "."))
    if (!valor || valor <= 0) return
    const descricao = linkDescricao || "Pagamento"
    const link = criarLinkLocal(valor, descricao)
    fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor, descricao }),
    }).catch(() => {})
    setLinkValor("")
    setLinkDescricao("")
    carregarLinks()
  }

  const urlBase = typeof window !== "undefined" ? window.location.origin : ""

  const exportarCsv = () => {
    const cols = ["ID", "Cliente", "E-mail", "Campanha/Origem", "Valor", "Status", "Data"]
    const linhas = filtrados.map((p) => [
      p.id,
      p.nomeComprador,
      p.emailComprador,
      p.campanhaId?.startsWith("link-") ? `${p.campanhaTitulo} (Via Link)` : p.campanhaTitulo,
      p.valorTotal.toFixed(2).replace(".", ","),
      p.status,
      formatarData(p.pagoEm || p.criadoEm),
    ])
    const csv = [cols.join(";"), ...linhas.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `webytepay-transacoes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const pagos = pedidos.filter((p) => p.status === "pago")
  const pendentes = pedidos.filter((p) => p.status === "pendente")
  const expirados = pedidos.filter((p) => p.status === "expirado")

  const totalRecebido = pagos.reduce((s, p) => s + p.valorTotal, 0)
  const hoje = new Date().toDateString()
  const recebidoHoje = pagos.filter((p) => p.pagoEm && new Date(p.pagoEm).toDateString() === hoje).reduce((s, p) => s + p.valorTotal, 0)
  const seteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recebido7Dias = pagos.filter((p) => p.pagoEm && new Date(p.pagoEm).getTime() >= seteDiasAtras).reduce((s, p) => s + p.valorTotal, 0)

  const taxaConversao = pedidos.length > 0 ? ((pagos.length / pedidos.length) * 100).toFixed(1) : "0"
  const pendentesValor = pendentes.reduce((s, p) => s + p.valorTotal, 0)

  const viaLink = pedidos.filter((p) => p.campanhaId?.startsWith("link-"))
  const recebidoViaLink = viaLink.filter((p) => p.status === "pago").reduce((s, p) => s + p.valorTotal, 0)

  const pedidosPorPeriodo =
    filtroPeriodo === "todos"
      ? pedidos
      : pedidos.filter((p) => {
          const data = new Date(p.criadoEm).getTime()
          const dias = filtroPeriodo === "7" ? 7 : 30
          return data >= Date.now() - dias * 24 * 60 * 60 * 1000
        })

  const filtrados = pedidosPorPeriodo.filter((p) => {
    if (!busca.trim()) return true
    const s = busca.toLowerCase()
    return (
      p.id.toLowerCase().includes(s) ||
      p.nomeComprador.toLowerCase().includes(s) ||
      p.campanhaTitulo.toLowerCase().includes(s) ||
      p.emailComprador.toLowerCase().includes(s) ||
      (p.campanhaId?.startsWith("link-") && "link".includes(s))
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB800]" />
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFB800] flex items-center justify-center text-black font-bold">
                WP
              </div>
              WebytePay Tecnologia em Pagamentos S.A.
            </h1>
            <p className="text-gray-400 mt-1">Dashboard do gateway de pagamentos</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isWebytePayAtivo ? "default" : "secondary"} className={isWebytePayAtivo ? "bg-green-600" : ""}>
              {isWebytePayAtivo ? "Gateway ativo" : "Gateway inativo"}
            </Badge>
            <Button variant="outline" size="sm" onClick={carregar}>
              <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
            </Button>
            <Button size="sm" onClick={() => router.push("/admin/gateway")} className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
              <CreditCard className="h-4 w-4 mr-2" /> Configurar Gateway
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid lg:grid-cols-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="links">Links de Pagamento</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-[#171923] border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Recebido hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{formatarMoeda(recebidoHoje)}</p>
                  <p className="text-xs text-gray-500 mt-1">{pagos.filter((p) => p.pagoEm && new Date(p.pagoEm).toDateString() === hoje).length} transações</p>
                </CardContent>
              </Card>
              <Card className="bg-[#171923] border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Últimos 7 dias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{formatarMoeda(recebido7Dias)}</p>
                  <p className="text-xs text-gray-500 mt-1">{pagos.filter((p) => p.pagoEm && new Date(p.pagoEm).getTime() >= seteDiasAtras).length} transações</p>
                </CardContent>
              </Card>
              <Card className="bg-[#171923] border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Total recebido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-[#FFB800]">{formatarMoeda(totalRecebido)}</p>
                  <p className="text-xs text-gray-500 mt-1">{pagos.length} transações pagas</p>
                </CardContent>
              </Card>
              <Card className="bg-[#171923] border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4" /> Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-amber-400">{formatarMoeda(pendentesValor)}</p>
                  <p className="text-xs text-gray-500 mt-1">{pendentes.length} aguardando pagamento</p>
                  <p className="text-xs text-gray-500">Taxa conversão: {taxaConversao}%</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#171923] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Resumo de status</CardTitle>
                <CardDescription className="text-gray-400">Distribuição das transações por status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-300">Pagos: {pagos.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-gray-300">Pendentes: {pendentes.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-gray-300">Expirados: {expirados.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-[#FFB800]" />
                    <span className="text-gray-300">Via Link: {viaLink.length} trans. ({formatarMoeda(recebidoViaLink)})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transações */}
          <TabsContent value="transacoes" className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por ID, nome, campanha..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9 bg-[#171923] border-gray-700"
                />
              </div>
              <select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value as "7" | "30" | "todos")}
                className="h-10 px-3 rounded-md bg-[#171923] border border-gray-700 text-white text-sm"
              >
                <option value="todos">Todos os períodos</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
              </select>
              <Button variant="outline" size="sm" onClick={exportarCsv} disabled={filtrados.length === 0}>
                <Download className="h-4 w-4 mr-2" /> Exportar CSV
              </Button>
            </div>
            <Card className="bg-[#171923] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Histórico de transações</CardTitle>
                <CardDescription className="text-gray-400">Todas as transações processadas pelo WebytePay</CardDescription>
              </CardHeader>
              <CardContent>
                {filtrados.length === 0 ? (
                  <p className="text-gray-500 py-8 text-center">Nenhuma transação encontrada.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800">
                          <TableHead className="text-gray-400">ID</TableHead>
                          <TableHead className="text-gray-400">Cliente</TableHead>
                          <TableHead className="text-gray-400">Campanha / Origem</TableHead>
                          <TableHead className="text-gray-400">Valor</TableHead>
                          <TableHead className="text-gray-400">Status</TableHead>
                          <TableHead className="text-gray-400">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtrados.slice(0, 50).map((p) => (
                          <TableRow key={p.id} className="border-gray-800">
                            <TableCell className="font-mono text-xs text-gray-300">{p.id}</TableCell>
                            <TableCell className="text-white">{p.nomeComprador}</TableCell>
                            <TableCell className="text-gray-300">
                              {p.campanhaId.startsWith("link-") ? (
                                <span className="flex items-center gap-2">
                                  {p.campanhaTitulo}
                                  <Badge variant="outline" className="border-[#FFB800]/50 text-[#FFB800] text-xs">Via Link</Badge>
                                </span>
                              ) : (
                                p.campanhaTitulo
                              )}
                            </TableCell>
                            <TableCell className="text-[#FFB800] font-medium">{formatarMoeda(p.valorTotal)}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  p.status === "pago"
                                    ? "border-green-600 text-green-400"
                                    : p.status === "pendente"
                                      ? "border-amber-600 text-amber-400"
                                      : "border-red-600 text-red-400"
                                }
                              >
                                {p.status === "pago" ? "Pago" : p.status === "pendente" ? "Pendente" : "Expirado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">{formatarData(p.pagoEm || p.criadoEm)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filtrados.length > 50 && (
                      <p className="text-gray-500 text-sm mt-2">Exibindo as 50 transações mais recentes.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links de Pagamento (Etapa 3) */}
          <TabsContent value="links" className="space-y-6">
            <Card className="bg-[#171923] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-[#FFB800]" /> Criar link de pagamento
                </CardTitle>
                <CardDescription className="text-gray-400">Gere um link para cobrança via PIX. Compartilhe o link para receber pagamentos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Valor (R$)</label>
                    <Input
                      type="text"
                      value={linkValor}
                      onChange={(e) => setLinkValor(e.target.value)}
                      placeholder="0,00"
                      className="bg-[#1A202C] border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Descrição</label>
                    <Input
                      value={linkDescricao}
                      onChange={(e) => setLinkDescricao(e.target.value)}
                      placeholder="Ex: Pagamento de serviço"
                      className="bg-[#1A202C] border-gray-700"
                    />
                  </div>
                </div>
                <Button onClick={handleCriarLink} className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
                  <Plus className="h-4 w-4 mr-2" /> Gerar link
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#171923] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Links criados</CardTitle>
                <CardDescription className="text-gray-400">Links ativos e já pagos</CardDescription>
              </CardHeader>
              <CardContent>
                {links.length === 0 ? (
                  <p className="text-gray-500 py-8 text-center">Nenhum link criado ainda.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800">
                        <TableHead className="text-gray-400">Descrição</TableHead>
                        <TableHead className="text-gray-400">Valor</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {links.map((l) => {
                        const url = `${urlBase}/pagar/${l.id}?v=${l.valor}&d=${encodeURIComponent(l.descricao)}`
                        return (
                          <TableRow key={l.id} className="border-gray-800">
                            <TableCell className="text-white">{l.descricao}</TableCell>
                            <TableCell className="text-[#FFB800] font-medium">{formatarMoeda(l.valor)}</TableCell>
                            <TableCell>
                              <Badge variant={l.status === "ativo" ? "default" : "secondary"} className={l.status === "pago" ? "bg-green-600" : ""}>
                                {l.status === "ativo" ? "Ativo" : l.status === "pago" ? "Pago" : "Expirado"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-xs text-gray-400 truncate max-w-[200px]">{url}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(url)
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
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

          {/* Configurações (Etapa 2) */}
          <TabsContent value="configuracoes" className="space-y-6">
            {/* Dados da empresa e modo */}
            <Card className="bg-[#171923] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Dados da empresa</CardTitle>
                <CardDescription className="text-gray-400">Informações para cobrança e faturamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Nome da empresa</label>
                    <Input
                      value={config.nomeEmpresa}
                      onChange={(e) => setConfig((c) => ({ ...c, nomeEmpresa: e.target.value }))}
                      className="bg-[#1A202C] border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">CNPJ</label>
                    <Input
                      value={config.cnpj}
                      onChange={(e) => setConfig((c) => ({ ...c, cnpj: e.target.value }))}
                      placeholder="00.000.000/0001-00"
                      className="bg-[#1A202C] border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Modo de operação</label>
                    <select
                      value={config.modo}
                      onChange={(e) => setConfig((c) => ({ ...c, modo: e.target.value as "sandbox" | "producao" }))}
                      className="w-full h-10 px-3 rounded-md bg-[#1A202C] border border-gray-700 text-white"
                    >
                      <option value="sandbox">Sandbox (testes)</option>
                      <option value="producao">Produção</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Webhook */}
            <Card className="bg-[#171923] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-[#FFB800]" /> Webhook
                </CardTitle>
                <CardDescription className="text-gray-400">URL para receber notificações de pagamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">URL do webhook</label>
                  <Input
                    value={config.webhookUrl}
                    onChange={(e) => setConfig((c) => ({ ...c, webhookUrl: e.target.value }))}
                    placeholder={typeof window !== "undefined" ? `${window.location.origin}/api/pix/webhook` : "https://seu-site.com/api/pix/webhook"}
                    className="bg-[#1A202C] border-gray-700 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Chave secreta do webhook</label>
                  <div className="relative">
                    <Input
                      type={showWebhookSecret ? "text" : "password"}
                      value={config.webhookSecret}
                      onChange={(e) => setConfig((c) => ({ ...c, webhookSecret: e.target.value }))}
                      placeholder="Gerada automaticamente ou definida por você"
                      className="bg-[#1A202C] border-gray-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Keys */}
            <Card className="bg-[#171923] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-[#FFB800]" /> Chaves de API
                </CardTitle>
                <CardDescription className="text-gray-400">Gerencie as chaves para integração via API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {keyGerada && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-amber-400 text-sm font-medium mb-2">Chave criada! Copie agora — ela não será exibida novamente:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-black/30 px-3 py-2 rounded text-sm font-mono break-all">{keyGerada}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(keyGerada || "")
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setKeyGerada(null)}>
                        Fechar
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={novaKeyNome}
                    onChange={(e) => setNovaKeyNome(e.target.value)}
                    placeholder="Nome da chave (ex: Integração Loja)"
                    className="bg-[#1A202C] border-gray-700 max-w-xs"
                  />
                  <Button onClick={handleGerarApiKey} className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
                    <Plus className="h-4 w-4 mr-2" /> Gerar chave
                  </Button>
                </div>
                {apiKeys.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800">
                        <TableHead className="text-gray-400">Nome</TableHead>
                        <TableHead className="text-gray-400">Prefixo</TableHead>
                        <TableHead className="text-gray-400">Criada em</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((k) => (
                        <TableRow key={k.id} className="border-gray-800">
                          <TableCell className="text-white">{k.nome}</TableCell>
                          <TableCell className="font-mono text-gray-400 text-sm">{k.prefixo}</TableCell>
                          <TableCell className="text-gray-500 text-sm">{formatarData(k.criadaEm)}</TableCell>
                          <TableCell>
                            <Badge variant={k.ativa ? "default" : "secondary"} className={k.ativa ? "bg-green-600" : ""}>
                              {k.ativa ? "Ativa" : "Revogada"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {k.ativa && (
                              <Button variant="ghost" size="sm" onClick={() => handleRevogarKey(k.id)}>
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/admin/gateway")}>
                <ExternalLink className="h-4 w-4 mr-2" /> Configurar PIX no Gateway
              </Button>
              <Button onClick={salvarConfig} className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
                <Save className="h-4 w-4 mr-2" /> {configSalvo ? "Salvo!" : "Salvar configurações"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AdminAuthModal
        isOpen={showAuthModal}
        onSuccess={handleAuthSuccess}
        onCancel={handleAuthCancel}
        title="Autenticação para WebytePay"
        description="Para alterar as configurações do WebytePay, confirme suas credenciais administrativas."
      />
    </AdminLayout>
  )
}
