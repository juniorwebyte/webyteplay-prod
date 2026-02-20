"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Trophy, Clock, CheckCircle, XCircle, Ticket } from "lucide-react"
import { buscarPedidosPorCpf, buscarPedidosPorTelefone, type Pedido } from "@/lib/gateway-store"
import { buscarCampanha } from "@/lib/campanhas-store"
import { buscarPorCpf, type CotaGanhaRoletaBox } from "@/lib/cotas-premiadas-roleta-box-store"
import { formatarValor } from "@/lib/formatadores"

export default function MinhasCotas() {
  const [isLoading, setIsLoading] = useState(false)
  const [isConsultaLoading, setIsConsultaLoading] = useState(false)
  const [error, setError] = useState("")
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filtroStatus, setFiltroStatus] = useState<string>("todas")
  const [formData, setFormData] = useState({ cpf: "", celular: "" })
  const [hasSearched, setHasSearched] = useState(false)
  const [clienteNome, setClienteNome] = useState("")

  // Sincronização: atualizar quando houver mudanças em pedidos ou cotas ganhas
  useEffect(() => {
    if (!hasSearched) return
    const handlePedidosUpdate = () => {
      const cpfClean = formData.cpf.replace(/\D/g, "")
      const celularClean = formData.celular.replace(/\D/g, "")
      let results: Pedido[] = []
      if (cpfClean.length === 11) {
        results = buscarPedidosPorCpf(cpfClean)
      } else if (celularClean.length >= 10) {
        results = buscarPedidosPorTelefone(celularClean)
      }
      results.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      setPedidos(results)
    }
    const handleCotasGanhasUpdate = () => {
      handlePedidosUpdate()
    }
    window.addEventListener("pedidos-updated", handlePedidosUpdate)
    window.addEventListener("cotas-ganhas-roleta-box-updated", handleCotasGanhasUpdate)
    return () => {
      window.removeEventListener("pedidos-updated", handlePedidosUpdate)
      window.removeEventListener("cotas-ganhas-roleta-box-updated", handleCotasGanhasUpdate)
    }
  }, [hasSearched, formData.cpf, formData.celular])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "cpf") {
      let v = value.replace(/\D/g, "").substring(0, 11)
      if (v.length > 9) v = `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6, 9)}-${v.substring(9)}`
      else if (v.length > 6) v = `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6)}`
      else if (v.length > 3) v = `${v.substring(0, 3)}.${v.substring(3)}`
      setFormData({ ...formData, cpf: v })
      return
    }

    if (name === "celular") {
      let v = value.replace(/\D/g, "").substring(0, 11)
      if (v.length > 6) v = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`
      else if (v.length > 2) v = `(${v.substring(0, 2)}) ${v.substring(2)}`
      else if (v.length > 0) v = `(${v}`
      setFormData({ ...formData, celular: v })
      return
    }

    setFormData({ ...formData, [name]: value })
  }

  const handleConsulta = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const cpfClean = formData.cpf.replace(/\D/g, "")
    const celularClean = formData.celular.replace(/\D/g, "")

    if (cpfClean.length === 0 && celularClean.length === 0) {
      setError("Informe o CPF ou o numero de celular para consultar.")
      return
    }

    if (cpfClean.length > 0 && cpfClean.length !== 11) {
      setError("CPF invalido. Digite os 11 digitos.")
      return
    }

    if (celularClean.length > 0 && celularClean.length < 10) {
      setError("Numero de celular invalido.")
      return
    }

    setIsConsultaLoading(true)

    // Small delay for UX feedback
    setTimeout(() => {
      let results: Pedido[] = []

      if (cpfClean.length === 11) {
        results = buscarPedidosPorCpf(cpfClean)
      } else if (celularClean.length >= 10) {
        results = buscarPedidosPorTelefone(celularClean)
      }

      // Sort most recent first
      results.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())

      setPedidos(results)
      setHasSearched(true)
      setIsConsultaLoading(false)

      if (results.length > 0) {
        setClienteNome(results[0].nomeComprador)
      } else if (cpfClean.length === 11) {
        // Tentar buscar cotas ganhas na roleta/box mesmo sem pedidos
        const cotasGanhas = buscarPorCpf(cpfClean)
        if (cotasGanhas.length > 0) {
          setClienteNome("Cliente")
        }
      }
    }, 500)
  }

  // Buscar cotas ganhas na roleta/box
  const cpfLimpo = formData.cpf.replace(/\D/g, "")
  const cotasGanhasRoletaBox = cpfLimpo.length === 11 ? buscarPorCpf(cpfLimpo) : []
  
  // Group pedidos by campanha for display
  const pedidosPorCampanha = pedidos.reduce<Record<string, { campanha: any; pedidos: Pedido[]; cotasGanhas?: CotaGanhaRoletaBox[] }>>((acc, p) => {
    if (!acc[p.campanhaId]) {
      const camp = buscarCampanha(p.campanhaId)
      acc[p.campanhaId] = {
        campanha: camp || { titulo: p.campanhaTitulo, imagemPrincipal: null, statusCampanha: "Ativo", valorPorCota: p.valorUnitario.toString() },
        pedidos: [],
        cotasGanhas: cotasGanhasRoletaBox.filter((c) => c.campanhaId === p.campanhaId),
      }
    }
    acc[p.campanhaId].pedidos.push(p)
    return acc
  }, {})

  // Adicionar campanhas que só têm cotas ganhas (sem pedidos)
  cotasGanhasRoletaBox.forEach((cota) => {
    if (!pedidosPorCampanha[cota.campanhaId]) {
      const camp = buscarCampanha(cota.campanhaId)
      if (camp) {
        pedidosPorCampanha[cota.campanhaId] = {
          campanha: camp,
          pedidos: [],
          cotasGanhas: cotasGanhasRoletaBox.filter((cg) => cg.campanhaId === cota.campanhaId),
        }
      }
    }
  })

  const campanhaEntries = Object.entries(pedidosPorCampanha)

  return (
    <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-xl">
      {!hasSearched ? (
        <>
          <h2 className="text-xl font-semibold mb-4 text-white">Consultar Minhas Cotas</h2>
          <p className="text-gray-400 text-sm mb-6">
            Informe seu CPF ou celular para consultar todas as cotas compradas.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/50 border-red-800 text-white">
              {error}
            </Alert>
          )}

          <form onSubmit={handleConsulta} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-gray-300">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleChange}
                className="bg-gray-900/50 border-gray-700 text-white"
                maxLength={14}
              />
            </div>

            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="mx-4 text-gray-500 text-sm">ou</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="celular" className="text-gray-300">Celular (WhatsApp)</Label>
              <Input
                id="celular"
                name="celular"
                placeholder="(00) 00000-0000"
                value={formData.celular}
                onChange={handleChange}
                className="bg-gray-900/50 border-gray-700 text-white"
                maxLength={15}
              />
            </div>

            <Button
              type="submit"
              disabled={isConsultaLoading}
              className="w-full mt-4 bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium"
            >
              {isConsultaLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Consultar Cotas
                </>
              )}
            </Button>
          </form>
        </>
      ) : (
        <>
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {clienteNome ? `Cotas de ${clienteNome}` : "Minhas Cotas"}
              </h2>
              <p className="text-gray-400 text-sm">
                {pedidos.length === 0 && cotasGanhasRoletaBox.length === 0
                  ? "Nenhuma cota encontrada para os dados informados."
                  : `${pedidos.reduce((sum, p) => sum + p.quantidade, 0) + cotasGanhasRoletaBox.length} cotas em ${campanhaEntries.length} campanha${campanhaEntries.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:text-white"
              onClick={() => {
                setHasSearched(false)
                setPedidos([])
                setClienteNome("")
              }}
            >
              Nova Consulta
            </Button>
          </div>

          {/* Summary cards */}
          {pedidos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#FFB800]/10 rounded-lg p-3 text-center border border-[#FFB800]/20">
                <p className="text-gray-400 text-xs mb-1">Total Cotas</p>
                <p className="text-[#FFB800] font-bold text-xl">{pedidos.reduce((sum, p) => sum + p.quantidade, 0) + cotasGanhasRoletaBox.length}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/20">
                <p className="text-gray-400 text-xs mb-1">Total Investido</p>
                <p className="text-green-400 font-bold text-lg">{formatarValor(pedidos.reduce((sum, p) => sum + p.valorTotal, 0))}</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/20">
                <p className="text-gray-400 text-xs mb-1">Campanhas</p>
                <p className="text-blue-400 font-bold text-xl">{campanhaEntries.length}</p>
              </div>
            </div>
          )}

          {pedidos.length === 0 && cotasGanhasRoletaBox.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">Nenhuma cota encontrada</p>
              <p className="text-gray-500 text-sm">
                Verifique se os dados estao corretos ou se ja realizou alguma compra.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {campanhaEntries.map(([campanhaId, { campanha, pedidos: campPedidos, cotasGanhas }]) => {
                const totalCotas = campPedidos.reduce((sum, p) => sum + p.quantidade, 0) + (cotasGanhas?.length || 0)
                const totalValor = campPedidos.reduce((sum, p) => sum + p.valorTotal, 0)
                const todosNumeros = [
                  ...campPedidos.flatMap((p) => p.numerosEscolhidos || []),
                  ...(cotasGanhas?.map((c) => c.cota) || []),
                ].sort((a, b) => a - b)

                return (
                  <div key={campanhaId} className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800">
                    <div className="flex flex-col sm:flex-row">
                      {/* Campaign image */}
                      <div className="sm:w-1/4 h-40 sm:h-auto">
                        {campanha.imagemPrincipal ? (
                          <img
                            src={campanha.imagemPrincipal}
                            alt={campanha.titulo || "Campanha"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#FFB800]/20 to-black flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-[#FFB800]/50" />
                          </div>
                        )}
                      </div>

                      {/* Campaign details */}
                      <div className="p-4 sm:w-3/4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-white">{campanha.titulo || "Campanha"}</h3>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" /> Pago
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-black/30 rounded p-2 text-center">
                            <p className="text-gray-500 text-xs">Cotas</p>
                            <p className="text-white font-bold">{totalCotas}</p>
                          </div>
                          <div className="bg-black/30 rounded p-2 text-center">
                            <p className="text-gray-500 text-xs">Valor Total</p>
                            <p className="text-[#FFB800] font-bold text-sm">{formatarValor(totalValor)}</p>
                          </div>
                          <div className="bg-black/30 rounded p-2 text-center">
                            <p className="text-gray-500 text-xs">Pedidos</p>
                            <p className="text-white font-bold">{campPedidos.length}</p>
                          </div>
                        </div>

                        {/* Numbers */}
                        {todosNumeros.length > 0 && (
                          <div>
                            <p className="text-gray-400 text-xs mb-2">Seus numeros:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {todosNumeros.slice(0, 30).map((n) => {
                                const isCotaGanha = cotasGanhas?.some((c) => c.cota === n)
                                return (
                                  <span
                                    key={n}
                                    className={`px-2 py-0.5 rounded text-xs font-mono border ${
                                      isCotaGanha
                                        ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                                        : "bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/20"
                                    }`}
                                    title={isCotaGanha ? `Ganho na ${cotasGanhas?.find((c) => c.cota === n)?.origem === "roleta" ? "roleta" : "box"}` : ""}
                                  >
                                    {n.toString().padStart(5, "0")}
                                    {isCotaGanha && " 🎁"}
                                  </span>
                                )
                              })}
                              {todosNumeros.length > 30 && (
                                <span className="text-gray-500 text-xs flex items-center px-2">
                                  +{todosNumeros.length - 30} mais
                                </span>
                              )}
                            </div>
                            {cotasGanhas && cotasGanhas.length > 0 && (
                              <p className="text-purple-400 text-xs mt-2">
                                🎁 {cotasGanhas.length} cota{cotasGanhas.length > 1 ? "s" : ""} ganha{cotasGanhas.length > 1 ? "s" : ""} na roleta/box
                              </p>
                            )}
                          </div>
                        )}

                        {/* Pedido details */}
                        <div className="mt-3 space-y-1">
                          {campPedidos.map((p) => (
                            <div key={p.id} className="flex items-center justify-between text-xs text-gray-500">
                              <span className="font-mono">{p.id}</span>
                              <span>{p.quantidade} cotas - {new Date(p.pagoEm || p.criadoEm).toLocaleDateString("pt-BR")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
