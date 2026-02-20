"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import { listarCampanhas } from "@/lib/campanhas-store"

export default function UltimosGanhadores() {
  const [ganhadores, setGanhadores] = useState<{ nome: string; rifa: string; premio: string; dataSorteio: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const carregarGanhadores = () => {
    try {
      const campanhas = listarCampanhas()
      const comGanhador = campanhas.filter(
        (c) => c.habilitarGanhador && c.nomeGanhador && c.nomeGanhador.trim() !== ""
      )
      const mapped = comGanhador
        .map((c) => ({
          nome: c.nomeGanhador || "Ganhador",
          rifa: c.titulo,
          premio: `Cota ${c.numeroSorteado || "—"}`,
          dataSorteio: c.atualizadoEm || c.criadoEm || new Date().toISOString(),
        }))
        .sort((a, b) => new Date(b.dataSorteio).getTime() - new Date(a.dataSorteio).getTime())
        .slice(0, 6)
      setGanhadores(mapped)
    } catch {
      setGanhadores([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarGanhadores()
    const h = () => carregarGanhadores()
    const onStorage = (e: StorageEvent) => {
      if (e.key === "campanhas") carregarGanhadores()
    }
    window.addEventListener("campanhas-updated", h)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("campanhas-updated", h)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : ganhadores.length > 0 ? (
        <div
          className={`grid gap-6 ${
            ganhadores.length === 1
              ? "grid-cols-1 max-w-md mx-auto justify-items-center"
              : ganhadores.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto justify-items-center"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {ganhadores.map((ganhador, index) => (
            <Card
              key={index}
              className={`overflow-hidden bg-black/40 border-purple-500/20 ${
                ganhadores.length <= 2 ? "w-full max-w-[400px]" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-600/30 flex items-center justify-center border-2 border-yellow-500/50">
                    <Trophy className="h-7 w-7 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white">{ganhador.nome}</h3>
                    <p className="text-sm text-gray-300">{ganhador.rifa}</p>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      Sorteado em {new Date(ganhador.dataSorteio).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    {ganhador.premio}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-black/20 rounded-lg border border-purple-500/20">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum ganhador ainda</h3>
          <p className="text-gray-300">Seja o primeiro ganhador! Participe das nossas rifas.</p>
        </div>
      )}
    </div>
  )
}
