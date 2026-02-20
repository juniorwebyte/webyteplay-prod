"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"
import { listarCampanhasAtivas, type Campanha } from "@/lib/campanhas-store"
import { formatarValor } from "@/lib/formatadores"

function formatarData(dataStr: string): string {
  if (!dataStr) return ""
  try {
    const d = new Date(dataStr)
    if (isNaN(d.getTime())) return ""
    return d.toLocaleDateString("pt-BR")
  } catch {
    return ""
  }
}

export default function RifasAtivas() {
  const [rifas, setRifas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const carregarRifas = () => {
    try {
      const campanhas = listarCampanhasAtivas()
      const mapped = campanhas.map((c) => ({
        id: c.id,
        titulo: c.titulo,
        descricao: c.descricao || c.subtitulo || "",
        preco: parseFloat(c.valorPorCota) || 0,
        totalCotas: parseInt(c.quantidadeNumeros) || 0,
        cotasVendidas: c.cotasVendidas || 0,
        imagem: c.imagemPrincipal,
        dataFim: c.dataInicio || "",
        exibirBarraProgresso: c.exibirBarraProgresso,
      }))
      setRifas(mapped)
    } catch (err) {
      console.error("Erro ao carregar rifas:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarRifas()
    const handleUpdate = () => carregarRifas()
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "campanhas") carregarRifas()
    }
    window.addEventListener("campanhas-updated", handleUpdate)
    window.addEventListener("storage", handleStorage)
    const timer = setTimeout(carregarRifas, 500)
    return () => {
      window.removeEventListener("campanhas-updated", handleUpdate)
      window.removeEventListener("storage", handleStorage)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : rifas.length > 0 ? (
        <div
          className={`grid gap-6 ${
            rifas.length === 1
              ? "grid-cols-1 justify-items-center"
              : rifas.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto justify-items-center"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {rifas.map((rifa) => {
            const progressPercent = rifa.totalCotas > 0 ? Math.round((rifa.cotasVendidas / rifa.totalCotas) * 100) : 0
            const dataFormatada = formatarData(rifa.dataFim)
            return (
              <Card
                key={rifa.id}
                className={`overflow-hidden bg-black/40 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 ${
                  rifas.length === 1 ? "w-full max-w-md" : rifas.length === 2 ? "w-full max-w-[360px]" : ""
                }`}
              >
                <div className="relative h-48 w-full">
                  {rifa.imagem ? (
                    <img
                      src={rifa.imagem}
                      alt={rifa.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-black flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Sem imagem</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
                      {formatarValor(rifa.preco)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold mb-2 text-white">{rifa.titulo}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{rifa.descricao}</p>

                  <div className="space-y-3">
                    {rifa.exibirBarraProgresso && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progresso</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    {dataFormatada && (
                      <div className="flex items-center text-sm text-gray-300">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{dataFormatada}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/rifas/${rifa.id}`} className="w-full">
                    <Button
                      variant="default"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Participar
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-black/20 rounded-lg border border-purple-500/20">
          <h3 className="text-2xl font-bold text-white mb-2">Nenhuma rifa ativa no momento</h3>
          <p className="text-gray-300 mb-6">Fique de olho! Novas rifas serao lancadas em breve.</p>
        </div>
      )}
    </div>
  )
}
