"use client"

import { Suspense } from "react"
import Link from "next/link"
import RifasAtivas from "@/components/rifas-ativas"
import RifasDestaque from "@/components/rifas-destaque"
import ComoFunciona from "@/components/como-funciona"
import UltimosGanhadores from "@/components/ultimos-ganhadores"
import Loading from "@/components/loading"
import { useConfiguracoes } from "@/hooks/use-configuracoes"
import { useConfiguracoesLoja } from "@/hooks/use-configuracoes-loja"
import ProdutosHome from "@/components/produtos-home"

export default function HomeContent() {
  const { config } = useConfiguracoes()
  const { configLoja } = useConfiguracoesLoja()
  const nomeSite = config?.nomeSite || "WebytePlay"
  const subtitulo = config?.descricao || "Prêmios via PIX 💰 Cotas premiadas instantâneas 🎁 Sorteios justos ⚖️"

  return (
    <>
      {/* Hero + Destaques */}
      <section id="destaques" className="mb-16 sm:mb-20">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 animated-text">
            {nomeSite}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {subtitulo}
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          <Suspense fallback={<Loading />}>
            <RifasDestaque />
          </Suspense>

          {configLoja?.habilitarLoja && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold">Loja Virtual</h2>
                <Link
                  href="/gamificacao?tab=loja"
                  className="text-[#FFB800] hover:underline font-medium"
                >
                  Ver todos os produtos →
                </Link>
              </div>
              <Suspense fallback={<Loading />}>
                <ProdutosHome />
              </Suspense>
            </div>
          )}
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="mb-16 sm:mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Como Funciona</h2>
        <div className="max-w-5xl mx-auto">
          <ComoFunciona />
        </div>
      </section>

      {/* Rifas Ativas */}
      <section id="rifas-ativas" className="mb-16 sm:mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Rifas Ativas</h2>
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<Loading />}>
            <RifasAtivas />
          </Suspense>
        </div>
      </section>

      {/* Últimos Ganhadores */}
      <section id="ultimos-ganhadores" className="mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Últimos Ganhadores</h2>
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<Loading />}>
            <UltimosGanhadores />
          </Suspense>
        </div>
      </section>
    </>
  )
}
