"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  Truck,
  Package,
  MapPin,
  Clock,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Save,
  ExternalLink,
} from "lucide-react"
import {
  listarMetodosEnvio,
  salvarMetodoEnvio,
  excluirMetodoEnvio,
  getConfigCorreios,
  salvarConfigCorreios,
  listarTabelasFrete,
  salvarTabelaFrete,
  excluirTabelaFrete,
  listarTransportadoras,
  salvarTransportadora,
  excluirTransportadora,
  listarZonasEntrega,
  salvarZonaEntrega,
  excluirZonaEntrega,
  getPrazoEntregaPadrao,
  getConfigLogisticaReversa,
  salvarConfigLogisticaReversa,
  listarEtiquetas,
  registrarEtiqueta,
  type MetodoEnvio,
  type ConfigCorreios,
  type TabelaFrete,
  type Transportadora,
  type ZonaEntrega,
  type ConfigLogisticaReversa,
  type EtiquetaEnvio,
} from "@/lib/frete-logistica-store"
import { listarPedidosLoja, atualizarRastreamento, type PedidoLoja } from "@/lib/pedidos-loja-store"
import { formatarValor, formatarCEP } from "@/lib/formatadores"

export default function LojaFreteLogisticaPage() {
  const [metodos, setMetodos] = useState<MetodoEnvio[]>([])
  const [correios, setCorreios] = useState<ConfigCorreios | null>(null)
  const [tabelas, setTabelas] = useState<TabelaFrete[]>([])
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([])
  const [zonas, setZonas] = useState<ZonaEntrega[]>([])
  const [reversa, setReversa] = useState<ConfigLogisticaReversa | null>(null)
  const [etiquetas, setEtiquetas] = useState<EtiquetaEnvio[]>([])
  const [pedidosRastreio, setPedidosRastreio] = useState<PedidoLoja[]>([])
  const [abaAtiva, setAbaAtiva] = useState("metodos")
  const [prazoPadrao, setPrazoPadrao] = useState({ min: 1, max: 5 })

  // Diálogos
  const [dialogMetodoOpen, setDialogMetodoOpen] = useState(false)
  const [dialogTabelaOpen, setDialogTabelaOpen] = useState(false)
  const [dialogTransportadoraOpen, setDialogTransportadoraOpen] = useState(false)
  const [dialogZonaOpen, setDialogZonaOpen] = useState(false)
  const [dialogRastreioOpen, setDialogRastreioOpen] = useState(false)
  const [dialogEtiquetaOpen, setDialogEtiquetaOpen] = useState(false)

  const [editMetodo, setEditMetodo] = useState<MetodoEnvio | null>(null)
  const [editTabela, setEditTabela] = useState<TabelaFrete | null>(null)
  const [editTransportadora, setEditTransportadora] = useState<Transportadora | null>(null)
  const [editZona, setEditZona] = useState<ZonaEntrega | null>(null)

  const [formMetodo, setFormMetodo] = useState({
    nome: "",
    tipo: "correios" as MetodoEnvio["tipo"],
    ativo: true,
    prazoMin: 3,
    prazoMax: 10,
    valorFixo: 0,
    usaTabela: false,
    tabelaId: "",
    apiCorreios: false,
  })
  const [formTabela, setFormTabela] = useState({ nome: "", tipo: "peso" as TabelaFrete["tipo"], ativo: true, regras: [] as TabelaFrete["regras"] })
  const [formTransportadora, setFormTransportadora] = useState({ nome: "", codigo: "", urlRastreio: "", ativo: true })
  const [formZona, setFormZona] = useState({ nome: "", ceps: "" as string, prazoAdicional: 0, valorAdicional: 0, ativo: true })
  const [formRastreio, setFormRastreio] = useState({ pedidoId: "", codigo: "", metodoEnvio: "" })
  const [formEtiqueta, setFormEtiqueta] = useState({ pedidoId: "", codigoRastreio: "", transportadoraId: "" })

  const carregar = () => {
    setMetodos(listarMetodosEnvio())
    setCorreios(getConfigCorreios())
    setTabelas(listarTabelasFrete())
    setTransportadoras(listarTransportadoras())
    setZonas(listarZonasEntrega())
    setReversa(getConfigLogisticaReversa())
    setEtiquetas(listarEtiquetas())
    setPedidosRastreio(listarPedidosLoja().filter((p) => p.codigoRastreamento || p.statusLoja === "enviado" || p.statusLoja === "entregue"))
    setPrazoPadrao(getPrazoEntregaPadrao())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("frete-logistica-updated", h)
    window.addEventListener("pedidos-updated", h)
    return () => {
      window.removeEventListener("frete-logistica-updated", h)
      window.removeEventListener("pedidos-updated", h)
    }
  }, [])

  const abrirEditarMetodo = (m: MetodoEnvio) => {
    setEditMetodo(m)
    setFormMetodo({
      nome: m.nome,
      tipo: m.tipo,
      ativo: m.ativo,
      prazoMin: m.prazoMin,
      prazoMax: m.prazoMax,
      valorFixo: m.valorFixo ?? 0,
      usaTabela: m.usaTabela,
      tabelaId: m.tabelaId ?? "",
      apiCorreios: m.apiCorreios ?? false,
    })
    setDialogMetodoOpen(true)
  }

  const salvarMetodo = () => {
    salvarMetodoEnvio(
      editMetodo
        ? { ...editMetodo, ...formMetodo }
        : {
            nome: formMetodo.nome,
            tipo: formMetodo.tipo,
            ativo: formMetodo.ativo,
            prazoMin: formMetodo.prazoMin,
            prazoMax: formMetodo.prazoMax,
            valorFixo: formMetodo.valorFixo,
            usaTabela: formMetodo.usaTabela,
            tabelaId: formMetodo.tabelaId || undefined,
            apiCorreios: formMetodo.apiCorreios,
          }
    )
    setDialogMetodoOpen(false)
    setEditMetodo(null)
    setFormMetodo({ nome: "", tipo: "correios", ativo: true, prazoMin: 3, prazoMax: 10, valorFixo: 0, usaTabela: false, tabelaId: "", apiCorreios: false })
    carregar()
  }

  const salvarCorreios = () => {
    if (correios) {
      salvarConfigCorreios(correios)
      carregar()
    }
  }

  const salvarReversa = () => {
    if (reversa) {
      salvarConfigLogisticaReversa(reversa)
      carregar()
    }
  }

  const salvarRastreio = () => {
    if (formRastreio.pedidoId && formRastreio.codigo && formRastreio.metodoEnvio) {
      atualizarRastreamento(formRastreio.pedidoId, formRastreio.codigo, formRastreio.metodoEnvio, "Admin")
      setDialogRastreioOpen(false)
      setFormRastreio({ pedidoId: "", codigo: "", metodoEnvio: "" })
      carregar()
    }
  }

  const salvarEtiqueta = () => {
    if (formEtiqueta.pedidoId && formEtiqueta.codigoRastreio && formEtiqueta.transportadoraId) {
      registrarEtiqueta({
        pedidoId: formEtiqueta.pedidoId,
        codigoRastreio: formEtiqueta.codigoRastreio,
        transportadoraId: formEtiqueta.transportadoraId,
      })
      setDialogEtiquetaOpen(false)
      setFormEtiqueta({ pedidoId: "", codigoRastreio: "", transportadoraId: "" })
      carregar()
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Truck className="h-8 w-8 text-[#FFB800]" />
        Frete e Logística
      </h1>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-6 bg-[#171923] border border-gray-800">
          <TabsTrigger value="metodos">Métodos de Envio</TabsTrigger>
          <TabsTrigger value="correios">API Correios</TabsTrigger>
          <TabsTrigger value="tabelas">Tabelas de Frete</TabsTrigger>
          <TabsTrigger value="transportadoras">Transportadoras</TabsTrigger>
          <TabsTrigger value="rastreamento">Rastreamento</TabsTrigger>
          <TabsTrigger value="etiquetas">Etiquetas</TabsTrigger>
          <TabsTrigger value="zonas">Zonas de Entrega</TabsTrigger>
          <TabsTrigger value="prazo">Prazo de Entrega</TabsTrigger>
          <TabsTrigger value="reversa">Logística Reversa</TabsTrigger>
        </TabsList>

        <TabsContent value="metodos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Métodos de Envio</CardTitle>
                <CardDescription>Cadastre correios, transportadora, retirada ou digital.</CardDescription>
              </div>
              <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { setEditMetodo(null); setFormMetodo({ nome: "", tipo: "correios", ativo: true, prazoMin: 3, prazoMax: 10, valorFixo: 0, usaTabela: false, tabelaId: "", apiCorreios: false }); setDialogMetodoOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Novo
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Prazo</TableHead>
                    <TableHead className="text-gray-300">Valor fixo</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                    <TableHead className="text-gray-300 w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metodos.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-white">{m.nome}</TableCell>
                      <TableCell><Badge variant="outline">{m.tipo}</Badge></TableCell>
                      <TableCell className="text-gray-400">{m.prazoMin}-{m.prazoMax} dias</TableCell>
                      <TableCell className="text-gray-400">{m.valorFixo != null ? formatarValor(m.valorFixo) : "—"}</TableCell>
                      <TableCell><Switch checked={m.ativo} disabled /></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => abrirEditarMetodo(m)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-400" onClick={() => { excluirMetodoEnvio(m.id); carregar(); }}><Trash2 className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {metodos.length === 0 && <p className="text-gray-500 py-4">Nenhum método cadastrado.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correios">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Configuração de Frete API Correios</CardTitle>
              <CardDescription>CEP de origem, códigos de serviço SEDEX/PAC e contrato.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {correios && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Usar API Correios</Label>
                    <Switch checked={correios.ativo} onCheckedChange={(v) => setCorreios({ ...correios, ativo: v })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400">CEP de origem</Label>
                      <Input value={correios.cepOrigem} onChange={(e) => setCorreios({ ...correios, cepOrigem: formatarCEP(e.target.value) })} placeholder="00000-000" className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-gray-400">Código SEDEX</Label>
                      <Input value={correios.codigoServicoSedex} onChange={(e) => setCorreios({ ...correios, codigoServicoSedex: e.target.value })} className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-gray-400">Código PAC</Label>
                      <Input value={correios.codigoServicoPac} onChange={(e) => setCorreios({ ...correios, codigoServicoPac: e.target.value })} className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-gray-400">Contrato</Label>
                      <Input value={correios.contrato} onChange={(e) => setCorreios({ ...correios, contrato: e.target.value })} className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-gray-400">Senha</Label>
                      <Input type="password" value={correios.senha} onChange={(e) => setCorreios({ ...correios, senha: e.target.value })} className="bg-background" />
                    </div>
                  </div>
                  <Button onClick={() => { salvarCorreios(); toast.success("Salvo!"); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tabelas">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Tabelas de Frete</CardTitle>
                <CardDescription>Regras por peso, valor ou valor fixo.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setEditTabela(null); setFormTabela({ nome: "", tipo: "peso", ativo: true, regras: [] }); setDialogTabelaOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Nova tabela
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Regras</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tabelas.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-white">{t.nome}</TableCell>
                      <TableCell><Badge variant="outline">{t.tipo}</Badge></TableCell>
                      <TableCell className="text-gray-400">{t.regras.length} regra(s)</TableCell>
                      <TableCell><Switch checked={t.ativo} disabled /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {tabelas.length === 0 && <p className="text-gray-500 py-4">Nenhuma tabela cadastrada.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transportadoras">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Integração com Transportadoras</CardTitle>
                <CardDescription>Nome, código e URL de rastreio.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setEditTransportadora(null); setFormTransportadora({ nome: "", codigo: "", urlRastreio: "", ativo: true }); setDialogTransportadoraOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Nova
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Código</TableHead>
                    <TableHead className="text-gray-300">URL Rastreio</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transportadoras.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-white">{t.nome}</TableCell>
                      <TableCell className="text-gray-400 font-mono">{t.codigo}</TableCell>
                      <TableCell className="text-gray-400 text-sm truncate max-w-[200px]">{t.urlRastreio || "—"}</TableCell>
                      <TableCell><Switch checked={t.ativo} disabled /></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => { setEditTransportadora(t); setFormTransportadora({ nome: t.nome, codigo: t.codigo, urlRastreio: t.urlRastreio, ativo: t.ativo }); setDialogTransportadoraOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-400" onClick={() => { excluirTransportadora(t.id); carregar(); }}><Trash2 className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {transportadoras.length === 0 && <p className="text-gray-500 py-4">Nenhuma transportadora cadastrada.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rastreamento">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Rastreamento</CardTitle>
                <CardDescription>Pedidos enviados e códigos de rastreio.</CardDescription>
              </div>
              <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { setFormRastreio({ pedidoId: "", codigo: "", metodoEnvio: "" }); setDialogRastreioOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar rastreio
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Pedido</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Código</TableHead>
                    <TableHead className="text-gray-300">Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosRastreio.slice(0, 50).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-white font-mono">{p.id}</TableCell>
                      <TableCell><Badge className={p.statusLoja === "entregue" ? "bg-green-500/20" : "bg-amber-500/20"}>{p.statusLoja}</Badge></TableCell>
                      <TableCell className="text-gray-300 font-mono">{p.codigoRastreamento || "—"}</TableCell>
                      <TableCell className="text-gray-400">{p.metodoEnvio || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pedidosRastreio.length === 0 && <p className="text-gray-500 py-4">Nenhum pedido com rastreio.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="etiquetas">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Etiquetas de Envio</CardTitle>
                <CardDescription>Registro de etiquetas geradas por pedido.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setFormEtiqueta({ pedidoId: "", codigoRastreio: "", transportadoraId: "" }); setDialogEtiquetaOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Registrar etiqueta
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Pedido</TableHead>
                    <TableHead className="text-gray-300">Código</TableHead>
                    <TableHead className="text-gray-300">Transportadora</TableHead>
                    <TableHead className="text-gray-300">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {etiquetas.slice(0, 50).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-white font-mono">{e.pedidoId}</TableCell>
                      <TableCell className="font-mono text-gray-300">{e.codigoRastreio}</TableCell>
                      <TableCell className="text-gray-400">{transportadoras.find((t) => t.id === e.transportadoraId)?.nome || e.transportadoraId}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{new Date(e.geradaEm).toLocaleString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {etiquetas.length === 0 && <p className="text-gray-500 py-4">Nenhuma etiqueta registrada.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zonas">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Zonas de Entrega</CardTitle>
                <CardDescription>CEPs ou faixas com prazo e valor adicionais.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setEditZona(null); setFormZona({ nome: "", ceps: "", prazoAdicional: 0, valorAdicional: 0, ativo: true }); setDialogZonaOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Nova zona
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Prazo extra (dias)</TableHead>
                    <TableHead className="text-gray-300">Valor extra</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zonas.map((z) => (
                    <TableRow key={z.id}>
                      <TableCell className="text-white">{z.nome}</TableCell>
                      <TableCell className="text-gray-400">{z.prazoAdicional}</TableCell>
                      <TableCell className="text-gray-400">{formatarValor(z.valorAdicional)}</TableCell>
                      <TableCell><Switch checked={z.ativo} disabled /></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => { setEditZona(z); setFormZona({ nome: z.nome, ceps: (z.ceps || []).join(", "), prazoAdicional: z.prazoAdicional, valorAdicional: z.valorAdicional, ativo: z.ativo }); setDialogZonaOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-400" onClick={() => { excluirZonaEntrega(z.id); carregar(); }}><Trash2 className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {zonas.length === 0 && <p className="text-gray-500 py-4">Nenhuma zona cadastrada.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prazo">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Clock className="h-5 w-5" /> Prazo de Entrega</CardTitle>
              <CardDescription>Prazo mínimo e máximo exibido na loja (calculado a partir dos métodos de envio ativos).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div>
                  <Label className="text-gray-400">Mínimo (dias)</Label>
                  <Input type="number" min={1} value={prazoPadrao.min} readOnly className="bg-black/30 w-24" />
                </div>
                <div>
                  <Label className="text-gray-400">Máximo (dias)</Label>
                  <Input type="number" min={1} value={prazoPadrao.max} readOnly className="bg-black/30 w-24" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Valores derivados dos métodos de envio ativos. Cadastre métodos na aba Métodos de Envio.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reversa">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Logística Reversa</CardTitle>
              <CardDescription>Devoluções e trocas: prazo para solicitação e instruções.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reversa && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Habilitar logística reversa</Label>
                    <Switch checked={reversa.habilitado} onCheckedChange={(v) => setReversa({ ...reversa, habilitado: v })} />
                  </div>
                  <div>
                    <Label className="text-gray-400">Prazo para solicitação (dias após entrega)</Label>
                    <Input type="number" min={0} value={reversa.prazoSolicitacaoDias} onChange={(e) => setReversa({ ...reversa, prazoSolicitacaoDias: parseInt(e.target.value, 10) || 0 })} className="bg-background w-32" />
                  </div>
                  <div>
                    <Label className="text-gray-400">Instruções para o cliente</Label>
                    <Textarea value={reversa.instrucoes} onChange={(e) => setReversa({ ...reversa, instrucoes: e.target.value })} rows={4} className="bg-background" placeholder="Como solicitar devolução..." />
                  </div>
                  <Button onClick={() => { salvarReversa(); toast.success("Salvo!"); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Método de Envio */}
      <Dialog open={dialogMetodoOpen} onOpenChange={setDialogMetodoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{editMetodo ? "Editar" : "Novo"} método de envio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Nome</Label>
              <Input value={formMetodo.nome} onChange={(e) => setFormMetodo({ ...formMetodo, nome: e.target.value })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">Tipo</Label>
              <Select value={formMetodo.tipo} onValueChange={(v: MetodoEnvio["tipo"]) => setFormMetodo({ ...formMetodo, tipo: v })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="correios">Correios</SelectItem>
                  <SelectItem value="transportadora">Transportadora</SelectItem>
                  <SelectItem value="retirada">Retirada</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Prazo mín. (dias)</Label>
                <Input type="number" min={1} value={formMetodo.prazoMin} onChange={(e) => setFormMetodo({ ...formMetodo, prazoMin: parseInt(e.target.value, 10) || 1 })} className="bg-background" />
              </div>
              <div>
                <Label className="text-gray-400">Prazo máx. (dias)</Label>
                <Input type="number" min={1} value={formMetodo.prazoMax} onChange={(e) => setFormMetodo({ ...formMetodo, prazoMax: parseInt(e.target.value, 10) || 1 })} className="bg-background" />
              </div>
            </div>
            <div>
              <Label className="text-gray-400">Valor fixo (R$)</Label>
              <Input type="number" min={0} step={0.01} value={formMetodo.valorFixo} onChange={(e) => setFormMetodo({ ...formMetodo, valorFixo: parseFloat(e.target.value) || 0 })} className="bg-background" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formMetodo.usaTabela} onCheckedChange={(v) => setFormMetodo({ ...formMetodo, usaTabela: v })} />
              <Label className="text-gray-400">Usar tabela de frete</Label>
            </div>
            {formMetodo.usaTabela && (
              <div>
                <Label className="text-gray-400">Tabela</Label>
                <Select value={formMetodo.tabelaId || "nenhum"} onValueChange={(v) => setFormMetodo({ ...formMetodo, tabelaId: v === "nenhum" ? "" : v })}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum" disabled>Selecione (opcional)</SelectItem>
                    {tabelas.map((t) => (<SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch checked={formMetodo.apiCorreios} onCheckedChange={(v) => setFormMetodo({ ...formMetodo, apiCorreios: v })} />
              <Label className="text-gray-400">Usar API Correios</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formMetodo.ativo} onCheckedChange={(v) => setFormMetodo({ ...formMetodo, ativo: v })} />
              <Label className="text-gray-400">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMetodoOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={salvarMetodo}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Transportadora */}
      <Dialog open={dialogTransportadoraOpen} onOpenChange={setDialogTransportadoraOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">{editTransportadora ? "Editar" : "Nova"} transportadora</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Nome</Label>
              <Input value={formTransportadora.nome} onChange={(e) => setFormTransportadora({ ...formTransportadora, nome: e.target.value })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">Código</Label>
              <Input value={formTransportadora.codigo} onChange={(e) => setFormTransportadora({ ...formTransportadora, codigo: e.target.value })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">URL Rastreio (use {"{codigo}"} para o código)</Label>
              <Input value={formTransportadora.urlRastreio} onChange={(e) => setFormTransportadora({ ...formTransportadora, urlRastreio: e.target.value })} placeholder="https://..." className="bg-background" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formTransportadora.ativo} onCheckedChange={(v) => setFormTransportadora({ ...formTransportadora, ativo: v })} />
              <Label className="text-gray-400">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogTransportadoraOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => {
              if (editTransportadora) salvarTransportadora({ ...editTransportadora, ...formTransportadora })
              else salvarTransportadora(formTransportadora)
              setDialogTransportadoraOpen(false)
              carregar()
            }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Zona */}
      <Dialog open={dialogZonaOpen} onOpenChange={setDialogZonaOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">{editZona ? "Editar" : "Nova"} zona de entrega</DialogTitle>
            <DialogDescription>CEPs separados por vírgula ou faixas (ex: 01000-000 a 01999-999).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Nome</Label>
              <Input value={formZona.nome} onChange={(e) => setFormZona({ ...formZona, nome: e.target.value })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">CEPs ou faixas</Label>
              <Input value={formZona.ceps} onChange={(e) => setFormZona({ ...formZona, ceps: e.target.value })} placeholder="01000-000, 02000-000" className="bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Prazo adicional (dias)</Label>
                <Input type="number" min={0} value={formZona.prazoAdicional} onChange={(e) => setFormZona({ ...formZona, prazoAdicional: parseInt(e.target.value, 10) || 0 })} className="bg-background" />
              </div>
              <div>
                <Label className="text-gray-400">Valor adicional (R$)</Label>
                <Input type="number" min={0} step={0.01} value={formZona.valorAdicional} onChange={(e) => setFormZona({ ...formZona, valorAdicional: parseFloat(e.target.value) || 0 })} className="bg-background" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formZona.ativo} onCheckedChange={(v) => setFormZona({ ...formZona, ativo: v })} />
              <Label className="text-gray-400">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogZonaOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => {
              const ceps = formZona.ceps.split(",").map((s) => s.trim()).filter(Boolean)
              if (editZona) salvarZonaEntrega({ ...editZona, nome: formZona.nome, ceps, prazoAdicional: formZona.prazoAdicional, valorAdicional: formZona.valorAdicional, ativo: formZona.ativo })
              else salvarZonaEntrega({ nome: formZona.nome, ceps, prazoAdicional: formZona.prazoAdicional, valorAdicional: formZona.valorAdicional, ativo: formZona.ativo })
              setDialogZonaOpen(false)
              carregar()
            }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rastreio */}
      <Dialog open={dialogRastreioOpen} onOpenChange={setDialogRastreioOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar código de rastreamento</DialogTitle>
            <DialogDescription>O pedido será marcado como enviado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">ID do pedido</Label>
              <Select value={formRastreio.pedidoId || "vazio"} onValueChange={(v) => setFormRastreio({ ...formRastreio, pedidoId: v === "vazio" ? "" : v })}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione o pedido" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vazio" disabled>Selecione o pedido</SelectItem>
                  {listarPedidosLoja()
                    .filter((p) => p.status === "pago" && p.statusLoja !== "enviado" && p.statusLoja !== "entregue")
                    .slice(0, 100)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.id} - {formatarValor(p.valorTotal)}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-400">Código de rastreio</Label>
              <Input value={formRastreio.codigo} onChange={(e) => setFormRastreio({ ...formRastreio, codigo: e.target.value })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">Método de envio</Label>
              <Input value={formRastreio.metodoEnvio} onChange={(e) => setFormRastreio({ ...formRastreio, metodoEnvio: e.target.value })} placeholder="Correios, Jadlog..." className="bg-background" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogRastreioOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={salvarRastreio} disabled={!formRastreio.pedidoId || formRastreio.pedidoId === "vazio" || !formRastreio.codigo || !formRastreio.metodoEnvio}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tabela de Frete */}
      <Dialog open={dialogTabelaOpen} onOpenChange={setDialogTabelaOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">{editTabela ? "Editar" : "Nova"} tabela de frete</DialogTitle>
            <DialogDescription>Regras por peso (kg), valor (R$) ou fixo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Nome</Label>
              <Input value={formTabela.nome} onChange={(e) => setFormTabela({ ...formTabela, nome: e.target.value })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">Tipo</Label>
              <Select value={formTabela.tipo} onValueChange={(v: TabelaFrete["tipo"]) => setFormTabela({ ...formTabela, tipo: v })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="peso">Por peso (kg)</SelectItem>
                  <SelectItem value="valor">Por valor (R$)</SelectItem>
                  <SelectItem value="fixo">Valor fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formTabela.ativo} onCheckedChange={(v) => setFormTabela({ ...formTabela, ativo: v })} />
              <Label className="text-gray-400">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogTabelaOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => {
              if (editTabela) salvarTabelaFrete({ ...editTabela, nome: formTabela.nome, tipo: formTabela.tipo, ativo: formTabela.ativo })
              else salvarTabelaFrete({ nome: formTabela.nome, tipo: formTabela.tipo, ativo: formTabela.ativo, regras: formTabela.regras.length ? formTabela.regras : [{ min: 0, max: 99999, valor: 0, prazo: 5 }] })
              setDialogTabelaOpen(false)
              carregar()
            }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Etiqueta */}
      <Dialog open={dialogEtiquetaOpen} onOpenChange={setDialogEtiquetaOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Registrar etiqueta de envio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">ID do pedido</Label>
              <Input value={formEtiqueta.pedidoId} onChange={(e) => setFormEtiqueta({ ...formEtiqueta, pedidoId: e.target.value })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">Código de rastreio</Label>
              <Input value={formEtiqueta.codigoRastreio} onChange={(e) => setFormEtiqueta({ ...formEtiqueta, codigoRastreio: e.target.value })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">Transportadora</Label>
              <Select value={formEtiqueta.transportadoraId || "vazio"} onValueChange={(v) => setFormEtiqueta({ ...formEtiqueta, transportadoraId: v === "vazio" ? "" : v })}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vazio" disabled>Selecione a transportadora</SelectItem>
                  {transportadoras.map((t) => (<SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEtiquetaOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={salvarEtiqueta} disabled={!formEtiqueta.pedidoId || !formEtiqueta.codigoRastreio || !formEtiqueta.transportadoraId || formEtiqueta.transportadoraId === "vazio"}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
