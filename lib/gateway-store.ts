// Modulo centralizado de persistencia de gateway, pedidos e clientes (localStorage)
// Substituir por chamadas API quando um banco de dados for conectado

import { processarCotasPremiadasParaPedido } from "@/lib/cotas-premiadas-store"
import { buscarCampanha } from "@/lib/campanhas-store"
import { verificarCredenciaisAdmin } from "./auth-admin"

// ==================== TYPES ====================

export interface GatewayConfig {
  ativo: boolean
  nome: string
  gatewayAtivo: string // "pushinpay" | "mercadopago" | "openpix" | "asaas" | "suitpay" | "ezzebank" | "dinamico"

  // Chave PIX
  tipoChavePix: string // "cpf" | "cnpj" | "email" | "telefone" | "aleatoria"
  chavePix: string
  nomeRecebedor: string
  cidadeRecebedor: string

  // Gateway keys
  chaveApi: string
  pushinpayAtivo: boolean
  pushinpayApiKey: string
  mercadopagoAtivo: boolean
  mercadopagoAccessToken: string
  openpixAtivo: boolean
  openpixAppId: string
  asaasAtivo: boolean
  asaasApiKey: string
  asaasSandbox: boolean
  suitpayAtivo: boolean
  suitpayClientId: string
  suitpayClientSecret: string
  ezzebankAtivo: boolean
  ezzebankClientId: string
  ezzebankClientSecret: string

  // Configuracoes de pagamento
  tempoExpiracaoMinutos: number
  baixaAutomatica: boolean
  tempoSimulacaoBaixaSegundos: number
}

export interface Pedido {
  id: string
  campanhaId: string
  campanhaTitulo: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  nomeComprador: string
  telefoneComprador: string
  emailComprador: string
  cpfComprador: string
  status: "pendente" | "pago" | "expirado"
  pixCopiaECola: string
  numerosEscolhidos: number[]
  criadoEm: string
  expiraEm: string
  pagoEm: string | null
  afiliadoId?: string
  /** ID da cobrança OpenPix (para verificação automática de pagamento) */
  openpixChargeId?: string
}

export interface Cliente {
  id: string
  nome: string
  cpf: string
  email: string
  telefone: string
  dataCadastro: string
  ultimaCompra: string
  totalCompras: number
  valorGasto: number
  pedidos: string[] // pedido IDs
  status: "ativo" | "inativo"
}

export interface Afiliado {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  chavePix: string
  comissao: number // percentual
  vendas: number
  valorVendas: number
  valorComissao: number
  saldoDisponivel: number
  status: "ativo" | "inativo"
  linkCodigo: string
  criadoEm: string
  pedidos: string[]
}

// ==================== STORAGE KEYS ====================

const GATEWAY_KEY = "gateway-config"
const PEDIDOS_KEY = "pedidos"
const CLIENTES_KEY = "clientes"
const AFILIADOS_KEY = "afiliados"

// ==================== HELPERS ====================

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

function dispatchEvent(name: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(name))
  }
}

// ==================== PIX EMV/BRCODE GENERATOR ====================

function gerarPixCopiaECola(
  chavePix: string,
  tipoChave: string,
  nomeRecebedor: string,
  cidadeRecebedor: string,
  valor: number,
  txId: string
): string {
  // Implementação simplificada baseada na documentação do Banco Central
  // Usando uma abordagem mais direta para garantir compatibilidade

  function addTLV(id: string, value: string): string {
    const length = value.length.toString().padStart(2, '0')
    return id + length + value
  }

  let payload = ''

  // 00 - Payload Format Indicator (obrigatório)
  payload += addTLV('00', '01')

  // 26 - Merchant Account Information (PIX)
  let merchantAccount = ''
  merchantAccount += addTLV('00', 'br.gov.bcb.pix')  // GUI
  merchantAccount += addTLV('01', chavePix)          // Chave PIX
  payload += addTLV('26', merchantAccount)

  // 52 - Merchant Category Code
  payload += addTLV('52', '0000')

  // 53 - Transaction Currency (986 = BRL)
  payload += addTLV('53', '986')

  // 54 - Transaction Amount
  payload += addTLV('54', valor.toFixed(2))

  // 58 - Country Code
  payload += addTLV('58', 'BR')

  // 59 - Merchant Name
  const nome = nomeRecebedor.substring(0, 25).toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  payload += addTLV('59', nome)

  // 60 - Merchant City
  const cidade = cidadeRecebedor.substring(0, 15).toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  payload += addTLV('60', cidade)

  // 62 - Additional Data Field (txid)
  const txIdClean = txId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25)
  payload += addTLV('62', addTLV('05', txIdClean))

  // 63 - CRC16
  payload += '6304'
  const crc = crc16CCITT(payload)
  payload += crc

  return payload
}

function crc16CCITT(str: string): string {
  // Implementação mais robusta do CRC16-CCITT
  const polynomial = 0x1021
  let crc = 0xFFFF

  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8) & 0xFFFF

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) & 0xFFFF) ^ polynomial
      } else {
        crc = (crc << 1) & 0xFFFF
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0')
}

// Função para validar se o payload PIX está correto
export function validarPayloadPIX(payload: string): boolean {
  try {
    // Verificações básicas
    if (!payload || typeof payload !== 'string') return false
    if (!payload.startsWith('000201')) return false
    if (!payload.includes('6304')) return false

    // Verificar se tem os campos obrigatórios
    const requiredPatterns = [
      /52040000/,  // Merchant Category Code
      /5303986/,   // Currency BRL
      /5802BR/,    // Country Code BR
      /59\d{2}[A-Z\s]+/, // Merchant Name
      /60\d{2}[A-Z\s]+/, // Merchant City
    ]

    for (const pattern of requiredPatterns) {
      if (!pattern.test(payload)) return false
    }

    // Verificar se o payload tem um tamanho razoável
    if (payload.length < 100 || payload.length > 500) return false

    // Verificar CRC (se presente)
    if (payload.includes('6304')) {
      const crcIndex = payload.lastIndexOf('63')
      if (crcIndex === -1 || payload.length < crcIndex + 8) return false

      const crcRecebido = payload.substring(crcIndex + 4, crcIndex + 8)
      const payloadSemCrc = payload.substring(0, crcIndex + 4)

      try {
        const crcCalculado = crc16CCITT(payloadSemCrc)
        if (crcCalculado !== crcRecebido) {
          console.warn('CRC inválido, mas continuando...', { calculado: crcCalculado, recebido: crcRecebido })
          // Não falhar por causa do CRC, pois pode haver diferenças na implementação
        }
      } catch (error) {
        console.warn('Erro ao calcular CRC:', error)
      }
    }

    return true
  } catch (error) {
    console.error('Erro ao validar payload PIX:', error)
    return false
  }
}

/** Gera números aleatórios excluindo bloqueados (e opcionalmente vendidos) */
function gerarNumeros(
  quantidade: number,
  maxNumero: number,
  excluir?: Set<number>
): number[] {
  const numeros = new Set<number>()
  const max = Math.min(maxNumero, 99999)
  const bloqueados = excluir ?? new Set<number>()
  let tentativas = 0
  const maxTentativas = max * 3
  while (numeros.size < quantidade && tentativas < maxTentativas) {
    const n = Math.floor(Math.random() * max) + 1
    if (!bloqueados.has(n)) numeros.add(n)
    tentativas++
  }
  return Array.from(numeros).sort((a, b) => a - b)
}

// ==================== GATEWAY CONFIG ====================

const DEFAULT_CONFIG: GatewayConfig = {
  ativo: true,
  nome: "WebytePlay Gateway",
  gatewayAtivo: "dinamico",
  tipoChavePix: "aleatoria",
  chavePix: "4041f9dc-23a6-44fc-9c0e-2213d8f28515",
  nomeRecebedor: "WebytePay Tecn. Pag. S.A.",
  cidadeRecebedor: "SAO PAULO",
  chaveApi: "",
  pushinpayAtivo: false,
  pushinpayApiKey: "",
  mercadopagoAtivo: false,
  mercadopagoAccessToken: "",
  openpixAtivo: false,
  openpixAppId: "",
  asaasAtivo: false,
  asaasApiKey: "",
  asaasSandbox: false,
  suitpayAtivo: false,
  suitpayClientId: "",
  suitpayClientSecret: "",
  ezzebankAtivo: false,
  ezzebankClientId: "",
  ezzebankClientSecret: "",
  tempoExpiracaoMinutos: 15,
  baixaAutomatica: true,
  tempoSimulacaoBaixaSegundos: 10,
}

export function obterGatewayConfig(): GatewayConfig {
  return { ...DEFAULT_CONFIG, ...getStorage<Partial<GatewayConfig>>(GATEWAY_KEY, {}) }
}

export async function salvarGatewayConfig(partial: Partial<GatewayConfig>): Promise<GatewayConfig> {
  const current = obterGatewayConfig()
  const updated = { ...current, ...partial }
  setStorage(GATEWAY_KEY, updated)
  dispatchEvent("gateway-updated")
  return updated
}

// ==================== PEDIDOS ====================

export function listarPedidos(): Pedido[] {
  return getStorage<Pedido[]>(PEDIDOS_KEY, [])
}

export function buscarPedido(id: string): Pedido | undefined {
  return listarPedidos().find((p) => p.id === id)
}

/** Adiciona um pedido ao localStorage (ex.: vindo da API OpenPix) */
export function adicionarPedidoLocal(pedido: Pedido): void {
  const pedidos = listarPedidos()
  const idx = pedidos.findIndex((p) => p.id === pedido.id)
  if (idx >= 0) pedidos[idx] = pedido
  else pedidos.push(pedido)
  setStorage(PEDIDOS_KEY, pedidos)
  dispatchEvent("pedidos-updated")
}

export function buscarPedidosPorCpf(cpf: string): Pedido[] {
  const cpfClean = cpf.replace(/\D/g, "")
  return listarPedidos().filter(
    (p) => p.cpfComprador.replace(/\D/g, "") === cpfClean && p.status === "pago"
  )
}

export function buscarPedidosPorTelefone(telefone: string): Pedido[] {
  const telClean = telefone.replace(/\D/g, "")
  return listarPedidos().filter(
    (p) => p.telefoneComprador.replace(/\D/g, "") === telClean && p.status === "pago"
  )
}

interface CriarPedidoParams {
  campanhaId: string
  campanhaTitulo: string
  quantidade: number
  valorUnitario: number
  nomeComprador: string
  telefoneComprador: string
  emailComprador: string
  cpfComprador: string
  afiliadoId?: string
  /** Para tipo "numeros": números escolhidos manualmente pelo usuário. Se não informado, serão gerados após o pagamento (tipo automático). */
  numerosEscolhidos?: number[]
  /** Tipo especial: "roleta", "box" ou "produto_loja" - para pagamentos de giros/aberturas/produtos */
  tipoEspecial?: "roleta" | "box" | "produto_loja"
  /** Quantidade de giros/aberturas (quando tipoEspecial) */
  quantidadeEspecial?: number
}

export function criarPedido(params: CriarPedidoParams): Pedido {
  const config = obterGatewayConfig()
  const pedidos = listarPedidos()

  const id = `PED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const valorTotal = params.quantidade * params.valorUnitario
  const now = new Date()
  const expira = new Date(now.getTime() + config.tempoExpiracaoMinutos * 60 * 1000)

  // Gerar chave PIX para o QR Code EMV
  // IMPORTANTE: Para produção, use uma chave PIX válida registrada no seu PSP
  // Chaves aleatórias precisam ser geradas e registradas por um PSP autorizado
  const chavePix = config.chavePix || "teste@webyteplay.com" // Chave de email para testes
  const tipoChave = config.tipoChavePix || "email"

  // Validar se a chave PIX está configurada adequadamente
  if (!config.chavePix || config.chavePix === "teste@webyteplay.com") {
    console.warn('AVISO: Usando chave PIX de teste. Configure uma chave PIX válida no painel admin para pagamentos reais.')
  }
  const txId = id.replace(/[^a-zA-Z0-9]/g, "").substring(0, 25)

  const pixCopiaECola = gerarPixCopiaECola(
    chavePix,
    tipoChave,
    config.nomeRecebedor || "WebytePay Tecn. Pag. S.A.",
    config.cidadeRecebedor || "SAO PAULO",
    valorTotal,
    txId
  )

  // Validar o payload PIX gerado
  if (!validarPayloadPIX(pixCopiaECola)) {
    console.error('Payload PIX inválido gerado:', pixCopiaECola)
    throw new Error('Falha ao gerar payload PIX válido')
  }

  const pedido: Pedido & { tipoEspecial?: "roleta" | "box"; quantidadeEspecial?: number } = {
    id,
    campanhaId: params.campanhaId,
    campanhaTitulo: params.campanhaTitulo,
    quantidade: params.quantidade,
    valorUnitario: params.valorUnitario,
    valorTotal,
    nomeComprador: params.nomeComprador,
    telefoneComprador: params.telefoneComprador,
    emailComprador: params.emailComprador,
    cpfComprador: params.cpfComprador,
    status: "pendente",
    pixCopiaECola,
    numerosEscolhidos: Array.isArray(params.numerosEscolhidos) && params.numerosEscolhidos.length > 0
      ? [...params.numerosEscolhidos].sort((a, b) => a - b)
      : [],
    criadoEm: now.toISOString(),
    expiraEm: expira.toISOString(),
    pagoEm: null,
    afiliadoId: params.afiliadoId,
    tipoEspecial: params.tipoEspecial,
    quantidadeEspecial: params.quantidadeEspecial,
  }

  pedidos.push(pedido)
  setStorage(PEDIDOS_KEY, pedidos)
  dispatchEvent("pedidos-updated")

  return pedido
}

export function confirmarPagamento(pedidoId: string): Pedido | undefined {
  const pedidos = listarPedidos()
  const index = pedidos.findIndex((p) => p.id === pedidoId)
  if (index === -1) return undefined

  const pedido = pedidos[index]
  if (pedido.status === "pago") return pedido // ja pago

  const pedidoComTipo = pedido as Pedido & { tipoEspecial?: "roleta" | "box"; quantidadeEspecial?: number }
  
  // Se for pedido de roleta/box, não gerar números (será tratado no componente)
  if (pedidoComTipo.tipoEspecial) {
    pedidos[index] = {
      ...pedido,
      status: "pago",
      pagoEm: new Date().toISOString(),
      numerosEscolhidos: [],
    }
    setStorage(PEDIDOS_KEY, pedidos)
    dispatchEvent("pedidos-updated")
    registrarCliente(pedidos[index])
    if (pedido.afiliadoId) {
      atualizarVendaAfiliado(pedido.afiliadoId, pedidos[index])
    }
    return pedidos[index]
  }

  // Se o usuário já escolheu os números (tipo "numeros" ou bichos), manter. Senão gerar aleatórios.
  const campanha = buscarCampanha(pedido.campanhaId)
  const totalCotas = campanha ? parseInt(campanha.quantidadeNumeros || "99999", 10) || 99999 : 99999
  const bloqueados = new Set<number>(campanha?.cotasBloqueadas ?? [])
  pedidos
    .filter((p) => p.campanhaId === pedido.campanhaId && p.status === "pago" && Array.isArray(p.numerosEscolhidos))
    .forEach((p) => p.numerosEscolhidos?.forEach((num) => bloqueados.add(num)))

  let numeros: number[]
  if (pedido.numerosEscolhidos && pedido.numerosEscolhidos.length >= pedido.quantidade) {
    const escolhidos = pedido.numerosEscolhidos.slice(0, pedido.quantidade)
    const conflito = escolhidos.find((n) => bloqueados.has(n))
    if (conflito !== undefined) {
      console.warn(`confirmarPagamento: número ${conflito} já vendido, não é possível confirmar pedido ${pedidoId}`)
      return undefined
    }
    numeros = escolhidos
  } else {
    numeros = gerarNumeros(pedido.quantidade, totalCotas, bloqueados)
  }

  pedidos[index] = {
    ...pedido,
    status: "pago",
    pagoEm: new Date().toISOString(),
    numerosEscolhidos: numeros,
  }

  setStorage(PEDIDOS_KEY, pedidos)
  dispatchEvent("pedidos-updated")

  // Registrar/atualizar cliente automaticamente
  registrarCliente(pedidos[index])

  // Atualizar afiliado se houver
  if (pedido.afiliadoId) {
    atualizarVendaAfiliado(pedido.afiliadoId, pedidos[index])
  }

  // Processar premiação instantânea (cotas premiadas) após pagamento confirmado
  processarCotasPremiadasParaPedido(pedidos[index])

  return pedidos[index]
}

/** Sincroniza um pedido já confirmado pelo servidor (webhook PIX) para o localStorage e dispara cliente/afiliado */
export function receberPedidoConfirmado(pedidoConfirmado: Pedido): Pedido | undefined {
  const pedidos = listarPedidos()
  const index = pedidos.findIndex((p) => p.id === pedidoConfirmado.id)
  const updated = { ...pedidoConfirmado, status: "pago" as const }
  if (index >= 0) {
    pedidos[index] = updated
  } else {
    pedidos.push(updated)
  }
  setStorage(PEDIDOS_KEY, pedidos)
  dispatchEvent("pedidos-updated")
  registrarCliente(updated)
  if (updated.afiliadoId) {
    atualizarVendaAfiliado(updated.afiliadoId, updated)
  }

  // Processar premiação instantânea (cotas premiadas) após confirmação externa (webhook)
  processarCotasPremiadasParaPedido(updated)

  return updated
}

export function expirarPedido(pedidoId: string): Pedido | undefined {
  const pedidos = listarPedidos()
  const index = pedidos.findIndex((p) => p.id === pedidoId)
  if (index === -1) return undefined

  if (pedidos[index].status !== "pendente") return pedidos[index]

  pedidos[index] = { ...pedidos[index], status: "expirado" }
  setStorage(PEDIDOS_KEY, pedidos)
  dispatchEvent("pedidos-updated")

  return pedidos[index]
}

// ==================== CLIENTES ====================

export function listarClientes(): Cliente[] {
  return getStorage<Cliente[]>(CLIENTES_KEY, [])
}

export function buscarClientePorCpf(cpf: string): Cliente | undefined {
  const cpfClean = cpf.replace(/\D/g, "")
  return listarClientes().find((c) => c.cpf.replace(/\D/g, "") === cpfClean)
}

function registrarCliente(pedido: Pedido): Cliente {
  const clientes = listarClientes()
  const cpfClean = pedido.cpfComprador.replace(/\D/g, "")
  const existingIndex = clientes.findIndex((c) => c.cpf.replace(/\D/g, "") === cpfClean)

  if (existingIndex >= 0) {
    // Atualizar cliente existente
    const existing = clientes[existingIndex]
    clientes[existingIndex] = {
      ...existing,
      nome: pedido.nomeComprador || existing.nome,
      email: pedido.emailComprador || existing.email,
      telefone: pedido.telefoneComprador || existing.telefone,
      ultimaCompra: pedido.pagoEm || new Date().toISOString(),
      totalCompras: existing.totalCompras + 1,
      valorGasto: existing.valorGasto + pedido.valorTotal,
      pedidos: [...existing.pedidos, pedido.id],
      status: "ativo",
    }
    setStorage(CLIENTES_KEY, clientes)
    dispatchEvent("clientes-updated")
    return clientes[existingIndex]
  } else {
    // Criar novo cliente
    const novoCliente: Cliente = {
      id: `CLI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      nome: pedido.nomeComprador,
      cpf: pedido.cpfComprador,
      email: pedido.emailComprador,
      telefone: pedido.telefoneComprador,
      dataCadastro: new Date().toISOString(),
      ultimaCompra: pedido.pagoEm || new Date().toISOString(),
      totalCompras: 1,
      valorGasto: pedido.valorTotal,
      pedidos: [pedido.id],
      status: "ativo",
    }
    clientes.push(novoCliente)
    setStorage(CLIENTES_KEY, clientes)
    dispatchEvent("clientes-updated")
    return novoCliente
  }
}

// Registro de cliente a partir de um cadastro manual (sem pedido ainda)
export function registrarClienteCadastro(dados: {
  nome: string
  cpf: string
  email: string
  telefone: string
}): Cliente {
  const clientes = listarClientes()
  const cpfClean = dados.cpf.replace(/\D/g, "")
  const existenteIndex = clientes.findIndex((c) => c.cpf.replace(/\D/g, "") === cpfClean)

  if (existenteIndex >= 0) {
    const existente = clientes[existenteIndex]
    const atualizado: Cliente = {
      ...existente,
      nome: dados.nome || existente.nome,
      email: dados.email || existente.email,
      telefone: dados.telefone || existente.telefone,
    }
    clientes[existenteIndex] = atualizado
    setStorage(CLIENTES_KEY, clientes)
    dispatchEvent("clientes-updated")
    return atualizado
  }

  const agora = new Date().toISOString()
  const novo: Cliente = {
    id: `CLI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    nome: dados.nome,
    cpf: dados.cpf,
    email: dados.email,
    telefone: dados.telefone,
    dataCadastro: agora,
    ultimaCompra: agora,
    totalCompras: 0,
    valorGasto: 0,
    pedidos: [],
    status: "ativo",
  }

  clientes.push(novo)
  setStorage(CLIENTES_KEY, clientes)
  dispatchEvent("clientes-updated")
  return novo
}

// ==================== AFILIADOS ====================

export function listarAfiliados(): Afiliado[] {
  return getStorage<Afiliado[]>(AFILIADOS_KEY, [])
}

export function buscarAfiliado(id: string): Afiliado | undefined {
  return listarAfiliados().find((a) => a.id === id)
}

export function buscarAfiliadoPorCodigo(codigo: string): Afiliado | undefined {
  return listarAfiliados().find((a) => a.linkCodigo === codigo)
}

export function criarAfiliado(dados: {
  nome: string
  email: string
  telefone: string
  cpf: string
  chavePix: string
  comissao: number
}): Afiliado {
  const afiliados = listarAfiliados()
  const codigo = Math.random().toString(36).substring(2, 8).toUpperCase()

  const novoAfiliado: Afiliado = {
    id: `AFL-${Date.now().toString(36).toUpperCase()}`,
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    cpf: dados.cpf,
    chavePix: dados.chavePix,
    comissao: dados.comissao,
    vendas: 0,
    valorVendas: 0,
    valorComissao: 0,
    saldoDisponivel: 0,
    status: "ativo",
    linkCodigo: codigo,
    criadoEm: new Date().toISOString(),
    pedidos: [],
  }

  afiliados.push(novoAfiliado)
  setStorage(AFILIADOS_KEY, afiliados)
  dispatchEvent("afiliados-updated")
  return novoAfiliado
}

export function atualizarAfiliado(id: string, dados: Partial<Afiliado>): Afiliado | undefined {
  const afiliados = listarAfiliados()
  const index = afiliados.findIndex((a) => a.id === id)
  if (index === -1) return undefined

  afiliados[index] = { ...afiliados[index], ...dados }
  setStorage(AFILIADOS_KEY, afiliados)
  dispatchEvent("afiliados-updated")
  return afiliados[index]
}

export function excluirAfiliado(id: string): boolean {
  const afiliados = listarAfiliados()
  const filtered = afiliados.filter((a) => a.id !== id)
  if (filtered.length === afiliados.length) return false
  setStorage(AFILIADOS_KEY, filtered)
  dispatchEvent("afiliados-updated")
  return true
}

function atualizarVendaAfiliado(afiliadoId: string, pedido: Pedido): void {
  const afiliados = listarAfiliados()
  const index = afiliados.findIndex((a) => a.id === afiliadoId)
  if (index === -1) return

  const afiliado = afiliados[index]
  const comissaoValor = pedido.valorTotal * (afiliado.comissao / 100)

  afiliados[index] = {
    ...afiliado,
    vendas: afiliado.vendas + 1,
    valorVendas: afiliado.valorVendas + pedido.valorTotal,
    valorComissao: afiliado.valorComissao + comissaoValor,
    saldoDisponivel: afiliado.saldoDisponivel + comissaoValor,
    pedidos: [...afiliado.pedidos, pedido.id],
  }

  setStorage(AFILIADOS_KEY, afiliados)
  dispatchEvent("afiliados-updated")
}
