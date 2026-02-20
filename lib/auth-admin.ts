// Utilitário de autenticação para alterações administrativas
// Usado para proteger configurações críticas do sistema

export interface AdminCredentials {
  username: string
  password: string
}

const ADMIN_CREDENTIALS: AdminCredentials = {
  username: "webytebr",
  password: "99110990"
}

export function verificarCredenciaisAdmin(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
}