"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Package, Plus, Pencil, Trash2 } from "lucide-react"
import { formatarValor } from "@/lib/formatadores"
import {
  listarCaixas,
  salvarCaixa,
  excluirCaixa,
  type CaixaLoja,
  type PremioCaixa,
} from "@/lib/caixas-loja-store"

export default function LojaCaixasPage() {
  const [caixas, setCaixas] = useState<CaixaLoja[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<CaixaLoja | null>(null)
  const [form, setForm] = useState<Partial<CaixaLoja>>({
    nome: "",
    descricao: "",
    preco: 0,
    moeda: "reais",
    imagem: "",
    raridade: "comum",
    premios: [],
    ativo: true,
    ordem: 0,
  })

  const carregar = () => setCaixas(listarCaixas())

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("loja-updated", h)
    return () => window.removeEventListener("loja-updated", h)
  }, [])

  const abrirNovo = () => {
    setEditando(null)
    setForm({
      nome: "",
      descricao: "",
      preco: 0,
      moeda: "reais",
      imagem: "",
      raridade: "comum",
      premios: [{ id: "1", nome: "Prêmio", probabilidade: 100, raridade: "comum", icone: "🎁" }],
      ativo: true,
      ordem: caixas.length,
    })
    setDialogOpen(true)
  }

  const abrirEditar = (c: CaixaLoja) => {
    setEditando(c)
    setForm({ ...c })
    setDialogOpen(true)
  }

  const salvarHandler = () => {
    if (!form.nome?.trim()) return
    const payload = {
      ...form,
      preco: Number(form.preco) || 0,
      premios: form.premios?.length ? form.premios : [{ id: "1", nome: "Prêmio", probabilidade: 100, raridade: "comum", icone: "🎁" }],
      ordem: form.ordem ?? caixas.length,
    } as CaixaLoja
    if (editando) (payload as CaixaLoja).id = editando.id
    salvarCaixa(payload)
    setDialogOpen(false)
    carregar()
  }

  const remover = (id: string) => {
    if (confirm("Excluir esta caixa?")) {
      excluirCaixa(id)
      carregar()
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Package className="h-8 w-8" />
        Caixas Premiadas
      </h1>
      <p className="text-gray-400 mb-8">
        Configure as caixas que aparecem na aba Caixa Premiada da Loja Virtual.
      </p>

      <Card className="bg-[#171923] border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Caixas</CardTitle>
              <CardDescription>Adicione caixas com prêmios configuráveis</CardDescription>
            </div>
            <Button onClick={abrirNovo}>
              <Plus className="mr-2 h-4 w-4" /> Nova Caixa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {caixas.length === 0 ? (
            <div className="text-gray-400 py-8 text-center">
              <p>Nenhuma caixa cadastrada. Clique em &quot;Nova Caixa&quot; para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Nome</TableHead>
                  <TableHead className="text-gray-300">Preço</TableHead>
                  <TableHead className="text-gray-300">Raridade</TableHead>
                  <TableHead className="text-gray-300">Prêmios</TableHead>
                  <TableHead className="text-gray-300">Ativo</TableHead>
                  <TableHead className="text-gray-300 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caixas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-white">{c.nome}</TableCell>
                    <TableCell className="text-gray-300">
                      {c.moeda === "gratis" ? "Grátis" : formatarValor(c.preco)}
                    </TableCell>
                    <TableCell className="text-gray-300">{c.raridade}</TableCell>
                    <TableCell className="text-gray-300">{c.premios.length}</TableCell>
                    <TableCell>{c.ativo ? "Sim" : "Não"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remover(c.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#171923] border-gray-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar caixa" : "Nova caixa"}</DialogTitle>
            <DialogDescription>Configure nome, preço e prêmios.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.nome ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Caixa Básica"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={form.descricao ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Breve descrição"
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.preco ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, preco: parseFloat(e.target.value) || 0 }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Moeda</Label>
                <Select
                  value={form.moeda ?? "reais"}
                  onValueChange={(v) => setForm((f) => ({ ...f, moeda: v as "reais" | "tickets" | "gratis" }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reais">R$ (Reais)</SelectItem>
                    <SelectItem value="tickets">Tickets</SelectItem>
                    <SelectItem value="gratis">Grátis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Raridade</Label>
              <Select
                value={form.raridade ?? "comum"}
                onValueChange={(v) => setForm((f) => ({ ...f, raridade: v }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comum">Comum</SelectItem>
                  <SelectItem value="incomum">Incomum</SelectItem>
                  <SelectItem value="raro">Raro</SelectItem>
                  <SelectItem value="épico">Épico</SelectItem>
                  <SelectItem value="lendário">Lendário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.ativo ?? true}
                onCheckedChange={(v) => setForm((f) => ({ ...f, ativo: v }))}
              />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarHandler} disabled={!form.nome?.trim()}>
              {editando ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
