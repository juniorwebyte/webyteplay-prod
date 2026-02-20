"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, Copy, DollarSign } from "lucide-react"
import { listarAfiliados, criarAfiliado, atualizarAfiliado, excluirAfiliado, type Afiliado } from "@/lib/gateway-store"

export default function AdminAfiliados() {
  const [activeTab, setActiveTab] = useState("listar")
  const [afiliados, setAfiliados] = useState<Afiliado[]>([])
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    chavePix: '',
    comissao: 10
  })

  // Dados simulados de pagamentos (deve ser substituído por dados reais)
  const pagamentosData = []

  useEffect(() => {
    carregarAfiliados()
    const handleUpdate = () => carregarAfiliados()
    window.addEventListener("afiliados-updated", handleUpdate)
    return () => window.removeEventListener("afiliados-updated", handleUpdate)
  }, [])

  const carregarAfiliados = () => {
    setAfiliados(listarAfiliados())
  }

  const handleCriarAfiliado = () => {
    if (!formData.nome || !formData.email || !formData.chavePix) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    criarAfiliado(formData)
    setFormData({ nome: '', email: '', telefone: '', cpf: '', chavePix: '', comissao: 10 })
    setActiveTab("listar")
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="listar">Afiliados</TabsTrigger>
        <TabsTrigger value="cadastrar">Cadastrar Afiliado</TabsTrigger>
        <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
      </TabsList>

      <TabsContent value="listar">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Afiliados</CardTitle>
            <CardDescription>Visualize, edite ou exclua os afiliados cadastrados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Input placeholder="Buscar afiliados..." className="max-w-sm" />
              <Button onClick={() => setActiveTab("cadastrar")}>
                <Plus className="mr-2 h-4 w-4" /> Novo Afiliado
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Valor Vendas</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {afiliados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Nenhum afiliado cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  afiliados.map((afiliado) => (
                    <TableRow key={afiliado.id}>
                      <TableCell>{afiliado.id}</TableCell>
                      <TableCell>{afiliado.nome}</TableCell>
                      <TableCell>{afiliado.email}</TableCell>
                      <TableCell>{afiliado.comissao}%</TableCell>
                      <TableCell>{afiliado.vendas}</TableCell>
                      <TableCell>R$ {afiliado.valorVendas.toFixed(2)}</TableCell>
                      <TableCell>R$ {afiliado.valorComissao.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={afiliado.status === "ativo" ? "default" : "secondary"}>
                          {afiliado.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" title="Copiar Link">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" title="Pagamento">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            title="Excluir"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este afiliado?')) {
                                excluirAfiliado(afiliado.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cadastrar">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Afiliado</CardTitle>
            <CardDescription>Preencha os campos para cadastrar um novo afiliado.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleCriarAfiliado(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    placeholder="Nome completo do afiliado"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email do afiliado"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="Telefone do afiliado"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comissao">Comissão (%)</Label>
                  <Input
                    id="comissao"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.comissao}
                    onChange={(e) => setFormData({...formData, comissao: parseInt(e.target.value) || 10})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="CPF do afiliado"
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pix">Chave PIX</Label>
                  <Input
                    id="pix"
                    placeholder="Chave PIX para pagamentos"
                    value={formData.chavePix}
                    onChange={(e) => setFormData({...formData, chavePix: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("listar")}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
                  Cadastrar Afiliado
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pagamentos">
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos de Comissões</CardTitle>
            <CardDescription>Gerencie os pagamentos de comissões para afiliados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Input placeholder="Buscar pagamentos..." className="max-w-sm" />
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagamentosData.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    <TableCell>{pagamento.id}</TableCell>
                    <TableCell>{pagamento.afiliado}</TableCell>
                    <TableCell>R$ {pagamento.valor.toFixed(2)}</TableCell>
                    <TableCell>{new Date(pagamento.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{pagamento.metodo}</TableCell>
                    <TableCell>
                      <Badge variant={pagamento.status === "pago" ? "default" : "secondary"}>
                        {pagamento.status === "pago" ? "Pago" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {pagamento.status === "pendente" && (
                          <Button variant="outline" size="icon" title="Marcar como Pago">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="configuracoes">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema de Afiliados</CardTitle>
            <CardDescription>Configure as opções gerais do sistema de afiliados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="comissaoPadrao">Comissão Padrão (%)</Label>
                <Input id="comissaoPadrao" type="number" min="1" max="50" defaultValue="10" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMinimoPagamento">Valor Mínimo para Pagamento (R$)</Label>
                <Input id="valorMinimoPagamento" type="number" min="1" defaultValue="50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodoPagamentoPadrao">Método de Pagamento Padrão</Label>
                <Select defaultValue="pix">
                  <SelectTrigger id="metodoPagamentoPadrao">
                    <SelectValue placeholder="Selecione o método padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequenciaPagamento">Frequência de Pagamento</Label>
                <Select defaultValue="mensal">
                  <SelectTrigger id="frequenciaPagamento">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Opções do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="sistemaAtivo" defaultChecked />
                  <Label htmlFor="sistemaAtivo">Sistema de Afiliados Ativo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="aprovacaoManual" />
                  <Label htmlFor="aprovacaoManual">Aprovação Manual de Afiliados</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="pagamentoAutomatico" defaultChecked />
                  <Label htmlFor="pagamentoAutomatico">Pagamento Automático</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notificarAdmin" defaultChecked />
                  <Label htmlFor="notificarAdmin">Notificar Admin sobre Novas Vendas</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notificarAfiliado" defaultChecked />
                  <Label htmlFor="notificarAfiliado">Notificar Afiliado sobre Vendas</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="exibirRanking" defaultChecked />
                  <Label htmlFor="exibirRanking">Exibir Ranking de Afiliados</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personalização</h3>
              <div className="space-y-2">
                <Label htmlFor="textoConvite">Texto do Convite para Afiliados</Label>
                <Textarea
                  id="textoConvite"
                  placeholder="Texto que será exibido para convidar novos afiliados"
                  defaultValue="Torne-se um afiliado e ganhe comissões por cada venda realizada através do seu link exclusivo!"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termos">Termos e Condições para Afiliados</Label>
                <Textarea
                  id="termos"
                  placeholder="Termos e condições que os afiliados devem aceitar"
                  defaultValue="Ao se tornar um afiliado, você concorda em seguir nossas políticas e diretrizes. As comissões serão pagas mensalmente, desde que atinjam o valor mínimo estabelecido."
                  rows={5}
                />
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
