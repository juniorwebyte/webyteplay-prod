"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShoppingCart, ArrowLeft, Loader2, MapPin, User, Package, CreditCard, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { formatarValor, formatarCPF, formatarTelefone, formatarCEP } from "@/lib/formatadores"
import { buscarCep } from "@/lib/use-cep"
import {
  listarItensCarrinho,
  valorTotalCarrinho,
  limparCarrinho,
  atualizarQuantidade,
  removerDoCarrinho,
  type ItemCarrinhoLoja,
} from "@/lib/carrinho-loja-store"
import { criarPedido, buscarClientePorCpf, type Pedido } from "@/lib/gateway-store"
import { validarCupom } from "@/lib/marketing-loja-store"
import { atualizarPedidoLoja } from "@/lib/pedidos-loja-store"
import PagamentoPix from "@/components/pagamento-pix"

const STEPS = [
  { id: 1, label: "Carrinho", icon: ShoppingCart },
  { id: 2, label: "Identificação", icon: User },
  { id: 3, label: "Endereço", icon: MapPin },
  { id: 4, label: "Frete", icon: Package },
  { id: 5, label: "Revisão", icon: CheckCircle2 },
  { id: 6, label: "Pagamento", icon: CreditCard },
]

type OpcaoFrete = { nome: string; prazo: string; valor: number }

export default function CheckoutCarrinho() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [carrinho, setCarrinho] = useState<ItemCarrinhoLoja[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [pedidoAtual, setPedidoAtual] = useState<Pedido | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [cupomInput, setCupomInput] = useState("")
  const [cupomAplicado, setCupomAplicado] = useState<{ codigo: string; desconto: number } | null>(null)
  const [erroCupom, setErroCupom] = useState("")
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
  })
  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  })
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([])
  const [freteEscolhido, setFreteEscolhido] = useState<OpcaoFrete | null>(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    const itens = listarItensCarrinho()
    setCarrinho(itens)

    try {
      const raw = localStorage.getItem("user")
      if (raw) {
        const parsed = JSON.parse(raw) as { cpf?: string; nome?: string; telefone?: string; celular?: string; email?: string }
        const cpfLimpo = parsed?.cpf ? parsed.cpf.replace(/\D/g, "") : ""
        if (cpfLimpo.length === 11) {
          const cliente = buscarClientePorCpf(cpfLimpo)
          setFormData({
            nome: parsed.nome || cliente?.nome || "",
            email: parsed.email || cliente?.email || "",
            telefone: parsed.telefone || parsed.celular || cliente?.telefone || "",
            cpf: parsed.cpf || "",
          })
        }
      }
    } catch {}

    const h = () => setCarrinho(listarItensCarrinho())
    window.addEventListener("carrinho-loja-updated", h)
    return () => window.removeEventListener("carrinho-loja-updated", h)
  }, [])

  const subtotal = valorTotalCarrinho()
  const desconto = cupomAplicado?.desconto ?? 0
  const valorFrete = freteEscolhido?.valor ?? 0
  const total = Math.max(0, subtotal - desconto + valorFrete)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "cpf") setFormData((f) => ({ ...f, cpf: formatarCPF(value) }))
    else if (name === "telefone") setFormData((f) => ({ ...f, telefone: formatarTelefone(value) }))
    else setFormData((f) => ({ ...f, [name]: value }))
  }

  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "cep") setEndereco((e) => ({ ...e, cep: formatarCEP(value) }))
    else setEndereco((e) => ({ ...e, [name]: value }))
  }

  const buscarEnderecoByCep = async () => {
    const cep = endereco.cep.replace(/\D/g, "")
    if (cep.length !== 8) {
      toast.error("CEP inválido. Informe 8 dígitos.")
      return
    }
    setBuscandoCep(true)
    try {
      const data = await buscarCep(cep)
      if (data) {
        setEndereco((e) => ({
          ...e,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
        }))
        toast.success("Endereço preenchido!")
      } else {
        toast.error("CEP não encontrado")
      }
    } catch {
      toast.error("Erro ao buscar CEP")
    } finally {
      setBuscandoCep(false)
    }
  }

  const aplicarCupom = () => {
    setErroCupom("")
    if (!cupomInput.trim()) return
    const result = validarCupom(cupomInput.trim(), subtotal)
    if (result) {
      setCupomAplicado({ codigo: result.cupom.codigo, desconto: result.desconto })
      toast.success(`Cupom ${result.cupom.codigo} aplicado! Desconto: ${formatarValor(result.desconto)}`)
    } else {
      setErroCupom("Cupom inválido, expirado ou não atende ao valor mínimo.")
      toast.error("Cupom inválido")
    }
  }

  const removerCupom = () => {
    setCupomAplicado(null)
    setCupomInput("")
    setErroCupom("")
    toast.success("Cupom removido")
  }

  const avancarStep = () => {
    setErro("")
    if (step === 2) {
      if (!formData.nome.trim() || !formData.email.trim() || !formData.telefone.trim() || !formData.cpf.trim()) {
        setErro("Preencha todos os campos obrigatórios.")
        return
      }
      const cpfLimpo = formData.cpf.replace(/\D/g, "")
      if (cpfLimpo.length !== 11) {
        setErro("CPF inválido.")
        return
      }
    }
    if (step === 3) {
      const cep = endereco.cep.replace(/\D/g, "")
      if (cep.length !== 8 || !endereco.logradouro || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.estado) {
        setErro("Preencha o endereço completo. Use o botão Buscar ao informar o CEP.")
        return
      }
      setOpcoesFrete([
        { nome: "Econômico", prazo: "7-12 dias", valor: 15.9 },
        { nome: "Expresso", prazo: "3-5 dias", valor: 29.9 },
        { nome: "Retirada na loja", prazo: "Mesmo dia", valor: 0 },
      ])
      setFreteEscolhido(null)
    }
    setStep((s) => Math.min(s + 1, 6))
  }

  const voltarStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleFinalizar = async () => {
    setErro("")
    if (carrinho.length === 0) {
      setErro("Carrinho vazio.")
      return
    }
    if (!formData.nome.trim() || !formData.email.trim() || !formData.telefone.trim() || !formData.cpf.trim()) {
      setErro("Preencha todos os campos obrigatórios.")
      return
    }
    const cpfLimpo = formData.cpf.replace(/\D/g, "")
    if (cpfLimpo.length !== 11) {
      setErro("CPF inválido.")
      return
    }
    const cep = endereco.cep.replace(/\D/g, "")
    if (cep.length !== 8 || !endereco.logradouro || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.estado) {
      setErro("Preencha o endereço completo.")
      return
    }
    if (!freteEscolhido) {
      setErro("Selecione uma opção de frete.")
      return
    }

    setSalvando(true)
    const itensDescricao = carrinho.map((i) => `${i.nome} x${i.quantidade}`).join(", ")

    try {
      const pedido = criarPedido({
        campanhaId: "loja-virtual",
        campanhaTitulo: `Loja Virtual - ${itensDescricao}`,
        quantidade: carrinho.reduce((s, i) => s + i.quantidade, 0),
        valorUnitario: total / carrinho.reduce((s, i) => s + i.quantidade, 0),
        nomeComprador: formData.nome.trim(),
        emailComprador: formData.email.trim(),
        telefoneComprador: formData.telefone.replace(/\D/g, ""),
        cpfComprador: cpfLimpo,
        tipoEspecial: "produto_loja",
        itensCarrinho: carrinho.map((i) => ({
          produtoId: i.produtoId,
          nome: i.nome,
          quantidade: i.quantidade,
          valorUnitario: i.valorUnitario,
        })),
      } as any)

      atualizarPedidoLoja(pedido.id, {
        enderecoEntrega: {
          cep: endereco.cep,
          rua: endereco.logradouro,
          numero: endereco.numero,
          complemento: endereco.complemento,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
        },
        metodoEnvio: freteEscolhido.nome,
      })

      setPedidoAtual({ ...pedido, valorTotal: total })
      setShowPayment(true)
      toast.success("Pedido criado! Complete o pagamento.")
    } catch (err) {
      setErro("Erro ao criar pedido. Tente novamente.")
      toast.error("Erro ao criar pedido")
    } finally {
      setSalvando(false)
    }
  }

  const handlePago = (pedidoPago: Pedido) => {
    limparCarrinho()
    setShowPayment(false)
    setPedidoAtual(null)
    toast.success("Pagamento confirmado! Obrigado pela compra.")
    router.push("/loja/sucesso?id=" + pedidoPago.id)
  }

  if (showPayment && pedidoAtual) {
    return (
      <PagamentoPix
        pedido={pedidoAtual}
        onVoltar={() => {
          setShowPayment(false)
          setPedidoAtual(null)
        }}
        onPago={handlePago}
      />
    )
  }

  if (carrinho.length === 0 && !showPayment) {
    return (
      <Card className="bg-[#171923] border-gray-800">
        <CardContent className="py-16 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Carrinho vazio</h3>
          <p className="text-gray-400 mb-4">Adicione produtos ao carrinho para continuar.</p>
          <Button onClick={() => router.push("/gamificacao?tab=loja")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar à Loja
          </Button>
        </CardContent>
      </Card>
    )
  }

  const StepIcon = STEPS[step - 1]?.icon ?? ShoppingCart

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center gap-1 text-sm ${i + 1 <= step ? "text-[#FFB800]" : "text-gray-500"}`}
          >
            <s.icon className="h-4 w-4" />
            <span>{s.label}</span>
            {i < STEPS.length - 1 && <span className="text-gray-600">→</span>}
          </div>
        ))}
      </div>

      <Card className="bg-[#171923] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <StepIcon className="h-6 w-6" /> Checkout - {STEPS[step - 1]?.label}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Revise os itens, ajuste quantidades e aplique cupom"}
            {step === 2 && "Identifique-se para continuar"}
            {step === 3 && "Informe o endereço de entrega"}
            {step === 4 && "Escolha a opção de frete"}
            {step === 5 && "Revise o pedido antes de pagar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {erro && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{erro}</div>
          )}

          {step === 1 && (
            <>
              <div className="space-y-3">
                {carrinho.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-700">
                    <div>
                      <p className="text-white font-medium">{item.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                          disabled={item.quantidade <= 1}
                        >
                          -
                        </Button>
                        <span className="text-gray-400 w-8 text-center">{item.quantidade}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                        >
                          +
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removerDoCarrinho(item.id)} className="text-red-400">
                          Remover
                        </Button>
                      </div>
                    </div>
                    <span className="text-[#FFB800] font-bold">{formatarValor(item.quantidade * item.valorUnitario)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Cupom de desconto"
                  value={cupomInput}
                  onChange={(e) => setCupomInput(e.target.value)}
                  className="bg-background max-w-[200px]"
                />
                <Button variant="outline" onClick={aplicarCupom} disabled={!cupomInput.trim()}>
                  Aplicar
                </Button>
                {cupomAplicado && (
                  <Button variant="ghost" size="sm" onClick={removerCupom} className="text-green-400">
                    {cupomAplicado.codigo} (-{formatarValor(cupomAplicado.desconto)})
                  </Button>
                )}
              </div>
              {erroCupom && <p className="text-red-400 text-sm">{erroCupom}</p>}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatarValor(subtotal)}</span>
                </div>
                {cupomAplicado && (
                  <div className="flex justify-between text-green-400">
                    <span>Desconto ({cupomAplicado.codigo})</span>
                    <span>-{formatarValor(cupomAplicado.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-white mt-2">
                  <span>Total</span>
                  <span className="text-green-400">{formatarValor(subtotal - desconto)}</span>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div><Label className="text-gray-400">Nome Completo *</Label><Input name="nome" value={formData.nome} onChange={handleChange} className="bg-background" required /></div>
              <div><Label className="text-gray-400">E-mail *</Label><Input name="email" type="email" value={formData.email} onChange={handleChange} className="bg-background" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-gray-400">Telefone *</Label><Input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} className="bg-background" /></div>
                <div><Label className="text-gray-400">CPF *</Label><Input name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} className="bg-background" /></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    name="cep"
                    value={endereco.cep}
                    onChange={handleEnderecoChange}
                    onBlur={() => endereco.cep.replace(/\D/g, "").length === 8 && buscarEnderecoByCep()}
                    placeholder="00000-000"
                    maxLength={9}
                    className="bg-background"
                  />
                  <Button type="button" variant="outline" onClick={buscarEnderecoByCep} disabled={buscandoCep}>
                    {buscandoCep ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                  </Button>
                </div>
                <p className="text-gray-500 text-xs mt-1">Digite o CEP e saia do campo para buscar automaticamente</p>
              </div>
              <div><Label className="text-gray-400">Logradouro *</Label><Input name="logradouro" value={endereco.logradouro} onChange={handleEnderecoChange} className="bg-background" placeholder="Rua, avenida..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-gray-400">Número *</Label><Input name="numero" value={endereco.numero} onChange={handleEnderecoChange} className="bg-background" /></div>
                <div><Label className="text-gray-400">Complemento</Label><Input name="complemento" value={endereco.complemento} onChange={handleEnderecoChange} className="bg-background" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-gray-400">Bairro *</Label><Input name="bairro" value={endereco.bairro} onChange={handleEnderecoChange} className="bg-background" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-400">Cidade *</Label><Input name="cidade" value={endereco.cidade} onChange={handleEnderecoChange} className="bg-background" /></div>
                  <div><Label className="text-gray-400">UF *</Label><Input name="estado" value={endereco.estado} onChange={handleEnderecoChange} className="bg-background w-20" maxLength={2} /></div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              {opcoesFrete.map((op) => (
                <div
                  key={op.nome}
                  className={`flex justify-between items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                    freteEscolhido?.nome === op.nome ? "border-[#FFB800] bg-[#FFB800]/10" : "border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => setFreteEscolhido(op)}
                >
                  <div>
                    <p className="text-white font-medium">{op.nome}</p>
                    <p className="text-gray-400 text-sm">{op.prazo}</p>
                  </div>
                  <span className="text-[#FFB800] font-bold">{op.valor === 0 ? "Grátis" : formatarValor(op.valor)}</span>
                </div>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Resumo do Pedido</h4>
                {carrinho.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 text-sm">
                    <span className="text-gray-400">{item.nome} x{item.quantidade}</span>
                    <span className="text-white">{formatarValor(item.quantidade * item.valorUnitario)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-4 space-y-1">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatarValor(subtotal)}</span></div>
                {cupomAplicado && <div className="flex justify-between text-green-400"><span>Desconto</span><span>-{formatarValor(desconto)}</span></div>}
                <div className="flex justify-between text-gray-400"><span>Frete ({freteEscolhido?.nome})</span><span>{formatarValor(valorFrete)}</span></div>
                <div className="flex justify-between text-xl font-bold text-white mt-2"><span>Total</span><span className="text-green-400">{formatarValor(total)}</span></div>
              </div>
              <div className="text-sm text-gray-500">
                <p><strong className="text-gray-400">Entrega:</strong> {endereco.logradouro}, {endereco.numero}{endereco.complemento ? `, ${endereco.complemento}` : ""} - {endereco.bairro}, {endereco.cidade}/{endereco.estado} - CEP {endereco.cep}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={voltarStep} disabled={step === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            {step < 5 ? (
              <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={avancarStep}>
                Continuar
              </Button>
            ) : (
              <Button
                className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-bold py-6 px-8"
                onClick={handleFinalizar}
                disabled={salvando}
              >
                {salvando ? <Loader2 className="h-5 w-5 animate-spin" /> : `Finalizar Compra - ${formatarValor(total)}`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
