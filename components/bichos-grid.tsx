"use client"

import { BICHOS, type Bicho } from "@/lib/jogo-do-bicho"

interface BichosGridProps {
  /** "fazendinha" = bicho inteiro (4 números); "fazendinhaMetade" = meio bicho (2 números) */
  tipo: "fazendinha" | "fazendinhaMetade"
  className?: string
}

/** Retorna as dezenas a exibir: 4 para bicho inteiro, 2 para metade (primeira metade do grupo). */
function dezenasExibir(bicho: Bicho, tipo: "fazendinha" | "fazendinhaMetade"): string[] {
  if (tipo === "fazendinha") return [...bicho.dezenas]
  return [bicho.dezenas[0], bicho.dezenas[1]]
}

export default function BichosGrid({ tipo, className = "" }: BichosGridProps) {
  const isMetade = tipo === "fazendinhaMetade"

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-white mb-2">
        {isMetade ? "Meia Fazendinha — 2 números por bicho" : "Fazendinha — 4 números por bicho"}
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        {isMetade
          ? "Cada grupo mostra apenas 2 dezenas (metade do bicho)."
          : "Cada grupo tem 4 dezenas. O sorteio usa os 2 últimos dígitos do número para definir o bicho."}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {BICHOS.map((bicho) => {
          const nums = dezenasExibir(bicho, tipo)
          return (
            <div
              key={bicho.id}
              className="rounded-lg overflow-hidden bg-emerald-800/80 border border-emerald-600/50 p-3 text-center"
            >
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-xl font-bold">
                  {bicho.nome.slice(0, 1)}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-1 mb-1">
                {nums.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-black text-xs font-bold"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <p className="text-amber-400 font-semibold text-sm uppercase tracking-wide">
                {bicho.nome}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
