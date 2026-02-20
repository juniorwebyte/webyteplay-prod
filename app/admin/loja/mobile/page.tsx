"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageCircle,
  Instagram,
  Store,
  Database,
  Users,
  Code,
  Smartphone,
  Save,
} from "lucide-react"
import {
  getConfigWhatsApp,
  salvarConfigWhatsApp,
  getConfigInstagram,
  salvarConfigInstagram,
  getConfigMarketplace,
  salvarConfigMarketplace,
  getConfigERP,
  salvarConfigERP,
  getConfigCRM,
  salvarConfigCRM,
  getConfigAPIPublica,
  salvarConfigAPIPublica,
  getConfigAppMobile,
  salvarConfigAppMobile,
} from "@/lib/mobile-omnichannel-loja-store"

export default function LojaMobilePage() {
  const [whatsapp, setWhatsapp] = useState<ReturnType<typeof getConfigWhatsApp> | null>(null)
  const [instagram, setInstagram] = useState<ReturnType<typeof getConfigInstagram> | null>(null)
  const [marketplace, setMarketplace] = useState<ReturnType<typeof getConfigMarketplace> | null>(null)
  const [erp, setErp] = useState<ReturnType<typeof getConfigERP> | null>(null)
  const [crm, setCrm] = useState<ReturnType<typeof getConfigCRM> | null>(null)
  const [api, setApi] = useState<ReturnType<typeof getConfigAPIPublica> | null>(null)
  const [app, setApp] = useState<ReturnType<typeof getConfigAppMobile> | null>(null)

  const carregar = () => {
    setWhatsapp(getConfigWhatsApp())
    setInstagram(getConfigInstagram())
    setMarketplace(getConfigMarketplace())
    setErp(getConfigERP())
    setCrm(getConfigCRM())
    setApi(getConfigAPIPublica())
    setApp(getConfigAppMobile())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("mobile-omnichannel-loja-updated", h)
    return () => window.removeEventListener("mobile-omnichannel-loja-updated", h)
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Smartphone className="h-8 w-8 text-[#FFB800]" />
        Mobile / Omnichannel
      </h1>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-6 bg-[#171923] border border-gray-800">
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="erp">ERP</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="api">API Pública</TabsTrigger>
          <TabsTrigger value="app">App Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><MessageCircle className="h-5 w-5 text-green-500" /> Integração com WhatsApp</CardTitle><CardDescription>Número e mensagem padrão para contato.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {whatsapp && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={whatsapp.habilitado} onCheckedChange={(v) => setWhatsapp({ ...whatsapp, habilitado: v })} /><Label className="text-gray-400">Habilitar</Label></div>
                  <div><Label className="text-gray-400">Número (com DDI)</Label><Input value={whatsapp.numero} onChange={(e) => setWhatsapp({ ...whatsapp, numero: e.target.value })} placeholder="5511999999999" className="bg-background" /></div>
                  <div><Label className="text-gray-400">Mensagem padrão</Label><Textarea value={whatsapp.mensagemPadrao} onChange={(e) => setWhatsapp({ ...whatsapp, mensagemPadrao: e.target.value })} rows={2} className="bg-background" /></div>
                  <div><Label className="text-gray-400">API Key (opcional)</Label><Input type="password" value={whatsapp.apiKey || ""} onChange={(e) => setWhatsapp({ ...whatsapp, apiKey: e.target.value })} className="bg-background" /></div>
                  <Button onClick={() => { whatsapp && salvarConfigWhatsApp(whatsapp); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instagram">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Instagram className="h-5 w-5 text-pink-500" /> Integração com Instagram</CardTitle><CardDescription>Usuário e feed de produtos.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {instagram && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={instagram.habilitado} onCheckedChange={(v) => setInstagram({ ...instagram, habilitado: v })} /><Label className="text-gray-400">Habilitar</Label></div>
                  <div><Label className="text-gray-400">Usuário / @</Label><Input value={instagram.usuario} onChange={(e) => setInstagram({ ...instagram, usuario: e.target.value })} placeholder="@minhaloja" className="bg-background" /></div>
                  <div><Label className="text-gray-400">Token (opcional)</Label><Input type="password" value={instagram.token || ""} onChange={(e) => setInstagram({ ...instagram, token: e.target.value })} className="bg-background" /></div>
                  <div className="flex items-center gap-2"><Switch checked={instagram.feedProdutos} onCheckedChange={(v) => setInstagram({ ...instagram, feedProdutos: v })} /><Label className="text-gray-400">Exibir feed de produtos</Label></div>
                  <Button onClick={() => { instagram && salvarConfigInstagram(instagram); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Store className="h-5 w-5" /> Integração com Marketplace</CardTitle><CardDescription>Mercado Livre, Amazon, etc.</CardDescription></CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">Adicione marketplaces (nome, API Key, Seller ID) na lista. Ex: Mercado Livre, Amazon, Magazine Luiza.</p>
              {marketplace && (
                <>
                  <div className="flex items-center gap-2 mb-4"><Switch checked={marketplace.habilitado} onCheckedChange={(v) => setMarketplace({ ...marketplace, habilitado: v })} /><Label className="text-gray-400">Habilitar integrações</Label></div>
                  <Button onClick={() => { marketplace && salvarConfigMarketplace(marketplace); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="erp">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Database className="h-5 w-5" /> Integração com ERP</CardTitle><CardDescription>Provedor, URL e sincronização.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {erp && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={erp.habilitado} onCheckedChange={(v) => setErp({ ...erp, habilitado: v })} /><Label className="text-gray-400">Habilitar</Label></div>
                  <div><Label className="text-gray-400">Provedor</Label><Input value={erp.provedor} onChange={(e) => setErp({ ...erp, provedor: e.target.value })} placeholder="TOTVS, SAP, etc." className="bg-background" /></div>
                  <div><Label className="text-gray-400">URL da API</Label><Input value={erp.url} onChange={(e) => setErp({ ...erp, url: e.target.value })} className="bg-background" /></div>
                  <div><Label className="text-gray-400">API Key</Label><Input type="password" value={erp.apiKey || ""} onChange={(e) => setErp({ ...erp, apiKey: e.target.value })} className="bg-background" /></div>
                  <div className="flex items-center gap-2"><Switch checked={erp.sincronizarEstoque} onCheckedChange={(v) => setErp({ ...erp, sincronizarEstoque: v })} /><Label className="text-gray-400">Sincronizar estoque</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={erp.sincronizarPedidos} onCheckedChange={(v) => setErp({ ...erp, sincronizarPedidos: v })} /><Label className="text-gray-400">Sincronizar pedidos</Label></div>
                  <Button onClick={() => { erp && salvarConfigERP(erp); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Users className="h-5 w-5" /> Integração com CRM</CardTitle><CardDescription>Provedor e sincronização de clientes.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {crm && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={crm.habilitado} onCheckedChange={(v) => setCrm({ ...crm, habilitado: v })} /><Label className="text-gray-400">Habilitar</Label></div>
                  <div><Label className="text-gray-400">Provedor</Label><Input value={crm.provedor} onChange={(e) => setCrm({ ...crm, provedor: e.target.value })} placeholder="RD Station, HubSpot, etc." className="bg-background" /></div>
                  <div><Label className="text-gray-400">URL da API</Label><Input value={crm.url} onChange={(e) => setCrm({ ...crm, url: e.target.value })} className="bg-background" /></div>
                  <div><Label className="text-gray-400">API Key</Label><Input type="password" value={crm.apiKey || ""} onChange={(e) => setCrm({ ...crm, apiKey: e.target.value })} className="bg-background" /></div>
                  <div className="flex items-center gap-2"><Switch checked={crm.sincronizarClientes} onCheckedChange={(v) => setCrm({ ...crm, sincronizarClientes: v })} /><Label className="text-gray-400">Sincronizar clientes</Label></div>
                  <Button onClick={() => { crm && salvarConfigCRM(crm); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Code className="h-5 w-5" /> API Pública</CardTitle><CardDescription>Chave e limite de requisições.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {api && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={api.habilitada} onCheckedChange={(v) => setApi({ ...api, habilitada: v })} /><Label className="text-gray-400">Habilitar API pública</Label></div>
                  <div><Label className="text-gray-400">Chave de API</Label><Input type="password" value={api.chaveApi || ""} onChange={(e) => setApi({ ...api, chaveApi: e.target.value })} className="bg-background" placeholder="Gere uma chave segura" /></div>
                  <div><Label className="text-gray-400">Limite requisições/minuto</Label><Input type="number" min={1} value={api.limiteRequisicoesMinuto} onChange={(e) => setApi({ ...api, limiteRequisicoesMinuto: parseInt(e.target.value, 10) || 60 })} className="bg-background w-24" /></div>
                  <div><Label className="text-gray-400">URL da documentação</Label><Input value={api.documentacaoUrl || ""} onChange={(e) => setApi({ ...api, documentacaoUrl: e.target.value })} className="bg-background" placeholder="https://..." /></div>
                  <Button onClick={() => { api && salvarConfigAPIPublica(api); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Smartphone className="h-5 w-5" /> Aplicativo Mobile</CardTitle><CardDescription>Links para lojas e deep link.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {app && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={app.habilitado} onCheckedChange={(v) => setApp({ ...app, habilitado: v })} /><Label className="text-gray-400">Habilitar</Label></div>
                  <div><Label className="text-gray-400">Nome do app</Label><Input value={app.nomeApp} onChange={(e) => setApp({ ...app, nomeApp: e.target.value })} className="bg-background" /></div>
                  <div><Label className="text-gray-400">Deep link (scheme)</Label><Input value={app.deepLink || ""} onChange={(e) => setApp({ ...app, deepLink: e.target.value })} placeholder="myapp://" className="bg-background" /></div>
                  <div><Label className="text-gray-400">Google Play URL</Label><Input value={app.playStoreUrl || ""} onChange={(e) => setApp({ ...app, playStoreUrl: e.target.value })} className="bg-background" placeholder="https://play.google.com/..." /></div>
                  <div><Label className="text-gray-400">App Store URL</Label><Input value={app.appStoreUrl || ""} onChange={(e) => setApp({ ...app, appStoreUrl: e.target.value })} className="bg-background" placeholder="https://apps.apple.com/..." /></div>
                  <Button onClick={() => { app && salvarConfigAppMobile(app); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
