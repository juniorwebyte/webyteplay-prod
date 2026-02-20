"use client"

import { useState, useEffect } from "react"
import ParticlesContainer from "@/components/particles-container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Play, RotateCcw, Calendar, Clock, Eye, Download, Video, Camera } from "lucide-react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import {
  listarSorteios,
  listarProximos,
  listarRealizados,
  agendarSorteio,
  realizarSorteio,
  type Sorteio,
} from "@/lib/sorteios-store"
import { listarCampanhas, buscarCampanha, atualizarCampanha, type Campanha } from "@/lib/campanhas-store"
import { isTipoFazendinha } from "@/lib/tipos-campanha"
import { listarPedidos, listarClientes } from "@/lib/gateway-store"
import { buscarPorCampanhaECota, cotasJaAtribuidas } from "@/lib/cotas-premiadas-roleta-box-store"

export default function SorteioPage() {
  const [activeTab, setActiveTab] = useState("proximos")
  const [sorteioAtual, setSorteioAtual] = useState<string | null>(null)
  const [sorteiosData, setSorteiosData] = useState<Sorteio[]>([])
  const [agendarOpen, setAgendarOpen] = useState(false)
  const [agendarCampanhaId, setAgendarCampanhaId] = useState("")
  const [agendarDataHora, setAgendarDataHora] = useState("")
  const [realizarCota, setRealizarCota] = useState("")
  const [realizarGanhador, setRealizarGanhador] = useState("")
  const [configSalvo, setConfigSalvo] = useState(false)

  const carregarSorteios = () => setSorteiosData(listarSorteios())
  const [campanhas, setCampanhas] = useState<Campanha[]>([])

  useEffect(() => {
    setCampanhas(listarCampanhas())
  }, [])

  useEffect(() => {
    carregarSorteios()
    const handler = () => carregarSorteios()
    window.addEventListener("sorteios-updated", handler)
    return () => window.removeEventListener("sorteios-updated", handler)
  }, [])

  useEffect(() => {
    const handleCampanhas = () => setCampanhas(listarCampanhas())
    window.addEventListener("campanhas-updated", handleCampanhas)
    window.addEventListener("storage", (e) => { if (e.key === "campanhas") handleCampanhas() })
    return () => {
      window.removeEventListener("campanhas-updated", handleCampanhas)
      window.removeEventListener("storage", handleCampanhas)
    }
  }, [])
  const proximosSorteios = listarProximos()
  const sorteiosRealizados = listarRealizados()
  const sorteioSelecionado = sorteiosData.find((s) => s.id === sorteioAtual)

  const handleAgendar = () => {
    if (!agendarCampanhaId || !agendarDataHora) return
    const campanha = campanhas.find((c) => c.id === agendarCampanhaId)
    if (!campanha) return
    const totalCotas = parseInt(campanha.quantidadeNumeros || "0", 10) || 100
    const valorCota = parseFloat((campanha.valorPorCota || "0").replace(",", ".")) || 0
    agendarSorteio({
      campanhaId: campanha.id,
      rifa: campanha.titulo,
      dataSorteio: new Date(agendarDataHora).toISOString(),
      cotasVendidas: campanha.cotasVendidas ?? 0,
      totalCotas,
      valorArrecadado: (campanha.cotasVendidas ?? 0) * valorCota,
    })
    setAgendarOpen(false)
    setAgendarCampanhaId("")
    setAgendarDataHora("")
    carregarSorteios()
  }

  const handleIniciarSorteio = () => {
    if (!sorteioSelecionado) return
    const campanha = buscarCampanha(sorteioSelecionado.campanhaId)
    const isFazendinha = campanha ? isTipoFazendinha(campanha.tipoCampanha || "") : false
    const cotaMin = isFazendinha ? 0 : 1
    const cotaMax = isFazendinha ? 99 : sorteioSelecionado.totalCotas
    const cota = parseInt(realizarCota, 10)
    if (!realizarCota || isNaN(cota) || cota < cotaMin || cota > cotaMax) return
    const bloqueadas = new Set(campanha?.cotasBloqueadas ?? [])
    if (bloqueadas.has(cota)) return // Cota bloqueada não pode ser sorteada
    const ganhador = realizarGanhador.trim() || buscarGanhadorDaCota(sorteioSelecionado.campanhaId, cota)
    realizarSorteio(sorteioSelecionado.id, cota, ganhador)
    atualizarCampanha(sorteioSelecionado.campanhaId, {
      habilitarGanhador: true,
      numeroSorteado: String(cota),
      nomeGanhador: ganhador,
    })
    setSorteioAtual(null)
    setRealizarCota("")
    setRealizarGanhador("")
    carregarSorteios()
    setActiveTab("realizados")
  }

  const buscarGanhadorDaCota = (campanhaId: string, cota: number): string => {
    const pedido = listarPedidos().find(
      (p) => p.campanhaId === campanhaId && p.status === "pago" && p.numerosEscolhidos?.includes(cota)
    )
    if (pedido) return pedido.nomeComprador || "Comprador"
    const ganhos = buscarPorCampanhaECota(campanhaId, cota)
    if (ganhos.length > 0) {
      const cpf = ganhos[0].cpf.replace(/\D/g, "")
      const cliente = listarClientes().find((c) => c.cpf.replace(/\D/g, "") === cpf)
      return cliente?.nome || `Ganhador roleta/box (${ganhos[0].premioNome})`
    }
    return "A definir"
  }

  const sortearNumeroAleatorio = () => {
    if (!sorteioSelecionado) return
    const campanha = buscarCampanha(sorteioSelecionado.campanhaId)
    const isFazendinha = campanha ? isTipoFazendinha(campanha.tipoCampanha || "") : false
    const minCota = isFazendinha ? 0 : 1
    const maxCota = isFazendinha ? 99 : sorteioSelecionado.totalCotas
    const bloqueadas = new Set(campanha?.cotasBloqueadas ?? [])
    const vendidas = new Set<number>()
    listarPedidos()
      .filter((p) => p.campanhaId === sorteioSelecionado.campanhaId && p.status === "pago" && Array.isArray(p.numerosEscolhidos))
      .forEach((p) => p.numerosEscolhidos?.forEach((num) => vendidas.add(num)))
    const roletaBox = cotasJaAtribuidas(sorteioSelecionado.campanhaId)
    const pool = new Set([...vendidas, ...roletaBox])
    const elegiveis = Array.from(pool).filter((n) => !bloqueadas.has(n) && n >= minCota && n <= maxCota)
    if (elegiveis.length === 0) return
    const n = elegiveis[Math.floor(Math.random() * elegiveis.length)]
    setRealizarCota(String(n))
    setRealizarGanhador(buscarGanhadorDaCota(sorteioSelecionado.campanhaId, n))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <div className="flex flex-1 z-10 relative">
        <AdminSidebar />

        <div className="flex-1 overflow-auto p-8">
          <h1 className="text-2xl font-bold mb-6 text-white">Sorteio</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="proximos">Próximos Sorteios</TabsTrigger>
              <TabsTrigger value="realizados">Sorteios Realizados</TabsTrigger>
              <TabsTrigger value="realizar" disabled={!sorteioAtual}>
                {sorteioAtual ? `Realizar: ${sorteioSelecionado?.rifa}` : "Realizar Sorteio"}
              </TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="proximos">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Próximos Sorteios</CardTitle>
                      <CardDescription>Sorteios agendados para serem realizados</CardDescription>
                    </div>
                    <Button onClick={() => setAgendarOpen(true)}>
                      <Calendar className="mr-2 h-4 w-4" /> Agendar Sorteio
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Rifa</TableHead>
                        <TableHead>Data do Sorteio</TableHead>
                        <TableHead>Cotas Vendidas</TableHead>
                        <TableHead>Total Cotas</TableHead>
                        <TableHead>% Preenchimento</TableHead>
                        <TableHead>Valor Arrecadado</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proximosSorteios.length > 0 ? (
                        proximosSorteios.map((sorteio) => (
                          <TableRow key={sorteio.id}>
                            <TableCell>{sorteio.id}</TableCell>
                            <TableCell className="font-medium">{sorteio.rifa}</TableCell>
                            <TableCell>
                              {new Date(sorteio.dataSorteio).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell>{sorteio.cotasVendidas}</TableCell>
                            <TableCell>{sorteio.totalCotas}</TableCell>
                            <TableCell>
                              {((sorteio.cotasVendidas / sorteio.totalCotas) * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell>R$ {sorteio.valorArrecadado.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSorteioAtual(String(sorteio.id))
                                    setActiveTab("realizar")
                                  }}
                                >
                                  <Play className="mr-2 h-4 w-4" /> Realizar
                                </Button>
                                <Button variant="outline" size="icon" title="Visualizar">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            Nenhum sorteio agendado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="realizados">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Sorteios Realizados</CardTitle>
                      <CardDescription>Histórico de sorteios já realizados</CardDescription>
                    </div>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" /> Exportar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Rifa</TableHead>
                        <TableHead>Data do Sorteio</TableHead>
                        <TableHead>Cota Premiada</TableHead>
                        <TableHead>Ganhador</TableHead>
                        <TableHead>Cotas Vendidas</TableHead>
                        <TableHead>Valor Arrecadado</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorteiosRealizados.map((sorteio) => (
                        <TableRow key={sorteio.id}>
                          <TableCell>{sorteio.id}</TableCell>
                          <TableCell className="font-medium">{sorteio.rifa}</TableCell>
                          <TableCell>
                            {new Date(sorteio.dataSorteio).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{sorteio.cotaPremiada}</Badge>
                          </TableCell>
                          <TableCell>{sorteio.ganhador}</TableCell>
                          <TableCell>
                            {sorteio.cotasVendidas} / {sorteio.totalCotas}
                          </TableCell>
                          <TableCell>R$ {sorteio.valorArrecadado.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="icon" title="Visualizar">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" title="Ver Transmissão">
                                <Video className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="realizar">
              {sorteioSelecionado && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Realizar Sorteio</CardTitle>
                            <CardDescription>{sorteioSelecionado.rifa}</CardDescription>
                          </div>
                          <Badge variant="outline" className="text-lg py-1 px-3">
                            <Clock className="mr-2 h-4 w-4" />
                            {new Date(sorteioSelecionado.dataSorteio).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center space-y-8 py-8">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold mb-2">Sorteio da Rifa</h2>
                          <p className="text-3xl font-extrabold text-primary">{sorteioSelecionado.rifa}</p>
                          <p className="text-muted-foreground mt-2">
                            {new Date(sorteioSelecionado.dataSorteio).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="bg-black/20 w-full max-w-2xl aspect-video rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
                          <div className="text-center">
                            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Transmissão ao vivo</p>
                            <Button variant="outline" className="mt-4">
                              <Video className="mr-2 h-4 w-4" /> Iniciar Transmissão
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-col items-center space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                            <div className="space-y-2 flex-1">
                              <Label>Cota premiada</Label>
                              <Input
                                type="number"
                                min={
                                  sorteioSelecionado &&
                                  buscarCampanha(sorteioSelecionado.campanhaId) &&
                                  isTipoFazendinha(buscarCampanha(sorteioSelecionado.campanhaId)?.tipoCampanha || "")
                                    ? 0
                                    : 1
                                }
                                max={
                                  sorteioSelecionado &&
                                  buscarCampanha(sorteioSelecionado.campanhaId) &&
                                  isTipoFazendinha(buscarCampanha(sorteioSelecionado.campanhaId)?.tipoCampanha || "")
                                    ? 99
                                    : sorteioSelecionado?.totalCotas ?? 100
                                }
                                value={realizarCota}
                                onChange={(e) => setRealizarCota(e.target.value)}
                                placeholder="Número da cota"
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2 flex-1">
                              <Label>Ganhador</Label>
                              <Input
                                value={realizarGanhador}
                                onChange={(e) => setRealizarGanhador(e.target.value)}
                                placeholder="Nome ou A definir"
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-4">
                            <Button
                              size="lg"
                              className="px-8"
                              onClick={handleIniciarSorteio}
                              disabled={
                                !realizarCota ||
                                (() => {
                                  const camp = sorteioSelecionado ? buscarCampanha(sorteioSelecionado.campanhaId) : null
                                  const min = camp && isTipoFazendinha(camp.tipoCampanha || "") ? 0 : 1
                                  const n = parseInt(realizarCota, 10)
                                  return isNaN(n) || n < min
                                })()
                              }
                            >
                              <Play className="mr-2 h-5 w-5" /> Confirmar Sorteio
                            </Button>
                            <Button variant="outline" size="lg" onClick={sortearNumeroAleatorio}>
                              <RotateCcw className="mr-2 h-5 w-5" /> Sortear número
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="md:col-span-1">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Informações da Rifa</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Total de Cotas</div>
                            <div className="text-lg font-medium">{sorteioSelecionado.totalCotas}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Cotas Vendidas</div>
                            <div className="text-lg font-medium">{sorteioSelecionado.cotasVendidas}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Preenchimento</div>
                            <div className="text-lg font-medium">
                              {((sorteioSelecionado.cotasVendidas / sorteioSelecionado.totalCotas) * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Valor Arrecadado</div>
                            <div className="text-lg font-medium">R$ {sorteioSelecionado.valorArrecadado.toFixed(2)}</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Configurações do Sorteio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="metodo-sorteio">Método de Sorteio</Label>
                            <Select defaultValue="aleatorio">
                              <SelectTrigger id="metodo-sorteio">
                                <SelectValue placeholder="Selecione o método" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="aleatorio">Aleatório</SelectItem>
                                <SelectItem value="loteria">Loteria Federal</SelectItem>
                                <SelectItem value="manual">Manual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="velocidade-sorteio">Velocidade do Sorteio</Label>
                            <Select defaultValue="media">
                              <SelectTrigger id="velocidade-sorteio">
                                <SelectValue placeholder="Selecione a velocidade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lenta">Lenta</SelectItem>
                                <SelectItem value="media">Média</SelectItem>
                                <SelectItem value="rapida">Rápida</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="configuracoes">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais do Sistema de Sorteio</CardTitle>
                  <CardDescription>Configure os parâmetros globais para os sorteios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tempo-preparacao">Tempo de Preparação (minutos)</Label>
                      <Select defaultValue="5">
                        <SelectTrigger id="tempo-preparacao">
                          <SelectValue placeholder="Selecione o tempo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 minutos</SelectItem>
                          <SelectItem value="5">5 minutos</SelectItem>
                          <SelectItem value="10">10 minutos</SelectItem>
                          <SelectItem value="15">15 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delay-numeros">Delay entre Números (segundos)</Label>
                      <Select defaultValue="0.5">
                        <SelectTrigger id="delay-numeros">
                          <SelectValue placeholder="Selecione o delay" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.2">0.2 segundos</SelectItem>
                          <SelectItem value="0.5">0.5 segundos</SelectItem>
                          <SelectItem value="1">1 segundo</SelectItem>
                          <SelectItem value="2">2 segundos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="animacao-final">Animação Final</Label>
                      <Select defaultValue="explosao">
                        <SelectTrigger id="animacao-final">
                          <SelectValue placeholder="Selecione a animação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="explosao">Explosão de Confetes</SelectItem>
                          <SelectItem value="fogo">Fogos de Artifício</SelectItem>
                          <SelectItem value="estrelas">Estrelas Cadentes</SelectItem>
                          <SelectItem value="nenhuma">Nenhuma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notificacao-ganhador">Notificação do Ganhador</Label>
                      <Select defaultValue="automatica">
                        <SelectTrigger id="notificacao-ganhador">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatica">Automática</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="nenhuma">Nenhuma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setConfigSalvo(false)}
                    >
                      Restaurar Padrões
                    </Button>
                    <Button
                      onClick={() => {
                        setConfigSalvo(true)
                        setTimeout(() => setConfigSalvo(false), 2000)
                      }}
                    >
                      {configSalvo ? "Salvo!" : "Salvar Configurações"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog open={agendarOpen} onOpenChange={setAgendarOpen}>
            <DialogContent className="bg-[#171923] border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Agendar Sorteio</DialogTitle>
                <DialogDescription>
                  Selecione a campanha (rifa) e a data/hora do sorteio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Campanha (Rifa)</Label>
                  <Select value={agendarCampanhaId} onValueChange={setAgendarCampanhaId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione a campanha" />
                    </SelectTrigger>
                    <SelectContent>
                      {campanhas.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.titulo} (Cotas: {c.cotasVendidas ?? 0}/{c.quantidadeNumeros})
                        </SelectItem>
                      ))}
                      {campanhas.length === 0 && (
                        <SelectItem value="_" disabled>
                          Nenhuma campanha cadastrada
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data e hora do sorteio</Label>
                  <Input
                    type="datetime-local"
                    value={agendarDataHora}
                    onChange={(e) => setAgendarDataHora(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAgendarOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAgendar}
                  disabled={!agendarCampanhaId || !agendarDataHora}
                >
                  Agendar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
