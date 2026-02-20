"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Users,
  Search,
  Eye,
  Crown,
  Ban,
  MapPin,
  CreditCard,
  LifeBuoy,
  UserPlus,
  FolderOpen,
  Gift,
  Filter,
} from "lucide-react"
import { listarClientes, listarPedidos, type Cliente, type Pedido } from "@/lib/gateway-store"
import {
  listarClientesLoja,
  listarClientesVIP,
  listarBloqueados,
  listarEnderecosCliente,
  listarGrupos,
  gruposDoCliente,
  listarCreditosCliente,
  saldoCreditoCliente,
  listarSuporteCliente,
  adicionarClienteVIP,
  removerClienteVIP,
  bloquearCliente,
  desbloquearCliente,
  adicionarCredito,
  criarGrupo,
  adicionarClienteGrupo,
  removerClienteGrupo,
  criarSolicitacaoSuporte,
  isClienteVIP,
  isClienteBloqueado,
  type GrupoCliente,
  type SuporteCliente,
} from "@/lib/clientes-loja-store"
import { formatarCPF, formatarTelefone, formatarValor, formatarCEP } from "@/lib/formatadores"

export default function LojaClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [grupos, setGrupos] = useState<GrupoCliente[]>([])
  const [busca, setBusca] = useState("")
  const [segmento, setSegmento] = useState<string>("todos")
  const [abaAtiva, setAbaAtiva] = useState("lista")
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [dialogPerfilOpen, setDialogPerfilOpen] = useState(false)
  const [dialogCreditoOpen, setDialogCreditoOpen] = useState(false)
  const [dialogSuporteOpen, setDialogSuporteOpen] = useState(false)
  const [dialogGrupoOpen, setDialogGrupoOpen] = useState(false)
  const [formCredito, setFormCredito] = useState({ valor: 0, origem: "manual" as const })
  const [formSuporte, setFormSuporte] = useState({ assunto: "", mensagem: "", prioridade: "media" as const })
  const [formGrupo, setFormGrupo] = useState({ nome: "", descricao: "" })

  const carregar = () => {
    setClientes(
      listarClientesLoja({
        segmento: segmento as any,
        busca: busca || undefined,
      })
    )
    setPedidos(listarPedidos())
    setGrupos(listarGrupos())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("clientes-updated", h)
    window.addEventListener("clientes-loja-updated", h)
    window.addEventListener("pedidos-updated", h)
    return () => {
      window.removeEventListener("clientes-updated", h)
      window.removeEventListener("clientes-loja-updated", h)
      window.removeEventListener("pedidos-updated", h)
    }
  }, [segmento, busca])

  const clientesInativos = listarClientes().filter((c) => c.status === "inativo").length
  const clientesVIP = listarClientesVIP().length
  const bloqueados = listarBloqueados().length

  const pedidosDoCliente = clienteSelecionado
    ? pedidos.filter((p) => clienteSelecionado.pedidos.includes(p.id))
    : []
  const enderecosCliente = clienteSelecionado
    ? listarEnderecosCliente(clienteSelecionado.id)
    : []
  const creditosCliente = clienteSelecionado
    ? listarCreditosCliente(clienteSelecionado.id)
    : []
  const saldoCredito = clienteSelecionado ? saldoCreditoCliente(clienteSelecionado.id) : 0
  const suporteCliente = clienteSelecionado
    ? listarSuporteCliente(clienteSelecionado.id)
    : []

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Users className="h-8 w-8 text-[#FFB800]" />
        Clientes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-[#171923] border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">{clientes.length}</CardTitle>
            <CardDescription>Total de Clientes</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-[#171923] border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-yellow-400">{clientesVIP}</CardTitle>
            <CardDescription>Lista VIP</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-[#171923] border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-400">{clientesInativos}</CardTitle>
            <CardDescription>Inativos</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-[#171923] border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-400">{bloqueados}</CardTitle>
            <CardDescription>Bloqueados</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="vip">VIP</TabsTrigger>
          <TabsTrigger value="inativos">Inativos</TabsTrigger>
          <TabsTrigger value="bloqueados">Bloqueados</TabsTrigger>
          <TabsTrigger value="grupos">Grupos</TabsTrigger>
          <TabsTrigger value="suporte">Suporte</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar clientes..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-8 bg-background"
                  />
                </div>
                <Select value={segmento} onValueChange={setSegmento}>
                  <SelectTrigger className="w-48 bg-background">
                    <SelectValue placeholder="Segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativos">Ativos</SelectItem>
                    <SelectItem value="inativos">Inativos</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="bloqueados">Bloqueados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Cliente</TableHead>
                    <TableHead className="text-gray-300">CPF</TableHead>
                    <TableHead className="text-gray-300">Telefone</TableHead>
                    <TableHead className="text-gray-300">Compras</TableHead>
                    <TableHead className="text-gray-300">Valor Gasto</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{c.nome.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">{c.nome}</div>
                            <div className="text-sm text-gray-400">{c.email}</div>
                          </div>
                          {isClienteVIP(c.id) && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{formatarCPF(c.cpf)}</TableCell>
                      <TableCell className="text-gray-300">{formatarTelefone(c.telefone)}</TableCell>
                      <TableCell className="text-gray-300">{c.totalCompras}</TableCell>
                      <TableCell className="text-gray-300 font-bold">{formatarValor(c.valorGasto)}</TableCell>
                      <TableCell>
                        {isClienteBloqueado(c.id) ? (
                          <Badge className="bg-red-500/20 text-red-400">Bloqueado</Badge>
                        ) : (
                          <Badge className={c.status === "ativo" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                            {c.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setClienteSelecionado(c)
                            setDialogPerfilOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vip">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Lista VIP</CardTitle>
              <CardDescription>Clientes com status especial</CardDescription>
            </CardHeader>
            <CardContent>
              {clientes.filter((c) => isClienteVIP(c.id)).length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum cliente VIP cadastrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Cliente</TableHead>
                      <TableHead className="text-gray-300">Valor Gasto</TableHead>
                      <TableHead className="text-gray-300 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.filter((c) => isClienteVIP(c.id)).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-white">{c.nome}</TableCell>
                        <TableCell className="text-gray-300">{formatarValor(c.valorGasto)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => removerClienteVIP(c.id)}>
                            Remover VIP
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inativos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Clientes Inativos</CardTitle>
              <CardDescription>Clientes sem compras recentes</CardDescription>
            </CardHeader>
            <CardContent>
              {clientes.filter((c) => c.status === "inativo").length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum cliente inativo.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Cliente</TableHead>
                      <TableHead className="text-gray-300">Última Compra</TableHead>
                      <TableHead className="text-gray-300">Valor Total Gasto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.filter((c) => c.status === "inativo").map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-white">{c.nome}</TableCell>
                        <TableCell className="text-gray-300">{c.ultimaCompra ? new Date(c.ultimaCompra).toLocaleDateString("pt-BR") : "—"}</TableCell>
                        <TableCell className="text-gray-300">{formatarValor(c.valorGasto)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bloqueados">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Lista de Bloqueio</CardTitle>
              <CardDescription>Clientes bloqueados na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {clientes.filter((c) => isClienteBloqueado(c.id)).length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum cliente bloqueado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Cliente</TableHead>
                      <TableHead className="text-gray-300 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.filter((c) => isClienteBloqueado(c.id)).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-white">{c.nome}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => desbloquearCliente(c.id)}>
                            Desbloquear
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grupos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Grupos de Clientes</CardTitle>
                  <CardDescription>Organize clientes em grupos</CardDescription>
                </div>
                <Button onClick={() => setDialogGrupoOpen(true)}>
                  <FolderOpen className="mr-2 h-4 w-4" /> Novo Grupo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {grupos.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum grupo cadastrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Grupo</TableHead>
                      <TableHead className="text-gray-300">Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grupos.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium text-white">{g.nome}</TableCell>
                        <TableCell className="text-gray-300">{g.descricao || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suporte">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Solicitações de Suporte</CardTitle>
              <CardDescription>Histórico de atendimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center py-8">Visualize solicitações ao abrir o perfil do cliente.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Perfil do Cliente */}
      <Dialog open={dialogPerfilOpen} onOpenChange={setDialogPerfilOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          {clienteSelecionado && (
            <>
              <DialogHeader>
                <DialogTitle>Perfil do Cliente</DialogTitle>
                <DialogDescription>{clienteSelecionado.nome}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Dados Pessoais</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nome:</strong> {clienteSelecionado.nome}</p>
                      <p><strong>E-mail:</strong> {clienteSelecionado.email}</p>
                      <p><strong>Telefone:</strong> {formatarTelefone(clienteSelecionado.telefone)}</p>
                      <p><strong>CPF:</strong> {formatarCPF(clienteSelecionado.cpf)}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Pontuação / Fidelidade</h3>
                    <p className="text-2xl font-bold text-[#FFB800]">{formatarValor(saldoCredito)}</p>
                    <p className="text-sm text-gray-400">Créditos disponíveis</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Histórico de Compras</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Pedido</TableHead>
                        <TableHead className="text-gray-300">Valor</TableHead>
                        <TableHead className="text-gray-300">Data</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosDoCliente.slice(0, 10).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-white">#{p.id.slice(-8)}</TableCell>
                          <TableCell className="text-gray-300">{formatarValor(p.valorTotal)}</TableCell>
                          <TableCell className="text-gray-300">{new Date(p.criadoEm).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell><Badge className={p.status === "pago" ? "bg-green-500/20" : "bg-yellow-500/20"}>{p.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Endereços</h3>
                  {enderecosCliente.length === 0 ? (
                    <p className="text-gray-400 text-sm">Nenhum endereço cadastrado.</p>
                  ) : (
                    <div className="space-y-2">
                      {enderecosCliente.map((e) => (
                        <div key={e.id} className="border border-gray-700 rounded p-3 text-sm">
                          <p>{e.rua}, {e.numero} {e.complemento}</p>
                          <p>{e.bairro}, {e.cidade} - {e.estado}</p>
                          <p>CEP: {formatarCEP(e.cep)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isClienteVIP(clienteSelecionado.id)) removerClienteVIP(clienteSelecionado.id)
                      else adicionarClienteVIP(clienteSelecionado.id)
                      carregar()
                    }}
                  >
                    {isClienteVIP(clienteSelecionado.id) ? "Remover VIP" : "Adicionar VIP"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isClienteBloqueado(clienteSelecionado.id)) desbloquearCliente(clienteSelecionado.id)
                      else bloquearCliente(clienteSelecionado.id)
                      carregar()
                    }}
                  >
                    {isClienteBloqueado(clienteSelecionado.id) ? "Desbloquear" : "Bloquear"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDialogCreditoOpen(true)}>
                    <CreditCard className="mr-1 h-4 w-4" /> Adicionar Crédito
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDialogSuporteOpen(true)}>
                    <LifeBuoy className="mr-1 h-4 w-4" /> Nova Solicitação Suporte
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Crédito */}
      <Dialog open={dialogCreditoOpen} onOpenChange={setDialogCreditoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Adicionar Crédito</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input type="number" step={0.01} value={formCredito.valor} onChange={(e) => setFormCredito((f) => ({ ...f, valor: parseFloat(e.target.value) || 0 }))} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={formCredito.origem} onValueChange={(v: any) => setFormCredito((f) => ({ ...f, origem: v }))}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="bonus">Bônus</SelectItem>
                  <SelectItem value="reembolso">Reembolso</SelectItem>
                  <SelectItem value="fidelidade">Fidelidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogCreditoOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (clienteSelecionado && formCredito.valor > 0) {
                adicionarCredito(clienteSelecionado.id, formCredito.valor, formCredito.origem)
                carregar()
                setDialogCreditoOpen(false)
              }
            }}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Suporte */}
      <Dialog open={dialogSuporteOpen} onOpenChange={setDialogSuporteOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Nova Solicitação de Suporte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assunto *</Label>
              <Input value={formSuporte.assunto} onChange={(e) => setFormSuporte((f) => ({ ...f, assunto: e.target.value }))} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Mensagem *</Label>
              <Textarea value={formSuporte.mensagem} onChange={(e) => setFormSuporte((f) => ({ ...f, mensagem: e.target.value }))} className="bg-background" rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={formSuporte.prioridade} onValueChange={(v: any) => setFormSuporte((f) => ({ ...f, prioridade: v }))}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogSuporteOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (clienteSelecionado && formSuporte.assunto.trim() && formSuporte.mensagem.trim()) {
                criarSolicitacaoSuporte({
                  clienteId: clienteSelecionado.id,
                  assunto: formSuporte.assunto,
                  mensagem: formSuporte.mensagem,
                  status: "aberto",
                  prioridade: formSuporte.prioridade,
                })
                carregar()
                setDialogSuporteOpen(false)
              }
            }}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Grupo */}
      <Dialog open={dialogGrupoOpen} onOpenChange={setDialogGrupoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Criar Grupo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formGrupo.nome} onChange={(e) => setFormGrupo((f) => ({ ...f, nome: e.target.value }))} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={formGrupo.descricao} onChange={(e) => setFormGrupo((f) => ({ ...f, descricao: e.target.value }))} className="bg-background" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogGrupoOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (formGrupo.nome.trim()) {
                criarGrupo(formGrupo)
                carregar()
                setDialogGrupoOpen(false)
                setFormGrupo({ nome: "", descricao: "" })
              }
            }}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
