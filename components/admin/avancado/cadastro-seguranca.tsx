"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, Shield, Lock, AlertTriangle, Info, Eye, EyeOff, Plus, Edit, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Dados simulados de campos de cadastro
const camposCadastro = [
  { id: 1, nome: "Nome Completo", tipo: "text", obrigatorio: true, validacao: "nome", ativo: true, ordem: 1 },
  { id: 2, nome: "E-mail", tipo: "email", obrigatorio: true, validacao: "email", ativo: true, ordem: 2 },
  { id: 3, nome: "Telefone", tipo: "tel", obrigatorio: true, validacao: "telefone", ativo: true, ordem: 3 },
  { id: 4, nome: "CPF", tipo: "text", obrigatorio: true, validacao: "cpf", ativo: true, ordem: 4 },
  { id: 5, nome: "Data de Nascimento", tipo: "date", obrigatorio: false, validacao: "data", ativo: true, ordem: 5 },
  { id: 6, nome: "Senha", tipo: "password", obrigatorio: true, validacao: "senha", ativo: true, ordem: 6 },
  { id: 7, nome: "Endereço", tipo: "text", obrigatorio: false, validacao: "texto", ativo: false, ordem: 7 },
  { id: 8, nome: "Cidade", tipo: "text", obrigatorio: false, validacao: "texto", ativo: false, ordem: 8 },
  { id: 9, nome: "Estado", tipo: "select", obrigatorio: false, validacao: "texto", ativo: false, ordem: 9 },
  { id: 10, nome: "CEP", tipo: "text", obrigatorio: false, validacao: "cep", ativo: false, ordem: 10 },
]

export default function CadastroSeguranca() {
  return (
    <Tabs defaultValue="campos-personalizaveis">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="campos-personalizaveis">Campos Personalizáveis</TabsTrigger>
        <TabsTrigger value="validacao-dados">Validação de Dados</TabsTrigger>
      </TabsList>

      <TabsContent value="campos-personalizaveis" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Campos Personalizáveis e Obrigatórios</CardTitle>
            <CardDescription>
              Configure quais dados serão exigidos no cadastro (CPF, e-mail, telefone, senha, data de nascimento, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <h3 className="text-lg font-medium">Campos de Cadastro</h3>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Campo
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Nome do Campo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Obrigatório</TableHead>
                    <TableHead>Validação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {camposCadastro
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((campo) => (
                      <TableRow key={campo.id}>
                        <TableCell>{campo.ordem}</TableCell>
                        <TableCell>{campo.nome}</TableCell>
                        <TableCell>
                          {campo.tipo === "text"
                            ? "Texto"
                            : campo.tipo === "email"
                              ? "E-mail"
                              : campo.tipo === "tel"
                                ? "Telefone"
                                : campo.tipo === "date"
                                  ? "Data"
                                  : campo.tipo === "password"
                                    ? "Senha"
                                    : "Seleção"}
                        </TableCell>
                        <TableCell>
                          <Checkbox checked={campo.obrigatorio} disabled />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {campo.validacao === "nome"
                              ? "Nome Completo"
                              : campo.validacao === "email"
                                ? "E-mail"
                                : campo.validacao === "telefone"
                                  ? "Telefone"
                                  : campo.validacao === "cpf"
                                    ? "CPF"
                                    : campo.validacao === "data"
                                      ? "Data"
                                      : campo.validacao === "senha"
                                        ? "Senha Forte"
                                        : campo.validacao === "cep"
                                          ? "CEP"
                                          : "Texto Simples"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={campo.ativo ? "default" : "secondary"}>
                            {campo.ativo ? "Ativo" : "Inativo"}
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
                              {campo.ativo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
                <h3 className="text-lg font-medium">Configurações de Cadastro</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cadastro-obrigatorio">Cadastro Obrigatório para Compra</Label>
                    <Switch id="cadastro-obrigatorio" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exige que o usuário crie uma conta para realizar compras
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verificacao-email">Verificação de E-mail</Label>
                    <Switch id="verificacao-email" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envia um e-mail de verificação para confirmar o endereço de e-mail
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verificacao-telefone">Verificação de Telefone</Label>
                    <Switch id="verificacao-telefone" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envia um SMS com código de verificação para confirmar o número de telefone
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-social">Login com Redes Sociais</Label>
                    <Switch id="login-social" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Permite que os usuários façam login usando contas de redes sociais
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Termos e Políticas</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="termos-uso">Aceite dos Termos de Uso</Label>
                    <Switch id="termos-uso" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exige que o usuário aceite os termos de uso durante o cadastro
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="politica-privacidade">Aceite da Política de Privacidade</Label>
                    <Switch id="politica-privacidade" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exige que o usuário aceite a política de privacidade durante o cadastro
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newsletter">Opção de Newsletter</Label>
                    <Switch id="newsletter" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adiciona uma opção para o usuário se inscrever na newsletter
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="idade-minima">Verificação de Idade Mínima</Label>
                    <Switch id="idade-minima" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verifica se o usuário tem a idade mínima necessária (18 anos)
                  </p>
                </div>
              </div>
            </div>

            <Alert variant="default">
              <Shield className="h-4 w-4" />
              <AlertTitle>Dica de Segurança</AlertTitle>
              <AlertDescription>
                Exigir mais campos no cadastro aumenta a segurança, mas pode reduzir a taxa de conversão. Encontre um
                equilíbrio entre segurança e usabilidade.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancelar</Button>
            <Button>
              <Save className="mr-2 h-4 w-4" /> Salvar Configurações
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="validacao-dados" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Validação Inteligente de Dados</CardTitle>
            <CardDescription>
              Verificação automática de CPF, formato de e-mail, e outras regras para evitar cadastros incorretos ou
              fraudulentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Validação de CPF</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="validacao-cpf">Validação de CPF</Label>
                    <Switch id="validacao-cpf" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verifica se o CPF informado é válido (algoritmo de validação)
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cpf-unico">CPF Único</Label>
                    <Switch id="cpf-unico" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Impede que o mesmo CPF seja usado em mais de uma conta
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mascara-cpf">Máscara de CPF</Label>
                    <Switch id="mascara-cpf" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aplica automaticamente a máscara de CPF (xxx.xxx.xxx-xx)
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verificacao-receita">Verificação na Receita Federal</Label>
                    <Switch id="verificacao-receita" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verifica se o CPF existe na base da Receita Federal (requer API externa)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Validação de E-mail</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="validacao-email">Validação de Formato</Label>
                    <Switch id="validacao-email" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">Verifica se o e-mail informado tem um formato válido</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-unico">E-mail Único</Label>
                    <Switch id="email-unico" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Impede que o mesmo e-mail seja usado em mais de uma conta
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verificacao-mx">Verificação de Registro MX</Label>
                    <Switch id="verificacao-mx" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verifica se o domínio do e-mail possui registros MX válidos
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dominios-bloqueados">Bloqueio de Domínios Temporários</Label>
                    <Switch id="dominios-bloqueados" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bloqueia e-mails de domínios temporários ou descartáveis
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Validação de Telefone</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="validacao-telefone">Validação de Formato</Label>
                    <Switch id="validacao-telefone" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verifica se o telefone informado tem um formato válido
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="telefone-unico">Telefone Único</Label>
                    <Switch id="telefone-unico" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Impede que o mesmo telefone seja usado em mais de uma conta
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mascara-telefone">Máscara de Telefone</Label>
                    <Switch id="mascara-telefone" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aplica automaticamente a máscara de telefone ((xx) xxxxx-xxxx)
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verificacao-sms">Verificação por SMS</Label>
                    <Switch id="verificacao-sms" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envia um código de verificação por SMS para confirmar o número
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Validação de Senha</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="senha-forte">Exigir Senha Forte</Label>
                    <Switch id="senha-forte" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exige que a senha contenha letras maiúsculas, minúsculas, números e símbolos
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tamanho-minimo">Tamanho Mínimo</Label>
                    <Input
                      id="tamanho-minimo"
                      type="number"
                      min="6"
                      max="20"
                      defaultValue="8"
                      className="w-20 text-right"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Número mínimo de caracteres para a senha</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verificacao-vazamento">Verificação de Vazamento</Label>
                    <Switch id="verificacao-vazamento" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verifica se a senha já foi comprometida em vazamentos de dados (requer API externa)
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="expirar-senha">Expirar Senha</Label>
                    <Switch id="expirar-senha" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Força a troca de senha após um determinado período (90 dias)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Proteção contra Fraudes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="captcha">CAPTCHA</Label>
                    <Switch id="captcha" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adiciona um CAPTCHA para evitar cadastros automatizados
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="limite-tentativas">Limite de Tentativas</Label>
                    <Switch id="limite-tentativas" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bloqueia temporariamente após várias tentativas de login incorretas
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="deteccao-vpn">Detecção de VPN/Proxy</Label>
                    <Switch id="deteccao-vpn" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Detecta e bloqueia cadastros realizados através de VPNs ou proxies
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autenticacao-dois-fatores">Autenticação de Dois Fatores</Label>
                    <Switch id="autenticacao-dois-fatores" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adiciona uma camada extra de segurança com autenticação de dois fatores
                  </p>
                </div>
              </div>
            </div>

            <Alert variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Algumas validações avançadas podem requerer integrações com APIs externas e gerar custos adicionais.
                Verifique a documentação para mais informações.
              </AlertDescription>
            </Alert>

            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>Conformidade com LGPD</AlertTitle>
              <AlertDescription>
                Certifique-se de que todas as validações e armazenamento de dados estejam em conformidade com a Lei
                Geral de Proteção de Dados (LGPD).
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancelar</Button>
            <Button>
              <Lock className="mr-2 h-4 w-4" /> Salvar Configurações de Segurança
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
