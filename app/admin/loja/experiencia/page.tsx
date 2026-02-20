"use client"

import { useState, useEffect } from "react"
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
  Star,
  MessageCircle,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Plus,
  Pencil,
  Check,
  X,
  Save,
} from "lucide-react"
import {
  listarAvaliacoes,
  salvarAvaliacao,
  responderReview,
  listarPerguntasRespostas,
  salvarPerguntaResposta,
  responderPergunta,
  getConfigChat,
  salvarConfigChat,
  listarCategoriasAjuda,
  salvarCategoriaAjuda,
  listarArtigosAjuda,
  salvarArtigoAjuda,
  type AvaliacaoReview,
  type PerguntaResposta,
  type ArtigoAjuda,
  type CategoriaAjuda,
} from "@/lib/experiencia-usuario-loja-store"

export default function LojaExperienciaPage() {
  const [abaAtiva, setAbaAtiva] = useState("reviews")
  const [reviews, setReviews] = useState<AvaliacaoReview[]>([])
  const [perguntas, setPerguntas] = useState<PerguntaResposta[]>([])
  const [configChat, setConfigChat] = useState<ReturnType<typeof getConfigChat> | null>(null)
  const [categorias, setCategorias] = useState<CategoriaAjuda[]>([])
  const [artigos, setArtigos] = useState<ArtigoAjuda[]>([])
  const [dialogRespostaReview, setDialogRespostaReview] = useState(false)
  const [dialogRespostaPergunta, setDialogRespostaPergunta] = useState(false)
  const [dialogArtigoOpen, setDialogArtigoOpen] = useState(false)
  const [reviewSelecionada, setReviewSelecionada] = useState<AvaliacaoReview | null>(null)
  const [perguntaSelecionada, setPerguntaSelecionada] = useState<PerguntaResposta | null>(null)
  const [textoRespostaReview, setTextoRespostaReview] = useState("")
  const [textoRespostaPergunta, setTextoRespostaPergunta] = useState("")
  const [formArtigo, setFormArtigo] = useState({ titulo: "", slug: "", conteudo: "", categoria: "", ordem: 0, ativo: true })

  const carregar = () => {
    setReviews(listarAvaliacoes())
    setPerguntas(listarPerguntasRespostas())
    setConfigChat(getConfigChat())
    setCategorias(listarCategoriasAjuda())
    setArtigos(listarArtigosAjuda())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("experiencia-usuario-loja-updated", h)
    return () => window.removeEventListener("experiencia-usuario-loja-updated", h)
  }, [])

  const aprovarReview = (r: AvaliacaoReview) => {
    salvarAvaliacao({ ...r, aprovado: true })
    carregar()
  }
  const rejeitarReview = (r: AvaliacaoReview) => {
    salvarAvaliacao({ ...r, aprovado: false })
    carregar()
  }
  const enviarRespostaReview = () => {
    if (reviewSelecionada) {
      responderReview(reviewSelecionada.id, textoRespostaReview)
      setDialogRespostaReview(false)
      setReviewSelecionada(null)
      setTextoRespostaReview("")
      carregar()
    }
  }
  const enviarRespostaPergunta = () => {
    if (perguntaSelecionada) {
      responderPergunta(perguntaSelecionada.id, textoRespostaPergunta)
      setDialogRespostaPergunta(false)
      setPerguntaSelecionada(null)
      setTextoRespostaPergunta("")
      carregar()
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Star className="h-8 w-8 text-[#FFB800]" />
        Experiência do Usuário
      </h1>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-6 bg-[#171923] border border-gray-800">
          <TabsTrigger value="reviews">Avaliações e Reviews</TabsTrigger>
          <TabsTrigger value="perguntas">Perguntas e Respostas</TabsTrigger>
          <TabsTrigger value="chat">Chat Online</TabsTrigger>
          <TabsTrigger value="ajuda">Central de Ajuda</TabsTrigger>
          <TabsTrigger value="base">Base de Conhecimento</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Star className="h-5 w-5" /> Avaliações e Reviews</CardTitle>
              <CardDescription>Modere e responda avaliações de produtos.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Produto / Cliente</TableHead>
                    <TableHead className="text-gray-300">Nota</TableHead>
                    <TableHead className="text-gray-300">Texto</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.slice(0, 50).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-white">{r.clienteNome} — {r.produtoId}</TableCell>
                      <TableCell><span className="text-[#FFB800]">{r.nota}/5</span></TableCell>
                      <TableCell className="text-gray-400 text-sm truncate max-w-[200px]">{r.texto}</TableCell>
                      <TableCell><Badge className={r.aprovado ? "bg-green-500/20" : "bg-amber-500/20"}>{r.aprovado ? "Aprovado" : "Pendente"}</Badge></TableCell>
                      <TableCell>
                        {!r.aprovado && <Button size="sm" variant="ghost" onClick={() => aprovarReview(r)}><Check className="h-3 w-3 text-green-400" /></Button>}
                        {r.aprovado === false && <Button size="sm" variant="ghost" onClick={() => rejeitarReview(r)}><X className="h-3 w-3" /></Button>}
                        {!r.respondido && <Button size="sm" variant="ghost" onClick={() => { setReviewSelecionada(r); setTextoRespostaReview(""); setDialogRespostaReview(true); }}>Responder</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reviews.length === 0 && <p className="text-gray-500 py-4">Nenhuma avaliação ainda.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perguntas">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Perguntas e Respostas</CardTitle>
              <CardDescription>Responda perguntas de clientes sobre produtos.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Cliente / Produto</TableHead>
                    <TableHead className="text-gray-300">Pergunta</TableHead>
                    <TableHead className="text-gray-300">Resposta</TableHead>
                    <TableHead className="text-gray-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perguntas.slice(0, 50).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-white">{p.clienteNome} — {p.produtoId}</TableCell>
                      <TableCell className="text-gray-400 text-sm truncate max-w-[180px]">{p.pergunta}</TableCell>
                      <TableCell className="text-gray-500 text-sm truncate max-w-[180px]">{p.resposta || "—"}</TableCell>
                      <TableCell>
                        {!p.resposta && <Button size="sm" variant="ghost" onClick={() => { setPerguntaSelecionada(p); setTextoRespostaPergunta(""); setDialogRespostaPergunta(true); }}>Responder</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {perguntas.length === 0 && <p className="text-gray-500 py-4">Nenhuma pergunta ainda.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Chat Online</CardTitle>
              <CardDescription>Widget ou integração com provedor de chat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configChat && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={configChat.habilitado} onCheckedChange={(v) => setConfigChat({ ...configChat, habilitado: v })} /><Label className="text-gray-400">Habilitar chat</Label></div>
                  <div><Label className="text-gray-400">Tipo</Label>
                    <Select value={configChat.tipo} onValueChange={(v: "widget" | "flutuante" | "integrado") => setConfigChat({ ...configChat, tipo: v })}>
                      <SelectTrigger className="bg-background w-40"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="widget">Widget</SelectItem><SelectItem value="flutuante">Flutuante</SelectItem><SelectItem value="integrado">Integrado</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-gray-400">Horário de funcionamento</Label><Input value={configChat.horarioFuncionamento || ""} onChange={(e) => setConfigChat({ ...configChat, horarioFuncionamento: e.target.value })} placeholder="Seg a Sex 9h-18h" className="bg-background" /></div>
                  <div><Label className="text-gray-400">Mensagem offline</Label><Textarea value={configChat.mensagemOffline || ""} onChange={(e) => setConfigChat({ ...configChat, mensagemOffline: e.target.value })} rows={2} className="bg-background" /></div>
                  <div><Label className="text-gray-400">Script do widget (URL ou código)</Label><Input value={configChat.widgetScript || ""} onChange={(e) => setConfigChat({ ...configChat, widgetScript: e.target.value })} className="bg-background" placeholder="https://..." /></div>
                  <Button onClick={() => { configChat && salvarConfigChat(configChat); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ajuda">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><HelpCircle className="h-5 w-5" /> Central de Ajuda</CardTitle>
              <CardDescription>Configure a página de ajuda e faq. Use a Base de Conhecimento para artigos.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Categorias e artigos são gerenciados na aba Base de Conhecimento. Aqui você pode ativar a Central de Ajuda na loja e definir a URL (ex: /ajuda).</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="base">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><BookOpen className="h-5 w-5" /> Base de Conhecimento</CardTitle>
                <CardDescription>Categorias e artigos de ajuda.</CardDescription>
              </div>
              <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { setFormArtigo({ titulo: "", slug: "", conteudo: "", categoria: categorias[0]?.id || "", ordem: 0, ativo: true }); setDialogArtigoOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Novo artigo</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Título</TableHead>
                    <TableHead className="text-gray-300">Categoria</TableHead>
                    <TableHead className="text-gray-300">Ordem</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artigos.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-white">{a.titulo}</TableCell>
                      <TableCell className="text-gray-400">{categorias.find((c) => c.id === a.categoria)?.nome || a.categoria}</TableCell>
                      <TableCell className="text-gray-400">{a.ordem}</TableCell>
                      <TableCell><Badge className={a.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{a.ativo ? "Sim" : "Não"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {categorias.length === 0 && <p className="text-gray-500 py-4">Crie categorias primeiro (ex: Entrega, Pagamento). Depois adicione artigos.</p>}
              <div className="mt-4">
                <Label className="text-white">Categorias</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categorias.map((c) => (
                    <Badge key={c.id} variant="outline">{c.nome}</Badge>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => { const nome = prompt("Nome da categoria"); if (nome) { salvarCategoriaAjuda({ nome, ordem: categorias.length, ativo: true }); carregar(); } }}>+ Categoria</Button>
                </div>
              </div>
              {artigos.length === 0 && categorias.length > 0 && <p className="text-gray-500 py-4">Nenhum artigo. Clique em Novo artigo.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogRespostaReview} onOpenChange={setDialogRespostaReview}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Responder avaliação</DialogTitle></DialogHeader>
          <Textarea value={textoRespostaReview} onChange={(e) => setTextoRespostaReview(e.target.value)} rows={4} className="bg-background" placeholder="Sua resposta..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogRespostaReview(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={enviarRespostaReview}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogRespostaPergunta} onOpenChange={setDialogRespostaPergunta}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Responder pergunta</DialogTitle></DialogHeader>
          <Textarea value={textoRespostaPergunta} onChange={(e) => setTextoRespostaPergunta(e.target.value)} rows={4} className="bg-background" placeholder="Sua resposta..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogRespostaPergunta(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={enviarRespostaPergunta}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogArtigoOpen} onOpenChange={setDialogArtigoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Novo artigo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Título</Label><Input value={formArtigo.titulo} onChange={(e) => setFormArtigo({ ...formArtigo, titulo: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Slug</Label><Input value={formArtigo.slug} onChange={(e) => setFormArtigo({ ...formArtigo, slug: e.target.value.replace(/\s/g, "-").toLowerCase() })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Categoria</Label>
              <Select value={formArtigo.categoria || "nenhum"} onValueChange={(v) => setFormArtigo({ ...formArtigo, categoria: v === "nenhum" ? "" : v })}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum" disabled>Selecione uma categoria</SelectItem>
                  {categorias.map((c) => (<SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-gray-400">Conteúdo</Label><Textarea value={formArtigo.conteudo} onChange={(e) => setFormArtigo({ ...formArtigo, conteudo: e.target.value })} rows={4} className="bg-background" /></div>
            <div><Label className="text-gray-400">Ordem</Label><Input type="number" value={formArtigo.ordem} onChange={(e) => setFormArtigo({ ...formArtigo, ordem: parseInt(e.target.value, 10) || 0 })} className="bg-background w-20" /></div>
            <div className="flex items-center gap-2"><Switch checked={formArtigo.ativo} onCheckedChange={(v) => setFormArtigo({ ...formArtigo, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogArtigoOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { if (formArtigo.categoria && formArtigo.categoria !== "nenhum") salvarArtigoAjuda(formArtigo); setDialogArtigoOpen(false); carregar(); }} disabled={!formArtigo.titulo || !formArtigo.categoria || formArtigo.categoria === "nenhum"}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
