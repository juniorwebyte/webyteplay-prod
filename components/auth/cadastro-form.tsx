"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { registrarClienteCadastro } from "@/lib/gateway-store"
import { formatarCPF, formatarTelefone } from "@/lib/formatadores"

export default function CadastroForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    email: "",
    celular: "",
    dataNascimento: "",
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

    // Validar nome
    if (formData.nome.trim().length < 3) {
      setError("Nome inválido. Digite seu nome completo.")
      return false
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("E-mail inválido.")
      return false
    }

    // Validar celular
    const celularClean = formData.celular.replace(/\D/g, "")
    if (celularClean.length < 10 || celularClean.length > 11) {
      setError("Número de celular inválido.")
      return false
    }

    // Validar data de nascimento
    if (!formData.dataNascimento) {
      setError("Data de nascimento é obrigatória.")
      return false
    }

    // Verificar se a pessoa tem pelo menos 18 anos
    const hoje = new Date()
    const nascimento = new Date(formData.dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const m = hoje.getMonth() - nascimento.getMonth()
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }

    if (idade < 18) {
      setError("Você deve ter pelo menos 18 anos para se cadastrar.")
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
      // Simulação de cadastro (em um sistema real, isso seria uma chamada à API)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Armazenar dados do usuário no localStorage (em um sistema real, seria um token JWT)
      localStorage.setItem(
        "user",
        JSON.stringify({
          cpf: formData.cpf,
          nome: formData.nome,
          email: formData.email,
          celular: formData.celular,
          telefone: formData.celular,
          dataNascimento: formData.dataNascimento,
          isLoggedIn: true,
        }),
      )
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("user-login"))
      }

      // Registrar/atualizar cliente no painel admin para sincronizar com a aba de Clientes
      registrarClienteCadastro({
        nome: formData.nome,
        cpf: formData.cpf,
        email: formData.email,
        telefone: formData.celular,
      })

      setSuccess(true)

      // Redirecionar para a página de cotas após 2 segundos
      setTimeout(() => {
        router.push("/minhas-cotas")
      }, 2000)
    } catch (err) {
      setError("Erro ao criar conta. Verifique seus dados e tente novamente.")
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
          Conta criada com sucesso! Redirecionando para suas cotas...
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            name="nome"
            placeholder="Digite seu nome completo"
            value={formData.nome}
            onChange={handleChange}
            required
            className="bg-gray-900/50 border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
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

        <div className="space-y-2">
          <Label htmlFor="dataNascimento">Data de Nascimento</Label>
          <Input
            id="dataNascimento"
            name="dataNascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={handleChange}
            required
            className="bg-gray-900/50 border-gray-700"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || success}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar Conta"
          )}
        </Button>

        <div className="text-center mt-4 text-sm">
          <span className="text-gray-400">Já tem uma conta?</span>{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
            Faça login
          </Link>
        </div>
      </form>
    </div>
  )
}
