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
  Settings,
  Building2,
  Globe,
  Palette,
  Layout,
  Mail,
  FileText,
  DollarSign,
  Percent,
  Languages,
  Plug,
  Webhook,
  Bell,
  Database,
  Shield,
  FileCheck,
  Plus,
  Pencil,
  Trash2,
  Save,
} from "lucide-react"
import {
  getConfigLoja,
  salvarConfigLoja,
  getInfoEmpresa,
  salvarInfoEmpresa,
  getConfigDominio,
  salvarConfigDominio,
  getConfigAparencia,
  salvarConfigAparencia,
  getConfigLayout,
  salvarConfigLayout,
  getConfigCoresBranding,
  salvarConfigCoresBranding,
  getConfigEmail,
  salvarConfigEmail,
  listarTemplatesEmail,
  salvarTemplateEmail,
  getConfigMoeda,
  salvarConfigMoeda,
  getConfigImpostos,
  salvarConfigImpostos,
  getConfigRegiaoIdioma,
  salvarConfigRegiaoIdioma,
  listarIntegracoes,
  salvarIntegracao,
  listarWebhooks,
  salvarWebhook,
  getConfigNotificacoes,
  salvarConfigNotificacoes,
  getTextoPrivacidade,
  salvarTextoPrivacidade,
  getTextoTermos,
  salvarTextoTermos,
  type TemplateEmail,
  type ConfigIntegracao,
  type ConfigWebhook,
} from "@/lib/configuracoes-loja-store"
import { formatarCNPJ, formatarTelefone, formatarCEP } from "@/lib/formatadores"
import { buscarCep } from "@/lib/use-cep"

export default function LojaConfiguracoesPage() {
  const [abaAtiva, setAbaAtiva] = useState("loja")
  const [configLoja, setConfigLoja] = useState<ReturnType<typeof getConfigLoja> | null>(null)
  const [infoEmpresa, setInfoEmpresa] = useState<ReturnType<typeof getInfoEmpresa> | null>(null)
  const [configDominio, setConfigDominio] = useState<ReturnType<typeof getConfigDominio> | null>(null)
  const [configAparencia, setConfigAparencia] = useState<ReturnType<typeof getConfigAparencia> | null>(null)
  const [configLayout, setConfigLayout] = useState<ReturnType<typeof getConfigLayout> | null>(null)
  const [configCores, setConfigCores] = useState<ReturnType<typeof getConfigCoresBranding> | null>(null)
  const [configEmail, setConfigEmail] = useState<ReturnType<typeof getConfigEmail> | null>(null)
  const [templates, setTemplates] = useState<TemplateEmail[]>([])
  const [configMoeda, setConfigMoeda] = useState<ReturnType<typeof getConfigMoeda> | null>(null)
  const [configImpostos, setConfigImpostos] = useState<ReturnType<typeof getConfigImpostos> | null>(null)
  const [configRegiao, setConfigRegiao] = useState<ReturnType<typeof getConfigRegiaoIdioma> | null>(null)
  const [integracoes, setIntegracoes] = useState<ConfigIntegracao[]>([])
  const [webhooks, setWebhooks] = useState<ConfigWebhook[]>([])
  const [configNotif, setConfigNotif] = useState<ReturnType<typeof getConfigNotificacoes> | null>(null)
  const [textoPrivacidade, setTextoPrivacidade] = useState("")
  const [textoTermos, setTextoTermos] = useState("")
  const [dialogTemplateOpen, setDialogTemplateOpen] = useState(false)
  const [dialogIntegracaoOpen, setDialogIntegracaoOpen] = useState(false)
  const [dialogWebhookOpen, setDialogWebhookOpen] = useState(false)
  const [formTemplate, setFormTemplate] = useState({ codigo: "", nome: "", assunto: "", corpoHtml: "", ativo: true })
  const [formIntegracao, setFormIntegracao] = useState({ nome: "", tipo: "api" as ConfigIntegracao["tipo"], url: "", apiKey: "", ativo: true })
  const [formWebhook, setFormWebhook] = useState({ evento: "", url: "", secret: "", ativo: true })

  const carregar = () => {
    setConfigLoja(getConfigLoja())
    setInfoEmpresa(getInfoEmpresa())
    setConfigDominio(getConfigDominio())
    setConfigAparencia(getConfigAparencia())
    setConfigLayout(getConfigLayout())
    setConfigCores(getConfigCoresBranding())
    setConfigEmail(getConfigEmail())
    setTemplates(listarTemplatesEmail())
    setConfigMoeda(getConfigMoeda())
    setConfigImpostos(getConfigImpostos())
    setConfigRegiao(getConfigRegiaoIdioma())
    setIntegracoes(listarIntegracoes())
    setWebhooks(listarWebhooks())
    setConfigNotif(getConfigNotificacoes())
    setTextoPrivacidade(getTextoPrivacidade())
    setTextoTermos(getTextoTermos())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("configuracoes-loja-updated", h)
    return () => window.removeEventListener("configuracoes-loja-updated", h)
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Settings className="h-8 w-8 text-[#FFB800]" />
        Configurações Gerais
      </h1>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-6 bg-[#171923] border border-gray-800 max-h-32 overflow-y-auto">
          <TabsTrigger value="loja">Loja</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="dominio">Domínio</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="cores">Cores</TabsTrigger>
          <TabsTrigger value="emails">E-mails</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="moeda">Moeda</TabsTrigger>
          <TabsTrigger value="impostos">Impostos</TabsTrigger>
          <TabsTrigger value="regiao">Região</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="privacidade">Privacidade</TabsTrigger>
          <TabsTrigger value="termos">Termos</TabsTrigger>
        </TabsList>

        <TabsContent value="loja">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white">Configurações da Loja</CardTitle><CardDescription>Nome, slogan e opções gerais.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {configLoja && (
                <>
                  <div><Label className="text-gray-400">Nome da loja</Label><Input value={configLoja.nome} onChange={(e) => setConfigLoja({ ...configLoja, nome: e.target.value })} className="bg-background" /></div>
                  <div><Label className="text-gray-400">Slogan</Label><Input value={configLoja.slogan || ""} onChange={(e) => setConfigLoja({ ...configLoja, slogan: e.target.value })} className="bg-background" /></div>
                  <div><Label className="text-gray-400">Itens por página</Label><Input type="number" min={4} value={configLoja.itensPorPagina} onChange={(e) => setConfigLoja({ ...configLoja, itensPorPagina: parseInt(e.target.value, 10) || 12 })} className="bg-background w-24" /></div>
                  <div className="flex items-center gap-2"><Switch checked={configLoja.modoManutencao} onCheckedChange={(v) => setConfigLoja({ ...configLoja, modoManutencao: v })} /><Label className="text-gray-400">Modo manutenção</Label></div>
                  <Button onClick={() => { configLoja && salvarConfigLoja(configLoja); toast.success("Configurações salvas!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresa">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Building2 className="h-5 w-5" /> Informações da Empresa</CardTitle><CardDescription>Razão social, CNPJ e contato.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {infoEmpresa && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-gray-400">Razão social</Label><Input value={infoEmpresa.razaoSocial} onChange={(e) => setInfoEmpresa({ ...infoEmpresa, razaoSocial: e.target.value })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">Nome fantasia</Label><Input value={infoEmpresa.nomeFantasia} onChange={(e) => setInfoEmpresa({ ...infoEmpresa, nomeFantasia: e.target.value })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">CNPJ</Label><Input value={infoEmpresa.cnpj} onChange={(e) => setInfoEmpresa({ ...infoEmpresa, cnpj: formatarCNPJ(e.target.value) })} placeholder="00.000.000/0001-00" maxLength={18} className="bg-background" /></div>
                    <div><Label className="text-gray-400">E-mail</Label><Input type="email" value={infoEmpresa.email} onChange={(e) => setInfoEmpresa({ ...infoEmpresa, email: e.target.value })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">Telefone</Label><Input value={infoEmpresa.telefone} onChange={(e) => setInfoEmpresa({ ...infoEmpresa, telefone: formatarTelefone(e.target.value) })} placeholder="(00) 00000-0000" maxLength={15} className="bg-background" /></div>
                    <div><Label className="text-gray-400">CEP</Label>
                      <div className="flex gap-2">
                        <Input value={infoEmpresa.cep} onChange={(e) => setInfoEmpresa({ ...infoEmpresa, cep: formatarCEP(e.target.value) })} placeholder="00000-000" maxLength={9} className="bg-background" />
                        <Button type="button" variant="outline" size="sm" onClick={async () => { const cep = infoEmpresa.cep.replace(/\D/g, ""); if (cep.length === 8) { const end = await buscarCep(cep); if (end) { setInfoEmpresa({ ...infoEmpresa, cep: formatarCEP(cep), endereco: end.logradouro, bairro: end.bairro, cidade: end.localidade, estado: end.uf }); toast.success("Endereço preenchido!"); } else toast.error("CEP não encontrado"); } else toast.error("CEP inválido"); }}>Buscar</Button>
                      </div>
                    </div>
                    <div><Label className="text-gray-400">Endereço</Label><Input value={infoEmpresa.endereco} onChange={(e) => setInfoEmpresa({ ...infoEmpresa, endereco: e.target.value })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">Bairro</Label><Input value={infoEmpresa.bairro || ""} onChange={(e) => setInfoEmpresa({ ...infoEmpresa, bairro: e.target.value })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">Cidade</Label><Input value={infoEmpresa.cidade} onChange={(e) => setInfoEmpresa({ ...infoEmpresa, cidade: e.target.value })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">Estado</Label><Input value={infoEmpresa.estado} onChange={(e) => setInfoEmpresa({ ...infoEmpresa, estado: e.target.value })} className="bg-background w-20" placeholder="UF" maxLength={2} /></div>
                  </div>
                  <Button onClick={() => { infoEmpresa && salvarInfoEmpresa(infoEmpresa); toast.success("Empresa salva!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dominio">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Globe className="h-5 w-5" /> Domínio</CardTitle><CardDescription>Domínio principal e SSL.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {configDominio && (
                <>
                  <div><Label className="text-gray-400">Domínio principal</Label><Input value={configDominio.dominioPrincipal} onChange={(e) => setConfigDominio({ ...configDominio, dominioPrincipal: e.target.value })} placeholder="www.sualoja.com.br" className="bg-background" /></div>
                  <div><Label className="text-gray-400">Domínio alternativo</Label><Input value={configDominio.dominioAlternativo || ""} onChange={(e) => setConfigDominio({ ...configDominio, dominioAlternativo: e.target.value })} className="bg-background" /></div>
                  <div className="flex items-center gap-2"><Switch checked={configDominio.sslHabilitado} onCheckedChange={(v) => setConfigDominio({ ...configDominio, sslHabilitado: v })} /><Label className="text-gray-400">SSL habilitado (HTTPS)</Label></div>
                  <Button onClick={() => { configDominio && salvarConfigDominio(configDominio); toast.success("Domínio salvo!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Palette className="h-5 w-5" /> Aparência / Tema</CardTitle><CardDescription>Tema e URLs de logo/favicon.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {configAparencia && (
                <>
                  <div><Label className="text-gray-400">Tema</Label>
                    <Select value={configAparencia.tema} onValueChange={(v: "claro" | "escuro" | "sistema") => setConfigAparencia({ ...configAparencia, tema: v })}>
                      <SelectTrigger className="bg-background w-40"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="claro">Claro</SelectItem><SelectItem value="escuro">Escuro</SelectItem><SelectItem value="sistema">Sistema</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-gray-400">URL da logo</Label><Input value={configAparencia.logoUrl || ""} onChange={(e) => setConfigAparencia({ ...configAparencia, logoUrl: e.target.value })} className="bg-background" /></div>
                  <div><Label className="text-gray-400">URL do favicon</Label><Input value={configAparencia.faviconUrl || ""} onChange={(e) => setConfigAparencia({ ...configAparencia, faviconUrl: e.target.value })} className="bg-background" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-gray-400">Cor primária</Label><Input type="color" value={configAparencia.corPrimaria} onChange={(e) => setConfigAparencia({ ...configAparencia, corPrimaria: e.target.value })} className="h-10 w-20 p-1 bg-background" /></div>
                    <div><Label className="text-gray-400">Cor secundária</Label><Input type="color" value={configAparencia.corSecundaria} onChange={(e) => setConfigAparencia({ ...configAparencia, corSecundaria: e.target.value })} className="h-10 w-20 p-1 bg-background" /></div>
                  </div>
                  <Button onClick={() => { configAparencia && salvarConfigAparencia(configAparencia); toast.success("Aparência salva!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Layout className="h-5 w-5" /> Personalização de Layout</CardTitle><CardDescription>Header, sidebar e rodapé.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {configLayout && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={configLayout.headerFixo} onCheckedChange={(v) => setConfigLayout({ ...configLayout, headerFixo: v })} /><Label className="text-gray-400">Header fixo</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={configLayout.sidebarEsquerda} onCheckedChange={(v) => setConfigLayout({ ...configLayout, sidebarEsquerda: v })} /><Label className="text-gray-400">Sidebar à esquerda</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={configLayout.rodapeComLinks} onCheckedChange={(v) => setConfigLayout({ ...configLayout, rodapeComLinks: v })} /><Label className="text-gray-400">Rodapé com links</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={configLayout.exibirBreadcrumb} onCheckedChange={(v) => setConfigLayout({ ...configLayout, exibirBreadcrumb: v })} /><Label className="text-gray-400">Exibir breadcrumb</Label></div>
                  <Button onClick={() => { configLayout && salvarConfigLayout(configLayout); toast.success("Layout salvo!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cores">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2">Cores e Branding</CardTitle><CardDescription>Paleta da loja.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {configCores && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-gray-400">Primária</Label><Input type="color" value={configCores.corPrimaria} onChange={(e) => setConfigCores({ ...configCores, corPrimaria: e.target.value })} className="h-10 w-20 p-1 bg-background" /></div>
                    <div><Label className="text-gray-400">Secundária</Label><Input type="color" value={configCores.corSecundaria} onChange={(e) => setConfigCores({ ...configCores, corSecundaria: e.target.value })} className="h-10 w-20 p-1 bg-background" /></div>
                    <div><Label className="text-gray-400">Destaque</Label><Input type="color" value={configCores.corDestaque} onChange={(e) => setConfigCores({ ...configCores, corDestaque: e.target.value })} className="h-10 w-20 p-1 bg-background" /></div>
                    <div><Label className="text-gray-400">Fundo</Label><Input type="color" value={configCores.corFundo} onChange={(e) => setConfigCores({ ...configCores, corFundo: e.target.value })} className="h-10 w-20 p-1 bg-background" /></div>
                    <div><Label className="text-gray-400">Texto</Label><Input type="color" value={configCores.corTexto} onChange={(e) => setConfigCores({ ...configCores, corTexto: e.target.value })} className="h-10 w-20 p-1 bg-background" /></div>
                  </div>
                  <Button onClick={() => { configCores && salvarConfigCoresBranding(configCores); toast.success("Cores salvas!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Mail className="h-5 w-5" /> Configuração de E-mails</CardTitle><CardDescription>SMTP para envio.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {configEmail && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-gray-400">Host SMTP</Label><Input value={configEmail.smtpHost} onChange={(e) => setConfigEmail({ ...configEmail, smtpHost: e.target.value })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">Porta</Label><Input type="number" value={configEmail.smtpPort} onChange={(e) => setConfigEmail({ ...configEmail, smtpPort: parseInt(e.target.value, 10) || 587 })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">Usuário</Label><Input value={configEmail.smtpUser} onChange={(e) => setConfigEmail({ ...configEmail, smtpUser: e.target.value })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">Senha</Label><Input type="password" value={configEmail.smtpPass} onChange={(e) => setConfigEmail({ ...configEmail, smtpPass: e.target.value })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">Remetente (nome)</Label><Input value={configEmail.remetenteNome} onChange={(e) => setConfigEmail({ ...configEmail, remetenteNome: e.target.value })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">Remetente (e-mail)</Label><Input type="email" value={configEmail.remetenteEmail} onChange={(e) => setConfigEmail({ ...configEmail, remetenteEmail: e.target.value })} className="bg-background" /></div>
                  </div>
                  <div className="flex items-center gap-2"><Switch checked={configEmail.usaTls} onCheckedChange={(v) => setConfigEmail({ ...configEmail, usaTls: v })} /><Label className="text-gray-400">Usar TLS</Label></div>
                  <Button onClick={() => { configEmail && salvarConfigEmail(configEmail); toast.success("E-mail salvo!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle className="text-white flex items-center gap-2"><FileText className="h-5 w-5" /> Templates de E-mail</CardTitle><CardDescription>Assunto e corpo para cada tipo de e-mail.</CardDescription></div>
              <Button variant="outline" onClick={() => { setFormTemplate({ codigo: "", nome: "", assunto: "", corpoHtml: "", ativo: true }); setDialogTemplateOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Novo</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead className="text-gray-300">Código</TableHead><TableHead className="text-gray-300">Nome</TableHead><TableHead className="text-gray-300">Assunto</TableHead><TableHead className="text-gray-300">Ativo</TableHead></TableRow></TableHeader>
                <TableBody>
                  {templates.map((t) => (
                    <TableRow key={t.id}><TableCell className="font-mono text-white">{t.codigo}</TableCell><TableCell className="text-gray-400">{t.nome}</TableCell><TableCell className="text-gray-400 truncate max-w-[200px]">{t.assunto}</TableCell><TableCell><Badge className={t.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{t.ativo ? "Sim" : "Não"}</Badge></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
              {templates.length === 0 && <p className="text-gray-500 py-4">Nenhum template. Crie um para pedido, boas-vindas, etc.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moeda">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><DollarSign className="h-5 w-5" /> Configuração de Moeda</CardTitle><CardDescription>Símbolo e formato.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {configMoeda && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-gray-400">Código (ISO)</Label><Input value={configMoeda.codigo} onChange={(e) => setConfigMoeda({ ...configMoeda, codigo: e.target.value })} placeholder="BRL" className="bg-background" /></div>
                    <div><Label className="text-gray-400">Símbolo</Label><Input value={configMoeda.simbolo} onChange={(e) => setConfigMoeda({ ...configMoeda, simbolo: e.target.value })} placeholder="R$" className="bg-background" /></div>
                    <div><Label className="text-gray-400">Casas decimais</Label><Input type="number" min={0} value={configMoeda.casasDecimais} onChange={(e) => setConfigMoeda({ ...configMoeda, casasDecimais: parseInt(e.target.value, 10) || 2 })} className="bg-background w-24" /></div>
                    <div><Label className="text-gray-400">Posição do símbolo</Label>
                      <Select value={configMoeda.posicaoSymbol} onValueChange={(v: "antes" | "depois") => setConfigMoeda({ ...configMoeda, posicaoSymbol: v })}>
                        <SelectTrigger className="bg-background w-32"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="antes">Antes</SelectItem><SelectItem value="depois">Depois</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={() => { configMoeda && salvarConfigMoeda(configMoeda); toast.success("Moeda salva!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impostos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Percent className="h-5 w-5" /> Configuração de Impostos</CardTitle><CardDescription>Alíquotas padrão (%).</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {configImpostos && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><Label className="text-gray-400">ICMS (%)</Label><Input type="number" min={0} step={0.01} value={configImpostos.icmsPadrao} onChange={(e) => setConfigImpostos({ ...configImpostos, icmsPadrao: parseFloat(e.target.value) || 0 })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">PIS (%)</Label><Input type="number" min={0} step={0.01} value={configImpostos.pisPadrao} onChange={(e) => setConfigImpostos({ ...configImpostos, pisPadrao: parseFloat(e.target.value) || 0 })} className="bg-background" /></div>
                    <div><Label className="text-gray-400">COFINS (%)</Label><Input type="number" min={0} step={0.01} value={configImpostos.cofinsPadrao} onChange={(e) => setConfigImpostos({ ...configImpostos, cofinsPadrao: parseFloat(e.target.value) || 0 })} className="bg-background" /></div>
                  </div>
                  <div><Label className="text-gray-400">Incidência</Label>
                    <Select value={configImpostos.incidencia} onValueChange={(v: "incluso" | "excluso") => setConfigImpostos({ ...configImpostos, incidencia: v })}>
                      <SelectTrigger className="bg-background w-40"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="incluso">Incluso no preço</SelectItem><SelectItem value="excluso">Excluso</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => { configImpostos && salvarConfigImpostos(configImpostos); toast.success("Impostos salvos!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regiao">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Languages className="h-5 w-5" /> Região / Idioma</CardTitle><CardDescription>País, idioma e formato de data/hora.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {configRegiao && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-gray-400">País</Label><Input value={configRegiao.pais} onChange={(e) => setConfigRegiao({ ...configRegiao, pais: e.target.value })} placeholder="BR" className="bg-background" /></div>
                    <div><Label className="text-gray-400">Idioma</Label><Input value={configRegiao.idioma} onChange={(e) => setConfigRegiao({ ...configRegiao, idioma: e.target.value })} placeholder="pt-BR" className="bg-background" /></div>
                    <div><Label className="text-gray-400">Fuso horário</Label><Input value={configRegiao.fusoHorario} onChange={(e) => setConfigRegiao({ ...configRegiao, fusoHorario: e.target.value })} placeholder="America/Sao_Paulo" className="bg-background" /></div>
                    <div><Label className="text-gray-400">Formato data</Label><Input value={configRegiao.formatoData} onChange={(e) => setConfigRegiao({ ...configRegiao, formatoData: e.target.value })} placeholder="dd/MM/yyyy" className="bg-background" /></div>
                    <div><Label className="text-gray-400">Formato hora</Label><Input value={configRegiao.formatoHora} onChange={(e) => setConfigRegiao({ ...configRegiao, formatoHora: e.target.value })} placeholder="HH:mm" className="bg-background" /></div>
                  </div>
                  <Button onClick={() => { configRegiao && salvarConfigRegiaoIdioma(configRegiao); toast.success("Região salva!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle className="text-white flex items-center gap-2"><Plug className="h-5 w-5" /> Integrações (API)</CardTitle><CardDescription>APIs externas e credenciais.</CardDescription></div>
              <Button variant="outline" onClick={() => { setFormIntegracao({ nome: "", tipo: "api", url: "", apiKey: "", ativo: true }); setDialogIntegracaoOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Nova</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead className="text-gray-300">Nome</TableHead><TableHead className="text-gray-300">Tipo</TableHead><TableHead className="text-gray-300">Ativo</TableHead></TableRow></TableHeader>
                <TableBody>
                  {integracoes.map((i) => (
                    <TableRow key={i.id}><TableCell className="text-white">{i.nome}</TableCell><TableCell><Badge variant="outline">{i.tipo}</Badge></TableCell><TableCell><Badge className={i.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{i.ativo ? "Sim" : "Não"}</Badge></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
              {integracoes.length === 0 && <p className="text-gray-500 py-4">Nenhuma integração configurada.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle className="text-white flex items-center gap-2"><Webhook className="h-5 w-5" /> Webhooks</CardTitle><CardDescription>URLs para eventos (pedido pago, etc.).</CardDescription></div>
              <Button variant="outline" onClick={() => { setFormWebhook({ evento: "", url: "", secret: "", ativo: true }); setDialogWebhookOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Novo</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead className="text-gray-300">Evento</TableHead><TableHead className="text-gray-300">URL</TableHead><TableHead className="text-gray-300">Ativo</TableHead></TableRow></TableHeader>
                <TableBody>
                  {webhooks.map((w) => (
                    <TableRow key={w.id}><TableCell className="text-white">{w.evento}</TableCell><TableCell className="text-gray-400 text-sm truncate max-w-[250px]">{w.url}</TableCell><TableCell><Badge className={w.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{w.ativo ? "Sim" : "Não"}</Badge></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
              {webhooks.length === 0 && <p className="text-gray-500 py-4">Nenhum webhook configurado.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Bell className="h-5 w-5" /> Configuração de Notificações</CardTitle><CardDescription>E-mails e alertas.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {configNotif && (
                <>
                  <div className="flex items-center gap-2"><Switch checked={configNotif.emailPedidoNovo} onCheckedChange={(v) => setConfigNotif({ ...configNotif, emailPedidoNovo: v })} /><Label className="text-gray-400">E-mail ao criar pedido</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={configNotif.emailPedidoPago} onCheckedChange={(v) => setConfigNotif({ ...configNotif, emailPedidoPago: v })} /><Label className="text-gray-400">E-mail ao pagar pedido</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={configNotif.emailCarrinhoAbandonado} onCheckedChange={(v) => setConfigNotif({ ...configNotif, emailCarrinhoAbandonado: v })} /><Label className="text-gray-400">E-mail carrinho abandonado</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={configNotif.pushHabilitado} onCheckedChange={(v) => setConfigNotif({ ...configNotif, pushHabilitado: v })} /><Label className="text-gray-400">Notificações push</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={configNotif.adminRecebeAlertas} onCheckedChange={(v) => setConfigNotif({ ...configNotif, adminRecebeAlertas: v })} /><Label className="text-gray-400">Admin recebe alertas</Label></div>
                  <div><Label className="text-gray-400">E-mail admin (alertas)</Label><Input type="email" value={configNotif.emailAdminAlertas || ""} onChange={(e) => setConfigNotif({ ...configNotif, emailAdminAlertas: e.target.value })} className="bg-background" /></div>
                  <Button onClick={() => { configNotif && salvarConfigNotificacoes(configNotif); toast.success("Notificações salvas!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Database className="h-5 w-5" /> Backup</CardTitle><CardDescription>Exportar dados da loja (localStorage).</CardDescription></CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">Os dados da loja são armazenados no navegador. Para backup completo, use a exportação de relatórios (CSV) ou implemente um backend com banco de dados.</p>
              <Button variant="outline" onClick={() => {
                const keys: string[] = []
                for (let i = 0; i < localStorage.length; i++) {
                  const k = localStorage.key(i)
                  if (k && (k.startsWith("loja-") || k.startsWith("gateway-"))) keys.push(k)
                }
                const obj: Record<string, string> = {}
                keys.forEach((k) => { obj[k] = localStorage.getItem(k) || "" })
                const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `backup-loja-${new Date().toISOString().slice(0, 10)}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}>Exportar backup (JSON)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacidade">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Shield className="h-5 w-5" /> Política de Privacidade</CardTitle><CardDescription>Texto exibido na página de privacidade.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <Textarea value={textoPrivacidade} onChange={(e) => setTextoPrivacidade(e.target.value)} rows={12} className="bg-background font-mono text-sm" placeholder="Conteúdo em HTML ou texto..." />
              <Button onClick={() => { salvarTextoPrivacidade(textoPrivacidade); toast.success("Privacidade salva!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="termos">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><FileCheck className="h-5 w-5" /> Termos de Uso</CardTitle><CardDescription>Texto exibido na página de termos.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <Textarea value={textoTermos} onChange={(e) => setTextoTermos(e.target.value)} rows={12} className="bg-background font-mono text-sm" placeholder="Conteúdo em HTML ou texto..." />
              <Button onClick={() => { salvarTextoTermos(textoTermos); toast.success("Termos salvos!"); carregar(); }} className="bg-[#FFB800] hover:bg-[#FFA500] text-black"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogTemplateOpen} onOpenChange={setDialogTemplateOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Novo template de e-mail</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Código</Label><Input value={formTemplate.codigo} onChange={(e) => setFormTemplate({ ...formTemplate, codigo: e.target.value })} placeholder="pedido_novo" className="bg-background" /></div>
            <div><Label className="text-gray-400">Nome</Label><Input value={formTemplate.nome} onChange={(e) => setFormTemplate({ ...formTemplate, nome: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Assunto</Label><Input value={formTemplate.assunto} onChange={(e) => setFormTemplate({ ...formTemplate, assunto: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Corpo (HTML)</Label><Textarea value={formTemplate.corpoHtml} onChange={(e) => setFormTemplate({ ...formTemplate, corpoHtml: e.target.value })} rows={4} className="bg-background" /></div>
            <div className="flex items-center gap-2"><Switch checked={formTemplate.ativo} onCheckedChange={(v) => setFormTemplate({ ...formTemplate, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogTemplateOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarTemplateEmail(formTemplate); toast.success("Template salvo!"); setDialogTemplateOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogIntegracaoOpen} onOpenChange={setDialogIntegracaoOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Nova integração (API)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Nome</Label><Input value={formIntegracao.nome} onChange={(e) => setFormIntegracao({ ...formIntegracao, nome: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Tipo</Label><Select value={formIntegracao.tipo} onValueChange={(v: ConfigIntegracao["tipo"]) => setFormIntegracao({ ...formIntegracao, tipo: v })}><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="api">API</SelectItem><SelectItem value="webhook">Webhook</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent></Select></div>
            <div><Label className="text-gray-400">URL</Label><Input value={formIntegracao.url} onChange={(e) => setFormIntegracao({ ...formIntegracao, url: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">API Key (opcional)</Label><Input type="password" value={formIntegracao.apiKey} onChange={(e) => setFormIntegracao({ ...formIntegracao, apiKey: e.target.value })} className="bg-background" /></div>
            <div className="flex items-center gap-2"><Switch checked={formIntegracao.ativo} onCheckedChange={(v) => setFormIntegracao({ ...formIntegracao, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogIntegracaoOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarIntegracao(formIntegracao); toast.success("Integração salva!"); setDialogIntegracaoOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogWebhookOpen} onOpenChange={setDialogWebhookOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader><DialogTitle className="text-white">Novo webhook</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Evento</Label><Input value={formWebhook.evento} onChange={(e) => setFormWebhook({ ...formWebhook, evento: e.target.value })} placeholder="pedido.pago" className="bg-background" /></div>
            <div><Label className="text-gray-400">URL</Label><Input value={formWebhook.url} onChange={(e) => setFormWebhook({ ...formWebhook, url: e.target.value })} placeholder="https://..." className="bg-background" /></div>
            <div><Label className="text-gray-400">Secret (opcional)</Label><Input type="password" value={formWebhook.secret} onChange={(e) => setFormWebhook({ ...formWebhook, secret: e.target.value })} className="bg-background" /></div>
            <div className="flex items-center gap-2"><Switch checked={formWebhook.ativo} onCheckedChange={(v) => setFormWebhook({ ...formWebhook, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogWebhookOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarWebhook(formWebhook); toast.success("Webhook salvo!"); setDialogWebhookOpen(false); carregar(); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
