"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Lock,
  Unlock,
  Filter,
  TrendingUp,
  TrendingDown,
  Gift,
  Settings,
  Save,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"

// Dados simulados de cotas
const cotasData = [
  { numero: "00001", status: "disponivel", comprador: "", dataCompra: "", visualizacoes: 12 },
  { numero: "00002", status: "vendida", comprador: "João Silva", dataCompra: "15/04/2025", visualizacoes: 8 },
  { numero: "00003", status: "reservada", comprador: "Maria Oliveira", dataCompra: "15/04/2025", visualizacoes: 5 },
  { numero: "00004", status: "bloqueada", comprador: "", dataCompra: "", visualizacoes: 3 },
  { numero: "00005", status: "disponivel", comprador: "", dataCompra: "", visualizacoes: 15 },
  { numero: "00006", status: "vendida", comprador: "Pedro Santos", dataCompra: "14/04/2025", visualizacoes: 7 },
  { numero: "00007", status: "disponivel", comprador: "", dataCompra: "", visualizacoes: 9 },
  { numero: "00008", status: "vendida", comprador: "Ana Costa", dataCompra: "13/04/2025", visualizacoes: 6 },
  { numero: "00009", status: "premiada", comprador: "Carlos Mendes", dataCompra: "12/04/2025", visualizacoes: 20 },
  { numero: "00010", status: "disponivel", comprador: "", dataCompra: "", visualizacoes: 4 },
]

// Dados simulados de cotas premiadas
const cotasPremiadasData = [
  {
    id: 1,
    rifa: "iPhone 15 Pro Max",
    cotaInicio: "00001",
    cotaFim: "00100",
    quantidadePremios: 3,
    valorPremio: 100,
    distribuicao: "aleatoria",
    status: "ativo",
  },
  {
    id: 2,
    rifa: "PlayStation 5",
    cotaInicio: "00001",
    cotaFim: "00200",
    quantidadePremios: 5,
    valorPremio: 50,
    distribuicao: "sequencial",
    status: "ativo",
  },
  {
    id: 3,
    rifa: "R$ 5.000 em PIX",
    cotaInicio: "00001",
    cotaFim: "00500",
    quantidadePremios: 10,
    valorPremio: 20,
    distribuicao: "personalizada",
    status: "inativo",
  },
]

export default function GestaoAvancadaRifas() {
  const [selectedRifa, setSelectedRifa] = useState("iPhone 15 Pro Max")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [cotasBloqueadas, setCotasBloqueadas] = useState<string[]>(
    cotasData.filter((cota) => cota.status === "bloqueada").map((cota) => cota.numero),
  )
  const [cotasPremiadas, setCotasPremiadas] = useState<string[]>(
    cotasData.filter((cota) => cota.status === "premiada").map((cota) => cota.numero),
  )
  const [cotasFiltradas, setCotasFiltradas] = useState(cotasData)
  const [ordenacao, setOrdenacao] = useState("numero")
  const [searchTerm, setSearchTerm] = useState("")

  // Configurações de cotas premiadas automáticas
  const [configPremiadas, setConfigPremiadas] = useState({
    quantidadePremios: 5,
    valorPremio: 50,
    distribuicao: "aleatoria",
    cotaInicio: "00001",
    cotaFim: "01000",
    intervaloMinimo: 10,
  })

  // Filtrar cotas
  const filtrarCotas = () => {
    let resultado = [...cotasData]

    // Filtrar por status
    if (filtroStatus !== "todos") {
      resultado = resultado.filter((cota) => cota.status === filtroStatus)
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      resultado = resultado.filter(
        (cota) => cota.numero.includes(searchTerm) || cota.comprador.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Ordenar
    resultado.sort((a, b) => {
      if (ordenacao === "numero") {
        return a.numero.localeCompare(b.numero)
      } else if (ordenacao === "visualizacoes_asc") {
        return a.visualizacoes - b.visualizacoes
      } else if (ordenacao === "visualizacoes_desc") {
        return b.visualizacoes - a.visualizacoes
      }
      return 0
    })

    setCotasFiltradas(resultado)
  }

  // Alternar bloqueio de cota
  const toggleBloqueio = (numero: string) => {
    if (cotasBloqueadas.includes(numero)) {
      setCotasBloqueadas(cotasBloqueadas.filter((n) => n !== numero))
    } else {
      setCotasBloqueadas([...cotasBloqueadas, numero])
    }
  }

  // Alternar cota premiada
  const togglePremiada = (numero: string) => {
    if (cotasPremiadas.includes(numero)) {
      setCotasPremiadas(cotasPremiadas.filter((n) => n !== numero))
    } else {
      setCotasPremiadas([...cotasPremiadas, numero])
    }
  }

  // Gerar cotas premiadas automaticamente
  const gerarCotasPremiadas = () => {
    // Simulação de geração de cotas premiadas
    alert(
      `${configPremiadas.quantidadePremios} cotas premiadas geradas com sucesso entre ${configPremiadas.cotaInicio} e ${configPremiadas.cotaFim}!`,
    )
  }

  // Efeito para filtrar cotas quando os filtros mudam
  useState(() => {
    filtrarCotas()
  })

  return (
    <Tabs defaultValue="bloqueio-cotas">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="bloqueio-cotas">Bloqueio Inteligente de Cotas</TabsTrigger>
        <TabsTrigger value="filtro-cotas">Filtro de Maior/Menor Cota</TabsTrigger>
        <TabsTrigger value="cotas-premiadas">Cotas Premiadas Automáticas</TabsTrigger>
      </TabsList>

      <TabsContent value="bloqueio-cotas" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Bloqueio Inteligente de Cotas</CardTitle>
            <CardDescription>
              Bloqueie manualmente cotas específicas ou configure regras para bloqueio automático
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar cotas ou compradores..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      filtrarCotas()
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filtroStatus}
                  onValueChange={(value) => {
                    setFiltroStatus(value)
                    filtrarCotas()
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="vendida">Vendida</SelectItem>
                    <SelectItem value="reservada">Reservada</SelectItem>
                    <SelectItem value="bloqueada">Bloqueada</SelectItem>
                    <SelectItem value="premiada">Premiada</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={ordenacao}
                  onValueChange={(value) => {
                    setOrdenacao(value)
                    filtrarCotas()
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numero">Número (crescente)</SelectItem>
                    <SelectItem value="visualizacoes_asc">Menos visualizadas</SelectItem>
                    <SelectItem value="visualizacoes_desc">Mais visualizadas</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={filtrarCotas}>
                  <Filter className="mr-2 h-4 w-4" /> Filtrar
                </Button>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Visualizações</TableHead>
                    <TableHead>Bloqueio</TableHead>
                    <TableHead>Premiada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cotasFiltradas.map((cota) => (
                    <TableRow key={cota.numero}>
                      <TableCell className="font-medium">{cota.numero}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cota.status === "disponivel"
                              ? "outline"
                              : cota.status === "vendida"
                                ? "default"
                                : cota.status === "reservada"
                                  ? "secondary"
                                  : cota.status === "bloqueada"
                                    ? "destructive"
                                    : "accent"
                          }
                        >
                          {cota.status === "disponivel"
                            ? "Disponível"
                            : cota.status === "vendida"
                              ? "Vendida"
                              : cota.status === "reservada"
                                ? "Reservada"
                                : cota.status === "bloqueada"
                                  ? "Bloqueada"
                                  : "Premiada"}
                        </Badge>
                      </TableCell>
                      <TableCell>{cota.comprador || "-"}</TableCell>
                      <TableCell>{cota.dataCompra || "-"}</TableCell>
                      <TableCell>{cota.visualizacoes}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBloqueio(cota.numero)}
                          disabled={cota.status === "vendida" || cota.status === "reservada"}
                        >
                          {cotasBloqueadas.includes(cota.numero) ? (
                            <Lock className="h-4 w-4 text-destructive" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePremiada(cota.numero)}
                          disabled={cota.status !== "vendida"}
                        >
                          {cotasPremiadas.includes(cota.numero) ? (
                            <Gift className="h-4 w-4 text-accent" />
                          ) : (
                            <Gift className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-lg font-medium mb-4">Bloqueio Automático de Cotas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bloquear cotas específicas</Label>
                      <p className="text-sm text-muted-foreground">
                        Bloqueia automaticamente cotas com números específicos
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cotas-especificas">Números das cotas (separados por vírgula)</Label>
                    <Input id="cotas-especificas" placeholder="Ex: 00013, 00666, 01313" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bloquear intervalos de cotas</Label>
                      <p className="text-sm text-muted-foreground">
                        Bloqueia automaticamente intervalos de cotas específicos
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="intervalo-inicio">Início do intervalo</Label>
                      <Input id="intervalo-inicio" placeholder="Ex: 00100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intervalo-fim">Fim do intervalo</Label>
                      <Input id="intervalo-fim" placeholder="Ex: 00200" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bloquear cotas com padrão</Label>
                      <p className="text-sm text-muted-foreground">
                        Bloqueia cotas que seguem um padrão específico (ex: terminadas em 13)
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="padrao-cotas">Padrão (expressão regular)</Label>
                    <Input id="padrao-cotas" placeholder="Ex: .*13$" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bloquear cotas promocionais</Label>
                      <p className="text-sm text-muted-foreground">
                        Reserva cotas para uso em promoções e campanhas especiais
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantidade-promocional">Quantidade de cotas promocionais</Label>
                    <Input id="quantidade-promocional" type="number" min="1" placeholder="Ex: 50" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancelar</Button>
            <Button>
              <Save className="mr-2 h-4 w-4" /> Salvar Configurações
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="filtro-cotas" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Filtro de Maior/Menor Cota</CardTitle>
            <CardDescription>Visualize e analise as cotas mais e menos selecionadas pelos usuários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex-1">
                <Select value={selectedRifa} onValueChange={setSelectedRifa}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma rifa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iPhone 15 Pro Max">iPhone 15 Pro Max</SelectItem>
                    <SelectItem value="PlayStation 5">PlayStation 5</SelectItem>
                    <SelectItem value="R$ 5.000 em PIX">R$ 5.000 em PIX</SelectItem>
                    <SelectItem value="Viagem para Cancún">Viagem para Cancún</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Dados
                </Button>
                <Button>
                  <Filter className="mr-2 h-4 w-4" /> Aplicar Filtros
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Cotas Mais Visualizadas</CardTitle>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <CardDescription>As cotas com maior número de visualizações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cotasData
                      .sort((a, b) => b.visualizacoes - a.visualizacoes)
                      .slice(0, 5)
                      .map((cota, index) => (
                        <div key={cota.numero} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">Cota {cota.numero}</p>
                              <p className="text-xs text-muted-foreground">
                                {cota.status === "vendida" || cota.status === "reservada"
                                  ? `Comprador: ${cota.comprador}`
                                  : cota.status === "bloqueada"
                                    ? "Bloqueada"
                                    : cota.status === "premiada"
                                      ? "Premiada"
                                      : "Disponível"}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{cota.visualizacoes} visualizações</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Cotas Menos Visualizadas</CardTitle>
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  </div>
                  <CardDescription>As cotas com menor número de visualizações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cotasData
                      .sort((a, b) => a.visualizacoes - b.visualizacoes)
                      .slice(0, 5)
                      .map((cota, index) => (
                        <div key={cota.numero} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">Cota {cota.numero}</p>
                              <p className="text-xs text-muted-foreground">
                                {cota.status === "vendida" || cota.status === "reservada"
                                  ? `Comprador: ${cota.comprador}`
                                  : cota.status === "bloqueada"
                                    ? "Bloqueada"
                                    : cota.status === "premiada"
                                      ? "Premiada"
                                      : "Disponível"}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{cota.visualizacoes} visualizações</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Comportamento</CardTitle>
                <CardDescription>Estatísticas e padrões de seleção de cotas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Padrões de Seleção</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="flex justify-between">
                        <span>Números terminados em 0:</span>
                        <span className="font-medium">15% das vendas</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Números terminados em 7:</span>
                        <span className="font-medium">12% das vendas</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Números sequenciais:</span>
                        <span className="font-medium">8% das vendas</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Datas de aniversário:</span>
                        <span className="font-medium">22% das vendas</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Números aleatórios:</span>
                        <span className="font-medium">43% das vendas</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Horários de Maior Venda</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="flex justify-between">
                        <span>Manhã (6h-12h):</span>
                        <span className="font-medium">15% das vendas</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Tarde (12h-18h):</span>
                        <span className="font-medium">30% das vendas</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Noite (18h-0h):</span>
                        <span className="font-medium">45% das vendas</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Madrugada (0h-6h):</span>
                        <span className="font-medium">10% das vendas</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Recomendações</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Promover cotas menos visualizadas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Destacar cotas com números especiais</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Criar promoções em horários de menor venda</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Oferecer descontos para compras em lote</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cotas-premiadas" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Cotas Premiadas Automáticas</CardTitle>
            <CardDescription>
              Configure o sorteio e a distribuição automática de prêmios entre cotas específicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rifa-premiada">Rifa</Label>
                  <Select value={selectedRifa} onValueChange={setSelectedRifa}>
                    <SelectTrigger id="rifa-premiada">
                      <SelectValue placeholder="Selecione uma rifa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iPhone 15 Pro Max">iPhone 15 Pro Max</SelectItem>
                      <SelectItem value="PlayStation 5">PlayStation 5</SelectItem>
                      <SelectItem value="R$ 5.000 em PIX">R$ 5.000 em PIX</SelectItem>
                      <SelectItem value="Viagem para Cancún">Viagem para Cancún</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade-premios">Quantidade de Prêmios</Label>
                  <Input
                    id="quantidade-premios"
                    type="number"
                    min="1"
                    value={configPremiadas.quantidadePremios}
                    onChange={(e) =>
                      setConfigPremiadas({
                        ...configPremiadas,
                        quantidadePremios: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Número total de cotas que serão premiadas automaticamente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor-premio">Valor do Prêmio (R$)</Label>
                  <Input
                    id="valor-premio"
                    type="number"
                    min="1"
                    value={configPremiadas.valorPremio}
                    onChange={(e) =>
                      setConfigPremiadas({ ...configPremiadas, valorPremio: Number.parseInt(e.target.value) || 1 })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Valor que será creditado para cada cota premiada</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="distribuicao">Tipo de Distribuição</Label>
                  <Select
                    value={configPremiadas.distribuicao}
                    onValueChange={(value) => setConfigPremiadas({ ...configPremiadas, distribuicao: value })}
                  >
                    <SelectTrigger id="distribuicao">
                      <SelectValue placeholder="Selecione o tipo de distribuição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aleatoria">Aleatória</SelectItem>
                      <SelectItem value="sequencial">Sequencial</SelectItem>
                      <SelectItem value="personalizada">Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Como os prêmios serão distribuídos entre as cotas</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cota-inicio">Cota Inicial</Label>
                    <Input
                      id="cota-inicio"
                      value={configPremiadas.cotaInicio}
                      onChange={(e) => setConfigPremiadas({ ...configPremiadas, cotaInicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cota-fim">Cota Final</Label>
                    <Input
                      id="cota-fim"
                      value={configPremiadas.cotaFim}
                      onChange={(e) => setConfigPremiadas({ ...configPremiadas, cotaFim: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intervalo-minimo">Intervalo Mínimo Entre Prêmios</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="intervalo-minimo"
                      min={1}
                      max={50}
                      step={1}
                      value={[configPremiadas.intervaloMinimo]}
                      onValueChange={(value) => setConfigPremiadas({ ...configPremiadas, intervaloMinimo: value[0] })}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{configPremiadas.intervaloMinimo}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Número mínimo de cotas entre cada prêmio (apenas para distribuição sequencial)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-muted rounded-md">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-sm">
                As cotas premiadas serão sorteadas automaticamente entre as cotas vendidas no intervalo especificado. Os
                prêmios serão creditados automaticamente para os compradores.
              </p>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Rifa</TableHead>
                    <TableHead>Intervalo</TableHead>
                    <TableHead>Qtd. Prêmios</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Distribuição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cotasPremiadasData.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>{config.id}</TableCell>
                      <TableCell>{config.rifa}</TableCell>
                      <TableCell>
                        {config.cotaInicio} a {config.cotaFim}
                      </TableCell>
                      <TableCell>{config.quantidadePremios}</TableCell>
                      <TableCell>R$ {config.valorPremio.toFixed(2)}</TableCell>
                      <TableCell>
                        {config.distribuicao === "aleatoria"
                          ? "Aleatória"
                          : config.distribuicao === "sequencial"
                            ? "Sequencial"
                            : "Personalizada"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.status === "ativo" ? "default" : "secondary"}>
                          {config.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                          {config.status === "ativo" ? (
                            <Button variant="outline" size="icon">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="icon">
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={gerarCotasPremiadas}>
              <Gift className="mr-2 h-4 w-4" /> Gerar Cotas Premiadas
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
