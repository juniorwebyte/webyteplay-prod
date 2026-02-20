"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Trophy, BarChart3, Users, Ticket, Plus, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { listarCampanhas, type Campanha } from "@/lib/campanhas-store"
import { listarClientes, listarPedidos } from "@/lib/gateway-store"

const AdminDashboard = () => {
  const router = useRouter()
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [totalClientes, setTotalClientes] = useState(0)
  const [faturamento, setFaturamento] = useState(0)

  const carregar = () => {
    setCampanhas(listarCampanhas())
    setTotalClientes(listarClientes().length)
    const pedidosPagos = listarPedidos().filter((p) => p.status === "pago")
    setFaturamento(pedidosPagos.reduce((sum, p) => sum + p.valorTotal, 0))
  }

  useEffect(() => {
    carregar()
    const handleUpdate = () => carregar()
    window.addEventListener("campanhas-updated", handleUpdate)
    // Listen for cross-tab localStorage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "campanhas") carregar()
    }
    window.addEventListener("storage", handleStorage)
    // Delayed re-check in case data was saved just before navigation
    const timer = setTimeout(carregar, 500)
    return () => {
      window.removeEventListener("campanhas-updated", handleUpdate)
      window.removeEventListener("storage", handleStorage)
      clearTimeout(timer)
    }
  }, [])

  const handleCreateRifa = () => {
    router.push("/admin/campanhas/new")
  }

  const totalCampanhas = campanhas.length
  const campanhasAtivas = campanhas.filter((c) => c.statusCampanha === "Ativo").length
  const totalCotas = campanhas.reduce((sum, c) => sum + (parseInt(c.quantidadeNumeros) || 0), 0)
  const cotasVendidas = campanhas.reduce((sum, c) => sum + (c.cotasVendidas || 0), 0)

  if (totalCampanhas === 0) {
    return (
      <Card className="bg-[#171923] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <Trophy className="h-12 w-12 text-[#FFB800] mx-auto mb-2" />
          <h3 className="text-xl font-bold mb-2 text-white">Nenhuma campanha criada</h3>
          <p className="text-gray-400 mb-4">Crie sua primeira campanha para comecar!</p>
          <Button
            onClick={handleCreateRifa}
            className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium"
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeira Campanha
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#171923] border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Campanhas</p>
                <p className="text-2xl font-bold text-white">{totalCampanhas}</p>
              </div>
              <div className="bg-[#FFB800]/20 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-[#FFB800]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#171923] border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-green-400">{campanhasAtivas}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Trophy className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#171923] border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total de Cotas</p>
                <p className="text-2xl font-bold text-white">{totalCotas.toLocaleString("pt-BR")}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Ticket className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#171923] border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Cotas Vendidas</p>
                <p className="text-2xl font-bold text-white">{cotasVendidas.toLocaleString("pt-BR")}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#171923] border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Campanhas Recentes</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800] hover:text-black"
            onClick={handleCreateRifa}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campanhas.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-[#0F1117] rounded-lg border border-gray-800 cursor-pointer hover:border-[#FFB800]/50 transition-colors"
                onClick={() => router.push("/admin/campanhas")}
              >
                <div className="flex items-center gap-3">
                  {c.imagemPrincipal ? (
                    <img src={c.imagemPrincipal} alt={c.titulo} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                      Img
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium text-sm">{c.titulo || "Sem titulo"}</p>
                    <p className="text-gray-500 text-xs">
                      R$ {parseFloat(c.valorPorCota || "0").toFixed(2).replace(".", ",")} por cota
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    c.statusCampanha === "Ativo"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {c.statusCampanha}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
