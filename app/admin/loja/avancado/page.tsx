"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Repeat,
  Package,
  Store,
  Warehouse,
  Sparkles,
  TrendingUp,
  FlaskConical,
  Award,
  Gift,
  Save,
} from "lucide-react"
import {
  getConfigAssinatura,
  salvarConfigAssinatura,
  getConfigDropshipping,
  salvarConfigDropshipping,
  getConfigMultiVendedor,
  salvarConfigMultiVendedor,
  getConfigMultiLoja,
  salvarConfigMultiLoja,
  getConfigMultiArmazem,
  salvarConfigMultiArmazem,
  getConfigRecomendacao,
  salvarConfigRecomendacao,
  getConfigPrecoDinamico,
  salvarConfigPrecoDinamico,
  getConfigABTeste,
  salvarConfigABTeste,
  getConfigPontos,
  salvarConfigPontos,
} from "@/lib/avancado-loja-store"
import { getConfigCashback, salvarConfigCashback } from "@/lib/marketing-loja-store"

export default function LojaAvancadoPage() {
  const [assinatura, setAssinatura] = useState<ReturnType<typeof getConfigAssinatura> | null>(null)
  const [dropshipping, setDropshipping] = useState<ReturnType<typeof getConfigDropshipping> | null>(null)
  const [multiVendedor, setMultiVendedor] = useState<ReturnType<typeof getConfigMultiVendedor> | null>(null)
  const [multiLoja, setMultiLoja] = useState<ReturnType<typeof getConfigMultiLoja> | null>(null)
  const [multiArmazem, setMultiArmazem] = useState<ReturnType<typeof getConfigMultiArmazem> | null>(null)
  const [recomendacao, setRecomendacao] = useState<ReturnType<typeof getConfigRecomendacao> | null>(null)
  const [precoDinamico, setPrecoDinamico] = useState<ReturnType<typeof getConfigPrecoDinamico> | null>(null)
  const [abTeste, setAbTeste] = useState<ReturnType<typeof getConfigABTeste> | null>(null)
  const [pontos, setPontos] = useState<ReturnType<typeof getConfigPontos> | null>(null)
  const [cashback, setCashback] = useState<ReturnType<typeof getConfigCashback> | null>(null)

  const carregar = () => {
    setAssinatura(getConfigAssinatura())
    setDropshipping(getConfigDropshipping())
    setMultiVendedor(getConfigMultiVendedor())
    setMultiLoja(getConfigMultiLoja())
    setMultiArmazem(getConfigMultiArmazem())
    setRecomendacao(getConfigRecomendacao())
    setPrecoDinamico(getConfigPrecoDinamico())
    setAbTeste(getConfigABTeste())
    setPontos(getConfigPontos())
    setCashback(getConfigCashback())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("avancado-loja-updated", h)
    window.addEventListener("marketing-loja-updated", h)
    return () => {
      window.removeEventListener("avancado-loja-updated", h)
      window.removeEventListener("marketing-loja-updated", h)
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Sparkles className="h-8 w-8 text-[#FFB800]" />
        Avançado
      </h1>

      <Tabs defaultValue="assinatura" className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-6 bg-[#171923] border border-gray-800 max-h-32 overflow-y-auto">
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
          <TabsTrigger value="dropshipping">Dropshipping</TabsTrigger>
          <TabsTrigger value="multivendedor">Multi-vendedor</TabsTrigger>
          <TabsTrigger value="multiloja">Multi-loja</TabsTrigger>
          <TabsTrigger value="multiarmazem">Multi-armazém</TabsTrigger>
          <TabsTrigger value="recomendacao">Recomendação</TabsTrigger>
          <TabsTrigger value="preco">Preço Dinâmico</TabsTrigger>
          <TabsTrigger value="abteste">A/B Teste</TabsTrigger>
          <TabsTrigger value="pontos">Pontos</TabsTrigger>
          <TabsTrigger value="cashback">Cashback</TabsTrigger>
        </TabsList>

        <TabsContent value="assinatura">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Repeat className="h-5 w-5" /> Sistema de Assinatura Recorrente</CardTitle><CardDescription>Ciclos e cobrança automática.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {assinatura && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={assinatura.habilitado} onCheckedChange={(v) => setAssinatura({ ...assinatura, habilitado: v })} /><Label className="text-gray-400">Habilitar assinaturas</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={assinatura.cobrancaAutomatica} onCheckedChange={(v) => setAssinatura({ ...assinatura, cobrancaAutomatica: v })} /><Label className="text-gray-400">Cobrança automática</Label></div>
                  <div><Label className="text-gray-400">Lembrete de renovação (dias antes)</Label><Input type="number" min={0} value={assinatura.lembreteRenovacao} onChange={(e) => setAssinatura({ ...assinatura, lembreteRenovacao: parseInt(e.target.value, 10) || 0 })} className="bg-background w-24" /></div>
                  <p className="text-sm text-gray-500">Ciclos: {assinatura.ciclos.map((c) => `${c.nome} (${c.dias}d)`).join(", ")}</p>
                  <Button onClick={() => { assinatura && salvarConfigAssinatura(assinatura); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dropshipping">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Package className="h-5 w-5" /> Dropshipping</CardTitle><CardDescription>Fornecedores e markup.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {dropshipping && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={dropshipping.habilitado} onCheckedChange={(v) => setDropshipping({ ...dropshipping, habilitado: v })} /><Label className="text-gray-400">Habilitar dropshipping</Label></div>
                  <div><Label className="text-gray-400">Markup padrão (%)</Label><Input type="number" min={0} value={dropshipping.markupPadrao} onChange={(e) => setDropshipping({ ...dropshipping, markupPadrao: parseFloat(e.target.value) || 0 })} className="bg-background w-24" /></div>
                  <p className="text-sm text-gray-500">Fornecedores: {dropshipping.fornecedores.length} cadastrado(s).</p>
                  <Button onClick={() => { dropshipping && salvarConfigDropshipping(dropshipping); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multivendedor">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Store className="h-5 w-5" /> Multi-vendedor (Marketplace)</CardTitle><CardDescription>Comissão e aprovação de vendedores.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {multiVendedor && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={multiVendedor.habilitado} onCheckedChange={(v) => setMultiVendedor({ ...multiVendedor, habilitado: v })} /><Label className="text-gray-400">Habilitar multi-vendedor</Label></div>
                  <div><Label className="text-gray-400">Comissão padrão (%)</Label><Input type="number" min={0} max={100} value={multiVendedor.comissaoPadrao} onChange={(e) => setMultiVendedor({ ...multiVendedor, comissaoPadrao: parseFloat(e.target.value) || 0 })} className="bg-background w-24" /></div>
                  <div className="flex items-center gap-2"><Switch checked={multiVendedor.aprovarVendedorAntesVenda} onCheckedChange={(v) => setMultiVendedor({ ...multiVendedor, aprovarVendedorAntesVenda: v })} /><Label className="text-gray-400">Aprovar vendedor antes de vender</Label></div>
                  <Button onClick={() => { multiVendedor && salvarConfigMultiVendedor(multiVendedor); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multiloja">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2">Multi-loja</CardTitle><CardDescription>Várias lojas / marcas.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {multiLoja && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={multiLoja.habilitado} onCheckedChange={(v) => setMultiLoja({ ...multiLoja, habilitado: v })} /><Label className="text-gray-400">Habilitar multi-loja</Label></div>
                  <p className="text-sm text-gray-500">Lojas: {multiLoja.lojas.length} cadastrada(s).</p>
                  <Button onClick={() => { multiLoja && salvarConfigMultiLoja(multiLoja); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multiarmazem">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Warehouse className="h-5 w-5" /> Multi-armazém</CardTitle><CardDescription>Vários centros de distribuição.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {multiArmazem && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={multiArmazem.habilitado} onCheckedChange={(v) => setMultiArmazem({ ...multiArmazem, habilitado: v })} /><Label className="text-gray-400">Habilitar multi-armazém</Label></div>
                  <p className="text-sm text-gray-500">Armazéns: {multiArmazem.armazens.length} cadastrado(s).</p>
                  <Button onClick={() => { multiArmazem && salvarConfigMultiArmazem(multiArmazem); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recomendacao">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Sparkles className="h-5 w-5" /> Motor de Recomendação</CardTitle><CardDescription>Critério e quantidade de itens.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {recomendacao && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={recomendacao.habilitado} onCheckedChange={(v) => setRecomendacao({ ...recomendacao, habilitado: v })} /><Label className="text-gray-400">Habilitar</Label></div>
                  <div><Label className="text-gray-400">Critério</Label>
                    <select value={recomendacao.criterio} onChange={(e) => setRecomendacao({ ...recomendacao, criterio: e.target.value as "vistos" | "comprados" | "categoria" | "mix" })} className="bg-background border rounded px-3 py-2 text-white w-48">
                      <option value="vistos">Vistos recentemente</option>
                      <option value="comprados">Comprados juntos</option>
                      <option value="categoria">Mesma categoria</option>
                      <option value="mix">Mix</option>
                    </select>
                  </div>
                  <div><Label className="text-gray-400">Máx. itens</Label><Input type="number" min={1} value={recomendacao.maxItens} onChange={(e) => setRecomendacao({ ...recomendacao, maxItens: parseInt(e.target.value, 10) || 8 })} className="bg-background w-24" /></div>
                  <Button onClick={() => { recomendacao && salvarConfigRecomendacao(recomendacao); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preco">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><TrendingUp className="h-5 w-5" /> IA de Preço Dinâmico</CardTitle><CardDescription>Regras por estoque, demanda ou horário.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {precoDinamico && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={precoDinamico.habilitado} onCheckedChange={(v) => setPrecoDinamico({ ...precoDinamico, habilitado: v })} /><Label className="text-gray-400">Habilitar preço dinâmico</Label></div>
                  <p className="text-sm text-gray-500">Regras: {precoDinamico.regras.length}. Adicione regras (tipo: estoque, demanda, horário; ajuste %).</p>
                  <Button onClick={() => { precoDinamico && salvarConfigPrecoDinamico(precoDinamico); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abteste">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><FlaskConical className="h-5 w-5" /> A/B Teste</CardTitle><CardDescription>Variantes e % de tráfego.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {abTeste && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={abTeste.habilitado} onCheckedChange={(v) => setAbTeste({ ...abTeste, habilitado: v })} /><Label className="text-gray-400">Habilitar A/B teste</Label></div>
                  <p className="text-sm text-gray-500">Testes ativos: {abTeste.testes.filter((t) => t.ativo).length}.</p>
                  <Button onClick={() => { abTeste && salvarConfigABTeste(abTeste); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pontos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Award className="h-5 w-5" /> Sistema de Pontos</CardTitle><CardDescription>Pontos por compra e resgate.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {pontos && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={pontos.habilitado} onCheckedChange={(v) => setPontos({ ...pontos, habilitado: v })} /><Label className="text-gray-400">Habilitar pontos</Label></div>
                  <div><Label className="text-gray-400">Pontos por R$ 1 gasto</Label><Input type="number" min={0} step={0.1} value={pontos.pontosPorReal} onChange={(e) => setPontos({ ...pontos, pontosPorReal: parseFloat(e.target.value) || 0 })} className="bg-background w-24" /></div>
                  <div><Label className="text-gray-400">Valor de 1 ponto (R$)</Label><Input type="number" min={0} step={0.01} value={pontos.valorPorPonto} onChange={(e) => setPontos({ ...pontos, valorPorPonto: parseFloat(e.target.value) || 0 })} className="bg-background w-24" /></div>
                  <div><Label className="text-gray-400">Validade (dias)</Label><Input type="number" min={0} value={pontos.validadeDias} onChange={(e) => setPontos({ ...pontos, validadeDias: parseInt(e.target.value, 10) || 365 })} className="bg-background w-24" /></div>
                  <div><Label className="text-gray-400">Mín. pontos para resgate</Label><Input type="number" min={0} value={pontos.minPontosResgate} onChange={(e) => setPontos({ ...pontos, minPontosResgate: parseInt(e.target.value, 10) || 100 })} className="bg-background w-24" /></div>
                  <Button onClick={() => { pontos && salvarConfigPontos(pontos); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashback">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Gift className="h-5 w-5" /> Sistema de Cashback</CardTitle>
              <CardDescription>Percentual de volta. Também configurável em Marketing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cashback && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={cashback.habilitado} onCheckedChange={(v) => setCashback({ ...cashback, habilitado: v })} /><Label className="text-gray-400">Habilitar cashback</Label></div>
                  <div><Label className="text-gray-400">Percentual (%)</Label><Input type="number" min={0} max={100} value={cashback.percentual} onChange={(e) => setCashback({ ...cashback, percentual: parseFloat(e.target.value) || 0 })} className="bg-background w-24" /></div>
                  <div><Label className="text-gray-400">Compra mínima (R$)</Label><Input type="number" min={0} value={cashback.minCompra || 0} onChange={(e) => setCashback({ ...cashback, minCompra: parseFloat(e.target.value) || 0 })} className="bg-background w-32" /></div>
                  <Button onClick={() => { cashback && salvarConfigCashback(cashback); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                  <p className="text-sm text-gray-500">Você também pode configurar em <Link href="/admin/loja/marketing" className="text-[#FFB800] underline">Marketing → Cashback</Link>.</p>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
