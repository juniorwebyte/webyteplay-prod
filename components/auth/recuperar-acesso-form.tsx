"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { formatarCPF, formatarTelefone } from "@/lib/formatadores"

export default function RecuperarAcessoForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    cpf: "",
    celular: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "cpf") {
      setFormData({ ...formData, cpf: formatarCPF(value) })
      return
    }
    if (name === "celular") {
      setFormData({ ...formData, celular: formatarTelefone(value) })
      return
    }
    setFormData({ ...formData, [name]: value })
  }

  const validateForm = () => {
    // Validar CPF (apenas formato básico)
    const cpfClean = formData.cpf.replace(/\D/g, "")
    if (cpfClean.length !== 11) {
      setError("CPF inválido. Digite os 11 dígitos.")
      return false
    }

    // Validar celular (apenas formato básico)
    const celularClean = formData.celular.replace(/\D/g, "")
    if (celularClean.length < 10 || celularClean.length > 11) {
      setError("Número de celular inválido.")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulação de recuperação de acesso (em um sistema real, isso seria uma chamada à API)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess(true)
    } catch (err) {
      setError("Erro ao recuperar acesso. Verifique seus dados e tente novamente.")
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

      {success && (
        <Alert className="mb-6 bg-green-900/50 border-green-800 text-white">
          Instruções de recuperação enviadas para seu celular via WhatsApp!
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            name="cpf"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={handleChange}
            required
            className="bg-gray-900/50 border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="celular">Celular (WhatsApp)</Label>
          <Input
            id="celular"
            name="celular"
            placeholder="(00) 00000-0000"
            value={formData.celular}
            onChange={handleChange}
            required
            className="bg-gray-900/50 border-gray-700"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || success}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Recuperar Acesso"
          )}
        </Button>

        <div className="text-center mt-4 text-sm">
          <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
            Voltar para o login
          </Link>
        </div>
      </form>
    </div>
  )
}
