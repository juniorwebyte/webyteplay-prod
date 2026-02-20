/**
 * Verifica se o usuário está autenticado como administrador
 * @returns {boolean} true se estiver autenticado, false caso contrário
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    const adminData = localStorage.getItem("admin")

    if (!adminData) {
      return false
    }

    const admin = JSON.parse(adminData)

    if (!admin || !admin.isAdmin) {
      return false
    }

    // Verificar se o login expirou (24 horas)
    const loginTime = admin.loginTime || 0
    const currentTime = new Date().getTime()
    const hoursPassed = (currentTime - loginTime) / (1000 * 60 * 60)

    if (hoursPassed > 24) {
      localStorage.removeItem("admin")
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

/**
 * Realiza o logout do administrador
 */
export function adminLogout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin")
  }
}
