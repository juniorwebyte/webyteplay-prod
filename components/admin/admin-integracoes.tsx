"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default function AdminIntegracoes() {
  return (
    <Tabs defaultValue="analytics" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="facebook">Facebook</TabsTrigger>
        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
      </TabsList>

      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Google Analytics e Tag Manager</CardTitle>
            <CardDescription>Configure as integrações com ferramentas de análise do Google.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Google Analytics</h3>
                <Switch id="ga-ativo" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ga-id">ID de Medição (G-XXXXXXXXXX)</Label>
                <Input id="ga-id" placeholder="Ex: G-XXXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ga-script">Script Personalizado (opcional)</Label>
                <Textarea
                  id="ga-script"
                  placeholder="Cole aqui o script personalizado do Google Analytics, se necessário"
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Google Tag Manager</h3>
                <Switch id="gtm-ativo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gtm-id">ID do Contêiner (GTM-XXXXXX)</Label>
                <Input id="gtm-id" placeholder="Ex: GTM-XXXXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gtm-script">Script Personalizado (opcional)</Label>
                <Textarea
                  id="gtm-script"
                  placeholder="Cole aqui o script personalizado do Google Tag Manager, se necessário"
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Eventos para Rastreamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="evento-visualizacao" defaultChecked />
                  <Label htmlFor="evento-visualizacao">Visualização de Rifas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="evento-compra" defaultChecked />
                  <Label htmlFor="evento-compra">Compra de Rifas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="evento-pagamento" defaultChecked />
                  <Label htmlFor="evento-pagamento">Pagamentos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="evento-cadastro" defaultChecked />
                  <Label htmlFor="evento-cadastro">Cadastros de Usuários</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="evento-sorteio" defaultChecked />
                  <Label htmlFor="evento-sorteio">Sorteios</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="evento-premiacao" defaultChecked />
                  <Label htmlFor="evento-premiacao">Premiações</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Salvar Configurações</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="facebook">
        <Card>
          <CardHeader>
            <CardTitle>Facebook Pixel e Integrações</CardTitle>
            <CardDescription>Configure as integrações com o Facebook para rastreamento e marketing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Facebook Pixel</h3>
                <Switch id="fb-pixel-ativo" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fb-pixel-id">ID do Pixel</Label>
                <Input id="fb-pixel-id" placeholder="Ex: 123456789012345" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fb-pixel-script">Script Personalizado (opcional)</Label>
                <Textarea
                  id="fb-pixel-script"
                  placeholder="Cole aqui o script personalizado do Facebook Pixel, se necessário"
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Eventos para Rastreamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="fb-evento-pageview" defaultChecked />
                  <Label htmlFor="fb-evento-pageview">PageView</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="fb-evento-viewcontent" defaultChecked />
                  <Label htmlFor="fb-evento-viewcontent">ViewContent (Visualização de Rifas)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="fb-evento-addtocart" defaultChecked />
                  <Label htmlFor="fb-evento-addtocart">AddToCart (Adição ao Carrinho)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="fb-evento-initiatecheckout" defaultChecked />
                  <Label htmlFor="fb-evento-initiatecheckout">InitiateCheckout (Início de Checkout)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="fb-evento-purchase" defaultChecked />
                  <Label htmlFor="fb-evento-purchase">Purchase (Compra Finalizada)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="fb-evento-lead" defaultChecked />
                  <Label htmlFor="fb-evento-lead">Lead (Cadastro)</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Compartilhamento no Facebook</h3>
                <Switch id="fb-share-ativo" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fb-app-id">ID do App do Facebook</Label>
                <Input id="fb-app-id" placeholder="Ex: 123456789012345" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fb-share-texto">Texto Padrão para Compartilhamento</Label>
                <Textarea
                  id="fb-share-texto"
                  placeholder="Texto que será exibido ao compartilhar rifas no Facebook"
                  defaultValue="Estou participando desta rifa incrível! Venha participar você também e concorra a prêmios incríveis!"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Salvar Configurações</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="whatsapp">
        <Card>
          <CardHeader>
            <CardTitle>Integrações com WhatsApp</CardTitle>
            <CardDescription>Configure as integrações com WhatsApp para notificações e suporte.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Botão de WhatsApp</h3>
                <Switch id="whatsapp-botao-ativo" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-numero">Número de WhatsApp (com código do país)</Label>
                <Input id="whatsapp-numero" placeholder="Ex: 5511987654321" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-mensagem">Mensagem Padrão</Label>
                <Textarea
                  id="whatsapp-mensagem"
                  placeholder="Mensagem padrão que será enviada quando o cliente clicar no botão"
                  defaultValue="Olá! Estou interessado em participar de uma rifa. Pode me ajudar?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-posicao">Posição do Botão</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="whatsapp-direita" name="whatsapp-posicao" defaultChecked />
                    <Label htmlFor="whatsapp-direita">Canto Inferior Direito</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="whatsapp-esquerda" name="whatsapp-posicao" />
                    <Label htmlFor="whatsapp-esquerda">Canto Inferior Esquerdo</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Notificações via WhatsApp</h3>
                <Switch id="whatsapp-notificacao-ativo" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Eventos para Notificação</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="whatsapp-pedido" defaultChecked />
                    <Label htmlFor="whatsapp-pedido">Novo Pedido</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="whatsapp-pagamento" defaultChecked />
                    <Label htmlFor="whatsapp-pagamento">Pagamento Aprovado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="whatsapp-sorteio" defaultChecked />
                    <Label htmlFor="whatsapp-sorteio">Sorteio Realizado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="whatsapp-premiacao" defaultChecked />
                    <Label htmlFor="whatsapp-premiacao">Premiação</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">CallMeBot API</h3>
                <Switch id="callmebot-ativo" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callmebot-phone">Número de Telefone (com código do país)</Label>
                <Input id="callmebot-phone" placeholder="Ex: 5511984801839" defaultValue="5511984801839" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callmebot-apikey">API Key</Label>
                <Input id="callmebot-apikey" placeholder="Insira a API Key" defaultValue="1782254" />
              </div>
              <div className="space-y-2">
                <Label>Eventos para Notificação</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="callmebot-pedido" defaultChecked />
                    <Label htmlFor="callmebot-pedido">Novo Pedido</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="callmebot-pagamento" defaultChecked />
                    <Label htmlFor="callmebot-pagamento">Pagamento Aprovado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="callmebot-sorteio" />
                    <Label htmlFor="callmebot-sorteio">Sorteio Realizado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="callmebot-premiacao" />
                    <Label htmlFor="callmebot-premiacao">Premiação</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="callmebot-mensagem">Mensagem para Pagamento Aprovado</Label>
                <Textarea
                  id="callmebot-mensagem"
                  placeholder="Mensagem a ser enviada quando um pagamento for aprovado"
                  defaultValue="Nova compra aprovada! Cliente: {nome}, Valor: R$ {valor}, Rifa: {rifa}"
                  rows={3}
                />
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Dica:</strong> Você pode usar as seguintes variáveis nas mensagens:
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
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Salvar Configurações</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
