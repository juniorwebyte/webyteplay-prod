"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { formatarTelefone } from "@/lib/formatadores"

interface Configuracao {
  nomeSite: string
  emailContato: string
  telefone: string
  whatsapp: string
  moeda: string
  fusoHorario: string
  descricao: string
  redesSociais: {
    facebook: string
    instagram: string
    twitter: string
    youtube: string
  }
  maxNumeros: string
  tempoReserva: string
  numerosAleatorios: boolean
  exibirAposPagamento: boolean
  logo: string
  favicon: string
  cores: {
    primaria: string
    secundaria: string
    fundo: string
  }
  temaEscuro: boolean
  alternarTema: boolean
  animacoes: boolean
  efeitosNeon: boolean
  textoRodape: string
  exibirDesenvolvedor: boolean
  emailRemetente: string
  nomeRemetente: string
  smtp: {
    host: string
    porta: string
    usuario: string
    senha: string
    ssl: boolean
  }
  modelosEmail: {
    boasVindas: string
    compra: string
    pagamento: string
    premiacao: string
  }
  limites: {
    maxRifas: string
    maxPremios: string
    maxCotas: string
    maxImagens: string
  }
  cache: {
    ativo: boolean
    tempo: string
    compressao: boolean
    lazyLoading: boolean
  }
  seguranca: {
    captcha: boolean
    verificacaoEmail: boolean
    verificacaoTelefone: boolean
    autenticacaoDoisFatores: boolean
  }
  manutencao: {
    modo: boolean
    mensagem: string
  }
  backup: {
    automatico: boolean
    frequencia: string
  }
}

export default function AdminConfiguracao() {
  const [config, setConfig] = useState<Configuracao>({
    nomeSite: "WebytePlay Rifas",
    emailContato: "juniorwci70@gmail.com",
    telefone: "(11) 98480-1839",
    whatsapp: "(11) 98480-1839",
    moeda: "BRL",
    fusoHorario: "America/Sao_Paulo",
    descricao: "Plataforma de rifas com prêmios via PIX, cotas premiadas instantâneas e sorteios justos.",
    redesSociais: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: ""
    },
    maxNumeros: "15000000",
    tempoReserva: "15",
    numerosAleatorios: true,
    exibirAposPagamento: true,
    logo: "",
    favicon: "",
    cores: {
      primaria: "#00ff00",
      secundaria: "#9c27b0",
      fundo: "#000428"
    },
    temaEscuro: true,
    alternarTema: true,
    animacoes: true,
    efeitosNeon: true,
    textoRodape: "© 2025 WebytePlay. Todos os direitos reservados.",
    exibirDesenvolvedor: true,
    emailRemetente: "noreply@webyteplay.com",
    nomeRemetente: "WebytePlay Rifas",
    smtp: {
      host: "",
      porta: "",
      usuario: "",
      senha: "",
      ssl: true
    },
    modelosEmail: {
      boasVindas: "Olá {nome}, bem-vindo ao WebytePlay Rifas! Estamos felizes em tê-lo conosco.",
      compra: "Olá {nome}, sua compra foi confirmada! Você adquiriu {quantidade} números da rifa {rifa}.",
      pagamento: "Olá {nome}, seu pagamento de R$ {valor} foi confirmado! Seus números da rifa {rifa} já estão ativos.",
      premiacao: "Parabéns, {nome}! Você foi o ganhador da rifa {rifa} e receberá o prêmio {premio}."
    },
    limites: {
      maxRifas: "Ilimitado",
      maxPremios: "8",
      maxCotas: "15000000",
      maxImagens: "5"
    },
    cache: {
      ativo: true,
      tempo: "60",
      compressao: true,
      lazyLoading: true
    },
    seguranca: {
      captcha: true,
      verificacaoEmail: true,
      verificacaoTelefone: false,
      autenticacaoDoisFatores: false
    },
    manutencao: {
      modo: false,
      mensagem: "Estamos realizando uma manutenção programada. Voltaremos em breve!"
    },
    backup: {
      automatico: true,
      frequencia: "diario"
    }
  })

  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    // Carregar configurações do localStorage
    const saved = localStorage.getItem("configuracoes")
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch (e) {
        console.error("Erro ao carregar configurações:", e)
      }
    }
  }, [])

  const salvarConfiguracoes = () => {
    setSalvando(true)
    try {
      localStorage.setItem("configuracoes", JSON.stringify(config))
      setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)

      // Disparar evento para atualizar componentes do front-end
      window.dispatchEvent(new CustomEvent("configuracoes-updated"))
    } catch (e) {
      console.error("Erro ao salvar configurações:", e)
    } finally {
      setSalvando(false)
    }
  }

  const updateConfig = (updates: Partial<Configuracao>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const updateRedesSociais = (updates: Partial<Configuracao['redesSociais']>) => {
    setConfig(prev => ({
      ...prev,
      redesSociais: { ...prev.redesSociais, ...updates }
    }))
  }

  const updateCores = (updates: Partial<Configuracao['cores']>) => {
    setConfig(prev => ({
      ...prev,
      cores: { ...prev.cores, ...updates }
    }))
  }

  const updateSmtp = (updates: Partial<Configuracao['smtp']>) => {
    setConfig(prev => ({
      ...prev,
      smtp: { ...prev.smtp, ...updates }
    }))
  }

  const updateModelosEmail = (updates: Partial<Configuracao['modelosEmail']>) => {
    setConfig(prev => ({
      ...prev,
      modelosEmail: { ...prev.modelosEmail, ...updates }
    }))
  }

  const updateLimites = (updates: Partial<Configuracao['limites']>) => {
    setConfig(prev => ({
      ...prev,
      limites: { ...prev.limites, ...updates }
    }))
  }

  const updateCache = (updates: Partial<Configuracao['cache']>) => {
    setConfig(prev => ({
      ...prev,
      cache: { ...prev.cache, ...updates }
    }))
  }

  const updateSeguranca = (updates: Partial<Configuracao['seguranca']>) => {
    setConfig(prev => ({
      ...prev,
      seguranca: { ...prev.seguranca, ...updates }
    }))
  }

  const updateManutencao = (updates: Partial<Configuracao['manutencao']>) => {
    setConfig(prev => ({
      ...prev,
      manutencao: { ...prev.manutencao, ...updates }
    }))
  }

  const updateBackup = (updates: Partial<Configuracao['backup']>) => {
    setConfig(prev => ({
      ...prev,
      backup: { ...prev.backup, ...updates }
    }))
  }
  return (
    <Tabs defaultValue="geral" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="geral">Geral</TabsTrigger>
        <TabsTrigger value="aparencia">Aparência</TabsTrigger>
        <TabsTrigger value="emails">E-mails</TabsTrigger>
        <TabsTrigger value="avancado">Avançado</TabsTrigger>
      </TabsList>

      <TabsContent value="geral">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Configure as informações básicas do seu sistema de rifas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome-site">Nome do Site</Label>
                <Input
                  id="nome-site"
                  placeholder="Nome do seu site de rifas"
                  value={config.nomeSite}
                  onChange={(e) => updateConfig({ nomeSite: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-contato">E-mail de Contato</Label>
                <Input
                  id="email-contato"
                  type="email"
                  placeholder="E-mail principal"
                  value={config.emailContato}
                  onChange={(e) => updateConfig({ emailContato: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone de Contato</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={config.telefone}
                  onChange={(e) => updateConfig({ telefone: formatarTelefone(e.target.value) })}
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="(00) 00000-0000"
                  value={config.whatsapp}
                  onChange={(e) => updateConfig({ whatsapp: formatarTelefone(e.target.value) })}
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moeda">Moeda</Label>
                <Select value={config.moeda} onValueChange={(value) => updateConfig({ moeda: value })}>
                  <SelectTrigger id="moeda">
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                    <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuso-horario">Fuso Horário</Label>
                <Select value={config.fusoHorario} onValueChange={(value) => updateConfig({ fusoHorario: value })}>
                  <SelectTrigger id="fuso-horario">
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                    <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                    <SelectItem value="America/Noronha">Fernando de Noronha (GMT-2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição do Site</Label>
              <Textarea
                id="descricao"
                placeholder="Uma breve descrição do seu site"
                value={config.descricao}
                onChange={(e) => updateConfig({ descricao: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Redes Sociais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="URL da página do Facebook"
                    value={config.redesSociais.facebook}
                    onChange={(e) => updateRedesSociais({ facebook: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="URL do perfil do Instagram"
                    value={config.redesSociais.instagram}
                    onChange={(e) => updateRedesSociais({ instagram: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    placeholder="URL do perfil do Twitter"
                    value={config.redesSociais.twitter}
                    onChange={(e) => updateRedesSociais({ twitter: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    placeholder="URL do canal do YouTube"
                    value={config.redesSociais.youtube}
                    onChange={(e) => updateRedesSociais({ youtube: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configurações de Números</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-numeros">Máximo de Números por Rifa</Label>
                  <Input
                    id="max-numeros"
                    type="number"
                    min="100"
                    max="15000000"
                    value={config.maxNumeros}
                    onChange={(e) => updateConfig({ maxNumeros: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tempo-reserva">Tempo de Reserva (minutos)</Label>
                  <Input
                    id="tempo-reserva"
                    type="number"
                    min="1"
                    max="60"
                    value={config.tempoReserva}
                    onChange={(e) => updateConfig({ tempoReserva: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="numeros-aleatorios"
                    checked={config.numerosAleatorios}
                    onCheckedChange={(checked) => updateConfig({ numerosAleatorios: checked })}
                  />
                  <Label htmlFor="numeros-aleatorios">Sistema Rápido para Números Aleatórios</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="exibir-apos-pagamento"
                    checked={config.exibirAposPagamento}
                    onCheckedChange={(checked) => updateConfig({ exibirAposPagamento: checked })}
                  />
                  <Label htmlFor="exibir-apos-pagamento">Exibir Cotas Apenas Após Pagamento</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={salvarConfiguracoes} disabled={salvando}>
              {salvando ? "Salvando..." : salvo ? "Salvo!" : "Salvar Configurações"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="aparencia">
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>Personalize a aparência do seu sistema de rifas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo do Site</Label>
                <Input id="logo" type="file" accept="image/*" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon</Label>
                <Input id="favicon" type="file" accept="image/*" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Cores do Tema</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cor-primaria">Cor Primária</Label>
                  <div className="flex">
                    <Input
                      id="cor-primaria"
                      type="color"
                      value={config.cores.primaria}
                      onChange={(e) => updateCores({ primaria: e.target.value })}
                      className="w-12 p-1 h-10"
                    />
                    <Input
                      type="text"
                      value={config.cores.primaria}
                      onChange={(e) => updateCores({ primaria: e.target.value })}
                      className="flex-1 ml-2"
                      placeholder="Código hexadecimal"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor-secundaria">Cor Secundária</Label>
                  <div className="flex">
                    <Input
                      id="cor-secundaria"
                      type="color"
                      value={config.cores.secundaria}
                      onChange={(e) => updateCores({ secundaria: e.target.value })}
                      className="w-12 p-1 h-10"
                    />
                    <Input
                      type="text"
                      value={config.cores.secundaria}
                      onChange={(e) => updateCores({ secundaria: e.target.value })}
                      className="flex-1 ml-2"
                      placeholder="Código hexadecimal"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor-fundo">Cor de Fundo</Label>
                  <div className="flex">
                    <Input
                      id="cor-fundo"
                      type="color"
                      value={config.cores.fundo}
                      onChange={(e) => updateCores({ fundo: e.target.value })}
                      className="w-12 p-1 h-10"
                    />
                    <Input
                      type="text"
                      value={config.cores.fundo}
                      onChange={(e) => updateCores({ fundo: e.target.value })}
                      className="flex-1 ml-2"
                      placeholder="Código hexadecimal"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Elementos da Interface</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tema-escuro"
                    checked={config.temaEscuro}
                    onCheckedChange={(checked) => updateConfig({ temaEscuro: checked })}
                  />
                  <Label htmlFor="tema-escuro">Tema Escuro por Padrão</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="alternar-tema"
                    checked={config.alternarTema}
                    onCheckedChange={(checked) => updateConfig({ alternarTema: checked })}
                  />
                  <Label htmlFor="alternar-tema">Permitir Alternar Tema</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="animacoes"
                    checked={config.animacoes}
                    onCheckedChange={(checked) => updateConfig({ animacoes: checked })}
                  />
                  <Label htmlFor="animacoes">Animações de Partículas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="efeitos-neon"
                    checked={config.efeitosNeon}
                    onCheckedChange={(checked) => updateConfig({ efeitosNeon: checked })}
                  />
                  <Label htmlFor="efeitos-neon">Efeitos Neon</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Rodapé</h3>
              <div className="space-y-2">
                <Label htmlFor="texto-rodape">Texto do Rodapé</Label>
                <Textarea
                  id="texto-rodape"
                  placeholder="Texto que será exibido no rodapé do site"
                  value={config.textoRodape}
                  onChange={(e) => updateConfig({ textoRodape: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="exibir-desenvolvedor"
                  checked={config.exibirDesenvolvedor}
                  onCheckedChange={(checked) => updateConfig({ exibirDesenvolvedor: checked })}
                />
                <Label htmlFor="exibir-desenvolvedor">Exibir "Desenvolvido por Webyte Desenvolvimentos"</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={salvarConfiguracoes} disabled={salvando}>
              {salvando ? "Salvando..." : salvo ? "Salvo!" : "Salvar Configurações"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="emails">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de E-mails</CardTitle>
            <CardDescription>Configure os e-mails enviados pelo sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email-remetente">E-mail do Remetente</Label>
                <Input
                  id="email-remetente"
                  type="email"
                  placeholder="E-mail que enviará as mensagens"
                  value={config.emailRemetente}
                  onChange={(e) => updateConfig({ emailRemetente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome-remetente">Nome do Remetente</Label>
                <Input
                  id="nome-remetente"
                  placeholder="Nome que aparecerá nos e-mails"
                  value={config.nomeRemetente}
                  onChange={(e) => updateConfig({ nomeRemetente: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configurações SMTP</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Servidor SMTP</Label>
                  <Input
                    id="smtp-host"
                    placeholder="Ex: smtp.gmail.com"
                    value={config.smtp.host}
                    onChange={(e) => updateSmtp({ host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-porta">Porta</Label>
                  <Input
                    id="smtp-porta"
                    placeholder="Ex: 587"
                    value={config.smtp.porta}
                    onChange={(e) => updateSmtp({ porta: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-usuario">Usuário</Label>
                  <Input
                    id="smtp-usuario"
                    placeholder="Usuário SMTP"
                    value={config.smtp.usuario}
                    onChange={(e) => updateSmtp({ usuario: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-senha">Senha</Label>
                  <Input
                    id="smtp-senha"
                    type="password"
                    placeholder="Senha SMTP"
                    value={config.smtp.senha}
                    onChange={(e) => updateSmtp({ senha: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smtp-ssl"
                    checked={config.smtp.ssl}
                    onCheckedChange={(checked) => updateSmtp({ ssl: checked })}
                  />
                  <Label htmlFor="smtp-ssl">Usar SSL/TLS</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Modelos de E-mail</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-boas-vindas">E-mail de Boas-vindas</Label>
                  <Textarea
                    id="email-boas-vindas"
                    placeholder="Modelo de e-mail de boas-vindas"
                    value={config.modelosEmail.boasVindas}
                    onChange={(e) => updateModelosEmail({ boasVindas: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-compra">Confirmação de Compra</Label>
                  <Textarea
                    id="email-compra"
                    placeholder="Modelo de e-mail de confirmação de compra"
                    value={config.modelosEmail.compra}
                    onChange={(e) => updateModelosEmail({ compra: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-pagamento">Confirmação de Pagamento</Label>
                  <Textarea
                    id="email-pagamento"
                    placeholder="Modelo de e-mail de confirmação de pagamento"
                    value={config.modelosEmail.pagamento}
                    onChange={(e) => updateModelosEmail({ pagamento: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-premiacao">Notificação de Premiação</Label>
                  <Textarea
                    id="email-premiacao"
                    placeholder="Modelo de e-mail de notificação de premiação"
                    value={config.modelosEmail.premiacao}
                    onChange={(e) => updateModelosEmail({ premiacao: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Dica:</strong> Você pode usar as seguintes variáveis nos modelos de e-mail:
                  <br />
                  {"{nome}"} - Nome do cliente
                  <br />
                  {"{email}"} - Email do cliente
                  <br />
                  {"{rifa}"} - Nome da rifa
                  <br />
                  {"{quantidade}"} - Quantidade de números comprados
                  <br />
                  {"{numeros}"} - Números comprados
                  <br />
                  {"{valor}"} - Valor da compra
                  <br />
                  {"{premio}"} - Prêmio da rifa
                  <br />
                  {"{data}"} - Data da compra/sorteio
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={salvarConfiguracoes} disabled={salvando}>
              {salvando ? "Salvando..." : salvo ? "Salvo!" : "Salvar Configurações"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="avancado">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Avançadas</CardTitle>
            <CardDescription>Configure opções avançadas do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Limites do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-rifas">Máximo de Rifas Ativas</Label>
                  <Input id="max-rifas" type="number" min="1" value={config.limites.maxRifas} disabled />
                  <p className="text-xs text-muted-foreground">Seu plano permite rifas ilimitadas</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-premios">Máximo de Prêmios por Rifa</Label>
                  <Input
                    id="max-premios"
                    type="number"
                    min="1"
                    max="8"
                    value={config.limites.maxPremios}
                    onChange={(e) => updateLimites({ maxPremios: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-cotas">Máximo de Cotas por Rifa</Label>
                  <Input
                    id="max-cotas"
                    type="number"
                    min="100"
                    max="15000000"
                    value={config.limites.maxCotas}
                    onChange={(e) => updateLimites({ maxCotas: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-imagens">Máximo de Imagens por Rifa</Label>
                  <Input
                    id="max-imagens"
                    type="number"
                    min="1"
                    max="10"
                    value={config.limites.maxImagens}
                    onChange={(e) => updateLimites({ maxImagens: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Cache e Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cache-ativo"
                    checked={config.cache.ativo}
                    onCheckedChange={(checked) => updateCache({ ativo: checked })}
                  />
                  <Label htmlFor="cache-ativo">Ativar Cache</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tempo-cache">Tempo de Cache (minutos)</Label>
                  <Input
                    id="tempo-cache"
                    type="number"
                    min="5"
                    max="1440"
                    value={config.cache.tempo}
                    onChange={(e) => updateCache({ tempo: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compressao"
                    checked={config.cache.compressao}
                    onCheckedChange={(checked) => updateCache({ compressao: checked })}
                  />
                  <Label htmlFor="compressao">Ativar Compressão</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="lazy-loading"
                    checked={config.cache.lazyLoading}
                    onCheckedChange={(checked) => updateCache({ lazyLoading: checked })}
                  />
                  <Label htmlFor="lazy-loading">Lazy Loading de Imagens</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Segurança</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="captcha"
                    checked={config.seguranca.captcha}
                    onCheckedChange={(checked) => updateSeguranca({ captcha: checked })}
                  />
                  <Label htmlFor="captcha">Ativar CAPTCHA</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="verificacao-email"
                    checked={config.seguranca.verificacaoEmail}
                    onCheckedChange={(checked) => updateSeguranca({ verificacaoEmail: checked })}
                  />
                  <Label htmlFor="verificacao-email">Verificação de E-mail</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="verificacao-telefone"
                    checked={config.seguranca.verificacaoTelefone}
                    onCheckedChange={(checked) => updateSeguranca({ verificacaoTelefone: checked })}
                  />
                  <Label htmlFor="verificacao-telefone">Verificação de Telefone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autenticacao-dois-fatores"
                    checked={config.seguranca.autenticacaoDoisFatores}
                    onCheckedChange={(checked) => updateSeguranca({ autenticacaoDoisFatores: checked })}
                  />
                  <Label htmlFor="autenticacao-dois-fatores">Autenticação de Dois Fatores</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Manutenção</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="modo-manutencao"
                    checked={config.manutencao.modo}
                    onCheckedChange={(checked) => updateManutencao({ modo: checked })}
                  />
                  <Label htmlFor="modo-manutencao">Modo de Manutenção</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mensagem-manutencao">Mensagem de Manutenção</Label>
                  <Textarea
                    id="mensagem-manutencao"
                    placeholder="Mensagem exibida durante a manutenção"
                    value={config.manutencao.mensagem}
                    onChange={(e) => updateManutencao({ mensagem: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Backup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="backup-automatico"
                    checked={config.backup.automatico}
                    onCheckedChange={(checked) => updateBackup({ automatico: checked })}
                  />
                  <Label htmlFor="backup-automatico">Backup Automático</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequencia-backup">Frequência de Backup</Label>
                  <Select
                    value={config.backup.frequencia}
                    onValueChange={(value) => updateBackup({ frequencia: value })}
                  >
                    <SelectTrigger id="frequencia-backup">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="outline">Fazer Backup Manual</Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="destructive">Redefinir para Padrão</Button>
            <Button onClick={salvarConfiguracoes} disabled={salvando}>
              {salvando ? "Salvando..." : salvo ? "Salvo!" : "Salvar Configurações"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
