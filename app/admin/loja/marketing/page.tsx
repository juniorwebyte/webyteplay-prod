"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
  Megaphone,
  Tag,
  Percent,
  Radio,
  Image,
  MessageSquare,
  FileText,
  Mail,
  Zap,
  Users,
  Repeat,
  UserPlus,
  Gift,
  Share2,
  Search,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Save,
} from "lucide-react"
import {
  listarCupons,
  salvarCupom,
  listarPromocoes,
  salvarPromocao,
  listarCampanhas,
  salvarCampanha,
  listarBanners,
  salvarBanner,
  listarPopups,
  salvarPopup,
  listarLandings,
  salvarLanding,
  listarSegmentos,
  salvarSegmento,
  listarAfiliados,
  salvarAfiliado,
  getConfigCashback,
  salvarConfigCashback,
  getConfigIndicacao,
  salvarConfigIndicacao,
  getConfigSEO,
  salvarConfigSEO,
  listarPostsBlog,
  salvarPostBlog,
  type Cupom,
  type Promocao,
  type Campanha,
  type Banner,
  type Popup,
  type LandingPage,
  type Segmento,
  type Afiliado,
  type ConfigCashback,
  type ConfigIndicacao,
  type ConfigSEO,
  type PostBlog,
} from "@/lib/marketing-loja-store"
import { formatarValor } from "@/lib/formatadores"

export default function LojaMarketingPage() {
  const [abaAtiva, setAbaAtiva] = useState("cupons")
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [promocoes, setPromocoes] = useState<Promocao[]>([])
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [popups, setPopups] = useState<Popup[]>([])
  const [landings, setLandings] = useState<LandingPage[]>([])
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [afiliados, setAfiliados] = useState<Afiliado[]>([])
  const [cashback, setCashback] = useState<ConfigCashback | null>(null)
  const [indicacao, setIndicacao] = useState<ConfigIndicacao | null>(null)
  const [seo, setSeo] = useState<ConfigSEO | null>(null)
  const [posts, setPosts] = useState<PostBlog[]>([])

  const [dialogCupomOpen, setDialogCupomOpen] = useState(false)
  const [dialogPromoOpen, setDialogPromoOpen] = useState(false)
  const [dialogCampanhaOpen, setDialogCampanhaOpen] = useState(false)
  const [dialogBannerOpen, setDialogBannerOpen] = useState(false)
  const [dialogPopupOpen, setDialogPopupOpen] = useState(false)
  const [dialogLandingOpen, setDialogLandingOpen] = useState(false)
  const [dialogSegmentoOpen, setDialogSegmentoOpen] = useState(false)
  const [dialogAfiliadoOpen, setDialogAfiliadoOpen] = useState(false)
  const [dialogPostOpen, setDialogPostOpen] = useState(false)

  const [editCupom, setEditCupom] = useState<Cupom | null>(null)
  const [formCupom, setFormCupom] = useState({ codigo: "", tipo: "percentual" as Cupom["tipo"], valor: 0, valorMinimo: 0, maxUso: 0, ativo: true, validade: "" })
  const [formPromo, setFormPromo] = useState({ nome: "", tipo: "preco" as Promocao["tipo"], valor: 0, ativo: true, inicio: "", fim: "" })
  const [formCampanha, setFormCampanha] = useState({ nome: "", canal: "email" as Campanha["canal"], segmento: "", ativo: true, inicio: "", fim: "" })
  const [formBanner, setFormBanner] = useState({ titulo: "", imagem: "", link: "", posicao: "home_top" as Banner["posicao"], ativo: true, ordem: 0 })
  const [formPopup, setFormPopup] = useState({ titulo: "", conteudo: "", gatilho: "entrada" as Popup["gatilho"], valorGatilho: 0, ativo: true, inicio: "", fim: "" })
  const [formLanding, setFormLanding] = useState({ slug: "", titulo: "", conteudo: "", metaDescricao: "", ativo: true })
  const [formSegmento, setFormSegmento] = useState({ nome: "", regras: [] as Segmento["regras"], ativo: true })
  const [formAfiliado, setFormAfiliado] = useState({ nome: "", email: "", codigo: "", comissao: 0, ativo: true })
  const [formPost, setFormPost] = useState({ titulo: "", slug: "", conteudo: "", resumo: "", imagem: "", publicado: false })

  const carregar = () => {
    setCupons(listarCupons())
    setPromocoes(listarPromocoes())
    setCampanhas(listarCampanhas())
    setBanners(listarBanners())
    setPopups(listarPopups())
    setLandings(listarLandings())
    setSegmentos(listarSegmentos())
    setAfiliados(listarAfiliados())
    setCashback(getConfigCashback())
    setIndicacao(getConfigIndicacao())
    setSeo(getConfigSEO())
    setPosts(listarPostsBlog())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("marketing-loja-updated", h)
    return () => window.removeEventListener("marketing-loja-updated", h)
  }, [])

  const salvarCupomHandler = () => {
    if (editCupom) salvarCupom({ ...editCupom, ...formCupom })
    else salvarCupom(formCupom)
    setDialogCupomOpen(false)
    setEditCupom(null)
    carregar()
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Megaphone className="h-8 w-8 text-[#FFB800]" />
        Marketing
      </h1>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-6 bg-[#171923] border border-gray-800 max-h-32 overflow-y-auto">
          <TabsTrigger value="cupons">Cupons</TabsTrigger>
          <TabsTrigger value="promocoes">Promoções</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="popups">Popups</TabsTrigger>
          <TabsTrigger value="landings">Landing Pages</TabsTrigger>
          <TabsTrigger value="email">E-mail Marketing</TabsTrigger>
          <TabsTrigger value="automacao">Automação</TabsTrigger>
          <TabsTrigger value="segmentos">Segmentação</TabsTrigger>
          <TabsTrigger value="remarketing">Remarketing</TabsTrigger>
          <TabsTrigger value="afiliados">Afiliados</TabsTrigger>
          <TabsTrigger value="cashback">Cashback</TabsTrigger>
          <TabsTrigger value="indicacao">Indicação</TabsTrigger>
          <TabsTrigger value="seo">SEO Global</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>

        <TabsContent value="cupons">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><Tag className="h-5 w-5" /> Cupons de Desconto</CardTitle>
                <CardDescription>Crie cupons percentuais ou com valor fixo.</CardDescription>
              </div>
              <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { setEditCupom(null); setFormCupom({ codigo: "", tipo: "percentual", valor: 0, valorMinimo: 0, maxUso: 0, ativo: true, validade: "" }); setDialogCupomOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Novo cupom
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Código</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Valor</TableHead>
                    <TableHead className="text-gray-300">Usos</TableHead>
                    <TableHead className="text-gray-300">Validade</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cupons.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-white font-mono">{c.codigo}</TableCell>
                      <TableCell><Badge variant="outline">{c.tipo}</Badge></TableCell>
                      <TableCell className="text-gray-400">{c.tipo === "percentual" ? `${c.valor}%` : formatarValor(c.valor)}</TableCell>
                      <TableCell>{c.usado}/{c.maxUso || "∞"}</TableCell>
                      <TableCell className="text-gray-400">{c.validade || "—"}</TableCell>
                      <TableCell><Badge className={c.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{c.ativo ? "Sim" : "Não"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {cupons.length === 0 && <p className="text-gray-500 py-4">Nenhum cupom cadastrado.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promocoes">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><Percent className="h-5 w-5" /> Promoções</CardTitle>
                <CardDescription>Ofertas por preço, percentual ou compre X leve Y.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setFormPromo({ nome: "", tipo: "preco", valor: 0, ativo: true, inicio: "", fim: "" }); setDialogPromoOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Nova promoção</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Período</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promocoes.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-white">{p.nome}</TableCell>
                      <TableCell><Badge variant="outline">{p.tipo}</Badge></TableCell>
                      <TableCell className="text-gray-400">{p.inicio} a {p.fim}</TableCell>
                      <TableCell><Badge className={p.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{p.ativo ? "Sim" : "Não"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {promocoes.length === 0 && <p className="text-gray-500 py-4">Nenhuma promoção cadastrada.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campanhas">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><Radio className="h-5 w-5" /> Campanhas</CardTitle>
                <CardDescription>E-mail, SMS, push e banner.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setFormCampanha({ nome: "", canal: "email", segmento: "", ativo: true, inicio: "", fim: "" }); setDialogCampanhaOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Nova campanha</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Canal</TableHead>
                    <TableHead className="text-gray-300">Segmento</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campanhas.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-white">{c.nome}</TableCell>
                      <TableCell><Badge variant="outline">{c.canal}</Badge></TableCell>
                      <TableCell className="text-gray-400">{c.segmento || "—"}</TableCell>
                      <TableCell><Badge className={c.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{c.ativo ? "Sim" : "Não"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {campanhas.length === 0 && <p className="text-gray-500 py-4">Nenhuma campanha cadastrada.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><Image className="h-5 w-5" /> Banners</CardTitle>
                <CardDescription>Home, sidebar e checkout.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setFormBanner({ titulo: "", imagem: "", link: "", posicao: "home_top", ativo: true, ordem: 0 }); setDialogBannerOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Novo banner</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Título</TableHead>
                    <TableHead className="text-gray-300">Posição</TableHead>
                    <TableHead className="text-gray-300">Ordem</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="text-white">{b.titulo}</TableCell>
                      <TableCell><Badge variant="outline">{b.posicao}</Badge></TableCell>
                      <TableCell className="text-gray-400">{b.ordem}</TableCell>
                      <TableCell><Badge className={b.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{b.ativo ? "Sim" : "Não"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {banners.length === 0 && <p className="text-gray-500 py-4">Nenhum banner cadastrado.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popups">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Popups</CardTitle>
                <CardDescription>Gatilhos: entrada, saída, scroll, tempo.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setFormPopup({ titulo: "", conteudo: "", gatilho: "entrada", valorGatilho: 0, ativo: true, inicio: "", fim: "" }); setDialogPopupOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Novo popup</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Título</TableHead>
                    <TableHead className="text-gray-300">Gatilho</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popups.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-white">{p.titulo}</TableCell>
                      <TableCell><Badge variant="outline">{p.gatilho}</Badge></TableCell>
                      <TableCell><Badge className={p.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{p.ativo ? "Sim" : "Não"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {popups.length === 0 && <p className="text-gray-500 py-4">Nenhum popup cadastrado.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="landings">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><FileText className="h-5 w-5" /> Landing Pages</CardTitle>
                <CardDescription>Páginas de conversão por slug.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setFormLanding({ slug: "", titulo: "", conteudo: "", metaDescricao: "", ativo: true }); setDialogLandingOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Nova landing</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Slug</TableHead>
                    <TableHead className="text-gray-300">Título</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {landings.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-white font-mono">/{l.slug}</TableCell>
                      <TableCell className="text-gray-400">{l.titulo}</TableCell>
                      <TableCell><Badge className={l.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{l.ativo ? "Sim" : "Não"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {landings.length === 0 && <p className="text-gray-500 py-4">Nenhuma landing page cadastrada.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Mail className="h-5 w-5" /> E-mail Marketing</CardTitle>
              <CardDescription>Integre com campanhas e envie newsletters. Configure no módulo Campanhas.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Use a aba Campanhas com canal &quot;email&quot; para disparos. Para integração com provedores (Mailchimp, SendGrid), configure no painel principal.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automacao">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Zap className="h-5 w-5" /> Automação de Marketing</CardTitle>
              <CardDescription>Fluxos automáticos por segmento e gatilhos.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Combine campanhas, segmentos e popups para criar fluxos automáticos. Ex.: carrinho abandonado → e-mail após 1h.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segmentos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><Users className="h-5 w-5" /> Segmentação de Público</CardTitle>
                <CardDescription>Regras por campo, operador e valor.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setFormSegmento({ nome: "", regras: [], ativo: true }); setDialogSegmentoOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Novo segmento</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Regras</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segmentos.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-white">{s.nome}</TableCell>
                      <TableCell className="text-gray-400">{s.regras.length} regra(s)</TableCell>
                      <TableCell><Badge className={s.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{s.ativo ? "Sim" : "Não"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {segmentos.length === 0 && <p className="text-gray-500 py-4">Nenhum segmento cadastrado.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remarketing">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Repeat className="h-5 w-5" /> Remarketing</CardTitle>
              <CardDescription>Retargeting com Google Ads e Facebook Pixel.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Integre IDs de conversão (Google, Meta) nas configurações globais para remarketing de visitantes que não concluíram a compra.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="afiliados">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><UserPlus className="h-5 w-5" /> Programa de Afiliados</CardTitle>
                <CardDescription>Código, comissão e vendas por afiliado.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setFormAfiliado({ nome: "", email: "", codigo: "", comissao: 0, ativo: true }); setDialogAfiliadoOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Novo afiliado</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Código</TableHead>
                    <TableHead className="text-gray-300">Comissão</TableHead>
                    <TableHead className="text-gray-300">Vendas</TableHead>
                    <TableHead className="text-gray-300">Total ganho</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {afiliados.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-white">{a.nome}</TableCell>
                      <TableCell className="font-mono text-gray-400">{a.codigo}</TableCell>
                      <TableCell>{a.comissao}%</TableCell>
                      <TableCell>{a.vendas}</TableCell>
                      <TableCell className="text-green-400">{formatarValor(a.totalGanho)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {afiliados.length === 0 && <p className="text-gray-500 py-4">Nenhum afiliado cadastrado.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashback">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Gift className="h-5 w-5" /> Cashback</CardTitle>
              <CardDescription>Percentual de volta nas compras.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cashback && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Habilitar cashback</Label>
                    <Switch checked={cashback.habilitado} onCheckedChange={(v) => setCashback({ ...cashback, habilitado: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400">Percentual (%)</Label>
                      <Input type="number" min={0} max={100} value={cashback.percentual} onChange={(e) => setCashback({ ...cashback, percentual: parseFloat(e.target.value) || 0 })} className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-gray-400">Compra mínima (R$)</Label>
                      <Input type="number" min={0} value={cashback.minCompra || 0} onChange={(e) => setCashback({ ...cashback, minCompra: parseFloat(e.target.value) || 0 })} className="bg-background" />
                    </div>
                  </div>
                  <Button onClick={() => { cashback && salvarConfigCashback(cashback); toast.success("Salvo!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicacao">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Share2 className="h-5 w-5" /> Programa de Indicação</CardTitle>
              <CardDescription>Bônus para quem indica e para quem é indicado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {indicacao && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Habilitar indicação</Label>
                    <Switch checked={indicacao.habilitado} onCheckedChange={(v) => setIndicacao({ ...indicacao, habilitado: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400">Bônus indicador (R$)</Label>
                      <Input type="number" min={0} value={indicacao.bonusIndicador} onChange={(e) => setIndicacao({ ...indicacao, bonusIndicador: parseFloat(e.target.value) || 0 })} className="bg-background" />
                    </div>
                    <div>
                      <Label className="text-gray-400">Bônus indicado (R$)</Label>
                      <Input type="number" min={0} value={indicacao.bonusIndicado} onChange={(e) => setIndicacao({ ...indicacao, bonusIndicado: parseFloat(e.target.value) || 0 })} className="bg-background" />
                    </div>
                  </div>
                  <Button onClick={() => { indicacao && salvarConfigIndicacao(indicacao); toast.success("Salvo!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Search className="h-5 w-5" /> SEO Global</CardTitle>
              <CardDescription>Título, descrição e palavras-chave da loja.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {seo && (
                <>
                  <div>
                    <Label className="text-gray-400">Título</Label>
                    <Input value={seo.titulo} onChange={(e) => setSeo({ ...seo, titulo: e.target.value })} className="bg-background" />
                  </div>
                  <div>
                    <Label className="text-gray-400">Descrição (meta)</Label>
                    <Textarea value={seo.descricao} onChange={(e) => setSeo({ ...seo, descricao: e.target.value })} rows={2} className="bg-background" />
                  </div>
                  <div>
                    <Label className="text-gray-400">Palavras-chave (separadas por vírgula)</Label>
                    <Input value={seo.palavrasChave} onChange={(e) => setSeo({ ...seo, palavrasChave: e.target.value })} className="bg-background" />
                  </div>
                  <Button onClick={() => { seo && salvarConfigSEO(seo); toast.success("Salvo!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><BookOpen className="h-5 w-5" /> Gestão de Conteúdo / Blog</CardTitle>
                <CardDescription>Posts e páginas institucionais.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setFormPost({ titulo: "", slug: "", conteudo: "", resumo: "", imagem: "", publicado: false }); setDialogPostOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Novo post</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Título</TableHead>
                    <TableHead className="text-gray-300">Slug</TableHead>
                    <TableHead className="text-gray-300">Publicado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-white">{p.titulo}</TableCell>
                      <TableCell className="font-mono text-gray-400">/{p.slug}</TableCell>
                      <TableCell><Badge className={p.publicado ? "bg-green-500/20" : "bg-gray-500/20"}>{p.publicado ? "Sim" : "Rascunho"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {posts.length === 0 && <p className="text-gray-500 py-4">Nenhum post cadastrado.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Cupom */}
      <Dialog open={dialogCupomOpen} onOpenChange={setDialogCupomOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">{editCupom ? "Editar" : "Novo"} cupom</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Código</Label>
              <Input value={formCupom.codigo} onChange={(e) => setFormCupom({ ...formCupom, codigo: e.target.value.toUpperCase() })} placeholder="PROMO10" className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">Tipo</Label>
              <Select value={formCupom.tipo} onValueChange={(v: Cupom["tipo"]) => setFormCupom({ ...formCupom, tipo: v })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentual">Percentual</SelectItem>
                  <SelectItem value="fixo">Valor fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-400">Valor {formCupom.tipo === "percentual" ? "(%)" : "(R$)"}</Label>
              <Input type="number" min={0} step={formCupom.tipo === "percentual" ? 1 : 0.01} value={formCupom.valor} onChange={(e) => setFormCupom({ ...formCupom, valor: parseFloat(e.target.value) || 0 })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">Compra mínima (R$)</Label>
              <Input type="number" min={0} value={formCupom.valorMinimo} onChange={(e) => setFormCupom({ ...formCupom, valorMinimo: parseFloat(e.target.value) || 0 })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">Máx. usos (0 = ilimitado)</Label>
              <Input type="number" min={0} value={formCupom.maxUso} onChange={(e) => setFormCupom({ ...formCupom, maxUso: parseInt(e.target.value, 10) || 0 })} className="bg-background" />
            </div>
            <div>
              <Label className="text-gray-400">Validade (opcional)</Label>
              <Input type="date" value={formCupom.validade} onChange={(e) => setFormCupom({ ...formCupom, validade: e.target.value })} className="bg-background" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formCupom.ativo} onCheckedChange={(v) => setFormCupom({ ...formCupom, ativo: v })} />
              <Label className="text-gray-400">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogCupomOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarCupomHandler(); toast.success("Cupom salvo!"); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogs simplificados para os demais - salvam ao clicar */}
      <Dialog open={dialogPromoOpen} onOpenChange={setDialogPromoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Nova promoção</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Nome</Label><Input value={formPromo.nome} onChange={(e) => setFormPromo({ ...formPromo, nome: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Tipo</Label>
              <Select value={formPromo.tipo} onValueChange={(v: Promocao["tipo"]) => setFormPromo({ ...formPromo, tipo: v })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preco">Preço</SelectItem>
                  <SelectItem value="percentual">Percentual</SelectItem>
                  <SelectItem value="compre_x_leve_y">Compre X leve Y</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-gray-400">Valor</Label><Input type="number" value={formPromo.valor} onChange={(e) => setFormPromo({ ...formPromo, valor: parseFloat(e.target.value) || 0 })} className="bg-background" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-400">Início</Label><Input type="date" value={formPromo.inicio} onChange={(e) => setFormPromo({ ...formPromo, inicio: e.target.value })} className="bg-background" /></div>
              <div><Label className="text-gray-400">Fim</Label><Input type="date" value={formPromo.fim} onChange={(e) => setFormPromo({ ...formPromo, fim: e.target.value })} className="bg-background" /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={formPromo.ativo} onCheckedChange={(v) => setFormPromo({ ...formPromo, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPromoOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarPromocao(formPromo); toast.success("Promoção salva!"); setDialogPromoOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogCampanhaOpen} onOpenChange={setDialogCampanhaOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Nova campanha</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Nome</Label><Input value={formCampanha.nome} onChange={(e) => setFormCampanha({ ...formCampanha, nome: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Canal</Label>
              <Select value={formCampanha.canal} onValueChange={(v: Campanha["canal"]) => setFormCampanha({ ...formCampanha, canal: v })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-gray-400">Segmento</Label><Input value={formCampanha.segmento} onChange={(e) => setFormCampanha({ ...formCampanha, segmento: e.target.value })} className="bg-background" /></div>
            <div className="flex items-center gap-2"><Switch checked={formCampanha.ativo} onCheckedChange={(v) => setFormCampanha({ ...formCampanha, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogCampanhaOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarCampanha(formCampanha); setDialogCampanhaOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogBannerOpen} onOpenChange={setDialogBannerOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Novo banner</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Título</Label><Input value={formBanner.titulo} onChange={(e) => setFormBanner({ ...formBanner, titulo: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">URL imagem</Label><Input value={formBanner.imagem} onChange={(e) => setFormBanner({ ...formBanner, imagem: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Link (destino)</Label><Input value={formBanner.link} onChange={(e) => setFormBanner({ ...formBanner, link: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Posição</Label>
              <Select value={formBanner.posicao} onValueChange={(v: Banner["posicao"]) => setFormBanner({ ...formBanner, posicao: v })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_top">Home (topo)</SelectItem>
                  <SelectItem value="home_meio">Home (meio)</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="checkout">Checkout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-gray-400">Ordem</Label><Input type="number" value={formBanner.ordem} onChange={(e) => setFormBanner({ ...formBanner, ordem: parseInt(e.target.value, 10) || 0 })} className="bg-background" /></div>
            <div className="flex items-center gap-2"><Switch checked={formBanner.ativo} onCheckedChange={(v) => setFormBanner({ ...formBanner, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogBannerOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarBanner(formBanner); setDialogBannerOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogPopupOpen} onOpenChange={setDialogPopupOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Novo popup</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Título</Label><Input value={formPopup.titulo} onChange={(e) => setFormPopup({ ...formPopup, titulo: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Conteúdo</Label><Textarea value={formPopup.conteudo} onChange={(e) => setFormPopup({ ...formPopup, conteudo: e.target.value })} rows={3} className="bg-background" /></div>
            <div><Label className="text-gray-400">Gatilho</Label>
              <Select value={formPopup.gatilho} onValueChange={(v: Popup["gatilho"]) => setFormPopup({ ...formPopup, gatilho: v })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída (intenção)</SelectItem>
                  <SelectItem value="scroll">Scroll %</SelectItem>
                  <SelectItem value="tempo">Tempo (seg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-gray-400">Valor gatilho</Label><Input type="number" value={formPopup.valorGatilho} onChange={(e) => setFormPopup({ ...formPopup, valorGatilho: parseInt(e.target.value, 10) || 0 })} className="bg-background" /></div>
            <div className="flex items-center gap-2"><Switch checked={formPopup.ativo} onCheckedChange={(v) => setFormPopup({ ...formPopup, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPopupOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarPopup(formPopup); setDialogPopupOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogLandingOpen} onOpenChange={setDialogLandingOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Nova landing page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Slug</Label><Input value={formLanding.slug} onChange={(e) => setFormLanding({ ...formLanding, slug: e.target.value.replace(/\s/g, "-").toLowerCase() })} placeholder="black-friday" className="bg-background" /></div>
            <div><Label className="text-gray-400">Título</Label><Input value={formLanding.titulo} onChange={(e) => setFormLanding({ ...formLanding, titulo: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Conteúdo (HTML)</Label><Textarea value={formLanding.conteudo} onChange={(e) => setFormLanding({ ...formLanding, conteudo: e.target.value })} rows={4} className="bg-background" /></div>
            <div><Label className="text-gray-400">Meta descrição</Label><Input value={formLanding.metaDescricao} onChange={(e) => setFormLanding({ ...formLanding, metaDescricao: e.target.value })} className="bg-background" /></div>
            <div className="flex items-center gap-2"><Switch checked={formLanding.ativo} onCheckedChange={(v) => setFormLanding({ ...formLanding, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogLandingOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarLanding(formLanding); setDialogLandingOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogSegmentoOpen} onOpenChange={setDialogSegmentoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Novo segmento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Nome</Label><Input value={formSegmento.nome} onChange={(e) => setFormSegmento({ ...formSegmento, nome: e.target.value })} className="bg-background" /></div>
            <p className="text-sm text-gray-500">Adicione regras (campo, operador, valor) para filtrar o público.</p>
            <div className="flex items-center gap-2"><Switch checked={formSegmento.ativo} onCheckedChange={(v) => setFormSegmento({ ...formSegmento, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogSegmentoOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarSegmento(formSegmento); setDialogSegmentoOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogAfiliadoOpen} onOpenChange={setDialogAfiliadoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Novo afiliado</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Nome</Label><Input value={formAfiliado.nome} onChange={(e) => setFormAfiliado({ ...formAfiliado, nome: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">E-mail</Label><Input type="email" value={formAfiliado.email} onChange={(e) => setFormAfiliado({ ...formAfiliado, email: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Código</Label><Input value={formAfiliado.codigo} onChange={(e) => setFormAfiliado({ ...formAfiliado, codigo: e.target.value.toUpperCase() })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Comissão (%)</Label><Input type="number" min={0} max={100} value={formAfiliado.comissao} onChange={(e) => setFormAfiliado({ ...formAfiliado, comissao: parseFloat(e.target.value) || 0 })} className="bg-background" /></div>
            <div className="flex items-center gap-2"><Switch checked={formAfiliado.ativo} onCheckedChange={(v) => setFormAfiliado({ ...formAfiliado, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAfiliadoOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarAfiliado(formAfiliado); setDialogAfiliadoOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogPostOpen} onOpenChange={setDialogPostOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Novo post</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Título</Label><Input value={formPost.titulo} onChange={(e) => setFormPost({ ...formPost, titulo: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Slug</Label><Input value={formPost.slug} onChange={(e) => setFormPost({ ...formPost, slug: e.target.value.replace(/\s/g, "-").toLowerCase() })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Resumo</Label><Input value={formPost.resumo} onChange={(e) => setFormPost({ ...formPost, resumo: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Conteúdo</Label><Textarea value={formPost.conteudo} onChange={(e) => setFormPost({ ...formPost, conteudo: e.target.value })} rows={4} className="bg-background" /></div>
            <div className="flex items-center gap-2"><Switch checked={formPost.publicado} onCheckedChange={(v) => setFormPost({ ...formPost, publicado: v })} /><Label className="text-gray-400">Publicado</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPostOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarPostBlog({ ...formPost, publicadoEm: formPost.publicado ? new Date().toISOString() : undefined }); setDialogPostOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
