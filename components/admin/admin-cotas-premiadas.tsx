"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { AlertCircle, Gift } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { listarPremiacoes, listarPremiacoesPorCampanha, atualizarStatusPremiacao, type PremiacaoCotaPremiada } from "@/lib/cotas-premiadas-store"
import { listarCampanhas, type Campanha } from "@/lib/campanhas-store"

export default function AdminCotasPremiadas({ campanhaId }: { campanhaId?: string }) {
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [premiacoes, setPremiacoes] = useState<PremiacaoCotaPremiada[]>([])

  const carregar = () => {
    const allCampanhas = listarCampanhas()
    setCampanhas(allCampanhas)
    const allPrem = campanhaId ? listarPremiacoesPorCampanha(campanhaId) : listarPremiacoes()
    setPremiacoes(allPrem)
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("cotas-premiadas-premiacoes-updated", h)
    window.addEventListener("campanhas-updated", h)
    return () => {
      window.removeEventListener("cotas-premiadas-premiacoes-updated", h)
      window.removeEventListener("campanhas-updated", h)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanhaId])

  const resumo = useMemo(() => {
    const total = premiacoes.length
    const pagos = premiacoes.filter((p) => p.status === "pago").length
    const pendentes = total - pagos
    return { total, pagos, pendentes }
  }, [premiacoes])

  return (
    <Tabs defaultValue="configuracoes" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        <TabsTrigger value="historico">Histórico de Premiações</TabsTrigger>
        <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
      </TabsList>

      <TabsContent value="configuracoes">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Cotas Premiadas</CardTitle>
              <CardDescription>
                As cotas premiadas são cadastradas diretamente em cada campanha, na aba
                &nbsp;
                <span className="font-semibold text-[#FFB800]">Cotas premiadas</span>.
                Aqui você visualiza apenas o resumo geral.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Para configurar quais números são premiados e qual prêmio cada um recebe, edite a campanha desejada
                  em <span className="font-semibold">Admin &gt; Campanhas &gt; Editar &gt; Cotas premiadas</span>.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 text-sm text-gray-300">
                <p>
                  1. Abra <span className="font-semibold">Admin &gt; Campanhas</span>, edite a campanha desejada e, na
                  aba <span className="font-semibold">Cotas premiadas</span>, cadastre os números e o prêmio.
                </p>
                <p>
                  2. Quando um pedido dessa campanha for pago e contiver um desses números, o sistema registrará uma
                  premiação automática aqui no histórico.
                </p>
                <p>
                  3. Use as abas de <span className="font-semibold">Histórico</span> e{" "}
                  <span className="font-semibold">Estatísticas</span> abaixo para acompanhar o desempenho.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="historico">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Premiações</CardTitle>
            <CardDescription>Visualize o histórico completo de cotas premiadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Número Premiado</TableHead>
                    <TableHead>Prêmio</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {premiacoes.length > 0 ? (
                    premiacoes
                      .slice()
                      .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
                      .map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{format(new Date(p.criadoEm), "dd/MM/yyyy HH:mm")}</TableCell>
                          <TableCell>{p.nome}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {campanhas.find((c) => c.id === p.campanhaId)?.titulo || p.campanhaId}
                          </TableCell>
                          <TableCell>{p.numeroPremiado ?? "—"}</TableCell>
                          <TableCell>{p.premio}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "pago" ? "default" : "secondary"}>
                              {p.status === "pago" ? "Pago" : "Pendente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {p.status === "pendente" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-500 border-green-500/40 hover:bg-green-500/10"
                                onClick={() => atualizarStatusPremiacao(p.id, "pago")}
                              >
                                Marcar como pago
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhuma premiação registrada até o momento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="estatisticas">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Cotas Premiadas</CardTitle>
            <CardDescription>Análise de desempenho e impacto das cotas premiadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Premiações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumo.total}</div>
                  <p className="text-xs text-muted-foreground">No escopo atual</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumo.pagos}</div>
                  <p className="text-xs text-muted-foreground">Premiações pagas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {resumo.total > 0 ? `${Math.round((resumo.pagos / resumo.total) * 100)}%` : "0%"}
                  </div>
                  <p className="text-xs text-muted-foreground">Pagas / total</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Impacto nas Vendas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Análise do impacto das cotas premiadas no volume de vendas
                </p>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <Gift className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Sem dados disponíveis para exibição</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Distribuição de Premiações por Rifa</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Análise da distribuição de premiações entre as diferentes rifas
                </p>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rifa</TableHead>
                        <TableHead>Premiações</TableHead>
                        <TableHead>Valor Pago</TableHead>
                        <TableHead>Conversão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Nenhuma premiação registrada até o momento.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
