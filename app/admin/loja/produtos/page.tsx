"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Store,
  Plus,
  Pencil,
  Trash2,
  Archive,
  FileText,
  Package,
  Layers,
  Tags,
  Boxes,
  Link2,
  Search,
  Star,
  Eye,
  EyeOff,
} from "lucide-react"
import { formatarValor } from "@/lib/formatadores"
import {
  getConfigLoja,
  salvarConfigLoja,
  listarProdutos,
  salvarProduto,
  excluirProduto,
  type ProdutoLoja,
  type ConfigLoja,
  type IconeLoja,
  type TipoProdutoLoja,
  ICONES_MAP,
} from "@/lib/loja-store"

const ICONE_OPCOES: IconeLoja[] = ["Ticket", "Gift", "Zap", "Gem", "Star", "ShoppingBag"]
const TIPO_PRODUTO_OPCOES: { value: TipoProdutoLoja; label: string }[] = [
  { value: "giro_roleta", label: "Giro na Roleta" },
  { value: "caixa", label: "Caixa Premiada" },
  { value: "cota", label: "Cota" },
  { value: "desconto", label: "Desconto/Cupom" },
  { value: "pack", label: "Pack" },
  { value: "emblema", label: "Emblema" },
  { value: "outro", label: "Outro" },
]

interface ProdutoExpandido extends ProdutoLoja {
  rascunho?: boolean
  arquivado?: boolean
  digital?: boolean
  variacao?: boolean
  sku?: string
  peso?: number
  altura?: number
  largura?: number
  comprimento?: number
  estoque?: number
  estoqueMinimo?: number
  marca?: string
  tags?: string[]
  categoria?: string
  subcategoria?: string
  colecao?: string
  seoTitle?: string
  seoDescription?: string
  seoSlug?: string
  avaliacoes?: Array<{ id: string; nome: string; rating: number; comentario: string; data: string }>
}

export default function LojaProdutosPage() {
  const [config, setConfig] = useState<ConfigLoja>(getConfigLoja())
  const [produtos, setProdutos] = useState<ProdutoExpandido[]>([])
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativos" | "inativos" | "rascunho" | "arquivados">("todos")
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "digitais" | "fisicos" | "variaveis">("todos")
  const [busca, setBusca] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<ProdutoExpandido | null>(null)
  const [abaAtiva, setAbaAtiva] = useState("listagem")
  const [form, setForm] = useState<Partial<ProdutoExpandido>>({
    nome: "",
    descricao: "",
    precoPontos: 0,
    precoReais: 0,
    icone: "Ticket",
    categoria: "geral",
    tipoProduto: "outro",
    destaque: false,
    ativo: true,
    ordem: 0,
    rascunho: false,
    arquivado: false,
    digital: false,
    variacao: false,
    estoque: 0,
    estoqueMinimo: 0,
  })

  const carregar = () => {
    setConfig(getConfigLoja())
    const todos = listarProdutos() as ProdutoExpandido[]
    setProdutos(todos)
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("loja-updated", h)
    return () => window.removeEventListener("loja-updated", h)
  }, [])

  const produtosFiltrados = produtos.filter((p) => {
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase()) && !p.descricao?.toLowerCase().includes(busca.toLowerCase())) return false
    if (filtroStatus === "ativos" && !p.ativo) return false
    if (filtroStatus === "inativos" && p.ativo) return false
    if (filtroStatus === "rascunho" && !p.rascunho) return false
    if (filtroStatus === "arquivados" && !p.arquivado) return false
    if (filtroTipo === "digitais" && !p.digital) return false
    if (filtroTipo === "fisicos" && p.digital) return false
    if (filtroTipo === "variaveis" && !p.variacao) return false
    return true
  })

  const salvarConfig = () => {
    salvarConfigLoja(config)
    carregar()
  }

  const abrirNovo = () => {
    setEditando(null)
    setForm({
      nome: "",
      descricao: "",
      precoPontos: 0,
      precoReais: 0,
      icone: "Ticket",
      categoria: "geral",
      tipoProduto: "outro",
      destaque: false,
      ativo: true,
      ordem: produtos.length,
      rascunho: false,
      arquivado: false,
      digital: false,
      variacao: false,
      estoque: 0,
      estoqueMinimo: 0,
    })
    setDialogOpen(true)
  }

  const abrirEditar = (p: ProdutoExpandido) => {
    setEditando(p)
    setForm({ ...p })
    setDialogOpen(true)
  }

  const salvarProdutoHandler = () => {
    if (!form.nome?.trim()) return
    const payload = {
      ...form,
      precoPontos: Number(form.precoPontos) || 0,
      precoReais: Number(form.precoReais) || 0,
      ordem: form.ordem ?? produtos.length,
    } as ProdutoExpandido
    if (editando) (payload as ProdutoExpandido).id = editando.id
    salvarProduto(payload as ProdutoLoja)
    setDialogOpen(false)
    carregar()
  }

  const remover = (id: string) => {
    if (confirm("Excluir este produto?")) {
      excluirProduto(id)
      carregar()
    }
  }

  const arquivar = (id: string) => {
    const p = produtos.find((pr) => pr.id === id)
    if (p) {
      salvarProduto({ ...p, arquivado: true, ativo: false } as ProdutoLoja)
      carregar()
    }
  }

  const toggleStatus = (id: string) => {
    const p = produtos.find((pr) => pr.id === id)
    if (p) {
      salvarProduto({ ...p, ativo: !p.ativo } as ProdutoLoja)
      carregar()
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Store className="h-8 w-8" />
          Gestão de Produtos
        </h1>
        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" /> Criar Produto
        </Button>
      </div>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="listagem">Listagem</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="atributos">Atributos</TabsTrigger>
          <TabsTrigger value="kits">Kits/Combos</TabsTrigger>
          <TabsTrigger value="relacionados">Relacionados</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="listagem">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white">Listagem de Produtos</CardTitle>
                  <CardDescription>Gerencie todos os produtos da loja</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-8 w-64 bg-background"
                    />
                  </div>
                  <Select value={filtroStatus} onValueChange={(v: any) => setFiltroStatus(v)}>
                    <SelectTrigger className="w-40 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativos">Ativos</SelectItem>
                      <SelectItem value="inativos">Inativos</SelectItem>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="arquivados">Arquivados</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filtroTipo} onValueChange={(v: any) => setFiltroTipo(v)}>
                    <SelectTrigger className="w-40 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="digitais">Digitais</SelectItem>
                      <SelectItem value="fisicos">Físicos</SelectItem>
                      <SelectItem value="variaveis">Variáveis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {produtosFiltrados.length === 0 ? (
                <div className="text-gray-400 py-8 text-center">
                  <p>Nenhum produto encontrado.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Nome</TableHead>
                      <TableHead className="text-gray-300">Tipo</TableHead>
                      <TableHead className="text-gray-300">Preço</TableHead>
                      <TableHead className="text-gray-300">Estoque</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosFiltrados.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-2">
                            {p.destaque && <Star className="h-4 w-4 text-[#FFB800]" />}
                            {p.rascunho && <FileText className="h-4 w-4 text-gray-500" />}
                            {p.arquivado && <Archive className="h-4 w-4 text-gray-500" />}
                            {p.digital && <Package className="h-4 w-4 text-blue-400" />}
                            {p.variacao && <Layers className="h-4 w-4 text-purple-400" />}
                            {p.nome}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {TIPO_PRODUTO_OPCOES.find((t) => t.value === p.tipoProduto)?.label || "—"}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {p.precoReais > 0 ? formatarValor(p.precoReais) : `${p.precoPontos} pts`}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {p.digital ? "∞" : p.estoque ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={p.ativo ? "default" : "secondary"}>
                              {p.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                            {p.rascunho && <Badge variant="outline">Rascunho</Badge>}
                            {p.arquivado && <Badge variant="outline">Arquivado</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => toggleStatus(p.id)}>
                              {p.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => abrirEditar(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => arquivar(p.id)}>
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => remover(p.id)}>
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Categorias, Subcategorias, Coleções e Marcas</CardTitle>
              <CardDescription>Organize seus produtos por categorias e marcas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Categorias</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Nova categoria" className="bg-background" />
                        <Button size="sm">Adicionar</Button>
                      </div>
                      <div className="text-sm text-gray-400">Categorias: Digital, Físico, Serviços</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Subcategorias</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Select>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="digital">Digital</SelectItem>
                            <SelectItem value="fisico">Físico</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Nova subcategoria" className="bg-background" />
                        <Button size="sm">Adicionar</Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Coleções</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Nova coleção" className="bg-background" />
                        <Button size="sm">Adicionar</Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Marcas</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Nova marca" className="bg-background" />
                        <Button size="sm">Adicionar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atributos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Gestão de Atributos e Variações</CardTitle>
              <CardDescription>Configure atributos como tamanho, cor, etc.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Atributos</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Nome do atributo (ex: Tamanho)" className="bg-background" />
                      <Input placeholder="Valores (ex: P, M, G)" className="bg-background" />
                      <Button size="sm">Adicionar</Button>
                    </div>
                    <div className="text-sm text-gray-400">Atributos: Tamanho, Cor, Material</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Variações</h3>
                  <div className="text-sm text-gray-400">
                    Configure variações de produtos na edição do produto individual.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kits">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Kits / Combos</CardTitle>
              <CardDescription>Crie pacotes promocionais com múltiplos produtos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <Boxes className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Funcionalidade de kits/combos em desenvolvimento.</p>
                <p className="text-sm mt-2">Você pode criar produtos do tipo &quot;Pack&quot; para combos simples.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relacionados">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Produtos Relacionados e Cross-sell / Upsell</CardTitle>
              <CardDescription>Sugira produtos complementares aos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <Link2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Configure produtos relacionados na edição individual de cada produto.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avaliacoes">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Avaliações de Produtos</CardTitle>
              <CardDescription>Gerencie e modere avaliações dos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Sistema de avaliações em desenvolvimento.</p>
                <p className="text-sm mt-2">As avaliações serão exibidas automaticamente quando implementadas.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar produto" : "Criar produto"}</DialogTitle>
            <DialogDescription>
              Preencha os dados do produto. Produtos digitais não requerem estoque físico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={form.nome ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Giro na Roleta"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={form.sku ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  placeholder="SKU-001"
                  className="bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem / Foto</Label>
              <Input
                value={form.imagemUrl ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, imagemUrl: e.target.value }))}
                placeholder="https://exemplo.com/imagem.jpg"
                className="bg-background"
                type="url"
              />
              <p className="text-xs text-gray-500">Cole a URL de uma imagem do produto (para produtos físicos)</p>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.descricao ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Descrição detalhada do produto"
                className="bg-background"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Preço (pontos)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.precoPontos ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, precoPontos: parseInt(e.target.value, 10) || 0 }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Preço em R$</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.precoReais ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, precoReais: parseFloat(e.target.value) || 0 }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.tipoProduto ?? "outro"}
                  onValueChange={(v) => setForm((f) => ({ ...f, tipoProduto: v as TipoProdutoLoja }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_PRODUTO_OPCOES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={form.categoria ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                  placeholder="Ex: Jogos"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Subcategoria</Label>
                <Input
                  value={form.subcategoria ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, subcategoria: e.target.value }))}
                  placeholder="Ex: Roletas"
                  className="bg-background"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input
                  value={form.marca ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Coleção</Label>
                <Input
                  value={form.colecao ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, colecao: e.target.value }))}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estoque</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.estoque ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, estoque: parseInt(e.target.value, 10) || 0 }))}
                  className="bg-background"
                  disabled={form.digital}
                />
              </div>
              <div className="space-y-2">
                <Label>Estoque Mínimo</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.estoqueMinimo ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, estoqueMinimo: parseInt(e.target.value, 10) || 0 }))}
                  className="bg-background"
                  disabled={form.digital}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input
                  value={form.seoTitle ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>SEO Slug</Label>
                <Input
                  value={form.seoSlug ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, seoSlug: e.target.value }))}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>SEO Description</Label>
              <Textarea
                value={form.seoDescription ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                className="bg-background"
                rows={2}
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.destaque ?? false}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, destaque: v }))}
                />
                <Label>Destaque</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.ativo ?? true}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, ativo: v }))}
                />
                <Label>Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.rascunho ?? false}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, rascunho: v }))}
                />
                <Label>Rascunho</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.digital ?? false}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, digital: v, estoque: v ? undefined : form.estoque }))}
                />
                <Label>Produto Digital</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.variacao ?? false}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, variacao: v }))}
                />
                <Label>Produto Variável</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarProdutoHandler} disabled={!form.nome?.trim()}>
              {editando ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
