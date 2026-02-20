"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import ParticlesContainer from "@/components/particles-container"

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    usuario: "",
    senha: "",
  })

  useEffect(() => {
    // Verificar se o usuário já está autenticado
    const adminData = localStorage.getItem("admin")

    if (adminData) {
      try {
        const admin = JSON.parse(adminData)

        // Verificar se é realmente um admin
        if (admin && admin.isAdmin) {
          // Verificar se o login expirou (24 horas)
          const loginTime = admin.loginTime || 0
          const currentTime = new Date().getTime()
          const hoursPassed = (currentTime - loginTime) / (1000 * 60 * 60)

          if (hoursPassed <= 24) {
            // Se estiver autenticado e não expirado, redirecionar para o dashboard
            router.push("/admin/dashboard")
          } else {
            // Login expirado, limpar dados
            localStorage.removeItem("admin")
            setIsCheckingAuth(false)
          }
        } else {
          // Dados inválidos, limpar
          localStorage.removeItem("admin")
          setIsCheckingAuth(false)
        }
      } catch (error) {
        // Se houver erro ao processar os dados, limpar
        localStorage.removeItem("admin")
        setIsCheckingAuth(false)
      }
    } else {
      setIsCheckingAuth(false)
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validar campos
    if (!formData.usuario || !formData.senha) {
      setError("Todos os campos são obrigatórios.")
      return
    }

    setIsLoading(true)

    try {
      // Verificar credenciais fixas (em um sistema real, isso seria uma chamada à API)
      if (formData.usuario === "webytebr" && formData.senha === "99110990Webytebr@") {
        // Simulação de login
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Armazenar dados do admin no localStorage (em um sistema real, seria um token JWT)
        localStorage.setItem(
          "admin",
          JSON.stringify({
            usuario: formData.usuario,
            isAdmin: true,
            loginTime: new Date().getTime(),
          }),
        )

        // Redirecionar para o painel administrativo
        router.push("/admin/dashboard")
      } else {
        setError("Credenciais inválidas. Verifique seu usuário e senha.")
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <ParticlesContainer />

      <div className="z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <Image src="/images/webyte.png" alt="Webyte Logo" width={150} height={80} className="mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Área Administrativa
          </h1>
          <p className="mt-4 text-lg text-gray-300">Acesso restrito para administradores do sistema</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-8">
          {error && (
            <Alert className="mb-4 bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-white">
                Usuário
              </Label>
              <Input
                id="usuario"
                name="usuario"
                placeholder="Digite seu usuário"
                value={formData.usuario}
                onChange={handleChange}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-white">
                Senha
              </Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="Digite sua senha"
                value={formData.senha}
                onChange={handleChange}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="text-center mt-4">
              <a href="#" className="text-sm text-gray-300 hover:text-white">
                Recuperar senha?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
