"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, MessageSquare, Send, Bell, AlertTriangle, Play, Pause } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Dados simulados de modelos de mensagens
const modelosMensagens = [
  {
    id: 1,
    nome: "Confirmação de Compra",
    conteudo:
      "Olá {nome}, sua compra foi confirmada! Você adquiriu {quantidade} números da rifa {rifa}. Seus números: {numeros}. Boa sorte!",
    evento: "compra",
    canal: "whatsapp",
    status: "ativo",
  },
  {
    id: 2,
    nome: "Pagamento Aprovado",
    conteudo:
      "Olá {nome}, seu pagamento de R$ {valor} foi aprovado! Seus números da rifa {rifa} já estão ativos. Boa sorte!",
    evento: "pagamento",
    canal: "whatsapp",
    status: "ativo",
  },
  {
    id: 3,
    nome: "Notificação de Premiação",
    conteudo:
      "PARABÉNS {nome}! Você foi o ganhador da rifa {rifa} e receberá o prêmio {premio}. Entre em contato conosco para mais informações.",
    evento: "premiacao",
    canal: "whatsapp",
    status: "ativo",
  },
  {
    id: 4,
    nome: "Lembrete de Sorteio",
    conteudo: "Olá {nome}, o sorteio da rifa {rifa} acontecerá hoje às {hora}. Fique atento aos resultados! Boa sorte!",
    evento: "sorteio",
    canal: "whatsapp",
    status: "inativo",
  },
  {
    id: 5,
    nome: "Alerta de Nova Venda (Admin)",
    conteudo:
      "Nova venda realizada! Cliente: {nome}, Valor: R$ {valor}, Rifa: {rifa}, Números: {numeros}, Data: {data}",
    evento: "venda_admin",
    canal: "whatsapp",
    status: "ativo",
  },
]

export default function NotificacoesInteligentes() {
  return (
    <Tabs defaultValue="alertas-vendas">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="alertas-vendas">Alertas de Vendas</TabsTrigger>
        <TabsTrigger value="confirmacao-compra">Confirmação de Compra</TabsTrigger>
      </TabsList>

      <TabsContent value="alertas-vendas" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertas de Vendas via WhatsApp</CardTitle>
            <CardDescription>
              Receba avisos instantâneos sobre novas vendas diretamente no WhatsApp do administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alertas-vendas-ativo">Alertas de Vendas Ativo</Label>
                    <Switch id="alertas-vendas-ativo" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativa ou desativa o envio de alertas de vendas para o administrador
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone-admin">Telefone do Administrador</Label>
                  <Input id="telefone-admin" placeholder="Ex: 5511987654321" defaultValue="5511984801839" />
                  <p className="text-xs text-muted-foreground">
                    Número de telefone que receberá os alertas (com código do país)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key CallMeBot</Label>
                  <Input id="api-key" placeholder="Insira a API Key" defaultValue="1782254" type="password" />
                  <p className="text-xs text-muted-foreground">
                    Chave de API para integração com o serviço CallMeBot para envio de mensagens
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="valor-minimo-alerta">Valor Mínimo para Alerta (R$)</Label>
                  <Input id="valor-minimo-alerta" type="number" min="0" step="0.01" defaultValue="0" />
                  <p className="text-xs text-muted-foreground">
                    Valor mínimo da venda para que um alerta seja enviado (0 = enviar para qualquer valor)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intervalo-alertas">Intervalo Entre Alertas (minutos)</Label>
                  <Input id="intervalo-alertas" type="number" min="0" defaultValue="0" />
                  <p className="text-xs text-muted-foreground">
                    Intervalo mínimo entre alertas para evitar spam (0 = sem intervalo)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Eventos para Notificação</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="evento-nova-venda" defaultChecked />
                      <Label htmlFor="evento-nova-venda">Nova Venda</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="evento-pagamento-confirmado" defaultChecked />
                      <Label htmlFor="evento-pagamento-confirmado">Pagamento Confirmado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="evento-reserva-expirada" />
                      <Label htmlFor="evento-reserva-expirada">Reserva Expirada</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="evento-sorteio-realizado" defaultChecked />
                      <Label htmlFor="evento-sorteio-realizado">Sorteio Realizado</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Modelo de Mensagem</h3>
              <div className="space-y-2">
                <Label htmlFor="modelo-mensagem-admin">Mensagem para Nova Venda</Label>
                <Textarea
                  id="modelo-mensagem-admin"
                  rows={4}
                  defaultValue="Nova venda realizada! Cliente: {nome}, Valor: R$ {valor}, Rifa: {rifa}, Números: {numeros}, Data: {data}"
                />
                <p className="text-xs text-muted-foreground">
                  Modelo de mensagem que será enviada ao administrador quando uma nova venda for realizada
                </p>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Variáveis disponíveis:</strong>
                  <br />
                  {"{nome}"} - Nome do cliente
                  <br />
                  {"{telefone}"} - Telefone do cliente
                  <br />
                  {"{email}"} - Email do cliente
                  <br />
                  {"{rifa}"} - Nome da rifa
                  <br />
                  {"{valor}"} - Valor da compra
                  <br />
                  {"{numeros}"} - Números comprados
                  <br />
                  {"{data}"} - Data da compra
                  <br />
                  {"{hora}"} - Hora da compra
                </p>
              </div>
            </div>

            <Alert variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Para utilizar esta funcionalidade, é necessário ter uma conta no serviço CallMeBot ou outro serviço
                similar de envio de mensagens via WhatsApp. Consulte a documentação para mais informações.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button variant="outline" className="w-full md:w-auto">
                <MessageSquare className="mr-2 h-4 w-4" /> Enviar Mensagem de Teste
              </Button>
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

      <TabsContent value="confirmacao-compra" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Confirmação de Compra para o Cliente</CardTitle>
            <CardDescription>
              Envio automático de mensagens de confirmação para os clientes via WhatsApp após o pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confirmacao-compra-ativo">Confirmação de Compra Ativo</Label>
                    <Switch id="confirmacao-compra-ativo" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativa ou desativa o envio de mensagens de confirmação para os clientes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canal-envio">Canal de Envio</Label>
                  <Select defaultValue="whatsapp">
                    <SelectTrigger id="canal-envio">
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="todos">Todos os canais</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Canal que será utilizado para enviar as mensagens de confirmação
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key-cliente">API Key CallMeBot (Cliente)</Label>
                  <Input id="api-key-cliente" placeholder="Insira a API Key" defaultValue="1782254" type="password" />
                  <p className="text-xs text-muted-foreground">
                    Chave de API para integração com o serviço CallMeBot para envio de mensagens aos clientes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Eventos para Notificação</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="evento-compra-realizada" defaultChecked />
                      <Label htmlFor="evento-compra-realizada">Compra Realizada</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="evento-pagamento-confirmado-cliente" defaultChecked />
                      <Label htmlFor="evento-pagamento-confirmado-cliente">Pagamento Confirmado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="evento-sorteio-proximo" defaultChecked />
                      <Label htmlFor="evento-sorteio-proximo">Sorteio Próximo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="evento-premiacao" defaultChecked />
                      <Label htmlFor="evento-premiacao">Premiação</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enviar-numeros">Enviar Números na Mensagem</Label>
                    <Switch id="enviar-numeros" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inclui os números comprados na mensagem de confirmação
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enviar-link">Enviar Link para Acompanhamento</Label>
                    <Switch id="enviar-link" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inclui um link para o cliente acompanhar o status da rifa
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelosMensagens.map((modelo) => (
                    <TableRow key={modelo.id}>
                      <TableCell>{modelo.nome}</TableCell>
                      <TableCell>
                        {modelo.evento === "compra"
                          ? "Compra Realizada"
                          : modelo.evento === "pagamento"
                            ? "Pagamento Aprovado"
                            : modelo.evento === "premiacao"
                              ? "Premiação"
                              : modelo.evento === "sorteio"
                                ? "Sorteio"
                                : "Venda (Admin)"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {modelo.canal === "whatsapp" ? "WhatsApp" : modelo.canal === "sms" ? "SMS" : "E-mail"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={modelo.status === "ativo" ? "default" : "secondary"}>
                          {modelo.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon">
                            <Send className="h-4 w-4" />
                          </Button>
                          {modelo.status === "ativo" ? (
                            <Button variant="outline" size="icon">
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="icon">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Editar Modelo de Mensagem</h3>
              <div className="space-y-2">
                <Label htmlFor="nome-modelo">Nome do Modelo</Label>
                <Input id="nome-modelo" defaultValue="Confirmação de Compra" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evento-modelo">Evento</Label>
                <Select defaultValue="compra">
                  <SelectTrigger id="evento-modelo">
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compra">Compra Realizada</SelectItem>
                    <SelectItem value="pagamento">Pagamento Aprovado</SelectItem>
                    <SelectItem value="sorteio">Sorteio Próximo</SelectItem>
                    <SelectItem value="premiacao">Premiação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conteudo-modelo">Conteúdo da Mensagem</Label>
                <Textarea
                  id="conteudo-modelo"
                  rows={4}
                  defaultValue="Olá {nome}, sua compra foi confirmada! Você adquiriu {quantidade} números da rifa {rifa}. Seus números: {numeros}. Boa sorte!"
                />
                <p className="text-xs text-muted-foreground">
                  Modelo de mensagem que será enviada ao cliente quando o evento ocorrer
                </p>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Variáveis disponíveis:</strong>
                  <br />
                  {"{nome}"} - Nome do cliente
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
                  {"{data_sorteio}"} - Data do sorteio
                  <br />
                  {"{hora}"} - Hora do sorteio
                  <br />
                  {"{link}"} - Link para acompanhamento
                </p>
              </div>
            </div>

            <Alert variant="default">
              <Bell className="h-4 w-4" />
              <AlertTitle>Dica</AlertTitle>
              <AlertDescription>
                Mantenha suas mensagens curtas e diretas. Inclua apenas as informações essenciais para evitar que a
                mensagem seja truncada ou ignorada pelo cliente.
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
    </Tabs>
  )
}
