// Store para Usuários Admin e Permissões da Loja Virtual

export interface UsuarioAdmin {
  id: string
  nome: string
  email: string
  senhaHash?: string
  perfilId: string
  ativo: boolean
  ultimoAcesso?: string
  criadoEm: string
  criadoPor?: string
}

export interface PerfilPermissao {
  id: string
  nome: string
  descricao?: string
  permissoes: string[] // ex: ["loja.produtos.ver", "loja.pedidos.editar"]
  ativo: boolean
  criadoEm: string
}

export interface LogAtividade {
  id: string
  usuarioId: string
  usuarioNome: string
  acao: string
  modulo: string
  detalhes?: string
  ip?: string
  criadoEm: string
}

export interface RegistroAuditoria {
  id: string
  usuarioId: string
  usuarioNome: string
  entidade: string
  entidadeId: string
  operacao: "criar" | "editar" | "excluir"
  valoresAnteriores?: Record<string, unknown>
  valoresNovos?: Record<string, unknown>
  criadoEm: string
}

export interface HistoricoAlteracao {
  id: string
  entidade: string
  entidadeId: string
  campo: string
  valorAnterior: string
  valorNovo: string
  usuarioId: string
  usuarioNome: string
  criadoEm: string
}

const USUARIOS_KEY = "loja-admin-usuarios"
const PERFIS_KEY = "loja-admin-perfis"
const LOGS_KEY = "loja-admin-logs"
const AUDITORIA_KEY = "loja-admin-auditoria"
const HISTORICO_KEY = "loja-admin-historico"

const PERMISSOES_DISPONIVEIS = [
  { id: "loja.ver", nome: "Ver Loja", categoria: "Geral" },
  { id: "loja.produtos.ver", nome: "Ver Produtos", categoria: "Produtos" },
  { id: "loja.produtos.criar", nome: "Criar Produtos", categoria: "Produtos" },
  { id: "loja.produtos.editar", nome: "Editar Produtos", categoria: "Produtos" },
  { id: "loja.produtos.excluir", nome: "Excluir Produtos", categoria: "Produtos" },
  { id: "loja.pedidos.ver", nome: "Ver Pedidos", categoria: "Pedidos" },
  { id: "loja.pedidos.editar", nome: "Editar Pedidos", categoria: "Pedidos" },
  { id: "loja.clientes.ver", nome: "Ver Clientes", categoria: "Clientes" },
  { id: "loja.clientes.editar", nome: "Editar Clientes", categoria: "Clientes" },
  { id: "loja.financeiro.ver", nome: "Ver Financeiro", categoria: "Financeiro" },
  { id: "loja.financeiro.editar", nome: "Editar Financeiro", categoria: "Financeiro" },
  { id: "loja.config.ver", nome: "Ver Configurações", categoria: "Config" },
  { id: "loja.config.editar", nome: "Editar Configurações", categoria: "Config" },
  { id: "loja.usuarios.ver", nome: "Ver Usuários", categoria: "Usuários" },
  { id: "loja.usuarios.editar", nome: "Editar Usuários", categoria: "Usuários" },
]

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
  window.dispatchEvent(new Event("usuarios-permissoes-loja-updated"))
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
}

// ==================== USUÁRIOS ====================
export function listarUsuariosAdmin(): UsuarioAdmin[] {
  return getStorage<UsuarioAdmin[]>(USUARIOS_KEY, [])
}

export function buscarUsuarioAdmin(id: string): UsuarioAdmin | undefined {
  return listarUsuariosAdmin().find((u) => u.id === id)
}

export function salvarUsuarioAdmin(u: Omit<UsuarioAdmin, "id" | "criadoEm"> | UsuarioAdmin): UsuarioAdmin {
  const list = listarUsuariosAdmin()
  if ("id" in u && u.id) {
    const idx = list.findIndex((x) => x.id === u.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...u }
      setStorage(USUARIOS_KEY, list)
      return list[idx]
    }
  }
  const novo: UsuarioAdmin = {
    ...(u as Omit<UsuarioAdmin, "id" | "criadoEm">),
    id: uid("USR"),
    criadoEm: new Date().toISOString(),
  }
  list.push(novo)
  setStorage(USUARIOS_KEY, list)
  return novo
}

export function excluirUsuarioAdmin(id: string): boolean {
  setStorage(USUARIOS_KEY, listarUsuariosAdmin().filter((x) => x.id !== id))
  return true
}

// ==================== PERFIS ====================
export function listarPerfisPermissao(): PerfilPermissao[] {
  return getStorage<PerfilPermissao[]>(PERFIS_KEY, [])
}

export function salvarPerfilPermissao(p: Omit<PerfilPermissao, "id" | "criadoEm"> | PerfilPermissao): PerfilPermissao {
  const list = listarPerfisPermissao()
  if ("id" in p && p.id) {
    const idx = list.findIndex((x) => x.id === p.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...p }
      setStorage(PERFIS_KEY, list)
      return list[idx]
    }
  }
  const novo: PerfilPermissao = {
    ...(p as Omit<PerfilPermissao, "id" | "criadoEm">),
    id: uid("PRF"),
    criadoEm: new Date().toISOString(),
  }
  list.push(novo)
  setStorage(PERFIS_KEY, list)
  return novo
}

export function getPermissoesDisponiveis() {
  return PERMISSOES_DISPONIVEIS
}

// ==================== LOGS DE ATIVIDADE ====================
export function listarLogsAtividade(filtros?: { usuarioId?: string; modulo?: string }): LogAtividade[] {
  let logs = getStorage<LogAtividade[]>(LOGS_KEY, [])
  if (filtros?.usuarioId) logs = logs.filter((l) => l.usuarioId === filtros.usuarioId)
  if (filtros?.modulo) logs = logs.filter((l) => l.modulo === filtros.modulo)
  return logs.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}

export function registrarLogAtividade(log: Omit<LogAtividade, "id" | "criadoEm">): LogAtividade {
  const list = listarLogsAtividade()
  const novo: LogAtividade = { ...log, id: uid("LOG"), criadoEm: new Date().toISOString() }
  list.unshift(novo)
  setStorage(LOGS_KEY, list.slice(0, 500))
  return novo
}

// ==================== AUDITORIA ====================
export function listarAuditoria(filtros?: { entidade?: string; usuarioId?: string }): RegistroAuditoria[] {
  let list = getStorage<RegistroAuditoria[]>(AUDITORIA_KEY, [])
  if (filtros?.entidade) list = list.filter((a) => a.entidade === filtros.entidade)
  if (filtros?.usuarioId) list = list.filter((a) => a.usuarioId === filtros.usuarioId)
  return list.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}

export function registrarAuditoria(a: Omit<RegistroAuditoria, "id" | "criadoEm">): RegistroAuditoria {
  const list = listarAuditoria()
  const novo: RegistroAuditoria = { ...a, id: uid("AUD"), criadoEm: new Date().toISOString() }
  list.unshift(novo)
  setStorage(AUDITORIA_KEY, list.slice(0, 300))
  return novo
}

// ==================== HISTÓRICO DE ALTERAÇÕES ====================
export function listarHistoricoAlteracoes(filtros?: { entidade?: string; entidadeId?: string }): HistoricoAlteracao[] {
  let list = getStorage<HistoricoAlteracao[]>(HISTORICO_KEY, [])
  if (filtros?.entidade) list = list.filter((h) => h.entidade === filtros.entidade)
  if (filtros?.entidadeId) list = list.filter((h) => h.entidadeId === filtros.entidadeId)
  return list.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
}

export function registrarHistoricoAlteracao(h: Omit<HistoricoAlteracao, "id" | "criadoEm">): HistoricoAlteracao {
  const list = listarHistoricoAlteracoes()
  const novo: HistoricoAlteracao = { ...h, id: uid("HIS"), criadoEm: new Date().toISOString() }
  list.unshift(novo)
  setStorage(HISTORICO_KEY, list.slice(0, 500))
  return novo
}
