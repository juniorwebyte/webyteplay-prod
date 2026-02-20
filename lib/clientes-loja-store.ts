// Store para gestão extendida de Clientes da Loja Virtual
// Complementa o gateway-store com VIP, endereços, blocos, grupos, créditos, etc.

import { listarClientes, listarPedidos, type Cliente } from "./gateway-store"

export interface EnderecoCliente {
  id: string
  clienteId: string
  cep: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  padrao: boolean
  tipo: "entrega" | "cobranca" | "ambos"
}

export interface GrupoCliente {
  id: string
  nome: string
  descricao?: string
  cor?: string
  criadoEm: string
}

export interface MembroGrupo {
  grupoId: string
  clienteId: string
  adicionadoEm: string
}

export interface CreditoCliente {
  id: string
  clienteId: string
  valor: number
  origem: "bonus" | "reembolso" | "troca" | "manual" | "fidelidade"
  usados: number
  saldo: number
  expiraEm?: string
  criadoEm: string
  utilizacoes?: Array<{ valor: number; pedidoId: string; data: string }>
}

export interface SuporteCliente {
  id: string
  clienteId: string
  assunto: string
  mensagem: string
  status: "aberto" | "em_atendimento" | "resolvido" | "fechado"
  prioridade: "baixa" | "media" | "alta" | "urgente"
  criadoEm: string
  atualizadoEm: string
  respostas?: Array<{ mensagem: string; autor: string; data: string }>
}

const EXTRAS_KEY = "loja-clientes-extras"
const ENDERECOS_KEY = "loja-clientes-enderecos"
const GRUPOS_KEY = "loja-clientes-grupos"
const MEMBROS_KEY = "loja-clientes-membros"
const CREDITOS_KEY = "loja-clientes-creditos"
const SUPORTE_KEY = "loja-clientes-suporte"
const BLOQUEIO_KEY = "loja-clientes-bloqueio"
const VIP_KEY = "loja-clientes-vip"

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
  window.dispatchEvent(new Event("clientes-loja-updated"))
}

// ==================== LISTA VIP ====================

export function listarClientesVIP(): string[] {
  return getStorage<string[]>(VIP_KEY, [])
}

export function adicionarClienteVIP(clienteId: string): void {
  const vips = listarClientesVIP()
  if (!vips.includes(clienteId)) {
    vips.push(clienteId)
    setStorage(VIP_KEY, vips)
  }
}

export function removerClienteVIP(clienteId: string): void {
  setStorage(VIP_KEY, listarClientesVIP().filter((id) => id !== clienteId))
}

export function isClienteVIP(clienteId: string): boolean {
  return listarClientesVIP().includes(clienteId)
}

// ==================== LISTA DE BLOQUEIO ====================

export function listarBloqueados(): string[] {
  return getStorage<string[]>(BLOQUEIO_KEY, [])
}

export function bloquearCliente(clienteId: string): void {
  const bloqueados = listarBloqueados()
  if (!bloqueados.includes(clienteId)) {
    bloqueados.push(clienteId)
    setStorage(BLOQUEIO_KEY, bloqueados)
  }
}

export function desbloquearCliente(clienteId: string): void {
  setStorage(BLOQUEIO_KEY, listarBloqueados().filter((id) => id !== clienteId))
}

export function isClienteBloqueado(clienteId: string): boolean {
  return listarBloqueados().includes(clienteId)
}

// ==================== ENDEREÇOS ====================

export function listarEnderecosCliente(clienteId: string): EnderecoCliente[] {
  const enderecos = getStorage<EnderecoCliente[]>(ENDERECOS_KEY, [])
  return enderecos.filter((e) => e.clienteId === clienteId)
}

export function adicionarEndereco(endereco: Omit<EnderecoCliente, "id">): EnderecoCliente {
  const enderecos = getStorage<EnderecoCliente[]>(ENDERECOS_KEY, [])
  const novo: EnderecoCliente = {
    ...endereco,
    id: `END-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  }
  if (endereco.padrao) {
    enderecos.forEach((e) => {
      if (e.clienteId === endereco.clienteId) e.padrao = false
    })
  }
  enderecos.push(novo)
  setStorage(ENDERECOS_KEY, enderecos)
  return novo
}

export function atualizarEndereco(id: string, updates: Partial<EnderecoCliente>): void {
  const enderecos = getStorage<EnderecoCliente[]>(ENDERECOS_KEY, [])
  const idx = enderecos.findIndex((e) => e.id === id)
  if (idx >= 0) {
    enderecos[idx] = { ...enderecos[idx], ...updates }
    if (updates.padrao) {
      enderecos.forEach((e, i) => {
        if (e.clienteId === enderecos[idx].clienteId && i !== idx) e.padrao = false
      })
    }
    setStorage(ENDERECOS_KEY, enderecos)
  }
}

export function excluirEndereco(id: string): void {
  setStorage(ENDERECOS_KEY, getStorage<EnderecoCliente[]>(ENDERECOS_KEY, []).filter((e) => e.id !== id))
}

// ==================== GRUPOS ====================

export function listarGrupos(): GrupoCliente[] {
  return getStorage<GrupoCliente[]>(GRUPOS_KEY, [])
}

export function criarGrupo(grupo: Omit<GrupoCliente, "id" | "criadoEm">): GrupoCliente {
  const grupos = listarGrupos()
  const novo: GrupoCliente = {
    ...grupo,
    id: `GRP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    criadoEm: new Date().toISOString(),
  }
  grupos.push(novo)
  setStorage(GRUPOS_KEY, grupos)
  return novo
}

export function listarMembrosGrupo(grupoId: string): string[] {
  const membros = getStorage<MembroGrupo[]>(MEMBROS_KEY, [])
  return membros.filter((m) => m.grupoId === grupoId).map((m) => m.clienteId)
}

export function adicionarClienteGrupo(clienteId: string, grupoId: string): void {
  const membros = getStorage<MembroGrupo[]>(MEMBROS_KEY, [])
  if (!membros.find((m) => m.clienteId === clienteId && m.grupoId === grupoId)) {
    membros.push({ grupoId, clienteId, adicionadoEm: new Date().toISOString() })
    setStorage(MEMBROS_KEY, membros)
  }
}

export function removerClienteGrupo(clienteId: string, grupoId: string): void {
  setStorage(
    MEMBROS_KEY,
    getStorage<MembroGrupo[]>(MEMBROS_KEY, []).filter((m) => !(m.clienteId === clienteId && m.grupoId === grupoId))
  )
}

export function gruposDoCliente(clienteId: string): GrupoCliente[] {
  const membros = getStorage<MembroGrupo[]>(MEMBROS_KEY, [])
  const grupoIds = membros.filter((m) => m.clienteId === clienteId).map((m) => m.grupoId)
  return listarGrupos().filter((g) => grupoIds.includes(g.id))
}

// ==================== PONTUAÇÃO / CRÉDITOS ====================

export function listarCreditosCliente(clienteId: string): CreditoCliente[] {
  const creditos = getStorage<CreditoCliente[]>(CREDITOS_KEY, [])
  return creditos.filter((c) => c.clienteId === clienteId)
}

export function saldoCreditoCliente(clienteId: string): number {
  const creditos = listarCreditosCliente(clienteId)
  return creditos.reduce((s, c) => s + c.saldo, 0)
}

export function adicionarCredito(
  clienteId: string,
  valor: number,
  origem: CreditoCliente["origem"],
  expiraEm?: string
): CreditoCliente {
  const creditos = getStorage<CreditoCliente[]>(CREDITOS_KEY, [])
  const novo: CreditoCliente = {
    id: `CRD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    clienteId,
    valor,
    origem,
    usados: 0,
    saldo: valor,
    expiraEm,
    criadoEm: new Date().toISOString(),
  }
  creditos.push(novo)
  setStorage(CREDITOS_KEY, creditos)
  return novo
}

export function usarCredito(clienteId: string, valor: number, pedidoId: string): boolean {
  const creditos = getStorage<CreditoCliente[]>(CREDITOS_KEY, [])
  const doCliente = creditos.filter((c) => c.clienteId === clienteId && c.saldo > 0).sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime())
  let restante = valor
  for (const c of doCliente) {
    if (restante <= 0) break
    const usar = Math.min(c.saldo, restante)
    c.saldo -= usar
    c.usados += usar
    if (!c.utilizacoes) c.utilizacoes = []
    c.utilizacoes.push({ valor: usar, pedidoId, data: new Date().toISOString() })
    restante -= usar
  }
  setStorage(CREDITOS_KEY, creditos)
  return restante <= 0
}

// ==================== SUPORTE ====================

export function listarSuporteCliente(clienteId: string): SuporteCliente[] {
  const suporte = getStorage<SuporteCliente[]>(SUPORTE_KEY, [])
  return suporte.filter((s) => s.clienteId === clienteId).sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}

export function criarSolicitacaoSuporte(solicitacao: Omit<SuporteCliente, "id" | "criadoEm" | "atualizadoEm">): SuporteCliente {
  const suporte = getStorage<SuporteCliente[]>(SUPORTE_KEY, [])
  const now = new Date().toISOString()
  const novo: SuporteCliente = {
    ...solicitacao,
    id: `SUP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    criadoEm: now,
    atualizadoEm: now,
  }
  suporte.push(novo)
  setStorage(SUPORTE_KEY, suporte)
  return novo
}

export function atualizarSuporte(id: string, updates: Partial<SuporteCliente>): void {
  const suporte = getStorage<SuporteCliente[]>(SUPORTE_KEY, [])
  const idx = suporte.findIndex((s) => s.id === id)
  if (idx >= 0) {
    suporte[idx] = { ...suporte[idx], ...updates, atualizadoEm: new Date().toISOString() }
    setStorage(SUPORTE_KEY, suporte)
  }
}

// ==================== SEGMENTAÇÃO ====================

export type SegmentoCliente = "todos" | "ativos" | "inativos" | "vip" | "bloqueados" | "grupo"

export function listarClientesLoja(filtros?: {
  segmento?: SegmentoCliente
  grupoId?: string
  busca?: string
}): Cliente[] {
  let clientes = listarClientes()
  const vips = listarClientesVIP()
  const bloqueados = listarBloqueados()

  if (filtros) {
    if (filtros.segmento === "vip") {
      clientes = clientes.filter((c) => vips.includes(c.id))
    }
    if (filtros.segmento === "bloqueados") {
      clientes = clientes.filter((c) => bloqueados.includes(c.id))
    }
    if (filtros.segmento === "inativos") {
      clientes = clientes.filter((c) => c.status === "inativo")
    }
    if (filtros.segmento === "ativos") {
      clientes = clientes.filter((c) => c.status === "ativo")
    }
    if (filtros.grupoId) {
      const membros = getStorage<MembroGrupo[]>(MEMBROS_KEY, [])
      const idsGrupo = membros.filter((m) => m.grupoId === filtros.grupoId).map((m) => m.clienteId)
      clientes = clientes.filter((c) => idsGrupo.includes(c.id))
    }
    if (filtros.busca) {
      const s = filtros.busca.toLowerCase()
      clientes = clientes.filter(
        (c) =>
          c.nome.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.cpf.replace(/\D/g, "").includes(filtros.busca!.replace(/\D/g, ""))
      )
    }
  }

  return clientes
}
