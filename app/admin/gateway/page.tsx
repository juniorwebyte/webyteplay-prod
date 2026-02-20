"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Save,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  Activity,
  CreditCard,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Radio,
} from "lucide-react"
import AdminLayout from "@/components/admin/admin-layout"
import AdminHeader from "@/components/admin/admin-header"
import AdminAuthModal from "@/components/admin/admin-auth-modal"
import {
  obterGatewayConfig,
  salvarGatewayConfig,
  listarPedidos,
  confirmarPagamento,
  type GatewayConfig,
  type Pedido,
} from "@/lib/gateway-store"
import { formatarCPF, formatarTelefone, formatarValor } from "@/lib/formatadores"

interface GatewayCardProps {
  nome: string
  descricao: string
  logo: string
  ativo: boolean
  selecionado: boolean
  onToggle: (ativo: boolean) => void
  onSelecionar: () => void
  children: React.ReactNode
}

function GatewayCard({ nome, descricao, logo, ativo, selecionado, onToggle, onSelecionar, children }: GatewayCardProps) {
  return (
    <Card className={`bg-[#171923] border transition-colors ${selecionado ? "border-[#FFB800]" : "border-gray-800"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1A202C] flex items-center justify-center text-lg font-bold text-[#FFB800]">
              {logo}
            </div>
            <div>
              <CardTitle className="text-white text-base">{nome}</CardTitle>
              <CardDescription className="text-gray-400 text-xs">{descricao}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selecionado && (
              <Badge className="bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/30">
                <Radio className="h-3 w-3 mr-1" /> Ativo
              </Badge>
            )}
            <Switch checked={ativo} onCheckedChange={onToggle} />
          </div>
        </div>
      </CardHeader>
      {ativo && (
        <CardContent className="space-y-4 pt-0">
          {children}
          {!selecionado && (
            <Button
              onClick={onSelecionar}
              variant="outline"
              className="w-full border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800] hover:text-black"
            >
              Definir como Gateway Principal
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function GatewayPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [config, setConfig] = useState<GatewayConfig | null>(null)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [activeTab, setActiveTab] = useState("gateways")

  // Visibility toggles
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  // Form state
  const [formState, setFormState] = useState<Partial<GatewayConfig>>({})

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false)

  const toggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const carregarDados = useCallback(() => {
    const cfg = obterGatewayConfig()
    setConfig(cfg)
    setFormState(cfg)
    setPedidos(listarPedidos().sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()))
  }, [])

  useEffect(() => {
    const adminData = localStorage.getItem("admin")
    if (!adminData) { router.push("/admin"); return }
    try {
      const admin = JSON.parse(adminData)
      if (!admin?.isAdmin) { router.push("/admin"); return }
      const hours = (Date.now() - (admin.loginTime || 0)) / 3600000
      if (hours > 24) { localStorage.removeItem("admin"); router.push("/admin"); return }
      setIsLoading(false)
      carregarDados()
    } catch { router.push("/admin") }
  }, [router, carregarDados])

  useEffect(() => {
    const handle = () => {
      setPedidos(listarPedidos().sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()))
    }
    window.addEventListener("pedidos-updated", handle)
    const interval = setInterval(handle, 5000)
    return () => { window.removeEventListener("pedidos-updated", handle); clearInterval(interval) }
  }, [])

  const updateForm = (partial: Partial<GatewayConfig>) => {
    setFormState((prev) => ({ ...prev, ...partial }))
  }

  const handleSalvar = () => {
    setShowAuthModal(true)
  }

  const handleAuthSuccess = async () => {
    setShowAuthModal(false)
    setSalvando(true)
    try {
      await salvarGatewayConfig(formState)
      setSalvando(false)
      setSalvo(true)
      carregarDados()
      setTimeout(() => setSalvo(false), 3000)
    } catch (error) {
      setSalvando(false)
      alert(error.message || "Erro ao salvar configuração")
    }
  }

  const handleAuthCancel = () => {
    setShowAuthModal(false)
  }

  const handleConfirmarPedido = (pedidoId: string) => {
    confirmarPagamento(pedidoId)
    carregarDados()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB800]" />
      </div>
    )
  }

  const pedidosPagos = pedidos.filter((p) => p.status === "pago")
  const pedidosPendentes = pedidos.filter((p) => p.status === "pendente")
  const faturamentoTotal = pedidosPagos.reduce((s, p) => s + p.valorTotal, 0)

  return (
    <AdminLayout>
      <div className="p-8">
        <AdminHeader title="Gateway de Pagamento" subtitle="Configure os gateways de pagamento PIX" />

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#171923] border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formState.ativo ? "bg-green-500/20" : "bg-red-500/20"}`}>
                  {formState.ativo ? <Zap className="h-5 w-5 text-green-400" /> : <AlertTriangle className="h-5 w-5 text-red-400" />}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className={`font-bold ${formState.ativo ? "text-green-400" : "text-red-400"}`}>{formState.ativo ? "Ativo" : "Inativo"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#171923] border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFB800]/20 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-[#FFB800]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Pedidos</p>
                  <p className="font-bold text-white">{pedidos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#171923] border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Pagos</p>
                  <p className="font-bold text-green-400">{pedidosPagos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#171923] border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00B5D8]/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-[#00B5D8]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Faturamento</p>
                  <p className="font-bold text-white">{formatarValor(faturamentoTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#171923] border border-gray-800">
            <TabsTrigger value="gateways" className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black">Gateways</TabsTrigger>
            <TabsTrigger value="chave-pix" className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black">Chave PIX</TabsTrigger>
            <TabsTrigger value="configuracoes" className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black">Configuracoes</TabsTrigger>
            <TabsTrigger value="pedidos" className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black">Pedidos ({pedidos.length})</TabsTrigger>
          </TabsList>

          {/* GATEWAYS TAB */}
          <TabsContent value="gateways" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-white">Gateways Disponiveis</h3>
                <p className="text-gray-400 text-sm">Configure e selecione o gateway de pagamento principal</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Sistema {formState.ativo ? "Ativo" : "Inativo"}</span>
                <Switch checked={formState.ativo || false} onCheckedChange={(v) => updateForm({ ativo: v })} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* PushinPay */}
              <GatewayCard
                nome="PushinPay"
                descricao="Gateway PIX com baixa automatica"
                logo="PP"
                ativo={formState.pushinpayAtivo || false}
                selecionado={formState.gatewayAtivo === "pushinpay"}
                onToggle={(v) => updateForm({ pushinpayAtivo: v })}
                onSelecionar={() => updateForm({ gatewayAtivo: "pushinpay" })}
              >
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKeys.pushinpay ? "text" : "password"}
                        value={formState.pushinpayApiKey || ""}
                        onChange={(e) => updateForm({ pushinpayApiKey: e.target.value })}
                        className="bg-[#1A202C] border-gray-700 text-white pr-10"
                        placeholder="Cole sua API Key da PushinPay"
                      />
                      <button type="button" onClick={() => toggleKeyVisibility("pushinpay")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        {showKeys.pushinpay ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </GatewayCard>

              {/* MercadoPago */}
              <GatewayCard
                nome="MercadoPago"
                descricao="PIX, cartao e boleto"
                logo="MP"
                ativo={formState.mercadopagoAtivo || false}
                selecionado={formState.gatewayAtivo === "mercadopago"}
                onToggle={(v) => updateForm({ mercadopagoAtivo: v })}
                onSelecionar={() => updateForm({ gatewayAtivo: "mercadopago" })}
              >
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Access Token</Label>
                  <div className="relative">
                    <Input
                      type={showKeys.mercadopago ? "text" : "password"}
                      value={formState.mercadopagoAccessToken || ""}
                      onChange={(e) => updateForm({ mercadopagoAccessToken: e.target.value })}
                      className="bg-[#1A202C] border-gray-700 text-white pr-10"
                      placeholder="Cole seu Access Token do MercadoPago"
                    />
                    <button type="button" onClick={() => toggleKeyVisibility("mercadopago")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showKeys.mercadopago ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </GatewayCard>

              {/* OpenPix */}
              <GatewayCard
                nome="OpenPix"
                descricao="PIX com deteccao automatica de pagamento"
                logo="OP"
                ativo={formState.openpixAtivo || false}
                selecionado={formState.gatewayAtivo === "openpix"}
                onToggle={(v) => updateForm({ openpixAtivo: v })}
                onSelecionar={() => updateForm({ gatewayAtivo: "openpix" })}
              >
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">App ID</Label>
                  <div className="relative">
                    <Input
                      type={showKeys.openpix ? "text" : "password"}
                      value={formState.openpixAppId || ""}
                      onChange={(e) => updateForm({ openpixAppId: e.target.value })}
                      className="bg-[#1A202C] border-gray-700 text-white pr-10"
                      placeholder="Cole seu App ID da OpenPix"
                    />
                    <button type="button" onClick={() => toggleKeyVisibility("openpix")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showKeys.openpix ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Configure o webhook no painel OpenPix: URL = {typeof window !== "undefined" ? `${window.location.origin}/api/pix/webhook` : "SEU_SITE/api/pix/webhook"} (evento: CHARGE_COMPLETED)
                  </p>
                </div>
              </GatewayCard>

              {/* Asaas */}
              <GatewayCard
                nome="Asaas"
                descricao="PIX, boleto e cartao"
                logo="AS"
                ativo={formState.asaasAtivo || false}
                selecionado={formState.gatewayAtivo === "asaas"}
                onToggle={(v) => updateForm({ asaasAtivo: v })}
                onSelecionar={() => updateForm({ gatewayAtivo: "asaas" })}
              >
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">API Key</Label>
                    <div className="relative">
                      <Input
                        type={showKeys.asaas ? "text" : "password"}
                        value={formState.asaasApiKey || ""}
                        onChange={(e) => updateForm({ asaasApiKey: e.target.value })}
                        className="bg-[#1A202C] border-gray-700 text-white pr-10"
                        placeholder="Cole sua API Key do Asaas"
                      />
                      <button type="button" onClick={() => toggleKeyVisibility("asaas")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        {showKeys.asaas ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={formState.asaasSandbox || false} onCheckedChange={(v) => updateForm({ asaasSandbox: v })} />
                    <span className="text-sm text-gray-400">Modo Sandbox (testes)</span>
                  </div>
                </div>
              </GatewayCard>

              {/* SuitPay */}
              <GatewayCard
                nome="SuitPay"
                descricao="PIX com baixa automatica"
                logo="SP"
                ativo={formState.suitpayAtivo || false}
                selecionado={formState.gatewayAtivo === "suitpay"}
                onToggle={(v) => updateForm({ suitpayAtivo: v })}
                onSelecionar={() => updateForm({ gatewayAtivo: "suitpay" })}
              >
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Client ID</Label>
                    <div className="relative">
                      <Input
                        type={showKeys.suitpayId ? "text" : "password"}
                        value={formState.suitpayClientId || ""}
                        onChange={(e) => updateForm({ suitpayClientId: e.target.value })}
                        className="bg-[#1A202C] border-gray-700 text-white pr-10"
                        placeholder="Client ID"
                      />
                      <button type="button" onClick={() => toggleKeyVisibility("suitpayId")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        {showKeys.suitpayId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Client Secret</Label>
                    <div className="relative">
                      <Input
                        type={showKeys.suitpaySec ? "text" : "password"}
                        value={formState.suitpayClientSecret || ""}
                        onChange={(e) => updateForm({ suitpayClientSecret: e.target.value })}
                        className="bg-[#1A202C] border-gray-700 text-white pr-10"
                        placeholder="Client Secret"
                      />
                      <button type="button" onClick={() => toggleKeyVisibility("suitpaySec")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        {showKeys.suitpaySec ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </GatewayCard>

              {/* EzzeBank */}
              <GatewayCard
                nome="EzzeBank"
                descricao="PIX instantaneo"
                logo="EZ"
                ativo={formState.ezzebankAtivo || false}
                selecionado={formState.gatewayAtivo === "ezzebank"}
                onToggle={(v) => updateForm({ ezzebankAtivo: v })}
                onSelecionar={() => updateForm({ gatewayAtivo: "ezzebank" })}
              >
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Client ID</Label>
                    <div className="relative">
                      <Input
                        type={showKeys.ezzebankId ? "text" : "password"}
                        value={formState.ezzebankClientId || ""}
                        onChange={(e) => updateForm({ ezzebankClientId: e.target.value })}
                        className="bg-[#1A202C] border-gray-700 text-white pr-10"
                        placeholder="Client ID"
                      />
                      <button type="button" onClick={() => toggleKeyVisibility("ezzebankId")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        {showKeys.ezzebankId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Client Secret</Label>
                    <div className="relative">
                      <Input
                        type={showKeys.ezzebankSec ? "text" : "password"}
                        value={formState.ezzebankClientSecret || ""}
                        onChange={(e) => updateForm({ ezzebankClientSecret: e.target.value })}
                        className="bg-[#1A202C] border-gray-700 text-white pr-10"
                        placeholder="Client Secret"
                      />
                      <button type="button" onClick={() => toggleKeyVisibility("ezzebankSec")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        {showKeys.ezzebankSec ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </GatewayCard>

              {/* WebytePay / Gateway Dinâmico */}
              <GatewayCard
                nome="WebytePay Tecnologia em Pagamentos S.A."
                descricao="Gateway proprio com QR Code PIX"
                logo="WP"
                ativo={formState.gatewayAtivo === "dinamico"}
                selecionado={formState.gatewayAtivo === "dinamico"}
                onToggle={(ligado) => {
                  if (!ligado) {
                    // Desativar: mudar para outro gateway ou vazio
                    const outro = formState.openpixAtivo ? "openpix" : formState.asaasAtivo ? "asaas" : formState.suitpayAtivo ? "suitpay" : ""
                    updateForm({ gatewayAtivo: outro })
                  } else {
                    updateForm({ gatewayAtivo: "dinamico" })
                  }
                }}
                onSelecionar={() => updateForm({ gatewayAtivo: "dinamico" })}
              >
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Chave API Dinamica</Label>
                  <div className="relative">
                    <Input
                      type={showKeys.dinamico ? "text" : "password"}
                      value={formState.chaveApi || ""}
                      onChange={(e) => updateForm({ chaveApi: e.target.value })}
                      className="bg-[#1A202C] border-gray-700 text-white pr-10"
                      placeholder="Cole sua chave API"
                    />
                    <button type="button" onClick={() => toggleKeyVisibility("dinamico")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showKeys.dinamico ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="bg-[#1A202C] rounded-lg p-3 border border-[#FFB800]/20">
                  <p className="text-gray-400 text-xs">
                    O Gateway Dinamico gera QR Codes PIX validos para testes. A baixa pode ser configurada como automatica ou manual na aba Configuracoes.
                  </p>
                </div>
              </GatewayCard>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSalvar} disabled={salvando} className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium px-8">
                {salvando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : salvo ? <CheckCircle className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {salvando ? "Salvando..." : salvo ? "Salvo" : "Salvar Configuracoes"}
              </Button>
            </div>
          </TabsContent>

          {/* CHAVE PIX TAB */}
          <TabsContent value="chave-pix" className="space-y-4">
            <Card className="bg-[#171923] border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#FFB800]" /> Chave PIX para Recebimento
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure a chave PIX que sera usada para gerar os QR Codes de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Tipo da Chave PIX</Label>
                    <Select value={formState.tipoChavePix || "aleatoria"} onValueChange={(v) => updateForm({ tipoChavePix: v })}>
                      <SelectTrigger className="bg-[#1A202C] border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2D3748] border-gray-700">
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="telefone">Telefone</SelectItem>
                        <SelectItem value="aleatoria">Chave Aleatoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Chave PIX</Label>
                    <Input
                      value={formState.chavePix || ""}
                      onChange={(e) => updateForm({ chavePix: e.target.value })}
                      className="bg-[#1A202C] border-gray-700 text-white"
                      placeholder={
                        formState.tipoChavePix === "cpf" ? "000.000.000-00"
                          : formState.tipoChavePix === "cnpj" ? "00.000.000/0000-00"
                          : formState.tipoChavePix === "email" ? "seu@email.com"
                          : formState.tipoChavePix === "telefone" ? "+5511999999999"
                          : "Cole sua chave aleatoria"
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nome do Recebedor</Label>
                    <Input
                      value={formState.nomeRecebedor || ""}
                      onChange={(e) => updateForm({ nomeRecebedor: e.target.value })}
                      className="bg-[#1A202C] border-gray-700 text-white"
                      placeholder="Nome que aparecera no PIX"
                    />
                    <p className="text-xs text-gray-500">Maximo 25 caracteres, aparece no comprovante</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Cidade do Recebedor</Label>
                    <Input
                      value={formState.cidadeRecebedor || ""}
                      onChange={(e) => updateForm({ cidadeRecebedor: e.target.value })}
                      className="bg-[#1A202C] border-gray-700 text-white"
                      placeholder="SAO PAULO"
                    />
                    <p className="text-xs text-gray-500">Maximo 15 caracteres, sem acentos</p>
                  </div>
                </div>

                <div className="bg-[#1A202C] rounded-lg p-4 border border-[#FFB800]/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-[#FFB800] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-white font-medium text-sm">Importante</h4>
                      <p className="text-gray-400 text-xs mt-1">
                        A chave PIX configurada aqui sera usada para gerar os QR Codes de pagamento. Certifique-se de que a chave esta correta e ativa no seu banco. O QR Code gerado segue o padrao EMV/BRCode do Banco Central.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSalvar} disabled={salvando} className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium px-8">
                    {salvando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : salvo ? <CheckCircle className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {salvando ? "Salvando..." : salvo ? "Salvo" : "Salvar Configuracoes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONFIGURACOES TAB */}
          <TabsContent value="configuracoes" className="space-y-4">
            <Card className="bg-[#171923] border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#FFB800]" /> Configuracoes de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nome do Gateway</Label>
                    <Input
                      value={formState.nome || ""}
                      onChange={(e) => updateForm({ nome: e.target.value })}
                      className="bg-[#1A202C] border-gray-700 text-white"
                      placeholder="WebytePlay Gateway"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Tempo de Expiracao do QR Code</Label>
                    <Select value={(formState.tempoExpiracaoMinutos || 15).toString()} onValueChange={(v) => updateForm({ tempoExpiracaoMinutos: parseInt(v) })}>
                      <SelectTrigger className="bg-[#1A202C] border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2D3748] border-gray-700">
                        <SelectItem value="5">5 minutos</SelectItem>
                        <SelectItem value="10">10 minutos</SelectItem>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Baixa Automatica (Ambiente de Teste)</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Switch checked={formState.baixaAutomatica || false} onCheckedChange={(v) => updateForm({ baixaAutomatica: v })} />
                      <span className="text-sm text-gray-400">
                        {formState.baixaAutomatica ? "Baixa automatica ativada" : "Baixa manual (producao)"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Quando ativada, confirma o pagamento automaticamente apos o usuario clicar em "Ja fiz o pagamento". Use apenas para testes.
                    </p>
                  </div>

                  {formState.baixaAutomatica && (
                    <div className="space-y-2">
                      <Label className="text-gray-300">Tempo de Simulacao da Baixa (seg)</Label>
                      <Select value={(formState.tempoSimulacaoBaixaSegundos || 10).toString()} onValueChange={(v) => updateForm({ tempoSimulacaoBaixaSegundos: parseInt(v) })}>
                        <SelectTrigger className="bg-[#1A202C] border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2D3748] border-gray-700">
                          <SelectItem value="3">3 segundos</SelectItem>
                          <SelectItem value="5">5 segundos</SelectItem>
                          <SelectItem value="10">10 segundos</SelectItem>
                          <SelectItem value="15">15 segundos</SelectItem>
                          <SelectItem value="20">20 segundos</SelectItem>
                          <SelectItem value="30">30 segundos</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Tempo para simular a confirmacao apos clicar em "Ja fiz o pagamento"</p>
                    </div>
                  )}
                </div>

                <div className="bg-[#1A202C] rounded-lg p-4 border border-[#FFB800]/20">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#FFB800] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-white font-medium text-sm">Como funciona</h4>
                      <p className="text-gray-400 text-xs mt-1">
                        {formState.baixaAutomatica
                          ? `Modo teste: quando o usuario clica em "Ja fiz o pagamento", o sistema aguarda ${formState.tempoSimulacaoBaixaSegundos || 10}s e confirma automaticamente. Ideal para testes.`
                          : "Modo producao: o pagamento so e confirmado quando o gateway envia um webhook de confirmacao ou o admin confirma manualmente na aba Pedidos. O botao 'Ja fiz o pagamento' apenas indica que o usuario realizou o PIX."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSalvar} disabled={salvando} className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium px-8">
                    {salvando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : salvo ? <CheckCircle className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {salvando ? "Salvando..." : salvo ? "Salvo" : "Salvar Configuracoes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PEDIDOS TAB */}
          <TabsContent value="pedidos" className="space-y-4">
            <Card className="bg-[#171923] border-0">
              <CardHeader>
                <CardTitle className="text-white">Pedidos Recentes</CardTitle>
                <CardDescription className="text-gray-400">
                  Historico de pagamentos ({pedidos.length} pedidos) - Confirme pagamentos pendentes manualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pedidos.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhum pedido registrado ainda</p>
                    <p className="text-gray-500 text-sm mt-1">Os pedidos aparecerao aqui quando os usuarios comprarem cotas</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Pedido</TableHead>
                          <TableHead className="text-gray-300">Campanha</TableHead>
                          <TableHead className="text-gray-300">Comprador</TableHead>
                          <TableHead className="text-gray-300">CPF</TableHead>
                          <TableHead className="text-gray-300">Qtd</TableHead>
                          <TableHead className="text-gray-300">Valor</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Data</TableHead>
                          <TableHead className="text-gray-300">Acoes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pedidos.slice(0, 30).map((p) => (
                          <TableRow key={p.id} className="border-gray-700 hover:bg-[#1A1E2A]">
                            <TableCell className="text-white font-mono text-xs">{p.id}</TableCell>
                            <TableCell className="text-gray-300 max-w-[120px] truncate">{p.campanhaTitulo}</TableCell>
                            <TableCell className="text-gray-300">
                              <div>
                                <p className="text-sm">{p.nomeComprador || "---"}</p>
                                <p className="text-xs text-gray-500">{formatarTelefone(p.telefoneComprador || "")}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300 text-xs font-mono">{formatarCPF(p.cpfComprador || "") || "---"}</TableCell>
                            <TableCell className="text-gray-300">{p.quantidade}</TableCell>
                            <TableCell className="text-white font-medium">
                              {formatarValor(p.valorTotal)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  p.status === "pago"
                                    ? "bg-green-500/20 text-green-400"
                                    : p.status === "pendente"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-red-500/20 text-red-400"
                                }
                              >
                                {p.status === "pago" ? "Pago" : p.status === "pendente" ? "Pendente" : "Expirado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400 text-xs">
                              {new Date(p.criadoEm).toLocaleString("pt-BR")}
                            </TableCell>
                            <TableCell>
                              {p.status === "pendente" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmarPedido(p.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" /> Confirmar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AdminAuthModal
        isOpen={showAuthModal}
        onSuccess={handleAuthSuccess}
        onCancel={handleAuthCancel}
        title="Autenticação para Gateway"
        description="Para alterar as configurações do gateway de pagamento, confirme suas credenciais administrativas."
      />
    </AdminLayout>
  )
}
