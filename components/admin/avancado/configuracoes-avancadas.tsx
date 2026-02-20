"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, AlertTriangle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ConfiguracoesAvancadas() {
  return (
    <Tabs defaultValue="formato-numeros">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="formato-numeros">Formato de Números</TabsTrigger>
        <TabsTrigger value="limites-compra">Limites de Compra</TabsTrigger>
        <TabsTrigger value="taxa-servico">Taxa de Serviço</TabsTrigger>
      </TabsList>

      <TabsContent value="formato-numeros" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Definição de Formato de Números</CardTitle>
            <CardDescription>Configure o formato e a quantidade de dígitos dos números de rifas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade-digitos">Quantidade de Dígitos</Label>
                  <Select defaultValue="5">
                    <SelectTrigger id="quantidade-digitos">
                      <SelectValue placeholder="Selecione a quantidade de dígitos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 dígitos (000-999)</SelectItem>
                      <SelectItem value="4">4 dígitos (0000-9999)</SelectItem>
                      <SelectItem value="5">5 dígitos (00000-99999)</SelectItem>
                      <SelectItem value="6">6 dígitos (000000-999999)</SelectItem>
                      <SelectItem value="7">7 dígitos (0000000-9999999)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Define quantos dígitos terão os números das rifas (ex: 00001, 000001)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prefixo">Prefixo (opcional)</Label>
                  <Input id="prefixo" placeholder="Ex: R-" />
                  <p className="text-xs text-muted-foreground">
                    Adiciona um prefixo antes do número (ex: R-00001, R-00002)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sufixo">Sufixo (opcional)</Label>
                  <Input id="sufixo" placeholder="Ex: -A" />
                  <p className="text-xs text-muted-foreground">
                    Adiciona um sufixo após o número (ex: 00001-A, 00002-A)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Estilo de Numeração</Label>
                  <RadioGroup defaultValue="padrao">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="padrao" id="padrao" />
                      <Label htmlFor="padrao">Padrão (00001, 00002, 00003...)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lote" id="lote" />
                      <Label htmlFor="lote">Por Lote (Lote 1: 001-100, Lote 2: 101-200...)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="personalizado" id="personalizado" />
                      <Label htmlFor="personalizado">Personalizado (definir manualmente)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="separador">Separador de Milhares</Label>
                  <Select defaultValue="nenhum">
                    <SelectTrigger id="separador">
                      <SelectValue placeholder="Selecione o separador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum (00001)</SelectItem>
                      <SelectItem value="ponto">Ponto (00.001)</SelectItem>
                      <SelectItem value="hifen">Hífen (00-001)</SelectItem>
                      <SelectItem value="espaco">Espaço (00 001)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Define como os números serão exibidos para melhor legibilidade
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="zeros-esquerda">Zeros à Esquerda</Label>
                    <Switch id="zeros-esquerda" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mantém os zeros à esquerda para padronizar o tamanho dos números (ex: 00001 em vez de 1)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Visualização do Formato</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Primeiro Número</p>
                  <p className="font-mono font-bold">00001</p>
                </div>
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Exemplo com Prefixo</p>
                  <p className="font-mono font-bold">R-00001</p>
                </div>
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Exemplo com Sufixo</p>
                  <p className="font-mono font-bold">00001-A</p>
                </div>
                <div className="p-3 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Último Número</p>
                  <p className="font-mono font-bold">99999</p>
                </div>
              </div>
            </div>

            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Alterar o formato dos números afetará apenas as novas rifas criadas. Rifas existentes manterão seu
                formato original.
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

      <TabsContent value="limites-compra" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Limites Personalizados de Compra</CardTitle>
            <CardDescription>
              Estabeleça uma quantidade mínima e máxima de números por compra para controlar a distribuição
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade-minima">Quantidade Mínima de Números</Label>
                  <Input id="quantidade-minima" type="number" min="1" defaultValue="1" />
                  <p className="text-xs text-muted-foreground">
                    Quantidade mínima de números que um usuário deve comprar em uma única transação
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade-maxima">Quantidade Máxima de Números</Label>
                  <Input id="quantidade-maxima" type="number" min="1" defaultValue="100" />
                  <p className="text-xs text-muted-foreground">
                    Quantidade máxima de números que um usuário pode comprar em uma única transação
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limite-usuario">Limite por Usuário</Label>
                  <Input id="limite-usuario" type="number" min="0" defaultValue="0" />
                  <p className="text-xs text-muted-foreground">
                    Limite total de números que um usuário pode comprar em uma rifa (0 = sem limite)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="limite-cpf">Limite por CPF</Label>
                    <Switch id="limite-cpf" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativa o limite de compras por CPF, evitando que um usuário compre mais que o permitido
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="limite-telefone">Limite por Telefone</Label>
                    <Switch id="limite-telefone" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativa o limite de compras por telefone, evitando que um usuário compre mais que o permitido
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="limite-email">Limite por E-mail</Label>
                    <Switch id="limite-email" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativa o limite de compras por e-mail, evitando que um usuário compre mais que o permitido
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="permitir-override">Permitir Override Administrativo</Label>
                    <Switch id="permitir-override" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Permite que administradores ignorem os limites de compra em casos especiais
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configurações de Pacotes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pacote Básico</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="pacote-basico-quantidade">Quantidade</Label>
                      <Input id="pacote-basico-quantidade" type="number" min="1" defaultValue="5" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pacote-basico-desconto">Desconto (%)</Label>
                      <Input id="pacote-basico-desconto" type="number" min="0" max="100" defaultValue="5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pacote-basico-ativo">Ativo</Label>
                      <Switch id="pacote-basico-ativo" defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pacote Intermediário</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="pacote-intermediario-quantidade">Quantidade</Label>
                      <Input id="pacote-intermediario-quantidade" type="number" min="1" defaultValue="10" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pacote-intermediario-desconto">Desconto (%)</Label>
                      <Input id="pacote-intermediario-desconto" type="number" min="0" max="100" defaultValue="10" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pacote-intermediario-ativo">Ativo</Label>
                      <Switch id="pacote-intermediario-ativo" defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pacote Premium</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="pacote-premium-quantidade">Quantidade</Label>
                      <Input id="pacote-premium-quantidade" type="number" min="1" defaultValue="20" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pacote-premium-desconto">Desconto (%)</Label>
                      <Input id="pacote-premium-desconto" type="number" min="0" max="100" defaultValue="15" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pacote-premium-ativo">Ativo</Label>
                      <Switch id="pacote-premium-ativo" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Alert variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Definir limites muito restritivos pode impactar negativamente as vendas. Recomendamos testar diferentes
                configurações para encontrar o equilíbrio ideal.
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

      <TabsContent value="taxa-servico" className="pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Taxa Adicional de Serviço</CardTitle>
            <CardDescription>
              Defina uma porcentagem extra a ser aplicada no momento do pagamento para cobrir custos operacionais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="taxa-servico-ativa">Taxa de Serviço Ativa</Label>
                    <Switch id="taxa-servico-ativa" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ativa ou desativa a cobrança de taxa de serviço em todas as compras
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxa-servico-percentual">Percentual da Taxa (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="taxa-servico-percentual"
                      min={0}
                      max={20}
                      step={0.5}
                      defaultValue={[5]}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">5%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Percentual que será adicionado ao valor total da compra como taxa de serviço
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxa-servico-fixa">Taxa Fixa Adicional (R$)</Label>
                  <Input id="taxa-servico-fixa" type="number" min="0" step="0.01" defaultValue="0" />
                  <p className="text-xs text-muted-foreground">
                    Valor fixo que será adicionado ao valor total da compra, além do percentual
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Aplicar Taxa Em</Label>
                  <RadioGroup defaultValue="todas">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="todas" id="todas" />
                      <Label htmlFor="todas">Todas as compras</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="acima-valor" id="acima-valor" />
                      <Label htmlFor="acima-valor">Compras acima de um valor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="acima-quantidade" id="acima-quantidade" />
                      <Label htmlFor="acima-quantidade">Compras acima de uma quantidade</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor-minimo-taxa">Valor Mínimo para Taxa (R$)</Label>
                  <Input id="valor-minimo-taxa" type="number" min="0" step="0.01" defaultValue="10" />
                  <p className="text-xs text-muted-foreground">
                    Valor mínimo da compra para que a taxa seja aplicada (se "Compras acima de um valor" for
                    selecionado)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade-minima-taxa">Quantidade Mínima para Taxa</Label>
                  <Input id="quantidade-minima-taxa" type="number" min="1" defaultValue="5" />
                  <p className="text-xs text-muted-foreground">
                    Quantidade mínima de números para que a taxa seja aplicada (se "Compras acima de uma quantidade" for
                    selecionado)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-4">Simulação de Taxa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="simulacao-valor">Valor da Compra (R$)</Label>
                  <Input id="simulacao-valor" type="number" min="0" step="0.01" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="simulacao-quantidade">Quantidade de Números</Label>
                  <Input id="simulacao-quantidade" type="number" min="1" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label>Resultado da Simulação</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="flex justify-between text-sm">
                      <span>Valor base:</span>
                      <span>R$ 50,00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de serviço (5%):</span>
                      <span>R$ 2,50</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa fixa:</span>
                      <span>R$ 0,00</span>
                    </div>
                    <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                      <span>Valor total:</span>
                      <span>R$ 52,50</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configurações de Exibição</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exibir-taxa-separada">Exibir Taxa Separadamente</Label>
                    <Switch id="exibir-taxa-separada" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exibe a taxa de serviço como um item separado no checkout, em vez de incluí-la no valor total
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exibir-descricao-taxa">Exibir Descrição da Taxa</Label>
                    <Switch id="exibir-descricao-taxa" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exibe uma descrição explicando a taxa de serviço durante o checkout
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome-taxa">Nome da Taxa</Label>
                  <Input id="nome-taxa" defaultValue="Taxa de Serviço" />
                  <p className="text-xs text-muted-foreground">Nome que será exibido para a taxa durante o checkout</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao-taxa">Descrição da Taxa</Label>
                  <Input id="descricao-taxa" defaultValue="Taxa para cobrir custos operacionais da plataforma" />
                  <p className="text-xs text-muted-foreground">
                    Descrição que será exibida para explicar a taxa durante o checkout
                  </p>
                </div>
              </div>
            </div>

            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>Dica</AlertTitle>
              <AlertDescription>
                Seja transparente com seus clientes sobre a taxa de serviço. Explicar claramente o propósito da taxa
                ajuda a evitar confusão e aumenta a confiança na plataforma.
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
