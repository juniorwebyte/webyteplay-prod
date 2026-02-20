"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  Trash2,
  Edit,
  Plus,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  TwitterIcon as TikTok,
  MessageSquare,
  Mail,
  Phone,
  Upload,
} from "lucide-react"

// Dados simulados de redes sociais
const redesSociaisData = [
  { id: 1, nome: "Facebook", url: "https://facebook.com/webyteplay", icone: "facebook", ativo: true },
  { id: 2, nome: "Instagram", url: "https://instagram.com/webyteplay", icone: "instagram", ativo: true },
  { id: 3, nome: "Twitter", url: "https://twitter.com/webyteplay", icone: "twitter", ativo: false },
  { id: 4, nome: "YouTube", url: "https://youtube.com/webyteplay", icone: "youtube", ativo: true },
  { id: 5, nome: "LinkedIn", url: "https://linkedin.com/company/webyteplay", icone: "linkedin", ativo: false },
  { id: 6, nome: "TikTok", url: "https://tiktok.com/@webyteplay", icone: "tiktok", ativo: true },
]

// Dados simulados de contatos
const contatosData = [
  { id: 1, tipo: "whatsapp", valor: "+55 11 98765-4321", descricao: "Atendimento", ativo: true },
  { id: 2, tipo: "email", valor: "contato@webyteplay.com", descricao: "E-mail principal", ativo: true },
  { id: 3, tipo: "telefone", valor: "+55 11 1234-5678", descricao: "Telefone fixo", ativo: true },
  { id: 4, tipo: "whatsapp", valor: "+55 11 91234-5678", descricao: "Suporte técnico", ativo: true },
  { id: 5, tipo: "email", valor: "suporte@webyteplay.com", descricao: "Suporte técnico", ativo: true },
]

export default function IntegracoesComunicacao() {
  return (
    <Tabs defaultValue="midias-sociais">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="midias-sociais">Gerenciador de Mídias Sociais</TabsTrigger>
        <TabsTrigger value="personalizacao">Personalização Completa</TabsTrigger>
      </TabsList>

      <TabsContent value="midias-sociais" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciador de Mídias Sociais Integrado</CardTitle>
            <CardDescription>
              Controle centralizado de links e ícones sociais, além da gestão de contatos do WhatsApp e e-mails de
              suporte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <h3 className="text-lg font-medium">Redes Sociais</h3>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Rede Social
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rede Social</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redesSociaisData.map((rede) => (
                    <TableRow key={rede.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {rede.icone === "facebook" ? (
                            <Facebook className="h-5 w-5 text-blue-600" />
                          ) : rede.icone === "instagram" ? (
                            <Instagram className="h-5 w-5 text-pink-600" />
                          ) : rede.icone === "twitter" ? (
                            <Twitter className="h-5 w-5 text-blue-400" />
                          ) : rede.icone === "youtube" ? (
                            <Youtube className="h-5 w-5 text-red-600" />
                          ) : rede.icone === "linkedin" ? (
                            <Linkedin className="h-5 w-5 text-blue-700" />
                          ) : (
                            <TikTok className="h-5 w-5" />
                          )}
                          {rede.nome}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={rede.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {rede.url}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rede.ativo ? "default" : "secondary"}>{rede.ativo ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button variant="outline" size="icon">
                            {rede.ativo ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                />
                              </svg>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <h3 className="text-lg font-medium">Contatos</h3>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Contato
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contatosData.map((contato) => (
                    <TableRow key={contato.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {contato.tipo === "whatsapp" ? (
                            <MessageSquare className="h-5 w-5 text-green-600" />
                          ) : contato.tipo === "email" ? (
                            <Mail className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Phone className="h-5 w-5 text-gray-600" />
                          )}
                          {contato.tipo === "whatsapp" ? "WhatsApp" : contato.tipo === "email" ? "E-mail" : "Telefone"}
                        </div>
                      </TableCell>
                      <TableCell>{contato.valor}</TableCell>
                      <TableCell>{contato.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={contato.ativo ? "default" : "secondary"}>
                          {contato.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button variant="outline" size="icon">
                            {contato.ativo ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                />
                              </svg>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações de Exibição</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exibir-rodape">Exibir Redes Sociais no Rodapé</Label>
                    <Switch id="exibir-rodape" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">Exibe os ícones das redes sociais no rodapé do site</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exibir-cabecalho">Exibir Redes Sociais no Cabeçalho</Label>
                    <Switch id="exibir-cabecalho" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exibe os ícones das redes sociais no cabeçalho do site
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exibir-contatos">Exibir Contatos no Rodapé</Label>
                    <Switch id="exibir-contatos" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">Exibe os contatos no rodapé do site</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações de WhatsApp</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="botao-whatsapp">Botão Flutuante de WhatsApp</Label>
                    <Switch id="botao-whatsapp" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exibe um botão flutuante de WhatsApp no canto inferior direito do site
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mensagem-whatsapp">Mensagem Padrão do WhatsApp</Label>
                  <Textarea
                    id="mensagem-whatsapp"
                    placeholder="Mensagem padrão que será enviada quando o cliente clicar no botão"
                    defaultValue="Olá! Estou interessado em participar de uma rifa. Pode me ajudar?"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posicao-botao">Posição do Botão</Label>
                  <Select defaultValue="direita">
                    <SelectTrigger id="posicao-botao">
                      <SelectValue placeholder="Selecione a posição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direita">Canto Inferior Direito</SelectItem>
                      <SelectItem value="esquerda">Canto Inferior Esquerdo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancelar</Button>
            <Button>
              <Save className="mr-2 h-4 w-4" /> Salvar Configurações
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="personalizacao" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Personalização Completa</CardTitle>
            <CardDescription>
              Configure facilmente o nome do site, logo, e-mail, gateways de pagamento e layout da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações Básicas</h3>
                <div className="space-y-2">
                  <Label htmlFor="nome-site">Nome do Site</Label>
                  <Input id="nome-site" defaultValue="WebytePlay Rifas" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input
                    id="slogan"
                    defaultValue="Plataforma de rifas com prêmios via PIX, cotas premiadas instantâneas e sorteios justos."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição do Site</Label>
                  <Textarea
                    id="descricao"
                    rows={3}
                    defaultValue="Plataforma de rifas online com prêmios instantâneos, sorteios transparentes e pagamentos via PIX. Participe e concorra a prêmios incríveis!"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Logos e Favicon</h3>
                <div className="space-y-2">
                  <Label htmlFor="logo-principal">Logo Principal</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                      <img src="/images/webyte.png" alt="Logo atual" className="max-w-full max-h-full" />
                    </div>
                    <div className="flex-1">
                      <Input id="logo-principal" type="file" accept="image/*" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Tamanho recomendado: 200x80px, formato PNG com transparência
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-alternativo">Logo Alternativo (Modo Escuro)</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-800 rounded-md flex items-center justify-center">
                      <img src="/images/webyte.png" alt="Logo alternativo" className="max-w-full max-h-full" />
                    </div>
                    <div className="flex-1">
                      <Input id="logo-alternativo" type="file" accept="image/*" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Versão do logo para uso em fundos escuros (opcional)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                      <img src="/images/webyte.png" alt="Favicon atual" className="max-w-full max-h-full" />
                    </div>
                    <div className="flex-1">
                      <Input id="favicon" type="file" accept="image/*" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Tamanho recomendado: 32x32px ou 64x64px, formato ICO, PNG ou SVG
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cores e Tema</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cor-primaria">Cor Primária</Label>
                    <div className="flex">
                      <Input id="cor-primaria" type="color" defaultValue="#00ff00" className="w-12 p-1 h-10" />
                      <Input
                        type="text"
                        defaultValue="#00ff00"
                        className="flex-1 ml-2"
                        placeholder="Código hexadecimal"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cor-secundaria">Cor Secundária</Label>
                    <div className="flex">
                      <Input id="cor-secundaria" type="color" defaultValue="#9c27b0" className="w-12 p-1 h-10" />
                      <Input
                        type="text"
                        defaultValue="#9c27b0"
                        className="flex-1 ml-2"
                        placeholder="Código hexadecimal"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cor-fundo">Cor de Fundo</Label>
                    <div className="flex">
                      <Input id="cor-fundo" type="color" defaultValue="#000428" className="w-12 p-1 h-10" />
                      <Input
                        type="text"
                        defaultValue="#000428"
                        className="flex-1 ml-2"
                        placeholder="Código hexadecimal"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cor-texto">Cor do Texto</Label>
                    <div className="flex">
                      <Input id="cor-texto" type="color" defaultValue="#ffffff" className="w-12 p-1 h-10" />
                      <Input
                        type="text"
                        defaultValue="#ffffff"
                        className="flex-1 ml-2"
                        placeholder="Código hexadecimal"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tema-escuro">Tema Escuro por Padrão</Label>
                    <Switch id="tema-escuro" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Define o tema escuro como padrão para todos os usuários
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alternar-tema">Permitir Alternar Tema</Label>
                    <Switch id="alternar-tema" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Permite que os usuários alternem entre os temas claro e escuro
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Elementos Visuais</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animacoes">Animações de Partículas</Label>
                    <Switch id="animacoes" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">Ativa as animações de partículas no fundo do site</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="efeitos-neon">Efeitos Neon</Label>
                    <Switch id="efeitos-neon" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativa os efeitos de brilho neon em textos e elementos destacados
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imagem-fundo">Imagem de Fundo (opcional)</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      <img
                        src="/placeholder.svg?height=80&width=80"
                        alt="Imagem de fundo"
                        className="max-w-full max-h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Input id="imagem-fundo" type="file" accept="image/*" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Imagem de fundo para substituir as animações de partículas (opcional)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estilo-botoes">Estilo dos Botões</Label>
                  <Select defaultValue="arredondado">
                    <SelectTrigger id="estilo-botoes">
                      <SelectValue placeholder="Selecione o estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arredondado">Arredondado</SelectItem>
                      <SelectItem value="quadrado">Quadrado</SelectItem>
                      <SelectItem value="pill">Pill (Totalmente Arredondado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Rodapé Personalizado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="texto-rodape">Texto do Rodapé</Label>
                  <Input id="texto-rodape" defaultValue="© 2025 WebytePlay. Todos os direitos reservados." />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exibir-desenvolvedor">Exibir "Desenvolvido por Webyte Desenvolvimentos"</Label>
                    <Switch id="exibir-desenvolvedor" defaultChecked />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-desenvolvedor">Link do Desenvolvedor</Label>
                  <Input id="link-desenvolvedor" defaultValue="https://webytebr.com/" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome-desenvolvedor">Nome do Desenvolvedor</Label>
                  <Input id="nome-desenvolvedor" defaultValue="Webyte Desenvolvimentos" />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" className="w-full md:w-auto">
                <Upload className="mr-2 h-4 w-4" /> Importar Configurações
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Restaurar Padrões</Button>
            <Button>
              <Save className="mr-2 h-4 w-4" /> Salvar Configurações
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
