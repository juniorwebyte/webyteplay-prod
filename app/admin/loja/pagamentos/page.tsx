"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  CreditCard,
  Wallet,
  Percent,
  Shield,
  FileText,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  Search,
} from "lucide-react"
import {
  getConfigParcelamento,
  salvarConfigParcelamento,
  getConfigJuros,
  salvarConfigJuros,
  listarMetodosPagamento,
  salvarMetodoPagamento,
  getConfigAntifraude,
  salvarConfigAntifraude,
  adicionarBloqueioCpf,
  removerBloqueioCpf,
  listarLogsTransacoes,
  type ConfigParcelamento,
  type ConfigJuros,
  type MetodoPagamento,
  type ConfigAntifraude,
  type LogTransacao,
} from "@/lib/pagamentos-loja-store"
import { obterGatewayConfig } from "@/lib/gateway-store"
import { formatarValor, formatarCPF } from "@/lib/formatadores"

export default function LojaPagamentosPage() {
  const [parcelamento, setParcelamento] = useState<ConfigParcelamento | null>(null)
  const [juros, setJuros] = useState<ConfigJuros | null>(null)
  const [metodos, setMetodos] = useState<MetodoPagamento[]>([])
  const [antifraude, setAntifraude] = useState<ConfigAntifraude | null>(null)
  const [logs, setLogs] = useState<LogTransacao[]>([])
  const [abaAtiva, setAbaAtiva] = useState("gateways")
  const [filtroLogPedido, setFiltroLogPedido] = useState("")
  const [filtroLogTipo, setFiltroLogTipo] = useState<LogTransacao["tipo"] | "todos">("todos")
  const [dialogBloqueioOpen, setDialogBloqueioOpen] = useState(false)
  const [novoBloqueioCpf, setNovoBloqueioCpf] = useState("")
  const [novoBloqueioEmail, setNovoBloqueioEmail] = useState("")

  const carregar = () => {
    setParcelamento(getConfigParcelamento())
    setJuros(getConfigJuros())
    setMetodos(listarMetodosPagamento())
    setAntifraude(getConfigAntifraude())
    setLogs(
      listarLogsTransacoes({
        ...(filtroLogPedido ? { pedidoId: filtroLogPedido } : {}),
        ...(filtroLogTipo && filtroLogTipo !== "todos" ? { tipo: filtroLogTipo } : {}),
      })
    )
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("pagamentos-loja-updated", h)
    return () => window.removeEventListener("pagamentos-loja-updated", h)
  }, [filtroLogPedido, filtroLogTipo])

  const configGateway = obterGatewayConfig()

  const salvarParcelamento = () => {
    if (parcelamento) {
      salvarConfigParcelamento(parcelamento)
      carregar()
    }
  }

  const salvarJuros = () => {
    if (juros) {
      salvarConfigJuros(juros)
      carregar()
    }
  }

  const salvarAntifraude = () => {
    if (antifraude) {
      salvarConfigAntifraude(antifraude)
      carregar()
    }
  }

  const toggleMetodoAtivo = (m: MetodoPagamento) => {
    salvarMetodoPagamento({ ...m, ativo: !m.ativo })
    carregar()
  }

  const adicionarBloqueioCpfLista = () => {
    if (novoBloqueioCpf.trim()) {
      adicionarBloqueioCpf(novoBloqueioCpf.trim())
      setNovoBloqueioCpf("")
      setDialogBloqueioOpen(false)
      carregar()
    }
  }

  const adicionarBloqueioEmail = () => {
    if (antifraude && novoBloqueioEmail.trim()) {
      salvarConfigAntifraude({
        listaBloqueioEmail: [...(antifraude.listaBloqueioEmail || []), novoBloqueioEmail.trim()],
      })
      setNovoBloqueioEmail("")
      carregar()
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <CreditCard className="h-8 w-8 text-[#FFB800]" />
        Pagamentos
      </h1>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-6 bg-[#171923] border border-gray-800">
          <TabsTrigger value="gateways">Gateways WebytePay</TabsTrigger>
          <TabsTrigger value="parcelamento">Parcelamento</TabsTrigger>
          <TabsTrigger value="juros">Juros</TabsTrigger>
          <TabsTrigger value="metodos">Métodos de Pagamento</TabsTrigger>
          <TabsTrigger value="antifraude">Antifraude</TabsTrigger>
          <TabsTrigger value="logs">Logs de Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#FFB800]" />
                Gateways de Pagamento WebytePay
              </CardTitle>
              <CardDescription>
                Configure o gateway global usado pela loja. PIX, cartão e boleto são gerenciados no painel central.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="bg-black/30 rounded-lg p-4 min-w-[200px]">
                  <p className="text-gray-500 text-sm">Gateway ativo</p>
                  <p className="text-lg font-bold text-white">{configGateway.nome || "Não configurado"}</p>
                  <p className="text-xs text-gray-400">{configGateway.gatewayAtivo || "—"}</p>
                </div>
                <Button asChild className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
                  <Link href="/admin/gateway">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Configurar Gateway
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/webytepay">WebytePay</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parcelamento">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Configuração de Parcelamento</CardTitle>
              <CardDescription>Máximo de parcelas, valor mínimo por parcela e até quantas parcelas sem juros.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {parcelamento && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Habilitar parcelamento</Label>
                    <Switch
                      checked={parcelamento.habilitado}
                      onCheckedChange={(v) => setParcelamento({ ...parcelamento, habilitado: v })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-400">Máximo de parcelas</Label>
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        value={parcelamento.maxParcelas}
                        onChange={(e) =>
                          setParcelamento({ ...parcelamento, maxParcelas: parseInt(e.target.value, 10) || 1 })
                        }
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Parcela mínima (R$)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={parcelamento.parcelaMinima}
                        onChange={(e) =>
                          setParcelamento({ ...parcelamento, parcelaMinima: parseFloat(e.target.value) || 0 })
                        }
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Sem juros até a parcela</Label>
                      <Input
                        type="number"
                        min={1}
                        max={parcelamento.maxParcelas}
                        value={parcelamento.semJurosAte}
                        onChange={(e) =>
                          setParcelamento({ ...parcelamento, semJurosAte: parseInt(e.target.value, 10) || 1 })
                        }
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <Button onClick={salvarParcelamento} className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="juros">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Configuração de Juros
              </CardTitle>
              <CardDescription>Tipo de juros e taxa aplicada a partir de determinada parcela.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {juros && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-400">Tipo</Label>
                      <Select
                        value={juros.tipo}
                        onValueChange={(v: ConfigJuros["tipo"]) => setJuros({ ...juros, tipo: v })}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="composto">Composto</SelectItem>
                          <SelectItem value="simples">Simples</SelectItem>
                          <SelectItem value="preco">Preço (tabela)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-400">Taxa mensal (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={juros.taxaMensal}
                        onChange={(e) =>
                          setJuros({ ...juros, taxaMensal: parseFloat(e.target.value) || 0 })
                        }
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Aplicar juros a partir da parcela</Label>
                      <Input
                        type="number"
                        min={1}
                        value={juros.aplicarAposParcela}
                        onChange={(e) =>
                          setJuros({ ...juros, aplicarAposParcela: parseInt(e.target.value, 10) || 1 })
                        }
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <Button onClick={salvarJuros} className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metodos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Métodos de Pagamento</CardTitle>
              <CardDescription>Ative ou desative métodos e defina a ordem de exibição no checkout.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Ordem</TableHead>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metodos
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-gray-300">{m.ordem}</TableCell>
                        <TableCell className="text-white">{m.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-gray-300">
                            {m.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch checked={m.ativo} onCheckedChange={() => toggleMetodoAtivo(m)} />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="antifraude">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                Antifraude
              </CardTitle>
              <CardDescription>
                Limite sem análise manual, bloqueio por CPF/email e listas de bloqueio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {antifraude && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Habilitar antifraude</Label>
                    <Switch
                      checked={antifraude.habilitado}
                      onCheckedChange={(v) => setAntifraude({ ...antifraude, habilitado: v })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-400">Limite sem análise (R$)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={antifraude.limiteValorSemAnalise}
                        onChange={(e) =>
                          setAntifraude({
                            ...antifraude,
                            limiteValorSemAnalise: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="bg-background"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Bloquear CPF repetido</Label>
                      <Switch
                        checked={antifraude.bloquearCpfRepetido}
                        onCheckedChange={(v) => setAntifraude({ ...antifraude, bloquearCpfRepetido: v })}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400">Máx. tentativas cartão</Label>
                      <Input
                        type="number"
                        min={1}
                        value={antifraude.maxTentativasCartao}
                        onChange={(e) =>
                          setAntifraude({
                            ...antifraude,
                            maxTentativasCartao: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white">Lista de bloqueio CPF</Label>
                      <Button size="sm" variant="outline" onClick={() => setDialogBloqueioOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    <ul className="text-sm text-gray-400 space-y-1 max-h-24 overflow-y-auto">
                      {(antifraude.listaBloqueioCpf || []).length === 0 ? (
                        <li>Nenhum CPF bloqueado.</li>
                      ) : (
                        (antifraude.listaBloqueioCpf || []).map((cpf) => (
                          <li key={cpf} className="flex items-center justify-between">
                            {formatarCPF(cpf)}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => {
                                removerBloqueioCpf(cpf)
                                carregar()
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div className="border-t border-gray-800 pt-4">
                    <Label className="text-white">Lista de bloqueio e-mail</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      {antifraude.listaBloqueioEmail?.length || 0} e-mail(s) bloqueado(s).
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="email@exemplo.com"
                        value={novoBloqueioEmail}
                        onChange={(e) => setNovoBloqueioEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && adicionarBloqueioEmail()}
                        className="bg-background max-w-xs"
                      />
                      <Button size="sm" variant="outline" onClick={adicionarBloqueioEmail} disabled={!novoBloqueioEmail.trim()}>
                        Adicionar
                      </Button>
                    </div>
                  </div>
                  <Button onClick={salvarAntifraude} className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Logs de Transações
              </CardTitle>
              <CardDescription>Histórico de transações com filtro por pedido e tipo.</CardDescription>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="ID do pedido"
                    value={filtroLogPedido}
                    onChange={(e) => setFiltroLogPedido(e.target.value)}
                    className="bg-background w-40"
                  />
                </div>
                <Select value={filtroLogTipo} onValueChange={(v) => setFiltroLogTipo(v as LogTransacao["tipo"] | "todos")}>
                  <SelectTrigger className="w-40 bg-background">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="criacao">Criação</SelectItem>
                    <SelectItem value="pagamento">Pagamento</SelectItem>
                    <SelectItem value="estorno">Estorno</SelectItem>
                    <SelectItem value="falha">Falha</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-gray-300">Pedido</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Gateway</TableHead>
                    <TableHead className="text-gray-300">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.slice(0, 100).map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-gray-400 text-sm">
                        {new Date(l.criadoEm).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-white font-mono text-sm">{l.pedidoId}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            l.tipo === "pagamento"
                              ? "bg-green-500/20 text-green-400"
                              : l.tipo === "estorno" || l.tipo === "falha"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-gray-500/20 text-gray-400"
                          }
                        >
                          {l.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{l.gateway}</TableCell>
                      <TableCell className="text-white font-medium">{formatarValor(l.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {logs.length === 0 && (
                <p className="text-gray-500 text-center py-8">Nenhuma transação encontrada.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogBloqueioOpen} onOpenChange={setDialogBloqueioOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar CPF à lista de bloqueio</DialogTitle>
            <DialogDescription>O CPF não poderá realizar compras.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="000.000.000-00"
            value={novoBloqueioCpf}
            onChange={(e) => setNovoBloqueioCpf(formatarCPF(e.target.value))}
            className="bg-background"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogBloqueioOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#FFB800] hover:bg-[#FFA500] text-black"
              onClick={adicionarBloqueioCpfLista}
              disabled={!novoBloqueioCpf.trim()}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
