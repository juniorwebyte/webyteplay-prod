"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Loader2, Lock } from "lucide-react"

export default function AdminLoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    usuario: "",
    senha: "",
  })

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
      // Verificar credenciais fixas
      if (formData.usuario === "webytebr" && formData.senha === "99110990Webytebr@") {
        // Simulação de login (em um sistema real, isso seria uma chamada à API)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Armazenar dados do admin no localStorage (em um sistema real, seria um token JWT)
        localStorage.setItem(
          "admin",
          JSON.stringify({
            usuario: formData.usuario,
            isAdmin: true,
          }),
        )

        // Redirecionar para o painel administrativo
        router.push("/admin")
      } else {
        setError("Credenciais inválidas. Verifique seu usuário e senha.")
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8 bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-xl">
      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-900/50 border-red-800 text-white">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="usuario">Usuário</Label>
          <Input
            id="usuario"
            name="usuario"
            placeholder="Digite seu usuário"
            value={formData.usuario}
            onChange={handleChange}
            required
            className="bg-gray-900/50 border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            placeholder="Digite sua senha"
            value={formData.senha}
            onChange={handleChange}
            required
            className="bg-gray-900/50 border-gray-700"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Entrar
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
